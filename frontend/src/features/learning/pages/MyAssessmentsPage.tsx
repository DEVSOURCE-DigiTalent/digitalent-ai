import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, RotateCcw, ArrowRight, PlayCircle, History, AlertCircle, Lock, FileQuestion } from 'lucide-react';
import { EmptyState, PageHeader, StatusBadge } from '@/components/shared';
import { useMyAssessments } from '@/hooks/use-me';
import type { MyAssessmentCard, MyAssessmentStatus } from '@/services/me.service';
import { ASSESSMENT_TYPE_LABELS, assessmentStatus } from '@/lib/me-labels';

type Filter = 'ALL' | MyAssessmentStatus;

function ActionButton({ item }: { item: MyAssessmentCard }) {
  if (item.status === 'PASSED' && item.latestAttemptId) {
    return (
      <Link
        to={`/enterprise/me/assessments/${item.id}/result?attempt=${item.latestAttemptId}`}
        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
      >
        <span>Xem kết quả</span>
        <ArrowRight className="size-3.5" />
      </Link>
    );
  }

  if (item.status === 'LOCKED' || item.status === 'NO_ATTEMPTS_LEFT') {
    return (
      <Link to={`/enterprise/me/assessments/${item.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition">
        <Lock className="size-3.5" />
        <span>Xem chi tiết</span>
      </Link>
    );
  }

  const isRetake = item.status === 'RETAKE';
  const isInProgress = item.status === 'IN_PROGRESS';
  return (
    <Link
      to={`/enterprise/me/assessments/${item.id}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white font-medium text-xs rounded-xl shadow-xs transition ${
        isRetake ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
      }`}
    >
      {isRetake ? <RotateCcw className="size-3.5" /> : <PlayCircle className="size-3.5" />}
      <span>{isInProgress ? 'Tiếp tục làm' : isRetake ? 'Làm lại bài' : 'Vào làm bài'}</span>
    </Link>
  );
}

/** EM-09: Danh sách bài đánh giá — bài của các khóa đang ghi danh và trạng thái làm bài. */
export function MyAssessmentsPage() {
  const [filter, setFilter] = useState<Filter>('ALL');
  const { data, isLoading, isError, refetch } = useMyAssessments();

  const items = data?.items ?? [];
  const filtered = filter === 'ALL' ? items : items.filter((a) => a.status === filter || (filter === 'LOCKED' && a.status === 'NO_ATTEMPTS_LEFT'));
  const summary = data?.summary;

  const tabs: { id: Filter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'Tất cả bài đánh giá', count: summary?.total },
    { id: 'AVAILABLE', label: 'Có thể làm', count: summary?.available },
    { id: 'IN_PROGRESS', label: 'Đang làm', count: summary?.inProgress },
    { id: 'RETAKE', label: 'Được làm lại', count: summary?.retake },
    { id: 'PASSED', label: 'Đã đạt', count: summary?.passed },
    { id: 'LOCKED', label: 'Chưa mở / hết lượt', count: summary?.locked },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Danh sách bài đánh giá năng lực"
          subtitle="Bài kiểm tra và bài đánh giá cuối khóa của các khóa học bạn đang tham gia."
        />
        <Link
          to="/enterprise/me/assessments/history"
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition shrink-0"
        >
          <History className="size-4 text-slate-500" />
          <span>Lịch sử các lần làm bài</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filter === tab.id ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs' : 'text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
          >
            {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
          </button>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-2.5">
        <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Lưu ý:</strong> Đạt bài đánh giá cuối khóa giúp hoàn thành khóa học và nhận chứng chỉ. Cấp độ năng lực chỉ được
          xác nhận chính thức khi có minh chứng từ nhiệm vụ thực tế được quản lý duyệt.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Đang tải bài đánh giá">
          <div className="h-48 bg-slate-100 animate-pulse rounded-2xl" />
          <div className="h-48 bg-slate-100 animate-pulse rounded-2xl" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={<AlertCircle className="size-12 text-slate-300 mx-auto" />}
          title="Không tải được bài đánh giá"
          description="Có lỗi khi tải dữ liệu. Vui lòng thử lại."
          action={
            <button type="button" onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Thử lại
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileQuestion className="size-12 text-slate-300 mx-auto" />}
          title={items.length ? 'Không có bài đánh giá trong mục này' : 'Chưa có bài đánh giá nào'}
          description="Bài đánh giá xuất hiện khi bạn tham gia khóa học có bài kiểm tra."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => {
            const status = assessmentStatus(item.status);
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{item.courseCode}</span>
                    <span className="text-xs font-semibold text-slate-500">{ASSESSMENT_TYPE_LABELS[item.assessmentType] ?? item.assessmentType}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">{item.title}</h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1"><Clock className="size-3.5" />{item.timeLimitMinutes ? `${item.timeLimitMinutes} phút` : 'Không giới hạn'}</span>
                    <span>Điểm đạt: {item.passingScore}%</span>
                    <span>{item.questionCount} câu hỏi</span>
                    <span>{item.attemptsRemaining == null ? 'Không giới hạn lượt' : `Còn ${item.attemptsRemaining}/${item.maxAttempts} lượt`}</span>
                  </div>
                  {item.lockedReason && <p className="text-xs text-slate-500 flex items-start gap-1.5"><Lock className="size-3.5 mt-0.5 shrink-0" /> {item.lockedReason}</p>}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge variant={status.variant} label={status.label} />
                    {item.bestScore != null && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        {item.passed && <CheckCircle2 className="size-3.5 text-emerald-600" />}
                        Điểm cao nhất {item.bestScore}%
                      </span>
                    )}
                  </div>
                  <ActionButton item={item} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
