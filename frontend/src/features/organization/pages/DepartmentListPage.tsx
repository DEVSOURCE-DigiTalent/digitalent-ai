import { PageHeader } from '@/components/shared';

export function DepartmentListPage() {
  return (
    <div>
      <PageHeader title="Departments" subtitle="Manage organizational departments">
        <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">Create Department</button>
      </PageHeader>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Department list with manager assignment will be implemented here.</p>
      </div>
    </div>
  );
}
