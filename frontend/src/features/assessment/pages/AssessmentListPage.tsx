import { PageHeader } from '@/components/shared';

export function AssessmentListPage() {
  return (
    <div>
      <PageHeader title="Assessments" subtitle="Manage assessments and attempts">
        <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">Create Assessment</button>
      </PageHeader>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Assessment list with question selection will be implemented here.</p>
      </div>
    </div>
  );
}
