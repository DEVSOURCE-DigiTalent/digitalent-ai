import { Navigate } from 'react-router-dom';
import { useIsPulseManager } from '@/features/pulse-manager/lib/use-is-pulse-manager';
import { createElement, type ComponentType } from 'react';
import type { PageRegistry } from '../build-routes';
import { lazyPage } from '../lazy-page';

const OwnerTasksPage = lazyPage(() => import('../../../features/organization/pages/OwnerTasksPage'), 'OwnerTasksPage');
const OwnerNewTaskPage = lazyPage(() => import('../../../features/organization/pages/OwnerNewTaskPage'), 'OwnerNewTaskPage');
const OwnerTaskDetailPage = lazyPage(() => import('../../../features/organization/pages/OwnerTaskDetailPage'), 'OwnerTaskDetailPage');
const OwnerReviewDetailPage = lazyPage(() => import('../../../features/organization/pages/OwnerReviewDetailPage'), 'OwnerReviewDetailPage');
const AccountProfilePage = lazyPage(() => import('../../../features/account/pages/AccountProfilePage'), 'AccountProfilePage');
const MyFeedbacksPage = lazyPage(() => import('../../../features/feedback/pages/MyFeedbacksPage'), 'MyFeedbacksPage');
const MyBugReportsPage = lazyPage(() => import('../../../features/feedback/pages/MyBugReportsPage'), 'MyBugReportsPage');
const SecuritySettingsPage = lazyPage(() => import('../../../features/account/pages/SecuritySettingsPage'), 'SecuritySettingsPage');
const ManagerEvidencePage = lazyPage(() => import('../../../features/pulse-manager/pages/ManagerEvidencePage'), 'ManagerEvidencePage');
const RoleAwareNotificationsPage = lazyPage(() => import('../../../features/pulse-manager/components/RoleAwarePages'), 'RoleAwareNotificationsPage');

function withoutManager(Page: ComponentType) {
  return function WorkPage() {
    const isManager = useIsPulseManager();
    return isManager ? createElement(Navigate, { to: '/enterprise/team', replace: true }) : createElement(Page);
  };
}

/** Shared Work (Practical tasks, evidence review) and Shared Topbar/Account pages. */
export const WORK_PAGES: PageRegistry = {
  'MG-08': withoutManager(OwnerTasksPage),

  'MG-09': withoutManager(OwnerNewTaskPage),

  'MG-10': withoutManager(OwnerTaskDetailPage),

  'MG-11': withoutManager(ManagerEvidencePage),

  'MG-12': withoutManager(OwnerReviewDetailPage),

  // Shared Account & Notifications
  'SHR-01': AccountProfilePage,
  'SHR-02': SecuritySettingsPage,
  'SHR-03': RoleAwareNotificationsPage,
  'SHR-04': MyFeedbacksPage,
  'SHR-05': MyBugReportsPage,
};
