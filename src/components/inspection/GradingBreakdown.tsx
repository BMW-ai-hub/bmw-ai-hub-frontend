import { useEffect, useRef, useState } from 'react';
import type { CriterionScore, Inspection, Score } from '../../types';
import { getConfig, getInspection, getScore, sendInspection } from '../../api';
import {
  CRITERION_DETAIL,
  DEMO_VIDEO_URL,
  VIDEO_ANALYSIS_SUMMARY,
  VIDEO_CHAPTERS,
  VIDEO_OVERVIEW,
} from '../../pages/gradingResultDemoContent';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Chip';
import { SegmentedControl } from '../ui/Controls';
import { Meter, ScoreDial } from '../ui/Metrics';
import { EmptyState, Notice, Panel, PanelBlock, PanelHeader } from '../ui/Panel';
import {
  IconAlert,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconClose,
  IconInfo,
  IconSend,
  IconTrend,
  IconUpload,
  IconVideo,
} from '../ui/icons';
import { VideoPlayer, type VideoPlayerHandle } from './VideoPlayer';

const REDIRECT_DELAY_MS = 1800;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const timeLabel = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;

/** Shared shape between real API chapters and the demo fallback ones, so
 * the rest of the page doesn't need to know which source it's rendering. */
interface DisplayChapter {
  id: string;
  start: number;
  end: number;
  timeLabel: string;
  title: string;
  description: string;
  tags?: string[];
}

type Tab = 'overview' | 'breakdown';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'breakdown', label: 'Video breakdown' },
] as const satisfies readonly { value: Tab; label: string }[];

/* ── Stat strip — same hairline-divided pattern as the dashboard summary ─ */

