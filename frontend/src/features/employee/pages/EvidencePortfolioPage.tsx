import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen, ArrowRight, ExternalLink,
} from 'lucide-react';
import { PageHeader, StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useMyEvidence } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';

import { MyCompetencyTabs } from '../components/MyCompetencyTabs';

export function EvidencePortfolioPage() {
  const { data, isLoading } = useMyEvidence();
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING_REVIEW' | 'REVISION_REQUESTED'>('ALL');

  const items = data?.items ?? [];
  const filtered = items.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Hồ sơ minh chứng năng lực (Portfolio)"
          subtitle="Dòng thời gian minh chứng thực tế, báo cáo dự án đã được cấp quản lý thẩm định và ghi nhận đạt chuẩn số."
        />
        <Link
          to="/enterprise/me/tasks"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition shrink-0"
        >
          <span>Xem nhiệm vụ thực tế</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <MyCompetencyTabs />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
            filter === 'ALL'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả minh chứng ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('APPROVED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
            filter === 'APPROVED'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đã công nhận ({items.filter((i) => i.status === 'APPROVED').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('PENDING_REVIEW')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
            filter === 'PENDING_REVIEW'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đang chờ duyệt ({items.filter((i) => i.status === 'PENDING_REVIEW').length})
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4 max-w-md mx-auto">
          <FolderOpen className="size-16 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-lg">Chưa có minh chứng trong mục này</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Hãy hoàn thành các bài thực hành và nộp báo cáo kết quả để làm giàu hồ sơ năng lực số của bạn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => {
            const isApproved = item.status === 'APPROVED';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-5 hover:border-blue-400 transition shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <LevelBadge level={item.targetLevel} />
                      <span className="text-xs text-slate-500 font-medium">
                        Nộp ngày {formatDate(item.submittedAt)}
                      </span>
                    </div>

                    <StatusBadge
                      variant={
                        isApproved
                          ? 'success'
                          : item.status === 'REVISION_REQUESTED'
                          ? 'warning'
                          : item.status === 'REJECTED'
                          ? 'danger'
                          : 'info'
                      }
                      label={
                        isApproved
                          ? `Đã duyệt (${item.evaluation?.score ?? 0}đ)`
                          : item.status === 'REVISION_REQUESTED'
                          ? 'Cần chỉnh sửa'
                          : item.status === 'REJECTED'
                          ? 'Không đạt'
                          : 'Chờ chấm'
                      }
                    />
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {item.taskTitle}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {(item.competencyIds ?? []).map((code) => (
                      <span
                        key={code}
                        className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-bold"
                      >
                        TT02-{code.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  {item.evaluation?.feedback && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                      <span className="font-semibold text-slate-900">
                        Nhận xét của {item.evaluation.evaluatedBy}:
                      </span>
                      <p className="line-clamp-2 italic">"{item.evaluation.feedback}"</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    {item.linkUrls.length > 0 && (
                      <span className="flex items-center gap-1">
                        <ExternalLink className="size-3" />
                        {item.linkUrls.length} tài liệu đính kèm
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/enterprise/me/tasks/${item.taskId}/feedback`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    <span>Xem chi tiết minh chứng</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
