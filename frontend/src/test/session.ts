import { useCurrentUser } from '../hooks/use-current-user';
import { findMockAccountByEmail } from '../services/mock/mock-accounts';
import type { SessionUser } from '../types/session';

/** Mock accounts (services/mock/mock-accounts.ts) per spec v2.1 §1.6 for tests that need a signed-in user. */
export const MOCK_EMAILS = {
  owner: 'owner@digitalent.ai',
  owner2: 'owner2@digitalent.ai',
  manager: 'manager@digitalent.ai',
  employee: 'employee@digitalent.ai',
  starterOwner: 'starter@digitalent.ai',
  expiredOwner: 'expired@digitalent.ai',
  personal: 'personal@digitalent.ai',
  /** Individual on day 5 of a 7-day trial (2 of 3 course slots used). */
  trial: 'trial@digitalent.ai',
  /** Individual whose trial ended three days ago (Free plan). */
  free: 'free@digitalent.ai',
  platform: 'platform@digitalent.ai',
  /** Legacy aliases for tests migrating to v2.1 */
  orgAdmin: 'owner@digitalent.ai',
  learningAdmin: 'owner@digitalent.ai',
  learner: 'employee@digitalent.ai',
} as const;

/** Signs in a mock account in the store and local storage, optionally overriding its fields. */
export function signInAsMock(email: string, overrides: Partial<SessionUser> = {}): SessionUser {
  const account = findMockAccountByEmail(email);
  if (!account) throw new Error(`Unknown mock account: ${email}`);
  const session = { ...account, ...overrides };
  localStorage.setItem('accessToken', `mock-token:${account.id}`);
  useCurrentUser.getState().setUser(session);
  return session;
}

export function signOut(): void {
  localStorage.clear();
  useCurrentUser.getState().clearUser();
}
