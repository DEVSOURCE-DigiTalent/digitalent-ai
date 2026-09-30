import { useState } from 'react';
import { Radar as RadarIcon } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/shared';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useMySkillGap } from '@/hooks/use-skill-gaps';
import { cn } from '@/lib/utils';
import { CourseRecommendations } from '@/features/intelligence/components/CourseRecommendations';
import { SkillGapDetailSkeleton, SkillGapDetailView } from '@/features/intelligence/components/SkillGapDetailView';

type Tab = 'gap' | 'courses';

const TABS: { id: Tab; label: string }[] = [
  { id: 'gap', label: 'Skill gap' },
  { id: 'courses', label: 'Recommended courses' },
];

/**
 * Employee view of their latest skill gap snapshot against their position standard (S3-T016).
 */
export function MyCompetencyProfilePage() {
  const [tab, setTab] = useState<Tab>('gap');

  return (
    <div className="space-y-6">
      <PageHeader title="My Competency Profile" subtitle="Your confirmed competency levels compared with your position standard" />

      <div role="tablist" aria-label="Competency profile sections" className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'gap' ? <MySkillGapTab /> : <RecommendedCoursesTab />}
    </div>
  );
}

function MySkillGapTab() {
  const { can } = usePermission();
  const canReadSkillGap = can(PERMISSIONS.SKILL_GAP_READ);
  const { data: run, isLoading, isError, refetch } = useMySkillGap(canReadSkillGap);

  if (!canReadSkillGap) {
    return (
      <EmptyState
        icon={<RadarIcon className="w-16 h-16 mx-auto" strokeWidth={1} />}
        title="Skill gap analysis is not available for your role"
        description="Your role does not include access to skill gap analysis. Contact HR if you need it."
      />
    );
  }

  if (isLoading) {
    return <SkillGapDetailSkeleton />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Could not load your skill gap"
        description="Something went wrong while loading your analysis. Please try again."
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

  if (!run) {
    return (
      <EmptyState
        icon={<RadarIcon className="w-16 h-16 mx-auto" strokeWidth={1} />}
        title="No skill gap analysis yet"
        description="Your manager or HR runs the analysis against your position standard. It also refreshes automatically when one of your competency levels is confirmed."
      />
    );
  }

  return <SkillGapDetailView run={run} />;
}

function RecommendedCoursesTab() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Ranked by how much of your highest-priority gaps each published course closes, with the reason for each suggestion.
      </p>
      <CourseRecommendations />
    </div>
  );
}
