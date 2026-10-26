import { Link } from 'react-router-dom';
import { ArrowRight, Users, BookOpen, BarChart3, CheckCircle2 } from 'lucide-react';
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
  icon: typeof ArrowRight;
}

function resolveActions(org: OrganizationOverview, cap?: DashboardDto): HeroAction[] {
  if (!org.setupCompleted) {
    return [
      { label: 'Hoàn thiện thiết lập', to: '/enterprise/setup', variant: 'filled', icon: CheckCircle2 },
      { label: 'Khám phá khóa học', to: '/enterprise/courses', variant: 'outline', icon: BookOpen },
    ];
  }
  if (org.members.active + org.members.pending <= 1) {
    return [
      { label: 'Mời thành viên', to: '/enterprise/members', variant: 'filled', icon: Users },
      { label: 'Khám phá khóa học', to: '/enterprise/courses', variant: 'outline', icon: BookOpen },
    ];
  }
  if (cap && cap.kpis.completionRate > 0) {
    return [
      { label: 'Mở báo cáo chu kỳ', to: '/enterprise/reports', variant: 'filled', icon: BarChart3 },
      { label: 'Khám phá khóa học', to: '/enterprise/courses', variant: 'outline', icon: BookOpen },
    ];
  }
  return [
    { label: 'Xem khoảng cách năng lực', to: '/enterprise/skill-gap', variant: 'filled', icon: BarChart3 },
    { label: 'Khung năng lực', to: '/enterprise/framework', variant: 'outline', icon: BookOpen },
  ];
}

export function OwnerOverviewHero({ org, cap }: OwnerOverviewHeroProps) {
  const actions = resolveActions(org, cap);
  const avgCoverage = cap?.kpis.averageCoverage ?? 0;
  const completionRate = cap?.kpis.completionRate ?? 0;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 md:p-8 text-white shadow-sm border border-slate-700/50">
      {/* Subtle decorative background glow */}
      <div 
        className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-blue-500/10 blur-3xl" 
        aria-hidden="true" 
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 px-3 py-1 text-xs font-semibold text-blue-300">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {org.name}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-300">
              Khung năng lực số TT02
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Quản trị Lộ trình & Năng lực số Doanh nghiệp
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl">
            Theo dõi độ phủ kỹ năng, phê duyệt minh chứng và chuẩn hóa đào tạo theo từng phòng ban và vị trí công việc.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className={
                    action.variant === 'filled'
                      ? 'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'
                      : 'inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs md:text-sm font-semibold text-white hover:bg-white/15 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
                  }
                >
                  <Icon className="size-4" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick status mini-bento */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 lg:w-72 shrink-0">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-sm">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Độ phủ năng lực</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tabular-nums">{avgCoverage}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full bg-emerald-400 transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, avgCoverage))}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-sm">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Tỷ lệ hoàn thành</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tabular-nums">{completionRate}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full bg-blue-400 transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
