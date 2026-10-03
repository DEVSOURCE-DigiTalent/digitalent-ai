import { PERMISSIONS } from '../../../../hooks/use-permission';
import { CATEGORIES, CATEGORY_BY_ID, COMPETENCY_BY_ID, COURSES, COURSE_BY_ID } from '../catalog';
import { recommendCourses } from '../engine';
import { badRequest, conflict, notFound, paginate, pageRequest } from '../http';
import { enrollmentsFor, ensureLatestRun } from '../org-logic';
import { route } from '../router';
import type { EmployeeRecord, OrgData, SkillGapRunRecord } from '../types';
import { recordAudit } from './audit';
import { assignCourse, defaultDueDate, assignmentRow, isOverdue } from './learning';
import { employeesInScope } from './structure';

/** Aggregated skill gap analytics, recommendation review and the capability dashboard (spec LCA-01, LCA-10, LCA-11). */

const P = PERMISSIONS;

interface Snapshot {
  employee: EmployeeRecord;
  run: SkillGapRunRecord;
}

/** Latest snapshot of every active employee in scope that can have one. */
function snapshots(data: OrgData, context: { session: Parameters<typeof employeesInScope>[0]['session'] }, filter: { departmentId?: string; jobPositionId?: string; jobGrade?: string }): Snapshot[] {
  return employeesInScope({ org: () => data, session: context.session })
    .filter((e) => {
      if (e.status !== 'ACTIVE') return false;
      if (filter.departmentId && e.departmentId !== filter.departmentId) return false;
      if (filter.jobPositionId && e.jobPositionId !== filter.jobPositionId) return false;
      if (filter.jobGrade) {
        const pos = data.positions.find((p) => p.id === e.jobPositionId);
        if (pos?.jobGrade !== filter.jobGrade) return false;
      }
      return true;
    })
    .flatMap((employee) => {
      const run = ensureLatestRun(data, employee.id);
      return run ? [{ employee, run }] : [];
    });
}

const average = (values: number[]) => (values.length ? Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100 : 0);

function groupStats(rows: Snapshot[]) {
  const runs = rows.map((r) => r.run.summary);
  return {
    employees: rows.length,
    averageCoverage: average(runs.map((s) => s.coveragePercent)),
    totalGaps: runs.reduce((sum, s) => sum + s.totalGap, 0),
    highCount: runs.reduce((sum, s) => sum + s.highCount, 0),
    mediumCount: runs.reduce((sum, s) => sum + s.mediumCount, 0),
    lowCount: runs.reduce((sum, s) => sum + s.lowCount, 0),
    employeesWithHigh: runs.filter((s) => s.highCount > 0).length,
  };
}

route('GET', '/intelligence/analytics/overview', (context) => context.update((data) => {
  const { query } = context;
  const rows = snapshots(data, context, query);
  const groupBy = query.groupBy === 'position' ? 'position' : query.groupBy === 'grade' ? 'grade' : 'department';
  const keys = groupBy === 'position'
    ? data.positions.filter((p) => p.status === 'ACTIVE').map((p) => ({ id: p.id, name: p.name }))
    : groupBy === 'grade'
      ? ['G1', 'G2', 'G3'].map((g) => ({ id: g, name: `Cấp bậc ${g}` }))
      : data.departments.filter((d) => d.status === 'ACTIVE').map((d) => ({ id: d.id, name: d.name }));
  const groups = keys
    .map((key) => {
      const members = rows.filter(({ employee }) => {
        if (groupBy === 'position') return employee.jobPositionId === key.id;
        if (groupBy === 'grade') {
          const pos = data.positions.find((p) => p.id === employee.jobPositionId);
          return pos?.jobGrade === key.id;
        }
        return employee.departmentId === key.id;
      });
      return { ...key, ...groupStats(members) };
    })
    .filter((group) => group.employees > 0)
    .sort((a, b) => a.averageCoverage - b.averageCoverage);
  return { groupBy, totals: groupStats(rows), groups };
}), { permission: P.SKILL_GAP_READ });

