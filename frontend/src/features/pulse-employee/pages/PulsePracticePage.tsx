import { useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  LayoutGrid,
  ListFilter,
  Paperclip,
  ScanEye,
  ShieldCheck,
  Timer,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePulsePractice } from '@/hooks/use-pulse';
import { useMyTasks, useSubmitMyTask, useUploadTaskAttachment } from '@/hooks/use-me';
import type { PulsePracticeItem, PulseCriterion } from '@/services/pulse.service';
import type { MyTaskCard, MyTaskFile } from '@/services/me.service';
import { formatDate } from '@/lib/utils';
import { LoadError, PageSkeleton } from '../components/ui';
import { levelName, pulseErrorMessage, timeLeft } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

type FilterTab = 'all' | 'urgent' | 'pending' | 'completed' | 'tasks';
type ViewMode = 'course-flow' | 'kanban';

interface UnifiedCourseItem {
  courseId: string;
  code: string;
  title: string;
  domainName: string;
  tier: number;
  preStatus: string;
  preSubmittedAt?: string | null;
  preReviewedAt?: string | null;
  moduleCount: number;
  modulesPassed: number;
  progressPercent: number;
  finalStatus: string;
  finalSubmittedAt?: string | null;
  finalReviewedAt?: string | null;
  retryDueAt?: string | null;
  retryOpensAt?: string | null;
  finalAttempts: number;
  actionRequired: boolean;
  isPending: boolean;
  isCompleted: boolean;
}

function formatTitle(title: string): string {
  if (!title) return '';
  const trimmed = title.trim();
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
    const lower = trimmed.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  return trimmed;
}

