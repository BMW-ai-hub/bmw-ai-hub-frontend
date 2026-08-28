import type { InspectionStatus, VideoStatus } from '../../types';

type Status = InspectionStatus | VideoStatus;
type Tone = 'neutral' | 'solid' | 'warn' | 'fail' | 'pass' | 'info';

const TONES: Record<Tone, string> = {
  neutral: 'bg-paper text-ink-500 border-line-strong',
  solid: 'bg-ink text-paper border-ink',
  warn: 'bg-warn-wash text-warn border-warn/20',
  fail: 'bg-fail-wash text-fail border-fail/20',
  pass: 'bg-pass-wash text-pass border-pass/20',
  info: 'bg-info-wash text-info border-info/20',
};

const DOTS: Record<Tone, string> = {
  neutral: 'bg-ink-300',
  solid: 'bg-paper',
  warn: 'bg-warn',
  fail: 'bg-fail',
  pass: 'bg-pass',
  info: 'bg-info',
};

const STATUS: Record<Status, { label: string; tone: Tone }> = {
  queued: { label: 'Queued', tone: 'neutral' },
  in_progress: { label: 'In Progress', tone: 'warn' },
  needs_revision: { label: 'Action Required', tone: 'fail' },
  passed: { label: 'Passed', tone: 'pass' },
  // Committed and locked — carries the solid-ink treatment of the house style.
  sent: { label: 'Sent', tone: 'solid' },
  uploading: { label: 'Uploading', tone: 'warn' },
  processing: { label: 'Grading', tone: 'info' },
  graded: { label: 'Graded', tone: 'pass' },
  failed: { label: 'Failed', tone: 'fail' },
};

export function StatusChip({ status, size = 'md' }: { status: Status; size?: 'sm' | 'md' | 'lg' }) {
  const config = STATUS[status] ?? { label: String(status).replace(/_/g, ' '), tone: 'neutral' as Tone };
  const box =
    size === 'sm' ? 'h-6 px-2.5 gap-1.5 text-micro' : size === 'lg' ? 'h-8 px-3.5 gap-2 text-cell' : 'h-7 px-3 gap-2 text-micro';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold tracking-[0.06em] whitespace-nowrap uppercase ${box} ${TONES[config.tone]}`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${DOTS[config.tone]}`} />
      {config.label}
    </span>
  );
}

/** Compact colour-coded score badge — a table-friendly alternative to the
 * full Meter bar, for a glanceable "pass/fail at a percentage" read without
 * needing the threshold-notch detail the bar exists to show. */
export function ScorePill({ value, threshold = 80 }: { value: number; threshold?: number }) {
  const passing = value >= threshold;
  return (
    <span
      className={`tnum inline-flex h-8 items-center rounded-full border px-3.5 text-lead font-bold ${
        passing ? 'bg-pass-wash text-pass border-pass/20' : 'bg-fail-wash text-fail border-fail/20'
      }`}
    >
      {value}%
    </span>
  );
}

export function CountBadge({ value }: { value: number }) {
  return (
    <span className="tnum inline-flex min-w-[1.9em] items-center justify-center rounded-full bg-ink px-2 py-1 align-middle font-display text-[0.44em] leading-none font-bold text-paper">
      {value}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-sm bg-well px-2 text-micro font-bold tracking-[0.08em] text-ink-500 uppercase">
      {children}
    </span>
  );
}

export function Avatar({
  name,
  size = 36,
  tone = 'ink',
}: {
  name: string;
  size?: number;
  tone?: 'ink' | 'outline';
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold tracking-tight ${
        tone === 'ink' ? 'bg-ink text-paper' : 'border border-line-strong bg-paper text-ink-600'
      }`}
    >
      {initials || '—'}
    </span>
  );
}
