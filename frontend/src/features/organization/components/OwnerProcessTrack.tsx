import { Link } from 'react-router-dom';
import type { OrganizationOverview } from '@/services/organization.service';
import type { DashboardDto } from '@/services/analytics.service';

interface OwnerProcessTrackProps {
  org: OrganizationOverview;
  cap?: DashboardDto;
}

const STEPS = [
  { key: 'setup', label: 'Thiết lập', to: '/enterprise/setup' },
  { key: 'people', label: 'Nhân sự', to: '/enterprise/members' },
  { key: 'baseline', label: 'Đánh giá', to: '/enterprise/competency-profiles' },
  { key: 'gap', label: 'Khoảng trống & lộ trình', to: '/enterprise/skill-gap' },
  { key: 'learn', label: 'Đào tạo & duyệt', to: '/enterprise/training-batches' },
  { key: 'report', label: 'Báo cáo', to: '/enterprise/reports' },
] as const;

function resolveStepStates(org: OrganizationOverview, cap?: DashboardDto): boolean[] {
  const hasMembers = org.members.active + org.members.pending > 1;
  const hasBaseline =
    (cap?.kpis.employees ?? 0) > 0 &&
    (cap?.domains ?? []).some((d) => d.averageCurrent > 0);
  const hasGaps =
    (cap?.kpis.employeesWithHigh ?? 0) > 0 || (cap?.atRisk ?? []).length > 0;
  const hasTraining =
    (org.runningBatches ?? 0) > 0 || (cap?.kpis.completionRate ?? 0) > 0;
  const hasReport = (cap?.kpis.completionRate ?? 0) > 0;

  return [org.setupCompleted, hasMembers, hasBaseline, hasGaps, hasTraining, hasReport];
}

export function OwnerProcessTrack({ org, cap }: OwnerProcessTrackProps) {
  const doneStates = resolveStepStates(org, cap);
  const currentIndex = doneStates.indexOf(false);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-[14px]">
      {STEPS.map((step, i) => {
        const done = doneStates[i];
        const isCurrent = i === currentIndex;
        return (
          <Link
            key={step.key}
            to={step.to}
            className="flex flex-col rounded-xl border min-h-[85px] transition-all hover:shadow-sm"
            style={{
              padding: '15px 10px',
              borderColor: isCurrent
                ? 'color-mix(in srgb, var(--po-accent) 50%, var(--po-line))'
                : 'var(--po-line)',
              background: isCurrent ? 'var(--po-tint)' : 'var(--po-surface)',
              opacity: !done && !isCurrent ? 0.6 : 1,
            }}
          >
            <span
              className="text-[10px] font-bold tabular-nums"
              style={{ color: 'var(--po-accent)' }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className="mt-auto text-[11px] font-extrabold leading-tight"
              style={{
                color: isCurrent
                  ? 'var(--po-accent)'
                  : done
                    ? 'var(--po-ink)'
                    : 'var(--po-muted)',
              }}
            >
              {step.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
