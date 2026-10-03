import React from 'react';
import { EmptyState, LevelBadge } from '@/components/shared';
import { formatDateTime } from '@/lib/utils';
import type { EvidenceRow, EvidenceSource } from '@/services/workforce.service';

interface EvidencesTabProps {
  evidence: EvidenceRow[];
  submissions?: any[];
  readOnly?: boolean;
}

const SOURCE_LABELS: Record<EvidenceSource, string> = {
  MIGRATION: 'Đánh giá đầu vào',
  ASSESSMENT: 'Bài đánh giá trắc nghiệm',
  TASK: 'Nhiệm vụ thực tế',
  MANUAL: 'Quản trị viên xác nhận',
};

export const EvidencesTab: React.FC<EvidencesTabProps> = ({ evidence = [], submissions = [] }) => {
  if (evidence.length === 0 && submissions.length === 0) {
    return (
      <EmptyState
        title="Chưa có minh chứng năng lực nào"
        description="Mức năng lực của nhân viên được tích lũy và xác nhận thông qua bài đánh giá, nhiệm vụ thực tế và minh chứng công việc."
      />
    );
  }

  return (
    <div className="space-y-6">
      {submissions.length > 0 && (
        <section aria-labelledby="submissions-heading" className="space-y-3">
          <h3 id="submissions-heading" className="text-sm font-semibold text-slate-900">
            Minh chứng nhiệm vụ thực tế đã nộp ({submissions.length})
          </h3>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {submissions.map((sub) => (
              <li key={sub.id} className="p-4 text-sm hover:bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{sub.taskTitle}</p>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      sub.status === 'EVALUATED'
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                        : sub.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 ring-red-600/20'
                        : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                    }`}
                  >
                    {sub.status === 'EVALUATED'
                      ? 'Đã duyệt'
                      : sub.status === 'REJECTED'
                      ? 'Yêu cầu sửa'
                      : 'Chờ duyệt'}
                  </span>
                </div>
                {sub.content && <p className="mt-1 text-xs text-slate-600 line-clamp-2">{sub.content}</p>}
                <div className="mt-2 flex items-center justify-between text-2xs text-slate-400">
                  <span>Nộp lúc: {formatDateTime(sub.submittedAt)}</span>
                  {sub.evaluatorName && <span>Người đánh giá: {sub.evaluatorName}</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {evidence.length > 0 && (
        <section aria-labelledby="evidence-heading" className="space-y-3">
          <h3 id="evidence-heading" className="text-sm font-semibold text-slate-900">
            Nhật ký xác nhận trình độ năng lực ({evidence.length})
          </h3>
          <ol className="grid gap-3 sm:grid-cols-2">
            {evidence.map((entry) => (
              <li
                key={entry.competencyId + entry.confirmedAt}
                className="rounded-lg border border-slate-200 bg-white p-4 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs text-slate-500 mr-1.5">{entry.frameworkCode}</span>
                    <span className="font-medium text-slate-900">{entry.competencyName}</span>
                  </div>
                  <LevelBadge level={entry.level} />
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  <span className="font-medium">{SOURCE_LABELS[entry.source] ?? entry.source}</span>
                  {entry.note ? ` · ${entry.note}` : ''}
                </p>
                <p className="mt-1 text-2xs text-slate-400">{formatDateTime(entry.confirmedAt)}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
};
