/* ── Stat tile ───────────────────────────────────────────────────────── */

interface StatTileProps {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'ink' | 'pass' | 'fail' | 'warn';
  className?: string;
}

const VALUE_TONES = {
  ink: 'text-ink',
  pass: 'text-pass',
  fail: 'text-fail',
  warn: 'text-warn',
} as const;

export function StatTile({ label, value, sub, tone = 'ink', className = '' }: StatTileProps) {
  // Value sits a fixed distance below the label so figures align across a row
  // regardless of whether a given tile carries a sub-caption.
  return (
    <div className={`flex flex-col rounded-lg bg-well p-5 ${className}`}>
      <p className="eyebrow">{label}</p>
      <p className={`tnum mt-5 font-display text-title ${VALUE_TONES[tone]}`}>{value}</p>
      {sub && <p className="mt-auto pt-4 text-cell font-medium text-ink-500">{sub}</p>}
    </div>
  );
}

/* ── Meter ───────────────────────────────────────────────────────────────
   Thin bar with a threshold notch. The notch is the point of the component:
   a bare percentage doesn't tell you whether it clears the gate.            */

interface MeterProps {
  value: number;
  threshold?: number;
  width?: number;
  showValue?: boolean;
}

export function Meter({ value, threshold, width = 88, showValue = true }: MeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const passing = threshold == null || clamped >= threshold;

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        style={{ width }}
        className="relative inline-block h-1.5 shrink-0 overflow-hidden rounded-full bg-well-deep"
      >
        <span
          style={{ width: `${clamped}%` }}
          className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-swift ${
            passing ? 'bg-pass' : 'bg-fail'
          }`}
        />
        {threshold != null && (
          <span
            style={{ left: `${threshold}%` }}
            className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-ink/45"
          />
        )}
      </span>
      {showValue && (
        <span
          className={`tnum text-cell font-bold ${passing ? 'text-pass' : 'text-fail'}`}
        >
          {clamped}%
        </span>
      )}
    </span>
  );
}

/* ── Score dial ──────────────────────────────────────────────────────── */

interface ScoreDialProps {
  score: number;
  threshold: number;
  size?: number;
  stroke?: number;
  caption?: string;
}

export function ScoreDial({ score, threshold, size = 152, stroke = 12, caption }: ScoreDialProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const passing = clamped >= threshold;
  const centre = size / 2;

  // Threshold notch, inset within the stroke band so it reads as a gauge mark
  // rather than a stray tick outside the ring.
  const notchAngle = (threshold / 100) * 2 * Math.PI;
  const notch = (r: number) => ({
    x: centre + r * Math.cos(notchAngle - Math.PI / 2),
    y: centre + r * Math.sin(notchAngle - Math.PI / 2),
  });
  const inner = notch(radius - stroke / 2 + 1);
  const outer = notch(radius + stroke / 2 - 1);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-well-deep"
        />
        <circle
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (clamped / 100) * circumference}
          className={`${passing ? 'stroke-pass' : 'stroke-fail'} transition-[stroke-dashoffset] duration-[900ms] ease-swift`}
        />
        <line
          x1={inner.x}
          y1={inner.y}
          x2={outer.x}
          y2={outer.y}
          strokeWidth={2}
          strokeLinecap="butt"
          className="stroke-ink"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <output
          className={`font-display leading-none font-bold tracking-tight ${
            passing ? 'text-pass' : 'text-fail'
          }`}
          style={{ fontSize: size * 0.3 }}
        >
          {clamped}
        </output>
        {caption && <span className="mt-1 eyebrow">{caption}</span>}
      </div>
    </div>
  );
}
