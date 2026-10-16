import { lazy, Suspense } from 'react';
import { Navigate, useLocation, type RouteObject } from 'react-router-dom';
import { CareerCatalogPage } from '../../features/public/career-catalog/CareerCatalogPage';
import { PortalSelectorPage, RootRoute } from '../../features/portal/PortalSelectorPage';
import { PricingPage } from '../../features/commerce/pages/PricingPage';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { ForbiddenPage } from '../../features/auth/pages/ForbiddenPage';
import { BusinessRegisterPage } from '../../features/auth/pages/BusinessRegisterPage';
import { TrialAcceptPage as EnterpriseTrialAcceptPage, TrialRegisterPage as EnterpriseTrialRegisterPage, TrialVerifyPage as EnterpriseTrialVerifyPage } from '../../features/experience/enterprise-trial/PublicTrialPages';
import { IndividualVerifyPage } from '../../features/auth/pages/IndividualVerifyPage';
import { ActivateInvitationPage } from '../../features/auth/pages/ActivateInvitationPage';
import { BusinessVerifyEmailPage } from '../../features/auth/pages/BusinessVerifyEmailPage';
import { ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from '../../features/auth/pages/PasswordPages';
import { PublicVerifyPage } from '../../features/public/pages/PublicVerifyPage';

const EnterpriseLandingPage = lazy(() => import('../../features/public/pulse-landing/PulseBusinessLandingPage').then(module => ({ default: module.PulseBusinessLandingPage })));
const EnterpriseSolutionPage = lazy(() => import('../../features/public/pulse-landing/PulseBusinessSolutionPage').then(module => ({ default: module.PulseBusinessSolutionPage })));

const landingFallback = <div className="min-h-screen bg-[#f6f8fd]" />;

/** Old bookmarks and emails still point at /business/login and /individual/login; keep their returnTo. */
function LegacyLoginRedirect() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/login', search }} replace />;
}

export const publicRoutes: RouteObject[] = [
  { path: '/experience', element: <Navigate to="/business" replace /> },

  // Old neutral entry points now open the enterprise landing or its registration form.
  { path: '/', element: <RootRoute /> },
  { path: '/portal', element: <PortalSelectorPage /> },

  // The enterprise landing has its own navigation and footer.
  { path: '/business', element: <Suspense fallback={landingFallback}><EnterpriseLandingPage /></Suspense> },
  { path: '/business/try', element: <EnterpriseTrialRegisterPage /> },
  { path: '/business/try/verify', element: <EnterpriseTrialVerifyPage /> },
  { path: '/business/try/accept', element: <EnterpriseTrialAcceptPage /> },
  { path: '/individual', element: <Navigate to="/business" replace /> },
  { path: '/individual/try', element: <Navigate to="/business/try" replace /> },

  // Preview URLs from the previous frontend now lead to the current enterprise entry.
  { path: '/v2', element: <Navigate to="/business" replace /> },
  { path: '/v2/landing', element: <Navigate to="/business" replace /> },
  { path: '/v2/individual', element: <Navigate to="/business" replace /> },

  { path: '/business/solution', element: <Suspense fallback={landingFallback}><EnterpriseSolutionPage /></Suspense> },
  { path: '/business/pricing', element: <PricingPage audience="enterprise" /> },
  { path: '/individual/pricing', element: <Navigate to="/business/solution" replace /> },

  // Existing accounts share one login. New public registration is enterprise only.
  { path: '/login', element: <LoginPage /> },
  { path: '/forbidden', element: <ForbiddenPage /> },
  { path: '/business/login', element: <LegacyLoginRedirect /> },
  { path: '/individual/login', element: <LegacyLoginRedirect /> },
  { path: '/register', element: <Navigate to="/business/try" replace /> },
  { path: '/business/register', element: <BusinessRegisterPage /> },
  { path: '/business/verify-email', element: <BusinessVerifyEmailPage /> },
  { path: '/individual/register', element: <Navigate to="/business/try" replace /> },
  { path: '/individual/register/verify', element: <IndividualVerifyPage /> },
  { path: '/individual/verify', element: <IndividualVerifyPage /> },
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
