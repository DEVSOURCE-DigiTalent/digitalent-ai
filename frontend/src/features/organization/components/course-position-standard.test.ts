import { describe, expect, it } from 'vitest';
import type { CompetencyListItem, PositionRequirementItemDto } from '@/services/competency.service';
import { TT02_COMPETENCY_CODES } from '@/features/competency/utils/requirement-domains';
import { courseCoverageIssue, courseStandardIssue, itemsFromCourseLevels, levelsFromRequirements } from './course-position-standard';
import type { CeilingDomain } from '@/services/capability-ceiling.service';

const competencies: CompetencyListItem[] = TT02_COMPETENCY_CODES.map((code, index) => ({
  id: `competency-${index}`,
  categoryId: `domain-${code[0]}`,
  categoryName: `Lĩnh vực ${code[0]}`,
  categoryCode: code[0],
  categorySortOrder: Number(code[0]),
  frameworkCode: code,
  code,
  name: `Năng lực ${code}`,
  competencyType: 'CORE_DIGITAL',
  status: 'ACTIVE',
  criteriaCount: 0,
}));

describe('course position standard', () => {
  it('maps one course tier per domain to TT02 requirements with valid weights and core safety', () => {
    const levels = levelsFromRequirements(competencies, []);
    levels['domain-1'] = 3;
    const items = itemsFromCourseLevels(competencies, levels);
    expect(items).toHaveLength(24);
    expect(items.filter((item) => item.requiredLevel === 3)).toHaveLength(3);
    expect(items.find((item) => item.competencyId === competencies.find((c) => c.frameworkCode === '4.1')?.id)?.isMandatory).toBe(true);
    expect(Math.round(items.reduce((sum, item) => sum + item.weightPercent, 0) * 100)).toBe(10_000);
    expect(courseStandardIssue(competencies, levels)).toBeNull();
  });

  it('preserves the highest saved level for a domain and blocks removal of the core safety domain', () => {
    const saved = [1, 2].map((level, index) => ({
      id: `item-${index}`,
      competencyId: competencies[index].id,
      competencyCode: competencies[index].code,
      competencyName: competencies[index].name,
      competencyType: 'CORE_DIGITAL',
      categoryId: 'domain-1',
      categoryName: 'Lĩnh vực 1',
      frameworkCode: competencies[index].frameworkCode,
      requiredLevel: level,
      weightPercent: 50,
      isMandatory: false,
      requiresPracticalEvidence: true,
    })) as PositionRequirementItemDto[];
    const levels = levelsFromRequirements(competencies, saved);
    expect(levels['domain-1']).toBe(2);
    levels['domain-2'] = 1;
    levels['domain-3'] = 1;
    levels['domain-4'] = 0;
    expect(courseStandardIssue(competencies, levels)).toContain('An toàn');
  });

  it('requires the real course mapping to cover the whole domain at the chosen tier', () => {
    const domain: CeilingDomain = {
      categoryId: 'domain-1', code: 'TT02_D1', name: 'Dữ liệu', sortOrder: 1,
      organizationCeiling: 1, suggestedCeiling: 1,
      courses: [{ level: 2, courseId: 'course-2', code: 'M1-I', title: 'Khóa trung cấp', competencies: competencies.filter((item) => item.categoryId === 'domain-1').map((item) => ({ competencyId: item.id, targetLevel: 2 })) }],
    };
    expect(courseCoverageIssue(competencies, [domain], { 'domain-1': 2 })).toBeNull();
    domain.courses[0].competencies?.pop();
    expect(courseCoverageIssue(competencies, [domain], { 'domain-1': 2 })).toContain('chưa bao phủ đủ');
  });
});
