import { useState, useRef, type FormEvent, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Building2,
  User,
  Mail,
  Lock,
} from 'lucide-react';
import { PulseAuthLayout } from '@/features/public/pulse-landing/PulseAuthLayout';
import {
  enterpriseTrialService as service,
  type TrialAccountDto,
  type TrialRegistrationDto,
  type TrialRegistrationRequest,
} from '@/services/enterprise-trial.service';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getHomePath } from '@/lib/navigation';
import { data, message, safeDevelopmentPath } from './trial-ui';
import { cn } from '@/lib/utils';

const industries = [
  'Công nghệ thông tin',
  'Tài chính – Ngân hàng',
  'Sản xuất & Chế tạo',
  'Thương mại – Bán lẻ',
  'Giáo dục & Đào tạo',
  'Y tế & Chăm sóc sức khỏe',
  'Dịch vụ doanh nghiệp',
  'Khác',
];

function getPasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: '', color: '#e2e8f0' };
  let score = 0;
  if (pass.length >= 12) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 1, label: 'Yếu', color: '#ef4444' };
  if (score <= 3) return { score: 2, label: 'Trung bình', color: '#f59e0b' };
  return { score: 3, label: 'Mạnh (Tối ưu)', color: '#10b981' };
}

/**
 * Đăng Ký Dùng Thử Doanh Nghiệp 3 Bước (Enterprise Trial 3-Step Guided Flow) v3.0
 */
