import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLogin } from '../../../hooks/use-auth';
import { getPostLoginPath } from '../auth-redirect';
import { DemoAccountPicker } from '../components/DemoAccountPicker';
import { PulseAuthLayout } from '@/features/public/pulse-landing/PulseAuthLayout';
import { useCurrentUser } from '../../../hooks/use-current-user';

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

/** Shared authentication still routes an existing account to its authorized workspace. */
export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isVerified = searchParams.get('verified') === '1';
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
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
      await login.mutateAsync({ email: email.trim(), password });
      const returnTo = searchParams.get('returnTo');
      navigate(getPostLoginPath(returnTo, useCurrentUser.getState().user!), { replace: true });
    } catch (failure) {
      setError(loginErrorMessage(failure));
    }
  };

  return (
    <PulseAuthLayout
      mode="login"
      eyebrow="Chào mừng trở lại"
      title="Đăng nhập"
      subtitle="Đăng nhập để tiếp tục hành trình phát triển năng lực của đội ngũ."
      asideTitle="Tiếp nối từ đúng nơi bạn dừng lại."
      asideText="Mục tiêu của doanh nghiệp, tiến độ học và các quyết định đánh giá luôn ở cùng một nơi."
      asidePoints={['Mỗi vai trò mở đúng không gian làm việc', 'Lộ trình và minh chứng luôn theo sát tiến độ']}
      footer={<p>Chưa có tài khoản doanh nghiệp? <Link to="/business/try">Bắt đầu dùng thử miễn phí</Link></p>}
    >
      <form onSubmit={handleSubmit} noValidate className="pulse-auth-fields">
        {isVerified && (
          <div role="status" className="pulse-auth-success" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={19} style={{ color: '#16a34a', flexShrink: 0 }} aria-hidden="true" />
            <span>Email đã xác minh thành công! Đăng nhập để vào trang doanh nghiệp.</span>
          </div>
        )}
        {error && <div role="alert" className="pulse-auth-error">{error}</div>}

        <div className="pulse-auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ten@doanhnghiep.vn"
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            className="pulse-auth-input"
          />
          {fieldErrors.email && <p id="email-error" role="alert" className="pulse-auth-inline-error">{fieldErrors.email}</p>}
        </div>

        <div className="pulse-auth-field">
          <div className="pulse-auth-field-heading">
            <label htmlFor="password">Mật khẩu</label>
            <Link to="/forgot-password" className="pulse-auth-link">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="pulse-auth-input-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={fieldErrors.password ? true : undefined}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              className="pulse-auth-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={showPassword}
              className="pulse-auth-icon-button"
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
          {fieldErrors.password && <p id="password-error" role="alert" className="pulse-auth-inline-error">{fieldErrors.password}</p>}
        </div>

        <button type="submit" disabled={login.isPending} className="pulse-auth-primary">
          {login.isPending ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
          {login.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
      </form>

      <div className="pulse-auth-demo"><DemoAccountPicker
        enterpriseOnly
        onPick={(pickedEmail, pickedPassword) => {
          setEmail(pickedEmail);
          setPassword(pickedPassword);
          setFieldErrors({});
        }}
      /></div>
    </PulseAuthLayout>
  );
}
