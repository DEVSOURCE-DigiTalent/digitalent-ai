import type { LoginRequest, LoginResponse } from '../../types/auth';
import type { SessionUser } from '../../types/session';
import { MOCK_PASSWORD, findMockAccountByEmail } from './mock-accounts';
import { mockFail, mockOk } from './mock-http';
import { findUserByEmail } from './mock-store';
import { composeSession, lookupSession } from './server/session';

const TOKEN_PREFIX = 'mock-token:';
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

const WRONG_CREDENTIALS = 'Email hoặc mật khẩu không đúng.';
const DEACTIVATED = 'Tài khoản đã bị vô hiệu hóa. Hãy liên hệ quản trị tổ chức.';

/** Id of the account that matches the credentials: a seeded demo account or one created by a sign-up flow. */
function authenticate({ email, password }: LoginRequest): string | undefined {
  const seeded = findMockAccountByEmail(email);
  if (seeded) return password === MOCK_PASSWORD ? seeded.id : undefined;
  const registered = findUserByEmail(email);
  return registered && registered.password === password ? registered.id : undefined;
}

export const mockAuthService = {
  login: async (credentials: LoginRequest) => {
    const id = authenticate(credentials);
    if (!id) return mockFail(401, WRONG_CREDENTIALS);
    const found = lookupSession(id);
    if ('error' in found) return mockFail(found.error === 'INACTIVE' ? 403 : 401, found.error === 'INACTIVE' ? DEACTIVATED : WRONG_CREDENTIALS);
    const response: LoginResponse = {
      accessToken: `${TOKEN_PREFIX}${id}`,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
    };
    return mockOk(response);
  },

  logout: () => mockOk(null),

  getMe: async () => {
    const session = composeSession(currentMockUserId());
    if (!session) return mockFail(401, 'Phiên đăng nhập không hợp lệ.');
    return mockOk<SessionUser>(session);
  },
};

/** Id of the signed-in mock account, read from the access token. Used by the other mock services. */
export function currentMockUserId(): string | undefined {
  const token = localStorage.getItem('accessToken') ?? '';
  return token.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : undefined;
}
