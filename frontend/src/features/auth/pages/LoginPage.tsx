import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, ShieldAlert } from 'lucide-react';
import { useLogin } from '../../../hooks/use-auth';
import { getPostLoginPath } from '../auth-redirect';
import { PulseAuthLayout } from '@/features/public/pulse-landing/PulseAuthLayout';
import { useCurrentUser } from '../../../hooks/use-current-user';

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const FALLBACK_ERROR = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) errors.email = 'Vui lòng nhập email công việc.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Email chưa đúng định dạng doanh nghiệp.';
  if (!password) errors.password = 'Vui lòng nhập mật khẩu.';
  return errors;
}

function loginErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    if (!error.response) {
      return 'Không thể kết nối đến máy chủ backend (http://localhost:5000). Vui lòng kiểm tra kết nối mạng hoặc liên hệ quản trị viên.';
    }
    return error.response?.data?.message || FALLBACK_ERROR;
  }
  return FALLBACK_ERROR;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isVerified = searchParams.get('verified') === '1';
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
      eyebrow="CỔNG TRUY CẬP DOANH NGHIỆP"
      title="Đăng nhập"
      subtitle="Đăng nhập để điều hành khung năng lực số và quản trị nhân sự."
      footer={
        <p>
          Chưa có tài khoản doanh nghiệp? <Link to="/business/try">Bắt đầu dùng thử miễn phí 14 ngày</Link>
        </p>
      }
    >
      <div className="pulse-auth-form-wrapper">
        {/* Credentials Form */}
        <form onSubmit={handleSubmit} noValidate className="pulse-auth-fields-stack">
          {isVerified && (
            <div role="status" className="pulse-auth-banner pulse-auth-banner--success">
              <CheckCircle2 size={16} aria-hidden="true" />
              <span>Email đã xác minh thành công! Bạn có thể đăng nhập ngay bây giờ.</span>
            </div>
          )}

          {error && (
            <div role="alert" className="pulse-auth-banner pulse-auth-banner--error">
              <ShieldAlert size={16} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="pulse-auth-input-group">
            <label htmlFor="email" className="pulse-auth-label">
              Email công việc
            </label>
            <div className="pulse-auth-field-control">
              <Mail size={17} className="pulse-auth-lead-icon" aria-hidden="true" />
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
                className="pulse-auth-native-input"
              />
            </div>
            {fieldErrors.email && (
              <p id="email-error" role="alert" className="pulse-auth-error-text">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="pulse-auth-input-group">
            <div className="pulse-auth-label-row">
              <label htmlFor="password" className="pulse-auth-label">
                Mật khẩu
              </label>
              <Link to="/forgot-password" className="pulse-auth-forgot-link">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="pulse-auth-field-control">
              <Lock size={17} className="pulse-auth-lead-icon" aria-hidden="true" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••••"
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                className="pulse-auth-native-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                aria-pressed={showPassword}
                className="pulse-auth-trailing-button"
              >
                {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" role="alert" className="pulse-auth-error-text">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="pulse-auth-remember-row">
            <label className="pulse-auth-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Ghi nhớ phiên làm việc trên thiết bị này</span>
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={login.isPending} className="pulse-auth-submit-btn">
            {login.isPending ? (
              <Loader2 size={17} className="animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight size={17} aria-hidden="true" />
            )}
            <span>{login.isPending ? 'Đang xác thực bảo mật…' : 'Đăng nhập vào hệ thống'}</span>
          </button>
        </form>
      </div>
    </PulseAuthLayout>
  );
}
