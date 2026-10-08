import { WORKSPACES, type Workspace } from '../../lib/roles';
import type { BillingCycle } from '../../lib/plans';
import { freeSubscription, isTrialExpired } from '../../lib/personal-access';
import type { OnboardingStatus, SessionUser, SubscriptionContext } from '../../types/session';
import { MOCK_PASSWORD, findMockAccountById } from './mock-accounts';
import { PERSONAL_PERMISSIONS, permissionsForRoles } from './mock-rbac';

/**
 * In-browser "database" for the mock layer: accounts created by the sign-up flows, organizations,
 * orders and invitations. Kept in localStorage so a flow survives reloads. Mock only: passwords are
 * stored in plain text and nothing here may reach a production bundle.
 */

export interface StoredUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  jobTitle?: string;
  workspace: Workspace;
  roles: string[];
  organizationId?: string;
  /** Absent means active. A deactivated member keeps their history but cannot sign in. */
  status?: 'ACTIVE' | 'INACTIVE';
  deactivatedReason?: string;
  emailVerified: boolean;
  verifyToken: string;
  /** Plan picked on the pricing page, waiting to be paid for. */
  pendingPlan?: { planCode: string; seats: number; cycle: BillingCycle };
  /** Paid plan. For members of an organization the owner's subscription applies. */
  subscription?: SubscriptionContext;
  /** Mock-only projection used by the Enterprise shell to render the guided trial experience. */
  enterpriseTrialStatus?: SessionUser['enterpriseTrialStatus'];
  /** When the account first started a trial. Never cleared: one trial per email (BR-01). */
  trialUsedAt?: string;
  onboardingStatus?: OnboardingStatus;
  setupStep?: number;
  contractSigned?: boolean;
  pendingOrganization?: { name: string; taxCode?: string; address?: string };
}

export interface StoredDepartment {
  id: string;
  name: string;
}

export interface StoredPosition {
  id: string;
  code: string;
  name: string;
  isCustom: boolean;
  departmentName?: string;
  jobGrade?: string;
}

export interface StoredGrade {
  code: string;
  name: string;
  description: string;
}

export interface StoredOrganization {
  id: string;
  name: string;
  industry: string;
  size: string;
  logoUrl?: string;
  timezone?: string;
  taxCode?: string;
  address?: string;
  ownerId: string;
  departments: StoredDepartment[];
  positions: StoredPosition[];
  grades?: StoredGrade[];
  setupCompleted: boolean;
  setupStep?: number;
}

export type DraftStatus = 'DRAFT' | 'PAYMENT_PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export interface StoredPurchaseDraft {
  id: string;            // "pd_xxxxxxxx"
  userId: string | null; // null before register or bound to user
  audience: 'enterprise' | 'individual';
  planCode: string;
  seats: number;         // clampSeats
  cycle: BillingCycle;
  amount: number;        // priceFor(plan, seats, cycle)
  currency: 'VND';
  status: DraftStatus;
  createdAt: string;
  expiresAt: string;     // +7 days
  companyInfo?: {
    organizationName: string;
    taxCode: string;
    address?: string;
    signerName?: string;
    signerTitle?: string;
  };
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';

export interface StoredOrder {
  id: string;
  /** Transfer reference printed in the QR code. */
  code: string;
  userId: string;
  draftId?: string;
  planCode: string;
  seats: number;
  cycle: BillingCycle;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
}

export interface EContract {
  id: string;
  contractNumber: string;
  orderId: string;
  draftId?: string;
  userId: string;
  organizationName: string;
  taxCode: string;
  address?: string;
  signerName: string;
  signerTitle: string;
  signatureData?: string;
  signMethod: 'draw' | 'otp' | 'email_otp';
  signedAt: string;
  status: 'signed';
  planCode: string;
  seats: number;
  cycle: BillingCycle;
  amount: number;
}

export interface StoredInvitation {
  token: string;
  organizationId: string;
  email: string;
  fullName: string;
  departmentName?: string;
  positionName?: string;
  role: string;
  status: 'pending' | 'accepted';
  createdAt: string;
}

export interface StoredResetToken {
  token: string;
  email: string;
  expiresAt: string;
}

export interface MockDb {
  users: StoredUser[];
  organizations: StoredOrganization[];
  orders: StoredOrder[];
  invitations: StoredInvitation[];
  resetTokens: StoredResetToken[];
  purchaseDrafts: StoredPurchaseDraft[];
  contracts: EContract[];
}

const STORAGE_KEY = 'dt-mock-db-v3';

const emptyDb = (): MockDb => ({
  users: [],
  organizations: [],
  orders: [],
  invitations: [],
  resetTokens: [],
  purchaseDrafts: [],
  contracts: [],
});

let cache: MockDb | null = null;

