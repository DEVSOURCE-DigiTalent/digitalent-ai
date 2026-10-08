/** Message of a failed request: the server's when there is one. */
export function errorMessage(error: unknown): string | undefined {
  const response = (error as { response?: { data?: { message?: string } } } | null)?.response;
  return response?.data?.message ?? (error instanceof Error ? error.message : undefined);
}

/** Codes the server answers with (HTTP 403, `errors[0].message`) when the plan does not include an action. */
export const PLAN_ERROR_CODES = [
  'TRIAL_COURSE_LIMIT',
  'PLAN_REQUIRED',
  'DIAGNOSTIC_LIMIT',
  'REASSESSMENT_NOT_DUE',
  'TARGET_CHANGE_LIMIT',
] as const;

const FALLBACK_PLAN_MESSAGE = 'Gói của bạn chưa mở thao tác này. Nâng cấp gói Plus để tiếp tục.';

export type PlanErrorCode = (typeof PLAN_ERROR_CODES)[number];

export interface PlanError {
  code: PlanErrorCode;
  /** Vietnamese sentence the server wrote for the learner. */
  message: string;
}

/** The plan error in a failed request, or null for any other failure. */
export function planErrorOf(error: unknown): PlanError | null {
  const response = (error as { response?: { status?: number; data?: { message?: string; errors?: { message?: string }[] } } } | null)
    ?.response;
  if (response?.status !== 403) return null;
  const code = response.data?.errors?.[0]?.message;
  const known = PLAN_ERROR_CODES.find((candidate) => candidate === code);
  if (!known) return null;
  return { code: known, message: response.data?.message || FALLBACK_PLAN_MESSAGE };
}
