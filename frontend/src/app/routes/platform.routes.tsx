import { Navigate, type RouteObject } from 'react-router-dom';
import { PlatformLayout } from '../layouts/PlatformLayout';
import { PLATFORM_SCREENS } from '../../lib/screens/platform';
import { buildRoutes, type PageRegistry } from './build-routes';

import { AccountProfilePage } from '../../features/account/pages/AccountProfilePage';
import { SecuritySettingsPage } from '../../features/account/pages/SecuritySettingsPage';
import { NotificationsPage } from '../../features/notifications/pages/NotificationsPage';

import { PlatformDashboardPage } from '../../features/platform/pages/PlatformDashboardPage';
import { PlatformOrganizationsPage } from '../../features/platform/pages/PlatformOrganizationsPage';
import { PlatformOrgDetailPage } from '../../features/platform/pages/PlatformOrgDetailPage';
import { PlatformUsersPage } from '../../features/platform/pages/PlatformUsersPage';
import { PlatformUserDetailPage } from '../../features/platform/pages/PlatformUserDetailPage';
import { PlatformFrameworkPage } from '../../features/platform/pages/PlatformFrameworkPage';
import { PlatformCompetencyDetailPage } from '../../features/platform/pages/PlatformCompetencyDetailPage';
import { PlatformCurriculumPage } from '../../features/platform/pages/PlatformCurriculumPage';
import { PlatformCourseDetailPage } from '../../features/platform/pages/PlatformCourseDetailPage';
import { PlatformCourseEditorPage } from '../../features/platform/pages/PlatformCourseEditorPage';
import { PlatformAssessmentBankPage } from '../../features/platform/pages/PlatformAssessmentBankPage';
import { PlatformQuestionEditorPage } from '../../features/platform/pages/PlatformQuestionEditorPage';
import { PlatformAssessmentTemplatePage } from '../../features/platform/pages/PlatformAssessmentTemplatePage';
import { PlatformPositionsPage } from '../../features/platform/pages/PlatformPositionsPage';
import { PlatformPositionRequirementsPage } from '../../features/platform/pages/PlatformPositionRequirementsPage';
import { PlatformPlansPage } from '../../features/platform/pages/PlatformPlansPage';
import { PlatformPlanDetailPage } from '../../features/platform/pages/PlatformPlanDetailPage';
import { PlatformSubscriptionsPage } from '../../features/platform/pages/PlatformSubscriptionsPage';
import { PlatformSubscriptionDetailPage } from '../../features/platform/pages/PlatformSubscriptionDetailPage';
import { PlatformAuditLogPage } from '../../features/platform/pages/PlatformAuditLogPage';
import { PlatformSettingsPage } from '../../features/platform/pages/PlatformSettingsPage';

/** Built pages by screen ID according to UI/UX spec v2.1 (PA-01..21, SHR-01..03). */
const PLATFORM_PAGES: PageRegistry = {
  // Shared Account and Notification screens for Platform portal
  'SHR-01': AccountProfilePage,
  'SHR-02': SecuritySettingsPage,
  'SHR-03': NotificationsPage,

  // PA-01..21 Primary IDs
  'PA-01': PlatformDashboardPage,
  'PA-02': PlatformOrganizationsPage,
  'PA-03': PlatformOrgDetailPage,
  'PA-04': PlatformUsersPage,
  'PA-05': PlatformUserDetailPage,
  'PA-06': PlatformFrameworkPage,
  'PA-07': PlatformCompetencyDetailPage,
  'PA-08': PlatformCurriculumPage,
  'PA-09': PlatformCourseDetailPage,
  'PA-10': PlatformCourseEditorPage,
  'PA-11': PlatformAssessmentBankPage,
  'PA-12': PlatformQuestionEditorPage,
  'PA-13': PlatformAssessmentTemplatePage,
  'PA-14': PlatformPositionsPage,
  'PA-15': PlatformPositionRequirementsPage,
  'PA-16': PlatformPlansPage,
  'PA-17': PlatformPlanDetailPage,
  'PA-18': PlatformSubscriptionsPage,
  'PA-19': PlatformSubscriptionDetailPage,
  'PA-20': PlatformAuditLogPage,
  'PA-21': PlatformSettingsPage,

  // Backward compatibility aliases
  'PLT-01': PlatformDashboardPage,
  'PLT-02': PlatformOrganizationsPage,
  'PLT-03': PlatformOrgDetailPage,
  'PLT-04': PlatformFrameworkPage,
  'PLT-05': PlatformCurriculumPage,
  'PLT-06': PlatformCurriculumPage,
  'PLT-06E': PlatformCourseEditorPage,
  'PLT-07': PlatformAssessmentBankPage,
  'PLT-08': PlatformPositionsPage,
  'PLT-09': PlatformPositionRequirementsPage,
  'PLT-10': PlatformPlansPage,
  'PLT-11': PlatformSubscriptionsPage,
  'PLT-12': PlatformAuditLogPage,
  'PLT-13': PlatformSettingsPage,
};

export const platformRoutes: RouteObject[] = [
  {
    path: '/platform',
    element: <PlatformLayout />,
    children: [
      { index: true, element: <Navigate to="/platform/dashboard" replace /> },
      ...buildRoutes(PLATFORM_SCREENS, PLATFORM_PAGES, '/platform'),
    ],
  },
];
