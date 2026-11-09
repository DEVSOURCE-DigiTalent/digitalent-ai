import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import journeyArt from '@/assets/pulse/learning-journey-abstract.webp';
import type { OrganizationOverview } from '@/services/organization.service';
import type { DashboardDto } from '@/services/analytics.service';
import { useTrialProgram } from '@/hooks/use-trial-program';

interface OwnerOverviewHeroProps {
  org: OrganizationOverview;
  cap?: DashboardDto;
}

interface HeroAction {
  label: string;
  to: string;
  variant: 'outline' | 'filled';
}

function resolveActions(
  org: OrganizationOverview,
  cap?: DashboardDto,
  hasTrialParticipants?: boolean
): HeroAction[] {
  const hasAssessmentStarted =
    Boolean(hasTrialParticipants) ||
    org.members.active + org.members.pending > 1 ||
    (cap?.kpis.employees ?? 0) > 0;

  // Bước 1: Khởi đầu từ trang Đánh giá đội ngũ để khảo sát năng lực số ban đầu
  if (!hasAssessmentStarted) {
    return [
      { label: 'Đánh giá đội ngũ', to: '/enterprise/trial', variant: 'filled' },
      { label: 'Xem nội dung đánh giá', to: '/enterprise/trial', variant: 'outline' },
    ];
  }

  // Bước 2: Đã có nhân sự nhưng chưa có kết quả test / khoảng trống kỹ năng
  const hasSkillGapData =
    (cap?.kpis.employees ?? 0) > 0 &&
    ((cap?.domains ?? []).some((d) => d.averageCurrent > 0) || (cap?.kpis.employeesWithHigh ?? 0) > 0);

  if (!hasSkillGapData) {
    return [
      { label: 'Xem khoảng trống năng lực', to: '/enterprise/skill-gap', variant: 'filled' },
      { label: 'Theo dõi tiến độ đánh giá', to: '/enterprise/trial', variant: 'outline' },
    ];
  }

  // Bước 3: Đã thấy khoảng trống, tiếp theo là thiết lập phạm vi năng lực năng lực mục tiêu
  if (!org.setupCompleted) {
    return [
      { label: 'Thiết lập khung năng lực', to: '/enterprise/setup', variant: 'filled' },
      { label: 'Xem khoảng trống năng lực', to: '/enterprise/skill-gap', variant: 'outline' },
    ];
  }

  // Bước 4 & 5: Mua khóa học & theo dõi báo cáo chu kỳ
  return [
    { label: 'Xem khóa học', to: '/enterprise/courses', variant: 'filled' },
    { label: 'Xem báo cáo chu kỳ', to: '/enterprise/reports', variant: 'outline' },
  ];
}

export function OwnerOverviewHero({ org, cap }: OwnerOverviewHeroProps) {
  useUiLanguage();
  const { data: trialProgram } = useTrialProgram();
  const hasTrialParticipants = (trialProgram?.participants?.length ?? 0) > 0;
  const actions = resolveActions(org, cap, hasTrialParticipants);

  return (
    <section
      className="po-owner-hero relative overflow-hidden rounded-[25px] grid grid-cols-1 lg:grid-cols-[1.2fr_.75fr] lg:min-h-[320px]"
    >
      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] mb-5 " style={{ color: '#c1e8df' }}>{translateUi("NĂNG LỰC ĐỘI NGŨ")}</p>
        <h2
          className="font-semibold leading-[1.15] mb-4"
          style={{ fontSize: 'clamp(26px, 3.2vw, 42px)', letterSpacing: '-0.04em' }}
        >
          <span className="text-white block">{translateUi("Hiểu năng lực hiện tại.")}</span>
          <span className="text-white block">{translateUi("Xác định mục tiêu.")}</span>
          <span style={{ color: '#b8eadc' }} className="block">{translateUi("Đào tạo đúng nhu cầu.")}</span>
        </h2>
        <p className="text-sm leading-relaxed max-w-lg mb-6" style={{ color: '#d4e8e9' }}>{translateUi("Theo dõi mức đáp ứng theo vị trí và chọn khóa học cho những năng lực cần cải thiện.")}</p>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={
                action.variant === 'outline'
                  ? 'inline-flex items-center rounded-xl border border-[rgba(231,240,255,.65)] px-5 py-2.5 text-[13px] font-extrabold text-white transition-colors hover:bg-white/10'
                  : 'inline-flex items-center rounded-xl bg-[#fff] px-5 py-2.5 text-[13px] font-extrabold text-[#0e5968] shadow-[0_12px_24px_rgba(0,0,0,.12)] transition-transform hover:-translate-y-0.5'
              }
            >
              {translateUi(action.label)}
            </Link>
          ))}
        </div>
      </div>
      <div className="relative h-[200px] overflow-hidden lg:h-auto">
        <img
          src={journeyArt}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: '53% center' }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
