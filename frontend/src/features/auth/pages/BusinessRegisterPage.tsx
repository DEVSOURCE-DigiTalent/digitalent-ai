import { useState } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { PulseAuthLayout } from '@/features/public/pulse-landing/PulseAuthLayout';
import { AccountForm, type AccountFormValues } from '../components/AccountForm';
import { PurchaseStepper } from '../../commerce/components/PurchaseStepper';
import { PlanSummary } from '../../commerce/components/PlanSummary';
import { parsePlanSelection } from '@/lib/plan-query';
import { getPlan, isPurchasableOnline } from '@/lib/plans';
import { registrationService } from '@/services/registration.service';
import { authService } from '@/services/auth.service';
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

    // Gửi OTP xác minh email rồi chuyển sang trang nhập OTP
    let deliveryFailed = false;
    try {
      await authService.sendEmailVerification(values.email);
    } catch {
      deliveryFailed = true;
    }

    const params = new URLSearchParams({ email: values.email });
    if (draftId) params.set('draft', draftId);
    if (deliveryFailed) params.set('delivery', 'failed');
    navigate(`/business/verify-email?${params.toString()}`, { replace: true });
  };

  return (
    <PulseAuthLayout
      eyebrow="Tài khoản doanh nghiệp · Gói đã chọn"
      title="Tạo tài khoản doanh nghiệp"
      subtitle="Hoàn tất tài khoản chủ sở hữu trước khi tiếp tục hợp đồng và thiết lập tổ chức."
      asideTitle="Bắt đầu bằng một mục tiêu chung."
      asideText="Sau khi tạo tài khoản, doanh nghiệp sẽ hoàn tất gói đã chọn rồi thiết kế khung năng lực phù hợp với đội ngũ."
      asidePoints={['Thiết lập theo tổ chức, phòng ban và vị trí', 'Giao khóa học và theo dõi tiến độ', 'Đánh giá kết quả bằng minh chứng cuối khóa']}
    >
        <div className="pulse-auth-paid-plan">
          <PurchaseStepper
            audience="enterprise"
            currentStep={2}
            changePlanPath="/business/pricing"
          />
          <PlanSummary selection={plan} changeTo="/business/pricing" />
        </div>
        <div className="pulse-auth-paid-form"><AccountForm
          audience="enterprise"
          onSubmit={handleSubmit}
          submitError={submitError}
          emailTaken={emailTaken}
          loginPath="/login"
        /></div>
    </PulseAuthLayout>
  );
}
