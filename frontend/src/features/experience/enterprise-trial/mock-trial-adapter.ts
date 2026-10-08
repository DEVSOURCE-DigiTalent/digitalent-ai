// Demo state and illustrative results live only in this adapter. They are not measurements.
import type { EnterpriseTrialService, TrialOptions, TrialContextDto, TrialDiagnosticDto, TrialGapResultDto, TrialLearningPathDto, TrialInvitationDto, TrialRegistrationRequest, TrialEligiblePositionDto } from '@/services/enterprise-trial.service';
import { mockOk } from '@/services/mock/mock-http';
import { mockAuthService, currentMockUserId } from '@/services/mock/mock-auth.service';
import { composeSession } from '@/services/mock/server/session';
import { findMockAccountById } from '@/services/mock/mock-accounts';
import { findUserByEmail, newId, newToken, updateDb, type StoredUser } from '@/services/mock/mock-store';
import { ENTITLEMENTS } from '@/lib/entitlements';
import type { SubscriptionContext } from '@/types/session';

const KEY = 'dt-mock-enterprise-guided-trial-v1';
const limits: TrialOptions = { durationDays: 14, maxAccounts: 5, maxDiagnosticAttempts: 1, verificationHours: 24, invitationHours: 72, maxInvitationSends: 3, resendCooldownSeconds: 60, policyVersion: 'demo-v1', policyApproved: false, dataPolicyNotice: 'Dữ liệu minh họa lưu trong trình duyệt này. Hết 14 ngày chỉ đọc. Xóa dữ liệu trình duyệt để xóa demo; nâng cấp cần xác nhận riêng.', enableDevelopmentCapture: true, enableDevelopmentBundle: true, publicAppUrl: 'http://localhost:5173', developmentEnvironment: true };
const readiness = { canRegister: true, productionReady: false, developmentOnly: true, missingReasons: [] };
const catalog: TrialEligiblePositionDto[] = [{ catalogKey: 'demo-crm', name: 'Kinh doanh (CRM)', requirementVersion: 'demo-req-v1', assessmentVersion: 'demo-assessment-v1', rubricVersion: 'demo-rubric-v1', eligible: true, missingReasons: [], developmentOnly: true, requirements: [{ competencyId: 'crm', name: 'Quản lý dữ liệu khách hàng', requiredLevel: 2, minimumAnswers: 2 }, { competencyId: 'privacy', name: 'Bảo vệ dữ liệu', requiredLevel: 2, minimumAnswers: 2 }] }];
interface Invitation extends TrialInvitationDto { employeeId: string | null; sends: number }
interface Trial { ownerId: string; context: TrialContextDto; invitations: Invitation[]; attempts: Record<string, TrialDiagnosticDto>; results: Record<string, TrialGapResultDto>; paths: Record<string, TrialLearningPathDto>; viewed: boolean; conversionRequested: boolean }
interface Registration { form: Omit<TrialRegistrationRequest, 'password'>; expiresAt: string; used: boolean }
interface State { registrations: Record<string, Registration>; trials: Record<string, Trial> }
const empty = (): State => ({ registrations: {}, trials: {} });
function read(): State {
  const value = localStorage.getItem(KEY);
  if (!value) return empty();
  try { return JSON.parse(value) as State; } catch { throw new Error('Dữ liệu demo không đọc được. Xóa dữ liệu demo rồi thử lại.'); }
}
function persist(state: State) { localStorage.setItem(KEY, JSON.stringify(state)); }
function fail(message: string, status = 400): never { throw { response: { status, data: { success: false, message, data: null, errors: [{ message }] } } }; }
const date = () => new Date().toISOString();
const later = (hours: number) => new Date(Date.now() + hours * 3600000).toISOString();
const link = (kind: 'verify' | 'accept', token: string) => `/business/try/${kind}?token=${encodeURIComponent(token)}`;
const password = (value: string) => { if (value.length < 12 || value.length > 72) fail('Mật khẩu cần 12–72 ký tự.'); };
const email = (value: string) => { const normalized = value.trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) fail('Email không hợp lệ.'); return normalized; };
const text = (value: string) => { if (!value.trim() || value.length > 200) fail('Tên bắt buộc, tối đa 200 ký tự.'); return value.trim(); };
function initialTrial(ownerId: string, organizationId: string): Trial {
  return { ownerId, invitations: [], attempts: {}, results: {}, paths: {}, viewed: false, conversionRequested: false, context: { organizationId, status: 'trial_active', startedAt: date(), endsAt: later(limits.durationDays * 24), policyVersion: limits.policyVersion, limits, usage: { accounts: 1, pendingInvitations: 0 }, allowedActions: [], selectedPosition: null, checklist: [], publicationReadiness: readiness } };
}
function addUser(id: string, name: string, address: string, pass: string, org: string, role: string, subscription?: SubscriptionContext) {
  const user: StoredUser = { id, fullName: name, email: address, password: pass, organizationId: org, workspace: 'enterprise', roles: [role], emailVerified: true, verifyToken: '', contractSigned: false, subscription, enterpriseTrialStatus: 'trial_active' };
  updateDb(db => { db.users = [...db.users, user]; });
}
function actor() {
  const id = currentMockUserId(); const session = composeSession(id);
  if (!id || !session || !session.organization) fail('Đăng nhập vào tài khoản trial.', 403);
  return { id, session, org: session.organization.id };
}
function world(write = false) {
  const user = actor(); let state = read(); let trial = state.trials[user.org];
  // Existing seeded owner accounts get an isolated demo workspace, never fabricated employee results.
  if (!trial && findMockAccountById(user.id) && user.session.roles.includes('OWNER')) {
    trial = initialTrial(user.id, user.org); state = { ...state, trials: { ...state.trials, [user.org]: trial } }; persist(state);
  }
  if (!trial) fail('Không có không gian trial cho tài khoản này.', 403);
  if (write && Date.now() >= Date.parse(trial.context.endsAt)) fail('Trial đã hết hạn; lịch sử chỉ đọc.', 403);
  return { ...user, state, trial };
}
type World = ReturnType<typeof world>;
function save(w: World, trial: Trial) { persist({ ...w.state, trials: { ...w.state.trials, [w.org]: trial } }); }
function owner(w: World) { if (w.id !== w.trial.ownerId) fail('Chỉ chủ sở hữu được thực hiện.', 403); }
function employee(w: World) { if (!w.trial.invitations.some(i => i.employeeId === w.id && i.role === 'Employee')) fail('Chỉ nhân viên trial được thực hiện.', 403); }
function reporter(w: World) { if (w.id !== w.trial.ownerId && !w.trial.invitations.some(i => i.employeeId === w.id && i.role === 'Manager')) fail('Bạn không có quyền xem nhóm.', 403); }
function invitationDto(i: Invitation): TrialInvitationDto {
  const state = i.employeeId ? 'accepted' : Date.now() >= Date.parse(i.expiresAt) ? 'expired' : 'pending';
  return { id: i.id, name: i.name, email: i.email, role: i.role, departmentId: i.departmentId, assignedPositionId: i.assignedPositionId, sentAt: i.sentAt, expiresAt: i.expiresAt, state, canResend: !i.employeeId && i.sends < limits.maxInvitationSends && Date.now() >= Date.parse(i.sentAt) + limits.resendCooldownSeconds * 1000, developmentLink: i.employeeId ? null : i.developmentLink };
}
function contextDto(w: World): TrialContextDto {
  const active = Date.now() < Date.parse(w.trial.context.endsAt); const isOwner = w.id === w.trial.ownerId; const isEmployee = w.trial.invitations.some(i => i.employeeId === w.id && i.role === 'Employee');
  const submitted = Object.keys(w.trial.results).length > 0;
  return { ...w.trial.context, status: active ? 'trial_active' : 'trial_read_only', usage: { accounts: 1 + w.trial.invitations.filter(i => i.employeeId).length, pendingInvitations: w.trial.invitations.filter(i => !i.employeeId && Date.parse(i.expiresAt) > Date.now()).length }, allowedActions: active ? isOwner ? ['select_position', 'invite', 'view_results', 'request_conversion'] : isEmployee ? ['diagnostic', 'learning', 'read'] : ['view_results', 'read'] : ['read', ...(isOwner ? ['request_conversion'] : [])], checklist: [{ key: 'position', complete: !!w.trial.context.selectedPosition, nextAction: 'select_position' }, { key: 'invite', complete: w.trial.invitations.length > 0, nextAction: 'invite' }, { key: 'assessment', complete: submitted, nextAction: 'await_assessment' }, { key: 'results', complete: submitted && w.trial.viewed, nextAction: 'view_results' }] };
}
function ownAttempt(w: World) { employee(w); const attempt = w.trial.attempts[w.id]; if (!attempt) fail('Chưa bắt đầu bài đánh giá.'); return attempt; }
function ownPath(w: World) { employee(w); const path = w.trial.paths[w.id]; if (!path) fail('Chưa có lộ trình.'); return path; }
function updatePath(w: World, path: TrialLearningPathDto) { const next = { ...path, items: path.items.map(item => ({ ...item, allowedToStart: item.prerequisites.every(id => path.items.find(p => p.id === id)?.status === 'completed') })) }; save(w, { ...w.trial, paths: { ...w.trial.paths, [w.id]: next } }); return next; }