function read(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDb();
    const parsed = JSON.parse(raw) as Partial<MockDb>;
    return {
      ...emptyDb(),
      ...parsed,
      purchaseDrafts: parsed.purchaseDrafts ?? [],
      contracts: parsed.contracts ?? [],
    };
  } catch {
    return emptyDb();
  }
}

export function getDb(): MockDb {
  cache ??= read();
  return cache;
}

/** Applies a change and persists it. The update receives the live database and may mutate it. */
export function updateDb<T>(update: (db: MockDb) => T): T {
  const db = getDb();
  const result = update(db);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage full or blocked: the flow still works for this page load.
  }
  return result;
}

const resetListeners: Array<() => void> = [];

/** Lets other mock stores (organization data) start over together with the database. */
export function onMockReset(listener: () => void): void {
  resetListeners.push(listener);
}

export function resetMockDb(): void {
  cache = null;
  resetListeners.forEach((listener) => listener());
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function newToken(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const normalized = email.trim().toLowerCase();
  return getDb().users.find((user) => user.email === normalized);
}

export function findUserById(id: string): StoredUser | undefined {
  return getDb().users.find((user) => user.id === id);
}

/** The subscription that applies to a user: their own, or their organization owner's. */
export function subscriptionOf(user: StoredUser): SubscriptionContext | undefined {
  if (!user.organizationId) return user.subscription;
  const organization = getDb().organizations.find((org) => org.id === user.organizationId);
  const owner = organization ? findUserById(organization.ownerId) : undefined;
  return owner?.subscription;
}

/**
 * The demo learners (trial@, free@, personal@) are static seeds; a payment needs an account in the database to change.
 * This copies the seed in the first time it is needed and returns it; registered accounts are returned as they are.
 */
export function ensureStoredPersonal(userId: string): StoredUser | undefined {
  const existing = findUserById(userId);
  if (existing) return existing;
  const seed = findMockAccountById(userId);
  if (!seed || seed.workspace !== WORKSPACES.PERSONAL) return undefined;
  const stored: StoredUser = {
    id: seed.id,
    email: seed.email,
    password: MOCK_PASSWORD,
    fullName: seed.fullName,
    workspace: WORKSPACES.PERSONAL,
    roles: [],
    emailVerified: true,
    verifyToken: '',
    subscription: seed.subscription,
  };
  updateDb((db) => {
    db.users.push(stored);
  });
  return findUserById(userId);
}

/**
 * Lazy trial expiry: a trial that has ended becomes the Free plan the next time the account is read, and the change
 * is saved (only when there is one, so repeated reads write nothing). The backend adds a daily job as the main path.
 */
export function settleTrial(user: StoredUser, now: Date = new Date()): void {
  // Enterprise guided trials keep their organization history in read-only mode.
  // Only the personal reverse trial falls back to IND_FREE.
  if (user.workspace !== WORKSPACES.PERSONAL) return;
  if (!isTrialExpired(user.subscription, now)) return;
  updateDb((db) => {
    const stored = db.users.find((candidate) => candidate.id === user.id);
    if (stored) stored.subscription = freeSubscription(stored.subscription);
  });
}

/** Seats taken in an organization: active members plus invitations still waiting. */
export function seatsUsed(organizationId: string): number {
  const db = getDb();
  const members = db.users.filter((user) => user.organizationId === organizationId).length;
  const pending = db.invitations.filter((i) => i.organizationId === organizationId && i.status === 'pending').length;
  return members + pending;
}

/** Builds the `/auth/me` answer for an account created through the sign-up flows. */
export function toSessionUser(user: StoredUser): SessionUser {
  settleTrial(user);
  const organization = user.organizationId
    ? getDb().organizations.find((org) => org.id === user.organizationId)
    : undefined;
  const subscription = subscriptionOf(user);
  const permissions =
    user.workspace === WORKSPACES.PERSONAL ? PERSONAL_PERMISSIONS : permissionsForRoles(user.roles);

  const contract = getDb().contracts.find((c) => c.userId === user.id);
  const enterpriseTrialStatus = user.enterpriseTrialStatus === 'trial_active'
    && subscription?.trialEndsAt
    && Date.parse(subscription.trialEndsAt) <= Date.now()
    ? 'trial_read_only'
    : user.enterpriseTrialStatus;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles,
    permissions,
    workspace: user.workspace,
    organization: organization ? { id: organization.id, name: organization.name } : undefined,
    subscription:
      subscription && organization ? { ...subscription, seatsUsed: seatsUsed(organization.id) } : subscription,
    enterpriseTrialStatus,
    onboardingStatus: user.onboardingStatus,
    emailVerified: user.emailVerified ?? true,
    contractSigned: Boolean(contract || user.contractSigned),
  };
}
