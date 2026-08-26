export default function ScoreRing({
  score,
  threshold = 80,
  size = 132,
  strokeWidth = 10,
}: {
  score: number;
  threshold?: number;
  size?: number;
  strokeWidth?: number;
}) {
  const stroke = strokeWidth;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, score)) / 100);
  const passing = score >= threshold;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--score-track)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={passing ? "var(--score-pass)" : "var(--score-fail)"}
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-bold" style={{ color: passing ? "var(--score-pass)" : "var(--score-fail)" }}>{score}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{passing ? "Passed" : "Revision"}</span>
      </div>
    </div>
  );
}
