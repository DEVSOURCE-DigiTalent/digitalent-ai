import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  employeeService,
  type CreateEmployeeRequest,
  type UpdateEmployeeRequest,
  type EmployeeListParams,
} from '../services/employee.service';

/**
 * Fetch paginated employee list.
 */
export function useEmployees(params?: EmployeeListParams) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeService.getList(params).then((r) => r.data.data!),
  });
}

/**
 * Fetch a single employee by ID.
 */
export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeeService.getById(id).then((r) => r.data.data!),
    enabled: !!id,
  });
}

/**
 * Create an employee profile. Invalidates list on success.
 */
export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeeService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

/**
 * Update an employee profile. Invalidates list and detail.
 */
export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
      employeeService.update(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      qc.invalidateQueries({ queryKey: ['employees', variables.id] });
    },
  });
}

/**
 * Archive an employee profile. Invalidates list on success.
 */
export function useArchiveEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.archive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export const useDeleteEmployee = useArchiveEmployee;
