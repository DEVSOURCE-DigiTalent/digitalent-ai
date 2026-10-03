import { PERMISSIONS } from '../../../../hooks/use-permission';
import type { CourseRecommendationsResult, RecommendationEmptyReason } from '../../../intelligence.service';
import { badRequest, forbidden, notFound, paginate, pageRequest } from '../http';
import { ensureLatestRun, enrollmentsFor, calculateRun, skillGapBlocker, type SkillGapBlocker } from '../org-logic';
import { recommendCourses } from '../engine';
import { route, type RequestContext } from '../router';
import type { EmployeeRecord, OrgData, SkillGapRunRecord } from '../types';
import { employeesInScope } from './structure';

/** Skill gap snapshots and course recommendations (spec Sprint 3, section 4). */

const P = PERMISSIONS;
const CALCULATION_VERSION = 'mock-1';
const MAX_BATCH = 200;

const BLOCKER_MESSAGES: Record<SkillGapBlocker, string> = {
  NO_JOB_POSITION: 'Nhân viên chưa có vị trí công việc.',
  NO_ACTIVE_REQUIREMENT_SET: 'Vị trí của nhân viên chưa có bộ yêu cầu đang áp dụng.',
  EMPLOYEE_NOT_ACTIVE: 'Chỉ tính được skill gap cho nhân viên đang hoạt động.',
};

function listItem(data: OrgData, employee: EmployeeRecord, run: SkillGapRunRecord) {
  return {
    runId: run.runId,
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    employeeName: employee.fullName,
    departmentName: data.departments.find((d) => d.id === employee.departmentId)?.name,
    jobPositionName: data.positions.find((p) => p.id === employee.jobPositionId)?.name,
    requirementSetVersionNo: run.requirementSetVersionNo,
    generatedAt: run.generatedAt,
    generatedBy: run.generatedBy,
    gapCount: run.summary.totalGap,
    highCount: run.summary.highCount,
    coveragePercent: run.summary.coveragePercent,
  };
}

function ownEmployee(context: Pick<RequestContext, 'org' | 'session'>): EmployeeRecord | undefined {
  const id = context.session.id;
  return context.org().employees.find((e) => e.userId === id);
}

route('GET', '/intelligence/skill-gaps', (context) => context.update((data) => {
  const { query } = context;
  const rows = employeesInScope({ org: () => data, session: context.session })
    .filter((e) => (!query.departmentId || e.departmentId === query.departmentId) && (!query.jobPositionId || e.jobPositionId === query.jobPositionId))
    .flatMap((employee) => {
      if (query.latestOnly === 'false') {
        return data.skillGapRuns.filter((r) => r.employeeId === employee.id).map((run) => ({ employee, run }));
      }
      const run = ensureLatestRun(data, employee.id);
      return run ? [{ employee, run }] : [];
    })
    .filter(({ employee }) => !query.employeeId || employee.id === query.employeeId)
    .filter(({ employee }) => !query.search || employee.fullName.toLowerCase().includes(query.search.toLowerCase()) || employee.employeeCode.toLowerCase().includes(query.search.toLowerCase()))
    .map(({ employee, run }) => listItem(data, employee, run))
    .sort((a, b) => b.gapCount - a.gapCount || b.highCount - a.highCount || a.employeeName.localeCompare(b.employeeName, 'vi'));
  return paginate(rows, pageRequest(query));
}), { permission: P.SKILL_GAP_READ });

function runDetail(data: OrgData, employee: EmployeeRecord, run: SkillGapRunRecord) {
  return { ...listItem(data, employee, run), requirementSetId: run.requirementSetId, calculationVersion: CALCULATION_VERSION, summary: run.summary, items: run.items };
}

route('GET', '/intelligence/skill-gaps/me/latest', (context) => context.update((data) => {
  const employee = ownEmployee({ org: () => data, session: context.session });
  if (!employee) return null;
  const run = ensureLatestRun(data, employee.id);
  return run ? runDetail(data, employee, run) : null;
}), { permission: P.SKILL_GAP_READ });

