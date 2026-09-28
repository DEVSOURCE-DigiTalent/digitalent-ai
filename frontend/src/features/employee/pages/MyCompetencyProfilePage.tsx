import { useState } from 'react';
import { BookOpen, Radar as RadarIcon } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/shared';
import { useMySkillGap } from '@/hooks/use-skill-gaps';
import { cn } from '@/lib/utils';
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
  const { data: run, isLoading, isError, refetch } = useMySkillGap();

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

// Task 5 (S3-T017) replaces this with the recommendation list.
function RecommendedCoursesTab() {
  return (
    <EmptyState
      icon={<BookOpen className="w-16 h-16 mx-auto" strokeWidth={1} />}
      title="Course recommendations are coming soon"
      description="Courses that close your highest-priority gaps will appear here, with the reason each one was suggested."
    />
  );
}
