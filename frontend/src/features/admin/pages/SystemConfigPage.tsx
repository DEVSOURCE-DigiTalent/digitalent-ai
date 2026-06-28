import { PageHeader } from '@/components/shared';

export function SystemConfigPage() {
  return (
    <div>
      <PageHeader title="System Configuration" subtitle="Scoring weights, thresholds and system parameters" />
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Configuration form will be implemented here.</p>
      </div>
    </div>
  );
}
