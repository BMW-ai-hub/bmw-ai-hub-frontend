import type { Config, Inspection, PersonalAnalytics, Score, TeamAnalytics, User, Video } from "./types";
import { mock } from "./mockApi";

const DEFAULT_API_BASE = import.meta.env.PROD
  ? "https://bmw-ai-hub-backend.vercel.app/api/v1"
  : "/api/v1";
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE).replace(/\/$/, "");
const ACCESS = "bmw_access_token";
const REFRESH = "bmw_refresh_token";

type Tokens = { access_token: string; refresh_token: string; expires_in: number };
type BCustomer = { id: string; name: string | null; email: string | null; phone: string | null };
type BVehicle = { id: string; vin: string | null; model: string | null; year: number | null; customer: BCustomer | null };
type BVideo = { id: string; inspection_id: string; status: Video["status"]; uploaded_at: string; filename?: string | null; can_send: boolean; overall_score?: number | null };
type BInspection = { id: string; technician_id: string | null; status: Inspection["status"]; service_type: string | null; created_at: string; updated_at: string | null; vehicle: BVehicle | null; latest_score: number | null; latest_video_id: string | null; attempt_count: number; can_send: boolean; videos?: BVideo[]; history?: Array<{ created_at: string; service_type: string | null; notes: string | null; final_score: number | null }> };

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

/**
 * Dev-only offline fallback. When the gateway behind the /api proxy isn't
 * running, degrade to the demo dataset instead of dead-ending the UI.
 * Production builds always propagate the original failure.
 */
const DEMO_FLAG = "bmw_offline_demo";

/**
 * Opt in explicitly with VITE_OFFLINE_DEMO=1, or by setting the
 * `bmw_offline_demo` local-storage key to "1" in the browser console.
 */
let offline = import.meta.env.DEV
  && (import.meta.env.VITE_OFFLINE_DEMO === "1" || localStorage.getItem(DEMO_FLAG) === "1");

function unreachable(cause: unknown) {
  // fetch() rejects with TypeError when nothing is listening; the dev proxy
  // surfaces a refused upstream connection as a 5xx instead.
  return cause instanceof TypeError || (cause instanceof ApiError && cause.status >= 500);
}

async function withFallback<T>(live: () => Promise<T>, demo: () => T): Promise<T> {
  if (offline) return demo();
  try {
    return await live();
  } catch (cause) {
    if (!import.meta.env.DEV || !unreachable(cause)) throw cause;
    offline = true;
    console.warn("[api] gateway unreachable — serving offline demo data");
    return demo();
  }
}

function message(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "error" in body) {
    return (body as { error?: { message?: string } }).error?.message ?? fallback;
  }
  return fallback;
}

async function renew() {
  const refresh_token = localStorage.getItem(REFRESH);
  if (!refresh_token) return false;
  const response = await fetch(`${API_BASE}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token }) });
  if (!response.ok) { clearSession(); return false; }
  const tokens = await response.json() as Tokens;
  localStorage.setItem(ACCESS, tokens.access_token);
  localStorage.setItem(REFRESH, tokens.refresh_token);
  return true;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  const token = localStorage.getItem(ACCESS);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (response.status === 401 && retry && await renew()) return request<T>(path, init, false);
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(message(body, `Request failed (${response.status})`), response.status);
  return body as T;
}

/**
 * fetch() can't surface upload progress on the request body, so the video
 * upload (the one transfer worth showing a real bar for) goes over XHR
 * instead. Mirrors request()'s auth header and error shape, minus the
 * 401-retry dance — not worth the complexity for a form the user is
 * actively watching.
 */
function xhrUpload<T>(path: string, form: FormData, onProgress?: (loaded: number, total: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}${path}`);
    const token = localStorage.getItem(ACCESS);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded, event.total);
    };
    xhr.onload = () => {
      let body: unknown = null;
      try { body = JSON.parse(xhr.responseText); } catch { /* empty/non-JSON body */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(body as T);
      else reject(new ApiError(message(body, `Request failed (${xhr.status})`), xhr.status));
    };
    xhr.onerror = () => reject(new TypeError("Failed to fetch"));
    xhr.send(form);
  });
}

