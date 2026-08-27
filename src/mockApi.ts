/**
 * Development-only offline fallback.
 *
 * The dev server proxies /api to a gateway on localhost:8000. When that
 * gateway isn't running, `api.ts` degrades to these handlers so the UI stays
 * navigable for design work. Never reached in a production build — the switch
 * is gated on `import.meta.env.DEV`.
 */
import {
  MOCK_ALL_TECHNICIAN_ANALYTICS,
  MOCK_CONFIG,
  MOCK_INSPECTIONS,
  MOCK_PERSONAL_ANALYTICS,
  MOCK_SCORES,
  MOCK_TEAM_ANALYTICS,
  MOCK_USERS,
  MOCK_VIDEOS,
} from './mockData';
import type {
  Config,
  Inspection,
  PersonalAnalytics,
  Score,
  TeamAnalytics,
  User,
  Video,
} from './types';

const MOCK_USER_KEY = 'bmw_mock_user_id';
const DEMO_PASSWORD = 'bmw';

/** Mutable copies so uploads and sends are visible while navigating. */
const inspections: Inspection[] = MOCK_INSPECTIONS.map((item) => ({ ...item }));
const videos: Record<string, Video[]> = Object.fromEntries(
  Object.entries(MOCK_VIDEOS).map(([key, list]) => [key, [...list]]),
);
const scores: Record<string, Score> = { ...MOCK_SCORES };

function notFound(what: string): never {
  throw new Error(`${what} is not available in offline demo data.`);
}

export const mock = {
  login(email: string, password: string): User {
    const account = MOCK_USERS.find(
      (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!account || password !== DEMO_PASSWORD) {
      throw new Error('Incorrect email or password.');
    }
    localStorage.setItem(MOCK_USER_KEY, account.id);
    return account;
  },

  signOut() {
    localStorage.removeItem(MOCK_USER_KEY);
  },

  getMe(): User {
    const id = localStorage.getItem(MOCK_USER_KEY);
    const account = MOCK_USERS.find((candidate) => candidate.id === id);
    if (!account) notFound('Session');
    return account;
  },

  getInspections(technicianId?: string): Inspection[] {
    if (!technicianId) return inspections;
    return inspections.filter((item) => item.technician_id === technicianId);
  },

  getInspection(id: string): Inspection {
    return inspections.find((item) => item.id === id) ?? notFound('Inspection');
  },

  getInspectionVideos(id: string): Video[] {
    return videos[id] ?? [];
  },

  uploadVideo(inspectionId: string, file: File): Video {
    const inspection = mock.getInspection(inspectionId);
    const created: Video = {
      id: `mock-video-${Date.now()}`,
      inspection_id: inspectionId,
      status: 'processing',
      uploaded_at: new Date().toISOString(),
      filename: file.name,
      can_send: false,
      duration_seconds: 172,
    };

    videos[inspectionId] = [created, ...(videos[inspectionId] ?? [])];

    // Reuse a representative graded score so the result screens have content.
    const template = Object.values(MOCK_SCORES)[0];
    scores[created.id] = {
      ...template,
      video_id: created.id,
      inspection_id: inspectionId,
      threshold_percent: MOCK_CONFIG.grading_threshold_percent,
    };

    const graded: Video = {
      ...created,
      status: 'graded',
      overall_score: template.overall_score,
      can_send: template.can_send,
    };
    videos[inspectionId] = [graded, ...(videos[inspectionId] ?? []).slice(1)];

    const index = inspections.findIndex((item) => item.id === inspectionId);
    inspections[index] = {
      ...inspection,
      status: template.can_send ? 'passed' : 'needs_revision',
      attempt_count: inspection.attempt_count + 1,
      latest_score: template.overall_score,
      latest_video_id: created.id,
      can_send: template.can_send,
      updated_at: created.uploaded_at,
    };

    return created;
  },

  getVideo(id: string): Video {
    for (const list of Object.values(videos)) {
      const found = list.find((video) => video.id === id);
      if (found) return found;
    }
    return notFound('Video');
  },

  getScore(videoId: string): Score {
    return scores[videoId] ?? notFound('Score');
  },

  sendInspection(inspectionId: string): void {
    const index = inspections.findIndex((item) => item.id === inspectionId);
    if (index < 0) notFound('Inspection');
    inspections[index] = {
      ...inspections[index],
      status: 'sent',
      can_send: false,
      updated_at: new Date().toISOString(),
    };
  },

  getConfig(): Config {
    return MOCK_CONFIG;
  },

  getPersonalAnalytics(user: User, technicianId?: string): PersonalAnalytics {
    const id = technicianId ?? user.id;
    const found = MOCK_ALL_TECHNICIAN_ANALYTICS.find((entry) => entry.technician_id === id);
    if (found) return found;
    return { ...MOCK_PERSONAL_ANALYTICS, technician_id: id, technician_name: user.name };
  },

  getTeamAnalytics(): TeamAnalytics {
    return MOCK_TEAM_ANALYTICS;
  },
};
