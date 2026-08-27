import { IconAlert, IconCheck, IconInfo } from './icons';

/* ── Panel ───────────────────────────────────────────────────────────── */

interface PanelProps {
  tone?: 'paper' | 'well';
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Panel({ tone = 'paper', flush = false, className = '', children }: PanelProps) {
  return (
    <section
      className={`rounded-lg ${
        tone === 'well' ? 'bg-well' : 'border border-line bg-paper'
      } ${flush ? 'overflow-hidden' : ''} ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  meta,
  icon,
  actions,
}: {
  title: string;
  meta?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-5 py-3">
      {icon && <span className="shrink-0 text-ink">{icon}</span>}
      <h2 className="font-display text-heading">{title}</h2>
      {meta && <span className="text-cell font-medium text-ink-400">{meta}</span>}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  );
}

/* Eyebrow-titled block — used for the compact side panels. */
export function PanelBlock({
  eyebrow,
  actions,
  children,
}: {
  eyebrow: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Panel className="p-5">
      <div className="mb-3 flex items-center gap-3">
        <p className="eyebrow">{eyebrow}</p>
        {actions && <div className="ml-auto">{actions}</div>}
      </div>
      {children}
    </Panel>
  );
}

/* ── Definition rows ─────────────────────────────────────────────────── */

export function DefinitionList({ children }: { children: React.ReactNode }) {
  return <dl className="divide-y divide-line">{children}</dl>;
}

export function DefinitionRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-cell font-medium text-ink-500">{label}</dt>
      <dd
        className={`tnum text-right text-cell font-bold break-words ${
          emphasis ? 'text-ink' : 'text-ink-800'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

/* ── Notice ──────────────────────────────────────────────────────────── */

type NoticeTone = 'info' | 'warn' | 'fail' | 'pass';

const NOTICE_TONES: Record<NoticeTone, string> = {
  info: 'bg-info-wash text-info border-info/20',
  warn: 'bg-warn-wash text-warn border-warn/25',
  fail: 'bg-fail-wash text-fail border-fail/25',
  pass: 'bg-pass-wash text-pass border-pass/25',
};

export function Notice({
  tone = 'info',
  title,
  children,
  actions,
}: {
  tone?: NoticeTone;
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const Glyph = tone === 'pass' ? IconCheck : tone === 'info' ? IconInfo : IconAlert;

  return (
    <div
      role={tone === 'fail' ? 'alert' : 'status'}
      className={`flex flex-wrap items-start gap-x-3 gap-y-2 rounded-md border px-4 py-3 ${NOTICE_TONES[tone]}`}
    >
      <Glyph size={17} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1 text-body sm:min-w-[12rem]">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={title ? 'mt-0.5 text-ink-600' : ''}>{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      {icon && <span className="text-ink-300">{icon}</span>}
      <p className="font-display text-heading text-ink-600">{title}</p>
      {hint && <p className="max-w-sm text-body text-ink-400">{hint}</p>}
      {action}
    </div>
  );
}
