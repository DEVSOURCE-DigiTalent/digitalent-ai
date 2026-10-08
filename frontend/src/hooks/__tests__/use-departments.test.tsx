import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { departmentService } from '../../services/department.service';
import { useSetDepartmentManager } from '../use-departments';

type GetById = Awaited<ReturnType<typeof departmentService.getById>>;
type Update = Awaited<ReturnType<typeof departmentService.update>>;

describe('useSetDepartmentManager', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('sends the department back whole, so PUT keeps its parent and description', async () => {
    vi.spyOn(departmentService, 'getById').mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'dept-1', code: 'OPS', name: 'Operations', description: 'Vận hành',
          parentDepartmentId: 'dept-root', managerEmployeeId: 'employee-old', status: 'ACTIVE',
        },
      },
    } as unknown as GetById);
    const update = vi.spyOn(departmentService, 'update').mockResolvedValue({ data: { success: true, data: { id: 'dept-1' } } } as unknown as Update);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;

    const { result } = renderHook(() => useSetDepartmentManager(), { wrapper });
    await result.current.mutateAsync({ id: 'dept-1', managerEmployeeId: 'employee-new' });

    expect(update).toHaveBeenCalledWith('dept-1', {
      code: 'OPS',
      name: 'Operations',
      description: 'Vận hành',
      parentDepartmentId: 'dept-root',
      managerEmployeeId: 'employee-new',
      status: 'ACTIVE',
    });
  });
});
