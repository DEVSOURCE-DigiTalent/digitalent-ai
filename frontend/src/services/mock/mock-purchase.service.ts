import { clampSeats, getPlan, isPurchasableOnline, priceFor } from '../../lib/plans';
import type { PlanSelection, PurchaseDraft, StoredPurchaseDraft } from '../../types/commerce';
import { currentMockUserId } from './mock-auth.service';
import { mockFail, mockOk } from './mock-http';
import { getDb, updateDb } from './mock-store';

export const mockPurchaseService = {
  getMyDraft: async () => {
    const userId = currentMockUserId();
    if (!userId) return mockOk<PurchaseDraft | null>(null);
    const db = getDb();
    const drafts = db.purchaseDrafts ?? [];
    const draft = drafts
      .filter((d) => d.userId === userId && (d.status === 'DRAFT' || d.status === 'PAYMENT_PENDING'))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return mockOk<PurchaseDraft | null>(draft ?? null);
  },

  getDraft: async (id: string) => {
    const db = getDb();
    const drafts = db.purchaseDrafts ?? [];
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return mockFail(404, 'Không tìm thấy bản nháp mua hàng.');
    const userId = currentMockUserId();
    if (draft.userId && userId && draft.userId !== userId) {
      return mockFail(403, 'Bạn không có quyền xem bản nháp này.');
    }
    return mockOk<PurchaseDraft>(draft);
  },

  createDraft: async (
    selection: PlanSelection,
    audience: 'enterprise' | 'individual',
    userId?: string,
  ) => {
    const plan = getPlan(selection.planCode);
    if (!plan || plan.audience !== audience || !isPurchasableOnline(plan)) {
      return mockFail(400, 'Gói này không thể mua trực tuyến.');
    }
    const seats = clampSeats(plan, selection.seats);
    const amount = priceFor(plan, seats, selection.cycle);
    if (amount === null) return mockFail(400, 'Không thể tính giá cho gói này.');

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const draft: StoredPurchaseDraft = {
      id: `pd_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`,
      userId: userId ?? currentMockUserId() ?? null,
      audience,
      planCode: plan.code,
      seats,
      cycle: selection.cycle,
      amount,
      currency: 'VND',
      status: 'DRAFT',
      createdAt: now.toISOString(),
      expiresAt,
    };

    updateDb((db) => {
      db.purchaseDrafts = db.purchaseDrafts ?? [];
      db.purchaseDrafts.push(draft);
    });

    return mockOk<PurchaseDraft>(draft);
  },

  updateDraft: async (id: string, selection: PlanSelection) => {
    const db = getDb();
    const drafts = db.purchaseDrafts ?? [];
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return mockFail(404, 'Không tìm thấy bản nháp mua hàng.');
    if (draft.status !== 'DRAFT' && draft.status !== 'PAYMENT_PENDING') {
      return mockFail(400, 'Bản nháp này không thể thay đổi.');
    }

    const plan = getPlan(selection.planCode);
    if (!plan || plan.audience !== draft.audience || !isPurchasableOnline(plan)) {
      return mockFail(400, 'Gói không hợp lệ hoặc khác đối tượng.');
    }

    const seats = clampSeats(plan, selection.seats);
    const amount = priceFor(plan, seats, selection.cycle);
    if (amount === null) return mockFail(400, 'Không thể tính giá cho gói này.');

    const updated = updateDb((database) => {
      database.purchaseDrafts = database.purchaseDrafts ?? [];
      const d = database.purchaseDrafts.find((item) => item.id === id);
      if (d) {
        d.planCode = plan.code;
        d.seats = seats;
        d.cycle = selection.cycle;
        d.amount = amount;
        return { ...d };
      }
      return draft;
    });

    return mockOk<PurchaseDraft>(updated);
  },

  cancelDraft: async (id: string) => {
    const db = getDb();
    const drafts = db.purchaseDrafts ?? [];
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return mockFail(404, 'Không tìm thấy bản nháp mua hàng.');

    updateDb((database) => {
      database.purchaseDrafts = database.purchaseDrafts ?? [];
      const d = database.purchaseDrafts.find((item) => item.id === id);
      if (d) d.status = 'CANCELLED';
    });

    return mockOk({ cancelled: true });
  },
};
