import { REFERENCE_POSITIONS } from '@/lib/reference-positions';
import type { TryOrientationInput } from '@/types/commerce';
/**
 * What the no-account "thử nhanh" flow hands to the trial sign-up: the position the visitor chose. Kept in
 * sessionStorage so it does not outlive the browser session, and never carries a name or an email.
 * The quick try no longer asks orientation questions; `correct`/`total` are still read so a hand-over written by the
 * earlier five-step version keeps working until the orientation plumbing is removed (plan 2026-10-09, A3).
 */

const STORAGE_KEY = 'dt-try-handoff';
/** The quick try asks a handful of questions; a larger count is not from it. */
const MAX_TOTAL = 100;

export interface TryHandoff {
  positionCode: string;
  completedAt: string;
  /** Present only when the visitor took the survey instead of skipping it. */
  correct?: number;
  total?: number;
}

const isPosition = (code: unknown): code is string =>
  typeof code === 'string' && REFERENCE_POSITIONS.some((position) => position.code === code);

/** The hand-over for a quick try that ends on the sample path of a position. */
export function buildTryHandoff(positionCode: string, now: Date = new Date()): TryHandoff {
  return { positionCode, completedAt: now.toISOString() };
}

export function writeTryHandoff(handoff: TryHandoff): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(handoff));
  } catch {
    // Storage blocked: the sign-up still works, only without the carried-over position.
  }
}

/** The stored hand-over, or null when there is none or its shape is not what this module wrote. */
export function readTryHandoff(): TryHandoff | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TryHandoff> | null;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!isPosition(parsed.positionCode) || typeof parsed.completedAt !== 'string') return null;
    if (Number.isNaN(new Date(parsed.completedAt).getTime())) return null;

    const handoff: TryHandoff = { positionCode: parsed.positionCode, completedAt: parsed.completedAt };
    const { correct, total } = parsed;
    if (typeof correct === 'number' && typeof total === 'number' && Number.isInteger(correct) && Number.isInteger(total)
      && total > 0 && total <= MAX_TOTAL && correct >= 0 && correct <= total) {
      handoff.correct = correct;
      handoff.total = total;
    }
    return handoff;
  } catch {
    return null;
  }
}

export function clearTryHandoff(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** The orientation the server stores, or undefined when the visitor skipped the survey. */
export function toTryOrientation(handoff: TryHandoff | null): TryOrientationInput | undefined {
  if (!handoff || handoff.correct === undefined || handoff.total === undefined) return undefined;
  return {
    positionCode: handoff.positionCode,
    correct: handoff.correct,
    total: handoff.total,
    completedAt: handoff.completedAt,
  };
}
