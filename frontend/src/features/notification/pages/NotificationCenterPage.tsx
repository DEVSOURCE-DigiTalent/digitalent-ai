import { PageHeader } from '@/components/shared';

export function NotificationCenterPage() {
  return (
    <div>
      <PageHeader title="Notification Center" subtitle="View and manage notifications" />
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Inbox-style notification list will be implemented here.</p>
      </div>
    </div>
  );
}
