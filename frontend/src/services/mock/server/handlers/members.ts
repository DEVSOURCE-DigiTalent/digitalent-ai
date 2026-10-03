import { PERMISSIONS } from '../../../../hooks/use-permission';
import { assignableRoles, canManageMember } from '../../../../lib/role-policy';
import { ROLES } from '../../../../lib/roles';
import type { InviteResult, MemberRole } from '../../../../types/commerce';
import { findMockAccountByEmail } from '../../mock-accounts';
import { findUserByEmail, getDb, newToken, updateDb } from '../../mock-store';
import { badRequest, conflict, forbidden, matchesSearch, notFound, paginate, pageRequest } from '../http';
import { activeHolders, listMembers, seatsInUse, type MemberView } from '../members-logic';
import { route, type RequestContext } from '../router';
import type { EmployeeRecord, OrgData } from '../types';
import { recordAudit } from './audit';

/** People with access to the organization: list, detail, invitations, role changes, deactivation (spec ADM-02 to ADM-05, FLOW-02, FLOW-08). */

const P = PERMISSIONS;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_NAMES: Record<string, string> = {
  OWNER: 'Chủ doanh nghiệp',
  MANAGER: 'Quản lý',
  EMPLOYEE: 'Nhân viên',
};
const roleName = (roles: string[]) => roles.map((r) => ROLE_NAMES[r] ?? r).join(', ');

function findMember(data: OrgData, id: string): MemberView {
  const member = listMembers(data).find((m) => m.id === id);
  if (!member) throw notFound('Không tìm thấy thành viên.');
  return member;
}

function toListItem(member: MemberView) {
  return { ...member };
}

route('GET', '/members', ({ org, query }) => {
  const rows = listMembers(org())
    .filter((m) => (!query.status || m.status === query.status)
      && (!query.role || m.roles.includes(query.role))
      && (!query.departmentId || m.departmentId === query.departmentId)
      && (!query.jobPositionId || m.jobPositionId === query.jobPositionId)
      && (!query.jobGrade || m.jobGrade === query.jobGrade)
      && (matchesSearch(m.fullName, query.search) || matchesSearch(m.email, query.search) || matchesSearch(m.employeeCode, query.search)))
    .sort((a, b) => Number(a.status === 'PENDING') - Number(b.status === 'PENDING') || a.fullName.localeCompare(b.fullName, 'vi'))
    .map(toListItem);
  return paginate(rows, pageRequest(query));
}, { permission: P.USER_READ });


route('GET', '/members/:id', ({ org, params }) => {
  const data = org();
  const member = findMember(data, params.id);
  const employee = data.employees.find((e) => e.id === member.employeeId);
  const manager = data.employees.find((e) => e.id === employee?.directManagerId);
  const history = data.audit.filter((entry) => entry.targetLabel.includes(member.fullName)).slice(0, 10);
  return { ...member, employeeCode: employee?.employeeCode, directManagerName: manager?.fullName, history };
}, { permission: P.USER_READ });

// ── Invitations (ADM-04) ──

route('POST', '/members/invitations', ({ body, org, session, update }) => {
  const rows = Array.isArray(body.rows) ? (body.rows as Record<string, unknown>[]) : [];
  if (rows.length === 0) throw badRequest('Chưa có ai để mời.');
  const allowed = assignableRoles(session.roles);
  const data = org();
  const seatLimit = session.subscription?.seatLimit;

  return update((live) => {
    const result: InviteResult = { created: [], rejected: [] };
    let used = seatsInUse(live);
    const taken = new Set(listMembers(live).map((m) => m.email.toLowerCase()));

    for (const row of rows) {
      const email = String(row.email ?? '').trim().toLowerCase();
      const fullName = String(row.fullName ?? '').trim();
      const role = String(row.role ?? 'EMPLOYEE') as MemberRole;
      const reject = (reason: string) => result.rejected.push({ email, reason });

      if (!EMAIL_PATTERN.test(email)) reject('Email không hợp lệ.');
      else if (!fullName) reject('Thiếu họ tên.');
      else if (!allowed.some((r) => r === role)) reject('Bạn không được cấp vai trò này.');
      else if (taken.has(email) || findMockAccountByEmail(email) || findUserByEmail(email)) reject('Email đã có tài khoản hoặc đã được mời.');
      else if (seatLimit !== undefined && used >= seatLimit) reject('Đã hết quyền sử dụng của gói.');
      else {
        const departmentName = data.departments.find((d) => d.id === row.departmentId)?.name;
        const positionName = data.positions.find((p) => p.id === row.jobPositionId)?.name;
        const invitation = {
          token: newToken(), organizationId: live.organizationId, email, fullName, departmentName, positionName,
          role, status: 'pending' as const, createdAt: new Date().toISOString(),
        };
        updateDb((db) => db.invitations.push(invitation));
        taken.add(email);
        used += 1;
        result.created.push({ token: invitation.token, email, fullName, departmentName, positionName, role, status: 'pending' });
        recordAudit(live, session, 'MEMBER_INVITED', 'Lời mời', fullName, `Vai trò ${roleName([role])}`);
      }
    }
    return result;
  });
}, { permission: P.USER_CREATE, status: 201 });

