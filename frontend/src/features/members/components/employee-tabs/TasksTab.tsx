import React from 'react';
import { EmptyState } from '@/components/shared';
import { formatDate } from '@/lib/utils';
import type { PracticalTaskRecord } from '@/services/mock/server/types-work';

interface TasksTabProps {
  tasks?: PracticalTaskRecord[];
  readOnly?: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ASSIGNED: { label: 'Đã giao', color: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  SUBMITTED: { label: 'Đã nộp', color: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  EVALUATED: { label: 'Đã đánh giá', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  OVERDUE: { label: 'Quá hạn', color: 'bg-red-50 text-red-700 ring-red-600/20' },
};

export const TasksTab: React.FC<TasksTabProps> = ({ tasks = [] }) => {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="Chưa có nhiệm vụ thực tế nào"
        description="Nhân viên chưa được giao nhiệm vụ thực tế để đánh giá năng lực tại doanh nghiệp."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Nhiệm vụ thực tế được giao ({tasks.length})
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {tasks.map((task) => {
          const status = STATUS_LABELS[task.status] ?? {
            label: task.status,
            color: 'bg-slate-50 text-slate-700 ring-slate-600/20',
          };

          return (
            <div
              key={task.id}
              className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-slate-900">{task.title}</h4>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{task.description}</p>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Hạn chót: {formatDate(task.dueDate)}</span>
                <span className="font-mono text-slate-400">{task.competencyIds?.join(', ')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
