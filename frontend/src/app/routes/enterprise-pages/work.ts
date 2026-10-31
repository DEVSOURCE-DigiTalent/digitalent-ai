import type { PageRegistry } from '../build-routes';
import { lazyPage } from '../lazy-page';

const OwnerTasksPage = lazyPage(() => import('../../../features/organization/pages/OwnerTasksPage'), 'OwnerTasksPage');
const OwnerNewTaskPage = lazyPage(() => import('../../../features/organization/pages/OwnerNewTaskPage'), 'OwnerNewTaskPage');
const OwnerTaskDetailPage = lazyPage(() => import('../../../features/organization/pages/OwnerTaskDetailPage'), 'OwnerTaskDetailPage');
const OwnerReviewDetailPage = lazyPage(() => import('../../../features/organization/pages/OwnerReviewDetailPage'), 'OwnerReviewDetailPage');
const AccountProfilePage = lazyPage(() => import('../../../features/account/pages/AccountProfilePage'), 'AccountProfilePage');
const SecuritySettingsPage = lazyPage(() => import('../../../features/account/pages/SecuritySettingsPage'), 'SecuritySettingsPage');
const RoleAwareEvidencePage = lazyPage(() => import('../../../features/pulse-manager/components/RoleAwarePages'), 'RoleAwareEvidencePage');
const RoleAwareNotificationsPage = lazyPage(() => import('../../../features/pulse-manager/components/RoleAwarePages'), 'RoleAwareNotificationsPage');

/** Shared Work (Practical tasks, evidence review) and Shared Topbar/Account pages. */
export const WORK_PAGES: PageRegistry = {
  // Shared Work (OW-35..39 / MG-08..12)
  'OW-35': OwnerTasksPage,
  'MG-08': OwnerTasksPage,

  'OW-36': OwnerNewTaskPage,
  'MG-09': OwnerNewTaskPage,

  'OW-37': OwnerTaskDetailPage,
  'MG-10': OwnerTaskDetailPage,

  // Quản lý (khung Pulse) thấy "Minh chứng thực tế"; chủ doanh nghiệp giữ OwnerReviewsPage.
  'OW-38': RoleAwareEvidencePage,
  'MG-11': RoleAwareEvidencePage,

  'OW-39': OwnerReviewDetailPage,
  'MG-12': OwnerReviewDetailPage,

  // Shared Account & Notifications
  'SHR-01': AccountProfilePage,
  'SHR-02': SecuritySettingsPage,
  'SHR-03': RoleAwareNotificationsPage,
};
