import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { PageHeader, StatusBadge, DataTable } from '@/components/shared';
import { usePlatformSubscriptions } from '@/hooks/use-platform';
import { formatDate } from '@/lib/utils';
import type { PlatformSubscriptionDto } from '@/services/platform.service';

function formatCurrency(amount: number): string {
  if (amount === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function PlatformSubscriptionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [audience, setAudience] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data, isLoading, isError, refetch } = usePlatformSubscriptions({
    search: search || undefined,
    audience: audience || undefined,
    status: status || undefined,
    pageIndex,
    pageSize: 15,
  });

  const columns = [
    {
      key: 'customer',
      header: 'Khách hàng',
      cell: (row: PlatformSubscriptionDto) => (
        <div>
          <button
            type="button"
            onClick={() => navigate(`/platform/subscriptions/${row.id}`)}
            className="font-medium text-slate-900 hover:text-primary-600 text-left"
          >
            {row.customerName}
          </button>
          <p className="text-xs text-slate-500">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'audience',
      header: 'Loại khách hàng',
      cell: (row: PlatformSubscriptionDto) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          row.audience === 'enterprise' ? 'bg-primary-50 text-primary-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {row.audience === 'enterprise' ? 'Doanh nghiệp' : 'Cá nhân'}
        </span>
      ),
    },
    {
      key: 'plan',
      header: 'Gói dịch vụ',
      cell: (row: PlatformSubscriptionDto) => (
        <span className="text-sm font-semibold text-slate-800">{row.planName}</span>
      ),
    },
    {
      key: 'cycle',
      header: 'Chu kỳ',
      cell: (row: PlatformSubscriptionDto) => (
        <span className="text-xs text-slate-600">
          {row.cycle === 'year' ? 'Hàng năm' : 'Hàng tháng'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Giá trị thanh toán',
      cell: (row: PlatformSubscriptionDto) => (
        <span className="text-sm font-medium text-slate-900">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: 'renewsAt',
      header: 'Ngày gia hạn',
      cell: (row: PlatformSubscriptionDto) => (
        <span className="text-xs text-slate-600">
          {row.renewsAt === '—' ? '—' : formatDate(row.renewsAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row: PlatformSubscriptionDto) => {
        const variant = row.status === 'active' ? 'success' : row.status === 'cancelled' ? 'danger' : 'warning';
        const label = row.status === 'active' ? 'Đang hiệu lực' : row.status === 'cancelled' ? 'Đã hủy' : 'Hết hạn';
        return <StatusBadge label={label} variant={variant} />;
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      cell: (row: PlatformSubscriptionDto) => (
        <button
          type="button"
          onClick={() => navigate(`/platform/subscriptions/${row.id}`)}
          className="inline-flex items-center gap-1 rounded border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
        >
          <Eye className="size-3" />
          Chi tiết
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Giám sát gói đăng ký & thanh toán"
        subtitle="Theo dõi toàn bộ các hợp đồng đăng ký dịch vụ của khách hàng B2B và người dùng B2C"
      />

      {/* Filter bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên khách hàng, email..."
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
            value={audience}
            onChange={(e) => {
              setAudience(e.target.value);
              setPageIndex(1);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả khách hàng</option>
            <option value="enterprise">Doanh nghiệp (B2B)</option>
            <option value="individual">Cá nhân (B2C)</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPageIndex(1);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hiệu lực</option>
            <option value="cancelled">Đã hủy / Khóa</option>
          </select>
        </div>
      </div>

      {isLoading && <div className="p-8 text-center text-slate-500">Đang tải danh sách đăng ký…</div>}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">Không thể tải danh sách đăng ký.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
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
            emptyTitle="Không có gói đăng ký nào phù hợp."
          />

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Hiển thị trang {data.pageIndex} / {data.totalPages} (Tổng số {data.totalItems} đăng ký)
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
