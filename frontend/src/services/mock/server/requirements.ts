import { distributeWeightsByDomain, isMandatoryFor, type DomainRow } from '../../../features/competency/utils/requirement-domains';
import { CATEGORY_BY_ID, COMPETENCIES, referenceLevel, type ReferencePositionCode } from './catalog';
import type { RequirementLine } from './engine';

/**
 * Default requirement set of a reference position (spec section 4.1): the competencies it needs, each at its
 * own level, with the weights split by domain the way the backend seed does (Tt02Catalog.RequirementsFor).
 */
export function referenceRequirementLines(position: ReferencePositionCode): RequirementLine[] {
  const rows: DomainRow[] = COMPETENCIES.map((competency) => {
    const category = CATEGORY_BY_ID.get(competency.categoryId)!;
    const level = referenceLevel(position, competency.frameworkCode);
    return {
      competencyId: competency.id,
      competencyCode: competency.code,
      competencyName: competency.name,
      frameworkCode: competency.frameworkCode,
      categoryId: category.id,
      categoryName: category.name,
      categorySortOrder: category.sortOrder,
      requiredLevel: level,
      weightPercent: 0,
      isMandatory: isMandatoryFor(level, competency.frameworkCode),
      requiresPracticalEvidence: true,
    };
  });

  return distributeWeightsByDomain(rows)
    .filter((row) => row.requiredLevel > 0)
    .map((row) => ({
      competencyId: row.competencyId,
      requiredLevel: row.requiredLevel,
      weightPercent: row.weightPercent,
      isMandatory: row.isMandatory,
    }));
}
