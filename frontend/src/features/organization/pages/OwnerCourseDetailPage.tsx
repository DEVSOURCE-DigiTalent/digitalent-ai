import { canonicalCourseCode } from '@/features/courses/course-code';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Layers, ShieldCheck, BookOpen, Clock3 } from 'lucide-react';
import { useCourse, useAssignments } from '@/hooks/use-assignments';
import { useCompetencyCategories } from '@/hooks/use-competencies';
import {
  courseCategories,
  courseCodeMetadata,
  categoryDomain,
} from '@/features/courses/course-catalog';
import { CourseModules } from '../components/CourseModules';
import { CourseEnrollment } from '../components/CourseEnrollment';
import { OwnerCourseFinalBrief } from '../components/OwnerCourseFinalBrief';
import { CourseArtwork } from '../components/CourseArtwork';
import { formatDuration, levelPricing } from '../components/course-tree';
import { PULSE_TOKENS } from '../owner-theme';
import { PageLoading } from '@/components/shared/LoadingState';
import './owner-course-catalog.css';
import './owner-course-detail.css';

const TIER_LABELS = ['Cơ bản', 'Trung cấp', 'Nâng cao'];

const RUBRIC = [
  'Truy xuất nguồn gốc hoặc bối cảnh.',
  'Cho thấy quyết định hoặc tính toán có thể kiểm tra.',
  'Giải thích hành động tiếp theo và lý do phù hợp.',
];

