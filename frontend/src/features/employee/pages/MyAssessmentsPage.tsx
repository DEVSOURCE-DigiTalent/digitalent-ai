import { PageHeader } from '@/components/shared';

export function MyAssessmentsPage() {
  return (
    <div>
      <PageHeader title="My Assessments" subtitle="View and take assessments" />
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Assessment list and attempt interface will be implemented here.</p>
      </div>
    </div>
  );
}
