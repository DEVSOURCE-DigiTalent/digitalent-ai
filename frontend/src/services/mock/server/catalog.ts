import type { CompetencyCriterion } from '../../competency.service';
import { REFERENCE_POSITIONS, TT02_COMPETENCY_NAMES } from '../../../lib/reference-positions';
import {
  MODULES_PER_DOMAIN, STANDARD_COURSE_TITLES, standardCourseCode, standardCourseMinutes,
} from '../../../lib/standard-courses';

/**
 * Standard content of the platform: the 24 competencies of Circular 02/2025/TT-BGDĐT, the five reference
 * positions and the 18 standard courses. Source: docs/specs/2026-09-29-tt02-position-competency-matrix.md.
 * Customers read it; only the platform changes it.
 */

export interface CatalogCategory {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
}

export interface CatalogCompetency {
  id: string;
  /** "4.2" */
  frameworkCode: string;
  code: string;
  name: string;
  categoryId: string;
  description: string;
  criteria: CompetencyCriterion[];
}

export const CATEGORIES: CatalogCategory[] = [
  { id: 'cat-1', code: 'D1', name: 'Khai thác dữ liệu và thông tin', sortOrder: 1 },
  { id: 'cat-2', code: 'D2', name: 'Giao tiếp và hợp tác trong môi trường số', sortOrder: 2 },
  { id: 'cat-3', code: 'D3', name: 'Sáng tạo nội dung số', sortOrder: 3 },
  { id: 'cat-4', code: 'D4', name: 'An toàn', sortOrder: 4 },
  { id: 'cat-5', code: 'D5', name: 'Giải quyết vấn đề', sortOrder: 5 },
  { id: 'cat-6', code: 'D6', name: 'Ứng dụng trí tuệ nhân tạo', sortOrder: 6 },
];

const LEVEL_INDICATORS: Record<number, string> = {
  1: 'Thực hiện được với hướng dẫn, trong tình huống quen thuộc và đơn giản.',
  2: 'Tự thực hiện độc lập, chọn được cách làm phù hợp cho tình huống thông thường trong công việc.',
  3: 'Xử lý được tình huống phức tạp, hướng dẫn người khác và đề xuất cải tiến cho tổ chức.',
};

const LEVEL_EVIDENCE: Record<number, string> = {
  1: 'Hoàn thành bài đánh giá cơ bản của khóa học.',
  2: 'Hoàn thành bài đánh giá và một nhiệm vụ thực hành được quản lý xác nhận.',
  3: 'Hoàn thành nhiệm vụ thực hành phức tạp và được quản lý hoặc quản trị học tập xác nhận.',
};

function criteriaFor(frameworkCode: string): CompetencyCriterion[] {
  return [1, 2, 3].map((level) => ({
    id: `crit-${frameworkCode}-${level}`,
    level,
    indicatorCode: `${frameworkCode}.${level}`,
    behaviorIndicator: LEVEL_INDICATORS[level],
    assessmentGuidance: 'Đánh giá qua câu hỏi tình huống gắn với công việc của vị trí.',
    evidenceGuidance: LEVEL_EVIDENCE[level],
    sourceNote: 'Khung chuẩn năng lực số',
    sortOrder: level,
  }));
}

export const COMPETENCIES: CatalogCompetency[] = Object.entries(TT02_COMPETENCY_NAMES).map(([frameworkCode, name]) => ({
  id: `cmp-${frameworkCode.replace('.', '-')}`,
  frameworkCode,
  code: `CMP-${frameworkCode}`,
  name,
  categoryId: `cat-${frameworkCode.split('.')[0]}`,
  description: `Năng lực ${frameworkCode} của Khung chuẩn năng lực số.`,
  criteria: criteriaFor(frameworkCode),
}));

export const COMPETENCY_BY_ID = new Map(COMPETENCIES.map((c) => [c.id, c]));
export const COMPETENCY_BY_FRAMEWORK_CODE = new Map(COMPETENCIES.map((c) => [c.frameworkCode, c]));
export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

// ── Reference positions: required level per competency (spec section 4.1) ──

export type ReferencePositionCode = 'CEO' | 'HR' | 'MARKETING' | 'SALES_CRM' | 'ACCOUNTANT';

export const REFERENCE_POSITION_ORDER: ReferencePositionCode[] = ['CEO', 'HR', 'MARKETING', 'SALES_CRM', 'ACCOUNTANT'];

const COMPETENCY_ORDER = Object.keys(TT02_COMPETENCY_NAMES);

/** Required level (0 = not required) of a competency for a reference position; the data lives in lib/reference-positions. */
export function referenceLevel(position: ReferencePositionCode, frameworkCode: string): number {
  const levels = REFERENCE_POSITIONS.find((reference) => reference.code === position)?.levels;
  const index = COMPETENCY_ORDER.indexOf(frameworkCode);
  return levels && index >= 0 ? levels[index] : 0;
}

// ── Standard courses ──

export interface CatalogCourse {
  id: string;
  code: string;
  title: string;
  categoryId: string;
  /** 1 Cơ bản (F), 2 Trung cấp (I), 3 Nâng cao (A). */
  level: number;
  /** Level a learner needs before taking the course (level - 1). */
  entryLevel: number;
  modules: number;
  estimatedDurationMinutes: number;
  prerequisiteCourseId?: string;
  status: 'PUBLISHED' | 'DRAFT';
}

export const COURSES: CatalogCourse[] = [1, 2, 3, 4, 5, 6].flatMap((domain) =>
  [1, 2, 3].map((level): CatalogCourse => ({
    id: `crs-${standardCourseCode(domain, level)}`,
    code: standardCourseCode(domain, level),
    title: STANDARD_COURSE_TITLES[domain][level - 1],
    categoryId: `cat-${domain}`,
    level,
    entryLevel: level - 1,
    modules: MODULES_PER_DOMAIN[domain],
    estimatedDurationMinutes: standardCourseMinutes(domain, level),
    prerequisiteCourseId: level > 1 ? `crs-${standardCourseCode(domain, level - 1)}` : undefined,
    status: 'PUBLISHED',
  })),
);

/** One unpublished course, so the catalog shows that drafts are never offered or recommended. */
COURSES.push({
  id: 'crs-DRAFT-1',
  code: 'DRAFT-1',
  title: 'Làm việc từ xa an toàn (bản nháp)',
  categoryId: 'cat-4',
  level: 1,
  entryLevel: 0,
  modules: 2,
  estimatedDurationMinutes: 120,
  status: 'DRAFT',
});

export const COURSE_BY_ID = new Map(COURSES.map((c) => [c.id, c]));

/** The standard course of a domain at a level, if any. */
export function courseFor(categoryId: string, level: number): CatalogCourse | undefined {
  return COURSES.find((c) => c.categoryId === categoryId && c.level === level && c.status === 'PUBLISHED');
}
