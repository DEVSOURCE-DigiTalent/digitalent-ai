import React from 'react';
import { EmptyState } from '@/components/shared';
import { formatDate } from '@/lib/utils';
import type { AssessmentAttemptRecord } from '@/services/mock/server/types-work';

interface AssessmentsTabProps {
  attempts?: AssessmentAttemptRecord[];
  readOnly?: boolean;
}

export const AssessmentsTab: React.FC<AssessmentsTabProps> = ({ attempts = [] }) => {
  if (attempts.length === 0) {
    return (
      <EmptyState
        title="Chưa có kết quả đánh giá"
        description="Nhân viên chưa thực hiện bài kiểm tra trắc nghiệm hay bài đánh giá năng lực nào."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Lịch sử làm bài đánh giá ({attempts.length})
        </h3>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-4 py-2.5 font-medium">Khóa học / Bài đánh giá</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Điểm số</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Kết quả</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Số câu đúng</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Ngày nộp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attempts.map((att) => (
              <tr key={att.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{att.courseTitle}</p>
                  <p className="text-xs text-slate-500 font-mono">{att.assessmentId}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">{att.score} / 100</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      att.passed
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                        : 'bg-red-50 text-red-700 ring-red-600/20'
                    }`}
                  >
                    {att.passed ? 'Đạt' : 'Chưa đạt'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {att.correctAnswers} / {att.totalQuestions}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{formatDate(att.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
