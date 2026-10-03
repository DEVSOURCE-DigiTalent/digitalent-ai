import type { RouteObject } from 'react-router-dom';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { RequireRole } from '../../components/guards/RequireRole';
import { RequireWorkspace } from '../../components/guards/RequireWorkspace';
import { CheckoutPage } from '../../features/commerce/pages/CheckoutPage';
import { PaymentResultPage } from '../../features/commerce/pages/PaymentResultPage';
import { EnterpriseContractPage } from '../../features/commerce/pages/EnterpriseContractPage';
import { SetupWizardPage } from '../../features/onboarding/pages/SetupWizardPage';
import { PersonalOnboardingPage } from '../../features/learner/pages/PersonalOnboardingPage';
import { VerifyEmailRequiredPage } from '../../features/auth/pages/VerifyEmailRequiredPage';
import { ROLES, WORKSPACES } from '../../lib/roles';
import { FocusLayout } from '../layouts/FocusLayout';

/** Steps a new paying customer goes through after signing up: pay, sign contract, set up organization or personal path. */
export const onboardingRoutes: RouteObject[] = [
  {
    path: '/checkout',
    element: (
      <AuthGuard>
        <CheckoutPage />
      </AuthGuard>
    ),
  },
  {
    path: '/checkout/result',
    element: (
      <AuthGuard>
        <PaymentResultPage />
      </AuthGuard>
    ),
  },
  {
    path: '/checkout/contract',
    element: (
      <AuthGuard>
        <EnterpriseContractPage />
      </AuthGuard>
    ),
  },
  {
    path: '/enterprise/contract',
    element: (
      <AuthGuard>
        <RequireWorkspace workspace={WORKSPACES.ENTERPRISE}>
          <RequireRole roles={[ROLES.OWNER]}>
            <EnterpriseContractPage />
          </RequireRole>
        </RequireWorkspace>
      </AuthGuard>
    ),
  },
  {
    path: '/setup',
    element: (
      <AuthGuard>
        <RequireWorkspace workspace={WORKSPACES.ENTERPRISE}>
          <RequireRole roles={[ROLES.OWNER]}>
            <FocusLayout
              exitPath="/enterprise/dashboard"
              exitLabel="Lưu và thoát"
              title="Thiết lập tổ chức"
            >
              <SetupWizardPage />
            </FocusLayout>
          </RequireRole>
        </RequireWorkspace>
      </AuthGuard>
    ),
  },
  {
    path: '/personal/onboarding',
    element: (
      <AuthGuard>
        <RequireWorkspace workspace={WORKSPACES.PERSONAL}>
          <PersonalOnboardingPage />
        </RequireWorkspace>
      </AuthGuard>
    ),
  },
  {
    path: '/verify-email-required',
    element: (
      <AuthGuard>
        <VerifyEmailRequiredPage />
      </AuthGuard>
    ),
  },
];
