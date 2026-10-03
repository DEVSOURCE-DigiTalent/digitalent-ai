import { useId, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BILLING_CYCLE_LABELS,
  clampSeats,
  formatVnd,
  priceFor,
  type BillingCycle,
  type Plan,
} from '@/lib/plans';
import type { PlanSelection } from '@/types/commerce';
import { DARK_INPUT_CLASS } from '../../public/components/FormControls';

interface PlanCardProps {
  plan: Plan;
  cycle: BillingCycle;
  onChoose: (selection: PlanSelection) => void;
  salesEmail: string;
  isSuggested?: boolean;
}

/**
 * One plan card on the pricing page.
 * Uses bundle capacity architecture: includes baseline quota with smooth add-on capacity.
 */
export function PlanCard({ plan, cycle, onChoose, salesEmail, isSuggested }: PlanCardProps) {
  const seatsId = useId();
  const defaultUsers = plan.users?.included ?? 1;
  const [seats, setSeats] = useState(defaultUsers);
  const effectiveSeats = clampSeats(plan, seats);
  const total = priceFor(plan, effectiveSeats, cycle);

  const isEnterprise = plan.audience === 'enterprise';
  const hasAddon = Boolean(plan.users?.addonAllowed && plan.users.max > plan.users.included);
  const isOnline = plan.billing.monthlyPrice !== null;

  return (
    <article
      aria-label={`Gói ${plan.name}`}
      className={cn(
        'flex h-full flex-col rounded-3xl bg-landing-panel p-7 ring-1 transition-all',
        isSuggested
          ? 'ring-2 ring-cream shadow-lg shadow-cream/10'
          : plan.recommended
            ? 'ring-cream/50'
            : 'ring-cream/10',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-medium tracking-[-0.02em]">{plan.name}</h2>
        <div className="flex items-center gap-2">
          {isSuggested && (
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/40">
              Đề xuất cho bạn
            </span>
          )}
          {plan.recommended && !isSuggested && (
            <span className="rounded-full bg-cream-soft px-3 py-1 text-[11px] font-medium text-black">
              Nên chọn
            </span>
          )}
        </div>
      </div>

      <p className="mt-2 min-h-[2.8em] text-sm leading-[1.5] text-stone-400">{plan.tagline}</p>

      {/* Pricing block */}
      <div className="mt-6">
        {!isOnline ? (
          <div>
            <p className="text-3xl font-light tracking-[-0.03em]">Liên hệ</p>
            <p className="mt-1 text-xs text-stone-400">
              Quy mô lớn &amp; tích hợp hệ thống theo yêu cầu
            </p>
          </div>
        ) : (
          <div>
            {cycle === 'year' ? (
              <>
                <p className="text-3xl font-light tracking-[-0.03em] tabular-nums">
                  {formatVnd(plan.billing.annualPrice ?? 0)}
                  <span className="ml-1 text-sm text-stone-400">/ năm</span>
                </p>
                <p className="mt-1 text-xs text-stone-400 tabular-nums">
                  ≈ {formatVnd(Math.round((plan.billing.annualPrice ?? 0) / 12))} / tháng · Tiết kiệm 20%
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl font-light tracking-[-0.03em] tabular-nums">
                  {formatVnd(plan.billing.monthlyPrice ?? 0)}
                  <span className="ml-1 text-sm text-stone-400">/ tháng</span>
                </p>
                <p className="mt-1 text-xs text-stone-400">Thanh toán định kỳ hàng tháng</p>
              </>
            )}

            {/* Total calculation with add-on summary */}
            {total !== null && (
              <p className="mt-2 text-xs font-medium text-stone-300 tabular-nums">
                {effectiveSeats > defaultUsers
                  ? `Tổng ${formatVnd(total)} / ${BILLING_CYCLE_LABELS[cycle]} cho ${effectiveSeats} người dùng`
                  : `Trọn gói ${formatVnd(total)} / ${BILLING_CYCLE_LABELS[cycle]} cho tối đa ${defaultUsers} người dùng`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Smooth Add-on / Capacity Selector (B2B online plans) */}
      {isEnterprise && isOnline && hasAddon && plan.users && (
        <div className="mt-5 rounded-2xl bg-landing-card/60 p-4 ring-1 ring-cream/10 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor={seatsId} className="text-xs text-cream/90 font-medium">
              Số người dùng ({plan.users.included}–{plan.users.max})
            </label>
            <span className="text-[11px] text-stone-400">
              Bao gồm sẵn {plan.users.included}
            </span>
          </div>
          <input
            id={seatsId}
            type="number"
            inputMode="numeric"
            min={plan.users.included}
            max={plan.users.max}
            value={seats}
            onChange={(event) => setSeats(Number(event.target.value))}
            onBlur={() => setSeats(effectiveSeats)}
            className={DARK_INPUT_CLASS}
          />
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Thêm người dùng: +
            {formatVnd(
              cycle === 'year'
                ? (plan.users.annualAddonPrice ?? 0)
                : (plan.users.monthlyAddonPrice ?? 0),
            )}{' '}
            / người / {BILLING_CYCLE_LABELS[cycle]}
          </p>
        </div>
      )}

      {/* Highlight features */}
      <ul className="mt-6 grid flex-1 content-start gap-2.5 text-sm text-cream/85">
        {plan.highlights.map((point) => (
          <li key={point} className="grid grid-cols-[16px_minmax(0,1fr)] gap-2.5 leading-[1.45]">
            <Check className="mt-[3px] size-3.5 text-cream-soft" strokeWidth={2.5} aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {!isOnline ? (
        <a
          href={`mailto:${salesEmail}?subject=${encodeURIComponent('Tư vấn gói Enterprise')}`}
          className="mt-8 inline-flex items-center justify-center rounded-full border border-cream/30 px-6 py-3 text-sm text-cream transition-colors hover:border-cream/70"
        >
          Liên hệ tư vấn
        </a>
      ) : (
        <button
          type="button"
          onClick={() => onChoose({ planCode: plan.code, seats: effectiveSeats, cycle })}
          className={cn(
            'mt-8 rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90',
            plan.recommended || isSuggested
              ? 'bg-cream-soft text-black'
              : 'border border-cream/30 text-cream',
          )}
        >
          Chọn gói {plan.name}
        </button>
      )}
    </article>
  );
}
