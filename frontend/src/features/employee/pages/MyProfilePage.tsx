import { PageHeader } from '@/components/shared';

export function MyProfilePage() {
  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your account" />
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Profile card + password change form will be implemented here.</p>
      </div>
    </div>
  );
}
