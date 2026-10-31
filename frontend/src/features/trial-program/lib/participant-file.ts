import type { TrialParticipantRow } from '@/services/trial-program.service';

/** Cột của file mẫu (thứ tự dùng khi file không có dòng tiêu đề). */
export const TEMPLATE_COLUMNS = ['Họ tên', 'Email', 'Phòng ban', 'Vị trí'] as const;

const FIELD_OF: Record<string, keyof TrialParticipantRow> = {
  'ho ten': 'fullName',
  'ho va ten': 'fullName',
  ten: 'fullName',
  name: 'fullName',
  'full name': 'fullName',
  email: 'email',
  gmail: 'email',
  'e-mail': 'email',
  'phong ban': 'department',
  'bo phan': 'department',
  department: 'department',
  'vi tri': 'position',
  'chuc danh': 'position',
  'chuc vu': 'position',
  position: 'position',
};

const fold = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase();

/** Bảng ô (dòng × cột) → danh sách nhân viên; nhận dòng tiêu đề tiếng Việt / tiếng Anh, bỏ dòng trống. */
export function rowsFromCells(cells: unknown[][]): TrialParticipantRow[] {
  const rows = cells.filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''));
  if (rows.length === 0) return [];
  const header = rows[0]!.map((cell) => FIELD_OF[fold(cell)]);
  const hasHeader = header.filter(Boolean).length >= 2;
  const order: (keyof TrialParticipantRow | undefined)[] = hasHeader ? header : ['fullName', 'email', 'department', 'position'];
  return rows.slice(hasHeader ? 1 : 0).map((row) => {
    const item: TrialParticipantRow = { fullName: '', email: '', department: '', position: '' };
    order.forEach((field, index) => {
      if (field) item[field] = String(row[index] ?? '').trim();
    });
    return item;
  });
}

/** Tách CSV đơn giản (dấu phẩy hoặc chấm phẩy, có ngoặc kép). */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, '');
  const delimiter = (clean.split('\n')[0] ?? '').split(';').length > (clean.split('\n')[0] ?? '').split(',').length ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]!;
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && clean[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** Đọc file Excel (.xlsx) hoặc CSV / TXT thành danh sách nhân viên. */
export async function readParticipantFile(file: File): Promise<TrialParticipantRow[]> {
  if (/\.xlsx$/i.test(file.name)) {
    const { readSheet } = await import('read-excel-file/browser');
    return rowsFromCells((await readSheet(file)) as unknown[][]);
  }
  return rowsFromCells(parseCsv(await file.text()));
}

/** Tải file mẫu (CSV có BOM để Excel mở đúng tiếng Việt). */
export function downloadTemplate() {
  const sample = [TEMPLATE_COLUMNS.join(','), 'Nguyễn Văn An,an.nguyen@congty.vn,Kế toán,Kế toán viên', 'Trần Thị Bình,binh.tran@congty.vn,Kinh doanh,Nhân viên bán hàng'];
  const blob = new Blob(['﻿' + sample.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mau-nhan-vien-dung-thu.csv';
  link.click();
  URL.revokeObjectURL(url);
}
