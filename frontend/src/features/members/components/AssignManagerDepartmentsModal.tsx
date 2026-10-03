import { useState } from 'react';
import { Modal } from '@/components/shared';
import { useDepartments, useUpdateDepartment } from '@/hooks/use-departments';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/utils';
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import type { MemberListItem } from '@/services/member.service';

interface AssignManagerDepartmentsModalProps {
  manager: MemberListItem;
  open: boolean;
  onClose: () => void;
}

export function AssignManagerDepartmentsModal({ manager, open, onClose }: AssignManagerDepartmentsModalProps) {
  const { data: deptData, isLoading } = useDepartments({ pageSize: 100, status: 'ACTIVE' });
  const allDepartments = deptData?.items || [];
  const updateMutation = useUpdateDepartment();

  const managerEmpId = manager.employeeId ?? manager.id;

  // Selected department IDs managed by this manager
  const initialSelected = allDepartments
    .filter((d) => d.managerEmployeeId === managerEmpId)
    .map((d) => d.id);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);
  const [saving, setSaving] = useState(false);

  const toggleDept = (deptId: string) => {
    setSelectedIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Departments to assign (in selectedIds but previously not)
      const toAssign = allDepartments.filter(
        (d) => selectedIds.includes(d.id) && d.managerEmployeeId !== managerEmpId
      );
      // 2. Departments to unassign (not in selectedIds but previously had this manager)
      const toUnassign = allDepartments.filter(
        (d) => !selectedIds.includes(d.id) && d.managerEmployeeId === managerEmpId
      );

      for (const d of toAssign) {
        await updateMutation.mutateAsync({
          id: d.id,
          data: {
            code: d.code,
            name: d.name,
            parentDepartmentId: undefined,
            managerEmployeeId: managerEmpId,
            status: d.status as 'ACTIVE' | 'INACTIVE',
          },
        });
      }

      for (const d of toUnassign) {
        await updateMutation.mutateAsync({
          id: d.id,
          data: {
            code: d.code,
            name: d.name,
            parentDepartmentId: undefined,
            managerEmployeeId: undefined,
            status: d.status as 'ACTIVE' | 'INACTIVE',
          },
        });
      }

      toast.success(`Đã cập nhật phạm vi quản lý cho ${manager.fullName}`);
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không thể cập nhật phân công phòng ban'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={`Phân công phòng ban quản lý: ${manager.fullName}`}
      description="Quản lý (Manager) chỉ có quyền theo dõi nhân sự, giao nhiệm vụ và đánh giá minh chứng trong các phòng ban được phân công."
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON} disabled={saving}>
            Hủy
          </button>
          <button type="button" onClick={handleSave} className={PRIMARY_BUTTON} disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu phân công'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">Đang tải danh sách phòng ban…</p>
        ) : allDepartments.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có phòng ban nào trong tổ chức.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {allDepartments.map((d) => {
              const isChecked = selectedIds.includes(d.id);
              const otherManager = d.managerName && d.managerEmployeeId !== managerEmpId ? d.managerName : null;

              return (
                <label
                  key={d.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-sm cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-primary-500 bg-primary-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleDept(d.id)}
                    className="mt-0.5 size-4 rounded-sm text-primary-600 focus:ring-primary-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">
                      {d.name} <span className="font-mono text-xs text-slate-500">({d.code})</span>
                    </p>
                    {otherManager && !isChecked && (
                      <p className="text-xs text-amber-700 mt-0.5">
                        Đang do {otherManager} quản lý. Chọn mục này sẽ chuyển quyền quản lý sang {manager.fullName}.
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
