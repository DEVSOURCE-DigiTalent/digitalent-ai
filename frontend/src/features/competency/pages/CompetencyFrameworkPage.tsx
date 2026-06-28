import { PageHeader } from '@/components/shared';

export function CompetencyFrameworkPage() {
  return (
    <div>
      <PageHeader title="Competency Framework" subtitle="Define categories, competencies and levels">
        <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">Create Category</button>
      </PageHeader>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Competency framework with split-panel layout will be implemented here.</p>
      </div>
    </div>
  );
}
