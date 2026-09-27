import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService, type CreateDepartmentRequest, type UpdateDepartmentRequest, type DepartmentListParams } from '../services/department.service';

/**
 * Fetch paginated department list.
 */
export function useDepartments(params: DepartmentListParams) {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => departmentService.getList(params).then((r) => r.data.data!),
  });
}

/**
 * Fetch a single department by ID.
 */
export function useDepartment(id: string) {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: () => departmentService.getById(id).then((r) => r.data.data!),
    enabled: !!id,
  });
}

/**
 * Create a department. Invalidates list on success.
 */
export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) => departmentService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
}

/**
 * Update a department. Invalidates list and detail.
 */
export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentRequest }) =>
      departmentService.update(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      qc.invalidateQueries({ queryKey: ['departments', variables.id] });
    },
  });
}

/**
 * Delete a department. Invalidates list on success.
 */
export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
}