route('GET', '/intelligence/analytics/competencies', (context) => context.update((data) => {
  const rows = snapshots(data, context, context.query);
  const byCompetency = new Map<string, { required: number[]; current: number[]; high: number; medium: number; low: number; withGap: number }>();
  for (const { run } of rows) {
    for (const item of run.items) {
      const stats = byCompetency.get(item.competencyId) ?? { required: [], current: [], high: 0, medium: 0, low: 0, withGap: 0 };
      stats.required.push(item.requiredLevel);
      stats.current.push(item.currentLevel ?? 0);
      if (item.gapSteps > 0) stats.withGap += 1;
      if (item.severity === 'HIGH') stats.high += 1;
      if (item.severity === 'MEDIUM') stats.medium += 1;
      if (item.severity === 'LOW') stats.low += 1;
      byCompetency.set(item.competencyId, stats);
    }
  }
  return [...byCompetency.entries()]
    .map(([competencyId, stats]) => {
      const competency = COMPETENCY_BY_ID.get(competencyId)!;
      return {
        competencyId,
        frameworkCode: competency.frameworkCode,
        name: competency.name,
        categoryName: CATEGORIES.find((c) => c.id === competency.categoryId)?.name,
        employeesRequired: stats.required.length,
        employeesWithGap: stats.withGap,
        highCount: stats.high,
        mediumCount: stats.medium,
        lowCount: stats.low,
        averageRequiredLevel: average(stats.required),
        averageCurrentLevel: average(stats.current),
      };
    })
    .sort((a, b) => b.highCount - a.highCount || b.employeesWithGap - a.employeesWithGap || a.frameworkCode.localeCompare(b.frameworkCode, undefined, { numeric: true }));
}), { permission: P.SKILL_GAP_READ });

// ── Recommendation review (LCA-11) ──

type ReviewStatus = 'PENDING' | 'ASSIGNED' | 'ACCEPTED' | 'DISMISSED';

function reviewRows(data: OrgData, rows: Snapshot[]) {
  return rows.flatMap(({ employee, run }) => {
    const recommendations = recommendCourses(run.items, enrollmentsFor(data, employee.id), 3);
    return recommendations.map((recommendation) => {
      const decision = data.decisions.find((d) => d.employeeId === employee.id && d.courseId === recommendation.courseId);
      const status: ReviewStatus = decision ? decision.status : recommendation.enrollmentStatus ? 'ASSIGNED' : 'PENDING';
      return {
        employeeId: employee.id,
        employeeName: employee.fullName,
        employeeCode: employee.employeeCode,
        departmentName: data.departments.find((d) => d.id === employee.departmentId)?.name,
        positionName: data.positions.find((p) => p.id === employee.jobPositionId)?.name,
        courseId: recommendation.courseId,
        courseCode: recommendation.courseCode,
        title: recommendation.title,
        score: recommendation.score,
        gapsClosed: recommendation.reasons.length,
        mandatoryClosed: recommendation.reasons.filter((r) => r.mandatory).length,
        highClosed: recommendation.reasons.filter((r) => r.severity === 'HIGH').length,
        explanation: recommendation.explanation,
        reasons: recommendation.reasons.map((r) => `${r.competencyName}: ${r.currentLevel ?? 0} → ${r.courseTargetLevel}`),
        enrollmentStatus: recommendation.enrollmentStatus,
        status,
        decisionReason: decision?.reason,
        decidedAt: decision?.decidedAt,
        decidedByName: decision?.decidedByName,
      };
    });
  });
}

route('GET', '/intelligence/recommendation-reviews', (context) => context.update((data) => {
  const { query } = context;
  const rows = reviewRows(data, snapshots(data, context, query))
    .filter((row) => (!query.status || row.status === query.status))
    .sort((a, b) => b.highClosed - a.highClosed || b.score - a.score || a.employeeName.localeCompare(b.employeeName, 'vi'));
  return paginate(rows, pageRequest(query));
}), { permission: P.LEARNING_RECOMMENDATION_READ });

