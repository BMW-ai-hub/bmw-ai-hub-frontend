import { useState, useRef } from "react";
import type { Inspection, User, Video } from "../types";
import { MOCK_INSPECTIONS, MOCK_VIDEOS, MOCK_CONFIG } from "../mockData";
import StatusBadge from "../components/StatusBadge";
import Layout from "../components/Layout";

interface Props {
  user: User;
  inspectionId: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onViewScore: (inspectionId: string, videoId: string) => void;
  onVideoProcesed: (inspectionId: string, videoId: string) => void;
}

type UploadStage = "idle" | "uploading" | "processing" | "done" | "error";

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string) {
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

export default function InspectionDetail({
  user,
  inspectionId,
  onNavigate,
  onLogout,
  onViewScore,
  onVideoProcesed,
}: Props) {
  const inspection: Inspection | undefined = MOCK_INSPECTIONS.find((i) => i.id === inspectionId);
  const videos: Video[] = MOCK_VIDEOS[inspectionId] ?? [];

  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newVideoId = useRef<string>("");

  if (!inspection) {
    return (
      <Layout
        user={user}
        currentPage="dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
        breadcrumb={[{ label: "Inspections", onClick: () => onNavigate("dashboard") }, { label: "Not Found" }]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Inspection not found</div>
            <button
              onClick={() => onNavigate("dashboard")}
              className="mt-3 text-sm underline"
              style={{ color: "var(--bmw-blue)" }}
            >
              Back to queue
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const config = MOCK_CONFIG;

  const handleFileSelect = (file: File) => {
    const acceptedTypes = config.accepted_video_types;
    if (!acceptedTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|avi)$/i)) {
      setUploadError("Unsupported file type. Please upload an MP4, MOV, or AVI video.");
      return;
    }
    if (file.size > config.max_upload_bytes) {
      setUploadError(`File too large. Maximum upload size is ${config.max_upload_mb} MB.`);
      return;
    }
    setUploadError("");
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setUploadStage("uploading");
    setUploadProgress(0);

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setUploadStage("processing");
          newVideoId.current = "new-video-" + Date.now();

          // Simulate AI grading (takes 6 seconds)
          setTimeout(() => {
            setUploadStage("done");
            // Navigate to grading result after short delay
            setTimeout(() => {
              onVideoProcesed(inspectionId, "55555555-5555-5555-5555-555555555552");
            }, 1200);
          }, 6000);

          return 100;
        }
        return prev + 8 + Math.random() * 12;
      });
    }, 180);
  };

  const resetUpload = () => {
    setUploadStage("idle");
    setUploadProgress(0);
    setSelectedFile(null);
    setUploadError("");
  };

  const canUpload = inspection.status !== "sent";

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
      <div className="p-6 space-y-5 max-w-5xl">
        {/* Top header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {inspection.vehicle.year} {inspection.vehicle.model}
              </h1>
              <StatusBadge status={inspection.status} />
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {inspection.service_type} · Created {formatDate(inspection.created_at)}
            </p>
          </div>
          {inspection.latest_score != null && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm flex-shrink-0"
              style={{
                background: inspection.latest_score >= 80 ? "var(--status-passed-bg)" : "var(--status-revision-bg)",
                border: `1px solid ${inspection.latest_score >= 80 ? "#86EFAC" : "#FCA5A5"}`,
                color: inspection.latest_score >= 80 ? "var(--score-pass)" : "var(--score-fail)",
              }}
            >
              <span className="font-mono font-bold">{inspection.latest_score}%</span>
              <span className="font-medium">{inspection.latest_score >= 80 ? "Passed" : "Needs Revision"}</span>
            </div>
          )}
        </div>

        {/* Vehicle + Customer cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vehicle card */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
          >
            <div
              className="flex items-center gap-2 mb-4 pb-3"
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--bmw-blue)" }}>
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Vehicle
              </h2>
            </div>
            <dl className="space-y-2.5">
              {[
                { label: "Model", value: `${inspection.vehicle.year} BMW ${inspection.vehicle.model}` },
                { label: "VIN", value: inspection.vehicle.vin, mono: true },
                { label: "Colour", value: inspection.vehicle.color },
                { label: "Mileage", value: formatMileage(inspection.vehicle.mileage) },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between gap-2 text-sm">
                  <dt className="font-medium flex-shrink-0" style={{ color: "var(--text-muted)" }}>{label}</dt>
                  <dd
                    className="text-right"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: mono ? "var(--font-mono)" : undefined,
                      fontSize: mono ? "0.8rem" : undefined,
                    }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Customer card */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
          >
            <div
              className="flex items-center gap-2 mb-4 pb-3"
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--bmw-blue)" }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Customer
              </h2>
            </div>
            <dl className="space-y-2.5">
              {[
                { label: "Name", value: inspection.customer.name },
                { label: "Email", value: inspection.customer.email },
                { label: "Phone", value: inspection.customer.phone },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2 text-sm">
                  <dt className="font-medium flex-shrink-0" style={{ color: "var(--text-muted)" }}>{label}</dt>
                  <dd className="text-right" style={{ color: "var(--text-primary)" }}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Service history */}
        <div
          className="rounded-xl"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div
            className="px-5 py-4 flex items-center gap-2"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--bmw-blue)" }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Service History
            </h2>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "var(--page-bg)", color: "var(--text-muted)" }}
            >
              {inspection.service_history.length} record{inspection.service_history.length !== 1 ? "s" : ""}
            </span>
          </div>
          {inspection.service_history.length === 0 ? (
            <div className="px-5 py-8 text-sm text-center" style={{ color: "var(--text-muted)" }}>
              No prior service history for this vehicle.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
              {inspection.service_history.map((entry, i) => (
                <div key={i} className="px-5 py-4 flex gap-4">
                  <div
                    className="w-20 text-xs font-medium flex-shrink-0 pt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {new Date(entry.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {entry.service_type}
                      </div>
                      <div className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {formatMileage(entry.mileage)}
                      </div>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {entry.technician}
                    </div>
                    <p className="text-sm mt-1.5" style={{ color: "var(--text-secondary)" }}>
                      {entry.notes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video section */}
        <div
          className="rounded-xl"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div
            className="px-5 py-4 flex items-center gap-2"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--bmw-blue)" }}>
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Walkaround Videos
            </h2>
            {inspection.attempt_count > 0 && (
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "var(--page-bg)", color: "var(--text-muted)" }}
              >
                {inspection.attempt_count} attempt{inspection.attempt_count !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Existing videos */}
          {videos.length > 0 && (
            <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
              {videos.map((video) => (
                <div key={video.id} className="px-5 py-4 flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--page-bg)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ color: "var(--bmw-blue)" }}>
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {video.filename}
                    </div>
                    <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                      <span>{formatDate(video.uploaded_at)}</span>
                      {video.duration_seconds && (
                        <>
                          <span>·</span>
                          <span>{formatDuration(video.duration_seconds)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={video.status} size="sm" />
                  {video.status === "graded" && (
                    <button
                      onClick={() => onViewScore(inspectionId, video.id)}
                      className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: "var(--bmw-blue-light, #EBF3FF)", color: "var(--bmw-blue)" }}
                    >
                      View Score
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload section */}
          {canUpload && (
            <div className="px-5 py-5" style={{ borderTop: videos.length > 0 ? "1px solid var(--border-color)" : "none" }}>
              {uploadStage === "idle" && (
                <div>
                  <div
                    className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-bmw-blue" : ""}`}
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
                      const file = e.dataTransfer.files[0];
                      if (file) handleFileSelect(file);
                    }}
                  >
                    <svg
                      className="mx-auto mb-3"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      style={{ color: "var(--bmw-blue)" }}
                    >
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                      {selectedFile ? selectedFile.name : "Drop video here or click to browse"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      MP4, MOV, AVI · Max {config.max_upload_mb} MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />
                  </div>

                  {uploadError && (
                    <p className="mt-2 text-xs" style={{ color: "var(--status-revision)" }}>{uploadError}</p>
                  )}

                  {selectedFile && !uploadError && (
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        <span className="font-medium">{selectedFile.name}</span>
                        <span className="ml-2" style={{ color: "var(--text-muted)" }}>
                          ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={resetUpload}
                          className="px-3 py-1.5 text-sm rounded-lg border transition-colors"
                          style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpload}
                          className="px-4 py-1.5 text-sm rounded-lg text-white font-medium transition-opacity"
                          style={{ background: "var(--bmw-blue)" }}
                        >
                          Upload &amp; Grade
                        </button>
                      </div>
                    </div>
                  )}

                  {!selectedFile && !uploadError && (
                    <p className="mt-3 text-xs text-center" style={{ color: "var(--text-muted)" }}>
                      This video will be automatically transcribed and graded by AI against the BMW walkaround rubric.
                      A score of {config.grading_threshold_percent}% or above is required to send to the customer.
                    </p>
                  )}
                </div>
              )}

              {uploadStage === "uploading" && (
                <div className="rounded-xl p-6 text-center" style={{ background: "var(--page-bg)" }}>
                  <div className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                    Uploading video…
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ background: "var(--border-color)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(uploadProgress, 100)}%`,
                        background: "var(--bmw-blue)",
                      }}
                    />
                  </div>
                  <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {Math.min(Math.round(uploadProgress), 100)}%
                  </div>
                </div>
              )}

              {uploadStage === "processing" && (
                <div className="rounded-xl p-8 text-center" style={{ background: "var(--page-bg)" }}>
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-4 spinner"
                    style={{
                      border: "3px solid var(--border-color)",
                      borderTopColor: "var(--bmw-blue)",
                    }}
                  />
                  <div className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                    AI Grading in Progress
                  </div>
                  <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--text-muted)" }}>
                    The video is being transcribed and graded against the BMW walkaround rubric. This typically takes 30–90 seconds.
                  </p>
                </div>
              )}

              {uploadStage === "done" && (
                <div className="rounded-xl p-6 text-center" style={{ background: "var(--status-passed-bg)", border: "1px solid #86EFAC" }}>
                  <div className="text-2xl mb-2">✓</div>
                  <div className="text-sm font-semibold" style={{ color: "var(--score-pass)" }}>
                    Grading complete — loading results…
                  </div>
                </div>
              )}
            </div>
          )}

          {!canUpload && (
            <div className="px-5 py-4 text-sm" style={{ borderTop: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
              This inspection has been sent to the customer. No further videos can be uploaded.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
