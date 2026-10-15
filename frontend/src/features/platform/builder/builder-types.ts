import type { CatalogCourseDetail } from '@/services/platform-catalog.service';

/** Runs one course-builder edit; the server returns the whole course, which replaces the cached one. */
export type CourseEdit = (edit: (versionNo: number, courseId: string) => Promise<CatalogCourseDetail>) => Promise<CatalogCourseDetail>;

/** The four kinds of content block offered by the "+" of a module. */
export const BLOCK_TYPES = {
  TEXT: { label: 'Chữ', glyph: 'T', hint: 'Đoạn văn có định dạng như Word' },
  SLIDE: { label: 'Slide', glyph: '⇆', hint: 'Dải ảnh cuộn ngang, chen được video' },
  IMAGE: { label: 'Ảnh', glyph: '▣', hint: 'Một ảnh kèm chú thích' },
  VIDEO: { label: 'Video', glyph: '▶', hint: 'Tải video lên từ máy' },
} as const;
