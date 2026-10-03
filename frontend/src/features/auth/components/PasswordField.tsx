import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DARK_INPUT_CLASS } from '../../public/components/FormControls';

export interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  showMinHint?: boolean;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, error, showMinHint = true, value, onChange, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const length = typeof value === 'string' ? value.length : 0;

    return (
      <div className="relative">
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          value={value}
          onChange={onChange}
          className={cn(DARK_INPUT_CLASS, 'pr-12', className)}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-cream transition-colors"
          aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {show ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
        {showMinHint && length > 0 && length < 12 && (
          <p className="mt-1 text-right text-[11px] text-stone-400">
            {length}/12 ký tự tối thiểu
          </p>
        )}
      </div>
    );
  },
);

PasswordField.displayName = 'PasswordField';
