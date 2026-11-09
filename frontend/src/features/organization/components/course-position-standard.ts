import type { CompetencyListItem, PositionRequirementItemDto, PositionRequirementItemInput } from '@/services/competency.service';
import type { CeilingDomain } from '@/services/capability-ceiling.service';
import {
  activationIssues,
  distributeWeightsByDomain,
  isMandatoryFor,
  toDomainRow,
  type CompetencySource,
} from '@/features/competency/utils/requirement-domains';

export type DomainLevels = Record<string, number>;

/** The course tier is the visible unit; TT02 competency rows remain a storage detail for gap reports. */
export function levelsFromRequirements(competencies: CompetencyListItem[], items: PositionRequirementItemDto[]): DomainLevels {
  const categories = new Set(competencies.filter((item) => item.frameworkCode).map((item) => item.categoryId));
  const levels: DomainLevels = Object.fromEntries([...categories].map((categoryId) => [categoryId, items.length ? 0 : 1]));
  for (const item of items) levels[item.categoryId] = Math.max(levels[item.categoryId] ?? 0, item.requiredLevel);
  return levels;
}

export function itemsFromCourseLevels(competencies: CompetencyListItem[], levels: DomainLevels): PositionRequirementItemInput[] {
  const rows = competencies
    .filter((item) => item.frameworkCode)
    .map((item) => {
      const level = levels[item.categoryId] ?? 0;
      return toDomainRow(item as CompetencySource, level);
    });
  return distributeWeightsByDomain(rows)
    .filter((row) => row.requiredLevel > 0)
    .map((row) => ({
      competencyId: row.competencyId,
      requiredLevel: row.requiredLevel,
      weightPercent: row.weightPercent,
      isMandatory: isMandatoryFor(row.requiredLevel, row.frameworkCode),
      requiresPracticalEvidence: true,
    }));
}

export function courseStandardIssue(competencies: CompetencyListItem[], levels: DomainLevels): string | null {
  if (competencies.filter((item) => item.frameworkCode).length !== 24) return 'Chưa tải đủ 24 năng lực TT02 để lưu chuẩn vị trí.';
  const items = itemsFromCourseLevels(competencies, levels);
  const byId = new Map(competencies.map((item) => [item.id, item]));
  const issues = activationIssues(items.map((item) => ({
    competencyId: item.competencyId,
    frameworkCode: byId.get(item.competencyId)?.frameworkCode,
    categoryId: byId.get(item.competencyId)?.categoryId ?? '',
    categoryName: byId.get(item.competencyId)?.categoryName ?? '',
    categorySortOrder: byId.get(item.competencyId)?.categorySortOrder ?? 0,
    requiredLevel: item.requiredLevel,
    weightPercent: item.weightPercent,
    isMandatory: item.isMandatory,
    requiresPracticalEvidence: item.requiresPracticalEvidence,
  })));
  if (!issues.isCountValid) return 'Cần chọn khóa học cho ít nhất 9 năng lực thuộc các lĩnh vực.';
  if (issues.missingCore.length) return 'Lĩnh vực An toàn cần ít nhất cấp Cơ bản.';
  return null;
}

/** Never claim that one course sets the whole domain unless its published syllabus maps to every TT02 competency. */
export function courseCoverageIssue(competencies: CompetencyListItem[], domains: CeilingDomain[], levels: DomainLevels): string | null {
  for (const domain of domains) {
    const level = levels[domain.categoryId] ?? 0;
    if (!level) continue;
    const course = domain.courses.find((item) => item.level === level);
    if (!course?.courseId) return `Chưa có khóa học cấp đã chọn trong ${domain.name}.`;
    const covered = new Map((course.competencies ?? []).map((item) => [item.competencyId, item.targetLevel]));
    const required = competencies.filter((item) => item.frameworkCode && item.categoryId === domain.categoryId);
    if (!required.length || required.some((item) => (covered.get(item.id) ?? 0) < level)) {
      return `Khóa ${course.code ?? course.title ?? ''} chưa bao phủ đủ năng lực cấp ${level} của ${domain.name}.`;
    }
  }
  return null;
}
