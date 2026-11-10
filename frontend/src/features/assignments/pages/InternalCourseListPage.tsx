import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, BookOpen, AlertCircle, Eye, Edit3 } from 'lucide-react';
import { PageHeader, StatusBadge, DataTable, ScoreCard } from '@/components/shared';
import { useInternalCourses } from '@/hooks/use-learning';
import { apiErrorMessage, formatDate } from '@/lib/utils';
import type { InternalCourseDto } from '@/services/learning.service';
import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';

export function InternalCourseListPage() {
  useUiLanguage();
  const mock = import.meta.env.VITE_USE_MOCK === 'true';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data, isLoading, isError, error, refetch } = useInternalCourses({
    search: search || undefined,
    status: status || undefined,
    pageIndex,
    pageSize: 15,
  });

  const allItems = data?.items ?? [];

  // Filter category on client-side
  const filteredItems = useMemo(() => {
    if (!mock || !category) return allItems;
    return allItems.filter((c) => c.category === category);
  }, [allItems, category, mock]);

  // KPIs
  const totalCourses = data?.totalItems ?? allItems.length;
  const publishedCount = allItems.filter((c) => c.status === 'PUBLISHED').length;
  const draftCount = allItems.filter((c) => c.status === 'DRAFT').length;
  const totalDuration = allItems.reduce((acc, c) => acc + (c.durationMinutes || 0), 0);

  const columns = [
    {
      key: 'code',
      header: 'Mã khóa',
      cell: (row: InternalCourseDto) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
          {row.code}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Tên khóa học',
      cell: (row: InternalCourseDto) => (
        <div>
          <Link
            to={mock || row.code.startsWith('INT-') ? `/enterprise/internal-courses/${row.id}` : `/enterprise/courses/${row.id}`}
            className="font-semibold text-sm text-slate-900 hover:text-blue-600 transition"
          >
            {translateUi(row.title)}
          </Link>
          <p className="text-xs text-slate-500 line-clamp-1">{translateUi(row.description)}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Chuyên mục',
      cell: (row: InternalCourseDto) => (
        <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
          {row.category}
        </span>
      ),
    },
    {
      key: 'modules',
      header: 'Thời lượng',
      cell: (row: InternalCourseDto) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <BookOpen className="size-3.5 text-slate-400" />
          {row.modulesCount} học phần · {row.durationMinutes}{translateUi(" phút")}</span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Cập nhật',
      cell: (row: InternalCourseDto) => (
        <span className="text-xs text-slate-600 font-medium">
          {formatDate(row.updatedAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row: InternalCourseDto) => (
        <StatusBadge
          variant={row.status === 'PUBLISHED' ? 'success' : 'default'}
          label={translateUi(row.status === 'PUBLISHED' ? 'Đã xuất bản' : row.status === 'ARCHIVED' ? 'Đã lưu trữ' : translateUi('Bản nháp'))}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'text-right',
      cell: (row: InternalCourseDto) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={mock || row.code.startsWith('INT-') ? `/enterprise/internal-courses/${row.id}` : `/enterprise/courses/${row.id}`}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
            title={translateUi("Xem chi tiết")}
          >
            <Eye className="size-4" />
          </Link>
          {(mock || row.code.startsWith('INT-')) && <Link
            to={`/enterprise/internal-courses/${row.id}/edit`}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
            title={translateUi("Chỉnh sửa thông tin")}
          >
            <Edit3 className="size-4" />
          </Link>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={translateUi(mock ? 'Khóa học nội bộ' : 'Khóa học trong tổ chức')}
        />
        <Link
          to="/enterprise/internal-courses/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition shrink-0"
        >
          <Plus className="size-4" />
          <span>Tạo khóa học mới</span>
        </Link>
      </div>

      {!mock && <div role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Chỉ khóa học nội bộ có thể chỉnh sửa tại đây. Khóa học chuẩn được quản lý trong danh mục khóa học.
      </div>}

      {/* Thông báo nghiệp vụ Khung chuẩn năng lực số */}
      {mock && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          Khóa học nội bộ dành cho văn hóa, chính sách và quy trình của tổ chức. Kết quả học tập không thay thế việc xác nhận năng lực.
        </div>
      </div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard label={translateUi(mock ? 'Tổng khóa nội bộ' : 'Tổng khóa tổ chức')} value={totalCourses} subtitle="Chương trình đào tạo" />
        <ScoreCard label="Đã xuất bản" value={publishedCount} variant="success" subtitle={translateUi(mock ? 'Sẵn sàng đào tạo' : 'Trên trang này')} />
        <ScoreCard label={translateUi("Bản nháp")} value={draftCount} variant="default" subtitle={translateUi(mock ? 'Đang biên soạn' : 'Trên trang này')} />
        <ScoreCard label="Tổng thời lượng" value={`${totalDuration}p`} subtitle={translateUi(mock ? 'Học liệu tích lũy' : 'Trên trang này')} />
      </div>

      {/* Toolbar filters */}
      <div className="owner-filter-toolbar flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <label className="owner-filter-search w-full sm:w-80">
          <Search className="size-4" aria-hidden="true" />
          <input
            type="text"
            aria-label="Tìm khóa học nội bộ"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(1);
            }}
            placeholder="Tìm theo tên hoặc mã khóa…"
            className="w-full text-sm"
          />
        </label>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {mock && <OwnerFilterSelect
            label="Lọc theo chuyên mục"
            value={category}
            onChange={(value) => {
              setCategory(value);
              setPageIndex(1);
            }}
            options={[{ value: '', label: 'Tất cả chuyên mục' }, { value: 'Văn hóa & Hội nhập', label: 'Văn hóa & Hội nhập' }, { value: 'Chính sách & Tuân thủ', label: 'Chính sách & Tuân thủ' }, { value: 'Quy trình vận hành', label: 'Quy trình vận hành' }, { value: 'Kỹ năng chuyên môn', label: 'Kỹ năng chuyên môn' }]}
          />}

          <OwnerFilterSelect
            label={translateUi("Lọc theo trạng thái")}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPageIndex(1);
            }}
            options={[{ value: '', label: 'Tất cả trạng thái' }, { value: 'PUBLISHED', label: 'Đã xuất bản' }, { value: 'DRAFT', label: 'Bản nháp' }]}
          />
        </div>
      </div>

      {isError ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          Không tải được khóa học: {apiErrorMessage(error, 'Vui lòng thử lại.')}
          <button type="button" onClick={() => void refetch()} className="ml-3 font-semibold underline">{translateUi("Thử lại")}</button>
        </div>
      ) : isLoading ? (
        <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />
      ) : (
        <DataTable
          data={filteredItems}
          columns={columns}
          keyExtractor={(row) => row.id}
          emptyTitle="Chưa có khóa học nội bộ nào được tạo."
          emptyDescription="Hãy tạo khóa học nội bộ đầu tiên để đào tạo văn hóa và quy trình doanh nghiệp."
          pageInfo={{ page: pageIndex, pageSize: 15, total: data?.totalItems ?? 0, onPageChange: setPageIndex }}
        />
      )}
    </div>
  );
}

