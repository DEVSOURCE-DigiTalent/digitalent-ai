import { useCurrentUser } from './use-current-user';
import { useDepartments } from './use-departments';

/**
 * Phòng ban mà quản lý đang phụ trách (phòng ban có `managerEmployeeId` là hồ sơ nhân viên của người dùng).
 * Các màn quản lý dùng nó để chỉ hiển thị dữ liệu của phòng ban này; `null` khi chưa được gán phòng ban nào.
 */
export function useManagedDepartment() {
  const employeeId = useCurrentUser((s) => s.user?.employeeId);
  const query = useDepartments({ pageIndex: 1, pageSize: 100 });
  const department = employeeId
    ? query.data?.items.find((item) => item.managerEmployeeId === employeeId) ?? null
    : null;
  return { department, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}
