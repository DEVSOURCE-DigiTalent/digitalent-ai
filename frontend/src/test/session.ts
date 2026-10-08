import { useCurrentUser } from '../hooks/use-current-user';
import { findMockAccountByEmail } from '../services/mock/mock-accounts';
import type { SessionUser } from '../types/session';

/** Mock accounts (services/mock/mock-accounts.ts) per spec v2.1 §1.6 for tests that need a signed-in user. */
export const MOCK_EMAILS = {
  owner: 'owner@digitalent.demo',
  owner2: 'owner2@digitalent.demo',
  manager: 'manager@digitalent.demo',
  employee: 'employee@digitalent.demo',
  starterOwner: 'starter@digitalent.demo',
  expiredOwner: 'expired@digitalent.demo',
  personal: 'personal@digitalent.demo',
  /** Individual on day 5 of a 7-day trial (2 of 3 course slots used). */
  trial: 'trial@digitalent.demo',
  /** Individual whose trial ended three days ago (Free plan). */
  free: 'free@digitalent.demo',
  platform: 'platform@digitalent.demo',
  /** Legacy aliases for tests migrating to v2.1 */
  orgAdmin: 'owner@digitalent.demo',
  learningAdmin: 'owner@digitalent.demo',
  learner: 'employee@digitalent.demo',
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