function toUser(u: { id: string; email: string; name: string; role: User["role"]; dealer_id: string | null }): User {
  return { id: u.id, email: u.email, name: u.name, role: u.role, dealership: u.dealer_id ? "BMW of Lahore" : "BMW Technician Network" };
}

function toInspection(i: BInspection): Inspection {
  const customer: Inspection["customer"] = { id: i.vehicle?.customer?.id ?? "unknown", name: i.vehicle?.customer?.name ?? "Not available", email: i.vehicle?.customer?.email ?? "", phone: i.vehicle?.customer?.phone ?? "" };
  return { id: i.id, technician_id: i.technician_id ?? "", status: i.status, service_type: i.service_type ?? "General inspection", created_at: i.created_at, updated_at: i.updated_at ?? i.created_at, can_send: i.can_send, latest_score: i.latest_score ?? undefined, latest_video_id: i.latest_video_id ?? undefined, attempt_count: i.attempt_count, customer, vehicle: { id: i.vehicle?.id ?? "unknown", make: "BMW", model: i.vehicle?.model ?? "Vehicle", year: i.vehicle?.year ?? new Date().getFullYear(), vin: i.vehicle?.vin ?? "Not available", color: "Not available", mileage: 0, customer }, service_history: (i.history ?? []).map(h => ({ date: h.created_at, service_type: h.service_type ?? "Inspection", technician: "BMW Technician", notes: h.notes ?? (h.final_score == null ? "" : `Final score: ${h.final_score}%`), mileage: 0 })) };
}

export function login(email: string, password: string) {
  return withFallback(
    async () => {
      const tokens = await request<Tokens>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem(ACCESS, tokens.access_token); localStorage.setItem(REFRESH, tokens.refresh_token);
      return getMe();
    },
    () => {
      const account = mock.login(email, password);
      localStorage.setItem(ACCESS, "offline-demo"); localStorage.setItem(REFRESH, "offline-demo");
      return account;
    },
  );
}
export const getMe = () => withFallback(
  async () => toUser(await request<{ id: string; email: string; name: string; role: User["role"]; dealer_id: string | null }>("/auth/me")),
  () => mock.getMe(),
);
export function hasSession() { return Boolean(localStorage.getItem(ACCESS) || localStorage.getItem(REFRESH)); }
export function clearSession() { localStorage.removeItem(ACCESS); localStorage.removeItem(REFRESH); mock.signOut(); }

export const getInspections = (technicianId?: string) => withFallback(
  async () => { const q = technicianId ? `?technician_id=${encodeURIComponent(technicianId)}&limit=100` : "?limit=100"; return (await request<{ items: BInspection[] }>(`/inspections${q}`)).items.map(toInspection); },
  () => mock.getInspections(technicianId),
);
export const getInspection = (id: string) => withFallback(
  async () => toInspection(await request<BInspection>(`/inspections/${id}`)),
  () => mock.getInspection(id),
);
export const getInspectionVideos = (id: string) => withFallback<Video[]>(
  async () => (await request<BVideo[]>(`/inspections/${id}/videos`)).map(v => ({ ...v, overall_score: v.overall_score ?? undefined, filename: v.filename ?? `Attempt ${v.id.slice(0, 8)}` })),
  () => mock.getInspectionVideos(id),
);
export const uploadVideo = (id: string, file: File, serviceType: string, onProgress?: (loaded: number, total: number) => void) => withFallback<{ id: string }>(
  () => { const data = new FormData(); data.append("file", file); data.append("service_type", serviceType); return xhrUpload<BVideo>(`/inspections/${id}/videos`, data, onProgress); },
  () => mock.uploadVideo(id, file),
);
export const getVideo = (id: string) => withFallback<{ id: string; status: Video["status"]; grading_error?: string | null }>(
  () => request<BVideo & { grading_error?: string | null }>(`/videos/${id}`),
  () => mock.getVideo(id),
);
type BCriterion = { criterion: string; label: string | null; score: number; passed: boolean | null; guidance: string | null; to_reach?: string | null; evidence?: string[] };
type BChapter = { id: string; start_seconds: number; end_seconds: number; title: string; description: string | null };
type BScore = { video_id: string; inspection_id: string; overall_score: number | null; threshold_percent: number; can_send: boolean; feedback: string | null; criteria: BCriterion[]; chapters?: BChapter[]; video_url?: string | null };

