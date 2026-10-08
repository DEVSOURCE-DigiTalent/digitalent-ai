import { settleSubscription } from '../../../lib/personal-access';
import { WORKSPACES } from '../../../lib/roles';
import { entitlementKeys, getPlan } from '../../../lib/plans';
import type { SessionUser, SubscriptionContext } from '../../../types/session';
import { findMockAccountById } from '../mock-accounts';
import { permissionsForRoles } from '../mock-rbac';
import { findUserById, settleTrial, toSessionUser } from '../mock-store';
import { seatsInUse } from './members-logic';
import { getOrgData } from './org-store';
import type { OrgData } from './types';

/**
 * The signed-in account as `/auth/me` and the mock server see it: the static demo accounts or accounts
 * created by the sign-up flows, with the changes an administrator made afterwards (role, deactivation, plan).
 */

function renewalDate(cycle: 'month' | 'year'): string {
  const date = new Date();
  date.setMonth(date.getMonth() + (cycle === 'year' ? 12 : 1));
  return date.toISOString().slice(0, 10);
}

/** Plan of a seeded organization: the one in code, or the one an owner switched to. */
function subscriptionFor(base: SubscriptionContext | undefined, data: OrgData): SubscriptionContext | undefined {
  if (!base) return undefined;
  const change = data.subscriptionOverride;
  const plan = change ? getPlan(change.planCode) : undefined;
  const seatsUsed = seatsInUse(data);
  if (!change || !plan) return { ...base, seatsUsed };
  return {
    planCode: plan.code,
    planName: plan.name,
    status: change.status,
    entitlements: entitlementKeys(plan),
    seatLimit: plan.seatRange ? change.seats : undefined,
    seatsUsed,
    renewsAt: renewalDate(change.cycle),
  };
}

export type SessionLookup =
  | { session: SessionUser }
  | { error: 'UNKNOWN' | 'INACTIVE' };

export function lookupSession(userId: string | undefined): SessionLookup {
  if (!userId) return { error: 'UNKNOWN' };

  const seeded = findMockAccountById(userId);
  if (seeded) {
    const organizationId = seeded.organization?.id;
    if (!organizationId) {
      // A demo learner who has paid has an account in the database: its plan wins over the seed's.
      const stored = findUserById(userId);
      if (stored) settleTrial(stored);
      const subscription = settleSubscription(stored?.subscription ?? seeded.subscription, new Date());
      return { session: subscription === seeded.subscription ? seeded : { ...seeded, subscription } };
    }
    const data = getOrgData(organizationId);
    const override = data.memberOverrides[userId];
    if (override?.status === 'INACTIVE') return { error: 'INACTIVE' };
    const roles = override?.roles ?? seeded.roles;
    return {
      session: {
        ...seeded,
        organization: { id: organizationId, name: data.settings.name },
        roles,
        permissions: seeded.workspace === WORKSPACES.ENTERPRISE ? permissionsForRoles(roles) : seeded.permissions,
        subscription: subscriptionFor(seeded.subscription, data),
      },
    };
  }

  const registered = findUserById(userId);
  if (!registered) return { error: 'UNKNOWN' };
  if (registered.status === 'INACTIVE') return { error: 'INACTIVE' };
  return { session: toSessionUser(registered) };
}

export function composeSession(userId: string | undefined): SessionUser | undefined {
  const found = lookupSession(userId);
  return 'session' in found ? found.session : undefined;
}
