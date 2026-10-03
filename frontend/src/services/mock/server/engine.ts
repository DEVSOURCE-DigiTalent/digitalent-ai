import type {
  CourseRecommendation, SkillGapItem, SkillGapSeverity, SkillGapSummary,
} from '../../intelligence.service';
import { CATEGORY_BY_ID, COMPETENCY_BY_ID, courseFor } from './catalog';

/**
 * Pure stand-ins for the backend's skill gap and recommendation engines
 * (Application/Services/Intelligence). They follow the rules of the spec
 * (docs/specs/2026-09-29-tt02-position-competency-matrix.md section 7, D-B1 / D-B2 / D-B3), so the screens can
 * be built and checked before the backend is connected. Numbers may differ from the real engine in the last
 * decimals; the rules and the ordering are the same.
 */

export const MANDATORY_MULTIPLIER = 1.5;

/** One line of an active requirement set. */
export interface RequirementLine {
  competencyId: string;
  requiredLevel: number;
  weightPercent: number;
  isMandatory: boolean;
}

/** Confirmed level per competency; a missing entry means "no confirmed level yet". */
export type CurrentLevels = ReadonlyMap<string, number>;

const round2 = (value: number) => Math.round(value * 100) / 100;

/** D-B1: severity depends only on the number of missing levels. */
export function severityOf(gapSteps: number, mandatory: boolean): SkillGapSeverity | null {
  if (gapSteps <= 0) return null;
  if (gapSteps >= 2) return 'HIGH';
  return mandatory ? 'MEDIUM' : 'LOW';
}

export function computeSkillGapItems(lines: RequirementLine[], current: CurrentLevels): SkillGapItem[] {
  const items = lines.map((line): SkillGapItem => {
    const competency = COMPETENCY_BY_ID.get(line.competencyId)!;
    const category = CATEGORY_BY_ID.get(competency.categoryId)!;
    const currentLevel = current.get(line.competencyId);
    const gapSteps = Math.max(0, line.requiredLevel - (currentLevel ?? 0));
    const multiplier = line.isMandatory ? MANDATORY_MULTIPLIER : 1;
    return {
      competencyId: competency.id,
      competencyCode: competency.code,
      competencyName: competency.name,
      categoryName: category.name,
      categorySortOrder: category.sortOrder,
      frameworkCode: competency.frameworkCode,
      requiredLevel: line.requiredLevel,
      currentLevel: currentLevel ?? null,
      gapSteps,
      weightPercent: line.weightPercent,
      mandatory: line.isMandatory,
      mandatoryMultiplier: multiplier,
      priorityScore: round2(gapSteps * line.weightPercent * multiplier),
      severity: severityOf(gapSteps, line.isMandatory),
    };
  });
  return items.sort((a, b) => b.priorityScore - a.priorityScore || a.competencyName.localeCompare(b.competencyName));
}

/** Share of the weighted requirement already met: each line counts weight x min(current / required, 1). */
export function coveragePercent(items: SkillGapItem[]): number {
  const met = items.reduce(
    (sum, item) => sum + item.weightPercent * Math.min((item.currentLevel ?? 0) / item.requiredLevel, 1),
    0,
  );
  const total = items.reduce((sum, item) => sum + item.weightPercent, 0);
  return total === 0 ? 0 : round2((met / total) * 100);
}

export function summarize(items: SkillGapItem[]): SkillGapSummary {
  const gaps = items.filter((item) => item.gapSteps > 0);
  const count = (severity: SkillGapSeverity) => gaps.filter((item) => item.severity === severity).length;
  return {
    totalRequired: items.length,
    totalMet: items.length - gaps.length,
    totalGap: gaps.length,
    highCount: count('HIGH'),
    mediumCount: count('MEDIUM'),
    lowCount: count('LOW'),
    coveragePercent: coveragePercent(items),
    config: { mandatoryMultiplier: MANDATORY_MULTIPLIER },
  };
}

// ── Recommendations ──

