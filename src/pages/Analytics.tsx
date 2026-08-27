import { useEffect, useMemo, useState } from 'react';
import type { AnalyticsDataPoint, PersonalAnalytics, TeamAnalytics, TeamMemberStat, User } from '../types';
import { getPersonalAnalytics, getTeamAnalytics } from '../api';
import { AppShell } from '../components/AppShell';
import { Avatar } from '../components/ui/Chip';
import { SegmentedControl } from '../components/ui/Controls';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Meter, StatTile } from '../components/ui/Metrics';
import { Notice, Panel, PanelHeader } from '../components/ui/Panel';
import { PageHeading } from '../components/ui/PageHeading';
import { TrendChart } from '../components/ui/TrendChart';
import { IconTeam, IconTrend } from '../components/ui/icons';

const THRESHOLD = 80;

const SCOPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'team', label: 'Team' },
] as const;

type Scope = (typeof SCOPES)[number]['value'];

const toneFor = (value: number) => (value >= THRESHOLD ? 'pass' : value >= 60 ? 'warn' : 'fail');

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

interface Props {
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Analytics({ user, onNavigate, onLogout }: Props) {
  const isManager = user.role === 'manager' || user.role === 'admin';
  const [scope, setScope] = useState<Scope>('individual');
  const [selectedTechId, setSelectedTechId] = useState(user.id);
  const [error, setError] = useState('');

  const emptyPersonal = useMemo<PersonalAnalytics>(
    () => ({
      technician_id: user.id,
      technician_name: user.name,
      first_attempt_pass_rate: 0,
      average_score: 0,
      total_videos: 0,
      total_passed: 0,
      score_trend: [],
    }),
    [user.id, user.name],
  );

  const [personalById, setPersonalById] = useState<Record<string, PersonalAnalytics>>({
    [user.id]: emptyPersonal,
  });
  const [team, setTeam] = useState<TeamAnalytics>({
    dealership: user.dealership,
    overall_pass_rate: 0,
    overall_average_score: 0,
    members: [],
  });

  useEffect(() => {
    getPersonalAnalytics(user)
      .then((data) => setPersonalById((current) => ({ ...current, [data.technician_id]: data })))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load analytics'));

    if (isManager) {
      getTeamAnalytics()
        .then((data) => {
          setTeam(data);
          if (data.members[0]) setSelectedTechId(data.members[0].technician_id);
        })
        .catch((cause) =>
          setError(cause instanceof Error ? cause.message : 'Unable to load team analytics'),
        );
    }
  }, [isManager, user]);

  useEffect(() => {
    if (!isManager || personalById[selectedTechId]) return;
    const member = team.members.find((entry) => entry.technician_id === selectedTechId);
    getPersonalAnalytics(
      { ...user, id: selectedTechId, name: member?.technician_name ?? 'Technician' },
      selectedTechId,
    )
      .then((data) => setPersonalById((current) => ({ ...current, [selectedTechId]: data })))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load analytics'));
  }, [isManager, personalById, selectedTechId, team.members, user]);

  const selected = isManager
    ? (personalById[selectedTechId] ?? {
        ...emptyPersonal,
        technician_id: selectedTechId,
        technician_name:
          team.members.find((entry) => entry.technician_id === selectedTechId)?.technician_name ??
          'Technician',
      })
    : (personalById[user.id] ?? emptyPersonal);

  const recentColumns: readonly Column<AnalyticsDataPoint>[] = useMemo(
    () => [
      {
        key: 'date',
        header: 'Date',
        width: 160,
        sortValue: (row) => row.date,
        render: (row) => (
          <span className="tnum font-semibold text-ink-600">{longDate(row.date)}</span>
        ),
      },
      {
        key: 'score',
        header: 'Score',
        sortValue: (row) => row.score,
        render: (row) => <Meter value={row.score} threshold={THRESHOLD} width={120} />,
      },
      {
        key: 'result',
        header: 'Result',
        width: 140,
        align: 'right',
        sortValue: (row) => (row.passed ? 1 : 0),
        render: (row) => (
          <span
            className={`text-micro font-bold tracking-[0.09em] uppercase ${
              row.passed ? 'text-pass' : 'text-fail'
            }`}
          >
            {row.passed ? 'Passed' : 'Below gate'}
          </span>
        ),
      },
    ],
    [],
  );

  const memberColumns: readonly Column<TeamMemberStat>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Technician',
        width: 260,
        sortValue: (row) => row.technician_name,
        render: (row) => (
          <span className="flex items-center gap-3">
            <Avatar name={row.technician_name} size={30} tone="outline" />
            <span className="font-bold text-ink">{row.technician_name}</span>
          </span>
        ),
      },
      {
        key: 'avg',
        header: 'Average score',
        width: 220,
        sortValue: (row) => row.average_score,
        render: (row) => <Meter value={row.average_score} threshold={THRESHOLD} width={110} />,
      },
      {
        key: 'first',
        header: 'First-attempt pass rate',
        width: 200,
        sortValue: (row) => row.first_attempt_pass_rate,
        render: (row) => (
          <span
            className={`tnum font-display text-heading ${
              row.first_attempt_pass_rate >= THRESHOLD ? 'text-pass' : 'text-ink'
            }`}
          >
            {row.first_attempt_pass_rate}%
          </span>
        ),
      },
      {
        key: 'videos',
        header: 'Videos',
        width: 120,
        align: 'right',
        sortValue: (row) => row.total_videos,
        render: (row) => <span className="tnum font-semibold text-ink-600">{row.total_videos}</span>,
      },
    ],
    [],
  );

  const individual = (
    <div className="space-y-6">
      {isManager && team.members.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {team.members.map((member) => {
            const active = selectedTechId === member.technician_id;
            return (
              <button
                key={member.technician_id}
                onClick={() => setSelectedTechId(member.technician_id)}
                aria-pressed={active}
                className={`inline-flex h-10 items-center gap-2.5 rounded-full border pr-4 pl-1.5 text-cell font-bold transition-colors duration-[120ms] ease-swift ${
                  active
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line bg-paper text-ink-600 hover:border-ink-300 hover:text-ink'
                }`}
              >
                <Avatar
                  name={member.technician_name}
                  size={28}
                  tone={active ? 'outline' : 'ink'}
                />
                {member.technician_name}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="First-attempt pass rate"
          value={`${selected.first_attempt_pass_rate}%`}
          tone={toneFor(selected.first_attempt_pass_rate)}
          sub="Cleared the gate without a re-record"
        />
        <StatTile
          label="Average score"
          value={`${selected.average_score}%`}
          tone={toneFor(selected.average_score)}
          sub={`Against an ${THRESHOLD}% threshold`}
        />
        <StatTile label="Videos submitted" value={selected.total_videos} />
        <StatTile
          label="Videos passed"
          value={selected.total_passed}
          tone="pass"
          sub={`${Math.max(0, selected.total_videos - selected.total_passed)} needed revision`}
        />
      </div>

      <Panel>
        <PanelHeader
          title="Score trend"
          icon={<IconTrend size={17} />}
          meta={`Last ${selected.score_trend.length} graded videos`}
        />
        <div className="p-5">
          <TrendChart data={selected.score_trend} threshold={THRESHOLD} />
        </div>
      </Panel>

      <div>
        <h2 className="mb-4 font-display text-title">Recent gradings</h2>
        <DataTable
          columns={recentColumns}
          rows={[...selected.score_trend].reverse()}
          rowKey={(row) => `${row.date}-${row.inspection_id}`}
          paginate
          defaultPageSize={10}
          minWidth={620}
          empty={
            <p className="px-5 py-14 text-center text-body font-medium text-ink-400">
              No graded videos yet.
            </p>
          }
        />
      </div>
    </div>
  );

  return (
    <AppShell
      user={user}
      currentPage="analytics"
      onNavigate={onNavigate}
      onLogout={onLogout}
      breadcrumb={[{ label: 'Analytics' }]}
    >
      <div className="space-y-7">
        <PageHeading
          title="Analytics"
          description={
            isManager
              ? `Walkaround quality across ${team.dealership}.`
              : 'Your walkaround quality over time.'
          }
          actions={
            isManager ? (
              <SegmentedControl
                label="Analytics scope"
                options={SCOPES}
                value={scope}
                onChange={setScope}
              />
            ) : undefined
          }
        />

        {error && <Notice tone="fail">{error}</Notice>}

        {(scope === 'individual' || !isManager) && individual}

        {scope === 'team' && isManager && (
          <div className="space-y-6">
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-3">
              <StatTile
                label="Team pass rate"
                value={`${team.overall_pass_rate}%`}
                tone={toneFor(team.overall_pass_rate)}
                sub="First attempt, dealership-wide"
              />
              <StatTile
                label="Average team score"
                value={`${team.overall_average_score}%`}
                tone={toneFor(team.overall_average_score)}
                sub="All technicians"
              />
              <StatTile
                label="Technicians"
                value={team.members.length}
                sub="Active this period"
              />
            </div>

            <div>
              <h2 className="mb-4 font-display text-title">
                Technician leaderboard
              </h2>
              <DataTable
                columns={memberColumns}
                rows={[...team.members].sort((a, b) => b.average_score - a.average_score)}
                rowKey={(row) => row.technician_id}
                minWidth={820}
                rowActions={(row) => [
                  {
                    label: 'View individual trend',
                    onSelect: () => {
                      setSelectedTechId(row.technician_id);
                      setScope('individual');
                    },
                  },
                ]}
                empty={
                  <p className="px-5 py-14 text-center text-body font-medium text-ink-400">
                    No technician data available.
                  </p>
                }
              />
            </div>

            <Panel className="flex items-start gap-4 p-5">
              <span className="mt-0.5 shrink-0 text-ink-400">
                <IconTeam size={19} />
              </span>
              <p className="text-body text-ink-600">
                First-attempt pass rate is the sharper coaching signal — average score can be
                lifted by re-records, while the first attempt reflects what the technician does
                unprompted.
              </p>
            </Panel>
          </div>
        )}
      </div>
    </AppShell>
  );
}
