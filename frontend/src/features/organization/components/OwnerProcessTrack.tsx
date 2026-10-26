import { Link } from 'react-router-dom';
import { CheckCircle2, CircleDot, ArrowRight } from 'lucide-react';
import type { OrganizationOverview } from '@/services/organization.service';
import type { DashboardDto } from '@/services/analytics.service';

interface OwnerProcessTrackProps {
  org: OrganizationOverview;
  cap?: DashboardDto;
}

const STEPS = [
  { key: 'setup', step: '01', label: 'Thiết lập chuẩn', desc: 'Trần & vị trí', to: '/enterprise/setup' },
  { key: 'people', step: '02', label: 'Tổ chức nhân sự', desc: 'Mời thành viên', to: '/enterprise/members' },
  { key: 'baseline', step: '03', label: 'Đánh giá ban đầu', desc: 'Hồ sơ năng lực', to: '/enterprise/competency-profiles' },
  { key: 'gap', step: '04', label: 'Khoảng trống', desc: 'Lộ trình cần học', to: '/enterprise/skill-gap' },
  { key: 'learn', step: '05', label: 'Đào tạo & Duyệt', desc: 'Chấm bài tập', to: '/enterprise/batches' },
  { key: 'report', step: '06', label: 'Báo cáo chu kỳ', desc: 'Đo lường tiến độ', to: '/enterprise/reports' },
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
  const firstIncompleteIndex = doneStates.indexOf(false);
  const activeIndex = firstIncompleteIndex === -1 ? 5 : firstIncompleteIndex;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Quy trình triển khai 6 bước
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {doneStates.filter(Boolean).length}/6 hoàn thành
          </span>
        </div>
        <Link 
          to="/enterprise/setup" 
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
        >
          <span>Xem chi tiết thiết lập</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {STEPS.map((step, i) => {
          const done = doneStates[i];
          const isCurrent = i === activeIndex;

          return (
            <Link
              key={step.key}
              to={step.to}
              className={`group flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                isCurrent
                  ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20'
                  : done
                  ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono font-bold ${
                  isCurrent ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {step.step}
                </span>
                {done ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : isCurrent ? (
                  <CircleDot className="size-4 text-blue-600 animate-pulse" />
                ) : (
                  <div className="size-2 rounded-full bg-slate-200" />
                )}
              </div>

              <div className="mt-3">
                <div className={`text-xs font-bold leading-snug ${
                  isCurrent ? 'text-blue-900' : done ? 'text-slate-900' : 'text-slate-600'
                }`}>
                  {step.label}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {step.desc}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
