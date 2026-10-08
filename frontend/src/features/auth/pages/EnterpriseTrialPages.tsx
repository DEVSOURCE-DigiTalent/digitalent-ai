import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, Loader2, Mail, UserPlus } from 'lucide-react';
import { AuthShell } from '../components/AuthShell';
import { PasswordField } from '../components/PasswordField';
import { DARK_INPUT_CLASS, DARK_PRIMARY_BUTTON, Field, FormError } from '../../public/components/FormControls';
import { useLogin } from '@/hooks/use-auth';
import {
  useInviteTrialMember,
  useSelectTrialPosition,
  useTrialCatalog,
  useTrialContext,
  useTrialInvitations,
  useTrialResults,
} from '@/hooks/use-enterprise-trial';
import { enterpriseTrialService } from '@/services/enterprise-trial.service';

const err = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
  (error instanceof Error ? error.message : fallback);

const localPath = (href: string) => {
  try {
    const url = new URL(href);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
};

export function EnterpriseTrialRegisterPage() {
  const [form, setForm] = useState({
    organizationName: '',
    ownerName: '',
    email: '',
    password: '',
    industry: 'technology',
    size: '1-20',
    goal: 'onboarding',
    acceptedTerms: false,
  });
  const [developmentLink, setDevelopmentLink] = useState<string | null>();
  const register = useMutation({ mutationFn: () => enterpriseTrialService.register(form) });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const response = await register.mutateAsync();
    setDevelopmentLink(response.data.data?.developmentLink ?? null);
  };

  return (
    <AuthShell portal="enterprise" eyebrow="Dùng thử doanh nghiệp" title="Tạo Enterprise Guided Trial" subtitle="Tạo tenant thử nghiệm thật, xác minh chủ sở hữu, chọn vị trí và mời nhân viên làm diagnostic.">
      {developmentLink !== undefined ? (
        <div className="grid gap-5 text-sm text-stone-300">
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100">
            <CheckCircle2 className="mb-2 size-5" />
            Trial đã được ghi nhận. Hãy mở email xác minh để tạo tenant.
          </div>
          {developmentLink ? (
            <Link to={localPath(developmentLink)} className={DARK_PRIMARY_BUTTON}>
              Mở link xác minh Development
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <Link to="/login" className="text-cream underline underline-offset-4">Tôi sẽ xác minh qua email</Link>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-4">
          <FormError message={register.error ? err(register.error, 'Không thể tạo trial.') : undefined} />
          <Field label="Tên tổ chức" htmlFor="organizationName">
            <input id="organizationName" className={DARK_INPUT_CLASS} value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} required />
          </Field>
          <Field label="Chủ sở hữu" htmlFor="ownerName">
            <input id="ownerName" className={DARK_INPUT_CLASS} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} required />
          </Field>
          <Field label="Email" htmlFor="email">
            <input id="email" type="email" className={DARK_INPUT_CLASS} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </Field>
          <Field label="Mật khẩu" htmlFor="password" hint="Tối thiểu 12 ký tự.">
            <PasswordField id="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <label className="flex items-start gap-3 text-xs text-stone-300">
            <input type="checkbox" checked={form.acceptedTerms} onChange={(e) => setForm({ ...form, acceptedTerms: e.target.checked })} className="mt-1" />
            Tôi đồng ý điều khoản trial và chính sách dữ liệu.
          </label>
          <button type="submit" disabled={register.isPending} className={DARK_PRIMARY_BUTTON}>
            {register.isPending && <Loader2 className="size-4 animate-spin" />}
            Tạo trial
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export function EnterpriseTrialVerifyPage() {
  const [search] = useSearchParams();
  const token = search.get('token') ?? '';
  const verify = useMutation({ mutationFn: () => enterpriseTrialService.verify(token) });
  const requested = useRef(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;
    verify.mutate();
  }, [token, verify]);

  return (
    <AuthShell portal="enterprise" eyebrow="Xác minh trial" title="Xác minh chủ sở hữu" subtitle="Sau khi xác minh, đăng nhập bằng email và mật khẩu đã đăng ký.">
      {!token && <FormError message="Link xác minh thiếu token." />}
      {verify.isPending && <p className="text-sm text-stone-300">Đang xác minh…</p>}
      {verify.isError && <FormError message={err(verify.error, 'Không thể xác minh link.')} />}
      {verify.isSuccess && (
        <div className="grid gap-4 text-sm text-stone-300">
          <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100">
            Tenant trial đã được tạo cho {verify.data.data.data?.email}.
          </p>
          <Link to="/login" className={DARK_PRIMARY_BUTTON}>Đăng nhập để thiết lập trial</Link>
        </div>
      )}
    </AuthShell>
  );
}

export function EnterpriseTrialAcceptPage() {
  const [search] = useSearchParams();
  const token = search.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();
  const login = useLogin();
  const accept = useMutation({ mutationFn: () => enterpriseTrialService.accept(token, password) });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirm) return;
    const account = (await accept.mutateAsync()).data.data!;
    const home = await login.mutateAsync({ email: account.email, password });
    navigate(account.role === 'Employee' ? '/enterprise/initial-assessment' : home, { replace: true });
  };

  return (
    <AuthShell portal="enterprise" eyebrow="Lời mời trial" title="Kích hoạt tài khoản" subtitle="Đặt mật khẩu để vào tenant trial của tổ chức.">
      <form onSubmit={submit} className="grid gap-4">
        <FormError message={!token ? 'Link lời mời thiếu token.' : accept.error ? err(accept.error, 'Không thể kích hoạt lời mời.') : password && confirm && password !== confirm ? 'Mật khẩu nhập lại không khớp.' : undefined} />
        <Field label="Mật khẩu" htmlFor="password">
          <PasswordField id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Nhập lại mật khẩu" htmlFor="confirm">
          <PasswordField id="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        <button type="submit" disabled={!token || accept.isPending || password !== confirm} className={DARK_PRIMARY_BUTTON}>
          {accept.isPending && <Loader2 className="size-4 animate-spin" />}
          Kích hoạt tài khoản
        </button>
      </form>
    </AuthShell>
  );
}

export function EnterpriseTrialSetupPage() {
  const catalog = useTrialCatalog();
  const context = useTrialContext();
  const invitations = useTrialInvitations();
  const selectPosition = useSelectTrialPosition();
  const invite = useInviteTrialMember();
  const [departmentName, setDepartmentName] = useState('Trial team');
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Employee' as 'Employee' | 'Manager' });
  const eligible = catalog.data?.find((item) => item.eligible);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Thiết lập Enterprise Guided Trial</h1>
        <p className="mt-2 text-sm text-slate-600">Chọn vị trí được duyệt, rồi mời nhân viên hoặc quản lý vào tenant.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Vị trí trial</h2>
          <p className="mt-2 text-sm text-slate-600">
            {context.data?.selectedPosition ? `Đã chọn: ${context.data.selectedPosition.name}` : eligible ? `${eligible.name} · ${eligible.requirementVersion}` : 'Chưa có bundle đủ điều kiện.'}
          </p>
          {!context.data?.selectedPosition && eligible && (
            <div className="mt-4 grid gap-3">
              <input className="rounded-xl border border-slate-300 px-3 py-2 text-sm" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} />
              <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => selectPosition.mutate({ catalogKey: eligible.catalogKey, departmentName })}>
                Chọn vị trí và freeze version
              </button>
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Mời thành viên</h2>
          <form className="mt-4 grid gap-3" onSubmit={(event) => { event.preventDefault(); invite.mutate(inviteForm); }}>
            <input className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Họ tên" value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} />
            <input className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="email@company.com" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
            <select className="rounded-xl border border-slate-300 px-3 py-2 text-sm" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as 'Employee' | 'Manager' })}>
              <option value="Employee">Nhân viên</option>
              <option value="Manager">Quản lý</option>
            </select>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              <UserPlus className="size-4" />
              Gửi lời mời
            </button>
          </form>
        </section>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Lời mời</h2>
        <div className="mt-4 grid gap-3">
          {(invitations.data ?? []).map((row) => (
            <div key={row.id} className="rounded-xl border border-slate-200 p-4 text-sm">
              <div className="font-medium text-slate-900">{row.name} · {row.email}</div>
              <div className="mt-1 text-slate-500">{row.role} · {row.state}</div>
              {row.developmentLink && <Link className="mt-2 inline-flex items-center gap-1 text-blue-700 underline" to={localPath(row.developmentLink)}><Mail className="size-4" /> Mở link Development</Link>}
            </div>
          ))}
        </div>
      </section>
      <Link to="/enterprise/trial/results" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
        Xem kết quả trial
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

export function EnterpriseTrialResultsPage() {
  const results = useTrialResults();
  const context = useTrialContext();
  const requestConversion = useMutation({ mutationFn: () => enterpriseTrialService.requestConversion() });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Kết quả Enterprise Trial</h1>
          <p className="mt-1 text-sm text-slate-600">Trạng thái: {context.data?.status ?? 'đang tải'}</p>
        </div>
        <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => requestConversion.mutate()}>
          Yêu cầu nâng cấp
        </button>
      </div>
      <div className="grid gap-4">
        {(results.data ?? []).map((row) => (
          <article key={row.invitationId} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <h2 className="font-semibold text-slate-900">{row.name} · {row.role}</h2>
              <span className="text-sm text-slate-500">{row.state}</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {(row.result?.items ?? []).map((item) => (
                <div key={item.competencyId} className="rounded-xl border border-slate-200 p-3 text-sm">
                  <div className="font-medium text-slate-900">{item.name}</div>
                  <div className="mt-1 text-slate-500">{item.classification === 'insufficient_data' ? 'Chưa đủ dữ liệu' : `Hiện tại ${item.currentLevel}/${item.requiredLevel}`}</div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
