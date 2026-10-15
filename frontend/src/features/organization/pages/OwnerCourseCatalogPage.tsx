import { useState, useMemo } from 'react';
import { useCourseCatalog } from '@/hooks/use-assignments';
import { useCompetencyCategories } from '@/hooks/use-competencies';
import {
  courseCategories,
  courseCodeMetadata,
  categoryDomain,
  filterCourseCatalog,
} from '@/features/courses/course-catalog';
import { CourseCard } from '../components/CourseCard';
import { CourseFilter } from '../components/CourseFilter';

const PULSE_TOKENS = {
  '--po-canvas': '#f7f9fd',
  '--po-surface': '#fff',
  '--po-ink': '#172442',
  '--po-muted': '#62718d',
  '--po-accent': '#304bdf',
  '--po-accent-strong': '#203bbf',
  '--po-coral': '#ef735c',
  '--po-lime': '#c6ec78',
  '--po-line': '#dfe6f3',
  '--po-soft': '#eef2ff',
  '--po-tint': '#edf1ff',
  '--po-warm': '#f1816b',
} as React.CSSProperties;

export function OwnerCourseCatalogPage() {
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');

  const { data: apiCategories = [] } = useCompetencyCategories();
  const categories = useMemo(() => courseCategories(apiCategories), [apiCategories]);
  const { data: coursesData, isLoading, isError, refetch } = useCourseCatalog({});

  const selectedCat = categories.find((c) => c.id === selectedDomain);
  const courses = useMemo(
    () => filterCourseCatalog(
      coursesData?.items ?? [],
      selectedCat,
      selectedLevel ? Number(selectedLevel) : undefined,
    ),
    [coursesData?.items, selectedCat, selectedLevel],
  );

  return (
    <div
      className="-m-4 md:-m-6 min-h-screen px-4 md:px-6 py-8"
      style={{
        ...PULSE_TOKENS,
        background: 'radial-gradient(ellipse at 50% 0%, #eef2ff 0%, var(--po-canvas) 60%)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1220 }}>
        {/* ── Page header ── */}
        <div className="mb-6">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em]"
            style={{ color: 'var(--po-accent)' }}
          >
            <i
              className="inline-block size-[6px] rounded-full"
              style={{ background: 'var(--po-coral)' }}
            />
            Kho khóa học
          </span>
          <h1
            className="mt-3 text-[clamp(34px,5vw,55px)] font-bold leading-[1.05]"
            style={{ color: 'var(--po-ink)', letterSpacing: '-0.055em' }}
          >
            Khóa học phù hợp,{' '}
            <span style={{ color: 'var(--po-accent)' }}>đúng thời điểm.</span>
          </h1>
          <p
            className="mt-3 text-[13px] leading-relaxed"
            style={{ color: 'var(--po-muted)', maxWidth: 650 }}
          >
            Mọi khóa Cơ bản mở toàn bộ. Owner có thể xem cấu trúc các khóa Trung cấp và Nâng cao, rồi giao cho nhân viên hoặc đưa vào đợt đào tạo.
          </p>
        </div>

        {/* ── Filters ── */}
        <CourseFilter
          selectedLevel={selectedLevel}
          selectedDomain={selectedDomain}
          onLevelChange={setSelectedLevel}
          onDomainChange={setSelectedDomain}
          categories={categories}
        />

        <div style={{ height: 16 }} />

        {/* ── Course grid ── */}
        {isLoading ? (
          <p
            className="py-20 text-center text-sm"
            style={{ color: 'var(--po-muted)' }}
          >
            Đang tải danh mục khóa học…
          </p>
        ) : isError ? (
          <div
            className="rounded-[18px] border p-8 text-center text-sm"
            style={{
              borderColor: '#fecdd3',
              background: '#fff1f2',
              color: '#be123c',
            }}
          >
            Không tải được danh mục.{' '}
            <button
              type="button"
              className="font-bold underline"
              onClick={() => refetch()}
            >
              Thử lại
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div
            className="rounded-[18px] border border-dashed p-14 text-center"
            style={{ borderColor: '#cfd9ee', background: '#fbfcff' }}
          >
            <div
              className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl text-2xl"
              style={{ background: '#e9edff', color: 'var(--po-accent)' }}
            >
              ◎
            </div>
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--po-ink)', letterSpacing: '-0.04em' }}
            >
              Không tìm thấy khóa học
            </h2>
            <p
              className="mx-auto mt-2 text-xs"
              style={{ color: 'var(--po-muted)', maxWidth: 400 }}
            >
              Không có khóa học nào khớp với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]">
            {courses.map((course) => {
              const meta = courseCodeMetadata(course.code);
              const domainIdx = meta?.domain ?? 1;
              const cat = categories.find(
                (c) => categoryDomain(c) === domainIdx,
              );
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  domainName={course.categoryName || cat?.name}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
