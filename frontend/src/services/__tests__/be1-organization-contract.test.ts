import { afterEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../api-client';
import { invitationService } from '../invitation.service';

function response<T>(data: T) {
  return { data: { success: true, message: 'OK', errors: [], data } };
}

afterEach(() => { vi.restoreAllMocks(); });

describe('BE1 organization wire contracts', () => {
  it('reads and activates an invitation through the public /invitations endpoints', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue(
      response({ organizationName: 'DigiTalent', email: 'an@digitalent.ai', fullName: 'An', role: 'EMPLOYEE', status: 'pending' }),
    );
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue(response({ email: 'an@digitalent.ai', userId: 'user-1', employeeId: null }));

    const invitation = await invitationService.getInvitation('a/b+c');
    const activated = await invitationService.activate({ token: 'a/b+c', fullName: 'An', password: 'MatKhauMoi6789' });

    expect(get).toHaveBeenCalledWith('/invitations/a%2Fb%2Bc');
    expect(post).toHaveBeenCalledWith('/invitations/activate', { token: 'a/b+c', fullName: 'An', password: 'MatKhauMoi6789' });
    expect(invitation.data.data?.organizationName).toBe('DigiTalent');
    expect(activated.data.data?.email).toBe('an@digitalent.ai');
  });
});
