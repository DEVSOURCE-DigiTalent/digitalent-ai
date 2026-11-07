import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Send,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useOrganizationOverview } from '@/hooks/use-organization';
import { useCapabilityDashboard } from '@/hooks/use-analytics';
import { OwnerTrialAssessmentWidget } from '../components/OwnerTrialAssessmentWidget';
import { OwnerCapabilityArchitecture } from '../components/OwnerCapabilityArchitecture';
import { OwnerTrainingCycle } from '../components/OwnerTrainingCycle';
import { OwnerQuickOperations } from '../components/OwnerQuickOperations';
import { SendAnnouncementModal } from '../components/SendAnnouncementModal';
import { PULSE_TOKENS } from '../owner-theme';
import { PageLoading } from '@/components/shared/LoadingState';

export function OwnerOverviewPage() {
  const [announcing, setAnnouncing] = useState(false);
  const { data: orgData, isLoading: orgLoading, isError: orgError } = useOrganizationOverview();
  const { data: capData, isLoading: capLoading } = useCapabilityDashboard();

  if (orgLoading || capLoading) {
    return <div className="po-owner -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><PageLoading label="Đang tải tổng quan" /></div>;
  }

  if (orgError || !orgData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center max-w-sm shadow-xs">
          <p className="text-xs font-bold text-red-700">
            Không thể tải thông tin tổng quan doanh nghiệp
          </p>
        </div>
      </div>
    );
  }

  const deptItem = orgData.setup.find((s) => s.key === 'departments');
  const posItem = orgData.setup.find((s) => s.key === 'positions');
  const departmentCount = deptItem ? parseInt(deptItem.detail) || 0 : 0;
  const positionCount = posItem ? parseInt(posItem.detail) || 0 : 0;
  const averageCoverage = capData?.kpis.averageCoverage ?? 0;

  return (
    <div
      className="po-owner -m-4 md:-m-6 min-h-screen text-[#17243f] relative overflow-hidden"
      style={{
        ...PULSE_TOKENS,
        background: `
          radial-gradient(circle 800px at 90% 5%, rgba(19, 123, 132, 0.08), transparent 60%),
          radial-gradient(circle 700px at 5% 35%, rgba(56, 189, 248, 0.07), transparent 60%),
          radial-gradient(circle 900px at 50% 90%, rgba(99, 102, 241, 0.05), transparent 65%),
          #f8fafc
        `,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ── Container Toàn Chiều Ngang: Tràn đều, không bị dồn cục ở giữa ── */}
      <div className="w-full px-5 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8 relative z-10 max-w-[1920px] mx-auto">
        {/* ── Page Header: Sáng, Tinh tế, Đẳng cấp ── */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-2xs mb-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-700">{orgData.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17243f]">
              Tổng quan doanh nghiệp
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setAnnouncing(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#137b84] to-[#0d9488] hover:from-[#0e5968] hover:to-[#0f766e] text-white px-4 py-2.5 text-xs font-bold transition-all shadow-[0_4px_14px_rgba(19,123,132,0.22)] hover:shadow-[0_6px_20px_rgba(19,123,132,0.32)] hover:-translate-y-0.5 cursor-pointer"
            >
              <Send className="size-3.5" />
              Gửi thông báo
            </button>
            <Link
              to="/enterprise/reports"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/90 hover:bg-white px-4 py-2.5 text-xs font-bold text-[#17243f] hover:text-[#137b84] transition-all shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
            >
              Báo cáo chu kỳ
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Content Stack: Tràn đều, Khớp đẹp với độ rộng màn hình ── */}
        <div className="flex flex-col gap-6">
          {/* 1. Hàng Thẻ Chỉ số Điều hành: Tràn đều 4 cột ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1: Nhân sự */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xs p-5 shadow-xs hover:shadow-[0_12px_28px_rgba(19,123,132,0.1)] hover:border-teal-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-teal-500/8 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold uppercase tracking-wider text-[11px] text-[#64748b]">
                  Nhân sự
                </span>
                <div className="size-9 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-100/70 text-[#137b84] flex items-center justify-center border border-teal-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                  <Users className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black tabular-nums text-[#17243f]">
                    {orgData.seats.used}
                  </span>
                  {orgData.seats.limit != null && (
                    <span className="text-xs font-semibold text-[#94a3b8]">
                      /{orgData.seats.limit} ghế
                    </span>
                  )}
                </div>
                {/* Mini Bars */}
                <div className="flex items-end gap-1.5 h-6">
                  {[40, 55, 70, 60, 85, 75, 100].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-1.5 rounded-xs transition-all duration-300 ${
                        i === 6
                          ? 'bg-gradient-to-t from-[#137b84] to-[#14b8a6]'
                          : 'bg-teal-100/70 group-hover:bg-teal-200/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* KPI 2: Cấu trúc */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xs p-5 shadow-xs hover:shadow-[0_12px_28px_rgba(2,132,199,0.1)] hover:border-sky-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-sky-500/8 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold uppercase tracking-wider text-[11px] text-[#64748b]">
                  Phòng ban & Vị trí
                </span>
                <div className="size-9 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100/70 text-[#0284c7] flex items-center justify-center border border-sky-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                  <Building2 className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black tabular-nums text-[#17243f]">
                    {departmentCount}
                  </span>
                  <span className="text-xs font-semibold text-[#64748b]">
                    PB · {positionCount} vị trí
                  </span>
                </div>
                {/* Mini Bars */}
                <div className="flex items-end gap-1.5 h-6">
                  {[30, 45, 60, 50, 70, 85, 90].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-1.5 rounded-xs transition-all duration-300 ${
                        i === 6
                          ? 'bg-gradient-to-t from-[#0284c7] to-[#38bdf8]'
                          : 'bg-sky-100/70 group-hover:bg-sky-200/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* KPI 3: Độ phủ Chuẩn */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xs p-5 shadow-xs hover:shadow-[0_12px_28px_rgba(99,102,241,0.1)] hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-indigo-500/8 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold uppercase tracking-wider text-[11px] text-[#64748b]">
                  Độ phủ Chuẩn Năng lực
                </span>
                <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-100/70 text-[#6366f1] flex items-center justify-center border border-indigo-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                  <TrendingUp className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl sm:text-4xl font-black tabular-nums text-[#17243f]">
                    {averageCoverage}
                  </span>
                  <span className="text-sm font-bold text-[#64748b]">%</span>
                </div>
                {/* Mini Bars */}
                <div className="flex items-end gap-1.5 h-6">
                  {[20, 30, 45, 40, 65, 60, 75].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-1.5 rounded-xs transition-all duration-300 ${
                        i === 6
                          ? 'bg-gradient-to-t from-[#6366f1] to-[#818cf8]'
                          : 'bg-indigo-100/70 group-hover:bg-indigo-200/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* KPI 4: Đào tạo */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xs p-5 shadow-xs hover:shadow-[0_12px_28px_rgba(217,119,6,0.1)] hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-amber-500/8 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold uppercase tracking-wider text-[11px] text-[#64748b]">
                  Đợt Đào tạo đang chạy
                </span>
                <div className="size-9 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100/70 text-[#d97706] flex items-center justify-center border border-amber-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                  <GraduationCap className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black tabular-nums text-[#17243f]">
                    {orgData.runningBatches ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-[#64748b]">
                    đợt
                  </span>
                </div>
                {/* Mini Bars */}
                <div className="flex items-end gap-1.5 h-6">
                  {[15, 25, 35, 50, 40, 60, 80].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-1.5 rounded-xs transition-all duration-300 ${
                        i === 6
                          ? 'bg-gradient-to-t from-[#d97706] to-[#f59e0b]'
                          : 'bg-amber-100/70 group-hover:bg-amber-200/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Biểu đồ Phân bố Năng lực 6 Lĩnh vực: Tràn rộng và thoáng ── */}
          <OwnerTrialAssessmentWidget />

          {/* 3. Phần Cuối: 3 Khối Tràn đều 3 Cột, Cân xứng hoàn hảo ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <OwnerCapabilityArchitecture
              orgName={orgData.name}
              departmentCount={departmentCount}
              positionCount={positionCount}
              averageCoverage={averageCoverage}
            />
            <OwnerQuickOperations />
            <OwnerTrainingCycle events={orgData.recentActivity} />
          </div>
        </div>
      </div>

      {announcing && (
        <SendAnnouncementModal
          open={announcing}
          onClose={() => setAnnouncing(false)}
        />
      )}
    </div>
  );
}
