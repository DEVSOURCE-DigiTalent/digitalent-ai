import { PageHeader } from '@/components/shared';

export function PositionRequirementsPage() {
  return (
    <div>
      <PageHeader title="Position Requirements" subtitle="Map competencies to job positions" />
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Position requirement mapping matrix will be implemented here.</p>
      </div>
    </div>
  );
}