route('POST', '/members/:id/resend-invitation', ({ params, org, session, update }) => {
  const member = findMember(org(), params.id);
  if (member.kind !== 'invitation') throw conflict('Thành viên này đã kích hoạt tài khoản.');
  return update((data) => {
    const stored = getDb().invitations.find((i) => i.token === member.id);
    if (stored) updateDb(() => { stored.createdAt = new Date().toISOString(); });
    const seed = data.seedInvitations.find((i) => i.id === member.id);
    if (seed) seed.invitedAt = new Date().toISOString();
    recordAudit(data, session, 'INVITATION_RESENT', 'Lời mời', member.fullName);
    return { debugLink: stored ? `/activate/${stored.token}` : undefined };
  });
}, { permission: P.USER_CREATE, message: 'Đã gửi lại lời mời.' });

route('DELETE', '/members/invitations/:id', ({ params, org, session, update }) => {
  const member = findMember(org(), params.id);
  if (member.kind !== 'invitation') throw conflict('Chỉ thu hồi được lời mời chưa kích hoạt.');
  return update((data) => {
    updateDb((db) => { db.invitations = db.invitations.filter((i) => i.token !== member.id); });
    data.seedInvitations = data.seedInvitations.filter((i) => i.id !== member.id);
    recordAudit(data, session, 'INVITATION_REVOKED', 'Lời mời', member.fullName);
    return { id: member.id };
  });
}, { permission: P.USER_CREATE, message: 'Đã thu hồi lời mời.' });

// ── Role and placement (ADM-05) ──

function assertCanManage(context: Pick<RequestContext, 'session'>, member: MemberView) {
  if (!canManageMember(context.session.roles, member.roles)) {
    throw forbidden('Chỉ chủ sở hữu mới quản lý được chủ sở hữu và quản trị tổ chức.');
  }
}

function setRoles(data: OrgData, member: MemberView, roles: string[]) {
  if (data.seedMembers.some((s) => s.id === member.id)) {
    data.memberOverrides[member.id] = { ...data.memberOverrides[member.id], roles };
    return;
  }
  updateDb((db) => { const user = db.users.find((u) => u.id === member.id); if (user) user.roles = roles; });
}

function placeEmployee(data: OrgData, member: MemberView, departmentId?: string, jobPositionId?: string) {
  const employee = data.employees.find((e) => e.id === member.employeeId) ?? data.employees.find((e) => e.userId === member.id);
  if (!employee) return;
  if (departmentId) {
    if (!data.departments.some((d) => d.id === departmentId && d.status === 'ACTIVE')) throw badRequest('Phòng ban không hợp lệ.');
    employee.departmentId = departmentId;
  }
  if (jobPositionId !== undefined) {
    if (jobPositionId && !data.positions.some((p) => p.id === jobPositionId && p.status === 'ACTIVE')) throw badRequest('Vị trí công việc không hợp lệ.');
    employee.jobPositionId = jobPositionId || undefined;
  }
  employee.updatedAt = new Date().toISOString();
}

