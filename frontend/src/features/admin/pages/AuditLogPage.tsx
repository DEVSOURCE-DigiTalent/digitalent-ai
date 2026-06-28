import { PageHeader } from '@/components/shared';

export function AuditLogPage() {
  return (
    <div>
      <PageHeader title="Audit Log" subtitle="System audit trail for sensitive actions" />
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Audit log table with filters will be implemented here.</p>
      </div>
    </div>
  );
}
