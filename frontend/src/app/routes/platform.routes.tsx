import { Navigate, type RouteObject } from 'react-router-dom';
import { PLATFORM_SCREENS } from '../../lib/screens/platform';
import { buildRoutes, type PageRegistry } from './build-routes';
import { useCurrentUser } from '../../hooks/use-current-user';
import { getHomePath } from '../../lib/navigation';
import { lazyPage } from './lazy-page';

const PulseAdminLayout = lazyPage(() => import('../../features/platform/PulseAdminLayout'), 'PulseAdminLayout');

const SecuritySettingsPage = lazyPage(() => import('../../features/account/pages/SecuritySettingsPage'), 'SecuritySettingsPage');
const NotificationsPage = lazyPage(() => import('../../features/notifications/pages/NotificationsPage'), 'NotificationsPage');
const PlatformOverviewPage = lazyPage(() => import('../../features/platform/console/PlatformOverviewPage'), 'PlatformOverviewPage');
const PlatformFrameworkPage = lazyPage(() => import('../../features/platform/console/PlatformFrameworkPage'), 'PlatformFrameworkPage');
const PlatformReferencePositionsPage = lazyPage(() => import('../../features/platform/console/PlatformReferencePositions'), 'PlatformReferencePositionsPage');
const PlatformVersionsPage = lazyPage(() => import('../../features/platform/console/PlatformVersionsPage'), 'PlatformVersionsPage');
const PlatformCourseBuilderPage = lazyPage(() => import('../../features/platform/console/PlatformCourseBuilderPage'), 'PlatformCourseBuilderPage');
const PlatformOrganizationsPage = lazyPage(() => import('../../features/platform/console/PlatformOrganizationsPage'), 'PlatformOrganizationsPage');
const PlatformOrganizationDetailPage = lazyPage(() => import('../../features/platform/console/PlatformOrganizationDetailPage'), 'PlatformOrganizationDetailPage');
const PlatformUsersPage = lazyPage(() => import('../../features/platform/console/PlatformUsersPage'), 'PlatformUsersPage');
const PlatformUserDetailPage = lazyPage(() => import('../../features/platform/console/PlatformUserDetailPage'), 'PlatformUserDetailPage');
const PlatformCommercePage = lazyPage(() => import('../../features/platform/console/PlatformCommercePage'), 'PlatformCommercePage');
const PlatformAuditLogPage = lazyPage(() => import('../../features/platform/console/PlatformAuditLogPage'), 'PlatformAuditLogPage');
const PlatformProfilePage = lazyPage(() => import('../../features/platform/console/PlatformProfilePage'), 'PlatformProfilePage');
const PlatformTrialsPage = lazyPage(() => import('../../features/trial-program/pages/PlatformTrialsPage'), 'PlatformTrialsPage');
const MentorTrialsPage = lazyPage(() => import('../../features/trial-program/pages/MentorTrialsPage'), 'MentorTrialsPage');
const MentorTrialPage = lazyPage(() => import('../../features/trial-program/pages/MentorTrialPage'), 'MentorTrialPage');
const MentorCourseReviewsPage = lazyPage(() => import('../../features/trial-program/pages/MentorCourseReviewsPage'), 'MentorCourseReviewsPage');

/**
 * Built pages by screen ID — Platform Admin console (Pulse redesign PA-01..10, Platform Admin v2 PA-12), its profile (SHR-01 = mock `#/profile`
 * of the Platform Admin) + shared account screens.
 */
const PLATFORM_PAGES: PageRegistry = {
  'SHR-01': PlatformProfilePage,
  'SHR-02': SecuritySettingsPage,
  'SHR-03': NotificationsPage,

  'PA-01': PlatformOverviewPage,
  'PA-02': PlatformFrameworkPage,
  'PA-13': PlatformReferencePositionsPage,
  'PA-03': PlatformVersionsPage,
  'PA-12': PlatformVersionsPage,
  'PA-04': PlatformCourseBuilderPage,
  'PA-05': PlatformOrganizationsPage,
  'PA-06': PlatformOrganizationDetailPage,
  'PA-07': PlatformUsersPage,
  'PA-08': PlatformUserDetailPage,
  'PA-09': PlatformCommercePage,
  'PA-10': PlatformAuditLogPage,
  'PA-14': PlatformTrialsPage,
  'MT-01': MentorTrialsPage,
  'MT-02': MentorTrialPage,
  'MT-03': MentorCourseReviewsPage,
};

/** /platform → trang chính theo vai trò (quản trị: tổng quan; mentor: bài cần chấm). */
function PlatformHome() {
  const user = useCurrentUser((s) => s.user);
  return <Navigate to={user ? getHomePath(user) : '/login'} replace />;
}

/** Paths of the previous platform portal, kept as redirects so old links still land somewhere useful. */
const RETIRED_PATHS: [string, string][] = [
  // Before catalog versions (Platform Admin v2): one framework page and a per-course curriculum editor
  ['framework', '/platform/frameworks'],
  ['frameworks/:frameworkId', '/platform/frameworks'],
  ['framework/:id', '/platform/frameworks'],
  ['curriculum', '/platform/versions'],
  ['curriculum/:code', '/platform/versions'],
  ['courses', '/platform/versions'],
  ['courses/:id', '/platform/versions'],
  ['courses/:id/edit', '/platform/versions'],
  ['questions', '/platform/versions'],
  ['questions/:id', '/platform/versions'],
  ['assessment-templates', '/platform/versions'],
  ['positions', '/platform/reference-positions'],
  ['positions/:id/requirements', '/platform/frameworks'],
  ['plans', '/platform/commerce'],
  ['plans/:code', '/platform/commerce'],
  ['subscriptions', '/platform/commerce'],
  ['subscriptions/:id', '/platform/commerce'],
  ['settings', '/platform/dashboard'],
];

export const platformRoutes: RouteObject[] = [
  {
    path: '/platform',
    element: <PulseAdminLayout />,
    children: [
      { index: true, element: <PlatformHome /> },
      ...buildRoutes(PLATFORM_SCREENS, PLATFORM_PAGES, '/platform'),
      ...RETIRED_PATHS.map(([path, to]) => ({ path, element: <Navigate to={to} replace /> })),
    ],
  },
];
