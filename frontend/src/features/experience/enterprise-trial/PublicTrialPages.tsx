import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthShell } from '@/features/auth/components/AuthShell';
import { Field, DARK_INPUT_CLASS, DARK_PRIMARY_BUTTON } from '@/features/public/components/FormControls';
import { enterpriseTrialService as service, type TrialAccountDto, type TrialRegistrationDto, type TrialRegistrationRequest } from '@/services/enterprise-trial.service';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getHomePath } from '@/lib/navigation';
import { data, ErrorText, safeDevelopmentPath } from './trial-ui';

const industries = ['Công nghệ thông tin', 'Tài chính – Ngân hàng', 'Sản xuất', 'Thương mại – Bán lẻ', 'Giáo dục', 'Y tế', 'Dịch vụ', 'Khác'];
export function TrialRegisterPage() {
  const readiness = useQuery({ queryKey: ['enterprise-trial', 'readiness'], queryFn: () => data(service.readiness()), retry: false, refetchOnMount: 'always' });
  const catalog = useQuery({ queryKey: ['enterprise-trial', 'catalog'], queryFn: () => data(service.catalog()), retry: false });
  const [form, setForm] = useState<TrialRegistrationRequest>({ organizationName: '', ownerName: '', email: '', password: '', industry: industries[0], size: '1-20', goal: 'onboarding', acceptedTerms: false });
  const [result, setResult] = useState<TrialRegistrationDto | null>(null);
  const register = useMutation({ mutationFn: () => data(service.register(form)), onSuccess: value => { setResult(value); setForm(previous => ({ ...previous, password: '' })); } });
  const canRegister = readiness.data?.canRegister === true && !!catalog.data?.some(position => position.eligible);
  const update = (key: keyof TrialRegistrationRequest, value: string | boolean) => setForm(previous => ({ ...previous, [key]: value }));
  const continuePath = safeDevelopmentPath(result?.developmentLink, 'verify');
  return <AuthShell portal="enterprise" eyebrow="Dùng thử có hướng dẫn" title="Không gian của doanh nghiệp bạn" subtitle="Chọn vị trí → mời người tham gia → đánh giá và lộ trình → xem kết quả. Không cần mua gói trước.">
    <div className="space-y-4">
      <ErrorText error={readiness.error || catalog.error || register.error} />
      {readiness.isPending && <p role="status">Đang kiểm tra điều kiện dùng thử…</p>}
      {readiness.data?.developmentOnly && <p className="rounded-xl border border-amber-400/40 p-3 text-sm">Development/demo · Dữ liệu minh họa · Chưa sẵn sàng production</p>}
      {readiness.data && !readiness.data.canRegister && <p role="alert">Chưa thể đăng ký: {readiness.data.missingReasons.join(' · ')}</p>}
      {catalog.data && <section aria-label="Vị trí đủ điều kiện" className="space-y-2 text-sm">{catalog.data.map(position => <article key={position.catalogKey} className="rounded-xl border border-white/20 p-3"><p>{position.name} · {position.requirementVersion}</p><p>{position.eligible ? 'Có thể thử' : position.missingReasons.join(' · ')}</p>{position.requirements.map(requirement => <p key={requirement.competencyId}>{requirement.name} · mức yêu cầu {requirement.requiredLevel}</p>)}</article>)}</section>}
      {catalog.data && !catalog.data.some(position => position.eligible) && <p role="alert">Chưa có vị trí đủ điều kiện để tạo trial.</p>}
      {result ? <div className="space-y-3"><p role="status">Đã ghi nhận đăng ký; chờ xác minh email. Hạn liên kết: {new Date(result.expiresAt).toLocaleString('vi-VN')}.</p>{continuePath ? <><p>Development-only: liên kết mô phỏng email, chỉ dùng trong môi trường phát triển.</p><Link className={DARK_PRIMARY_BUTTON} to={continuePath}>Tiếp tục xác minh</Link></> : <p>Kiểm tra email để xác minh. Nếu liên kết hết hạn, liên hệ hỗ trợ.</p>}</div> :
      <form className="grid gap-4" onSubmit={(event: FormEvent) => { event.preventDefault(); if (canRegister && !register.isPending) register.mutate(); }}>
        {([['organizationName', 'Tên tổ chức', 'text'], ['ownerName', 'Tên chủ sở hữu', 'text'], ['email', 'Email', 'email'], ['password', 'Mật khẩu', 'password']] as const).map(([key, label, type]) => <Field key={key} label={label} htmlFor={key} hint={key === 'password' ? '12–72 ký tự; dùng mật khẩu riêng cho demo.' : undefined}><input id={key} type={type} required minLength={key === 'password' ? 12 : undefined} maxLength={key === 'password' ? 72 : 200} autoComplete={key === 'password' ? 'new-password' : key === 'email' ? 'email' : undefined} className={DARK_INPUT_CLASS} value={form[key]} onChange={e => update(key, e.target.value)} /></Field>)}
        <Field label="Ngành doanh nghiệp" htmlFor="industry"><select id="industry" className={DARK_INPUT_CLASS} value={form.industry} onChange={e => update('industry', e.target.value)}>{industries.map(industry => <option key={industry}>{industry}</option>)}</select></Field>
        <Field label="Quy mô" htmlFor="size"><select id="size" className={DARK_INPUT_CLASS} value={form.size} onChange={e => update('size', e.target.value)}>{['1-20', '21-100', '101-500', '500+'].map(size => <option key={size}>{size}</option>)}</select></Field>
        <Field label="Mục tiêu" htmlFor="goal"><select id="goal" className={DARK_INPUT_CLASS} value={form.goal} onChange={e => update('goal', e.target.value)}><option value="onboarding">Hội nhập nhân viên mới</option><option value="digital-skills">Nâng kỹ năng số</option><option value="training-progress">Kiểm tra tiến độ đào tạo</option></select></Field>
        <p className="text-sm">Ngành chỉ cung cấp bối cảnh; yêu cầu năng lực lấy từ vị trí đủ điều kiện. Hạn dùng, quyền chỉ đọc và chính sách dữ liệu được hiển thị khi xác minh.</p>
        <label className="flex gap-3 text-sm"><input type="checkbox" required checked={form.acceptedTerms} onChange={e => update('acceptedTerms', e.target.checked)} />Tôi đồng ý điều khoản dùng thử và xử lý dữ liệu đánh giá.</label>
        <button className={DARK_PRIMARY_BUTTON} disabled={!canRegister || register.isPending || !form.acceptedTerms}>Tạo không gian dùng thử</button>
      </form>}
    </div>
  </AuthShell>;
}

