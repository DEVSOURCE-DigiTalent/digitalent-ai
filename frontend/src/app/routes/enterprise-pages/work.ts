import type { PageRegistry } from '../build-routes';

import { OwnerTasksPage } from '../../../features/organization/pages/OwnerTasksPage';
import { OwnerNewTaskPage } from '../../../features/organization/pages/OwnerNewTaskPage';
import { OwnerTaskDetailPage } from '../../../features/organization/pages/OwnerTaskDetailPage';
import { OwnerReviewDetailPage } from '../../../features/organization/pages/OwnerReviewDetailPage';
import { AccountProfilePage } from '../../../features/account/pages/AccountProfilePage';
import { SecuritySettingsPage } from '../../../features/account/pages/SecuritySettingsPage';
import { RoleAwareEvidencePage, RoleAwareNotificationsPage } from '../../../features/pulse-manager/components/RoleAwarePages';

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
