import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TermsCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string;
  /** Extra sentence after the agreement, e.g. what the sign-up will email. */
  note?: ReactNode;
}

export const TermsCheckbox = forwardRef<HTMLInputElement, TermsCheckboxProps>(
  ({ className, error, note, id = 'acceptTerms', ...props }, ref) => {
    return (
      <div className={cn('grid gap-1.5', className)}>
        <label htmlFor={id} className="flex items-start gap-3 cursor-pointer select-none">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="mt-1 size-4 rounded border-cream/20 bg-landing-card text-cream-soft accent-cream focus:ring-1 focus:ring-cream/60"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />
          <span className="text-xs leading-[1.6] text-stone-400">
            Tôi đồng ý với{' '}
            <a
              href="#terms"
              onClick={(e) => e.preventDefault()}
              className="text-cream underline underline-offset-2 hover:text-cream-soft"
            >
              Điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a
              href="#privacy"
              onClick={(e) => e.preventDefault()}
              className="text-cream underline underline-offset-2 hover:text-cream-soft"
            >
              Chính sách bảo mật
            </a>{' '}
            của DigiTalent AI.{note && <> {note}</>}
          </span>
        </label>
        {error && (
          <p id={`${id}-error`} role="alert" className="text-xs text-red-300">
            {error}
          </p>
        )}
      </div>
    );
  },
);

TermsCheckbox.displayName = 'TermsCheckbox';
