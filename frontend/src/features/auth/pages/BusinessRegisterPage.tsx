import { useState } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { AccountForm, type AccountFormValues } from '../components/AccountForm';
import { PurchaseStepper } from '../../commerce/components/PurchaseStepper';
import { PlanSummary } from '../../commerce/components/PlanSummary';
import { parsePlanSelection } from '@/lib/plan-query';
import { getPlan, isPurchasableOnline } from '@/lib/plans';
import { registrationService } from '@/services/registration.service';
import { useLogin } from '@/hooks/use-auth';
import { rememberPortalChoice } from '../../portal/portal-preference';

function getErrorMessage(error: unknown): { message: string; isTaken: boolean } {
  const response = (error as { response?: { status?: number; data?: { message?: string } } })?.response;
  const status = response?.status;
  const msg = response?.data?.message ?? (error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
  const isTaken = status === 409 || msg.includes('Email này đã');
  return { message: msg, isTaken };
}

export function BusinessRegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useLogin();

  const [submitError, setSubmitError] = useState<string>();
  const [emailTaken, setEmailTaken] = useState(false);

  const plan = parsePlanSelection(searchParams, 'enterprise');
  const planDetails = plan ? getPlan(plan.planCode) : undefined;

  // T1, T2: Missing or invalid plan redirect to pricing with reason=choose-plan
  if (!plan || !planDetails || planDetails.audience !== 'enterprise' || !isPurchasableOnline(planDetails)) {
    return <Navigate to="/business/pricing?reason=choose-plan" replace />;
  }

  const handleSubmit = async (values: AccountFormValues) => {
    setSubmitError(undefined);
    setEmailTaken(false);
    rememberPortalChoice('enterprise');

    let draftId: string | undefined;
    try {
      const res = await registrationService.registerEnterprise({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        acceptTerms: values.acceptTerms,
        plan,
      });
      draftId = res.data?.data?.draftId;
    } catch (err) {
      const { message, isTaken } = getErrorMessage(err);
      setSubmitError(message);
      setEmailTaken(isTaken);
      return;
    }

    try {
      const home = await login.mutateAsync({ email: values.email, password: values.password });
      const nextPath = draftId ? `/enterprise/contract?draft=${draftId}` : home;
      navigate(nextPath, { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthShell
      portal="enterprise"
      eyebrow="Doanh nghiệp"
      title="Tạo tài khoản doanh nghiệp"
      subtitle="Tổ chức đo lường & đào tạo năng lực số đội ngũ."
      headerSlot={
        <div className="mb-6 space-y-4">
          <PurchaseStepper
            audience="enterprise"
            currentStep={2}
            changePlanPath="/business/pricing"
          />
          <PlanSummary selection={plan} changeTo="/business/pricing" />
        </div>
      }
    >
      <AccountForm
        audience="enterprise"
        onSubmit={handleSubmit}
        submitError={submitError}
        emailTaken={emailTaken}
        loginPath="/login"
      />
    </AuthShell>
  );
}
