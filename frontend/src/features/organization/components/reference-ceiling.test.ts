import { describe, expect, it } from 'vitest';
import type { CeilingDomain } from '@/services/capability-ceiling.service';
import { referenceCeilingDraft, suggestedSampleForDepartment } from './reference-ceiling';

const domain = (code: string, categoryId: string): CeilingDomain => ({
  code, categoryId, name: code, sortOrder: 1, organizationCeiling: 3, suggestedCeiling: 0, courses: [],
});

describe('Admin reference applied to an organization course limit', () => {
  it('offers CEO as a visible sample even when no CEO position is linked to the department', () => {
    expect(suggestedSampleForDepartment('CEO', 'CEO')).toBe('CEO');
    expect(suggestedSampleForDepartment('DEPT-1', 'Phòng Kế toán')).toBe('');
  });

  it('uses domain codes instead of display order and caps only where the organization is lower', () => {
    const domains = [domain('TT02_D6', 'ai'), domain('TT02_D1', 'data')];
    const result = referenceCeilingDraft(domains, [3, 3, 2, 3, 3, 1], { ai: 3, data: 2 });
    expect(result).toEqual({ draft: { ai: 1, data: 2 }, capped: true });
    expect(referenceCeilingDraft(domains, [3, 3, 2, 3, 3, 1], { ai: 3, data: 3 }))
      .toEqual({ draft: { ai: 1, data: 3 }, capped: false });
  });
});