export function OwnerCourseDetailPage() {
  useUiLanguage();
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
    return <div className="po-owner -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><PageLoading label={translateUi("Đang tải chi tiết khóa học")} variant="detail" /></div>;
  }

  if (!course) {
    return (
      <div
        className="po-owner -m-4 md:-m-6 min-h-screen px-4 md:px-6 py-20"
        style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
      >
        <div className="mx-auto text-center" style={{ maxWidth: 500 }}>
          <div
            className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl text-2xl"
            style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
          >
            ✕
          </div>
          <h2
            className="text-xl font-semibold"
            style={{ color: 'var(--po-ink)' }}
          >{translateUi("Không tìm thấy khóa học")}</h2>
          <p
            className="mt-2 text-xs"
            style={{ color: 'var(--po-muted)' }}
          >{translateUi("Khóa học không tồn tại hoặc đã bị thu hồi.")}</p>
          <Link
            to="/enterprise/courses"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: 'var(--po-accent)' }}
          >
            <ArrowLeft className="size-3.5" />{translateUi(" Quay lại danh mục")}</Link>
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

  // A paid course is bought once for the whole organization; once bought, every employee may learn it.
  const hasLicense = isBasic || Boolean(course.hasLicense) || Boolean(course.isPurchased);
  const pricing = levelPricing(level, course.price);
  const checkoutPath = `/enterprise/courses/checkout?courses=${encodeURIComponent(canonicalCourseCode(course.code))}`;

  const assignedEmployees = assignmentsData?.items ?? [];
  const completedCount = assignedEmployees.filter(
    (a) => a.status === 'COMPLETED',
  ).length;
  const modules = course.modules ?? [];
  const lessonCount = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const duration = formatDuration(course.estimatedDurationMinutes);

  return (
    <div
      className="po-owner course-detail-page -m-4 md:-m-6 min-h-screen"
      style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
    >
      <div className="course-detail-shell">
      <section
        className="course-detail-hero"
      >
        <div className="course-detail-hero-copy">
          <Link
            to="/enterprise/courses"
            className="course-detail-back"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />{translateUi(" Danh mục khóa học")}</Link>

          <span
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em]"
            style={{ color: '#b8eadc' }}
          >
            <i
              className="inline-block size-[6px] rounded-full"
              style={{ background: 'var(--po-coral)' }}
            />
            {isBasic ? 'Nền tảng cơ bản · Miễn phí' : hasLicense ? translateUi(`${tierLabel} · Đã mua cho cả doanh nghiệp`) : translateUi(`${tierLabel} · Cần mua khóa học`)}
          </span>

          <h1>
            {translateUi(course.title)}
          </h1>
          {(course.purpose || course.description) && <p className="course-detail-hero-description">{course.purpose || translateUi(course.description)}</p>}
          <div className="course-detail-hero-meta">
            <span>{canonicalCourseCode(course.code)}</span><span><Layers size={15} /> {modules.length}{translateUi(" chương")}</span><span><BookOpen size={15} /> {lessonCount}{translateUi(" bài")}</span>{duration && <span><Clock3 size={15} /> {duration}</span>}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-6">
            {hasLicense ? (
              <button
                type="button"
                onClick={() =>
                  navigate(`/enterprise/assignments?courseId=${course.id}`)
                }
                className="inline-flex items-center gap-2 rounded-[11px] px-4 py-3 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
                style={{
                  background: 'var(--po-surface)',
                  color: 'var(--po-accent)',
                  boxShadow: '0 9px 18px rgba(19,123,132,.17)',
                }}
              >
                <UserCheck className="size-4" />{translateUi("Giao khóa học")}</button>
            ) : (
              <Link
                to={checkoutPath}
                className="inline-flex items-center gap-2 rounded-[11px] px-5 py-3 text-[13px] font-bold transition-all shadow-lg hover:brightness-110"
                style={{
                  background: '#f59e0b',
                  color: '#fff',
                }}
              >
                <span>🔒 Mua khóa học ({pricing.formatted})</span>
              </Link>
            )}
          </div>
        </div>

        <div className="course-detail-hero-art"><CourseArtwork domain={domainIdx} level={level} /></div>
      </section>

      <div className="course-detail-content">
        {/* Access notice */}
        {isBasic ? (
          <div
            className="rounded-[11px] border p-4 text-xs mb-4"
            style={{
              borderColor: '#dbeac5',
              background: '#f5faea',
              color: '#487336',
            }}
          >
            <b>{translateUi("Mở miễn phí.")}</b>{translateUi(" Nhân viên có thể bắt đầu học ngay.")}</div>
        ) : hasLicense ? (
          <div
            className="rounded-[11px] border p-4 text-xs mb-4"
            style={{
              borderColor: '#bbf7d0',
              background: '#f0fdf4',
              color: '#166534',
            }}
          >
            <b>{translateUi('Doanh nghiệp đã mua khóa học này.')}</b>{translateUi(" Mọi nhân viên đều học được, không giới hạn số người.")}</div>
        ) : (
          <div
            className="rounded-[11px] border p-4 text-xs mb-4 flex flex-wrap items-center justify-between gap-3"
            style={{
              borderColor: '#fcd34d',
              background: '#fffbeb',
              color: '#92400e',
            }}
          >
            <div>
              <b>{translateUi("Chưa mua khóa học.")}</b>{translateUi(" Mua một lần cho cả doanh nghiệp, sau đó mọi nhân viên đều học được.")}</div>
            <Link
              to={checkoutPath}
              className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-all inline-flex items-center gap-1.5"
            >
              <span>Mua khóa học & Ký online ({pricing.formatted}) →</span>
            </Link>
          </div>
        )}

        {/* Grid 2: Rubric + Enrollment */}
        <div className="course-detail-overview grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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
            >{translateUi("Kết quả đầu ra")}</span>
            <h2
              className="mt-2 text-xl font-semibold"
              style={{
                color: 'var(--po-ink)',
                letterSpacing: '-0.045em',
              }}
            >{translateUi("Kết quả học tập")}</h2>
            <div className="mt-4 grid gap-2.5">
              {(course.final?.criteria.length ? course.final.criteria : RUBRIC).map((text, i) => (
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
                borderColor: 'rgba(19,123,132,.15)',
                background: 'var(--po-raised)',
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
                <span className="font-bold block">{translateUi("Miền: ")}{displayCategory}
                </span>
                <span>{translateUi("Trình độ đầu ra: ")}{tierLabel}{translateUi(" · Mã: ")}{canonicalCourseCode(course.code)}
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
            hasLicense={hasLicense}
            checkoutPath={checkoutPath}
          />
        </div>

        {/* Course modules */}
        <CourseModules modules={modules} courseCode={canonicalCourseCode(course.code)} />
        {course.final && <OwnerCourseFinalBrief content={course.final} />}

      </div>
      </div>

    </div>
  );
}
