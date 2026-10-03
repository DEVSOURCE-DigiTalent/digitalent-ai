import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { Modal } from '@/components/shared';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { useInviteMembers } from '@/hooks/use-members';
import { ENTITLEMENTS } from '@/lib/entitlements';
import { assignableRoles } from '@/lib/role-policy';
import { apiErrorMessage } from '@/lib/utils';
import { USE_MOCK } from '@/services/mock/mock-config';
import type { InviteResult, InviteRow, MemberRole } from '@/types/commerce';
import { CsvImport } from '@/features/onboarding/components/CsvImport';
import { INPUT_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import { roleLabel } from '../member-labels';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Draft {
  fullName: string;
  email: string;
  employeeCode?: string;
  departmentId: string;
  jobPositionId: string;
  role: MemberRole;
}

const EMPTY: Draft = { fullName: '', email: '', employeeCode: '', departmentId: '', jobPositionId: '', role: 'EMPLOYEE' as MemberRole };


interface QueuedPerson extends Draft {
  key: string;
}

interface InviteMembersModalProps {
  open: boolean;
  onClose: () => void;
}

/** ADM-04: invite people to the organization one by one or from a file; each becomes a pending member. */
export function InviteMembersModal({ open, onClose }: InviteMembersModalProps) {
  const user = useCurrentUser((s) => s.user)!;
  const hasEntitlement = useCurrentUser((s) => s.hasEntitlement);
  const invite = useInviteMembers();
  const roles = assignableRoles(user.roles) as MemberRole[];
  const departments = useDepartments({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const positions = useJobPositions({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];

  const base = useId();
  const [queue, setQueue] = useState<QueuedPerson[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [draftError, setDraftError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [result, setResult] = useState<InviteResult>();

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const addDraft = () => {
    const email = draft.email.trim().toLowerCase();
    if (!draft.fullName.trim()) return setDraftError('Nhập họ tên.');
    if (!EMAIL_PATTERN.test(email)) return setDraftError('Email không hợp lệ.');
    if (queue.some((q) => q.email === email)) return setDraftError('Email này đã có trong danh sách chờ gửi.');
    setDraftError(undefined);
    setQueue([...queue, { ...draft, email, key: email }]);
    setDraft({ ...EMPTY, role: draft.role });
  };

  const addCsvRows = (rows: InviteRow[]) =>
    setQueue((current) => [
      ...current,
      ...rows
        .filter((row) => !current.some((q) => q.email === row.email))
        .map((row): QueuedPerson => ({
          key: row.email,
          fullName: row.fullName,
          email: row.email,
          role: row.role,
          departmentId: departments.find((d) => d.name === row.departmentName)?.id ?? '',
          jobPositionId: positions.find((p) => p.name === row.positionName)?.id ?? '',
        })),
    ]);

  const send = async () => {
    setSubmitError(undefined);
    try {
      const outcome = await invite.mutateAsync(
        queue.map(({ key: _key, ...person }) => ({
          ...person,
          departmentId: person.departmentId || undefined,
          jobPositionId: person.jobPositionId || undefined,
        })),
      );
      setResult(outcome);
      setQueue([]);
    } catch (error) {
      setSubmitError(apiErrorMessage(error, 'Không gửi được lời mời. Vui lòng thử lại.'));
    }
  };

  const close = () => {
    setQueue([]);
    setDraft(EMPTY);
    setDraftError(undefined);
    setSubmitError(undefined);
    setResult(undefined);
    onClose();
  };

  const seatsLeft = user.subscription?.seatLimit === undefined ? undefined : user.subscription.seatLimit - (user.subscription.seatsUsed ?? 0) - queue.length;

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title="Mời thành viên"
      description="Mỗi người nhận một lời mời, tự đặt mật khẩu và vào tổ chức với vai trò bạn chọn."
      footer={
        <>
          <button type="button" onClick={close} className={SECONDARY_BUTTON}>Đóng</button>
          <button type="button" onClick={send} disabled={queue.length === 0 || invite.isPending} className={PRIMARY_BUTTON}>
            {invite.isPending ? 'Đang gửi…' : queue.length > 0 ? `Gửi ${queue.length} lời mời` : 'Gửi lời mời'}
          </button>
        </>
      }
    >
      <div className="grid gap-6">
        {seatsLeft !== undefined && (
          <p role="status" className={seatsLeft < 0 ? 'text-sm text-red-600' : 'text-sm text-slate-600'}>
            {seatsLeft < 0
              ? `Danh sách vượt hạn ngạch quyền sử dụng của gói ${-seatsLeft} người.`
              : `Còn ${seatsLeft} quyền sử dụng trong gói ${user.subscription?.planName}.`}
          </p>
        )}

        <form onSubmit={(event) => { event.preventDefault(); addDraft(); }} className="grid gap-4" aria-label="Thêm một người">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor={`${base}-name`} className="text-sm font-medium text-slate-700">Họ và tên *</label>
              <input id={`${base}-name`} value={draft.fullName} onChange={(e) => set('fullName', e.target.value)} className={INPUT_CLASS} />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor={`${base}-email`} className="text-sm font-medium text-slate-700">Email *</label>
              <input id={`${base}-email`} type="email" value={draft.email} onChange={(e) => set('email', e.target.value)} className={INPUT_CLASS} />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor={`${base}-code`} className="text-sm font-medium text-slate-700">Mã nhân viên</label>
              <input id={`${base}-code`} placeholder="VD: NV012" value={draft.employeeCode ?? ''} onChange={(e) => set('employeeCode', e.target.value)} className={INPUT_CLASS} />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor={`${base}-role`} className="text-sm font-medium text-slate-700">Vai trò</label>
              <select id={`${base}-role`} value={draft.role} onChange={(e) => set('role', e.target.value as MemberRole)} className={INPUT_CLASS}>
                {roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor={`${base}-department`} className="text-sm font-medium text-slate-700">Phòng ban</label>
              <select id={`${base}-department`} value={draft.departmentId} onChange={(e) => set('departmentId', e.target.value)} className={INPUT_CLASS}>
                <option value="">Chưa xếp</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor={`${base}-position`} className="text-sm font-medium text-slate-700">Vị trí công việc</label>
              <select id={`${base}-position`} value={draft.jobPositionId} onChange={(e) => set('jobPositionId', e.target.value)} className={INPUT_CLASS}>
                <option value="">Chưa xếp</option>
                {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {draft.role === 'OWNER' && (
            <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
              <span className="font-bold text-amber-800">Lưu ý quan trọng:</span>
              <span>Bạn đang cấp toàn quyền quản trị doanh nghiệp cho người này.</span>
            </div>
          )}

          {draftError && <p role="alert" className="text-sm text-red-600">{draftError}</p>}
          <div>
            <button type="submit" className={SECONDARY_BUTTON}>
              <Plus className="size-4" aria-hidden="true" />
              Thêm vào danh sách
            </button>
          </div>
        </form>


        <CsvImport
          enabled={hasEntitlement(ENTITLEMENTS.BULK_IMPORT)}
          known={{ departments: departments.map((d) => d.name), positions: positions.map((p) => p.name) }}
          onRows={addCsvRows}
        />

        {queue.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Chờ gửi lời mời ({queue.length})</p>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {queue.map((person) => (
                <li key={person.key} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-900">{person.fullName}</span>
                    <span className="block truncate text-slate-500">{person.email} · {roleLabel(person.role)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setQueue(queue.filter((q) => q.key !== person.key))}
                    aria-label={`Bỏ ${person.fullName} khỏi danh sách`}
                    className="grid size-7 shrink-0 place-items-center rounded-full hover:bg-slate-100"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {submitError && <p role="alert" className="text-sm text-red-600">{submitError}</p>}

        {result && (
          <div className="grid gap-3" role="status">
            {result.created.length > 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <p className="font-medium">Đã gửi {result.created.length} lời mời.</p>
                {USE_MOCK && (
                  <ul className="mt-2 grid gap-1">
                    {result.created.map((person) => (
                      <li key={person.token}>
                        {person.email}:{' '}
                        <Link to={`/activate/${person.token}`} className="font-medium underline underline-offset-4">liên kết kích hoạt (giả lập email)</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {result.rejected.length > 0 && (
              <ul className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {result.rejected.map((item) => <li key={item.email}>{item.email}: {item.reason}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
