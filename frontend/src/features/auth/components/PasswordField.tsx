import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DARK_INPUT_CLASS } from '../../public/components/FormControls';

export interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  showMinHint?: boolean;
}

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[0-9]/.test(pwd) && /[a-zA-Z]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-rose-500' };
  if (score === 2) return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
  if (score === 3) return { score: 3, label: 'Khá', color: 'bg-teal-400' };
  return { score: 4, label: 'Mạnh', color: 'bg-emerald-400' };
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, error, showMinHint = true, value, onChange, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const [innerLength, setInnerLength] = useState(0);

    const strValue = typeof value === 'string' ? value : '';
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInnerLength(e.target.value.length);
      onChange?.(e);
    };

    const length = strValue.length || innerLength;
    const strength = getPasswordStrength(strValue);

    return (
      <div className="relative">
        <div className="relative">
          <input
            ref={ref}
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            value={value}
            onChange={handleChange}
            className={cn(DARK_INPUT_CLASS, 'pr-12', className)}
            aria-invalid={error ? true : undefined}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-cream transition-colors cursor-pointer"
            aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {show ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>

        {showMinHint && length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1.5 h-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={cn(
                    'flex-1 rounded-full transition-all duration-300',
                    step <= strength.score ? strength.color : 'bg-white/10'
                  )}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] text-stone-400">
              <span>Độ bảo mật: <strong className="text-cream">{strength.label}</strong></span>
              {length < 8 && <span>{length}/8 ký tự tối thiểu</span>}
            </div>
          </div>
        )}
      </div>
    );
  },
);

PasswordField.displayName = 'PasswordField';
