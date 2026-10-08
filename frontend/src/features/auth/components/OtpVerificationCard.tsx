import { useState, useEffect } from 'react';
import { CheckCircle2, RefreshCw, KeyRound, ArrowLeft } from 'lucide-react';
import { DARK_INPUT_CLASS, DARK_PRIMARY_BUTTON, FormError } from '../../public/components/FormControls';
import { registrationService } from '@/services/registration.service';

interface OtpVerificationCardProps {
  email: string;
  maskedEmail?: string;
  registrationId: string;
  registrationAccessToken?: string;
  developmentOtp?: string;
  onSuccess: (result: any) => void;
  onCancel: () => void;
}

export function OtpVerificationCard({
  email,
  maskedEmail,
  registrationId,
  registrationAccessToken,
  developmentOtp,
  onSuccess,
  onCancel,
}: OtpVerificationCardProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendMessage, setResendMessage] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otp.trim()) {
      setError('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }
    setError(undefined);
    setLoading(true);

    try {
      const res = await registrationService.verifyIndividual(registrationId, {
        otp: otp.trim(),
      });
      const data = res.data?.data;
      onSuccess(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !registrationAccessToken) return;
    setResending(true);
    setResendMessage(undefined);
    setError(undefined);

    try {
      await registrationService.resendVerification(registrationId, registrationAccessToken);
      setResendMessage('Đã gửi lại mã xác thực mới vào hộp thư.');
      setResendCooldown(60);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể gửi lại mã vào lúc này.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="grid size-9 place-items-center rounded-xl bg-white/5 text-stone-400 hover:text-cream hover:bg-white/10 transition-colors"
          title="Quay lại"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h2 className="text-xl font-medium tracking-tight text-cream">Xác thực tài khoản</h2>
          <p className="text-xs text-stone-400">
            Mã OTP đã được gửi đến <strong className="text-cream">{maskedEmail || email}</strong>
          </p>
        </div>
      </div>

      {developmentOtp && (
        <div className="rounded-2xl bg-amber-400/10 p-4 ring-1 ring-amber-400/20 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-amber-300">
              <KeyRound className="size-3.5" />
              Môi trường thử nghiệm (Dev OTP)
            </span>
            <button
              type="button"
              onClick={() => {
                setOtp(developmentOtp);
                setError(undefined);
              }}
              className="text-[11px] font-semibold text-[#F5CA65] hover:underline"
            >
              Điền mã nhanh
            </button>
          </div>
          <p className="font-mono text-sm tracking-widest font-bold text-[#F5CA65]">
            {developmentOtp}
          </p>
        </div>
      )}

      {resendMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20 text-xs text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{resendMessage}</span>
        </div>
      )}

      {error && <FormError message={error} />}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label htmlFor="otp-input" className="block text-xs font-medium text-stone-300 mb-2">
            Mã xác thực (6 số)
          </label>
          <input
            id="otp-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoFocus
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ''));
              setError(undefined);
            }}
            placeholder="······"
            className={`${DARK_INPUT_CLASS} text-center font-mono text-2xl tracking-[0.5em] h-14`}
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className={`${DARK_PRIMARY_BUTTON} w-full`}
        >
          {loading ? 'Đang xác thực…' : 'Xác thực & Bắt đầu'}
        </button>

        <div className="flex items-center justify-between pt-2 text-xs">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending}
            className="text-stone-400 hover:text-cream disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <RefreshCw className={`size-3.5 ${resending ? 'animate-spin' : ''}`} />
            {resendCooldown > 0 ? `Gửi lại sau (${resendCooldown}s)` : 'Gửi lại mã'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="text-stone-400 hover:text-cream transition-colors"
          >
            Đổi thông tin
          </button>
        </div>
      </form>
    </div>
  );
}
