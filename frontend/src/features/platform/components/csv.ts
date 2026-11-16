export type CsvCell = string | number | null | undefined;

/** Tối đa số dòng một lần xuất, bằng giới hạn pageSize của API. */
export const CSV_EXPORT_LIMIT = 100;

/**
 * Ô bắt đầu bằng = + - @ (hoặc tab, xuống dòng) bị Excel hiểu là công thức. Thêm dấu ' phía trước
 * để file xuất ra không chạy được công thức chèn từ dữ liệu người dùng (CSV injection).
 */
function escapeCell(value: CsvCell): string {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Tạo nội dung CSV (UTF-8 có BOM để Excel đọc đúng tiếng Việt). */
export function toCsv(header: readonly string[], rows: readonly CsvCell[][]): string {
  return '﻿' + [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
}

/** Tải file CSV trong trình duyệt. */
export function downloadCsv(fileName: string, header: readonly string[], rows: readonly CsvCell[][]): void {
  const blob = new Blob([toCsv(header, rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Tên file kèm ngày, ví dụ to-chuc-2026-11-16.csv */
export function csvFileName(prefix: string): string {
  return `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`;
}
