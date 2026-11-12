import { Navigate, type RouteObject } from 'react-router-dom';
import { MENTOR_SCREENS } from '../../lib/screens/mentor';
import { buildRoutes, type PageRegistry } from './build-routes';
import { lazyPage } from './lazy-page';

const MentorLayout = lazyPage(() => import('../../features/mentor/MentorLayout'), 'MentorLayout');
const MentorEnterprisesPage = lazyPage(
  () => import('../../features/trial-program/pages/MentorEnterprisesPage'),
  'MentorEnterprisesPage',
);
const MentorCourseReviewsPage = lazyPage(
  () => import('../../features/trial-program/pages/MentorCourseReviewsPage'),
  'MentorCourseReviewsPage',
);
const MentorCourseReviewWorkspacePage = lazyPage(
  () => import('../../features/trial-program/pages/MentorCourseReviewWorkspacePage'),
  'MentorCourseReviewWorkspacePage',
);
const MentorProfilePage = lazyPage(() => import('../../features/mentor/MentorProfilePage'), 'MentorProfilePage');
const SecuritySettingsPage = lazyPage(
  () => import('../../features/account/pages/SecuritySettingsPage'),
  'SecuritySettingsPage',
);
const NotificationsPage = lazyPage(
  () => import('../../features/notifications/pages/NotificationsPage'),
  'NotificationsPage',
);

/** Tạm ẩn đường dẫn cũ /mentor/reviews để đưa điều hướng về danh sách doanh nghiệp được giao. */
function HiddenMentorReviewsRedirect() {
  return <Navigate to="/mentor/enterprises" replace />;
}

const MENTOR_PAGES: PageRegistry = {
  'MT-01': MentorEnterprisesPage,
  'MT-02': MentorCourseReviewsPage,
  'MT-03': MentorCourseReviewWorkspacePage,
  'MT-04': MentorCourseReviewsPage,
  'MT-05': MentorCourseReviewWorkspacePage,
  'MT-06': HiddenMentorReviewsRedirect,
  'MT-07': HiddenMentorReviewsRedirect,
  'SHR-01': MentorProfilePage,
  'SHR-02': SecuritySettingsPage,
  'SHR-03': NotificationsPage,
};

export const mentorRoutes: RouteObject[] = [
  {
    path: '/mentor',
    element: <MentorLayout />,
    children: [
      { index: true, element: <Navigate to="/mentor/enterprises" replace /> },
      ...buildRoutes(MENTOR_SCREENS, MENTOR_PAGES, '/mentor'),
    ],
  },
];
