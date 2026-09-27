import type { RouteObject } from 'react-router-dom';
import { LearnerLayout } from '../layouts/LearnerLayout';
import { LearnerShellPage } from '../../features/learner/shell/LearnerShellPage';

export const learnerRoutes: RouteObject[] = [
  {
    path: '/learn',
    element: <LearnerLayout />,
    children: [
      { path: '*', element: <LearnerShellPage /> },
    ],
  },
];
