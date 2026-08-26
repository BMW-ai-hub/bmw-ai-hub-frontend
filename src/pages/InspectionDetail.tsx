import { useEffect, useState, useRef } from "react";
import type { Inspection, User, Video } from "../types";
import { getConfig, getInspection, getInspectionVideos, getScore, getVideo, uploadVideo } from "../api";
import type { Config, Score } from "../types";
import StatusBadge from "../components/StatusBadge";
import ScoreRing from "../components/ScoreRing";
import Layout from "../components/Layout";

interface Props {
  user: User;
  inspectionId: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onViewScore: (inspectionId: string, videoId: string) => void;
  onVideoProcesed: (inspectionId: string, videoId: string) => void;
}

type Tab = "current" | "past" | "brief" | "videos";
type UploadStage = "idle" | "uploading" | "processing" | "done";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatMileage(m: number) {
  return m.toLocaleString() + " km";
}
function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-3 py-2" style={{ borderBottom: "1px solid var(--border-color)" }}>
      <span className="text-xs font-medium flex-shrink-0" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span
        className="text-sm text-right"
        style={{
          color: "var(--text-primary)",
          fontFamily: mono ? "var(--font-mono)" : undefined,
          fontSize: mono ? "0.78rem" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function InspectionDetail({
  user,
  inspectionId,
  onNavigate,
  onLogout,
  onViewScore,
  onVideoProcesed,
}: Props) {
  const [inspection, setInspection] = useState<Inspection>();
  const [videos, setVideos] = useState<Video[]>([]);
  const [config, setConfig] = useState<Config>({ grading_threshold_percent: 80, max_upload_bytes: 500 * 1024 * 1024, max_upload_mb: 500, accepted_video_types: ["video/mp4"] });
  const [latestScore, setLatestScore] = useState<Score | null>(null);
  const [tab, setTab] = useState<Tab>("current");
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([getInspection(inspectionId), getInspectionVideos(inspectionId), getConfig()])
      .then(([item, attempts, cfg]) => { setInspection(item); setVideos(attempts); setConfig(cfg); if (item.latest_video_id) getScore(item.latest_video_id).then(setLatestScore).catch(() => setLatestScore(null)); })
      .catch(e => setUploadError(e instanceof Error ? e.message : "Unable to load inspection"));
  }, [inspectionId]);

  if (!inspection) {
    return (
      <Layout
        user={user}
        currentPage="dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
        breadcrumb={[{ label: "Inspections", onClick: () => onNavigate("dashboard") }, { label: "Not found" }]}
      >
        <div className="flex items-center justify-center h-48">
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>Inspection not found.</span>
        </div>
      </Layout>
    );
  }

  const canUpload = inspection.status !== "sent";

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|mov|avi)$/i)) {
      setUploadError("Unsupported file. Upload an MP4, MOV, or AVI.");
      return;
    }
    if (file.size > config.max_upload_bytes) {
      setUploadError(`File exceeds ${config.max_upload_mb} MB limit.`);
      return;
    }
    setUploadError("");
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadStage("uploading");
    setUploadProgress(0);
    try {
      const accepted = await uploadVideo(inspectionId, selectedFile, inspection.service_type);
      setUploadProgress(100); setUploadStage("processing");
      const poll = async () => {
        const video = await getVideo(accepted.id);
        if (video.status === "graded") { setUploadStage("done"); onVideoProcesed(inspectionId, video.id); return; }
        if (video.status === "failed") { setUploadStage("idle"); setUploadError(video.grading_error ?? "Video grading failed"); return; }
        window.setTimeout(() => void poll().catch(e => { setUploadStage("idle"); setUploadError(e.message); }), 2000);
      };
      await poll();
    } catch (e) { setUploadStage("idle"); setUploadError(e instanceof Error ? e.message : "Upload failed"); }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "current", label: "Current" },
    { key: "past", label: "Past Inspections" },
    { key: "brief", label: "Brief" },
    { key: "videos", label: "Videos" },
  ];

  return (
    <Layout
      user={user}
      currentPage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
      breadcrumb={[
        { label: "Inspections", onClick: () => onNavigate("dashboard") },
        { label: `${inspection.vehicle.year} ${inspection.vehicle.model}` },
      ]}
    >
      <div className="flex flex-col h-full">
        {/* Page header */}
        <div
          className="px-6 pt-5 pb-0 flex-shrink-0"
          style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {inspection.vehicle.year} BMW {inspection.vehicle.model}
                </h1>
                <StatusBadge status={inspection.status} />
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {inspection.service_type} · {inspection.customer.name} · {formatDateTime(inspection.created_at)}
              </p>
            </div>
            {inspection.latest_score != null && (
              <div
                className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold flex-shrink-0"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: inspection.latest_score >= 80 ? "var(--score-pass)" : "var(--score-fail)",
                  background: inspection.latest_score >= 80 ? "var(--status-passed-bg)" : "var(--status-revision-bg)",
                }}
              >
                {inspection.latest_score}%
              </div>
            )}
          </div>

          {/* Tab bar */}
          <div className="flex gap-0">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-5 py-2.5 text-sm font-medium transition-colors relative"
                style={{
                  color: tab === t.key ? "var(--bmw-blue)" : "var(--text-muted)",
                  borderBottom: tab === t.key ? "2px solid var(--bmw-blue)" : "2px solid transparent",
                  marginBottom: -1,
                  background: "transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto p-6">

          {/* ── CURRENT TAB ── */}
          {tab === "current" && (
            <div className="flex gap-5 h-full" style={{ minHeight: 0 }}>
              {/* Left: Info panel */}
              <div className="flex flex-col gap-4" style={{ width: 320, flexShrink: 0 }}>
                {/* Vehicle */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                    Vehicle
                  </p>
                  <Field label="Model" value={`${inspection.vehicle.year} BMW ${inspection.vehicle.model}`} />
                  <Field label="VIN" value={inspection.vehicle.vin} mono />
                  <Field label="Colour" value={inspection.vehicle.color} />
                  <Field label="Mileage" value={formatMileage(inspection.vehicle.mileage)} />
                </div>

                {/* Customer */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                    Customer
                  </p>
                  <Field label="Name" value={inspection.customer.name} />
                  <Field label="Email" value={inspection.customer.email} />
                  <Field label="Phone" value={inspection.customer.phone} />
                </div>

                {/* Inspection meta */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                    Inspection
                  </p>
                  <Field label="Type" value={inspection.service_type} />
                  <Field label="Status" value={inspection.status.replace(/_/g, " ")} />
                  <Field label="Attempts" value={String(inspection.attempt_count)} />
                  <Field label="Created" value={formatDate(inspection.created_at)} />
                </div>
              </div>

              {/* Right: Video / Grading panel */}
              <div className="flex-1 min-w-0 flex flex-col gap-4">
                {/* Grading result if already graded */}
                {latestScore && (
                  <div
                    className="rounded-xl p-5 flex gap-5 items-start"
                    style={{
                      background: "var(--card-bg)",
                      border: `2px solid ${latestScore.overall_score >= latestScore.threshold_percent ? "#86EFAC" : "#FCA5A5"}`,
                    }}
                  >
                    {/* Ring */}
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div className="relative" style={{ width: 100, height: 100 }}>
                        <ScoreRing
                          score={latestScore.overall_score}
                          threshold={latestScore.threshold_percent}
                          size={100}
                          strokeWidth={10}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span
                            className="text-2xl font-bold leading-none"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: latestScore.overall_score >= latestScore.threshold_percent ? "var(--score-pass)" : "var(--score-fail)",
                            }}
                          >
                            {latestScore.overall_score}
                          </span>
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                        style={{
                          color: latestScore.overall_score >= latestScore.threshold_percent ? "#15803D" : "#B91C1C",
                          background: latestScore.overall_score >= latestScore.threshold_percent ? "#DCFCE7" : "#FEE2E2",
                        }}
                      >
                        {latestScore.overall_score >= latestScore.threshold_percent ? "Pass" : "Fail"}
                      </span>
                    </div>
                    {/* Feedback */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          Latest Grade
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {latestScore.threshold_percent}% required
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                        {latestScore.feedback}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => onViewScore(inspectionId, inspection.latest_video_id!)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                          style={{ background: "var(--bmw-blue)" }}
                        >
                          Full Breakdown
                        </button>
                        {inspection.status === "passed" && inspection.can_send && (
                          <button
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                            style={{ background: "var(--score-pass)" }}
                          >
                            Send to Customer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload area */}
                {canUpload && (
                  <div
                    className="rounded-xl p-5 flex-1"
                    style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                      {latestScore ? "Re-record Video" : "Upload Walkaround Video"}
                    </p>

                    {uploadStage === "idle" && (
                      <>
                        <div
                          className="rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors"
                          style={{
                            borderColor: dragOver ? "var(--bmw-blue)" : "var(--border-strong)",
                            background: dragOver ? "#EBF3FF" : "var(--page-bg)",
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            const f = e.dataTransfer.files[0];
                            if (f) handleFileSelect(f);
                          }}
                        >
                          <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--bmw-blue)" }}>
                            <polyline points="16 16 12 12 8 16" />
                            <line x1="12" y1="12" x2="12" y2="21" />
                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                          </svg>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            {selectedFile ? selectedFile.name : "Drop video or click to browse"}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                            MP4, MOV, AVI · Max {config.max_upload_mb} MB
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                          />
                        </div>

                        {uploadError && (
                          <p className="text-xs mt-2" style={{ color: "var(--status-revision)" }}>{uploadError}</p>
                        )}

                        {selectedFile && !uploadError && (
                          <div className="flex items-center justify-between mt-3 gap-3">
                            <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                              {selectedFile.name} · {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                            </span>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => { setSelectedFile(null); setUploadError(""); }}
                                className="px-3 py-1.5 text-xs rounded-lg border"
                                style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                              >
                                Clear
                              </button>
                              <button
                                onClick={handleUpload}
                                className="px-4 py-1.5 text-xs rounded-lg text-white font-semibold"
                                style={{ background: "var(--bmw-blue)" }}
                              >
                                Upload &amp; Grade
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {uploadStage === "uploading" && (
                      <div className="py-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Uploading…</span>
                          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                            {Math.min(Math.round(uploadProgress), 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(uploadProgress, 100)}%`, background: "var(--bmw-blue)" }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadStage === "processing" && (
                      <div className="py-10 flex flex-col items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full spinner"
                          style={{ border: "3px solid var(--border-color)", borderTopColor: "var(--bmw-blue)" }}
                        />
                        <div className="text-center">
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            AI Grading
                          </p>
                          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                            Transcribing and scoring against the BMW rubric…
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadStage === "done" && (
                      <div
                        className="py-8 flex flex-col items-center gap-2 rounded-xl"
                        style={{ background: "var(--status-passed-bg)" }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <p className="text-sm font-semibold" style={{ color: "var(--score-pass)" }}>
                          Done — loading results
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!canUpload && !latestScore && (
                  <div
                    className="rounded-xl p-5 flex items-center justify-center"
                    style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", minHeight: 120 }}
                  >
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Inspection sent to customer. No further uploads.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PAST INSPECTIONS TAB ── */}
          {tab === "past" && (
            <div className="max-w-2xl">
              {inspection.service_history.length === 0 ? (
                <div
                  className="rounded-xl flex items-center justify-center py-16"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
                >
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No prior service history.</p>
                </div>
              ) : (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
                >
                  {inspection.service_history.map((entry, i) => (
                    <div
                      key={i}
                      className="px-5 py-4 flex gap-5"
                      style={{ borderBottom: i < inspection.service_history.length - 1 ? "1px solid var(--border-color)" : "none" }}
                    >
                      <div className="flex flex-col items-center gap-1.5 pt-0.5" style={{ minWidth: 72 }}>
                        <span
                          className="text-xs font-medium text-center leading-tight"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {new Date(entry.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {new Date(entry.date).getFullYear()}
                        </span>
                      </div>
                      <div
                        className="w-px self-stretch flex-shrink-0"
                        style={{ background: "var(--border-color)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {entry.service_type}
                          </span>
                          <span
                            className="text-xs flex-shrink-0 font-mono"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {formatMileage(entry.mileage)}
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{entry.technician}</span>
                        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {entry.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── BRIEF TAB ── */}
          {tab === "brief" && (
            <div className="max-w-2xl space-y-4">
              <div
                className="rounded-xl p-5"
                style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
                  Work Order
                </p>
                <Field label="Service" value={inspection.service_type} />
                <Field label="Status" value={inspection.status.replace(/_/g, " ")} />
                <Field label="Opened" value={formatDateTime(inspection.created_at)} />
                <Field label="Last updated" value={formatDateTime(inspection.updated_at)} />
                <Field label="Attempts" value={String(inspection.attempt_count)} />
                {inspection.latest_score != null && (
                  <Field label="Latest score" value={`${inspection.latest_score}%`} />
                )}
              </div>

              <div
                className="rounded-xl p-5"
                style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
                  Grading Criteria
                </p>
                {[
                  "Completeness",
                  "Accuracy of Terminology",
                  "Clear Finding Shown to Customer",
                  "Explanation of Impact",
                  "Recommendation Clarity",
                  "Tone and Professionalism",
                  "Brand Voice Compliance",
                ].map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-1.5"
                    style={{ borderBottom: i < 6 ? "1px solid var(--border-color)" : "none" }}
                  >
                    <span
                      className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold flex-shrink-0"
                      style={{ background: "var(--page-bg)", color: "var(--text-muted)" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{c}</span>
                  </div>
                ))}
                <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                  Pass threshold: {config.grading_threshold_percent}%
                </p>
              </div>
            </div>
          )}

          {/* ── VIDEOS TAB ── */}
          {tab === "videos" && (
            <div className="max-w-2xl">
              {videos.length === 0 ? (
                <div
                  className="rounded-xl flex items-center justify-center py-16"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
                >
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No videos recorded yet.</p>
                </div>
              ) : (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
                >
                  {videos.map((video, i) => {
                    const score = video.overall_score;
                    return (
                      <div
                        key={video.id}
                        className="px-5 py-4 flex items-center gap-4"
                        style={{ borderBottom: i < videos.length - 1 ? "1px solid var(--border-color)" : "none" }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "var(--page-bg)" }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ color: "var(--bmw-blue)" }}>
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                            {video.filename}
                          </div>
                          <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                            <span>{formatDateTime(video.uploaded_at)}</span>
                            {video.duration_seconds && (
                              <>
                                <span>·</span>
                                <span>{formatDuration(video.duration_seconds)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {score != null && (
                          <span
                            className="text-sm font-bold font-mono flex-shrink-0"
                            style={{ color: score >= config.grading_threshold_percent ? "var(--score-pass)" : "var(--score-fail)" }}
                          >
                            {score}%
                          </span>
                        )}
                        <StatusBadge status={video.status} size="sm" />
                        {video.status === "graded" && (
                          <button
                            onClick={() => onViewScore(inspectionId, video.id)}
                            className="text-xs font-medium px-2.5 py-1.5 rounded-lg flex-shrink-0"
                            style={{ background: "#EBF3FF", color: "var(--bmw-blue)" }}
                          >
                            Score
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
