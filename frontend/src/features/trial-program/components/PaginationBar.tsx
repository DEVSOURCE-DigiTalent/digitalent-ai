import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  page: number;
  pageSize: number;
  totalItems: number;
  unitLabel: string;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextSize: number) => void;
  pageSizeOptions?: number[];
  /** Show the "Hiển thị x đến y trong tổng z" text. */
  showSummary?: boolean;
}

function buildPageNumbers(current: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  if (start > 2) pages.push('ellipsis');
  for (let p = start; p <= end; p += 1) {
    pages.push(p);
  }
  if (end < totalPages - 1) pages.push('ellipsis');
  pages.push(totalPages);

  return pages;
}

export function PaginationBar({
  page,
  pageSize,
  totalItems,
  unitLabel,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  showSummary = true,
}: PaginationBarProps) {
  if (totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (safePage - 1) * pageSize + 1;
  const endIdx = Math.min(totalItems, safePage * pageSize);
  const pageTokens = buildPageNumbers(safePage, totalPages);

  return (
    <div className="mw-pagination-bar" role="navigation" aria-label="Phân trang danh sách">
      <div className="mw-pagination-summary">
        {showSummary && (
          <span>
            Hiển thị <strong>{startIdx}</strong> đến <strong>{endIdx}</strong> trong tổng{' '}
            <strong>{totalItems}</strong> {unitLabel}
          </span>
        )}

        <label className="mw-page-size-label">
          <span>Số dòng:</span>
          <select
            className="mw-page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Số dòng mỗi trang"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mw-pagination-controls">
        <button
          type="button"
          className="mw-page-btn"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="Trang trước"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          <span>Trước</span>
        </button>

        {pageTokens.map((token, idx) =>
          token === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="mw-page-ellipsis" aria-hidden="true">
              ...
            </span>
          ) : (
            <button
              key={token}
              type="button"
              className={`mw-page-num-btn${token === safePage ? ' active' : ''}`}
              aria-current={token === safePage ? 'page' : undefined}
              onClick={() => onPageChange(token)}
            >
              {token}
            </button>
          ),
        )}

        <button
          type="button"
          className="mw-page-btn"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="Trang sau"
        >
          <span>Sau</span>
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
