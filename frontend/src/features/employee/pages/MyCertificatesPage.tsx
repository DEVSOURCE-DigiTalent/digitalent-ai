import { PageHeader } from '@/components/shared';

export function MyCertificatesPage() {
  return (
    <div>
      <PageHeader title="My Certificates" subtitle="Your earned certificates" />
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Certificate list with QR download will be implemented here.</p>
      </div>
    </div>
  );
}
