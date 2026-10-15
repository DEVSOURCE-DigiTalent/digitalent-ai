import { Navigate, type RouteObject } from 'react-router-dom';
import { PLATFORM_SCREENS } from '../../lib/screens/platform';
import { buildRoutes, type PageRegistry } from './build-routes';

import { SecuritySettingsPage } from '../../features/account/pages/SecuritySettingsPage';
import { NotificationsPage } from '../../features/notifications/pages/NotificationsPage';

import { PulseAdminLayout } from '../../features/platform/PulseAdminLayout';
import { PlatformOverviewPage } from '../../features/platform/console/PlatformOverviewPage';
import { PlatformFrameworkPage } from '../../features/platform/console/PlatformFrameworkPage';
import { PlatformVersionsPage } from '../../features/platform/console/PlatformVersionsPage';
import { PlatformCourseBuilderPage } from '../../features/platform/console/PlatformCourseBuilderPage';
import { PlatformOrganizationsPage } from '../../features/platform/console/PlatformOrganizationsPage';
import { PlatformOrganizationDetailPage } from '../../features/platform/console/PlatformOrganizationDetailPage';
import { PlatformUsersPage } from '../../features/platform/console/PlatformUsersPage';
import { PlatformUserDetailPage } from '../../features/platform/console/PlatformUserDetailPage';
import { PlatformCommercePage } from '../../features/platform/console/PlatformCommercePage';
import { PlatformAuditLogPage } from '../../features/platform/console/PlatformAuditLogPage';
import { PlatformProfilePage } from '../../features/platform/console/PlatformProfilePage';

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
  'PA-03': PlatformVersionsPage,
  'PA-12': PlatformVersionsPage,
  'PA-04': PlatformCourseBuilderPage,
  'PA-05': PlatformOrganizationsPage,
  'PA-06': PlatformOrganizationDetailPage,
  'PA-07': PlatformUsersPage,
  'PA-08': PlatformUserDetailPage,
  'PA-09': PlatformCommercePage,
  'PA-10': PlatformAuditLogPage,
};

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
  ['positions', '/platform/frameworks'],
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
      { index: true, element: <Navigate to="/platform/dashboard" replace /> },
      ...buildRoutes(PLATFORM_SCREENS, PLATFORM_PAGES, '/platform'),
      ...RETIRED_PATHS.map(([path, to]) => ({ path, element: <Navigate to={to} replace /> })),
    ],
  },
];
