import { beforeEach, describe, expect, it } from 'vitest';
import { mockAuthService } from '../mock-auth.service';
import { mockCheckoutService } from '../mock-checkout.service';
import { mockContractService } from '../mock-contract.service';
import { mockInvitationService } from '../mock-invitation.service';
import { mockOnboardingService } from '../mock-onboarding.service';
import { mockPasswordService } from '../mock-password.service';
import { mockRegistrationService } from '../mock-registration.service';
import { resetMockDb } from '../mock-store';
import type { PlanSelection } from '../../../types/commerce';

const PRO: PlanSelection = { planCode: 'ENT_PRO', seats: 50, cycle: 'month' };
const STARTER: PlanSelection = { planCode: 'ENT_STARTER', seats: 20, cycle: 'month' };

async function signIn(email: string, password: string) {
  const login = await mockAuthService.login({ email, password });
  localStorage.setItem('accessToken', login.data.data!.accessToken);
  return (await mockAuthService.getMe()).data.data!;
}

async function registerOwner(email = 'owner@acme.vn', plan: PlanSelection = PRO, signContract = true) {
  await mockRegistrationService.registerEnterprise({
    fullName: 'Chủ Acme', email, password: 'Matkhau1', phone: '0912345678', jobTitle: 'Giám đốc', plan,
  });
  if (signContract) {
    const login = await mockAuthService.login({ email, password: 'Matkhau1' });
    localStorage.setItem('accessToken', login.data.data!.accessToken);
    await mockContractService.signContract({
      organizationName: 'Acme',
      taxCode: '0101234567',
      address: 'Hà Nội',
      signerName: 'Chủ Acme',
      signerTitle: 'Giám đốc',
      signMethod: 'email_otp',
    });
  }
  return signIn(email, 'Matkhau1');
}

/** Registers an owner, pays, and creates the organization: ready to invite people. */
async function payAndCreateOrganization(plan: PlanSelection = PRO) {
  await registerOwner('owner@acme.vn', plan);
  const order = (await mockCheckoutService.createOrder(plan)).data.data!;
  await mockCheckoutService.confirmPayment(order.id, 'paid');
  await mockOnboardingService.saveOrganization({ name: 'Acme', industry: 'Dịch vụ', size: '21-100' });
}

beforeEach(() => {
  localStorage.clear();
  resetMockDb();
});

describe('registration', () => {
  it('creates an enterprise owner who must sign contract and pay', async () => {
    const session = await registerOwner('owner@acme.vn', PRO, false);

    expect(session.roles).toEqual(['OWNER']);
    expect(session.workspace).toBe('enterprise');
    expect(session.onboardingStatus).toBe('contract');
    expect(session.subscription).toBeUndefined();
    expect(session.organization).toBeUndefined();
  });

  it('refuses an email that already has an account, seeded or registered', async () => {
    await registerOwner();

    await expect(mockRegistrationService.registerEnterprise({
      fullName: 'X', email: 'OWNER@acme.vn', password: 'Matkhau1', phone: '0912345678', jobTitle: 'Y',
    })).rejects.toMatchObject({ response: { status: 409 } });
    await expect(mockRegistrationService.registerIndividual({
      fullName: 'X', email: 'employee@digitalent.demo', password: 'Matkhau1',
    })).rejects.toMatchObject({ response: { status: 409 } });
  });

  it('refuses an individual sign-up that names no individual plan', async () => {
    await expect(
      mockRegistrationService.registerIndividual({ fullName: 'Cá Nhân', email: 'ca@nhan.vn', password: 'Matkhau1' }),
    ).rejects.toMatchObject({ response: { status: 400 } });
  });

  it('asks an individual who chose a paid plan to pay first', async () => {
    await mockRegistrationService.registerIndividual({
      fullName: 'Cá Nhân', email: 'ca@nhan.vn', password: 'Matkhau1', plan: { planCode: 'IND_PLUS', seats: 1, cycle: 'month' },
    });
    const session = await signIn('ca@nhan.vn', 'Matkhau1');

    expect(session.onboardingStatus).toBe('payment');
    expect(session.subscription).toBeUndefined();
  });

  it('refuses an enterprise plan chosen by an individual', async () => {
    await expect(
      mockRegistrationService.registerIndividual({ fullName: 'A', email: 'a@b.vn', password: 'Matkhau1', plan: PRO }),
    ).rejects.toMatchObject({ response: { status: 400 } });
  });
});

