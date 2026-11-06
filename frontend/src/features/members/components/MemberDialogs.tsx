import { useId, useState } from 'react';
import { BriefcaseBusiness, Building2, Check, CircleAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmActionDialog, Modal } from '@/components/shared';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import {
  useDeactivateMember, useReactivateMember, useResendInvitation, useRevokeInvitation, useUpdateMember,
} from '@/hooks/use-members';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { assignableRoles, ROLE_DESCRIPTIONS } from '@/lib/role-policy';
import type { MemberListItem } from '@/services/member.service';
import { SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import { roleLabel } from '../member-labels';
import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';
import './member-dialogs.css';

interface MemberDialogProps {
  member: MemberListItem;
  open: boolean;
  onClose: () => void;
}

const ROLE_SUMMARIES: Record<string, string> = {
  OWNER: 'Toàn quyền quản trị và phân quyền.',
  MANAGER: 'Theo dõi, phân công và đánh giá trong phòng ban.',
  EMPLOYEE: 'Học tập, đánh giá và thực hiện nhiệm vụ.',
};

/** ADM-05: pick the new role of a member. Only roles the signed-in user may grant are offered. */
export function ChangeRoleModal({ member, open, onClose }: MemberDialogProps) {
  const user = useCurrentUser((s) => s.user)!;
  const update = useUpdateMember();
  const groupId = useId();
  const current = member.roles[0];
  const [selected, setSelected] = useState(current);
  const options = ROLE_DESCRIPTIONS.filter((d) => assignableRoles(user.roles).some((r) => r === d.role) || d.role === current);

  const save = async () => {
    try {
      await update.mutateAsync({ id: member.id, data: { roles: [selected] } });
      toast.success(`Đã đổi vai trò của ${member.fullName} thành ${roleLabel(selected)}.`);
      onClose();
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Không đổi được vai trò.'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      className="member-detail-modal"
      title={`Đổi vai trò của ${member.fullName}`}
      description="Chọn quyền truy cập phù hợp trong tổ chức."
      footer={
        <>
          <button type="button" onClick={onClose} className="member-modal-secondary">Hủy</button>
          <button type="button" onClick={save} disabled={selected === current || update.isPending} className="member-modal-primary">
            {update.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </>
      }
    >
      <fieldset className="member-role-picker">
        <legend className="sr-only">Vai trò</legend>
        <ul className="grid gap-2">
          {options.map((option) => (
            <li key={option.role}>
              <label className="member-role-option">
                <input
                  type="radio"
                  name={groupId}
                  value={option.role}
                  checked={selected === option.role}
                  disabled={option.role === current && !assignableRoles(user.roles).some((r) => r === current)}
                  onChange={() => setSelected(option.role)}
                  className="sr-only"
                />
                <span className="member-role-option__icon"><ShieldCheck size={19} /></span>
                <span className="member-role-option__copy">
                  <span className="member-role-option__title">{option.name}{option.role === current && <small>Hiện tại</small>}</span>
                  <span className="member-role-option__summary">{ROLE_SUMMARIES[option.role] ?? option.summary}</span>
                </span>
                <span className="member-role-option__check"><Check size={15} /></span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {selected === 'OWNER' && selected !== current && (
        <div role="alert" className="member-modal-alert mt-4">
          <CircleAlert size={18} /><p>Bạn đang cấp toàn quyền quản trị doanh nghiệp cho thành viên này.</p>
        </div>
      )}
    </Modal>
  );
}

/**
 * Moves a member to another department and position (OW-05). Every employee profile belongs to a department, so one
 * is required; for an account without a profile yet, saving creates the profile in that department.
 */
export function PlacementModal({ member, open, onClose }: MemberDialogProps) {
  const update = useUpdateMember();
  const departments = useDepartments({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const positions = useJobPositions({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const [departmentId, setDepartmentId] = useState(member.departmentId ?? '');
  const [jobPositionId, setJobPositionId] = useState(member.jobPositionId ?? '');
  const hasProfile = Boolean(member.employeeId);

  const changed = departmentId !== (member.departmentId ?? '') || jobPositionId !== (member.jobPositionId ?? '');
  const save = async () => {
    try {
      await update.mutateAsync({ id: member.id, data: { departmentId, jobPositionId } });
      toast.success('Đã cập nhật phòng ban và vị trí.');
      onClose();
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Không cập nhật được.'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      className="member-detail-modal member-placement-modal"
      title={`Phòng ban và vị trí của ${member.fullName}`}
      description="Cập nhật nơi làm việc và chuẩn năng lực theo vị trí."
      footer={
        <>
          <button type="button" onClick={onClose} className="member-modal-secondary">Hủy</button>
          <button type="button" onClick={save} disabled={!departmentId || !changed || update.isPending} className="member-modal-primary">
            {update.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </>
      }
    >
      <div className="member-placement-fields">
        {!hasProfile && (
          <div role="status" className="member-modal-alert"><CircleAlert size={18} /><p>Chọn phòng ban để tạo hồ sơ nhân viên và bắt đầu theo dõi năng lực.</p></div>
        )}
        <div className="member-placement-field">
          <span className="member-placement-field__icon"><Building2 size={19} /></span>
          <div><p className="member-placement-field__label">Phòng ban <span>*</span></p><p className="member-placement-field__hint">Đơn vị quản lý trực tiếp</p></div>
          <OwnerFilterSelect label="Phòng ban" value={departmentId} onChange={setDepartmentId} options={[{ value: '', label: 'Chọn phòng ban' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
        </div>
        <div className="member-placement-field">
          <span className="member-placement-field__icon member-placement-field__icon--sky"><BriefcaseBusiness size={19} /></span>
          <div><p className="member-placement-field__label">Vị trí công việc</p><p className="member-placement-field__hint">Áp dụng chuẩn năng lực tương ứng</p></div>
          <OwnerFilterSelect label="Vị trí công việc" value={jobPositionId} onChange={setJobPositionId} options={[{ value: '', label: 'Chưa xếp vị trí' }, ...positions.map((p) => ({ value: p.id, label: p.name }))]} />
        </div>
      </div>
    </Modal>
  );
}


/** Offboarding (FLOW-08): needs a reason; history is kept. */
export function DeactivateMemberDialog({ member, open, onClose }: MemberDialogProps) {
  const deactivate = useDeactivateMember();
  return (
    <ConfirmActionDialog
      open={open}
      onClose={onClose}
      title={`Vô hiệu hóa ${member.fullName}?`}
      description="Người này sẽ không đăng nhập được nữa và quyền sử dụng được giải phóng lại cho gói. Hồ sơ năng lực, lịch sử học tập và bằng chứng vẫn được giữ nguyên, có thể kích hoạt lại sau."
      confirmLabel="Vô hiệu hóa"
      requireReason
      reasonPlaceholder="Ví dụ: nghỉ việc, chuyển công ty…"
      onConfirm={async (reason) => {
        try {
          await deactivate.mutateAsync({ id: member.id, reason });
          toast.success(`Đã vô hiệu hóa ${member.fullName}.`);
        } catch (error) {
          toast.error(organizationErrorMessage(error, 'Không vô hiệu hóa được.'));
        }
      }}
    />
  );
}

export function ReactivateMemberDialog({ member, open, onClose }: MemberDialogProps) {
  const reactivate = useReactivateMember();
  return (
    <ConfirmActionDialog
      open={open}
      onClose={onClose}
      title={`Kích hoạt lại ${member.fullName}?`}
      description="Người này đăng nhập lại được và sử dụng một quyền sử dụng của gói."
      confirmLabel="Kích hoạt lại"
      confirmVariant="primary"
      onConfirm={async () => {
        try {
          await reactivate.mutateAsync(member.id);
          toast.success(`Đã kích hoạt lại ${member.fullName}.`);
        } catch (error) {
          toast.error(organizationErrorMessage(error, 'Không kích hoạt lại được.'));
        }
      }}
    />
  );
}

export function InvitationActions({ member }: { member: MemberListItem }) {
  const resend = useResendInvitation();
  const revoke = useRevokeInvitation();
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const handleResend = async () => {
    try {
      await resend.mutateAsync(member.id);
      toast.success(`Đã gửi lại lời mời cho ${member.email}.`);
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Không gửi lại được lời mời.'));
    }
  };

  return (
    <>
      <button type="button" onClick={handleResend} disabled={resend.isPending} className={SECONDARY_BUTTON}>Gửi lại lời mời</button>
      <button type="button" onClick={() => setConfirmRevoke(true)} className={SECONDARY_BUTTON}>Thu hồi lời mời</button>
      <ConfirmActionDialog
        open={confirmRevoke}
        onClose={() => setConfirmRevoke(false)}
        title={`Thu hồi lời mời của ${member.fullName}?`}
        description="Liên kết kích hoạt sẽ không dùng được nữa và quyền sử dụng được giải phóng lại cho gói."
        confirmLabel="Thu hồi"
        onConfirm={async () => {
          try {
            await revoke.mutateAsync(member.id);
            toast.success('Đã thu hồi lời mời.');
          } catch (error) {
            toast.error(organizationErrorMessage(error, 'Không thu hồi được lời mời.'));
          }
        }}
      />
    </>
  );
}
