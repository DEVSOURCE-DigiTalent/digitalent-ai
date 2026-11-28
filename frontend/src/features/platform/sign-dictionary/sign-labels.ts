import { SIGN_KIND_LABELS, type SignGloss, type SignGlossQuery, type SignGlossSummary } from '@/services/sign-dictionary.service';
import { regionLabel } from '@/lib/sign-video';

export const STATUS_LABELS: Record<SignGloss['status'], { label: string; tone: string }> = {
  DRAFT: { label: 'Nháp', tone: 'gray' },
  PUBLISHED: { label: 'Đã xuất bản', tone: 'green' },
  ARCHIVED: { label: 'Đã xóa', tone: 'coral' },
};

export const formatDuration = (ms: number | null) =>
  (ms == null ? '' : `${(ms / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} giây`);

/** A gloss from a video file name: extension dropped, "_" and "-" read as spaces, NFC (macOS names arrive decomposed). */
export const glossFromFileName = (name: string) =>
  name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().normalize('NFC');

/** The dictionary's tabs: where each sign is in its making (video → motion → published). */
export type SignView = 'ALL' | 'NO_VIDEO' | 'NEEDS_MOTION' | 'READY' | 'PUBLISHED';

export const SIGN_VIEWS: { id: SignView; label: string; count: (summary: SignGlossSummary) => number }[] = [
  { id: 'ALL', label: 'Tất cả', count: (s) => s.total },
  { id: 'NO_VIDEO', label: 'Chưa có video', count: (s) => s.noVideo },
  { id: 'NEEDS_MOTION', label: 'Cần lấy chuyển động', count: (s) => s.needsMotion },
  { id: 'READY', label: 'Chờ xuất bản', count: (s) => s.ready },
  { id: 'PUBLISHED', label: 'Đã xuất bản', count: (s) => s.published },
];

/** The list filters of a tab. */
export function viewQuery(view: SignView): Pick<SignGlossQuery, 'status' | 'stage'> {
  switch (view) {
    case 'NO_VIDEO': return { status: '', stage: 'NO_VIDEO' };
    case 'NEEDS_MOTION': return { status: '', stage: 'NEEDS_MOTION' };
    case 'READY': return { status: '', stage: 'READY' };
    case 'PUBLISHED': return { status: 'PUBLISHED', stage: '' };
    default: return { status: '', stage: '' };
  }
}

export const isSignView = (value: string | null): value is SignView => SIGN_VIEWS.some((view) => view.id === value);

/** The three steps of a sign and the next one to do (null = published, nothing left). */
export type SignStep = 'VIDEO' | 'MOTION' | 'PUBLISH';

export function signProgress(gloss: Pick<SignGloss, 'video' | 'hasMotion' | 'status'>) {
  const video = Boolean(gloss.video);
  const motion = video && gloss.hasMotion;
  const published = gloss.status === 'PUBLISHED';
  const next: SignStep | null = !video ? 'VIDEO' : !motion ? 'MOTION' : !published ? 'PUBLISH' : null;
  const done = published ? 3 : motion ? 2 : video ? 1 : 0;
  const label = [video ? 'có video' : 'chưa có video', motion ? 'có chuyển động' : 'chưa có chuyển động', published ? 'đã xuất bản' : 'chưa xuất bản'].join(', ');
  return { video, motion, published, next, done, label: label.charAt(0).toUpperCase() + label.slice(1) };
}

/** What tells two signs of the same word apart, only when it says something (a word, nationwide, is the default). */
export function signMeta(gloss: Pick<SignGloss, 'kind' | 'region' | 'variant' | 'isPreferred'>): string {
  return [
    gloss.kind !== 'WORD' ? SIGN_KIND_LABELS[gloss.kind] : null,
    gloss.region && gloss.region !== 'VN' ? regionLabel(gloss.region) : null,
    gloss.variant || null,
    gloss.isPreferred ? 'mặc định' : null,
  ].filter(Boolean).join(' · ');
}
