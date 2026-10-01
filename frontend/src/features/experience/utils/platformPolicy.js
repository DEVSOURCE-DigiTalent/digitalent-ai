import { readPlatform, activeAt } from './platformStore.js';
import { readOrganizations } from './demoAccess.js';
import { ALL_DIGCOMP_COURSES } from '../data/courseCatalog.js';

export const BASIC_COURSES = Object.keys(ALL_DIGCOMP_COURSES).filter(id => id.endsWith('-F'));
export const SELLABLE_COURSES = Object.values(ALL_DIGCOMP_COURSES).filter(course => course.isCommerciallyReady || course.id.endsWith('-F')).map(course => course.id);
export const PLANS = {
  personal: { id: 'personal', name: 'Phát triển nghề nghiệp', price: 499000, days: 30, description: '30 ngày học toàn bộ khóa sẵn sàng trong danh mục; giữ lại lịch sử học.' },
  team: { id: 'team', name: 'Doanh nghiệp Growth', price: 1990000, days: 30, seats: 20, courseLimit: 10, description: '20 nhân viên, tối đa 10 khóa được giao mỗi người trong 30 ngày.' },
};
export function organizationAccess(organization) {
  const policy = organization?.learningPolicy;
  if (!policy) return { active: true, seats: 500, courseLimit: 15, allowedCourseIds: Object.keys(ALL_DIGCOMP_COURSES), legacy: true };
  return { ...policy, active: activeAt(policy.expiresAt), seats: policy.plan === 'team' ? PLANS.team.seats : 5, maxCourseLimit: policy.plan === 'team' ? 10 : 2 };
}
export function assertAssignmentAllowed(organization, employeeId, courseId, assignments) {
  if (!organization.ownerAccountId) return;
  const access = organizationAccess(organization);
  const member = readPlatform().memberships.find(item => item.organizationId === organization.id && item.employeeId === employeeId && item.status === 'ACTIVE');
  if (!member) throw new Error('Nhân viên phải xác nhận lời mời trước khi nhận khóa.');
  if (!access.active) throw new Error('Gói đào tạo doanh nghiệp đã hết hạn.');
  if (!access.allowedCourseIds.includes(courseId)) throw new Error('Khóa chưa nằm trong danh mục doanh nghiệp đã cấu hình.');
  if (assignments.filter(item => item.employeeId === employeeId && item.status !== 'CANCELLED').length >= access.courseLimit) throw new Error(`Đã đủ ${access.courseLimit} khóa cho nhân viên này. Hãy điều chỉnh cấu hình hoặc thu hồi khóa.`);
}
export function courseAccess(user, courseId) {
  if (!ALL_DIGCOMP_COURSES[courseId]) return { allowed: false, label: 'Không tìm thấy khóa' };
  if (!user?.accountId) return { allowed: true, label: 'Không gian dữ liệu mẫu' };
  const state = readPlatform();
  const account = state.accounts.find(item => item.id === user.accountId && item.status === 'VERIFIED');
  if (!account) return { allowed: false, label: 'Cần xác thực tài khoản' };
  const organization = readOrganizations().find(item => item.id === user.organizationId);
  if (user.role === 'enterprise_admin' && organization?.ownerAccountId === account.id) return { allowed: true, label: 'Xem trước để biên tập' };
  if (user.employeeId) {
    const member = state.memberships.find(item => item.accountId === account.id && item.employeeId === user.employeeId && item.organizationId === user.organizationId && item.status === 'ACTIVE');
    const policy = organizationAccess(organization);
    let assignments = [];
    try { assignments = JSON.parse(localStorage.getItem(`digcomp_operations_v22:${user.organizationId}`) || '{}').assignments || []; } catch {}
    if (member && policy.active && policy.allowedCourseIds.includes(courseId) && assignments.some(item => item.employeeId === user.employeeId && item.courseId === courseId && item.status !== 'CANCELLED')) return { allowed: true, label: 'Doanh nghiệp tài trợ' };
  }
  if (BASIC_COURSES.includes(courseId)) return { allowed: true, label: 'Cơ bản miễn phí' };
  const entitlement = state.entitlements.find(item => item.accountId === account.id && activeAt(item.expiresAt) && item.courseIds.includes(courseId));
  if (entitlement) return { allowed: true, label: 'Quyền học cá nhân', expiresAt: entitlement.expiresAt };
  return { allowed: false, label: SELLABLE_COURSES.includes(courseId) ? 'Cần mua khóa hoặc gói học' : 'Học thử · chờ thẩm định' };
}
