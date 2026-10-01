/** Khớp DigiTalent.Api/Common/ApiResponse.cs */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: ApiError[];
}

export interface ApiError {
  field?: string;
  message: string;
}

/** Mirrors DigiTalent.Shared.Pagination.PagedList<T> (System.Text.Json camelCase) */
export interface PagedList<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/** Mirrors DigiTalent.Shared.Pagination.PaginationRequest (System.Text.Json camelCase) */
export interface PaginationRequest {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
/** Khớp Application/Common/Models/PagedList.cs */
export interface PagedList<T> {
  items: T[];
  pageIndex: number; // trang đầu tiên là 1
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Khớp Application/Common/Models/PaginationRequest.cs */
export interface PaginationRequest {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}
