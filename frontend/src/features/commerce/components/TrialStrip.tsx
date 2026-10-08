import { Link } from 'react-router-dom';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';
import { GOLD_OUTLINE_BUTTON } from '../../experience/individual-trial/trial-style';

interface TrialStripProps {
  /** Reference position carried from the quick try, when there is a valid one. */
  position?: string;
}

/**
 * Under the individual plans, for visitors who are not signed in: the way into the reverse trial for someone who
 * does not want to pick a plan yet (spec §8.2).
 */
export function TrialStrip({ position }: TrialStripProps) {
  const query = new URLSearchParams({ trial: '1', source: 'pricing', ...(position ? { position } : {}) });

  return (
    <aside
      aria-label="Dùng thử"
      className="mx-auto mt-8 flex max-w-5xl flex-col items-start justify-between gap-4 rounded-2xl border border-pt-line bg-pt-card px-6 py-5 sm:flex-row sm:items-center"
    >
      <p className="text-sm leading-relaxed text-pt-fg-2">
        Chưa chắc chọn gói nào? <strong className="font-semibold text-pt-fg">Dùng thử Plus {INDIVIDUAL_TRIAL.days} ngày</strong>, không cần thẻ.
      </p>
      <Link to={`/individual/register?${query.toString()}`} className={GOLD_OUTLINE_BUTTON}>
        Dùng thử {INDIVIDUAL_TRIAL.days} ngày
      </Link>
    </aside>
  );
}
