import { PERMISSIONS } from '../../../../hooks/use-permission';
import { ROLES } from '../../../../lib/roles';
import { ROLE_DESCRIPTIONS, assignableRoles } from '../../../../lib/role-policy';
import { getDb, updateDb } from '../../mock-store';
import { badRequest, matchesSearch, paginate, pageRequest } from '../http';
import { listMembers } from '../members-logic';
import { activeRequirementSet } from '../org-logic';
import { route } from '../router';
import { recordAudit } from './audit';

/** Organization settings, overview, roles reference and audit log (spec ADM-01, ADM-05, ADM-07, ADM-11). */

const P = PERMISSIONS;
const OWNER_OR_ADMIN = { roles: [ROLES.OWNER] };

route('GET', '/organization', (context) => {
  const data = context.org();
  const owner = listMembers(data).find((m) => m.roles.includes(ROLES.OWNER));
  return { id: data.organizationId, ...data.settings, ownerName: owner?.fullName };
}, OWNER_OR_ADMIN);

route('PUT', '/organization/settings', (context) => context.update((data) => {
  const { body, session } = context;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (name.length < 2) throw badRequest('Tên tổ chức cần ít nhất 2 ký tự.');
  const days = Number(body.defaultAssignmentDays);
  if (!Number.isInteger(days) || days < 1 || days > 365) throw badRequest('Thời hạn hoàn thành mặc định phải từ 1 đến 365 ngày.');
  data.settings = {
    name,
    industry: String(body.industry ?? data.settings.industry),
    size: String(body.size ?? data.settings.size),
    timezone: String(body.timezone ?? data.settings.timezone),
    defaultAssignmentDays: days,
  };
  // An organization created through sign-up keeps its name in the mock database too (session reads it from there).
  updateDb((db) => {
    const registered = db.organizations.find((org) => org.id === data.organizationId);
    if (registered) Object.assign(registered, { name, industry: data.settings.industry, size: data.settings.size });
  });
  recordAudit(data, session, 'ORGANIZATION_UPDATED', 'Tổ chức', name);
  return { id: data.organizationId, ...data.settings };
}), { permission: P.BUSINESS_CONFIG_MANAGE, message: 'Đã lưu cài đặt tổ chức.' });

route('GET', '/organization/overview', (context) => {
  const data = context.org();
  const members = listMembers(data);
  const count = (status: string) => members.filter((m) => m.status === status).length;
  const positions = data.positions.filter((p) => p.status === 'ACTIVE');
  const withRequirements = positions.filter((p) => activeRequirementSet(data, p.id)).length;
  const subscription = context.session.subscription;
  const registered = getDb().organizations.find((org) => org.id === data.organizationId);

  // Grade distribution
  const employees = data.employees.filter((e) => e.status === 'ACTIVE');
  const posMap = new Map(data.positions.map((p) => [p.id, p]));
  const gradeCounts: Record<string, number> = { G1: 0, G2: 0, G3: 0 };
  for (const emp of employees) {
    if (emp.jobPositionId) {
      const pos = posMap.get(emp.jobPositionId);
      if (pos?.jobGrade && gradeCounts[pos.jobGrade] !== undefined) {
        gradeCounts[pos.jobGrade]++;
      }
    }
  }
  const totalWithGrade = Object.values(gradeCounts).reduce((a, b) => a + b, 0) || 1;
  const gradeDistribution = (data.jobGrades ?? []).map((jg) => ({
    code: jg.code,
    name: jg.name,
    count: gradeCounts[jg.code] ?? 0,
    percentage: Math.round(((gradeCounts[jg.code] ?? 0) / totalWithGrade) * 100),
  }));

  const pendingSubmissions = (data.submissions ?? []).filter((s) => s.status === 'PENDING_REVIEW').length;
  const runningBatches = (data.internalCourses ?? []).length;

  return {
    name: data.settings.name,
    members: { active: count('ACTIVE'), pending: count('PENDING'), inactive: count('INACTIVE') },
    seats: { used: members.filter((m) => m.status !== 'INACTIVE').length, limit: subscription?.seatLimit ?? null },
    plan: subscription ? { name: subscription.planName, renewsAt: subscription.renewsAt, status: subscription.status } : null,
    gradeDistribution,
    pendingReviews: pendingSubmissions,
    runningBatches,
    setup: [
      { key: 'departments', label: 'Phòng ban', done: data.departments.some((d) => d.status === 'ACTIVE'), detail: `${data.departments.filter((d) => d.status === 'ACTIVE').length} phòng ban`, path: '/enterprise/departments' },
      { key: 'positions', label: 'Vị trí công việc', done: positions.length > 0, detail: `${positions.length} vị trí`, path: '/enterprise/positions' },
      { key: 'requirements', label: 'Yêu cầu năng lực theo vị trí', done: positions.length > 0 && withRequirements === positions.length, detail: `${withRequirements}/${positions.length} vị trí đã có yêu cầu đang áp dụng`, path: '/enterprise/positions/requirements' },
      { key: 'members', label: 'Thành viên', done: count('ACTIVE') > 1, detail: `${count('ACTIVE')} đang hoạt động, ${count('PENDING')} chờ kích hoạt`, path: '/enterprise/members' },
    ],
    recentActivity: data.audit.slice(0, 5),
    setupCompleted: registered?.setupCompleted ?? true,
  };
}, OWNER_OR_ADMIN);


route('GET', '/roles', (context) => {
  const data = context.org();
  const members = listMembers(data).filter((m) => m.kind === 'member' && m.status === 'ACTIVE');
  const grantable = assignableRoles(context.session.roles);
  return ROLE_DESCRIPTIONS.map((description) => ({
    ...description,
    memberCount: members.filter((m) => m.roles.includes(description.role)).length,
    assignable: grantable.some((role) => role === description.role),
  }));
}, { permission: P.ROLE_READ });

route('GET', '/organization/audit-log', ({ org, query }) => {
  const entries = org().audit
    .filter((entry) => (!query.action || entry.action === query.action)
      && (matchesSearch(entry.targetLabel, query.search) || matchesSearch(entry.actorName, query.search) || matchesSearch(entry.detail, query.search)));
  return paginate(entries, pageRequest(query));
}, { permission: P.AUDIT_LOG_READ_SYSTEM });
