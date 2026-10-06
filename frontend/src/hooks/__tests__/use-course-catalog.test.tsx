import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { assignmentService } from '../../services/assignment.service';
import { useCourse, useCourseCatalog } from '../use-assignments';

describe('useCourseCatalog', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

  it('collects every BE2 page before the catalog sorts and paginates locally', async () => {
    const getCourses = vi.spyOn(assignmentService, 'getCourses').mockImplementation(async (params) => ({
      data: {
        success: true, message: 'OK', errors: [],
        data: {
          items: [{ id: `course-${params?.pageIndex}`, code: `M1-${params?.pageIndex}`, title: `Course ${params?.pageIndex}`, level: 1, modules: 1, status: 'PUBLISHED', assignedCount: 0 }],
          totalItems: 3, totalPages: 3, pageIndex: params?.pageIndex ?? 1, pageSize: 100,
        },
      },
    } as unknown as Awaited<ReturnType<typeof assignmentService.getCourses>>));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;

    const { result } = renderHook(() => useCourseCatalog({ search: 'M1' }), { wrapper });
    await waitFor(() => expect(result.current.data?.items).toHaveLength(3));
    expect(getCourses).toHaveBeenCalledTimes(3);
    expect(getCourses).toHaveBeenCalledWith({ search: 'M1', pageIndex: 1, pageSize: 100 });
    expect(result.current.data?.items.map((course) => course.id)).toEqual(['course-1', 'course-2', 'course-3']);
  });

  it('resolves the deployed crs-A1-F URL to the M1-F GUID used by BE2', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false');
    vi.spyOn(assignmentService, 'getCourses').mockResolvedValue({
      data: { data: { items: [{ id: 'course-guid', code: 'M1-F' }] } },
    } as unknown as Awaited<ReturnType<typeof assignmentService.getCourses>>);
    const getCourse = vi.spyOn(assignmentService, 'getCourse').mockResolvedValue({
      data: { data: { id: 'course-guid', code: 'M1-F', title: 'Tìm kiếm thông tin', modules: [] } },
    } as unknown as Awaited<ReturnType<typeof assignmentService.getCourse>>);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;

    const { result } = renderHook(() => useCourse('crs-A1-F'), { wrapper });
    await waitFor(() => expect(result.current.data?.id).toBe('course-guid'));
    expect(getCourse).toHaveBeenCalledWith('course-guid');
  });
});
