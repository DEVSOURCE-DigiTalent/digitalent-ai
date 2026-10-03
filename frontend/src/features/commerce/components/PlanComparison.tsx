import { Check, Minus } from 'lucide-react';
import { ENTITLEMENT_LABELS, ENTITLEMENTS, type Entitlement } from '@/lib/entitlements';
import { plansFor, type PlanAudience } from '@/lib/plans';

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
  const plans = plansFor(audience);
  const rows = COMPARED[audience];

  return (
    <section aria-labelledby="plan-comparison-title" className="mx-auto mt-16 max-w-5xl">
      <h2 id="plan-comparison-title" className="text-xl font-normal tracking-[-0.02em]">
        So sánh tính năng
      </h2>
      <div className="mt-5 overflow-x-auto rounded-2xl ring-1 ring-cream/10">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <caption className="sr-only">Tính năng có trong từng gói</caption>
          <thead>
            <tr className="bg-landing-panel text-cream">
              <th scope="col" className="px-5 py-4 font-normal text-stone-400">
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
              <tr key={entitlement} className="border-t border-cream/10">
                <th scope="row" className="px-5 py-3.5 font-normal text-cream/85">
                  {ENTITLEMENT_LABELS[entitlement]}
                </th>
                {plans.map((plan) => {
                  const included = plan.entitlements.includes(entitlement);
                  return (
                    <td key={plan.code} className="px-5 py-3.5 text-center">
                      {included ? (
                        <Check className="mx-auto size-4 text-cream-soft" aria-label="Có" />
                      ) : (
                        <Minus className="mx-auto size-4 text-stone-600" aria-label="Không" />
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
