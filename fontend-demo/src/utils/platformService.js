import { ORGANIZATIONS_KEY, readOrganizations, enterpriseAdmin } from './demoAccess.js';
import { BASE_ROLES, makeRequirements } from '../data/enterpriseDemo.js';
import { JOB_ROLE_BENCHMARKS } from './competenceEngine.js';
import { assignCourse, commitOperations, readOperations } from './trainingOperations.js';
import { BASIC_COURSES, SELLABLE_COURSES, PLANS, organizationAccess, courseAccess } from './platformPolicy.js';
import { readPlatform, savePlatform, uid, timestamp, daysFromNow, platformAudit, normalizeEmail, activeAt, PLATFORM_SESSION } from './platformStore.js';

const saveOrganizations = items => { localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(items)); if (typeof window !== 'undefined') window.dispatchEvent(new Event('digcomp-organizations')); };
const requireAccount = (state, id) => { const account = state.accounts.find(item => item.id === id && item.status === 'VERIFIED'); if (!account) throw new Error('Cần đăng nhập bằng email đã xác thực.'); return account; };
function requireOwner(accountId, organizationId) {
  requireAccount(readPlatform(), accountId);
  const organization = readOrganizations().find(item => item.id === organizationId && item.ownerAccountId === accountId);
  if (!organization) throw new Error('Bạn không có quyền quản trị doanh nghiệp này.');
  return organization;
}
async function passwordHash(password, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
}
function queueVerification(state, account) {
  state.mail.filter(mail => mail.accountId === account.id && mail.kind === 'VERIFY' && !mail.usedAt).forEach(mail => { mail.usedAt = timestamp(); });
  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
  const mail = { id: uid(), kind: 'VERIFY', accountId: account.id, to: account.email, subject: 'Xác thực tài khoản DigiTalent', code, attempts: 0, createdAt: timestamp(), expiresAt: new Date(Date.now() + 15 * 60000).toISOString() };
  state.mail.unshift(mail);
  return mail;
}
export async function registerAccount(form) {
  const email = normalizeEmail(form.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !form.name?.trim()) throw new Error('Nhập họ tên và email hợp lệ.');
  if (!['personal', 'enterprise'].includes(form.type)) throw new Error('Chọn mục đích đăng ký.');
  if (!form.password || form.password.length < 8) throw new Error('Mật khẩu demo cần ít nhất 8 ký tự.');
  if (!form.consent) throw new Error('Cần đồng ý điều kiện sử dụng bản demo.');
  if (form.type === 'enterprise' && (!form.company?.trim() || !form.sector?.trim() || !Number.isInteger(Number(form.size)) || Number(form.size) < 1 || Number(form.size) > 500)) throw new Error('Nhập tên, ngành và quy mô doanh nghiệp từ 1–500 người.');
  if (!JOB_ROLE_BENCHMARKS.some(role => role.roleId === form.targetRole)) throw new Error('Chọn vị trí mục tiêu.');
  const salt = uid();
  const hash = await passwordHash(form.password, salt);
  const state = readPlatform();
  if (state.accounts.some(item => item.email === email)) throw new Error('Email đã đăng ký. Hãy đăng nhập hoặc mở lại bước xác thực.');
  const account = { id: uid(), email, name: form.name.trim(), type: form.type, salt, passwordHash: hash, status: 'PENDING', targetRole: form.targetRole, company: form.company?.trim(), sector: form.sector?.trim(), size: Number(form.size), createdAt: timestamp(), consentAt: timestamp() };
  state.accounts.push(account); queueVerification(state, account); platformAudit(state, account.id, 'Đăng ký', form.type); savePlatform(state);
  return account;
}
export function resendVerification(email) {
  const state = readPlatform();
  const account = state.accounts.find(item => item.email === normalizeEmail(email) && item.status === 'PENDING');
  if (!account) throw new Error('Không có tài khoản đang chờ xác thực với email này.');
  const previous = state.mail.find(mail => mail.accountId === account.id && mail.kind === 'VERIFY');
  if (previous && Date.now() - Date.parse(previous.createdAt) < 30000) throw new Error('Vui lòng chờ 30 giây giữa hai lần gửi mã.');
  queueVerification(state, account); savePlatform(state); return account;
}
export function verifyAccount(email, code) {
  const state = readPlatform();
  const account = state.accounts.find(item => item.email === normalizeEmail(email));
  if (!account || account.status !== 'PENDING') throw new Error('Tài khoản không ở trạng thái chờ xác thực.');
  const mail = state.mail.find(item => item.accountId === account.id && item.kind === 'VERIFY' && !item.usedAt);
  if (!mail || !activeAt(mail.expiresAt) || mail.attempts >= 5) throw new Error('Mã đã hết hạn hoặc quá số lần thử. Hãy gửi lại mã.');
  if (mail.code !== code.trim()) { mail.attempts++; savePlatform(state); throw new Error(`Mã chưa đúng. Còn ${5 - mail.attempts} lần thử.`); }
  account.status = 'VERIFIED'; account.verifiedAt = timestamp(); mail.usedAt = timestamp();
  if (account.type === 'enterprise') {
    const organization = { id: `org-${uid()}`, ownerAccountId: account.id, name: account.company, sector: account.sector, size: account.size, hourlyCost: 100000, roles: BASE_ROLES.map(role => ({ ...role, requirements: makeRequirements(role.benchmark) })), employees: [], orders: [], learningPolicy: { plan: 'trial', courseLimit: 2, allowedCourseIds: ['A1-F', 'A4-F'], expiresAt: daysFromNow(14), configured: false } };
    saveOrganizations([...readOrganizations(), organization]); account.organizationId = organization.id;
  }
  platformAudit(state, account.id, 'Xác thực email', account.email); savePlatform(state); return account;
}
export async function loginAccount(email, password) {
  const account = readPlatform().accounts.find(item => item.email === normalizeEmail(email));
  if (!account || await passwordHash(password, account.salt) !== account.passwordHash) throw new Error('Email hoặc mật khẩu chưa đúng.');
  if (account.status !== 'VERIFIED') { const error = new Error('Email chưa xác thực. Mở bước xác thực để tiếp tục.'); error.pendingEmail = account.email; throw error; }
  return userForAccount(account.id);
}
export function userForAccount(accountId, context) {
  const state = readPlatform(); const account = requireAccount(state, accountId);
  const base = { id: account.id, accountId: account.id, email: account.email, name: account.name, avatar: account.name.charAt(0), benchmarkId: account.targetRole, role: 'personal', roleLabel: 'Người học cá nhân' };
  if (context === 'personal') return base;
  const owned = readOrganizations().find(item => item.ownerAccountId === account.id);
  if (owned && (!context || context === owned.id)) return { ...enterpriseAdmin(owned), accountId: account.id, email: account.email };
  const membership = state.memberships.find(item => item.accountId === account.id && item.status === 'ACTIVE' && (!context || context === item.organizationId));
  const organization = readOrganizations().find(item => item.id === membership?.organizationId);
  const employee = organization?.employees.find(item => item.id === membership?.employeeId);
  const role = organization?.roles.find(item => item.id === employee?.roleId);
  return role ? { ...base, id: employee.id, employeeId: employee.id, organizationId: organization.id, role: 'employee', roleLabel: role.name, benchmarkId: role.benchmark } : base;
}
export function rememberSession(user) { if (user?.accountId) sessionStorage.setItem(PLATFORM_SESSION, JSON.stringify({ accountId: user.accountId, context: user.organizationId || 'personal' })); }
export function restoreSession() { try { const value = JSON.parse(sessionStorage.getItem(PLATFORM_SESSION)); return value ? userForAccount(value.accountId, value.context) : null; } catch { return null; } }
export function clearSession() { sessionStorage.removeItem(PLATFORM_SESSION); }
export function saveLearningPolicy(accountId, organizationId, courseLimit, allowedCourseIds) {
  const organization = requireOwner(accountId, organizationId); const access = organizationAccess(organization);
  if (!Number.isInteger(courseLimit) || courseLimit < 1 || courseLimit > access.maxCourseLimit) throw new Error(`Gói hiện tại cho phép 1–${access.maxCourseLimit} khóa mỗi người.`);
  const permitted = access.plan === 'team' ? SELLABLE_COURSES : BASIC_COURSES;
  if (!allowedCourseIds.length || allowedCourseIds.some(id => !permitted.includes(id))) throw new Error('Chọn ít nhất một khóa thuộc gói đang dùng.');
  const assignments = readOperations(organizationId).assignments.filter(item => item.status !== 'CANCELLED');
  if (assignments.some(item => !allowedCourseIds.includes(item.courseId)) || organization.employees.some(person => assignments.filter(item => item.employeeId === person.id).length > courseLimit)) throw new Error('Cấu hình mới làm mất quyền của khóa đã giao. Hãy thu hồi khóa liên quan trước.');
  const invitations = readPlatform().invitations.filter(item => item.organizationId === organizationId && item.status === 'PENDING' && activeAt(item.expiresAt));
  if (invitations.some(item => item.courseIds.length > courseLimit || item.courseIds.some(id => !allowedCourseIds.includes(id)))) throw new Error('Cấu hình xung đột lời mời đang chờ. Hãy thu hồi lời mời trước.');
  saveOrganizations(readOrganizations().map(item => item.id === organizationId ? { ...item, learningPolicy: { ...item.learningPolicy, courseLimit, allowedCourseIds: [...new Set(allowedCourseIds)], configured: true } } : item));
}
export function inviteEmployee(accountId, organizationId, form) {
  const organization = requireOwner(accountId, organizationId); const access = organizationAccess(organization); const state = readPlatform();
  const email = normalizeEmail(form.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !form.name?.trim() || !organization.roles.some(role => role.id === form.roleId)) throw new Error('Nhập tên, email hợp lệ và vị trí của nhân viên.');
  if (!access.active || !access.configured) throw new Error('Hoàn tất cấu hình gói còn hiệu lực trước khi mời nhân viên.');
  if (email === state.accounts.find(item => item.id === accountId)?.email) throw new Error('Email này đang là chủ doanh nghiệp. Dùng email nhân viên khác.');
  if (state.memberships.some(item => item.organizationId === organizationId && item.email === email && item.status === 'ACTIVE') || state.invitations.some(item => item.organizationId === organizationId && item.email === email && item.status === 'PENDING' && activeAt(item.expiresAt))) throw new Error('Email đã là thành viên hoặc đã có lời mời còn hiệu lực.');
  const used = state.memberships.filter(item => item.organizationId === organizationId && item.status === 'ACTIVE').length + state.invitations.filter(item => item.organizationId === organizationId && item.status === 'PENDING' && activeAt(item.expiresAt)).length;
  if (used >= access.seats) throw new Error('Đã hết chỗ trong gói doanh nghiệp.');
  if (!form.courseIds?.length || form.courseIds.length > access.courseLimit || new Set(form.courseIds).size !== form.courseIds.length || form.courseIds.some(id => !access.allowedCourseIds.includes(id))) throw new Error(`Chọn từ 1 đến ${access.courseLimit} khóa trong cấu hình doanh nghiệp.`);
  const invite = { id: uid(), organizationId, email, name: form.name.trim(), roleId: form.roleId, courseIds: [...form.courseIds], status: 'PENDING', createdAt: timestamp(), expiresAt: daysFromNow(7), createdBy: accountId };
  state.invitations.unshift(invite); state.mail.unshift({ id: uid(), kind: 'INVITE', to: email, invitationId: invite.id, subject: `Lời mời tham gia ${organization.name}`, createdAt: timestamp(), expiresAt: invite.expiresAt });
  platformAudit(state, accountId, 'Mời nhân viên', email); savePlatform(state); return invite;
}
export function cancelInvitation(accountId, invitationId) {
  const state = readPlatform(); const invite = state.invitations.find(item => item.id === invitationId);
  if (!invite) throw new Error('Không tìm thấy lời mời.'); requireOwner(accountId, invite.organizationId);
  if (invite.status !== 'PENDING') throw new Error('Lời mời đã được xử lý.'); invite.status = 'CANCELLED'; savePlatform(state);
}
export function acceptInvitation(accountId, invitationId) {
  const state = readPlatform(); const account = requireAccount(state, accountId); const invite = state.invitations.find(item => item.id === invitationId);
  if (!invite || invite.email !== account.email || invite.status !== 'PENDING' || !activeAt(invite.expiresAt)) throw new Error('Lời mời không hợp lệ, đã hết hạn hoặc không dành cho email này.');
  const organization = readOrganizations().find(item => item.id === invite.organizationId); const access = organizationAccess(organization);
  if (!organization || !access.active || invite.courseIds.length > access.courseLimit || invite.courseIds.some(id => !access.allowedCourseIds.includes(id))) throw new Error('Gói hoặc cấu hình doanh nghiệp đã thay đổi. Liên hệ người quản trị.');
  if (state.memberships.some(item => item.accountId === accountId && item.organizationId === organization.id && item.status === 'ACTIVE')) throw new Error('Bạn đã là thành viên doanh nghiệp.');
  if (state.memberships.filter(item => item.organizationId === organization.id && item.status === 'ACTIVE').length >= access.seats) throw new Error('Doanh nghiệp đã hết chỗ.');
  const employee = { id: `emp-${uid()}`, accountId, email: account.email, name: account.name, roleId: invite.roleId, before: null, after: null, evidence: 'Chưa đánh giá' };
  organization.employees.push(employee);
  state.memberships.push({ id: uid(), accountId, employeeId: employee.id, organizationId: organization.id, email: account.email, status: 'ACTIVE', joinedAt: timestamp() });
  invite.status = 'ACCEPTED'; invite.acceptedAt = timestamp(); platformAudit(state, accountId, 'Nhận lời mời', organization.name);
  saveOrganizations(readOrganizations().map(item => item.id === organization.id ? organization : item)); savePlatform(state);
  invite.courseIds.forEach(courseId => assignCourse(organization, employee.id, courseId, daysFromNow(14).slice(0, 10), `admin-${organization.id}`));
  return userForAccount(accountId, organization.id);
}
export function cancelCourseAssignment(accountId, organizationId, assignmentId) {
  requireOwner(accountId, organizationId);
  commitOperations(organizationId, state => {
    const assignment = state.assignments.find(item => item.id === assignmentId && item.status !== 'CANCELLED');
    if (!assignment) throw new Error('Khóa không còn được giao.');
    assignment.status = 'CANCELLED';
    state.enrollments.filter(item => item.assignmentId === assignment.id).forEach(item => { item.status = 'CANCELLED'; });
    state.notifications.unshift({ id: uid(), recipientId: assignment.employeeId, title: `Đã thu hồi phân bổ ${assignment.courseId}`, message: 'Lịch sử học được giữ lại; quyền tài trợ khóa đã dừng.', read: false, createdAt: timestamp() });
  });
}
export function createOrder(accountId, kind, courseId, organizationId) {
  const state = readPlatform(); requireAccount(state, accountId);
  if (!['personal', 'team', 'course'].includes(kind)) throw new Error('Gói không hợp lệ.');
  if (kind === 'team') requireOwner(accountId, organizationId);
  if (kind === 'course' && (!SELLABLE_COURSES.includes(courseId) || BASIC_COURSES.includes(courseId))) throw new Error('Khóa này chưa mở bán hoặc đã miễn phí.');
  if (kind !== 'team' && (kind === 'personal' ? state.entitlements.some(item => item.accountId === accountId && item.kind === 'personal' && activeAt(item.expiresAt)) : courseAccess(userForAccount(accountId), courseId).allowed)) throw new Error('Bạn đã có quyền học phù hợp.');
  const existing = state.orders.find(item => item.accountId === accountId && item.kind === kind && item.courseId === courseId && item.organizationId === organizationId && item.status === 'PENDING');
  if (existing) return existing;
  const order = { id: uid(), accountId, organizationId, kind, courseId, amount: kind === 'course' ? (courseId.endsWith('-I') ? 390000 : 790000) : PLANS[kind].price, status: 'PENDING', createdAt: timestamp() };
  state.orders.unshift(order); savePlatform(state); return order;
}
export function settleOrder(accountId, orderId, outcome) {
  const state = readPlatform(); requireAccount(state, accountId);
  const order = state.orders.find(item => item.id === orderId && item.accountId === accountId);
  if (!order || order.status !== 'PENDING') throw new Error('Đơn đã được xử lý hoặc không thuộc tài khoản này.');
  if (!['PAID', 'FAILED', 'CANCELLED'].includes(outcome)) throw new Error('Kết quả thanh toán không hợp lệ.');
  let organization;
  if (order.kind === 'team') organization = requireOwner(accountId, order.organizationId);
  if (outcome === 'PAID' && order.kind !== 'team') {
    const duplicate = state.entitlements.some(item => item.accountId === accountId && activeAt(item.expiresAt) && (order.kind === 'personal' ? item.kind === 'personal' : item.courseIds.includes(order.courseId)));
    if (duplicate) throw new Error('Quyền học đã được cấp từ đơn khác. Hãy hủy đơn này.');
    state.entitlements.push({ id: uid(), accountId, orderId, kind: order.kind, courseIds: order.kind === 'course' ? [order.courseId] : [...SELLABLE_COURSES], expiresAt: daysFromNow(order.kind === 'course' ? 365 : 30), createdAt: timestamp() });
  }
  if (outcome === 'PAID' && organization) {
    const expiresAt = new Date(Math.max(Date.now(), organization.learningPolicy?.plan === 'team' ? Date.parse(organization.learningPolicy.expiresAt) || 0 : 0) + 30 * 86400000).toISOString();
    saveOrganizations(readOrganizations().map(item => item.id === organization.id ? { ...item, learningPolicy: { ...item.learningPolicy, plan: 'team', expiresAt } } : item));
  }
  order.status = outcome; order.settledAt = timestamp(); platformAudit(state, accountId, 'Thanh toán mô phỏng', `${order.id}: ${outcome}`); savePlatform(state); return order;
}
