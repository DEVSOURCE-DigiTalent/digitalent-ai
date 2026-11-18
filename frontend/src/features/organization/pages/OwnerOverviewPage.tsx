import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Send,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useOrganizationOverview } from '@/hooks/use-organization';
import { useLearningNeeds } from '@/hooks/use-skill-gaps';
import { OwnerProgressTabs } from '../components/OwnerProgressTabs';
import { SendAnnouncementModal } from '../components/SendAnnouncementModal';
import { PULSE_TOKENS } from '../owner-theme';
import { PageLoading } from '@/components/shared/LoadingState';
import './owner-overview-motion.css';

export function OwnerOverviewPage() {
  useUiLanguage();
  const [announcing, setAnnouncing] = useState(false);
  const { data: orgData, isLoading: orgLoading, isError: orgError } = useOrganizationOverview();
  // Same query as OW-21, so the number here always matches the skill gap page.
  const needs = useLearningNeeds({ pageIndex: 1, pageSize: 1 });

  if (orgLoading) {
    return <div className="po-owner -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><PageLoading label={translateUi("Đang tải tổng quan")} /></div>;
  }

  if (orgError || !orgData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center max-w-sm shadow-xs">
          <p className="text-xs font-bold text-red-700">{translateUi("Không thể tải thông tin tổng quan doanh nghiệp")}</p>
        </div>
      </div>
    );
  }

  const deptItem = orgData.setup.find((s) => s.key === 'departments');
  const posItem = orgData.setup.find((s) => s.key === 'positions');
  const departmentCount = deptItem ? parseInt(deptItem.detail) || 0 : 0;
  const positionCount = posItem ? parseInt(posItem.detail) || 0 : 0;
  const people = orgData.members;
  const coverage = needs.data?.overview;
  const metrics = [
    {
      to: '/enterprise/members', label: 'Nhân sự', Icon: Users, tone: 'border-teal-200/70 bg-teal-50 text-[#137b84]',
      value: String(people.active + people.pending + people.inactive), unit: 'người', progress: null,
      note: [people.pending ? `${people.pending} chờ kích hoạt` : '', people.inactive ? `${people.inactive} đã khóa` : ''].filter(Boolean).join(' · ') || 'Đều đang hoạt động',
    },
    {
      to: '/enterprise/members', label: 'Phòng ban', Icon: Building2, tone: 'border-sky-200/70 bg-sky-50 text-[#0284c7]',
      value: String(departmentCount), unit: 'phòng ban', progress: null, note: `${positionCount} vị trí công việc`,
    },
    {
      // Share of staff already compared with their position standard; the rest still waits for the survey.
      to: '/enterprise/skill-gap', label: 'Đã có kết quả năng lực', Icon: TrendingUp, tone: 'border-indigo-200/70 bg-indigo-50 text-[#6366f1]',
      value: coverage ? `${coverage.assessedEmployees}/${coverage.employees}` : '—', unit: 'người',
      progress: coverage?.employees ? coverage.assessedEmployees / coverage.employees : null,
      note: !coverage ? 'Xem khoảng trống năng lực' : coverage.waitingEmployees ? `${coverage.waitingEmployees} người chờ khảo sát` : 'Cả đội đã có kết quả',
    },
  ];

  return (
    <div
      className="po-owner owner-overview -m-4 md:-m-6 min-h-screen text-[#17243f] relative overflow-hidden"
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
        <div className="owner-overview__header mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17243f]">{translateUi("Tổng quan")}</h1>
            <p className="mt-1 text-sm text-slate-600">{orgData.name}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setAnnouncing(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#137b84] to-[#0d9488] hover:from-[#0e5968] hover:to-[#0f766e] text-white px-4 py-2.5 text-xs font-bold transition-all shadow-[0_4px_14px_rgba(19,123,132,0.22)] hover:shadow-[0_6px_20px_rgba(19,123,132,0.32)] hover:-translate-y-0.5 cursor-pointer"
            >
              <Send className="size-3.5" />{translateUi("Gửi thông báo")}</button>
            <Link
              to="/enterprise/reports"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/90 hover:bg-white px-4 py-2.5 text-xs font-bold text-[#17243f] hover:text-[#137b84] transition-all shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
            >{translateUi("Báo cáo chu kỳ")}<ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Content Stack: Tràn đều, Khớp đẹp với độ rộng màn hình ── */}
        <div className="flex flex-col gap-6">
          {/* 1. Ba chỉ số chính: mỗi ô là một lối tắt tới trang chi tiết của nó. */}
          <div className="owner-overview__metrics grid grid-cols-1 sm:grid-cols-3 gap-5">
            {metrics.map(({ to, label, Icon, value, unit, note, progress, tone }) => (
              <Link
                key={label}
                to={to}
                className="group rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_12px_28px_rgba(19,123,132,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-slate-600">{translateUi(label)}</span>
                  <span className={`grid size-9 place-items-center rounded-xl border ${tone}`}><Icon className="size-4" aria-hidden="true" /></span>
                </div>
                <p className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black tabular-nums text-[#17243f]">{value}</span>
                  {unit && <span className="text-sm font-semibold text-slate-600">{translateUi(unit)}</span>}
                </p>
                {progress != null && (
                  <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                    <span className="block h-full rounded-full bg-[#137b84]" style={{ width: `${Math.round(progress * 100)}%` }} />
                  </span>
                )}
                <p className="mt-2 flex items-center justify-between gap-2 text-[13px] text-slate-600">
                  <span>{translateUi(note)}</span>
                  <ArrowRight className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#137b84] motion-reduce:transition-none" aria-hidden="true" />
                </p>
              </Link>
            ))}
          </div>

          <OwnerProgressTabs />
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
