import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
  type ClipboardEvent,
} from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MailCheck,
} from 'lucide-react';
import { PulseAuthLayout } from '@/features/public/pulse-landing/PulseAuthLayout';
import { COMMON_PASSWORDS } from '@/features/auth/validation';
import {
  enterpriseTrialService as service,
  type TrialAccountDto,
  type TrialRegistrationDto,
  type TrialRegistrationRequest,
} from '@/services/enterprise-trial.service';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getHomePath } from '@/lib/navigation';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import {
  TrialWorkspaceLoadingScreen,
  type TrialLoadingStage,
} from './TrialWorkspaceLoadingScreen';
import { data, message, safeDevelopmentPath } from './trial-ui';

let preloadedMarkImage: HTMLImageElement | null = null;

function usePreloadPulseMark() {
  useEffect(() => {
    if (typeof Image === 'undefined') return;
    if (!preloadedMarkImage) {
      const img = new Image();
      img.decoding = 'sync';
      img.src = pulseMark;
      preloadedMarkImage = img;
    }
    void preloadedMarkImage.decode?.().catch(() => {});
  }, []);
}

const industries = [
  { value: 'Công nghệ thông tin', label: 'Công nghệ thông tin' },
  { value: 'Tài chính – Ngân hàng', label: 'Tài chính, Ngân hàng' },
  { value: 'Sản xuất', label: 'Sản xuất' },
  { value: 'Thương mại – Bán lẻ', label: 'Thương mại, Bán lẻ' },
  { value: 'Giáo dục', label: 'Giáo dục' },
  { value: 'Y tế', label: 'Y tế' },
  { value: 'Dịch vụ', label: 'Dịch vụ' },
  { value: 'Khác', label: 'Khác' },
];

const sizes = ['1-20', '21-100', '101-500', '500+'];
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterStep = 1 | 2 | 3;

interface StepFieldErrors {
  organizationName?: string;
  ownerName?: string;
  email?: string;
  industry?: string;
  size?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
}

const REGISTER_STEPS: readonly { step: RegisterStep; label: string }[] = [
  { step: 1, label: 'Thông tin' },
  { step: 2, label: 'Mật khẩu' },
  { step: 3, label: 'Xác minh' },
];

type PasswordStrengthTone = 'idle' | 'weak' | 'fair' | 'good' | 'strong';

interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  tone: PasswordStrengthTone;
  label: string;
  hint: string;
  isCommon: boolean;
  checks: {
    hasMinLength: boolean;
    hasMixedCase: boolean;
    hasDigit: boolean;
    hasSymbol: boolean;
  };
}

function evaluatePasswordStrength(password: string, email?: string): PasswordStrengthResult {
  const trimmed = password.trim();
  const hasMinLength = password.length >= 12 && password.length <= 72;
  const tooLong = password.length > 72;
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9\s]/.test(password);

  const isCommon =
    COMMON_PASSWORDS.includes(password.toLowerCase().trim()) ||
    (password.length >= 6 && /^(.)\1+$/.test(password));
  const emailLocal = (email ?? '').trim().toLowerCase().split('@')[0] ?? '';
  const containsEmail = Boolean(
    emailLocal.length >= 3 && password.toLowerCase().includes(emailLocal),
  );
  const onlySpaces = password.length > 0 && trimmed.length === 0;

  const checks = { hasMinLength, hasMixedCase, hasDigit, hasSymbol };

  if (!password) {
    return {
      score: 0,
      tone: 'idle',
      label: 'Chưa nhập',
      hint: 'Từ 12 đến 72 ký tự',
      isCommon: false,
      checks,
    };
  }

  if (onlySpaces) {
    return {
      score: 1,
      tone: 'weak',
      label: 'Không hợp lệ',
      hint: 'Không chỉ chứa khoảng trắng',
      isCommon: false,
      checks,
    };
  }

  if (tooLong) {
    return {
      score: 1,
      tone: 'weak',
      label: 'Quá dài',
      hint: 'Tối đa 72 ký tự',
      isCommon: false,
      checks,
    };
  }

  if (isCommon) {
    return {
      score: 1,
      tone: 'weak',
      label: 'Rất yếu',
      hint: 'Tránh mật khẩu quá phổ biến',
      isCommon: true,
      checks,
    };
  }

  if (containsEmail) {
    return {
      score: 1,
      tone: 'weak',
      label: 'Yếu',
      hint: 'Không nên trùng tên email',
      isCommon: false,
      checks,
    };
  }

  if (!hasMinLength) {
    return {
      score: 1,
      tone: 'weak',
      label: 'Yếu',
      hint: `Còn thiếu ${12 - password.length} ký tự`,
      isCommon: false,
      checks,
    };
  }

  const diversityCount = Number(hasMixedCase) + Number(hasDigit) + Number(hasSymbol);
  if (diversityCount === 0) {
    return {
      score: 1,
      tone: 'weak',
      label: 'Yếu',
      hint: 'Thêm chữ hoa, số hoặc ký tự đặc biệt',
      isCommon: false,
      checks,
    };
  }
  if (diversityCount === 1) {
    return {
      score: 2,
      tone: 'fair',
      label: 'Trung bình',
      hint: 'Nên kết hợp thêm nhóm ký tự khác',
      isCommon: false,
      checks,
    };
  }
  if (diversityCount === 2) {
    return {
      score: 3,
      tone: 'good',
      label: 'Khá',
      hint: 'Mức an toàn khá tốt',
      isCommon: false,
      checks,
    };
  }
  return {
    score: 4,
    tone: 'strong',
    label: 'Mạnh',
    hint: 'Đạt độ mạnh cao',
    isCommon: false,
    checks,
  };
}

