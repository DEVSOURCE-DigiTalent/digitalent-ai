import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  Compass,
  FileBarChart,
  TrendingUp,
} from 'lucide-react';
import type { OrganizationOverview } from '@/services/organization.service';
import type { DashboardDto } from '@/services/analytics.service';
import { useTrialProgram } from '@/hooks/use-trial-program';

interface OwnerProcessTrackProps {
  org: OrganizationOverview;
  cap?: DashboardDto;
}

export interface ProcessStepItem {
  key: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  to: string;
  ctaText: string;
  icon: typeof ClipboardCheck;
  hint: string;
}

const STEPS: ProcessStepItem[] = [
  {
    key: 'team-assessment',
    stepNumber: '01',
    title: 'Đánh giá đội ngũ & Làm bài test',
    subtitle: 'Khảo sát và đánh giá năng lực số ban đầu của toàn đội ngũ.',
    to: '/enterprise/trial',
    ctaText: 'Tạo đợt đánh giá ngay',
    icon: ClipboardCheck,
    hint: 'Khởi đầu quan trọng nhất: Cần có dữ liệu bài test để đo lường năng lực thực tế.',
  },
  {
    key: 'skill-gap',
    stepNumber: '02',
    title: 'Xem Khoảng trống Năng lực',
    subtitle: 'Xem ma trận năng lực và nhận diện khoảng cách kỹ năng.',
    to: '/enterprise/skill-gap',
    ctaText: 'Xem ma trận năng lực',
    icon: TrendingUp,
    hint: 'Phát hiện các phòng ban và lĩnh vực còn yếu cần ưu tiên nâng chuẩn.',
  },
  {
    key: 'framework-setup',
    stepNumber: '03',
    title: 'Thiết lập Khung năng lực',
    subtitle: 'Cấu hình trần năng lực mục tiêu theo từng vị trí.',
    to: '/enterprise/setup',
    ctaText: 'Cấu hình khung trần',
    icon: Compass,
    hint: 'Định hình mục tiêu phát triển kỳ vọng phù hợp với chiến lược số hóa.',
  },
  {
    key: 'courses-seats',
    stepNumber: '04',
    title: 'Mua khóa học & Phân bổ ghế',
    subtitle: 'Trang bị gói khóa học và phân bổ ghế học cho nhân sự.',
    to: '/enterprise/courses',
    ctaText: 'Trang bị khóa học',
    icon: BookOpen,
    hint: 'Mỗi ghế học tương ứng 1 nhân viên học trực tuyến toàn diện và nộp minh chứng.',
  },
  {
    key: 'training-reports',
    stepNumber: '05',
    title: 'Đào tạo, Duyệt bài & Báo cáo',
    subtitle: 'Theo dõi tiến độ học tập và xem báo cáo chu kỳ.',
    to: '/enterprise/reports',
    ctaText: 'Xem báo cáo chu kỳ',
    icon: FileBarChart,
    hint: 'Nghiệm thu tăng trưởng năng lực số toàn đội ngũ định kỳ.',
  },
];

function resolveStepStates(
  org: OrganizationOverview,
  cap?: DashboardDto,
  hasTrialParticipants?: boolean
): boolean[] {
  // Bước 1: Đã bắt đầu đợt đánh giá (có người tham gia) hoặc đã có nhân sự ngoài chủ doanh nghiệp (> 1)
  const hasStartedAssessment =
    Boolean(hasTrialParticipants) ||
    org.members.active + org.members.pending > 1 ||
    (cap?.kpis.employees ?? 0) > 0;

  // Bước 2: Đã có kết quả bài test / dữ liệu khoảng trống kỹ năng
  const hasSkillGapData =
    (cap?.kpis.employees ?? 0) > 0 &&
    ((cap?.domains ?? []).some((d) => d.averageCurrent > 0) || (cap?.kpis.employeesWithHigh ?? 0) > 0);

  // Bước 3: Đã thiết lập khung năng lực mục tiêu (setup completed)
  const hasSetup = org.setupCompleted;

  // Bước 4: Đã trang bị khóa học / mua ghế học
  const hasCourses = org.seats.used > 0 || (org.runningBatches ?? 0) > 0;

  // Bước 5: Đã có tiến độ hoàn thành đào tạo hoặc xem báo cáo
  const hasReports = (cap?.kpis.completionRate ?? 0) > 0 || (org.pendingReviews ?? 0) > 0;

  return [hasStartedAssessment, hasSkillGapData, hasSetup, hasCourses, hasReports];
}

