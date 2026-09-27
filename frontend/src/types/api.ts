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
