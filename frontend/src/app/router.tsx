import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { NotFoundPage } from '../features/auth/pages/NotFoundPage';

import { publicRoutes } from './routes/public.routes';
import { learnerRoutes } from './routes/learner.routes';
import { enterpriseRoutes } from './routes/enterprise.routes';

/**
 * Application router mapping to Screen Specification Document routes.
 */
export const routes = [
  // ── Public Routes (Landing, Careers, Verify) ──
  ...publicRoutes,

  // ── Learner Routes (Learn) ──
  ...learnerRoutes,

  // ── Enterprise Routes (Dashboard, Admin, HR, etc.) ──
  ...enterpriseRoutes,

  // ── Auth ──
  { path: '/login', element: <LoginPage /> },

  // ── Legacy Redirects ──
  { path: '/organization/departments', element: <Navigate to="/enterprise/organization/departments" replace /> },
  { path: '/organization/positions', element: <Navigate to="/enterprise/organization/positions" replace /> },
  { path: '/organization/employees', element: <Navigate to="/enterprise/organization/employees" replace /> },
  { path: '/dashboard', element: <Navigate to="/enterprise/dashboard" replace /> },
  { path: '/my-dashboard', element: <Navigate to="/enterprise/my-dashboard" replace /> },
  { path: '/admin/*', element: <Navigate to="/enterprise/admin" replace /> },
  { path: '/competency-framework/*', element: <Navigate to="/enterprise/competency-framework" replace /> },
  { path: '/courses', element: <Navigate to="/enterprise/courses" replace /> },

  // ── Catch-all ──
  { path: '*', element: <NotFoundPage /> },
];

export const router = createBrowserRouter(routes);
