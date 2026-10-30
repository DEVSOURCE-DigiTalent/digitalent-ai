import { useId, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  UserPlus,
  Plus,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Building2,
  Briefcase,
  ShieldAlert,
  Send,
  FileText,
} from 'lucide-react';
import { Modal } from '@/components/shared';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { useInviteMembers } from '@/hooks/use-members';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { assignableRoles } from '@/lib/role-policy';
import type { InviteResult, MemberRole } from '@/types/commerce';
import { roleLabel } from '../member-labels';
import {
  downloadEmployeeTemplate,
  parseSmartEmployeeCsv,
  type ParsedEmployeeRow,
} from '../utils/employee-import-helper';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Draft {
  fullName: string;
  email: string;
  employeeCode?: string;
  departmentId: string;
  departmentName?: string;
  jobPositionId: string;
  positionName?: string;
  role: MemberRole;
}

const EMPTY_DRAFT: Draft = {
  fullName: '',
  email: '',
  employeeCode: '',
  departmentId: '',
  jobPositionId: '',
  role: 'EMPLOYEE' as MemberRole,
};

interface QueuedPerson extends Draft {
  key: string;
}

interface InviteMembersModalProps {
  open: boolean;
  onClose: () => void;
  defaultDepartmentId?: string;
}

export function InviteMembersModal({ open, onClose, defaultDepartmentId }: InviteMembersModalProps) {
  const user = useCurrentUser((s) => s.user)!;
  const invite = useInviteMembers();
  const roles = assignableRoles(user.roles) as MemberRole[];
  const departments = useDepartments({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const positions = useJobPositions({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];

  const base = useId();
  const [tab, setTab] = useState<'excel' | 'manual'>('excel');
  const [queue, setQueue] = useState<QueuedPerson[]>([]);
  const [draft, setDraft] = useState<Draft>({
    ...EMPTY_DRAFT,
    departmentId: defaultDepartmentId || '',
  });

  // Excel / CSV Import State
  const [pastedText, setPastedText] = useState('');
  const [isPasting, setIsPasting] = useState(false);
  const [previewRows, setPreviewRows] = useState<ParsedEmployeeRow[]>([]);
  const [parseIssues, setParseIssues] = useState<string[]>([]);
  const [batchDeptId, setBatchDeptId] = useState('');

  // Delivery options: Gửi ngay (true) hoặc Thêm vào phòng ban trước, gửi sau (false)
  const [sendInviteNow, setSendInviteNow] = useState(true);

  const [draftError, setDraftError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [result, setResult] = useState<InviteResult>();

  const visiblePositions = positions.filter(
    (position) => !position.departmentId || position.departmentId === draft.departmentId,
  );

  const setDraftField = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  // --- Manual Add ---
  const handleAddDraft = () => {
    const email = draft.email.trim().toLowerCase();
    if (!draft.fullName.trim()) return setDraftError('Vui lòng nhập họ và tên.');
    if (!EMAIL_PATTERN.test(email)) return setDraftError('Địa chỉ email không hợp lệ.');
    if (draft.role !== 'OWNER' && !draft.departmentId) return setDraftError('Vui lòng chọn phòng ban.');
    if (draft.role === 'EMPLOYEE' && !draft.jobPositionId) return setDraftError('Vui lòng chọn vị trí công việc.');
    if (draft.jobPositionId && !visiblePositions.some((p) => p.id === draft.jobPositionId))
      return setDraftError('Vị trí công việc không thuộc phòng ban đã chọn.');
    if (queue.some((q) => q.email === email)) return setDraftError('Email này đã có trong danh sách chờ gửi.');

    setDraftError(undefined);
    setQueue((curr) => [...curr, { ...draft, email, key: email }]);
    setDraft({
      ...EMPTY_DRAFT,
      departmentId: draft.departmentId,
      role: draft.role,
    });
  };

  // --- Excel File Loading & Parsing ---
  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseSmartEmployeeCsv(text, departments, positions);
      setPreviewRows(parsed.rows);
      setParseIssues(parsed.issues);
      setPastedText('');
    } catch {
      setParseIssues(['Không thể đọc file. Vui lòng kiểm tra định dạng file .csv hoặc .txt.']);
    }
  };

  const handleParseText = () => {
    if (!pastedText.trim()) return;
    const parsed = parseSmartEmployeeCsv(pastedText, departments, positions);
    setPreviewRows(parsed.rows);
    setParseIssues(parsed.issues);
  };

  const updatePreviewRow = (id: string, updates: Partial<ParsedEmployeeRow>) => {
    setPreviewRows((curr) =>
      curr.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, ...updates };

        // Tự động cập nhật tên phòng ban và lọc lại vị trí nếu đổi phòng ban
        if (updates.departmentId !== undefined) {
          if (updates.departmentId.startsWith('new:')) {
            updated.departmentName = updates.departmentId.replace('new:', '');
          } else {
            const matchedDept = departments.find((d) => d.id === updates.departmentId);
            updated.departmentName = matchedDept ? matchedDept.name : '';
          }
          // Nếu vị trí hiện tại không thuộc phòng ban mới, reset vị trí
          const validPos = positions.some(
            (p) => p.id === updated.jobPositionId && (!p.departmentId || p.departmentId === updates.departmentId),
          );
          if (!validPos && !updated.jobPositionId?.startsWith('new:')) {
            updated.jobPositionId = '';
            updated.positionName = '';
          }
        }

        // Tự động cập nhật tên vị trí nếu đổi vị trí
        if (updates.jobPositionId !== undefined) {
          if (updates.jobPositionId.startsWith('new:')) {
            updated.positionName = updates.jobPositionId.replace('new:', '');
          } else {
            const matchedPos = positions.find((p) => p.id === updates.jobPositionId);
            updated.positionName = matchedPos ? matchedPos.name : '';
          }
        }

        // Cập nhật trạng thái hợp lệ
        const errors: string[] = [];
        if (!updated.fullName.trim()) errors.push('Thiếu họ tên');
        if (!EMAIL_PATTERN.test(updated.email.trim().toLowerCase())) errors.push('Email không hợp lệ');
        if (!updated.departmentId && updated.role !== 'OWNER') errors.push('Chưa chọn phòng ban');
        updated.isValid = errors.length === 0;
        updated.errors = errors;

        return updated;
      }),
    );
  };

  const removePreviewRow = (id: string) => {
    setPreviewRows((curr) => curr.filter((r) => r.id !== id));
  };

  const handleBatchAssignDept = () => {
    if (!batchDeptId) return;
    const matchedDept = departments.find((d) => d.id === batchDeptId);
    if (!matchedDept) return;

    setPreviewRows((curr) =>
      curr.map((row) => {
        if (row.departmentId) return row; // Giữ nguyên dòng đã có phòng ban
        return {
          ...row,
          departmentId: matchedDept.id,
          departmentName: matchedDept.name,
          isValid: Boolean(row.fullName.trim() && EMAIL_PATTERN.test(row.email.trim().toLowerCase())),
          errors: row.errors.filter((e) => !e.includes('phòng ban')),
        };
      }),
    );
  };

  const handleAddValidPreviewToQueue = () => {
    const validRows = previewRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    const newQueued: QueuedPerson[] = validRows
      .filter((r) => !queue.some((q) => q.email === r.email))
      .map((r) => ({
        key: r.email,
        fullName: r.fullName,
        email: r.email,
        employeeCode: r.employeeCode || undefined,
        departmentId: r.departmentId,
        departmentName: r.departmentName,
        jobPositionId: r.jobPositionId,
        positionName: r.positionName,
        role: r.role,
      }));

    setQueue((curr) => [...curr, ...newQueued]);
    // Giữ lại các dòng bị lỗi để người dùng sửa nếu có
    setPreviewRows((curr) => curr.filter((r) => !r.isValid));
  };

  // --- Submit Final Queue ---
  const handleSend = async () => {
    if (queue.length === 0) return;
    setSubmitError(undefined);
    try {
      const outcome = await invite.mutateAsync(
        queue.map(({ key: _key, ...person }) => ({
          ...person,
          employeeCode: person.employeeCode?.trim() || undefined,
          departmentId: person.departmentId?.startsWith('new:') ? undefined : person.departmentId || undefined,
          departmentName: person.departmentName || (person.departmentId?.startsWith('new:') ? person.departmentId.replace('new:', '') : undefined),
          jobPositionId: person.jobPositionId?.startsWith('new:') ? undefined : person.jobPositionId || undefined,
          jobPositionName: person.positionName || (person.jobPositionId?.startsWith('new:') ? person.jobPositionId.replace('new:', '') : undefined),
        })),
      );
      setResult(outcome);
      setQueue([]);
    } catch (error) {
      setSubmitError(organizationErrorMessage(error, 'Không thể hoàn thành thêm nhân viên. Vui lòng thử lại.'));
    }
  };

  const handleClose = () => {
    setQueue([]);
    setPreviewRows([]);
    setPastedText('');
    setParseIssues([]);
    setDraft(EMPTY_DRAFT);
    setDraftError(undefined);
    setSubmitError(undefined);
    setResult(undefined);
    onClose();
  };

  const validPreviewCount = previewRows.filter((r) => r.isValid).length;
  const seatsLeft =
    user.subscription?.seatLimit === undefined
      ? undefined
      : user.subscription.seatLimit - (user.subscription.seatsUsed ?? 0) - queue.length;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="xl"
      title="Thêm & Mời nhân viên vào doanh nghiệp"
      description="Tải lên danh sách Excel hoặc thêm từng nhân sự. Nhân viên sẽ tự động được phân về đúng phòng ban và nhận lộ trình tương ứng."
      footer={
        <div className="flex w-full flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {queue.length > 0 ? (
              <span>
                Đang có <strong className="text-blue-700 font-bold">{queue.length}</strong> nhân sự sẵn sàng trong hàng chờ.
              </span>
            ) : (
              <span>Thêm nhân sự từ Excel hoặc thủ công để kích hoạt gửi.</span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={queue.length === 0 || invite.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#304bdf] hover:bg-[#203bbf] px-5 py-2.5 text-xs font-bold text-white transition-all shadow-sm shadow-[#304bdf]/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="size-3.5" />
              {invite.isPending
                ? 'Đang xử lý...'
                : queue.length > 0
                  ? sendInviteNow
                    ? `Gửi ${queue.length} lời mời ngay`
                    : `Lưu ${queue.length} nhân sự vào phòng ban`
                  : 'Xác nhận'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Seat limit info */}
        {seatsLeft !== undefined && (
          <div
            className={`rounded-xl border px-4 py-2.5 text-xs font-medium ${
              seatsLeft < 0 ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-100 bg-blue-50/60 text-blue-800'
            }`}
          >
            {seatsLeft < 0
              ? `Danh sách vượt quá ${-seatsLeft} quyền sử dụng gói dịch vụ hiện tại.`
              : `Gói ${user.subscription?.planName || 'Doanh nghiệp'} còn ${seatsLeft} quyền sử dụng thành viên khả dụng.`}
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setTab('excel')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              tab === 'excel'
                ? 'bg-[#304bdf] text-white shadow-sm shadow-[#304bdf]/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="size-4" />
            Nhập hàng loạt từ Excel / CSV (Khuyên dùng)
          </button>
          <button
            type="button"
            onClick={() => setTab('manual')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              tab === 'manual'
                ? 'bg-[#304bdf] text-white shadow-sm shadow-[#304bdf]/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <UserPlus className="size-4" />
            Thêm từng nhân viên
          </button>
        </div>

        {/* TAB 1: SMART EXCEL / CSV IMPORT */}
        {tab === 'excel' && (
          <div className="space-y-5">
            {/* Box tải file mẫu Excel & xem trước form */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white p-4 space-y-3.5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                    <FileSpreadsheet className="size-4.5 text-emerald-700" />
                    Biểu mẫu Excel chuẩn hóa thông tin nhân sự
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-xl">
                    Tải về biểu mẫu chuẩn hoặc xem cấu trúc các cột bên dưới để nhập đúng thông tin: <strong>Họ tên, Email, Mã NV, Phòng ban, Vị trí, Vai trò</strong>. Hệ thống sẽ tự động ghép nhân viên vào đúng phòng ban khi tải lên.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadEmployeeTemplate(departments, positions)}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="size-4" />
                  Tải file mẫu Excel (.csv)
                </button>
              </div>

              {/* Bảng xem trước cấu trúc mẫu trực quan */}
              <div className="rounded-xl border border-emerald-200/90 bg-white/95 overflow-hidden text-xs shadow-2xs">
                <div className="bg-emerald-100/60 px-3.5 py-1.5 font-bold text-emerald-950 flex items-center justify-between border-b border-emerald-200/60">
                  <span className="flex items-center gap-1.5">
                    <FileText className="size-3.5 text-emerald-700" />
                    Cấu trúc các cột mẫu trong file Excel
                  </span>
                  <span className="text-[11px] font-medium text-emerald-800">
                    {departments.length} phòng ban khả dụng trong hệ thống
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-emerald-100 bg-emerald-50/50 text-[11px] font-bold text-slate-800">
                        <th className="px-3.5 py-2 whitespace-nowrap">Họ và tên <span className="text-red-500 font-bold">*</span></th>
                        <th className="px-3.5 py-2 whitespace-nowrap">Email <span className="text-red-500 font-bold">*</span></th>
                        <th className="px-3.5 py-2 whitespace-nowrap">Mã nhân viên</th>
                        <th className="px-3.5 py-2 whitespace-nowrap">Phòng ban <span className="text-red-500 font-bold">*</span></th>
                        <th className="px-3.5 py-2 whitespace-nowrap">Vị trí công việc</th>
                        <th className="px-3.5 py-2 whitespace-nowrap">Vai trò</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] text-slate-700 divide-y divide-emerald-50">
                      <tr>
                        <td className="px-3.5 py-2 font-medium text-slate-900">Nguyễn Văn An</td>
                        <td className="px-3.5 py-2 font-mono text-slate-600">an.nguyen@congty.vn</td>
                        <td className="px-3.5 py-2 font-mono text-slate-500">NV001</td>
                        <td className="px-3.5 py-2 font-semibold text-blue-700">
                          {departments[0]?.name || 'Kinh doanh'}
                        </td>
                        <td className="px-3.5 py-2 text-slate-600">
                          {positions[0]?.name || 'Chuyên viên kinh doanh'}
                        </td>
                        <td className="px-3.5 py-2">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                            Nhân viên
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-slate-50/30">
                        <td className="px-3.5 py-2 font-medium text-slate-900">Trần Thị Bình</td>
                        <td className="px-3.5 py-2 font-mono text-slate-600">binh.tran@congty.vn</td>
                        <td className="px-3.5 py-2 font-mono text-slate-500">NV002</td>
                        <td className="px-3.5 py-2 font-semibold text-blue-700">
                          {departments[1]?.name || departments[0]?.name || 'Kỹ thuật'}
                        </td>
                        <td className="px-3.5 py-2 text-slate-600">
                          {positions[1]?.name || positions[0]?.name || 'Trưởng nhóm'}
                        </td>
                        <td className="px-3.5 py-2">
                          <span className="rounded-md bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
                            Quản lý
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {departments.length > 0 && (
                  <div className="bg-emerald-50/40 border-t border-emerald-100 px-3.5 py-2 flex flex-wrap items-center gap-1.5 text-[11px] text-emerald-900">
                    <span className="font-bold">Gợi ý tên phòng ban hiện có để điền vào file:</span>
                    {departments.map((d) => (
                      <span key={d.id} className="rounded-md bg-white border border-emerald-200 px-2 py-0.5 font-medium shadow-2xs">
                        {d.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upload & Paste Area */}
            {previewRows.length === 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Chọn tải file lên hoặc dán trực tiếp:</span>
                  <button
                    type="button"
                    onClick={() => setIsPasting(!isPasting)}
                    className="text-[#304bdf] hover:underline flex items-center gap-1"
                  >
                    <FileText className="size-3.5" />
                    {isPasting ? 'Chuyển sang chọn file' : 'Dán dữ liệu trực tiếp từ Excel'}
                  </button>
                </div>

                {!isPasting ? (
                  <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-7 text-center hover:bg-blue-50/30 hover:border-blue-400 cursor-pointer transition-all">
                    <div className="grid size-12 place-items-center rounded-full bg-blue-100 text-[#304bdf] mb-3">
                      <Upload className="size-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      Bấm để chọn file Excel (.csv) hoặc kéo thả vào đây
                    </span>
                    <span className="mt-1 text-xs text-slate-500">
                      Hỗ trợ file .csv xuất từ Microsoft Excel, Google Sheets chuẩn UTF-8
                    </span>
                    <input
                      type="file"
                      accept=".csv,text/csv,text/plain"
                      className="sr-only"
                      onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    />
                  </label>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      rows={5}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Dán các dòng sao chép từ Excel hoặc file CSV vào đây...&#10;Ví dụ:&#10;Nguyễn Văn An, an.nguyen@congty.vn, NV001, Kinh doanh, Chuyên viên, Nhân viên"
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#304bdf] focus:ring-2 focus:ring-[#304bdf]/20"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleParseText}
                        disabled={!pastedText.trim()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#304bdf] px-4 py-2 text-xs font-bold text-white hover:bg-[#203bbf] disabled:opacity-40"
                      >
                        Đọc danh sách nhân viên
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* SMART PREVIEW TABLE */
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Đã đọc {previewRows.length} nhân sự
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      {validPreviewCount} hợp lệ
                    </span>
                    {previewRows.length - validPreviewCount > 0 && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                        {previewRows.length - validPreviewCount} cần kiểm tra
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Gán phòng ban hàng loạt cho dòng chưa chọn */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={batchDeptId}
                        onChange={(e) => setBatchDeptId(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                      >
                        <option value="">Gán PB cho dòng trống...</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleBatchAssignDept}
                        disabled={!batchDeptId}
                        className="rounded-lg bg-slate-200 hover:bg-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40"
                      >
                        Áp dụng
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewRows([])}
                      className="rounded-lg border border-slate-200 bg-white hover:bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600"
                    >
                      Chọn file khác
                    </button>
                  </div>
                </div>

                {/* Bảng xem trước chi tiết */}
                <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100/80 sticky top-0 z-10 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-8">#</th>
                        <th className="py-2.5 px-3">Họ và tên</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Mã NV</th>
                        <th className="py-2.5 px-3">Phòng ban *</th>
                        <th className="py-2.5 px-3">Vị trí</th>
                        <th className="py-2.5 px-3">Vai trò</th>
                        <th className="py-2.5 px-3 text-center w-10">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {previewRows.map((row, idx) => {
                        const deptPositions = positions.filter(
                          (p) => !p.departmentId || p.departmentId === row.departmentId,
                        );

                        return (
                          <tr key={row.id} className={row.isValid ? 'hover:bg-slate-50/70' : 'bg-red-50/40'}>
                            <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              <input
                                value={row.fullName}
                                onChange={(e) => updatePreviewRow(row.id, { fullName: e.target.value })}
                                className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#304bdf] focus:bg-white px-1 py-0.5 outline-none rounded"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-mono text-slate-700">{row.email}</span>
                              {row.errors.some((e) => e.includes('Email')) && (
                                <span className="block text-[10px] text-red-600 font-medium">Email sai</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-500 font-mono">
                              <input
                                value={row.employeeCode}
                                placeholder="NV..."
                                onChange={(e) => updatePreviewRow(row.id, { employeeCode: e.target.value })}
                                className="w-16 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#304bdf] focus:bg-white px-1 py-0.5 outline-none rounded font-mono"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={row.departmentId}
                                onChange={(e) => updatePreviewRow(row.id, { departmentId: e.target.value })}
                                className={`w-full rounded-lg border px-2 py-1 text-xs outline-none ${
                                  row.departmentId ? 'border-slate-200 bg-blue-50/30 text-blue-900 font-medium' : 'border-red-300 bg-red-50 text-red-700'
                                }`}
                              >
                                <option value="">-- Chưa chọn PB --</option>
                                {row.departmentId?.startsWith('new:') && (
                                  <option value={row.departmentId}>
                                    {row.departmentName || row.departmentId.replace('new:', '')} (Mới từ file)
                                  </option>
                                )}
                                {departments.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name} {d.code ? `(${d.code})` : ''}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={row.jobPositionId}
                                onChange={(e) => updatePreviewRow(row.id, { jobPositionId: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 outline-none"
                              >
                                <option value="">-- Vị trí --</option>
                                {row.jobPositionId?.startsWith('new:') && (
                                  <option value={row.jobPositionId}>
                                    {row.positionName || row.jobPositionId.replace('new:', '')} (Mới từ file)
                                  </option>
                                )}
                                {deptPositions.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} {p.code ? `(${p.code})` : ''}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={row.role}
                                onChange={(e) => updatePreviewRow(row.id, { role: e.target.value as MemberRole })}
                                className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-800 outline-none"
                              >
                                <option value="EMPLOYEE">Nhân viên</option>
                                <option value="MANAGER">Quản lý</option>
                                <option value="OWNER">Chủ sở hữu</option>
                              </select>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => removePreviewRow(row.id)}
                                className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddValidPreviewToQueue}
                    disabled={validPreviewCount === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                    Thêm {validPreviewCount} nhân sự hợp lệ vào danh sách chờ gửi
                  </button>
                </div>
              </div>
            )}

            {parseIssues.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="size-4" />
                  Cần lưu ý khi xử lý file:
                </div>
                {parseIssues.map((issue, idx) => (
                  <p key={idx}>{issue}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANUAL ENTRY FORM */}
        {tab === 'manual' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddDraft();
            }}
            className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
          >
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor={`${base}-name`} className="text-xs font-semibold text-slate-700">
                  Họ và tên *
                </label>
                <input
                  id={`${base}-name`}
                  placeholder="VD: Nguyễn Văn An"
                  value={draft.fullName}
                  onChange={(e) => setDraftField('fullName', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#304bdf] focus:ring-2 focus:ring-[#304bdf]/20"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor={`${base}-email`} className="text-xs font-semibold text-slate-700">
                  Email nhân viên *
                </label>
                <input
                  id={`${base}-email`}
                  type="email"
                  placeholder="an.nguyen@congty.vn"
                  value={draft.email}
                  onChange={(e) => setDraftField('email', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#304bdf] focus:ring-2 focus:ring-[#304bdf]/20"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor={`${base}-code`} className="text-xs font-semibold text-slate-700">
                  Mã nhân viên
                </label>
                <input
                  id={`${base}-code`}
                  placeholder="VD: NV012"
                  value={draft.employeeCode ?? ''}
                  onChange={(e) => setDraftField('employeeCode', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#304bdf] focus:ring-2 focus:ring-[#304bdf]/20"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor={`${base}-role`} className="text-xs font-semibold text-slate-700">
                  Vai trò trong hệ thống
                </label>
                <select
                  id={`${base}-role`}
                  value={draft.role}
                  onChange={(e) => setDraftField('role', e.target.value as MemberRole)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#304bdf] focus:ring-2 focus:ring-[#304bdf]/20"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {roleLabel(r)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor={`${base}-department`} className="text-xs font-semibold text-slate-700">
                  Phòng ban {draft.role !== 'OWNER' ? '*' : ''}
                </label>
                <select
                  id={`${base}-department`}
                  value={draft.departmentId}
                  onChange={(e) =>
                    setDraft((curr) => ({
                      ...curr,
                      departmentId: e.target.value,
                      jobPositionId: '',
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#304bdf] focus:ring-2 focus:ring-[#304bdf]/20"
                >
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor={`${base}-position`} className="text-xs font-semibold text-slate-700">
                  Vị trí công việc {draft.role === 'EMPLOYEE' ? '*' : ''}
                </label>
                <select
                  id={`${base}-position`}
                  value={draft.jobPositionId}
                  onChange={(e) => setDraftField('jobPositionId', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#304bdf] focus:ring-2 focus:ring-[#304bdf]/20"
                >
                  <option value="">-- Chọn vị trí công việc --</option>
                  {visiblePositions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {draft.role === 'OWNER' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
                <ShieldAlert className="size-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Cảnh báo:</strong> Vai trò Chủ sở hữu sẽ có toàn quyền quản trị tài chính, nhân sự và cài đặt tổ chức.
                </span>
              </div>
            )}

            {draftError && <p className="text-xs font-medium text-red-600">{draftError}</p>}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                <Plus className="size-4" />
                Thêm vào danh sách chờ
              </button>
            </div>
          </form>
        )}

        {/* DANH SÁCH CHỜ GỬI (QUEUE) */}
        {queue.length > 0 && (
          <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-blue-600" />
                Danh sách chờ thêm vào hệ thống ({queue.length} người)
              </span>
              <button
                type="button"
                onClick={() => setQueue([])}
                className="text-slate-400 hover:text-red-600 text-[11px]"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {queue.map((person) => {
                const deptName = departments.find((d) => d.id === person.departmentId)?.name || 'Chưa xếp phòng ban';
                const posName = positions.find((p) => p.id === person.jobPositionId)?.name;

                return (
                  <div
                    key={person.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xs"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-100 text-[#304bdf] font-bold text-xs">
                        {person.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 truncate">
                          <strong className="text-slate-900">{person.fullName}</strong>
                          {person.employeeCode && (
                            <span className="text-[10px] font-mono text-slate-400">({person.employeeCode})</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                          <span>{person.email}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                            <Building2 className="size-3" />
                            {deptName}
                          </span>
                          {posName && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <Briefcase className="size-3" />
                                {posName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setQueue(queue.filter((q) => q.key !== person.key))}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-colors"
                      title="Bỏ khỏi danh sách"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HÌNH THỨC GỬI LỜI MỜI (DELIVERY OPTIONS) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Mail className="size-4 text-[#304bdf]" />
            Hình thức mời & kích hoạt tài khoản:
          </span>
          <div className="grid gap-2 sm:grid-cols-2 text-xs">
            <label
              className={`flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-all ${
                sendInviteNow
                  ? 'border-blue-300 bg-blue-50/50 text-blue-950 font-medium ring-1 ring-blue-300'
                  : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="inviteDelivery"
                checked={sendInviteNow}
                onChange={() => setSendInviteNow(true)}
                className="mt-0.5 text-[#304bdf] focus:ring-[#304bdf]"
              />
              <div>
                <strong className="block text-slate-900">Gửi email mời ngay lập tức</strong>
                <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                  Hệ thống gửi thư mời chứa link tạo mật khẩu đến từng email ngay sau khi thêm.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-all ${
                !sendInviteNow
                  ? 'border-blue-300 bg-blue-50/50 text-blue-950 font-medium ring-1 ring-blue-300'
                  : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="inviteDelivery"
                checked={!sendInviteNow}
                onChange={() => setSendInviteNow(false)}
                className="mt-0.5 text-[#304bdf] focus:ring-[#304bdf]"
              />
              <div>
                <strong className="block text-slate-900">Lưu danh sách, gửi lời mời sau</strong>
                <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                  Lưu vào phòng ban ở trạng thái chờ. Bạn có thể bấm mời từng người hoặc mời cả phòng ban sau.
                </span>
              </div>
            </label>
          </div>
        </div>

        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* THÔNG BÁO KẾT QUẢ VÀ LIÊN KẾT MÔ PHỎNG */}
        {result && (
          <div className="space-y-3" role="status">
            {result.created.length > 0 && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-950 space-y-1.5 shadow-xs">
                <p className="font-bold flex items-center gap-1.5 text-emerald-800 text-sm">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  Đã thêm thành công {result.created.length} nhân sự vào tổ chức!
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {sendInviteNow
                    ? 'Hệ thống đã gửi email mời kích hoạt tài khoản thật đến từng nhân sự. Nhân viên chỉ cần mở hộp thư để tự thiết lập mật khẩu và tham gia.'
                    : 'Nhân sự đã được phân bổ vào đúng phòng ban ở trạng thái Chờ kích hoạt. Bạn có thể gửi email mời bất cứ lúc nào.'}
                </p>
              </div>
            )}

            {result.rejected.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
                <p className="font-bold">Một số dòng không thể thêm:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {result.rejected.map((item) => (
                    <li key={item.email}>
                      <strong>{item.email}</strong>: {item.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