describe('checkout', () => {
  it('remembers the plan picked before registering', async () => {
    await registerOwner();

    expect((await mockCheckoutService.getPendingPlan()).data.data).toEqual(PRO);
  });

  it('prices the order from the plan, seats and billing cycle', async () => {
    await registerOwner();
    const order = (await mockCheckoutService.createOrder({ ...PRO, seats: 50, cycle: 'year' })).data.data!;

    expect(order.amount).toBe(19_090_000);
    expect(order.status).toBe('pending');
    expect(order.code).toMatch(/^DT/);
  });

  it('clamps the seats of an order to what the plan sells', async () => {
    await registerOwner('o@x.vn', STARTER);
    const order = (await mockCheckoutService.createOrder({ ...STARTER, seats: 500 })).data.data!;

    expect(order.seats).toBe(30);
  });

  it('refuses plans that cannot be bought online or belong to the other audience', async () => {
    await registerOwner();

    await expect(mockCheckoutService.createOrder({ planCode: 'ENT_CORP', seats: 1, cycle: 'month' })).rejects.toMatchObject({ response: { status: 400 } });
    await expect(mockCheckoutService.createOrder({ planCode: 'IND_PLUS', seats: 1, cycle: 'month' })).rejects.toMatchObject({ response: { status: 400 } });
  });

  it('activates the plan and moves an owner to the setup wizard once paid', async () => {
    await registerOwner();
    const order = (await mockCheckoutService.createOrder(PRO)).data.data!;
    const paid = (await mockCheckoutService.confirmPayment(order.id, 'paid')).data.data!;
    const session = (await mockAuthService.getMe()).data.data!;

    expect(paid.status).toBe('paid');
    expect(paid.paidAt).toBeDefined();
    expect(session.subscription).toMatchObject({ planCode: 'ENT_PRO', status: 'active', seatLimit: 50 });
    expect(session.subscription?.entitlements).toContain('internal_learning');
    expect(session.onboardingStatus).toBe('setup');
  });

  it('changes nothing for a failed or pending payment', async () => {
    await registerOwner();
    const order = (await mockCheckoutService.createOrder(PRO)).data.data!;

    expect((await mockCheckoutService.confirmPayment(order.id, 'pending')).data.data!.status).toBe('pending');
    expect((await mockCheckoutService.confirmPayment(order.id, 'failed')).data.data!.status).toBe('failed');
    const session = (await mockAuthService.getMe()).data.data!;
    expect(session.onboardingStatus).toBe('payment');
    expect(session.subscription).toBeUndefined();
  });

  it('does not charge twice for an order that is already paid', async () => {
    await registerOwner();
    const order = (await mockCheckoutService.createOrder(PRO)).data.data!;
    await mockCheckoutService.confirmPayment(order.id, 'paid');

    expect((await mockCheckoutService.confirmPayment(order.id, 'failed')).data.data!.status).toBe('paid');
  });

  it('hides an order from every account but its buyer', async () => {
    await registerOwner();
    const order = (await mockCheckoutService.createOrder(PRO)).data.data!;
    await registerOwner('other@acme.vn');

    await expect(mockCheckoutService.getOrder(order.id)).rejects.toMatchObject({ response: { status: 404 } });
    await expect(mockCheckoutService.confirmPayment(order.id, 'paid')).rejects.toMatchObject({ response: { status: 404 } });
  });

  it('refuses a new order from an account that already paid', async () => {
    await registerOwner();
    const order = (await mockCheckoutService.createOrder(PRO)).data.data!;
    await mockCheckoutService.confirmPayment(order.id, 'paid');

    await expect(mockCheckoutService.createOrder(PRO)).rejects.toMatchObject({ response: { status: 409 } });
  });

  it('clamps the seats of a plan picked before registering the same way the order will', async () => {
    await registerOwner('o@x.vn', { ...STARTER, seats: 500 });

    expect((await mockCheckoutService.getPendingPlan()).data.data?.seats).toBe(30);
  });

  it('turns a paid individual plan on and moves to personal onboarding (setup)', async () => {
    const plus: PlanSelection = { planCode: 'IND_PLUS', seats: 1, cycle: 'month' };
    await mockRegistrationService.registerIndividual({ fullName: 'A', email: 'a@b.vn', password: 'Matkhau1', plan: plus });
    await signIn('a@b.vn', 'Matkhau1');
    const order = (await mockCheckoutService.createOrder(plus)).data.data!;
    await mockCheckoutService.confirmPayment(order.id, 'paid');
    const session = (await mockAuthService.getMe()).data.data!;

    expect(session.subscription?.planCode).toBe('IND_PLUS');
    expect(session.onboardingStatus).toBe('setup');
  });
});

