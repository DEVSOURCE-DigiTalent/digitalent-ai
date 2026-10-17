import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { PulseAuthLayout } from '@/features/public/pulse-landing/PulseAuthLayout';
import { authService } from '@/services/auth.service';
import { useCurrentUser } from '@/hooks/use-current-user';
import { resolveNextStep } from '@/lib/navigation';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // giây

function errorMessage(error: unknown): string {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? (error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
}

/** AUTH-OTP: Business Owner nhập OTP 6 số để kích hoạt tài khoản sau khi đăng ký. */
export function BusinessVerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentUser = useCurrentUser((s) => s.user);

  const email = searchParams.get('email') || currentUser?.email || '';
  const draftId = searchParams.get('draft');
  const deliveryFailed = searchParams.get('delivery') === 'failed';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [deliveryPending, setDeliveryPending] = useState(deliveryFailed);
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(deliveryFailed ? 0 : RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Nếu user đã xác minh email rồi, tự động chuyển vào màn hình chính
  useEffect(() => {
    if (currentUser?.emailVerified) {
      navigate(resolveNextStep(currentUser), { replace: true });
    }
  }, [currentUser, navigate]);

  // Đếm ngược thời gian gửi lại OTP
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Focus vào ô đầu tiên khi mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Nếu không có email và chưa đăng nhập → redirect về trang dùng thử
  useEffect(() => {
    if (!email && !currentUser) navigate('/business/try', { replace: true });
  }, [email, currentUser, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    // Chỉ nhận chữ số
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    // Tự chuyển focus sang ô tiếp theo
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Tự submit khi nhập đủ 6 số
    if (digit && index === OTP_LENGTH - 1) {
      const fullOtp = [...newOtp.slice(0, OTP_LENGTH - 1), digit].join('');
      if (fullOtp.length === OTP_LENGTH) {
        submitOtp(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
    setOtp(newOtp);
    const nextEmpty = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextEmpty]?.focus();
    if (pasted.length === OTP_LENGTH) submitOtp(pasted);
  };

  const submitOtp = async (otpValue: string) => {
    if (isVerifying) return;
    setError('');
    setIsVerifying(true);
    try {
      await authService.verifyBusinessEmail(email, otpValue);
      setSuccess(true);
      if (currentUser) {
        useCurrentUser.getState().setUser({ ...currentUser, emailVerified: true });
        setTimeout(() => {
          navigate(resolveNextStep({ ...currentUser, emailVerified: true }), { replace: true });
        }, 1200);
        return;
      }
      setTimeout(() => {
        const loginParams = new URLSearchParams({ email });
        if (draftId) loginParams.set('returnTo', `/enterprise/contract?draft=${draftId}`);
        navigate(`/login?${loginParams.toString()}&verified=1`, { replace: true });
      }, 1800);
    } catch (err) {
      setError(errorMessage(err));
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResending || resendCountdown > 0) return;
    setIsResending(true);
    setError('');
    try {
      await authService.sendEmailVerification(email);
      setDeliveryPending(false);
      setResendCountdown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  const handleContinue = () => {
    if (currentUser) {
      navigate(resolveNextStep({ ...currentUser, emailVerified: true }), { replace: true });
    } else {
      navigate(`/login?${new URLSearchParams({ email, verified: '1' })}`, { replace: true });
    }
  };

  const handleManualSubmit = () => {
    const otpValue = otp.join('');
    if (otpValue.length === OTP_LENGTH) submitOtp(otpValue);
  };

  if (success) {
    return (
      <PulseAuthLayout
        eyebrow="Xác minh email"
        title="Email đã xác minh!"
        subtitle="Tài khoản doanh nghiệp của bạn đã được kích hoạt thành công."
        asideTitle="Bắt đầu xây dựng đội ngũ."
        asideText="Thiết lập phòng ban, vị trí và mời nhân viên để bắt đầu hành trình phát triển năng lực."
        asidePoints={['Thiết kế khung năng lực theo tổ chức', 'Giao khóa học và theo dõi tiến độ', 'Đánh giá năng lực bằng minh chứng thực tế']}
      >
        <div className="pulse-auth-fields">
          <div className="pulse-auth-success-icon">
            <CheckCircle2 size={28} aria-hidden="true" />
          </div>
          <p className="pulse-auth-info">
            <strong>{email}</strong> đã được xác minh. Đang chuyển đến trang làm việc...
          </p>
          <button
            type="button"
            onClick={handleContinue}
            className="pulse-auth-primary"
            style={{ textAlign: 'center' }}
          >
            Vào hệ thống ngay
          </button>
        </div>
      </PulseAuthLayout>
    );
  }

  return (
    <PulseAuthLayout
      eyebrow="Xác minh email"
      title="Nhập mã xác minh"
      subtitle={deliveryPending
        ? `Tài khoản đã được tạo nhưng chưa gửi được mã đến ${email}. Vui lòng thử gửi lại.`
        : `Chúng tôi đã gửi mã OTP 6 số đến ${email}. Mã có hiệu lực trong 10 phút.`}
      asideTitle="Một bước nữa để sẵn sàng."
      asideText="Xác minh email giúp bảo vệ tài khoản doanh nghiệp và đảm bảo chỉ bạn mới quản lý được tổ chức."
      asidePoints={['Mã OTP chỉ gửi đến email của bạn', 'Hiệu lực 10 phút, có thể gửi lại', 'Bảo mật 2 lớp cho tài khoản chủ sở hữu']}
      footer={
        <p>
          Nhận sai email?{' '}
          <Link to="/business/try" className="pulse-auth-link">
            Quay lại dùng thử
          </Link>
        </p>
      }
    >
      <div className="pulse-auth-fields">
        {/* Icon */}
        <div className="pulse-auth-otp-icon" aria-hidden="true">
          <ShieldCheck size={28} />
        </div>

        {/* Thông báo lỗi */}
        {deliveryPending && !error && (
          <div role="status" className="pulse-auth-error">
            Chưa gửi được mã xác minh. Chọn “Gửi lại mã OTP” bên dưới.
          </div>
        )}
        {error && (
          <div role="alert" className="pulse-auth-error">
            {error}
          </div>
        )}

        {/* 6 ô OTP */}
        <div
          className="pulse-auth-otp-grid"
          role="group"
          aria-label="Mã OTP 6 số"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              aria-label={`Chữ số thứ ${index + 1}`}
              className={`pulse-auth-otp-input${digit ? ' pulse-auth-otp-input--filled' : ''}${error ? ' pulse-auth-otp-input--error' : ''}`}
              disabled={isVerifying}
            />
          ))}
        </div>

        {/* Nút xác nhận thủ công */}
        <button
          type="button"
          onClick={handleManualSubmit}
          disabled={otp.join('').length < OTP_LENGTH || isVerifying}
          className="pulse-auth-primary"
        >
          {isVerifying ? (
            <Loader2 size={17} className="animate-spin" aria-hidden="true" />
          ) : (
            <ShieldCheck size={17} aria-hidden="true" />
          )}
          {isVerifying ? 'Đang xác minh…' : 'Xác minh tài khoản'}
        </button>

        {/* Gửi lại OTP */}
        <div className="pulse-auth-otp-resend">
          {resendCountdown > 0 ? (
            <p className="pulse-auth-field-hint">
              Gửi lại mã sau <strong>{resendCountdown}s</strong>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="pulse-auth-link"
            >
              {isResending ? (
                <><Loader2 size={14} className="animate-spin" /> Đang gửi lại…</>
              ) : (
                <><RefreshCw size={14} /> Gửi lại mã OTP</>
              )}
            </button>
          )}
        </div>

        {/* Hướng dẫn */}
        <p className="pulse-auth-field-hint" style={{ textAlign: 'center' }}>
          <Mail size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
          Kiểm tra cả thư mục Spam nếu chưa thấy email.
        </p>
      </div>
    </PulseAuthLayout>
  );
}
