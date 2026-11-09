import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Layers, ShieldCheck, X, BookOpen, Clock3 } from 'lucide-react';
import { useCourse, useAssignments, usePurchaseCourseSeats } from '@/hooks/use-assignments';
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
import { formatDuration } from '../components/course-tree';
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
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  const { data: course, isLoading, refetch } = useCourse(id);
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

  const totalSeats = (course.seatsPurchased ?? 0) + (course.seatsGranted ?? 0);
  const hasLicense = isBasic || Boolean(course.hasLicense) || totalSeats > 0;
  const pricing = isBasic
    ? { formatted: 'Miễn phí', price: 0 }
    : level === 2
    ? { formatted: '399.000 ₫/suất', price: 399000 }
    : { formatted: '699.000 ₫/suất', price: 699000 };

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
            className="inline-flex items-center gap-1.5 text-[11px] font-bold mb-4 opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: '#dbe4ff' }}
          >
            <ArrowLeft className="size-3" />{translateUi(" Danh mục khóa học")}</Link>

          <span
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em]"
            style={{ color: '#b8eadc' }}
          >
            <i
              className="inline-block size-[6px] rounded-full"
              style={{ background: 'var(--po-coral)' }}
            />
            {isBasic ? 'Nền tảng cơ bản · Miễn phí' : hasLicense ? translateUi(`${tierLabel} · Đã có ${totalSeats} suất`) : translateUi(`${tierLabel} · Cần mua suất học`)}
          </span>

          <h1>
            {translateUi(course.title)}
          </h1>
          {(course.purpose || course.description) && <p className="course-detail-hero-description">{course.purpose || translateUi(course.description)}</p>}
          <div className="course-detail-hero-meta">
            <span>{course.code}</span><span><Layers size={15} /> {modules.length}{translateUi(" chương")}</span><span><BookOpen size={15} /> {lessonCount}{translateUi(" bài")}</span>{duration && <span><Clock3 size={15} /> {duration}</span>}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-6">
            {hasLicense ? (
              <>
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
                  <Layers className="size-4" />{translateUi("Đợt đào tạo")}</button>
                {!isBasic && (
                  <button
                    type="button"
                    onClick={() => setPurchaseModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-[11px] px-3.5 py-3 text-[13px] font-semibold text-amber-200 hover:text-white transition-colors"
                  >{translateUi("+ Mua thêm suất")}</button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setPurchaseModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-[11px] px-5 py-3 text-[13px] font-bold transition-all shadow-lg hover:brightness-110"
                style={{
                  background: '#f59e0b',
                  color: '#fff',
                }}
              >
                <span>🔒 Mua suất học ({pricing.formatted})</span>
              </button>
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
            className="rounded-[11px] border p-4 text-xs mb-4 flex flex-wrap items-center justify-between gap-3"
            style={{
              borderColor: '#bbf7d0',
              background: '#f0fdf4',
              color: '#166534',
            }}
          >
            <div>
              <b>{translateUi("Đã có bản quyền.")}</b> {totalSeats}{translateUi(" suất · Còn ")}{course.seatsAvailable ?? totalSeats}{translateUi(" suất để phân công.")}</div>
            <Link
              to={`/enterprise/courses/checkout?courses=${encodeURIComponent(course.code)}`}
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
            >{translateUi("+ Mua thêm suất & Ký online")}</Link>
          </div>
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
              <b>{translateUi("Chưa có suất học.")}</b>{translateUi(" Trang bị suất để giao khóa học cho nhân viên.")}</div>
            <Link
              to={`/enterprise/courses/checkout?courses=${encodeURIComponent(course.code)}`}
              className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-all inline-flex items-center gap-1.5"
            >
              <span>Trang bị suất học & Ký online ({pricing.formatted}) →</span>
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
                <span>{translateUi("Trình độ đầu ra: ")}{tierLabel}{translateUi(" · Mã: ")}{course.code}
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
            totalSeats={totalSeats}
            seatsAvailable={course.seatsAvailable ?? totalSeats}
            onBuySeats={() => setPurchaseModalOpen(true)}
          />
        </div>

        {/* Course modules */}
        <CourseModules modules={modules} courseCode={course.code} />
        {course.final && <OwnerCourseFinalBrief content={course.final} />}

      </div>
      </div>

      {purchaseModalOpen && (
        <CourseDetailPurchaseModal
          course={course}
          level={level}
          tierLabel={tierLabel}
          pricing={pricing}
          onClose={() => setPurchaseModalOpen(false)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
}

function CourseDetailPurchaseModal({
  course,
  level,
  tierLabel,
  pricing,
  onClose,
  onSuccess,
}: {
  course: { id: string; code: string; title: string };
  level: number;
  tierLabel: string;
  pricing: { formatted: string; price: number };
  onClose: () => void;
  onSuccess?: () => void;
}) {
  useUiLanguage();
  const [seats, setSeats] = useState(10);
  const [result, setResult] = useState<{
    orderId: string;
    totalAmount: number;
    seats: number;
    createdAt?: string;
  } | null>(null);

  const purchaseMutation = usePurchaseCourseSeats();
  const totalAmount = seats * pricing.price;

  const handlePurchase = () => {
    purchaseMutation.mutate(
      { courseId: course.id, seats },
      {
        onSuccess: (data) => {
          setResult({
            orderId: data.orderId,
            totalAmount: data.totalAmount,
            seats: data.seats,
            createdAt: data.createdAt,
          });
          onSuccess?.();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
              🔒 Bản quyền khóa học thương mại
            </span>
            <h2 className="mt-2 text-lg font-bold text-slate-900">{translateUi(course.title)}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{course.code}{translateUi(" · Bậc ")}{level} ({tierLabel})</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {result ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-xl">
              ✓
            </div>
            <h3 className="text-base font-bold text-slate-900">{translateUi("Kích hoạt suất học thành công!")}</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">{translateUi("Bạn đã trang bị thành công ")}<b>{result.seats}{translateUi(" suất")}</b>{translateUi(" cho khóa học ")}<b>{course.code}</b>.
              Khóa học đã được mở bản quyền ngay lập tức và đồng bộ vào hệ thống quản lý Platform Admin.
            </p>
            <div className="mx-auto max-w-sm rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Mã giao dịch:</span>
                <span className="font-mono font-semibold text-slate-800">{result.orderId.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{translateUi("Tổng chi phí:")}</span>
                <span className="font-bold text-emerald-800">{result.totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{translateUi("Thời gian:")}</span>
                <span className="text-slate-700">{result.createdAt ? new Date(result.createdAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')}</span>
              </div>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-sm"
                style={{ background: 'var(--po-accent)' }}
              >{translateUi("Hoàn tất & Bắt đầu đào tạo")}</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-700 leading-relaxed">
              💡 Doanh nghiệp của bạn đang dùng thử và được <b>{translateUi("miễn phí 100% toàn bộ khóa Cơ bản")}</b>.
              Khóa Trung cấp & Nâng cao cung cấp kỹ năng thực chiến và cấp chứng chỉ chuẩn TT02 theo từng đầu người (1 suất = 1 nhân viên).
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{translateUi("Số lượng suất cần trang bị cho nhân sự:")}</label>
              <div className="flex items-center gap-2 mb-2">
                {[5, 10, 20, 50].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSeats(count)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                      seats === count
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {count}{translateUi(" suất")}</button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                max={500}
                value={seats}
                onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-primary-600"
              />
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Đơn giá niêm yết:</span>
                <span className="font-semibold text-slate-900">{pricing.formatted}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{translateUi("Số lượng nhân viên đào tạo:")}</span>
                <span className="font-semibold text-slate-900">{seats}{translateUi(" nhân viên")}</span>
              </div>
              <div className="flex justify-between border-t border-amber-200/60 pt-2 text-sm font-bold text-slate-900">
                <span>{translateUi("Tổng chi phí đầu tư:")}</span>
                <span className="text-primary-700 font-extrabold">{totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            {purchaseMutation.isError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {translateUi((purchaseMutation.error as any)?.response?.data?.message) ||
                  translateUi((purchaseMutation.error as any)?.message) ||
                  'Có lỗi xảy ra khi thực hiện mua suất học.'}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={purchaseMutation.isPending}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >{translateUi("Để sau")}</button>
              <button
                type="button"
                onClick={handlePurchase}
                disabled={purchaseMutation.isPending}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-105 disabled:opacity-50 flex items-center gap-1.5"
                style={{ background: 'var(--po-accent)' }}
              >
                {purchaseMutation.isPending && <span className="animate-spin inline-block size-3.5 border-2 border-white border-t-transparent rounded-full" />}
                <span>{purchaseMutation.isPending ? translateUi('Đang xử lý...') : translateUi(`Xác nhận mua suất học (${totalAmount.toLocaleString('vi-VN')} ₫)`)}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
