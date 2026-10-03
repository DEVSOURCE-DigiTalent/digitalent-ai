import { currentMockUserId } from './mock-auth.service';
import { mockFail, mockOk } from './mock-http';
import { findUserById, getDb, newId, updateDb, type EContract } from './mock-store';
import { getPlan, priceFor } from '../../lib/plans';

const DEMO_OTP = '686868';

export const mockContractService = {
  getContract: async () => {
    const userId = currentMockUserId();
    if (!userId) return mockFail(401, 'Chưa đăng nhập');
    const db = getDb();
    const contract = db.contracts?.find((c) => c.userId === userId);
    return mockOk<EContract | null>(contract ?? null);
  },

  sendOtp: async () => {
    const userId = currentMockUserId();
    if (!userId) return mockFail(401, 'Chưa đăng nhập');
    return mockOk({ sent: true, demoCode: DEMO_OTP }, 'Đã gửi mã xác thực OTP.');
  },

  verifyOtp: async (code: string) => {
    if (code.trim() === DEMO_OTP) {
      return mockOk({ verified: true }, 'Mã OTP chính xác.');
    }
    return mockFail(400, 'Mã OTP không đúng. Mã demo là 686868.');
  },

  signContract: async (data: {
    organizationName: string;
    taxCode: string;
    address?: string;
    signerName?: string;
    signerTitle: string;
    signMethod: 'draw' | 'otp' | 'email_otp';
  }) => {
    const userId = currentMockUserId();
    if (!userId) return mockFail(401, 'Chưa đăng nhập');

    const user = findUserById(userId);
    if (!user) return mockFail(404, 'Không tìm thấy người dùng');

    const db = getDb();
    const draft = db.purchaseDrafts?.find((d) => d.userId === userId && d.status === 'DRAFT');
    const order = db.orders.find((o) => o.userId === userId && o.status === 'paid');
    const planCode = draft?.planCode ?? order?.planCode ?? user.subscription?.planCode ?? user.pendingPlan?.planCode ?? 'ENT_STARTER';
    const plan = getPlan(planCode);
    const seats = draft?.seats ?? order?.seats ?? user.subscription?.seatLimit ?? user.pendingPlan?.seats ?? 10;
    const cycle = draft?.cycle ?? order?.cycle ?? user.pendingPlan?.cycle ?? 'month';
    const amount = draft?.amount ?? order?.amount ?? (plan ? priceFor(plan, seats, cycle) ?? 0 : 0);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = crypto.randomUUID().replace(/-/g, '').slice(0, 4).toUpperCase();
    const contractNumber = `HD-${dateStr}-${randStr}`;

    const contract: EContract = {
      id: newId('ctr'),
      contractNumber,
      orderId: order?.id ?? '',
      draftId: draft?.id,
      userId,
      organizationName: data.organizationName.trim(),
      taxCode: data.taxCode.trim(),
      address: data.address?.trim(),
      signerName: data.signerName?.trim() || user.fullName,
      signerTitle: data.signerTitle.trim() || 'Người đại diện theo pháp luật',
      signMethod: data.signMethod,
      signedAt: now.toISOString(),
      status: 'signed',
      planCode,
      seats,
      cycle,
      amount,
    };

    updateDb((database) => {
      database.contracts = database.contracts ?? [];
      database.contracts.push(contract);

      const u = database.users.find((item) => item.id === userId);
      if (u) {
        // Contract signed: move enterprise user to step 4 (payment / checkout)
        u.contractSigned = true;
        u.onboardingStatus = 'payment';
        u.pendingOrganization = {
          name: data.organizationName.trim(),
          taxCode: data.taxCode.trim(),
          address: data.address?.trim(),
        };
      }

      if (draft) {
        draft.companyInfo = {
          organizationName: data.organizationName.trim(),
          taxCode: data.taxCode.trim(),
          address: data.address?.trim() || '',
          signerName: data.signerName?.trim() || user.fullName,
          signerTitle: data.signerTitle.trim() || 'Người đại diện theo pháp luật',
        };
      }
    });

    return mockOk<EContract>(contract, 'Hợp đồng điện tử đã được xác thực và ký kết thành công.');
  },
};
