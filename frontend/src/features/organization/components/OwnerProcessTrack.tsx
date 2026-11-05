import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Compass,
} from 'lucide-react';
import type { OrganizationOverview } from '@/services/organization.service';
import type { DashboardDto } from '@/services/analytics.service';
import { useTrialProgram } from '@/hooks/use-trial-program';

interface OwnerProcessTrackProps {
  org: OrganizationOverview;
  cap?: DashboardDto;
}

const MILESTONES = [
  { step: 1, title: 'Đánh giá Đội ngũ', path: '/enterprise/trial' },
  { step: 2, title: 'Khoảng cách Năng lực', path: '/enterprise/skill-gap' },
  { step: 3, title: 'Thiết lập Khung trần', path: '/enterprise/setup' },
  { step: 4, title: 'Khóa học & Phân bổ', path: '/enterprise/courses' },
  { step: 5, title: 'Chu kỳ Báo cáo', path: '/enterprise/reports' },
];

export function OwnerProcessTrack({ org, cap }: OwnerProcessTrackProps) {
  const { data: trialProgram } = useTrialProgram();
  const hasTrialParticipants = (trialProgram?.participants?.length ?? 0) > 0;

  const hasStartedAssessment =
    Boolean(hasTrialParticipants) ||
    org.members.active + org.members.pending > 1 ||
    (cap?.kpis.employees ?? 0) > 0;

  const hasSkillGapData =
    (cap?.kpis.employees ?? 0) > 0 &&
    ((cap?.domains ?? []).some((d) => d.averageCurrent > 0) || (cap?.kpis.employeesWithHigh ?? 0) > 0);

  const stepStates = [
    hasStartedAssessment,
    hasSkillGapData,
    org.setupCompleted,
    (org.runningBatches ?? 0) > 0,
    (org.pendingReviews ?? 0) === 0 && (org.runningBatches ?? 0) > 0,
  ];

  const firstTodoIndex = stepStates.findIndex((done) => !done);
  const activeStep = firstTodoIndex === -1 ? 5 : firstTodoIndex + 1;
  const completedCount = stepStates.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 5) * 100);
  const nextMilestone = MILESTONES[activeStep - 1] || MILESTONES[0];

  return (
    <div className="rounded-2xl border border-[#e0e8ee] bg-white px-5 py-3.5 shadow-[0_2px_12px_rgba(20,40,80,0.03)] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      {/* Left: Current Phase Info */}
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-teal-50 text-[#137b84] flex items-center justify-center border border-teal-100 shrink-0">
          <Compass className="size-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f6e88]">
              Lộ trình Chuẩn hóa Số
            </span>
            <span className="text-[11px] font-bold text-[#137b84] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/70">
              {progressPercent}% hoàn thành ({completedCount}/5 bước)
            </span>
          </div>
          <p className="text-xs font-semibold text-[#17243f] mt-0.5">
            Bước {activeStep}: {nextMilestone.title}
          </p>
        </div>
      </div>

      {/* Middle: Stepper indicators */}
      <div className="hidden lg:flex items-center gap-2">
        {MILESTONES.map((m, idx) => {
          const isDone = stepStates[idx];
          const isCurrent = idx === activeStep - 1;
          return (
            <Link
              key={m.step}
              to={m.path}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isDone
                  ? 'text-emerald-800 bg-emerald-50 border border-emerald-200/70'
                  : isCurrent
                  ? 'text-[#0e5968] bg-teal-50 border border-teal-500 font-bold shadow-2xs'
                  : 'text-[#8a92a6] hover:text-[#17243f] bg-slate-50 border border-slate-200/50'
              }`}
            >
              <span className={`size-4 rounded-full flex items-center justify-center text-[10px] ${
                isDone ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-[#137b84] text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {isDone ? <Check size={10} strokeWidth={3} /> : m.step}
              </span>
              <span>{m.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Right: Quick Next Step CTA */}
      <div className="shrink-0">
        <Link
          to={nextMilestone.path}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#137b84] hover:bg-[#0e5968] text-white text-xs font-bold transition-all shadow-xs"
        >
          <span>Tiếp tục: {nextMilestone.title}</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
