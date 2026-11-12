import { ROLES } from '../roles';
import type { ScreenDef } from './types';

const MENTOR = [ROLES.MENTOR];

/**
 * Sitemap riêng cho không gian Mentor (/mentor/...).
 * MT-01: Doanh nghiệp được giao (cha) -> MT-02: Chấm bài theo doanh nghiệp (con) -> MT-03: Thẩm định bài làm (lá).
 * MT-04: Tất cả bài nộp (hàng chờ gộp đa doanh nghiệp) -> MT-05: Thẩm định bài làm.
 */
export const MENTOR_SCREENS: ScreenDef[] = [
  { id: 'MT-01', title: 'Doanh nghiệp được giao', path: '/mentor/enterprises', roles: MENTOR, permission: 'trial.review', priority: 'P0' },
  { id: 'MT-02', title: 'Chấm bài theo doanh nghiệp', path: '/mentor/enterprises/:organizationId', roles: MENTOR, permission: 'trial.review', priority: 'P0' },
  { id: 'MT-03', title: 'Thẩm định bài làm doanh nghiệp', path: '/mentor/enterprises/:organizationId/submissions/:submissionId', roles: MENTOR, permission: 'trial.review', priority: 'P0' },
  { id: 'MT-04', title: 'Tất cả bài nộp', path: '/mentor/course-reviews', roles: MENTOR, permission: 'trial.review', priority: 'P0' },
  { id: 'MT-05', title: 'Thẩm định bài làm', path: '/mentor/course-reviews/:submissionId', roles: MENTOR, permission: 'trial.review', priority: 'P0' },
  { id: 'MT-06', title: 'Doanh nghiệp dùng thử (Tạm ẩn)', path: '/mentor/reviews', roles: MENTOR, permission: 'trial.review', priority: 'P1', status: 'RETIRED' },
  { id: 'MT-07', title: 'Chấm bài doanh nghiệp (Tạm ẩn)', path: '/mentor/reviews/:organizationId', roles: MENTOR, permission: 'trial.review', priority: 'P1', status: 'RETIRED' },
  { id: 'SHR-01', title: 'Hồ sơ của tôi', path: '/mentor/account', roles: MENTOR, priority: 'P1' },
  { id: 'SHR-02', title: 'Bảo mật', path: '/mentor/account/security', roles: MENTOR, priority: 'P1' },
  { id: 'SHR-03', title: 'Trung tâm thông báo', path: '/mentor/notifications', roles: MENTOR, priority: 'P1' },
];

export function findMentorScreen(id: string): ScreenDef | undefined {
  return MENTOR_SCREENS.find((s) => s.id === id || s.aliases?.includes(id));
}
