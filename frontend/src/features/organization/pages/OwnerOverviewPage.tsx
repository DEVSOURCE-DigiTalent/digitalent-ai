import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  FileCheck2, 
  GraduationCap, 
  ArrowRight, 
  ChevronRight,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { useOrganizationOverview } from '@/hooks/use-organization';
import { useCapabilityDashboard } from '@/hooks/use-analytics';
import { OwnerOverviewHero } from '../components/OwnerOverviewHero';
import { OwnerProcessTrack } from '../components/OwnerProcessTrack';
import { OwnerCapabilityArchitecture } from '../components/OwnerCapabilityArchitecture';
import { OwnerTrainingCycle } from '../components/OwnerTrainingCycle';

export function OwnerOverviewPage() {
  const { data: orgData, isLoading: orgLoading, isError: orgError } = useOrganizationOverview();
  const { data: capData, isLoading: capLoading } = useCapabilityDashboard();

  if (orgLoading || capLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Đang tải dữ liệu tổng quan doanh nghiệp...</p>
        </div>
      </div>
    );
  }

  if (orgError || !orgData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center max-w-md">
          <p className="text-sm font-semibold text-rose-700" role="alert">
            Không tải được thông tin tổng quan doanh nghiệp.
          </p>
          <p className="text-xs text-rose-500 mt-1">Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.</p>
        </div>
      </div>
    );
  }

  const deptItem = orgData.setup.find((s) => s.key === 'departments');
  const posItem = orgData.setup.find((s) => s.key === 'positions');
  const departmentCount = deptItem ? parseInt(deptItem.detail, 10) || 0 : 0;
  const positionCount = posItem ? parseInt(posItem.detail, 10) || 0 : 0;

  const seatsUsed = orgData.seats.used;
  const seatsLimit = orgData.seats.limit ?? 50;
  const seatsPercent = Math.min(100, Math.round((seatsUsed / seatsLimit) * 100));

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Top Bar Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            <span className="size-2 rounded-full bg-blue-600" />
            <span>Ban Giám Đốc · Tổng quan điều hành</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Hệ thống Quản trị Năng lực Số
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/enterprise/members"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <UserPlus className="size-3.5" />
            <span>Thêm nhân sự</span>
          </Link>
          <Link
            to="/enterprise/reports"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition-colors"
          >
            <span>Báo cáo chu kỳ</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Hero Executive Card ── */}
      <OwnerOverviewHero org={orgData} cap={capData} />

      {/* ── Bento KPI Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Seats Usage */}
        <div className="bento-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Tài khoản bản quyền</span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">{seatsUsed}</span>
                <span className="text-sm font-medium text-slate-400">/{seatsLimit}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="size-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Đã cấp phát</span>
              <span className="font-semibold text-slate-700">{seatsPercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full rounded-full bg-blue-600 transition-all duration-500" 
                style={{ width: `${seatsPercent}%` }} 
              />
            </div>
            <Link 
              to="/enterprise/members"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Quản lý thành viên</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Departments */}
        <div className="bento-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Phòng ban & Vị trí</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">{departmentCount}</span>
                <span className="text-xs font-medium text-slate-500">phòng ban</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 className="size-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Vị trí công việc:</span>
              <span className="font-semibold text-slate-800 tabular-nums">{positionCount} vị trí</span>
            </div>
            <Link 
              to="/enterprise/departments"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <span>Xem sơ đồ tổ chức</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Pending Reviews */}
        <div className="bento-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Minh chứng chờ duyệt</span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-2xl font-bold text-amber-600 tabular-nums">
                  {orgData.pendingReviews ?? 0}
                </span>
                <span className="text-xs font-medium text-slate-500">bài nộp</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <FileCheck2 className="size-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 mb-2">
              {(orgData.pendingReviews ?? 0) > 0 ? (
                <span className="text-amber-700 font-medium">Cần quản lý chuyên môn chấm điểm</span>
              ) : (
                <span className="text-emerald-600 font-medium">Tất cả bài tập đã được chấm</span>
              )}
            </div>
            <Link 
              to="/enterprise/tasks"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              <span>Xem bài tập chờ duyệt</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Running Batches */}
        <div className="bento-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Đợt đào tạo kích hoạt</span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-2xl font-bold text-indigo-600 tabular-nums">
                  {orgData.runningBatches ?? 0}
                </span>
                <span className="text-xs font-medium text-slate-500">chương trình</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <GraduationCap className="size-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Độ phủ trung bình:</span>
              <span className="font-semibold text-indigo-700 flex items-center gap-1">
                <TrendingUp className="size-3" />
                {capData?.kpis.averageCoverage ?? 0}%
              </span>
            </div>
            <Link 
              to="/enterprise/batches"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <span>Quản lý đợt đào tạo</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Process Track (Quy trình chuẩn hóa 6 bước) ── */}
      <div className="bento-card p-5">
        <OwnerProcessTrack org={orgData} cap={capData} />
      </div>

      {/* ── Two-column Detail Stack ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bento-card p-6">
          <OwnerCapabilityArchitecture
            orgName={orgData.name}
            departmentCount={departmentCount}
            positionCount={positionCount}
            averageCoverage={capData?.kpis.averageCoverage ?? 0}
          />
        </div>
        <div className="bento-card p-6">
          <OwnerTrainingCycle events={orgData.recentActivity} />
        </div>
      </div>
    </div>
  );
}
