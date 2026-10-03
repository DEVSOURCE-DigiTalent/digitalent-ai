import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import { PublicShell } from '../../public/components/PublicShell';
import {
  DARK_INPUT_CLASS,
  DARK_PRIMARY_BUTTON,
  DARK_SECONDARY_BUTTON,
  FormError,
  MockEmailNotice,
} from '../../public/components/FormControls';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefreshSession } from '@/hooks/use-refresh-session';
import { resolveWorkspace, WORKSPACES } from '@/lib/roles';
import { resolveNextStep } from '@/lib/navigation';
import { checkoutService } from '@/services/checkout.service';
import { passwordService } from '@/services/password.service';
import { USE_MOCK } from '@/services/mock/mock-config';

export function VerifyEmailRequiredPage() {
  const user = useCurrentUser((s) => s.user);
  const navigate = useNavigate();
  const refreshSession = useRefreshSession();

  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [changeError, setChangeError] = useState<string>();
  const [verifyLink, setVerifyLink] = useState<string>();
  const [notVerifiedNotice, setNotVerifiedNotice] = useState(false);

  useEffect(() => {
    if (USE_MOCK && user?.email) {
      passwordService.getVerifyLink(user.email).then((res) => {
        if (res.data?.data?.debugVerifyLink) {
          setVerifyLink(res.data.data.debugVerifyLink);
        }
      }).catch(() => {});
    }
  }, [user?.email]);

  if (!user) return <Navigate to="/login" replace />;

  // If email is already verified, proceed to destination
  if (user.emailVerified !== false) {
    return <Navigate to={resolveNextStep(user)} replace />;
  }

  const audience = resolveWorkspace(user) === WORKSPACES.PERSONAL ? 'individual' : 'enterprise';

  const handleResend = async () => {
    setResending(true);
    setResendSuccess(false);
    try {
      const res = await passwordService.resendVerificationEmail(user.email);
      setResendSuccess(true);
      if (res.data?.data?.debugVerifyLink) {
        setVerifyLink(res.data.data.debugVerifyLink);
      }
    } catch {
      // ignore
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = async () => {
    setChangeError(undefined);
    try {
      const res = await checkoutService.updateEmail(newEmail);
      await refreshSession();
      setShowChangeEmail(false);
      if (res.data?.data?.debugVerifyLink) {
        setVerifyLink(res.data.data.debugVerifyLink);
      }
    } catch (err: any) {
      setChangeError(err?.response?.data?.message || 'Không thể đổi email.');
    }
  };

  return (
    <PublicShell portal={audience}>
      <section className="mx-auto mt-8 max-w-lg rounded-3xl bg-landing-panel p-8 text-center ring-1 ring-cream/10 space-y-6">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-cream-soft/10 text-cream ring-1 ring-cream/20">
          <Mail className="size-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-normal tracking-[-0.02em] text-cream">Xác minh email của bạn</h1>
          <p className="text-sm text-stone-400 leading-relaxed max-w-[42ch] mx-auto">
            Chúng tôi đã gửi liên kết kích hoạt đến email{' '}
            <strong className="text-cream">{user.email}</strong>. Vui lòng kiểm tra hộp thư để hoàn tất truy cập.
          </p>
        </div>

        {resendSuccess && (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="size-4" />
            <span>Đã gửi lại email xác minh thành công.</span>
          </div>
        )}

        <div className="grid gap-3 pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className={DARK_PRIMARY_BUTTON}
          >
            {resending ? 'Đang gửi…' : 'Gửi lại email xác minh'}
          </button>

          <button
            type="button"
            onClick={() => {
              setNewEmail(user.email);
              setShowChangeEmail((prev) => !prev);
            }}
            className={DARK_SECONDARY_BUTTON}
          >
            {showChangeEmail ? 'Đóng' : 'Đổi email khác'}
          </button>
        </div>

        {showChangeEmail && (
          <div className="rounded-2xl border border-cream/15 bg-landing-card p-4 text-left space-y-3">
            <label htmlFor="verifyChangeEmailInput" className="text-xs text-cream/90 block">
              Nhập email mới
            </label>
            <input
              id="verifyChangeEmailInput"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={DARK_INPUT_CLASS}
              placeholder="email@congty.vn"
            />
            {changeError && <FormError message={changeError} />}
            <button
              type="button"
              onClick={handleChangeEmail}
              className={DARK_PRIMARY_BUTTON}
            >
              Lưu email và gửi lại
            </button>
          </div>
        )}

        {USE_MOCK && verifyLink && (
          <div className="pt-2 text-left">
            <MockEmailNotice label="Kích hoạt email tài khoản (Mô phỏng)" to={verifyLink} />
          </div>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={async () => {
              setNotVerifiedNotice(false);
              try {
                await refreshSession();
              } catch {
                // ignore
              }
              const fresh = useCurrentUser.getState().user;
              if (fresh?.emailVerified) {
                navigate(resolveNextStep(fresh), { replace: true });
              } else {
                setNotVerifiedNotice(true);
              }
            }}
            className="text-xs text-stone-500 hover:text-stone-300 underline"
          >
            Tôi đã xác minh email, tiếp tục
          </button>
          {notVerifiedNotice && (
            <p role="alert" className="text-xs text-amber-400">
              Email chưa được xác thực. Vui lòng kiểm tra hộp thư hoặc bấm Gửi lại email.
            </p>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
