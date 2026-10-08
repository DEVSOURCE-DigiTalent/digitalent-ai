import { BookOpen, CalendarDays, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';
import { GOLD_KICKER } from '../../experience/individual-trial/trial-style';

interface TrialTermsCardProps {
  /** Name of the position carried over from the quick try, shown as a chip. */
  positionName?: string;
  /** Whether the position comes from the quick try (adds "· từ bài thử"). */
  fromTry?: boolean;
  /** Headline above the three terms; the sign-up page leaves it out. */
  heading?: string;
  /**
   * 'card': on the dark card of the sign-up frame (landing colours, like the plan summary).
   * 'themed': on the personal pages, where the theme tokens follow the light/dark choice.
   */
  variant?: 'card' | 'themed';
  className?: string;
}

const LOOKS = {
  card: {
    box: 'bg-landing-panel ring-1 ring-amber-400/20 shadow-lg shadow-black/20',
    text: 'text-cream/90',
    icon: 'text-[#F5CA65]',
    chip: 'bg-cream/10 text-cream',
  },
  themed: {
    box: 'border border-pt-line bg-pt-card',
    text: 'text-pt-fg-2',
    icon: 'text-pt-ok',
    chip: 'bg-pt-raised text-pt-fg',
  },
} as const;

/** What a 7-day trial gives and what happens when it ends: the same three lines wherever the trial is introduced. */
export function TrialTermsCard({ positionName, fromTry = false, heading, variant = 'card', className }: TrialTermsCardProps) {
  const look = LOOKS[variant];
  const terms = [
    { icon: CalendarDays, text: `${INDIVIDUAL_TRIAL.days} ngày quyền gói Plus` },
    { icon: BookOpen, text: `Học trọn ${INDIVIDUAL_TRIAL.courseLimit} khóa đầu trong lộ trình` },
    { icon: ShieldCheck, text: 'Hết hạn: giữ hồ sơ và kết quả, chuyển về gói Miễn phí' },
  ];

  return (
    <section aria-label="Quyền lợi dùng thử" className={cn('rounded-2xl px-5 py-4', look.box, className)}>
      {heading && <p className={cn(GOLD_KICKER, 'mb-3')}>{heading}</p>}
      <ul className="grid gap-2.5">
        {terms.map(({ icon: Icon, text }) => (
          <li key={text} className={cn('flex items-start gap-3 text-sm leading-snug', look.text)}>
            <Icon className={cn('mt-0.5 size-4 shrink-0', look.icon)} aria-hidden="true" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      {positionName && (
        <p className={cn('mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium', look.chip)}>
          Vị trí: {positionName}
          {fromTry ? ' · từ bài thử' : ''}
        </p>
      )}
    </section>
  );
}
