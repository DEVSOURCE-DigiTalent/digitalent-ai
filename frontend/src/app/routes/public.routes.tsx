import { lazy, Suspense } from 'react';
import { Navigate, useLocation, type RouteObject } from 'react-router-dom';
import { CareerCatalogPage } from '../../features/public/career-catalog/CareerCatalogPage';
import { PortalSelectorPage, RootRoute } from '../../features/portal/PortalSelectorPage';
import { PricingPage } from '../../features/commerce/pages/PricingPage';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { BusinessRegisterPage } from '../../features/auth/pages/BusinessRegisterPage';
import { TrialAcceptPage as EnterpriseTrialAcceptPage, TrialRegisterPage as EnterpriseTrialRegisterPage, TrialVerifyPage as EnterpriseTrialVerifyPage } from '../../features/experience/enterprise-trial/PublicTrialPages';
import { IndividualRegisterPage } from '../../features/auth/pages/IndividualRegisterPage';
import { ActivateInvitationPage } from '../../features/auth/pages/ActivateInvitationPage';
import { ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from '../../features/auth/pages/PasswordPages';
import { PublicVerifyPage } from '../../features/public/pages/PublicVerifyPage';

const ExperienceRoute = lazy(() => import('../../features/experience/pages/ExperienceRoute').then(module => ({ default: module.ExperienceRoute })));
const IndividualTrialPage = lazy(() => import('../../features/experience/pages/IndividualTrialPage').then(module => ({ default: module.IndividualTrialPage })));
const EnterpriseLandingPage = lazy(() => import('../../features/public/pages/LandingPage').then(module => ({ default: module.EnterpriseLandingPage })));
const IndividualLandingPage = lazy(() => import('../../features/public/pages/LandingPage').then(module => ({ default: module.IndividualLandingPage })));

const landingFallback = <div className="min-h-screen bg-black" />;

/** Old bookmarks and emails still point at /business/login and /individual/login; keep their returnTo. */
function LegacyLoginRedirect() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/login', search }} replace />;
}

export const publicRoutes: RouteObject[] = [
  { path: '/experience', element: <Suspense fallback={<div>Đang tải giao diện mẫu…</div>}><ExperienceRoute /></Suspense> },

  // Portal selector: "/" asks once and then remembers; /portal always shows it (spec section 2).
  { path: '/', element: <RootRoute /> },
  { path: '/portal', element: <PortalSelectorPage /> },

  // The landing pages have their own navigation and footer, so they sit outside PublicLayout.
  { path: '/business', element: <Suspense fallback={landingFallback}><EnterpriseLandingPage /></Suspense> },
  { path: '/business/try', element: <EnterpriseTrialRegisterPage /> },
  { path: '/business/try/verify', element: <EnterpriseTrialVerifyPage /> },
  { path: '/business/try/accept', element: <EnterpriseTrialAcceptPage /> },
  { path: '/individual', element: <Suspense fallback={landingFallback}><IndividualLandingPage /></Suspense> },
  { path: '/individual/try', element: <Suspense fallback={landingFallback}><IndividualTrialPage /></Suspense> },

  { path: '/business/pricing', element: <PricingPage audience="enterprise" /> },
  { path: '/individual/pricing', element: <PricingPage audience="individual" /> },

  // Sign-in and sign-up. One login page for businesses and individuals; the old per-product addresses forward to it.
  { path: '/login', element: <LoginPage /> },
  { path: '/business/login', element: <LegacyLoginRedirect /> },
  { path: '/individual/login', element: <LegacyLoginRedirect /> },
  { path: '/register', element: <Navigate to="/portal?intent=register" replace /> },
  { path: '/business/register', element: <BusinessRegisterPage /> },
  { path: '/individual/register', element: <IndividualRegisterPage /> },
  { path: '/activate/:token', element: <ActivateInvitationPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password/:token', element: <ResetPasswordPage /> },
  { path: '/verify-email/:token', element: <VerifyEmailPage /> },

  // Reference positions: public, in the same dark frame as pricing and sign-up.
  { path: '/careers', element: <CareerCatalogPage /> },
  { path: '/careers/:slug', element: <CareerCatalogPage /> },

  // Public certificate verification: tra cứu và xác thực chứng chỉ số công khai
  { path: '/verify', element: <PublicVerifyPage /> },
  { path: '/verify/:code', element: <PublicVerifyPage /> },
];
