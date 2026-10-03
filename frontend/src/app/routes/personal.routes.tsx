import { Navigate, type RouteObject } from 'react-router-dom';
import { PersonalLayout } from '../layouts/PersonalLayout';
import {
  LearnerDashboardPage,
  LearnerTargetPage,
  LearnerDiagnosticPage,
  LearnerPathPage,
  LearnerCourseDetailPage,
  LearnerClassroomPage,
  LearnerProgressPage,
  LearnerTasksPage,
  LearnerCertificatesPage,
  LearnerSubscriptionPage,
  LearnerBillingPage,
} from '../../features/learner/pages';

export const personalRoutes: RouteObject[] = [
  {
    path: '/personal',
    element: <PersonalLayout />,
    children: [
      { index: true, element: <LearnerDashboardPage /> },
      { path: 'dashboard', element: <LearnerDashboardPage /> },
      { path: 'target', element: <LearnerTargetPage /> },
      { path: 'diagnostic', element: <LearnerDiagnosticPage /> },
      { path: 'path', element: <LearnerPathPage /> },
      { path: 'courses', element: <Navigate to="/personal/path" replace /> },
      { path: 'courses/:id', element: <LearnerCourseDetailPage /> },
      { path: 'classroom/:id', element: <LearnerClassroomPage /> },
      { path: 'progress', element: <LearnerProgressPage /> },
      { path: 'tasks', element: <LearnerTasksPage /> },
      { path: 'certificates', element: <LearnerCertificatesPage /> },
      { path: 'subscription', element: <LearnerSubscriptionPage /> },
      { path: 'billing', element: <LearnerBillingPage /> },
    ],
  },
];
