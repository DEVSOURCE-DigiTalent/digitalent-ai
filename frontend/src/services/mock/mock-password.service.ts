import type { PasswordResetRequestResult } from '../../types/commerce';
import { mockFail, mockOk } from './mock-http';
import { findUserByEmail, getDb, newToken, updateDb } from './mock-store';

const RESET_TTL_MS = 30 * 60 * 1000;
const INVALID_RESET = 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.';

function validResetEntry(token: string) {
  const entry = getDb().resetTokens.find((t) => t.token === token);
  return entry && new Date(entry.expiresAt).getTime() >= Date.now() ? entry : undefined;
}

export const mockPasswordService = {
  /** Always succeeds, so the answer does not reveal which emails have an account. */
  requestReset: async (email: string) => {
    const user = findUserByEmail(email);
    if (!user) return mockOk<PasswordResetRequestResult>({});
    const token = newToken();
    updateDb((db) => {
      db.resetTokens = db.resetTokens.filter((t) => t.email !== user.email);
      db.resetTokens.push({ token, email: user.email, expiresAt: new Date(Date.now() + RESET_TTL_MS).toISOString() });
    });
    return mockOk<PasswordResetRequestResult>({ debugLink: `/reset-password/${token}` });
  },

  checkResetToken: async (token: string) =>
    validResetEntry(token) ? mockOk(null) : mockFail(400, INVALID_RESET),

  resetPassword: async (token: string, password: string) => {
    const entry = validResetEntry(token);
    if (!entry) return mockFail(400, INVALID_RESET);
    updateDb((db) => {
      const user = db.users.find((u) => u.email === entry.email);
      if (user) user.password = password;
      db.resetTokens = db.resetTokens.filter((t) => t.token !== token);
    });
    return mockOk(null, 'Đã đặt lại mật khẩu.');
  },

  verifyEmail: async (token: string) => {
    const user = getDb().users.find((u) => u.verifyToken === token);
    if (!user) return mockFail(400, 'Liên kết xác minh không hợp lệ.');
    updateDb((db) => {
      db.users.find((u) => u.id === user.id)!.emailVerified = true;
    });
    return mockOk(null, 'Đã xác minh email.');
  },
};
