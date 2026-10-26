import apiClient from './api-client';
import type { ApiResponse } from '../types/api';

/**
 * Ceiling matrix of the organization (OW-05 "Lý thuyết trần nhà"): the Digital AI ceiling (6 domains × 3 levels = 18
 * courses), the organization ceiling and optional department ceilings, department ≤ organization ≤ Digital AI per domain.
 * Backend: CapabilityCeilingsController (`/capability-ceilings`).
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
  isUnlocked?: boolean;
  seatsPurchased?: number;
  pricePerSeat?: number;
}

export interface CeilingDomain {
  categoryId: string;
  code: string;
  name: string;
  sortOrder: number;
  /** Organization ceiling (0–3). */
  organizationCeiling: number;
  /** Maximum ceiling allowed based on purchased licenses/seats (default 1 for free trial). */
  maxAllowedCeiling?: number;
  /** Highest level required by the positions with an active requirement set. */
  suggestedCeiling: number;
  courses: CeilingCourse[];
}

export interface CeilingValue {
  categoryId: string;
  /** Effective ceiling: the department's own one, else the organization ceiling. */
  level: number;
  suggested: number;
  isCustomized: boolean;
}

export interface CeilingDepartment {
  departmentId: string;
  code: string;
  name: string;
  employeeCount: number;
  hasSuggestion: boolean;
  /** false = inherits the organization ceiling. */
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
  departments: CeilingDepartment[];
  organizationCourseCount: number;
  platformCourseCount: number;
  /** Only after saving the organization ceiling: departments lowered to stay under it. */
  adjustedDepartmentCount?: number;
}

export interface CeilingInput {
  categoryId: string;
  level: number;
}

export interface UpdateDepartmentCeilingsRequest {
  inherit?: boolean;
  ceilings: CeilingInput[];
}

export const capabilityCeilingService = {
  get: () => apiClient.get<ApiResponse<CapabilityCeilings>>('/capability-ceilings'),
  updateOrganization: (ceilings: CeilingInput[]) =>
    apiClient.put<ApiResponse<CapabilityCeilings>>('/capability-ceilings/organization', { ceilings }),
  updateDepartment: (departmentId: string, data: UpdateDepartmentCeilingsRequest) =>
    apiClient.put<ApiResponse<CapabilityCeilings>>(`/capability-ceilings/departments/${departmentId}`, data),
};
