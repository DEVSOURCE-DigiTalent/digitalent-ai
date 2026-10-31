import { useId, useRef, useState, type DragEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  Trash2,
  Upload,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import type { TrialParticipantRow } from '@/services/trial-program.service';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { readParticipantFile, rowsFromCells, TEMPLATE_COLUMNS } from '../lib/participant-file';
import { EMPTY_ROW as EMPTY, isRowEmpty, rowError } from '../lib/participant-rows';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ParticipantsEditorProps {
  rows: TrialParticipantRow[];
  onChange: (rows: TrialParticipantRow[]) => void;
  departments: string[];
  positions: string[];
  limit: number;
}

/**
 * Khung giao diện mời nhân viên tham gia đánh giá đội ngũ:
 * Thiết kế chuẩn hóa cao cấp theo phong cách Quản lý Nhân sự (InviteMembersModal):
 * 1. Tab Nhập từ file Excel / CSV (kèm tải file mẫu, xem trước cấu trúc, kéo thả hoặc dán trực tiếp).
 * 2. Tab Thêm thủ công từng nhân viên.
 * 3. Bảng danh sách trực quan, hỗ trợ gán phòng ban hàng loạt và kiểm tra tính hợp lệ tức thì.
 */
export function ParticipantsEditor({
  rows,
  onChange,
  departments,
  positions,
  limit,
}: ParticipantsEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // Fetch real org departments and job positions for rich autocomplete
  const { data: deptData } = useDepartments({ pageSize: 100, status: 'ACTIVE' });
  const { data: posData } = useJobPositions({ pageSize: 100, status: 'ACTIVE' });

  const allDepartments = Array.from(
    new Set([
      ...departments,
      ...(deptData?.items?.map((d) => d.name) ?? []),
      ...rows.map((r) => r.department.trim()).filter(Boolean),
    ]),
  );

  const allPositions = Array.from(
    new Set([
      ...positions,
      ...(posData?.items?.map((p) => p.name) ?? []),
      ...rows.map((r) => r.position.trim()).filter(Boolean),
    ]),
  );

  // Tabs: 'excel' | 'manual'
  const [tab, setTab] = useState<'excel' | 'manual'>('excel');

  // Excel / Paste state
  const [over, setOver] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [batchDept, setBatchDept] = useState('');

  // Manual Draft State
  const [manualDraft, setManualDraft] = useState<TrialParticipantRow>({
    fullName: '',
    email: '',
    department: allDepartments[0] || '',
    position: allPositions[0] || '',
  });
  const [manualError, setManualError] = useState<string | null>(null);

  const filledRows = rows.filter((r) => !isRowEmpty(r));
  const validCount = filledRows.filter((r) => rowError(r) === null).length;
  const invalidCount = filledRows.length - validCount;

  // Update specific row
  const updateRow = (index: number, patch: Partial<TrialParticipantRow>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  // Remove specific row
  const removeRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    onChange(updated.length > 0 ? updated : [{ ...EMPTY }]);
  };

  // Clear all filled rows
  const clearAll = () => {
    onChange([{ ...EMPTY }]);
    toast.info('Đã xóa toàn bộ danh sách nhân sự');
  };

  // Batch assign department for rows that are missing department
  const handleBatchAssignDept = () => {
    if (!batchDept) return;
    const updated = rows.map((r) => {
      if (isRowEmpty(r)) return r;
      if (!r.department.trim()) {
        return { ...r, department: batchDept };
      }
      return r;
    });
    onChange(updated);
    toast.success(`Đã áp dụng phòng ban "${batchDept}" cho các dòng còn trống`);
  };

  // Download template with current enterprise departments
  const handleDownloadTemplate = () => {
    const d1 = allDepartments[0] || 'Kinh doanh';
    const d2 = allDepartments[1] || 'Kỹ thuật';
    const p1 = allPositions[0] || 'Chuyên viên kinh doanh';
    const p2 = allPositions[1] || 'Kỹ sư phần mềm';
    const sample = [
      TEMPLATE_COLUMNS.join(','),
      `"Nguyễn Văn An","an.nguyen@congty.vn","${d1}","${p1}"`,
      `"Trần Thị Bình","binh.tran@congty.vn","${d2}","${p2}"`,
      `"Lê Hoàng Long","long.le@congty.vn","${d1}","${p1}"`,
    ];
    const blob = new Blob(['\uFEFF' + sample.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mau_nhan_vien_danh_gia_digitalent.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import file
  const importFile = async (file?: File | null) => {
    if (!file) return;
    setFileError(null);
    try {
      const imported = await readParticipantFile(file);
      if (imported.length === 0) {
        setFileError('File tải lên không có dữ liệu nhân viên nào.');
        return;
      }
      const existingFilled = rows.filter((r) => !isRowEmpty(r));
      const combined = [...existingFilled, ...imported].slice(0, limit);
      onChange(combined);
      toast.success(`Đã nhập thành công ${imported.length} nhân sự từ file!`);
      if (existingFilled.length + imported.length > limit) {
        setFileError(`Gói giới hạn tối đa ${limit} người tham gia. Hệ thống giữ ${limit} nhân viên đầu tiên.`);
      }
    } catch {
      setFileError('Không thể đọc file. Vui lòng sử dụng định dạng .xlsx hoặc .csv theo mẫu.');
    }
  };

  // Parse pasted clipboard text
  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    setFileError(null);
    try {
      const lines = pastedText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const cells = lines.map((line) => {
        if (line.includes('\t')) return line.split('\t').map((c) => c.trim());
        if (line.includes(';')) return line.split(';').map((c) => c.trim().replace(/^"|"$/g, ''));
        return line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      });

      const parsed = rowsFromCells(cells);
      if (parsed.length === 0) {
        setFileError('Không tìm thấy dòng dữ liệu nhân sự hợp lệ nào từ văn bản đã dán.');
        return;
      }

      const existingFilled = rows.filter((r) => !isRowEmpty(r));
      const combined = [...existingFilled, ...parsed].slice(0, limit);
      onChange(combined);
      setPastedText('');
      setIsPasting(false);
      toast.success(`Đã thêm thành công ${parsed.length} nhân sự từ dữ liệu dán!`);
    } catch {
      setFileError('Không thể phân tích dữ liệu dán. Hãy kiểm tra dấu phẩy hoặc tab giữa các cột.');
    }
  };

  // Handle manual submit
  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = manualDraft.fullName.trim();
    const email = manualDraft.email.trim().toLowerCase();
    const department = manualDraft.department.trim();
    const position = manualDraft.position.trim();

    if (!fullName) {
      setManualError('Vui lòng nhập họ và tên nhân viên.');
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setManualError('Địa chỉ email không đúng định dạng.');
      return;
    }
    if (filledRows.some((r) => r.email.trim().toLowerCase() === email)) {
      setManualError('Email này đã có trong danh sách tham gia.');
      return;
    }
    if (filledRows.length >= limit) {
      setManualError(`Đã đạt giới hạn tối đa ${limit} nhân viên tham gia đợt này.`);
      return;
    }

    setManualError(null);
    const newRow: TrialParticipantRow = { fullName, email, department, position };

    // If first row is empty, replace it; otherwise append
    const updated = isRowEmpty(rows[0] ?? EMPTY) && rows.length === 1
      ? [newRow]
      : [...filledRows, newRow];

    onChange(updated);
    toast.success(`Đã thêm "${fullName}" vào danh sách đánh giá!`);

    // Reset draft fields but keep department
    setManualDraft((curr) => ({
      ...curr,
      fullName: '',
      email: '',
      position: '',
    }));
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    void importFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Tabs & Capacity Pill ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('excel')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              tab === 'excel'
                ? 'bg-[#137b84] text-white shadow-sm shadow-[#137b84]/25'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="size-4" />
            Nhập hàng loạt từ Excel / CSV (Khuyên dùng)
          </button>
          <button
            type="button"
            onClick={() => setTab('manual')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              tab === 'manual'
                ? 'bg-[#137b84] text-white shadow-sm shadow-[#137b84]/25'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <UserPlus className="size-4" />
            Thêm từng nhân viên
          </button>
        </div>

        {/* Capacity Indicator Pill */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: filledRows.length >= limit ? '#fef2f2' : '#f0fdf4',
              color: filledRows.length >= limit ? '#dc2626' : '#166534',
              border: `1px solid ${filledRows.length >= limit ? '#fecaca' : '#bbf7d0'}`,
            }}
          >
            <span className="size-2 rounded-full bg-current animate-pulse" />
            Đã chọn {filledRows.length}/{limit} người
          </span>
        </div>
      </div>

      {/* ── TAB 1: EXCEL / CSV IMPORT ── */}
      {tab === 'excel' && (
        <div className="space-y-4">
          {/* Template Card with Sample Preview & Department Suggestions */}
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-teal-50/30 to-white p-4 space-y-3.5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <FileSpreadsheet className="size-4.5 text-emerald-700" />
                  Biểu mẫu Excel chuẩn hóa danh sách đánh giá đội ngũ
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-xl">
                  Tải về file mẫu hoặc xem cấu trúc 4 cột bên dưới: <strong>Họ tên, Email, Phòng ban, Vị trí</strong>. Hệ thống sẽ tự động ghép nhân viên vào phòng ban khi tải lên.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Download className="size-4" />
                Tải file mẫu Excel (.csv)
              </button>
            </div>

            {/* Template Sample Table */}
            <div className="rounded-xl border border-emerald-200/90 bg-white overflow-hidden text-xs shadow-2xs">
              <div className="bg-emerald-100/70 px-3.5 py-1.5 font-bold text-emerald-950 flex items-center justify-between border-b border-emerald-200/60">
                <span className="flex items-center gap-1.5">
                  <FileText className="size-3.5 text-emerald-700" />
                  Cấu trúc các cột mẫu trong file Excel
                </span>
                <span className="text-[11px] font-medium text-emerald-800">
                  {allDepartments.length} phòng ban khả dụng
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-emerald-100 bg-emerald-50/60 text-[11px] font-bold text-slate-800">
                      <th className="px-3.5 py-2 whitespace-nowrap">Họ và tên <span className="text-red-500 font-bold">*</span></th>
                      <th className="px-3.5 py-2 whitespace-nowrap">Email <span className="text-red-500 font-bold">*</span></th>
                      <th className="px-3.5 py-2 whitespace-nowrap">Phòng ban</th>
                      <th className="px-3.5 py-2 whitespace-nowrap">Vị trí công việc</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] text-slate-700 divide-y divide-emerald-50">
                    <tr className="bg-white">
                      <td className="px-3.5 py-2 font-medium text-slate-900">Nguyễn Văn An</td>
                      <td className="px-3.5 py-2 font-mono text-slate-600">an.nguyen@congty.vn</td>
                      <td className="px-3.5 py-2 font-semibold text-[#137b84]">{allDepartments[0] || 'Kinh doanh'}</td>
                      <td className="px-3.5 py-2 text-slate-600">{allPositions[0] || 'Chuyên viên kinh doanh'}</td>
                    </tr>
                    <tr className="bg-slate-50/40">
                      <td className="px-3.5 py-2 font-medium text-slate-900">Trần Thị Bình</td>
                      <td className="px-3.5 py-2 font-mono text-slate-600">binh.tran@congty.vn</td>
                      <td className="px-3.5 py-2 font-semibold text-[#137b84]">{allDepartments[1] || allDepartments[0] || 'Kỹ thuật'}</td>
                      <td className="px-3.5 py-2 text-slate-600">{allPositions[1] || allPositions[0] || 'Kỹ sư phần mềm'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {allDepartments.length > 0 && (
                <div className="bg-emerald-50/40 border-t border-emerald-100 px-3.5 py-2 flex flex-wrap items-center gap-1.5 text-[11px] text-emerald-900">
                  <span className="font-bold">Gợi ý tên phòng ban hiện có:</span>
                  {allDepartments.slice(0, 6).map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setBatchDept(dept)}
                      title={`Bấm để chọn "${dept}"`}
                      className="rounded-md bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-100 px-2 py-0.5 font-medium shadow-2xs transition-colors cursor-pointer"
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upload Dropzone or Paste Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Chọn tải file lên hoặc dán trực tiếp:</span>
              <button
                type="button"
                onClick={() => setIsPasting(!isPasting)}
                className="text-[#137b84] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <FileText className="size-3.5" />
                {isPasting ? 'Chuyển sang chọn file' : 'Dán dữ liệu trực tiếp từ Excel'}
              </button>
            </div>

            {!isPasting ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(true);
                }}
                onDragLeave={() => setOver(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center cursor-pointer transition-all ${
                  over
                    ? 'border-[#137b84] bg-[#137b84]/5'
                    : 'border-slate-300 bg-slate-50/70 hover:bg-[#137b84]/5 hover:border-[#137b84]'
                }`}
              >
                <div className="grid size-12 place-items-center rounded-full bg-[#137b84]/10 text-[#137b84] mb-3">
                  <Upload className="size-6" />
                </div>
                <span className="text-sm font-bold text-slate-800">
                  Bấm để chọn file Excel (.xlsx, .csv) hoặc kéo thả vào đây
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  Hỗ trợ file .xlsx, .csv chuẩn UTF-8 xuất từ Microsoft Excel hoặc Google Sheets
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.csv,.txt"
                  className="sr-only"
                  onChange={(e) => {
                    void importFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Dán các dòng sao chép từ Excel hoặc file CSV vào đây...&#10;Ví dụ:&#10;Nguyễn Văn An	an.nguyen@congty.vn	Kinh doanh	Chuyên viên"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#137b84] focus:ring-2 focus:ring-[#137b84]/20"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPastedText('');
                      setIsPasting(false);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleParsePastedText}
                    disabled={!pastedText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#137b84] hover:bg-[#0e5f66] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40 shadow-xs cursor-pointer"
                  >
                    Đọc danh sách nhân viên
                  </button>
                </div>
              </div>
            )}

            {fileError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>{fileError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: MANUAL ENTRY FORM ── */}
      {tab === 'manual' && (
        <form
          onSubmit={handleAddManual}
          className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
        >
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor={`${listId}-name`} className="text-xs font-semibold text-slate-700">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                id={`${listId}-name`}
                placeholder="VD: Nguyễn Văn An"
                value={manualDraft.fullName}
                onChange={(e) => setManualDraft((c) => ({ ...c, fullName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#137b84] focus:ring-2 focus:ring-[#137b84]/20"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={`${listId}-email`} className="text-xs font-semibold text-slate-700">
                Email nhân viên <span className="text-red-500">*</span>
              </label>
              <input
                id={`${listId}-email`}
                type="email"
                placeholder="an.nguyen@congty.vn"
                value={manualDraft.email}
                onChange={(e) => setManualDraft((c) => ({ ...c, email: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#137b84] focus:ring-2 focus:ring-[#137b84]/20"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={`${listId}-dept`} className="text-xs font-semibold text-slate-700">
                Phòng ban
              </label>
              <input
                id={`${listId}-dept`}
                list={`${listId}-d`}
                placeholder="VD: Kinh doanh, Kỹ thuật..."
                value={manualDraft.department}
                onChange={(e) => setManualDraft((c) => ({ ...c, department: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#137b84] focus:ring-2 focus:ring-[#137b84]/20"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={`${listId}-pos`} className="text-xs font-semibold text-slate-700">
                Vị trí công việc
              </label>
              <input
                id={`${listId}-pos`}
                list={`${listId}-p`}
                placeholder="VD: Chuyên viên kinh doanh, Trưởng nhóm..."
                value={manualDraft.position}
                onChange={(e) => setManualDraft((c) => ({ ...c, position: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#137b84] focus:ring-2 focus:ring-[#137b84]/20"
              />
            </div>
          </div>

          {manualError && (
            <p className="text-xs font-medium text-red-600 flex items-center gap-1.5">
              <AlertCircle className="size-3.5" />
              {manualError}
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#137b84] hover:bg-[#0e5f66] px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
            >
              <Plus className="size-4" />
              Thêm vào danh sách đánh giá
            </button>
          </div>
        </form>
      )}

      {/* ── LIVE ASSESSMENT PARTICIPANTS TABLE ── */}
      <div className="space-y-3">
        {/* Table Header with Stats and Batch Tools */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              Danh sách ({filledRows.length} người)
            </span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[11px] font-bold">
              {validCount} hợp lệ
            </span>
            {invalidCount > 0 && (
              <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[11px] font-bold">
                {invalidCount} cần bổ sung
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Batch assign department */}
            <div className="flex items-center gap-1.5">
              <select
                value={batchDept}
                onChange={(e) => setBatchDept(e.target.value)}
                className="tp-participant-select outline-none cursor-pointer"
              >
                <option value="">Gán PB cho dòng trống...</option>
                {allDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBatchAssignDept}
                disabled={!batchDept}
                className="rounded-lg bg-slate-200 hover:bg-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer h-[30px]"
              >
                Áp dụng
              </button>
            </div>

            {filledRows.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors cursor-pointer h-[30px]"
              >
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {/* Table of Rows */}
        <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 sticky top-0 z-10 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-8">#</th>
                <th className="py-2.5 px-3">Họ và tên <span className="text-red-500">*</span></th>
                <th className="py-2.5 px-3">Email <span className="text-red-500">*</span></th>
                <th className="py-2.5 px-3">Phòng ban</th>
                <th className="py-2.5 px-3">Vị trí công việc</th>
                <th className="py-2.5 px-3 text-center w-24">Trạng thái</th>
                <th className="py-2.5 px-3 text-center w-10">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, idx) => {
                const empty = isRowEmpty(row);
                const err = empty ? null : rowError(row);

                return (
                  <tr
                    key={idx}
                    className={
                      empty
                        ? 'bg-white opacity-70 hover:opacity-100'
                        : err
                          ? 'bg-amber-50/50 hover:bg-amber-50'
                          : 'bg-white hover:bg-slate-50/70'
                    }
                  >
                    <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-1.5 px-2.5">
                      <input
                        placeholder="Họ và tên..."
                        value={row.fullName}
                        onChange={(e) => updateRow(idx, { fullName: e.target.value })}
                        className="tp-participant-input font-medium"
                      />
                    </td>
                    <td className="py-1.5 px-2.5">
                      <input
                        type="email"
                        placeholder="email@congty.vn"
                        value={row.email}
                        onChange={(e) => updateRow(idx, { email: e.target.value })}
                        className="tp-participant-input font-mono"
                      />
                    </td>
                    <td className="py-1.5 px-2.5">
                      <input
                        list={`${listId}-d`}
                        placeholder="Phòng ban..."
                        value={row.department}
                        onChange={(e) => updateRow(idx, { department: e.target.value })}
                        className="tp-participant-input"
                      />
                    </td>
                    <td className="py-1.5 px-2.5">
                      <input
                        list={`${listId}-p`}
                        placeholder="Vị trí..."
                        value={row.position}
                        onChange={(e) => updateRow(idx, { position: e.target.value })}
                        className="tp-participant-input"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      {empty ? (
                        <span className="text-[10px] text-slate-400">Dòng trống</span>
                      ) : err ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {err}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                          <CheckCircle2 className="size-3" /> Hợp lệ
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        aria-label={`Xóa dòng ${idx + 1}`}
                        className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            disabled={rows.length >= limit}
            onClick={() => onChange([...rows, { ...EMPTY }])}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
          >
            <Plus className="size-3.5" /> Thêm dòng mới
          </button>

          <span className="text-xs text-slate-500">
            Tổng cộng: <strong>{filledRows.length}</strong> / tối đa {limit} người
          </span>
        </div>
      </div>

      {/* Datalists for autocomplete */}
      <datalist id={`${listId}-d`}>
        {allDepartments.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
      <datalist id={`${listId}-p`}>
        {allPositions.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </div>
  );
}

