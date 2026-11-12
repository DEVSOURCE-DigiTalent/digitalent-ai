import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../../api-client';
import { resetMockDb } from '../../mock-store';
import { mockAdapter } from '../mock-adapter';
import { COMPETENCIES } from '../catalog';
import type { SkillGapRunDetail } from '../../../intelligence.service';

beforeEach(() => {
  localStorage.clear();
  resetMockDb();
  apiClient.defaults.adapter = mockAdapter;
  localStorage.setItem('accessToken', 'mock-token:mock-owner');
  vi.stubGlobal('location', { pathname: '/login', search: '', href: '' });
});
afterEach(() => { vi.unstubAllGlobals(); });

describe('position standards and skill gaps', () => {
  it('uses the same grade and position scope for the employee list and batch recalculation', async () => {
    const wrongGrade = await apiClient.get('/intelligence/skill-gaps', { params: { jobPositionId: 'pos-hr', jobGrade: 'G1' } });
    expect(wrongGrade.data.data.totalItems).toBe(0);
    const matchingGrade = await apiClient.get('/intelligence/skill-gaps', { params: { jobPositionId: 'pos-hr', jobGrade: 'G2' } });
    expect(matchingGrade.data.data.totalItems).toBeGreaterThan(0);
    const batch = await apiClient.post('/intelligence/skill-gaps/calculate-batch', { jobPositionId: 'pos-hr', jobGrade: 'G1' });
    expect(batch.data.data.calculatedCount).toBe(0);
  });
  it('recalculates affected employees against the newly activated domain-level standard', async () => {
    const items = COMPETENCIES.map((item, index) => ({ competencyId: item.id, requiredLevel: item.categoryId === 'cat-1' ? 3 : 2, weightPercent: index === 23 ? 4.09 : 4.17, isMandatory: true, requiresPracticalEvidence: true }));
    const draft = await apiClient.post('/position-requirements', { jobPositionId: 'pos-hr', items });
    const id = draft.data.data.id;
    await apiClient.post(`/position-requirements/${id}/activate`, {});
    const list = await apiClient.get('/intelligence/skill-gaps', { params: { employeeId: 'emp-04', latestOnly: true } });
    const detail = await apiClient.get(`/intelligence/skill-gaps/${list.data.data.items[0].runId}`);
    const run = detail.data.data as SkillGapRunDetail;
    expect(run.requirementSetId).toBe(id);
    expect(run.requirementSetVersionNo).toBe(2);
    expect(run.items).toHaveLength(24);
    expect(run.items.filter((item) => item.frameworkCode?.startsWith('1.')).map((item) => item.requiredLevel)).toEqual([3, 3, 3]);
    expect(run.items.filter((item) => !item.frameworkCode?.startsWith('1.')).every((item) => item.requiredLevel === 2)).toBe(true);
  });
});
