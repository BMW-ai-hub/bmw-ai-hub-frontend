import type { InspectionStatus, VideoStatus } from "../types";

const STATUS_CONFIG: Record<
  InspectionStatus | VideoStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  queued: { label: "Queued", color: "#64748B", bg: "#F1F5F9", dot: "#94A3B8" },
  in_progress: { label: "In Progress", color: "#B45309", bg: "#FFFBEB", dot: "#F59E0B" },
  needs_revision: { label: "Needs Revision", color: "#B91C1C", bg: "#FEF2F2", dot: "#EF4444" },
  passed: { label: "Passed", color: "#15803D", bg: "#F0FDF4", dot: "#22C55E" },
  sent: { label: "Sent to Customer", color: "#1D4ED8", bg: "#EFF6FF", dot: "#3B82F6" },
  uploading: { label: "Uploading", color: "#B45309", bg: "#FFFBEB", dot: "#F59E0B" },
  processing: { label: "Grading…", color: "#7C3AED", bg: "#F5F3FF", dot: "#8B5CF6" },
  graded: { label: "Graded", color: "#15803D", bg: "#F0FDF4", dot: "#22C55E" },
  failed: { label: "Failed", color: "#B91C1C", bg: "#FEF2F2", dot: "#EF4444" },
};

interface Props {
  status: InspectionStatus | VideoStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: Props) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    color: "#64748B",
    bg: "#F1F5F9",
    dot: "#94A3B8",
  };

  const padding = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const text = size === "sm" ? "text-[10px]" : "text-xs";
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding} ${text}`}
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      <span className={`${dotSize} rounded-full flex-shrink-0`} style={{ backgroundColor: config.dot }} />
      {config.label}
    </span>
  );
}
