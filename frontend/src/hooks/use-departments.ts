import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService, type CreateDepartmentRequest, type UpdateDepartmentRequest, type DepartmentListParams } from '../services/department.service';

/**
 * Data a department change shows up in: department lists and details, member rows (department name, manager scope)
 * and the overview setup steps.
 */
const DEPARTMENT_DEPENDENT_KEYS = [['departments'], ['members'], ['organization', 'overview']];

function useInvalidateDepartments() {
  const qc = useQueryClient();
  return () => Promise.all(DEPARTMENT_DEPENDENT_KEYS.map((queryKey) => qc.invalidateQueries({ queryKey })));
}

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
  const invalidate = useInvalidateDepartments();
  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) => departmentService.create(data),
    onSuccess: invalidate,
  });
}

/**
 * Update a department. Invalidates lists and details.
 */
export function useUpdateDepartment() {
  const invalidate = useInvalidateDepartments();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentRequest }) =>
      departmentService.update(id, data),
    onSuccess: invalidate,
  });
}

/**
 * Set (or clear, with undefined) the manager of a department. PUT replaces every field, so the department is read
 * first and sent back unchanged apart from the manager; otherwise its parent and description would be cleared.
 */
export function useSetDepartmentManager() {
  const invalidate = useInvalidateDepartments();
  return useMutation({
    mutationFn: async ({ id, managerEmployeeId }: { id: string; managerEmployeeId?: string }) => {
      const department = (await departmentService.getById(id)).data.data!;
      return departmentService.update(id, {
        code: department.code,
        name: department.name,
        description: department.description,
        parentDepartmentId: department.parentDepartmentId,
        managerEmployeeId,
        status: department.status as UpdateDepartmentRequest['status'],
      });
    },
    onSuccess: invalidate,
  });
}

/**
 * Delete a department. Invalidates list on success.
 */
export function useDeleteDepartment() {
  const invalidate = useInvalidateDepartments();
  return useMutation({
    mutationFn: (id: string) => departmentService.remove(id),
    onSuccess: invalidate,
  });
}
