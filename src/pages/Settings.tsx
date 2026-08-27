import { useEffect, useMemo, useState } from 'react';
import type { Config, User } from '../types';
import { getConfig } from '../api';
import { MOCK_USERS } from '../mockData';
import { AppShell } from '../components/AppShell';
import { Button } from '../components/ui/Button';
import { Avatar, Tag } from '../components/ui/Chip';
import { SegmentedControl, SelectField, Switch, TextField } from '../components/ui/Controls';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Notice, Panel, PanelHeader } from '../components/ui/Panel';
import { PageHeading } from '../components/ui/PageHeading';

const STORE = 'bmw_admin_frontend_settings';

const NOTICES = [
  'Video below threshold',
  'Video cleared for delivery',
  'Video sent to customer',
  'New inspection assigned',
  'Daily performance summary',
];

const TABS = [
  { value: 'grading', label: 'Grading' },
  { value: 'users', label: 'Users' },
  { value: 'notifications', label: 'Notifications' },
] as const;

type Tab = (typeof TABS)[number]['value'];

const ROLE_OPTIONS: User['role'][] = ['technician', 'manager', 'admin'];

/** Label + description on the left, control on the right. */
function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5">
      <div className="min-w-0 flex-1 sm:min-w-[14rem]">
        <p className="font-bold text-ink">{label}</p>
        <p className="mt-1 text-cell text-ink-400">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

interface Props {
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Settings({ user, onNavigate, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('grading');
  const [config, setConfig] = useState<Config>();
  const [threshold, setThreshold] = useState(80);
  const [maxUploadMb, setMaxUploadMb] = useState(500);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTICES.map((notice) => [notice, true])),
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORE);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setThreshold(parsed.threshold ?? 80);
        setMaxUploadMb(parsed.maxUploadMb ?? 500);
        setUsers(parsed.users ?? MOCK_USERS);
        if (parsed.notifications) setNotifications(parsed.notifications);
      } catch {
        /* fall back to defaults */
      }
    }

    getConfig()
      .then((settings) => {
        setConfig(settings);
        if (!stored) {
          setThreshold(settings.grading_threshold_percent);
          setMaxUploadMb(settings.max_upload_mb);
        }
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load configuration'),
      );
  }, []);

  const save = () => {
    localStorage.setItem(STORE, JSON.stringify({ threshold, maxUploadMb, users, notifications }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const userColumns: readonly Column<User>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        width: 240,
        sortValue: (row) => row.name,
        filterValue: (row) => row.name,
        render: (row) => (
          <span className="flex items-center gap-3">
            <Avatar name={row.name} size={30} tone="outline" />
            <span className="font-bold text-ink">{row.name}</span>
          </span>
        ),
      },
      {
        key: 'email',
        header: 'Email',
        sortValue: (row) => row.email,
        filterValue: (row) => row.email,
        render: (row) => <span className="text-ink-500">{row.email}</span>,
      },
      {
        key: 'role',
        header: 'Role',
        width: 220,
        sortValue: (row) => row.role,
        render: (row) =>
          row.id === user.id ? (
            <span className="flex items-center gap-2">
              <Tag>{row.role}</Tag>
              <span className="text-cell font-medium text-ink-400">you</span>
            </span>
          ) : (
            <SelectField
              aria-label={`Role for ${row.name}`}
              value={row.role}
              onChange={(event) =>
                setUsers((current) =>
                  current.map((candidate) =>
                    candidate.id === row.id
                      ? { ...candidate, role: event.target.value as User['role'] }
                      : candidate,
                  ),
                )
              }
              className="h-9 w-40 capitalize"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </SelectField>
          ),
      },
    ],
    [user.id],
  );

  return (
    <AppShell
      user={user}
      currentPage="settings"
      onNavigate={onNavigate}
      onLogout={onLogout}
      breadcrumb={[{ label: 'Settings' }]}
    >
      <div className="max-w-5xl space-y-7">
        <PageHeading
          title="Settings"
          description="Grading thresholds, access and notifications for this dealership."
          actions={
            <Button variant={saved ? 'positive' : 'primary'} size="lg" onClick={save}>
              {saved ? 'Saved' : 'Save changes'}
            </Button>
          }
        />

        {error && <Notice tone="fail">{error}</Notice>}

        <SegmentedControl label="Settings sections" options={TABS} value={tab} onChange={setTab} />

        {tab === 'grading' && (
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-2">
            <Panel>
              <PanelHeader title="Grading" />
              <div className="divide-y divide-line px-5">
                <SettingRow
                  label="Pass threshold"
                  description={
                    config
                      ? `The gateway currently reports ${config.grading_threshold_percent}%.`
                      : 'Reading the current gateway value…'
                  }
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={threshold}
                      aria-label="Pass threshold percent"
                      onChange={(event) => setThreshold(Number(event.target.value))}
                      className="w-28 accent-[var(--color-ink)] sm:w-40"
                    />
                    <output className="tnum w-14 text-right font-display text-heading">
                      {threshold}%
                    </output>
                  </div>
                </SettingRow>
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Uploads" />
              <div className="divide-y divide-line px-5">
                <SettingRow
                  label="Maximum upload size"
                  description={
                    config
                      ? `The gateway currently enforces ${config.max_upload_mb} MB.`
                      : 'Reading the current gateway value…'
                  }
                >
                  <TextField
                    type="number"
                    min={1}
                    aria-label="Maximum upload size in megabytes"
                    value={maxUploadMb}
                    onChange={(event) => setMaxUploadMb(Number(event.target.value))}
                    trail="MB"
                    alignRight
                    className="w-32"
                  />
                </SettingRow>
                <SettingRow
                  label="Accepted formats"
                  description="Container types the gateway will accept."
                >
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {config ? (
                      config.accepted_video_types.map((type) => (
                        <Tag key={type}>{type.replace('video/', '')}</Tag>
                      ))
                    ) : (
                      <span className="text-cell text-ink-400">Loading…</span>
                    )}
                  </div>
                </SettingRow>
              </div>
            </Panel>

            <div className="lg:col-span-2">
              <Notice tone="info">
                Threshold and upload limits shown here are stored locally for this browser. The
                gateway values above remain authoritative until an admin API is wired up.
              </Notice>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <DataTable
            columns={userColumns}
            rows={users}
            rowKey={(row) => row.id}
            filterRow
            minWidth={720}
            empty={
              <p className="px-5 py-14 text-center text-body font-medium text-ink-400">
                No users found.
              </p>
            }
          />
        )}

        {tab === 'notifications' && (
          <Panel className="max-w-2xl">
            <PanelHeader title="Email notifications" />
            <div className="divide-y divide-line px-5">
              {NOTICES.map((notice) => (
                <div key={notice} className="flex items-center justify-between gap-4 py-4">
                  <span className="font-semibold text-ink-800">{notice}</span>
                  <Switch
                    label={notice}
                    checked={notifications[notice] ?? false}
                    onChange={(next) =>
                      setNotifications((current) => ({ ...current, [notice]: next }))
                    }
                  />
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
