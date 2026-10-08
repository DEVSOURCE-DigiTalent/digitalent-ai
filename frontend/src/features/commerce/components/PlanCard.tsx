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

  const isIndividual = plan.audience === 'individual';

  return (
    <article
      aria-label={`Gói ${plan.name}`}
      className={cn(
        'flex h-full flex-col rounded-3xl p-7 transition-all',
        isIndividual
          ? cn(
              'border bg-pt-panel text-pt-fg transition-all duration-300',
              isSuggested
                ? 'border-amber-400/50 shadow-xl shadow-amber-500/15 ring-2 ring-[#E5A93C]'
                : plan.recommended
                  ? 'border-amber-400/40 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/50'
                  : 'border-pt-line hover:border-amber-400/30'
            )
          : cn(
              'bg-landing-panel text-cream transition-all duration-300',
              isSuggested
                ? 'ring-2 ring-[#E5A93C] shadow-xl shadow-amber-500/15'
                : plan.recommended
                  ? 'ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/10'
                  : 'ring-1 ring-white/10 hover:ring-amber-400/30'
            )
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
            <span className="rounded-full px-3 py-1 text-[11px] font-semibold bg-gradient-to-r from-[#F5CA65] to-[#D4982F] text-[#0C0E12] shadow-sm shadow-amber-500/20">
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
      <ul className={cn('mt-6 grid flex-1 content-start gap-2.5 text-sm', isIndividual ? 'text-pt-fg-2' : 'text-cream/85')}>
        {plan.highlights.map((point) => (
          <li key={point} className="grid grid-cols-[16px_minmax(0,1fr)] gap-2.5 leading-[1.45]">
            <Check className={cn('mt-[3px] size-3.5', isIndividual ? 'text-pt-accent' : 'text-[#F5CA65]')} strokeWidth={2.5} aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {!isOnline ? (
        <a
          href={`mailto:${salesEmail}?subject=${encodeURIComponent('Tư vấn gói Enterprise')}`}
          className="mt-8 inline-flex items-center justify-center rounded-full border border-amber-400/40 px-6 py-3 text-sm font-medium text-cream transition-all hover:border-amber-400/80 hover:bg-amber-400/5"
        >
          Liên hệ tư vấn
        </a>
      ) : (
        <button
          type="button"
          onClick={() => onChoose({ planCode: plan.code, seats: effectiveSeats, cycle })}
          className={cn(
            'mt-8 rounded-full px-6 py-3 text-sm font-medium transition-all',
            plan.recommended || isSuggested
              ? 'bg-gradient-to-r from-[#F5CA65] to-[#D4982F] text-[#0C0E12] font-semibold shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-[0.99]'
              : isIndividual
                ? 'border border-amber-400/30 text-pt-fg hover:border-amber-400/60 hover:bg-amber-400/5'
                : 'border border-amber-400/30 text-cream hover:border-amber-400/60 hover:bg-amber-400/5',
          )}
        >
          Chọn gói {plan.name}
        </button>
      )}
    </article>
  );
}