function TrialPasswordStrengthMeter({
  password,
  email,
}: {
  password: string;
  email?: string;
}) {
  const strength = evaluatePasswordStrength(password, email);

  const ruleItems: { key: string; label: string; met: boolean }[] = [
    {
      key: 'length',
      label:
        password.length > 0 && password.length < 12
          ? `12 đến 72 ký tự (${password.length}/12)`
          : '12 đến 72 ký tự',
      met: strength.checks.hasMinLength,
    },
    {
      key: 'case',
      label: 'Chữ hoa và thường',
      met: strength.checks.hasMixedCase,
    },
    {
      key: 'digit',
      label: 'Có chữ số',
      met: strength.checks.hasDigit,
    },
    {
      key: 'symbol',
      label: 'Ký tự đặc biệt',
      met: strength.checks.hasSymbol,
    },
  ];

  return (
    <div className="pulse-auth-pwd-meter" aria-live="polite">
      <div className="pulse-auth-pwd-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={`pulse-auth-pwd-bar${
              strength.score >= bar ? ` pulse-auth-pwd-bar--${strength.tone}` : ''
            }`}
          />
        ))}
      </div>

      <div className="pulse-auth-pwd-header">
        <span className="pulse-auth-pwd-label">
          Độ mạnh:{' '}
          <strong className={`pulse-auth-pwd-badge pulse-auth-pwd-badge--${strength.tone}`}>
            {strength.label}
          </strong>
        </span>
        <span
          className={`pulse-auth-pwd-hint${
            strength.tone === 'weak' && password.length > 0 ? ' pulse-auth-pwd-hint--warn' : ''
          }`}
        >
          {strength.hint}
        </span>
      </div>

      <div className="pulse-auth-pwd-rules">
        {ruleItems.map((rule) => (
          <span
            key={rule.key}
            className={`pulse-auth-pwd-rule${rule.met ? ' pulse-auth-pwd-rule--met' : ''}`}
          >
            {rule.met ? (
              <Check size={11} strokeWidth={2.8} aria-hidden="true" />
            ) : (
              <span className="pulse-auth-pwd-rule-dot" aria-hidden="true" />
            )}
            <span>{rule.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

async function establishTrialSession(
  verifiedAccount: TrialAccountDto,
  cache: QueryClient,
  password?: string,
) {
  if (verifiedAccount.accessToken) {
    localStorage.setItem('accessToken', verifiedAccount.accessToken);
    if (verifiedAccount.refreshToken) {
      localStorage.setItem('refreshToken', verifiedAccount.refreshToken);
    }
  } else if (password) {
    const response = await data(service.login(verifiedAccount.email, password));
    localStorage.setItem('accessToken', response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
  } else {
    throw new Error(
      'Xác minh thành công nhưng thiếu phiên đăng nhập. Vui lòng đăng nhập bằng mật khẩu đã tạo.',
    );
  }
  const user = await data(service.currentUser());
  cache.clear();
  useCurrentUser.getState().setUser(user);
  return user;
}

interface OtpDigitGridProps {
  digits: string[];
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  disabled?: boolean;
  hasError?: boolean;
  hint?: string;
  onChangeDigits: (next: string[]) => void;
}

function OtpDigitGrid({
  digits,
  inputRefs,
  disabled = false,
  hasError = false,
  hint = 'Nhập hoặc dán đủ 6 chữ số để kích hoạt tài khoản.',
  onChangeDigits,
}: OtpDigitGridProps) {
  const handleDigitChange = (index: number, val: string) => {
    const raw = val.replace(/\D/g, '');
    if (raw.length > 1) {
      const nextDigits = Array(OTP_LENGTH).fill('');
      for (let i = 0; i < Math.min(raw.length, OTP_LENGTH); i++) {
        nextDigits[i] = raw[i];
      }
      onChangeDigits(nextDigits);
      const nextIdx = Math.min(raw.length, OTP_LENGTH - 1);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const digit = raw.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    onChangeDigits(nextDigits);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        onChangeDigits(nextDigits);
      } else {
        const nextDigits = [...digits];
        nextDigits[index] = '';
        onChangeDigits(nextDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const nextDigits = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      nextDigits[i] = pasted[i];
    }
    onChangeDigits(nextDigits);
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="pulse-auth-field">
      <label
        htmlFor="trial-otp-0"
        style={{
          display: 'block',
          fontWeight: 600,
          fontSize: '14px',
          color: 'var(--auth-ink-heading, #0f172a)',
          marginBottom: '8px',
        }}
      >
        Mã xác minh email
      </label>
      <div
        className="pulse-auth-otp-grid"
        role="group"
        aria-label="Mã OTP 6 số"
        onPaste={handlePaste}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            id={`trial-otp-${index}`}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={6}
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            aria-label={index === 0 ? 'Mã xác minh email' : `Chữ số thứ ${index + 1}`}
            className={`pulse-auth-otp-input${digit ? ' pulse-auth-otp-input--filled' : ''}${
              hasError ? ' pulse-auth-otp-input--error' : ''
            }`}
            disabled={disabled}
          />
        ))}
      </div>
      {hint && (
        <span
          className="pulse-auth-field-hint"
          style={{ textAlign: 'center', display: 'block', marginTop: '10px' }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

export function TrialRegisterPage() {
  const navigate = useNavigate();
  const cache = useQueryClient();
  const readiness = useQuery({
    queryKey: ['enterprise-trial', 'readiness'],
    queryFn: () => data(service.readiness()),
    retry: false,
    refetchOnMount: 'always',
  });

  const [step, setStep] = useState<RegisterStep>(1);
  const [form, setForm] = useState<TrialRegistrationRequest>({
    organizationName: '',
    ownerName: '',
    email: '',
    password: '',
    industry: '',
    size: '',
    goal: 'competency-assessment',
    acceptedTerms: false,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<StepFieldErrors>({});

  const [result, setResult] = useState<TrialRegistrationDto | null>(null);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [account, setAccount] = useState<TrialAccountDto | null>(null);
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const [enteringWorkspace, setEnteringWorkspace] = useState(false);
  const [loadingStage, setLoadingStage] = useState<TrialLoadingStage>(0);

  const orgInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isMountedRef = useRef(true);
  const handoffTimersRef = useRef<number[]>([]);

  usePreloadPulseMark();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      for (const id of handoffTimersRef.current) {
        window.clearTimeout(id);
      }
      handoffTimersRef.current = [];
    };
  }, []);

  const waitMs = (ms: number) =>
    new Promise<void>((resolve) => {
      if (ms <= 0) {
        resolve();
        return;
      }
      const id = window.setTimeout(resolve, ms);
      handoffTimersRef.current.push(id);
    });

  const trimmedEmail = form.email.trim();
  const otpCode = digits.join('');
  const canRegister = readiness.data?.canRegister === true;

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (step === 2) {
      requestAnimationFrame(() => passwordInputRef.current?.focus());
    } else if (step === 3 && !enteringWorkspace) {
      requestAnimationFrame(() => otpInputRefs.current[0]?.focus());
    }
  }, [step, enteringWorkspace]);

  const clearFieldError = (key: keyof StepFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const update = (key: keyof TrialRegistrationRequest, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in fieldErrors) {
      clearFieldError(key as keyof StepFieldErrors);
    }
  };

  const register = useMutation({
    mutationFn: () =>
      data(
        service.register({
          ...form,
          organizationName: form.organizationName.trim(),
          ownerName: form.ownerName.trim(),
          email: trimmedEmail,
        }),
      ),
    onSuccess: (value) => {
      setResult(value);
      setAccount(null);
      setSessionError(null);
      setDigits(Array(OTP_LENGTH).fill(''));
      setResendSuccess(false);
      setResendCountdown(RESEND_COOLDOWN_SECONDS);
      setStep(3);
    },
  });

  const resend = useMutation({
    mutationFn: () => data(service.resendVerification(trimmedEmail)),
    onSuccess: (value) => {
      setResult(value);
      setDigits(Array(OTP_LENGTH).fill(''));
      setResendSuccess(true);
      setResendCountdown(RESEND_COOLDOWN_SECONDS);
      setSessionError(null);
      otpInputRefs.current[0]?.focus();
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async () => {
      setSessionError(null);
      setEnteringWorkspace(true);
      setLoadingStage(0);
      const startedAt = Date.now();
      const isTestEnv = import.meta.env.MODE === 'test';

      let verifiedAccount = account;
      if (!verifiedAccount) {
        verifiedAccount = await data(service.verifyCode(trimmedEmail, otpCode, form.password));
        if (!isMountedRef.current) return;
        setAccount(verifiedAccount);
      }

      if (!isTestEnv) {
        const elapsed = Date.now() - startedAt;
        if (elapsed < 260) {
          await waitMs(260 - elapsed);
          if (!isMountedRef.current) return;
        }
      }

      setLoadingStage(1);
      const user = await establishTrialSession(verifiedAccount, cache, form.password);
      if (!isMountedRef.current) return;

      if (!isTestEnv) {
        await waitMs(440);
        if (!isMountedRef.current) return;
      }

      setLoadingStage(2);
      const minTotalMs = isTestEnv ? 0 : 1400;
      const remaining = Math.max(0, minTotalMs - (Date.now() - startedAt));
      if (remaining > 0) {
        await waitMs(remaining);
        if (!isMountedRef.current) return;
      }

      setForm((prev) => ({ ...prev, password: '' }));
      setConfirmPassword('');
      navigate(getHomePath(user), { replace: true });
    },
    onError: (err) => {
      if (!isMountedRef.current) return;
      setEnteringWorkspace(false);
      setLoadingStage(0);
      setSessionError(
        err instanceof Error ? err : new Error('Không thể xác minh mã. Vui lòng thử lại.'),
      );
    },
  });

  const handleStep1Submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canRegister) return;
    const errors: StepFieldErrors = {};
    if (!form.organizationName.trim()) errors.organizationName = 'Nhập tên doanh nghiệp.';
    if (!form.ownerName.trim()) errors.ownerName = 'Nhập họ và tên người liên hệ.';
    if (!trimmedEmail) errors.email = 'Nhập email công việc.';
    else if (!EMAIL_PATTERN.test(trimmedEmail))
      errors.email = 'Email công việc chưa đúng định dạng.';
    if (!form.industry) errors.industry = 'Chọn ngành hoạt động.';
    if (!form.size) errors.size = 'Chọn quy mô nhân sự.';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstId = errors.organizationName
        ? 'organizationName'
        : errors.ownerName
          ? 'ownerName'
          : errors.email
            ? 'email'
            : errors.industry
              ? 'industry'
              : 'size';
      document.getElementById(firstId)?.focus();
      return;
    }

    register.reset();
    setStep(2);
  };

  const handleStep2Submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canRegister || register.isPending || !form.acceptedTerms) return;
    const errors: StepFieldErrors = {};
    const passwordEval = evaluatePasswordStrength(form.password, trimmedEmail);

    if (!form.password) errors.password = 'Nhập mật khẩu cho tài khoản.';
    else if (!form.password.trim()) errors.password = 'Mật khẩu không được chỉ chứa khoảng trắng.';
    else if (form.password.length < 12 || form.password.length > 72)
      errors.password = 'Mật khẩu cần từ 12 đến 72 ký tự.';
    else if (passwordEval.isCommon)
      errors.password = 'Mật khẩu quá phổ biến, vui lòng chọn mật khẩu an toàn hơn.';

    if (!confirmPassword) errors.confirmPassword = 'Nhập lại mật khẩu để xác nhận.';
    else if (confirmPassword !== form.password)
      errors.confirmPassword = 'Mật khẩu xác nhận chưa khớp.';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstId = errors.password ? 'password' : 'confirmPassword';
      document.getElementById(firstId)?.focus();
      return;
    }

    register.mutate();
  };

  const handleStep3Submit = (event: FormEvent) => {
    event.preventDefault();
    if (otpCode.length !== OTP_LENGTH || verifyOtp.isPending || (account && !sessionError)) return;
    verifyOtp.mutate();
  };

  const handleUseAnotherEmail = () => {
    setStep(1);
    setResult(null);
    setAccount(null);
    setDigits(Array(OTP_LENGTH).fill(''));
    setResendSuccess(false);
    setResendCountdown(0);
    setSessionError(null);
    setEnteringWorkspace(false);
    setLoadingStage(0);
    setFieldErrors({});
    setForm((prev) => ({ ...prev, password: '' }));
    setConfirmPassword('');
    register.reset();
    verifyOtp.reset();
    resend.reset();
    requestAnimationFrame(() => orgInputRef.current?.focus());
  };

  if (enteringWorkspace) {
    return (
      <TrialWorkspaceLoadingScreen
        email={account?.email || trimmedEmail}
        stage={loadingStage}
      />
    );
  }

  const stepHeadings: Record<RegisterStep, { title: string; subtitle: string }> = {
    1: {
      title: 'Thông tin doanh nghiệp',
      subtitle: 'Điền thông tin cơ bản để mở không gian dùng thử 14 ngày.',
    },
    2: {
      title: 'Thiết lập mật khẩu',
      subtitle: 'Đặt mật khẩu quản trị và xác nhận điều khoản dùng thử.',
    },
    3: {
      title: 'Xác minh email',
      subtitle: 'Hoàn tất bước cuối để mở không gian dùng thử doanh nghiệp.',
    },
  };

  const continuePath = safeDevelopmentPath(result?.developmentLink, 'verify');
  const activeError =
    readiness.error ||
    (step === 2 ? register.error : null) ||
    (step === 3 ? verifyOtp.error || resend.error || sessionError : null);

  const stepperHeader = (
    <nav aria-label="Tiến trình tạo tài khoản dùng thử">
      <ol className="pulse-auth-stepper">
        {REGISTER_STEPS.map((item) => {
          const isCurrent = step === item.step;
          const isDone = step > item.step;
          const canJumpBack = step === 2 && item.step === 1 && !register.isPending;

          return (
            <li
              key={item.step}
              className={`pulse-auth-stepper-item${
                isCurrent ? ' pulse-auth-stepper-item--active' : ''
              }${isDone ? ' pulse-auth-stepper-item--done' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {canJumpBack ? (
                <button
                  type="button"
                  className="pulse-auth-stepper-cell"
                  onClick={() => {
                    register.reset();
                    setStep(1);
                  }}
                >
                  <span className="pulse-auth-stepper-num" aria-hidden="true">
                    <Check size={12} strokeWidth={2.8} />
                  </span>
                  <span className="pulse-auth-stepper-label">{item.label}</span>
                </button>
              ) : (
                <div className="pulse-auth-stepper-cell">
                  <span className="pulse-auth-stepper-num" aria-hidden="true">
                    {isDone ? <Check size={12} strokeWidth={2.8} /> : item.step}
                  </span>
                  <span className="pulse-auth-stepper-label">{item.label}</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  return (
    <PulseAuthLayout
      mode="register"
      asideVariant="visual-light"
      asideImage="/images/trial/trial-sidebar-light.jpg"
      eyebrow="Dùng thử miễn phí 14 ngày"
      asideTitle={'Khởi tạo không gian dùng\u00A0thử cho doanh nghiệp'}
      asideText="Tối đa 5 tài khoản thành viên để thiết lập vị trí và theo dõi năng lực đội ngũ."
      headerSlot={stepperHeader}
      title={stepHeadings[step].title}
      subtitle={stepHeadings[step].subtitle}
      footer={
        <p>
          {step === 3 ? 'Đã xác minh trước đó? ' : 'Đã có tài khoản? '}
          <Link to="/login">Đăng nhập</Link>
        </p>
      }
    >
      <div className="pulse-auth-fields">
        {activeError && (
          <p role="alert" className="pulse-auth-error">
            {message(activeError)}
          </p>
        )}

        {step === 2 && register.error && trimmedEmail && (
          <p className="pulse-auth-subtle">
            Đã đăng ký email này?{' '}
            <Link to={`/business/try/verify?email=${encodeURIComponent(trimmedEmail)}`}>
              Nhập mã xác minh
            </Link>{' '}
            hoặc <Link to="/login">Đăng nhập</Link>.
          </p>
        )}

        {readiness.data && !readiness.data.canRegister && (
          <p role="alert" className="pulse-auth-error">
            Tạm chưa nhận đăng ký dùng thử.
          </p>
        )}

        {step === 1 && (
          <form className="pulse-auth-fields" noValidate onSubmit={handleStep1Submit}>
            <div className="pulse-auth-field">
              <label htmlFor="organizationName">Tên doanh nghiệp</label>
              <input
                ref={orgInputRef}
                id="organizationName"
                required
                maxLength={200}
                autoComplete="organization"
                placeholder="Công ty Sao Bắc"
                aria-invalid={fieldErrors.organizationName ? true : undefined}
                value={form.organizationName}
                onChange={(e) => update('organizationName', e.target.value)}
              />
              {fieldErrors.organizationName && (
                <p role="alert" className="pulse-auth-inline-error">
                  {fieldErrors.organizationName}
                </p>
              )}
            </div>

            <div className="pulse-auth-fields-two">
              <div className="pulse-auth-field">
                <label htmlFor="ownerName">Người liên hệ</label>
                <input
                  id="ownerName"
                  required
                  maxLength={200}
                  autoComplete="name"
                  placeholder="Họ và tên"
                  aria-invalid={fieldErrors.ownerName ? true : undefined}
                  value={form.ownerName}
                  onChange={(e) => update('ownerName', e.target.value)}
                />
                {fieldErrors.ownerName && (
                  <p role="alert" className="pulse-auth-inline-error">
                    {fieldErrors.ownerName}
                  </p>
                )}
              </div>

              <div className="pulse-auth-field">
                <label htmlFor="email">Email công việc</label>
                <input
                  id="email"
                  type="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  placeholder="ten@doanhnghiep.vn"
                  aria-invalid={fieldErrors.email ? true : undefined}
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
                {fieldErrors.email && (
                  <p role="alert" className="pulse-auth-inline-error">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="pulse-auth-fields-two">
              <div className="pulse-auth-field">
                <label htmlFor="industry">Ngành</label>
                <select
                  id="industry"
                  required
                  aria-invalid={fieldErrors.industry ? true : undefined}
                  value={form.industry}
                  onChange={(e) => update('industry', e.target.value)}
                >
                  <option value="" disabled>
                    Chọn ngành
                  </option>
                  {industries.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.industry && (
                  <p role="alert" className="pulse-auth-inline-error">
                    {fieldErrors.industry}
                  </p>
                )}
              </div>

              <div className="pulse-auth-field">
                <label htmlFor="size">Quy mô</label>
                <select
                  id="size"
                  required
                  aria-invalid={fieldErrors.size ? true : undefined}
                  value={form.size}
                  onChange={(e) => update('size', e.target.value)}
                >
                  <option value="" disabled>
                    Chọn quy mô
                  </option>
                  {sizes.map((size) => (
                    <option key={size} value={size}>
                      {size} nhân sự
                    </option>
                  ))}
                </select>
                {fieldErrors.size && (
                  <p role="alert" className="pulse-auth-inline-error">
                    {fieldErrors.size}
                  </p>
                )}
              </div>
            </div>

            <button type="submit" className="pulse-auth-primary" disabled={!canRegister}>
              Tiếp tục <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="pulse-auth-fields" noValidate onSubmit={handleStep2Submit}>
            <div className="pulse-auth-step-summary">
              <div className="pulse-auth-step-summary-meta">
                <strong>{form.organizationName.trim()}</strong> · <span>{trimmedEmail}</span>
              </div>
              <button
                type="button"
                className="pulse-auth-text-btn"
                disabled={register.isPending}
                onClick={() => {
                  register.reset();
                  setStep(1);
                }}
              >
                Sửa
              </button>
            </div>

            <div className="pulse-auth-field">
              <label htmlFor="password">Mật khẩu</label>
              <div className="pulse-auth-input-wrap">
                <input
                  ref={passwordInputRef}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={12}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="Từ 12 đến 72 ký tự"
                  aria-invalid={fieldErrors.password ? true : undefined}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                />
                <button
                  type="button"
                  className="pulse-auth-icon-button"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
              <TrialPasswordStrengthMeter password={form.password} email={trimmedEmail} />
              {fieldErrors.password && (
                <p role="alert" className="pulse-auth-inline-error">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="pulse-auth-field">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <div className="pulse-auth-input-wrap">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={12}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu"
                  aria-invalid={fieldErrors.confirmPassword ? true : undefined}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError('confirmPassword');
                  }}
                />
                <button
                  type="button"
                  className="pulse-auth-icon-button"
                  aria-label={
                    showConfirmPassword ? 'Ẩn mật khẩu nhập lại' : 'Hiện mật khẩu nhập lại'
                  }
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword ? (
                <p role="alert" className="pulse-auth-inline-error">
                  {fieldErrors.confirmPassword}
                </p>
              ) : confirmPassword.length > 0 && confirmPassword === form.password ? (
                <span className="pulse-auth-password-status pulse-auth-password-status--ok">
                  Mật khẩu khớp.
                </span>
              ) : null}
            </div>

            <div>
              <label className="pulse-auth-consent">
                <input
                  id="acceptedTerms"
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={(e) => update('acceptedTerms', e.target.checked)}
                />
                <span>Tôi đồng ý điều khoản dùng thử và xử lý dữ liệu đánh giá.</span>
              </label>
              {fieldErrors.acceptedTerms && (
                <p role="alert" className="pulse-auth-inline-error" style={{ marginTop: '6px' }}>
                  {fieldErrors.acceptedTerms}
                </p>
              )}
            </div>

            <div className="pulse-auth-step-actions">
              <button
                type="button"
                className="pulse-auth-secondary"
                disabled={register.isPending}
                onClick={() => {
                  register.reset();
                  setStep(1);
                }}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Quay lại
              </button>

              <button
                type="submit"
                className="pulse-auth-primary"
                disabled={!canRegister || register.isPending || !form.acceptedTerms}
              >
                {register.isPending && (
                  <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                )}
                {register.isPending ? 'Đang tạo tài khoản…' : 'Tạo tài khoản và nhận mã OTP'}
                {!register.isPending && <ArrowRight size={17} aria-hidden="true" />}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="pulse-auth-fields">
            {resendSuccess && (
              <div role="status" className="pulse-auth-otp-notice pulse-auth-otp-notice--resent">
                <div className="pulse-auth-otp-notice-icon" aria-hidden="true">
                  <MailCheck size={19} strokeWidth={2.2} />
                </div>
                <div className="pulse-auth-otp-notice-body">
                  <div className="pulse-auth-otp-notice-head">
                    <span className="pulse-auth-otp-notice-title">Đã gửi mã xác minh mới</span>
                    <span className="pulse-auth-otp-notice-badge">Vừa cập nhật</span>
                  </div>
                  <div className="pulse-auth-otp-notice-recipient">
                    <strong className="pulse-auth-otp-notice-email">{trimmedEmail}</strong>
                  </div>
                  <p className="pulse-auth-otp-notice-text">
                    Dùng mã mới nhất trong hộp thư đến hoặc thư mục thư rác.
                  </p>
                </div>
              </div>
            )}

            {!resendSuccess && (
              <div role="status" className="pulse-auth-otp-notice">
                <div className="pulse-auth-otp-notice-icon" aria-hidden="true">
                  <Mail size={19} strokeWidth={2.2} />
                </div>
                <div className="pulse-auth-otp-notice-body">
                  <div className="pulse-auth-otp-notice-head">
                    <span className="pulse-auth-otp-notice-title">Mã xác minh 6 số đã được gửi</span>
                    <span className="pulse-auth-otp-notice-badge">
                      <Clock3 size={11} strokeWidth={2.3} aria-hidden="true" />
                      Hiệu lực 24 giờ
                    </span>
                  </div>
                  <div className="pulse-auth-otp-notice-recipient">
                    <strong className="pulse-auth-otp-notice-email">{trimmedEmail}</strong>
                  </div>
                  <p className="pulse-auth-otp-notice-text">
                    Kiểm tra hộp thư đến hoặc thư mục thư rác nếu chưa thấy email.
                  </p>
                </div>
              </div>
            )}

            <form className="pulse-auth-fields" noValidate onSubmit={handleStep3Submit}>
              <OtpDigitGrid
                digits={digits}
                inputRefs={otpInputRefs}
                disabled={verifyOtp.isPending || (Boolean(account) && !sessionError)}
                hasError={Boolean(verifyOtp.error || sessionError)}
                onChangeDigits={(next) => {
                  setDigits(next);
                  if (verifyOtp.error) verifyOtp.reset();
                  if (sessionError) setSessionError(null);
                }}
              />

              <button
                type="submit"
                className="pulse-auth-primary"
                disabled={
                  otpCode.length !== OTP_LENGTH ||
                  verifyOtp.isPending ||
                  (Boolean(account) && !sessionError)
                }
              >
                {verifyOtp.isPending && (
                  <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                )}
                {verifyOtp.isPending ? 'Đang xác minh…' : 'Xác minh và vào dùng thử'}
                {!verifyOtp.isPending && <ArrowRight size={17} aria-hidden="true" />}
              </button>
            </form>

            {(!account || Boolean(sessionError)) && (
              <div className="pulse-auth-otp-footer-actions">
                <button
                  type="button"
                  className="pulse-auth-secondary"
                  disabled={resend.isPending || resendCountdown > 0}
                  onClick={() => resend.mutate()}
                >
                  {resend.isPending
                    ? 'Đang gửi lại…'
                    : resendCountdown > 0
                      ? `Gửi lại mã (${resendCountdown}s)`
                      : 'Gửi lại mã xác minh'}
                </button>

                <button
                  type="button"
                  className="pulse-auth-text-btn"
                  disabled={verifyOtp.isPending || resend.isPending}
                  onClick={handleUseAnotherEmail}
                >
                  Dùng email khác
                </button>
              </div>
            )}

            {continuePath && (
              <p className="pulse-auth-subtle">
                <Link to={continuePath}>Mở liên kết trong email (thử)</Link>
              </p>
            )}
          </div>
        )}
      </div>
    </PulseAuthLayout>
  );
}

function TrialAccountPage({ kind }: { kind: 'verify' | 'accept' }) {
  const [search] = useSearchParams();
  const token = search.get('token') ?? '';
  const email = search.get('email') ?? '';
  const navigate = useNavigate();
  const cache = useQueryClient();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendResult, setResendResult] = useState<TrialRegistrationDto | null>(null);
  const [account, setAccount] = useState<TrialAccountDto | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enteringWorkspace, setEnteringWorkspace] = useState(false);
  const [loadingStage, setLoadingStage] = useState<TrialLoadingStage>(0);
  const isMountedRef = useRef(true);
  const handoffTimersRef = useRef<number[]>([]);

  usePreloadPulseMark();

  const isVerify = kind === 'verify';
  const code = digits.join('');

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      for (const id of handoffTimersRef.current) {
        window.clearTimeout(id);
      }
      handoffTimersRef.current = [];
    };
  }, []);

  const waitMs = (ms: number) =>
    new Promise<void>((resolve) => {
      if (ms <= 0) {
        resolve();
        return;
      }
      const id = window.setTimeout(resolve, ms);
      handoffTimersRef.current.push(id);
    });

  useEffect(() => {
    if (isVerify && !token) {
      inputRefs.current[0]?.focus();
    }
  }, [isVerify, token]);

  const resend = useMutation({
    mutationFn: () => data(service.resendVerification(email)),
    onSuccess: (value) => {
      setDigits(Array(OTP_LENGTH).fill(''));
      setResendResult(value);
      inputRefs.current[0]?.focus();
    },
  });

  const verify = useMutation({
    mutationFn: (): Promise<TrialAccountDto> =>
      data(token ? service.verify(token, password) : service.verifyCode(email, code, password)),
    onSuccess: (verifiedAccount) => setAccount(verifiedAccount),
  });

  const login = useMutation({
    mutationFn: async () => {
      setEnteringWorkspace(true);
      setLoadingStage(0);
      const startedAt = Date.now();
      const isTestEnv = import.meta.env.MODE === 'test';

      let verifiedAccount = account;
      if (!verifiedAccount) {
        verifiedAccount =
          kind === 'accept'
            ? await data(service.accept(token, password))
            : await verify.mutateAsync();
        if (!isMountedRef.current) return;
        setAccount(verifiedAccount);
      }

      if (!isTestEnv) {
        const elapsed = Date.now() - startedAt;
        if (elapsed < 260) {
          await waitMs(260 - elapsed);
          if (!isMountedRef.current) return;
        }
      }

      setLoadingStage(1);
      const user = await establishTrialSession(verifiedAccount, cache, password);
      if (!isMountedRef.current) return;

      if (!isTestEnv) {
        await waitMs(440);
        if (!isMountedRef.current) return;
      }

      setLoadingStage(2);
      const minTotalMs = isTestEnv ? 0 : 1400;
      const remaining = Math.max(0, minTotalMs - (Date.now() - startedAt));
      if (remaining > 0) {
        await waitMs(remaining);
        if (!isMountedRef.current) return;
      }

      navigate(getHomePath(user), { replace: true });
    },
    onError: () => {
      if (!isMountedRef.current) return;
      setEnteringWorkspace(false);
      setLoadingStage(0);
    },
  });

  if (enteringWorkspace) {
    return (
      <TrialWorkspaceLoadingScreen
        email={account?.email || email || undefined}
        stage={loadingStage}
        mode={isVerify ? 'trial' : 'accept'}
      />
    );
  }

  const accountError =
    !token && (kind === 'accept' || !email)
      ? new Error('Thiếu thông tin xác minh. Hãy mở lại email hoặc đăng ký lại.')
      : verify.error || login.error;
  const canSubmit = isVerify ? token || code.length === 6 : token && password.length >= 12;

  return (
    <PulseAuthLayout
      mode="register"
      asideVariant="visual-light"
      asideImage="/images/trial/trial-sidebar-light.jpg"
      eyebrow="Dùng thử miễn phí 14 ngày"
      asideTitle={
        isVerify
          ? 'Xác nhận email để mở không gian dùng thử'
          : 'Tham gia không gian dùng thử doanh nghiệp'
      }
      asideText={
        isVerify
          ? 'Hoàn tất bước cuối để truy cập tài khoản quản trị.'
          : 'Đặt mật khẩu cá nhân để bắt đầu đánh giá theo vị trí được mời.'
      }
      title={isVerify ? 'Xác minh email' : 'Tham gia dùng thử'}
      subtitle={
        isVerify
          ? 'Hoàn tất xác minh để truy cập không gian dùng thử doanh nghiệp.'
          : 'Thiết lập mật khẩu để hoàn tất tham gia.'
      }
    >
      <div className="pulse-auth-fields">
        {accountError && (
          <p role="alert" className="pulse-auth-error">
            {message(accountError)}
          </p>
        )}

        {isVerify && !token && email && !account && (
          <div className="pulse-auth-fields">
            {resend.error && (
              <p role="alert" className="pulse-auth-error">
                {message(resend.error)}
              </p>
            )}

            {resendResult ? (
              <div role="status" className="pulse-auth-otp-notice pulse-auth-otp-notice--resent">
                <div className="pulse-auth-otp-notice-icon" aria-hidden="true">
                  <MailCheck size={19} strokeWidth={2.2} />
                </div>
                <div className="pulse-auth-otp-notice-body">
                  <div className="pulse-auth-otp-notice-head">
                    <span className="pulse-auth-otp-notice-title">Đã gửi yêu cầu cấp lại mã</span>
                    <span className="pulse-auth-otp-notice-badge">Vừa cập nhật</span>
                  </div>
                  <p className="pulse-auth-otp-notice-text">
                    Nếu email đang chờ xác minh, mã mới đã được gửi. Kiểm tra cả thư rác.
                  </p>
                </div>
              </div>
            ) : (
              <div role="status" className="pulse-auth-otp-notice">
                <div className="pulse-auth-otp-notice-icon" aria-hidden="true">
                  <Mail size={19} strokeWidth={2.2} />
                </div>
                <div className="pulse-auth-otp-notice-body">
                  <div className="pulse-auth-otp-notice-head">
                    <span className="pulse-auth-otp-notice-title">Xác minh bằng mã 6 số</span>
                    <span className="pulse-auth-otp-notice-badge">
                      <Clock3 size={11} strokeWidth={2.3} aria-hidden="true" />
                      Hiệu lực 24 giờ
                    </span>
                  </div>
                  <div className="pulse-auth-otp-notice-recipient">
                    <strong className="pulse-auth-otp-notice-email">{email}</strong>
                  </div>
                  <p className="pulse-auth-otp-notice-text">
                    Kiểm tra hộp thư đến hoặc thư mục thư rác để lấy mã xác nhận.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              className="pulse-auth-secondary"
              disabled={resend.isPending}
              onClick={() => resend.mutate()}
            >
              {resend.isPending ? 'Đang gửi lại…' : 'Gửi lại mã xác minh'}
            </button>
          </div>
        )}

        <form
          className="pulse-auth-fields"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit && !login.isPending) login.mutate();
          }}
        >
          {isVerify && !token && (
            <OtpDigitGrid
              digits={digits}
              inputRefs={inputRefs}
              disabled={verify.isPending || login.isPending}
              hasError={Boolean(accountError)}
              hint="Nhập mã 6 chữ số từ email để vào thẳng hệ thống."
              onChangeDigits={setDigits}
            />
          )}
          {!isVerify && (
            <div className="pulse-auth-field">
              <label htmlFor="trial-password">Mật khẩu</label>
              <div className="pulse-auth-input-wrap">
                <input
                  id="trial-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={12}
                  maxLength={72}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Từ 12 đến 72 ký tự"
                />
                <button
                  type="button"
                  className="pulse-auth-icon-button"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
              <TrialPasswordStrengthMeter password={password} email={email} />
            </div>
          )}
          <button
            type="submit"
            className="pulse-auth-primary"
            disabled={!canSubmit || verify.isPending || login.isPending}
          >
            {login.isPending || verify.isPending ? (
              <Loader2 size={17} className="animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight size={17} aria-hidden="true" />
            )}
            {isVerify ? 'Xác minh và vào hệ thống' : 'Tham gia dùng thử'}
          </button>
        </form>
      </div>
    </PulseAuthLayout>
  );
}

export function TrialVerifyPage() {
  return <TrialAccountPage kind="verify" />;
}

export function TrialAcceptPage() {
  return <TrialAccountPage kind="accept" />;
}
