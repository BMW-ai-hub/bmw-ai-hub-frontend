import { useEffect, useState, useMemo } from "react";
import type { Inspection, InspectionStatus, User } from "../types";
import { getInspections } from "../api";
import StatusBadge from "../components/StatusBadge";
import Layout from "../components/Layout";

type SortKey = "created_at" | "status" | "score" | "vehicle";
type SortDir = "asc" | "desc";

const STATUS_FILTERS: { key: InspectionStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "queued", label: "Queued" },
  { key: "in_progress", label: "In Progress" },
  { key: "needs_revision", label: "Needs Revision" },
  { key: "passed", label: "Passed" },
  { key: "sent", label: "Sent" },
];

function ScoreBar({ score }: { score: number }) {
  const pass = score >= 80;
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, background: pass ? "var(--score-pass)" : "var(--score-fail)" }}
        />
      </div>
      <span
        className="text-sm font-semibold tabular-nums"
        style={{ color: pass ? "var(--score-pass)" : "var(--score-fail)", fontFamily: "var(--font-mono)" }}
      >
        {score}%
      </span>
    </div>
  );
}

interface Props {
  user: User;
  onNavigate: (page: string) => void;
  onOpenInspection: (id: string) => void;
  onLogout: () => void;
}

export default function Dashboard({ user, onNavigate, onOpenInspection, onLogout }: Props) {
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");
  // Manager/admin can filter by technician
  const [techFilter, setTechFilter] = useState<string>("all");
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isManager = user.role === "manager" || user.role === "admin";

  // Technicians in the mock — for manager's filter
  const technicians = useMemo(() => Array.from(new Set(inspections.map(i => i.technician_id).filter(Boolean))).map(id => ({ id, name: `Technician ${id.slice(0, 8)}` })), [inspections]);

  useEffect(() => {
    setLoading(true); setError("");
    getInspections(isManager && techFilter !== "all" ? techFilter : undefined)
      .then(setInspections).catch(e => setError(e instanceof Error ? e.message : "Unable to load inspections"))
      .finally(() => setLoading(false));
  }, [isManager, techFilter]);

  const allInspections = useMemo(() => {
    // Technician: own queue only
    if (!isManager) return inspections;
    // Manager/admin: all, optionally filtered by technician
    if (techFilter === "all") return inspections;
    return inspections.filter((i) => i.technician_id === techFilter);
  }, [inspections, isManager, techFilter]);

  const filtered = useMemo(() => {
    let list = allInspections;

    if (statusFilter !== "all") list = list.filter((i) => i.status === statusFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.vehicle.model.toLowerCase().includes(q) ||
          i.vehicle.vin.toLowerCase().includes(q) ||
          i.customer.name.toLowerCase().includes(q) ||
          i.service_type.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      if (sortKey === "created_at") { av = a.created_at; bv = b.created_at; }
      else if (sortKey === "status") { av = a.status; bv = b.status; }
      else if (sortKey === "score") { av = a.latest_score ?? -1; bv = b.latest_score ?? -1; }
      else if (sortKey === "vehicle") { av = a.vehicle.model; bv = b.vehicle.model; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [allInspections, statusFilter, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const needsRevision = allInspections.filter((i) => i.status === "needs_revision").length;

  const SortArrow = ({ col }: { col: SortKey }) => (
    <span className="ml-0.5 opacity-40 text-[10px]">
      {sortKey === col ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
    </span>
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <Layout
      user={user}
      currentPage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
      breadcrumb={[{ label: "Inspections" }]}
    >
      <div className="p-6 space-y-5">
        {error && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "var(--status-revision-bg)", color: "var(--status-revision)" }}>{error}</div>}
        {loading && <div className="text-sm" style={{ color: "var(--text-muted)" }}>Loading inspections…</div>}
        {/* Blocked alert */}
        {needsRevision > 0 && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-base"
            style={{
              background: "var(--status-revision-bg)",
              border: "1px solid #FCA5A5",
              color: "var(--status-revision)",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              <strong>{needsRevision}</strong> inspection{needsRevision > 1 ? "s" : ""} blocked — video below quality threshold.
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {isManager ? "All Inspections" : "My Queue"}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              {allInspections.length} inspection{allInspections.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Technician filter (manager/admin only) */}
            {isManager && (
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="text-base px-3.5 py-2 rounded-lg outline-none"
                style={{
                  border: "1px solid var(--border-strong)",
                  background: "#fff",
                  color: "var(--text-primary)",
                }}
              >
                <option value="all">All Technicians</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}

            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2"
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ color: "var(--text-muted)" }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-base rounded-lg outline-none w-56"
                style={{ border: "1px solid var(--border-strong)", background: "#fff", color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => {
            const count = f.key === "all"
              ? allInspections.length
              : allInspections.filter((i) => i.status === f.key).length;
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className="px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                style={{
                  background: active ? "var(--bmw-blue)" : "#fff",
                  color: active ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${active ? "var(--bmw-blue)" : "var(--border-color)"}`,
                }}
              >
                {f.label}
                <span
                  className="px-1.5 py-px rounded-full text-xs font-semibold"
                  style={{
                    background: active ? "rgba(255,255,255,0.25)" : "var(--page-bg)",
                    color: active ? "#fff" : "var(--text-muted)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)" }}>
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {statusFilter !== "all" || search ? "No results — adjust filters" : "No inspections assigned"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", background: "#FAFBFD" }}>
                  {[
                    { key: "vehicle" as SortKey, label: "Vehicle" },
                    { key: null, label: "Customer" },
                    { key: null, label: "Service" },
                    { key: "created_at" as SortKey, label: "Date" },
                    { key: "status" as SortKey, label: "Status" },
                    { key: "score" as SortKey, label: "Score" },
                    { key: null, label: "" },
                  ].map((col, i) => (
                    <th
                      key={i}
                      className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${col.key ? "cursor-pointer hover:opacity-70 select-none" : ""}`}
                      style={{ color: "var(--text-muted)" }}
                      onClick={col.key ? () => handleSort(col.key as SortKey) : undefined}
                    >
                      {col.label}
                      {col.key && <SortArrow col={col.key as SortKey} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ins, idx) => (
                  <tr
                    key={ins.id}
                    onClick={() => onOpenInspection(ins.id)}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: idx < filtered.length - 1 ? "1px solid var(--border-color)" : "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFD")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-5 py-4">
                      <div className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                        {ins.vehicle.year} {ins.vehicle.model}
                      </div>
                      <div className="text-xs mt-1 font-mono" style={{ color: "var(--text-muted)" }}>
                        {ins.vehicle.vin}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-base" style={{ color: "var(--text-primary)" }}>{ins.customer.name}</div>
                      <div className="text-sm" style={{ color: "var(--text-muted)" }}>{ins.customer.email}</div>
                    </td>
                    <td className="px-5 py-4 text-base" style={{ color: "var(--text-secondary)" }}>
                      {ins.service_type}
                    </td>
                    <td className="px-5 py-4 text-base" style={{ color: "var(--text-secondary)" }}>
                      {fmtDate(ins.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={ins.status} size="md" />
                    </td>
                    <td className="px-5 py-4">
                      {ins.latest_score != null ? (
                        <ScoreBar score={ins.latest_score} />
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: allInspections.length, color: "var(--text-primary)" },
            { label: "Needs Revision", value: allInspections.filter((i) => i.status === "needs_revision").length, color: "var(--status-revision)" },
            { label: "Ready to Send", value: allInspections.filter((i) => i.status === "passed").length, color: "var(--score-pass)" },
            { label: "Sent", value: allInspections.filter((i) => i.status === "sent").length, color: "#2563EB" },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl px-5 py-5"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
            >
              <div className="text-3xl font-bold" style={{ color: s.color, fontFamily: "var(--font-mono)" }}>
                {s.value}
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
