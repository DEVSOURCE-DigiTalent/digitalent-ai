import type { Workspace } from '../lib/roles';

export interface OrganizationContext {
  id: string;
  name: string;
}

export type SubscriptionStatus = 'active' | 'expired' | 'payment_required';

export interface SubscriptionContext {
  planCode: string;
  planName: string;
  status: SubscriptionStatus;
  /** Entitlement keys the plan includes (see lib/entitlements.ts). */
  entitlements: string[];
  seatLimit?: number;
  seatsUsed?: number;
  /** ISO date of the next renewal or the expiry date. */
  renewsAt?: string;
}

/**
 * What a new account still has to do before it is usable:
 * - 'payment': pay for the chosen plan
 * - 'contract': sign enterprise e-contract (enterprise only)
 * - 'setup': complete setup wizard (enterprise) or target position (individual)
 * Absent once done, and for every account that predates it.
 */
export type OnboardingStatus = 'payment' | 'contract' | 'setup';

/** Session returned by `/auth/me`. */
export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  employeeId?: string;
  roles: string[];
  permissions: string[];
  /** Missing when the backend predates workspaces: derived from the roles. */
  workspace?: Workspace;
  organization?: OrganizationContext;
  /** Missing when the backend predates subscriptions: gating is skipped. */
  subscription?: SubscriptionContext;
  onboardingStatus?: OnboardingStatus;
  emailVerified?: boolean;
  contractSigned?: boolean;
}
