import type { AnalyticsDataPoint } from '../../types';

const WIDTH = 900;
const HEIGHT = 260;
const PAD_LEFT = 40;
/** Room for the threshold annotation so it never overlaps the plot. */
const PAD_RIGHT = 104;
const PAD_TOP = 20;
const PAD_BOTTOM = 34;

const Y_TICKS = [0, 25, 50, 75, 100];

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/**
 * Score trend. The dashed rule is the pass threshold — the only thing that
 * makes an individual score meaningful — so it is labelled, not just drawn.
 */
export function TrendChart({
  data,
  threshold = 80,
}: {
  data: readonly AnalyticsDataPoint[];
  threshold?: number;
}) {
  if (data.length < 2) {
    return (
      <p className="py-12 text-center text-body font-medium text-ink-400">
        Not enough graded videos to plot a trend yet.
      </p>
    );
  }

  const innerW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const toX = (index: number) => PAD_LEFT + (index / (data.length - 1)) * innerW;
  const toY = (score: number) => PAD_TOP + innerH - (score / 100) * innerH;

  const line = data
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${toX(index).toFixed(1)} ${toY(point.score).toFixed(1)}`)
    .join(' ');

  const area = `${line} L ${toX(data.length - 1).toFixed(1)} ${(PAD_TOP + innerH).toFixed(1)} L ${toX(0).toFixed(1)} ${(PAD_TOP + innerH).toFixed(1)} Z`;

  const thresholdY = toY(threshold);
  const labelEvery = Math.ceil(data.length / 8);

  return (
    <figure className="m-0">
      <div className="scroll-x">
        {/* No fixed height: the viewBox aspect ratio drives it, so the plot
            fills the panel instead of letterboxing inside it. */}
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full min-w-[560px]"
          role="img"
          aria-label={`Score trend across ${data.length} graded videos, pass threshold ${threshold} percent`}
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {Y_TICKS.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD_LEFT}
                y1={toY(tick)}
                x2={WIDTH - PAD_RIGHT}
                y2={toY(tick)}
                className="stroke-line"
                strokeWidth={1}
              />
              <text
                x={PAD_LEFT - 8}
                y={toY(tick) + 4}
                textAnchor="end"
                className="fill-ink-400 text-[11px] font-semibold"
              >
                {tick}
              </text>
            </g>
          ))}

          <path d={area} fill="url(#trendFill)" />
          <path
            d={line}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-ink"
          />

          {/* Pass threshold, annotated in the right-hand gutter */}
          <line
            x1={PAD_LEFT}
            y1={thresholdY}
            x2={WIDTH - PAD_RIGHT}
            y2={thresholdY}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            className="stroke-ink/55"
          />
          <text
            x={WIDTH - PAD_RIGHT + 10}
            y={thresholdY + 4}
            textAnchor="start"
            className="fill-ink text-[11px] font-bold"
          >
            {threshold}% gate
          </text>

          {data.map((point, index) => (
            <circle
              key={`${point.date}-${index}`}
              cx={toX(index)}
              cy={toY(point.score)}
              r={4}
              strokeWidth={2}
              className={`stroke-paper ${point.passed ? 'fill-pass' : 'fill-fail'}`}
            />
          ))}

          {data.map((point, index) =>
            index % labelEvery === 0 || index === data.length - 1 ? (
              <text
                key={`label-${point.date}-${index}`}
                x={toX(index)}
                y={HEIGHT - 10}
                textAnchor="middle"
                className="fill-ink-400 text-[11px] font-semibold"
              >
                {shortDate(point.date)}
              </text>
            ) : null,
          )}
        </svg>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center gap-5 text-cell font-semibold text-ink-500">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-pass" /> Passed
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-fail" /> Below threshold
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0 w-6 border-t-2 border-dashed border-ink/55" /> {threshold}% gate
        </span>
      </figcaption>
    </figure>
  );
}
