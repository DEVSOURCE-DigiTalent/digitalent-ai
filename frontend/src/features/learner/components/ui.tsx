import type { ElementType, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { levelLabelVi } from '@/lib/competency-levels';
import type { GapSeverity } from '@/services/personal-learning.service';

/** Shared theme primitives. Personal pages use the compact header; public flows retain PageIntro. */

export const PT_BUTTON =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-pt-accent text-pt-on-accent font-semibold px-5 py-2.5 text-sm transition-colors hover:bg-pt-accent/85 disabled:cursor-not-allowed disabled:opacity-45';

export const PT_BUTTON_SECONDARY =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-pt-line px-5 py-2.5 text-sm font-medium text-pt-fg transition-colors hover:border-pt-accent/60 hover:bg-pt-accent/5 disabled:cursor-not-allowed disabled:opacity-45';

export const PT_LINK = 'text-pt-fg underline decoration-pt-fg/30 underline-offset-4 transition-colors hover:decoration-pt-accent hover:text-pt-accent';

export const PT_INPUT =
  'w-full rounded-xl border border-pt-line bg-pt-raised/60 px-4 py-3 text-sm text-pt-fg placeholder:text-pt-fg-3 outline-none transition-colors focus:border-pt-accent focus:ring-1 focus:ring-pt-accent/40 aria-[invalid=true]:border-pt-bad';

export const PT_EYEBROW = 'text-[11px] uppercase tracking-[0.16em] text-pt-fg-3';

interface PageIntroProps {
  label: string;
  title: ReactNode;
  /** Second line, set in the serif italic like the landing page. */
  accent?: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageIntro({ label, title, accent, lead, actions, className }: PageIntroProps) {
  return (
    <header className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-3xl">
        <p className={PT_EYEBROW}>{label}</p>
        <h1 className="mt-4 text-balance text-[clamp(30px,4.6vw,52px)] font-normal leading-[1.04] tracking-[-0.03em] text-pt-fg">
          {title}
          {accent && (
            <>
              {' '}
              <span className="font-landing-serif italic text-pt-fg-2">{accent}</span>
            </>
          )}
        </h1>
        {lead && <p className="mt-4 max-w-[60ch] text-pretty text-[15px] leading-[1.7] text-pt-fg-2">{lead}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export function PersonalPageHeader({ label, title, accent, lead, actions, className }: PageIntroProps) {
  return (
    <header className={cn('flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between', className)}>
      <div className="min-w-0 max-w-3xl">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-pt-accent">{label}</p>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-pt-fg md:text-[30px]">{title}{accent && <> <span>{accent}</span></>}</h1>
        {lead && <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-pt-fg-2">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 md:max-w-[45%]">{actions}</div>}
    </header>
  );
}

interface CardProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
}

export function Card({ as: Component = 'section', className, children, ...rest }: CardProps) {
  return (
    <Component className={cn('rounded-2xl border border-pt-line/80 bg-pt-card', className)} {...rest}>
      {children}
    </Component>
  );
}

export function SectionTitle({ title, aside, id, className }: { title: ReactNode; aside?: ReactNode; id?: string; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1', className)}>
      <h2 id={id} className="text-[19px] font-normal tracking-[-0.015em] text-pt-fg">{title}</h2>
      {aside && <div className="text-xs text-pt-fg-3">{aside}</div>}
    </div>
  );
}

type Tone = 'neutral' | 'ok' | 'warn' | 'bad' | 'info' | 'solid';

const TONES: Record<Tone, string> = {
  neutral: 'border-pt-line text-pt-fg-2',
  ok: 'border-pt-ok/40 text-pt-ok bg-pt-ok/10',
  warn: 'border-pt-warn/40 text-pt-warn bg-pt-warn/10',
  bad: 'border-pt-bad/40 text-pt-bad bg-pt-bad/10',
  info: 'border-pt-info/40 text-pt-info bg-pt-info/10',
  solid: 'border-transparent bg-pt-accent text-pt-on-accent',
};

export function Tag({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium', TONES[tone], className)}>
      {children}
    </span>
  );
}

const SEVERITY: Record<GapSeverity, { tone: Tone; label: string }> = {
  HIGH: { tone: 'bad', label: 'Ưu tiên cao' },
  MEDIUM: { tone: 'warn', label: 'Ưu tiên vừa' },
  LOW: { tone: 'info', label: 'Ưu tiên thấp' },
};

export function SeverityTag({ severity }: { severity: GapSeverity | null }) {
  if (!severity) return <Tag tone="ok">Đạt</Tag>;
  return <Tag tone={SEVERITY[severity].tone}>{SEVERITY[severity].label}</Tag>;
}

interface LevelPipsProps {
  level: number;
  /** Required level: the pips up to it get an outline, so the gap shows as empty outlined pips. */
  required?: number;
  className?: string;
  showLabel?: boolean;
}

/** Three steps (Cơ bản · Trung cấp · Nâng cao): filled = reached, outlined = still required. */
export function LevelPips({ level, required = 0, className, showLabel = false }: LevelPipsProps) {
  const label = required > 0
    ? `Hiện tại ${levelLabelVi(level)}, yêu cầu ${levelLabelVi(required)}`
    : `Mức ${levelLabelVi(level)}`;
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="inline-flex gap-1" role="img" aria-label={label}>
        {[1, 2, 3].map((step) => (
          <i
            key={step}
            className={cn(
              'block h-2 w-5 rounded-full',
              step <= level ? 'bg-pt-accent' : step <= required ? 'border border-dashed border-pt-fg/55' : 'bg-pt-fg/12',
            )}
          />
        ))}
      </span>
      {showLabel && <span className="text-xs text-pt-fg-2">{levelLabelVi(level)}</span>}
    </span>
  );
}

export function ProgressBar({ value, label, className, tone = 'fg' }: { value: number; label: string; className?: string; tone?: 'fg' | 'ok' }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-pt-fg/10', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-700 ease-cinematic', tone === 'ok' ? 'bg-pt-ok' : 'bg-pt-accent')}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function Stat({ label, value, hint, className }: { label: string; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-xs text-pt-fg-3">{label}</span>
      <span className="text-[28px] font-light leading-none tracking-[-0.03em] text-pt-fg tabular-nums">{value}</span>
      {hint && <span className="text-xs text-pt-fg-3">{hint}</span>}
    </div>
  );
}

export function LoadingBlock({ label = 'Đang tải…', className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn('grid gap-3', className)}>
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((row) => (
        <div key={row} className="h-24 animate-pulse rounded-card bg-pt-card" style={{ animationDelay: `${row * 120}ms` }} />
      ))}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <Card className="flex flex-col items-start gap-4 p-6" role="alert">
      <div className="flex items-center gap-2 text-pt-bad">
        <AlertTriangle className="size-4" aria-hidden="true" />
        <span className="text-sm font-medium">Không tải được dữ liệu</span>
      </div>
      <p className="text-sm text-pt-fg-2">{message ?? 'Kiểm tra kết nối rồi thử lại.'}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={PT_BUTTON_SECONDARY}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Thử lại
        </button>
      )}
    </Card>
  );
}

export function EmptyState({ title, body, action, className }: { title: string; body?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <Card className={cn('flex flex-col items-start gap-3 p-8', className)}>
      <p className="text-xl font-normal tracking-[-0.015em] text-pt-fg">{title}</p>
      {body && <p className="max-w-[56ch] text-sm leading-relaxed text-pt-fg-2">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </Card>
  );
}


/**
 * Gold roles of the trial and plan screens, shared with the public individual pages: gold for the main action
 * (upgrade, next step), the mint `pt-ok` for state. Both are readable in the light and the dark theme.
 */
export {
  GOLD_BUTTON as PT_BUTTON_GOLD,
  GOLD_OUTLINE_BUTTON as PT_BUTTON_GOLD_OUTLINE,
  GOLD_TEXT as PT_TEXT_GOLD,
} from '@/features/experience/individual-trial/trial-style';
