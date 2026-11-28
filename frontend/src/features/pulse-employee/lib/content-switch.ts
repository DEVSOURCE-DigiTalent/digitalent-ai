import { vietnamDay } from '@/lib/vietnam-day';

/**
 * A course that got new content while the employee was half-way through it: they may finish the old content until
 * `contentSwitchAt` (chosen by the company: 7, 14 or 30 days), then they start again on the new one.
 */
export interface ContentSwitch {
  /** dd/MM in Vietnam time. */
  date: string;
  daysLeft: number;
  /** A week or less left. */
  urgent: boolean;
}

export function contentSwitch(at: string | null | undefined, now: Date = new Date()): ContentSwitch | null {
  if (!at) return null;
  const when = new Date(at);
  if (Number.isNaN(when.getTime())) return null;
  const daysLeft = Math.max(0, Math.ceil((when.getTime() - now.getTime()) / 86_400_000));
  return {
    date: vietnamDay(when),
    daysLeft,
    urgent: daysLeft <= 7,
  };
}

/** The sentence shown on the course page; a minor change keeps the progress on the new content, a major one starts again. */
export function contentSwitchText(info: ContentSwitch, keepsProgress = false): string {
  const left = info.daysLeft > 0 ? `còn ${info.daysLeft} ngày` : 'hết hạn hôm nay';
  return keepsProgress
    ? `Khóa này cập nhật nội dung ngày ${info.date} (${left}). Học xong trước ngày đó thì giữ kết quả; chưa xong thì bạn học tiếp trên nội dung mới, tiến trình được giữ.`
    : `Khóa này chuyển sang nội dung mới ngày ${info.date} (${left}). Học xong trước hạn để giữ kết quả; sau hạn bạn học lại từ đầu nội dung mới.`;
}
