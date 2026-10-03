import type { PositionRequirementsOutput } from '@/services/competency.service';

export interface RequirementChange {
  competencyId: string;
  frameworkCode: string;
  name: string;
  /** Level in the older version (0 = not required). */
  from: number;
  /** Level in the newer version (0 = no longer required). */
  to: number;
  kind: 'ADDED' | 'REMOVED' | 'RAISED' | 'LOWERED' | 'MANDATORY_CHANGED';
  mandatoryFrom?: boolean;
  mandatoryTo?: boolean;
}

/** What changed between two versions of a position's requirements, in domain order. */
export function diffRequirements(
  older: Pick<PositionRequirementsOutput, 'items'> | undefined,
  newer: Pick<PositionRequirementsOutput, 'items'>,
): RequirementChange[] {
  const before = new Map((older?.items ?? []).map((item) => [item.competencyId, item]));
  const after = new Map(newer.items.map((item) => [item.competencyId, item]));
  const changes: RequirementChange[] = [];

  for (const [id, item] of after) {
    const previous = before.get(id);
    const base = { competencyId: id, frameworkCode: item.frameworkCode ?? '', name: item.competencyName };
    if (!previous) {
      changes.push({ ...base, from: 0, to: item.requiredLevel, kind: 'ADDED' });
    } else if (previous.requiredLevel !== item.requiredLevel) {
      changes.push({ ...base, from: previous.requiredLevel, to: item.requiredLevel, kind: item.requiredLevel > previous.requiredLevel ? 'RAISED' : 'LOWERED' });
    } else if (previous.isMandatory !== item.isMandatory) {
      changes.push({ ...base, from: previous.requiredLevel, to: item.requiredLevel, kind: 'MANDATORY_CHANGED', mandatoryFrom: previous.isMandatory, mandatoryTo: item.isMandatory });
    }
  }
  for (const [id, item] of before) {
    if (!after.has(id)) changes.push({ competencyId: id, frameworkCode: item.frameworkCode ?? '', name: item.competencyName, from: item.requiredLevel, to: 0, kind: 'REMOVED' });
  }

  return changes.sort((a, b) => a.frameworkCode.localeCompare(b.frameworkCode, undefined, { numeric: true }));
}
