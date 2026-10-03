import { ROLES, WORKSPACES } from '../../lib/roles';
import { clampSeats, getPlan, priceFor } from '../../lib/plans';
import type { RegisterEnterpriseInput, RegisterIndividualInput, RegistrationResult, StoredPurchaseDraft } from '../../types/commerce';
import { findMockAccountByEmail } from './mock-accounts';
import { mockFail, mockOk } from './mock-http';
import { findUserByEmail, newId, newToken, updateDb, type StoredUser } from './mock-store';

const EMAIL_TAKEN = 'Email này đã được đăng ký.';

function emailTaken(email: string): boolean {
  return Boolean(findMockAccountByEmail(email) || findUserByEmail(email));
}

function verifyLinkFor(user: StoredUser): RegistrationResult {
  return { debugVerifyLink: `/verify-email/${user.verifyToken}` };
}

export const mockRegistrationService = {
  registerEnterprise: async (input: RegisterEnterpriseInput) => {
    if (emailTaken(input.email)) return mockFail(409, EMAIL_TAKEN);

    const plan = getPlan(input.plan?.planCode);
    const userId = newId('usr');

    const seats = plan ? clampSeats(plan, input.plan?.seats ?? 10) : 10;
    const cycle = input.plan?.cycle ?? 'month';
    const amount = plan ? (priceFor(plan, seats, cycle) ?? 0) : 0;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const draftId = `pd_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`;

    const draft: StoredPurchaseDraft = {
      id: draftId,
      userId,
      audience: 'enterprise',
      planCode: plan?.code ?? 'ENT_STARTER',
      seats,
      cycle,
      amount,
      currency: 'VND',
      status: 'DRAFT',
      createdAt: now.toISOString(),
      expiresAt,
    };

    const user: StoredUser = {
      id: userId,
      email: input.email.trim().toLowerCase(),
      password: input.password,
      fullName: input.fullName.trim(),
      phone: input.phone,
      jobTitle: input.jobTitle,
      workspace: WORKSPACES.ENTERPRISE,
      roles: [ROLES.OWNER],
      emailVerified: false,
      verifyToken: newToken(),
      pendingPlan: { planCode: draft.planCode, seats: draft.seats, cycle: draft.cycle },
      onboardingStatus: 'contract',
    };

    updateDb((db) => {
      db.users.push(user);
      db.purchaseDrafts = db.purchaseDrafts ?? [];
      db.purchaseDrafts.push(draft);
    });

    return mockOk({ draftId: draft.id, ...verifyLinkFor(user) }, 'Đã tạo tài khoản.');
  },

  registerIndividual: async (input: RegisterIndividualInput) => {
    if (emailTaken(input.email)) return mockFail(409, EMAIL_TAKEN);

    const plan = getPlan(input.plan?.planCode);
    if (!input.plan || !plan || plan.audience !== 'individual') {
      return mockFail(400, 'Hãy chọn một gói cá nhân trước khi đăng ký.');
    }

    const userId = newId('usr');
    const seats = 1;
    const cycle = input.plan.cycle ?? 'month';
    const amount = priceFor(plan, seats, cycle) ?? 0;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const draftId = `pd_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`;

    const draft: StoredPurchaseDraft = {
      id: draftId,
      userId,
      audience: 'individual',
      planCode: plan.code,
      seats,
      cycle,
      amount,
      currency: 'VND',
      status: 'DRAFT',
      createdAt: now.toISOString(),
      expiresAt,
    };

    const user: StoredUser = {
      id: userId,
      email: input.email.trim().toLowerCase(),
      password: input.password,
      fullName: input.fullName.trim(),
      phone: input.phone,
      workspace: WORKSPACES.PERSONAL,
      roles: [],
      emailVerified: false,
      verifyToken: newToken(),
      pendingPlan: input.plan,
      onboardingStatus: 'payment',
    };

    updateDb((db) => {
      db.users.push(user);
      db.purchaseDrafts = db.purchaseDrafts ?? [];
      db.purchaseDrafts.push(draft);
    });

    return mockOk({ draftId: draft.id, ...verifyLinkFor(user) }, 'Đã tạo tài khoản.');
  },
};
