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

/**
 * Bảng so sánh đối soát tính năng chuẩn B2B Enterprise theo phong cách Light Pearl.
 */
export function PlanComparison({ audience }: { audience: PlanAudience }) {
  const plans = plansFor(audience);
  const rows = COMPARED[audience];

  return (
    <section aria-labelledby="plan-comparison-title" className="mx-auto mt-20 max-w-5xl">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2
          id="plan-comparison-title"
          className="text-2xl font-bold tracking-tight text-slate-900"
        >
          Đối sánh tính năng chi tiết
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Minh bạch mọi quyền lợi và giới hạn để doanh nghiệp dễ dàng ra quyết định đầu tư.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white/95 shadow-sm">
        <table className="w-full min-w-[540px] border-collapse text-left text-sm">
          <caption className="sr-only">Tính năng có trong từng gói</caption>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-900">
              <th scope="col" className="px-6 py-4 font-semibold text-slate-700">
                Nhóm tính năng
              </th>
              {plans.map((plan) => (
                <th key={plan.code} scope="col" className="px-6 py-4 text-center font-bold text-slate-900">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((entitlement) => (
              <tr key={entitlement} className="hover:bg-slate-50/60 transition-colors">
                <th scope="row" className="px-6 py-4 font-medium text-slate-800">
                  {ENTITLEMENT_LABELS[entitlement]}
                </th>
                {plans.map((plan) => {
                  const included = plan.entitlements.includes(entitlement);
                  return (
                    <td key={plan.code} className="px-6 py-4 text-center">
                      {included ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 p-1 border border-emerald-200/60">
                          <Check className="size-4 stroke-[2.5]" aria-hidden="true" />
                          <span className="sr-only">Có</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center text-slate-300">
                          <Minus className="size-4 stroke-[2]" aria-hidden="true" />
                          <span className="sr-only">Không</span>
                        </span>
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
