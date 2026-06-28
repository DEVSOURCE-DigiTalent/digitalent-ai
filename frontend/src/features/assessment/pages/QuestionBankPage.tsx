import { PageHeader } from '@/components/shared';

export function QuestionBankPage() {
  return (
    <div>
      <PageHeader title="Question Bank" subtitle="Manage reusable assessment questions">
        <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">Create Question</button>
      </PageHeader>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-500">Question bank with AI draft tab will be implemented here.</p>
      </div>
    </div>
  );
}
