import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Send } from 'lucide-react';
import { useOrganizationOverview } from '@/hooks/use-organization';
import { useCapabilityDashboard } from '@/hooks/use-analytics';
import { OwnerOverviewHero } from '../components/OwnerOverviewHero';
import { OwnerTrialAssessmentWidget } from '../components/OwnerTrialAssessmentWidget';
import { OwnerProcessTrack } from '../components/OwnerProcessTrack';
import { OwnerCapabilityArchitecture } from '../components/OwnerCapabilityArchitecture';
import { OwnerTrainingCycle } from '../components/OwnerTrainingCycle';
import { SendAnnouncementModal } from '../components/SendAnnouncementModal';
import { PULSE_TOKENS } from '../owner-theme';

const KPI_ACCENTS = ['#137b84', '#e8a17f', '#67b6ad', '#a48ce3'];
const KPI_VALUE_COLORS = ['var(--po-accent-strong)', '#c96f5a', '#218e86', '#826bc5'];

export function OwnerOverviewPage() {
  const [announcing, setAnnouncing] = useState(false);
  const { data: orgData, isLoading: orgLoading, isError: orgError } = useOrganizationOverview();
  const { data: capData, isLoading: capLoading } = useCapabilityDashboard();

  if (orgLoading || capLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm" style={{ color: 'var(--po-muted)' }}>Đang tải tổng quan...</p>
      </div>
    );
  }

  if (orgError || !orgData) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-red-600" role="alert">
          Không tải được thông tin tổng quan.
        </p>
      </div>
    );
  }

  const deptItem = orgData.setup.find((s) => s.key === 'departments');
  const posItem = orgData.setup.find((s) => s.key === 'positions');
  const departmentCount = deptItem ? parseInt(deptItem.detail) || 0 : 0;
  const positionCount = posItem ? parseInt(posItem.detail) || 0 : 0;

  const kpis = [
    {
      label: 'Tài khoản đang dùng',
      value: orgData.seats.used,
      suffix: orgData.seats.limit != null ? `/${orgData.seats.limit}` : '',
      sublabel: 'Toàn bộ phòng ban',
    },
    {
      label: 'Phòng ban',
      value: departmentCount,
      suffix: '',
      sublabel: 'Với kiến trúc riêng',
    },
    {
      label: 'Minh chứng chờ duyệt',
      value: orgData.pendingReviews ?? 0,
      suffix: '',
      sublabel: 'Đánh giá cuối khóa học',
    },
    {
      label: 'Đợt đào tạo đang chạy',
      value: orgData.runningBatches ?? 0,
      suffix: '',
      sublabel: 'Theo dõi trong báo cáo',
    },
  ];

  return (
    <div
      className="po-owner -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background:
          'radial-gradient(ellipse 760px 380px at 94% 0, color-mix(in srgb, #137b84 10%, transparent), transparent 70%), var(--po-canvas)',
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
      }}
    >
      <div
        className="mx-auto max-w-[1440px]"
        style={{ padding: 'clamp(26px, 3.5vw, 50px) clamp(22px, 4vw, 62px) 90px' }}
      >
        {/* ── Page Header ── */}
        <div className="mb-[27px] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div>
            <span
              className="text-[11px] font-black uppercase tracking-[0.14em]"
              style={{ color: 'var(--po-muted)' }}
            >
              <span
                className="mr-[7px] inline-block size-1.5 rounded-full align-middle"
                style={{ background: 'var(--po-coral)' }}
              />
              Chủ doanh nghiệp
            </span>
            <h1
              className="mt-2 font-semibold leading-[1.05]"
              style={{
                color: 'var(--po-ink)',
                fontSize: 'clamp(34px, 4vw, 55px)',
                letterSpacing: '-0.055em',
              }}
            >
              Hiển thị năng lực tại {orgData.name}.
            </h1>
            <p
              className="mt-2 text-sm leading-relaxed max-w-xl"
              style={{ color: 'var(--po-muted)' }}
            >
              Mục tiêu, học tập và kết quả khóa học nằm trong một hành trình.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setAnnouncing(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#137b84] px-[17px] py-[11px] text-[13px] font-extrabold text-white transition-all hover:bg-[#0e5968] shadow-xs"
            >
              <Send className="size-4" />
              Gửi thông báo & Hạn chót
            </button>
            <Link
              to="/enterprise/reports"
              className="inline-flex items-center gap-2 rounded-xl border px-[17px] py-[11px] text-[13px] font-extrabold transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
            >
              Xem báo cáo chu kỳ
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* ── Content Stack ── */}
        <div className="flex flex-col gap-4">
          <OwnerOverviewHero org={orgData} cap={capData} />

          {/* Đợt Đánh giá Năng lực Đội ngũ & Bức tranh Năng lực */}
          <OwnerTrialAssessmentWidget />

          {/* KPI Grid */}
          <div className="po-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map((kpi, i) => (
              <div
                key={kpi.label}
                className="po-kpi po-lift"
                style={{ borderTopColor: KPI_ACCENTS[i] }}
              >
                <span className="text-[11px] block" style={{ color: 'var(--po-muted)' }}>
                  {kpi.label}
                </span>
                <strong
                  className="text-[34px] font-bold leading-none tracking-[-0.06em] tabular-nums block mt-2"
                  style={{ color: KPI_VALUE_COLORS[i] }}
                >
                  {kpi.value}
                  {kpi.suffix && (
                    <small className="text-base font-normal" style={{ color: 'var(--po-muted)' }}>
                      {kpi.suffix}
                    </small>
                  )}
                </strong>
                <small className="text-[11px] block mt-1" style={{ color: 'var(--po-muted)' }}>
                  {kpi.sublabel}
                </small>
              </div>
            ))}
          </div>

          <OwnerProcessTrack org={orgData} cap={capData} />

          {/* Two-column: Capability Architecture + Training Cycle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <OwnerCapabilityArchitecture
              orgName={orgData.name}
              departmentCount={departmentCount}
              positionCount={positionCount}
              averageCoverage={capData?.kpis.averageCoverage ?? 0}
            />
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
