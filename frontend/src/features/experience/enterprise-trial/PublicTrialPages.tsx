import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { PulseAuthLayout } from '@/features/public/pulse-landing/PulseAuthLayout';
import { enterpriseTrialService as service, type TrialAccountDto, type TrialRegistrationDto, type TrialRegistrationRequest } from '@/services/enterprise-trial.service';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getHomePath } from '@/lib/navigation';
import { data, message, safeDevelopmentPath } from './trial-ui';

const industries = ['Công nghệ thông tin', 'Tài chính – Ngân hàng', 'Sản xuất', 'Thương mại – Bán lẻ', 'Giáo dục', 'Y tế', 'Dịch vụ', 'Khác'];
export function TrialRegisterPage() {
  const readiness = useQuery({ queryKey: ['enterprise-trial', 'readiness'], queryFn: () => data(service.readiness()), retry: false, refetchOnMount: 'always' });
  const catalog = useQuery({ queryKey: ['enterprise-trial', 'catalog'], queryFn: () => data(service.catalog()), retry: false });
  const [form, setForm] = useState<TrialRegistrationRequest>({ organizationName: '', ownerName: '', email: '', password: '', industry: '', size: '', goal: '', acceptedTerms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<TrialRegistrationDto | null>(null);
  const register = useMutation({ mutationFn: () => data(service.register(form)), onSuccess: value => { setResult(value); setForm(previous => ({ ...previous, password: '' })); } });
  const canRegister = readiness.data?.canRegister === true && !!catalog.data?.some(position => position.eligible);
  const update = (key: keyof TrialRegistrationRequest, value: string | boolean) => setForm(previous => ({ ...previous, [key]: value }));
  const continuePath = safeDevelopmentPath(result?.developmentLink, 'verify');
  const requestError = readiness.error || catalog.error || register.error;
  return <PulseAuthLayout
    eyebrow="Bắt đầu với DigiTalent Pulse"
    title={result ? 'Kiểm tra hộp thư của bạn.' : 'Tạo không gian doanh nghiệp.'}
    subtitle={result ? 'Chúng tôi đã nhận đăng ký. Xác minh email để kích hoạt không gian của tổ chức.' : 'Một bước đăng ký để bắt đầu thiết kế mục tiêu năng lực, mời nhân viên và đo khoảng cách đầu vào.'}
    asideTitle="Mỗi người học cần một lộ trình đúng vị trí."
    asideText="Doanh nghiệp xác định đích đến, nhân viên biết điểm xuất phát và quản lý đánh giá bằng minh chứng thực tế."
    asidePoints={['Thiết lập trần năng lực theo doanh nghiệp, phòng ban và vị trí', 'Đánh giá đầu vào trước khi gợi ý lộ trình học', 'Học, làm bài cuối khóa và nhận phản hồi từ quản lý']}
    footer={<p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link> · <Link to="/business">Xem lại giải pháp</Link></p>}
  >
    <div className="pulse-auth-fields">
      {requestError && <p role="alert" className="pulse-auth-error">{message(requestError)}</p>}
      {readiness.isPending && <p role="status" className="pulse-auth-info">Đang kiểm tra điều kiện dùng thử…</p>}
      {readiness.data?.developmentOnly && <p className="pulse-auth-info">Môi trường demo: dữ liệu và nội dung học được dùng để trải nghiệm thử, chưa phải bản phát hành chính thức.</p>}
      {readiness.data && !readiness.data.canRegister && <p role="alert" className="pulse-auth-error">Chưa thể đăng ký: {readiness.data.missingReasons.join(' · ')}</p>}
      {catalog.data && !catalog.data.some(position => position.eligible) && <p role="alert" className="pulse-auth-error">Chưa có vị trí đủ điều kiện để dùng thử.</p>}
      {result ? <div className="pulse-auth-fields"><p role="status" className="pulse-auth-success">Mã xác minh đã được gửi đến {form.email}. Mã và liên kết hết hạn lúc {new Date(result.expiresAt).toLocaleString('vi-VN')}.</p>{result.developmentCode && <p className="pulse-auth-info">Mã thử trong môi trường phát triển: <strong>{result.developmentCode}</strong></p>}<Link className="pulse-auth-primary" to={`/business/try/verify?email=${encodeURIComponent(form.email)}`}>Nhập mã xác minh <ArrowRight size={17} aria-hidden="true" /></Link>{continuePath && <p className="pulse-auth-subtle">Chỉ dành cho môi trường phát triển: <Link to={continuePath}>mở liên kết mô phỏng email</Link>.</p>}</div> :
      <form className="pulse-auth-fields" onSubmit={(event: FormEvent) => { event.preventDefault(); if (canRegister && !register.isPending) register.mutate(); }}>
        <div className="pulse-auth-section-label"><span>01 / Tài khoản chủ sở hữu</span><small>Thông tin liên hệ chính</small></div>
        <div className="pulse-auth-fields-two">
          <div className="pulse-auth-field"><label htmlFor="organizationName">Tên tổ chức</label><input id="organizationName" required maxLength={200} autoComplete="organization" placeholder="Ví dụ: Công ty Sao Bắc" value={form.organizationName} onChange={e => update('organizationName', e.target.value)} /></div>
          <div className="pulse-auth-field"><label htmlFor="ownerName">Tên chủ sở hữu</label><input id="ownerName" required maxLength={200} autoComplete="name" placeholder="Họ và tên người phụ trách" value={form.ownerName} onChange={e => update('ownerName', e.target.value)} /></div>
        </div>
        <div className="pulse-auth-fields-two">
          <div className="pulse-auth-field"><label htmlFor="email">Email</label><input id="email" type="email" required maxLength={200} autoComplete="email" placeholder="ten@doanhnghiep.vn" value={form.email} onChange={e => update('email', e.target.value)} /><span className="pulse-auth-field-hint">Ưu tiên email công việc để dễ xác minh tổ chức.</span></div>
          <div className="pulse-auth-field"><label htmlFor="password">Mật khẩu</label><div className="pulse-auth-input-wrap"><input id="password" type={showPassword ? 'text' : 'password'} required minLength={12} maxLength={72} autoComplete="new-password" placeholder="Tối thiểu 12 ký tự" value={form.password} onChange={e => update('password', e.target.value)} /><button type="button" className="pulse-auth-icon-button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></div><span className="pulse-auth-field-hint">12–72 ký tự.</span></div>
        </div>
        <div className="pulse-auth-section-label"><span>02 / Bối cảnh doanh nghiệp</span><small>Để chuẩn bị trải nghiệm phù hợp</small></div>
        <div className="pulse-auth-fields-two">
          <div className="pulse-auth-field"><label htmlFor="industry">Ngành doanh nghiệp</label><select id="industry" required value={form.industry} onChange={e => update('industry', e.target.value)}><option value="" disabled>Chọn ngành</option>{industries.map(industry => <option key={industry}>{industry}</option>)}</select></div>
          <div className="pulse-auth-field"><label htmlFor="size">Quy mô</label><select id="size" required value={form.size} onChange={e => update('size', e.target.value)}><option value="" disabled>Chọn quy mô</option>{['1-20', '21-100', '101-500', '500+'].map(size => <option key={size} value={size}>{size} nhân sự</option>)}</select></div>
        </div>
        <div className="pulse-auth-field"><label htmlFor="goal">Mục tiêu trước mắt</label><select id="goal" required value={form.goal} onChange={e => update('goal', e.target.value)}><option value="" disabled>Chọn mục tiêu</option><option value="onboarding">Hội nhập nhân viên mới</option><option value="digital-skills">Nâng kỹ năng số</option><option value="training-progress">Theo dõi tiến độ đào tạo</option></select></div>

        {catalog.data && (
          <div className="pulse-auth-preview-card">
            <div className="pulse-auth-preview-header">
              <span className="pulse-auth-preview-badge">
                <CheckCircle2 size={13} aria-hidden="true" /> Sẵn sàng trải nghiệm ngay
              </span>
              <span className="pulse-auth-preview-tag">Khung năng lực số mẫu</span>
            </div>
            {catalog.data
              .filter((position) => position.eligible)
              .map((position) => (
                <div key={position.catalogKey} className="pulse-auth-preview-content">
                  <div className="pulse-auth-preview-title">
                    <Sparkles size={15} style={{ color: '#f59e0b', flexShrink: 0 }} aria-hidden="true" />
                    <strong>{position.name}</strong>
                  </div>
                  <div className="pulse-auth-preview-skills">
                    {position.requirements.map((req) => (
                      <span key={req.competencyId} className="pulse-auth-preview-skill">
                        {req.name} · Mức {req.requiredLevel}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            <div className="pulse-auth-preview-note">
              <span>Các vị trí phòng ban khác:</span>
              <div className="pulse-auth-preview-departments">
                <span>Nhân sự</span>
                <span>Kinh doanh</span>
                <span>Kế toán</span>
                <span>Marketing</span>
              </div>
              <small>Mức năng lực và lộ trình sẽ được chọn ở bước thiết lập sau khi xác minh.</small>
            </div>
          </div>
        )}

        <label className="pulse-auth-consent"><input type="checkbox" required checked={form.acceptedTerms} onChange={e => update('acceptedTerms', e.target.checked)} />Tôi đồng ý điều khoản dùng thử và xử lý dữ liệu đánh giá.</label>
        <button type="submit" className="pulse-auth-primary" disabled={!canRegister || register.isPending || !form.acceptedTerms}>{register.isPending ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}{register.isPending ? 'Đang tạo không gian…' : 'Tạo không gian dùng thử'}</button>
      </form>}
    </div>
  </PulseAuthLayout>;
}

function TrialAccountPage({ kind }: { kind: 'verify' | 'accept' }) {
  const [search] = useSearchParams(); const token = search.get('token') ?? ''; const email = search.get('email') ?? ''; const navigate = useNavigate(); const cache = useQueryClient();
  const [code, setCode] = useState('');
  const [account, setAccount] = useState<TrialAccountDto | null>(null); const [password, setPassword] = useState('');
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
    const response = await data(service.login(verifiedAccount.email, password));
    localStorage.setItem('accessToken', response.accessToken);
    const user = await data(service.currentUser()); cache.clear(); useCurrentUser.getState().setUser(user); navigate(getHomePath(user), { replace: true });
  } });
  const accountError = !token && (kind === 'accept' || !email) ? new Error('Thiếu thông tin xác minh. Hãy mở lại email hoặc đăng ký lại.') : verify.error || login.error;
  return <PulseAuthLayout
    eyebrow="Xác minh tài khoản doanh nghiệp"
    title={kind === 'verify' ? 'Xác minh chủ sở hữu' : 'Tham gia dùng thử'}
    subtitle={kind === 'verify' && !token ? `Nhập mã 6 số đã gửi đến ${email} để xác minh tài khoản.` : 'Liên kết xác minh chỉ dùng một lần và có thời hạn. Nhập mật khẩu để tiếp tục trong đúng tổ chức.'}
    asideTitle="Không gian học tập đang chờ bạn."
    asideText="Sau khi xác minh, bạn sẽ tiếp tục thiết lập mục tiêu và lộ trình đào tạo cho đội ngũ."
  >
    <div className="pulse-auth-fields">
      {accountError && <p role="alert" className="pulse-auth-error">{message(accountError)}</p>}
      {verify.isPending && <p role="status" className="pulse-auth-info">Đang xác minh…</p>}
      {account && <p role="status" className="pulse-auth-success">Tài khoản đã xác minh: {account.email}. Nếu đăng nhập lỗi, hãy thử lại bằng cùng tài khoản.</p>}
      <form className="pulse-auth-fields" onSubmit={event => { event.preventDefault(); if ((token || (kind === 'verify' && email && code.length === 6)) && !login.isPending) login.mutate(); }}>
        {kind === 'verify' && !token && <div className="pulse-auth-field"><label htmlFor="trial-code">Mã xác minh email</label><input id="trial-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoComplete="one-time-code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ''))} placeholder="6 chữ số" /></div>}
        <div className="pulse-auth-field"><label htmlFor="trial-password">Mật khẩu</label><input id="trial-password" type="password" required minLength={12} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} autoComplete={kind === 'accept' ? 'new-password' : 'current-password'} /><span className="pulse-auth-field-hint">{kind === 'accept' ? 'Đặt mật khẩu 12–72 ký tự.' : 'Nhập lại mật khẩu đã đăng ký để xác minh và đăng nhập.'}</span></div>
        <button type="submit" className="pulse-auth-primary" disabled={(!token && (!email || code.length !== 6)) || verify.isPending || login.isPending || password.length < 12}>{login.isPending ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}{kind === 'accept' ? 'Tham gia dùng thử' : 'Xác minh và đăng nhập'}</button>
      </form>
    </div>
  </PulseAuthLayout>;
}
export function TrialVerifyPage() { return <TrialAccountPage kind="verify" />; }
export function TrialAcceptPage() { return <TrialAccountPage kind="accept" />; }
