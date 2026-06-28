import { PageHeader } from '@/components/shared';

export function CourseAssignmentPage() {
  return (
    <div>
      <PageHeader title="Course Assignment" subtitle="Assign courses to employees, departments or positions" />
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Course assignment wizard will be implemented here.</p>
      </div>
    </div>
  );
}
