import type { Config, Inspection, PersonalAnalytics, Score, TeamAnalytics, User, Video } from "./types";

export const MOCK_USERS: User[] = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Ali Raza", email: "ali.raza@bmwdealer.test", role: "technician", dealership: "BMW of Lahore" },
  { id: "11111111-1111-1111-1111-11111111111a", name: "Marco Manager", email: "manager@bmwdealer.test", role: "manager", dealership: "BMW of Lahore" },
  { id: "11111111-1111-1111-1111-11111111111b", name: "Ada Admin", email: "admin@bmwdealer.test", role: "admin", dealership: "BMW of Lahore" },
];

const customer = { id: "c-001", name: "Ayesha Khan", email: "ayesha@example.com", phone: "+92 300 555 0182" };
const secondCustomer = { id: "c-002", name: "Usman Malik", email: "usman@example.com", phone: "+92 301 555 0104" };

export const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: "44444444-4444-4444-4444-444444444441",
    vehicle: { id: "v-001", make: "BMW", model: "X5 xDrive40i", year: 2025, vin: "WBA11EU09S9X50124", color: "Alpine White", mileage: 12840, customer },
    customer,
    status: "queued",
    service_type: "Scheduled maintenance",
    created_at: "2026-08-26T05:30:00Z",
    updated_at: "2026-08-26T05:30:00Z",
    technician_id: MOCK_USERS[0].id,
    can_send: false,
    attempt_count: 0,
    service_history: [{ date: "2026-03-12", service_type: "Oil service", technician: "Ali Raza", notes: "Routine service completed", mileage: 8200 }],
  },
  {
    id: "44444444-4444-4444-4444-444444444442",
    vehicle: { id: "v-002", make: "BMW", model: "330i M Sport", year: 2024, vin: "WBA5R1C08RFM22018", color: "Portimao Blue", mileage: 24110, customer: secondCustomer },
    customer: secondCustomer,
    status: "needs_revision",
    service_type: "Brake inspection",
    created_at: "2026-08-25T09:10:00Z",
    updated_at: "2026-08-25T10:40:00Z",
    technician_id: MOCK_USERS[0].id,
    can_send: false,
    latest_score: 68,
    latest_video_id: "55555555-5555-5555-5555-555555555551",
    attempt_count: 1,
    service_history: [{ date: "2025-12-04", service_type: "Tyre rotation", technician: "Hassan Ali", notes: "Tyres rotated and pressures reset", mileage: 17120 }],
  },
  {
    id: "44444444-4444-4444-4444-444444444443",
    vehicle: { id: "v-003", make: "BMW", model: "iX xDrive50", year: 2025, vin: "WB523CF06SCP90132", color: "Sophisto Grey", mileage: 6750, customer },
    customer,
    status: "passed",
    service_type: "EV health check",
    created_at: "2026-08-24T07:45:00Z",
    updated_at: "2026-08-24T08:35:00Z",
    technician_id: MOCK_USERS[0].id,
    can_send: true,
    latest_score: 92,
    latest_video_id: "55555555-5555-5555-5555-555555555552",
    attempt_count: 1,
    service_history: [],
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    vehicle: { id: "v-004", make: "BMW", model: "X1 sDrive18i", year: 2023, vin: "WBA73AA02P5V41087", color: "Black Sapphire", mileage: 31800, customer: secondCustomer },
    customer: secondCustomer,
    status: "sent",
    service_type: "Annual inspection",
    created_at: "2026-08-22T06:20:00Z",
    updated_at: "2026-08-22T09:15:00Z",
    technician_id: MOCK_USERS[0].id,
    can_send: true,
    latest_score: 87,
    latest_video_id: "55555555-5555-5555-5555-555555555553",
    attempt_count: 2,
    service_history: [],
  },
];

