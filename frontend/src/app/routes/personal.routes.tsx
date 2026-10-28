import { Suspense, type ReactNode } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { lazyPage } from './lazy-page';
import { RouteFallback } from './build-routes';

const PersonalLayout = lazyPage(() => import('../layouts/PersonalLayout'), 'PersonalLayout');

const LearnerDashboardPage = lazyPage(() => import('../../features/learner/pages'), 'LearnerDashboardPage');
const LearnerTargetPage = lazyPage(() => import('../../features/learner/pages'), 'LearnerTargetPage');
const LearnerDiagnosticPage = lazyPage(() => import('../../features/learner/pages'), 'LearnerDiagnosticPage');
const LearnerPathPage = lazyPage(() => import('../../features/learner/pages'), 'LearnerPathPage');
const LearnerCourseDetailPage = lazyPage(() => import('../../features/learner/pages'), 'LearnerCourseDetailPage');
const LearnerClassroomPage = lazyPage(() => import('../../features/learner/pages'), 'LearnerClassroomPage');
const LearnerProgressPage = lazyPage(() => import('../../features/learner/pages'), 'LearnerProgressPage');
const LearnerTasksPage = lazyPage(() => import('../../features/learner/pages'), 'LearnerTasksPage');
const LearnerCertificatesPage = lazyPage(() => import('../../features/learner/pages'), 'LearnerCertificatesPage');
const LearnerSubscriptionPage = lazyPage(() => import('../../features/learner/pages'), 'LearnerSubscriptionPage');
const LearnerBillingPage = lazyPage(() => import('../../features/learner/pages'), 'LearnerBillingPage');

const page = (element: ReactNode) => <Suspense fallback={<RouteFallback />}>{element}</Suspense>;

export const personalRoutes: RouteObject[] = [
  {
    path: '/personal',
    element: <PersonalLayout />,
    children: [
      { index: true, element: page(<LearnerDashboardPage />) },
      { path: 'dashboard', element: page(<LearnerDashboardPage />) },
      { path: 'target', element: page(<LearnerTargetPage />) },
      { path: 'diagnostic', element: page(<LearnerDiagnosticPage />) },
      { path: 'path', element: page(<LearnerPathPage />) },
      { path: 'courses', element: <Navigate to="/personal/path" replace /> },
      { path: 'courses/:id', element: page(<LearnerCourseDetailPage />) },
      { path: 'classroom/:id', element: page(<LearnerClassroomPage />) },
      { path: 'progress', element: page(<LearnerProgressPage />) },
      { path: 'tasks', element: page(<LearnerTasksPage />) },
      { path: 'certificates', element: page(<LearnerCertificatesPage />) },
      { path: 'subscription', element: page(<LearnerSubscriptionPage />) },
      { path: 'billing', element: page(<LearnerBillingPage />) },
    ],
  },
];
