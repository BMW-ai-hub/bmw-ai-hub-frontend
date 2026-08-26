import { useState, useMemo } from "react";
import type { Inspection, InspectionStatus, User } from "../types";
import { MOCK_INSPECTIONS } from "../mockData";
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
  const isPassing = score >= 80;
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${score}%`,
            background: isPassing ? "var(--score-pass)" : "var(--score-fail)",
          }}
        />
      </div>
      <span
        className="text-xs font-semibold tabular-nums"
        style={{
          color: isPassing ? "var(--score-pass)" : "var(--score-fail)",
          fontFamily: "var(--font-mono)",
        }}
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

  const inspections = MOCK_INSPECTIONS;

  const filtered = useMemo(() => {
    let list = inspections;

    if (statusFilter !== "all") {
      list = list.filter((i) => i.status === statusFilter);
    }

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

    list = [...list].sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      if (sortKey === "created_at") {
        av = a.created_at;
        bv = b.created_at;
      } else if (sortKey === "status") {
        av = a.status;
        bv = b.status;
      } else if (sortKey === "score") {
        av = a.latest_score ?? -1;
        bv = b.latest_score ?? -1;
      } else if (sortKey === "vehicle") {
        av = a.vehicle.model;
        bv = b.vehicle.model;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [inspections, statusFilter, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const needsRevisionCount = inspections.filter((i) => i.status === "needs_revision").length;

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 opacity-50" style={{ fontSize: 10 }}>
      {sortKey === col ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
    </span>
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Layout
      user={user}
      currentPage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
      breadcrumb={[{ label: "Inspections" }]}
    >
      <div className="p-6 space-y-5">
        {/* Alert banner for blocked inspections */}
        {needsRevisionCount > 0 && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm"
            style={{
              background: "var(--status-revision-bg)",
              border: "1px solid #FCA5A5",
              color: "var(--status-revision)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              <strong>{needsRevisionCount} inspection{needsRevisionCount > 1 ? "s" : ""}</strong> blocked — video scored below the quality threshold. Review feedback and re-record.
            </span>
          </div>
        )}

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Inspection Queue
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              {inspections.length} assigned inspection{inspections.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: "var(--text-muted)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search vehicle, customer, VIN…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg outline-none w-64"
              style={{
                border: "1px solid var(--border-strong)",
                background: "#fff",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => {
            const count = f.key === "all"
              ? inspections.length
              : inspections.filter((i) => i.status === f.key).length;
            const isActive = statusFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                style={{
                  background: isActive ? "var(--bmw-blue)" : "#fff",
                  color: isActive ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${isActive ? "var(--bmw-blue)" : "var(--border-color)"}`,
                }}
              >
                {f.label}
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.25)" : "var(--page-bg)",
                    color: isActive ? "#fff" : "var(--text-muted)",
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
          style={{
            border: "1px solid var(--border-color)",
            background: "var(--card-bg)",
          }}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)" }}>
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
              <div className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                No inspections found
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {statusFilter !== "all" || search ? "Try adjusting your filters" : "No inspections assigned yet"}
              </div>
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
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${col.key ? "cursor-pointer select-none hover:opacity-70" : ""}`}
                      style={{ color: "var(--text-muted)" }}
                      onClick={col.key ? () => handleSort(col.key as SortKey) : undefined}
                    >
                      {col.label}
                      {col.key && <SortIcon col={col.key as SortKey} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inspection, idx) => (
                  <tr
                    key={inspection.id}
                    onClick={() => onOpenInspection(inspection.id)}
                    className="cursor-pointer transition-colors"
                    style={{
                      borderBottom: idx < filtered.length - 1 ? "1px solid var(--border-color)" : "none",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFD")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Vehicle */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {inspection.vehicle.year} {inspection.vehicle.model}
                      </div>
                      <div className="text-xs mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>
                        {inspection.vehicle.vin}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {inspection.customer.name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {inspection.customer.email}
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-4 py-3.5">
                      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {inspection.service_type}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5">
                      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(inspection.created_at)}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {formatTime(inspection.created_at)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={inspection.status} />
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3.5">
                      {inspection.latest_score != null ? (
                        <ScoreBar score={inspection.latest_score} />
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>

                    {/* Arrow */}
                    <td className="px-4 py-3.5 text-right">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Assigned",
              value: inspections.length,
              color: "var(--text-primary)",
            },
            {
              label: "Needs Revision",
              value: inspections.filter((i) => i.status === "needs_revision").length,
              color: "var(--status-revision)",
            },
            {
              label: "Ready to Send",
              value: inspections.filter((i) => i.status === "passed").length,
              color: "var(--score-pass)",
            },
            {
              label: "Sent Today",
              value: inspections.filter((i) => i.status === "sent").length,
              color: "var(--status-sent)",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-lg px-4 py-3"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div
                className="text-2xl font-bold"
                style={{ color: stat.color, fontFamily: "var(--font-mono)" }}
              >
                {stat.value}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
