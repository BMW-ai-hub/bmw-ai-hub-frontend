import { useState } from "react";
import type { User, Score, CriterionScore } from "../types";
import { MOCK_SCORES, MOCK_INSPECTIONS, MOCK_CONFIG } from "../mockData";
import ScoreRing from "../components/ScoreRing";
import Layout from "../components/Layout";

interface Props {
  user: User;
  inspectionId: string;
  videoId: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onBackToInspection: () => void;
  onSendSuccess: () => void;
}

function CriterionRow({ criterion, threshold }: { criterion: CriterionScore; threshold: number }) {
  const [expanded, setExpanded] = useState(false);
  const isPassing = criterion.score >= threshold;
  const barColor = criterion.score >= 90
    ? "#16A34A"
    : criterion.score >= threshold
    ? "#22C55E"
    : criterion.score >= 60
    ? "#F59E0B"
    : "#DC2626";

  return (
    <div
      className="px-5 py-4 transition-colors"
      style={{ borderBottom: "1px solid var(--border-color)" }}
    >
      <div className="flex items-start gap-4">
        {/* Status indicator */}
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: isPassing ? "#DCFCE7" : "#FEE2E2",
          }}
        >
          {isPassing ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="3">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {criterion.display_name}
            </span>
            <div className="flex items-center gap-2 ml-auto">
              {/* Score bar */}
              <div className="w-24 h-1.5 rounded-full overflow-hidden hidden sm:block" style={{ background: "var(--border-color)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${criterion.score}%`, background: barColor, transition: "width 0.8s ease" }}
                />
              </div>
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: barColor, fontFamily: "var(--font-mono)", minWidth: "2.5rem", textAlign: "right" }}
              >
                {criterion.score}%
              </span>
              {criterion.passed !== null && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium hidden sm:block"
                  style={{
                    color: isPassing ? "var(--score-pass)" : "var(--score-fail)",
                    background: isPassing ? "var(--status-passed-bg)" : "var(--status-revision-bg)",
                  }}
                >
                  {isPassing ? "Pass" : "Fail"}
                </span>
              )}
            </div>
          </div>

          {/* Guidance text */}
          {criterion.guidance && (
            <div className="mt-2">
              <p
                className={`text-xs leading-relaxed ${expanded ? "" : "line-clamp-2"}`}
                style={{ color: "var(--text-secondary)" }}
              >
                {criterion.guidance}
              </p>
              {criterion.guidance.length > 120 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs mt-1 font-medium"
                  style={{ color: "var(--bmw-blue)" }}
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
  const score: Score | undefined = MOCK_SCORES[videoId];
  const inspection = MOCK_INSPECTIONS.find((i) => i.id === inspectionId);
  const config = MOCK_CONFIG;
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!score || !inspection) {
    return (
      <Layout
        user={user}
        currentPage="dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
        breadcrumb={[{ label: "Inspections", onClick: () => onNavigate("dashboard") }, { label: "Score" }]}
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Score data unavailable.</p>
        </div>
      </Layout>
    );
  }

  const isPassing = score.overall_score >= score.threshold_percent;

  const handleSend = () => {
    if (!score.can_send) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(onSendSuccess, 1800);
    }, 1200);
  };

  return (
    <Layout
      user={user}
      currentPage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
      breadcrumb={[
        { label: "Inspections", onClick: () => onNavigate("dashboard") },
        {
          label: `${inspection.vehicle.year} ${inspection.vehicle.model}`,
          onClick: onBackToInspection,
        },
        { label: "Grading Result" },
      ]}
    >
      <div className="p-6 space-y-5 max-w-4xl">
        {/* Score hero card */}
        <div
          className="rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          style={{
            background: "var(--card-bg)",
            border: `2px solid ${isPassing ? "#86EFAC" : "#FCA5A5"}`,
          }}
        >
          {/* Ring */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="relative">
              <ScoreRing
                score={score.overall_score}
                threshold={score.threshold_percent}
                size={152}
                strokeWidth={14}
              />
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <span
                  className="text-4xl font-bold tabular-nums leading-none"
                  style={{
                    color: isPassing ? "var(--score-pass)" : "var(--score-fail)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {score.overall_score}
                </span>
                <span className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>/ 100</span>
              </div>
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: isPassing ? "#DCFCE7" : "#FEE2E2",
                color: isPassing ? "#15803D" : "#B91C1C",
              }}
            >
              {isPassing ? "PASS" : "NEEDS REVISION"}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {inspection.vehicle.year} BMW {inspection.vehicle.model}
              </h2>
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ background: "var(--page-bg)", color: "var(--text-muted)" }}
              >
                {score.threshold_percent}% required
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
              {score.feedback}
            </p>

            {/* Action buttons */}
            {sent ? (
              <div
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: "var(--status-passed-bg)", color: "var(--score-pass)", border: "1px solid #86EFAC" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Video sent to {inspection.customer.name}
              </div>
            ) : isPassing && score.can_send ? (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity flex items-center gap-2"
                  style={{
                    background: sending ? "#6EE7B7" : "var(--score-pass)",
                    cursor: sending ? "not-allowed" : "pointer",
                  }}
                >
                  {sending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full spinner inline-block" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Send to Customer
                    </>
                  )}
                </button>
                <button
                  onClick={onBackToInspection}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors"
                  style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                >
                  Back to Inspection
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className="px-4 py-3 rounded-lg text-sm"
                  style={{
                    background: "var(--status-revision-bg)",
                    border: "1px solid #FCA5A5",
                    color: "var(--status-revision)",
                  }}
                >
                  <div className="font-semibold mb-0.5">Cannot send — below quality threshold</div>
                  <div style={{ color: "var(--text-secondary)" }}>
                    This video scored {score.overall_score}%, below the {score.threshold_percent}% required. Review the feedback above and re-record your walkaround.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={onBackToInspection}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
                    style={{ background: "var(--bmw-blue)" }}
                  >
                    Re-record Video
                  </button>
                  <button
                    onClick={onBackToInspection}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium border"
                    style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                  >
                    Back to Inspection
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Criteria breakdown */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div
            className="px-5 py-4 flex items-center gap-2"
            style={{ borderBottom: "1px solid var(--border-color)", background: "#FAFBFD" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--bmw-blue)" }}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Criterion Breakdown
            </h2>
            <div className="ml-auto flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
              <span>
                {score.criteria.filter((c) => c.passed).length}/{score.criteria.length} passed
              </span>
            </div>
          </div>

          <div>
            {score.criteria.map((criterion) => (
              <CriterionRow
                key={criterion.key}
                criterion={criterion}
                threshold={config.grading_threshold_percent}
              />
            ))}
          </div>

          {/* Summary footer */}
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--border-color)", background: "#FAFBFD" }}
          >
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Overall Score
            </span>
            <span
              className="text-sm font-bold tabular-nums"
              style={{
                color: isPassing ? "var(--score-pass)" : "var(--score-fail)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {score.overall_score}% / {score.threshold_percent}% required
            </span>
          </div>
        </div>

        {/* Rubric reference */}
        <div
          className="rounded-lg px-4 py-3 text-xs flex items-start gap-2"
          style={{
            background: "var(--bmw-blue-light, #EBF3FF)",
            border: "1px solid #BFDBFE",
            color: "var(--bmw-blue)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            Graded against the BMW CPO Vehicle Inspection rubric. Categories 6 &amp; 7 (Tone and Brand Voice) are assessed against the BMW of Wilmington example walkaround — official policy documents are pending.
          </span>
        </div>
      </div>
    </Layout>
  );
}
