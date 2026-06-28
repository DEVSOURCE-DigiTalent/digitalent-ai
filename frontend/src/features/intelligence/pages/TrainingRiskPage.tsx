import { PageHeader } from '@/components/shared';

export function TrainingRiskPage() {
  return (
    <div>
      <PageHeader title="Training Risk" subtitle="Identify employees at risk of falling behind" />
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Risk list with factor breakdown will be implemented here.</p>
      </div>
    </div>
  );
}
