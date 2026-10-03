import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { PageHeader, StatusBadge, DataTable } from '@/components/shared';
import { usePlatformOrganizations } from '@/hooks/use-platform';
import { formatDate } from '@/lib/utils';
import type { PlatformOrganizationDto } from '@/services/platform.service';

export function PlatformOrganizationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [planCode, setPlanCode] = useState<string>('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data, isLoading, isError, refetch } = usePlatformOrganizations({
    search: search || undefined,
    status: status || undefined,
    planCode: planCode || undefined,
    pageIndex,
    pageSize: 15,
  });

  const columns = [
    {
      key: 'name',
      header: 'Tổ chức / Doanh nghiệp',
      cell: (row: PlatformOrganizationDto) => (
        <div>
          <button
            type="button"
            onClick={() => navigate(`/platform/organizations/${row.id}`)}
            className="font-medium text-primary-700 hover:underline text-left block"
          >
            {row.name}
          </button>
          <p className="text-xs text-slate-500">Chủ tài khoản: {row.ownerName} ({row.ownerEmail})</p>
        </div>
      ),
    },
    {
      key: 'industry',
      header: 'Ngành & Quy mô',
      cell: (row: PlatformOrganizationDto) => (
        <div>
          <p className="text-sm text-slate-800">{row.industry || 'Chưa cập nhật'}</p>
          <p className="text-xs text-slate-400">{row.size} nhân sự</p>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Gói dịch vụ',
      cell: (row: PlatformOrganizationDto) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-800 border border-primary-200">
          {row.planName}
        </span>
      ),
    },
    {
      key: 'seats',
      header: 'Số ghế sử dụng',
      cell: (row: PlatformOrganizationDto) => (
        <span className="text-sm font-semibold text-slate-700">
          {row.seatsUsed} / {row.seatLimit}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row: PlatformOrganizationDto) => (
        <StatusBadge
          label={row.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
          variant={row.status === 'ACTIVE' ? 'success' : 'danger'}
        />
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      cell: (row: PlatformOrganizationDto) => (
        <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      cell: (row: PlatformOrganizationDto) => (
        <button
          type="button"
          onClick={() => navigate(`/platform/organizations/${row.id}`)}
          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Eye className="size-3.5" />
          Chi tiết
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách tổ chức khách hàng"
        subtitle="Quản lý toàn bộ khách hàng doanh nghiệp B2B sử dụng nền tảng DigiTalent AI"
      />

      {/* Filter bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên tổ chức, email chủ doanh nghiệp..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPageIndex(1);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="SUSPENDED">Tạm khóa</option>
          </select>

          <select
            value={planCode}
            onChange={(e) => {
              setPlanCode(e.target.value);
              setPageIndex(1);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả các gói</option>
            <option value="ENT_STARTER">Starter</option>
            <option value="ENT_PRO">Pro</option>
            <option value="ENT_ENTERPRISE">Enterprise</option>
          </select>
        </div>
      </div>

      {isLoading && <div className="p-8 text-center text-slate-500">Đang tải danh sách tổ chức…</div>}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">Không thể tải danh sách tổ chức.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 text-sm font-semibold underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <DataTable
            data={data.items}
            columns={columns}
            keyExtractor={(row) => row.id}
            emptyTitle="Không tìm thấy tổ chức nào phù hợp điều kiện lọc."
          />

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Hiển thị trang {data.pageIndex} / {data.totalPages} (Tổng số {data.totalItems} tổ chức)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pageIndex <= 1}
                  onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 text-xs font-medium border border-slate-200 rounded bg-white disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={pageIndex >= data.totalPages}
                  onClick={() => setPageIndex((p) => p + 1)}
                  className="px-3 py-1 text-xs font-medium border border-slate-200 rounded bg-white disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
