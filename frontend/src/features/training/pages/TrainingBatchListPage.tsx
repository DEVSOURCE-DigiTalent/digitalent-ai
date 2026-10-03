import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, Plus, Search, Calendar, Eye
} from 'lucide-react';
import { useTrainingBatches, useTrainingBatchSummary } from '@/hooks/use-training-batches';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { TrainingBatchStatus } from '@/services/mock/server/types';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'RUNNING', label: 'Đang diễn ra' },
  { value: 'SCHEDULED', label: 'Đã lên lịch' },
  { value: 'COMPLETED', label: 'Đã hoàn thành' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

/**
 * OW-25: Training Batch List (/enterprise/training-batches)
 * Quản lý các đợt đào tạo nội bộ / tập trung của doanh nghiệp:
 * Draft / Scheduled / Running / Completed / Cancelled.
 */
export function TrainingBatchListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: summary } = useTrainingBatchSummary();
  const { data: batchesData, isLoading } = useTrainingBatches({
    search: search.trim() || undefined,
    status: statusFilter ? (statusFilter as TrainingBatchStatus) : undefined,
  });

  const batches = batchesData?.items || [];

  const statusVariant = (status: TrainingBatchStatus) => {
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

  const statusLabel = (status: TrainingBatchStatus) => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Đợt đào tạo (Training Batches)"
          subtitle="Tổ chức các đợt bồi dưỡng năng lực tập trung cho các phòng ban, vị trí công việc hoặc nhóm Cấp bậc G1–G3. Tự động giao khóa học và giám sát tiến độ hoàn thành."
        />
        <Link
          to="/enterprise/training-batches/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-colors"
        >
          <Plus className="size-4" />
          Tạo đợt đào tạo mới
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Tổng số đợt</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{summary?.total ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-sky-100 bg-sky-50/20 p-3.5 shadow-sm">
          <div className="text-xs text-sky-700 font-medium">Đang diễn ra</div>
          <div className="text-xl font-bold text-sky-800 mt-1">{summary?.running ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 bg-amber-50/20 p-3.5 shadow-sm">
          <div className="text-xs text-amber-700 font-medium">Đã lên lịch</div>
          <div className="text-xl font-bold text-amber-800 mt-1">{summary?.scheduled ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 bg-emerald-50/20 p-3.5 shadow-sm">
          <div className="text-xs text-emerald-700 font-medium">Đã hoàn thành</div>
          <div className="text-xl font-bold text-emerald-800 mt-1">{summary?.completed ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Tổng học viên</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{summary?.totalParticipants ?? 0}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Tìm theo tên đợt hoặc mã đợt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="w-52">
          <select
            aria-label="Lọc trạng thái đợt đào tạo"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng danh sách đợt đào tạo */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-sm text-slate-500">Đang tải danh sách đợt đào tạo…</div>
        ) : batches.length === 0 ? (
          <div className="py-16 text-center">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">Chưa có đợt đào tạo nào</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Tạo đợt đào tạo đầu tiên để chuẩn hóa lộ trình phát triển kỹ năng cho đội ngũ nhân sự.
            </p>
            <Link
              to="/enterprise/training-batches/new"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm"
            >
              <Plus className="size-4" /> Tạo đợt đào tạo ngay
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Mã / Tên đợt đào tạo</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Quy mô</th>
                  <th className="px-4 py-3">Tiến độ đợt</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 hover:text-primary-600">
                        <Link to={`/enterprise/training-batches/${batch.id}`}>{batch.name}</Link>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {batch.code}
                        </span>
                        {batch.createdByName && (
                          <span className="text-[11px] text-slate-400">Tạo bởi: {batch.createdByName}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{batch.startDate} → {batch.endDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      <div><strong className="text-slate-800">{batch.coursesCount}</strong> khóa học</div>
                      <div className="text-slate-400 mt-0.5">
                        <strong className="text-slate-700">{batch.participantsCount}</strong> học viên
                        {batch.completedParticipantsCount > 0 && ` (${batch.completedParticipantsCount} xong)`}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="w-32 space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-slate-600">{batch.averageProgressPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              batch.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-primary-600'
                            }`}
                            style={{ width: `${batch.averageProgressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge label={statusLabel(batch.status)} variant={statusVariant(batch.status)} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/enterprise/training-batches/${batch.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800 px-2.5 py-1 rounded bg-primary-50 hover:bg-primary-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
