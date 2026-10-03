import { WORKSPACES } from '../../lib/roles';
import {
  entitlementKeys, getPlan, isPurchasableOnline, priceFor, clampSeats, type BillingCycle,
} from '../../lib/plans';
import type { Order, PaymentOutcome, PlanSelection } from '../../types/commerce';
import type { SubscriptionContext } from '../../types/session';
import { currentMockUserId } from './mock-auth.service';
import { mockFail, mockOk } from './mock-http';
import { findUserById, findUserByEmail, getDb, newId, newToken, updateDb, type StoredOrder } from './mock-store';
import { findMockAccountByEmail } from './mock-accounts';

const NOT_SIGNED_IN = 'Bạn cần đăng nhập để thanh toán.';
const QR_VALID_MS = 15 * 60 * 1000;

function toOrder(stored: StoredOrder): Order {
  const { userId: _userId, ...order } = stored;
  return order;
}

function renewalDate(cycle: BillingCycle): string {
  const date = new Date();
  date.setMonth(date.getMonth() + (cycle === 'year' ? 12 : 1));
  return date.toISOString().slice(0, 10);
}

function findOrder(orderId: string): StoredOrder | undefined {
  return getDb().orders.find((o) => o.id === orderId);
}

export const mockCheckoutService = {
  /** The plan the signed-in account picked before registering, if it still has to be paid. */
  getPendingPlan: async () => {
    const user = findUserById(currentMockUserId() ?? '');
    if (!user) return mockFail(401, NOT_SIGNED_IN);
    return mockOk<PlanSelection | null>(user.pendingPlan ?? null);
  },

  createOrder: async (selection: PlanSelection, draftId?: string) => {
    const user = findUserById(currentMockUserId() ?? '');
    if (!user) return mockFail(401, NOT_SIGNED_IN);

    if (user.onboardingStatus !== 'payment') {
      return mockFail(409, 'Tài khoản này đã thanh toán.');
    }

    const plan = getPlan(selection.planCode);
    const audience = user.workspace === WORKSPACES.PERSONAL ? 'individual' : 'enterprise';
    if (!plan || plan.audience !== audience || !isPurchasableOnline(plan)) {
      return mockFail(400, 'Gói này không thể mua trực tuyến.');
    }
    const seats = clampSeats(plan, selection.seats);
    const amount = priceFor(plan, seats, selection.cycle) ?? 0;

    const now = Date.now();
    const createdAt = new Date(now).toISOString();
    const expiresAt = new Date(now + QR_VALID_MS).toISOString();

    const order: StoredOrder = {
      id: newId('ord'),
      code: `DT${now.toString(36).toUpperCase()}`,
      userId: user.id,
      draftId,
      planCode: plan.code,
      seats,
      cycle: selection.cycle,
      amount,
      status: 'pending',
      createdAt,
      expiresAt,
    };

    updateDb((db) => {
      // Cancel previous pending orders for this user to keep only the active one
      db.orders.forEach((o) => {
        if (o.userId === user.id && o.status === 'pending') {
          o.status = 'cancelled';
        }
      });
      db.orders.push(order);
      const stored = db.users.find((u) => u.id === user.id);
      if (stored) {
        stored.pendingPlan = { planCode: plan.code, seats, cycle: selection.cycle };
      }
    });

    return mockOk(toOrder(order));
  },

  getOrder: async (orderId: string) => {
    const userId = currentMockUserId();
    const order = findOrder(orderId);
    if (!order || order.userId !== userId) return mockFail(404, 'Không tìm thấy đơn hàng.');

    // Check if expired
    if (order.status === 'pending' && new Date(order.expiresAt).getTime() < Date.now()) {
      updateDb((db) => {
        const stored = db.orders.find((o) => o.id === orderId);
        if (stored && stored.status === 'pending') stored.status = 'expired';
      });
      order.status = 'expired';
    }

    return mockOk(toOrder(order));
  },

  /** Simulates the bank callback after the customer scans the QR code. Idempotent. */
  confirmPayment: async (orderId: string, outcome: PaymentOutcome) => {
    const userId = currentMockUserId();
    const order = findOrder(orderId);
    if (!order || order.userId !== userId) return mockFail(404, 'Không tìm thấy đơn hàng.');

    // Idempotent: repeat call returns existing result without modifying subscriptions/orders
    if (order.status === 'paid') return mockOk(toOrder(order));

    const plan = getPlan(order.planCode)!;
    return mockOk(
      updateDb((db) => {
        const stored = db.orders.find((o) => o.id === orderId)!;
        if (outcome === 'failed') stored.status = 'failed';
        else if (outcome === 'expired') stored.status = 'expired';
        else if (outcome === 'cancelled') stored.status = 'cancelled';
        else if (outcome === 'paid') {
          stored.status = 'paid';
          stored.paidAt = new Date().toISOString();
          const user = db.users.find((u) => u.id === stored.userId)!;
          const subscription: SubscriptionContext = {
            planCode: plan.code,
            planName: plan.name,
            status: 'active',
            entitlements: entitlementKeys(plan),
            seatLimit: plan.seatRange ? stored.seats : undefined,
            renewsAt: renewalDate(stored.cycle),
          };
          user.subscription = subscription;
          user.pendingPlan = undefined;
          // Enterprise goes to contract signing step, individual goes to personal onboarding
          user.onboardingStatus = user.workspace === WORKSPACES.ENTERPRISE ? 'contract' : 'setup';

          // If linked to a draft, mark draft as paid
          if (stored.draftId) {
            const draft = db.purchaseDrafts?.find((d) => d.id === stored.draftId);
            if (draft) draft.status = 'PAID';
          } else {
            const userDraft = db.purchaseDrafts?.find((d) => d.userId === user.id && d.status === 'DRAFT');
            if (userDraft) userDraft.status = 'PAID';
          }
        }
        return toOrder(stored);
      }),
    );
  },

  updateEmail: async (newEmail: string) => {
    const userId = currentMockUserId();
    if (!userId) return mockFail(401, NOT_SIGNED_IN);
    const normalized = newEmail.trim().toLowerCase();
    if (!normalized || !/^\S+@\S+\.\S+$/.test(normalized)) {
      return mockFail(400, 'Email không hợp lệ.');
    }
    if (findMockAccountByEmail(normalized) || (findUserByEmail(normalized) && findUserByEmail(normalized)?.id !== userId)) {
      return mockFail(409, 'Email này đã có tài khoản.');
    }

    updateDb((db) => {
      const user = db.users.find((u) => u.id === userId);
      if (user) {
        user.email = normalized;
        user.emailVerified = false;
        user.verifyToken = newToken();
      }
    });

    return mockOk({ email: normalized, debugVerifyLink: `/verify-email/${findUserById(userId)?.verifyToken}` }, 'Đã cập nhật email.');
  },
};
