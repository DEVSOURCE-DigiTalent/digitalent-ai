import { useState } from 'react';
import { Lock, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { InviteRow } from '@/types/commerce';
import { parseInviteCsv, type CsvIssue } from '../csv';
import { INPUT_CLASS, SECONDARY_BUTTON } from './styles';

interface CsvImportProps {
  /** Plan feature `bulk_import`. Without it the panel explains what is missing instead of hiding. */
  enabled: boolean;
  known: { departments: string[]; positions: string[] };
  onRows: (rows: InviteRow[]) => void;
}

const TEMPLATE = 'email,họ tên,phòng ban,vị trí,vai trò\nan.nguyen@congty.vn,Nguyễn An,Kinh doanh,Kinh doanh (CRM),Học viên';

/** ENT-ONB-08, import path: paste or upload a CSV and add its rows to the list of invitations. */
export function CsvImport({ enabled, known, onRows }: CsvImportProps) {
  const [text, setText] = useState('');
  const [issues, setIssues] = useState<CsvIssue[]>([]);
  const [added, setAdded] = useState<number>();

  if (!enabled) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Nhập hàng loạt từ file có trong gói Pro. Bạn vẫn có thể thêm từng người ở trên, hoặc{' '}
          <Link to="/enterprise/billing" className="font-medium text-primary-700 underline underline-offset-4">
            nâng cấp gói
          </Link>{' '}
          sau khi thiết lập xong.
        </p>
      </div>
    );
  }

  const read = () => {
    const result = parseInviteCsv(text, known);
    setIssues(result.issues);
    setAdded(result.rows.length);
    if (result.rows.length > 0) {
      onRows(result.rows);
      if (result.issues.length === 0) setText('');
    }
  };

  const loadFile = async (file: File | undefined) => {
    if (file) setText(await file.text());
  };

  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <label htmlFor="csv-text" className="text-sm font-medium text-slate-700">
          Dán danh sách hoặc tải file CSV
        </label>
        <textarea
          id="csv-text"
          rows={5}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={TEMPLATE}
          className={`${INPUT_CLASS} font-mono text-xs`}
        />
        <p className="text-xs text-slate-500">
          Cột: email, họ tên, phòng ban, vị trí, vai trò (ba cột cuối có thể bỏ trống; mặc định là Học viên).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className={`${SECONDARY_BUTTON} cursor-pointer`}>
          <Upload className="size-4" aria-hidden="true" />
          Chọn file CSV
          <input type="file" accept=".csv,text/csv,text/plain" className="sr-only" onChange={(event) => loadFile(event.target.files?.[0])} />
        </label>
        <button type="button" onClick={read} disabled={!text.trim()} className={SECONDARY_BUTTON}>
          Đọc danh sách
        </button>
        {added !== undefined && (
          <span role="status" className="text-sm text-slate-600">
            Đã thêm {added} người vào danh sách chờ gửi.
          </span>
        )}
      </div>

      {issues.length > 0 && (
        <ul role="alert" className="grid gap-1 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {issues.map((issue) => (
            <li key={`${issue.line}-${issue.message}`}>
              Dòng {issue.line}: {issue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
