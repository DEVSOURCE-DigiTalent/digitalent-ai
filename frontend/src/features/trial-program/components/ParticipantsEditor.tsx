import { downloadEmployeeTemplate } from '@/features/members/utils/employee-import-helper';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useId, useRef, useState, type DragEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import type { TrialParticipantRow } from '@/services/trial-program.service';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { standardPositionChoices } from '@/lib/standard-positions';
import { readParticipantFile, rowsFromCells } from '../lib/participant-file';
import { EMPTY_ROW as EMPTY, isRowEmpty, rowError } from '../lib/participant-rows';

const PAGE_SIZE = 10;

interface ParticipantsEditorProps {
  rows: TrialParticipantRow[];
  onChange: (rows: TrialParticipantRow[]) => void;
  departments: string[];
}

/**
 * Danh sách người làm bài khảo sát: gõ thẳng vào bảng (mỗi dòng một người, kiểm tra ngay),
 * hoặc mở "Nhập từ file Excel / CSV" để kéo thả file / dán từ Excel; gán phòng ban hàng loạt.
 */
export function ParticipantsEditor({
  rows,
  onChange,
  departments,
}: ParticipantsEditorProps) {
  useUiLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const pendingNewRow = useRef(false);
  const batchMenuRef = useRef<HTMLDivElement>(null);
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

  // Any department name; the position is one of the 5 standard ones, open in every department.
  const positionChoices = standardPositionChoices(posData?.items);

  const [importOpen, setImportOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const activePage = Math.min(page, pageCount);
  const start = (activePage - 1) * pageSize;

  // Excel / Paste state
  const [over, setOver] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [batchMenuOpen, setBatchMenuOpen] = useState(false);

  const filledRows = rows.filter((r) => !isRowEmpty(r));
  const validCount = filledRows.filter((r) => rowError(r) === null).length;
  const invalidCount = filledRows.length - validCount;
  const missingDepartmentCount = filledRows.filter((row) => !row.department.trim()).length;

  useEffect(() => {
    if (!pendingNewRow.current) return;
    pendingNewRow.current = false;
    const timer = window.setTimeout(() => {
      const container = tableScrollRef.current;
      if (!container) return;
      if (typeof container.scrollTo === 'function') container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      else container.scrollTop = container.scrollHeight;
      container.querySelector<HTMLInputElement>('tbody tr:last-child input')?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [rows.length, activePage]);

  useEffect(() => {
    if (!batchMenuOpen) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!batchMenuRef.current?.contains(event.target as Node)) setBatchMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setBatchMenuOpen(false); };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('pointerdown', closeOnOutside); document.removeEventListener('keydown', closeOnEscape); };
  }, [batchMenuOpen]);

  // Update specific row
  const updateRow = (index: number, patch: Partial<TrialParticipantRow>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  // Remove specific row
  const removeRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    setPage(Math.min(activePage, Math.max(1, Math.ceil(updated.length / pageSize))));
    onChange(updated.length > 0 ? updated : [{ ...EMPTY }]);
  };

  // Clear all filled rows
  const clearAll = () => {
    setPage(1);
    onChange([{ ...EMPTY }]);
    toast.info('Đã xóa toàn bộ danh sách nhân sự');
  };

  // Batch assign department for rows that are missing department
  const handleBatchAssignDept = (department: string) => {
    const updated = rows.map((r) => {
      if (isRowEmpty(r)) return r;
      if (!r.department.trim()) {
        return { ...r, department };
      }
      return r;
    });
    onChange(updated);
    setBatchMenuOpen(false);
    toast.success(`Đã gán ${department} cho ${missingDepartmentCount} nhân viên chưa có phòng ban`);
  };

  // Download template with current enterprise departments
  const handleDownloadTemplate = () => downloadEmployeeTemplate();

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
      const combined = [...existingFilled, ...imported];
      setPage(1);
      onChange(combined);
      setImportOpen(false);
      toast.success(`Đã nhập ${imported.length} người từ file`);
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
      const combined = [...existingFilled, ...parsed];
      setPage(1);
      onChange(combined);
      setPastedText('');
      setIsPasting(false);
      setImportOpen(false);
      toast.success(`Đã thêm ${parsed.length} người từ dữ liệu dán`);
    } catch {
      setFileError('Không thể phân tích dữ liệu dán. Hãy kiểm tra dấu phẩy hoặc tab giữa các cột.');
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    void importFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="trial-participants-editor space-y-4">
      {/* ── Nhập từ file: mở khi cần, mặc định gõ thẳng vào bảng ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setImportOpen((open) => !open)}
          aria-expanded={importOpen}
          className={`trial-tool-button${importOpen ? ' is-active' : ''}`}
        >
          <FileSpreadsheet className="size-4" aria-hidden="true" />{translateUi('Nhập từ file Excel / CSV')}</button>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="trial-tool-button"
          title={translateUi('File mẫu gồm: Họ tên, Email, Phòng ban, Vị trí, Vai trò')}
        >
          <Download className="size-4" aria-hidden="true" />{translateUi('Tải file mẫu')}</button>
      </div>

      {importOpen && (
        <div className="space-y-3">
          {!isPasting ? (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={onDrop}
              className={`trial-import-dropzone flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                over
                  ? 'border-[#137b84] bg-[#137b84]/5'
                  : 'border-slate-300 bg-slate-50/70 hover:bg-[#137b84]/5 hover:border-[#137b84]'
              }`}
            >
              <div className="grid size-12 place-items-center rounded-full bg-[#137b84]/10 text-[#137b84] mb-3">
                <Upload className="size-6" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold text-slate-800">{translateUi('Kéo thả hoặc chọn file')}</span>
              <span className="mt-1 text-[13px] text-slate-600">{translateUi('Excel (.xlsx) hoặc CSV, theo file mẫu')}</span>
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
                aria-label={translateUi('Dữ liệu dán từ Excel')}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Dán các dòng sao chép từ Excel hoặc file CSV vào đây...&#10;Ví dụ:&#10;Nguyễn Văn An	an.nguyen@congty.vn	Kinh doanh	Chuyên viên"
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#137b84] focus:ring-2 focus:ring-[#137b84]/20"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPastedText('');
                    setIsPasting(false);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-700 hover:bg-slate-100 cursor-pointer"
                >{translateUi('Hủy')}</button>
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  disabled={!pastedText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#137b84] hover:bg-[#0e5f66] px-4 py-1.5 text-[13px] font-bold text-white disabled:opacity-40 cursor-pointer"
                >
                  {translateUi('Đọc danh sách nhân viên')}
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsPasting(!isPasting)}
            className="inline-flex items-center gap-1 text-[13px] font-bold text-[#137b84] hover:underline cursor-pointer"
          >
            <FileText className="size-3.5" aria-hidden="true" />
            {isPasting ? translateUi('Chọn file thay vì dán') : translateUi('Dán dữ liệu trực tiếp từ Excel')}
          </button>

          {fileError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-800 flex items-center gap-2" role="alert">
              <AlertCircle className="size-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>{fileError}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Bảng danh sách: một bộ đếm duy nhất + công cụ hàng loạt ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-2 text-[13px]" aria-live="polite">
            <strong className="font-bold text-slate-900">{filledRows.length} {translateUi('người')}</strong>
            {filledRows.length > 0 && (
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold">
                {validCount}{translateUi(' hợp lệ')}</span>
            )}
            {invalidCount > 0 && (
              <span className="rounded-full bg-amber-100 text-amber-900 px-2.5 py-0.5 text-xs font-bold">
                {invalidCount}{translateUi(' cần bổ sung')}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {missingDepartmentCount > 0 && allDepartments.length > 0 && (
              <div className="tp-batch-dept" ref={batchMenuRef}>
                <button type="button" className="tp-batch-dept__trigger" aria-expanded={batchMenuOpen} onClick={() => setBatchMenuOpen((open) => !open)}>{translateUi('Gán phòng ban cho ')}{missingDepartmentCount}{translateUi(' người ')}<span aria-hidden="true">⌄</span>
                </button>
                {batchMenuOpen && <div className="tp-batch-dept__menu">
                  <span>{translateUi('Chọn phòng ban để gán')}</span>
                  {allDepartments.map((department) => <button key={department} type="button" onClick={() => handleBatchAssignDept(department)}>{department}</button>)}
                </div>}
              </div>
            )}

            {filledRows.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 px-2.5 py-1 text-[13px] font-medium text-slate-700 transition-colors cursor-pointer h-[30px]"
              >{translateUi('Xóa tất cả')}</button>
            )}
          </div>
        </div>

        <div ref={tableScrollRef} className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-8">#</th>
                <th className="py-2.5 px-3">{translateUi('Họ và tên')} <span className="text-red-600" aria-hidden="true">*</span></th>
                <th className="py-2.5 px-3">{translateUi('Email')} <span className="text-red-600" aria-hidden="true">*</span></th>
                <th className="py-2.5 px-3">{translateUi('Phòng ban')} <span className="text-red-600" aria-hidden="true">*</span></th>
                <th className="py-2.5 px-3">{translateUi('Vị trí công việc')} <span className="text-red-600" aria-hidden="true">*</span></th>
                <th className="py-2.5 px-3">{translateUi('Vai trò')}</th>
                <th className="py-2.5 px-3 text-center w-28">{translateUi('Kiểm tra')}</th>
                <th className="py-2.5 px-3 text-center w-10"><span className="sr-only">{translateUi('Xóa')}</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.slice(start, start + pageSize).map((row, index) => {
                const idx = start + index;
                const empty = isRowEmpty(row);
                const err = empty ? null : rowError(row);

                return (
                  <tr key={idx} className={empty ? 'bg-white' : err ? 'bg-amber-50/50' : 'bg-white hover:bg-slate-50/70'}>
                    <td className="py-2 px-3 text-slate-500 text-xs tabular-nums">{idx + 1}</td>
                    <td className="py-1.5 px-2.5">
                      <input
                        aria-label={translateUi(`Họ và tên dòng ${idx + 1}`)}
                        placeholder={translateUi('Họ và tên')}
                        value={row.fullName}
                        onChange={(e) => updateRow(idx, { fullName: e.target.value })}
                        className="tp-participant-input font-medium"
                      />
                    </td>
                    <td className="py-1.5 px-2.5">
                      <input
                        type="email"
                        aria-label={translateUi(`Email dòng ${idx + 1}`)}
                        placeholder="email@congty.vn"
                        value={row.email}
                        onChange={(e) => updateRow(idx, { email: e.target.value })}
                        className="tp-participant-input"
                      />
                    </td>
                    <td className="py-1.5 px-2.5">
                      <input
                        list={`${listId}-d`}
                        aria-label={translateUi(`Phòng ban dòng ${idx + 1}`)}
                        placeholder={translateUi('Phòng ban')}
                        value={row.department}
                        onChange={(e) => updateRow(idx, { department: e.target.value })}
                        className="tp-participant-input"
                      />
                    </td>
                    <td className="py-1.5 px-2.5">
                      <input
                        list={`${listId}-p`}
                        aria-label={translateUi(`Vị trí dòng ${idx + 1}`)}
                        placeholder={translateUi('Vị trí')}
                        value={row.position}
                        onChange={(e) => updateRow(idx, { position: e.target.value })}
                        className="tp-participant-input"
                      />
                    </td>
                    <td className="py-1.5 px-2.5">
                      <select aria-label={translateUi(`Vai trò dòng ${idx + 1}`)} value={row.role ?? 'EMPLOYEE'}
                        onChange={(event) => updateRow(idx, { role: event.target.value })}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-[13px]">
                        {rowError(row)?.startsWith('Vai trò') && <option value={row.role}>{row.role}</option>}
                        <option value="EMPLOYEE">{translateUi('Nhân viên')}</option>
                        <option value="MANAGER">{translateUi('Trưởng phòng')}</option>
                      </select>
                    </td>
                    <td className="py-2 px-3 text-center">
                      {empty ? null : err ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                          {translateUi(err)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />{translateUi('Hợp lệ')}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        aria-label={translateUi(`Xóa dòng ${idx + 1}`)}
                        className="rounded p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              pendingNewRow.current = true;
              setPage(Math.ceil((rows.length + 1) / pageSize));
              onChange([...rows, { ...EMPTY }]);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />{translateUi('Thêm dòng mới')}</button>

          {pageCount > 1 && <nav className="tp-participant-pagination" aria-label={translateUi('Phân trang danh sách nhân viên')}>
            <div>
              <button type="button" disabled={activePage === 1} onClick={() => setPage(activePage - 1)}>{translateUi('Trước')}</button>
              <strong>{activePage}/{pageCount}</strong>
              <button type="button" disabled={activePage === pageCount} onClick={() => setPage(activePage + 1)}>{translateUi('Sau')}</button>
            </div>
          </nav>}
        </div>
      </div>

      {/* Datalists for autocomplete */}
      <datalist id={`${listId}-d`}>
        {allDepartments.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
      <datalist id={`${listId}-p`}>
        {positionChoices.map((name) => <option key={name} value={name} />)}
      </datalist>
    </div>
  );
}
