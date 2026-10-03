/**
 * Feature entitlements granted by a Subscription/Plan (UI/UX spec FLOW-07).
 * The plan decides whether a feature exists; the role decides who may use it.
 */
export const ENTITLEMENTS = {
  INTERNAL_LEARNING: 'internal_learning',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  BULK_IMPORT: 'bulk_import',
  PRACTICAL_TASKS: 'practical_tasks',
  PERSONAL_LEARNING_PATH: 'personal_learning_path',
} as const;

export type Entitlement = (typeof ENTITLEMENTS)[keyof typeof ENTITLEMENTS];

export const ENTITLEMENT_LABELS: Record<Entitlement, string> = {
  internal_learning: 'Khóa học nội bộ doanh nghiệp',
  advanced_analytics: 'Phân tích năng lực nâng cao',
  bulk_import: 'Nhập nhân viên hàng loạt',
  practical_tasks: 'Nhiệm vụ thực hành và bằng chứng',
  personal_learning_path: 'Lộ trình học cá nhân',
};
