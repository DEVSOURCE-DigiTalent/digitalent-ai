import { create } from 'zustand';
import { useCurrentUser } from './use-current-user';
import { useDepartments } from './use-departments';

const useDepartmentSelection = create<{
  selection?: { employeeId: string; departmentId: string };
  select: (employeeId: string, departmentId: string) => void;
}>((set) => ({
  select: (employeeId, departmentId) => set({ selection: { employeeId, departmentId } }),
}));

/** Phòng ban đang xem trong danh sách phòng ban được giao cho tài khoản quản lý. */
export function useManagedDepartment() {
  const employeeId = useCurrentUser((s) => s.user?.employeeId);
  const query = useDepartments({ pageIndex: 1, pageSize: 100 });
  const { selection, select } = useDepartmentSelection();
  const departments = employeeId
    ? (query.data?.items ?? []).filter((item) => item.managerEmployeeId === employeeId)
    : [];
  const department = (selection?.employeeId === employeeId
    ? departments.find((item) => item.id === selection?.departmentId)
    : undefined) ?? departments[0] ?? null;
  const selectDepartment = (id: string) => {
    if (employeeId && departments.some((item) => item.id === id)) select(employeeId, id);
  };
  return { department, departments, selectDepartment, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}
