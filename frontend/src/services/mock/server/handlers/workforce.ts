import { PERMISSIONS } from '../../../../hooks/use-permission';
import { CATEGORIES, CATEGORY_BY_ID, COMPETENCIES, COMPETENCY_BY_ID, COURSE_BY_ID } from '../catalog';
import { recommendCourses } from '../engine';
import { matchesSearch, notFound, paginate, pageRequest } from '../http';
import { activeRequirementSet, enrollmentsFor, ensureLatestRun, skillGapBlocker } from '../org-logic';
import { route } from '../router';
import type { EmployeeRecord, OrgData } from '../types';
import { assignmentRow, isOverdue } from './learning';
import { employeeDto, employeesInScope } from './structure';

/** The workforce as the learning administrator sees it (spec LCA-08, LCA-09). */

const P = PERMISSIONS;

function summaryRow(data: OrgData, employee: EmployeeRecord) {
  const run = ensureLatestRun(data, employee.id);
  const assignments = data.assignments.filter((a) => a.employeeId === employee.id && a.status !== 'CANCELLED');
  return {
    ...employeeDto(data, employee),
    hasSnapshot: Boolean(run),
    blocker: skillGapBlocker(data, employee.id) ?? null,
    coveragePercent: run?.summary.coveragePercent ?? null,
    gapCount: run?.summary.totalGap ?? null,
    highCount: run?.summary.highCount ?? null,
    activeCourses: assignments.filter((a) => a.status !== 'COMPLETED').length,
    completedCourses: assignments.filter((a) => a.status === 'COMPLETED').length,
    overdueCourses: assignments.filter(isOverdue).length,
  };
}

route('GET', '/workforce', (context) => context.update((data) => {
  const { query } = context;
  const rows = employeesInScope({ org: () => data, session: context.session })
    .filter((e) => (query.status ? e.status === query.status : e.status === 'ACTIVE' || e.status === 'INACTIVE')
      && (!query.departmentId || e.departmentId === query.departmentId)
      && (!query.jobPositionId || e.jobPositionId === query.jobPositionId)
      && (matchesSearch(e.fullName, query.search) || matchesSearch(e.employeeCode, query.search)))
    .map((e) => summaryRow(data, e))
    .filter((row) => {
      if (query.gap === 'HIGH' && !(row.highCount && row.highCount > 0)) return false;
      if (query.gap === 'ANY' && !(row.gapCount && row.gapCount > 0)) return false;
      if (query.gap === 'NONE' && row.gapCount !== 0) return false;
      if (query.gap === 'UNKNOWN' && row.hasSnapshot) return false;
      if (query.learning === 'OVERDUE' && row.overdueCourses === 0) return false;
      if (query.learning === 'ACTIVE' && row.activeCourses === 0) return false;
      if (query.learning === 'NONE' && row.activeCourses > 0) return false;
      return true;
    })
    .sort((a, b) => (b.highCount ?? -1) - (a.highCount ?? -1) || (b.gapCount ?? -1) - (a.gapCount ?? -1) || a.fullName.localeCompare(b.fullName, 'vi'));
  return paginate(rows, pageRequest(query));
}), { permission: P.EMPLOYEE_READ });

