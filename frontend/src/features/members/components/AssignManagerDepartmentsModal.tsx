import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Modal } from '@/components/shared';
import { useDepartments, useSetDepartmentManager } from '@/hooks/use-departments';
import { toast } from 'sonner';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import type { MemberListItem } from '@/services/member.service';

interface AssignManagerDepartmentsModalProps {
  manager: MemberListItem;
  open: boolean;
  onClose: () => void;
}

export function AssignManagerDepartmentsModal({ manager, open, onClose }: AssignManagerDepartmentsModalProps) {
  useUiLanguage();
  const { data, isLoading, isError } = useDepartments({ pageSize: 100 });
  const setDepartmentManager = useSetDepartmentManager();
  const departments = data?.items ?? [];
  const department = departments.find((item) => item.id === manager.departmentId && item.status === 'ACTIVE');
  const managed = departments.find((item) => manager.employeeId && item.managerEmployeeId === manager.employeeId);
  const canAssign = !!manager.employeeId && manager.status === 'ACTIVE'
    && !!department && !department.managerEmployeeId && !managed;
  const saving = setDepartmentManager.isPending;

  const handleSave = async () => {
    if (!canAssign || !department || !manager.employeeId) return;
    try {
      await setDepartmentManager.mutateAsync({ id: department.id, managerEmployeeId: manager.employeeId });
      toast.success(translateUi('Đã phân công trưởng phòng'));
      onClose();
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Không thể phân công trưởng phòng'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={translateUi('Phân công trưởng phòng')}
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON} disabled={saving}>{translateUi('Đóng')}</button>
          {canAssign && <button type="button" onClick={handleSave} className={PRIMARY_BUTTON} disabled={saving}>
            {saving ? translateUi('Đang lưu…') : translateUi('Phân công')}
          </button>}
        </>
      }
    >
      <div className="space-y-2 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">{manager.fullName}</p>
        {isLoading ? <p role="status">{translateUi('Đang tải phòng ban…')}</p>
          : isError ? <p role="alert">{translateUi('Không tải được phòng ban.')}</p>
          : managed ? <p>{translateUi('Đang quản lý')} · {managed.name}</p>
          : !manager.employeeId || !department || manager.status !== 'ACTIVE'
            ? <p>{translateUi('Cần có hồ sơ nhân sự đang hoạt động trong phòng ban để phân công.')}</p>
            : department.managerEmployeeId
              ? <p>{department.name} · {translateUi('Đã có trưởng phòng')}{department.managerName ? ` · ${department.managerName}` : ''}</p>
              : <p>{department.name} · {translateUi('Chưa có trưởng phòng')}</p>}
      </div>
    </Modal>
  );
}
