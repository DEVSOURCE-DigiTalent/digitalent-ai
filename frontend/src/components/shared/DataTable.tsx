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
}

/**
 * Reusable DataTable with server-side pagination, search, sorting,
 * loading skeleton, and empty states. Maps to UI/UX spec section 10.
 */
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyTitle = 'No data found',
  emptyDescription,
  emptyAction,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  toolbarActions,
  sortBy,
  sortDirection,
  onSort,
  pageInfo,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const visibleColumns = columns.filter((c) => !c.hideOnMobile);

  const renderSortIcon = (key: string) => {
    if (sortBy !== key) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-primary-600" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-primary-600" />
    );
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-slate-200', className)}>
      {/* Toolbar */}
      {(onSearchChange || filters || toolbarActions) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-200">
          {onSearchChange && (
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchValue ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}
          {filters && <div className="flex items-center gap-2">{filters}</div>}
          {toolbarActions && <div className="flex items-center gap-2 ml-auto">{toolbarActions}</div>}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              {visibleColumns.map((col) => (
                <div key={col.key} className="h-5 bg-slate-200 rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      )}

      {/* Table */}
      {!isLoading && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider',
                      col.sortable && 'cursor-pointer select-none hover:text-slate-800',
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
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    'hover:bg-slate-50 transition-colors',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {visibleColumns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 text-slate-700', col.className)}>
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            {pageInfo.pageSize * (pageInfo.page - 1) + 1}–
            {Math.min(pageInfo.pageSize * pageInfo.page, pageInfo.total)} of {pageInfo.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pageInfo.onPageChange(pageInfo.page - 1)}
              disabled={pageInfo.page <= 1}
              className="px-3 py-1 text-xs font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">Page {pageInfo.page}</span>
            <button
              onClick={() => pageInfo.onPageChange(pageInfo.page + 1)}
              disabled={pageInfo.page >= Math.ceil(pageInfo.total / pageInfo.pageSize)}
              className="px-3 py-1 text-xs font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
