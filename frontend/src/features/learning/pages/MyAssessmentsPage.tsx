import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, CheckCircle2, RotateCcw, ArrowRight, PlayCircle, History, AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';

type AssessmentStatusFilter = 'ALL' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'RETAKE';

interface AssessmentItem {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  level: number;
  timeLimitMinutes: number;
  passPercentage: number;
  questionsCount: number;
  latestScore?: number;
  passed?: boolean;
  status: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'RETAKE';
  attemptId?: string;
}

export function MyAssessmentsPage() {
  const [filter, setFilter] = useState<AssessmentStatusFilter>('ALL');

  // Seeded assessment catalog for the employee
  const assessments: AssessmentItem[] = [
    {
      id: 'asm-A2-F',
      courseId: 'crs-A2-F',
      courseCode: 'A2-F',
      title: 'Đánh giá kỹ năng giao tiếp số công sở',
      level: 1,
      timeLimitMinutes: 30,
      passPercentage: 80,
      questionsCount: 10,
      latestScore: 80,
      passed: true,
      status: 'COMPLETED',
      attemptId: 'att-005',
    },
    {
      id: 'asm-A4-I',
      courseId: 'crs-A4-I',
      courseCode: 'A4-I',
      title: 'Đánh giá an toàn thông tin & bảo vệ dữ liệu',
      level: 2,
      timeLimitMinutes: 45,
      passPercentage: 80,
      questionsCount: 15,
      status: 'AVAILABLE',
    },
    {
      id: 'asm-A1-I',
      courseId: 'crs-A1-I',
      courseCode: 'A1-I',
      title: 'Đánh giá chiến lược tìm kiếm và quản lý dữ liệu',
      level: 2,
      timeLimitMinutes: 40,
      passPercentage: 75,
      questionsCount: 12,
      latestScore: 60,
      passed: false,
      status: 'RETAKE',
    },
    {
      id: 'asm-M6-I',
      courseId: 'crs-M6-I',
      courseCode: 'M6-I',
      title: 'Đánh giá ứng dụng AI nâng cao hiệu suất',
      level: 2,
      timeLimitMinutes: 45,
      passPercentage: 80,
      questionsCount: 15,
      status: 'IN_PROGRESS',
    },
  ];

  const filtered = assessments.filter((a) => {
    if (filter === 'ALL') return true;
    return a.status === filter;
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Danh sách bài đánh giá năng lực"
          subtitle="Các bài kiểm tra trắc nghiệm và đánh giá theo Khung chuẩn năng lực số."
        />
        <Link
          to="/enterprise/me/assessments/history"
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition shrink-0"
        >
          <History className="size-4 text-slate-500" />
          <span>Lịch sử các lần làm bài</span>
        </Link>
      </div>

      {/* Filter Tabs: Có thể làm / Đang làm / Đã xong / Được làm lại */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'ALL', label: 'Tất cả bài đánh giá' },
          { id: 'AVAILABLE', label: 'Có thể làm' },
          { id: 'IN_PROGRESS', label: 'Đang làm' },
          { id: 'COMPLETED', label: 'Đã xong' },
          { id: 'RETAKE', label: 'Được làm lại' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as AssessmentStatusFilter)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filter === tab.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notice box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-2.5">
        <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Lưu ý quan trọng theo quy chuẩn v2.1:</strong> Kết quả đạt điểm bài đánh giá là điều kiện cần ghi nhận hoàn thành bài thi trắc nghiệm. Năng lực chỉ chính thức được xác nhận khi có minh chứng từ nhiệm vụ thực tế được Quản lý duyệt.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => {
          const isDone = item.status === 'COMPLETED';
          const isRetake = item.status === 'RETAKE';
          const isInProgress = item.status === 'IN_PROGRESS';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {item.courseCode}
                  </span>
                  <LevelBadge level={item.level} />
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">{item.title}</h3>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {item.timeLimitMinutes} phút
                  </span>
                  <span>Điểm đạt: {item.passPercentage}%</span>
                  <span>{item.questionsCount} câu hỏi</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="size-3.5" /> Đạt ({item.latestScore}%)
                    </span>
                  ) : isRetake ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      Chưa đạt ({item.latestScore}%) · Cho phép thi lại
                    </span>
                  ) : isInProgress ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      Đang làm dở
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Chưa làm bài</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isDone ? (
                    <Link
                      to={`/enterprise/me/assessments/${item.id}/result`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                      <span>Xem kết quả</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  ) : isRetake ? (
                    <Link
                      to={`/enterprise/me/assessments/${item.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-xl shadow-xs transition"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Làm lại bài</span>
                    </Link>
                  ) : (
                    <Link
                      to={`/enterprise/me/assessments/${item.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-xs transition"
                    >
                      <PlayCircle className="size-3.5" />
                      <span>{isInProgress ? 'Tiếp tục làm' : 'Vào thi'}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
