import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Mail, CheckCircle2, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { AuthShell } from '../components/AuthShell';
import {
  DARK_INPUT_CLASS,
  DARK_PRIMARY_BUTTON,
  DARK_SECONDARY_BUTTON,
  Field,
  FormError,
  MockEmailNotice,
} from '../../public/components/FormControls';
import { passwordService } from '@/services/password.service';
import { passwordSchema } from '../validation';
import { USE_MOCK } from '@/services/mock/mock-config';

function errorMessage(error: unknown): string {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? (error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
}

const forgotSchema = z.object({
  email: z.string().trim().min(1, 'Nhập email').pipe(z.email('Email không hợp lệ')),
});

/** AUTH-06 (1/2): asks for the email. The answer is the same whether or not an account exists. */
export function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState('');
  const request = useMutation({
    mutationFn: async (email: string) => {
      setSubmittedEmail(email);
      const res = await passwordService.requestReset(email);
      return res.data?.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });

  return (
    <AuthShell
      portal="individual"
      eyebrow="Bảo mật tài khoản"
      title="Quên mật khẩu?"
      subtitle="Nhập email tài khoản của bạn để nhận liên kết xác thực đặt lại mật khẩu mới."
      footerLink={
        <p className="text-xs text-stone-400">
          Đã nhớ mật khẩu?{' '}
          <Link to="/login" className="text-cream underline underline-offset-4 font-medium hover:text-[#F5CA65] transition-colors">
            Đăng nhập ngay
          </Link>
        </p>
      }
    >
      {request.isSuccess ? (
        <div className="space-y-6 text-center py-2" role="status">
          <div className="grid size-14 place-items-center mx-auto rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
            <Mail className="size-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-cream">Đã gửi email khôi phục!</h2>
            <p className="text-xs text-stone-300 leading-relaxed max-w-sm mx-auto">
              Nếu email <strong className="text-cream font-mono">{submittedEmail}</strong> có tài khoản trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu đến hộp thư của bạn.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-left text-stone-300 space-y-2.5">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>Liên kết có hiệu lực trong vòng <strong>30 phút</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 text-[#F5CA65] mt-0.5" />
              <span>Vui lòng kiểm tra cả thư mục <em>Thư rác (Spam / Junk)</em> nếu chưa thấy thư trong hộp thư chính.</span>
            </div>
          </div>

          {USE_MOCK && (
            <MockEmailNotice label="liên kết đặt lại mật khẩu." to={request.data?.debugLink} />
          )}

          <div className="grid gap-3 pt-2">
            <Link to="/login" className={`${DARK_PRIMARY_BUTTON} w-full text-center py-3`}>
              Quay lại đăng nhập
            </Link>
            <button
              type="button"
              onClick={() => request.reset()}
              className={`${DARK_SECONDARY_BUTTON} w-full text-center text-xs py-2.5`}
            >
              Gửi lại hoặc thử email khác
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(({ email }) => request.mutate(email))} noValidate className="space-y-5">
          <FormError message={request.error ? errorMessage(request.error) : undefined} />

          <Field label="Địa chỉ email đăng ký" htmlFor="email" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="example@gmail.com"
              aria-invalid={!!errors.email}
              className={DARK_INPUT_CLASS}
              {...register('email')}
            />
          </Field>

          <button
            type="submit"
            disabled={request.isPending}
            className={`${DARK_PRIMARY_BUTTON} w-full py-3.5`}
          >
            {request.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Đang gửi liên kết…
              </span>
            ) : (
              'Gửi liên kết đặt lại mật khẩu'
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

const resetSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string().min(1, 'Nhập lại mật khẩu') })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp',
  });

/** AUTH-06 (2/2): sets the new password from the emailed link. */
export function ResetPasswordPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validity = useQuery({
    queryKey: ['reset-token', token],
    queryFn: async () => (await passwordService.checkResetToken(token)).data,
    retry: false,
  });

  const reset = useMutation({
    mutationFn: async (password: string) => passwordService.resetPassword(token, password),
    onSuccess: () => setDone(true),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });

  return (
    <AuthShell
      portal="individual"
      eyebrow="Đặt lại mật khẩu"
      title="Tạo mật khẩu mới"
      subtitle="Thiết lập mật khẩu an toàn mới cho tài khoản của bạn."
      footerLink={
        <p className="text-xs text-stone-400">
          <Link to="/login" className="text-cream underline underline-offset-4 hover:text-[#F5CA65] transition-colors">
            Quay lại trang đăng nhập
          </Link>
        </p>
      }
    >
      {validity.isLoading && (
        <div className="flex flex-col items-center justify-center py-10 space-y-3 text-center">
          <Loader2 className="size-8 animate-spin text-[#F5CA65]" />
          <p className="text-xs text-stone-400">Đang kiểm tra liên kết đặt lại mật khẩu…</p>
        </div>
      )}

      {validity.isError && (
        <div className="space-y-6 text-center py-4">
          <div className="grid size-14 place-items-center mx-auto rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/30">
            <AlertCircle className="size-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-medium text-cream">Liên kết không hợp lệ hoặc đã hết hạn</h2>
            <p className="text-xs text-stone-400">
              {errorMessage(validity.error)}
            </p>
          </div>
          <Link to="/forgot-password" className={`${DARK_PRIMARY_BUTTON} inline-flex items-center gap-2`}>
            Yêu cầu liên kết mới
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}

      {done && (
        <div className="space-y-6 text-center py-4" role="status">
          <div className="grid size-14 place-items-center mx-auto rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
            <CheckCircle2 className="size-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-cream">Đặt lại mật khẩu thành công!</h2>
            <p className="text-xs text-stone-300">
              Mật khẩu đã được cập nhật thành công. Bạn có thể đăng nhập ngay bằng mật khẩu mới.
            </p>
          </div>
          <button
            type="button"
            className={`${DARK_PRIMARY_BUTTON} w-full py-3.5`}
            onClick={() => navigate('/login', { replace: true })}
          >
            Đến trang đăng nhập
          </button>
        </div>
      )}

      {validity.isSuccess && !done && (
        <form onSubmit={handleSubmit(({ password }) => reset.mutate(password))} noValidate className="space-y-5">
          <FormError message={reset.error ? errorMessage(reset.error) : undefined} />

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-stone-300 mb-1.5">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Ít nhất 8 ký tự"
                aria-invalid={!!errors.password}
                className={`${DARK_INPUT_CLASS} pr-10`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-cream transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password?.message && (
              <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-stone-300 mb-1.5">
              Nhập lại mật khẩu mới
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Xác nhận mật khẩu mới"
                aria-invalid={!!errors.confirmPassword}
                className={`${DARK_INPUT_CLASS} pr-10`}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-cream transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword?.message && (
              <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={reset.isPending}
            className={`${DARK_PRIMARY_BUTTON} w-full py-3.5`}
          >
            {reset.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Đang lưu mật khẩu…
              </span>
            ) : (
              'Đặt mật khẩu mới'
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

/** AUTH-07: opened from the verification email; confirms the address. */
export function VerifyEmailPage() {
  const { token = '' } = useParams();
  const verify = useMutation({ mutationFn: async () => passwordService.verifyEmail(token) });
  const { mutate } = verify;

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <AuthShell
      portal="individual"
      eyebrow="Xác thực tài khoản"
      title="Xác minh địa chỉ email"
      subtitle="Kích hoạt quyền truy cập đầy đủ vào nền tảng DigiTalent AI."
    >
      <div className="space-y-6 text-center py-4" role="status">
        {(verify.isPending || verify.isIdle) && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="size-8 animate-spin text-[#F5CA65]" />
            <p className="text-xs text-stone-400">Đang xác thực liên kết email của bạn…</p>
          </div>
        )}

        {verify.isSuccess && (
          <>
            <div className="grid size-14 place-items-center mx-auto rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="size-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-cream">Email của bạn đã được xác minh thành công!</h2>
              <p className="text-xs text-stone-300">
                Tài khoản đã sẵn sàng. Bạn có thể đăng nhập ngay để bắt đầu hành trình học tập.
              </p>
            </div>
            <Link to="/login" className={`${DARK_PRIMARY_BUTTON} w-full py-3`}>
              Đến trang đăng nhập
            </Link>
          </>
        )}

        {verify.isError && (
          <>
            <div className="grid size-14 place-items-center mx-auto rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/30">
              <AlertCircle className="size-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-medium text-cream">Xác thực không thành công</h2>
              <p className="text-xs text-rose-400">
                {errorMessage(verify.error)}
              </p>
            </div>
            <Link to="/login" className={`${DARK_PRIMARY_BUTTON} w-full py-3`}>
              Quay lại đăng nhập
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
