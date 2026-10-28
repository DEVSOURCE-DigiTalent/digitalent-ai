import type { TrialStage } from '@/services/trial-program.service';

export const LEVEL_LABELS = ['Chưa đạt', 'Cơ bản', 'Trung cấp', 'Nâng cao'] as const;
export const TIER_LABELS = ['', 'Cơ bản', 'Trung cấp', 'Nâng cao'] as const;

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
  REQUESTED: { label: 'Chờ phân công', tone: 'warn' },
  ASSIGNED: { label: 'Đang chấm', tone: 'info' },
  REPORTED: { label: 'Đã có kết quả', tone: 'ok' },
};

export function formatWhen(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

/** Giá trị cho <input type="datetime-local"> theo giờ máy. */
export function toLocalInput(value?: string | Date | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
