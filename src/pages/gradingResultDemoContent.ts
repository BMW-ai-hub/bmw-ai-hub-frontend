/**
 * Grading-result page enrichment: video analysis summary, overview, chapter
 * timeline, and the "why this score / to reach 100%" detail behind each
 * criterion accordion.
 *
 * None of this is returned by `/videos/{id}/score` today — the endpoint gives
 * one overall score plus per-criterion guidance, nothing timestamped. This
 * file is a frontend-only stand-in so the page can be designed and reviewed
 * now; see the "how this becomes real" note in the task summary for what the
 * AI Services contract would need to add. Content here is fixed rather than
 * keyed by video id, since there is exactly one mock walkaround to describe.
 */

// No service in this stack returns a playable URL for an uploaded walkaround
// today — `Video` (types.ts) only carries `filename`, and technician-services
// doesn't proxy object-storage's file bytes through the gateway. This is a
// stand-in public clip so the player and timestamp-seeking are genuinely
// wired up and testable now. Swapping in the real recording later is a
// one-line change once the backend adds a `video_url` to `GET /videos/{id}`.
export const DEMO_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export interface VideoAnalysisSummary {
  durationLabel: string;
  analysisStatus: string;
  strengths: number;
  areasToImprove: number;
}

export const VIDEO_ANALYSIS_SUMMARY: VideoAnalysisSummary = {
  durationLabel: '02:42',
  analysisStatus: 'Complete',
  strengths: 5,
  areasToImprove: 2,
};

export const VIDEO_OVERVIEW =
  'The technician completed a structured multi-point inspection covering tires, brakes, ' +
  'suspension, drivetrain and the engine bay. Measurements were generally shown clearly on ' +
  'camera. The strongest areas were completeness and visual evidence, while terminology and ' +
  'closing brand language could be improved.';

export interface VideoChapter {
  id: string;
  start: number;
  end: number;
  timeLabel: string;
  title: string;
  description: string;
  tags?: string[];
}

// start/end in seconds — kept alongside the display label so a future video
// player can seek on these directly without reparsing "mm:ss" strings.
export const VIDEO_CHAPTERS: VideoChapter[] = [
  {
    id: 'intro',
    start: 0,
    end: 16,
    timeLabel: '00:00–00:16',
    title: 'Introduction',
    description: 'Technician introduces himself, the vehicle and scheduled service.',
    tags: ['Tone'],
  },
  {
    id: 'rear-tires-brakes',
    start: 17,
    end: 44,
    timeLabel: '00:17–00:44',
    title: 'Rear tires & brakes',
    description: 'Tread depth and brake-pad measurements shown clearly.',
    tags: ['Completeness', 'Finding shown'],
  },
  {
    id: 'suspension-drivetrain',
    start: 45,
    end: 85,
    timeLabel: '00:45–01:25',
    title: 'Suspension & drivetrain',
    description: 'Rear suspension, differential, transmission, underbody inspected.',
    tags: ['Completeness', 'Terminology'],
  },
  {
    id: 'front-tires-brakes',
    start: 86,
    end: 109,
    timeLabel: '01:26–01:49',
    title: 'Front tires & brakes',
    description: 'Front tire measurements and brake condition documented.',
    tags: ['Completeness', 'Finding shown'],
  },
  {
    id: 'engine-bay',
    start: 110,
    end: 145,
    timeLabel: '01:50–02:25',
    title: 'Engine bay',
    description: 'Coolant, belts, hoses and fluid condition checked.',
    tags: ['Completeness', 'Finding shown'],
  },
  {
    id: 'closing',
    start: 146,
    end: 162,
    timeLabel: '02:26–02:42',
    title: 'Closing',
    description: 'Service completion explained and customer thanked.',
    tags: ['Tone'],
  },
];

export interface CriterionDetail {
  why: string;
  toReach: string;
  /** VideoChapter ids this verdict was drawn from. */
  evidence?: string[];
}

// Keyed by CriterionScore.key — the same key the real API already returns,
// so this overlay degrades cleanly: a criterion with no entry here (or a
// future real criterion key this file doesn't know about) still expands and
// shows the API's own `guidance` text under "Why this score", it just won't
// have a "To reach 100%" or "Evidence" section.
export const CRITERION_DETAIL: Record<string, CriterionDetail> = {
  completeness: {
    why: 'The technician covered nearly all required inspection areas and provided clear tire and brake measurements. The walkthrough followed a logical sequence.',
    toReach: 'Explicitly confirm every required inspection checkpoint before moving to the next section.',
    evidence: ['rear-tires-brakes', 'suspension-drivetrain', 'engine-bay'],
  },
  accuracy_of_terminology: {
    why: 'Terminology was accurate overall, but several component descriptions were more conversational than BMW-standard wording.',
    toReach: 'Use the approved component terminology consistently throughout the walkthrough.',
    evidence: ['suspension-drivetrain'],
  },
  clear_finding_shown: {
    why: "Measurements and inspected components were generally visible and supported the technician's findings.",
    toReach: 'Improve camera positioning for components that are difficult to see.',
    evidence: ['rear-tires-brakes', 'engine-bay'],
  },
  explanation_of_impact: {
    why: 'The technician explained the condition of inspected components, but customer and safety impact was not consistently stated.',
    toReach: 'Briefly explain why each significant finding matters to vehicle performance or safety.',
  },
  recommendation_clarity: {
    why: 'Recommendations were supported by visible measurements and inspection evidence.',
    toReach: 'Clearly distinguish between replace now, monitor and no-action-required recommendations.',
  },
  tone_and_professionalism: {
    why: 'The walkthrough remained calm, respectful and professional throughout.',
    toReach: 'Use the complete approved introduction and closing sequence consistently.',
  },
  brand_voice_compliance: {
    why: 'The communication was professional and customer-focused but did not consistently use the preferred BMW phrasing.',
    toReach: 'Use approved BMW greeting, service explanation and closing language consistently.',
  },
};
