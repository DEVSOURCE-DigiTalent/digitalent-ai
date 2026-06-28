import { PageHeader } from '@/components/shared';

export function CertificateListPage() {
  return (
    <div>
      <PageHeader title="Certificate Management" subtitle="Track issued certificates">
        <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">Issue Certificate</button>
      </PageHeader>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Certificate list with issue/revoke will be implemented here.</p>
      </div>
    </div>
  );
}