route('GET', '/workforce/:employeeId', (context) => context.update((data) => {
  const employee = employeesInScope({ org: () => data, session: context.session }).find((e) => e.id === context.params.employeeId);
  if (!employee) throw notFound('Không tìm thấy nhân viên.');

  const required = new Map(activeRequirementSet(data, employee.jobPositionId)?.items.map((item) => [item.competencyId, item.requiredLevel]));
  const profile = data.profiles[employee.id] ?? {};
  const run = ensureLatestRun(data, employee.id);
  const assignments = data.assignments
    .filter((a) => a.employeeId === employee.id && a.status !== 'CANCELLED')
    .map((a) => assignmentRow(data, a));

  return {
    employee: employeeDto(data, employee),
    summary: summaryRow(data, employee),
    competencies: COMPETENCIES.map((competency) => {
      const category = CATEGORY_BY_ID.get(competency.categoryId)!;
      const entry = profile[competency.id];
      return {
        competencyId: competency.id,
        frameworkCode: competency.frameworkCode,
        name: competency.name,
        categoryName: category.name,
        categorySortOrder: category.sortOrder,
        currentLevel: entry?.level ?? null,
        requiredLevel: required.get(competency.id) ?? 0,
        source: entry?.source ?? null,
        confirmedAt: entry?.confirmedAt ?? null,
        note: entry?.note ?? null,
      };
    }),
    skillGap: run && {
      runId: run.runId,
      generatedAt: run.generatedAt,
      requirementSetVersionNo: run.requirementSetVersionNo,
      summary: run.summary,
      items: run.items,
    },
    recommendations: run ? recommendCourses(run.items, enrollmentsFor(data, employee.id), 3) : [],
    learning: assignments,
    evidence: Object.entries(profile)
      .map(([competencyId, entry]) => ({
        competencyId,
        competencyName: COMPETENCY_BY_ID.get(competencyId)?.name ?? '',
        frameworkCode: COMPETENCY_BY_ID.get(competencyId)?.frameworkCode ?? '',
        level: entry.level,
        source: entry.source,
        confirmedAt: entry.confirmedAt,
        note: entry.note ?? null,
      }))
      .sort((a, b) => b.confirmedAt.localeCompare(a.confirmedAt)),
    tasks: (data.tasks ?? []).filter((t) => t.assignedEmployeeIds.includes(employee.id)),
    submissions: (data.submissions ?? []).filter((s) => s.employeeId === employee.id),
    assessments: (data.attempts ?? []).filter((a) => a.employeeId === employee.id),
    certificates: (data.certificates ?? []).filter((c) => c.employeeId === employee.id),
    courseTitles: Object.fromEntries(assignments.map((a) => [a.courseId, COURSE_BY_ID.get(a.courseId)?.title ?? ''])),
  };
}), { permission: P.EMPLOYEE_COMPETENCY_PROFILE_READ });

route('GET', '/competency-profiles/matrix', (context) => context.update((data) => {
  const { query, session } = context;
  const employees = employeesInScope({ org: () => data, session })
    .filter((e) => e.status === 'ACTIVE'
      && (!query.departmentId || e.departmentId === query.departmentId)
      && (!query.jobPositionId || e.jobPositionId === query.jobPositionId)
      && (matchesSearch(e.fullName, query.search) || matchesSearch(e.employeeCode, query.search)));

  const categories = CATEGORIES.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    sortOrder: c.sortOrder,
  }));

  const competencies = COMPETENCIES.map((c) => ({
    id: c.id,
    code: c.code,
    frameworkCode: c.frameworkCode,
    name: c.name,
    categoryId: c.categoryId,
  }));

  const matrixEmployees = employees
    .map((e) => {
      const position = data.positions.find((p) => p.id === e.jobPositionId);
      if (query.jobGrade && position?.jobGrade !== query.jobGrade) return null;
      const dept = data.departments.find((d) => d.id === e.departmentId);
      const reqSet = activeRequirementSet(data, e.jobPositionId);
      const requiredMap = new Map(reqSet?.items.map((i) => [i.competencyId, i.requiredLevel]));
      const profile = data.profiles[e.id] ?? {};
      const run = ensureLatestRun(data, e.id);

      const cells: Record<string, { currentLevel: number; requiredLevel: number; gap: number; evidenceSource?: string | null; evidenceStatus?: 'CONFIRMED' | 'PENDING' | 'NONE'; confirmedAt?: string | null }> = {};
      let totalGaps = 0;

      for (const comp of COMPETENCIES) {
        const entry = profile[comp.id];
        const currentLevel = entry?.level ?? 0;
        const requiredLevel = requiredMap.get(comp.id) ?? 0;
        const gap = Math.max(0, requiredLevel - currentLevel);
        if (gap > 0) totalGaps += 1;

        cells[comp.id] = {
          currentLevel,
          requiredLevel,
          gap,
          evidenceSource: (entry?.source as any) ?? null,
          evidenceStatus: entry ? 'CONFIRMED' : 'NONE',
          confirmedAt: entry?.confirmedAt ?? null,
        };
      }

      return {
        employeeId: e.id,
        employeeCode: e.employeeCode,
        fullName: e.fullName,
        departmentId: e.departmentId,
        departmentName: dept?.name ?? '—',
        jobPositionId: e.jobPositionId,
        jobPositionName: position?.name ?? '—',
        jobGrade: position?.jobGrade,
        coveragePercent: run?.summary.coveragePercent ?? null,
        totalGaps,
        cells,
      };
    })
    .filter(Boolean);

  return {
    categories,
    competencies,
    employees: matrixEmployees,
  };
}), { permission: P.EMPLOYEE_COMPETENCY_PROFILE_READ });

