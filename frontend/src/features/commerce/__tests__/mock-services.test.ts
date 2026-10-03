import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mockPurchaseService } from '@/services/mock/mock-purchase.service';
import { mockCheckoutService } from '@/services/mock/mock-checkout.service';
import { mockContractService } from '@/services/mock/mock-contract.service';
import { resetMockDb, updateDb, getDb, type StoredUser } from '@/services/mock/mock-store';
import { priceFor, getPlan } from '@/lib/plans';

const MOCK_USER_ID = 'usr-test-mock';

beforeEach(() => {
  localStorage.clear();
  resetMockDb();

  const user: StoredUser = {
    id: MOCK_USER_ID,
    email: 'test@acme.vn',
    password: 'password123456',
    fullName: 'Test Owner',
    workspace: 'enterprise',
    roles: ['OWNER'],
    emailVerified: false,
    verifyToken: 'token123',
    onboardingStatus: 'payment',
  };

  updateDb((db) => {
    db.users.push(user);
  });

  localStorage.setItem('accessToken', `mock-token:${MOCK_USER_ID}`);
});

afterEach(() => {
  localStorage.clear();
  resetMockDb();
});

describe('mockPurchaseService (§4.2, GĐ 3)', () => {
  it('creates a purchase draft with correct id, recomputed amount, and 7-day expiration', async () => {
    const selection = { planCode: 'ENT_STARTER', seats: 10, cycle: 'month' as const };
    const plan = getPlan('ENT_STARTER')!;
    const expectedAmount = priceFor(plan, 10, 'month');

    const result = await mockPurchaseService.createDraft(selection, 'enterprise', MOCK_USER_ID);
    const draft = result.data.data!;

    expect(draft.id).toMatch(/^pd_/);
    expect(draft.planCode).toBe('ENT_STARTER');
    expect(draft.seats).toBe(10);
    expect(draft.amount).toBe(expectedAmount);
    expect(draft.status).toBe('DRAFT');

    const created = new Date(draft.createdAt).getTime();
    const expires = new Date(draft.expiresAt).getTime();
    const diffDays = Math.round((expires - created) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(7);
  });

  it('retrieves the active draft for the current user via getMyDraft', async () => {
    const selection = { planCode: 'ENT_STARTER', seats: 5, cycle: 'month' as const };
    const created = (await mockPurchaseService.createDraft(selection, 'enterprise', MOCK_USER_ID)).data.data!;

    const myDraft = (await mockPurchaseService.getMyDraft()).data.data;
    expect(myDraft?.id).toBe(created.id);
  });

  it('updates draft plan, seats, and recalculates amount accurately', async () => {
    const selection = { planCode: 'ENT_STARTER', seats: 5, cycle: 'month' as const };
    const created = (await mockPurchaseService.createDraft(selection, 'enterprise', MOCK_USER_ID)).data.data!;

    const proPlan = getPlan('ENT_PRO')!;
    const newExpectedAmount = priceFor(proPlan, 15, 'year');

    const updated = (
      await mockPurchaseService.updateDraft(created.id, {
        planCode: 'ENT_PRO',
        seats: 15,
        cycle: 'year',
      })
    ).data.data!;

    expect(updated.planCode).toBe('ENT_PRO');
    expect(updated.seats).toBe(15);
    expect(updated.cycle).toBe('year');
    expect(updated.amount).toBe(newExpectedAmount);
  });

  it('rejects updating to a plan of another audience', async () => {
    const selection = { planCode: 'ENT_STARTER', seats: 5, cycle: 'month' as const };
    const created = (await mockPurchaseService.createDraft(selection, 'enterprise', MOCK_USER_ID)).data.data!;

    await expect(
      mockPurchaseService.updateDraft(created.id, {
        planCode: 'IND_PLUS',
        seats: 1,
        cycle: 'month',
      }),
    ).rejects.toBeDefined();
  });

  it('cancels draft successfully', async () => {
    const selection = { planCode: 'ENT_STARTER', seats: 5, cycle: 'month' as const };
    const created = (await mockPurchaseService.createDraft(selection, 'enterprise', MOCK_USER_ID)).data.data!;

    await mockPurchaseService.cancelDraft(created.id);
    const draft = (await mockPurchaseService.getDraft(created.id)).data.data!;
    expect(draft.status).toBe('CANCELLED');
  });
});

describe('mockCheckoutService (P10, §4.6, T10, T11, T13)', () => {
  it('creates an order with pending status and 15-minute expiration', async () => {
    const selection = { planCode: 'ENT_STARTER', seats: 10, cycle: 'month' as const };
    const order = (await mockCheckoutService.createOrder(selection)).data.data!;

    expect(order.status).toBe('pending');
    expect(order.amount).toBeGreaterThan(0);

    const created = new Date(order.createdAt).getTime();
    const expires = new Date(order.expiresAt!).getTime();
    const diffMinutes = Math.round((expires - created) / (1000 * 60));
    expect(diffMinutes).toBe(15);
  });

  it('T11: automatically marks order as expired when time passes', async () => {
    const selection = { planCode: 'ENT_STARTER', seats: 10, cycle: 'month' as const };
    const order = (await mockCheckoutService.createOrder(selection)).data.data!;

    // Simulate 16 minutes later
    updateDb((db) => {
      const o = db.orders.find((item) => item.id === order.id)!;
      o.expiresAt = new Date(Date.now() - 1000).toISOString();
    });

    const refreshed = (await mockCheckoutService.getOrder(order.id)).data.data!;
    expect(refreshed.status).toBe('expired');
  });

  it('T13: idempotent payment confirmation does not duplicate subscriptions', async () => {
    const selection = { planCode: 'ENT_STARTER', seats: 10, cycle: 'month' as const };
    const order = (await mockCheckoutService.createOrder(selection)).data.data!;

    const firstConfirm = (await mockCheckoutService.confirmPayment(order.id, 'paid')).data.data!;
    expect(firstConfirm.status).toBe('paid');

    const secondConfirm = (await mockCheckoutService.confirmPayment(order.id, 'paid')).data.data!;
    expect(secondConfirm.status).toBe('paid');

    const user = getDb().users.find((u) => u.id === MOCK_USER_ID)!;
    expect(user.subscription?.status).toBe('active');
    expect(user.subscription?.planCode).toBe('ENT_STARTER');
    expect(user.onboardingStatus).toBe('setup'); // Enterprise moves to setup wizard after payment
  });
});

describe('mockContractService (B2B E-Contract Signing)', () => {
  it('supports OTP generation and verification', async () => {
    const otp = (await mockContractService.sendOtp()).data.data!;
    expect(otp.demoCode).toBe('686868');

    const verified = (await mockContractService.verifyOtp('686868')).data.data!;
    expect(verified.verified).toBe(true);

    await expect(mockContractService.verifyOtp('000000')).rejects.toBeDefined();
  });

  it('signs contract and moves enterprise user from contract to payment step', async () => {
    const signResult = (
      await mockContractService.signContract({
        organizationName: 'Công ty Acme',
        taxCode: '0109876543',
        address: 'Hà Nội',
        signerName: 'Nguyễn Văn A',
        signerTitle: 'Giám đốc điều hành',
        signMethod: 'email_otp',
      })
    ).data.data!;

    expect(signResult.contractNumber).toMatch(/^HD-/);
    expect(signResult.organizationName).toBe('Công ty Acme');
    expect(signResult.status).toBe('signed');

    const user = getDb().users.find((u) => u.id === MOCK_USER_ID)!;
    expect(user.onboardingStatus).toBe('payment'); // Moved to payment step!
    expect(user.contractSigned).toBe(true);
  });
});
