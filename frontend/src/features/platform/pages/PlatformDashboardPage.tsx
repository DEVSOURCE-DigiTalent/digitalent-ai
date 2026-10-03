import { useNavigate } from 'react-router-dom';
import { Building2, CreditCard } from 'lucide-react';
import { PageHeader, ScoreCard, StatusBadge, DataTable } from '@/components/shared';
import { usePlatformDashboard } from '@/hooks/use-platform';
import type { PlatformOrganizationDto } from '@/services/platform.service';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function PlatformDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = usePlatformDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Bảng điều khiển nền tảng" subtitle="Đang tải dữ liệu tổng quan..." />
        <div className="p-8 text-center text-slate-500">Đang tải số liệu hệ thống…</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Bảng điều khiển nền tảng" subtitle="Lỗi kết nối dữ liệu" />
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">Không thể tải thông tin bảng điều khiển.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { metrics, recentOrganizations, subscriptionDistribution } = data;

  const columns = [
    {
      key: 'name',
      header: 'Tổ chức',
      cell: (row: PlatformOrganizationDto) => (
        <div>
          <button
            type="button"
            onClick={() => navigate(`/platform/organizations/${row.id}`)}
            className="font-medium text-primary-700 hover:underline text-left"
          >
            {row.name}
          </button>
          <p className="text-xs text-slate-400">{row.ownerEmail}</p>
        </div>
      ),
    },
    {
      key: 'industry',
      header: 'Ngành nghề',
      cell: (row: PlatformOrganizationDto) => (
        <span className="text-sm text-slate-700">{row.industry || '—'}</span>
      ),
    },
    {
      key: 'plan',
      header: 'Gói dịch vụ',
      cell: (row: PlatformOrganizationDto) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
          {row.planName}
        </span>
      ),
    },
    {
      key: 'seats',
      header: 'Số ghế',
      cell: (row: PlatformOrganizationDto) => (
        <span className="text-sm text-slate-700 font-medium">
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
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bảng điều khiển nền tảng"
        subtitle="Giám sát KPI toàn hệ thống DigiTalent AI: khách hàng doanh nghiệp, gói cước và nội dung chuẩn"
      />

      {/* Top metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard
          label="Doanh thu tháng (MRR)"
          value={formatCurrency(metrics.mrr)}
          subtitle={`ARR ước tính: ${formatCurrency(metrics.arr)}`}
          variant="success"
          onClick={() => navigate('/platform/subscriptions')}
        />
        <ScoreCard
          label="Tổ chức khách hàng"
          value={metrics.totalOrganizations}
          subtitle={`${metrics.activeOrganizations} hoạt động · ${metrics.suspendedOrganizations} tạm khóa`}
          variant="default"
          onClick={() => navigate('/platform/organizations')}
        />
        <ScoreCard
          label="Tổng người dùng"
          value={metrics.totalUsers}
          subtitle={`Gồm ${metrics.totalLearners} nhân viên doanh nghiệp`}
          variant="default"
          onClick={() => navigate('/platform/users')}
        />
        <ScoreCard
          label="Khóa học & Ngân hàng đề"
          value={`${metrics.standardCoursesCount} khóa`}
          subtitle={`${metrics.standardQuestionsCount} câu hỏi chuẩn TT02`}
          variant="default"
          onClick={() => navigate('/platform/curriculum')}
        />
      </div>

      {/* Operational Alerts if any */}
      {metrics.suspendedOrganizations > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-2 rounded-full bg-amber-500 animate-pulse" />
            <span>
              Hệ thống hiện có <strong>{metrics.suspendedOrganizations} tổ chức</strong> đang ở trạng thái tạm khóa hoặc cần xử lý hỗ trợ.
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/platform/organizations?status=SUSPENDED')}
            className="text-xs font-semibold text-amber-900 underline hover:text-amber-950"
          >
            Xem danh sách cần hỗ trợ →
          </button>
        </div>
      )}

      {/* Subscriptions distribution & Platform health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary-600" />
              <h2 className="text-base font-semibold text-slate-900">Phân bổ gói đăng ký</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/platform/subscriptions')}
              className="text-xs font-semibold text-primary-600 hover:text-primary-800"
            >
              Chi tiết →
            </button>
          </div>
          <div className="space-y-3">
            {subscriptionDistribution.map((item) => (
              <div key={item.planCode} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                <span className="text-slate-700 font-medium">{item.planName}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-800">
                  {item.count} khách hàng
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-primary-600" />
              <h2 className="text-base font-semibold text-slate-900">Tổ chức khách hàng gần đây</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/platform/organizations')}
              className="text-xs font-semibold text-primary-600 hover:text-primary-800"
            >
              Xem tất cả →
            </button>
          </div>
          <DataTable
            data={recentOrganizations}
            columns={columns}
            keyExtractor={(row) => row.id}
            emptyTitle="Chưa có tổ chức khách hàng nào."
          />
        </div>
      </div>
    </div>
  );
}
