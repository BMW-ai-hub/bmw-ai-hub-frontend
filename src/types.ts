export interface User {
  id: string;
  name: string;
  email: string;
  role: "technician" | "manager" | "admin";
  dealership: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  color: string;
  mileage: number;
  customer: Customer;
}

export type InspectionStatus = "queued" | "in_progress" | "needs_revision" | "passed" | "sent";
export type VideoStatus = "uploading" | "processing" | "graded" | "failed";

export interface ServiceHistoryEntry {
  date: string;
  service_type: string;
  technician: string;
  notes: string;
  mileage: number;
}

export interface Inspection {
  id: string;
  vehicle: Vehicle;
  customer: Customer;
  status: InspectionStatus;
  service_type: string;
  created_at: string;
  updated_at: string;
  technician_id: string;
  can_send: boolean;
  latest_score?: number;
  latest_video_id?: string;
  attempt_count: number;
  service_history: ServiceHistoryEntry[];
  /** Local asset path for the past-inspections list — presentation only, not from the API. */
  thumbnail?: string;
}

export interface Video {
  id: string;
  inspection_id: string;
  status: VideoStatus;
  uploaded_at: string;
  filename: string;
  can_send: boolean;
  overall_score?: number;
  duration_seconds?: number;
}

export interface CriterionScore {
  key: string;
  display_name: string;
  score: number;
  passed: boolean | null;
  guidance: string | null;
}

export interface Score {
  video_id: string;
  inspection_id: string;
  overall_score: number;
  threshold_percent: number;
  can_send: boolean;
  feedback: string;
  criteria: CriterionScore[];
}

export interface Config {
  grading_threshold_percent: number;
  max_upload_bytes: number;
  max_upload_mb: number;
  accepted_video_types: string[];
}

export interface AnalyticsDataPoint {
  date: string;
  score: number;
  passed: boolean;
  inspection_id: string;
}

export interface PersonalAnalytics {
  technician_id: string;
  technician_name: string;
  first_attempt_pass_rate: number;
  average_score: number;
  total_videos: number;
  total_passed: number;
  score_trend: AnalyticsDataPoint[];
}

export interface TeamMemberStat {
  technician_id: string;
  technician_name: string;
  first_attempt_pass_rate: number;
  average_score: number;
  total_videos: number;
}

export interface TeamAnalytics {
  dealership: string;
  overall_pass_rate: number;
  overall_average_score: number;
  members: TeamMemberStat[];
}

export interface VideoAnalysisStats {
  duration_seconds: number;
  analysis_status: string;
  strengths: number;
  areas_to_improve: number;
}

/** Seconds rather than formatted strings — ready to drive a real video player's currentTime later. */
export interface VideoTimelineEntry {
  start_seconds: number;
  end_seconds: number;
  title: string;
  description: string;
  tags: string[];
  meets_expectation: boolean;
}

export interface CriterionDetail {
  to_reach_100: string;
  evidence?: string[];
}

/**
 * A still frame pulled from the walkaround video, tied to a moment in the
 * timeline. `image` is left unset until a real extracted frame (or an
 * approved BMW asset) is available — the gallery renders a neutral
 * placeholder in the meantime rather than an unofficial stock photo.
 */
export interface EvidenceItem {
  image?: string;
  label: string;
  timestamp_seconds: number;
}

export interface CustomerPreviewItem {
  label: string;
  detail: string;
}
