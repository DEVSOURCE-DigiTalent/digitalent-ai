import { PageHeader } from '@/components/shared';

export function EmployeeListPage() {
  return (
    <div>
      <PageHeader title="Employees" subtitle="Manage employee profiles and capability data">
        <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">Create Employee</button>
      </PageHeader>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Employee list with detail tabs will be implemented here.</p>
      </div>
    </div>
  );
}
