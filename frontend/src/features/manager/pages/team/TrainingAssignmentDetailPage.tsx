import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Calendar, Clock, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { assignmentService } from '@/services/assignment.service';
import { EmptyState } from '@/components/shared';
import { formatDate } from '@/lib/utils';
import { ASSIGNMENT_STATUS_LABELS } from '@/features/assignments/assignment-labels';

export function TrainingAssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();

  const { data: assignment, isLoading, isError } = useQuery({
    queryKey: ['course-assignments', assignmentId],
    queryFn: () => assignmentService.getById(assignmentId!),
    enabled: Boolean(assignmentId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 pb-16">
        <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="space-y-6 pb-16">
        <Link
          to="/enterprise/team/training"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition font-medium"
        >
          <ArrowLeft className="size-4" /> Quay lại tiến độ đào tạo nhóm
        </Link>
        <EmptyState
          title="Không tìm thấy phân công đào tạo"
          description="Bản ghi phân công đào tạo này không tồn tại hoặc không nằm trong phạm vi phòng ban bạn quản lý."
        />
      </div>
    );
  }

  const isCompleted = assignment.status === 'COMPLETED' || Boolean(assignment.completedAt);
  const isOverdue = assignment.overdue;

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      <Link
        to="/enterprise/team/training"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition font-medium"
      >
        <ArrowLeft className="size-4" /> Quay lại tiến độ đào tạo nhóm
      </Link>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                {assignment.courseCode}
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                Chế độ chỉ đọc (Manager)
              </span>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="size-3.5" /> Đã hoàn thành
                </span>
              ) : isOverdue ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  <AlertTriangle className="size-3.5" /> Quá hạn
                </span>
              ) : (
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {ASSIGNMENT_STATUS_LABELS[assignment.status] ?? assignment.status}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{assignment.courseTitle}</h1>
          </div>
        </div>

        {/* Member and Department Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
          <div>
            <span className="text-slate-400 block mb-0.5">Nhân viên được giao:</span>
            <p className="font-bold text-slate-900 text-sm">{assignment.employeeName}</p>
            <p className="text-slate-500 font-mono text-[11px]">{assignment.employeeCode}</p>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Phòng ban:</span>
            <p className="font-semibold text-slate-800">{assignment.departmentName || 'Chưa gán'}</p>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Vị trí:</span>
            <p className="font-semibold text-slate-800">{assignment.positionName || 'Chưa gán'}</p>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Người giao:</span>
            <p className="font-semibold text-slate-800">{assignment.assignedByName}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">Tiến độ hoàn thành khóa học</span>
            <span className="text-blue-600 font-bold">{assignment.progressPercent}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${assignment.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Dates Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-slate-400" />
            <span>Ngày giao: <strong>{formatDate(assignment.assignedAt)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-slate-400" />
            <span>Hạn nộp: <strong>{assignment.dueDate ? formatDate(assignment.dueDate) : 'Không có'}</strong></span>
          </div>
          {assignment.completedAt && (
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Hoàn thành: <strong>{formatDate(assignment.completedAt)}</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
