import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BILLING_CYCLE_LABELS, formatVnd, getPlan, priceFor } from '@/lib/plans';
import type { PlanSelection } from '@/types/commerce';

interface PlanSummaryProps {
  selection: PlanSelection;
  /** Where "change plan" leads; omit to hide the link. */
  changeTo?: string;
  className?: string;
}

/** The plan, seats and amount a buyer is about to commit to. */
export function PlanSummary({ selection, changeTo, className }: PlanSummaryProps) {
  const plan = getPlan(selection.planCode);
  if (!plan) return null;
  const total = priceFor(plan, selection.seats, selection.cycle);

  return (
    <div className={cn('flex items-center justify-between gap-4 rounded-2xl bg-landing-panel px-5 py-4 ring-1 ring-cream/10', className)}>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.12em] text-stone-500">Gói đã chọn</p>
        <p className="mt-1 truncate font-medium">
          {plan.name}
          {plan.users && plan.audience === 'enterprise' ? ` · ${selection.seats} người dùng` : ''}
        </p>
        <p className="text-sm text-stone-400 tabular-nums">
          {total === null ? 'Liên hệ' : `${formatVnd(total)} / ${BILLING_CYCLE_LABELS[selection.cycle]}`}
        </p>
      </div>
      {changeTo && (
        <Link to={changeTo} className="shrink-0 text-sm text-cream underline underline-offset-4">
          Đổi gói
        </Link>
      )}
    </div>
  );
}