export const MOCK_VIDEOS: Record<string, Video[]> = {
  [MOCK_INSPECTIONS[1].id]: [{ id: "55555555-5555-5555-5555-555555555551", inspection_id: MOCK_INSPECTIONS[1].id, status: "graded", uploaded_at: "2026-08-25T10:32:00Z", filename: "330i_walkaround_attempt_1.mp4", can_send: false, duration_seconds: 148 }],
  [MOCK_INSPECTIONS[2].id]: [{ id: "55555555-5555-5555-5555-555555555552", inspection_id: MOCK_INSPECTIONS[2].id, status: "graded", uploaded_at: "2026-08-24T08:21:00Z", filename: "ix_walkaround.mp4", can_send: true, duration_seconds: 176 }],
  [MOCK_INSPECTIONS[3].id]: [{ id: "55555555-5555-5555-5555-555555555553", inspection_id: MOCK_INSPECTIONS[3].id, status: "graded", uploaded_at: "2026-08-22T08:55:00Z", filename: "x1_final_walkaround.mp4", can_send: true, duration_seconds: 164 }],
};

const criteria = (passing: boolean) => [
  { key: "coverage", display_name: "Vehicle coverage", score: passing ? 94 : 72, passed: passing, guidance: passing ? "All required exterior angles are clearly covered." : "Include a steady rear three-quarter view and both wheel arches." },
  { key: "stability", display_name: "Camera stability", score: passing ? 90 : 61, passed: passing, guidance: passing ? "Camera movement is smooth and easy to follow." : "Move more slowly and avoid rapid direction changes around the vehicle." },
  { key: "lighting", display_name: "Lighting and visibility", score: passing ? 93 : 75, passed: passing, guidance: passing ? "Lighting is consistent with good surface detail." : "Reposition the vehicle to reduce glare on the passenger side." },
  { key: "narration", display_name: "Narration clarity", score: passing ? 91 : 66, passed: passing, guidance: passing ? "Service findings are explained clearly." : "State the service outcome and identify visible defects more explicitly." },
];

export const MOCK_SCORES: Record<string, Score> = {
  "55555555-5555-5555-5555-555555555551": { video_id: "55555555-5555-5555-5555-555555555551", inspection_id: MOCK_INSPECTIONS[1].id, overall_score: 68, threshold_percent: 80, can_send: false, feedback: "The walkaround needs steadier movement and more complete exterior coverage before it can be sent.", criteria: criteria(false) },
  "55555555-5555-5555-5555-555555555552": { video_id: "55555555-5555-5555-5555-555555555552", inspection_id: MOCK_INSPECTIONS[2].id, overall_score: 92, threshold_percent: 80, can_send: true, feedback: "A clear, complete walkaround with strong narration and consistent framing.", criteria: criteria(true) },
  "55555555-5555-5555-5555-555555555553": { video_id: "55555555-5555-5555-5555-555555555553", inspection_id: MOCK_INSPECTIONS[3].id, overall_score: 87, threshold_percent: 80, can_send: true, feedback: "The final attempt meets the customer delivery standard.", criteria: criteria(true) },
};

export const MOCK_CONFIG: Config = { grading_threshold_percent: 80, max_upload_bytes: 500 * 1024 * 1024, max_upload_mb: 500, accepted_video_types: ["video/mp4", "video/quicktime", "video/x-msvideo"] };

export const MOCK_PERSONAL_ANALYTICS: PersonalAnalytics = {
  technician_id: MOCK_USERS[0].id,
  technician_name: MOCK_USERS[0].name,
  first_attempt_pass_rate: 78,
  average_score: 84,
  total_videos: 34,
  total_passed: 28,
  score_trend: [72, 83, 79, 88, 91, 86, 94, 89].map((score, index) => ({ date: `2026-08-${String(8 + index * 2).padStart(2, "0")}T08:00:00Z`, score, passed: score >= 80, inspection_id: `trend-${index}` })),
};

export const MOCK_TEAM_ANALYTICS: TeamAnalytics = {
  dealership: "BMW of Lahore",
  overall_pass_rate: 81,
  overall_average_score: 85,
  members: [
    { technician_id: MOCK_USERS[0].id, technician_name: "Ali Raza", first_attempt_pass_rate: 78, average_score: 84, total_videos: 34 },
    { technician_id: "tech-2", technician_name: "Hassan Ali", first_attempt_pass_rate: 86, average_score: 89, total_videos: 31 },
    { technician_id: "tech-3", technician_name: "Sara Ahmed", first_attempt_pass_rate: 82, average_score: 86, total_videos: 29 },
  ],
};
