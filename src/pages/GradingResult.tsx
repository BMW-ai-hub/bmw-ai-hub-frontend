import { useEffect, useState } from 'react';
import type { CriterionScore, Inspection, Score, User } from '../types';
import { getConfig, getInspection, getScore, sendInspection } from '../api';
import { AppShell } from '../components/AppShell';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Chip';
import { Meter, ScoreDial } from '../components/ui/Metrics';
import { EmptyState, Notice, Panel, PanelHeader } from '../components/ui/Panel';
import { PageHeading } from '../components/ui/PageHeading';
import { IconCheck, IconClose, IconSend, IconTrend } from '../components/ui/icons';

const REDIRECT_DELAY_MS = 1800;

function CriterionRow({
  criterion,
  index,
  threshold,
}: {
  criterion: CriterionScore;
  index: number;
  threshold: number;
}) {
  // Trust the grader's own verdict when it supplied one; only fall back to the
  // score comparison when `passed` is null. Deriving it purely from the score
  // made the rows disagree with the "n of m passed" count in the header.
  const passing = criterion.passed ?? criterion.score >= threshold;

  return (
    <li className="flex flex-wrap items-start gap-x-4 gap-y-3 px-5 py-4">
      <span className="tnum w-7 shrink-0 pt-0.5 font-display text-cell font-bold text-ink-300">
        {String(index + 1).padStart(2, '0')}
      </span>

      <span
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
          passing ? 'bg-pass-wash text-pass' : 'bg-fail-wash text-fail'
        }`}
      >
        {passing ? <IconCheck size={11} /> : <IconClose size={11} />}
      </span>

      <div className="min-w-0 flex-1 sm:min-w-[14rem]">
        <p className="font-bold text-ink">{criterion.display_name}</p>
        {/* Guidance is the whole point of this screen — shown in full, never
            behind a disclosure. */}
        {criterion.guidance && (
          <p className="mt-1.5 max-w-prose text-cell leading-relaxed text-ink-500">
            {criterion.guidance}
          </p>
        )}
      </div>

      <span className="flex shrink-0 items-center gap-3 pt-0.5">
        <Meter value={criterion.score} threshold={threshold} width={72} showValue={false} />
        <span
          className={`tnum w-11 text-right font-display text-cell font-bold ${
            passing ? 'text-pass' : 'text-fail'
          }`}
        >
          {criterion.score}%
        </span>
      </span>
    </li>
  );
}

interface Props {
  user: User;
  inspectionId: string;
  videoId: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onBackToInspection: () => void;
  onSendSuccess: () => void;
}

export default function GradingResult({
  user,
  inspectionId,
  videoId,
  onNavigate,
  onLogout,
  onBackToInspection,
  onSendSuccess,
}: Props) {
  const [score, setScore] = useState<Score>();
  const [inspection, setInspection] = useState<Inspection>();
  const [threshold, setThreshold] = useState(80);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    Promise.all([getScore(videoId), getInspection(inspectionId), getConfig()])
      .then(([result, item, config]) => {
        setScore(result);
        setInspection(item);
        setThreshold(config.grading_threshold_percent);
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load score'),
      );
  }, [inspectionId, videoId]);

  const crumbs = [
    { label: 'Inspections', onClick: () => onNavigate('dashboard') },
    {
      label: inspection ? `${inspection.vehicle.year} ${inspection.vehicle.model}` : 'Vehicle',
      onClick: onBackToInspection,
    },
    { label: 'Grading result' },
  ];

  if (!score || !inspection) {
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
            title={error ? 'Score unavailable' : 'Loading grading result…'}
            hint={error || undefined}
          />
        </Panel>
      </AppShell>
    );
  }

  const passing = score.overall_score >= score.threshold_percent;
  const passedCount = score.criteria.filter((criterion) => criterion.passed).length;

  const handleSend = async () => {
    if (!score.can_send) return;
    setSending(true);
    try {
      await sendInspection(inspectionId, videoId);
      setSent(true);
      window.setTimeout(onSendSuccess, REDIRECT_DELAY_MS);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to send video');
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell
      user={user}
      currentPage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
      breadcrumb={crumbs}
    >
      <div className="max-w-5xl space-y-7">
        <PageHeading
          title={passing ? 'Cleared for delivery' : 'Needs revision'}
          description={`${inspection.vehicle.year} BMW ${inspection.vehicle.model} · ${inspection.service_type}`}
          actions={<Tag>{score.threshold_percent}% required</Tag>}
        />

        {/* ── Verdict ───────────────────────────────────────────────── */}
        <Panel className="flex flex-wrap items-start gap-8 p-7">
          <ScoreDial
            score={score.overall_score}
            threshold={score.threshold_percent}
            size={168}
            stroke={13}
            caption={passing ? 'Pass' : 'Fail'}
          />

          <div className="min-w-0 flex-1 sm:min-w-[18rem]">
            <p className="eyebrow">Assessor feedback</p>
            <p className="mt-3 text-lead leading-relaxed text-ink-600">{score.feedback}</p>

            <div className="mt-6">
              {sent ? (
                <Notice tone="pass" title={`Sent to ${inspection.customer.name}`}>
                  Returning to the inspection list.
                </Notice>
              ) : passing && score.can_send ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="positive"
                    size="lg"
                    loading={sending}
                    onClick={handleSend}
                    icon={sending ? undefined : <IconSend size={15} />}
                  >
                    {sending ? 'Sending…' : 'Send to customer'}
                  </Button>
                  <Button size="lg" onClick={onBackToInspection}>
                    Back to inspection
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Notice tone="fail" title="Cannot send — below the quality threshold">
                    This walkaround scored {score.overall_score}%, under the{' '}
                    {score.threshold_percent}% required. Address the failing criteria below and
                    re-record.
                  </Notice>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" size="lg" onClick={onBackToInspection}>
                      Re-record video
                    </Button>
                    <Button size="lg" onClick={() => onNavigate('dashboard')}>
                      Back to queue
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {error && !sent && (
              <div className="mt-4">
                <Notice tone="fail">{error}</Notice>
              </div>
            )}
          </div>
        </Panel>

        {/* ── Criterion breakdown ───────────────────────────────────── */}
        <Panel flush>
          <PanelHeader
            title="Criterion breakdown"
            icon={<IconTrend size={17} />}
            meta={`${passedCount} of ${score.criteria.length} passed`}
          />
          <ol className="divide-y divide-line">
            {score.criteria.map((criterion, index) => (
              <CriterionRow
                key={criterion.key}
                criterion={criterion}
                index={index}
                threshold={threshold}
              />
            ))}
          </ol>
          <footer className="flex items-center justify-between gap-4 border-t border-line bg-zebra px-5 py-3.5">
            <span className="eyebrow">Overall</span>
            <span
              className={`tnum font-display text-heading ${passing ? 'text-pass' : 'text-fail'}`}
            >
              {score.overall_score}%{' '}
              <span className="text-cell font-semibold text-ink-400">
                / {score.threshold_percent}% required
              </span>
            </span>
          </footer>
        </Panel>

        <Notice tone="info">
          Graded against the BMW CPO Vehicle Inspection rubric. Tone and brand-voice criteria are
          assessed against the reference walkaround; official policy documents are pending.
        </Notice>
      </div>
    </AppShell>
  );
}