function StatStrip({
  items,
}: {
  items: readonly { label: string; value: string | number; tone?: string }[];
}) {
  return (
    <dl className="grid grid-cols-2 divide-line rounded-lg border border-line sm:grid-cols-4 sm:divide-x">
      {items.map((item) => (
        <div key={item.label} className="px-6 py-5">
          <dt className="eyebrow">{item.label}</dt>
          <dd className={`tnum mt-2 font-display text-title ${item.tone ?? 'text-ink'}`}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ── Evidence chip — jumps to the matching video-breakdown chapter ─────── */

function EvidenceChip({
  chapterId,
  chaptersById,
  onClick,
}: {
  chapterId: string;
  chaptersById: Record<string, DisplayChapter>;
  onClick: (id: string) => void;
}) {
  const chapter = chaptersById[chapterId];
  if (!chapter) return null;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick(chapterId);
      }}
      className="tnum inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-paper px-3 text-cell font-bold text-ink-500 transition-colors duration-[120ms] ease-swift hover:border-ink hover:text-ink"
    >
      <IconVideo size={12} />
      {chapter.timeLabel}
    </button>
  );
}

/* ── Criterion accordion row ─────────────────────────────────────────── */

function CriterionRow({
  criterion,
  index,
  threshold,
  expanded,
  chaptersById,
  onToggle,
  onEvidenceClick,
}: {
  criterion: CriterionScore;
  index: number;
  threshold: number;
  expanded: boolean;
  chaptersById: Record<string, DisplayChapter>;
  onToggle: () => void;
  onEvidenceClick: (chapterId: string) => void;
}) {
  // Trust the grader's own verdict when it supplied one; only fall back to the
  // score comparison when `passed` is null. Deriving it purely from the score
  // made the rows disagree with the "n of m passed" count in the header.
  const passing = criterion.passed ?? criterion.score >= threshold;
  // The real API (AI Services, via technician-services) now sends
  // guidance/to_reach/evidence directly on the criterion — the static demo
  // content is only a fallback for a video graded before this landed, or
  // for the offline/mock build.
  const demo = CRITERION_DETAIL[criterion.key];
  const why = criterion.guidance ?? demo?.why;
  const toReach = criterion.to_reach ?? demo?.toReach;
  const evidence = criterion.evidence && criterion.evidence.length > 0 ? criterion.evidence : demo?.evidence;
  const triggerId = `criterion-trigger-${criterion.key}`;
  const panelId = `criterion-panel-${criterion.key}`;

  return (
    <li>
      {/* Collapsed row is deliberately just a one-liner — name, verdict, score.
          Everything else lives behind the disclosure so seven criteria don't
          read as a wall of text by default. */}
      <button
        type="button"
        id={triggerId}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 px-6 py-5 text-left transition-colors duration-[120ms] ease-swift hover:bg-zebra"
      >
        <span className="tnum w-8 shrink-0 font-display text-body font-bold text-ink-300">
          {String(index + 1).padStart(2, '0')}
        </span>

        <span
          className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
            passing ? 'bg-pass-wash text-pass' : 'bg-fail-wash text-fail'
          }`}
        >
          {passing ? <IconCheck size={14} /> : <IconClose size={14} />}
        </span>

        <span className="min-w-0 flex-1 text-lead font-bold text-ink sm:min-w-[14rem]">
          {criterion.display_name}
        </span>

        <span className="flex shrink-0 items-center gap-4">
          <Meter value={criterion.score} threshold={threshold} width={96} showValue={false} />
          <span
            className={`tnum w-14 text-right font-display text-lead font-bold ${
              passing ? 'text-pass' : 'text-fail'
            }`}
          >
            {criterion.score}%
          </span>
          <IconChevronDown
            size={18}
            className={`shrink-0 text-ink-400 transition-transform duration-200 ease-swift ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {expanded && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="rise space-y-5 border-t border-line bg-zebra px-6 py-6 pl-[4.75rem]"
        >
          <div>
            <p className="eyebrow">Why this score</p>
            <p className="mt-2 max-w-prose text-body leading-relaxed text-ink-600">
              {why ?? 'No further detail is available for this criterion yet.'}
            </p>
          </div>

          {toReach && (
            <div>
              <p className="eyebrow">To reach 100%</p>
              <p className="mt-2 max-w-prose text-body leading-relaxed text-ink-600">{toReach}</p>
            </div>
          )}

          {evidence && evidence.length > 0 && (
            <div>
              <p className="eyebrow mb-2">Evidence</p>
              <div className="flex flex-wrap gap-2">
                {evidence.map((chapterId) => (
                  <EvidenceChip
                    key={chapterId}
                    chapterId={chapterId}
                    chaptersById={chaptersById}
                    onClick={onEvidenceClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

interface GradingBreakdownProps {
  inspectionId: string;
  videoId: string;
  onNavigate: (page: string) => void;
  onSendSuccess: () => void;
  /** Start a new upload. In the standalone grading page this navigates back
   * to the inspection so the real upload box is available there; embedded
   * directly in the inspection page it swaps this view for the upload box
   * in place. */
  onReupload: () => void;
  /** Hide the reupload affordance entirely — once an inspection is sent,
   * no further attempts are allowed. */
  canReupload?: boolean;
}

export function GradingBreakdown({
  inspectionId,
  videoId,
  onNavigate,
  onSendSuccess,
  onReupload,
  canReupload = true,
}: GradingBreakdownProps) {
  const [score, setScore] = useState<Score>();
  const [inspection, setInspection] = useState<Inspection>();
  const [threshold, setThreshold] = useState(80);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  // Tracks playback position live (via VideoPlayer's onTimeUpdate) so the
  // chapter list can highlight whichever chapter is actually playing right
  // now, not just the last one clicked. Null until the player reports a
  // first timestamp, so a manual click/evidence-jump still controls the
  // highlight before playback has started.
  const [playingTime, setPlayingTime] = useState<number | null>(null);
  const playerRef = useRef<VideoPlayerHandle>(null);
  // Follows the active chapter row as playback moves further down the
  // list, so the highlighted timestamp never scrolls out of view on its
  // own — same element a manual click/evidence-jump also scrolls to.
  const activeChapterRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    setScore(undefined);
    setInspection(undefined);
    setError('');
    setSent(false);
    setTab('overview');
    Promise.all([getScore(videoId), getInspection(inspectionId), getConfig()])
      .then(([result, item, config]) => {
        setScore(result);
        setInspection(item);
        setThreshold(config.grading_threshold_percent);
        // Failing criteria open by default — that's what needs attention.
        // Passing ones stay collapsed so the list doesn't open onto a wall
        // of text.
        setExpandedCriteria(
          Object.fromEntries(
            result.criteria
              .filter((criterion) => !(criterion.passed ?? criterion.score >= config.grading_threshold_percent))
              .map((criterion) => [criterion.key, true]),
          ),
        );
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load score'),
      );
  }, [inspectionId, videoId]);

  // Real chapters (from ai-services, via the score response) win when
  // present. The demo set is only a fallback — an old video graded before
  // this landed, a video that failed AI grading, or the offline/mock build.
  // Computed ahead of the loading-state early return (rather than after it,
  // where this used to live) so the auto-scroll effect below it can depend
  // on activeChapterId without breaking the rule that hooks can't follow a
  // conditional return.
  const hasRealChapters = Boolean(score?.chapters && score.chapters.length > 0);
  const chapters: DisplayChapter[] = !score
    ? []
    : hasRealChapters
      ? score.chapters!.map((c) => ({
          id: c.id,
          start: c.start_seconds,
          end: c.end_seconds,
          timeLabel: `${timeLabel(c.start_seconds)}–${timeLabel(c.end_seconds)}`,
          title: c.title,
          description: c.description ?? '',
        }))
      : VIDEO_CHAPTERS;
  // Whichever chapter is playing right now, live — falls back to the last
  // clicked/jumped-to chapter until the player reports its first
  // timestamp. Chapters are contiguous with no gaps (see /transcribe's
  // prompt), so "first chapter whose end hasn't passed yet" is the one
  // currently playing; past the last chapter's end (e.g. at the very
  // final frame) it stays pinned to the last chapter instead of going dark.
  const playingChapterId =
    playingTime == null
      ? null
      : (chapters.find((chapter) => playingTime < chapter.end) ?? chapters[chapters.length - 1])?.id ?? null;
  const activeChapterId = playingChapterId ?? selectedChapterId;

  // Keeps the highlighted chapter in view as playback moves further down
  // the list — only re-fires when the active chapter actually changes, not
  // on every timeupdate tick, so it never fights a viewer trying to scroll
  // and read something else while the video keeps playing.
  useEffect(() => {
    if (!activeChapterId) return;
    activeChapterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeChapterId]);

  if (!score || !inspection) {
    return (
      <Panel>
        <EmptyState
          title={error ? 'Score unavailable' : 'Loading grading result…'}
          hint={error || undefined}
        />
      </Panel>
    );
  }

  const passing = score.overall_score >= score.threshold_percent;
  const passedCount = score.criteria.filter((criterion) => criterion.passed).length;

  const chaptersById = Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter]));
  // Old/seed data can carry a non-null but unusable storage_url (a bare
  // relative path with no real file behind it, e.g. from seed.sql fixtures
  // that predate the real grading pipeline) — `??` alone doesn't catch that,
  // it only catches null/undefined. Only trust an absolute http(s) URL;
  // anything else falls back to the illustrative demo clip, same as no URL
  // at all.
  const videoUrl = score.video_url && /^https?:\/\//.test(score.video_url) ? score.video_url : DEMO_VIDEO_URL;
  const videoDurationLabel = hasRealChapters
    ? timeLabel(Math.max(...chapters.map((c) => c.end)))
    : VIDEO_ANALYSIS_SUMMARY.durationLabel;

  const toggleCriterion = (key: string) =>
    setExpandedCriteria((previous) => ({ ...previous, [key]: !previous[key] }));

  // Jumps the real player to a chapter's start and marks it playing/selected.
  const seekPlayer = (chapterId: string) => {
    const chapter = chaptersById[chapterId];
    if (chapter) playerRef.current?.seekTo(chapter.start);
  };

  // Used from the Overview tab's criterion evidence chips: switch to the
  // breakdown tab, then select, scroll to, and seek the matching chapter once
  // that tab's content (and the player) has mounted.
  const selectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setTab('breakdown');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        scrollToId(`chapter-${chapterId}`);
        seekPlayer(chapterId);
      }),
    );
  };

  // Same as selectChapter but for use while already on the breakdown tab —
  // no tab switch or extra frame wait needed.
  const jumpToChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    scrollToId(`chapter-${chapterId}`);
    seekPlayer(chapterId);
  };

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

  // Improvement notes grouped by the chapter their evidence points at, so the
  // breakdown tab can show "here's the issue" right under the timestamp it
  // happened at, instead of as a separate list disconnected from the video.
  // Real evidence (from the criterion itself) wins; the static demo overlay
  // only fills in when a criterion has none of its own.
  const improvementsByChapter = new Map<string, { criterion: CriterionScore; toReach: string }[]>();
  for (const criterion of score.criteria) {
    const demo = CRITERION_DETAIL[criterion.key];
    const toReach = criterion.to_reach ?? demo?.toReach;
    const evidence = criterion.evidence && criterion.evidence.length > 0 ? criterion.evidence : demo?.evidence;
    if (!toReach || !evidence) continue;
    for (const chapterId of evidence) {
      const list = improvementsByChapter.get(chapterId) ?? [];
      list.push({ criterion, toReach });
      improvementsByChapter.set(chapterId, list);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Verdict header — score, threshold, reupload ────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-title">{passing ? 'Cleared for delivery' : 'Needs revision'}</h2>
          <Tag>{score.threshold_percent}% required</Tag>
        </div>
        {canReupload && (
          <Button variant="secondary" size="md" icon={<IconUpload size={16} />} onClick={onReupload}>
            Reupload video
          </Button>
        )}
      </div>

      <SegmentedControl label="Grading result sections" options={TABS} value={tab} onChange={setTab} />

      {/* ── Overview ───────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <Panel className="flex flex-wrap items-start gap-8 p-8">
            <ScoreDial
              score={score.overall_score}
              threshold={score.threshold_percent}
              size={176}
              stroke={14}
              caption={passing ? 'Pass' : 'Fail'}
            />

            {/* basis-72 (not just flex-1's default 0%) gives this column a real
                hypothetical size, so flex-wrap actually drops it below the dial
                on narrow screens instead of squeezing both onto one line. */}
            <div className="min-w-0 flex-1 basis-72 sm:min-w-[18rem]">
              <p className="eyebrow">Assessor feedback</p>
              <p className="mt-3 text-lead leading-relaxed text-ink-600">{score.feedback}</p>

              <div className="mt-6">
                {sent ? (
                  <Notice tone="pass" title={`Sent to ${inspection.customer.name}`}>
                    Returning to the inspection list.
                  </Notice>
                ) : passing && score.can_send ? (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="positive"
                      size="lg"
                      loading={sending}
                      onClick={handleSend}
                      icon={sending ? undefined : <IconSend size={15} />}
                    >
                      {sending ? 'Sending…' : 'Send to customer'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Notice tone="fail" title="Cannot send — below the quality threshold">
                      This walkaround scored {score.overall_score}%, under the{' '}
                      {score.threshold_percent}% required. Address the failing criteria below and
                      re-record.
                    </Notice>
                    {canReupload && (
                      <div className="flex flex-wrap gap-3">
                        <Button variant="primary" size="lg" onClick={onReupload}>
                          Re-record video
                        </Button>
                        <Button size="lg" onClick={() => onNavigate('dashboard')}>
                          Back to queue
                        </Button>
                      </div>
                    )}
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

          {/* ── Video analysis strip ───────────────────────────────── */}
          <div className="space-y-3">
            <StatStrip
              items={[
                { label: 'Duration', value: videoDurationLabel },
                {
                  label: 'Analysis',
                  value: hasRealChapters ? 'Complete' : VIDEO_ANALYSIS_SUMMARY.analysisStatus,
                },
                {
                  label: 'Strengths',
                  value: hasRealChapters ? passedCount : VIDEO_ANALYSIS_SUMMARY.strengths,
                  tone: 'text-pass',
                },
                {
                  label: 'Areas to improve',
                  value: hasRealChapters
                    ? score.criteria.length - passedCount
                    : VIDEO_ANALYSIS_SUMMARY.areasToImprove,
                  tone: 'text-fail',
                },
              ]}
            />
            <div className="flex justify-end">
              <Button
                variant="quiet"
                size="md"
                iconTrailing={<IconChevronRight size={15} />}
                onClick={() => setTab('breakdown')}
              >
                View video breakdown
              </Button>
            </div>
          </div>

          {/* ── Coaching notes ─────────────────────────────────────── */}
          {/* No real equivalent yet — the assessor feedback above already
              covers this from real data. Demo-only, so nothing fabricated
              shows next to genuine grading results. */}
          {!hasRealChapters && (
            <PanelBlock eyebrow="Coaching notes">
              <p className="text-lead leading-relaxed text-ink-600">{VIDEO_OVERVIEW}</p>
            </PanelBlock>
          )}

          {/* ── Criterion breakdown ─────────────────────────────────── */}
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
                  expanded={Boolean(expandedCriteria[criterion.key])}
                  chaptersById={chaptersById}
                  onToggle={() => toggleCriterion(criterion.key)}
                  onEvidenceClick={selectChapter}
                />
              ))}
            </ol>
            <footer className="flex items-center justify-between gap-4 border-t border-line bg-zebra px-6 py-4">
              <span className="eyebrow">Overall</span>
              <span
                className={`tnum font-display text-heading ${passing ? 'text-pass' : 'text-fail'}`}
              >
                {score.overall_score}%{' '}
                <span className="text-body font-semibold text-ink-400">
                  / {score.threshold_percent}% required
                </span>
              </span>
            </footer>
          </Panel>

          {/* ── Rubric footnote ───────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-md border border-line bg-zebra py-3 pr-4 pl-5">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-info/60" />
            <div className="flex items-start gap-3">
              <IconInfo size={16} className="mt-0.5 shrink-0 text-info/60" />
              <p className="text-body leading-relaxed text-ink-600">
                Graded against the BMW CPO Vehicle Inspection rubric. Tone and brand-voice
                criteria are assessed against the reference walkaround; official policy
                documents are pending.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Video breakdown ───────────────────────────────────────── */}
      {tab === 'breakdown' && (
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
          <div className="space-y-3 xl:sticky xl:top-6">
            <VideoPlayer ref={playerRef} src={videoUrl} onTimeUpdate={setPlayingTime} />
            {!hasRealChapters && (
              <p className="text-cell leading-relaxed text-ink-400">
                Preview clip — will play the technician's actual upload once this video has been
                graded. Timestamps below already seek this player.
              </p>
            )}
          </div>

          <Panel flush className="xl:max-h-[calc(100vh-11rem)] xl:overflow-y-auto">
            <PanelHeader
              title="Video breakdown"
              icon={<IconVideo size={16} />}
              meta={`${chapters.length} chapters · ${videoDurationLabel}`}
            />
            <ol className="divide-y divide-line">
              {chapters.map((chapter) => {
                const selected = chapter.id === activeChapterId;
                // Distinguishes "this is playing right now" from "this was
                // last clicked" — only the former gets the live pulse; a
                // manually-selected-but-paused chapter still gets the
                // glow/highlight treatment, just without the "it's moving"
                // cue.
                const isLive = selected && chapter.id === playingChapterId;
                const chapterImprovements = improvementsByChapter.get(chapter.id) ?? [];
                return (
                  <li
                    key={chapter.id}
                    id={`chapter-${chapter.id}`}
                    ref={selected ? activeChapterRef : undefined}
                  >
                    <button
                      type="button"
                      aria-current={selected || undefined}
                      onClick={() => jumpToChapter(chapter.id)}
                      className={`group relative flex w-full items-start gap-4 px-6 py-6 text-left transition-all duration-200 ease-swift ${
                        selected
                          ? 'z-10 scale-[1.015] bg-well shadow-[0_0_0_1.5px_var(--color-ink),0_8px_24px_-8px_rgba(20,20,22,0.28)]'
                          : 'hover:bg-zebra hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]'
                      }`}
                    >
                      {/* A small dot instead of a bordered badge for each mark
                          — reads as a timeline, not another row of chips. The
                          active one glows and pulses while actually playing. */}
                      <span aria-hidden="true" className="relative mt-2 flex size-2.5 shrink-0 items-center justify-center">
                        {isLive && (
                          <span className="absolute size-2.5 animate-ping rounded-full bg-ink/40" />
                        )}
                        <span
                          className={`relative size-2.5 rounded-full transition-colors duration-200 ${
                            selected ? 'bg-ink shadow-[0_0_8px_var(--color-ink)]' : 'bg-ink-300 group-hover:bg-ink-400'
                          }`}
                        />
                      </span>
                      <span
                        className={`tnum w-20 shrink-0 pt-0.5 font-display text-cell font-bold transition-colors duration-200 ${
                          selected ? 'text-ink' : 'text-ink-400'
                        }`}
                      >
                        {chapter.timeLabel}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-lead font-bold text-ink">{chapter.title}</p>
                        <p className="mt-1 text-body leading-relaxed text-ink-500">
                          {chapter.description}
                        </p>
                        {chapter.tags && chapter.tags.length > 0 && (
                          <p className="mt-1.5 text-micro font-bold tracking-[0.08em] text-ink-300 uppercase">
                            {chapter.tags.join(' · ')}
                          </p>
                        )}
                      </div>
                      {isLive && (
                        <span className="mt-1 flex shrink-0 items-center gap-1.5 text-micro font-bold tracking-[0.08em] text-ink uppercase">
                          <span className="size-1.5 animate-pulse rounded-full bg-ink" />
                          Playing
                        </span>
                      )}
                    </button>

                    {/* Improvement notes merged in at the timestamp they apply
                        to, instead of a separate list disconnected from when
                        they actually happen in the video. */}
                    {chapterImprovements.length > 0 && (
                      <div className="space-y-2 px-6 pb-5 pl-[3.25rem]">
                        {chapterImprovements.map(({ criterion, toReach }) => {
                          // A criterion that already passed but isn't a
                          // perfect 100 is a refinement, not a failure —
                          // red would contradict a page that just said
                          // "Cleared for delivery", and amber read as an
                          // alert too. Blue keeps it a calm coaching note.
                          const failed = !(criterion.passed ?? criterion.score >= threshold);
                          return (
                            <div
                              key={criterion.key}
                              className={`flex items-start gap-2.5 rounded-md px-3.5 py-3 ${
                                failed ? 'bg-fail-wash' : 'bg-info-wash'
                              }`}
                            >
                              <IconAlert
                                size={15}
                                className={`mt-0.5 shrink-0 ${failed ? 'text-fail' : 'text-info'}`}
                              />
                              <p className="text-cell leading-relaxed text-ink-700">
                                <span className={`font-bold ${failed ? 'text-fail' : 'text-info'}`}>
                                  {criterion.display_name} · {criterion.score}%
                                </span>{' '}
                                — {toReach}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </Panel>
        </div>
      )}
    </div>
  );
}
