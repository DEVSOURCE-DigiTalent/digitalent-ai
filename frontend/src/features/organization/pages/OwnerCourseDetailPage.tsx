import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Layers, ShieldCheck } from 'lucide-react';
import { useCourse, useAssignments } from '@/hooks/use-assignments';
import { useCompetencyCategories } from '@/hooks/use-competencies';
import {
  courseCategories,
  courseCodeMetadata,
  categoryDomain,
} from '@/features/courses/course-catalog';
import { CourseModules } from '../components/CourseModules';
import { CourseEnrollment } from '../components/CourseEnrollment';

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

const TIER_LABELS = ['Cơ bản', 'Trung cấp', 'Nâng cao'];

const RUBRIC = [
  'Truy xuất nguồn gốc hoặc bối cảnh.',
  'Cho thấy quyết định hoặc tính toán có thể kiểm tra.',
  'Giải thích hành động tiếp theo và lý do phù hợp.',
];

export function OwnerCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: course, isLoading } = useCourse(id);
  const { data: apiCategories = [] } = useCompetencyCategories();
  const categories = useMemo(
    () => courseCategories(apiCategories),
    [apiCategories],
  );
  const { data: assignmentsData } = useAssignments(
    { courseId: course?.id, pageSize: 100 },
    Boolean(course?.id),
  );

  if (isLoading) {
    return (
      <div
        className="-m-4 md:-m-6 min-h-screen flex items-center justify-center"
        style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
      >
        <p className="text-sm" style={{ color: 'var(--po-muted)' }}>
          Đang tải chi tiết khóa học…
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div
        className="-m-4 md:-m-6 min-h-screen px-4 md:px-6 py-20"
        style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
      >
        <div className="mx-auto text-center" style={{ maxWidth: 500 }}>
          <div
            className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl text-2xl"
            style={{ background: '#e9edff', color: 'var(--po-accent)' }}
          >
            ✕
          </div>
          <h2
            className="text-xl font-semibold"
            style={{ color: 'var(--po-ink)' }}
          >
            Không tìm thấy khóa học
          </h2>
          <p
            className="mt-2 text-xs"
            style={{ color: 'var(--po-muted)' }}
          >
            Khóa học không tồn tại hoặc đã bị thu hồi.
          </p>
          <Link
            to="/enterprise/courses"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: 'var(--po-accent)' }}
          >
            <ArrowLeft className="size-3.5" /> Quay lại danh mục
          </Link>
        </div>
      </div>
    );
  }

  const meta = courseCodeMetadata(course.code);
  const level = meta?.level ?? course.level;
  const isBasic = level === 1;
  const tierLabel = TIER_LABELS[level - 1] ?? `Mức ${level}`;
  const domainIdx = meta?.domain ?? 1;
  const displayCategory =
    course.categoryName ||
    categories.find((c) => categoryDomain(c) === domainIdx)?.name ||
    'Miền năng lực số';

  const assignedEmployees = assignmentsData?.items ?? [];
  const completedCount = assignedEmployees.filter(
    (a) => a.status === 'COMPLETED',
  ).length;
  const modules = course.modules ?? [];

  return (
    <div
      className="-m-4 md:-m-6 min-h-screen"
      style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
    >
      {/* ── Hero ── */}
      <section
        className="grid grid-cols-1 md:grid-cols-[1.05fr_.95fr] overflow-hidden"
        style={{ background: '#172758', color: '#fff', minHeight: 330 }}
      >
        <div className="self-center px-6 md:px-10 py-10">
          <Link
            to="/enterprise/courses"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold mb-4 opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: '#dbe4ff' }}
          >
            <ArrowLeft className="size-3" /> Danh mục khóa học
          </Link>

          <span
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em]"
            style={{ color: '#c6ec78' }}
          >
            <i
              className="inline-block size-[6px] rounded-full"
              style={{ background: 'var(--po-coral)' }}
            />
            {isBasic ? 'Nền tảng cơ bản' : `${tierLabel} · phân công`}
          </span>

          <h1
            className="mt-3 text-[clamp(35px,4vw,55px)] font-bold leading-[1.05]"
            style={{ letterSpacing: '-0.055em' }}
          >
            {course.title}
          </h1>

          <p
            className="mt-3 text-[13px] leading-relaxed"
            style={{ color: '#dbe4ff', maxWidth: 520 }}
          >
            {course.purpose ||
              course.description ||
              `${modules.length} chương học, bài kiểm tra cuối khóa và bài tập thực hành được Manager đánh giá. ${isBasic ? 'Nội dung Cơ bản mở toàn bộ.' : 'Cần phân công trước khi nhân viên truy cập.'}`}
          </p>

          <div className="flex flex-wrap gap-2.5 mt-6">
            <button
              type="button"
              onClick={() =>
                navigate(`/enterprise/assignments?courseId=${course.id}`)
              }
              className="inline-flex items-center gap-2 rounded-[11px] px-4 py-3 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
              style={{
                background: '#fff',
                color: 'var(--po-accent)',
                boxShadow: '0 9px 18px rgba(52,72,207,.17)',
              }}
            >
              <UserCheck className="size-4" />
              Giao khóa học
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/enterprise/training-batches/new?courseId=${course.id}`,
                )
              }
              className="inline-flex items-center gap-2 rounded-[11px] border px-4 py-3 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
              style={{
                background: 'transparent',
                color: '#fff',
                borderColor: 'rgba(255,255,255,.25)',
              }}
            >
              <Layers className="size-4" />
              Đợt đào tạo
            </button>
          </div>
        </div>

        {/* Art placeholder */}
        <div
          className="hidden md:block relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #2a3f80 0%, #3a5bbf 40%, #5a7ae0 100%)',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 40% 60%, rgba(198,236,120,.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(233,106,83,.1) 0%, transparent 40%)',
            }}
          />
        </div>
      </section>

      {/* ── Content ── */}
      <div
        className="px-4 md:px-6 py-6 mx-auto"
        style={{ maxWidth: 1220 }}
      >
        {/* Access notice */}
        <div
          className="rounded-[11px] border p-4 text-xs mb-4"
          style={
            isBasic
              ? {
                  borderColor: '#dbeac5',
                  background: '#f5faea',
                  color: '#487336',
                }
              : {
                  borderColor: '#f5dfcf',
                  background: '#fff5ee',
                  color: '#96533c',
                }
          }
        >
          {isBasic
            ? 'Tất cả bài giảng Cơ bản đều mở toàn bộ. Nhân viên có thể bắt đầu ngay mà không cần phân công.'
            : 'Owner có thể xem cấu trúc và bài mẫu trước khi giao. Nội dung đầy đủ mở sau khi nhân viên được phân công.'}
        </div>

        {/* Grid 2: Rubric + Enrollment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Rubric panel */}
          <section
            className="rounded-[22px] border p-6"
            style={{
              borderColor: 'var(--po-line)',
              background: 'var(--po-surface)',
              boxShadow: '0 10px 35px rgba(29,48,102,.025)',
            }}
          >
            <span
              className="text-[10px] font-black uppercase tracking-[0.12em]"
              style={{ color: 'var(--po-accent)' }}
            >
              Kết quả đầu ra
            </span>
            <h2
              className="mt-2 text-xl font-semibold"
              style={{
                color: 'var(--po-ink)',
                letterSpacing: '-0.045em',
              }}
            >
              Chuẩn đầu ra thực tiễn.
            </h2>
            <p
              className="mt-1 text-xs"
              style={{ color: 'var(--po-muted)' }}
            >
              Giải thích ý tưởng, áp dụng vào vị trí công việc và tạo bằng
              chứng để Manager kiểm tra.
            </p>
            <div className="mt-4 grid gap-2.5">
              {RUBRIC.map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-[10px] border p-3 text-xs"
                  style={{
                    borderColor: 'var(--po-line)',
                    color: 'var(--po-ink)',
                  }}
                >
                  <b style={{ color: 'var(--po-accent)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </b>
                  {text}
                </div>
              ))}
            </div>

            <div
              className="mt-5 rounded-[10px] border p-4 flex items-start gap-3"
              style={{
                borderColor: 'rgba(48,75,223,.15)',
                background: 'rgba(238,242,255,.6)',
              }}
            >
              <ShieldCheck
                className="size-5 shrink-0 mt-0.5"
                style={{ color: 'var(--po-accent)' }}
              />
              <div
                className="text-[11px] space-y-1"
                style={{ color: '#385084' }}
              >
                <span className="font-bold block">
                  Miền: {displayCategory}
                </span>
                <span>
                  Trình độ đầu ra: {tierLabel} · Mã: {course.code}
                </span>
              </div>
            </div>
          </section>

          {/* Enrollment panel */}
          <CourseEnrollment
            course={course}
            isBasic={isBasic}
            assignmentCount={assignmentsData?.totalItems ?? 0}
            completedCount={completedCount}
          />
        </div>

        {/* Course modules */}
        <CourseModules modules={modules} />

        {/* Before buying (paid courses) */}
        {!isBasic && (
          <section
            className="mt-4 rounded-[22px] border p-6"
            style={{
              borderColor: 'var(--po-line)',
              background: 'var(--po-surface)',
              boxShadow: '0 10px 35px rgba(29,48,102,.025)',
            }}
          >
            <span
              className="text-[10px] font-black uppercase tracking-[0.12em]"
              style={{ color: 'var(--po-accent)' }}
            >
              Trước khi phân công
            </span>
            <h2
              className="mt-2 text-xl font-semibold"
              style={{
                color: 'var(--po-ink)',
                letterSpacing: '-0.045em',
              }}
            >
              Owner có thể xem trước.
            </h2>
            <p
              className="mt-1 text-xs"
              style={{ color: 'var(--po-muted)' }}
            >
              Kết quả đầu ra, tất cả tiêu đề bài học, bài mẫu đầu tiên và
              tiêu chí bài tập cuối khóa. Đánh giá của học viên chỉ hiện khi
              có kết quả đã xác minh.
            </p>
            <div
              className="mt-4 rounded-[11px] border p-4 text-xs"
              style={{
                borderColor: '#d9e5fb',
                background: '#f0f4ff',
                color: '#385084',
              }}
            >
              Không hiển thị xếp hạng hoặc đánh giá giả trong bản xem trước
              này.
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
