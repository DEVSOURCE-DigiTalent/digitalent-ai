import { Check, Minus } from 'lucide-react';
import { ENTITLEMENT_LABELS, ENTITLEMENTS, type Entitlement } from '@/lib/entitlements';
import { plansFor, type PlanAudience } from '@/lib/plans';
import { cn } from '@/lib/utils';

/** Entitlements worth comparing for each audience, in the order a buyer cares about them. */
const COMPARED: Record<PlanAudience, Entitlement[]> = {
  enterprise: [
    ENTITLEMENTS.PRACTICAL_TASKS,
    ENTITLEMENTS.INTERNAL_LEARNING,
    ENTITLEMENTS.ADVANCED_ANALYTICS,
    ENTITLEMENTS.BULK_IMPORT,
  ],
  individual: [ENTITLEMENTS.PERSONAL_LEARNING_PATH, ENTITLEMENTS.ADVANCED_ANALYTICS],
};

/** Feature-by-plan table under the plan cards. */
export function PlanComparison({ audience }: { audience: PlanAudience }) {
  const isIndividual = audience === 'individual';
  const plans = plansFor(audience);
  const rows = COMPARED[audience];

  return (
    <section aria-labelledby="plan-comparison-title" className="mx-auto mt-16 max-w-5xl">
      <h2
        id="plan-comparison-title"
        className={cn('text-xl font-normal tracking-[-0.02em]', isIndividual ? 'text-pt-fg' : 'text-cream')}
      >
        So sánh tính năng
      </h2>
      <div
        className={cn(
          'mt-5 overflow-x-auto rounded-2xl',
          isIndividual ? 'border border-pt-line bg-pt-panel' : 'ring-1 ring-amber-400/20 bg-landing-panel'
        )}
      >
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <caption className="sr-only">Tính năng có trong từng gói</caption>
          <thead>
            <tr className={cn(isIndividual ? 'bg-pt-panel text-pt-fg' : 'bg-landing-panel text-cream')}>
              <th scope="col" className={cn('px-5 py-4 font-normal', isIndividual ? 'text-pt-fg-3' : 'text-stone-400')}>
                Tính năng
              </th>
              {plans.map((plan) => (
                <th key={plan.code} scope="col" className="px-5 py-4 text-center font-medium">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((entitlement) => (
              <tr key={entitlement} className={cn(isIndividual ? 'border-t border-pt-line' : 'border-t border-white/10')}>
                <th scope="row" className={cn('px-5 py-3.5 font-normal', isIndividual ? 'text-pt-fg' : 'text-cream/85')}>
                  {ENTITLEMENT_LABELS[entitlement]}
                </th>
                {plans.map((plan) => {
                  const included = plan.entitlements.includes(entitlement);
                  return (
                    <td key={plan.code} className="px-5 py-3.5 text-center">
                      {included ? (
                        <Check
                          className={cn('mx-auto size-4', isIndividual ? 'text-pt-accent' : 'text-[#F5CA65]')}
                          aria-label="Có"
                        />
                      ) : (
                        <Minus
                          className={cn('mx-auto size-4', isIndividual ? 'text-pt-fg-3/50' : 'text-stone-500')}
                          aria-label="Không"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
