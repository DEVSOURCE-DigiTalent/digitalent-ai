import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Table, ChevronRight } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, getStatusVariant, type Column } from '@/components/shared';
import { useCompetencies, useCompetencyCategories } from '@/hooks/use-competencies';
import { INPUT_CLASS } from '@/features/onboarding/components/styles';
import type { CompetencyListItem } from '@/services/competency.service';

const TYPE_LABELS: Record<string, string> = {
  CORE_DIGITAL: 'Năng lực số cốt lõi',
  PROFESSIONAL: 'Chuyên môn',
  INTERNAL: 'Nội bộ',
  BEHAVIOURAL: 'Hành vi',
};

const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Đang dùng', DRAFT: 'Bản nháp', ARCHIVED: 'Đã lưu trữ' };

/**
 * OW-14: TT02 Framework Explorer (/enterprise/framework)
 * Khung năng lực số quốc gia (Thông tư 02/2025/TT-BGDĐT) gồm 6 miền năng lực, 24 năng lực cốt lõi.
 * Chế độ xem: Nhóm theo 6 miền năng lực hoặc bảng danh sách chi tiết.
 */
export function CompetencyFrameworkPage() {
  const [viewMode, setViewMode] = useState<'domains' | 'table'>('table');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [competencyType, setCompetencyType] = useState('');

  const { data: categories = [] } = useCompetencyCategories();

  // Load all for domain view if domain mode, otherwise paginated
  const { data, isLoading } = useCompetencies({
    pageIndex: viewMode === 'table' ? page : 1,
    pageSize: viewMode === 'table' ? pageSize : 100,
    search: search.trim() || undefined,
    categoryId: selectedCategory || undefined,
    competencyType: competencyType || undefined,
  });

  const columns: Column<CompetencyListItem>[] = [
    {
      key: 'frameworkCode',
      header: 'Mã TT 02/2025',
      cell: (row) =>
        row.frameworkCode ? (
          <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            {row.frameworkCode}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Chưa ánh xạ</span>
        ),
    },
    {
      key: 'name',
      header: 'Tên năng lực',
      cell: (row) => (
        <div>
          <Link to={`/enterprise/framework/${row.id}`} className="font-medium text-slate-900 hover:underline">
            {row.name}
          </Link>
          {row.description && <div className="line-clamp-1 text-xs text-slate-500">{row.description}</div>}
        </div>
      ),
    },
    {
      key: 'categoryName',
      header: 'Miền năng lực',
      cell: (row) => row.categoryName || <span className="text-slate-400">-</span>,
    },
    {
      key: 'competencyType',
      header: 'Loại',
      hideOnMobile: true,
      cell: (row) => <span className="text-xs text-slate-600">{TYPE_LABELS[row.competencyType] ?? row.competencyType}</span>,
    },
    {
      key: 'criteriaCount',
      header: 'Tiêu chí theo mức',
      hideOnMobile: true,
      cell: (row) => <span className="text-xs font-medium text-slate-600">{row.criteriaCount ?? 0} tiêu chí</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row) => <StatusBadge label={STATUS_LABELS[row.status] ?? row.status} variant={getStatusVariant(row.status)} />,
    },
  ];

  const items = data?.items || [];

  // Group competencies by domain category
  const domainGroups = categories.map((cat) => {
    const matched = items.filter((c) => c.categoryId === cat.id);
    return {
      category: cat,
      competencies: matched,
    };
  }).filter((group) => !selectedCategory || group.category.id === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Khung năng lực TT 02/2025"
          subtitle="Khung chuẩn năng lực số gồm 6 miền và 24 năng lực theo Thông tư 02/2025/TT-BGDĐT. Dùng chung cho toàn bộ tổ chức làm căn cứ thiết lập yêu cầu vị trí"
        />
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setViewMode('domains')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'domains'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="size-3.5" />
            6 Miền năng lực
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="size-3.5" />
            Dạng bảng
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex-1 min-w-[220px]">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên năng lực hoặc mã..."
            className={INPUT_CLASS}
          />
        </div>
        <div className="w-56">
          <select
            aria-label="Lọc theo miền năng lực"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className={INPUT_CLASS}
          >
            <option value="">Tất cả 6 miền năng lực</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-44">
          <select
            aria-label="Lọc theo loại năng lực"
            value={competencyType}
            onChange={(e) => {
              setCompetencyType(e.target.value);
              setPage(1);
            }}
            className={INPUT_CLASS}
          >
            <option value="">Mọi loại năng lực</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content presentation */}
      {viewMode === 'domains' ? (
        <div className="space-y-6">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">Đang tải danh mục khung năng lực...</div>
          ) : domainGroups.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Không có năng lực nào khớp với bộ lọc tìm kiếm.
            </div>
          ) : (
            domainGroups.map((group) => (
              <section
                key={group.category.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-800">
                      {group.category.sortOrder}
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        {group.category.name}
                      </h2>
                      <span className="text-xs font-mono text-slate-500">{group.category.code}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    {group.competencies.length} năng lực
                  </span>
                </div>

                <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
                  {group.competencies.map((comp) => (
                    <Link
                      key={comp.id}
                      to={`/enterprise/framework/${comp.id}`}
                      className="group flex flex-col justify-between p-4.5 transition-colors hover:bg-slate-50/80"
                    >
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-mono font-bold text-emerald-800">
                            {comp.frameworkCode || comp.code}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {comp.criteriaCount} mức tiêu chí
                          </span>
                        </div>
                        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-primary-700">
                          {comp.name}
                        </h3>
                        {comp.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{comp.description}</p>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs font-medium text-primary-700">
                        <span>Chi tiết năng lực</span>
                        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  ))}
                  {group.competencies.length === 0 && (
                    <div className="col-span-full p-4 text-center text-xs text-slate-400">
                      Không có năng lực nào thuộc miền này theo bộ lọc hiện tại.
                    </div>
                  )}
                </div>
              </section>
            ))
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          searchPlaceholder="Tìm theo tên hoặc mã năng lực"
          emptyTitle="Không tìm thấy năng lực nào"
          emptyDescription="Thử đổi từ khóa hoặc bộ lọc."
          pageInfo={{
            page,
            pageSize,
            total: data?.totalItems || 0,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
          }}
        />
      )}
    </div>
  );
}
