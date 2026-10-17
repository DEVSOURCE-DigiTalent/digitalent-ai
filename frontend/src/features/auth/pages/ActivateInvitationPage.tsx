import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { PulseAuthLayout } from '@/features/public/pulse-landing/PulseAuthLayout';
import { useLogin } from '@/hooks/use-auth';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { ROLE_LABELS, type Role } from '@/lib/roles';
import { invitationService } from '@/services/invitation.service';
import { passwordSchema, requiredText } from '../validation';

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
    <PulseAuthLayout
      eyebrow="Lời mời từ doanh nghiệp"
      title="Tham gia không gian làm việc."
      subtitle="Xác nhận email nhận lời mời, tự đặt mật khẩu và vào đúng phòng ban, vị trí của bạn."
      asideTitle="Lộ trình học bắt đầu từ đúng vị trí."
      asideText="Doanh nghiệp đã chọn vai trò, phòng ban và vị trí. Sau khi kích hoạt, bạn sẽ thấy mục tiêu năng lực dành cho mình."
      asidePoints={['Email mời chỉ dùng một lần', 'Bạn tự đặt mật khẩu, doanh nghiệp không biết mật khẩu của bạn']}
    >

      {invitation.isLoading && <p role="status" className="pulse-auth-info">Đang kiểm tra lời mời…</p>}

      {invitation.isError && (
        <div className="pulse-auth-fields">
          <p role="alert" className="pulse-auth-error">{errorMessage(invitation.error)}</p>
          <p>Hãy nhờ doanh nghiệp gửi lại lời mời, hoặc đăng nhập nếu bạn đã kích hoạt.</p>
          <Link to="/login" className="pulse-auth-link">
            Đến trang đăng nhập
          </Link>
        </div>
      )}

      {invitation.data?.status === 'accepted' && (
        <div className="pulse-auth-fields">
          <p className="pulse-auth-info">Lời mời này đã được kích hoạt.</p>
          <Link to="/login" className="pulse-auth-link">
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
          departmentName={invitation.data.departmentName}
          positionName={invitation.data.positionName}
        />
      )}
    </PulseAuthLayout>
  );
}

interface ActivationFormProps {
  token: string;
  email: string;
  fullName: string;
  organizationName: string;
  roleLabel: string;
  departmentName?: string | null;
  positionName?: string | null;
}

function ActivationForm({ token, email, fullName, organizationName, roleLabel, departmentName, positionName }: ActivationFormProps) {
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
    let activated = false;
    try {
      await invitationService.activate({ token, fullName: values.fullName, password: values.password });
      activated = true;
      const home = await login.mutateAsync({ email, password: values.password });
      navigate(home, { replace: true });
    } catch (error) {
      if (activated) {
        navigate(`/login?email=${encodeURIComponent(email)}&verified=1`, { replace: true });
        return;
      }
      setSubmitError(errorMessage(error));
    }
  });

  return (
    <>
      <p className="pulse-auth-info">
        <strong>{organizationName}</strong> mời bạn với vai trò <strong>{roleLabel}</strong>
        {departmentName ? <> · Phòng ban <strong>{departmentName}</strong></> : null}
        {positionName ? <> · Vị trí <strong>{positionName}</strong></> : null}.
      </p>

      <form onSubmit={onSubmit} noValidate className="pulse-auth-fields">
        {submitError && <p role="alert" className="pulse-auth-error">{submitError}</p>}
        <div className="pulse-auth-field"><label htmlFor="email">Email nhận lời mời</label><input id="email" type="email" value={email} readOnly /><span className="pulse-auth-field-hint">Địa chỉ này sẽ dùng để đăng nhập.</span></div>
        <div className="pulse-auth-field"><label htmlFor="fullName">Họ và tên</label><input id="fullName" autoComplete="name" aria-invalid={!!errors.fullName} {...register('fullName')} />{errors.fullName && <p role="alert" className="pulse-auth-inline-error">{errors.fullName.message}</p>}</div>
        <div className="pulse-auth-field"><label htmlFor="password">Mật khẩu mới</label><input id="password" type="password" autoComplete="new-password" placeholder="Tối thiểu 12 ký tự" aria-invalid={!!errors.password} {...register('password')} /><span className="pulse-auth-field-hint">Từ 12 đến 128 ký tự.</span>{errors.password && <p role="alert" className="pulse-auth-inline-error">{errors.password.message}</p>}</div>
        <div className="pulse-auth-field"><label htmlFor="confirmPassword">Nhập lại mật khẩu</label><input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register('confirmPassword')} />{errors.confirmPassword && <p role="alert" className="pulse-auth-inline-error">{errors.confirmPassword.message}</p>}</div>
        <button type="submit" disabled={isSubmitting} className="pulse-auth-primary">
          {isSubmitting ? 'Đang kích hoạt…' : 'Kích hoạt và vào hệ thống'}
        </button>
      </form>
    </>
  );
}