function findTarget(data: OrgData, context: { session: Parameters<typeof employeesInScope>[0]['session']; body: Record<string, unknown> }) {
  const employee = employeesInScope({ org: () => data, session: context.session }).find((e) => e.id === context.body.employeeId);
  if (!employee) throw notFound('Không tìm thấy nhân viên.');
  const course = COURSE_BY_ID.get(String(context.body.courseId));
  if (!course) throw notFound('Không tìm thấy khóa học.');
  return { employee, course };
}

function decide(data: OrgData, employeeId: string, courseId: string, decision: { status: 'ACCEPTED' | 'DISMISSED'; reason?: string; by: string }) {
  data.decisions = data.decisions.filter((d) => !(d.employeeId === employeeId && d.courseId === courseId));
  data.decisions.push({ employeeId, courseId, status: decision.status, reason: decision.reason, decidedAt: new Date().toISOString(), decidedByName: decision.by });
}

route('POST', '/intelligence/recommendation-reviews/accept', (context) => context.update((data) => {
  const { employee, course } = findTarget(data, context);
  const dueDate = typeof context.body.dueDate === 'string' && context.body.dueDate ? context.body.dueDate : defaultDueDate(data);
  const result = assignCourse(data, employee, course, { dueDate, assignedByName: context.session.fullName, source: 'RECOMMENDATION' });
  if (!result.assignment) {
    const messages = {
      NOT_ACTIVE: 'Nhân viên không còn hoạt động.', ALREADY_ASSIGNED: 'Khóa học đã được giao cho nhân viên này.',
      ALREADY_COMPLETED: 'Nhân viên đã hoàn thành khóa học này.', PREREQUISITE_NOT_MET: 'Nhân viên chưa đạt điều kiện vào khóa (chưa xong khóa tiên quyết).',
    } as const;
    throw conflict(messages[result.skipped!]);
  }
  decide(data, employee.id, course.id, { status: 'ACCEPTED', by: context.session.fullName });
  recordAudit(data, context.session, 'RECOMMENDATION_ACCEPTED', 'Đề xuất học tập', `${course.code} cho ${employee.fullName}`);
  return assignmentRow(data, result.assignment);
}), { permission: P.COURSE_ASSIGNMENT_CREATE, status: 201, message: 'Đã giao khóa học theo đề xuất.' });

route('POST', '/intelligence/recommendation-reviews/dismiss', (context) => context.update((data) => {
  const { employee, course } = findTarget(data, context);
  const reason = typeof context.body.reason === 'string' ? context.body.reason.trim() : '';
  if (!reason) throw badRequest('Cần nhập lý do khi bỏ qua đề xuất.');
  decide(data, employee.id, course.id, { status: 'DISMISSED', reason, by: context.session.fullName });
  recordAudit(data, context.session, 'RECOMMENDATION_DISMISSED', 'Đề xuất học tập', `${course.code} cho ${employee.fullName}`, reason);
  return { employeeId: employee.id, courseId: course.id, status: 'DISMISSED' };
}), { permission: P.LEARNING_RECOMMENDATION_READ, message: 'Đã bỏ qua đề xuất.' });

route('POST', '/intelligence/recommendation-reviews/reopen', (context) => context.update((data) => {
  const { employee, course } = findTarget(data, context);
  data.decisions = data.decisions.filter((d) => !(d.employeeId === employee.id && d.courseId === course.id));
  return { employeeId: employee.id, courseId: course.id, status: 'PENDING' };
}), { permission: P.LEARNING_RECOMMENDATION_READ, message: 'Đã mở lại đề xuất.' });

// ── Capability dashboard (LCA-01) ──

