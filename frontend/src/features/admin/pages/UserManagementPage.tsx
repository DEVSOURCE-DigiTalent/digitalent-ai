import { PageHeader } from '@/components/shared';

export function UserManagementPage() {
  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage user accounts and roles">
        <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">
          Create User
        </button>
      </PageHeader>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">User list table will be implemented here with search, filters, and pagination.</p>
      </div>
    </div>
  );
}
