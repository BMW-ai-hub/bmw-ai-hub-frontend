import { useEffect, useState } from 'react';
import type { Config, Inspection, Score, User, Video } from '../types';
import { getConfig, getInspection, getInspectionVideos, getScore } from '../api';
import { AppShell } from '../components/AppShell';
import { UploadPanel } from '../components/inspection/UploadPanel';
import { Button } from '../components/ui/Button';
import { StatusChip, Tag } from '../components/ui/Chip';
import { SegmentedControl } from '../components/ui/Controls';
import { ScoreDial } from '../components/ui/Metrics';
import {
  DefinitionList,
  DefinitionRow,
  EmptyState,
  Notice,
  Panel,
  PanelBlock,
} from '../components/ui/Panel';
import { PageHeading } from '../components/ui/PageHeading';
import { IconVideo } from '../components/ui/icons';

type Tab = 'current' | 'history' | 'brief' | 'attempts';

const TABS = [
  { value: 'current', label: 'Current' },
  { value: 'history', label: 'Service History' },
  { value: 'brief', label: 'Brief' },
  { value: 'attempts', label: 'Attempts' },
] as const satisfies readonly { value: Tab; label: string }[];

const RUBRIC = [
  'Completeness',
  'Accuracy of terminology',
  'Clear finding shown to customer',
  'Explanation of impact',
  'Recommendation clarity',
  'Tone and professionalism',
  'Brand voice compliance',
];

const DEFAULT_CONFIG: Config = {
  grading_threshold_percent: 80,
  max_upload_bytes: 500 * 1024 * 1024,
  max_upload_mb: 500,
  accepted_video_types: ['video/mp4'],
};

const date = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const dateTime = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const duration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

interface Props {
  user: User;
  inspectionId: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onViewScore: (inspectionId: string, videoId: string) => void;
  onVideoProcesed: (inspectionId: string, videoId: string) => void;
}

