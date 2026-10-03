import { COMPETENCY_BY_ID } from './catalog';
import {
  computeSkillGapItems, summarize, type CurrentLevels, type EnrollmentStatus, type EnrollmentsByCourse, type RequirementLine,
} from './engine';
import type { OrgData, RequirementSetRecord, SkillGapRunRecord } from './types';

/** Queries and calculations over one organization's data, shared by the handlers and the seed. */

export function activeRequirementSet(data: OrgData, jobPositionId: string | undefined): RequirementSetRecord | undefined {
  return jobPositionId
    ? data.requirementSets.find((set) => set.jobPositionId === jobPositionId && set.status === 'ACTIVE')
    : undefined;
}

export function currentLevels(data: OrgData, employeeId: string): CurrentLevels {
  const profile = data.profiles[employeeId] ?? {};
  return new Map(Object.entries(profile).map(([competencyId, entry]) => [competencyId, entry.level]));
}

export function toRequirementLines(set: RequirementSetRecord): RequirementLine[] {
  return set.items
    .filter((item) => COMPETENCY_BY_ID.has(item.competencyId))
    .map((item) => ({
      competencyId: item.competencyId,
      requiredLevel: item.requiredLevel,
      weightPercent: item.weightPercent,
      isMandatory: item.isMandatory,
    }));
}

/** Enrollment status per course for the employee: the latest live assignment of each course. */
export function enrollmentsFor(data: OrgData, employeeId: string): EnrollmentsByCourse {
  const map = new Map<string, EnrollmentStatus>();
  for (const assignment of data.assignments) {
    if (assignment.employeeId !== employeeId || assignment.status === 'CANCELLED') continue;
    map.set(assignment.courseId, assignment.status);
  }
  return map;
}

export function latestRun(data: OrgData, employeeId: string): SkillGapRunRecord | undefined {
  return data.skillGapRuns
    .filter((run) => run.employeeId === employeeId)
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
}

/** Reasons a skill gap cannot be calculated for an employee, as the backend reports them (`errors[].message`). */
export type SkillGapBlocker = 'NO_JOB_POSITION' | 'NO_ACTIVE_REQUIREMENT_SET' | 'EMPLOYEE_NOT_ACTIVE';

export function skillGapBlocker(data: OrgData, employeeId: string): SkillGapBlocker | undefined {
  const employee = data.employees.find((e) => e.id === employeeId);
  if (!employee || employee.status !== 'ACTIVE') return 'EMPLOYEE_NOT_ACTIVE';
  if (!employee.jobPositionId) return 'NO_JOB_POSITION';
  return activeRequirementSet(data, employee.jobPositionId) ? undefined : 'NO_ACTIVE_REQUIREMENT_SET';
}

/** Calculates a new snapshot from the current profile and the active requirement set, and stores it. */
export function calculateRun(
  data: OrgData,
  employeeId: string,
  generatedBy: SkillGapRunRecord['generatedBy'],
  now = new Date().toISOString(),
): SkillGapRunRecord {
  const employee = data.employees.find((e) => e.id === employeeId)!;
  const set = activeRequirementSet(data, employee.jobPositionId)!;
  const items = computeSkillGapItems(toRequirementLines(set), currentLevels(data, employeeId));
  const run: SkillGapRunRecord = {
    runId: `run-${employeeId}-${data.skillGapRuns.filter((r) => r.employeeId === employeeId).length + 1}`,
    employeeId,
    requirementSetId: set.id,
    requirementSetVersionNo: set.versionNo,
    generatedAt: now,
    generatedBy,
    items,
    summary: summarize(items),
  };
  data.skillGapRuns.push(run);
  return run;
}

/** The newest snapshot; calculates one when the employee can have one and has none yet. */
export function ensureLatestRun(data: OrgData, employeeId: string): SkillGapRunRecord | undefined {
  return latestRun(data, employeeId) ?? (skillGapBlocker(data, employeeId) ? undefined : calculateRun(data, employeeId, 'SYSTEM'));
}
