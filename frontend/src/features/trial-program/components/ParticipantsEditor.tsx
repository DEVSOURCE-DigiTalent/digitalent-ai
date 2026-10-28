import { useId, useRef, useState, type DragEvent } from 'react';
import { Download, FileSpreadsheet, Plus, X } from 'lucide-react';
import type { TrialParticipantRow } from '@/services/trial-program.service';
import { downloadTemplate, readParticipantFile } from '../lib/participant-file';
import { EMPTY_ROW as EMPTY, isRowEmpty, rowError } from '../lib/participant-rows';

/**
 * Danh sách nhân viên dùng thử: nhập tay từng dòng hoặc từ file Excel / CSV (Họ tên, Email, Phòng ban, Vị trí).
 * Phòng ban và vị trí gõ tự do — chưa có thì hệ thống tạo khi mời.
 */
export function ParticipantsEditor({
  rows,
  onChange,
  departments,
  positions,
  limit,
}: {
  rows: TrialParticipantRow[];
  onChange: (rows: TrialParticipantRow[]) => void;
  departments: string[];
  positions: string[];
  limit: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [over, setOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const filled = rows.filter((r) => !isRowEmpty(r));
  const allDepartments = [...new Set([...departments, ...rows.map((r) => r.department.trim()).filter(Boolean)])];
  const allPositions = [...new Set([...positions, ...rows.map((r) => r.position.trim()).filter(Boolean)])];

  const update = (index: number, patch: Partial<TrialParticipantRow>) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const importFile = async (file?: File | null) => {
    if (!file) return;
    setFileError(null);
    try {
      const imported = await readParticipantFile(file);
      if (imported.length === 0) {
        setFileError('File không có dòng nào.');
        return;
      }
      onChange([...rows.filter((r) => !isRowEmpty(r)), ...imported].slice(0, limit));
      if (filled.length + imported.length > limit) setFileError(`Chỉ giữ ${limit} người đầu tiên.`);
    } catch {
      setFileError('Không đọc được file. Dùng .xlsx hoặc .csv theo mẫu.');
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    void importFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="tp" style={{ gap: 10 }}>
      <div
        className="tp-drop"
        data-over={over}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <span className="tp-row"><FileSpreadsheet size={16} aria-hidden /> Kéo file Excel vào đây hoặc</span>
        <span className="tp-row">
          <button type="button" className="tp-btn small" onClick={() => fileRef.current?.click()}>Chọn file</button>
          <button type="button" className="tp-btn ghost small" onClick={downloadTemplate}><Download size={14} aria-hidden /> File mẫu</button>
        </span>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.csv,.txt"
          hidden
          onChange={(e) => {
            void importFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {fileError && <p className="tp-notice bad" role="alert">{fileError}</p>}

      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Phòng ban</th>
              <th>Vị trí</th>
              <th style={{ width: 40 }} aria-label="Xóa" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const error = isRowEmpty(row) ? null : rowError(row);
              return (
                <tr key={index}>
                  <td className="tp-muted">{index + 1}</td>
                  <td><input aria-label={`Họ tên dòng ${index + 1}`} value={row.fullName} maxLength={200} onChange={(e) => update(index, { fullName: e.target.value })} /></td>
                  <td>
                    <input aria-label={`Email dòng ${index + 1}`} type="email" value={row.email} maxLength={255} onChange={(e) => update(index, { email: e.target.value })} />
                    {error && <small style={{ color: 'var(--tp-bad)' }}>{error}</small>}
                  </td>
                  <td><input aria-label={`Phòng ban dòng ${index + 1}`} list={`${listId}-d`} value={row.department} maxLength={150} onChange={(e) => update(index, { department: e.target.value })} /></td>
                  <td><input aria-label={`Vị trí dòng ${index + 1}`} list={`${listId}-p`} value={row.position} maxLength={150} onChange={(e) => update(index, { position: e.target.value })} /></td>
                  <td>
                    <button type="button" className="tp-btn danger small" aria-label={`Xóa dòng ${index + 1}`} onClick={() => onChange(rows.length > 1 ? rows.filter((_, i) => i !== index) : [EMPTY])}>
                      <X size={14} aria-hidden />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <datalist id={`${listId}-d`}>{allDepartments.map((d) => <option key={d} value={d} />)}</datalist>
      <datalist id={`${listId}-p`}>{allPositions.map((p) => <option key={p} value={p} />)}</datalist>
      <div className="tp-row" style={{ justifyContent: 'space-between' }}>
        <button type="button" className="tp-btn ghost small" disabled={rows.length >= limit} onClick={() => onChange([...rows, { ...EMPTY }])}>
          <Plus size={14} aria-hidden /> Thêm dòng
        </button>
        <span className="tp-muted">{filled.length}/{limit} người</span>
      </div>
    </div>
  );
}
