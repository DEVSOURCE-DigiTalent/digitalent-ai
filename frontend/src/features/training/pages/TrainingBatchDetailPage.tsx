import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Users, BookOpen, CheckCircle2,
  AlertCircle, Ban, CheckSquare,
  BarChart3, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useTrainingBatch,
  useCompleteTrainingBatch,
  useCancelTrainingBatch,
} from '@/hooks/use-training-batches';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LevelBadge } from '@/components/shared/LevelBadge';

type BatchTab = 'courses' | 'participants' | 'analytics';

/**
 * OW-27: Training Batch Detail (/enterprise/training-batches/:id)
 * Chi tiết đợt đào tạo:
 * Overview / Participants / Courses / Progress / Results.
 */
export function TrainingBatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<BatchTab>('courses');

  const { data: batch, isLoading } = useTrainingBatch(id);
  const completeMutation = useCompleteTrainingBatch();
  const cancelMutation = useCancelTrainingBatch();

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-slate-500">Đang tải chi tiết đợt đào tạo…</div>;
  }

  if (!batch) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900">Không tìm thấy đợt đào tạo</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Đợt đào tạo không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
        </p>
        <Link
          to="/enterprise/training-batches"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách đợt đào tạo
        </Link>
      </div>
    );
  }

  const courses = batch.courses || [];
  const participants = batch.participants || [];
  const completedParticipants = participants.filter((p) => p.isFullyCompleted);

  const statusVariant = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'info';
      case 'SCHEDULED':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'default';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'Đang diễn ra';
      case 'SCHEDULED':
        return 'Đã lên lịch';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return 'Bản nháp';
    }
  };

  const handleComplete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn kết thúc đợt đào tạo "${batch.name}"?`)) return;
    try {
      await completeMutation.mutateAsync(batch.id);
      toast.success('Đã hoàn thành đợt đào tạo!');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể hoàn thành đợt.');
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Nhập lý do hủy đợt đào tạo này:');
    if (reason === null) return;
    try {
      await cancelMutation.mutateAsync({ id: batch.id, reason: reason.trim() || undefined });
      toast.success('Đã hủy đợt đào tạo.');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể hủy đợt.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <Link
          to="/enterprise/training-batches"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách đợt đào tạo
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {batch.code}
              </span>
              <StatusBadge label={statusLabel(batch.status)} variant={statusVariant(batch.status)} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{batch.name}</h1>
            <p className="text-sm text-slate-500">
              Thời gian: <strong className="text-slate-700">{batch.startDate} → {batch.endDate}</strong>
              {batch.createdByName && ` · Tạo bởi ${batch.createdByName}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {batch.status === 'RUNNING' && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={completeMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm"
              >
                <CheckSquare className="size-4" />
                Kết thúc đợt
              </button>
            )}
            {batch.status !== 'COMPLETED' && batch.status !== 'CANCELLED' && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <Ban className="size-4" />
                Hủy đợt
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary-50 text-primary-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Khóa học trong đợt</div>
            <div className="text-base font-bold text-slate-900">{courses.length} khóa</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Học viên tham gia</div>
            <div className="text-base font-bold text-slate-900">{participants.length} nhân sự</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Đã xong toàn bộ</div>
            <div className="text-base font-bold text-emerald-700">
              {completedParticipants.length} / {participants.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Tiến độ đợt</div>
            <div className="text-base font-bold text-sky-700">{batch.overallProgressPercent}%</div>
          </div>
        </div>
      </div>

      {/* Description banner if available */}
      {batch.description && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-600">
          <span className="font-semibold text-slate-900 block mb-0.5">Mục tiêu đợt đào tạo:</span>
          {batch.description}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'courses'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Khóa học trong đợt ({courses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('participants')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'participants'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Danh sách học viên ({participants.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Phân tích tiến độ
          </button>
        </nav>
      </div>

      {/* TAB 1: KHÓA HỌC TRONG ĐỢT */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((crs) => (
            <div
              key={crs.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                    {crs.code}
                  </span>
                  {crs.level > 0 && <LevelBadge level={crs.level} />}
                </div>
                <h4 className="font-semibold text-sm text-slate-900 line-clamp-2">{crs.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                  {crs.durationMinutes > 0 && <span>{crs.durationMinutes} phút</span>}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  Tỷ lệ hoàn thành: <strong className="text-emerald-700">{crs.completionRate}%</strong>
                </span>
                <Link
                  to={`/enterprise/courses/${crs.id}?tab=pathway&batchId=${batch.id}&batchName=${encodeURIComponent(batch.name)}`}
                  className="text-xs font-semibold text-primary-600 hover:underline inline-flex items-center gap-1"
                >
                  Luồng đào tạo <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: DANH SÁCH HỌC VIÊN */}
      {activeTab === 'participants' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Học viên tham gia ({participants.length} nhân sự)
            </h3>
            <span className="text-xs text-slate-500">
              Đạt toàn bộ: <strong className="text-emerald-700">{completedParticipants.length}</strong> học viên
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Học viên</th>
                  <th className="px-4 py-3">Phòng ban</th>
                  <th className="px-4 py-3">Vị trí / Cấp bậc</th>
                  <th className="px-4 py-3">Khóa hoàn thành</th>
                  <th className="px-4 py-3">Tiến độ chung</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((p) => (
                  <tr key={p.employeeId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        <Link to={`/enterprise/competency-profiles/${p.employeeId}`} className="hover:underline">
                          {p.employeeName}
                        </Link>
                      </div>
                      <div className="font-mono text-xs text-slate-400">{p.employeeCode}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{p.departmentName || '-'}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>{p.positionName || '-'}</div>
                      {p.jobGrade && (
                        <span className="inline-block font-semibold text-[11px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">
                          {p.jobGrade}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium">
                      <span className={p.isFullyCompleted ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                        {p.completedCoursesCount} / {p.totalCoursesCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-28 space-y-1">
                        <div className="text-xs font-semibold text-slate-700">{p.progressPercent}%</div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              p.isFullyCompleted ? 'bg-emerald-600' : 'bg-primary-600'
                            }`}
                            style={{ width: `${p.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={p.isFullyCompleted ? 'Hoàn thành' : p.progressPercent > 0 ? 'Đang học' : 'Chưa bắt đầu'}
                        variant={p.isFullyCompleted ? 'success' : p.progressPercent > 0 ? 'info' : 'default'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PHÂN TÍCH TIẾN ĐỘ */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Phân bố tiến độ học viên</h3>
            <div className="space-y-3">
              {[
                { label: 'Đã hoàn thành 100%', count: completedParticipants.length, color: 'bg-emerald-600' },
                {
                  label: 'Đang học (1–99%)',
                  count: participants.filter((p) => p.progressPercent > 0 && !p.isFullyCompleted).length,
                  color: 'bg-sky-600',
                },
                {
                  label: 'Chưa bắt đầu (0%)',
                  count: participants.filter((p) => p.progressPercent === 0).length,
                  color: 'bg-slate-300',
                },
              ].map((item) => {
                const pct = participants.length > 0 ? Math.round((item.count / participants.length) * 100) : 0;
                return (
                  <div key={item.label} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="text-slate-500">{item.count} học viên ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Thông tin cấu hình đợt</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Mã đợt đào tạo:</span>
                <span className="font-mono font-bold text-slate-800">{batch.code}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Ngày bắt đầu:</span>
                <span className="font-medium text-slate-800">{batch.startDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Hạn hoàn thành:</span>
                <span className="font-medium text-slate-800">{batch.endDate}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Trạng thái:</span>
                <StatusBadge label={statusLabel(batch.status)} variant={statusVariant(batch.status)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
