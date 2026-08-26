interface Props {
  score: number;
  threshold: number;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({ score, threshold, size = 160, strokeWidth = 14 }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const dashOffset = circumference - (clampedScore / 100) * circumference;
  const isPassing = clampedScore >= threshold;
  const strokeColor = isPassing ? "#16A34A" : "#DC2626";
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </svg>
  );
}
