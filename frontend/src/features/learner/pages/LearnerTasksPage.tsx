import React from 'react';
import { FileCheck, Clock, CheckCircle2, UploadCloud } from 'lucide-react';

interface PracticalTask {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  score?: number;
}

const mockTasks: PracticalTask[] = [
  {
    id: 'tsk-01',
    title: 'Xây dựng Few-shot Prompt phân loại cảm xúc khách hàng hỗ trợ đa ngôn ngữ',
    courseTitle: 'Kỹ nghệ Câu lệnh AI Nâng cao (crs-01)',
    dueDate: '2026-10-15',
    status: 'GRADED',
    score: 92,
  },
  {
    id: 'tsk-02',
    title: 'Thiết kế System Prompt với JSON Schema Output cho Trợ lý Trích xuất Hợp đồng',
    courseTitle: 'Kỹ nghệ Câu lệnh AI Nâng cao (crs-01)',
    dueDate: '2026-10-25',
    status: 'SUBMITTED',
  },
  {
    id: 'tsk-03',
    title: 'Thực nghiệm Prompt Injection Defense và đo lường tỷ lệ vượt rào',
    courseTitle: 'Đánh giá chất lượng và Guardrails cho LLM (crs-04)',
    dueDate: '2026-11-05',
    status: 'PENDING',
  },
];

export const LearnerTasksPage: React.FC = () => {
  return (
    <div data-testid="learner-tasks-page" className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="border-b pb-5">
        <div className="flex items-center gap-2 text-indigo-600 mb-1">
          <FileCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Bài tập thực chiến</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Nhiệm vụ & Bài tập thực hành</h1>
        <p className="text-sm text-slate-500 mt-1">
          Áp dụng kiến thức đã học vào các tình huống thực tế tại doanh nghiệp để được chấm điểm tự động và nhận phản hồi chi tiết.
        </p>
      </div>

      <div className="space-y-4">
        {mockTasks.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {t.id}
                </span>
                <span className="text-xs text-blue-600 font-medium">{t.courseTitle}</span>
              </div>
              <h2 className="text-base font-bold text-slate-800">{t.title}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Hạn nộp: {t.dueDate}
                </span>
                {t.score !== undefined && (
                  <span className="text-emerald-600 font-bold">
                    Điểm số: {t.score}/100
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {t.status === 'GRADED' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã có điểm
                </span>
              )}
              {t.status === 'SUBMITTED' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                  <Clock className="w-4 h-4" />
                  Đang chấm điểm
                </span>
              )}
              {t.status === 'PENDING' && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  Nộp bài làm
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
