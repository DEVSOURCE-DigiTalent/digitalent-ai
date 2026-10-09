import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { AuthShell } from '../components/AuthShell';
import { FormError, DARK_PRIMARY_BUTTON } from '../../public/components/FormControls';
import { registrationService } from '@/services/registration.service';
import { useCurrentUser } from '@/hooks/use-current-user';

export function IndividualVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Read parameters from URL or sessionStorage fallback
  const urlRegId = searchParams.get('registrationId');
  const urlEmail = searchParams.get('email');
  const urlToken = searchParams.get('token');
  const urlIntent = searchParams.get('intent');

  const [sessionData] = useState(() => {
    try {
      const stored = sessionStorage.getItem('dt-pending-registration');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const registrationId = urlRegId || sessionData?.registrationId || '';
  const email = urlEmail || sessionData?.email || '';
  const registrationAccessToken = sessionData?.registrationAccessToken || '';
  const intent = urlIntent || sessionData?.intent || 'TRIAL';

  // 2. Component state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(Boolean(urlToken && registrationId));
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendSuccess, setResendSuccess] = useState<string>();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 3. Countdown timer for Resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // 4. Handle automatic verification via Magic Link
  useEffect(() => {
    if (!urlToken || !registrationId) return;

    let isMounted = true;
    const verifyMagicLink = async () => {
      setAutoVerifying(true);
      setError(undefined);
      try {
        const res = await registrationService.verifyIndividual(registrationId, { token: urlToken });
        const data = res.data?.data;
        if (!isMounted) return;

        if (data?.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }
        if (data?.user) {
          useCurrentUser.getState().setUser(data.user);
        }
        sessionStorage.removeItem('dt-pending-registration');
        setSuccess(true);

        const target = data?.nextPath || (intent === 'PURCHASE' ? '/checkout' : '/personal/onboarding');
        setTimeout(() => {
          navigate(target, { replace: true });
        }, 1200);
      } catch (err: any) {
        if (!isMounted) return;
        const msg = err?.response?.data?.message || err?.message || 'Liên kết xác thực không hợp lệ hoặc đã hết hạn.';
        setError(msg);
      } finally {
        if (isMounted) setAutoVerifying(false);
      }
    };

    verifyMagicLink();
    return () => {
      isMounted = false;
    };
  }, [urlToken, registrationId, intent, navigate]);

  // 5. Handle OTP digits changes
  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    if (cleaned.length > 1) {
      // User pasted multiple digits
      const chars = cleaned.slice(0, 6).split('');
      const next = [...otpDigits];
      chars.forEach((c, i) => {
        if (index + i < 6) next[index + i] = c;
      });
      setOtpDigits(next);
      const targetFocus = Math.min(index + chars.length, 5);
      inputRefs.current[targetFocus]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = cleaned[0];
    setOtpDigits(next);
    setError(undefined);

    // Auto advance focus
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullOtp = otpDigits.join('');

  // 6. Handle Manual OTP Submit
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullOtp.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số mã xác thực.');
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const res = await registrationService.verifyIndividual(registrationId, {
        otp: fullOtp,
        registrationAccessToken,
      });
      const data = res.data?.data;

      if (data?.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data?.user) {
        useCurrentUser.getState().setUser(data.user);
      }
      sessionStorage.removeItem('dt-pending-registration');
      setSuccess(true);

      const target = data?.nextPath || (intent === 'PURCHASE' ? '/checkout' : '/personal/onboarding');
      setTimeout(() => {
        navigate(target, { replace: true });
      }, 1000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 7. Handle Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    setResendSuccess(undefined);
    setError(undefined);

    try {
      await registrationService.resendVerification(registrationId, registrationAccessToken);
      setResendSuccess('Đã gửi lại mã xác thực OTP mới tới email của bạn.');
      setResendCooldown(60);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Chưa thể gửi lại mã vào lúc này. Vui lòng thử lại sau.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  // 8. If no pending registration and no registrationId
  if (!registrationId && !autoVerifying) {
    return (
      <AuthShell
        portal="individual"
        eyebrow="Xác thực tài khoản"
        title="Không tìm thấy phiên đăng ký"
        subtitle="Phiên đăng ký có thể đã hết hạn hoặc chưa được tạo."
      >
        <div className="space-y-6 text-center py-4">
          <p className="text-sm text-stone-300">
            Vui lòng đăng ký lại để nhận mã xác thực mới vào hộp thư của bạn.
          </p>
          <Link
            to="/individual/register?trial=1"
            className={`${DARK_PRIMARY_BUTTON} inline-flex items-center gap-2`}
          >
            Đăng ký dùng thử ngay
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      portal="individual"
      eyebrow={intent === 'TRIAL' ? 'Dùng thử 7 ngày' : 'Gói Cá nhân Plus'}
      title="Xác thực địa chỉ email"
      subtitle={
        email
          ? `Mã OTP 6 chữ số đã được gửi đến ${email}`
          : 'Nhập mã OTP 6 chữ số để kích hoạt tài khoản của bạn.'
      }
    >
      <div className="space-y-6">
        {/* Magic Link verifying state */}
        {autoVerifying && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
            <Loader2 className="size-10 animate-spin text-[#F5CA65]" />
            <p className="text-sm text-cream font-medium">
              Đang xác thực liên kết email của bạn…
            </p>
            <p className="text-xs text-stone-400">
              Vui lòng đợi giây lát trong khi chúng tôi kích hoạt tài khoản.
            </p>
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center space-y-3">
            <div className="grid size-12 place-items-center mx-auto rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-cream">
              Xác thực email thành công!
            </h3>
            <p className="text-xs text-stone-300">
              {intent === 'TRIAL'
                ? 'Đang chuyển hướng đến không gian học tập cá nhân của bạn…'
                : 'Đang chuyển hướng đến trang thanh toán gói dịch vụ…'}
            </p>
          </div>
        )}

        {/* Regular OTP Form */}
        {!autoVerifying && !success && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-stone-300 flex items-start gap-3">
              <Mail className="size-5 shrink-0 text-[#F5CA65] mt-0.5" />
              <div>
                <p className="font-medium text-cream">Kiểm tra hộp thư đến</p>
                <p className="mt-0.5 text-stone-400">
                  Mã OTP có hiệu lực trong 15 phút. Hãy kiểm tra cả thư mục <em>Spam / Quảng cáo</em> nếu chưa thấy thư.
                </p>
              </div>
            </div>

            {error && <FormError message={error} />}

            {resendSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20 text-xs text-emerald-400">
                <ShieldCheck className="size-4 shrink-0" />
                <span>{resendSuccess}</span>
              </div>
            )}

            {/* 6-box OTP pin inputs */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-3 text-center">
                Nhập mã OTP 6 chữ số
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="size-12 sm:size-14 text-center font-mono text-2xl font-bold rounded-xl border border-white/15 bg-white/5 text-cream focus:border-[#F5CA65] focus:ring-2 focus:ring-[#F5CA65]/30 focus:outline-none transition-all shadow-inner"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || fullOtp.length < 6}
              className={`${DARK_PRIMARY_BUTTON} w-full py-3.5`}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang xác thực…
                </>
              ) : (
                'Xác thực & Bắt đầu'
              )}
            </button>

            {/* Resend OTP Section */}
            <div className="text-center space-y-2 pt-2">
              <p className="text-xs text-stone-400">
                Chưa nhận được mã xác thực?
              </p>
              {resendCooldown > 0 ? (
                <p className="text-xs text-stone-500 font-mono">
                  Gửi lại sau <span className="text-[#F5CA65]">{resendCooldown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-xs font-semibold text-[#F5CA65] hover:underline transition-colors disabled:opacity-50"
                >
                  {resending ? 'Đang gửi lại mã…' : 'Gửi lại mã OTP'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
