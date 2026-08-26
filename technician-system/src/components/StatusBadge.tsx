import type { InspectionStatus, VideoStatus } from "../types";

type Status = InspectionStatus | VideoStatus;

const statusStyles: Record<Status, { label: string; color: string; background: string }> = {
  queued: { label: "Queued", color: "var(--status-queued)", background: "var(--status-queued-bg)" },
  in_progress: { label: "In Progress", color: "var(--status-processing)", background: "var(--status-processing-bg)" },
  needs_revision: { label: "Needs Revision", color: "var(--status-revision)", background: "var(--status-revision-bg)" },
  passed: { label: "Passed", color: "var(--status-passed)", background: "var(--status-passed-bg)" },
  sent: { label: "Sent", color: "var(--status-sent)", background: "var(--status-sent-bg)" },
  uploading: { label: "Uploading", color: "var(--status-processing)", background: "var(--status-processing-bg)" },
  processing: { label: "Processing", color: "var(--status-processing)", background: "var(--status-processing-bg)" },
  graded: { label: "Graded", color: "var(--status-passed)", background: "var(--status-passed-bg)" },
  failed: { label: "Failed", color: "var(--status-revision)", background: "var(--status-revision-bg)" },
};

export default function StatusBadge({ status, size = "md" }: { status: Status; size?: "sm" | "md" }) {
  const style = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`}
      style={{ color: style.color, background: style.background }}
    >
      {style.label}
    </span>
  );
}