describe('organization setup', () => {
  it('creates the organization, departments and positions, and finishes the onboarding', async () => {
    await payAndCreateOrganization();
    await mockOnboardingService.saveDepartments(['Kinh doanh', ' Kế toán ', 'Kinh doanh']);
    await mockOnboardingService.savePositions({ codes: ['ACCOUNTANT', 'NOPE'], custom: ['Pháp chế'] });
    const setup = (await mockOnboardingService.getSetup()).data.data!;

    expect(setup.organization?.name).toBe('Acme');
    expect(setup.departments.map((d) => d.name)).toEqual(['Kinh doanh', 'Kế toán']);
    expect(setup.positions.map((p) => [p.name, p.isCustom])).toEqual([['Kế toán', false], ['Pháp chế', true]]);

    await mockOnboardingService.completeSetup();
    const session = (await mockAuthService.getMe()).data.data!;
    expect(session.onboardingStatus).toBeUndefined();
    expect(session.organization?.name).toBe('Acme');
  });

  it('keeps ids stable when a step is saved again', async () => {
    await payAndCreateOrganization();
    const first = (await mockOnboardingService.saveDepartments(['Kinh doanh'])).data.data!.departments[0].id;
    const again = (await mockOnboardingService.saveDepartments(['Kinh doanh', 'Kế toán'])).data.data!.departments[0].id;

    expect(again).toBe(first);
  });

  it('needs the organization before departments, positions, invitations or completion', async () => {
    await registerOwner();
    const order = (await mockCheckoutService.createOrder(PRO)).data.data!;
    await mockCheckoutService.confirmPayment(order.id, 'paid');

    await expect(mockOnboardingService.saveDepartments(['A'])).rejects.toMatchObject({ response: { status: 400 } });
    await expect(mockOnboardingService.savePositions({ codes: [], custom: ['A'] })).rejects.toMatchObject({ response: { status: 400 } });
    await expect(mockOnboardingService.inviteMembers([])).rejects.toMatchObject({ response: { status: 400 } });
    await expect(mockOnboardingService.completeSetup()).rejects.toMatchObject({ response: { status: 400 } });
  });

  it('is closed until the plan is paid, whatever the caller sends', async () => {
    await registerOwner();

    await expect(mockOnboardingService.getSetup()).rejects.toMatchObject({ response: { status: 402 } });
    await expect(mockOnboardingService.saveOrganization({ name: 'Acme', industry: 'Dịch vụ', size: '1-20' })).rejects.toMatchObject({ response: { status: 402 } });
    await expect(mockOnboardingService.inviteMembers([{ email: 'a@x.vn', fullName: 'A', role: 'EMPLOYEE' }])).rejects.toMatchObject({ response: { status: 402 } });
    await expect(mockOnboardingService.completeSetup()).rejects.toMatchObject({ response: { status: 402 } });
  });

  it('is closed to anyone who is not an owner or organization admin', async () => {
    await signIn('employee@digitalent.demo', 'Admin@1234');

    await expect(mockOnboardingService.getSetup()).rejects.toMatchObject({ response: { status: 403 } });
  });

  it('turns invitations into pending memberships and counts them against the seats', async () => {
    await payAndCreateOrganization({ ...STARTER });
    const result = (await mockOnboardingService.inviteMembers([
      { email: 'An@x.vn', fullName: 'An', role: 'EMPLOYEE' },
      { email: 'binh@x.vn', fullName: 'Bình', role: 'MANAGER', departmentName: 'Kinh doanh' },
    ])).data.data!;
    const setup = (await mockOnboardingService.getSetup()).data.data!;

    expect(result.created.map((c) => c.email)).toEqual(['an@x.vn', 'binh@x.vn']);
    expect(setup.seatsUsed).toBe(3);
    expect(setup.seatLimit).toBe(20);
    expect(setup.canBulkImport).toBe(false);
  });

  it('rejects duplicates and people beyond the seat limit without losing the rest', async () => {
    await payAndCreateOrganization({ ...STARTER });
    await mockOnboardingService.inviteMembers([{ email: 'an@x.vn', fullName: 'An', role: 'EMPLOYEE' }]);
    const result = (await mockOnboardingService.inviteMembers([
      { email: 'an@x.vn', fullName: 'An', role: 'EMPLOYEE' },
      { email: 'employee@digitalent.demo', fullName: 'Demo', role: 'EMPLOYEE' },
      { email: 'c@x.vn', fullName: 'C', role: 'EMPLOYEE' },
      { email: 'd@x.vn', fullName: 'D', role: 'EMPLOYEE' },
      { email: 'e@x.vn', fullName: 'E', role: 'EMPLOYEE' },
    ])).data.data!;

    expect(result.created.map((c) => c.email)).toEqual(['c@x.vn', 'd@x.vn', 'e@x.vn']);
    expect(result.rejected.map((r) => r.email)).toEqual(['an@x.vn', 'employee@digitalent.demo']);
  });

  it('flags a full plan as out of seats', async () => {
    await payAndCreateOrganization({ ...STARTER });
    const rows = Array.from({ length: 21 }, (_, i) => ({ email: `u${i}@x.vn`, fullName: `U${i}`, role: 'EMPLOYEE' as const }));
    const result = (await mockOnboardingService.inviteMembers(rows)).data.data!;

    expect(result.created).toHaveLength(19);
    expect(result.rejected).toEqual([
      { email: 'u19@x.vn', reason: 'Đã hết quyền sử dụng của gói.' },
      { email: 'u20@x.vn', reason: 'Đã hết quyền sử dụng của gói.' },
    ]);
  });
});

