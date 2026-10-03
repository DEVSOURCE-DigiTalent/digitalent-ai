import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { planSelectionToQuery } from '@/lib/plan-query';
import { YEARLY_PRICE_FACTOR, formatVnd, plansFor, priceFor, type Plan } from '@/lib/plans';
import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { SectionHeader } from './SectionHeader';

type PricingSection = Extract<LandingSectionConfig, { kind: 'pricing' }>;

const REGISTER_PATH = '/individual/register';
const PRICING_PATH = '/individual/pricing';
const YEARLY_DISCOUNT_PERCENT = Math.round((1 - YEARLY_PRICE_FACTOR) * 100);

/** Preview of the paid plans, read from the plan catalogue so prices never drift from the pricing page. */
export function PricingPreviewSection({ section }: { section: PricingSection }) {
  const plans = plansFor(section.audience).filter((plan) => plan.monthlyPrice !== null);

  return (
    <section id={SECTION_IDS.pricing} tabIndex={-1} aria-labelledby="lp-pricing-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-pricing-title" intro={section.intro} />

      <div className="mx-auto mt-14 grid max-w-5xl gap-3 md:grid-cols-2">
        {plans.map((plan) => (
          <PlanPanel key={plan.code} plan={plan} />
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

function PlanPanel({ plan }: { plan: Plan }) {
  const monthly = priceFor(plan, 1, 'month');
  const yearly = priceFor(plan, 1, 'year');
  const choose = `${REGISTER_PATH}?${planSelectionToQuery({ planCode: plan.code, seats: 1, cycle: 'month' })}`;

  return (
    <article
      aria-label={`Gói ${plan.name}`}
      className={cn('flex flex-col rounded-[20px] bg-landing-panel p-7 ring-1 md:p-8', plan.recommended ? 'ring-cream/50' : 'ring-cream/10')}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-medium tracking-[-0.02em]">{plan.name}</h3>
        {plan.recommended && <span className="rounded-full bg-cream-soft px-3 py-1 text-[11px] font-medium text-black">Nên chọn</span>}
      </div>
      <p className="mt-2 min-h-[2.8em] text-sm leading-[1.5] text-stone-400">{plan.tagline}</p>

      <p className="mt-6 text-4xl font-light tracking-[-0.03em] tabular-nums">
        {monthly !== null && formatVnd(monthly)}
        <span className="ml-1 text-sm text-stone-400">/ tháng</span>
      </p>
      {yearly !== null && (
        <p className="mt-1 text-xs text-stone-500 tabular-nums">
          Mua theo năm: {formatVnd(yearly)} / năm, tiết kiệm {YEARLY_DISCOUNT_PERCENT}%
        </p>
      )}

      <ul className="mt-6 grid flex-1 content-start gap-2.5 text-sm text-cream/85">
        {plan.highlights.map((point) => (
          <li key={point} className="grid grid-cols-[16px_minmax(0,1fr)] gap-2.5 leading-[1.45]">
            <Check className="mt-[3px] size-3.5 text-cream-soft" strokeWidth={2.5} aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>

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
    </article>
  );
}
