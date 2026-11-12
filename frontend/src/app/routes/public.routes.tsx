import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, useLocation, type RouteObject } from 'react-router-dom';
import { PortalSelectorPage, RootRoute } from '../../features/portal/PortalSelectorPage';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { ForbiddenPage } from '../../features/auth/pages/ForbiddenPage';
import { lazyPage } from './lazy-page';
import { PulsePublicLoadingScreen } from '../../features/public/components/loading/PulsePublicLoadingScreen';

const CareerCatalogPage = lazyPage(() => import('../../features/public/career-catalog/CareerCatalogPage'), 'CareerCatalogPage');
const PricingPage = lazyPage(() => import('../../features/commerce/pages/PricingPage'), 'PricingPage');
const BusinessRegisterPage = lazyPage(() => import('../../features/auth/pages/BusinessRegisterPage'), 'BusinessRegisterPage');
const EnterpriseTrialAcceptPage = lazyPage(() => import('../../features/experience/enterprise-trial/PublicTrialPages'), 'TrialAcceptPage');
const EnterpriseTrialRegisterPage = lazyPage(() => import('../../features/experience/enterprise-trial/PublicTrialPages'), 'TrialRegisterPage');
const EnterpriseTrialVerifyPage = lazyPage(() => import('../../features/experience/enterprise-trial/PublicTrialPages'), 'TrialVerifyPage');
const IndividualVerifyPage = lazyPage(() => import('../../features/auth/pages/IndividualVerifyPage'), 'IndividualVerifyPage');
const ActivateInvitationPage = lazyPage(() => import('../../features/auth/pages/ActivateInvitationPage'), 'ActivateInvitationPage');
const BusinessVerifyEmailPage = lazyPage(() => import('../../features/auth/pages/BusinessVerifyEmailPage'), 'BusinessVerifyEmailPage');
const ForgotPasswordPage = lazyPage(() => import('../../features/auth/pages/PasswordPages'), 'ForgotPasswordPage');
const ResetPasswordPage = lazyPage(() => import('../../features/auth/pages/PasswordPages'), 'ResetPasswordPage');
const VerifyEmailPage = lazyPage(() => import('../../features/auth/pages/PasswordPages'), 'VerifyEmailPage');
const PublicVerifyPage = lazyPage(() => import('../../features/public/pages/PublicVerifyPage'), 'PublicVerifyPage');

const EnterpriseLandingPage = lazy(() => import('../../features/public/pulse-landing/PulseBusinessLandingPage').then(module => ({ default: module.PulseBusinessLandingPage })));
const EnterpriseSolutionPage = lazy(() => import('../../features/public/pulse-landing/PulseBusinessSolutionPage').then(module => ({ default: module.PulseBusinessSolutionPage })));

const publicLandingFallback = <PulsePublicLoadingScreen />;
const withPublicFallback = (element: ReactNode) => <Suspense fallback={publicLandingFallback}>{element}</Suspense>;

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
  { path: '/business', element: withPublicFallback(<EnterpriseLandingPage />) },
  { path: '/business/try', element: withPublicFallback(<EnterpriseTrialRegisterPage />) },
  { path: '/business/try/verify', element: withPublicFallback(<EnterpriseTrialVerifyPage />) },
  { path: '/business/try/accept', element: withPublicFallback(<EnterpriseTrialAcceptPage />) },
  { path: '/individual', element: <Navigate to="/business" replace /> },
  { path: '/individual/try', element: <Navigate to="/business/try" replace /> },

  // Preview URLs from the previous frontend now lead to the current enterprise entry.
  { path: '/v2', element: <Navigate to="/business" replace /> },
  { path: '/v2/landing', element: <Navigate to="/business" replace /> },
  { path: '/v2/individual', element: <Navigate to="/business" replace /> },

  { path: '/business/solution', element: withPublicFallback(<EnterpriseSolutionPage />) },
  { path: '/business/pricing', element: withPublicFallback(<PricingPage audience="enterprise" />) },
  { path: '/individual/pricing', element: <Navigate to="/business/solution" replace /> },

  // Existing accounts share one login. New public registration is enterprise only.
  { path: '/login', element: <LoginPage /> },
  { path: '/forbidden', element: <ForbiddenPage /> },
  { path: '/business/login', element: <LegacyLoginRedirect /> },
  { path: '/individual/login', element: <LegacyLoginRedirect /> },
  { path: '/register', element: <Navigate to="/business/try" replace /> },
  { path: '/business/register', element: withPublicFallback(<BusinessRegisterPage />) },
  { path: '/business/verify-email', element: withPublicFallback(<BusinessVerifyEmailPage />) },
  { path: '/individual/register', element: <Navigate to="/business/try" replace /> },
  { path: '/individual/register/verify', element: withPublicFallback(<IndividualVerifyPage />) },
  { path: '/individual/verify', element: withPublicFallback(<IndividualVerifyPage />) },
  { path: '/activate/:token', element: withPublicFallback(<ActivateInvitationPage />) },
  { path: '/forgot-password', element: withPublicFallback(<ForgotPasswordPage />) },
  { path: '/reset-password/:token', element: withPublicFallback(<ResetPasswordPage />) },
  { path: '/verify-email/:token', element: withPublicFallback(<VerifyEmailPage />) },

  // Reference positions: public, in the same dark frame as pricing and sign-up.
  { path: '/careers', element: withPublicFallback(<CareerCatalogPage />) },
  { path: '/careers/:slug', element: withPublicFallback(<CareerCatalogPage />) },

  // Public certificate verification: tra cứu và xác thực chứng chỉ số công khai
  { path: '/verify', element: withPublicFallback(<PublicVerifyPage />) },
  { path: '/verify/:code', element: withPublicFallback(<PublicVerifyPage />) },
];
