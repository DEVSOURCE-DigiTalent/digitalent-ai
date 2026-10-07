import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, ArrowRight, ExternalLink, Paperclip, ClipboardCheck, BadgeCheck, AlertCircle } from 'lucide-react';
import { EmptyState, PageHeader, StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useMyEvidenceTimeline } from '@/hooks/use-me';
import type { EvidenceStatus } from '@/services/me.service';
import { EVIDENCE_SOURCE_LABELS, submissionStatus } from '@/lib/me-labels';
import { formatDate } from '@/lib/utils';
import { MyCompetencyTabs } from '../components/MyCompetencyTabs';

type Filter = 'ALL' | EvidenceStatus;

/** EM-04: Dòng thời gian minh chứng — bài nộp nhiệm vụ thực tế và minh chứng năng lực đã ghi nhận. */
export function EvidencePortfolioPage() {
  const { data, isLoading, isError, refetch } = useMyEvidenceTimeline();
  const [filter, setFilter] = useState<Filter>('ALL');

  const items = data?.items ?? [];
  const filtered = filter === 'ALL' ? items : items.filter((item) => item.status === filter);
  const counts = data?.counts;

  const tabs: { id: Filter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'Tất cả', count: counts?.total },
    { id: 'APPROVED', label: 'Đã công nhận', count: counts?.approved },
    { id: 'PENDING', label: 'Đang chờ duyệt', count: counts?.pending },
    { id: 'NEEDS_REVISION', label: 'Cần chỉnh sửa', count: counts?.needsRevision },
    { id: 'REJECTED', label: 'Không đạt', count: counts?.rejected },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Dòng thời gian minh chứng"
          subtitle="Bài nộp nhiệm vụ thực tế, phản hồi đánh giá và các minh chứng năng lực đã được ghi nhận của bạn."
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

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filter === tab.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
          >
            {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-label="Đang tải minh chứng">
          <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
          <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={<AlertCircle className="size-12 text-slate-300 mx-auto" />}
          title="Không tải được minh chứng"
          description="Có lỗi khi tải dữ liệu. Vui lòng thử lại."
          action={
            <button type="button" onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Thử lại
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4 max-w-md mx-auto">
          <FolderOpen className="size-16 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-lg">Chưa có minh chứng trong mục này</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Hoàn thành nhiệm vụ thực tế và nộp minh chứng để được quản lý đánh giá và ghi nhận năng lực.
          </p>
        </div>
      ) : (
        <ol className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {filtered.map((item) => {
            const status = submissionStatus(item.status);
            const isSubmission = item.kind === 'TASK_SUBMISSION';
            return (
              <li key={`${item.kind}-${item.id}`} className="relative">
                <span className={`absolute -left-6 top-5 size-4 rounded-full ring-4 ring-white ${
                  item.status === 'APPROVED' ? 'bg-emerald-500' : item.status === 'REJECTED' ? 'bg-rose-500' : item.status === 'NEEDS_REVISION' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 hover:border-blue-300 transition shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {isSubmission ? <ClipboardCheck className="size-4 text-blue-600" /> : <BadgeCheck className="size-4 text-emerald-600" />}
                        <span className="font-semibold">
                          {isSubmission ? `Bài nộp nhiệm vụ · lần ${item.versionNo}` : EVIDENCE_SOURCE_LABELS[item.sourceType ?? ''] ?? 'Minh chứng năng lực'}
                        </span>
                        <span>· {formatDate(item.occurredAt)}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{item.title}</h3>
                    </div>
                    <StatusBadge
                      variant={status.variant}
                      label={item.score != null && item.status === 'APPROVED' ? `${status.label} (${item.score}đ)` : status.label}
                    />
                  </div>

                  {item.description && <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line">{item.description}</p>}

                  <div className="flex flex-wrap gap-1.5">
                    {item.competencies.map((c) => (
                      <span key={c.competencyId} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                        <span className="font-mono font-bold">{c.code}</span> {c.name}
                        {!isSubmission && item.confirmedLevel ? <LevelBadge level={item.confirmedLevel} className="ml-1" /> : null}
                      </span>
                    ))}
                  </div>

                  {item.evaluation?.feedback && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                      <span className="font-semibold text-slate-900">Nhận xét của {item.evaluation.reviewerName ?? 'người đánh giá'}:</span>
                      <p className="line-clamp-3 italic">"{item.evaluation.feedback}"</p>
                    </div>
                  )}
                  {!isSubmission && item.confirmedByName && (
                    <p className="text-xs text-slate-500">Xác nhận bởi {item.confirmedByName}</p>
                  )}

                  {isSubmission && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {item.links.length > 0 && (
                          <span className="flex items-center gap-1"><ExternalLink className="size-3" /> {item.links.length} liên kết</span>
                        )}
                        {item.files.length > 0 && (
                          <span className="flex items-center gap-1"><Paperclip className="size-3" /> {item.files.length} tệp</span>
                        )}
                      </div>
                      {item.assignmentId && (
                        <Link
                          to={`/enterprise/me/tasks/${item.assignmentId}/feedback`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                        >
                          <span>Xem chi tiết & phản hồi</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
