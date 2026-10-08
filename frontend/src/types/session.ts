import type { Workspace } from '../lib/roles';

export interface OrganizationContext {
  id: string;
  name: string;
}

export type SubscriptionStatus = 'active' | 'trialing' | 'expired' | 'payment_required';

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
  /** ISO. Start of the current paid period (issue date of certificates that were waiting for an upgrade). */
  startedAt?: string;
  /** Only while `status` is 'trialing', or once the account has had a trial (dates are kept for history). */
  trialStartedAt?: string;
  trialEndsAt?: string;
  trialCourseLimit?: number;
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
  organizationId?: string;
  roles: string[];
  permissions: string[];
  /** Missing when the backend predates workspaces: derived from the roles. */
  workspace?: Workspace;
  organization?: OrganizationContext;
  /** Missing when the backend predates subscriptions: gating is skipped. */
  subscription?: SubscriptionContext;
  onboardingStatus?: OnboardingStatus;
  enterpriseTrialStatus?: 'trial_active' | 'trial_read_only' | 'converted';
  emailVerified?: boolean;
  contractSigned?: boolean;
}