describe('invitation activation', () => {
  async function inviteOne() {
    await payAndCreateOrganization();
    const result = (await mockOnboardingService.inviteMembers([
      { email: 'an@x.vn', fullName: 'Nguyễn An', role: 'MANAGER' },
    ])).data.data!;
    localStorage.clear();
    return result.created[0].token!;
  }

  it('shows who is invited, to which organization and as what', async () => {
    const token = await inviteOne();
    const detail = (await mockInvitationService.getInvitation(token)).data.data!;

    expect(detail).toMatchObject({ organizationName: 'Acme', email: 'an@x.vn', role: 'MANAGER', status: 'pending' });
  });

  it('creates the member with the invited role in the organization, under the owner plan', async () => {
    const token = await inviteOne();
    await mockInvitationService.activate({ token, fullName: 'An Nguyễn', password: 'Matkhau2' });
    const session = await signIn('an@x.vn', 'Matkhau2');

    expect(session.roles).toEqual(['MANAGER']);
    expect(session.organization?.name).toBe('Acme');
    expect(session.subscription?.planCode).toBe('ENT_PRO');
    expect(session.onboardingStatus).toBeUndefined();
    expect(session.fullName).toBe('An Nguyễn');
  });

  it('works once only, and an unknown token is not found', async () => {
    const token = await inviteOne();
    await mockInvitationService.activate({ token, fullName: 'An', password: 'Matkhau2' });

    await expect(mockInvitationService.activate({ token, fullName: 'An', password: 'Matkhau3' })).rejects.toMatchObject({ response: { status: 404 } });
    await expect(mockInvitationService.getInvitation('nope')).rejects.toMatchObject({ response: { status: 404 } });
  });
});

describe('password reset and email verification', () => {
  beforeEach(async () => {
    await registerOwner();
  });

  it('resets the password through the emailed link, once', async () => {
    const { debugLink } = (await mockPasswordService.requestReset('owner@acme.vn')).data.data!;
    const token = debugLink!.split('/').pop()!;
    await mockPasswordService.resetPassword(token, 'Matkhau9');

    await expect(mockAuthService.login({ email: 'owner@acme.vn', password: 'Matkhau1' })).rejects.toMatchObject({ response: { status: 401 } });
    await expect(mockAuthService.login({ email: 'owner@acme.vn', password: 'Matkhau9' })).resolves.toBeDefined();
    await expect(mockPasswordService.resetPassword(token, 'Matkhau8')).rejects.toMatchObject({ response: { status: 400 } });
  });

  it('answers the same for an email without an account', async () => {
    const result = await mockPasswordService.requestReset('ghost@x.vn');

    expect(result.data.success).toBe(true);
    expect(result.data.data).toEqual({});
  });

  it('keeps only the latest reset link per account', async () => {
    const first = (await mockPasswordService.requestReset('owner@acme.vn')).data.data!.debugLink!.split('/').pop()!;
    await mockPasswordService.requestReset('owner@acme.vn');

    await expect(mockPasswordService.checkResetToken(first)).rejects.toMatchObject({ response: { status: 400 } });
  });

  it('verifies the email through the link, and rejects a wrong one', async () => {
    const { debugVerifyLink } = (await mockRegistrationService.registerIndividual({
      fullName: 'A', email: 'a@b.vn', password: 'Matkhau1', plan: { planCode: 'IND_PLUS', seats: 1, cycle: 'month' },
    })).data.data!;

    await expect(mockPasswordService.verifyEmail(debugVerifyLink!.split('/').pop()!)).resolves.toBeDefined();
    await expect(mockPasswordService.verifyEmail('wrong')).rejects.toMatchObject({ response: { status: 400 } });
  });
});