export default function InspectionDetail({
  user,
  inspectionId,
  onNavigate,
  onLogout,
  onViewScore,
  onVideoProcesed,
}: Props) {
  const [inspection, setInspection] = useState<Inspection>();
  const [videos, setVideos] = useState<Video[]>([]);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [latestScore, setLatestScore] = useState<Score | null>(null);
  const [tab, setTab] = useState<Tab>('current');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    Promise.all([getInspection(inspectionId), getInspectionVideos(inspectionId), getConfig()])
      .then(([item, attempts, settings]) => {
        setInspection(item);
        setVideos(attempts);
        setConfig(settings);
        if (item.latest_video_id) {
          getScore(item.latest_video_id)
            .then(setLatestScore)
            .catch(() => setLatestScore(null));
        }
      })
      .catch((cause) =>
        setLoadError(cause instanceof Error ? cause.message : 'Unable to load inspection'),
      );
  }, [inspectionId]);

  const crumbs = [
    { label: 'Inspections', onClick: () => onNavigate('dashboard') },
    { label: inspection ? `${inspection.vehicle.year} ${inspection.vehicle.model}` : 'Loading' },
  ];

  if (!inspection) {
    return (
      <AppShell
        user={user}
        currentPage="dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
        breadcrumb={crumbs}
      >
        <Panel>
          <EmptyState
            title={loadError ? 'Inspection unavailable' : 'Loading inspection…'}
            hint={loadError || undefined}
          />
        </Panel>
      </AppShell>
    );
  }

  const threshold = config.grading_threshold_percent;
  const canUpload = inspection.status !== 'sent';

  return (
    <AppShell
      user={user}
      currentPage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
      breadcrumb={crumbs}
    >
      <div className="space-y-7">
        <PageHeading
          title={`${inspection.vehicle.year} BMW ${inspection.vehicle.model}`}
          description={`${inspection.service_type} · ${inspection.customer.name} · opened ${dateTime(inspection.created_at)}`}
          actions={
            <>
              <StatusChip status={inspection.status} />
              {inspection.latest_score != null && (
                <span
                  className={`tnum font-display text-heading ${
                    inspection.latest_score >= threshold ? 'text-pass' : 'text-fail'
                  }`}
                >
                  {inspection.latest_score}%
                </span>
              )}
            </>
          }
        />

        <SegmentedControl
          label="Inspection sections"
          options={TABS}
          value={tab}
          onChange={setTab}
        />

        {/* ── Current ─────────────────────────────────────────────── */}
        {tab === 'current' && (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-5">
              <PanelBlock eyebrow="Vehicle">
                <DefinitionList>
                  <DefinitionRow
                    label="Model"
                    value={`${inspection.vehicle.year} BMW ${inspection.vehicle.model}`}
                  />
                  <DefinitionRow label="VIN" value={inspection.vehicle.vin} emphasis />
                  <DefinitionRow label="Colour" value={inspection.vehicle.color} />
                  <DefinitionRow
                    label="Mileage"
                    value={`${inspection.vehicle.mileage.toLocaleString()} km`}
                  />
                </DefinitionList>
              </PanelBlock>

              <PanelBlock eyebrow="Customer">
                <DefinitionList>
                  <DefinitionRow label="Name" value={inspection.customer.name} />
                  <DefinitionRow label="Email" value={inspection.customer.email} />
                  <DefinitionRow label="Phone" value={inspection.customer.phone} />
                </DefinitionList>
              </PanelBlock>

              <PanelBlock eyebrow="Work order">
                <DefinitionList>
                  <DefinitionRow label="Service" value={inspection.service_type} />
                  <DefinitionRow
                    label="Status"
                    value={<StatusChip status={inspection.status} size="sm" />}
                  />
                  <DefinitionRow label="Attempts" value={inspection.attempt_count} />
                  <DefinitionRow label="Opened" value={date(inspection.created_at)} />
                </DefinitionList>
              </PanelBlock>
            </div>

            <div className="space-y-5">
              {latestScore && (
                <Panel className="flex flex-wrap items-start gap-7 p-6">
                  <ScoreDial
                    score={latestScore.overall_score}
                    threshold={latestScore.threshold_percent}
                    size={132}
                    stroke={11}
                    caption={
                      latestScore.overall_score >= latestScore.threshold_percent ? 'Pass' : 'Fail'
                    }
                  />
                  <div className="min-w-0 flex-1 sm:min-w-[16rem]">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-heading">Latest grade</h2>
                      <Tag>{latestScore.threshold_percent}% required</Tag>
                    </div>
                    <p className="mt-3 text-body leading-relaxed text-ink-600">
                      {latestScore.feedback}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onViewScore(inspectionId, inspection.latest_video_id!)}
                      >
                        Full breakdown
                      </Button>
                      {inspection.status === 'passed' && inspection.can_send && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onViewScore(inspectionId, inspection.latest_video_id!)}
                        >
                          Review &amp; send
                        </Button>
                      )}
                    </div>
                  </div>
                </Panel>
              )}

              {canUpload ? (
                <UploadPanel
                  inspectionId={inspectionId}
                  serviceType={inspection.service_type}
                  config={config}
                  hasPreviousAttempt={latestScore != null}
                  onGraded={(videoId) => onVideoProcesed(inspectionId, videoId)}
                />
              ) : (
                <Notice tone="info" title="Sent to customer">
                  This inspection has been released. No further uploads are accepted.
                </Notice>
              )}
            </div>
          </div>
        )}

        {/* ── Service history ────────────────────────────────────── */}
        {tab === 'history' && (
          <Panel flush className="max-w-3xl">
            {inspection.service_history.length === 0 ? (
              <EmptyState title="No prior service history" />
            ) : (
              <ol className="divide-y divide-line">
                {inspection.service_history.map((entry, index) => (
                  <li key={`${entry.date}-${index}`} className="flex gap-5 px-5 py-5">
                    <div className="w-16 shrink-0">
                      <p className="tnum font-display text-heading leading-none">
                        {new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit' })}
                      </p>
                      <p className="mt-1 text-micro font-bold tracking-[0.09em] text-ink-400 uppercase">
                        {new Date(entry.date).toLocaleDateString('en-GB', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1 border-l border-line pl-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-bold text-ink">{entry.service_type}</p>
                        <p className="tnum text-cell font-semibold text-ink-400">
                          {entry.mileage.toLocaleString()} km
                        </p>
                      </div>
                      <p className="mt-0.5 text-cell font-medium text-ink-400">
                        {entry.technician}
                      </p>
                      <p className="mt-2 text-body leading-relaxed text-ink-600">{entry.notes}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        )}

        {/* ── Brief ──────────────────────────────────────────────── */}
        {tab === 'brief' && (
          <div className="grid max-w-4xl grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2">
            <PanelBlock eyebrow="Work order">
              <DefinitionList>
                <DefinitionRow label="Service" value={inspection.service_type} />
                <DefinitionRow
                  label="Status"
                  value={<StatusChip status={inspection.status} size="sm" />}
                />
                <DefinitionRow label="Opened" value={dateTime(inspection.created_at)} />
                <DefinitionRow label="Last updated" value={dateTime(inspection.updated_at)} />
                <DefinitionRow label="Attempts" value={inspection.attempt_count} />
                {inspection.latest_score != null && (
                  <DefinitionRow
                    label="Latest score"
                    value={`${inspection.latest_score}%`}
                    emphasis
                  />
                )}
              </DefinitionList>
            </PanelBlock>

            <PanelBlock eyebrow={`Rubric · ${threshold}% to pass`}>
              <ol className="divide-y divide-line">
                {RUBRIC.map((criterion, index) => (
                  <li key={criterion} className="flex items-center gap-3 py-2.5">
                    <span className="tnum w-6 shrink-0 font-display text-cell font-bold text-ink-300">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-cell font-semibold text-ink-600">{criterion}</span>
                  </li>
                ))}
              </ol>
            </PanelBlock>
          </div>
        )}

        {/* ── Attempts ───────────────────────────────────────────── */}
        {tab === 'attempts' && (
          <Panel flush className="max-w-4xl">
            {videos.length === 0 ? (
              <EmptyState icon={<IconVideo size={32} />} title="No videos recorded yet" />
            ) : (
              <ul className="divide-y divide-line">
                {videos.map((video) => (
                  <li key={video.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-well text-ink-500">
                      <IconVideo size={18} />
                    </span>
                    <div className="min-w-0 flex-1 sm:min-w-[12rem]">
                      <p className="truncate font-bold text-ink">{video.filename}</p>
                      <p className="tnum mt-0.5 text-cell font-medium text-ink-400">
                        {dateTime(video.uploaded_at)}
                        {video.duration_seconds ? ` · ${duration(video.duration_seconds)}` : ''}
                      </p>
                    </div>
                    {video.overall_score != null && (
                      <span
                        className={`tnum shrink-0 font-display text-heading ${
                          video.overall_score >= threshold ? 'text-pass' : 'text-fail'
                        }`}
                      >
                        {video.overall_score}%
                      </span>
                    )}
                    <StatusChip status={video.status} size="sm" />
                    {video.status === 'graded' && (
                      <Button size="sm" onClick={() => onViewScore(inspectionId, video.id)}>
                        Score
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
