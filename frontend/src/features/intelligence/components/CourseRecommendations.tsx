import { AlertTriangle, BookOpen, Clock } from 'lucide-react';
import { EmptyState, StatusBadge } from '@/components/shared';
import { useCourseRecommendations } from '@/hooks/use-recommendations';
import { levelLabel } from '@/lib/competency-levels';
import type { CourseRecommendation, RecommendationEmptyReason } from '@/services/intelligence.service';
import { SeverityBadge } from './SeverityBadge';

const EMPTY_STATES: Record<RecommendationEmptyReason, { title: string; description: string }> = {
  NO_EMPLOYEE_PROFILE: {
    title: 'No employee profile',
    description: 'Recommendations are based on an employee position standard; this account is not linked to an employee.',
  },
  NO_SKILL_GAP_RUN: {
    title: 'No skill gap analysis yet',
    description: 'Recommendations appear once a skill gap analysis has been run.',
  },
  NO_GAP: {
    title: 'All position competencies are met',
    description: 'There is no competency gap to close against the current position standard.',
  },
  NO_MATCHING_COURSE: {
    title: 'No course matches the current gaps',
    description: 'No published course raises the missing competencies yet. HR can link courses to competencies.',
  },
};

const ENROLLMENT_LABELS: Record<string, string> = {
  NOT_STARTED: 'Enrolled',
  IN_PROGRESS: 'In progress',
  READY_FOR_ASSESSMENT: 'Ready for assessment',
};

/**
 * Explainable course recommendations for one employee (default: the signed-in employee) — spec §5.
 */
export function CourseRecommendations({ employeeId }: { employeeId?: string }) {
  const { data, isLoading, isError, refetch } = useCourseRecommendations(employeeId);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse" aria-label="Loading recommendations">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Could not load recommendations"
        description="Something went wrong while loading course recommendations."
        action={
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
          >
            Try again
          </button>
        }
      />
    );
  }

  if (data.reason) {
    const empty = EMPTY_STATES[data.reason];
    return (
      <EmptyState
        icon={<BookOpen className="w-16 h-16 mx-auto" strokeWidth={1} />}
        title={empty.title}
        description={empty.description}
      />
    );
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
          <h3 className="font-semibold text-slate-900">{item.title}</h3>
          <span className="text-xs text-slate-400">{item.courseCode}</span>
          {enrollmentLabel && <StatusBadge label={enrollmentLabel} variant="info" />}
        </div>

        <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
          {item.estimatedDurationMinutes != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {Math.round(item.estimatedDurationMinutes / 60)} h
            </span>
          )}
          <span>
            Gap coverage {breakdown.gapPriorityCoverage.toFixed(1)} · Mandatory {breakdown.mandatoryCoverage.toFixed(1)} · Entry
            level {breakdown.entryLevelFit.toFixed(1)}
          </span>
        </p>

        <ul className="space-y-1">
          {item.reasons.map((reason) => (
            <li key={reason.competencyId} className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
              <SeverityBadge severity={reason.severity} />
              <span>
                {reason.competencyName}: {levelLabel(reason.currentLevel)} → {levelLabel(reason.courseTargetLevel)}
                <span className="text-slate-400"> (required {levelLabel(reason.requiredLevel)})</span>
              </span>
              {reason.mandatory && <span className="text-[10px] font-semibold uppercase text-danger-600">Mandatory</span>}
            </li>
          ))}
        </ul>

        {item.warnings.includes('ENTRY_LEVEL_NOT_MET') && (
          <p className="flex items-center gap-1.5 text-xs text-warning-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            The course entry level is above the current level — consider a foundation course first.
          </p>
        )}
      </div>
    </article>
  );
}
