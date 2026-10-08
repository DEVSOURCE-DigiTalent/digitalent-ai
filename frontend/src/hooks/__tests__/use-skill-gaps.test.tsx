import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { skillGapService } from '../../services/intelligence.service';
import { useCalculateSkillGapBatch } from '../use-skill-gaps';

type CalculateBatch = Awaited<ReturnType<typeof skillGapService.calculateBatch>>;

describe('useCalculateSkillGapBatch', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('refreshes every view computed from skill gap snapshots, and only those', async () => {
    vi.spyOn(skillGapService, 'calculateBatch').mockResolvedValue({
      data: { success: true, data: { calculatedCount: 3, skippedCount: 2, skipped: [] } },
    } as unknown as CalculateBatch);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const dependent = [
      ['skill-gaps', 'list'],
      ['recommendations', 'employee-1'],
      ['analytics', 'overview'],
      ['workforce', 'list'],
      ['members', 'list'],
      ['organization', 'overview'],
    ];
    [...dependent, ['courses', 'list']].forEach((key) => client.setQueryData(key, {}));
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;

    const { result } = renderHook(() => useCalculateSkillGapBatch(), { wrapper });
    await result.current.mutateAsync({});

    dependent.forEach((key) => expect(client.getQueryState(key)?.isInvalidated, key.join('/')).toBe(true));
    expect(client.getQueryState(['courses', 'list'])?.isInvalidated).toBe(false);
  });
});
