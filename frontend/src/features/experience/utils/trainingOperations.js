import { ALL_DIGCOMP_COURSES } from '../data/courseCatalog.js';
import { DIGCOMP_AREAS_FULL } from '../data/digcomp15Courses.js';
import { assertAssignmentAllowed } from './platformPolicy.js';
import { FRAMEWORK_VERSION } from '../data/frameworkRegistry.js';

export const COMPETENCIES = DIGCOMP_AREAS_FULL.flatMap(area => area.subCompetencies.map(item => ({ ...item, areaId: area.id })));
export const OPERATIONAL_LEVELS = ['Chưa xác nhận', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const key = organizationId => `digcomp_operations_v22:${organizationId}`;
const id = () => globalThis.crypto.randomUUID();
const now = () => new Date().toISOString();
const empty = () => ({ requirementSets: [], gapRuns: [], assignments: [], enrollments: [], notifications: [], audit: [], profiles: [], tasks: [], submissions: [], evaluations: [], evidences: [], departments: [], directory: [], courseReleases: [], settings: {}, certificateRevocations: [], verificationLogs: [] });
export function readOperations(organizationId) {
  const raw = localStorage.getItem(key(organizationId));
  return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
}
export function commitOperations(organizationId, update) {
  const state = readOperations(organizationId);
  const result = update(state);
  localStorage.setItem(key(organizationId), JSON.stringify(state));
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('digcomp-operations'));
  return result;
}
const commit = commitOperations;
function audit(state, actorId, action, entityId, detail) {
  state.audit.unshift({ id: id(), actorId, action, entityId, detail, createdAt: now() });
}
export function validateRequirements(items) {
  if (items.length < 9 || items.length > 14) throw new Error('Khung phải có từ 9 đến 14 năng lực.');
  if (new Set(items.map(item => item.competencyId)).size !== items.length) throw new Error('Năng lực trong khung không được trùng.');
  if (items.some(item => !COMPETENCIES.some(comp => comp.code === item.competencyId) || ![1,2,3].includes(item.requiredLevel) || !Number.isFinite(item.weight) || item.weight <= 0 || item.weight > 100)) throw new Error('Kiểm tra năng lực, mức 1–3 và trọng số lớn hơn 0.');
  if (Math.abs(items.reduce((sum, item) => sum + item.weight, 0) - 100) > 0.001) throw new Error('Tổng trọng số phải bằng 100%.');
}
export function saveRequirementDraft(organization, positionId, items, actorId) {
  if (!organization.roles.some(position => position.id === positionId)) throw new Error('Vị trí không thuộc doanh nghiệp.');
  return commit(organization.id, state => {
    const version = 1 + Math.max(0, ...state.requirementSets.filter(set => set.positionId === positionId).map(set => set.version));
    const draft = { id: id(), positionId, version, status: 'DRAFT', items: structuredClone(items), createdAt: now(), createdBy: actorId,
      frameworkSnapshot: { referenceFrameworkId: 'DIGCOMP_3_0', sourceFrameworkId: 'TT02_2025', mappingVersion: FRAMEWORK_VERSION, scaleId: 'DIGITALENT_OPERATIONAL_3', alignmentStatus: 'PENDING_EXPERT_REVIEW' } };
    state.requirementSets.push(draft);
    audit(state, actorId, 'Tạo bản nháp khung', draft.id, `Phiên bản ${version}`);
    return draft;
  });
}
export function activateRequirement(organizationId, setId, actorId) {
  return commit(organizationId, state => {
    const target = state.requirementSets.find(set => set.id === setId);
    if (!target || target.status !== 'DRAFT') throw new Error('Chỉ kích hoạt bản nháp.');
    validateRequirements(target.items);
    state.requirementSets.filter(set => set.positionId === target.positionId && set.status === 'ACTIVE').forEach(set => { set.status = 'ARCHIVED'; });
    target.status = 'ACTIVE'; target.activatedAt = now(); target.activatedBy = actorId;
    audit(state, actorId, 'Kích hoạt khung', target.id, `Phiên bản ${target.version}; ${target.items.length} năng lực`);
  });
}
export function calculateGap(organization, employeeId, actorId) {
  return commit(organization.id, state => {
    const employee = organization.employees.find(person => person.id === employeeId);
    const set = state.requirementSets.find(item => item.positionId === employee?.roleId && item.status === 'ACTIVE');
    if (!employee || !set) throw new Error('Cần kích hoạt khung cho vị trí của nhân viên trước.');
    const items = set.items.map(item => {
      const profile = state.profiles.find(profile => profile.employeeId === employeeId && profile.competencyId === item.competencyId);
      const currentLevel = profile?.confirmedLevel ?? null;
      const gap = Math.max(0, item.requiredLevel - (currentLevel ?? 0));
      const mandatoryMultiplier = item.mandatory ? 1.5 : 1;
      return { ...item, currentLevel, gap, mandatoryMultiplier, priority: gap * item.weight * mandatoryMultiplier };
    }).sort((a,b) => b.priority - a.priority);
    const run = { id: id(), employeeId, requirementSetId: set.id, version: set.version, items, createdAt: now(), calculationVersion: 'v22-demo-1',
      frameworkSnapshot: set.frameworkSnapshot ? structuredClone(set.frameworkSnapshot) : { referenceFrameworkId: 'LEGACY_UNSPECIFIED', scaleId: 'DIGITALENT_OPERATIONAL_3' } };
    state.gapRuns.unshift(run);
    audit(state, actorId, 'Phân tích khoảng thiếu', run.id, `${employee.name}; khung v${set.version}`);
    return run;
  });
}
export function assignCourse(organization, employeeId, courseId, dueDate, actorId) {
  const employee = organization.employees.find(person => person.id === employeeId);
  const course = ALL_DIGCOMP_COURSES[courseId];
  if (!employee || !course) throw new Error('Chọn nhân viên và khóa học hợp lệ.');
  if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(Date.parse(dueDate))) throw new Error('Chọn hạn hoàn thành hợp lệ.');
  return commit(organization.id, state => {
    if (state.assignments.some(item => item.employeeId === employeeId && item.courseId === courseId && item.status !== 'CANCELLED') || state.enrollments.some(item => item.employeeId === employeeId && item.courseId === courseId && item.status !== 'CANCELLED')) throw new Error('Nhân viên đã có khóa này. Xem tiến độ trong danh sách.');
    assertAssignmentAllowed(organization, employeeId, courseId, state.assignments);
    const assignment = { id: id(), employeeId, courseId, dueDate, assignedBy: actorId, assignedAt: now(), status: 'ASSIGNED', source: 'MANUAL' };
    state.assignments.unshift(assignment);
    const progressKey = `digcomp_course_progress:${organization.id}:${employeeId}`;
    const progress = JSON.parse(localStorage.getItem(progressKey) || '{}')[courseId];
    const percent = progress?.isCompleted ? 100 : Math.round(course.modules.filter(module => progress?.completedModules?.[module.id]).length / course.modules.length * 100);
    state.enrollments.unshift({ id: id(), assignmentId: assignment.id, employeeId, courseId, dueDate, status: progress?.isCompleted ? 'COMPLETED' : percent ? 'IN_PROGRESS' : 'NOT_STARTED', progress: percent, createdAt: now() });
    state.notifications.unshift({ id: id(), recipientId: employeeId, title: `Khóa được giao: ${course.title}`, message: `Hạn hoàn thành: ${dueDate}`, courseId, read: false, createdAt: now() });
    audit(state, actorId, 'Giao khóa học', assignment.id, `${employee.name} · ${courseId} · ${dueDate}`);
    return assignment;
  });
}
export function syncLearningProgress(user, courseId, progress) {
  if (!user?.employeeId || !user.organizationId) return;
  const course = ALL_DIGCOMP_COURSES[courseId];
  if (!course) return;
  return commit(user.organizationId, state => {
    let enrollment = state.enrollments.find(item => item.employeeId === user.employeeId && item.courseId === courseId && item.status !== 'CANCELLED');
    if (!enrollment) {
      enrollment = { id: id(), employeeId: user.employeeId, courseId, progress: 0, status: 'IN_PROGRESS', createdAt: now() };
      state.enrollments.unshift(enrollment);
      audit(state, user.id, 'Bắt đầu tự học', enrollment.id, courseId);
    }
    const oldStatus = enrollment.status;
    enrollment.progress = progress.isCompleted ? 100 : Math.round(course.modules.filter(module => progress.completedModules?.[module.id]).length / course.modules.length * 100);
    enrollment.status = progress.isCompleted ? 'COMPLETED' : 'IN_PROGRESS';
    enrollment.lastAccessedAt = now();
    if (enrollment.status === 'COMPLETED' && oldStatus !== 'COMPLETED') {
      enrollment.completedAt = now();
      audit(state, user.id, 'Hoàn thành phần học', enrollment.id, `${courseId}; không tự xác nhận năng lực`);
    }
  });
}
export function markNotificationRead(organizationId, notificationId, recipientId) {
  commit(organizationId, state => {
    const item = state.notifications.find(item => item.id === notificationId && item.recipientId === recipientId);
    if (item) { item.read = true; item.readAt = now(); }
  });
}