route('PUT', '/members/:id', (context) => context.update((data) => {
  const { body, params, session } = context;
  const member = findMember(data, params.id);
  if (member.kind !== 'member') throw conflict('Hãy đợi người được mời kích hoạt tài khoản rồi mới đổi vai trò.');
  assertCanManage(context, member);

  if (Array.isArray(body.roles)) {
    if (!session.permissions.includes(P.ROLE_ASSIGN_BUSINESS)) throw forbidden();
    const roles = (body.roles as string[]).filter((r) => assignableRoles(session.roles).some((a) => a === r) || member.roles.includes(r));
    if (roles.length === 0 || roles.length !== (body.roles as string[]).length) throw badRequest('Vai trò không hợp lệ hoặc bạn không được cấp vai trò này.');
    if (member.roles.includes(ROLES.OWNER) && !roles.includes(ROLES.OWNER) && activeHolders(data, ROLES.OWNER).length <= 1) {
      throw conflict('Không thể tước quyền hoặc vô hiệu hóa Chủ sở hữu duy nhất.');
    }
    if (member.id === session.id && !roles.includes(ROLES.OWNER) && activeHolders(data, ROLES.OWNER).length <= 1) {
      throw conflict('Không thể tước quyền hoặc vô hiệu hóa Chủ sở hữu duy nhất.');
    }
    setRoles(data, member, roles);
    recordAudit(data, session, 'ROLE_CHANGED', 'Thành viên', member.fullName, `${roleName(member.roles)} → ${roleName(roles)}`);
  }
  if ('departmentId' in body || 'jobPositionId' in body) {
    placeEmployee(data, member, (body.departmentId as string) || undefined, 'jobPositionId' in body ? ((body.jobPositionId as string) || '') : undefined);
    recordAudit(data, session, 'MEMBER_PLACEMENT_CHANGED', 'Thành viên', member.fullName);
  }
  return toListItem(findMember(data, params.id));
}), { permission: P.USER_UPDATE, message: 'Đã cập nhật thành viên.' });

// ── Offboarding (FLOW-08) ──

function setStatus(data: OrgData, member: MemberView, status: 'ACTIVE' | 'INACTIVE', reason?: string) {
  if (data.seedMembers.some((s) => s.id === member.id)) {
    data.memberOverrides[member.id] = { ...data.memberOverrides[member.id], status, deactivatedReason: reason };
  } else {
    updateDb((db) => {
      const user = db.users.find((u) => u.id === member.id);
      if (user) { user.status = status; user.deactivatedReason = reason; }
    });
  }
  const employee: EmployeeRecord | undefined = data.employees.find((e) => e.id === member.employeeId) ?? data.employees.find((e) => e.userId === member.id);
  if (employee) employee.status = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
}

route('POST', '/members/:id/deactivate', (context) => context.update((data) => {
  const { body, params, session } = context;
  const member = findMember(data, params.id);
  if (member.kind !== 'member') throw conflict('Hãy thu hồi lời mời thay vì vô hiệu hóa.');
  assertCanManage(context, member);
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  if (!reason) throw badRequest('Cần nhập lý do vô hiệu hóa.');
  if (member.id === session.id) throw conflict('Bạn không thể vô hiệu hóa chính mình.');
  if (member.status === 'INACTIVE') throw conflict('Thành viên này đã bị vô hiệu hóa.');
  if (member.roles.includes(ROLES.OWNER) && activeHolders(data, ROLES.OWNER).length <= 1) throw conflict('Không thể tước quyền hoặc vô hiệu hóa Chủ sở hữu duy nhất.');

  setStatus(data, member, 'INACTIVE', reason);
  recordAudit(data, session, 'MEMBER_DEACTIVATED', 'Thành viên', member.fullName, `Lý do: ${reason}`);
  return toListItem(findMember(data, params.id));
}), { permission: P.USER_LOCK_UNLOCK, message: 'Đã vô hiệu hóa thành viên. Lịch sử học tập vẫn được giữ.' });

route('POST', '/members/:id/reactivate', (context) => context.update((data) => {
  const { params, session } = context;
  const member = findMember(data, params.id);
  assertCanManage(context, member);
  if (member.status !== 'INACTIVE') throw conflict('Thành viên này đang hoạt động.');
  const seatLimit = session.subscription?.seatLimit;
  if (seatLimit !== undefined && seatsInUse(data) >= seatLimit) throw conflict('Đã hết quyền sử dụng của gói. Hãy nâng cấp gói hoặc thu hồi lời mời/thành viên.');

  setStatus(data, member, 'ACTIVE');
  recordAudit(data, session, 'MEMBER_REACTIVATED', 'Thành viên', member.fullName);
  return toListItem(findMember(data, params.id));
}), { permission: P.USER_LOCK_UNLOCK, message: 'Đã kích hoạt lại thành viên.' });
