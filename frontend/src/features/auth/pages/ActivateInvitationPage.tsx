import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { PublicShell } from '../../public/components/PublicShell';
import { DARK_INPUT_CLASS, DARK_PRIMARY_BUTTON, Field, FormError } from '../../public/components/FormControls';
import { useLogin } from '@/hooks/use-auth';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { ROLE_LABELS, type Role } from '@/lib/roles';
import { invitationService } from '@/services/invitation.service';
import { passwordSchema, requiredText } from '../validation';
import { PasswordField } from '../components/PasswordField';

const schema = z
  .object({
    fullName: requiredText('Họ và tên'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Nhập lại mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp',
  });

type FormValues = z.infer<typeof schema>;

const errorMessage = (error: unknown) => organizationErrorMessage(error, 'Không thể kích hoạt tài khoản. Vui lòng thử lại.');

/** AUTH-05: an invited employee confirms the invitation, sets a password and enters the organization. */
export function ActivateInvitationPage() {
  const { token = '' } = useParams();
  const invitation = useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => (await invitationService.getInvitation(token)).data.data!,
    retry: false,
  });

  return (
    <PublicShell>
      <h1 className="text-[clamp(28px,4vw,40px)] font-normal leading-[1.1] tracking-[-0.03em]">Kích hoạt tài khoản</h1>

      {invitation.isLoading && <p className="mt-6 text-sm text-stone-400">Đang kiểm tra lời mời…</p>}

      {invitation.isError && (
        <div className="mt-6 grid gap-4">
          <FormError message={errorMessage(invitation.error)} />
          <p className="text-sm text-stone-400">Hãy nhờ quản trị tổ chức gửi lại lời mời, hoặc đăng nhập nếu bạn đã kích hoạt.</p>
          <Link to="/login" className="text-sm text-cream underline underline-offset-4">
            Đến trang đăng nhập
          </Link>
        </div>
      )}

      {invitation.data?.status === 'accepted' && (
        <div className="mt-6 grid gap-4">
          <p className="text-sm text-stone-400">Lời mời này đã được kích hoạt.</p>
          <Link to="/business/login" className="text-sm text-cream underline underline-offset-4">
            Đăng nhập
          </Link>
        </div>
      )}

      {invitation.data?.status === 'pending' && (
        <ActivationForm
          token={token}
          email={invitation.data.email}
          fullName={invitation.data.fullName}
          organizationName={invitation.data.organizationName}
          roleLabel={ROLE_LABELS[invitation.data.role as Role] ?? invitation.data.role}
        />
      )}
    </PublicShell>
  );
}

interface ActivationFormProps {
  token: string;
  email: string;
  fullName: string;
  organizationName: string;
  roleLabel: string;
}

function ActivationForm({ token, email, fullName, organizationName, roleLabel }: ActivationFormProps) {
  const navigate = useNavigate();
  const login = useLogin();
  const [submitError, setSubmitError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { fullName } });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      await invitationService.activate({ token, fullName: values.fullName, password: values.password });
      await login.mutateAsync({ email, password: values.password });
      navigate('/enterprise/initial-assessment', { replace: true });
    } catch (error) {
      setSubmitError(errorMessage(error));
    }
  });

  return (
    <>
      <p className="mt-3 text-sm leading-[1.6] text-stone-400">
        Bạn được mời tham gia <strong className="font-medium text-cream">{organizationName}</strong> với vai trò{' '}
        <strong className="font-medium text-cream">{roleLabel}</strong>. Đặt mật khẩu để bắt đầu.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-7 grid gap-4">
        <FormError message={submitError} />

        <Field label="Email" htmlFor="email" hint="Địa chỉ nhận lời mời, không thể thay đổi.">
          <input id="email" type="email" value={email} readOnly className={DARK_INPUT_CLASS} />
        </Field>

        <Field label="Họ và tên" htmlFor="fullName" error={errors.fullName?.message}>
          <input id="fullName" autoComplete="name" aria-invalid={!!errors.fullName} className={DARK_INPUT_CLASS} {...register('fullName')} />
        </Field>

        <Field label="Mật khẩu" htmlFor="password" error={errors.password?.message} hint="Mật khẩu cần ít nhất 12 ký tự.">
          <PasswordField
            id="password"
            autoComplete="new-password"
            placeholder="Tối thiểu 12 ký tự"
            showMinHint={false}
            error={errors.password?.message}
            {...register('password')}
          />
        </Field>

        <Field label="Nhập lại mật khẩu" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <PasswordField
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            showMinHint={false}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </Field>

        <button type="submit" disabled={isSubmitting} className={`${DARK_PRIMARY_BUTTON} mt-2 cursor-pointer`}>
          {isSubmitting ? 'Đang kích hoạt…' : 'Kích hoạt và vào hệ thống'}
        </button>
      </form>
    </>
  );
}
