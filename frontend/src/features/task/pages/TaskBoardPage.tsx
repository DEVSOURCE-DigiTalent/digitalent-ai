import { PageHeader } from '@/components/shared';

export function TaskBoardPage() {
  return (
    <div>
      <PageHeader title="Task Board" subtitle="Manage practical tasks">
        <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">Create Task</button>
      </PageHeader>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Task board with Kanban/list view will be implemented here.</p>
      </div>
    </div>
  );
}
