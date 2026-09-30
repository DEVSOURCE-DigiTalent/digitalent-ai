import { isAxiosError } from 'axios';
import type { ApiResponse } from '@/types/api';

/**
 * 3-level scale (S1-T002, Circular 02/2025 — docs/specs/2026-09-29-tt02-position-competency-matrix.md §2).
 * Enterprise pages use English, the learner track (/learn/*) uses Vietnamese. 0 / null = not confirmed yet.
 * Level 1 / 2 / 3 = Circular tiers 1–2 / 3–4 / 5–6; tiers 7–8 are out of scope.
 */
export const COMPETENCY_LEVEL_LABELS: Record<number, string> = {
  0: 'Not confirmed',
  1: 'Basic',
  2: 'Intermediate',
  3: 'Advanced',
};

export const COMPETENCY_LEVEL_LABELS_VI: Record<number, string> = {
  0: 'Chưa xác nhận',
  1: 'Cơ bản',
  2: 'Trung bình',
  3: 'Nâng cao',
};

/** Circular 02/2025 tiers covered by each system level. */
export const TT02_TIERS: Record<number, string> = { 1: '1–2', 2: '3–4', 3: '5–6' };

export function levelLabel(level: number | null | undefined): string {
  return COMPETENCY_LEVEL_LABELS[level ?? 0] ?? `Level ${level}`;
}

export function levelLabelVi(level: number | null | undefined): string {
  return COMPETENCY_LEVEL_LABELS_VI[level ?? 0] ?? `Mức ${level}`;
}

/** "Intermediate · TT02 tiers 3–4" (en) or "Trung bình · bậc 3–4" (vi) — for pickers and tooltips. */
export function levelWithTier(level: number, language: 'en' | 'vi' = 'en'): string {
  const tiers = TT02_TIERS[level];
  if (!tiers) return language === 'vi' ? levelLabelVi(level) : levelLabel(level);
  return language === 'vi' ? `${levelLabelVi(level)} · bậc ${tiers}` : `${levelLabel(level)} · TT02 tiers ${tiers}`;
}

/** Learner data still uses the DigComp 1–6 scale: 1–2 → 1, 3–4 → 2, 5–6 → 3 (0 stays "not assessed"). */
export function levelFromDigComp(digCompLevel: number): number {
  if (digCompLevel <= 0) return 0;
  return Math.min(3, Math.ceil(digCompLevel / 2));
}

export function levelLabelViFromDigComp(digCompLevel: number): string {
  return levelLabelVi(levelFromDigComp(digCompLevel));
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
