import { ROLES, WORKSPACES, type Workspace } from '../../lib/roles';
import { ENTITLEMENTS } from '../../lib/entitlements';
import { freeSubscription, trialSubscription } from '../../lib/personal-access';
import type { OrganizationContext, SessionUser, SubscriptionContext } from '../../types/session';
import { PERSONAL_PERMISSIONS, permissionsForRoles } from './mock-rbac';

export const MOCK_PASSWORD = 'Admin@1234';

interface MockAccountSeed {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  workspace: Workspace;
  organization?: OrganizationContext;
  subscription?: SubscriptionContext;
}

const ACME: OrganizationContext = { id: 'org-acme', name: 'Công ty Cổ phần Acme' };
const SMALL_CO: OrganizationContext = { id: 'org-small', name: 'Công ty TNHH Giải Pháp Trẻ' };
const STARTUP: OrganizationContext = { id: 'org-startup', name: 'Công ty TNHH Khởi Nghiệp Số' };
const LEGACY_CO: OrganizationContext = { id: 'org-legacy', name: 'Công ty Cổ phần Cũ Kỹ' };

const PRO_PLAN: SubscriptionContext = {
  planCode: 'ENT_PRO',
  planName: 'Doanh nghiệp Pro',
  status: 'active',
  entitlements: Object.values(ENTITLEMENTS),
  seatLimit: 100,
  seatsUsed: 42,
  renewsAt: '2027-09-30',
};

const STARTER_PLAN: SubscriptionContext = {
  planCode: 'ENT_STARTER',
  planName: 'Doanh nghiệp Starter',
  status: 'active',
  entitlements: [ENTITLEMENTS.PRACTICAL_TASKS],
  seatLimit: 20,
  seatsUsed: 18,
  renewsAt: '2027-03-31',
};

const PERSONAL_PLAN: SubscriptionContext = {
  planCode: 'IND_PLUS',
  planName: 'Cá nhân Plus',
  status: 'active',
  entitlements: [ENTITLEMENTS.PERSONAL_LEARNING_PATH],
  renewsAt: '2027-01-15',
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** trial@: day 5 of 7 when the module loads, so the demo always has a trial that is still running. */
const TRIAL_DEMO_PLAN: SubscriptionContext = trialSubscription(new Date(Date.now() - 5 * DAY_MS));

/** free@: the trial started 10 days ago and ended 3 days ago. */
const FREE_DEMO_PLAN: SubscriptionContext = freeSubscription(trialSubscription(new Date(Date.now() - 10 * DAY_MS)));

const enterprise = (
  id: string,
  email: string,
  fullName: string,
  role: string,
  organization: OrganizationContext,
  subscription: SubscriptionContext,
): MockAccountSeed => ({
  id, email, fullName, roles: [role], workspace: WORKSPACES.ENTERPRISE, organization, subscription,
});

/**
 * 10 demo accounts: the 8 of spec v2.1 §1.6 plus the two individual trial states (trial@, free@):
 * - owner@ (Acme with Managers)
 * - owner2@ (Small org without Manager)
 * - manager@ (Manager of 1-2 departments)
 * - employee@ (Employee)
 * - starter@ (Starter plan owner)
 * - expired@ (Expired plan owner)
 * - personal@ (Personal workspace)
 * - trial@ (Personal, day 5 of a 7-day trial)
 * - free@ (Personal, trial ended: Free plan)
 * - platform@ (Platform admin)
 */
const SEEDS: MockAccountSeed[] = [
  enterprise('mock-owner', 'owner@digitalent.ai', 'Nguyễn Văn Chủ', ROLES.OWNER, ACME, PRO_PLAN),
  enterprise('mock-owner2', 'owner2@digitalent.ai', 'Trần Văn Chủ Nhỏ', ROLES.OWNER, SMALL_CO, PRO_PLAN),
  enterprise('mock-manager', 'manager@digitalent.ai', 'Phạm Thị Quản Lý', ROLES.MANAGER, ACME, PRO_PLAN),
  enterprise('mock-employee', 'employee@digitalent.ai', 'Hoàng Văn Nhân Viên', ROLES.EMPLOYEE, ACME, PRO_PLAN),
  // Starter plan: no internal learning or advanced analytics, to see the "feature unavailable" screen.
  enterprise('mock-starter', 'starter@digitalent.ai', 'Đặng Văn Starter', ROLES.OWNER, STARTUP, STARTER_PLAN),
  // Expired plan: to see read-only / payment required state.
  enterprise('mock-expired', 'expired@digitalent.ai', 'Vũ Thị Hết Hạn', ROLES.OWNER, LEGACY_CO, {
    ...PRO_PLAN, status: 'payment_required', renewsAt: '2026-08-31',
  }),
  {
    id: 'mock-personal', email: 'personal@digitalent.ai', fullName: 'Bùi Thị Cá Nhân',
    roles: [], workspace: WORKSPACES.PERSONAL, subscription: PERSONAL_PLAN,
  },
  {
    id: 'mock-trial', email: 'trial@digitalent.ai', fullName: 'Lý Văn Dùng Thử',
    roles: [], workspace: WORKSPACES.PERSONAL, subscription: TRIAL_DEMO_PLAN,
  },
  {
    id: 'mock-free', email: 'free@digitalent.ai', fullName: 'Mai Thị Miễn Phí',
    roles: [], workspace: WORKSPACES.PERSONAL, subscription: FREE_DEMO_PLAN,
  },
  {
    id: 'mock-platform', email: 'platform@digitalent.ai', fullName: 'Ngô Văn Nền Tảng',
    roles: [ROLES.PLATFORM_ADMIN], workspace: WORKSPACES.PLATFORM,
  },
];

function toSessionUser(seed: MockAccountSeed): SessionUser {
  const permissions =
    seed.workspace === WORKSPACES.PERSONAL ? PERSONAL_PERMISSIONS : permissionsForRoles(seed.roles);
  return { ...seed, permissions, emailVerified: true };
}

export const MOCK_ACCOUNTS: SessionUser[] = SEEDS.map(toSessionUser);

export function findMockAccountByEmail(email: string): SessionUser | undefined {
  const normalized = email.trim().toLowerCase();
  return MOCK_ACCOUNTS.find((account) => account.email === normalized);
}

export function findMockAccountById(id: string): SessionUser | undefined {
  if (id === 'mock-admin') {
    return { ...toSessionUser(SEEDS[0]), id: 'mock-admin', fullName: 'Trần Thị Quản Trị' };
  }
  if (id === 'mock-learning') {
    return { ...toSessionUser(SEEDS[0]), id: 'mock-learning', fullName: 'Lê Văn Học Tập' };
  }
  if (id === 'mock-learner') {
    return { ...toSessionUser(SEEDS[3]), id: 'mock-learner', fullName: 'Hoàng Văn Học Viên' };
  }
  return MOCK_ACCOUNTS.find((account) => account.id === id);
}
