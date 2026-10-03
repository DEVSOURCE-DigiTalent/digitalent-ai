import React from 'react';
import { EmptyState } from '@/components/shared';
import { formatDate } from '@/lib/utils';
import { ASSIGNMENT_STATUS_LABELS, AssignmentStatusBadge } from '@/features/assignments/assignment-labels';
import type { AssignmentRow } from '@/services/assignment.service';

interface LearningTabProps {
  assignments: AssignmentRow[];
  readOnly?: boolean;
}

export const LearningTab: React.FC<LearningTabProps> = ({ assignments }) => {
  if (assignments.length === 0) {
    return (
      <EmptyState
        title="Chưa được giao khóa học nào"
        description="Nhân viên chưa tham gia khóa học nào trong các đợt đào tạo của tổ chức."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Danh sách khóa học ({assignments.length})
        </h3>
      </div>

      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {assignments.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm hover:bg-slate-50/50">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">
                <span className="font-mono text-xs text-slate-500 mr-2">{a.courseCode}</span>
                {a.courseTitle}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>{a.dueDate ? `Hạn hoàn thành: ${formatDate(a.dueDate)}` : 'Không giới hạn thời gian'}</span>
                <span>·</span>
                <span>{ASSIGNMENT_STATUS_LABELS[a.status]}</span>
                <span>·</span>
                <span className="font-semibold text-slate-700">Tiến độ: {a.progressPercent}%</span>
              </div>
            </div>
            <AssignmentStatusBadge assignment={a} />
          </li>
        ))}
      </ul>
    </div>
  );
};