route('GET', '/intelligence/dashboard', (context) => context.update((data) => {
  const rows = snapshots(data, context, {});
  const stats = groupStats(rows);

  const domains = CATEGORIES.map((category) => {
    const items = rows.flatMap(({ run }) => run.items.filter((item) => COMPETENCY_BY_ID.get(item.competencyId)?.categoryId === category.id));
    return {
      categoryId: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
      averageRequired: average(items.map((i) => i.requiredLevel)),
      averageCurrent: average(items.map((i) => Math.min(i.currentLevel ?? 0, i.requiredLevel))),
    };
  });

  const scoped = new Set(rows.map((r) => r.employee.id));
  const live = data.assignments.filter((a) => a.status !== 'CANCELLED' && scoped.has(a.employeeId));
  const reviews = reviewRows(data, rows);

  return {
    kpis: {
      employees: stats.employees,
      averageCoverage: stats.averageCoverage,
      employeesWithHigh: stats.employeesWithHigh,
      overdueAssignments: live.filter(isOverdue).length,
      completionRate: live.length ? Math.round((live.filter((a) => a.status === 'COMPLETED').length / live.length) * 100) : 0,
      pendingRecommendations: reviews.filter((r) => r.status === 'PENDING').length,
    },
    domains,
    atRisk: rows
      .filter(({ run }) => run.summary.highCount > 0)
      .sort((a, b) => b.run.summary.highCount - a.run.summary.highCount || a.run.summary.coveragePercent - b.run.summary.coveragePercent)
      .slice(0, 5)
      .map(({ employee, run }) => ({
        employeeId: employee.id,
        name: employee.fullName,
        departmentName: data.departments.find((d) => d.id === employee.departmentId)?.name,
        highCount: run.summary.highCount,
        coveragePercent: run.summary.coveragePercent,
      })),
  };
}), { permission: P.DASHBOARD_HR_COMPANY_READ });

// ── Overall Reports & Analytics (spec OW-40) ──

