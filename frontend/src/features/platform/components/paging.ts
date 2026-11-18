import { useMemo, useState } from 'react';

/** Rows per page offered by every admin table. */
export const PAGE_SIZE_OPTIONS = [10, 15, 20, 25] as const;
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Pages a list already in memory (tables whose API returns everything). When the list shrinks (a filter), the page
 * is clamped to the last one; changing the page size goes back to page 1.
 */
export function useClientPage<T>(items: readonly T[]) {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(pageIndex, totalPages);
  const pageItems = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize]);

  return {
    pageItems,
    pager: {
      pageIndex: page,
      totalPages,
      totalItems: items.length,
      onChange: setPageIndex,
      pageSize,
      onPageSizeChange: (size: number) => {
        setPageSize(size);
        setPageIndex(1);
      },
    },
  };
}
