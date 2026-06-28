import { PageHeader } from '@/components/shared';

export function CourseListPage() {
  return (
    <div>
      <PageHeader title="Courses" subtitle="Manage course catalog">
        <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">Create Course</button>
      </PageHeader>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Course list with status, competencies, and actions will be implemented here.</p>
      </div>
    </div>
  );
}
