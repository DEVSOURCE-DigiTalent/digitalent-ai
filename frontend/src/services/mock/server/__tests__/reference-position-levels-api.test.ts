import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import apiClient from '../../../api-client';
import { mockAdapter } from '../mock-adapter';

beforeAll(() => { apiClient.defaults.adapter = mockAdapter; });
beforeEach(() => { localStorage.clear(); });
const asUser = (id: string) => localStorage.setItem('accessToken', `mock-token:${id}`);

describe('platform reference levels', () => {
  it('allows Admin to edit and Owner to read the same five-position matrix', async () => {
    asUser('mock-platform');
    const initial = (await apiClient.get('/reference-positions/levels')).data.data;
    expect(Object.keys(initial.levels)).toHaveLength(5);
    const changed = { version: initial.version, levels: { ...initial.levels, CEO: [...initial.levels.CEO] } };
    changed.levels.CEO[0] = 2;
    const saved = (await apiClient.put('/reference-positions/levels', changed)).data.data;
    expect(saved.version).toBe(initial.version + 1);

    asUser('mock-owner');
    const visible = (await apiClient.get('/reference-positions/levels')).data.data;
    expect(visible.levels.CEO[0]).toBe(2);
    await expect(apiClient.put('/reference-positions/levels', visible)).rejects.toMatchObject({ response: { status: 403 } });
  });
});
