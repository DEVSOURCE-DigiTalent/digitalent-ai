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
    signerTitle: string;
    signatureData?: string;
    signMethod: 'draw' | 'otp';
  }) => {
    const userId = currentMockUserId();
    if (!userId) return mockFail(401, 'Chưa đăng nhập');

    const user = findUserById(userId);
    if (!user) return mockFail(404, 'Không tìm thấy người dùng');

    const db = getDb();
    // Find the paid order or user's active subscription
    const order = db.orders.find((o) => o.userId === userId && o.status === 'paid');
    const planCode = order?.planCode ?? user.subscription?.planCode ?? 'ENT_STARTER';
    const plan = getPlan(planCode);
    const seats = order?.seats ?? user.subscription?.seatLimit ?? 10;
    const cycle = order?.cycle ?? 'month';
    const amount = order?.amount ?? (plan ? priceFor(plan, seats, cycle) ?? 0 : 0);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const contractNumber = `HD-${dateStr}/DGT-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    const contract: EContract = {
      id: newId('ctr'),
      contractNumber,
      orderId: order?.id ?? newId('ord'),
      userId,
      organizationName: data.organizationName.trim(),
      taxCode: data.taxCode.trim(),
      signerName: user.fullName,
      signerTitle: data.signerTitle.trim() || 'Người đại diện theo pháp luật',
      signatureData: data.signatureData,
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
        // Move enterprise from 'contract' step to 'setup' wizard
        u.onboardingStatus = 'setup';
      }
    });

    return mockOk<EContract>(contract, 'Hợp đồng điện tử đã được ký số thành công.');
  },
};
