/**
 * Terminology glossary (frozen per UI/UX spec v2.1 §1.3, §4.6).
 * Single source of truth for UI labels across all 3 portals.
 */

export const TERMS = {
  // Job Grade
  JOB_GRADE: 'Cấp bậc',
  JOB_GRADE_CODES: ['G1', 'G2', 'G3'] as const,

  // Position Competency Requirements (3 levels)
  REQUIRED_COMPETENCY_LEVEL: 'Trình độ năng lực yêu cầu',
  COMPETENCY_LEVEL_BASIC: 'Cơ bản',
  COMPETENCY_LEVEL_INTERMEDIATE: 'Trung cấp',
  COMPETENCY_LEVEL_ADVANCED: 'Nâng cao',

  // Employee Competency State
  CURRENT_COMPETENCY_LEVEL: 'Trình độ hiện tại',
  CONFIRMED_COMPETENCY_LEVEL: 'Trình độ đã xác nhận',
  UNCONFIRMED: 'Chưa xác nhận',

  // TT02 Detailed Framework Tiers (1 to 8)
  TT02_TIER: 'Bậc năng lực',
  tt02TierLabel: (tier: number | string) => `Bậc ${tier}`,

  // Skill Gap Severity
  SEVERITY: 'Mức độ',
  SEVERITY_HIGH: 'Cao',
  SEVERITY_MEDIUM: 'Trung bình',
  SEVERITY_LOW: 'Thấp',

  // Training Batch
  TRAINING_BATCH: 'Đợt đào tạo',

  // System Role
  ROLE: 'Vai trò',
  ROLE_OWNER: 'Chủ doanh nghiệp',
  ROLE_MANAGER: 'Quản lý',
  ROLE_EMPLOYEE: 'Nhân viên',
  ROLE_PLATFORM_ADMIN: 'Quản trị nền tảng',
} as const;

export type JobGradeCode = (typeof TERMS.JOB_GRADE_CODES)[number];
export const JOB_GRADES = TERMS.JOB_GRADE_CODES;

export const JOB_GRADE_DEFAULT_NAMES: Record<JobGradeCode, string> = {
  G1: 'Nhân viên',
  G2: 'Phó phòng',
  G3: 'Trưởng phòng',
};

export const JOB_GRADE_DEFAULT_DESCRIPTIONS: Record<JobGradeCode, string> = {
  G1: 'Cấp bậc nhân viên thực thi trực tiếp công việc chuyên môn.',
  G2: 'Cấp bậc quản lý cấp phó hoặc chuyên gia phụ trách mảng.',
  G3: 'Cấp bậc trưởng phòng hoặc quản lý cấp cao phụ trách phòng ban.',
};
