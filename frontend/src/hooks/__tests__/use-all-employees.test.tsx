import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { employeeService } from '../../services/employee.service';
import { useAllEmployees } from '../use-employees';

describe('useAllEmployees', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('includes employees after the first API page in assignment selection', async () => {
    const getList = vi.spyOn(employeeService, 'getList').mockImplementation(async (params) => ({
      data: {
        success: true,
        data: {
          items: [{ id: `employee-${params?.pageIndex}`, employeeCode: `E${params?.pageIndex}`, fullName: `Employee ${params?.pageIndex}`, departmentId: 'dept-1', status: 'ACTIVE' }],
          totalItems: 2,
          totalPages: 2,
          pageIndex: params?.pageIndex ?? 1,
          pageSize: 100,
        },
      },
    } as unknown as Awaited<ReturnType<typeof employeeService.getList>>));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;

    const { result } = renderHook(() => useAllEmployees({ status: 'ACTIVE' }), { wrapper });
    await waitFor(() => expect(result.current.data?.map((employee) => employee.id)).toEqual(['employee-1', 'employee-2']));
    expect(getList).toHaveBeenCalledWith({ status: 'ACTIVE', pageIndex: 1, pageSize: 100 });
    expect(getList).toHaveBeenCalledWith({ status: 'ACTIVE', pageIndex: 2, pageSize: 100 });
  });
});
