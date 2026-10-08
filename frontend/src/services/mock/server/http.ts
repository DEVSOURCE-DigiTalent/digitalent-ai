import type { ApiResponse, PagedList } from '../../../types/api';

/** A business or access error the mock server answers with, in the shape the pages already read. */
export class HttpError extends Error {
  readonly status: number;
  readonly errors: { field?: string; message: string }[];

  constructor(status: number, message: string, errors: { field?: string; message: string }[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const notFound = (what = 'Không tìm thấy dữ liệu.') => new HttpError(404, what);
export const conflict = (message: string) => new HttpError(409, message);
export const badRequest = (message: string, code?: string, field?: string) =>
  new HttpError(400, message, code ? [{ field, message: code }] : []);
export const forbidden = (message = 'Bạn không có quyền thực hiện thao tác này.') => new HttpError(403, message);
/** The plan does not include the action: 403 with the machine code in `errors[0].message`, like `badRequest`. */
export const planForbidden = (message: string, code: string) => new HttpError(403, message, [{ message: code }]);

export function okBody<T>(data: T, message = 'OK'): ApiResponse<T> {
  return { success: true, message, data, errors: [] };
}

export function errorBody(error: HttpError): ApiResponse<null> {
  return { success: false, message: error.message, data: null, errors: error.errors };
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export interface PageRequest {
  pageIndex: number;
  pageSize: number;
}

export function pageRequest(query: Record<string, unknown>): PageRequest {
  const pageIndex = Math.max(1, Number(query.pageIndex) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.pageSize) || DEFAULT_PAGE_SIZE));
  return { pageIndex, pageSize };
}

export function paginate<T>(items: T[], { pageIndex, pageSize }: PageRequest): PagedList<T> {
  const totalItems = items.length;
  return {
    items: items.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
    pageIndex,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}

/** Case- and accent-insensitive "contains", so searching "ke toan" finds "Kế toán". */
export function matchesSearch(text: string | undefined, search: unknown): boolean {
  const needle = normalize(String(search ?? ''));
  return needle === '' || normalize(text ?? '').includes(needle);
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
