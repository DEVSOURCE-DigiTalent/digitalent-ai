import { WORKSPACES } from '../../lib/roles';
import type { ActivateInvitationInput, InvitationDetail, MemberRole } from '../../types/commerce';
import { findMockAccountByEmail } from './mock-accounts';
import { mockFail, mockOk } from './mock-http';
import { findUserByEmail, getDb, newId, newToken, updateDb } from './mock-store';
import { addEmployeeForMember } from './server/members-logic';
import { updateOrgData } from './server/org-store';

const INVALID = 'Liên kết mời không hợp lệ hoặc đã hết hạn.';

function findInvitation(token: string) {
  return getDb().invitations.find((invitation) => invitation.token === token);
}

export const mockInvitationService = {
  getInvitation: async (token: string) => {
    const invitation = findInvitation(token);
    if (!invitation) return mockFail(404, INVALID);
    const organization = getDb().organizations.find((org) => org.id === invitation.organizationId);
    return mockOk<InvitationDetail>({
      organizationName: organization?.name ?? '',
      email: invitation.email,
      fullName: invitation.fullName,
      role: invitation.role as MemberRole,
      status: invitation.status,
    });
  },

  /** Creates the member's account with the password they chose and activates the pending membership. */
  activate: async ({ token, fullName, password }: ActivateInvitationInput) => {
    const invitation = findInvitation(token);
    if (!invitation || invitation.status !== 'pending') return mockFail(404, INVALID);
    if (findMockAccountByEmail(invitation.email) || findUserByEmail(invitation.email)) {
      return mockFail(409, 'Email này đã có tài khoản.');
    }
    const userId = newId('usr');
    const memberName = fullName.trim() || invitation.fullName;
    updateDb((db) => {
      db.users.push({
        id: userId,
        email: invitation.email,
        password,
        fullName: memberName,
        workspace: WORKSPACES.ENTERPRISE,
        roles: [invitation.role],
        organizationId: invitation.organizationId,
        // The invitation went to this address, so opening it proves the email.
        emailVerified: true,
        verifyToken: newToken(),
      });
      db.invitations.find((i) => i.token === token)!.status = 'accepted';
    });
    updateOrgData(invitation.organizationId, (data) =>
      addEmployeeForMember(data, { userId, fullName: memberName, email: invitation.email }, invitation),
    );
    return mockOk({ email: invitation.email }, 'Đã kích hoạt tài khoản.');
  },
};
