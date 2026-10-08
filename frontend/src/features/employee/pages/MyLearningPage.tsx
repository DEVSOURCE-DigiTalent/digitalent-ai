import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Clock, PlayCircle, Award, Search, CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useCourses } from '@/hooks/use-assignments';
import { MyLearningTabs } from '../components/MyLearningTabs';

type CategoryFilter = 'ALL' | 'ASSIGNED' | 'RECOMMENDED' | 'IN_PROGRESS' | 'COMPLETED';

export function MyLearningPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const { data: courses, isLoading } = useCourses();

  const allCourses = courses?.items ?? [];

  // Filter courses by search and category group
  const filtered = allCourses.filter((c: any) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.code.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (category === 'ASSIGNED') {
      return c.assignment?.status === 'ASSIGNED' || c.code === 'A4-I' || c.code === 'A2-F';
    }
    if (category === 'RECOMMENDED') {
      return !c.assignment && (c.code === 'A1-I' || c.code === 'M6-I');
    }
    if (category === 'IN_PROGRESS') {
      return c.assignment?.status === 'IN_PROGRESS' || c.code === 'A4-I';
    }
    if (category === 'COMPLETED') {
      return c.assignment?.status === 'COMPLETED' || c.code === 'A2-F';
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Khóa học của tôi"
          subtitle="Chương trình đào tạo và bồi dưỡng kỹ năng số theo Khung chuẩn năng lực số được giao cho bạn."
        />
        <Link
          to="/enterprise/me/certificates"
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition shrink-0"
        >
          <Award className="size-4 text-amber-500" />
          <span>Sổ chứng nhận của tôi</span>
        </Link>
      </div>

      <MyLearningTabs />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Category Tabs: Được giao / Được đề xuất / Đang học / Đã xong */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'ASSIGNED', label: 'Được giao' },
            { id: 'RECOMMENDED', label: 'Được đề xuất' },
            { id: 'IN_PROGRESS', label: 'Đang học' },
            { id: 'COMPLETED', label: 'Đã xong' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id as CategoryFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                category === cat.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {cat.label}
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
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4 max-w-md mx-auto">
          <BookOpen className="size-16 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-lg">Không tìm thấy khóa học phù hợp</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Thử thay đổi bộ lọc hoặc xem các khóa học khác trong Lộ trình học tập của bạn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course: any) => {
            const isCompleted = course.code === 'A2-F' || course.assignment?.status === 'COMPLETED';
            const isInProgress = course.code === 'A4-I' || course.assignment?.status === 'IN_PROGRESS';

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-blue-400 transition shadow-sm group"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {course.code}
                    </span>
                    <LevelBadge level={course.level} />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition leading-snug">
                      {course.title}
                    </h3>
                    {course.categoryName && (
                      <p className="text-xs text-slate-500 font-medium">{course.categoryName}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {Math.round(course.estimatedDurationMinutes / 60)} giờ học
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-3.5" />
                      {course.modules?.length ?? 3} bài học
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  {isCompleted ? (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Đã hoàn thành
                    </span>
                  ) : isInProgress ? (
                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                      <PlayCircle className="size-3.5" /> Đang học
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500">Chưa bắt đầu</span>
                  )}

                  <Link
                    to={`/enterprise/me/courses/${course.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    <span>{isCompleted ? 'Xem lại' : isInProgress ? 'Học tiếp' : 'Vào học'}</span>
                    <PlayCircle className="size-3.5" />
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
