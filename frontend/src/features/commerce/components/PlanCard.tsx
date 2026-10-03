import { useId, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BILLING_CYCLE_LABELS, YEARLY_PRICE_FACTOR, clampSeats, formatVnd, priceFor, type BillingCycle, type Plan,
} from '@/lib/plans';
import type { PlanSelection } from '@/types/commerce';
import { DARK_INPUT_CLASS } from '../../public/components/FormControls';

interface PlanCardProps {
  plan: Plan;
  cycle: BillingCycle;
  onChoose: (selection: PlanSelection) => void;
  salesEmail: string;
}

/** One plan on the pricing page. Seat-based plans let the buyer set the number of seats and see the total. */
export function PlanCard({ plan, cycle, onChoose, salesEmail }: PlanCardProps) {
  const seatsId = useId();
  const [seats, setSeats] = useState(plan.seatRange?.min ?? 1);
  const effectiveSeats = clampSeats(plan, seats);
  const total = priceFor(plan, effectiveSeats, cycle);

  return (
    <article
      aria-label={`Gói ${plan.name}`}
      className={cn(
        'flex h-full flex-col rounded-3xl bg-landing-panel p-7 ring-1',
        plan.recommended ? 'ring-cream/50' : 'ring-cream/10',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-medium tracking-[-0.02em]">{plan.name}</h2>
        {plan.recommended && (
          <span className="rounded-full bg-cream-soft px-3 py-1 text-[11px] font-medium text-black">Nên chọn</span>
        )}
      </div>
      <p className="mt-2 min-h-[2.8em] text-sm leading-[1.5] text-stone-400">{plan.tagline}</p>

      <div className="mt-6">
        {plan.monthlyPrice === null ? (
          <p className="text-3xl font-light tracking-[-0.03em]">Liên hệ</p>
        ) : (
          <>
            <p className="text-3xl font-light tracking-[-0.03em] tabular-nums">
              {formatVnd(cycle === 'year' ? Math.round((plan.monthlyPrice ?? 0) * YEARLY_PRICE_FACTOR) : (plan.monthlyPrice ?? 0))}
              <span className="ml-1 text-sm text-stone-400">
                {plan.seatRange ? '/ ghế / tháng' : '/ tháng'}
              </span>
            </p>
            {total !== null && (
              <p className="mt-1 text-xs text-stone-500 tabular-nums">
                Tổng {formatVnd(total)} / {BILLING_CYCLE_LABELS[cycle]}
                {plan.seatRange ? ` cho ${effectiveSeats} ghế` : ''}
              </p>
            )}
          </>
        )}
      </div>

      {plan.seatRange && plan.monthlyPrice !== null && (
        <div className="mt-5 grid gap-1.5">
          <label htmlFor={seatsId} className="text-xs text-cream/80">
            Số ghế ({plan.seatRange.min}–{plan.seatRange.max})
          </label>
          <input
            id={seatsId}
            type="number"
            inputMode="numeric"
            min={plan.seatRange.min}
            max={plan.seatRange.max}
            value={seats}
            onChange={(event) => setSeats(Number(event.target.value))}
            onBlur={() => setSeats(effectiveSeats)}
            className={DARK_INPUT_CLASS}
          />
        </div>
      )}

      <ul className="mt-6 grid flex-1 content-start gap-2.5 text-sm text-cream/85">
        {plan.highlights.map((point) => (
          <li key={point} className="grid grid-cols-[16px_minmax(0,1fr)] gap-2.5 leading-[1.45]">
            <Check className="mt-[3px] size-3.5 text-cream-soft" strokeWidth={2.5} aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>

      {plan.monthlyPrice === null ? (
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
            plan.recommended ? 'bg-cream-soft text-black' : 'border border-cream/30 text-cream',
          )}
        >
          Chọn gói {plan.name}
        </button>
      )}
    </article>
  );
}
