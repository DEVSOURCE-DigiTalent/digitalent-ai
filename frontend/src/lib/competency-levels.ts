import { isAxiosError } from 'axios';
import type { ApiResponse } from '@/types/api';

/** 3-level scale (spec D-S3: Basic / Intermediate / Advanced). 0 / null = not confirmed yet. */
export const COMPETENCY_LEVEL_LABELS: Record<number, string> = {
  0: 'Not confirmed',
  1: 'Basic',
  2: 'Intermediate',
  3: 'Advanced',
};

export function levelLabel(level: number | null | undefined): string {
  return COMPETENCY_LEVEL_LABELS[level ?? 0] ?? `Level ${level}`;
}

/** Reason codes returned in errors[].message by business 400s (spec §4.6). */
const SKILL_GAP_REASON_MESSAGES: Record<string, string> = {
  NO_JOB_POSITION: 'The employee has no job position assigned.',
  NO_ACTIVE_REQUIREMENT_SET: "The employee's position has no active requirement set yet.",
  EMPLOYEE_NOT_ACTIVE: 'Skill gap can only be calculated for active employees.',
  REQUIREMENT_SET_NOT_ACTIVE: 'Only an active requirement set can be used.',
  BATCH_TOO_LARGE: 'Too many employees in one batch — filter by department or position.',
};

export function skillGapReasonMessage(code: string): string {
  return SKILL_GAP_REASON_MESSAGES[code] ?? code;
}

/** Best human message for a failed skill gap request (reason code → text, else server message). */
export function skillGapErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    const code = error.response?.data?.errors?.[0]?.message;
    if (code && SKILL_GAP_REASON_MESSAGES[code]) {
      return SKILL_GAP_REASON_MESSAGES[code];
    }
    return error.response?.data?.message || fallback;
  }
  return fallback;
}
