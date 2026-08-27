import { useEffect, useMemo, useState } from 'react';
import type { Inspection, InspectionStatus, User } from '../types';
import { getInspections } from '../api';
import { AppShell } from '../components/AppShell';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { PastInspectionCard } from '../components/dashboard/PastInspectionCard';
import { StatusChip } from '../components/ui/Chip';
import { SearchField, SelectField } from '../components/ui/Controls';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Meter } from '../components/ui/Metrics';
import { EmptyState, Notice, Panel } from '../components/ui/Panel';
import { PageHeading } from '../components/ui/PageHeading';
import { IconImage, IconInspections } from '../components/ui/icons';

const STATUS_FILTERS: readonly { key: InspectionStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'queued', label: 'Queued' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'needs_revision', label: 'Needs Revision' },
  { key: 'passed', label: 'Passed' },
  { key: 'sent', label: 'Sent' },
];

const STATUS_TEXT: Record<InspectionStatus, string> = {
  queued: 'Queued',
  in_progress: 'In Progress',
  needs_revision: 'Needs Revision',
  passed: 'Passed',
  sent: 'Sent',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/** Inline summary strip — hairline-divided rather than a row of boxes. */
function SummaryStrip({
  items,
  className = '',
}: {
  items: readonly { label: string; value: number; tone: string }[];
  className?: string;
}) {
  return (
    <dl className={`grid grid-cols-2 divide-line rounded-lg border border-line sm:grid-cols-4 sm:divide-x ${className}`}>
      {items.map((item) => (
        <div key={item.label} className="px-5 py-4">
          <dt className="eyebrow">{item.label}</dt>
          <dd className={`tnum mt-2 font-display text-title ${item.tone}`}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function FilterChips({
  active,
  counts,
  onSelect,
}: {
  active: InspectionStatus | 'all';
  counts: Record<string, number>;
  onSelect: (key: InspectionStatus | 'all') => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_FILTERS.map((filter) => {
        const selected = filter.key === active;
        return (
          <button
            key={filter.key}
            onClick={() => onSelect(filter.key)}
            aria-pressed={selected}
            className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-cell font-bold transition-colors duration-[120ms] ease-swift ${
              selected
                ? 'border-ink bg-ink text-paper'
                : 'border-line bg-paper text-ink-600 hover:border-ink-300 hover:text-ink'
            }`}
          >
            {filter.label}
            <span
              className={`tnum rounded-full px-1.5 py-0.5 text-[0.625rem] leading-none font-bold ${
                selected ? 'bg-paper/25 text-paper' : 'bg-well text-ink-500'
              }`}
            >
              {counts[filter.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface Props {
  user: User;
  onNavigate: (page: string) => void;
  onOpenInspection: (id: string) => void;
  onLogout: () => void;
}

export default function Dashboard({ user, onNavigate, onOpenInspection, onLogout }: Props) {
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState('all');
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isManager = user.role === 'manager' || user.role === 'admin';

  useEffect(() => {
    setLoading(true);
    setError('');
    getInspections(isManager && techFilter !== 'all' ? techFilter : undefined)
      .then(setInspections)
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load inspections'),
      )
      .finally(() => setLoading(false));
  }, [isManager, techFilter]);

  const technicians = useMemo(
    () =>
      Array.from(new Set(inspections.map((item) => item.technician_id).filter(Boolean))).map(
        (id) => ({ id, name: `Technician ${id.slice(0, 8)}` }),
      ),
    [inspections],
  );

  const scoped = useMemo(() => {
    if (!isManager || techFilter === 'all') return inspections;
    return inspections.filter((item) => item.technician_id === techFilter);
  }, [inspections, isManager, techFilter]);

  const counts = useMemo(() => {
    const tally: Record<string, number> = { all: scoped.length };
    for (const filter of STATUS_FILTERS) {
      if (filter.key === 'all') continue;
      tally[filter.key] = scoped.filter((item) => item.status === filter.key).length;
    }
    return tally;
  }, [scoped]);

  const rows = useMemo(
    () => (statusFilter === 'all' ? scoped : scoped.filter((item) => item.status === statusFilter)),
    [scoped, statusFilter],
  );

  const needsRevision = counts.needs_revision ?? 0;

  /** Completed/historical work — distinct from the queue table above, which still shows every status. */
  const pastInspections = useMemo(
    () =>
      scoped
        .filter((item) => item.status === 'passed' || item.status === 'sent')
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    [scoped],
  );

  const columns: readonly Column<Inspection>[] = useMemo(
    () => [
      {
        key: 'vehicle',
        header: 'Year / Model / VIN',
        width: 230,
        sortValue: (row) => row.vehicle.model,
        filterValue: (row) => `${row.vehicle.year} ${row.vehicle.model} ${row.vehicle.vin}`,
        render: (row) => (
          <>
            <p className="font-bold text-ink">
              {row.vehicle.year} {row.vehicle.model}
            </p>
            <p className="tnum mt-1 text-micro font-semibold tracking-[0.04em] text-ink-400">
              {row.vehicle.vin}
            </p>
          </>
        ),
      },
      {
        key: 'customer',
        header: 'Customer',
        width: 190,
        sortValue: (row) => row.customer.name,
        filterValue: (row) => `${row.customer.name} ${row.customer.email}`,
        render: (row) => (
          <>
            <p className="font-bold text-ink">{row.customer.name}</p>
            <p className="mt-1 truncate text-cell text-ink-400">{row.customer.email}</p>
          </>
        ),
      },
      {
        key: 'service',
        header: 'Service',
        width: 185,
        sortValue: (row) => row.service_type,
        filterValue: (row) => row.service_type,
        render: (row) => <span className="font-semibold text-ink-600">{row.service_type}</span>,
      },
      {
        key: 'created',
        header: 'Opened',
        width: 125,
        sortValue: (row) => row.created_at,
        filterValue: (row) => formatDate(row.created_at),
        render: (row) => (
          <span className="tnum font-semibold text-ink-600">{formatDate(row.created_at)}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        width: 172,
        sortValue: (row) => row.status,
        filterValue: (row) => STATUS_TEXT[row.status],
        render: (row) => <StatusChip status={row.status} size="sm" />,
      },
      {
        key: 'score',
        header: 'Latest Score',
        width: 160,
        sortValue: (row) => row.latest_score ?? -1,
        render: (row) =>
          row.latest_score == null ? (
            <span className="text-ink-300">—</span>
          ) : (
            <Meter value={row.latest_score} threshold={80} />
          ),
      },
    ],
    [],
  );

  return (
    <AppShell
      user={user}
      currentPage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
      breadcrumb={[{ label: 'Inspections' }]}
    >
      <div>
        <div className="space-y-7">
          <DashboardHero name={user.name} />

          {error && <Notice tone="fail" title="Could not load inspections">{error}</Notice>}

          <section>
            <h2 className="font-display text-heading">Today's work</h2>
            <SummaryStrip
              items={[
                { label: 'Queued', value: counts.queued ?? 0, tone: 'text-ink' },
                { label: 'In Progress', value: counts.in_progress ?? 0, tone: 'text-warn' },
                { label: 'Ready for Customer', value: counts.passed ?? 0, tone: 'text-pass' },
                { label: 'Needs Revision', value: needsRevision, tone: 'text-fail' },
              ]}
              className="mt-3"
            />
          </section>
        </div>

        {/* ── My Queue ──────────────────────────────────────────────── */}
        <section className="mt-6 space-y-5 sm:mt-9 lg:mt-14">
          <PageHeading
            level="title"
            title={isManager ? 'All Inspections' : 'My Queue'}
            count={scoped.length}
            description={
              isManager
                ? 'Every walkaround video across the dealership, graded against the BMW rubric.'
                : 'Walkaround videos assigned to you, graded against the BMW rubric.'
            }
            actions={
              <>
                {isManager && (
                  <SelectField
                    aria-label="Filter by technician"
                    value={techFilter}
                    onChange={(event) => setTechFilter(event.target.value)}
                    className="w-52"
                  >
                    <option value="all">All technicians</option>
                    {technicians.map((technician) => (
                      <option key={technician.id} value={technician.id}>
                        {technician.name}
                      </option>
                    ))}
                  </SelectField>
                )}
                <SearchField
                  label="Search inspections"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full sm:w-64"
                />
              </>
            }
          />

          <FilterChips active={statusFilter} counts={counts} onSelect={setStatusFilter} />

          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            query={search}
            filterRow
            paginate
            minWidth={1140}
            leading={{
              header: <IconImage size={18} />,
              render: (row) =>
                row.thumbnail ? (
                  <img
                    src={row.thumbnail}
                    alt=""
                    className="size-10 rounded-sm object-cover"
                  />
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-sm bg-well text-ink-300">
                    <IconImage size={18} />
                  </span>
                ),
            }}
            rowActions={(row) => [
              { label: 'Open inspection', onSelect: () => onOpenInspection(row.id) },
              {
                label: 'Copy VIN',
                onSelect: () => void navigator.clipboard?.writeText(row.vehicle.vin),
              },
            ]}
            onRowClick={(row) => onOpenInspection(row.id)}
            empty={
              <EmptyState
                icon={<IconInspections size={34} />}
                title={loading ? 'Loading inspections…' : 'Nothing to show'}
                hint={
                  loading
                    ? undefined
                    : statusFilter !== 'all' || search
                      ? 'No inspection matches the current filters.'
                      : 'No inspections are assigned yet.'
                }
              />
            }
          />
        </section>

        {/* ── Past inspections ──────────────────────────────────────── */}
        <section className="mt-6 sm:mt-9 lg:mt-14">
          <PageHeading
            level="title"
            title="Past inspections"
            count={pastInspections.length}
            description="Review previously completed technician inspections and grading results."
          />

          {pastInspections.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {pastInspections.map((item) => (
                <PastInspectionCard
                  key={item.id}
                  inspection={item}
                  onView={() => onOpenInspection(item.id)}
                />
              ))}
            </div>
          ) : (
            <Panel className="mt-5">
              <EmptyState
                icon={<IconInspections size={34} />}
                title="No completed inspections yet"
                hint="Passed and sent walkarounds will show up here."
              />
            </Panel>
          )}
        </section>
      </div>
    </AppShell>
  );
}
