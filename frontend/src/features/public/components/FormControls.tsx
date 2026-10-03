import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { USE_MOCK } from '@/services/mock/mock-config';

/** Input styling for the dark public pages. */
export const DARK_INPUT_CLASS =
  'w-full rounded-xl border border-cream/20 bg-landing-card px-4 py-3 text-sm text-cream placeholder-stone-500 outline-none transition-colors focus:border-cream/60 aria-[invalid=true]:border-red-400/70 disabled:opacity-60';

export const DARK_PRIMARY_BUTTON =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-cream-soft px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';

export const DARK_SECONDARY_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-full border border-cream/25 px-5 py-2.5 text-sm text-cream transition-colors hover:border-cream/60 disabled:cursor-not-allowed disabled:opacity-50';

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** Label, control and message, wired for screen readers (the control sets aria-describedby itself). */
export function Field({ label, htmlFor, error, hint, children, className }: FieldProps) {
  const describedBy = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string; 'aria-invalid'?: boolean }>, {
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })
    : children;

  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm text-cream/90">
        {label}
      </label>
      {control}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-300">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${htmlFor}-hint`} className="text-xs text-stone-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Banner for a failed submit (wrong password, email taken...). */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {message}
    </div>
  );
}

/** Shows what a real email would carry. Mock mode only: the real backend never returns these links. */
export function MockEmailNotice({ label, to }: { label: string; to?: string }) {
  // Never trust a link that arrives in a response: only the mock layer produces them, and only app-relative.
  if (!USE_MOCK || !to || !to.startsWith('/') || to.startsWith('//')) return null;
  return (
    <p className="rounded-xl border border-dashed border-cream/25 px-4 py-3 text-xs text-stone-400">
      Giả lập email: {label}{' '}
      <Link to={to} className="text-cream underline underline-offset-4">
        mở liên kết
      </Link>
    </p>
  );
}
