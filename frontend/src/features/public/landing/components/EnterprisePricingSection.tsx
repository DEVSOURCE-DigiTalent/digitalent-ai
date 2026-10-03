import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { planSelectionToQuery } from '@/lib/plan-query';
import { clampSeats, formatVnd, plansFor, priceFor, type Plan } from '@/lib/plans';
import { SALES_EMAIL } from '../../../commerce/sales-contact';
import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { useAnimatedNumber } from '../hooks/use-animated-number';
import { useLandingMotion } from '../landing-motion';
import { SectionHeader } from './SectionHeader';

type PricingSection = Extract<LandingSectionConfig, { kind: 'pricing' }>;

const REGISTER_PATH = '/business/register';
const PRICING_PATH = '/business/pricing';
const DEFAULT_SEATS = 25;
const MIN_SEATS = 1;
const MAX_SEATS = 1000;

const toSeats = (value: string): number => {
  const parsed = Math.round(Number(value));
  return Number.isFinite(parsed) ? Math.min(MAX_SEATS, Math.max(MIN_SEATS, parsed)) : MIN_SEATS;
};

/**
 * Plans for a team, priced by one shared number of employees. Prices and seat limits come from the plan catalogue,
 * so they cannot drift from the pricing page. A plan that cannot hold that many seats says so instead of pricing it.
 */
export function EnterprisePricingSection({ section }: { section: PricingSection }) {
  const seatsId = useId();
  const [value, setValue] = useState(String(DEFAULT_SEATS));
  const seats = toSeats(value);
  const plans = plansFor(section.audience);

  return (
    <section id={SECTION_IDS.pricing} tabIndex={-1} aria-labelledby="lp-pricing-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-pricing-title" intro={section.intro} />

      <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-3">
        <label htmlFor={seatsId} className="text-sm text-cream/90">
          Số nhân viên
        </label>
        <div className="flex items-center gap-2">
          <StepButton label="Giảm 1 nhân viên" onClick={() => setValue(String(Math.max(MIN_SEATS, seats - 1)))}>
            <Minus className="size-4" aria-hidden="true" />
          </StepButton>
          <input
            id={seatsId}
            type="number"
            inputMode="numeric"
            min={MIN_SEATS}
            max={MAX_SEATS}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={() => setValue(String(seats))}
            className="w-28 rounded-xl border border-cream/20 bg-landing-card px-4 py-3 text-center text-lg text-cream tabular-nums outline-none transition-colors focus:border-cream/60"
          />
          <StepButton label="Tăng 1 nhân viên" onClick={() => setValue(String(Math.min(MAX_SEATS, seats + 1)))}>
            <Plus className="size-4" aria-hidden="true" />
          </StepButton>
        </div>
        <p className="text-center text-xs leading-[1.6] text-stone-500">
          Mỗi nhân viên đang hoạt động chiếm một ghế, và lời mời chưa kích hoạt vẫn chiếm ghế.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-3 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanPanel key={plan.code} plan={plan} seats={seats} />
        ))}
      </div>

      <p className="mt-8 text-center text-sm">
        <Link to={PRICING_PATH} className="text-cream/80 underline underline-offset-4 transition-colors hover:text-cream">
          {section.compareLabel}
        </Link>
      </p>
    </section>
  );
}

function StepButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-full border border-cream/25 text-cream transition-colors hover:border-cream/60"
    >
      {children}
    </button>
  );
}

function PlanPanel({ plan, seats }: { plan: Plan; seats: number }) {
  const { reduced } = useLandingMotion();
  const range = plan.seatRange;
  const contactOnly = plan.monthlyPrice === null;
  const overLimit = Boolean(range && seats > range.max);
  const billedSeats = clampSeats(plan, seats);
  const total = !contactOnly && !overLimit ? (priceFor(plan, billedSeats, 'month') ?? 0) : 0;
  const shownTotal = useAnimatedNumber(total, reduced);
  const choose = `${REGISTER_PATH}?${planSelectionToQuery({ planCode: plan.code, seats: billedSeats, cycle: 'month' })}`;

  return (
    <article
      aria-label={`Gói ${plan.name}`}
      data-featured={plan.recommended || undefined}
      className={cn(
        'flex flex-col rounded-[20px] p-7 ring-1',
        plan.recommended ? 'bg-landing-card ring-2 ring-cream/70 md:-my-4 md:p-9' : 'bg-landing-panel ring-cream/10',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-medium tracking-[-0.02em]">{plan.name}</h3>
        {plan.recommended && <span className="rounded-full bg-cream-soft px-3 py-1 text-[11px] font-medium text-black">Nên chọn</span>}
      </div>
      <p className="mt-2 min-h-[2.8em] text-base leading-[1.5] text-stone-400">{plan.tagline}</p>

      <div className="mt-6 min-h-[5.5rem]">
        {contactOnly && <p className="text-3xl font-light tracking-[-0.03em]">Liên hệ</p>}
        {!contactOnly && overLimit && range && (
          <p className="text-sm leading-[1.6] text-stone-400">
            {plan.name} hỗ trợ tối đa {range.max} ghế. Với {seats} nhân viên, hãy chọn gói khác.
          </p>
        )}
        {!contactOnly && !overLimit && (
          <>
            <p className="text-4xl font-light tracking-[-0.03em] tabular-nums">
              {formatVnd(shownTotal)}
              <span className="ml-1 text-sm text-stone-400">/ tháng</span>
            </p>
            <p className="mt-1 text-xs text-stone-500 tabular-nums">
              {formatVnd(plan.monthlyPrice ?? 0)} × {billedSeats} ghế
              {range && seats < range.min ? ` · tối thiểu ${range.min} ghế` : ''}
            </p>
          </>
        )}
      </div>

      <ul className="mt-6 grid flex-1 content-start gap-2.5 text-base text-cream/90">
        {plan.highlights.map((point) => (
          <li key={point} className="grid grid-cols-[16px_minmax(0,1fr)] gap-2.5 leading-[1.45]">
            <Check className="mt-[3px] size-3.5 text-cream-soft" strokeWidth={2.5} aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>

      {contactOnly && (
        <a
          href={`mailto:${SALES_EMAIL}?subject=${encodeURIComponent('Tư vấn gói Enterprise')}`}
          className="mt-8 inline-flex items-center justify-center rounded-full border border-cream/30 px-6 py-3 text-sm text-cream transition-colors hover:border-cream/70"
        >
          Liên hệ tư vấn
        </a>
      )}
      {!contactOnly && !overLimit && (
        <Link
          to={choose}
          className={cn(
            'group mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90',
            plan.recommended ? 'bg-cream-soft text-black' : 'border border-cream/30 text-cream',
          )}
        >
          Chọn gói {plan.name}
          <ArrowRight className="size-4 transition-transform duration-300 ease-cinematic motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}
