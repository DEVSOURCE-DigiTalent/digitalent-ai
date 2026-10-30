import { Link } from 'react-router-dom';
import journeyArt from '@/assets/pulse/learning-journey-abstract.webp';
import type { OrganizationOverview } from '@/services/organization.service';
import type { DashboardDto } from '@/services/analytics.service';

interface OwnerOverviewHeroProps {
  org: OrganizationOverview;
  cap?: DashboardDto;
}

interface HeroAction {
  label: string;
  to: string;
  variant: 'outline' | 'filled';
}

function resolveActions(org: OrganizationOverview, cap?: DashboardDto): HeroAction[] {
  if (!org.setupCompleted) {
    return [
      { label: 'Hoàn thiện thiết lập', to: '/setup', variant: 'outline' },
      { label: 'Khám phá khóa học', to: '/enterprise/courses', variant: 'filled' },
    ];
  }
  if (org.members.active + org.members.pending <= 1) {
    return [
      { label: 'Mời thành viên', to: '/enterprise/members', variant: 'outline' },
      { label: 'Khám phá khóa học', to: '/enterprise/courses', variant: 'filled' },
    ];
  }
  if (cap && cap.kpis.completionRate > 0) {
    return [
      { label: 'Mở báo cáo chu kỳ', to: '/enterprise/reports', variant: 'outline' },
      { label: 'Khám phá khóa học', to: '/enterprise/courses', variant: 'filled' },
    ];
  }
  return [
    { label: 'Xem khoảng cách năng lực', to: '/enterprise/skill-gap', variant: 'outline' },
    { label: 'Khung năng lực', to: '/enterprise/framework', variant: 'filled' },
  ];
}

export function OwnerOverviewHero({ org, cap }: OwnerOverviewHeroProps) {
  const actions = resolveActions(org, cap);

  return (
    <section
      className="po-owner-hero relative overflow-hidden rounded-[25px] grid grid-cols-1 lg:grid-cols-[1.2fr_.75fr] lg:min-h-[320px]"
    >
      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] mb-5 " style={{ color: '#c1e8df' }}>
          Chủ doanh nghiệp / <span className="tracking-[0.14em]">QUẢN LÝ LỘ TRÌNH</span>
        </p>
        <h2
          className="font-semibold leading-[1.15] mb-4"
          style={{ fontSize: 'clamp(26px, 3.2vw, 42px)', letterSpacing: '-0.04em' }}
        >
          <span className="text-white block">Thiết lập mục tiêu.</span>
          <span className="text-white block">Xem khoảng cách năng lực.</span>
          <span style={{ color: '#b8eadc' }} className="block">Chọn khóa học tiếp theo.</span>
        </h2>
        <p className="text-sm leading-relaxed max-w-lg mb-6" style={{ color: '#d4e8e9' }}>
          Chuẩn Digital AI trở thành khung doanh nghiệp, rồi lộ trình phòng ban và vị trí cho từng nhân viên.
        </p>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={
                action.variant === 'outline'
                  ? 'inline-flex items-center rounded-xl border border-[rgba(231,240,255,.65)] px-5 py-2.5 text-[13px] font-extrabold text-white transition-colors hover:bg-white/10'
                  : 'inline-flex items-center rounded-xl bg-white px-5 py-2.5 text-[13px] font-extrabold text-[#0e5968] shadow-[0_12px_24px_rgba(0,0,0,.12)] transition-transform hover:-translate-y-0.5'
              }
            >
              {action.label}
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
