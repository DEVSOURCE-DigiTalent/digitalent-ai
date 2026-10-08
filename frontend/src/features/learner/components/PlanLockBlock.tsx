import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import type { AccessMode } from '@/lib/personal-access';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';
import { Card, PT_BUTTON_SECONDARY } from './ui';
import { UpgradeLink, type UpgradePlacement } from './UpgradeLink';

interface PlanLockBlockProps {
  mode: Exclude<AccessMode, 'full'>;
  /** Trial slots the plan gave; the sentence for a trial names them. */
  courseLimit: number | null;
  placement: UpgradePlacement;
  className?: string;
}

/**
 * Stands where the learning buttons of a course would be when the plan does not open it: a trial with every slot
 * used, or the Free plan (spec §8.9). It says why and offers the way on; the page around it stays readable.
 */
export function PlanLockBlock({ mode, courseLimit, placement, className }: PlanLockBlockProps) {
  return (
    <Card className={className} role="note">
      <div className="flex flex-col gap-4 p-5">
        <p className="flex items-start gap-2.5 text-sm text-pt-fg">
          <Lock className="mt-0.5 size-4 shrink-0 text-pt-fg-3" aria-hidden="true" />
          {mode === 'trial'
            ? `Bạn đã dùng hết ${courseLimit ?? INDIVIDUAL_TRIAL.courseLimit} lượt học thử.`
            : 'Gói Miễn phí không mở khóa mới.'}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <UpgradeLink placement={placement}>Nâng cấp Plus</UpgradeLink>
          {mode === 'trial' && <Link to="/personal/path" className={PT_BUTTON_SECONDARY}>Xem các khóa đang học thử</Link>}
        </div>
      </div>
    </Card>
  );
}
