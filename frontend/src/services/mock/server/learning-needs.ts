import type { EmployeeLearningNeeds, LearningNeedDomain, LearningNeedsOverview } from '../../intelligence.service';
import { activeRequirementSet } from './org-logic';
import { CATEGORY_BY_ID, COMPETENCY_BY_ID, courseFor } from './catalog';
import type { EmployeeRecord, OrgData } from './types';

export function learningNeedsOverview(employees: EmployeeLearningNeeds[]): LearningNeedsOverview {
  const domains = [...new Set(employees.flatMap((e) => e.domains.map((d) => d.categoryId)))].map((categoryId) => {
    const rows = employees.flatMap((e) => e.domains.filter((d) => d.categoryId === categoryId));
    const missing = rows.filter((d) => d.state === 'NEEDS_LEARNING');
    return {
      categoryId, name: rows[0].name, number: rows[0].number,
      assessed: rows.filter((d) => d.state !== 'WAITING_ASSESSMENT').length,
      met: rows.filter((d) => d.state === 'MET').length,
      waiting: rows.filter((d) => d.state === 'WAITING_ASSESSMENT').length,
      needsLearning: missing.length,
      courses: [...new Set(missing.map((d) => d.requiredLevel))].sort().map((requiredLevel) => {
        const group = missing.filter((d) => d.requiredLevel === requiredLevel);
        return { requiredLevel, courseId: group[0].courseId, courseCode: group[0].courseCode, courseTitle: group[0].courseTitle,
          employees: group.length, missingCompetencies: [...new Set(group.flatMap((d) => d.missingCompetencies))] };
      }),
    };
  }).sort((a, b) => a.number - b.number);
  return { employees: employees.length,
    assessedEmployees: employees.filter((e) => e.domains.some((d) => d.state !== 'WAITING_ASSESSMENT')).length,
    waitingEmployees: employees.filter((e) => e.domains.some((d) => d.state === 'WAITING_ASSESSMENT')).length,
    noStandardEmployees: employees.filter((e) => e.state === 'NO_STANDARD').length,
    domains };
}

/** Compare the published assessment with the live standard, without depending on stale snapshots. */
export function employeeLearningNeeds(data: OrgData, employee: EmployeeRecord): EmployeeLearningNeeds {
  const row: EmployeeLearningNeeds = {
    employeeId: employee.id, employeeName: employee.fullName,
    positionId: employee.jobPositionId,
    positionName: data.positions.find((p) => p.id === employee.jobPositionId)?.name,
    departmentName: data.departments.find((d) => d.id === employee.departmentId)?.name,
    state: 'NO_STANDARD', domains: [],
  };
  const standard = activeRequirementSet(data, employee.jobPositionId);
  if (!standard) return row;
  const assessment = data.overallAssessments?.filter((a) => a.employeeId === employee.id && a.publishedAt && a.reviewedAt <= a.publishedAt)
    .sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt))[0];
  const grouped = new Map<string, typeof standard.items>();
  for (const item of standard.items) {
    const competency = COMPETENCY_BY_ID.get(item.competencyId);
    if (!competency || item.requiredLevel <= 0) continue;
    grouped.set(competency.categoryId, [...(grouped.get(competency.categoryId) ?? []), item]);
  }
  for (const [categoryId, requirements] of grouped) {
    const category = CATEGORY_BY_ID.get(categoryId)!;
    const target = Math.max(...requirements.map((r) => r.requiredLevel));
    const domain: LearningNeedDomain = { categoryId, name: category.name, number: category.sortOrder,
      requiredLevel: target, currentLevel: null, state: 'WAITING_ASSESSMENT', missingCompetencies: [],
      competencies: requirements.map((r) => ({ competencyId: r.competencyId, name: COMPETENCY_BY_ID.get(r.competencyId)!.name, requiredLevel: target, currentLevel: null })) };
    row.domains.push(domain);
    const baseline = assessment?.domains[categoryId];
    if (baseline == null || !assessment) continue;
    domain.assessmentLevel = baseline;
    domain.assessmentReviewedAt = assessment.reviewedAt;
    const levels = requirements.map((requirement) => {
      const profile = data.profiles[employee.id]?.[requirement.competencyId];
      const newerEvidence = profile && profile.confirmedAt > assessment.reviewedAt;
      const level = newerEvidence ? profile.level : baseline;
      const competency = domain.competencies!.find((c) => c.competencyId === requirement.competencyId)!;
      competency.currentLevel = level;
      competency.source = newerEvidence ? 'EVIDENCE' : 'ASSESSMENT';
      competency.confirmedAt = newerEvidence ? profile.confirmedAt : assessment.reviewedAt;
      if (level < target) domain.missingCompetencies.push(COMPETENCY_BY_ID.get(requirement.competencyId)!.name);
      return level;
    });
    domain.currentLevel = Math.min(...levels);
    domain.state = domain.missingCompetencies.length ? 'NEEDS_LEARNING' : 'MET';
    if (domain.state === 'NEEDS_LEARNING') {
      const course = courseFor(categoryId, target);
      domain.courseId = course?.id; domain.courseCode = course?.code; domain.courseTitle = course?.title;
    }
  }
  row.domains.sort((a, b) => a.number - b.number);
  row.state = row.domains.some((d) => d.state === 'NEEDS_LEARNING') ? 'NEEDS_LEARNING'
    : row.domains.some((d) => d.state === 'WAITING_ASSESSMENT') ? 'WAITING_ASSESSMENT'
    : row.domains.length ? 'MET' : 'NO_STANDARD';
  return row;
}
