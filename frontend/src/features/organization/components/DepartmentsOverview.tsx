import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/shared/Modal';
import { useSetDepartmentManager } from '@/hooks/use-departments';
import { useMembers } from '@/hooks/use-members';
import type { DepartmentListItem } from '@/services/department.service';
import { personInitials } from '@/lib/utils';
import { needsManager } from '../lib/department-manager';

interface DepartmentsOverviewProps {
  departments: DepartmentListItem[];
  loading: boolean;
  /** Show only the departments that still need a manager. */
  onlyWithoutManager: boolean;
  onFilterChange: (onlyWithoutManager: boolean) => void;
  /** Open the member list of a department. */
  onShowMembers: (departmentId: string) => void;
  /** The user may set a department's manager (department.create_update). */
  canAssign: boolean;
  /** Invite someone into a department (no one there can be its manager yet). */
  onInvite?: (departmentId: string) => void;
  /** Router state for the department links, so the department page leads back here. */
  backState?: unknown;
}

/**
 * OW-02 "Phòng ban" tab: who leads each department and how many people it has; a missing manager is chosen in place.
 * Adding, renaming or archiving departments stays on the departments page (OW-06).
 */
export function DepartmentsOverview({ departments, loading, onlyWithoutManager, onFilterChange, onShowMembers, canAssign, onInvite, backState }: DepartmentsOverviewProps) {
  useUiLanguage();
  const [assigning, setAssigning] = useState<DepartmentListItem | null>(null);
  const missing = departments.filter(needsManager).length;
  const shown = onlyWithoutManager ? departments.filter(needsManager) : departments;

  return (
    <>
      <div className="mb-segment" role="group" aria-label={translateUi('Lọc phòng ban')}>
        <button type="button" aria-pressed={!onlyWithoutManager} onClick={() => onFilterChange(false)}>
          {translateUi('Tất cả')} <span>{departments.length}</span>
        </button>
        <button type="button" aria-pressed={onlyWithoutManager} onClick={() => onFilterChange(true)} disabled={missing === 0 && !onlyWithoutManager}>
          {translateUi('Chưa có trưởng phòng')} <span>{missing}</span>
        </button>
      </div>

      {loading ? (
        <div className="mb-skeleton" aria-busy="true" aria-label={translateUi('Đang tải phòng ban')}>
          {Array.from({ length: 4 }, (_, index) => <span key={index} />)}
        </div>
      ) : shown.length === 0 ? (
        <div className="mb-empty">
          <p className="mb-empty__title">{translateUi(onlyWithoutManager ? 'Phòng ban nào cũng đã có trưởng phòng' : 'Chưa có phòng ban')}</p>
          {!onlyWithoutManager && <Link to="/enterprise/departments" className="mb-link">{translateUi('Tạo phòng ban')}<ArrowRight size={14} aria-hidden="true" /></Link>}
        </div>
      ) : (
        <div className="mb-table-wrap">
          <table className="mb-table mb-table--departments">
            <thead>
              <tr>
                <th scope="col">{translateUi('Phòng ban')}</th>
                <th scope="col">{translateUi('Trưởng phòng')}</th>
                <th scope="col">{translateUi('Nhân sự')}</th>
                <th scope="col"><span className="sr-only">{translateUi('Chi tiết')}</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((department) => (
                <tr key={department.id} className="mb-row">
                  <td className="mb-cell mb-cell--person">
                    <div className="mb-who">
                      <span className="mb-avatar mb-avatar--square" aria-hidden="true">{department.name.charAt(0).toLocaleUpperCase('vi')}</span>
                      <Link to={`/enterprise/departments/${department.id}`} state={backState} className="mb-name">{department.name}</Link>
                    </div>
                  </td>
                  <td className="mb-cell mb-cell--manager">
                    {department.managerName ? (
                      <span>{department.managerName}</span>
                    ) : department.hasPendingManagerInvitation ? (
                      <span className="mb-state" data-tone="warn">{translateUi('Chờ trưởng phòng kích hoạt')}</span>
                    ) : canAssign ? (
                      <button type="button" className="mb-assign" onClick={() => setAssigning(department)}>
                        <UserPlus size={14} aria-hidden="true" />{translateUi('Chọn trưởng phòng')}
                      </button>
                    ) : (
                      <span className="mb-sub mb-sub--warn">{translateUi('Chưa có')}</span>
                    )}
                  </td>
                  <td className="mb-cell mb-cell--count">
                    <button
                      type="button"
                      className="mb-count"
                      onClick={() => onShowMembers(department.id)}
                      aria-label={translateUi(`Xem ${department.headcount ?? 0} người của ${department.name}`)}
                    >
                      {translateUi(`${department.headcount ?? 0} người`)}
                    </button>
                  </td>
                  <td className="mb-cell mb-cell--action">
                    <Link to={`/enterprise/departments/${department.id}`} state={backState} className="mb-detail" aria-label={translateUi(`Xem chi tiết phòng ${department.name}`)}>
                      <span>{translateUi('Xem chi tiết')}</span>
                      <ChevronRight size={15} aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link to="/enterprise/departments" className="mb-link mb-link--foot">
        {translateUi('Thêm, đổi tên hoặc lưu trữ phòng ban')}<ArrowRight size={14} aria-hidden="true" />
      </Link>

      {assigning && (
        <AssignManagerDialog
          department={assigning}
          departments={departments}
          onClose={() => setAssigning(null)}
          onInvite={onInvite ? () => { const id = assigning.id; setAssigning(null); onInvite(id); } : undefined}
        />
      )}
    </>
  );
}

/**
 * Picks the manager among the department's active people with an account who do not lead another department
 * (DepartmentRules.AssignManagerAsync); the chosen person gets the MANAGER role.
 */
function AssignManagerDialog({ department, departments, onClose, onInvite }: {
  department: DepartmentListItem;
  departments: DepartmentListItem[];
  onClose: () => void;
  onInvite?: () => void;
}) {
  useUiLanguage();
  const [chosen, setChosen] = useState('');
  const people = useMembers({ departmentId: department.id, status: 'ACTIVE', pageSize: 100 });
  const setManager = useSetDepartmentManager();
  const leading = new Set(departments.map((item) => item.managerEmployeeId).filter(Boolean));
  const candidates = (people.data?.items ?? []).filter((member) =>
    member.kind === 'member' && member.employeeId && member.id !== member.employeeId && !leading.has(member.employeeId));

  const save = async () => {
    try {
      await setManager.mutateAsync({ id: department.id, managerEmployeeId: chosen });
      const name = candidates.find((member) => member.employeeId === chosen)?.fullName ?? '';
      toast.success(translateUi(`${name} là trưởng phòng ${department.name}`));
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : translateUi('Chưa đặt được trưởng phòng. Thử lại.'));
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={translateUi(`Trưởng phòng ${department.name}`)}
      description={translateUi('Người được chọn có thêm vai trò Quản lý và là quản lý trực tiếp của cả phòng.')}
      footer={candidates.length > 0 ? (
        <>
          <button type="button" className="mb-btn mb-btn--ghost" onClick={onClose}>{translateUi('Hủy')}</button>
          <button type="button" className="mb-btn mb-btn--primary" onClick={() => void save()} disabled={!chosen || setManager.isPending}>
            {setManager.isPending ? translateUi('Đang lưu…') : translateUi('Đặt làm trưởng phòng')}
          </button>
        </>
      ) : undefined}
    >
      {people.isLoading ? (
        <p className="mb-muted" role="status">{translateUi('Đang tải nhân sự của phòng…')}</p>
      ) : candidates.length === 0 ? (
        <div className="mb-assign-empty">
          <p>{translateUi('Phòng chưa có ai có tài khoản đang hoạt động để làm trưởng phòng.')}</p>
          {onInvite && <button type="button" className="mb-btn mb-btn--primary" onClick={onInvite}><UserPlus size={15} aria-hidden="true" />{translateUi('Mời người vào phòng')}</button>}
        </div>
      ) : (
        <fieldset className="mb-pick">
          <legend className="sr-only">{translateUi('Chọn trưởng phòng')}</legend>
          {candidates.map((member) => (
            <label key={member.id} className="mb-pick__option">
              <input type="radio" name="department-manager" value={member.employeeId!} checked={chosen === member.employeeId} onChange={() => setChosen(member.employeeId!)} />
              <span className="mb-avatar" aria-hidden="true">{personInitials(member.fullName)}</span>
              <span className="mb-person">
                <span className="mb-name">{member.fullName}</span>
                <span className="mb-email">{member.positionName ?? translateUi('Chưa có vị trí')}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </Modal>
  );
}
