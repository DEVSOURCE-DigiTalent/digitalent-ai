import { getPlan, isPurchasableOnline, type PlanAudience } from '@/lib/plans';
import { planSelectionToQuery } from '@/lib/plan-query';
import { WORKSPACES, resolveWorkspace } from '@/lib/roles';
import { SALES_EMAIL } from './sales-contact';
import type { PlanSelection } from '@/types/commerce';
import type { SessionUser } from '@/types/session';

export type PlanChoiceResult =
  | { type: 'contact'; email: string }
  | { type: 'register'; path: string }
  | { type: 'checkout'; draftAction: 'update' | 'create'; path: string }
  | { type: 'subscription'; path: string; message: string }
  | { type: 'mismatch'; message: string };

/**
 * P7 & §4.3: Pure function resolving what happens when a visitor or user selects a plan:
 * - "Liên hệ" plan -> contact email
 * - Guest -> register with query params
 * - Logged in, onboardingStatus === 'payment' -> update draft -> checkout
 * - Logged in with subscription -> manage subscription path with message
 * - Wrong audience -> mismatch message
 */
export function resolvePlanChoice(
  user: SessionUser | null | undefined,
  selection: PlanSelection,
  currentAudience: PlanAudience,
): PlanChoiceResult {
  const plan = getPlan(selection.planCode);

  // 1. Plan "Liên hệ" (contact only)
  if (!plan || !isPurchasableOnline(plan) || plan.monthlyPrice === null) {
    return { type: 'contact', email: SALES_EMAIL };
  }

  // 2. Guest: navigate to register page with query
  if (!user) {
    const registerBase = currentAudience === 'enterprise' ? '/business/register' : '/individual/register';
    return {
      type: 'register',
      path: `${registerBase}?${planSelectionToQuery(selection)}`,
    };
  }

  // 3. Workspace audience mismatch
  const userWorkspace = user.workspace ?? resolveWorkspace(user);
  const isEnterpriseUser = userWorkspace === WORKSPACES.ENTERPRISE;
  const isPersonalUser = userWorkspace === WORKSPACES.PERSONAL;

  if (
    (currentAudience === 'enterprise' && isPersonalUser) ||
    (currentAudience === 'individual' && isEnterpriseUser)
  ) {
    return {
      type: 'mismatch',
      message: 'Tài khoản của bạn không thuộc đối tượng gói này.',
    };
  }

  // 4. Logged in, onboarding in progress (contract or payment)
  if (user.onboardingStatus === 'contract' || user.onboardingStatus === 'payment') {
    const nextPath = user.onboardingStatus === 'contract' && isEnterpriseUser ? '/enterprise/contract' : '/checkout';
    return {
      type: 'checkout',
      draftAction: 'update',
      path: nextPath,
    };
  }

  // 5. User already has active plan or completed setup
  const planName = user.subscription?.planName ?? (plan ? plan.name : '');
  const subscriptionPath = isEnterpriseUser ? '/enterprise/billing' : '/personal/billing';

  return {
    type: 'subscription',
    path: subscriptionPath,
    message: planName ? `Bạn đang dùng gói ${planName}.` : 'Bạn đang có gói dịch vụ hoạt động.',
  };
}
