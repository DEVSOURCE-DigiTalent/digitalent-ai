import apiClient from './api-client';
import type { ApiResponse } from '@/types/api';

/**
 * Course versions DigiTalent published without applying them to every organization (`/course-updates`):
 * the organization sees what the newest one changes, then applies it or keeps the version it learns from.
 * Needs `course_update.review` (OWNER for now, R&D once the role exists).
 */
export type CourseUpdateStatus = 'UP_TO_DATE' | 'AVAILABLE' | 'KEPT';

export interface CourseUpdateCourse {
  /** Platform course id. */
  courseId: string;
  code: string;
  title: string;
  level: number;
  /** UPDATED = new content, ADDED = a course the organization did not have. */
  kind: 'UPDATED' | 'ADDED';
  /** Basic, or bought: employees can learn it. */
  owned: boolean;
  /** Employees learning it now: they move to the new content at once or after the grace the decider chooses. */
  learnersInProgress: number;
  /** Employees who passed it: they keep their result (a major change makes them learn it again). */
  learnersPassed: number;
  /** Employees learn the company version R&D applied: applying gives them DigiTalent's content, R&D keeps its version as a draft. */
  companyVersion: boolean;
}

export interface CourseUpdateKept {
  versionNo: number;
  reason: string;
  keptAt: string;
  keptBy?: string | null;
}

export interface CourseUpdates {
  status: CourseUpdateStatus;
  currentVersionNo: number;
  latestVersionNo: number;
  latestPublishedAt?: string | null;
  releaseNote?: string | null;
  courses: CourseUpdateCourse[];
  kept?: CourseUpdateKept | null;
  /** RND = the company's R&D decides; OWNER = the company has no R&D, the owner decides. */
  decidedBy: 'RND' | 'OWNER';
  /** False = the caller only reads (e.g. the owner while R&D is in charge). */
  canDecide: boolean;
}

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request;
  return response.data.data as T;
}

export const courseUpdateService = {
  get: () => unwrap<CourseUpdates>(apiClient.get('/course-updates')),
  /** graceDays: 0 = employees learning a changed course move to the new content at once; 7 / 14 / 30 = days to finish the old one. */
  /** majorChange: the old content is wrong now, employees who finished a changed course learn it again. */
  apply: (versionNo: number, graceDays: number, majorChange = false) =>
    unwrap<CourseUpdates>(apiClient.post('/course-updates/apply', { versionNo, graceDays, majorChange })),
  keep: (versionNo: number, reason: string) =>
    unwrap<CourseUpdates>(apiClient.post('/course-updates/keep', { versionNo, reason })),
};