export function TrialRegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const readiness = useQuery({
    queryKey: ['enterprise-trial', 'readiness'],
    queryFn: () => data(service.readiness()),
    retry: false,
    refetchOnMount: 'always',
  });
  const catalog = useQuery({
    queryKey: ['enterprise-trial', 'catalog'],
    queryFn: () => data(service.catalog()),
    retry: false,
  });

  const [form, setForm] = useState<TrialRegistrationRequest>({
    organizationName: '',
    ownerName: '',
    email: '',
    password: '',
    industry: '',
    size: '',
    goal: '',
    acceptedTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<TrialRegistrationDto | null>(null);

  const register = useMutation({
    mutationFn: () => data(service.register(form)),
    onSuccess: (value) => {
      setResult(value);
      setForm((previous) => ({ ...previous, password: '' }));
    },
  });

  const canRegister = readiness.data?.canRegister === true && !!catalog.data?.some((position) => position.eligible);
  const update = (key: keyof TrialRegistrationRequest, value: string | boolean) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const continuePath = safeDevelopmentPath(result?.developmentLink, 'verify');
  const requestError = readiness.error || catalog.error || register.error;
  const passStrength = getPasswordStrength(form.password);

  const isStep1Valid =
    form.organizationName.trim().length > 0 &&
    form.ownerName.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.password.length >= 12;

  return (
    <PulseAuthLayout
      eyebrow="Đăng ký dùng thử doanh nghiệp"
      title={result ? 'Kiểm tra hộp thư xác minh' : 'Tạo không gian doanh nghiệp.'}
      subtitle={
        result
          ? 'Chúng tôi đã gửi mã xác thực. Nhập mã OTP để kích hoạt ngay không gian tổ chức.'
          : '3 bước đơn giản để bắt đầu thiết lập mục tiêu năng lực, mời 10 nhân sự và đo khoảng cách đầu vào.'
      }
      asideTitle="Mỗi vị trí cần một lộ trình năng lực thực chất."
      asideText="Doanh nghiệp xác định đích đến, nhân viên biết xuất phát điểm và quản lý đánh giá bằng sản phẩm công việc thực tế."
      asidePoints={[
        '10 ghế nhân sự trọn đời · mở toàn bộ khóa Cơ bản',
        'Chuẩn hóa theo Thông tư 02/2025/TT-BGDĐT của Bộ GD&ĐT',
        '100% không yêu cầu nhập thẻ tín dụng',
      ]}
      footer={
        <p>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link> · <Link to="/business">Xem lại giải pháp</Link>
        </p>
      }
    >
      <div className="pulse-auth-fields">
        {requestError && <p role="alert" className="pulse-auth-error">{message(requestError)}</p>}
        {register.error && form.email && (
          <p className="pulse-auth-subtle">
            Đã đăng ký email này?{' '}
            <Link to={`/business/try/verify?email=${encodeURIComponent(form.email.trim())}`}>
              Xác minh hoặc gửi lại mã
            </Link>.
          </p>
        )}
        {readiness.isPending && <p role="status" className="pulse-auth-info">Đang kiểm tra điều kiện dùng thử…</p>}

        {/* Success registration message */}
        {result ? (
          <div className="space-y-5 text-center py-4">
            <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Mã xác minh đã được gửi!</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                Mã xác thực 6 số đã được gửi đến <strong>{form.email}</strong>.
              </p>
            </div>

            {result.developmentCode && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-center">
                Mã thử trong môi trường demo: <strong className="font-mono text-base">{result.developmentCode}</strong>
              </div>
            )}

            <Link
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition"
              to={`/business/try/verify?email=${encodeURIComponent(form.email)}`}
            >
              Nhập mã xác minh ngay <ArrowRight size={17} aria-hidden="true" />
            </Link>

            {continuePath && (
              <p className="pulse-auth-subtle">
                Dành cho kiểm thử: <Link to={continuePath}>Mở liên kết mô phỏng xác minh</Link>
              </p>
            )}
          </div>
        ) : (
          <form
            className="space-y-6 text-left"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              if (step === 1) {
                if (isStep1Valid) setStep(2);
                return;
              }
              if (canRegister && !register.isPending && form.acceptedTerms) {
                register.mutate();
              }
            }}
          >
            {/* Step Indicator */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <span className={cn('size-7 rounded-full text-xs font-bold flex items-center justify-center transition-all', step === 1 ? 'bg-amber-500 text-white shadow-sm' : 'bg-emerald-500 text-white')}>
                  {step === 1 ? '1' : <CheckCircle2 className="size-4" />}
                </span>
                <span className={cn('text-xs font-bold', step === 1 ? 'text-slate-900' : 'text-slate-500')}>
                  Tổ chức & Người phụ trách
                </span>
              </div>
              <div className="h-0.5 w-8 bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className={cn('size-7 rounded-full text-xs font-bold flex items-center justify-center transition-all', step === 2 ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400')}>
                  2
                </span>
                <span className={cn('text-xs font-bold', step === 2 ? 'text-slate-900' : 'text-slate-400')}>
                  Bối cảnh & Khung mẫu
                </span>
              </div>
            </div>

            {/* STEP 1: Organization & Account Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="organizationName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Tên tổ chức / Doanh nghiệp
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      id="organizationName"
                      required
                      maxLength={200}
                      autoComplete="organization"
                      placeholder="Ví dụ: Công ty Cổ phần Sao Bắc"
                      value={form.organizationName}
                      onChange={(e) => update('organizationName', e.target.value)}
                      className="w-full h-11 rounded-xl bg-white border border-slate-300 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ownerName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Họ và tên người phụ trách
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      id="ownerName"
                      required
                      maxLength={200}
                      autoComplete="name"
                      placeholder="Ví dụ: Trần Văn Linh"
                      value={form.ownerName}
                      onChange={(e) => update('ownerName', e.target.value)}
                      className="w-full h-11 rounded-xl bg-white border border-slate-300 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email công việc
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      maxLength={200}
                      autoComplete="email"
                      placeholder="ten@doanhnghiep.vn"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      className="w-full h-11 rounded-xl bg-white border border-slate-300 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm transition"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">Ưu tiên email công việc để dễ xác minh tổ chức.</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Mật khẩu quản trị
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={12}
                      maxLength={72}
                      autoComplete="new-password"
                      placeholder="Tối thiểu 12 ký tự"
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      className="w-full h-11 rounded-xl bg-white border border-slate-300 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm transition"
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {form.password && (
                    <div className="pt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                        <span className="font-bold" style={{ color: passStrength.color }}>
                          {passStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                        <div className={cn('h-full flex-1 rounded-full transition-all', passStrength.score >= 1 ? 'bg-red-500' : 'bg-slate-200')} />
                        <div className={cn('h-full flex-1 rounded-full transition-all', passStrength.score >= 2 ? 'bg-amber-500' : 'bg-slate-200')} />
                        <div className={cn('h-full flex-1 rounded-full transition-all', passStrength.score >= 3 ? 'bg-emerald-500' : 'bg-slate-200')} />
                      </div>
                    </div>
                  )}
                  <span className="text-[11px] text-slate-500">Từ 12 đến 72 ký tự.</span>
                </div>

                <button
                  type="submit"
                  disabled={!isStep1Valid}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition cursor-pointer"
                >
                  Tiếp tục sang bước 2 <ArrowRight size={17} />
                </button>
              </div>
            )}

            {/* STEP 2: Business Context & Catalog Preview */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="industry" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Ngành doanh nghiệp
                    </label>
                    <select
                      id="industry"
                      required
                      value={form.industry}
                      onChange={(e) => update('industry', e.target.value)}
                      className="w-full h-11 rounded-xl bg-white border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm"
                    >
                      <option value="" disabled>Chọn ngành nghề</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="size" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Quy mô nhân sự
                    </label>
                    <select
                      id="size"
                      required
                      value={form.size}
                      onChange={(e) => update('size', e.target.value)}
                      className="w-full h-11 rounded-xl bg-white border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm"
                    >
                      <option value="" disabled>Chọn quy mô</option>
                      {['1-20', '21-100', '101-500', '500+'].map((sz) => (
                        <option key={sz} value={sz}>{sz} nhân sự</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="goal" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Mục tiêu đào tạo ưu tiên
                  </label>
                  <select
                    id="goal"
                    required
                    value={form.goal}
                    onChange={(e) => update('goal', e.target.value)}
                    className="w-full h-11 rounded-xl bg-white border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm"
                  >
                    <option value="" disabled>Chọn mục tiêu trước mắt</option>
                    <option value="digital-skills">Nâng cao kỹ năng số toàn diện chuẩn TT02</option>
                    <option value="onboarding">Chuẩn hóa nhân sự mới vào nghề</option>
                    <option value="training-progress">Theo dõi và đo lường khoảng trống năng lực</option>
                  </select>
                </div>

                {/* Framework Preview Card */}
                {catalog.data && (
                  <div className="rounded-2xl border border-amber-200/90 bg-amber-50/50 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 font-bold text-amber-900">
                        <Sparkles className="size-3.5 text-amber-600" /> Khung năng lực mẫu đi kèm
                      </span>
                      <span className="rounded-md bg-amber-200/70 text-amber-900 font-semibold px-2 py-0.5 text-[11px]">
                        Miễn phí 10 ghế
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {['Kế toán tài chính', 'Quản trị nhân sự', 'Kinh doanh CRM', 'Marketing số'].map((dept) => (
                        <span key={dept} className="rounded-lg bg-white border border-amber-200 px-2.5 py-1 text-slate-800 font-medium">
                          {dept}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Bạn có thể tùy biến trần năng lực và thêm các vị trí khác ngay sau khi kích hoạt không gian.
                    </p>
                  </div>
                )}

                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    required
                    checked={form.acceptedTerms}
                    onChange={(e) => update('acceptedTerms', e.target.checked)}
                    className="mt-0.5 size-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>
                    Tôi đồng ý với điều khoản sử dụng nền tảng và chính sách xử lý dữ liệu đánh giá năng lực của DigiTalent Pulse.
                  </span>
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    ← Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={!canRegister || register.isPending || !form.acceptedTerms || !form.industry || !form.size || !form.goal}
                    className="w-2/3 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition cursor-pointer"
                  >
                    {register.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Đang tạo không gian…
                      </span>
                    ) : (
                      <>
                        Tạo không gian dùng thử <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </PulseAuthLayout>
  );
}

/**
 * Xác minh tài khoản doanh nghiệp (Verify Owner / Accept Invite) v3.0
 * Tích hợp 6-Box Auto-Focus OTP Input và đếm ngược 60s.
 */
function TrialAccountPage({ kind }: { kind: 'verify' | 'accept' }) {
  const [search] = useSearchParams();
  const token = search.get('token') ?? '';
  const email = search.get('email') ?? '';
  const navigate = useNavigate();
  const cache = useQueryClient();

  // 6-box OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [resendResult, setResendResult] = useState<TrialRegistrationDto | null>(null);
  const [account, setAccount] = useState<TrialAccountDto | null>(null);
  const [password, setPassword] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [countdown]);

  const resend = useMutation({
    mutationFn: () => data(service.resendVerification(email)),
    onSuccess: (value) => {
      setOtpDigits(['', '', '', '', '', '']);
      setResendResult(value);
      setCountdown(60);
      setCanResend(false);
    },
  });

  const fullOtp = otpDigits.join('');

  const verify = useMutation({
    mutationFn: (): Promise<TrialAccountDto> =>
      data(token ? service.verify(token, password) : service.verifyCode(email, fullOtp, password)),
    onSuccess: (verifiedAccount) => setAccount(verifiedAccount),
  });

  const login = useMutation({
    mutationFn: async () => {
      let verifiedAccount = account;
      if (!verifiedAccount) {
        verifiedAccount = kind === 'accept' ? await data(service.accept(token, password)) : await verify.mutateAsync();
        setAccount(verifiedAccount);
      }
      const response = await data(service.login(verifiedAccount.email, password));
      localStorage.setItem('accessToken', response.accessToken);
      const user = await data(service.currentUser());
      cache.clear();
      useCurrentUser.getState().setUser(user);
      navigate(getHomePath(user), { replace: true });
    },
  });

  const accountError = !token && (kind === 'accept' || !email)
    ? new Error('Thiếu thông tin xác minh. Hãy mở lại email hoặc đăng ký lại.')
    : verify.error || login.error;

  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    if (cleaned.length > 1) {
      // Dán chuỗi nhiều ký tự
      const chars = cleaned.slice(0, 6).split('');
      const updated = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        updated[i] = chars[i] || '';
      }
      setOtpDigits(updated);
      const nextIdx = Math.min(chars.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleaned;
    setOtpDigits(updated);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fillMockCode = () => {
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
  };

  return (
    <PulseAuthLayout
      eyebrow="Xác minh tài khoản doanh nghiệp"
      title={kind === 'verify' ? 'Xác minh quyền quản trị' : 'Tham gia không gian dùng thử'}
      subtitle={
        kind === 'verify' && !token
          ? `Nhập mã 6 chữ số đã được gửi tới ${email} để kích hoạt không gian tổ chức.`
          : 'Liên kết xác minh bảo mật có thời hạn. Nhập mật khẩu quản trị để tiếp tục vào tổ chức.'
      }
      asideTitle="Không gian làm việc đang chờ đón bạn."
      asideText="Sau khi xác minh, bạn sẽ mở ra bàn làm việc doanh nghiệp với đầy đủ công cụ thiết lập trần năng lực và phân bổ suất học."
    >
      <div className="pulse-auth-fields space-y-5 text-left">
        {accountError && <p role="alert" className="pulse-auth-error">{message(accountError)}</p>}
        {verify.isPending && <p role="status" className="pulse-auth-info">Đang đối soát mã xác minh…</p>}

        {kind === 'verify' && !token && email && !account && (
          <div className="space-y-3">
            {resend.error && <p role="alert" className="pulse-auth-error">{message(resend.error)}</p>}
            {resendResult && (
              <p role="status" className="pulse-auth-success">
                Mã mới đã được gửi tới hộp thư của bạn. Vui lòng kiểm tra cả thư rác.
              </p>
            )}
          </div>
        )}

        {account && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>Tài khoản <strong>{account.email}</strong> đã xác minh thành công!</span>
          </div>
        )}

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if ((token || (kind === 'verify' && email && fullOtp.length === 6)) && !login.isPending) {
              login.mutate();
            }
          }}
        >
          {/* 6-box OTP Input */}
          {kind === 'verify' && !token && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Mã OTP xác thực 6 chữ số
              </label>
              <div className="flex items-center justify-between gap-2 max-w-sm mx-auto">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="size-12 rounded-xl bg-white border border-slate-300 text-center font-mono text-xl font-extrabold text-slate-900 shadow-sm focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition"
                  />
                ))}
              </div>

              {/* Demo Helper Button */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={fillMockCode}
                  className="inline-flex items-center gap-1 font-semibold text-amber-600 hover:text-amber-700 underline"
                >
                  <Sparkles className="size-3" /> Thử mã demo: 123456
                </button>

                <span>
                  {canResend ? (
                    <button
                      type="button"
                      disabled={resend.isPending}
                      onClick={() => resend.mutate()}
                      className="font-bold text-slate-800 hover:text-amber-600 underline"
                    >
                      {resend.isPending ? 'Đang gửi…' : 'Gửi lại mã'}
                    </button>
                  ) : (
                    <span>Gửi lại sau 00:{countdown < 10 ? `0${countdown}` : countdown}</span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Password confirmation */}
          <div className="space-y-1.5">
            <label htmlFor="trial-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Mật khẩu quản trị
            </label>
            <input
              id="trial-password"
              type="password"
              required
              minLength={12}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu đã đặt khi đăng ký"
              autoComplete={kind === 'accept' ? 'new-password' : 'current-password'}
              className="w-full h-11 rounded-xl bg-white border border-slate-300 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm transition"
            />
            <span className="text-[11px] text-slate-500">
              {kind === 'accept' ? 'Đặt mật khẩu 12–72 ký tự.' : 'Nhập lại mật khẩu để xác minh và tự động đăng nhập.'}
            </span>
          </div>

          <button
            type="submit"
            disabled={
              (!token && (!email || fullOtp.length !== 6)) ||
              verify.isPending ||
              login.isPending ||
              password.length < 12
            }
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition cursor-pointer"
          >
            {login.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                Đang đăng nhập vào tổ chức…
              </span>
            ) : (
              <>
                {kind === 'accept' ? 'Tham gia dùng thử' : 'Xác minh & Vào không gian doanh nghiệp'}{' '}
                <ArrowRight size={17} aria-hidden="true" />
              </>
            )}
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
