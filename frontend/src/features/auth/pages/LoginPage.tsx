import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLogin } from '../../../hooks/use-auth';
import { isSafeReturnTo } from '../auth-redirect';
import { DemoAccountPicker } from '../components/DemoAccountPicker';
import { AuthShell } from '../components/AuthShell';
import { LOGIN_COPY, type LoginPortal } from '../login-copy';
import { DARK_INPUT_CLASS, DARK_PRIMARY_BUTTON, FormError } from '../../public/components/FormControls';

interface LoginPageProps {
  portal?: LoginPortal;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const FALLBACK_ERROR = 'Email hoặc mật khẩu không đúng. Kiểm tra lại rồi thử lần nữa.';

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) errors.email = 'Nhập email của bạn.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Email chưa đúng định dạng.';
  if (!password) errors.password = 'Nhập mật khẩu.';
  return errors;
}

function loginErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) return error.response?.data?.message || FALLBACK_ERROR;
  return FALLBACK_ERROR;
}

/** One sign-in form, three entrances ("/login", "/business/login", "/individual/login"): only wording and links change. */
export function LoginPage({ portal = 'default' }: LoginPageProps) {
  const copy = LOGIN_COPY[portal];
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const login = useLogin();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const errors = validate(email, password);
    setFieldErrors(errors);
    if (errors.email || errors.password) return;
    try {
      const home = await login.mutateAsync({ email: email.trim(), password });
      const returnTo = searchParams.get('returnTo');
      navigate(isSafeReturnTo(returnTo) ? returnTo : home, { replace: true });
    } catch (failure) {
      setError(loginErrorMessage(failure));
    }
  };

  return (
    <AuthShell
      portal={portal}
      eyebrow={copy.eyebrow}
      title="Đăng nhập"
      subtitle={copy.subtitle}
      footerLink={
        <p className="text-sm text-stone-400">
          Chưa có tài khoản?{' '}
          <Link to={copy.registerPath} className="text-cream underline decoration-cream/40 underline-offset-4 transition-colors hover:decoration-cream">
            {copy.registerLabel}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="grid gap-5">
        <FormError message={error} />

        <div className="grid gap-1.5">
          <label htmlFor="email" className="text-sm text-cream/90">Email</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={portal === 'enterprise' ? 'ban@congty.vn' : 'ban@email.com'}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            className={DARK_INPUT_CLASS}
          />
          {fieldErrors.email && <p id="email-error" role="alert" className="text-xs text-red-300">{fieldErrors.email}</p>}
        </div>

        <div className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="text-sm text-cream/90">Mật khẩu</label>
            <Link to="/forgot-password" className="text-xs text-stone-400 underline-offset-4 transition-colors hover:text-cream hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={fieldErrors.password ? true : undefined}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              className={`${DARK_INPUT_CLASS} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={showPassword}
              className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-stone-400 transition-colors hover:text-cream"
            >
              {showPassword ? <EyeOff className="size-[18px]" aria-hidden="true" /> : <Eye className="size-[18px]" aria-hidden="true" />}
            </button>
          </div>
          {fieldErrors.password && <p id="password-error" role="alert" className="text-xs text-red-300">{fieldErrors.password}</p>}
        </div>

        <button type="submit" disabled={login.isPending} className={`${DARK_PRIMARY_BUTTON} mt-1`}>
          {login.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {login.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
      </form>

      <DemoAccountPicker
        onPick={(pickedEmail, pickedPassword) => {
          setEmail(pickedEmail);
          setPassword(pickedPassword);
          setFieldErrors({});
        }}
      />
    </AuthShell>
  );
}
