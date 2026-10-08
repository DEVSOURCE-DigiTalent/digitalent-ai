import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { competencyService } from '../../services/competency.service';
import { useAllActiveCompetencies } from '../use-competencies';

describe('useAllActiveCompetencies', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('loads active competency IDs from every API page before task assignment', async () => {
    const getList = vi.spyOn(competencyService, 'getList').mockImplementation(async (params) => ({
      data: {
        success: true,
        data: {
          items: [{ id: `00000000-0000-4000-8000-00000000000${params?.pageIndex}`, status: 'ACTIVE', code: `C${params?.pageIndex}` }],
          totalItems: 2,
          totalPages: 2,
          pageIndex: params?.pageIndex ?? 1,
          pageSize: 100,
        },
      },
    } as unknown as Awaited<ReturnType<typeof competencyService.getList>>));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;

    const { result } = renderHook(() => useAllActiveCompetencies(), { wrapper });
    await waitFor(() => expect(result.current.data?.map((item) => item.id)).toEqual([
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002',
    ]));
    expect(getList).toHaveBeenCalledWith({ status: 'ACTIVE', pageIndex: 1, pageSize: 100 });
    expect(getList).toHaveBeenCalledWith({ status: 'ACTIVE', pageIndex: 2, pageSize: 100 });
  });
});
