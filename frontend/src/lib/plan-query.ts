import { clampSeats, getPlan, isPurchasableOnline, type BillingCycle, type PlanAudience } from './plans';
import type { PlanSelection } from '../types/commerce';

/** Query string that carries a plan choice from the pricing page through sign-up to checkout. */
export function planSelectionToQuery(selection: PlanSelection): string {
  const params = new URLSearchParams({
    plan: selection.planCode,
    seats: String(selection.seats),
    cycle: selection.cycle,
  });
  return params.toString();
}

/**
 * Reads a plan choice from a query string. Anything that does not describe a sellable plan of the
 * expected audience is ignored (the page then asks for a plan), so a hand-edited URL cannot pick one.
 */
export function parsePlanSelection(params: URLSearchParams, audience: PlanAudience): PlanSelection | undefined {
  const plan = getPlan(params.get('plan'));
  if (!plan || plan.audience !== audience || !isPurchasableOnline(plan)) return undefined;
  const cycle: BillingCycle = params.get('cycle') === 'year' ? 'year' : 'month';
  return { planCode: plan.code, seats: clampSeats(plan, Number(params.get('seats'))), cycle };
}
