import { lazy, Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { CareerCatalogPage } from '../../features/public/career-catalog/CareerCatalogPage';
import { PortalSelectorPage, RootRoute } from '../../features/portal/PortalSelectorPage';
import { PricingPage } from '../../features/commerce/pages/PricingPage';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { BusinessRegisterPage } from '../../features/auth/pages/BusinessRegisterPage';
import { IndividualRegisterPage } from '../../features/auth/pages/IndividualRegisterPage';
import { ActivateInvitationPage } from '../../features/auth/pages/ActivateInvitationPage';
import { ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from '../../features/auth/pages/PasswordPages';

const ExperienceRoute = lazy(() => import('../../features/experience/pages/ExperienceRoute').then(module => ({ default: module.ExperienceRoute })));
const EnterpriseLandingPage = lazy(() => import('../../features/public/pages/LandingPage').then(module => ({ default: module.EnterpriseLandingPage })));
const IndividualLandingPage = lazy(() => import('../../features/public/pages/LandingPage').then(module => ({ default: module.IndividualLandingPage })));

const landingFallback = <div className="min-h-screen bg-black" />;

export const publicRoutes: RouteObject[] = [
  { path: '/experience', element: <Suspense fallback={<div>Đang tải giao diện mẫu…</div>}><ExperienceRoute /></Suspense> },

  // Portal selector: "/" asks once and then remembers; /portal always shows it (spec section 2).
  { path: '/', element: <RootRoute /> },
  { path: '/portal', element: <PortalSelectorPage /> },

  // The landing pages have their own navigation and footer, so they sit outside PublicLayout.
  { path: '/business', element: <Suspense fallback={landingFallback}><EnterpriseLandingPage /></Suspense> },
  { path: '/individual', element: <Suspense fallback={landingFallback}><IndividualLandingPage /></Suspense> },

  { path: '/business/pricing', element: <PricingPage audience="enterprise" /> },
  { path: '/individual/pricing', element: <PricingPage audience="individual" /> },

  // Sign-in and sign-up. One login form, three entrances: the wording and the sign-up link follow the product.
  { path: '/login', element: <LoginPage /> },
  { path: '/business/login', element: <LoginPage portal="enterprise" /> },
  { path: '/individual/login', element: <LoginPage portal="individual" /> },
  { path: '/register', element: <Navigate to="/portal" replace /> },
  { path: '/business/register', element: <BusinessRegisterPage /> },
  { path: '/individual/register', element: <IndividualRegisterPage /> },
  { path: '/activate/:token', element: <ActivateInvitationPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password/:token', element: <ResetPasswordPage /> },
  { path: '/verify-email/:token', element: <VerifyEmailPage /> },

  // Reference positions: public, in the same dark frame as pricing and sign-up.
  { path: '/careers', element: <CareerCatalogPage /> },
  { path: '/careers/:slug', element: <CareerCatalogPage /> },
];
