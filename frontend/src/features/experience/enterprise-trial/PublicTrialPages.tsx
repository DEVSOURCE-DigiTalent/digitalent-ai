import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { PulseAuthLayout } from '@/features/public/pulse-landing/PulseAuthLayout';
import { enterpriseTrialService as service, type TrialAccountDto, type TrialRegistrationDto, type TrialRegistrationRequest } from '@/services/enterprise-trial.service';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getHomePath } from '@/lib/navigation';
import { data, message, safeDevelopmentPath } from './trial-ui';

const industries = ['Công nghệ thông tin', 'Tài chính – Ngân hàng', 'Sản xuất', 'Thương mại – Bán lẻ', 'Giáo dục', 'Y tế', 'Dịch vụ', 'Khác'];
export function TrialRegisterPage() {
  const readiness = useQuery({ queryKey: ['enterprise-trial', 'readiness'], queryFn: () => data(service.readiness()), retry: false, refetchOnMount: 'always' });
  const [form, setForm] = useState<TrialRegistrationRequest>({ organizationName: '', ownerName: '', email: '', password: '', industry: '', size: '', goal: 'competency-assessment', acceptedTerms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<TrialRegistrationDto | null>(null);
  const register = useMutation({ mutationFn: () => data(service.register(form)), onSuccess: value => { setResult(value); setForm(previous => ({ ...previous, password: '' })); } });
  const canRegister = readiness.data?.canRegister === true;
  const update = (key: keyof TrialRegistrationRequest, value: string | boolean) => setForm(previous => ({ ...previous, [key]: value }));
  const continuePath = safeDevelopmentPath(result?.developmentLink, 'verify');
  const requestError = readiness.error || register.error;
  return <PulseAuthLayout
    eyebrow="Dùng thử miễn phí"
    title={result ? 'Kiểm tra hộp thư.' : 'Thông tin doanh nghiệp'}
    subtitle={result ? `Mã 6 số đã gửi tới ${form.email}.` : 'Bước 1/4 · Sau đó mời nhân viên làm bài đánh giá năng lực.'}
    asideTitle="Biết đội ngũ đang ở mức nào."
    asideText="Nhân viên làm một bài test ba cấp, mentor DigiTalent chấm, doanh nghiệp nhận bảng năng lực."
    asidePoints={['1 · Thông tin doanh nghiệp', '2 · Mời nhân viên, đặt hạn làm bài', '3 · Làm bài có giám sát, mentor chấm', '4 · Bảng năng lực + học thử mức Cơ bản']}
    footer={<p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>}
  >
    <div className="pulse-auth-fields">
      {requestError && <p role="alert" className="pulse-auth-error">{message(requestError)}</p>}
      {register.error && form.email && <p className="pulse-auth-subtle">Đã đăng ký email này? <Link to={`/business/try/verify?email=${encodeURIComponent(form.email.trim())}`}>Nhập mã hoặc gửi lại</Link>.</p>}
      {readiness.data && !readiness.data.canRegister && <p role="alert" className="pulse-auth-error">Tạm chưa nhận đăng ký dùng thử.</p>}
      {result ? <div className="pulse-auth-fields">{result.developmentCode && <p className="pulse-auth-info">Mã (môi trường thử): <strong>{result.developmentCode}</strong></p>}<Link className="pulse-auth-primary" to={`/business/try/verify?email=${encodeURIComponent(form.email)}`}>Nhập mã xác minh <ArrowRight size={17} aria-hidden="true" /></Link>{continuePath && <p className="pulse-auth-subtle"><Link to={continuePath}>Mở liên kết trong email (thử)</Link></p>}</div> :
      <form className="pulse-auth-fields" onSubmit={(event: FormEvent) => { event.preventDefault(); if (canRegister && !register.isPending) register.mutate(); }}>
        <div className="pulse-auth-fields-two">
          <div className="pulse-auth-field"><label htmlFor="organizationName">Tên doanh nghiệp</label><input id="organizationName" required maxLength={200} autoComplete="organization" placeholder="Công ty Sao Bắc" value={form.organizationName} onChange={e => update('organizationName', e.target.value)} /></div>
          <div className="pulse-auth-field"><label htmlFor="ownerName">Người liên hệ</label><input id="ownerName" required maxLength={200} autoComplete="name" placeholder="Họ và tên" value={form.ownerName} onChange={e => update('ownerName', e.target.value)} /></div>
        </div>
        <div className="pulse-auth-fields-two">
          <div className="pulse-auth-field"><label htmlFor="email">Email công việc</label><input id="email" type="email" required maxLength={200} autoComplete="email" placeholder="ten@doanhnghiep.vn" value={form.email} onChange={e => update('email', e.target.value)} /></div>
          <div className="pulse-auth-field"><label htmlFor="password">Mật khẩu</label><div className="pulse-auth-input-wrap"><input id="password" type={showPassword ? 'text' : 'password'} required minLength={12} maxLength={72} autoComplete="new-password" placeholder="12–72 ký tự" value={form.password} onChange={e => update('password', e.target.value)} /><button type="button" className="pulse-auth-icon-button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></div></div>
        </div>
        <div className="pulse-auth-fields-two">
          <div className="pulse-auth-field"><label htmlFor="industry">Ngành</label><select id="industry" required value={form.industry} onChange={e => update('industry', e.target.value)}><option value="" disabled>Chọn ngành</option>{industries.map(industry => <option key={industry}>{industry}</option>)}</select></div>
          <div className="pulse-auth-field"><label htmlFor="size">Quy mô</label><select id="size" required value={form.size} onChange={e => update('size', e.target.value)}><option value="" disabled>Chọn quy mô</option>{['1-20', '21-100', '101-500', '500+'].map(size => <option key={size} value={size}>{size} nhân sự</option>)}</select></div>
        </div>
        <label className="pulse-auth-consent"><input type="checkbox" required checked={form.acceptedTerms} onChange={e => update('acceptedTerms', e.target.checked)} />Tôi đồng ý điều khoản dùng thử và xử lý dữ liệu đánh giá.</label>
        <button type="submit" className="pulse-auth-primary" disabled={!canRegister || register.isPending || !form.acceptedTerms}>{register.isPending ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}{register.isPending ? 'Đang gửi…' : 'Tiếp tục'}</button>
      </form>}
    </div>
  </PulseAuthLayout>;
}

function TrialAccountPage({ kind }: { kind: 'verify' | 'accept' }) {
  const [search] = useSearchParams(); const token = search.get('token') ?? ''; const email = search.get('email') ?? ''; const navigate = useNavigate(); const cache = useQueryClient();
  const [code, setCode] = useState('');
  const [resendResult, setResendResult] = useState<TrialRegistrationDto | null>(null);
  const [account, setAccount] = useState<TrialAccountDto | null>(null); const [password, setPassword] = useState('');
  const resend = useMutation({ mutationFn: () => data(service.resendVerification(email)), onSuccess: value => { setCode(''); setResendResult(value); } });
  
  const finishSession = async (verifiedAccount: TrialAccountDto) => {
    if (verifiedAccount.accessToken) {
      localStorage.setItem('accessToken', verifiedAccount.accessToken);
      if (verifiedAccount.refreshToken) localStorage.setItem('refreshToken', verifiedAccount.refreshToken);
    } else if (password) {
      const response = await data(service.login(verifiedAccount.email, password));
      localStorage.setItem('accessToken', response.accessToken);
      if (response.refreshToken) localStorage.setItem('refreshToken', response.refreshToken);
    }
    const user = await data(service.currentUser());
    cache.clear();
    useCurrentUser.getState().setUser(user);
    navigate(getHomePath(user), { replace: true });
  };

  const verify = useMutation({
    mutationFn: (): Promise<TrialAccountDto> => data(token ? service.verify(token, password) : service.verifyCode(email, code, password)),
    onSuccess: verifiedAccount => setAccount(verifiedAccount),
  });

  const login = useMutation({ mutationFn: async () => {
    let verifiedAccount = account;
    if (!verifiedAccount) {
      verifiedAccount = kind === 'accept' ? await data(service.accept(token, password)) : await verify.mutateAsync();
      setAccount(verifiedAccount);
    }
    await finishSession(verifiedAccount);
  } });

  const accountError = !token && (kind === 'accept' || !email) ? new Error('Thiếu thông tin xác minh. Hãy mở lại email hoặc đăng ký lại.') : verify.error || login.error;
  const isVerify = kind === 'verify';
  const canSubmit = isVerify ? (token || code.length === 6) : (token && password.length >= 12);

  return <PulseAuthLayout
    eyebrow="Dùng thử miễn phí"
    title={isVerify ? 'Xác minh email' : 'Tham gia dùng thử'}
    subtitle={isVerify ? `Nhập mã xác thực 6 số gửi tới ${email || 'email của bạn'}.` : 'Thiết lập mật khẩu để hoàn tất tham gia.'}
    asideTitle="Bước tiếp theo: mời nhân viên."
    asideText="Thêm nhân viên tay hoặc bằng file Excel, đặt hạn làm bài và giờ mong muốn chấm."
  >
    <div className="pulse-auth-fields">
      {accountError && <p role="alert" className="pulse-auth-error">{message(accountError)}</p>}
      {verify.isPending && <p role="status" className="pulse-auth-info">Đang xác minh…</p>}
      {isVerify && !token && email && !account && <div className="pulse-auth-fields">
        {resend.error && <p role="alert" className="pulse-auth-error">{message(resend.error)}</p>}
        {resendResult && <p role="status" className="pulse-auth-success">Nếu email đang chờ xác minh, mã mới đã được gửi. Kiểm tra cả thư rác.{resendResult.developmentCode && <> Mã thử: <strong>{resendResult.developmentCode}</strong></>}</p>}
        <button type="button" className="pulse-auth-secondary" disabled={resend.isPending} onClick={() => resend.mutate()}>{resend.isPending ? 'Đang gửi lại…' : 'Gửi lại mã xác minh'}</button>
      </div>}
      {account && <p role="status" className="pulse-auth-success">Tài khoản đã xác minh: {account.email}. Đang chuyển vào hệ thống…</p>}
      <form className="pulse-auth-fields" onSubmit={event => { event.preventDefault(); if (canSubmit && !login.isPending) login.mutate(); }}>
        {isVerify && !token && (
          <div className="pulse-auth-field">
            <label htmlFor="trial-code">Mã xác minh email (OTP 6 số)</label>
            <input
              id="trial-code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              autoComplete="one-time-code"
              value={code}
              onChange={event => {
                const next = event.target.value.replace(/\D/g, '');
                setCode(next);
              }}
              placeholder="Nhập 6 chữ số"
            />
            <span className="pulse-auth-field-hint">Chỉ cần nhập mã 6 số từ email để vào thẳng hệ thống.</span>
          </div>
        )}
        {!isVerify && (
          <div className="pulse-auth-field">
            <label htmlFor="trial-password">Mật khẩu</label>
            <input
              id="trial-password"
              type="password"
              required
              minLength={12}
              maxLength={72}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Tối thiểu 12 ký tự"
            />
            <span className="pulse-auth-field-hint">12–72 ký tự.</span>
          </div>
        )}
        <button type="submit" className="pulse-auth-primary" disabled={!canSubmit || verify.isPending || login.isPending}>
          {login.isPending || verify.isPending ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
          {isVerify ? 'Xác minh và vào hệ thống' : 'Tham gia dùng thử'}
        </button>
      </form>
    </div>
  </PulseAuthLayout>;
}
export function TrialVerifyPage() { return <TrialAccountPage kind="verify" />; }
export function TrialAcceptPage() { return <TrialAccountPage kind="accept" />; }
