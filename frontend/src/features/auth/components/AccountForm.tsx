import { useEffect, useRef, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { passwordSchema, requiredText } from '../validation';
import { PasswordField } from './PasswordField';
import { TermsCheckbox } from './TermsCheckbox';
import { DARK_INPUT_CLASS, DARK_PRIMARY_BUTTON, FormError } from '../../public/components/FormControls';

const accountFormSchema = z
  .object({
    fullName: requiredText('Họ và tên'),
    email: z.string().trim().min(1, 'Nhập email').email('Email không hợp lệ'),
    password: passwordSchema,
    acceptTerms: z.boolean().refine((val) => val === true, 'Bạn cần đồng ý với điều khoản để tiếp tục'),
  })
  .superRefine((data, ctx) => {
    if (data.email && data.password && data.password.toLowerCase() === data.email.toLowerCase()) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Mật khẩu không được trùng với email',
      });
    }
  });

export type AccountFormValues = z.infer<typeof accountFormSchema>;

export interface AccountFormProps {
  audience: 'enterprise' | 'individual';
  onSubmit: (values: AccountFormValues) => Promise<void>;
  submitError?: string;
  emailTaken?: boolean;
  loginPath: string;
  /** Label of the submit button; defaults to the purchase flow's. */
  submitLabel?: string;
  /** Sentence added to the terms checkbox. */
  consentNote?: ReactNode;
}

export function AccountForm({
  audience,
  onSubmit,
  submitError,
  emailTaken,
  loginPath,
  submitLabel = 'Tạo tài khoản và thanh toán',
  consentNote,
}: AccountFormProps) {
  const isEnterprise = audience === 'enterprise';
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      acceptTerms: false,
    },
  });

  const { ref: nameFormRef, ...nameFieldProps } = register('fullName');
  const { ref: emailFormRef, ...emailFieldProps } = register('email');
  const { ref: passwordFormRef, ...passwordFieldProps } = register('password');
  const { ref: termsFormRef, ...termsFieldProps } = register('acceptTerms');

  const passwordValue = watch('password');

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
      {emailTaken ? (
        <div role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Email này đã có tài khoản.{' '}
          <Link to={loginPath} className="text-cream font-semibold underline underline-offset-4 hover:text-cream-soft">
            Đăng nhập
          </Link>{' '}
          để tiếp tục.
        </div>
      ) : (
        <FormError message={submitError} />
      )}

      {/* Field: Full Name */}
      <div className="grid gap-1.5">
        <label htmlFor="fullName" className="text-sm text-cream/90">
          Họ và tên
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="Nguyễn Văn A"
          className={DARK_INPUT_CLASS}
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          ref={(e) => {
            nameFormRef(e);
            nameInputRef.current = e;
          }}
          {...nameFieldProps}
        />
        {errors.fullName && (
          <p id="fullName-error" role="alert" className="text-xs text-red-300">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Field: Email */}
      <div className="grid gap-1.5">
        <label htmlFor="email" className="text-sm text-cream/90">
          {isEnterprise ? 'Email công việc' : 'Email'}
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={isEnterprise ? 'ban@congty.vn' : 'ban@email.com'}
          className={DARK_INPUT_CLASS}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'email-error' : undefined}
          ref={emailFormRef}
          {...emailFieldProps}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-xs text-red-300">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Field: Password */}
      <div className="grid gap-1.5">
        <label htmlFor="password" className="text-sm text-cream/90">
          Mật khẩu
        </label>
        <PasswordField
          id="password"
          placeholder="Tối thiểu 12 ký tự"
          error={errors.password?.message}
          value={passwordValue}
          ref={passwordFormRef}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...passwordFieldProps}
        />
        {errors.password && (
          <p id="password-error" role="alert" className="text-xs text-red-300">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Field: Terms Checkbox */}
      <TermsCheckbox
        id="acceptTerms"
        error={errors.acceptTerms?.message}
        note={consentNote}
        ref={termsFormRef}
        {...termsFieldProps}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={DARK_PRIMARY_BUTTON}
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {submitLabel}
      </button>

      <p className="text-center text-xs text-stone-400">
        Đã có tài khoản?{' '}
        <Link to={loginPath} className="text-cream underline underline-offset-4 hover:text-cream-soft">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
