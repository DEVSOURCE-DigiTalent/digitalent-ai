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
import { TrialRegisterPage } from './TrialRegisterPage';

function getErrorMessage(error: unknown): { message: string; isTaken: boolean } {
  const response = (error as { response?: { status?: number; data?: { message?: string } } })?.response;
  const status = response?.status;
  const msg = response?.data?.message ?? (error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
  const isTaken = status === 409 || msg.includes('Email này đã');
  return { message: msg, isTaken };
}

import { OtpVerificationCard } from '../components/OtpVerificationCard';

function PurchaseRegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useLogin();

  const [submitError, setSubmitError] = useState<string>();
  const [emailTaken, setEmailTaken] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    registrationId: string;
    registrationAccessToken?: string;
    maskedEmail?: string;
    developmentOtp?: string;
    email: string;
  } | null>(null);

  const plan = parsePlanSelection(searchParams, 'individual');
  const planDetails = plan ? getPlan(plan.planCode) : undefined;

  // T1, T2: Missing or invalid plan redirect to pricing with reason=choose-plan
  if (!plan || !planDetails || planDetails.audience !== 'individual' || !isPurchasableOnline(planDetails)) {
    return <Navigate to="/individual/pricing?reason=choose-plan" replace />;
  }

  const handleSubmit = async (values: AccountFormValues) => {
    setSubmitError(undefined);
    setEmailTaken(false);
    rememberPortalChoice('individual');

    let res: any;
    try {
      res = await registrationService.registerIndividual({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        acceptTerms: values.acceptTerms,
        plan,
      });
    } catch (err) {
      const { message, isTaken } = getErrorMessage(err);
      setSubmitError(message);
      setEmailTaken(isTaken);
      return;
    }

    const regData = res?.data?.data;
    const regId = regData?.registrationId || regData?.draftId || 'reg-individual';
    sessionStorage.setItem('dt-pending-registration', JSON.stringify({
      registrationId: regId,
      registrationAccessToken: regData?.registrationAccessToken,
      maskedEmail: regData?.maskedEmail,
      email: values.email,
      intent: 'PURCHASE',
      draftId: regData?.draftId,
    }));
    navigate(`/individual/register/verify?registrationId=${regId}&email=${encodeURIComponent(values.email)}&intent=PURCHASE`, { replace: true });
  };

  const handleOtpSuccess = (data: any) => {
    if (data?.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    const next = data?.nextPath || (data?.purchaseDraft?.id ? `/checkout?draft=${data.purchaseDraft.id}` : '/checkout');
    navigate(next, { replace: true });
  };

  return (
    <AuthShell
      portal="individual"
      eyebrow="Cá nhân"
      title="Tạo tài khoản cá nhân"
      subtitle="Xây dựng hồ sơ năng lực số chuẩn hóa."
      headerSlot={
        !pendingRegistration && (
          <div className="mb-6 space-y-4">
            <PurchaseStepper
              audience="individual"
              currentStep={2}
              changePlanPath="/individual/pricing"
            />
            <PlanSummary selection={plan} changeTo="/individual/pricing" />
          </div>
        )
      }
    >
      {pendingRegistration ? (
        <OtpVerificationCard
          email={pendingRegistration.email}
          maskedEmail={pendingRegistration.maskedEmail}
          registrationId={pendingRegistration.registrationId}
          registrationAccessToken={pendingRegistration.registrationAccessToken}
          developmentOtp={pendingRegistration.developmentOtp}
          onSuccess={handleOtpSuccess}
          onCancel={() => setPendingRegistration(null)}
        />
      ) : (
        <AccountForm
          audience="individual"
          onSubmit={handleSubmit}
          submitError={submitError}
          emailTaken={emailTaken}
          loginPath="/login"
        />
      )}
    </AuthShell>
  );
}

/** `?trial=1` starts the 7-day trial instead of a purchase; everything else is the purchase sign-up. */
export function IndividualRegisterPage() {
  const [searchParams] = useSearchParams();
  return searchParams.get('trial') === '1' ? <TrialRegisterPage /> : <PurchaseRegisterPage />;
}
