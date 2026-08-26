import { useEffect, useState } from "react";
import type { User, AnalyticsDataPoint, PersonalAnalytics, TeamAnalytics } from "../types";
import { getPersonalAnalytics, getTeamAnalytics } from "../api";
import Layout from "../components/Layout";

interface Props {
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

function ScoreTrendChart({ data, threshold = 80 }: { data: AnalyticsDataPoint[]; threshold?: number }) {
  const width = 560;
  const height = 180;
  const padX = 44;
  const padY = 20;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  if (data.length < 2) return null;

  const toX = (i: number) => padX + (i / (data.length - 1)) * innerW;
  const toY = (score: number) => padY + innerH - (score / 100) * innerH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(d.score).toFixed(1)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L ${toX(data.length - 1).toFixed(1)} ${(padY + innerH).toFixed(1)} L ${toX(0).toFixed(1)} ${(padY + innerH).toFixed(1)} Z`;

  const thresholdY = toY(threshold);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { month: "short", day: "numeric" });

  const yLabels = [20, 40, 60, 80, 100];

  return (
    <div className="relative overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[280px]" style={{ height: 180 }}>
        {/* Y grid + labels */}
        {yLabels.map((y) => (
          <g key={y}>
            <line
              x1={padX}
              y1={toY(y)}
              x2={width - padX}
              y2={toY(y)}
              stroke="#E2E8F0"
              strokeWidth={y === threshold ? 0 : 1}
            />
            <text x={padX - 6} y={toY(y) + 4} textAnchor="end" fontSize={10} fill="#94A3B8">
              {y}
            </text>
          </g>
        ))}

        {/* Threshold line */}
        <line
          x1={padX}
          y1={thresholdY}
          x2={width - padX}
          y2={thresholdY}
          stroke="#FBBF24"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <text x={width - padX + 4} y={thresholdY + 4} fontSize={9} fill="#B45309">
          80%
        </text>

        {/* Area fill */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1C69D4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1C69D4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#1C69D4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={toX(i)}
              cy={toY(d.score)}
              r={4}
              fill={d.passed ? "#16A34A" : "#DC2626"}
              stroke="#fff"
              strokeWidth={1.5}
            />
            {/* Score label on hover-like (show first and last) */}
            {(i === 0 || i === data.length - 1 || d.score < 80) && (
              <text
                x={toX(i)}
                y={toY(d.score) - 7}
                textAnchor="middle"
                fontSize={9}
                fill={d.passed ? "#16A34A" : "#DC2626"}
                fontFamily="IBM Plex Mono"
                fontWeight="600"
              >
                {d.score}
              </text>
            )}
          </g>
        ))}

        {/* X axis labels — show every other */}
        {data.map((d, i) =>
          i % 2 === 0 ? (
            <text
              key={i}
              x={toX(i)}
              y={height - 4}
              textAnchor="middle"
              fontSize={9}
              fill="#94A3B8"
            >
              {formatDate(d.date)}
            </text>
          ) : null
        )}
      </svg>
      <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#16A34A" }} /> Pass
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#DC2626" }} /> Fail
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 border-t-2 border-dashed border-yellow-400 inline-block" /> 80% threshold
        </span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
    >
      <div
        className="text-3xl font-bold tabular-nums"
        style={{ color: color ?? "var(--text-primary)", fontFamily: "var(--font-mono)" }}
      >
        {value}
      </div>
      <div className="text-sm font-medium mt-1" style={{ color: "var(--text-primary)" }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

export default function Analytics({ user, onNavigate, onLogout }: Props) {
  const isManager = user.role === "manager" || user.role === "admin";
  const [tab, setTab] = useState<"individual" | "team">("individual");
  const [selectedTechId, setSelectedTechId] = useState(user.id);
  const emptyPersonal: PersonalAnalytics = { technician_id: user.id, technician_name: user.name, first_attempt_pass_rate: 0, average_score: 0, total_videos: 0, total_passed: 0, score_trend: [] };
  const [personalById, setPersonalById] = useState<Record<string, PersonalAnalytics>>({ [user.id]: emptyPersonal });
  const [team, setTeam] = useState<TeamAnalytics>({ dealership: user.dealership, overall_pass_rate: 0, overall_average_score: 0, members: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    getPersonalAnalytics(user).then(d => setPersonalById(p => ({ ...p, [d.technician_id]: d }))).catch(e => setError(e.message));
    if (isManager) getTeamAnalytics().then(d => { setTeam(d); if (d.members[0]) setSelectedTechId(d.members[0].technician_id); }).catch(e => setError(e.message));
  }, [isManager, user]);

  useEffect(() => {
    if (!isManager || personalById[selectedTechId]) return;
    const member = team.members.find(m => m.technician_id === selectedTechId);
    getPersonalAnalytics({ ...user, id: selectedTechId, name: member?.technician_name ?? "Technician" }, selectedTechId)
      .then(d => setPersonalById(p => ({ ...p, [selectedTechId]: d }))).catch(e => setError(e.message));
  }, [isManager, personalById, selectedTechId, team.members, user]);

  // For technician: always their own data. For manager: whichever is selected.
  const selectedAnalytics = isManager
    ? (personalById[selectedTechId] ?? { ...emptyPersonal, technician_id: selectedTechId, technician_name: team.members.find(m => m.technician_id === selectedTechId)?.technician_name ?? "Technician" })
    : (personalById[user.id] ?? emptyPersonal);

  const IndividualStatsPanel = () => (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Pass Rate (1st attempt)"
          value={`${selectedAnalytics.first_attempt_pass_rate}%`}
          color={
            selectedAnalytics.first_attempt_pass_rate >= 80
              ? "var(--score-pass)"
              : selectedAnalytics.first_attempt_pass_rate >= 60
              ? "#D97706"
              : "var(--score-fail)"
          }
        />
        <StatCard
          label="Average Score"
          value={`${selectedAnalytics.average_score}%`}
          color={selectedAnalytics.average_score >= 80 ? "var(--score-pass)" : "var(--text-primary)"}
        />
        <StatCard
          label="Videos Submitted"
          value={selectedAnalytics.total_videos}
        />
        <StatCard
          label="Videos Passed"
          value={selectedAnalytics.total_passed}
          sub={`${selectedAnalytics.total_videos - selectedAnalytics.total_passed} needed revision`}
          color="var(--score-pass)"
        />
      </div>

      {/* Score trend */}
      <div
        className="rounded-xl p-5"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
      >
        <div
          className="flex items-center gap-2 mb-5 pb-4"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--bmw-blue)" }}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Score Trend</h2>
          <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
            Last {selectedAnalytics.score_trend.length} inspections
          </span>
        </div>
        <ScoreTrendChart data={selectedAnalytics.score_trend} threshold={80} />
      </div>

      {/* Recent scores table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
      >
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-color)", background: "#FAFBFD" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Inspections</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              {["Date", "Score", "Result"].map((h) => (
                <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...selectedAnalytics.score_trend].reverse().map((d, i) => (
              <tr key={i} style={{ borderBottom: i < selectedAnalytics.score_trend.length - 1 ? "1px solid var(--border-color)" : "none" }}>
                <td className="px-5 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
                      <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: d.passed ? "var(--score-pass)" : "var(--score-fail)" }} />
                    </div>
                    <span className="text-sm font-bold tabular-nums" style={{ color: d.passed ? "var(--score-pass)" : "var(--score-fail)", fontFamily: "var(--font-mono)" }}>
                      {d.score}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      color: d.passed ? "var(--score-pass)" : "var(--score-fail)",
                      background: d.passed ? "var(--status-passed-bg)" : "var(--status-revision-bg)",
                    }}
                  >
                    {d.passed ? "Passed" : "Failed"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Layout
      user={user}
      currentPage="analytics"
      onNavigate={onNavigate}
      onLogout={onLogout}
      breadcrumb={[{ label: "Analytics" }]}
    >
      <div className="p-6 space-y-5 w-full">
        {error && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "var(--status-revision-bg)", color: "var(--status-revision)" }}>{error}</div>}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Analytics</h1>
          </div>

          {/* Tab switch — manager/admin gets Individual + Team; technician just sees their own (no tabs) */}
          {isManager && (
            <div
              className="flex rounded-lg p-1"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
            >
              {(["individual", "team"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize"
                  style={{
                    background: tab === t ? "var(--bmw-blue)" : "transparent",
                    color: tab === t ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {t === "individual" ? "Individual" : "Team"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── INDIVIDUAL TAB (or technician's own view) ── */}
        {(tab === "individual" || !isManager) && (
          <>
            {/* Technician selector — only for manager/admin */}
            {isManager && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {team.members.map((member) => {
                    const a = personalById[member.technician_id] ?? { ...emptyPersonal, technician_id: member.technician_id, technician_name: member.technician_name };
                    const active = selectedTechId === a.technician_id;
                    const initials = a.technician_name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                    return (
                      <button
                        key={a.technician_id}
                        onClick={() => setSelectedTechId(a.technician_id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          background: active ? "var(--sidebar-bg)" : "var(--card-bg)",
                          color: active ? "#fff" : "var(--text-secondary)",
                          border: `1px solid ${active ? "var(--sidebar-bg)" : "var(--border-color)"}`,
                        }}
                      >
                        <span
                          className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                          style={{
                            background: active ? "var(--bmw-blue)" : "var(--page-bg)",
                            color: active ? "#fff" : "var(--text-muted)",
                          }}
                        >
                          {initials}
                        </span>
                        {a.technician_name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {IndividualStatsPanel()}
          </>
        )}

        {/* Team stats */}
        {tab === "team" && isManager && (
          <div className="space-y-5">
            {/* Team overview cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard
                label="Team Pass Rate"
                value={`${team.overall_pass_rate}%`}
                sub="first-attempt across dealership"
                color={team.overall_pass_rate >= 80 ? "var(--score-pass)" : "var(--text-primary)"}
              />
              <StatCard
                label="Avg Team Score"
                value={`${team.overall_average_score}%`}
                sub="all technicians"
              />
              <StatCard
                label="Technicians"
                value={team.members.length}
                sub="active this period"
              />
            </div>

            {/* Technician breakdown */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
            >
              <div
                className="px-5 py-4 flex items-center gap-2"
                style={{ borderBottom: "1px solid var(--border-color)", background: "#FAFBFD" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--bmw-blue)" }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Technician Leaderboard — {team.dealership}
                </h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    {["Technician", "Avg Score", "1st-Attempt Pass Rate", "Videos"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...team.members]
                    .sort((a, b) => b.average_score - a.average_score)
                    .map((member, i) => (
                      <tr
                        key={member.technician_id}
                        style={{ borderBottom: i < team.members.length - 1 ? "1px solid var(--border-color)" : "none" }}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background: "var(--bmw-blue)", color: "#fff" }}
                            >
                              {member.technician_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                              {member.technician_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${member.average_score}%`,
                                  background: member.average_score >= 80 ? "var(--score-pass)" : "#F59E0B",
                                }}
                              />
                            </div>
                            <span
                              className="text-sm font-bold tabular-nums"
                              style={{
                                color: member.average_score >= 80 ? "var(--score-pass)" : "var(--text-primary)",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {member.average_score}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="text-sm font-semibold tabular-nums"
                            style={{
                              color: member.first_attempt_pass_rate >= 80 ? "var(--score-pass)" : "var(--text-primary)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {member.first_attempt_pass_rate}%
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                          {member.total_videos}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
