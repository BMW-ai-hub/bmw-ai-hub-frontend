import type { Inspection, Video, Score, Config, PersonalAnalytics, TeamAnalytics, User, VideoAnalysisStats, VideoTimelineEntry, CriterionDetail, EvidenceItem, CustomerPreviewItem } from "./types";

// Temporary stock photography — see src/assets/IMAGE_CREDITS.md. Swap these
// files for BMW-approved assets when available; nothing else needs to change.
import workshopWide from "./assets/photos/workshop-wide.jpg";
import workshopBay from "./assets/photos/workshop-bay.jpg";
import technicianInspecting from "./assets/photos/technician-inspecting.jpg";
import technicianEngine from "./assets/photos/technician-engine.jpg";
import engineBay from "./assets/photos/engine-bay.jpg";
import underbodyLift from "./assets/photos/underbody-lift.jpg";
import tireTread from "./assets/photos/tire-tread.jpg";
import brakePad from "./assets/photos/brake-pad.jpg";
import mobileRecording from "./assets/photos/mobile-recording.jpg";
import keyHandoff from "./assets/photos/key-handoff.jpg";

export const PHOTOS = {
  workshopWide,
  workshopBay,
  technicianInspecting,
  technicianEngine,
  engineBay,
  underbodyLift,
  tireTread,
  brakePad,
  mobileRecording,
  keyHandoff,
};

export const MOCK_USERS: User[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Ali Raza",
    email: "ali.raza@bmwdealer.test",
    role: "technician",
    dealership: "BMW Dealership",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Sara Khan",
    email: "manager@bmwdealer.test",
    role: "manager",
    dealership: "BMW Dealership",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Zain Ahmed",
    email: "admin@bmwdealer.test",
    role: "admin",
    dealership: "BMW Dealership",
  },
];

export const MOCK_CONFIG: Config = {
  grading_threshold_percent: 80,
  max_upload_bytes: 524288000,
  max_upload_mb: 500,
  accepted_video_types: ["video/mp4", "video/quicktime", "video/x-msvideo"],
};