route('GET', '/intelligence/skill-gaps/:runId', (context) => {
  const data = context.org();
  const matchedRun = data.skillGapRuns.find((r) => r.runId === context.params.runId);
  let run = matchedRun;
  let employee = matchedRun ? employeesInScope(context).find((e) => e.id === matchedRun.employeeId) : undefined;

  // Fallback: If not found by runId, check if param is employeeId
  if (!run || !employee) {
    const foundEmp = employeesInScope(context).find((e) => e.id === context.params.runId);
    if (foundEmp) {
      employee = foundEmp;
      run = ensureLatestRun(data, foundEmp.id) ?? undefined;
    }
  }

  if (!run || !employee) throw notFound('Không tìm thấy kết quả skill gap.');
  return runDetail(data, employee, run);
}, { permission: P.SKILL_GAP_READ });

route('POST', '/intelligence/skill-gaps/calculate', (context) => context.update((data) => {
  const employee = employeesInScope({ org: () => data, session: context.session }).find((e) => e.id === context.body.employeeId);
  if (!employee) throw notFound('Không tìm thấy nhân viên.');
  const blocker = skillGapBlocker(data, employee.id);
  if (blocker) throw badRequest(BLOCKER_MESSAGES[blocker], blocker, 'employeeId');
  return runDetail(data, employee, calculateRun(data, employee.id, 'USER_REQUEST'));
}), { permission: P.SKILL_GAP_CALCULATE, status: 201 });

route('POST', '/intelligence/skill-gaps/calculate-batch', (context) => context.update((data) => {
  const { body } = context;
  const targets = employeesInScope({ org: () => data, session: context.session }).filter(
    (e) => e.status === 'ACTIVE' && (!body.departmentId || e.departmentId === body.departmentId) && (!body.jobPositionId || e.jobPositionId === body.jobPositionId),
  );
  if (targets.length > MAX_BATCH) throw badRequest('Quá nhiều nhân viên trong một lần tính.', 'BATCH_TOO_LARGE');

  const runs: { employeeId: string; runId: string; gapCount: number }[] = [];
  const skipped: { employeeId: string; employeeName: string; reason: string }[] = [];
  for (const employee of targets) {
    const blocker = skillGapBlocker(data, employee.id);
    if (blocker) {
      skipped.push({ employeeId: employee.id, employeeName: employee.fullName, reason: blocker });
      continue;
    }
    const run = calculateRun(data, employee.id, 'USER_REQUEST');
    runs.push({ employeeId: employee.id, runId: run.runId, gapCount: run.summary.totalGap });
  }
  return { calculatedCount: runs.length, runs, skipped };
}), { permission: P.SKILL_GAP_CALCULATE });

export function recommendations(data: OrgData, employee: EmployeeRecord | undefined, limit: number): CourseRecommendationsResult {
  const empty = (reason: RecommendationEmptyReason, run?: SkillGapRunRecord): CourseRecommendationsResult => ({
    employeeId: employee?.id ?? null,
    skillGapRunId: run?.runId ?? null,
    generatedAt: run?.generatedAt ?? null,
    scoringConfigVersion: 'v1',
    reason,
    items: [],
  });
  if (!employee) return empty('NO_EMPLOYEE_PROFILE');
  const run = ensureLatestRun(data, employee.id);
  if (!run) return empty('NO_SKILL_GAP_RUN');
  if (run.summary.totalGap === 0) return empty('NO_GAP', run);
  const items = recommendCourses(run.items, enrollmentsFor(data, employee.id), limit);
  if (items.length === 0) return empty('NO_MATCHING_COURSE', run);
  return { employeeId: employee.id, skillGapRunId: run.runId, generatedAt: run.generatedAt, scoringConfigVersion: 'v1', reason: null, items };
}

route('GET', '/intelligence/recommendations', (context) => context.update((data) => {
  const { query } = context;
  const limit = Number(query.limit) || 10;
  const scope = { org: () => data, session: context.session };
  if (!query.employeeId) return recommendations(data, ownEmployee(scope), limit);
  const employee = employeesInScope(scope).find((e) => e.id === query.employeeId);
  if (!employee) throw forbidden('Bạn không xem được gợi ý của nhân viên này.');
  return recommendations(data, employee, limit);
}), { permission: P.LEARNING_RECOMMENDATION_READ });
