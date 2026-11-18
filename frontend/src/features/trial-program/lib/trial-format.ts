import type { TrialStage } from '@/services/trial-program.service';
import { uiLocale } from '@/lib/i18n';

/** Chuẩn vị trí được đặt trong ma trận trần năng lực của trang Khung năng lực số. */
export const POSITION_STANDARD_PATH = '/enterprise/setup?tab=ceilings';

export const LEVEL_LABELS = ['Chưa đạt Cơ bản', 'Cơ bản', 'Trung cấp', 'Nâng cao'] as const;
export const TIER_LABELS = ['', 'Cơ bản', 'Trung cấp', 'Nâng cao'] as const;

/**
 * Share of right answers in a whole domain (every level together) needed for level 1 / 2 / 3, as on the backend
 * (TrialProgramRules.LevelSharePercents). With 15 questions: 6 / 9 / 12 right answers.
 */
export const LEVEL_SHARE_PERCENTS = [40, 60, 80] as const;

/** Rounded share of right answers (0–100). */
export function sharePercent(correct: number, total: number): number {
  if (total <= 0) return 0;
  const rounded = Math.round((correct * 100) / total);
  // A displayed percentage must not round up into the next survey level.
  return LEVEL_SHARE_PERCENTS.some((threshold) => rounded === threshold && correct * 100 < total * threshold)
    ? Math.floor((correct * 1000) / total) / 10
    : rounded;
}

/** Survey level of a domain from its right answers: below 40% → 0, from 40% → 1, from 60% → 2, from 80% → 3. */
export function levelFromShare(correct: number, total: number): number {
  if (total <= 0) return 0;
  let level = 0;
  for (const percent of LEVEL_SHARE_PERCENTS) {
    if (correct * 100 < total * percent) break;
    level++;
  }
  return level;
}

type DomainCounts = {
  basicCorrect?: number | null;
  basicTotal?: number | null;
  intermediateCorrect?: number | null;
  intermediateTotal?: number | null;
  advancedCorrect?: number | null;
  advancedTotal?: number | null;
};

/** Right answers and questions of a domain, every level together. */
export function domainTotals(detail?: DomainCounts | null): { correct: number; total: number; percent: number } {
  const correct = (detail?.basicCorrect ?? 0) + (detail?.intermediateCorrect ?? 0) + (detail?.advancedCorrect ?? 0);
  const total = (detail?.basicTotal ?? 0) + (detail?.intermediateTotal ?? 0) + (detail?.advancedTotal ?? 0);
  return { correct, total, percent: sharePercent(correct, total) };
}

/**
 * Mức gợi ý của một lĩnh vực: số cấp đạt liên tiếp từ Cơ bản ở trắc nghiệm (máy chấm), giới hạn bởi số cấp tự luận đạt
 * liên tiếp (điểm mentor ≥ điểm đạt). Chưa chấm đủ tự luận thì chỉ theo trắc nghiệm.
 */
export function suggestLevel(choiceLevel: number, essayScores: (number | null | undefined)[], passScore: number): number {
  if (essayScores.some((s) => s == null)) return choiceLevel;
  let essayLevel = 0;
  for (const score of essayScores) {
    if ((score ?? 0) < passScore) break;
    essayLevel++;
  }
  return Math.min(choiceLevel, essayLevel);
}

export const STAGE: Record<TrialStage, { label: string; tone: string }> = {
  SETUP: { label: 'Chưa gửi', tone: '' },
  REQUESTED: { label: 'Đang khảo sát', tone: 'info' },
  ASSIGNED: { label: 'Đang khảo sát', tone: 'info' },
  REPORTED: { label: 'Đã có kết quả', tone: 'ok' },
};

export function formatWhen(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(uiLocale(), { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

/** Giá trị cho <input type="datetime-local"> theo giờ máy. */
export function toLocalInput(value?: string | Date | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
