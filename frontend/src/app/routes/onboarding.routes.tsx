import { Navigate, type RouteObject } from 'react-router-dom';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { RequireRole } from '../../components/guards/RequireRole';
import { RequireWorkspace } from '../../components/guards/RequireWorkspace';
import { useCurrentUser } from '../../hooks/use-current-user';
import { ROLES, WORKSPACES } from '../../lib/roles';
import { lazyPage } from './lazy-page';

const CheckoutPage = lazyPage(() => import('../../features/commerce/pages/CheckoutPage'), 'CheckoutPage');
const PaymentResultPage = lazyPage(() => import('../../features/commerce/pages/PaymentResultPage'), 'PaymentResultPage');
const EnterpriseContractPage = lazyPage(() => import('../../features/commerce/pages/EnterpriseContractPage'), 'EnterpriseContractPage');
const SetupWizardPage = lazyPage(() => import('../../features/onboarding/pages/SetupWizardPage'), 'SetupWizardPage');
const PersonalOnboardingPage = lazyPage(() => import('../../features/learner/pages/PersonalOnboardingPage'), 'PersonalOnboardingPage');
const VerifyEmailRequiredPage = lazyPage(() => import('../../features/auth/pages/VerifyEmailRequiredPage'), 'VerifyEmailRequiredPage');
const ManagerAssessmentPage = lazyPage(() => import('../../features/manager/pages/ManagerAssessmentPage'), 'ManagerAssessmentPage');
const FocusLayout = lazyPage(() => import('../layouts/FocusLayout'), 'FocusLayout');

/** Sau kích hoạt lời mời: nhân viên vào trang Hôm nay của cổng Pulse (bài đánh giá trước khi học của từng khóa); quản lý giữ trang đánh giá của mình. */
function EnterpriseAssessmentPage() {
  const isManager = useCurrentUser((state) => state.hasRole(ROLES.MANAGER));
  return isManager ? <ManagerAssessmentPage /> : <Navigate to="/enterprise/me" replace />;
}

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
  {
    path: '/enterprise/initial-assessment',
    element: (
      <AuthGuard>
        <RequireWorkspace workspace={WORKSPACES.ENTERPRISE}>
          <FocusLayout
            exitPath="/enterprise/me"
            exitLabel="Vào trang cá nhân"
            title="Đánh giá năng lực đầu vào"
          >
            <EnterpriseAssessmentPage />
          </FocusLayout>
        </RequireWorkspace>
      </AuthGuard>
    ),
  },
];