export const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: "44444444-4444-4444-4444-444444444441",
    thumbnail: PHOTOS.technicianInspecting,
    status: "queued",
    service_type: "Annual Service A",
    created_at: "2026-08-26T08:15:00Z",
    updated_at: "2026-08-26T08:15:00Z",
    technician_id: "11111111-1111-1111-1111-111111111111",
    can_send: false,
    attempt_count: 0,
    customer: {
      id: "cc111111-0000-0000-0000-000000000001",
      name: "Tariq Mehmood",
      email: "tariq.mehmood@email.com",
      phone: "+92-300-1234567",
    },
    vehicle: {
      id: "vv111111-0000-0000-0000-000000000001",
      make: "BMW",
      model: "3 Series (G20)",
      year: 2023,
      vin: "WBA8E9G52JNU12345",
      color: "Alpine White",
      mileage: 14280,
      customer: {
        id: "cc111111-0000-0000-0000-000000000001",
        name: "Tariq Mehmood",
        email: "tariq.mehmood@email.com",
        phone: "+92-300-1234567",
      },
    },
    service_history: [
      {
        date: "2025-08-10",
        service_type: "Annual Service A",
        technician: "Hassan Iqbal",
        notes: "Oil change, filter replacement, CBS reset completed.",
        mileage: 7100,
      },
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444442",
    thumbnail: PHOTOS.underbodyLift,
    status: "needs_revision",
    service_type: "Brake Inspection + DSC Check",
    created_at: "2026-08-25T10:30:00Z",
    updated_at: "2026-08-25T14:22:00Z",
    technician_id: "11111111-1111-1111-1111-111111111111",
    can_send: false,
    latest_score: 62,
    latest_video_id: "55555555-5555-5555-5555-555555555551",
    attempt_count: 1,
    customer: {
      id: "cc222222-0000-0000-0000-000000000002",
      name: "Ayesha Siddiqui",
      email: "ayesha.s@email.com",
      phone: "+92-321-9876543",
    },
    vehicle: {
      id: "vv222222-0000-0000-0000-000000000002",
      make: "BMW",
      model: "5 Series (G60)",
      year: 2024,
      vin: "WBA5E7C51KD789012",
      color: "Mineral Grey Metallic",
      mileage: 8920,
      customer: {
        id: "cc222222-0000-0000-0000-000000000002",
        name: "Ayesha Siddiqui",
        email: "ayesha.s@email.com",
        phone: "+92-321-9876543",
      },
    },
    service_history: [
      {
        date: "2025-11-20",
        service_type: "Vehicle Handover Inspection",
        technician: "Ali Raza",
        notes: "Pre-delivery check passed. All fluids topped, tire pressures set.",
        mileage: 0,
      },
      {
        date: "2026-02-14",
        service_type: "Annual Service A",
        technician: "Ali Raza",
        notes: "Routine service completed. CBS indicator reset.",
        mileage: 4320,
      },
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444443",
    thumbnail: PHOTOS.workshopBay,
    status: "passed",
    service_type: "CPO Pre-Sale Inspection",
    created_at: "2026-08-24T09:00:00Z",
    updated_at: "2026-08-24T16:45:00Z",
    technician_id: "11111111-1111-1111-1111-111111111111",
    can_send: true,
    latest_score: 88,
    latest_video_id: "55555555-5555-5555-5555-555555555552",
    attempt_count: 1,
    customer: {
      id: "cc333333-0000-0000-0000-000000000003",
      name: "Bilal Chaudhry",
      email: "bilal.c@email.com",
      phone: "+92-333-5554433",
    },
    vehicle: {
      id: "vv333333-0000-0000-0000-000000000003",
      make: "BMW",
      model: "X5 xDrive40i (G05)",
      year: 2022,
      vin: "5UXCR6C08N9P23456",
      color: "Carbon Black Metallic",
      mileage: 31540,
      customer: {
        id: "cc333333-0000-0000-0000-000000000003",
        name: "Bilal Chaudhry",
        email: "bilal.c@email.com",
        phone: "+92-333-5554433",
      },
    },
    service_history: [
      {
        date: "2023-08-01",
        service_type: "Annual Service A",
        technician: "Hassan Iqbal",
        notes: "All CBS items reset. Tire tread 7mm all corners.",
        mileage: 11200,
      },
      {
        date: "2024-07-15",
        service_type: "Annual Service B",
        technician: "Ali Raza",
        notes: "Spark plugs replaced. Brake fluid flushed. DSC calibrated.",
        mileage: 21400,
      },
      {
        date: "2025-09-03",
        service_type: "Brake Pad Replacement — Front Axle",
        technician: "Ali Raza",
        notes: "Front pads replaced (worn to 3mm). Rotors within spec at 28mm.",
        mileage: 28700,
      },
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    thumbnail: PHOTOS.keyHandoff,
    status: "sent",
    service_type: "Annual Service B",
    created_at: "2026-08-23T11:00:00Z",
    updated_at: "2026-08-23T17:30:00Z",
    technician_id: "11111111-1111-1111-1111-111111111111",
    can_send: false,
    latest_score: 91,
    latest_video_id: "55555555-5555-5555-5555-555555555553",
    attempt_count: 1,
    customer: {
      id: "cc444444-0000-0000-0000-000000000004",
      name: "Nadia Hussain",
      email: "nadia.h@email.com",
      phone: "+92-300-7778889",
    },
    vehicle: {
      id: "vv444444-0000-0000-0000-000000000004",
      make: "BMW",
      model: "iX3 (G08)",
      year: 2025,
      vin: "WBY73GF09RCL34567",
      color: "Phytonic Blue Metallic",
      mileage: 6450,
      customer: {
        id: "cc444444-0000-0000-0000-000000000004",
        name: "Nadia Hussain",
        email: "nadia.h@email.com",
        phone: "+92-300-7778889",
      },
    },
    service_history: [],
  },
  {
    id: "44444444-4444-4444-4444-444444444445",
    thumbnail: PHOTOS.technicianEngine,
    status: "in_progress",
    service_type: "Wheel Assembly & Tyre Check",
    created_at: "2026-08-26T09:45:00Z",
    updated_at: "2026-08-26T10:10:00Z",
    technician_id: "11111111-1111-1111-1111-111111111111",
    can_send: false,
    attempt_count: 0,
    customer: {
      id: "cc555555-0000-0000-0000-000000000005",
      name: "Usman Farooq",
      email: "usman.f@email.com",
      phone: "+92-312-1112223",
    },
    vehicle: {
      id: "vv555555-0000-0000-0000-000000000005",
      make: "BMW",
      model: "M3 Competition (G80)",
      year: 2024,
      vin: "WBS43EF0XRFGabcde",
      color: "Sao Paulo Yellow",
      mileage: 5120,
      customer: {
        id: "cc555555-0000-0000-0000-000000000005",
        name: "Usman Farooq",
        email: "usman.f@email.com",
        phone: "+92-312-1112223",
      },
    },
    service_history: [],
  },
  {
    id: "44444444-4444-4444-4444-444444444446",
    thumbnail: PHOTOS.workshopWide,
    status: "passed",
    service_type: "Annual Service",
    created_at: "2026-08-27T09:10:00Z",
    updated_at: "2026-08-27T09:10:00Z",
    technician_id: "11111111-1111-1111-1111-111111111111",
    can_send: true,
    latest_score: 88,
    attempt_count: 1,
    customer: {
      id: "cc666666-0000-0000-0000-000000000006",
      name: "Fahad Rashid",
      email: "fahad.rashid@email.com",
      phone: "+92-301-2223344",
    },
    vehicle: {
      id: "vv666666-0000-0000-0000-000000000006",
      make: "BMW",
      model: "i4 eDrive40 (G26)",
      year: 2024,
      vin: "WBY63AW07RFH67890",
      color: "Portimao Blue Metallic",
      mileage: 9840,
      customer: {
        id: "cc666666-0000-0000-0000-000000000006",
        name: "Fahad Rashid",
        email: "fahad.rashid@email.com",
        phone: "+92-301-2223344",
      },
    },
    service_history: [],
  },
  {
    id: "44444444-4444-4444-4444-444444444447",
    thumbnail: PHOTOS.workshopWide,
    status: "needs_revision",
    service_type: "Brake Inspection",
    created_at: "2026-08-18T11:30:00Z",
    updated_at: "2026-08-18T11:30:00Z",
    technician_id: "11111111-1111-1111-1111-111111111111",
    can_send: false,
    latest_score: 76,
    attempt_count: 1,
    customer: {
      id: "cc777777-0000-0000-0000-000000000007",
      name: "Mehreen Aslam",
      email: "mehreen.aslam@email.com",
      phone: "+92-302-3334455",
    },
    vehicle: {
      id: "vv777777-0000-0000-0000-000000000007",
      make: "BMW",
      model: "X5 xDrive40i (G05)",
      year: 2023,
      vin: "5UXCR6C05P9L34567",
      color: "Skyscraper Grey",
      mileage: 22140,
      customer: {
        id: "cc777777-0000-0000-0000-000000000007",
        name: "Mehreen Aslam",
        email: "mehreen.aslam@email.com",
        phone: "+92-302-3334455",
      },
    },
    service_history: [],
  },
  {
    id: "44444444-4444-4444-4444-444444444448",
    thumbnail: PHOTOS.technicianInspecting,
    status: "passed",
    service_type: "Multi-point Inspection",
    created_at: "2026-08-11T08:45:00Z",
    updated_at: "2026-08-11T08:45:00Z",
    technician_id: "11111111-1111-1111-1111-111111111111",
    can_send: true,
    latest_score: 94,
    attempt_count: 1,
    customer: {
      id: "cc888888-0000-0000-0000-000000000008",
      name: "Imran Sheikh",
      email: "imran.sheikh@email.com",
      phone: "+92-303-4445566",
    },
    vehicle: {
      id: "vv888888-0000-0000-0000-000000000008",
      make: "BMW",
      model: "3 Series (G20)",
      year: 2025,
      vin: "WBA8E9G59SNU78901",
      color: "Alpine White",
      mileage: 3120,
      customer: {
        id: "cc888888-0000-0000-0000-000000000008",
        name: "Imran Sheikh",
        email: "imran.sheikh@email.com",
        phone: "+92-303-4445566",
      },
    },
    service_history: [],
  },
  {
    id: "44444444-4444-4444-4444-444444444449",
    thumbnail: PHOTOS.underbodyLift,
    status: "passed",
    service_type: "Tire & Suspension Inspection",
    created_at: "2026-07-29T13:20:00Z",
    updated_at: "2026-07-29T13:20:00Z",
    technician_id: "11111111-1111-1111-1111-111111111111",
    can_send: true,
    latest_score: 81,
    attempt_count: 1,
    customer: {
      id: "cc999999-0000-0000-0000-000000000009",
      name: "Sana Malik",
      email: "sana.malik@email.com",
      phone: "+92-304-5556677",
    },
    vehicle: {
      id: "vv999999-0000-0000-0000-000000000009",
      make: "BMW",
      model: "X3 xDrive30i (G01)",
      year: 2022,
      vin: "5UXTY5C05N9M45678",
      color: "Black Sapphire Metallic",
      mileage: 27350,
      customer: {
        id: "cc999999-0000-0000-0000-000000000009",
        name: "Sana Malik",
        email: "sana.malik@email.com",
        phone: "+92-304-5556677",
      },
    },
    service_history: [],
  },
  {
    id: "44444444-4444-4444-4444-444444444450",
    thumbnail: PHOTOS.technicianEngine,
    status: "needs_revision",
    service_type: "Annual Service",
    created_at: "2026-07-19T10:05:00Z",
    updated_at: "2026-07-19T10:05:00Z",
    technician_id: "11111111-1111-1111-1111-111111111111",
    can_send: false,
    latest_score: 72,
    attempt_count: 1,
    customer: {
      id: "cc101010-0000-0000-0000-000000000010",
      name: "Waqas Anjum",
      email: "waqas.anjum@email.com",
      phone: "+92-305-6667788",
    },
    vehicle: {
      id: "vv101010-0000-0000-0000-000000000010",
      make: "BMW",
      model: "5 Series (G60)",
      year: 2024,
      vin: "WBA5E7C58KD901234",
      color: "Mineral White Metallic",
      mileage: 11760,
      customer: {
        id: "cc101010-0000-0000-0000-000000000010",
        name: "Waqas Anjum",
        email: "waqas.anjum@email.com",
        phone: "+92-305-6667788",
      },
    },
    service_history: [],
  },
];

export const MOCK_VIDEOS: Record<string, Video[]> = {
  "44444444-4444-4444-4444-444444444442": [
    {
      id: "55555555-5555-5555-5555-555555555551",
      inspection_id: "44444444-4444-4444-4444-444444444442",
      status: "graded",
      uploaded_at: "2026-08-25T13:55:00Z",
      filename: "inspection_5series_aug25.mp4",
      can_send: false,
      duration_seconds: 184,
    },
  ],
  "44444444-4444-4444-4444-444444444443": [
    {
      id: "55555555-5555-5555-5555-555555555552",
      inspection_id: "44444444-4444-4444-4444-444444444443",
      status: "graded",
      uploaded_at: "2026-08-24T15:50:00Z",
      filename: "inspection_x5_cpo_aug24.mp4",
      can_send: true,
      duration_seconds: 271,
    },
  ],
  "44444444-4444-4444-4444-444444444444": [
    {
      id: "55555555-5555-5555-5555-555555555553",
      inspection_id: "44444444-4444-4444-4444-444444444444",
      status: "graded",
      uploaded_at: "2026-08-23T16:30:00Z",
      filename: "inspection_ix3_aug23.mp4",
      can_send: false,
      duration_seconds: 310,
    },
  ],
};

const CRITERIA_REVISION: Score["criteria"] = [
  {
    key: "completeness",
    display_name: "Completeness",
    score: 55,
    passed: false,
    guidance:
      "Several CPO checklist sections were skipped. Wheel assembly and interior sections were not addressed. Ensure you cover all relevant inspection points for a Brake + DSC service.",
  },
  {
    key: "accuracy_of_terminology",
    display_name: "Accuracy of Terminology",
    score: 70,
    passed: false,
    guidance:
      "Referred to the 'brake caliper' generically. Use BMW-specific designations where applicable. DSC was mentioned but not described in context of the fault.",
  },
  {
    key: "clear_finding_shown",
    display_name: "Clear Finding Shown to Customer",
    score: 60,
    passed: false,
    guidance:
      "Brake pad thickness was stated verbally as 'low' but the gauge reading was not shown on camera. BMW requires a visible measurement — show the actual millimetre reading against the 5mm minimum threshold.",
  },
  {
    key: "explanation_of_impact",
    display_name: "Explanation of Impact",
    score: 50,
    passed: false,
    guidance:
      "The DSC fault code was mentioned but its safety implication was not explained. Customers need to understand why a DSC fault affects their safety, not just that it exists.",
  },
  {
    key: "recommendation_clarity",
    display_name: "Recommendation Clarity",
    score: 65,
    passed: false,
    guidance:
      'The next action for the DSC fault was stated as "might need looking at." Map your recommendation to a clear BMW Recondition action: Repair, Adjust, or Replace.',
  },
  {
    key: "tone_and_professionalism",
    display_name: "Tone and Professionalism",
    score: 75,
    passed: true,
    guidance: "Pacing was calm and measured throughout. Good work maintaining professionalism.",
  },
  {
    key: "brand_voice_compliance",
    display_name: "Brand Voice Compliance",
    score: 60,
    passed: false,
    guidance:
      "Opening did not include vehicle model and reason for visit. Closing lacked a summary and thank-you. Follow the BMW walkaround structure: intro → findings → summary → sign-off.",
  },
];

const CRITERIA_PASSED: Score["criteria"] = [
  {
    key: "completeness",
    display_name: "Completeness",
    score: 90,
    passed: true,
    guidance:
      "Covered all CPO checklist sections comprehensively. Wheel assembly, body condition, mechanical, and interior were all addressed in sequence.",
  },
  {
    key: "accuracy_of_terminology",
    display_name: "Accuracy of Terminology",
    score: 95,
    passed: true,
    guidance: "Excellent use of BMW-specific terminology throughout. A-pillar, rocker panel, CBS indicator all correctly named.",
  },
  {
    key: "clear_finding_shown",
    display_name: "Clear Finding Shown to Customer",
    score: 90,
    passed: true,
    guidance:
      "Tread depth gauge readings clearly shown on camera (8.2mm FL, 8.1mm FR, 7.9mm RL, 8.0mm RR). Brake rotor thickness measured on-screen. Visual evidence matched verbal claims throughout.",
  },
  {
    key: "explanation_of_impact",
    display_name: "Explanation of Impact",
    score: 85,
    passed: true,
    guidance:
      "Safety implications explained well for all findings. Minor improvement: the minor paint chip on the B-pillar explanation could have been more specific about CPO eligibility standards.",
  },
  {
    key: "recommendation_clarity",
    display_name: "Recommendation Clarity",
    score: 90,
    passed: true,
    guidance: "All recommendations map cleanly to BMW Recondition actions. Replace, Monitor, and Fine conclusions were clear and actionable.",
  },
  {
    key: "tone_and_professionalism",
    display_name: "Tone and Professionalism",
    score: 85,
    passed: true,
    guidance: "Professional tone maintained throughout. Findings delivered calmly and factually. Excellent pacing.",
  },
  {
    key: "brand_voice_compliance",
    display_name: "Brand Voice Compliance",
    score: 80,
    passed: true,
    guidance:
      "Opening correctly introduced name, role, vehicle, and reason for visit. Closing included summary, thank-you, and next steps. Structure matches BMW walkaround standards.",
  },
];

export const MOCK_SCORES: Record<string, Score> = {
  "55555555-5555-5555-5555-555555555551": {
    video_id: "55555555-5555-5555-5555-555555555551",
    inspection_id: "44444444-4444-4444-4444-444444444442",
    overall_score: 62,
    threshold_percent: 80,
    can_send: false,
    feedback:
      "Your walkaround had a professional tone throughout — that's a real strength. However, several critical CPO checklist sections were skipped, and key findings lacked the visual measurement evidence BMW requires. The DSC fault explanation did not convey the safety impact to the customer. Review the criteria breakdown below, focus especially on Completeness and Clear Finding Shown, then re-record to clear the threshold.",
    criteria: CRITERIA_REVISION,
  },
  "55555555-5555-5555-5555-555555555552": {
    video_id: "55555555-5555-5555-5555-555555555552",
    inspection_id: "44444444-4444-4444-4444-444444444443",
    overall_score: 88,
    threshold_percent: 80,
    can_send: true,
    feedback:
      "Strong performance on this CPO inspection. Your use of precise measurements and BMW terminology was excellent — the tread depth readings clearly shown on camera directly supported your verbal findings. Minor areas for growth: the B-pillar paint chip explanation could be more explicit about CPO eligibility criteria. Video is cleared for customer delivery.",
    criteria: CRITERIA_PASSED,
  },
  "55555555-5555-5555-5555-555555555553": {
    video_id: "55555555-5555-5555-5555-555555555553",
    inspection_id: "44444444-4444-4444-4444-444444444444",
    overall_score: 91,
    threshold_percent: 80,
    can_send: false,
    feedback: "Outstanding walkaround. All criteria met or exceeded. Video successfully sent to customer.",
    criteria: CRITERIA_PASSED.map((c) => ({ ...c, score: c.score + 2 > 100 ? 100 : c.score + 2 })),
  },
};

export const MOCK_PERSONAL_ANALYTICS: PersonalAnalytics = {
  technician_id: "11111111-1111-1111-1111-111111111111",
  technician_name: "Ali Raza",
  first_attempt_pass_rate: 72,
  average_score: 79,
  total_videos: 18,
  total_passed: 13,
  score_trend: [
    { date: "2026-07-08", score: 71, passed: false, inspection_id: "a1" },
    { date: "2026-07-15", score: 78, passed: false, inspection_id: "a2" },
    { date: "2026-07-22", score: 82, passed: true, inspection_id: "a3" },
    { date: "2026-07-29", score: 80, passed: true, inspection_id: "a4" },
    { date: "2026-08-05", score: 75, passed: false, inspection_id: "a5" },
    { date: "2026-08-11", score: 84, passed: true, inspection_id: "a6" },
    { date: "2026-08-18", score: 91, passed: true, inspection_id: "a7" },
    { date: "2026-08-24", score: 88, passed: true, inspection_id: "a8" },
  ],
};

export const MOCK_ALL_TECHNICIAN_ANALYTICS: PersonalAnalytics[] = [
  MOCK_PERSONAL_ANALYTICS,
  {
    technician_id: "2",
    technician_name: "Hassan Iqbal",
    first_attempt_pass_rate: 65,
    average_score: 75,
    total_videos: 22,
    total_passed: 14,
    score_trend: [
      { date: "2026-07-05", score: 68, passed: false, inspection_id: "b1" },
      { date: "2026-07-12", score: 72, passed: false, inspection_id: "b2" },
      { date: "2026-07-19", score: 77, passed: false, inspection_id: "b3" },
      { date: "2026-07-26", score: 81, passed: true, inspection_id: "b4" },
      { date: "2026-08-02", score: 74, passed: false, inspection_id: "b5" },
      { date: "2026-08-09", score: 80, passed: true, inspection_id: "b6" },
      { date: "2026-08-16", score: 76, passed: false, inspection_id: "b7" },
      { date: "2026-08-23", score: 82, passed: true, inspection_id: "b8" },
    ],
  },
  {
    technician_id: "3",
    technician_name: "Faisal Qureshi",
    first_attempt_pass_rate: 58,
    average_score: 71,
    total_videos: 15,
    total_passed: 9,
    score_trend: [
      { date: "2026-07-10", score: 62, passed: false, inspection_id: "c1" },
      { date: "2026-07-17", score: 65, passed: false, inspection_id: "c2" },
      { date: "2026-07-24", score: 70, passed: false, inspection_id: "c3" },
      { date: "2026-07-31", score: 74, passed: false, inspection_id: "c4" },
      { date: "2026-08-07", score: 80, passed: true, inspection_id: "c5" },
      { date: "2026-08-14", score: 69, passed: false, inspection_id: "c6" },
      { date: "2026-08-21", score: 75, passed: false, inspection_id: "c7" },
    ],
  },
  {
    technician_id: "4",
    technician_name: "Zara Ahmed",
    first_attempt_pass_rate: 80,
    average_score: 83,
    total_videos: 20,
    total_passed: 16,
    score_trend: [
      { date: "2026-07-06", score: 79, passed: false, inspection_id: "d1" },
      { date: "2026-07-13", score: 84, passed: true, inspection_id: "d2" },
      { date: "2026-07-20", score: 88, passed: true, inspection_id: "d3" },
      { date: "2026-07-27", score: 82, passed: true, inspection_id: "d4" },
      { date: "2026-08-03", score: 80, passed: true, inspection_id: "d5" },
      { date: "2026-08-10", score: 85, passed: true, inspection_id: "d6" },
      { date: "2026-08-17", score: 90, passed: true, inspection_id: "d7" },
      { date: "2026-08-24", score: 87, passed: true, inspection_id: "d8" },
    ],
  },
  {
    technician_id: "5",
    technician_name: "Kamran Shahid",
    first_attempt_pass_rate: 70,
    average_score: 78,
    total_videos: 12,
    total_passed: 8,
    score_trend: [
      { date: "2026-07-14", score: 66, passed: false, inspection_id: "e1" },
      { date: "2026-07-21", score: 71, passed: false, inspection_id: "e2" },
      { date: "2026-07-28", score: 78, passed: false, inspection_id: "e3" },
      { date: "2026-08-04", score: 82, passed: true, inspection_id: "e4" },
      { date: "2026-08-11", score: 80, passed: true, inspection_id: "e5" },
      { date: "2026-08-18", score: 85, passed: true, inspection_id: "e6" },
    ],
  },
];

export const MOCK_TEAM_ANALYTICS: TeamAnalytics = {
  dealership: "BMW Dealership",
  overall_pass_rate: 68,
  overall_average_score: 77,
  members: [
    { technician_id: "1", technician_name: "Ali Raza", first_attempt_pass_rate: 72, average_score: 79, total_videos: 18 },
    { technician_id: "2", technician_name: "Hassan Iqbal", first_attempt_pass_rate: 65, average_score: 75, total_videos: 22 },
    { technician_id: "3", technician_name: "Faisal Qureshi", first_attempt_pass_rate: 58, average_score: 71, total_videos: 15 },
    { technician_id: "4", technician_name: "Zara Ahmed", first_attempt_pass_rate: 80, average_score: 83, total_videos: 20 },
    { technician_id: "5", technician_name: "Kamran Shahid", first_attempt_pass_rate: 70, average_score: 78, total_videos: 12 },
  ],
};

/* ── Grading-result video intelligence (demo content) ─────────────────── */

export const MOCK_VIDEO_ANALYSIS: VideoAnalysisStats = {
  duration_seconds: 162,
  analysis_status: "Complete",
  strengths: 5,
  areas_to_improve: 2,
};

export const MOCK_VIDEO_OVERVIEW =
  "The technician completed a structured multi-point inspection covering tires, brakes, suspension, drivetrain and the engine bay. Measurements were generally shown clearly on camera. The strongest areas were completeness and visual evidence, while terminology and closing brand language could be improved.";

export const MOCK_VIDEO_TIMELINE: VideoTimelineEntry[] = [
  {
    start_seconds: 0,
    end_seconds: 16,
    title: "Introduction",
    description: "Technician introduces himself, the vehicle and scheduled service.",
    tags: ["Tone"],
    meets_expectation: true,
  },
  {
    start_seconds: 17,
    end_seconds: 44,
    title: "Rear tires & brakes",
    description: "Tread depth and brake-pad measurements are shown clearly.",
    tags: ["Completeness", "Finding shown"],
    meets_expectation: true,
  },
  {
    start_seconds: 45,
    end_seconds: 85,
    title: "Suspension & drivetrain",
    description: "Rear suspension, differential, transmission and underbody inspected.",
    tags: ["Completeness", "Terminology"],
    meets_expectation: false,
  },
  {
    start_seconds: 86,
    end_seconds: 109,
    title: "Front tires & brakes",
    description: "Front tire measurements and brake condition documented.",
    tags: ["Finding shown"],
    meets_expectation: true,
  },
  {
    start_seconds: 110,
    end_seconds: 145,
    title: "Engine bay",
    description: "Coolant, belts, hoses and fluid condition checked.",
    tags: ["Completeness", "Finding shown"],
    meets_expectation: true,
  },
  {
    start_seconds: 146,
    end_seconds: 162,
    title: "Closing",
    description: "Service completion explained and customer thanked.",
    tags: ["Tone"],
    meets_expectation: true,
  },
];

/**
 * Keyed by CriterionScore.key. Supplements the real `guidance` text (which
 * already covers "why") with the two things the grading payload doesn't
 * carry yet: a concrete next step and, where applicable, timeline evidence.
 */
export const CRITERION_DETAILS: Record<string, CriterionDetail> = {
  completeness: {
    to_reach_100: "Explicitly confirm every required inspection checkpoint before moving to the next section.",
    evidence: ["00:17–00:44", "00:45–01:25", "01:50–02:25"],
  },
  accuracy_of_terminology: {
    to_reach_100: "Use the approved component terminology consistently throughout the walkthrough.",
    evidence: ["00:45–01:25"],
  },
  clear_finding_shown: {
    to_reach_100: "Improve camera positioning for components that are difficult to see.",
    evidence: ["00:17–00:44", "01:50–02:25"],
  },
  explanation_of_impact: {
    to_reach_100: "Briefly explain why each significant finding matters to vehicle performance or safety.",
  },
  recommendation_clarity: {
    to_reach_100: "Clearly distinguish between replace now, monitor and no-action-required recommendations.",
  },
  tone_and_professionalism: {
    to_reach_100: "Use the complete approved introduction and closing sequence consistently.",
  },
  brand_voice_compliance: {
    to_reach_100: "Use approved BMW greeting, service explanation and closing language consistently.",
  },
};

export const MOCK_EVIDENCE: EvidenceItem[] = [
  { image: PHOTOS.tireTread, label: "Tire tread", timestamp_seconds: 31 },
  { image: PHOTOS.brakePad, label: "Rear brake pads", timestamp_seconds: 39 },
  { image: PHOTOS.underbodyLift, label: "Underbody inspection", timestamp_seconds: 64 },
  { image: PHOTOS.engineBay, label: "Engine coolant", timestamp_seconds: 123 },
];

export const MOCK_CUSTOMER_PREVIEW: CustomerPreviewItem[] = [
  { label: "Video walkthrough", detail: "The full walkaround, trimmed to the moments that matter." },
  { label: "Key findings", detail: "Plain-language summary of what was checked and what was found." },
  { label: "Recommended actions", detail: "Replace, monitor, or no action needed — stated clearly." },
  { label: "Technician explanation", detail: "Why it matters, in the technician's own words." },
];
