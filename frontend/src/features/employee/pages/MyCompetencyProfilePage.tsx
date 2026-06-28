import { PageHeader } from '@/components/shared';

export function MyCompetencyProfilePage() {
  return (
    <div>
      <PageHeader title="My Competency Profile" subtitle="View your skills and evidence" />
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Competency profile with evidence timeline will be implemented here.</p>
      </div>
    </div>
  );
}
