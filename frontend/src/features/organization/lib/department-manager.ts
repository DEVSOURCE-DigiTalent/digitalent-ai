import type { DepartmentListItem } from '@/services/department.service';

/** A department needs a manager: none is set and no manager invitation is waiting (OW-02 "Cần xử lý"). */
export const needsManager = (department: DepartmentListItem) => !department.managerEmployeeId && !department.hasPendingManagerInvitation;
