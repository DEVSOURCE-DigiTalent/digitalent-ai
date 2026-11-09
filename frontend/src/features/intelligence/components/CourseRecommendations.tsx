import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { EmptyState, StatusBadge } from '@/components/shared';
import { useCourseRecommendations } from '@/hooks/use-recommendations';
import { levelLabel } from '@/lib/competency-levels';
import type { CourseRecommendation, RecommendationEmptyReason } from '@/services/intelligence.service';
import { SeverityBadge } from './SeverityBadge';

const EMPTY_STATES: Record<RecommendationEmptyReason, { title: string; description: string }> = {
  NO_EMPLOYEE_PROFILE: {
    title: 'Chưa có hồ sơ nhân viên',
    description: 'Đề xuất dựa trên chuẩn vị trí của nhân viên; tài khoản này chưa gắn với nhân viên nào.',
  },
  NO_SKILL_GAP_RUN: {
    title: 'Chưa có kết quả khoảng trống năng lực',
    description: 'Cần phân tích năng lực trước khi đề xuất khóa học.',
  },
  NO_GAP: {
    title: 'Đã đạt mọi năng lực của vị trí',
    description: 'Không còn khoảng trống năng lực nào so với chuẩn vị trí hiện tại.',
  },
  NO_MATCHING_COURSE: {
    title: 'Chưa có khóa học phù hợp với khoảng trống hiện tại',
    description: 'Chưa có khóa học đã xuất bản nào nâng được các năng lực còn thiếu.',
  },
};

const ENROLLMENT_LABELS: Record<string, string> = {
  NOT_STARTED: 'Đã được giao',
  IN_PROGRESS: 'Đang học',
  READY_FOR_ASSESSMENT: 'Chờ đánh giá',
};

/**
 * Explainable course recommendations for one employee (default: the signed-in employee) — spec §5.
 */
export function CourseRecommendations({ employeeId, compact = false }: { employeeId?: string; compact?: boolean }) {
  useUiLanguage();
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading, isError, refetch } = useCourseRecommendations(employeeId);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse" aria-label="Đang tải đề xuất">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Không tải được đề xuất"
        description="Có lỗi khi tải đề xuất khóa học."
        action={
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
          >{translateUi("Thử lại")}</button>
        }
      />
    );
  }

  if (data.reason) {
    const empty = EMPTY_STATES[data.reason];
    return (
      <EmptyState
        icon={<BookOpen className="w-16 h-16 mx-auto" strokeWidth={1} />}
        title={translateUi(empty.title)}
        description={translateUi(empty.description)}
      />
    );
  }

  if (compact) {
    const visible = showAll ? data.items : data.items.slice(0, 3);
    return <div className="personal-course-list">
      {visible.map((item, index) => <article className="personal-course-card" key={item.courseId}>
        <span className="personal-course-rank">{String(index + 1).padStart(2, '0')}</span>
        <div><strong>{translateUi(item.title)}</strong><small>{item.courseCode}{item.estimatedDurationMinutes != null ? translateUi(` · ${(item.estimatedDurationMinutes / 60).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} giờ`) : ''} · {item.reasons.length} năng lực liên quan</small></div>
        <span className="personal-course-score">{translateUi("Ưu tiên ")}{index + 1}</span>
        <Link to={`/enterprise/courses?focus=${encodeURIComponent(item.courseCode)}`} aria-label={translateUi(`Xem khóa học ${item.title}`)}>{translateUi("Xem khóa học ")}<ArrowRight size={15} /></Link>
      </article>)}
      {data.items.length > 3 && <button className="personal-course-more" type="button" onClick={() => setShowAll((value) => !value)}>{showAll ? translateUi('Thu gọn') : translateUi(`Xem thêm ${data.items.length - 3} khóa học`)}</button>}
    </div>;
  }

  return (
    <ol className="space-y-3">
      {data.items.map((item, index) => (
        <li key={item.courseId}>
          <RecommendationCard item={item} rank={index + 1} />
        </li>
      ))}
    </ol>
  );
}

function RecommendationCard({ item, rank }: { item: CourseRecommendation; rank: number }) {
  useUiLanguage();
  const { breakdown } = item;
  const enrollmentLabel = item.enrollmentStatus ? ENROLLMENT_LABELS[item.enrollmentStatus] ?? item.enrollmentStatus : null;

  return (
    <article className="bg-white rounded-lg border border-slate-200 p-4 flex gap-4">
      <div className="shrink-0 w-16 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">#{rank}</p>
        <p className="text-2xl font-bold text-primary-700 tabular-nums">{item.score.toFixed(1)}</p>
        <p className="text-[10px] text-slate-400">/ 100</p>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-slate-900">{translateUi(item.title)}</h3>
          <span className="text-xs text-slate-400">{item.courseCode}</span>
          {enrollmentLabel && <StatusBadge label={translateUi(enrollmentLabel)} variant="info" />}
        </div>

        <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
          {item.estimatedDurationMinutes != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {Math.round(item.estimatedDurationMinutes / 60)}{translateUi(" giờ")}</span>
          )}
          <span>
            Đóng khoảng trống {breakdown.gapPriorityCoverage.toFixed(1)} · Bắt buộc {breakdown.mandatoryCoverage.toFixed(1)} · Phù hợp
            đầu vào {breakdown.entryLevelFit.toFixed(1)}
          </span>
        </p>

        <ul className="space-y-1">
          {item.reasons.map((reason) => (
            <li key={reason.competencyId} className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
              <SeverityBadge severity={reason.severity} />
              <span>
                {reason.competencyName}: {levelLabel(reason.currentLevel)} → {levelLabel(reason.courseTargetLevel)}
                <span className="text-slate-400"> (yêu cầu {levelLabel(reason.requiredLevel)})</span>
              </span>
              {reason.mandatory && <span className="text-[10px] font-semibold uppercase text-danger-600">{translateUi("Bắt buộc")}</span>}
            </li>
          ))}
        </ul>

        {item.warnings.includes('ENTRY_LEVEL_NOT_MET') && (
          <p className="flex items-center gap-1.5 text-xs text-warning-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            Mức đầu vào của khóa cao hơn mức hiện tại — nên học khóa nền tảng trước.
          </p>
        )}
      </div>
    </article>
  );
}
