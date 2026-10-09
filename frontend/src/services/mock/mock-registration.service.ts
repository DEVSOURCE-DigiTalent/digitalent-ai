import { trialSubscription } from '../../lib/personal-access';
import { REFERENCE_POSITIONS } from '../../lib/reference-positions';
import { ROLES, WORKSPACES } from '../../lib/roles';
import { clampSeats, getPlan, isPurchasableOnline, priceFor } from '../../lib/plans';
import type {
  RegisterEnterpriseInput, RegisterIndividualInput, RegistrationResult, StoredPurchaseDraft, TryOrientationInput,
} from '../../types/commerce';
import { findMockAccountByEmail } from './mock-accounts';
import { mockFail, mockOk } from './mock-http';
import { findUserByEmail, newId, newToken, updateDb, getDb, toSessionUser, type StoredUser } from './mock-store';
import { updatePersonalState, type TryOrientation } from './server/personal/personal-store';

const EMAIL_TAKEN = 'Email này đã được đăng ký.';
/** The quick try asks a handful of questions; anything beyond this is not from it. */
const MAX_ORIENTATION_TOTAL = 100;

function emailTaken(email: string): boolean {
  return Boolean(findMockAccountByEmail(email) || findUserByEmail(email));
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
}

function verifyLinkFor(user: StoredUser): RegistrationResult {
  return { debugVerifyLink: `/verify-email/${user.verifyToken}` };
}

const isReferencePosition = (code: string | undefined): code is string =>
  Boolean(code) && REFERENCE_POSITIONS.some((position) => position.code === code);

/** Keeps only what has the right shape, so a tampered hand-over never reaches the learner's state. */
function cleanOrientation(input: TryOrientationInput | undefined): TryOrientation | null {
  if (!input || !isReferencePosition(input.positionCode)) return null;
  const { correct, total, completedAt } = input;
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total <= 0 || total > MAX_ORIENTATION_TOTAL) return null;
  if (correct < 0 || correct > total) return null;
  if (typeof completedAt !== 'string' || Number.isNaN(new Date(completedAt).getTime())) return null;
  return { positionCode: input.positionCode, correct, total, completedAt };
}

/** Trial sign-up: Plus rights for a few days, no card, no order. The position, if any, is the first choice (not a change). */
function registerTrial(input: RegisterIndividualInput) {
  const now = new Date();
  const subscription = trialSubscription(now);
  const user: StoredUser = {
    id: newId('usr'),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    fullName: input.fullName.trim(),
    phone: input.phone,
    workspace: WORKSPACES.PERSONAL,
    roles: [],
    emailVerified: false,
    verifyToken: newToken(),
    subscription,
    trialUsedAt: subscription.trialStartedAt,
    onboardingStatus: 'setup',
  };
  updateDb((db) => {
    db.users.push(user);
  });

  const positionCode = isReferencePosition(input.positionCode) ? input.positionCode : undefined;
  if (positionCode) {
    updatePersonalState(user.id, (state) => {
      state.targetCode = positionCode;
      state.targetSetAt = now.toISOString();
      state.tryOrientation = cleanOrientation(input.tryOrientation);
    });
  }

  const registrationId = newId('reg');
  const registrationAccessToken = newToken();
  const demoOtp = '123456';

  return mockOk({
    registrationId,
    registrationAccessToken,
    maskedEmail: maskEmail(user.email),
    state: 'verification_pending',
    developmentOtp: demoOtp,
    developmentVerifyLink: `/individual/register/verify?registrationId=${registrationId}&token=${registrationAccessToken}`,
    intent: 'TRIAL',
    ...verifyLinkFor(user),
  }, 'Đã gửi mã xác thực email.');
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
    if (input.trial) return registerTrial(input);

    const plan = getPlan(input.plan?.planCode);
    if (!input.plan || !plan || plan.audience !== 'individual' || !isPurchasableOnline(plan)) {
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

    const registrationId = newId('reg');
    const registrationAccessToken = newToken();
    const demoOtp = '123456';

    return mockOk({
      registrationId,
      registrationAccessToken,
      maskedEmail: maskEmail(user.email),
      state: 'verification_pending',
      draftId: draft.id,
      developmentOtp: demoOtp,
      developmentVerifyLink: `/individual/register/verify?registrationId=${registrationId}&token=${registrationAccessToken}`,
      intent: 'PURCHASE',
      ...verifyLinkFor(user),
    }, 'Đã gửi mã xác thực email.');
  },

  verifyIndividual: async (_id: string, input: { otp?: string; token?: string }) => {
    const otp = input.otp?.trim();
    const token = input.token?.trim();

    // Trong môi trường mock, chấp nhận token từ magic link hoặc bất kỳ mã OTP 6 số (hoặc mã 123456 / 686868)
    if (!token && (!otp || otp.length < 6)) {
      return mockFail(400, 'Vui lòng nhập mã xác thực OTP gồm 6 chữ số.');
    }

    const db = getDb();
    const user = db.users[db.users.length - 1];
    if (user) {
      user.emailVerified = true;
    }

    const sessionUser = user ? toSessionUser(user) : {
      id: 'usr-trial',
      email: 'learner@digitalent.ai',
      fullName: 'Học viên Cá nhân',
      roles: [],
      permissions: [],
      workspace: WORKSPACES.PERSONAL,
      subscription: trialSubscription(new Date()),
    };

    localStorage.setItem('accessToken', `mock-token:${sessionUser.id}`);

    const isPurchase = user?.pendingPlan !== undefined;
    const draft = db.purchaseDrafts?.[db.purchaseDrafts.length - 1];
    const nextPath = isPurchase && draft ? `/checkout?draft=${draft.id}` : '/personal/onboarding';

    return mockOk({
      accessToken: `mock-token:${sessionUser.id}`,
      user: sessionUser,
      nextPath,
      purchaseDraft: draft ? { id: draft.id } : undefined,
    }, 'Xác thực tài khoản thành công.');
  },

  resendVerification: async () => {
    return mockOk({ sent: true }, 'Đã gửi lại mã xác thực OTP mới.');
  },
};
