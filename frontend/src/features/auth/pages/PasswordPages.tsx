import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { PublicShell } from '../../public/components/PublicShell';
import {
  DARK_INPUT_CLASS, DARK_PRIMARY_BUTTON, Field, FormError, MockEmailNotice,
} from '../../public/components/FormControls';
import { passwordService } from '@/services/password.service';
import { passwordSchema } from '../validation';

function errorMessage(error: unknown): string {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? (error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
}

const Title = ({ children }: { children: string }) => (
  <h1 className="text-[clamp(28px,4vw,40px)] font-normal leading-[1.1] tracking-[-0.03em]">{children}</h1>
);

const forgotSchema = z.object({ email: z.string().trim().min(1, 'Nhập email').pipe(z.email('Email không hợp lệ')) });

/** AUTH-06 (1/2): asks for the email. The answer is the same whether or not an account exists. */
export function ForgotPasswordPage() {
  const request = useMutation({ mutationFn: async (email: string) => (await passwordService.requestReset(email)).data.data });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });

  return (
    <PublicShell>
      <Title>Quên mật khẩu</Title>
      {request.isSuccess ? (
        <div className="mt-6 grid gap-4" role="status">
          <p className="text-sm leading-[1.6] text-stone-400">
            Nếu email này có tài khoản, chúng tôi đã gửi liên kết đặt lại mật khẩu. Liên kết có hiệu lực trong 30 phút.
          </p>
          <MockEmailNotice label="liên kết đặt lại mật khẩu." to={request.data?.debugLink} />
          <Link to="/login" className="text-sm text-cream underline underline-offset-4">
            Quay lại đăng nhập
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm leading-[1.6] text-stone-400">Nhập email đăng ký, chúng tôi sẽ gửi liên kết để bạn đặt mật khẩu mới.</p>
          <form onSubmit={handleSubmit(({ email }) => request.mutate(email))} noValidate className="mt-7 grid gap-4">
            <FormError message={request.error ? errorMessage(request.error) : undefined} />
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} className={DARK_INPUT_CLASS} {...register('email')} />
            </Field>
            <button type="submit" disabled={request.isPending} className={DARK_PRIMARY_BUTTON}>
              {request.isPending ? 'Đang gửi…' : 'Gửi liên kết'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-400">
            <Link to="/login" className="text-cream underline underline-offset-4">
              Quay lại đăng nhập
            </Link>
          </p>
        </>
      )}
    </PublicShell>
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
    <PublicShell>
      <Title>Đặt lại mật khẩu</Title>
      {validity.isLoading && <p className="mt-6 text-sm text-stone-400">Đang kiểm tra liên kết…</p>}

      {validity.isError && (
        <div className="mt-6 grid gap-4">
          <FormError message={errorMessage(validity.error)} />
          <Link to="/forgot-password" className="text-sm text-cream underline underline-offset-4">
            Yêu cầu liên kết mới
          </Link>
        </div>
      )}

      {done && (
        <div className="mt-6 grid gap-4" role="status">
          <p className="text-sm text-stone-400">Mật khẩu đã được đặt lại. Bạn có thể đăng nhập bằng mật khẩu mới.</p>
          <button type="button" className={DARK_PRIMARY_BUTTON} onClick={() => navigate('/login', { replace: true })}>
            Đến trang đăng nhập
          </button>
        </div>
      )}

      {validity.isSuccess && !done && (
        <form onSubmit={handleSubmit(({ password }) => reset.mutate(password))} noValidate className="mt-7 grid gap-4">
          <FormError message={reset.error ? errorMessage(reset.error) : undefined} />
          <Field label="Mật khẩu mới" htmlFor="password" error={errors.password?.message} hint="Ít nhất 8 ký tự, gồm chữ và số.">
            <input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} className={DARK_INPUT_CLASS} {...register('password')} />
          </Field>
          <Field label="Nhập lại mật khẩu" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
            <input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} className={DARK_INPUT_CLASS} {...register('confirmPassword')} />
          </Field>
          <button type="submit" disabled={reset.isPending} className={DARK_PRIMARY_BUTTON}>
            {reset.isPending ? 'Đang lưu…' : 'Đặt mật khẩu mới'}
          </button>
        </form>
      )}
    </PublicShell>
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
    <PublicShell>
      <Title>Xác minh email</Title>
      <div className="mt-6 grid gap-4" role="status">
        {verify.isPending || verify.isIdle ? <p className="text-sm text-stone-400">Đang xác minh…</p> : null}
        {verify.isSuccess && <p className="text-sm text-stone-400">Email của bạn đã được xác minh.</p>}
        {verify.isError && <FormError message={errorMessage(verify.error)} />}
        {(verify.isSuccess || verify.isError) && (
          <Link to="/login" className="text-sm text-cream underline underline-offset-4">
            Đến trang đăng nhập
          </Link>
        )}
      </div>
    </PublicShell>
  );
}
