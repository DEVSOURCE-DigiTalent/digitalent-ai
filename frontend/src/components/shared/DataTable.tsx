import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EmptyState } from './EmptyState';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  toolbarActions?: ReactNode;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  pageInfo?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  onRowClick?: (row: T) => void;
  className?: string;
  /** When true, keeps horizontal scroll container even on large screens */
  forceScrollX?: boolean;
}

/**
 * Reusable DataTable with sticky header (sticks at var(--shell-top)), server-side pagination, search,
 * sorting, loading skeleton, and empty states. Styled with Enterprise tokens.
 */
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription,
  emptyAction,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm…',
  filters,
  toolbarActions,
  sortBy,
  sortDirection,
  onSort,
  pageInfo,
  onRowClick,
  className,
  forceScrollX = false,
}: DataTableProps<T>) {
  const visibleColumns = columns;
  const mobileClass = (col: Column<T>) => {
    if (col.className?.includes('hidden')) return '';
    return col.hideOnMobile ? 'hidden md:table-cell' : '';
  };

  const renderSortIcon = (key: string) => {
    if (sortBy !== key) return <ChevronsUpDown className="w-3.5 h-3.5 text-ent-fg-3" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-ent-accent" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-ent-accent" />
    );
  };

  return (
    <div className={cn('bg-ent-card rounded-lg border border-ent-line', className)}>
      {/* Toolbar */}
      {(onSearchChange || filters || toolbarActions) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-ent-line">
          {onSearchChange && (
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ent-fg-3" />
              <input
                type="text"
                aria-label={searchPlaceholder}
                value={searchValue ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm bg-ent-raised border border-ent-line rounded-md text-ent-fg placeholder:text-ent-fg-3 focus:outline-none focus:ring-2 focus:ring-ent-accent focus:border-ent-accent"
              />
            </div>
          )}
          {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
          {toolbarActions && <div className="flex items-center gap-2 ml-auto">{toolbarActions}</div>}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              {visibleColumns.map((col) => (
                <div key={col.key} className="h-5 bg-ent-raised rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      )}

      {/* Table with sticky headers */}
      {!isLoading && data.length > 0 && (
        <div className={cn('w-full', forceScrollX ? 'overflow-x-auto' : 'overflow-x-auto lg:overflow-x-visible')}>
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                {visibleColumns.map((col, idx) => (
                  <th
                    key={col.key}
                    className={cn(
                      'sticky top-[var(--shell-top)] z-10 bg-ent-raised border-b border-ent-line',
                      'px-3.5 py-2.5 text-left text-xs font-semibold text-ent-fg-2 uppercase tracking-wider whitespace-nowrap',
                      idx === 0 && 'sticky left-0 z-20',
                      col.sortable && 'cursor-pointer select-none hover:text-ent-fg',
                      mobileClass(col),
                      col.className,
                    )}
                    onClick={() => col.sortable && onSort?.(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && renderSortIcon(col.key)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ent-line">
              {data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    'hover:bg-ent-raised transition-colors group',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {visibleColumns.map((col, idx) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-3.5 py-2.5 text-ent-fg border-b border-ent-line',
                        idx === 0 && 'sticky left-0 bg-ent-card group-hover:bg-ent-raised z-1',
                        mobileClass(col),
                        col.className,
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pageInfo && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-ent-line">
          <span className="text-xs text-ent-fg-3 tabular-nums">
            {pageInfo.pageSize * (pageInfo.page - 1) + 1}–
            {Math.min(pageInfo.pageSize * pageInfo.page, pageInfo.total)} trên {pageInfo.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pageInfo.onPageChange(pageInfo.page - 1)}
              disabled={pageInfo.page <= 1}
              className="px-3 py-1 text-xs font-medium text-ent-fg-2 border border-ent-line rounded-md hover:bg-ent-raised disabled:opacity-40 transition-colors"
            >
              Trước
            </button>
            <span className="text-xs text-ent-fg-3">Trang {pageInfo.page}</span>
            <button
              onClick={() => pageInfo.onPageChange(pageInfo.page + 1)}
              disabled={pageInfo.page >= Math.ceil(pageInfo.total / pageInfo.pageSize)}
              className="px-3 py-1 text-xs font-medium text-ent-fg-2 border border-ent-line rounded-md hover:bg-ent-raised disabled:opacity-40 transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
