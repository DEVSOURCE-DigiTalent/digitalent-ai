import { Navigate, type RouteObject } from 'react-router-dom';
import { LearnerLayout } from '../layouts/LearnerLayout';
import { AuthGuard } from '../../components/guards/AuthGuard';
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
} from '../../features/learner/pages';

export const learnerRoutes: RouteObject[] = [
  {
    path: '/learn',
    element: <AuthGuard><LearnerLayout /></AuthGuard>,
    children: [
      { index: true, element: <LearnerDashboardPage /> },
      { path: 'dashboard', element: <LearnerDashboardPage /> },
      { path: 'target', element: <LearnerTargetPage /> },
      { path: 'diagnostic', element: <LearnerDiagnosticPage /> },
      { path: 'path', element: <LearnerPathPage /> },
      { path: 'courses', element: <Navigate to="/learn/path" replace /> },
      { path: 'courses/:id', element: <LearnerCourseDetailPage /> },
      { path: 'classroom/:id', element: <LearnerClassroomPage /> },
      { path: 'progress', element: <LearnerProgressPage /> },
      { path: 'tasks', element: <LearnerTasksPage /> },
      { path: 'certificates', element: <LearnerCertificatesPage /> },
    ],
  },
];
