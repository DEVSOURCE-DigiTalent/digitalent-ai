import apiClient from './api-client';
import type { ApiResponse } from '../types/api';

/**
 * Khung năng lực số of the organization (OW-05): 6 domains × 3 levels = 18 courses, the courses the organization owns,
 * and the required level per domain of the 5 standard positions (shared by every department; a domain not set follows
 * the system suggestion). Backend: CapabilityCeilingsController (`/capability-ceilings`).
 */

export interface CeilingLevel {
  level: number;
  name: string;
}

export interface CeilingCourse {
  level: number;
  courseId: string | null;
  code: string | null;
  title: string | null;
  competencies?: { competencyId: string; targetLevel: number }[];
  /** Level 1 is always open; levels 2–3 once the organization bought the course. */
  isUnlocked?: boolean;
  /** Price of the course for the whole organization (0 for Basic). */
  price?: number;
}

export interface CeilingDomain {
  categoryId: string;
  code: string;
  name: string;
  sortOrder: number;
  /** Organization ceiling (0–3). */
  organizationCeiling: number;
  /** Maximum ceiling allowed by the courses the organization bought (1 when it bought none). */
  maxAllowedCeiling?: number;
  /** Highest level required by the positions with an active requirement set. */
  suggestedCeiling: number;
  courses: CeilingCourse[];
}

export interface CeilingValue {
  categoryId: string;
  /** Required level: the one the owner set for the position, else the position standard (system suggestion). */
  level: number;
  /** System suggestion: the TT02 sample of the position. */
  suggested: number;
  /** true = set by the owner. */
  isCustomized: boolean;
}

/** One of the 5 standard positions (CEO, HR, MARKETING, SALES_CRM, ACCOUNTANT), shared by every department. */
export interface CeilingPosition {
  /** null = the organization has no row for it yet (created when a level is saved). */
  positionId: string | null;
  code: string;
  name: string;
  employeeCount: number;
  /** Departments where someone holds the position. */
  departments: string[];
  hasSuggestion: boolean;
  /** true = the owner set a level for at least one domain. */
  isCustomized: boolean;
  courseCount: number;
  ceilings: CeilingValue[];
}

export interface CapabilityCeilings {
  platformMaxLevel: number;
  /** false = not saved yet; the organization ceiling shown is the suggestion. */
  isConfigured: boolean;
  updatedAt: string | null;
  updatedByName: string | null;
  levels: CeilingLevel[];
  domains: CeilingDomain[];
  positions: CeilingPosition[];
  organizationCourseCount: number;
  platformCourseCount: number;
  /** Only after saving the organization ceiling: departments lowered to stay under it. */
  adjustedDepartmentCount?: number;
}

export interface CeilingInput {
  categoryId: string;
  level: number;
}

export interface UpdatePositionCeilingsRequest {
  inherit?: boolean;
  ceilings: CeilingInput[];
}

export const capabilityCeilingService = {
  get: () => apiClient.get<ApiResponse<CapabilityCeilings>>('/capability-ceilings'),
  updateOrganization: (ceilings: CeilingInput[]) =>
    apiClient.put<ApiResponse<CapabilityCeilings>>('/capability-ceilings/organization', { ceilings }),
  /** `code` = one of the 5 standard position codes; `inherit` clears every level the owner set for it. */
  updatePosition: (code: string, data: UpdatePositionCeilingsRequest) =>
    apiClient.put<ApiResponse<CapabilityCeilings>>(`/capability-ceilings/positions/${encodeURIComponent(code)}`, data),
};