export function OwnerProcessTrack({ org, cap }: OwnerProcessTrackProps) {
  const { data: trialProgram } = useTrialProgram();
  const hasTrialParticipants = (trialProgram?.participants?.length ?? 0) > 0;
  const doneStates = resolveStepStates(org, cap, hasTrialParticipants);
  const firstIncomplete = doneStates.indexOf(false);
  const currentIndex = firstIncomplete === -1 ? STEPS.length - 1 : firstIncomplete;
  const completedCount = doneStates.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / STEPS.length) * 100);

  return (
    <section
      className="rounded-[22px] border p-6 transition-all"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
        boxShadow: '0 8px 30px rgba(29,48,102,.03)',
      }}
      aria-label="Lộ trình 5 bước chuẩn hóa năng lực số"
    >
      {/* ── Top Header & Progress ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider"
              style={{ background: 'var(--po-tint)', color: 'var(--po-accent)' }}
            >
              Lộ trình triển khai chuẩn hóa số
            </span>
          </div>
          <h3
            className="text-lg md:text-xl font-bold tracking-tight"
            style={{ color: 'var(--po-ink)' }}
          >
            Hành trình Nâng cao Năng lực Số Đội ngũ
          </h3>
        </div>

        {/* Progress Pill & Meter */}
        <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: 'var(--po-ink)' }}>
              Tiến độ:
            </span>
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black tabular-nums"
              style={{
                background: completedCount === STEPS.length ? '#ecfdf5' : 'var(--po-soft)',
                color: completedCount === STEPS.length ? '#059669' : 'var(--po-accent-strong)',
              }}
            >
              {completedCount}/{STEPS.length} bước · {progressPercent}%
            </span>
          </div>
          <div
            className="w-48 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercent}%`,
                background:
                  completedCount === STEPS.length
                    ? '#10b981'
                    : 'linear-gradient(90deg, #137b84 0%, #304bdf 100%)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── 5 Steps Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-5">
        {STEPS.map((step, i) => {
          const isDone = doneStates[i];
          const isCurrent = i === currentIndex;
          const StepIcon = step.icon;

          return (
            <Link
              key={step.key}
              to={step.to}
              className="group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              style={{
                borderColor: isCurrent
                  ? 'var(--po-accent)'
                  : isDone
                    ? 'color-mix(in srgb, #10b981 35%, var(--po-line))'
                    : 'var(--po-line)',
                background: isCurrent
                  ? 'linear-gradient(180deg, var(--po-tint) 0%, var(--po-surface) 100%)'
                  : isDone
                    ? 'var(--po-surface)'
                    : 'color-mix(in srgb, var(--po-surface) 60%, var(--po-canvas))',
                boxShadow: isCurrent ? '0 0 0 2px rgba(19, 123, 132, 0.2)' : undefined,
                opacity: !isDone && !isCurrent ? 0.75 : 1,
              }}
            >
              {/* Card Header: Step number & Status Badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-7 rounded-lg flex items-center justify-center text-xs font-black tabular-nums transition-colors"
                      style={{
                        background: isDone
                          ? '#10b981'
                          : isCurrent
                            ? 'var(--po-accent)'
                            : 'var(--po-line)',
                        color: isDone || isCurrent ? '#fff' : 'var(--po-muted)',
                      }}
                    >
                      {isDone ? <Check className="size-4" strokeWidth={3} /> : step.stepNumber}
                    </span>
                    <StepIcon
                      className="size-4 transition-colors"
                      style={{
                        color: isCurrent
                          ? 'var(--po-accent)'
                          : isDone
                            ? '#059669'
                            : 'var(--po-muted)',
                      }}
                    />
                  </div>

                  {/* Status Indicator */}
                  {isDone ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                      Đã xong
                    </span>
                  ) : isCurrent ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#0e5968] bg-[#c1e8df] px-2 py-0.5 rounded-md animate-pulse">
                      Ưu tiên làm
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">
                      Chờ thực hiện
                    </span>
                  )}
                </div>

                {/* Step Title */}
                <h4
                  className="text-[13px] font-bold leading-snug tracking-tight group-hover:text-[#137b84] transition-colors"
                  style={{
                    color: isCurrent
                      ? 'var(--po-accent-strong)'
                      : isDone
                        ? 'var(--po-ink)'
                        : 'var(--po-muted)',
                  }}
                >
                  {step.title}
                </h4>

                {/* Step Subtitle / Description */}
                <p
                  className="text-[11px] leading-relaxed mt-1.5"
                  style={{ color: 'var(--po-muted)' }}
                >
                  {step.subtitle}
                </p>
              </div>

              {/* Card Footer: Action CTA */}
              <div
                className="mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-extrabold transition-colors"
                style={{
                  borderColor: 'var(--po-line)',
                  color: isCurrent
                    ? 'var(--po-accent)'
                    : isDone
                      ? '#059669'
                      : 'var(--po-muted)',
                }}
              >
                <span>{step.ctaText}</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

