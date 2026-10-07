import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, PlayCircle, Award, Search, CheckCircle2, AlertCircle, Route } from 'lucide-react';
import { EmptyState, PageHeader, StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useMyCourses } from '@/hooks/use-me';
import type { MyCourseCard } from '@/services/me.service';
import { enrollmentStatus, formatMinutes } from '@/lib/me-labels';
import { formatDate } from '@/lib/utils';
import { MyLearningTabs } from '../components/MyLearningTabs';

type CategoryFilter = 'ALL' | 'ASSIGNED' | 'SELF_ENROLLED' | 'ACTIVE' | 'NOT_STARTED' | 'COMPLETED';

const matches = (course: MyCourseCard, filter: CategoryFilter) => {
  switch (filter) {
    case 'ASSIGNED':
    case 'SELF_ENROLLED':
      return course.source === filter;
    case 'ACTIVE':
      return course.status === 'IN_PROGRESS' || course.status === 'READY_FOR_ASSESSMENT';
    case 'NOT_STARTED':
    case 'COMPLETED':
      return course.status === filter;
    default:
      return true;
  }
};

/** EM-06: Khóa học của tôi — khóa được giao / tự ghi danh và tiến độ học. */
export function MyLearningPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const { data, isLoading, isError, refetch } = useMyCourses();

  const keyword = search.trim().toLowerCase();
  const filtered = (data?.items ?? []).filter((course) =>
    matches(course, category)
    && (!keyword || course.courseTitle.toLowerCase().includes(keyword) || course.courseCode.toLowerCase().includes(keyword)));

  const summary = data?.summary;
  const tabs: { id: CategoryFilter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'Tất cả', count: summary?.total },
    { id: 'ACTIVE', label: 'Đang học', count: summary ? summary.inProgress + summary.readyForAssessment : undefined },
    { id: 'NOT_STARTED', label: 'Chưa bắt đầu', count: summary?.notStarted },
    { id: 'COMPLETED', label: 'Đã xong', count: summary?.completed },
    { id: 'ASSIGNED', label: 'Được giao' },
    { id: 'SELF_ENROLLED', label: 'Tự ghi danh' },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Khóa học của tôi"
          subtitle="Chương trình đào tạo và bồi dưỡng kỹ năng số bạn đang tham gia."
        />
        <Link
          to="/enterprise/me/achievements"
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition shrink-0"
        >
          <Award className="size-4 text-amber-500" />
          <span>Thành tựu & chứng nhận</span>
        </Link>
      </div>

      <MyLearningTabs />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                category === tab.id ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs' : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mã khóa…"
            aria-label="Tìm khóa học"
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Đang tải khóa học">
          {[0, 1, 2].map((i) => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<AlertCircle className="size-12 text-slate-300 mx-auto" />}
          title="Không tải được khóa học"
          description="Có lỗi khi tải dữ liệu. Vui lòng thử lại."
          action={
            <button type="button" onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Thử lại
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4 max-w-md mx-auto">
          <BookOpen className="size-16 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-lg">
            {data?.items.length ? 'Không có khóa học phù hợp bộ lọc' : 'Bạn chưa tham gia khóa học nào'}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">Xem lộ trình để chọn khóa học phù hợp với khoảng trống năng lực của bạn.</p>
          <Link to="/enterprise/me/learning-path" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Route className="size-4" /> Xem lộ trình học tập
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => {
            const status = enrollmentStatus(course.status);
            const isCompleted = course.status === 'COMPLETED';
            const isActive = course.status === 'IN_PROGRESS' || course.status === 'READY_FOR_ASSESSMENT';
            return (
              <div key={course.enrollmentId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-blue-400 transition shadow-sm group">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{course.courseCode}</span>
                    <LevelBadge level={course.level} />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition leading-snug">{course.courseTitle}</h3>
                    {course.categoryName && <p className="text-xs text-slate-500 font-medium">{course.categoryName}</p>}
                    <p className="text-xs text-slate-500">
                      {course.source === 'ASSIGNED' ? `Giao bởi ${course.assignedByName ?? 'quản lý'}` : 'Tự ghi danh'}
                      {course.dueDate && (
                        <span className={course.isOverdue ? 'text-rose-600 font-semibold' : ''}> · Hạn {formatDate(course.dueDate)}</span>
                      )}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{course.completedLessons}/{course.totalLessons} bài học</span>
                      <span className="font-semibold">{course.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${course.progressPercent}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1"><Clock className="size-3.5" /> {formatMinutes(course.estimatedDurationMinutes)}</span>
                    {course.certificateCode && (
                      <span className="flex items-center gap-1 text-emerald-700"><Award className="size-3.5" /> {course.certificateCode}</span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <StatusBadge variant={status.variant} label={status.label} />
                  <Link
                    to={`/enterprise/me/courses/${course.courseId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    {isCompleted ? <CheckCircle2 className="size-3.5" /> : <PlayCircle className="size-3.5" />}
                    <span>{isCompleted ? 'Xem lại' : isActive ? 'Học tiếp' : 'Vào học'}</span>
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
