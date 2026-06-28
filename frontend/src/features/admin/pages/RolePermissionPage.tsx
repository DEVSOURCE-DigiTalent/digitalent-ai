import { PageHeader } from '@/components/shared';

export function RolePermissionPage() {
  return (
    <div>
      <PageHeader title="Role & Permission" subtitle="Configure role-based access control" />
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Role and permission matrix will be implemented here.</p>
      </div>
    </div>
  );
}
