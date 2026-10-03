import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Search, Clock, Layers,
  Users, UserCheck, ArrowRight, CheckCircle2
} from 'lucide-react';
import { useCourses } from '@/hooks/use-assignments';
import { useCompetencyCategories } from '@/hooks/use-competencies';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

/**
 * OW-23: Standard Course Catalog (/enterprise/courses hoặc /enterprise/catalog)
 * Duyệt, tìm kiếm, xem trước và phân công các khóa học chuẩn của nền tảng theo Thông tư 02/2025.
 * Owner xem nội dung nhưng không sửa lesson chuẩn.
 */
export function StandardCourseCatalogPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  const { data: categories = [] } = useCompetencyCategories();
  const { data: coursesData, isLoading } = useCourses({
    search: search.trim() || undefined,
    categoryId: selectedCategory || undefined,
    level: selectedLevel ? Number(selectedLevel) : undefined,
  });

  const courses = coursesData?.items || [];

  const stats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.status === 'PUBLISHED').length;
    const totalAssigned = courses.reduce((sum, c) => sum + (c.assignedCount || 0), 0);
    return { total, published, totalAssigned };
  }, [courses]);

  const levelBadge = (level: number) => {
    switch (level) {
      case 1:
        return <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200">Cơ bản · Bậc 1–2</span>;
      case 2:
        return <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">Trung cấp · Bậc 3–4</span>;
      case 3:
        return <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 border border-violet-200">Nâng cao · Bậc 5–6</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">Mức {level}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Chương trình chuẩn (Standard Course Catalog)"
          subtitle="Danh mục các khóa học số chuẩn hóa theo 6 miền năng lực Thông tư 02/2025/TT-BGDĐT. Dùng để bồi dưỡng nâng cấp năng lực cho nhân viên và đợt đào tạo doanh nghiệp."
        />
        <div className="flex items-center gap-2">
          <Link
            to="/enterprise/training-batches/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm"
          >
            <Layers className="size-4 text-primary-600" />
            Tạo đợt đào tạo
          </Link>
          <Link
            to="/enterprise/assignments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-colors"
          >
            <UserCheck className="size-4" />
            Giao khóa học
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-xs text-slate-500 font-medium">Tổng số khóa học chuẩn</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.published}</div>
              <div className="text-xs text-slate-500 font-medium">Khóa sẵn sàng giảng dạy</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalAssigned}</div>
              <div className="text-xs text-slate-500 font-medium">Lượt giao khóa trong tổ chức</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Tìm theo tên khóa học hoặc mã (ví dụ: A1-F, A4-I, AI...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-56">
            <select
              aria-label="Lọc theo miền năng lực"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả 6 miền năng lực</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-44">
            <select
              aria-label="Lọc theo trình độ"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Mọi trình độ</option>
              <option value="1">Cơ bản (Bậc 1–2)</option>
              <option value="2">Trung cấp (Bậc 3–4)</option>
              <option value="3">Nâng cao (Bậc 5–6)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Khóa học */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-slate-500">Đang tải danh mục khóa học chuẩn…</div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">Không tìm thấy khóa học nào</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Không có khóa học chuẩn nào khớp với điều kiện tìm kiếm và bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded">
                    {course.code}
                  </span>
                  {levelBadge(course.level)}
                </div>
                <StatusBadge
                  label={course.status === 'PUBLISHED' ? 'Chuẩn' : 'Bản nháp'}
                  variant={course.status === 'PUBLISHED' ? 'success' : 'default'}
                />
              </div>

              <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                <Link to={`/enterprise/courses/${course.id}`}>{course.title}</Link>
              </h3>

              <div className="mt-2 text-xs text-slate-500 font-medium">
                {course.categoryName || 'Miền năng lực Thông tư 02'}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{course.estimatedDurationMinutes} phút</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>{Array.isArray(course.modules) ? course.modules.length : (course.modules || 3)} chương học</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{course.assignedCount} đã giao</span>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between gap-2">
                <Link
                  to={`/enterprise/courses/${course.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-primary-600 transition-colors"
                >
                  Chi tiết khóa <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => navigate(`/enterprise/assignments?courseId=${course.id}`)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Giao khóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
