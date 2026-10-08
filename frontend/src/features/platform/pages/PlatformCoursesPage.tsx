import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit3 } from 'lucide-react';
import { PageHeader, StatusBadge, DataTable } from '@/components/shared';
import { usePlatformCourses } from '@/hooks/use-platform';
import { levelLabel } from '@/lib/competency-levels';
import { CATEGORIES } from '@/services/mock/server/catalog';
import type { PlatformStandardCourseDto } from '@/services/platform.service';

export function PlatformCoursesPage() {
  const navigate = useNavigate();
  const { data: courses, isLoading, isError, refetch } = usePlatformCourses();

  const [search, setSearch] = useState('');
  const [domainId, setDomainId] = useState('');
  const [level, setLevel] = useState<string>('');

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải danh mục khóa học chuẩn…</div>;
  }

  if (isError || !courses) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p className="font-medium">Không thể tải danh sách khóa học chuẩn.</p>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
          Thử lại
        </button>
      </div>
    );
  }

  let filtered = courses;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((c) => c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }
  if (domainId) {
    filtered = filtered.filter((c) => c.categoryId === domainId);
  }
  if (level) {
    filtered = filtered.filter((c) => c.level === Number(level));
  }

  const columns = [
    {
      key: 'course',
      header: 'Khóa học',
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
        return <span className="text-xs text-slate-700">{domain?.name || row.categoryId}</span>;
      },
    },
    {
      key: 'level',
      header: 'Trình độ & Bậc năng lực',
      cell: (row: PlatformStandardCourseDto) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
          {levelLabel(row.level)} (Bậc {row.level === 1 ? '1–2' : row.level === 2 ? '3–4' : '5–8'})
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Thời lượng',
      cell: (row: PlatformStandardCourseDto) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.modules} học phần · {row.estimatedDurationMinutes} phút
        </span>
      ),
    },
    {
      key: 'prerequisite',
      header: 'Tiên quyết',
      cell: (row: PlatformStandardCourseDto) => (
        <span className="text-xs text-slate-500 font-mono">
          {row.prerequisiteCourseId ? row.prerequisiteCourseId.replace('crs-', '') : 'Không'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row: PlatformStandardCourseDto) => (
        <StatusBadge
          label={row.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
          variant={row.status === 'PUBLISHED' ? 'success' : 'warning'}
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
            Chi tiết
          </button>
          <button
            type="button"
            onClick={() => navigate(`/platform/courses/${row.id}/edit`)}
            className="inline-flex items-center gap-1 rounded border border-primary-200 bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
          >
            <Edit3 className="size-3.5" />
            Soạn
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh mục khóa học chuẩn nền tảng"
        subtitle="18 khóa học chuẩn hóa phục vụ đào tạo và thu hẹp khoảng trống năng lực số"
      />

      {/* Filter bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên khóa học hoặc mã khóa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả 6 miền năng lực</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.code}: {cat.name}
              </option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả cấp độ</option>
            <option value="1">Cơ bản (Mức 1)</option>
            <option value="2">Trung cấp (Mức 2)</option>
            <option value="3">Nâng cao (Mức 3)</option>
          </select>
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(row) => row.id}
        emptyTitle="Không tìm thấy khóa học nào phù hợp."
      />
    </div>
  );
}
