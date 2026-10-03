import { createBrowserRouter } from 'react-router-dom';
import { NotFoundPage } from '../features/auth/pages/NotFoundPage';

import { publicRoutes } from './routes/public.routes';
import { personalRoutes } from './routes/personal.routes';
import { enterpriseRoutes } from './routes/enterprise.routes';
import { platformRoutes } from './routes/platform.routes';
import { onboardingRoutes } from './routes/onboarding.routes';
import { legacyRedirectRoutes } from './routes/legacy-redirects';

/**
 * Application router. Three portals (UI/UX spec section 2): Enterprise, Personal, Platform.
 */
export const routes = [
  // ── Public Routes (Landing, Careers) ──
  ...publicRoutes,

  // ── Checkout and organization setup (after sign-up) ──
  ...onboardingRoutes,

  // ── Portals ──
  ...personalRoutes,
  ...enterpriseRoutes,
  ...platformRoutes,

  // ── Legacy Redirects (pre-restructure paths) ──
  ...legacyRedirectRoutes,

  // ── Catch-all ──
  { path: '*', element: <NotFoundPage /> },
];

export const router = createBrowserRouter(routes);