export const mockEnterpriseTrialService: EnterpriseTrialService = {
  readiness: () => mockOk(readiness), catalog: () => mockOk(catalog),
  register: async form => {
    password(form.password); if (!form.acceptedTerms) fail('Cần đồng ý điều khoản.'); text(form.organizationName); text(form.ownerName); text(form.industry); text(form.size); text(form.goal);
    const address = email(form.email); const state = read();
    if (findUserByEmail(address) || Object.values(state.registrations).some(r => r.form.email === address)) fail('Email đã đăng ký.', 409);
    const token = newToken(); const expiresAt = later(limits.verificationHours);
    const { password: _password, ...safeForm } = form;
    persist({ ...state, registrations: { ...state.registrations, [token]: { form: { ...safeForm, email: address }, expiresAt, used: false } } });
    return mockOk({ state: 'verification_pending', expiresAt, developmentLink: link('verify', token) });
  },
  verify: async (token, pass) => {
    if (!pass) fail('Vui lòng đặt mật khẩu để kích hoạt workspace dùng thử.');
    password(pass);
    const state = read(); const registration = state.registrations[token];
    if (!registration || registration.used || Date.now() >= Date.parse(registration.expiresAt)) fail('Liên kết không hợp lệ, đã dùng hoặc hết hạn.');
    const form = registration.form; const organizationId = newId('trial-org'); const userId = newId('trial-owner');
    const trial = initialTrial(userId, organizationId);
    addUser(userId, form.ownerName, form.email, pass, organizationId, 'OWNER', {
      planCode: 'ENT_TRIAL',
      planName: 'Dùng thử Enterprise',
      status: 'trialing',
      entitlements: [ENTITLEMENTS.PRACTICAL_TASKS, ENTITLEMENTS.PERSONAL_LEARNING_PATH],
      seatLimit: limits.maxAccounts,
      trialStartedAt: trial.context.startedAt,
      trialEndsAt: trial.context.endsAt,
    });
    updateDb(db => { db.organizations = [...db.organizations, { id: organizationId, name: form.organizationName, industry: form.industry, size: form.size, ownerId: userId, departments: [], positions: [], setupCompleted: true }]; });
    persist({ ...state, registrations: { ...state.registrations, [token]: { ...registration, used: true } }, trials: { ...state.trials, [organizationId]: trial } });
    return mockOk({ userId, organizationId, email: form.email, role: 'Owner' });
  },
  accept: async (token, pass) => {
    password(pass); const state = read(); const invitationLink = link('accept', token); const trial = Object.values(state.trials).find(t => t.invitations.some(i => i.developmentLink === invitationLink)); const invitation = trial?.invitations.find(i => i.developmentLink === invitationLink);
    if (!trial || !invitation || invitation.employeeId || Date.now() >= Date.parse(invitation.expiresAt) || Date.now() >= Date.parse(trial.context.endsAt)) fail('Lời mời hết hạn, đã dùng hoặc không hợp lệ.');
    if (findUserByEmail(invitation.email)) fail('Email đã có tài khoản.', 409);
    const userId = newId('trial-member'); addUser(userId, invitation.name, invitation.email, pass, trial.context.organizationId, invitation.role === 'Manager' ? 'MANAGER' : 'EMPLOYEE');
    persist({ ...state, trials: { ...state.trials, [trial.context.organizationId]: { ...trial, invitations: trial.invitations.map(i => i.id === invitation.id ? { ...i, employeeId: userId, developmentLink: null } : i) } } });
    return mockOk({ userId, organizationId: trial.context.organizationId, email: invitation.email, role: invitation.role });
  },
  login: (address, pass) => mockAuthService.login({ email: address, password: pass }), currentUser: () => mockAuthService.getMe(),
  context: async () => mockOk(contextDto(world())),
  selectPosition: async (key, departmentName) => {
    const w = world(true); owner(w); if (w.trial.context.selectedPosition) fail('Vị trí đã được chốt.', 409); const position = catalog.find(p => p.catalogKey === key && p.eligible); if (!position) fail('Vị trí chưa đủ điều kiện.'); text(departmentName);
    const selectedPosition = { positionId: newId('trial-position'), departmentId: newId('trial-department'), name: position.name, requirementVersion: position.requirementVersion };
    save(w, { ...w.trial, context: { ...w.trial.context, selectedPosition } }); return mockOk(contextDto(world()));
  },
  invitations: async () => { const w = world(); reporter(w); return mockOk(w.trial.invitations.map(invitationDto)); },
  invite: async (name, address, role) => {
    const w = world(true); owner(w); const selected = w.trial.context.selectedPosition; if (!selected) fail('Chọn vị trí trước.'); if (!['Employee', 'Manager'].includes(role)) fail('Vai trò không hợp lệ.');
    if (role === 'Manager' && w.trial.invitations.some(i => i.role === 'Manager')) fail('Đã có lời mời quản lý.', 409);
    const normalized = email(address); if (findUserByEmail(normalized) || w.trial.invitations.some(i => i.email === normalized)) fail('Email đã có tài khoản hoặc lời mời.', 409);
    const usage = contextDto(w).usage; if (usage.accounts + usage.pendingInvitations >= limits.maxAccounts) fail('Đã đạt hạn mức ghế.', 409);
    const token = newToken(); const invitation: Invitation = { id: newId('trial-invite'), name: text(name), email: normalized, role, departmentId: selected.departmentId, assignedPositionId: selected.positionId, state: 'pending', sentAt: date(), expiresAt: later(limits.invitationHours), canResend: false, developmentLink: link('accept', token), employeeId: null, sends: 1 };
    save(w, { ...w.trial, invitations: [...w.trial.invitations, invitation] }); return mockOk(invitationDto(invitation));
  },
  resendInvitation: async id => {
    const w = world(true); owner(w); const invitation = w.trial.invitations.find(i => i.id === id); if (!invitation || !invitationDto(invitation).canResend) fail('Chưa thể gửi lại lời mời.', 409);
    const next = { ...invitation, developmentLink: link('accept', newToken()), sentAt: date(), expiresAt: later(limits.invitationHours), sends: invitation.sends + 1 }; save(w, { ...w.trial, invitations: w.trial.invitations.map(i => i.id === id ? next : i) }); return mockOk(invitationDto(next));
  },
  diagnostic: async () => { const w = world(); employee(w); return mockOk(w.trial.attempts[w.id] ?? null); },
  startDiagnostic: async () => {
    const w = world(true); employee(w); if (w.trial.attempts[w.id]) return mockOk(w.trial.attempts[w.id]); const selected = w.trial.context.selectedPosition; if (!selected) fail('Chưa chọn vị trí.');
    const attempt: TrialDiagnosticDto = { attemptId: newId('trial-attempt'), status: 'in_progress', employeeId: w.id, positionId: selected.positionId, positionName: selected.name, requirementVersion: selected.requirementVersion, assessmentVersion: 'demo-assessment-v1', rubricVersion: 'demo-rubric-v1', revision: 0, startedAt: date(), submittedAt: null, savedAnswers: [], questions: [{ id: 'demo-q1', competencyId: 'crm', text: 'Bạn thường ghi nhận thông tin khách hàng ở đâu? (Minh họa thao tác, không chấm năng lực)', options: [{ id: 'a', text: 'Trong CRM' }, { id: 'b', text: 'Trong ghi chú cá nhân' }] }, { id: 'demo-q2', competencyId: 'privacy', text: 'Bạn muốn tìm hiểu bảo vệ dữ liệu khách hàng không?', options: [{ id: 'a', text: 'Có' }, { id: 'b', text: 'Chưa cần' }] }] };
    save(w, { ...w.trial, attempts: { ...w.trial.attempts, [w.id]: attempt } }); return mockOk(attempt);
  },
  saveAnswers: async (id, revision, answers) => {
    const w = world(true); const attempt = ownAttempt(w); if (attempt.attemptId !== id || attempt.revision !== revision || attempt.status !== 'in_progress') fail('Bài đã thay đổi. Tải lại trước khi lưu.', 409);
    if (new Set(answers.map(a => a.questionId)).size !== answers.length || answers.some(a => !attempt.questions.some(q => q.id === a.questionId && q.options.some(o => o.id === a.optionId)))) fail('Câu trả lời không hợp lệ.');
    const next = { ...attempt, revision: revision + 1, savedAnswers: answers }; save(w, { ...w.trial, attempts: { ...w.trial.attempts, [w.id]: next } }); return mockOk(next);
  },
  submitDiagnostic: async id => {
    const w = world(true); const attempt = ownAttempt(w); if (attempt.attemptId !== id) fail('Bài không hợp lệ.'); if (w.trial.results[w.id]) return mockOk(w.trial.results[w.id]);
    // Fixed illustrative classifications; no answer keys or scoring in the frontend.
    const result: TrialGapResultDto = { sourceAttemptId: id, requirementVersion: attempt.requirementVersion, rubricVersion: attempt.rubricVersion, calculationVersion: 'demo-fixture-v1', measuredAt: date(), items: [{ competencyId: 'crm', name: 'Quản lý dữ liệu khách hàng', requiredLevel: 2, currentLevel: 1, gapSteps: 1, classification: 'gap', basis: 'Kết quả minh họa cố định của demo; không phản ánh năng lực người tham gia.' }, { competencyId: 'privacy', name: 'Bảo vệ dữ liệu', requiredLevel: 2, currentLevel: null, gapSteps: null, classification: 'insufficient_data', basis: 'Demo không có phép đo đủ chất lượng để kết luận.' }] };
    const path: TrialLearningPathDto = { id: newId('trial-path'), sourceAttemptId: id, state: 'generated', missingContentReasons: ['Bảo vệ dữ liệu: chưa đủ dữ liệu đo.'], items: [{ id: 'demo-crm-basics', title: 'Ghi nhận dữ liệu khách hàng', version: 'demo-v1', competencyId: 'crm', reasons: ['Minh họa mục học cho khoảng thiếu CRM; không phải khuyến nghị đánh giá thật.'], prerequisites: [], allowedToStart: true, status: 'not_started', progressPercent: 0 }, { id: 'demo-crm-next', title: 'Thực hành quy trình CRM', version: 'demo-v1', competencyId: 'crm', reasons: ['Tiếp nối mục ghi nhận dữ liệu (minh họa).'], prerequisites: ['demo-crm-basics'], allowedToStart: false, status: 'not_started', progressPercent: 0 }] };
    save(w, { ...w.trial, attempts: { ...w.trial.attempts, [w.id]: { ...attempt, status: 'submitted', revision: attempt.revision + 1, submittedAt: date() } }, results: { ...w.trial.results, [w.id]: result }, paths: { ...w.trial.paths, [w.id]: path } }); return mockOk(result);
  },
  result: async () => { const w = world(); employee(w); return mockOk(w.trial.results[w.id] ?? null); },
  path: async () => { const w = world(); employee(w); return mockOk(w.trial.paths[w.id] ?? null); },
  startPathItem: async id => { const w = world(true); const path = ownPath(w); const item = path.items.find(i => i.id === id); if (!item?.allowedToStart) fail('Cần hoàn thành điều kiện tiên quyết.'); return mockOk(updatePath(w, { ...path, items: path.items.map(i => i.id === id && i.status === 'not_started' ? { ...i, status: 'in_progress' } : i) })); },
  progressPathItem: async (id, percent) => { const w = world(true); const path = ownPath(w); const item = path.items.find(i => i.id === id); if (!item || item.status === 'not_started' || !Number.isInteger(percent) || percent < item.progressPercent || percent > 100) fail('Tiến độ không hợp lệ.'); return mockOk(updatePath(w, { ...path, items: path.items.map(i => i.id === id ? { ...i, progressPercent: percent, status: percent === 100 ? 'completed' : 'in_progress' } : i) })); },
  pathContent: async id => { const w = world(); const item = ownPath(w).items.find(i => i.id === id); if (!item?.allowedToStart || item.status === 'not_started') fail('Bắt đầu mục học trước.'); return mockOk({ itemId: id, title: item.title, version: item.version, body: 'Nội dung minh họa: ghi dữ liệu khách hàng có mục đích rõ ràng, kiểm tra tính chính xác và chỉ chia sẻ với người có quyền. Đây là học liệu demo để thử thao tác.' }); },
  results: async () => {
    const w = world(); reporter(w); const rows = w.trial.invitations.map(i => { const attempt = i.employeeId ? w.trial.attempts[i.employeeId] : null; const path = i.employeeId ? w.trial.paths[i.employeeId] : null; return { invitationId: i.id, employeeId: i.employeeId, name: i.name, role: i.role, state: !i.employeeId ? Date.parse(i.expiresAt) <= Date.now() ? 'expired_invitation' : 'pending_invitation' : !attempt ? 'not_started' : !attempt.submittedAt ? 'in_progress' : path?.items.some(p => p.status !== 'not_started') ? 'learning_in_progress' : 'result_available', result: i.employeeId ? w.trial.results[i.employeeId] ?? null : null, path: path ?? null }; });
    if (rows.some(row => row.result) && Date.now() < Date.parse(w.trial.context.endsAt)) save(w, { ...w.trial, viewed: true }); return mockOk(rows);
  },
  requestConversion: async () => { const w = world(); owner(w); save(w, { ...w.trial, conversionRequested: true }); return mockOk(contextDto(world())); },
};