function formatTaskTitle(title: string): string {
  if (!title) return '';
  let cleaned = title.trim().replace(/xây dưng/gi, 'Xây dựng');
  if (cleaned === cleaned.toLowerCase()) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

function sanitizeCriteria(raw: string): { isUrl: boolean; url?: string; text: string } {
  if (!raw) {
    return { isUrl: false, text: 'Thực hiện đầy đủ báo cáo giải pháp số theo hướng dẫn khung năng lực của phòng ban.' };
  }
  const trimmed = raw.trim();
  if (trimmed.includes('mail.google.com') || trimmed.includes('spam')) {
    return {
      isUrl: false,
      text: 'Thực hiện đầy đủ báo cáo giải pháp số theo hướng dẫn khung năng lực của phòng ban.',
    };
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return { isUrl: true, url: trimmed, text: 'Xem tài liệu đặc tả tiêu chí đánh giá' };
  }
  return { isUrl: false, text: trimmed };
}

function buildUnifiedCourses(finals: PulsePracticeItem[], preAssessments: PulsePracticeItem[]): UnifiedCourseItem[] {
  const map = new Map<string, UnifiedCourseItem>();

  for (const item of finals) {
    const c = item.course;
    const isReady = c.finalStatus === 'READY' || c.finalStatus === 'RETRY_READY';
    const isLearning = c.finalStatus === 'LEARNING';
    const isPending = c.finalStatus === 'PENDING' || c.preStatus === 'PENDING';
    const isCompleted = c.finalStatus === 'APPROVED' || c.preStatus === 'PASSED';
    const actionRequired = isReady || isLearning;

    map.set(c.courseId, {
      courseId: c.courseId,
      code: c.code,
      title: formatTitle(c.title),
      domainName: c.domainName,
      tier: c.tier,
      preStatus: c.preStatus,
      preSubmittedAt: null,
      preReviewedAt: null,
      moduleCount: c.moduleCount,
      modulesPassed: c.modulesPassed,
      progressPercent: c.progressPercent,
      finalStatus: c.finalStatus,
      finalSubmittedAt: item.lastSubmittedAt,
      finalReviewedAt: item.lastReviewedAt,
      retryDueAt: item.retryDueAt,
      retryOpensAt: item.retryOpensAt,
      finalAttempts: c.finalAttempts,
      actionRequired,
      isPending,
      isCompleted,
    });
  }

  for (const item of preAssessments) {
    const c = item.course;
    const existing = map.get(c.courseId);
    if (existing) {
      existing.preSubmittedAt = item.lastSubmittedAt;
      existing.preReviewedAt = item.lastReviewedAt;
      if (c.preStatus === 'PENDING') {
        existing.isPending = true;
      }
      if (c.preStatus === 'PASSED') {
        existing.isCompleted = true;
      }
    } else {
      const isPending = c.preStatus === 'PENDING';
      const isCompleted = c.preStatus === 'PASSED';
      const actionRequired = c.preStatus === 'NOT_YET' || c.preStatus === 'REQUIRED';

      map.set(c.courseId, {
        courseId: c.courseId,
        code: c.code,
        title: formatTitle(c.title),
        domainName: c.domainName,
        tier: c.tier,
        preStatus: c.preStatus,
        preSubmittedAt: item.lastSubmittedAt,
        preReviewedAt: item.lastReviewedAt,
        moduleCount: c.moduleCount || 5,
        modulesPassed: c.modulesPassed || 0,
        progressPercent: c.progressPercent || 0,
        finalStatus: c.finalStatus || 'NOT_READY',
        finalSubmittedAt: null,
        finalReviewedAt: null,
        retryDueAt: null,
        retryOpensAt: null,
        finalAttempts: 0,
        actionRequired,
        isPending,
        isCompleted,
      });
    }
  }

  return Array.from(map.values());
}

export function PulsePracticePage() {
  const practice = usePulsePractice();
  const tasks = useMyTasks();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('course-flow');

  const preAssessments = practice.data?.preAssessments ?? [];
  const finals = practice.data?.finals ?? [];
  const taskItems = tasks.data?.items ?? [];

  const unifiedCourses = useMemo(
    () => buildUnifiedCourses(finals, preAssessments),
    [finals, preAssessments]
  );

  // Thống kê KPI tóm tắt
  const urgentCount =
    unifiedCourses.filter((c) => c.actionRequired).length + taskItems.filter((t) => t.canSubmit).length;
  const pendingCount =
    unifiedCourses.filter((c) => c.isPending).length + taskItems.filter((t) => t.status === 'SUBMITTED').length;
  const completedCount = unifiedCourses.filter((c) => c.isCompleted).length;

  // Lọc dữ liệu theo tab
  const filteredCourses = useMemo(() => {
    switch (activeTab) {
      case 'urgent':
        return unifiedCourses.filter((c) => c.actionRequired);
      case 'pending':
        return unifiedCourses.filter((c) => c.isPending);
      case 'completed':
        return unifiedCourses.filter((c) => c.isCompleted);
      case 'tasks':
        return [];
      default:
        return unifiedCourses;
    }
  }, [unifiedCourses, activeTab]);

  return (
    <div className="pu-workbench-wrap">
      {/* ── 1. Header Bàn làm việc chuẩn Enterprise ──────────────────────── */}
      <header className="pu-workbench-header">
        <div>
          <h1 className="pu-workbench-h1">Sổ kiểm tra & Bài tập thực tế</h1>
          <p className="pu-workbench-sub">
            Theo dõi tiến độ làm bài kiểm tra đầu vào, bài thi cuối khóa và nộp hồ sơ minh chứng nhiệm vụ thực tế.
          </p>
        </div>
      </header>

      {/* ── 2. Top Summary KPI Cards (Nắm bắt nhanh trong 3 giây) ─────────── */}
      <section className="pu-kpi-grid" aria-label="Tóm tắt thực hành">
        <button
          type="button"
          onClick={() => setActiveTab('urgent')}
          className={`pu-kpi-card urgent${activeTab === 'urgent' ? ' active' : ''}`}
        >
          <div className="pu-kpi-icon-wrap urgent">
            <Zap size={20} />
          </div>
          <div className="pu-kpi-content">
            <span className="pu-kpi-num">{urgentCount}</span>
            <span className="pu-kpi-label">Việc cần làm ngay</span>
            <small className="pu-kpi-desc">Bài kiểm tra đầu vào và bài thi đang mở</small>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`pu-kpi-card pending${activeTab === 'pending' ? ' active' : ''}`}
        >
          <div className="pu-kpi-icon-wrap pending">
            <Timer size={20} />
          </div>
          <div className="pu-kpi-content">
            <span className="pu-kpi-num">{pendingCount}</span>
            <span className="pu-kpi-label">Đang chờ mentor chấm</span>
            <small className="pu-kpi-desc">Bài đầu vào & bài cuối khóa đã nộp</small>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`pu-kpi-card completed${activeTab === 'completed' ? ' active' : ''}`}
        >
          <div className="pu-kpi-icon-wrap completed">
            <Trophy size={20} />
          </div>
          <div className="pu-kpi-content">
            <span className="pu-kpi-num">{completedCount}</span>
            <span className="pu-kpi-label">Khóa đã hoàn thành</span>
            <small className="pu-kpi-desc">Đã được duyệt và công nhận năng lực</small>
          </div>
        </button>
      </section>

      {/* ── 3. Dải 3 Tiêu chí đánh giá chuẩn của Quản lý ─────────────────── */}
      {practice.data?.criteria && practice.data.criteria.length > 0 && (
        <CriteriaCompactBanner criteria={practice.data.criteria} />
      )}

      {/* ── 4. Thanh điều khiển: Bộ lọc & Chuyển đổi góc nhìn (View Mode) ─── */}
      <div className="pu-control-toolbar">
        {/* Bộ lọc trạng thái */}
        <div className="pu-filter-chips" role="tablist" aria-label="Bộ lọc">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pu-f-chip${activeTab === 'all' ? ' active' : ''}`}
          >
            Tất cả khóa học <span className="pu-f-badge">{unifiedCourses.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('urgent')}
            className={`pu-f-chip${activeTab === 'urgent' ? ' active' : ''}`}
          >
            Cần làm ngay <span className="pu-f-badge urgent">{urgentCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`pu-f-chip${activeTab === 'pending' ? ' active' : ''}`}
          >
            Chờ mentor chấm <span className="pu-f-badge">{pendingCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`pu-f-chip${activeTab === 'completed' ? ' active' : ''}`}
          >
            Đã hoàn thành <span className="pu-f-badge">{completedCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`pu-f-chip${activeTab === 'tasks' ? ' active' : ''}`}
          >
            Nhiệm vụ thực tế <span className="pu-f-badge">{taskItems.length}</span>
          </button>
        </div>

        {/* Chuyển đổi View: Thẻ tiến trình ↔ Bảng Kanban */}
        {activeTab !== 'tasks' && (
          <div className="pu-view-switcher" role="group" aria-label="Kiểu hiển thị">
            <button
              type="button"
              onClick={() => setViewMode('course-flow')}
              className={`pu-view-btn${viewMode === 'course-flow' ? ' active' : ''}`}
              title="Xem theo tiến trình 3 nấc của từng khóa học"
            >
              <LayoutGrid size={15} />
              <span>Thẻ tiến trình khóa</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`pu-view-btn${viewMode === 'kanban' ? ' active' : ''}`}
              title="Xem theo 3 cột trạng thái Kanban"
            >
              <ListFilter size={15} />
              <span>Bảng trạng thái</span>
            </button>
          </div>
        )}
      </div>

      {/* ── 5. Nội dung chính: Xử lý theo Loading / Error / ViewMode ─────── */}
      {practice.isLoading || tasks.isLoading ? (
        <PageSkeleton blocks={[180, 180, 240]} />
      ) : practice.error ? (
        <LoadError
          message={pulseErrorMessage(practice.error, 'Không tải được dữ liệu thực hành.')}
          onRetry={() => {
            practice.refetch();
            tasks.refetch();
          }}
        />
      ) : (
        <div className="pu-workbench-body">
          {/* ── A. GIAO DIỆN KHÓA HỌC: HIỂN THỊ THEO THẺ TIẾN TRÌNH (COURSE FLOW) ─ */}
          {activeTab !== 'tasks' && viewMode === 'course-flow' && (
            <div className="pu-course-flow-list">
              {filteredCourses.length === 0 ? (
                <div className="pu-empty-state-box">
                  <p>Không có khóa học nào phù hợp với bộ lọc này.</p>
                  <button type="button" onClick={() => setActiveTab('all')} className="pu-text-btn">
                    Xem tất cả khóa học →
                  </button>
                </div>
              ) : (
                filteredCourses.map((c) => <CoursePracticeCard key={c.courseId} course={c} />)
              )}
            </div>
          )}

          {/* ── B. GIAO DIỆN KHÓA HỌC: HIỂN THỊ THEO BẢNG KANBAN ──────────────── */}
          {activeTab !== 'tasks' && viewMode === 'kanban' && (
            <div className="pu-kanban-board">
              {/* Cột 1: Cần làm ngay */}
              <div className="pu-kanban-col urgent">
                <div className="pu-kanban-head">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-amber-600" />
                    <h4>Cần làm ngay</h4>
                  </div>
                  <span className="pu-k-badge">{urgentCount}</span>
                </div>
                <div className="pu-kanban-cards">
                  {unifiedCourses
                    .filter((c) => c.actionRequired)
                    .map((c) => (
                      <KanbanItemCard key={c.courseId} course={c} />
                    ))}
                  {taskItems.filter((t) => t.canSubmit).length > 0 && (
                    <div className="pu-kanban-task-pill">
                      <span>1 Nhiệm vụ thực tế đang mở</span>
                      <button type="button" onClick={() => setActiveTab('tasks')}>Xem form nộp →</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cột 2: Đang chờ sếp chấm */}
              <div className="pu-kanban-col pending">
                <div className="pu-kanban-head">
                  <div className="flex items-center gap-2">
                    <Timer size={16} className="text-indigo-600" />
                    <h4>Chờ mentor chấm</h4>
                  </div>
                  <span className="pu-k-badge">{pendingCount}</span>
                </div>
                <div className="pu-kanban-cards">
                  {unifiedCourses
                    .filter((c) => c.isPending)
                    .map((c) => (
                      <KanbanItemCard key={c.courseId} course={c} />
                    ))}
                  {unifiedCourses.filter((c) => c.isPending).length === 0 && (
                    <p className="pu-empty-kanban-hint">Không có bài nào đang chờ duyệt.</p>
                  )}
                </div>
              </div>

              {/* Cột 3: Đã hoàn thành */}
              <div className="pu-kanban-col completed">
                <div className="pu-kanban-head">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <h4>Đã công nhận</h4>
                  </div>
                  <span className="pu-k-badge">{completedCount}</span>
                </div>
                <div className="pu-kanban-cards">
                  {unifiedCourses
                    .filter((c) => c.isCompleted)
                    .map((c) => (
                      <KanbanItemCard key={c.courseId} course={c} />
                    ))}
                  {unifiedCourses.filter((c) => c.isCompleted).length === 0 && (
                    <p className="pu-empty-kanban-hint">Chưa có khóa nào hoàn thành.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── C. KHỐI NHIỆM VỤ THỰC TẾ DOANH NGHIỆP (LUÔN CÓ Ở CUỐI HOẶC KHI CHỌN TAB) ── */}
          {(activeTab === 'all' || activeTab === 'tasks' || activeTab === 'urgent') && (
            <section className="pu-task-section" aria-labelledby="sec-tasks-heading">
              <div className="pu-task-sec-head">
                <div>
                  <h2 id="sec-tasks-heading" className="pu-task-sec-title">
                    Nhiệm vụ thực tế tại nơi làm việc
                  </h2>
                  <p className="pu-task-sec-desc max-w-2xl">
                    Hồ sơ nhiệm vụ do mentor hướng dẫn giao và đánh giá, công nhận kết quả thực tế tại nơi làm việc.
                  </p>
                </div>
                <span className="pu-task-count-tag">{taskItems.length} nhiệm vụ</span>
              </div>

              {taskItems.length === 0 ? (
                <div className="pu-empty-state-box">
                  <p>Chưa có nhiệm vụ thực tế nào được giao cho bạn.</p>
                </div>
              ) : (
                <div className="pu-task-cards-wrap">
                  {taskItems.map((task) => (
                    <TwoColumnTaskCard key={task.assignmentId} task={task} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT: Thẻ Tiến trình Thực hành Khóa học (3 Nấc kết nối)
───────────────────────────────────────────────────────────────────────────── */
function CoursePracticeCard({ course }: { course: UnifiedCourseItem }) {
  const isFinalReady = course.finalStatus === 'READY' || course.finalStatus === 'RETRY_READY';
  const isFinalPending = course.finalStatus === 'PENDING';
  const isFinalApproved = course.finalStatus === 'APPROVED';
  const isPrePending = course.preStatus === 'PENDING';
  const isPrePassed = course.preStatus === 'PASSED';
  const isPreNotYet = course.preStatus === 'NOT_YET';

  return (
    <article className={`pu-cp-card${course.actionRequired ? ' is-urgent' : ''}`}>
      {/* ── Card Header: Tên môn, mã khóa & lĩnh vực ────────────────────── */}
      <div className="pu-cp-header">
        <div className="pu-cp-title-wrap">
          <span className="pu-cp-code">{course.code}</span>
          <h3 className="pu-cp-title">{course.title}</h3>
        </div>
        <div className="pu-cp-tags">
          <span className="pu-cp-domain">
            {course.domainName} · {levelName(course.tier)}
          </span>
          {course.actionRequired && (
            <span className="pu-cp-urgent-badge">
              <Zap size={12} /> Cần thực hiện
            </span>
          )}
        </div>
      </div>

      {/* ── Card Body: Tiến trình 3 Nấc Tuần tự (Timeline 3 Steps) ───────── */}
      <div className="pu-cp-steps">
        {/* NẤC 1: Đánh giá đầu vào */}
        <div className="pu-cp-step">
          <div className="pu-cp-step-label">
            <span className="pu-step-num">1</span>
            <span>Đánh giá đầu vào</span>
          </div>
          <div className="pu-cp-step-body">
            {isPrePassed ? (
              <div className="pu-step-status passed">
                <Check size={16} strokeWidth={2.8} />
                <div>
                  <strong>Đạt · Miễn học khóa này</strong>
                  <small>Đã công nhận năng lực</small>
                </div>
              </div>
            ) : isPrePending ? (
              <div className="pu-step-status pending">
                <Timer size={16} />
                <div>
                  <strong>Đã nộp · Chờ mentor chấm</strong>
                  <small>{course.preSubmittedAt ? formatDate(course.preSubmittedAt) : 'Đang xử lý'}</small>
                </div>
              </div>
            ) : isPreNotYet ? (
              <div className="pu-step-status notice">
                <AlertCircle size={15} />
                <div>
                  <strong>Chưa đạt điểm miễn học</strong>
                  <small>Chuyển sang ôn tập mô đun</small>
                </div>
              </div>
            ) : course.preStatus === 'NOT_NEEDED' ? (
              <div className="pu-step-status muted">
                <span>Không áp dụng thi đầu vào</span>
              </div>
            ) : (
              <div className="pu-step-status unattempted">
                <Link
                  to={PULSE_PATHS.preAssessment(course.courseId)}
                  className="pu-step-action-link"
                >
                  <ScanEye size={14} /> Thi thử miễn học →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* NẤC 2: Mô đun bài giảng */}
        <div className="pu-cp-step">
          <div className="pu-cp-step-label">
            <span className="pu-step-num">2</span>
            <span>Ôn tập bài giảng</span>
          </div>
          <div className="pu-cp-step-body">
            <div className="pu-module-progress-box">
              <div className="pu-prog-meta">
                <span>Hoàn thành {course.modulesPassed}/{course.moduleCount} mô đun</span>
                <b>{course.progressPercent}%</b>
              </div>
              <div className="pu-prog-track">
                <div
                  className="pu-prog-fill"
                  style={{ width: `${Math.max(4, course.progressPercent)}%` }}
                />
              </div>
              {course.progressPercent < 100 && (
                <Link to={PULSE_PATHS.path} className="pu-module-link">
                  <BookOpen size={13} /> Tiếp tục học bài giảng →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* NẤC 3: Bài thi cuối khóa (Có AI giám sát) */}
        <div className="pu-cp-step action-col">
          <div className="pu-cp-step-label">
            <span className="pu-step-num">3</span>
            <span>Thi cuối khóa (Proctored)</span>
          </div>
          <div className="pu-cp-step-body">
            {isFinalApproved ? (
              <div className="pu-step-status approved-final">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Khóa học đã hoàn thành</strong>
                  <small>Đã cấp chứng nhận năng lực</small>
                </div>
              </div>
            ) : isFinalPending ? (
              <div className="pu-step-status pending">
                <Timer size={16} />
                <div>
                  <strong>Đã nộp bài · Chờ chấm</strong>
                  <small>Quản lý đang xem xét minh chứng</small>
                </div>
              </div>
            ) : isFinalReady ? (
              <div className="pu-final-cta-box">
                <Link
                  to={PULSE_PATHS.final(course.courseId)}
                  className="pu-cta-exam-btn"
                >
                  <span>
                    {course.finalStatus === 'RETRY_READY' ? 'Mở lần nộp cuối' : 'Làm bài cuối khóa'}
                  </span>
                  <ArrowRight size={15} />
                </Link>
                {course.retryDueAt && (
                  <span className="pu-due-countdown">
                    <Clock size={12} /> Hạn nộp: {timeLeft(course.retryDueAt)}
                  </span>
                )}
              </div>
            ) : (
              <div className="pu-step-status locked">
                <span>Cần hoàn thành 100% mô đun để mở bài thi</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT: Thẻ nhỏ cho Chế độ Bảng Kanban
───────────────────────────────────────────────────────────────────────────── */
function KanbanItemCard({ course }: { course: UnifiedCourseItem }) {
  const isFinalReady = course.finalStatus === 'READY' || course.finalStatus === 'RETRY_READY';
  const isLearning = course.finalStatus === 'LEARNING';
  const isPrePending = course.preStatus === 'PENDING';
  const isFinalPending = course.finalStatus === 'PENDING';
  const isApproved = course.finalStatus === 'APPROVED' || course.preStatus === 'PASSED';

  return (
    <div className="pu-k-card">
      <div className="pu-k-card-top">
        <span className="pu-k-code">{course.code}</span>
        <span className="pu-k-domain">{course.domainName}</span>
      </div>
      <h5 className="pu-k-title">{course.title}</h5>

      <div className="pu-k-progress-row">
        <span>Mô đun: {course.modulesPassed}/{course.moduleCount}</span>
        <b>{course.progressPercent}%</b>
      </div>

      <div className="pu-k-action-row">
        {isFinalReady ? (
          <Link to={PULSE_PATHS.final(course.courseId)} className="pu-k-btn primary">
            Vào thi cuối khóa →
          </Link>
        ) : isLearning ? (
          <Link to={PULSE_PATHS.path} className="pu-k-btn secondary">
            Vào học mô đun →
          </Link>
        ) : isPrePending || isFinalPending ? (
          <span className="pu-k-pill pending">
            <Timer size={12} /> Chờ mentor chấm
          </span>
        ) : isApproved ? (
          <span className="pu-k-pill approved">
            <Check size={12} /> Đã công nhận
          </span>
        ) : (
          <span className="pu-k-pill locked">Chưa mở thi</span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT: 3 Tiêu chí đánh giá dạng Banner Strip
───────────────────────────────────────────────────────────────────────────── */
function CriteriaCompactBanner({ criteria }: { criteria: PulseCriterion[] }) {
  return (
    <aside className="pu-rubric-strip" aria-label="3 tiêu chí kiểm tra">
      <div className="pu-rubric-lead">
        <ShieldCheck size={17} className="text-indigo-600" />
        <span>Tiêu chuẩn đánh giá bài làm</span>
      </div>
      <div className="pu-rubric-cols">
        {criteria.map((c) => (
          <div key={c.number} className="pu-rubric-col">
            <span className="pu-rubric-badge">0{c.number}</span>
            <div>
              <strong>{c.title}</strong>
              <p>{c.description}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT: Nhiệm vụ thực tế 2 Cột trên Desktop
───────────────────────────────────────────────────────────────────────────── */
function TwoColumnTaskCard({ task }: { task: MyTaskCard }) {
  const submit = useSubmitMyTask();
  const upload = useUploadTaskAttachment();
  const fileInput = useRef<HTMLInputElement>(null);

  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [files, setFiles] = useState<MyTaskFile[]>([]);

  const noteOk = note.trim().length >= 20;
  const linkOk = !link.trim() || /^https?:\/\//i.test(link.trim());

  const taskTitle = formatTaskTitle(task.title);
  const criteria = sanitizeCriteria(task.expectedOutput || '');
  const domains = task.targets.map((t) => formatTitle(t.name));
  const feedback = task.latestSubmission?.evaluation?.feedback;

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    upload.mutate(
      { assignmentId: task.assignmentId, file },
      {
        onSuccess: (uploaded) => setFiles((prev) => [...prev, uploaded]),
        onError: (err) => toast.error(pulseErrorMessage(err, `Chưa tải lên được ${file.name}.`)),
      },
    );
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!noteOk || !linkOk) return;
    submit.mutate(
      {
        assignmentId: task.assignmentId,
        payload: {
          content: note.trim(),
          linkUrls: link.trim() ? [link.trim()] : [],
          attachmentIds: files.map((f) => f.id),
        },
      },
      {
        onSuccess: () => {
          toast.success('Minh chứng thực tế đã vào hàng chờ chấm của mentor.');
          setNote('');
          setLink('');
          setFiles([]);
        },
        onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa nộp được minh chứng.')),
      },
    );
  };

  return (
    <article className="pu-task-grid-card">
      {/* ── CỘT TRÁI (46%): Thông tin nhiệm vụ ────────────────────────────── */}
      <div className="pu-task-info-col">
        <div className="pu-task-badges">
          <span className="pu-task-domain-pill">
            {domains.length > 0 ? domains.join(', ') : 'Năng lực chức danh'} · Mức {task.targetLevel}
          </span>
          {task.isOverdue && <span className="pu-task-overdue-tag">Quá hạn nộp</span>}
        </div>

        <h3 className="pu-task-h3">{taskTitle}</h3>
        <p className="pu-task-desc">{task.description}</p>

        {task.dueAt && (
          <div className="pu-task-meta-row">
            <span className="text-slate-500 text-xs">Hạn hoàn thành:</span>
            <span className="text-slate-800 text-xs font-semibold">{formatDate(task.dueAt)}</span>
          </div>
        )}

        <div className="pu-task-criteria-box">
          <span className="pu-task-criteria-label">Tiêu chí đánh giá của phòng ban</span>
          {criteria.isUrl ? (
            <a
              href={criteria.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pu-task-criteria-link"
            >
              <span>{criteria.text}</span>
              <ExternalLink size={13} />
            </a>
          ) : (
            <p className="pu-task-criteria-p">{criteria.text}</p>
          )}
        </div>

        {feedback && (
          <div className="pu-task-feedback-box">
            <span className="text-xs font-bold text-amber-900 block mb-1">
              Phản hồi từ {task.latestSubmission?.evaluation?.reviewerName ?? 'quản lý'}:
            </span>
            <p className="text-xs text-amber-800 leading-relaxed m-0">{feedback}</p>
          </div>
        )}
      </div>

      {/* ── CỘT PHẢI (54%): Form nộp minh chứng thực tế ───────────────────── */}
      <div className="pu-task-form-col">
        {task.canSubmit ? (
          <form onSubmit={onSubmit} className="pu-task-form">
            <h4 className="pu-form-h4">Nộp hồ sơ minh chứng thực tế</h4>

            <label className="pu-form-group">
              <span className="pu-form-label">
                Ghi chú minh chứng <span className="text-rose-500">*</span>
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nêu rõ nguồn dữ liệu, các bước triển khai công việc và kết quả đạt được..."
                rows={4}
                maxLength={10000}
                className="pu-form-textarea"
              />
              <span className={`pu-form-hint${note && !noteOk ? ' error' : ''}`}>
                Tối thiểu 20 ký tự (đã nhập {note.trim().length} ký tự).
              </span>
            </label>

            <label className="pu-form-group">
              <span className="pu-form-label">Liên kết tài liệu minh chứng (nếu có)</span>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://drive.google.com/... hoặc liên kết báo cáo"
                inputMode="url"
                className="pu-form-input"
              />
              {!linkOk && (
                <span className="pu-form-hint error">Liên kết phải bắt đầu bằng http:// hoặc https://</span>
              )}
            </label>

            <div className="pu-form-group">
              <span className="pu-form-label">Tệp đính kèm bổ sung</span>
              <div className="pu-file-upload-row">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={upload.isPending}
                  className="pu-upload-btn"
                >
                  <Paperclip size={14} />
                  <span>{upload.isPending ? 'Đang tải lên...' : 'Đính kèm tệp'}</span>
                </button>
                <input ref={fileInput} type="file" hidden onChange={onFile} />
              </div>

              {files.length > 0 && (
                <ul className="pu-attached-files">
                  {files.map((file) => (
                    <li key={file.id} className="pu-attached-file">
                      <FileText size={13} className="text-slate-400" />
                      <span className="truncate">{file.fileName}</span>
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))}
                        aria-label={`Xóa tệp ${file.fileName}`}
                        className="pu-remove-file-btn"
                      >
                        <X size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pu-form-actions">
              <button
                type="submit"
                disabled={!noteOk || !linkOk || submit.isPending || upload.isPending}
                className="pu-btn-submit"
              >
                {submit.isPending ? (
                  'Đang xử lý nộp...'
                ) : (
                  <>
                    <span>{task.submissionCount ? 'Nộp lại minh chứng →' : 'Nộp minh chứng thực tế →'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : task.status === 'SUBMITTED' ? (
          <div className="pu-task-status-box pending">
            <Timer size={24} className="text-amber-600 mb-2" />
            <h4 className="text-sm font-bold text-amber-900 mb-1">Đang chờ quản lý phê duyệt</h4>
            <p className="text-xs text-amber-700 m-0">
              Hồ sơ minh chứng của bạn đã được ghi nhận. Quản lý phòng ban sẽ kiểm tra và phản hồi kết quả sớm.
            </p>
          </div>
        ) : task.status === 'PASSED' ? (
          <div className="pu-task-status-box approved">
            <CheckCircle2 size={24} className="text-emerald-600 mb-2" />
            <h4 className="text-sm font-bold text-emerald-900 mb-1">Nhiệm vụ đã được công nhận</h4>
            <p className="text-xs text-emerald-700 m-0">
              Minh chứng thực tế này đã được phê duyệt và ghi nhận vào hồ sơ năng lực của bạn.
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
