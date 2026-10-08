import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { USE_MOCK } from '@/services/mock/mock-config';

/** Input styling for the public pages, responsive to individual theme tokens when within individual portal. */
export const DARK_INPUT_CLASS =
  'w-full rounded-xl border border-white/15 bg-landing-card px-4 py-3 text-sm text-cream placeholder-stone-400 outline-none transition-all focus:border-[#E5A93C] focus:ring-1 focus:ring-[#E5A93C]/40 aria-[invalid=true]:border-red-400/70 disabled:opacity-60 [data-individual-theme_&]:border-pt-line [data-individual-theme_&]:bg-pt-card [data-individual-theme_&]:text-pt-fg [data-individual-theme_&]:placeholder:text-pt-fg-3 [data-individual-theme_&]:focus:border-pt-accent';

export const DARK_PRIMARY_BUTTON =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F5CA65] to-[#D4982F] px-6 py-3 text-sm font-semibold text-[#0C0E12] shadow-lg shadow-amber-500/20 transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 [data-individual-theme_&]:bg-none [data-individual-theme_&]:bg-pt-accent [data-individual-theme_&]:text-pt-on-accent';

export const DARK_SECONDARY_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-full border border-amber-400/30 px-5 py-2.5 text-sm font-medium text-cream transition-all hover:border-amber-400/60 hover:bg-amber-400/5 disabled:cursor-not-allowed disabled:opacity-50 [data-individual-theme_&]:border-pt-line [data-individual-theme_&]:text-pt-fg [data-individual-theme_&]:hover:border-pt-line-strong';

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
      <label htmlFor={htmlFor} className="text-sm text-cream/90 [data-individual-theme_&]:text-pt-fg">
        {label}
      </label>
      {control}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-300 [data-individual-theme_&]:text-pt-bad">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${htmlFor}-hint`} className="text-xs text-stone-500 [data-individual-theme_&]:text-pt-fg-3">
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
    <div
      role="alert"
      className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 [data-individual-theme_&]:border-pt-bad/30 [data-individual-theme_&]:bg-pt-bad/10 [data-individual-theme_&]:text-pt-bad"
    >
      {message}
    </div>
  );
}

/** Shows what a real email would carry. Mock mode only: the real backend never returns these links. */
export function MockEmailNotice({ label, to }: { label: string; to?: string }) {
  // Never trust a link that arrives in a response: only the mock layer produces them, and only app-relative.
  if (!USE_MOCK || !to || !to.startsWith('/') || to.startsWith('//')) return null;
  return (
    <p className="rounded-xl border border-dashed border-cream/25 px-4 py-3 text-xs text-stone-400 [data-individual-theme_&]:border-pt-line [data-individual-theme_&]:text-pt-fg-3">
      Giả lập email: {label}{' '}
      <Link to={to} className="text-cream underline underline-offset-4 [data-individual-theme_&]:text-pt-fg">
        mở liên kết
      </Link>
    </p>
  );
}
