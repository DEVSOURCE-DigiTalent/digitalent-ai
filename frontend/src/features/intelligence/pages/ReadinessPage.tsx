import { PageHeader } from '@/components/shared';

export function ReadinessPage() {
  return (
    <div>
      <PageHeader title="Workforce Readiness" subtitle="Employee readiness overview" />
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Readiness dashboard with score distribution and explanation drawer will be implemented here.</p>
      </div>
    </div>
  );
}
