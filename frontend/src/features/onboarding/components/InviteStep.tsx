import { useState } from 'react';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { useInviteMembers } from '@/hooks/use-onboarding';
import { USE_MOCK } from '@/services/mock/mock-config';
import { ROLE_LABELS } from '@/lib/roles';
import type { InviteResult, InviteRow, MemberRole, OrganizationSetup } from '@/types/commerce';
import { CsvImport } from './CsvImport';
import { INPUT_CLASS, LINK_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON, errorMessage } from './styles';

const MEMBER_ROLES: MemberRole[] = ['EMPLOYEE', 'MANAGER', 'OWNER'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteStepProps {
  setup: OrganizationSetup;
  onBack: () => void;
  onDone: () => void;
  onSkip: () => void;
}

interface Draft {
  fullName: string;
  email: string;
  employeeCode: string;
  departmentName: string;
  positionName: string;
  jobGrade: string;
  role: MemberRole;
}

const EMPTY_DRAFT: Draft = {
  fullName: '',
  email: '',
  employeeCode: '',
  departmentName: '',
  positionName: '',
  jobGrade: 'G1',
  role: 'EMPLOYEE',
};

/**
 * AUTH-05 / ENT-ONB-08: Thêm nhân viên trong quá trình khởi tạo tổ chức.
 * Hỗ trợ nhập trực tiếp hoặc nhập tệp CSV, gán vị trí, phòng ban,
 * tự động suy ra Cấp bậc G1–G3, phân quyền (Nhân viên, Quản lý, Chủ doanh nghiệp).
 */
export function InviteStep({ setup, onBack, onDone, onSkip }: InviteStepProps) {
  const invite = useInviteMembers();
  const [queue, setQueue] = useState<InviteRow[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [draftError, setDraftError] = useState<string>();
  const [result, setResult] = useState<InviteResult>();
  const [submitError, setSubmitError] = useState<string>();

  const known = {
    departments: setup.departments.map((d) => d.name),
    positions: setup.positions.map((p) => p.name),
  };
  const seatsLeft = setup.seatLimit === undefined ? undefined : setup.seatLimit - setup.seatsUsed - queue.length;

  const handlePositionChange = (positionName: string) => {
    const pos = setup.positions.find((p) => p.name === positionName);
    setDraft((curr) => ({
      ...curr,
      positionName,
      departmentName: pos?.departmentName || curr.departmentName,
      jobGrade: pos?.jobGrade || curr.jobGrade || 'G1',
    }));
  };

  const addDraft = () => {
    const email = draft.email.trim().toLowerCase();
    if (!draft.fullName.trim()) return setDraftError('Nhập họ tên.');
    if (!EMAIL_PATTERN.test(email)) return setDraftError('Email không hợp lệ.');
    if (queue.some((row) => row.email === email)) return setDraftError('Email này đã có trong danh sách chờ gửi.');
    setDraftError(undefined);
    setQueue([
      ...queue,
      {
        ...draft,
        email,
        employeeCode: draft.employeeCode.trim() || undefined,
        departmentName: draft.departmentName || undefined,
        positionName: draft.positionName || undefined,
        jobGrade: draft.jobGrade || undefined,
      },
    ]);
    setDraft(EMPTY_DRAFT);
  };

  const addRows = (rows: InviteRow[]) =>
    setQueue((current) => [...current, ...rows.filter((row) => !current.some((c) => c.email === row.email))]);

  const send = async () => {
    setSubmitError(undefined);
    try {
      const outcome = await invite.mutateAsync(queue);
      setResult(outcome);
      setQueue([]);
    } catch (error) {
      setSubmitError(errorMessage(error));
    }
  };

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  return (
    <div className="grid max-w-3xl gap-8">
      {setup.seatLimit !== undefined && (
        <p className="text-sm text-slate-600" role="status">
          Số ghế: <strong className="font-semibold text-slate-900">{setup.seatsUsed + queue.length}</strong> / {setup.seatLimit}
          {seatsLeft !== undefined && seatsLeft < 0 && (
            <span className="ml-2 font-medium text-red-600">Vượt quá số ghế của gói đăng ký.</span>
          )}
        </p>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          addDraft();
        }}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        aria-label="Thêm một nhân viên"
      >
        <p className="mb-4 text-sm font-semibold text-slate-900">Thêm nhân viên vào danh sách</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label htmlFor="invite-name" className="text-xs font-medium text-slate-700">
              Họ tên
            </label>
            <input
              id="invite-name"
              placeholder="Nguyễn Văn A"
              value={draft.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="invite-email" className="text-xs font-medium text-slate-700">
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              placeholder="a.nguyen@company.com"
              value={draft.email}
              onChange={(e) => set('email', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="invite-code" className="text-xs font-medium text-slate-700">
              Mã nhân viên (tùy chọn)
            </label>
            <input
              id="invite-code"
              placeholder="Ví dụ: EMP-001"
              value={draft.employeeCode}
              onChange={(e) => set('employeeCode', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="invite-position" className="text-xs font-medium text-slate-700">
              Vị trí công việc
            </label>
            <select
              id="invite-position"
              value={draft.positionName}
              onChange={(e) => handlePositionChange(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Chưa xếp</option>
              {known.positions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="invite-department" className="text-xs font-medium text-slate-700">
              Phòng ban
            </label>
            <select
              id="invite-department"
              value={draft.departmentName}
              onChange={(e) => set('departmentName', e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Chưa xếp</option>
              {known.departments.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="invite-role" className="text-xs font-medium text-slate-700">
              Vai trò tài khoản
            </label>
            <select
              id="invite-role"
              value={draft.role}
              onChange={(e) => set('role', e.target.value as MemberRole)}
              className={INPUT_CLASS}
            >
              {MEMBER_ROLES.map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}</option>
              ))}
            </select>
          </div>
        </div>

        {draft.role === 'OWNER' && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              <strong>Cảnh báo quyền hạn:</strong> Vai trò Chủ doanh nghiệp có toàn quyền quản trị, chỉnh sửa cấu trúc tổ chức, thanh toán và gán quyền. Chỉ phân quyền cho người có thẩm quyền cao nhất.
            </span>
          </div>
        )}

        {draftError && <p role="alert" className="mt-3 text-sm text-red-600">{draftError}</p>}

        <div className="mt-4">
          <button type="submit" className={SECONDARY_BUTTON}>
            <Plus className="size-4" aria-hidden="true" />
            Thêm vào danh sách
          </button>
        </div>
      </form>

      <CsvImport enabled={setup.canBulkImport} known={known} onRows={addRows} />

      {queue.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="mb-3 text-sm font-semibold text-slate-900">
            Chờ gửi lời mời ({queue.length} nhân sự)
          </p>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {queue.map((row) => (
              <li key={row.email} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 truncate font-medium text-slate-900">
                    {row.fullName}
                    {row.employeeCode && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[11px] font-normal text-slate-600">
                        {row.employeeCode}
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {row.email} · {ROLE_LABELS[row.role as keyof typeof ROLE_LABELS] || row.role}
                    {row.positionName ? ` · ${row.positionName}` : ''}
                    {row.departmentName ? ` · ${row.departmentName}` : ''}
                    {row.jobGrade ? ` · [${row.jobGrade}]` : ''}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setQueue(queue.filter((r) => r.email !== row.email))}
                  aria-label={`Bỏ ${row.fullName} khỏi danh sách`}
                  className="grid size-7 shrink-0 place-items-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          {submitError && <p role="alert" className="mt-2 text-sm text-red-600">{submitError}</p>}
          <button type="button" onClick={send} disabled={invite.isPending} className={`${PRIMARY_BUTTON} mt-4`}>
            {invite.isPending ? 'Đang gửi…' : `Gửi ${queue.length} lời mời`}
          </button>
        </div>
      )}

      {result && <InviteOutcome result={result} />}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button type="button" onClick={onBack} className={SECONDARY_BUTTON}>Quay lại</button>
        <button type="button" onClick={onDone} className={PRIMARY_BUTTON}>Tiếp tục</button>
        <button type="button" onClick={onSkip} className={LINK_BUTTON}>Bỏ qua bước này</button>
      </div>
    </div>
  );
}

function InviteOutcome({ result }: { result: InviteResult }) {
  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <p className="text-sm font-semibold text-slate-900">Kết quả gửi lời mời</p>
      {result.created.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-emerald-700">Đã gửi {result.created.length} lời mời.</p>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {result.created.map((item) => (
              <li key={item.email} className="px-3 py-2 text-xs text-slate-700">
                <span className="font-medium text-slate-900">{item.fullName}</span> ({item.email})
                {USE_MOCK && (
                  <span className="mt-1 block font-mono text-[11px] text-slate-500">
                    Kích hoạt thử nghiệm: /activate?token={item.token}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.rejected.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-red-600">Không gửi được ({result.rejected.length})</p>
          <ul className="divide-y divide-slate-100 rounded-lg border border-red-200 bg-red-50/50">
            {result.rejected.map((item) => (
              <li key={item.email} className="px-3 py-2 text-xs text-red-700">
                <span className="font-medium">{item.email}</span>: {item.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
