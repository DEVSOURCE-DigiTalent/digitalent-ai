import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, Search, Layers, List, Edit3, Eye,
} from 'lucide-react';
import { PageHeader, StatusBadge, DataTable } from '@/components/shared';
import { usePlatformCurriculum, usePlatformCourses } from '@/hooks/use-platform';
import { levelLabel } from '@/lib/competency-levels';
import { CATEGORIES } from '@/services/mock/server/catalog';
import type { PlatformStandardCourseDto } from '@/services/platform.service';

type ViewMode = 'domains' | 'list';

export function PlatformCurriculumPage() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const { data: framework, isLoading: loadingFw } = usePlatformCurriculum();
  const { data: courses, isLoading: loadingCourses, isError, refetch } = usePlatformCourses();

  if (loadingFw || loadingCourses) {
    return <div className="p-8 text-center text-slate-500">Đang tải chương trình chuẩn nền tảng…</div>;
  }

  if (isError || !courses) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p className="font-medium">Không thể tải danh sách chương trình đào tạo chuẩn.</p>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
          Thử lại
        </button>
      </div>
    );
  }

  const categories = framework?.categories ?? [];
  const competencies = framework?.competencies ?? [];
  const allCourses = courses ?? [];

  // Filtered courses
  let filteredCourses = allCourses;
  if (search) {
    const q = search.toLowerCase();
    filteredCourses = filteredCourses.filter(
      (c) => c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }
  if (selectedDomain) {
    filteredCourses = filteredCourses.filter((c) => c.categoryId === selectedDomain);
  }
  if (selectedLevel) {
    filteredCourses = filteredCourses.filter((c) => c.level === Number(selectedLevel));
  }
  if (selectedStatus) {
    filteredCourses = filteredCourses.filter((c) => c.status === selectedStatus);
  }

  const tableColumns = [
    {
      key: 'code',
      header: 'Mã & Khóa học chuẩn',
      cell: (row: PlatformStandardCourseDto) => (
        <div>
          <button
            type="button"
            onClick={() => navigate(`/platform/courses/${row.id}`)}
            className="font-medium text-primary-700 hover:underline text-left block"
          >
            {row.title}
          </button>
          <span className="font-mono text-xs text-slate-500">{row.code}</span>
        </div>
      ),
    },
    {
      key: 'domain',
      header: 'Miền năng lực',
      cell: (row: PlatformStandardCourseDto) => {
        const domain = CATEGORIES.find((cat) => cat.id === row.categoryId);
        return <span className="text-xs text-slate-700 font-medium">{domain?.name || row.categoryId}</span>;
      },
    },
    {
      key: 'level',
      header: 'Trình độ & Bậc',
      cell: (row: PlatformStandardCourseDto) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
          {levelLabel(row.level)} (Bậc {row.level === 1 ? '1–2' : row.level === 2 ? '3–4' : '5–8'})
        </span>
      ),
    },
    {
      key: 'structure',
      header: 'Cấu trúc & Thời lượng',
      cell: (row: PlatformStandardCourseDto) => (
        <div className="text-xs text-slate-600">
          <p className="font-semibold text-slate-800">{row.modules} học phần</p>
          <p className="text-slate-400">{row.estimatedDurationMinutes} phút tiêu chuẩn</p>
        </div>
      ),
    },
    {
      key: 'prerequisite',
      header: 'Tiên quyết',
      cell: (row: PlatformStandardCourseDto) => (
        <span className="text-xs font-mono text-slate-500">
          {row.prerequisiteCourseId ? row.prerequisiteCourseId.replace('crs-', 'CRS-').toUpperCase() : 'Không'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row: PlatformStandardCourseDto) => (
        <StatusBadge
          label={row.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
          variant={row.status === 'PUBLISHED' ? 'success' : 'default'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      cell: (row: PlatformStandardCourseDto) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/platform/courses/${row.id}`)}
            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Eye className="size-3.5" />
            Chi tiết
          </button>
          <button
            type="button"
            onClick={() => navigate(`/platform/courses/${row.id}/edit`)}
            className="inline-flex items-center gap-1 rounded border border-primary-200 bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
          >
            <Edit3 className="size-3.5" />
            Biên tập
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Giáo trình chuẩn nền tảng"
        subtitle="Quản lý danh mục 18 khóa đào tạo chuẩn hóa, phân bổ theo 6 miền năng lực số Thông tư 02/2025/TT-BGDĐT"
      />

      {/* Top Filter and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã hoặc tên khóa học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:outline-none"
          >
            <option value="">Tất cả miền năng lực</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:outline-none"
          >
            <option value="">Tất cả trình độ</option>
            <option value="1">Cơ bản (Bậc 1–2)</option>
            <option value="2">Trung cấp (Bậc 3–4)</option>
            <option value="3">Nâng cao (Bậc 5–8)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="DRAFT">Bản nháp</option>
          </select>
        </div>

        {/* View Switcher Button Group */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="size-3.5" />
            Danh sách ({filteredCourses.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('domains')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'domains'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="size-3.5" />
            Theo 6 miền lộ trình
          </button>
        </div>
      </div>

      {/* View 1: List View */}
      {viewMode === 'list' && (
        <DataTable
          data={filteredCourses}
          columns={tableColumns}
          keyExtractor={(row) => row.id}
          emptyTitle="Không tìm thấy khóa học chuẩn phù hợp bộ lọc."
        />
      )}

      {/* View 2: Domains View */}
      {viewMode === 'domains' && (
        <div className="space-y-6">
          {categories.map((cat) => {
            const domainCompetencies = competencies.filter((c) => c.categoryId === cat.id);
            const domainCourses = filteredCourses.filter((c) => c.categoryId === cat.id);

            if (selectedDomain && cat.id !== selectedDomain) return null;

            return (
              <div key={cat.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary-700 uppercase tracking-wider">
                      {cat.code}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">{cat.name}</h2>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {domainCompetencies.length} năng lực số · {domainCourses.length} khóa học chuẩn
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Domain competencies list */}
                  <div className="space-y-3 lg:col-span-1 border-r border-slate-100 pr-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Năng lực thành phần (TT02)
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {domainCompetencies.map((comp) => (
                        <li key={comp.id} className="flex items-start gap-2">
                          <span className="font-mono text-xs font-semibold text-primary-600 shrink-0 mt-0.5">
                            {comp.code}:
                          </span>
                          <span className="text-slate-700 text-xs leading-relaxed">{comp.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: Standard courses in this domain */}
                  <div className="space-y-4 lg:col-span-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Khóa đào tạo chuẩn theo trình độ
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {domainCourses.map((course) => (
                        <div
                          key={course.id}
                          className="rounded-lg border border-slate-200 p-4 bg-white hover:border-primary-400 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="rounded bg-primary-50 px-2 py-0.5 font-mono text-[11px] font-bold text-primary-700">
                                {course.code}
                              </span>
                              <span className="text-xs font-semibold text-slate-500">
                                {levelLabel(course.level)}
                              </span>
                            </div>
                            <h4 className="font-semibold text-slate-900 text-sm mb-2 line-clamp-2">
                              {course.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                              <span className="flex items-center gap-1">
                                <BookOpen className="size-3.5" /> {course.modules} học phần
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="size-3.5" /> {course.estimatedDurationMinutes}p
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <button
                              type="button"
                              onClick={() => navigate(`/platform/courses/${course.id}`)}
                              className="font-medium text-primary-700 hover:underline"
                            >
                              Chi tiết →
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/platform/courses/${course.id}/edit`)}
                              className="text-slate-500 hover:text-slate-900"
                            >
                              <Edit3 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
