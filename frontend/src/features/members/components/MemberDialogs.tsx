import { useId, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmActionDialog, Modal } from '@/components/shared';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import {
  useDeactivateMember, useReactivateMember, useResendInvitation, useRevokeInvitation, useUpdateMember,
} from '@/hooks/use-members';
import { assignableRoles } from '@/lib/role-policy';
import { ROLE_DESCRIPTIONS } from '@/lib/role-policy';
import { apiErrorMessage } from '@/lib/utils';
import type { MemberListItem } from '@/services/member.service';
import { INPUT_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import { roleLabel } from '../member-labels';

interface MemberDialogProps {
  member: MemberListItem;
  open: boolean;
  onClose: () => void;
}

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
      toast.error(apiErrorMessage(error, 'Không đổi được vai trò.'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={`Đổi vai trò của ${member.fullName}`}
      description="Vai trò quyết định người này thấy và làm được gì trong tổ chức."
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>Hủy</button>
          <button type="button" onClick={save} disabled={selected === current || update.isPending} className={PRIMARY_BUTTON}>
            {update.isPending ? 'Đang lưu…' : 'Lưu vai trò'}
          </button>
        </>
      }
    >
      <fieldset>
        <legend className="sr-only">Vai trò</legend>
        <ul className="grid gap-2">
          {options.map((option) => (
            <li key={option.role}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                <input
                  type="radio"
                  name={groupId}
                  value={option.role}
                  checked={selected === option.role}
                  disabled={option.role === current && !assignableRoles(user.roles).some((r) => r === current)}
                  onChange={() => setSelected(option.role)}
                  className="mt-0.5 size-4 accent-primary-600"
                />
                <span>
                  <span className="block font-medium text-slate-900">{option.name}</span>
                  <span className="block text-slate-500">{option.summary}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {selected === 'OWNER' && selected !== current && (
        <div role="alert" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-bold text-amber-800">Cảnh báo phân quyền:</p>
          <p className="mt-0.5">Bạn đang cấp toàn quyền quản trị doanh nghiệp cho người này.</p>
        </div>
      )}
    </Modal>
  );
}

/** Moves a member to another department and position. (OW-05) */
export function PlacementModal({ member, open, onClose }: MemberDialogProps) {
  const update = useUpdateMember();
  const base = useId();
  const departments = useDepartments({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const positions = useJobPositions({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const [departmentId, setDepartmentId] = useState(member.departmentId ?? '');
  const [jobPositionId, setJobPositionId] = useState(member.jobPositionId ?? '');

  const save = async () => {
    try {
      await update.mutateAsync({ id: member.id, data: { departmentId: departmentId || undefined, jobPositionId } });
      toast.success('Đã cập nhật phòng ban và vị trí.');
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không cập nhật được.'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={`Phòng ban và vị trí của ${member.fullName}`}
      description="Vị trí quyết định Cấp bậc (G1–G3) và bộ yêu cầu năng lực chuẩn của nhân sự."
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>Hủy</button>
          <button type="button" onClick={save} disabled={update.isPending} className={PRIMARY_BUTTON}>
            {update.isPending ? 'Đang lưu…' : 'Lưu'}
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor={`${base}-department`} className="text-sm font-medium text-slate-700">Phòng ban</label>
          <select id={`${base}-department`} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={INPUT_CLASS}>
            <option value="">Chưa xếp phòng ban</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={`${base}-position`} className="text-sm font-medium text-slate-700">Vị trí công việc</label>
          <select id={`${base}-position`} value={jobPositionId} onChange={(e) => setJobPositionId(e.target.value)} className={INPUT_CLASS}>
            <option value="">Chưa xếp vị trí</option>
            {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
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
          toast.error(apiErrorMessage(error, 'Không vô hiệu hóa được.'));
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
          toast.error(apiErrorMessage(error, 'Không kích hoạt lại được.'));
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
      toast.error(apiErrorMessage(error, 'Không gửi lại được lời mời.'));
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
            toast.error(apiErrorMessage(error, 'Không thu hồi được lời mời.'));
          }
        }}
      />
    </>
  );
}
