import { PageHeader } from '@/components/shared';

export function AdminDashboardPage() {
  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="System overview and governance" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase font-medium">Total Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">—</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase font-medium">Active (30d)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">—</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase font-medium">Departments</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">—</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase font-medium">System Status</p>
          <p className="text-2xl font-bold text-success-600 mt-1">Healthy</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-2">Welcome to DigiTalent AI</h3>
        <p className="text-sm text-slate-500">Admin dashboard will display real metrics once users and departments are created.</p>
      </div>
    </div>
  );
}