const WEIGHT_GAP_PRIORITY = 60;
const WEIGHT_MANDATORY = 25;
const WEIGHT_ENTRY_LEVEL = 15;

export type EnrollmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'READY_FOR_ASSESSMENT' | 'COMPLETED';

/** Enrollment status per course id for the employee being advised. */
export type EnrollmentsByCourse = ReadonlyMap<string, EnrollmentStatus>;

/**
 * Next-step courses (spec section 7, prerequisites): for each domain with gaps, the course one level above the
 * lowest current level of that domain's gaps. Scores follow the three components of the backend engine:
 * share of gap priority closed, share of mandatory gaps closed, and fit of the course entry level.
 */
export function recommendCourses(
  items: SkillGapItem[],
  enrollments: EnrollmentsByCourse,
  limit = 10,
): CourseRecommendation[] {
  const gaps = items.filter((item) => item.gapSteps > 0);
  if (gaps.length === 0) return [];

  const totalPriority = gaps.reduce((sum, item) => sum + item.priorityScore, 0);
  const mandatoryGaps = gaps.filter((item) => item.mandatory);
  const categories = [...new Set(gaps.map((item) => COMPETENCY_BY_ID.get(item.competencyId)!.categoryId))];

  const recommendations: CourseRecommendation[] = [];
  for (const categoryId of categories) {
    const domainGaps = gaps.filter((item) => COMPETENCY_BY_ID.get(item.competencyId)!.categoryId === categoryId);
    const lowest = Math.min(...domainGaps.map((item) => item.currentLevel ?? 0));
    const course = courseFor(categoryId, lowest + 1);
    if (!course || enrollments.get(course.id) === 'COMPLETED') continue;

    const reasons = domainGaps
      .filter((item) => (item.currentLevel ?? 0) < course.level)
      .map((item) => {
        const closes = Math.min(course.level, item.requiredLevel) - (item.currentLevel ?? 0);
        return { item, closes };
      });

    const closedPriority = reasons.reduce((sum, { item, closes }) => sum + item.priorityScore * (closes / item.gapSteps), 0);
    const closedMandatory = reasons
      .filter(({ item }) => item.mandatory)
      .reduce((sum, { item, closes }) => sum + closes / item.gapSteps, 0);

    const breakdown = {
      gapPriorityCoverage: round2(totalPriority === 0 ? 0 : WEIGHT_GAP_PRIORITY * (closedPriority / totalPriority)),
      mandatoryCoverage: round2(mandatoryGaps.length === 0 ? 0 : WEIGHT_MANDATORY * (closedMandatory / mandatoryGaps.length)),
      entryLevelFit: course.entryLevel === lowest ? WEIGHT_ENTRY_LEVEL : 0,
    };
    const category = CATEGORY_BY_ID.get(categoryId)!;

    recommendations.push({
      courseId: course.id,
      courseCode: course.code,
      title: course.title,
      estimatedDurationMinutes: course.estimatedDurationMinutes,
      entryLevel: course.entryLevel,
      enrollmentStatus: enrollments.get(course.id) ?? null,
      score: round2(breakdown.gapPriorityCoverage + breakdown.mandatoryCoverage + breakdown.entryLevelFit),
      breakdown,
      reasons: reasons.map(({ item, closes }) => ({
        competencyId: item.competencyId,
        competencyName: item.competencyName,
        currentLevel: item.currentLevel,
        requiredLevel: item.requiredLevel,
        courseTargetLevel: course.level,
        coverageType: course.level >= item.requiredLevel ? 'FULL' : 'PARTIAL',
        closesSteps: closes,
        mandatory: item.mandatory,
        severity: item.severity,
      })),
      explanation: `Khóa này đưa ${reasons.length} năng lực của miền "${category.name}" lên mức ${course.level}.`,
      warnings: [],
    });
  }

  return recommendations.sort((a, b) => b.score - a.score || a.courseCode.localeCompare(b.courseCode)).slice(0, limit);
}