function TrialAccountPage({ kind }: { kind: 'verify' | 'accept' }) {
  const [search] = useSearchParams(); const token = search.get('token') ?? ''; const navigate = useNavigate(); const cache = useQueryClient();
  const [account, setAccount] = useState<TrialAccountDto | null>(null); const [password, setPassword] = useState('');
  const verify = useMutation({ mutationFn: () => data(service.verify(token, password)), onSuccess: setAccount });
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
  return <AuthShell portal="enterprise" eyebrow="Dùng thử doanh nghiệp" title={kind === 'verify' ? 'Xác minh chủ sở hữu' : 'Tham gia trial'} subtitle="Liên kết một lần có thời hạn. Đăng nhập để tiếp tục trong đúng tổ chức.">
    <ErrorText error={!token ? new Error('Liên kết thiếu token.') : verify.error || login.error} />
    {verify.isPending && <p role="status">Đang xác minh…</p>}
    {account && <p role="status">Tài khoản đã xác minh: {account.email}. Nếu đăng nhập lỗi, hãy thử lại bằng cùng tài khoản.</p>}
    <form className="mt-4 grid gap-4" onSubmit={event => { event.preventDefault(); if (token && !login.isPending) login.mutate(); }}>
      <Field label="Mật khẩu" htmlFor="trial-password" hint={kind === 'accept' ? 'Đặt mật khẩu 12–72 ký tự.' : 'Nhập lại mật khẩu đã đăng ký để xác minh và đăng nhập.'}><input id="trial-password" type="password" required minLength={12} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} className={DARK_INPUT_CLASS} autoComplete={kind === 'accept' ? 'new-password' : 'current-password'} /></Field>
      <button className={DARK_PRIMARY_BUTTON} disabled={!token || verify.isPending || login.isPending || password.length < 12}>{kind === 'accept' ? 'Tham gia trial' : 'Đăng nhập vào trial'}</button>
    </form>
  </AuthShell>;
}
export function TrialVerifyPage() { return <TrialAccountPage kind="verify" />; }
export function TrialAcceptPage() { return <TrialAccountPage kind="accept" />; }
