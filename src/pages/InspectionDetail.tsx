import { useEffect, useState } from 'react';
import type { Config, Inspection, User, Video } from '../types';
import { getConfig, getInspection, getInspectionVideos } from '../api';
import { AppShell } from '../components/AppShell';
import { GradingBreakdown } from '../components/inspection/GradingBreakdown';
import { UploadPanel } from '../components/inspection/UploadPanel';
import { Button } from '../components/ui/Button';
import { StatusChip } from '../components/ui/Chip';
import { SegmentedControl } from '../components/ui/Controls';
import { DefinitionList, DefinitionRow, EmptyState, Panel, PanelBlock } from '../components/ui/Panel';
import { PageHeading } from '../components/ui/PageHeading';
import { IconChevronLeft, IconVideo } from '../components/ui/icons';

type Tab = 'video' | 'details' | 'history' | 'attempts';

const TABS = [
  { value: 'video', label: 'Video walkthrough' },
  { value: 'details', label: 'Details' },
  { value: 'history', label: 'Service History' },
  { value: 'attempts', label: 'Attempts' },
] as const satisfies readonly { value: Tab; label: string }[];

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
}

export default function InspectionDetail({
  user,
  inspectionId,
  onNavigate,
  onLogout,
  onViewScore,
}: Props) {
  const [inspection, setInspection] = useState<Inspection>();
  const [videos, setVideos] = useState<Video[]>([]);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [tab, setTab] = useState<Tab>('video');
  const [loadError, setLoadError] = useState('');
  // Only meaningful once a video already exists — false shows the graded
  // breakdown, true swaps it for the upload box so a technician can record
  // another attempt without leaving this page.
  const [reuploading, setReuploading] = useState(false);

  const load = () =>
    Promise.all([getInspection(inspectionId), getInspectionVideos(inspectionId), getConfig()])
      .then(([item, attempts, settings]) => {
        setInspection(item);
        setVideos(attempts);
        setConfig(settings);
      })
      .catch((cause) =>
        setLoadError(cause instanceof Error ? cause.message : 'Unable to load inspection'),
      );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const hasVideo = Boolean(inspection.latest_video_id);

  // A fresh upload finishing (or a reupload replacing the current attempt)
  // -- refetch so latest_video_id/latest_score/status/attempt_count are
  // current, then swap straight to the graded breakdown for it. No page
  // navigation: this is the whole point of keeping it on one page.
  const handleGraded = () => {
    setReuploading(false);
    load();
  };

  return (
    <AppShell
      user={user}
      currentPage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
      breadcrumb={crumbs}
    >
      <div className="mx-auto max-w-[1600px] space-y-7">
        <PageHeading
          title={`${inspection.vehicle.year} BMW ${inspection.vehicle.model}`}
          description={`${inspection.service_type} · ${inspection.customer.name} · opened ${dateTime(inspection.created_at)}`}
          actions={
            <>
              <Button
                variant="secondary"
                size="md"
                icon={<IconChevronLeft size={16} />}
                onClick={() => onNavigate('dashboard')}
              >
                Back to inspections
              </Button>
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

        {/* ── Video walkthrough ──────────────────────────────────────
            The whole point of this tool: the video, its grade, and its
            breakdown, front and centre with nothing else competing for
            space. Everything about the vehicle/customer/work order lives
            in Details instead. */}
        {tab === 'video' && (
          <>
            {!canUpload ? (
              hasVideo ? (
                <GradingBreakdown
                  inspectionId={inspectionId}
                  videoId={inspection.latest_video_id!}
                  onNavigate={onNavigate}
                  onSendSuccess={() => onNavigate('dashboard')}
                  onReupload={() => {}}
                  canReupload={false}
                />
              ) : (
                <Panel>
                  <EmptyState title="Sent to customer" hint="No video was ever uploaded for this inspection." />
                </Panel>
              )
            ) : hasVideo && !reuploading ? (
              <GradingBreakdown
                inspectionId={inspectionId}
                videoId={inspection.latest_video_id!}
                onNavigate={onNavigate}
                onSendSuccess={() => onNavigate('dashboard')}
                onReupload={() => setReuploading(true)}
              />
            ) : (
              <div className="space-y-3">
                {hasVideo && (
                  <div className="flex justify-end">
                    <Button variant="quiet" size="sm" onClick={() => setReuploading(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
                <UploadPanel
                  inspectionId={inspectionId}
                  serviceType={inspection.service_type}
                  config={config}
                  hasPreviousAttempt={hasVideo}
                  onGraded={handleGraded}
                />
              </div>
            )}
          </>
        )}

        {/* ── Details ─────────────────────────────────────────────── */}
        {tab === 'details' && (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-3">
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
        )}

        {/* ── Service history ────────────────────────────────────── */}
        {tab === 'history' && (
          <Panel flush className="max-w-4xl">
            {inspection.service_history.length === 0 ? (
              <EmptyState title="No prior service history" />
            ) : (
              <ol className="divide-y divide-line">
                {inspection.service_history.map((entry, index) => (
                  <li key={`${entry.date}-${index}`} className="flex gap-6 px-6 py-6">
                    <div className="w-16 shrink-0">
                      <p className="tnum font-display text-title leading-none">
                        {new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit' })}
                      </p>
                      <p className="mt-1.5 text-micro font-bold tracking-[0.09em] text-ink-400 uppercase">
                        {new Date(entry.date).toLocaleDateString('en-GB', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1 border-l border-line pl-6">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-lead font-bold text-ink">{entry.service_type}</p>
                        <p className="tnum text-body font-semibold text-ink-400">
                          {entry.mileage.toLocaleString()} km
                        </p>
                      </div>
                      <p className="mt-1 text-body font-medium text-ink-400">
                        {entry.technician}
                      </p>
                      <p className="mt-2.5 text-body leading-relaxed text-ink-600">{entry.notes}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        )}

        {/* ── Attempts ───────────────────────────────────────────── */}
        {tab === 'attempts' && (
          <Panel flush className="max-w-5xl">
            {videos.length === 0 ? (
              <EmptyState icon={<IconVideo size={32} />} title="No videos recorded yet" />
            ) : (
              <ul className="divide-y divide-line">
                {videos.map((video) => (
                  <li key={video.id} className="flex flex-wrap items-center gap-5 px-6 py-5">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-well text-ink-500">
                      <IconVideo size={20} />
                    </span>
                    <div className="min-w-0 flex-1 sm:min-w-[12rem]">
                      <p className="truncate text-lead font-bold text-ink">{video.filename}</p>
                      <p className="tnum mt-1 text-body font-medium text-ink-400">
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
                      <Button size="md" onClick={() => onViewScore(inspectionId, video.id)}>
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
