import { PageHeader } from '@/components/shared';

export function MyLearningPage() {
  return (
    <div>
      <PageHeader title="My Learning" subtitle="Your assigned courses" />
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Learning list with progress tracking will be implemented here.</p>
      </div>
    </div>
  );
}
