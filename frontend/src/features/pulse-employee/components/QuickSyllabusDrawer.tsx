import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import { usePulseCourse } from '@/hooks/use-pulse';
import type { PulseCourseSummary, PulseOverview } from '@/services/pulse.service';
import { levelName } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

function toSentenceCase(str: string): string {
  if (!str) return '';
  const s = str.trim();
  if (s === s.toUpperCase() && s.length > 3) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  return s;
}

export interface QuickSyllabusDrawerProps {
  course: PulseCourseSummary | null;
  overview?: PulseOverview | null;
  open: boolean;
  onClose: () => void;
}

export function QuickSyllabusDrawer({
  course,
  overview,
  open,
  onClose,
}: QuickSyllabusDrawerProps) {
  // Fetch deep course details (modules, description, learning outcomes)
  const { data: detail, isLoading } = usePulseCourse(course?.courseId);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !course) return null;

  const isCompleted = course.slotStatus === 'COMPLETED' || course.approved;
  const isPreAssessment = course.slotStatus === 'PRE_ASSESSMENT' || course.canStartPreAssessment;
  const isInProgress = course.slotStatus === 'IN_PROGRESS';
  const isFinalReady = course.slotStatus === 'FINAL_READY';
  const isWaitingReview = course.slotStatus === 'PRE_REVIEW' || course.slotStatus === 'IN_REVIEW';
  const isLocked = course.slotStatus === 'AFTER_PRIOR_LEVEL' || course.zone === 'ABOVE_CEILING';

  const reviewerName = overview?.reviewer?.name ?? 'Quản lý phụ trách';

  return (
    <div className="pu-drawer-portal" role="dialog" aria-modal="true" aria-labelledby="pu-drawer-title">
      {/* 1. Backdrop */}
      <div
        className="pu-drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Slide-over Sheet (540px) */}
      <aside className="pu-drawer-sheet">
        {/* Header */}
        <header className="pu-drawer-header">
          <div className="pu-drawer-domain-badge">
            <BookOpen size={13} className="text-blue-700" />
            <span>
              {course.domainName || `Lĩnh vực ${course.domainNumber}`} · {levelName(course.tier)}
            </span>
          </div>

          <div className="pu-drawer-title-row">
            <h2 id="pu-drawer-title" className="pu-drawer-title">
              <span className="pu-drawer-code">{course.code}</span>
              {toSentenceCase(course.title)}
            </h2>
            <button
              type="button"
              className="pu-drawer-close"
              onClick={onClose}
              aria-label="Đóng ngăn kéo"
              title="Đóng (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Content Body (Scrollable) */}
        <div className="pu-drawer-body">
          {/* Status Banners */}
          {isCompleted && (
            <div className="pu-drawer-status-box ok">
              <div className="pu-drawer-status-icon ok">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <strong className="pu-drawer-status-title ok">
                  Đã hoàn thành & Đạt chuẩn năng lực số
                </strong>
                <p className="pu-drawer-status-desc ok">
                  Chứng nhận đã được hoàn thành và phê duyệt theo khung năng lực vị trí.
                </p>
                <Link to={PULSE_PATHS.outcomes} className="pu-drawer-status-link ok" onClick={onClose}>
                  Xem Bằng chứng nhận năng lực số ↗
                </Link>
              </div>
            </div>
          )}

          {isPreAssessment && !isCompleted && (
            <div className="pu-drawer-status-box fast-track">
              <div className="pu-drawer-status-icon fast-track">
                <Zap size={18} />
              </div>
              <div>
                <strong className="pu-drawer-status-title fast-track">
                  Cơ chế Vượt cấp (Miễn toàn bộ lý thuyết)
                </strong>
                <p className="pu-drawer-status-desc fast-track">
                  Nếu bạn đã có kinh nghiệm thực tế, hãy làm bài đánh giá đầu vào có AI giám sát. Đạt ≥ 80% sẽ được <strong>miễn học toàn bộ lý thuyết</strong>, tiết kiệm 70% thời gian học tập.
                </p>
                <Link
                  to={PULSE_PATHS.preAssessment(course.courseId)}
                  className="pu-drawer-fast-track-btn"
                  onClick={onClose}
                >
                  <Zap size={14} />
                  Làm bài Đánh giá Đầu vào ngay →
                </Link>
              </div>
            </div>
          )}

          {isWaitingReview && (
            <div className="pu-drawer-status-box waiting">
              <div className="pu-drawer-status-icon waiting">
                <Clock size={18} />
              </div>
              <div>
                <strong className="pu-drawer-status-title waiting">
                  Bài làm đang được Quản lý thẩm định
                </strong>
                <p className="pu-drawer-status-desc waiting">
                  Quản lý {reviewerName} đang rà soát bài nộp cùng nhật ký giám sát AI. Cam kết SLA phản hồi trong vòng 48 giờ làm việc.
                </p>
              </div>
            </div>
          )}

          {isFinalReady && (
            <div className="pu-drawer-status-box ready">
              <div className="pu-drawer-status-icon ready">
                <Award size={18} />
              </div>
              <div>
                <strong className="pu-drawer-status-title ready">
                  Đủ điều kiện làm bài thi cuối khóa
                </strong>
                <p className="pu-drawer-status-desc ready">
                  Bạn đã hoàn thành toàn bộ bài giảng và câu hỏi ôn tập. Hãy thực hiện bài thi giám sát để bảo chứng năng lực.
                </p>
                <Link
                  to={PULSE_PATHS.final(course.courseId)}
                  className="pu-drawer-ready-btn"
                  onClick={onClose}
                >
                  Vào phòng thi cuối khóa →
                </Link>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="pu-drawer-facts-grid">
            <div className="pu-drawer-fact-item">
              <span className="pu-drawer-fact-label">Cấp độ năng lực</span>
              <strong className="pu-drawer-fact-value">{levelName(course.tier)} (L{course.tier})</strong>
            </div>
            <div className="pu-drawer-fact-item">
              <span className="pu-drawer-fact-label">Thời lượng ước tính</span>
              <strong className="pu-drawer-fact-value">06 giờ học</strong>
            </div>
            <div className="pu-drawer-fact-item">
              <span className="pu-drawer-fact-label">Cấu trúc chuyên đề</span>
              <strong className="pu-drawer-fact-value">{course.moduleCount || 3} mô đun bài học</strong>
            </div>
            <div className="pu-drawer-fact-item">
              <span className="pu-drawer-fact-label">Hình thức đánh giá</span>
              <strong className="pu-drawer-fact-value">Mentor chấm điểm</strong>
            </div>
          </div>

          {/* Progress bar if in progress */}
          {isInProgress && (
            <div className="pu-drawer-prog-block">
              <div className="pu-drawer-prog-head">
                <span>Tiến độ học tập hiện tại</span>
                <strong>{course.progressPercent}%</strong>
              </div>
              <div className="pu-drawer-prog-track">
                <div className="pu-drawer-prog-fill" style={{ width: `${course.progressPercent}%` }} />
              </div>
              <span className="pu-drawer-prog-hint">
                Đã đạt {course.modulesPassed} / {course.moduleCount || 3} mô đun kiến thức
              </span>
            </div>
          )}

          {/* Course Description */}
          <section className="pu-drawer-section">
            <h3 className="pu-drawer-section-title">
              <FileText size={15} /> Mục tiêu bồi dưỡng năng lực
            </h3>
            <p className="pu-drawer-desc-text">
              {detail?.description ||
                'Chuyên đề được thiết kế chuẩn theo khung năng lực chức danh, hỗ trợ nhân viên làm chủ kỹ năng số, xử lý nghiệp vụ chính xác, bảo mật dữ liệu và nâng cao hiệu suất công việc thực tế.'}
            </p>
          </section>

          {/* Syllabus Modules Checklist */}
          <section className="pu-drawer-section">
            <div className="pu-drawer-section-header-row">
              <h3 className="pu-drawer-section-title">
                <BookOpen size={15} /> Đề cương các mô đun bài học
              </h3>
              <span className="pu-drawer-module-counter">
                {course.modulesPassed}/{course.moduleCount || 3} Đạt
              </span>
            </div>

            <div className="pu-drawer-modules-list">
              {isLoading ? (
                <div className="pu-drawer-loading">Đang tải đề cương chi tiết...</div>
              ) : (detail?.modules || course.modules)?.map((mod, index) => {
                const modTitle = typeof mod === 'string' ? mod : mod.title;
                const isModPassed = typeof mod === 'object' && 'passed' in mod ? mod.passed : index < course.modulesPassed;
                const moduleId = typeof mod === 'object' && 'moduleId' in mod ? (mod as any).moduleId : null;

                return (
                  <div key={index} className={`pu-drawer-mod-item ${isModPassed ? 'passed' : ''}`}>
                    <div className="pu-drawer-mod-left">
                      <span className={`pu-drawer-mod-badge ${isModPassed ? 'passed' : ''}`}>
                        {isModPassed ? <CheckCircle2 size={13} /> : `0${index + 1}`}
                      </span>
                      <div className="pu-drawer-mod-info">
                        <h4 className="pu-drawer-mod-name">{modTitle}</h4>
                        <span className="pu-drawer-mod-sub">
                          {isModPassed ? 'Đã hoàn thành lý thuyết & quiz' : 'Lý thuyết tương tác · Quiz ôn tập 2 câu'}
                        </span>
                      </div>
                    </div>

                    {!isLocked && moduleId && (
                      <Link
                        to={PULSE_PATHS.module(course.courseId, moduleId)}
                        className="pu-drawer-mod-btn"
                        onClick={onClose}
                      >
                        {isModPassed ? 'Ôn lại' : 'Vào học'} →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Final Exam Note */}
          <section className="pu-drawer-section">
            <h3 className="pu-drawer-section-title">
              <ShieldCheck size={15} /> Tiêu chuẩn công nhận năng lực
            </h3>
            <ul className="pu-drawer-rules-list">
              <li>Đọc đầy đủ bài giảng của từng mô đun và hoàn thành Flash Quiz ôn tập đạt 2/2 câu.</li>
              <li>Làm bài thi cuối khóa có AI giám sát (Webcam, Mic, Chia sẻ màn hình) chống gian lận.</li>
              <li>Quản lý trực tiếp thẩm định bài làm và cấp Bằng chứng nhận số chính thức.</li>
            </ul>
          </section>
        </div>

        {/* Sticky Footer Actions */}
        <footer className="pu-drawer-footer">
          <button type="button" className="pu-drawer-cancel-btn" onClick={onClose}>
            Đóng
          </button>

          {isPreAssessment && !isCompleted ? (
            <Link
              to={PULSE_PATHS.preAssessment(course.courseId)}
              className="pu-drawer-primary-btn amber"
              onClick={onClose}
            >
              <Zap size={15} />
              Làm bài Đánh giá Đầu vào (Miễn học) →
            </Link>
          ) : isFinalReady ? (
            <Link
              to={PULSE_PATHS.final(course.courseId)}
              className="pu-drawer-primary-btn amber"
              onClick={onClose}
            >
              <Award size={15} />
              Vào phòng thi cuối khóa →
            </Link>
          ) : isInProgress ? (
            <Link
              to={PULSE_PATHS.course(course.courseId)}
              className="pu-drawer-primary-btn dark"
              onClick={onClose}
            >
              Tiếp tục học chuyên đề →
            </Link>
          ) : isCompleted ? (
            <Link
              to={PULSE_PATHS.course(course.courseId)}
              className="pu-drawer-primary-btn dark"
              onClick={onClose}
            >
              Xem lại tài liệu khóa học →
            </Link>
          ) : isLocked ? (
            <button type="button" className="pu-drawer-primary-btn disabled" disabled>
              <Lock size={14} /> Mở ở giai đoạn sau
            </button>
          ) : (
            <Link
              to={PULSE_PATHS.course(course.courseId)}
              className="pu-drawer-primary-btn dark"
              onClick={onClose}
            >
              Vào học chuyên đề này <ArrowRight size={15} />
            </Link>
          )}
        </footer>
      </aside>
    </div>
  );
}