export const getScore = (id: string) => withFallback<Score>(
  async () => {
    const s = await request<BScore>(`/videos/${id}/score`);
    return {
      video_id: s.video_id,
      inspection_id: s.inspection_id,
      overall_score: s.overall_score ?? 0,
      threshold_percent: s.threshold_percent,
      can_send: s.can_send,
      feedback: s.feedback ?? "Grading is still in progress.",
      criteria: s.criteria.map(c => ({ key: c.criterion, display_name: c.label ?? c.criterion.replace(/_/g, " "), score: c.score, passed: c.passed, guidance: c.guidance, to_reach: c.to_reach ?? null, evidence: c.evidence ?? [] })),
      chapters: s.chapters ?? [],
      video_url: s.video_url ?? null,
    };
  },
  () => mock.getScore(id),
);
export const sendInspection = (inspectionId: string, videoId?: string) => withFallback<void>(
  async () => { await request(`/inspections/${inspectionId}/send${videoId ? `?video_id=${encodeURIComponent(videoId)}` : ""}`, { method: "POST" }); },
  () => mock.sendInspection(inspectionId),
);
export const getConfig = () => withFallback<Config>(
  async () => { const c = await request<{ grading_threshold_percent: number; max_video_bytes: number; allowed_video_types: string[] }>("/config"); return { grading_threshold_percent: c.grading_threshold_percent, max_upload_bytes: c.max_video_bytes, max_upload_mb: Math.round(c.max_video_bytes / 1024 / 1024), accepted_video_types: c.allowed_video_types }; },
  () => mock.getConfig(),
);
export const getPersonalAnalytics = (user: User, technicianId?: string) => withFallback<PersonalAnalytics>(
  async () => { const q = technicianId ? `?technician_id=${encodeURIComponent(technicianId)}` : ""; const d = await request<{ technician_id: string; videos_graded: number; average_score: number | null; first_attempt_pass_rate: number | null; trend: Array<{ period: string; average_score: number | null }> }>(`/analytics${q}`); return { technician_id: d.technician_id, technician_name: user.name, first_attempt_pass_rate: d.first_attempt_pass_rate ?? 0, average_score: d.average_score ?? 0, total_videos: d.videos_graded, total_passed: Math.round(d.videos_graded * (d.first_attempt_pass_rate ?? 0) / 100), score_trend: d.trend.map((p, n) => ({ date: p.period, score: p.average_score ?? 0, passed: (p.average_score ?? 0) >= 80, inspection_id: `trend-${n}` })) }; },
  () => mock.getPersonalAnalytics(user, technicianId),
);
export const getTeamAnalytics = () => withFallback<TeamAnalytics>(
  async () => { const d = await request<{ technician_count: number; average_score: number | null; first_attempt_pass_rate: number | null; per_technician: Array<{ technician_id: string; name: string | null; videos_graded: number; average_score: number | null; first_attempt_pass_rate: number | null }> }>("/analytics/team"); return { dealership: "BMW of Lahore", overall_pass_rate: d.first_attempt_pass_rate ?? 0, overall_average_score: d.average_score ?? 0, members: d.per_technician.map(t => ({ technician_id: t.technician_id, technician_name: t.name ?? "Technician", first_attempt_pass_rate: t.first_attempt_pass_rate ?? 0, average_score: t.average_score ?? 0, total_videos: t.videos_graded })) }; },
  () => mock.getTeamAnalytics(),
);
