import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AccountForm, type AccountFormValues } from '../components/AccountForm';
import { OtpVerificationCard } from '../components/OtpVerificationCard';
import { TrialNavbar } from '../components/trial/TrialNavbar';
import { TrialHeroSection } from '../components/trial/TrialHeroSection';
import { TrialJourneySection } from '../components/trial/TrialJourneySection';
import { TrialBenefitsSection } from '../components/trial/TrialBenefitsSection';
import { TrialCertificateSection } from '../components/trial/TrialCertificateSection';
import { TrialFaqSection } from '../components/trial/TrialFaqSection';
import { TrialCtaBanner } from '../components/trial/TrialCtaBanner';
import { TrialFooter } from '../components/trial/TrialFooter';
import { rememberPortalChoice } from '../../portal/portal-preference';
import { trackTrialEvent } from '../../experience/individual-trial/individual-trial-tracker';
import { clearTryHandoff, readTryHandoff, toTryOrientation } from '../../experience/individual-trial/try-handoff';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogin } from '@/hooks/use-auth';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';
import { resolveNextStep } from '@/lib/navigation';
import { getReferencePosition } from '@/lib/reference-positions';
import { registrationService } from '@/services/registration.service';
import { PERSONAL_PUBLIC_BACKGROUND, usePersonalTheme } from '@/features/learner/theme/use-personal-theme';
import { usePageBackground } from '@/features/public/landing/hooks/use-page-background';
import '@/features/learner/theme/personal-theme.css';

const SOURCES = ['try', 'pricing', 'landing'] as const;
type TrialSource = (typeof SOURCES)[number];

const sourceOf = (value: string | null): TrialSource | undefined => SOURCES.find((source) => source === value);

function getErrorMessage(error: unknown): { message: string; isTaken: boolean } {
  const response = (error as { response?: { status?: number; data?: { message?: string } } })?.response;
  const message = response?.data?.message ?? (error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
  return { message, isTaken: response?.status === 409 || message.includes('Email này đã') };
}

/**
 * `/individual/register?trial=1`: Full-page experience for the 7-day trial (spec §8.3).
 * Redesigned as a multi-section dedicated page: Hero registration & simulator, 7-day journey,
 * benefits bento, certificate showcase, FAQs, and trust metrics.
 */
export function TrialRegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useLogin();
  const user = useCurrentUser((s) => s.user);
  const theme = usePersonalTheme((s) => s.theme);
  usePageBackground(PERSONAL_PUBLIC_BACKGROUND[theme]);

  const formSectionRef = useRef<HTMLDivElement | null>(null);

  const [submitError, setSubmitError] = useState<string>();
  const [emailTaken, setEmailTaken] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    registrationId: string;
    registrationAccessToken?: string;
    maskedEmail?: string;
    developmentOtp?: string;
    email: string;
  } | null>(null);

  const source = sourceOf(searchParams.get('source'));
  const handoff = useMemo(readTryHandoff, []);
  const position = getReferencePosition(searchParams.get('position') ?? '') ?? (handoff ? getReferencePosition(handoff.positionCode) : undefined);
  const fromTry = Boolean(position && handoff?.positionCode === position.code);

  // Once per visit: the page must not count again when the form re-renders or the session loads.
  const viewTracked = useRef(false);
  useEffect(() => {
    if (user || viewTracked.current) return;
    viewTracked.current = true;
    trackTrialEvent('trial_signup_viewed', { source });
  }, [user, source]);

  // An account that is already signed in has nothing to sign up for (BR-02): send it where it belongs.
  if (user) return <Navigate to={resolveNextStep(user)} replace />;

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        trial: true,
        positionCode: position?.code,
        tryOrientation: fromTry ? toTryOrientation(handoff) : undefined,
      });
    } catch (err) {
      const { message, isTaken } = getErrorMessage(err);
      setSubmitError(message);
      setEmailTaken(isTaken);
      return;
    }

    clearTryHandoff();
    trackTrialEvent('trial_account_created', { source, positionCode: position?.code ?? null });
    const regData = res?.data?.data;
    const regId = regData?.registrationId || 'reg-trial';
    sessionStorage.setItem('dt-pending-registration', JSON.stringify({
      registrationId: regId,
      registrationAccessToken: regData?.registrationAccessToken,
      maskedEmail: regData?.maskedEmail,
      email: values.email,
      intent: 'TRIAL',
      positionCode: position?.code,
    }));
    navigate(`/individual/register/verify?registrationId=${regId}&email=${encodeURIComponent(values.email)}&intent=TRIAL`, { replace: true });
  };

  const handleOtpSuccess = (data: any) => {
    clearTryHandoff();
    trackTrialEvent('trial_account_created', { source, positionCode: position?.code ?? null });
    if (data?.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    navigate(data?.nextPath || '/personal', { replace: true });
  };

  const formNode = pendingRegistration ? (
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
      submitLabel={`Tạo tài khoản và bắt đầu ${INDIVIDUAL_TRIAL.days} ngày dùng thử`}
      consentNote="DigiTalent gửi email nhắc trong kỳ dùng thử; bạn có thể tắt bất cứ lúc nào."
    />
  );

  return (
    <div
      lang="vi"
      data-portal="individual"
      data-theme={theme}
      data-individual-theme={theme}
      className="flex min-h-screen flex-col bg-[#07151b] text-cream selection:bg-amber-400/25 font-landing antialiased transition-colors duration-300"
    >
      {/* 1. Header / Navbar */}
      <TrialNavbar onScrollToForm={scrollToForm} />

      {/* 2. Hero Section: Registration Form & Live Simulator */}
      <TrialHeroSection
        position={position}
        fromTry={fromTry}
        formNode={formNode}
        formRef={formSectionRef}
      />

      {/* 3. Section: 7-Day Journey Roadmap */}
      <TrialJourneySection />

      {/* 4. Section: Trial Benefits Bento (Matches required test assertions) */}
      <TrialBenefitsSection
        positionName={position?.name}
        fromTry={fromTry}
      />

      {/* 5. Section: Verifiable Digital Credentials Showcase */}
      <TrialCertificateSection />

      {/* 6. Section: FAQs */}
      <TrialFaqSection />

      {/* 7. Bottom Call to Action Banner */}
      <TrialCtaBanner onScrollToForm={scrollToForm} />

      {/* 8. Footer */}
      <TrialFooter />
    </div>
  );
}
