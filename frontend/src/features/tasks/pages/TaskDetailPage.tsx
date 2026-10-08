import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, AlertCircle,
} from 'lucide-react';
import { PageHeader, StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { usePracticalTask } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading, isError } = usePracticalTask(id);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-6">
        <div className="h-6 w-32 bg-slate-100 animate-pulse rounded" />
        <div className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="size-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Không tìm thấy bài thực hành</h2>
        <p className="text-sm text-slate-500">Bài tập có thể đã bị xóa hoặc không thuộc quyền quản lý của bạn.</p>
        <Link
          to="/enterprise/tasks"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <Link
        to="/enterprise/tasks"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="size-4" />
        <span>Quay lại danh sách bài thực hành</span>
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={task.title}
          subtitle={`Giao bởi: ${task.assignedByName} • Hạn hoàn thành: ${formatDate(task.dueDate)}`}
        />
        <div className="flex items-center gap-2">
          <LevelBadge level={task.targetLevel} />
          <StatusBadge
            variant={task.status === 'ACTIVE' ? 'success' : 'default'}
            label={task.status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng'}
          />
        </div>
      </div>

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Overview & Rubrics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base">Yêu cầu nhiệm vụ & Bối cảnh</h3>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {task.description}
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Sản phẩm đầu ra yêu cầu (Minh chứng)
              </h4>
              <p className="text-sm font-medium text-blue-700 bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                {task.expectedOutput}
              </p>
            </div>
          </div>

          {/* Rubrics */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Tiêu chí chấm điểm (Rubric)</h3>
              <span className="text-xs font-semibold text-slate-500">
                Tổng điểm: {task.rubricCriteria.reduce((sum: number, r: any) => sum + r.maxPoints, 0)} điểm
              </span>
            </div>

            <div className="space-y-3">
              {task.rubricCriteria.map((r: any, idx: number) => (
                <div key={r.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{r.label}</span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Tối đa {r.maxPoints}đ
                    </span>
                  </div>
                  {r.description && <p className="text-xs text-slate-600">{r.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Competencies & Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base">Chuẩn năng lực liên kết</h3>
            <div className="flex flex-wrap gap-2">
              {task.competencyIds.map((code: string) => {
                const cleanCode = code.toUpperCase().replace(/^TT02-/, '').replace(/^CMP-/, '');
                return (
                  <span
                    key={code}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-mono font-bold"
                  >
                    CMP-{cleanCode}
                  </span>
                );
              })}
            </div>
            {task.departmentName && (
              <div className="pt-2 text-xs text-slate-500">
                Phòng ban: <span className="font-semibold text-slate-800">{task.departmentName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submissions & Assigned Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Danh sách nhân sự & Tiến độ nộp bài</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi tình trạng nộp bài của từng nhân viên và tiến hành chấm điểm minh chứng.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {(task.assignedEmployees ?? []).length} nhân sự
          </span>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {(task.assignedEmployees ?? []).map((emp: any) => {
            const sub = (task.submissions ?? []).find((s: any) => s.employeeId === emp.id);

            return (
              <div key={emp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600 shrink-0">
                    {emp.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{emp.fullName}</p>
                    <p className="text-xs text-slate-500 font-mono">
                      {emp.employeeCode} • {emp.workEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {sub ? (
                    <>
                      <StatusBadge
                        variant={
                          sub.status === 'APPROVED'
                            ? 'success'
                            : sub.status === 'REVISION_REQUESTED'
                            ? 'warning'
                            : sub.status === 'REJECTED'
                            ? 'danger'
                            : 'info'
                        }
                        label={
                          sub.status === 'APPROVED'
                            ? `Đã duyệt (${sub.evaluation?.score ?? 0}đ)`
                            : sub.status === 'REVISION_REQUESTED'
                            ? 'Yêu cầu sửa lại'
                            : sub.status === 'REJECTED'
                            ? 'Không đạt'
                            : 'Đang chờ chấm'
                        }
                      />
                      {sub.status === 'PENDING_REVIEW' ? (
                        <Link
                          to={`/enterprise/tasks/${task.id}/evaluate?subId=${sub.id}`}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          Chấm điểm
                        </Link>
                      ) : (
                        <Link
                          to={`/enterprise/evidence/${sub.id}`}
                          className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition"
                        >
                          Xem minh chứng
                        </Link>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Chưa nộp bài</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