route('GET', '/intelligence/reports/overview', (context) => context.update((data) => {
  const { query } = context;
  const rows = snapshots(data, context, query);
  const scopedEmpIds = new Set(rows.map((r) => r.employee.id));

  // 1. Workforce stats
  const totalEmployees = rows.length;
  const activeEmployees = rows.filter((r) => r.employee.status === 'ACTIVE').length;
  const g1Count = rows.filter((r) => {
    const pos = data.positions.find((p) => p.id === r.employee.jobPositionId);
    return pos?.jobGrade === 'G1';
  }).length;
  const g2Count = rows.filter((r) => {
    const pos = data.positions.find((p) => p.id === r.employee.jobPositionId);
    return pos?.jobGrade === 'G2';
  }).length;
  const g3Count = rows.filter((r) => {
    const pos = data.positions.find((p) => p.id === r.employee.jobPositionId);
    return pos?.jobGrade === 'G3';
  }).length;

  const depts = data.departments.filter((d) => d.status === 'ACTIVE');
  const byDepartment = depts.map((d) => {
    const inDept = rows.filter((r) => r.employee.departmentId === d.id);
    const runs = inDept.map((r) => r.run.summary);
    return {
      id: d.id,
      code: d.code,
      name: d.name,
      employeeCount: inDept.length,
      averageCoverage: average(runs.map((s) => s.coveragePercent)),
    };
  });

  // 2. Training stats
  const liveAssignments = data.assignments.filter((a) => a.status !== 'CANCELLED' && scopedEmpIds.has(a.employeeId));
  const completedAssignments = liveAssignments.filter((a) => a.status === 'COMPLETED').length;
  const inProgressAssignments = liveAssignments.filter((a) => a.status === 'IN_PROGRESS' || a.status === 'READY_FOR_ASSESSMENT').length;
  const totalAssignments = liveAssignments.length;
  const trainingCompletionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  const courseStatsMap = new Map<string, { learnerCount: number; progressSum: number }>();
  for (const a of liveAssignments) {
    const stat = courseStatsMap.get(a.courseId) ?? { learnerCount: 0, progressSum: 0 };
    stat.learnerCount += 1;
    stat.progressSum += a.progressPercent || 0;
    courseStatsMap.set(a.courseId, stat);
  }
  const courses = COURSES
    .filter((c) => courseStatsMap.has(c.id))
    .map((c) => {
      const stat = courseStatsMap.get(c.id)!;
      return {
        id: c.id,
        code: c.code,
        title: c.title,
        domainName: CATEGORY_BY_ID.get(c.categoryId)?.name ?? '',
        learnerCount: stat.learnerCount,
        averageProgress: stat.learnerCount > 0 ? Math.round(stat.progressSum / stat.learnerCount) : 0,
      };
    })
    .sort((a, b) => b.learnerCount - a.learnerCount);

  // 3. Assessment stats
  const attempts = (data.attempts ?? []).filter((att) => scopedEmpIds.has(att.employeeId));
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((att) => att.passed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 1000) / 10 : 0;
  const averageScore = totalAttempts > 0 ? Math.round(attempts.reduce((sum, att) => sum + att.score, 0) / totalAttempts) : 0;
  const attemptKeys = new Set<string>();
  let retakeCount = 0;
  for (const att of attempts) {
    const key = `${att.employeeId}:${att.courseId}`;
    if (attemptKeys.has(key)) retakeCount++;
    else attemptKeys.add(key);
  }
  const excellentAttempts = attempts.filter((att) => att.score >= 85).length;
  const standardAttempts = attempts.filter((att) => att.score >= 70 && att.score < 85).length;
  const failedAttempts = attempts.filter((att) => att.score < 70).length;
  const avgDurationMinutes = totalAttempts > 0
    ? Math.round((attempts.reduce((sum, att) => sum + (att.durationSeconds || 600), 0) / totalAttempts / 60) * 10) / 10
    : 15;

  // 4. Evidence & Practical tasks stats
  const allTasks = (data.tasks ?? []).filter((t) => {
    if (query.departmentId && t.departmentId !== query.departmentId) return false;
    return true;
  });
  const allSubmissions = (data.submissions ?? []).filter((s) => scopedEmpIds.has(s.employeeId));
  const approvedSubmissions = allSubmissions.filter((s) => s.status === 'APPROVED').length;
  const approvalRate = allSubmissions.length > 0 ? Math.round((approvedSubmissions / allSubmissions.length) * 1000) / 10 : 0;

  const evidenceByDept = depts.map((d) => {
    const deptTasks = allTasks.filter((t) => t.departmentId === d.id);
    const deptEmps = new Set(rows.filter((r) => r.employee.departmentId === d.id).map((r) => r.employee.id));
    const deptSubs = allSubmissions.filter((s) => deptEmps.has(s.employeeId));
    const deptApproved = deptSubs.filter((s) => s.status === 'APPROVED').length;
    return {
      departmentId: d.id,
      departmentName: d.name,
      assignedCount: deptTasks.reduce((sum, t) => sum + t.assignedEmployeeIds.length, 0),
      submittedCount: deptSubs.length,
      approvedCount: deptApproved,
      approvalRate: deptSubs.length > 0 ? Math.round((deptApproved / deptSubs.length) * 100) : 0,
    };
  });

  return {
    workforce: {
      totalEmployees,
      activeEmployees,
      departmentsCount: depts.length,
      positionsCount: data.positions.filter((p) => p.status === 'ACTIVE').length,
      g1Count,
      g2Count,
      g3Count,
      byDepartment,
    },
    training: {
      totalAssignments,
      completedAssignments,
      inProgressAssignments,
      completionRate: trainingCompletionRate,
      courses,
    },
    assessment: {
      totalAttempts,
      passRate,
      averageScore,
      retakeCount,
      excellentCount: excellentAttempts,
      excellentPercent: totalAttempts > 0 ? Math.round((excellentAttempts / totalAttempts) * 100) : 0,
      standardCount: standardAttempts,
      standardPercent: totalAttempts > 0 ? Math.round((standardAttempts / totalAttempts) * 100) : 0,
      failedCount: failedAttempts,
      failedPercent: totalAttempts > 0 ? Math.round((failedAttempts / totalAttempts) * 100) : 0,
      averageDurationMinutes: avgDurationMinutes,
      firstTimePassRate: totalAttempts > 0 ? Math.round(((passedAttempts - retakeCount) / Math.max(1, totalAttempts - retakeCount)) * 100) : 0,
    },
    evidence: {
      totalTasks: allTasks.length,
      totalSubmissions: allSubmissions.length,
      approvedCount: approvedSubmissions,
      approvalRate,
      byDepartment: evidenceByDept,
    },
  };
}), { permission: P.SKILL_GAP_READ });

