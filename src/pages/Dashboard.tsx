import { useEffect, useMemo, useState } from 'react';
import type { Inspection, InspectionStatus, User } from '../types';
import { getInspections } from '../api';
import { AppShell } from '../components/AppShell';
import { ScorePill, StatusChip } from '../components/ui/Chip';
import { SearchField, SelectField } from '../components/ui/Controls';
import { DataTable, type Column } from '../components/ui/DataTable';
import { EmptyState, Notice } from '../components/ui/Panel';
import { PageHeading } from '../components/ui/PageHeading';
import { IconChevronRight, IconInspections } from '../components/ui/icons';

const STATUS_FILTERS: readonly { key: InspectionStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'queued', label: 'Queued' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'needs_revision', label: 'Action Required' },
  { key: 'passed', label: 'Passed' },
  { key: 'sent', label: 'Sent' },
];

const STATUS_TEXT: Record<InspectionStatus, string> = {
  queued: 'Queued',
  in_progress: 'In Progress',
  needs_revision: 'Action Required',
  passed: 'Passed',
  sent: 'Sent',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const timeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

/** Real BMW photography (licensed via Unsplash), pre-cropped so the car sits
 * right-of-frame — the dark-asphalt left edge is exactly where the text
 * gradient below needs to land. Swap this one URL for approved BMW/dealer
 * photography whenever it's available. */
const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=2400&h=800&crop=focalpoint&fp-x=0.66&fp-y=0.5&q=80';

const attentionSentence = (inProgress: number, actionRequired: number) => {
  const parts: string[] = [];
  if (inProgress > 0) parts.push(`${inProgress} ${inProgress === 1 ? 'inspection is' : 'inspections are'} in progress`);
  if (actionRequired > 0)
    parts.push(`${actionRequired} ${actionRequired === 1 ? 'walkaround requires' : 'walkarounds require'} revision`);
  if (parts.length === 0) return "Nothing on your queue needs attention right now.";
  return `${parts.join(' and ')}.`;
};

/** Cinematic welcome banner — real BMW photography blended into the ink
 * background with a left-to-right gradient (never a hard image box), copy
 * that reports the actual state of the queue instead of a slogan, and one
 * contextual primary action to jump straight back into the most urgent
 * inspection. */
function DashboardHero({
  name,
  isManager,
  inProgress,
  actionRequired,
  urgent,
  onContinue,
}: {
  name: string;
  isManager: boolean;
  inProgress: number;
  actionRequired: number;
  urgent: Inspection | null;
  onContinue: (id: string) => void;
}) {
  const firstName = name.trim().split(/\s+/)[0] ?? name;
  const needingAttention = inProgress + actionRequired;

  return (
    <div className="relative isolate overflow-hidden rounded-2xl bg-ink">
      {/* Photo layer, blended left-to-right into the ink ground rather than
          sitting in its own hard-edged box — the car stays right of frame,
          the left third stays dark enough for the copy to sit on. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <img
          src={HERO_IMAGE_URL}
          alt=""
          className="h-full w-full object-cover object-[78%_center] opacity-90"
          loading="eager"
          onError={(event) => {
            (event.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
        {/* Barely-there grid — texture, not a template signature. */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative flex min-h-[320px] flex-col justify-center px-7 py-8 sm:min-h-[360px] sm:px-10 sm:py-10">
        <p className="text-micro font-bold tracking-[0.16em] text-paper/55 uppercase">
          {isManager ? 'Manager workspace' : 'Technician workspace'}
        </p>
        <h1 className="mt-3 max-w-lg font-display text-title text-paper">
          Good {timeGreeting()}, {firstName}
        </h1>

        <p className="mt-3 max-w-md text-lead font-bold text-paper/90">
          {needingAttention > 0
            ? `${needingAttention} ${needingAttention === 1 ? 'inspection needs' : 'inspections need'} your attention`
            : "You're all caught up"}
        </p>
        <p className="mt-1.5 max-w-md text-cell leading-relaxed text-paper/55">
          {attentionSentence(inProgress, actionRequired)}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {urgent && (
            <button
              type="button"
              onClick={() => onContinue(urgent.id)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-paper px-4.5 text-cell font-bold text-ink transition-transform duration-[120ms] ease-swift hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue {urgent.vehicle.make} {urgent.vehicle.model}
              <IconChevronRight size={14} />
            </button>
          )}
          {inProgress > 0 && (
            <span className="inline-flex h-8 items-center rounded-full border border-paper/20 bg-paper/[0.08] px-3.5 text-micro font-bold tracking-[0.08em] text-paper/80 uppercase backdrop-blur-sm">
              {inProgress} in progress
            </span>
          )}
          {actionRequired > 0 && (
            <span className="inline-flex h-8 items-center rounded-full border border-fail/30 bg-fail/[0.16] px-3.5 text-micro font-bold tracking-[0.08em] text-paper uppercase backdrop-blur-sm">
              {actionRequired} action required
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** No per-vehicle photography exists in the data model, so every row gets
 * the same quality silhouette mark rather than a generic file/image icon —
 * still reads as "this is a car", just honest about not having a real
 * photo of this specific one. */
function VehicleThumb() {
  return (
    <span className="flex h-11 w-16 shrink-0 items-center justify-center rounded-md bg-gradient-to-b from-well to-well-deep text-ink-400">
      <svg viewBox="0 0 64 40" fill="none" className="h-6 w-10">
        <path
          d="M6 27 Q6 21 13 19.5 L20 15 Q26 9 36 9 L44 9.5 Q50 11 54 18 L58 19 Q60 20 60 23.5 L60 27"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M6 27h54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="27" r="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="48" cy="27" r="5" stroke="currentColor" strokeWidth="2" />
      </svg>
    </span>
  );
}

/** Inline summary strip — hairline-divided rather than a row of boxes. */
function SummaryStrip({ items }: { items: readonly { label: string; value: number; tone: string }[] }) {
  return (
    <dl className="grid grid-cols-2 divide-line rounded-lg border border-line sm:grid-cols-4 sm:divide-x">
      {items.map((item) => (
        <div key={item.label} className="px-6 py-6">
          <dt className="eyebrow">{item.label}</dt>
          <dd className={`tnum mt-3 font-display text-display ${item.tone}`}>{item.value}</dd>
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
    <div className="flex flex-wrap gap-2.5">
      {STATUS_FILTERS.map((filter) => {
        const selected = filter.key === active;
        return (
          <button
            key={filter.key}
            onClick={() => onSelect(filter.key)}
            aria-pressed={selected}
            className={`inline-flex h-11 items-center gap-2.5 rounded-full border px-4 text-body font-bold transition-colors duration-[120ms] ease-swift ${
              selected
                ? 'border-ink bg-ink text-paper'
                : 'border-line bg-paper text-ink-600 hover:border-ink-300 hover:text-ink'
            }`}
          >
            {filter.label}
            <span
              className={`tnum rounded-full px-2 py-0.5 text-cell leading-none font-bold ${
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
  const inProgressCount = counts.in_progress ?? 0;

  // The single most useful thing to jump back into: needs-revision beats
  // in-progress beats queued, and within a bucket the most recently touched
  // one wins — that's almost always the one the technician was just on.
  const urgentInspection = useMemo(() => {
    const priority: InspectionStatus[] = ['needs_revision', 'in_progress', 'queued'];
    for (const status of priority) {
      const bucket = scoped.filter((item) => item.status === status);
      if (bucket.length > 0) {
        return bucket.reduce((latest, item) => (item.updated_at > latest.updated_at ? item : latest));
      }
    }
    return null;
  }, [scoped]);

  const columns: readonly Column<Inspection>[] = useMemo(
    () => [
      {
        key: 'vehicle',
        header: 'Vehicle',
        width: 250,
        sortValue: (row) => row.vehicle.model,
        filterValue: (row) => `${row.vehicle.year} ${row.vehicle.make} ${row.vehicle.model} ${row.vehicle.vin}`,
        render: (row) => (
          <>
            <p className="text-lead font-bold text-ink">
              {row.vehicle.make} {row.vehicle.model}
            </p>
            <p className="tnum mt-1 text-cell font-semibold tracking-[0.03em] text-ink-400">
              {row.vehicle.year} · {row.vehicle.vin}
            </p>
          </>
        ),
      },
      {
        key: 'customer',
        header: 'Customer',
        width: 170,
        sortValue: (row) => row.customer.name,
        filterValue: (row) => row.customer.name,
        render: (row) => <span className="text-lead font-bold text-ink">{row.customer.name}</span>,
      },
      {
        key: 'service',
        header: 'Service',
        width: 185,
        sortValue: (row) => row.service_type,
        filterValue: (row) => row.service_type,
        render: (row) => <span className="text-lead font-semibold text-ink-600">{row.service_type}</span>,
      },
      {
        key: 'created',
        header: 'Opened',
        width: 125,
        sortValue: (row) => row.created_at,
        filterValue: (row) => formatDate(row.created_at),
        render: (row) => (
          <span className="tnum text-lead font-semibold text-ink-600">{formatDate(row.created_at)}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        width: 190,
        sortValue: (row) => row.status,
        filterValue: (row) => STATUS_TEXT[row.status],
        render: (row) => <StatusChip status={row.status} size="lg" />,
      },
      {
        key: 'score',
        header: 'Latest Score',
        width: 140,
        sortValue: (row) => row.latest_score ?? -1,
        render: (row) =>
          row.latest_score == null ? (
            <span className="text-ink-300">—</span>
          ) : (
            <ScorePill value={row.latest_score} threshold={80} />
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
      <div className="mx-auto max-w-[1600px] space-y-8">
        <DashboardHero
          name={user.name}
          isManager={isManager}
          inProgress={inProgressCount}
          actionRequired={needsRevision}
          urgent={urgentInspection}
          onContinue={onOpenInspection}
        />

        <PageHeading
          level="title"
          title={isManager ? 'All Inspections' : "Today's Inspections"}
          count={scoped.length}
          description={
            isManager
              ? 'Every walkaround video across the dealership, graded against the BMW rubric.'
              : 'Walkaround videos assigned to you, graded against the BMW rubric.'
          }
        />

        {error && <Notice tone="fail" title="Could not load inspections">{error}</Notice>}

        <SummaryStrip
          items={[
            { label: 'Total', value: counts.all ?? 0, tone: 'text-ink' },
            { label: 'Action Required', value: needsRevision, tone: 'text-fail' },
            { label: 'Ready to Send', value: counts.passed ?? 0, tone: 'text-pass' },
            { label: 'Sent', value: counts.sent ?? 0, tone: 'text-ink-400' },
          ]}
        />

        {/* Toolbar — search, the technician scope, and the status filter all
            live together directly above the table they act on, instead of
            search floating separately up in the page header. */}
        <div className="space-y-4 rounded-xl border border-line bg-paper p-4">
          <div className="flex flex-wrap items-center gap-3">
            <SearchField
              label="Search inspections"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full sm:w-72"
            />
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
          </div>
          <FilterChips active={statusFilter} counts={counts} onSelect={setStatusFilter} />
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          query={search}
          paginate
          minWidth={1140}
          leading={{
            header: <span className="sr-only">Vehicle</span>,
            render: () => <VehicleThumb />,
          }}
          leadingWidth={104}
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
      </div>
    </AppShell>
  );
}
