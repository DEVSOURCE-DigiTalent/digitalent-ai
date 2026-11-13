import { useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { Link, UNSAFE_DataRouterContext } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Lock,
  LogOut,
  Mic,
  Monitor,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Video,
  X,
} from 'lucide-react';
import '../trial-test.css';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import { useSubmitTrialExam } from '@/hooks/use-trial-program';
import { trialProgramService, type TrialExamQuestion, type TrialExamSession } from '@/services/trial-program.service';
import type { PulseProctoringSession } from '@/services/pulse.service';
import { btn } from '@/features/pulse-employee/lib/button';
import { clock, pulseErrorMessage } from '@/features/pulse-employee/lib/labels';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';
import { ProctorController, proctoringSupported, type ProctorSnapshot } from '@/features/pulse-employee/exam/proctor';
import { LeaveGuard, LockOverlay, MicMeter, ProctorPanel, StreamPreview } from '@/features/pulse-employee/exam/ProctoredExam';
import { useNow } from '@/features/pulse-employee/exam/exam-helpers';
import { TIER_LABELS, formatWhen } from '../lib/trial-format';

const DOMAIN_NUMBERS = [1, 2, 3, 4, 5, 6] as const;

const DOMAIN_SHORT_TITLES: Record<number, string> = {
  1: 'Dữ liệu',
  2: 'Giao tiếp',
  3: 'Nội dung',
  4: 'An toàn',
  5: 'Giải quyết',
  6: 'Ứng dụng AI',
};

const DOMAIN_NAMES: Record<number, string> = {
  1: 'Dữ liệu và thông tin',
  2: 'Giao tiếp và hợp tác',
  3: 'Sáng tạo nội dung số',
  4: 'An toàn thông tin',
  5: 'Giải quyết vấn đề',
  6: 'Ứng dụng AI & Công nghệ mới',
};

function useTrialProctor() {
  const [controller] = useState(
    () => new ProctorController('', 'FINAL', { startSession: async () => (await trialProgramService.startExam()).data.data! as unknown as PulseProctoringSession }),
  );
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  useEffect(() => () => controller.dispose(), [controller]);
  return { controller, snapshot };
}

/**
 * Phòng thi của bài đánh giá năng lực đầu vào dùng thử: chia sẻ toàn bộ màn hình + camera + micro.
 * Đề trắc nghiệm phủ 6 lĩnh vực năng lực số ở ba cấp.
 * 100% trắc nghiệm khách quan, không có tự luận. Nộp bài xong hệ thống chấm tự động và ghi nhận kết quả.
 */
export function TrialExam({ organizationName, deadline }: { organizationName: string; deadline?: string | null }) {
  const { controller, snapshot } = useTrialProctor();
  const submitExam = useSubmitTrialExam();
  const [stage, setStage] = useState<'check' | 'work' | 'submitting' | 'done'>('check');
  const [questions, setQuestions] = useState<TrialExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [domainNumber, setDomainNumber] = useState<number>(1);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const recording = snapshot.phase === 'recording' || snapshot.phase === 'locked';
  const now = useNow(recording);
  const elapsed = snapshot.startedAt ? Math.max(0, now - snapshot.startedAt) : 0;
  const dataRouter = useContext(UNSAFE_DataRouterContext);
  const busy = recording || stage === 'submitting';

  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);

  const start = async () => {
    setError(null);
    try {
      const session = (await controller.start()) as unknown as TrialExamSession;
      setQuestions(session.questions);
      setStage('work');
    } catch (err) {
      setError(pulseErrorMessage(err, 'Chưa vào được phiên đánh giá. Kiểm tra thiết bị và thử lại.'));
    }
  };

  const submit = async () => {
    setError(null);
    setConfirm(false);
    setStage('submitting');
    try {
      const result = await controller.finish();
      if (!result.complete) {
        setError('Bản ghi chưa tải hết lên. Kiểm tra mạng rồi bấm Nộp lại.');
        return;
      }
      await submitExam.mutateAsync({
        proctoringSessionId: result.sessionId,
        answers: questions.map((q) => ({ questionId: q.questionId, optionId: answers[q.questionId]! })),
        essayBasic: '',
        essayIntermediate: '',
        essayAdvanced: '',
      });
      controller.markFinished();
      setStage('done');
    } catch (err) {
      setError(pulseErrorMessage(err, 'Chưa nộp được bài. Hãy thử lại.'));
    }
  };

  const unanswered = questions.filter((q) => !answers[q.questionId]).length;

  const domainDone = (d: number) => {
    const items = questions.filter((q) => q.domainNumber === d);
    return items.length > 0 && items.every((q) => Boolean(answers[q.questionId]));
  };

  const currentQuestions = questions.filter((q) => q.domainNumber === domainNumber);
  const currentDomainName = currentQuestions[0]?.domainName || DOMAIN_NAMES[domainNumber] || `Lĩnh vực ${domainNumber}`;
  const answeredInDomain = currentQuestions.filter((q) => Boolean(answers[q.questionId])).length;
  const totalAnswered = questions.filter((q) => Boolean(answers[q.questionId])).length;
  const totalQuestions = questions.length;
  const totalPercent = totalQuestions ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  const isCurrentDomainComplete =
    currentQuestions.length > 0 && currentQuestions.every((q) => Boolean(answers[q.questionId]));
  const remainingInCurrent = currentQuestions.length - answeredInDomain;
  const allExamDone = questions.length > 0 && questions.every((q) => Boolean(answers[q.questionId]));

  useEffect(() => {
    if (stage === 'work') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [domainNumber, stage]);

  useEffect(() => {
    if (stage !== 'work') return;
    const handleScroll = () => {
      setIsScrolledDown(window.scrollY > 140);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stage]);

  const isDomainUnlocked = (d: number) => {
    if (d === 1) return true;
    for (let prev = 1; prev < d; prev++) {
      if (!domainDone(prev)) return false;
    }
    return true;
  };

  const handleNextDomain = () => {
    if (!isCurrentDomainComplete) return;
    setDomainNumber((prev) => Math.min(6, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevDomain = () => {
    setDomainNumber((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToDomain = (d: number) => {
    if (!isDomainUnlocked(d)) return;
    setDomainNumber(d);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pu-exam tp-vars" data-testid="trial-exam">
      {dataRouter && <LeaveGuard active={busy} />}

      {/* ── HEADER THANH ĐIỀU HƯỚNG PHÒNG THI CHUẨN ĐỒNG BỘ ───────────────── */}
      <header className="pu-exam-bar">
        <div className="pu-exam-bar-left">
          <div className="pu-exam-brand">
            <img src={pulseMark} alt="DigiTalent AI" className="pu-exam-logo" />
            <span className="pu-exam-wordmark">DigiTalent <em>AI</em></span>
          </div>
          <span className="pu-exam-bar-divider" aria-hidden="true" />
          <div className="pu-exam-bar-info">
            <span className="pu-exam-type-pill">Khảo thí đầu vào</span>
            <span className="pu-exam-course-title">
              {organizationName} · Bài đánh giá năng lực số
            </span>
          </div>
        </div>

        {recording && (
          <div className="pu-exam-status-bar" role="status" aria-label="Trạng thái giám sát">
            <div className="pu-rec-badge">
              <span className="pu-rec-beacon">
                <span className="pu-rec-ping" />
                <span className="pu-rec-dot" />
              </span>
              <span className="pu-rec-text">Đang ghi hình</span>
              <time className="pu-rec-time">{clock(elapsed)}</time>
            </div>

            <div className="pu-status-divider" />

            <div className="pu-status-chips">
              <span className={`pu-status-pill ${snapshot.screen === 'on' ? 'ok' : 'bad'}`}>
                <Monitor size={12} />
                <span>Màn hình</span>
                {snapshot.screen === 'on' ? <Check size={11} strokeWidth={3} /> : <AlertTriangle size={11} />}
              </span>

              <span className={`pu-status-pill ${snapshot.camera === 'on' ? 'ok' : 'bad'}`}>
                <Video size={12} />
                <span>Camera</span>
                {snapshot.camera === 'on' ? <Check size={11} strokeWidth={3} /> : <AlertTriangle size={11} />}
              </span>

              <span className={`pu-status-pill ${snapshot.mic === 'on' ? 'ok' : 'bad'}`}>
                <Mic size={12} />
                <span>Micro</span>
                {snapshot.mic === 'on' ? <Check size={11} strokeWidth={3} /> : <AlertTriangle size={11} />}
              </span>
            </div>
          </div>
        )}

        <div className="pu-exam-bar-actions">
          {stage !== 'work' && stage !== 'submitting' && (
            <Link to={PULSE_PATHS.trialTest} className="pu-exam-leave-btn">
              <LogOut size={15} aria-hidden />
              <span>Thoát</span>
            </Link>
          )}
        </div>
      </header>

      {/* ── THANH TIẾN ĐỘ THU GỌN BÁM VÀO HEADER KHI LƯỚT XUỐNG ───────────── */}
      {stage === 'work' && isScrolledDown && (
        <aside className="pu-sticky-stepper-strip" role="region" aria-label="Tiến độ bài thi nhanh">
          <div className="pu-sticky-stepper-inner">
            <div className="pu-sticky-left">
              <span className="pu-sticky-badge">
                <Sparkles size={11} className="text-blue-700" />
                <span>LV {domainNumber}/6</span>
              </span>
              <span className="pu-sticky-domain-name" title={currentDomainName}>
                {currentDomainName}
              </span>
            </div>

            <div className="pu-sticky-steps" aria-label="Chuyển nhanh lĩnh vực">
              {DOMAIN_NUMBERS.map((d) => {
                const isDone = domainDone(d);
                const isCurrent = domainNumber === d;
                const isUnlocked = isDomainUnlocked(d);

                return (
                  <button
                    key={d}
                    type="button"
                    className={`pu-sticky-step-dot ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''} ${
                      !isUnlocked ? 'locked' : ''
                    }`}
                    disabled={!isUnlocked}
                    onClick={() => handleGoToDomain(d)}
                    title={
                      !isUnlocked
                        ? `Lĩnh vực ${d} đang khóa (cần hoàn thành các lĩnh vực trước)`
                        : isDone
                        ? `Lĩnh vực ${d}: Đã xong - Bấm để xem lại`
                        : `Lĩnh vực ${d}: ${DOMAIN_SHORT_TITLES[d]}`
                    }
                  >
                    {isDone ? (
                      <Check size={11} strokeWidth={3} />
                    ) : !isUnlocked ? (
                      <Lock size={9} />
                    ) : (
                      <span>{d}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pu-sticky-right">
              <div className="pu-sticky-stat">
                <span className="pu-sticky-stat-label">Số câu:</span>
                <strong className={isCurrentDomainComplete ? 'text-emerald-600' : 'text-blue-600'}>
                  {answeredInDomain}/{currentQuestions.length} câu
                </strong>
              </div>
              <span className="pu-sticky-divider" />
              <div className="pu-sticky-stat">
                <span className="pu-sticky-stat-label">Tổng bài thi:</span>
                <strong>{totalAnswered}/{totalQuestions} câu</strong>
                <span className="pu-sticky-stat-percent">({totalPercent}%)</span>
              </div>
            </div>
          </div>

          <div className="pu-sticky-line-track">
            <div className="pu-sticky-line-fill" style={{ width: `${totalPercent}%` }} />
          </div>
        </aside>
      )}

      {/* ── 1. GIAI ĐOẠN KIỂM TRA THIẾT BỊ TRƯỚC KHI THI ───────────────────── */}
      {stage === 'check' && (
        <DeviceCheck
          controller={controller}
          snapshot={snapshot}
          agree={agree}
          onAgree={setAgree}
          onStart={start}
          error={error}
          deadline={deadline}
        />
      )}

      {/* ── 2. GIAI ĐOẠN LÀM BÀI TRẮC NGHIỆM ───────────────────────── */}
      {stage === 'work' && (
        <main className="pu-exam-body pu-exam-workspace">
          {/* ── THANH TIẾN ĐỘ 6 LĨNH VỰC TOÀN BỀ NGANG (FULL-WIDTH TRÊN CẢ 2 CỘT) ── */}
          <div className="pu-domain-stepper-card">
            <div className="pu-stepper-head">
              <div className="pu-stepper-head-left">
                <span className="pu-stepper-badge">
                  <Sparkles size={13} className="text-blue-700" />
                  <span>Lĩnh vực {domainNumber}/6</span>
                </span>
                <h2 className="pu-stepper-title">{currentDomainName}</h2>
              </div>
              <div className="pu-stepper-head-right">
                <span className="pu-stepper-progress-text">
                  Tiến độ tổng: <strong>{totalAnswered}/{totalQuestions} câu</strong> ({totalPercent}%)
                </span>
              </div>
            </div>

            {/* Thanh tiến độ tổng mini */}
            <div className="pu-stepper-track">
              <div className="pu-stepper-fill" style={{ width: `${totalPercent}%` }} />
            </div>

            {/* 6 Bước lĩnh vực phân bổ đều hoàn hảo 100% */}
            <div className="pu-stepper-steps-grid" role="navigation" aria-label="Tiến trình 6 lĩnh vực">
              {DOMAIN_NUMBERS.map((d, idx) => {
                const dQuestions = questions.filter((q) => q.domainNumber === d);
                const dAnswered = dQuestions.filter((q) => Boolean(answers[q.questionId])).length;
                const isDone = domainDone(d);
                const isCurrent = domainNumber === d;
                const isUnlocked = isDomainUnlocked(d);

                return (
                  <div
                    key={d}
                    className={`pu-step-col ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''} ${
                      !isUnlocked ? 'locked' : ''
                    }`}
                  >
                    {/* Đường nối bên trái */}
                    {idx > 0 && (
                      <div
                        className={`pu-step-line pu-step-line-left ${
                          domainDone(DOMAIN_NUMBERS[idx - 1]) ? 'done' : ''
                        }`}
                      />
                    )}

                    {/* Đường nối bên phải */}
                    {idx < 5 && (
                      <div
                        className={`pu-step-line pu-step-line-right ${
                          isDone ? 'done' : ''
                        }`}
                      />
                    )}

                    <button
                      type="button"
                      className="pu-step-btn"
                      disabled={!isUnlocked}
                      onClick={() => handleGoToDomain(d)}
                      aria-current={isCurrent ? 'step' : undefined}
                      title={
                        !isUnlocked
                          ? `Cần hoàn thành các lĩnh vực trước để mở khóa Lĩnh vực ${d}`
                          : isDone
                          ? `Đã hoàn thành Lĩnh vực ${d} (${dAnswered}/${dQuestions.length} câu) - Bấm để xem lại`
                          : `Lĩnh vực ${d}: ${DOMAIN_NAMES[d]}`
                      }
                    >
                      <div className="pu-step-circle">
                        {isDone ? (
                          <Check size={14} strokeWidth={3} />
                        ) : !isUnlocked ? (
                          <Lock size={12} />
                        ) : (
                          <span>{d}</span>
                        )}
                      </div>
                      <div className="pu-step-info">
                        <span className="pu-step-title-text">{d}. {DOMAIN_SHORT_TITLES[d]}</span>
                        <span className="pu-step-status-text">
                          {isDone ? 'Đã xong' : `${dAnswered}/${dQuestions.length || 9} câu`}
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── BỐ CỤC 2 CỘT: BÀI LÀM TRẮC NGHIỆM + BẢNG GIÁM SÁT ─────────────── */}
          <div className="pu-work-grid">
            <div className="pu-work tp" style={{ gap: 16 }}>
              {/* Khung hiển thị câu hỏi của Lĩnh vực hiện tại */}
              <section className="tp-exam-part pu-surface pu-pad" aria-label={`Bài làm Lĩnh vực ${domainNumber}`}>
                <header className="tp-exam-part-header">
                  <div className="tp-exam-part-header-left">
                    <p className="tp-exam-part-subtitle">
                      {currentQuestions.length} câu hỏi trắc nghiệm · Đánh giá theo 3 cấp độ (Cơ bản · Trung cấp · Nâng cao)
                    </p>
                  </div>
                  <div className={`pu-answered-pill ${isCurrentDomainComplete ? 'complete' : ''}`}>
                    <span className="pu-answered-pill-dot" aria-hidden="true" />
                    {isCurrentDomainComplete ? (
                      <>
                        <Check size={13} strokeWidth={3} className="text-emerald-600" />
                        <span>
                          <strong>{answeredInDomain}/{currentQuestions.length}</strong> câu đã hoàn thành
                        </span>
                      </>
                    ) : (
                      <span>
                        <strong>{answeredInDomain}/{currentQuestions.length}</strong> câu đã trả lời
                      </span>
                    )}
                  </div>
                </header>

                {currentQuestions.map((q) => (
                  <fieldset key={q.questionId} className="tp-q" disabled={snapshot.phase !== 'recording'}>
                    <legend>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center rounded-md bg-blue-50 text-blue-700 px-2.5 py-0.5 text-[11px] font-semibold border border-blue-100">
                          Cấp {q.tier}: {TIER_LABELS[q.tier]}
                        </span>
                      </div>
                      <span className="tp-q-title">Câu {q.number}: {q.content}</span>
                    </legend>
                    {q.options.map((o) => (
                      <label key={o.optionId}>
                        <input
                          type="radio"
                          name={`q-${q.questionId}`}
                          checked={answers[q.questionId] === o.optionId}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.questionId]: o.optionId }))}
                        />
                        <span>{o.content}</span>
                      </label>
                    ))}
                  </fieldset>
                ))}

                {/* Thanh điều hướng lĩnh vực & Nộp bài sau khi xong 6 lĩnh vực */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginTop: 18,
                    paddingTop: 18,
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <button
                    type="button"
                    className={btn('outline', true)}
                    disabled={domainNumber === 1}
                    onClick={handlePrevDomain}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <ChevronLeft size={16} /> Lĩnh vực trước
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!isCurrentDomainComplete ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: '#b45309',
                          background: '#fffbeb',
                          border: '1px solid #fde68a',
                          padding: '6px 14px',
                          borderRadius: 9999,
                        }}
                      >
                        <AlertTriangle size={13} />
                        Còn {remainingInCurrent} câu chưa làm ở lĩnh vực này
                      </span>
                    ) : domainNumber === 6 && !allExamDone ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: '#b45309',
                          background: '#fffbeb',
                          border: '1px solid #fde68a',
                          padding: '6px 14px',
                          borderRadius: 9999,
                        }}
                      >
                        <AlertTriangle size={13} />
                        Còn {unanswered} câu chưa làm ở các lĩnh vực trước
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: '#065f46',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          padding: '6px 14px',
                          borderRadius: 9999,
                        }}
                      >
                        <Check size={13} strokeWidth={3} />
                        {domainNumber === 6 && allExamDone
                          ? 'Đã hoàn thành toàn bộ câu trắc nghiệm'
                          : 'Đã hoàn thành ' + currentQuestions.length + '/' + currentQuestions.length + ' câu'}
                      </span>
                    )}
                  </div>

                  {domainNumber < 6 ? (
                    <button
                      type="button"
                      className="tt-btn-primary"
                      disabled={!isCurrentDomainComplete}
                      onClick={handleNextDomain}
                      style={{
                        opacity: isCurrentDomainComplete ? 1 : 0.45,
                        cursor: isCurrentDomainComplete ? 'pointer' : 'not-allowed',
                        padding: '10px 22px',
                      }}
                    >
                      Lĩnh vực tiếp theo <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="tt-btn-primary"
                      disabled={!allExamDone || snapshot.phase !== 'recording'}
                      onClick={() => setConfirm(true)}
                      style={{
                        background: allExamDone ? '#16a34a' : undefined,
                        opacity: allExamDone ? 1 : 0.45,
                        cursor: allExamDone ? 'pointer' : 'not-allowed',
                        padding: '10px 24px',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      <Check size={16} strokeWidth={2.8} />
                      Nộp bài &amp; Kết thúc
                    </button>
                  )}
                </div>

                {/* ── MODAL POPUP XÁC NHẬN NỘP BÀI ───────────────────────────────────── */}
                {confirm && (
                  <div
                    className="pu-modal-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="pu-submit-modal-title"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setConfirm(false);
                    }}
                  >
                    <div className="pu-modal-card submission-modal" onClick={(e) => e.stopPropagation()}>
                      <div className="pu-modal-header-row">
                        <div className="pu-modal-icon-wrap success">
                          <Check size={24} strokeWidth={3} />
                        </div>
                        <button
                          type="button"
                          className="pu-modal-close-btn"
                          onClick={() => setConfirm(false)}
                          aria-label="Đóng popup"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="pu-modal-content">
                        <h3 id="pu-submit-modal-title" className="pu-modal-title">
                          Xác nhận nộp bài đánh giá
                        </h3>
                        <p className="pu-modal-desc">
                          Bạn đã hoàn thành đầy đủ tất cả câu hỏi của bài đánh giá năng lực số. Bạn có chắc chắn muốn nộp bài và kết thúc phiên làm bài ngay bây giờ?
                        </p>

                        {/* Tóm tắt kết quả trước khi nộp */}
                        <div className="pu-modal-summary-grid">
                          <div className="pu-modal-summary-item">
                            <span className="pu-modal-summary-label">Số câu hoàn thành</span>
                            <span className="pu-modal-summary-val text-blue-700">
                              <Check size={14} strokeWidth={3} className="text-emerald-600" />
                              {totalAnswered}/{totalQuestions} câu (100%)
                            </span>
                          </div>
                          <div className="pu-modal-summary-item">
                            <span className="pu-modal-summary-label">Phạm vi khảo thí</span>
                            <span className="pu-modal-summary-val text-blue-700">
                              <Sparkles size={13} className="text-blue-600" />
                              6/6 lĩnh vực
                            </span>
                          </div>
                          <div className="pu-modal-summary-item">
                            <span className="pu-modal-summary-label">Bản ghi giám sát</span>
                            <span className="pu-modal-summary-val text-emerald-700">
                              <ShieldCheck size={14} className="text-emerald-600" />
                              Đầy đủ &amp; Hợp lệ
                            </span>
                          </div>
                          <div className="pu-modal-summary-item">
                            <span className="pu-modal-summary-label">Quy trình tiếp theo</span>
                            <span className="pu-modal-summary-val text-slate-800">
                              Chờ duyệt kết quả
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pu-modal-actions">
                        <button
                          type="button"
                          className="pu-modal-btn cancel"
                          onClick={() => setConfirm(false)}
                        >
                          Kiểm tra lại
                        </button>
                        <button
                          type="button"
                          className="pu-modal-btn success"
                          onClick={submit}
                        >
                          <Check size={16} strokeWidth={3} style={{ marginRight: 6 }} />
                          Xác nhận nộp bài
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {snapshot.phase === 'locked' && <LockOverlay controller={controller} snapshot={snapshot} elapsed={elapsed} />}
            </div>

            <ProctorPanel controller={controller} snapshot={snapshot} />
          </div>
        </main>
      )}

      {/* ── 3. GIAI ĐOẠN ĐANG NỘP BÀI ĐÁNH GIÁ (TRANG CHỜ TÁCH BIỆT) ───────── */}
      {stage === 'submitting' && (
        <main className="pu-exam-body pu-exam-narrow" style={{ maxWidth: 540, margin: '60px auto 80px' }}>
          <section className="pu-exam-submitting-card" aria-labelledby="tp-submitting-title">
            <div className="pu-submitting-spinner-wrap">
              <div className="pu-submitting-spinner-ring" />
              <div className="pu-submitting-spinner-core">
                <Sparkles size={24} className="text-blue-600 animate-pulse" />
              </div>
            </div>

            <h1 id="tp-submitting-title" className="pu-submitting-title">
              Đang nộp bài đánh giá…
            </h1>
            <p className="pu-submitting-desc">
              Hệ thống đang tiến hành mã hóa dữ liệu bài làm và đồng bộ bản ghi giám sát an toàn. Vui lòng giữ trang mở trong giây lát.
            </p>

            {/* Danh sách các bước đồng bộ */}
            <div className="pu-submitting-steps-list">
              <div className="pu-submitting-step-item done">
                <span className="pu-submitting-step-icon"><Check size={14} strokeWidth={3} /></span>
                <div className="pu-submitting-step-info">
                  <strong>Đóng gói bài làm trắc nghiệm</strong>
                  <span>Đã ghi nhận đủ {totalAnswered}/{totalQuestions} câu hỏi</span>
                </div>
              </div>

              <div className={`pu-submitting-step-item ${error ? 'error' : 'active'}`}>
                <span className="pu-submitting-step-icon">
                  {error ? <AlertTriangle size={14} /> : <div className="pu-submitting-mini-spin" />}
                </span>
                <div className="pu-submitting-step-info">
                  <strong>Đồng bộ bản ghi giám sát an toàn</strong>
                  <span>
                    {snapshot.pendingChunks
                      ? `Còn ${snapshot.pendingChunks} mẩu ghi hình đang tải lên…`
                      : 'Đang xác thực tính toàn vẹn bản ghi…'}
                  </span>
                </div>
              </div>

              <div className="pu-submitting-step-item pending">
                <span className="pu-submitting-step-icon">⏳</span>
                <div className="pu-submitting-step-info">
                  <strong>Chuyển giao ban quản lý</strong>
                  <span>Sẵn sàng để rà soát và duyệt kết quả</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="pu-submitting-error-banner">
                <AlertTriangle size={18} className="flex-shrink-0" />
                <div style={{ flex: 1 }}>
                  <strong>Chưa nộp được bài</strong>
                  <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
                </div>
                <button
                  type="button"
                  className="tt-btn-primary"
                  onClick={submit}
                  style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}
                >
                  Thử lại
                </button>
              </div>
            )}
          </section>
        </main>
      )}

      {/* ── 4. GIAI ĐOẠN ĐÃ NỘP BÀI THÀNH CÔNG (CHỜ CHỦ DOANH NGHIỆP XÁC NHẬN) ── */}
      {stage === 'done' && (
        <main className="pu-exam-body pu-exam-narrow" style={{ maxWidth: 720, margin: '40px auto 80px' }}>
          <section className="pu-exam-done" aria-labelledby="tp-done-title">
            <span className="pu-exam-done-icon" aria-hidden><Check size={28} strokeWidth={3} /></span>
            <h1 id="tp-done-title">Đã nộp bài thành công</h1>
            <p style={{ fontSize: 14.5, color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>
              Hệ thống đã tiếp nhận toàn bộ {totalQuestions} câu trả lời trắc nghiệm và bản ghi giám sát an toàn của bạn.
            </p>

            {/* Bảng tóm tắt thông số rõ ràng */}
            <div
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                textAlign: 'left',
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Số câu đã làm
                </span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 3 }}>
                  {questions.length} câu
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Phạm vi khảo thí
                </span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2563eb', marginTop: 3 }}>
                  6 lĩnh vực
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Bản ghi giám sát
                </span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={14} strokeWidth={3} /> Hợp lệ
                </div>
              </div>
            </div>

            {/* Thẻ thông báo nghiệp vụ */}
            <div className="pu-done-publish-notice">
              <div className="pu-done-publish-head">
                <span className="pu-done-publish-badge">
                  <Clock size={13} />
                  <span>Chờ duyệt kết quả</span>
                </span>
              </div>
              <h2 className="pu-done-publish-title">
                Bài làm đang chờ duyệt
              </h2>
              <p className="pu-done-publish-desc">
                Hệ thống đã tiếp nhận bài thi và bản ghi giám sát an toàn. Lộ trình đào tạo sẽ mở khóa ngay sau khi ban quản lý duyệt đợt khảo thí.
              </p>
            </div>

            <div className="pu-row" style={{ width: '100%', marginTop: 8 }}>
              <Link
                to={PULSE_PATHS.trialTest}
                className={btn()}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '13px 20px',
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: 12,
                }}
              >
                Về Trang tổng quan theo dõi trạng thái →
              </Link>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   GIAO DIỆN KIỂM TRA THIẾT BỊ (DEVICE CHECK)
   ══════════════════════════════════════════════════════════════════════════ */
function DeviceCheck({
  controller,
  snapshot,
  agree,
  onAgree,
  onStart,
  error,
  deadline,
}: {
  controller: ProctorController;
  snapshot: ProctorSnapshot;
  agree: boolean;
  onAgree: (value: boolean) => void;
  onStart: () => void;
  error: string | null;
  deadline?: string | null;
}) {
  const supported = proctoringSupported();
  const ready = supported && snapshot.screen === 'on' && snapshot.camera === 'on' && snapshot.mic === 'on' && agree;
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    if (!showRulesModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowRulesModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRulesModal]);

  return (
    <main className="pu-exam-body">
      {/* 1. Header tiêu đề & hạn chót đặt bên phải */}
      <div className="pu-exam-head-row">
        <div className="pu-path-title-block">
          <div className="pu-path-badge-pill">
            <ShieldCheck size={13} className="text-blue-700" />
            <span>Phiên khảo thí trực tuyến có giám sát</span>
          </div>
          <h1 className="pu-path-main-title">Kiểm tra thiết bị giám sát</h1>
          <p className="pu-path-sub-title">
            Bật camera, micro và chia sẻ toàn màn hình để bắt đầu phiên đánh giá.
          </p>
        </div>

        {deadline && (
          <div className="pu-exam-deadline-badge">
            <Clock size={14} className="text-amber-600 flex-shrink-0" />
            <span>Hạn làm bài: <strong>{formatWhen(deadline)}</strong></span>
          </div>
        )}
      </div>

      {!supported && (
        <div className="pu-notice warning" role="alert">
          Trình duyệt hiện tại không hỗ trợ đầy đủ API chia sẻ màn hình. Hãy dùng Chrome hoặc Edge bản mới trên máy tính.
        </div>
      )}

      {/* 2. Grid 2 cột: Danh sách thiết bị + Cột tóm tắt cấu trúc đề */}
      <div className="pu-check-grid">
        <div className="pu-stack" style={{ gap: 14 }}>
          {/* Thiết bị 1: Toàn màn hình */}
          <div className={`pu-device ${snapshot.screen === 'on' ? 'on' : snapshot.screen === 'idle' ? '' : 'error'}`}>
            <span className="pu-device-icon" aria-hidden><Monitor size={22} /></span>
            <div className="pu-device-text">
              <strong>Chia sẻ toàn bộ màn hình</strong>
              <span>Chọn "Toàn bộ màn hình" (Entire Screen) khi trình duyệt yêu cầu.</span>
              {snapshot.screen === 'on' ? (
                <span className="pu-device-badge ok"><Check size={13} aria-hidden /> Đang chia sẻ toàn bộ màn hình</span>
              ) : snapshot.screen === 'requesting' ? (
                <span className="pu-device-badge waiting">Đang kết nối trình duyệt…</span>
              ) : snapshot.screen === 'wrong-surface' ? (
                <span className="pu-device-badge bad">Đã chọn tab/cửa sổ — vui lòng chọn "Toàn bộ màn hình"</span>
              ) : snapshot.screen === 'denied' ? (
                <span className="pu-device-badge bad">Chưa cấp quyền chia sẻ màn hình</span>
              ) : (
                <span className="pu-device-badge bad">Chưa kích hoạt</span>
              )}
            </div>
            {snapshot.screen === 'on' && (
              <StreamPreview stream={controller.screenStream} version={snapshot.streamVersion} label="Màn hình đang chia sẻ" />
            )}
            <button
              type="button"
              className={btn(snapshot.screen === 'on' ? 'outline' : 'primary', true)}
              disabled={!supported || snapshot.screen === 'requesting'}
              onClick={() => void controller.requestScreen()}
            >
              {snapshot.screen === 'on' ? 'Đổi màn hình' : 'Chọn màn hình'}
            </button>
          </div>

          {/* Thiết bị 2: Camera */}
          <div className={`pu-device ${snapshot.camera === 'on' ? 'on' : snapshot.camera === 'idle' ? '' : 'error'}`}>
            <span className="pu-device-icon" aria-hidden><Video size={22} /></span>
            <div className="pu-device-text">
              <strong>Camera nhận diện khuôn mặt</strong>
              <span>Giữ khuôn mặt luôn rõ trong khung hình và đủ ánh sáng.</span>
              {snapshot.camera === 'on' ? (
                <span className="pu-device-badge ok"><Check size={13} aria-hidden /> Camera đang hoạt động ổn định</span>
              ) : snapshot.camera === 'requesting' ? (
                <span className="pu-device-badge waiting">Đang bật camera…</span>
              ) : snapshot.camera === 'denied' ? (
                <span className="pu-device-badge bad">Chưa cấp quyền truy cập camera</span>
              ) : (
                <span className="pu-device-badge bad">Chưa kích hoạt</span>
              )}
            </div>
            {snapshot.camera === 'on' && (
              <StreamPreview stream={controller.cameraStream} version={snapshot.streamVersion} label="Camera" mirrored />
            )}
            <button
              type="button"
              className={btn(snapshot.camera === 'on' ? 'outline' : 'primary', true)}
              disabled={!supported || snapshot.camera === 'requesting'}
              onClick={() => void controller.requestCamera()}
            >
              {snapshot.camera === 'on' ? 'Đổi camera' : 'Bật camera'}
            </button>
          </div>

          {/* Thiết bị 3: Micro */}
          <div className={`pu-device ${snapshot.mic === 'on' ? 'on' : snapshot.mic === 'idle' ? '' : 'error'}`}>
            <span className="pu-device-icon" aria-hidden><Mic size={22} /></span>
            <div className="pu-device-text">
              <strong>Micro thu âm môi trường</strong>
              <span>Thu âm thanh phòng thi nhằm đảm bảo tính độc lập bài làm.</span>
              {snapshot.mic === 'on' ? (
                <span className="pu-device-badge ok"><Check size={13} aria-hidden /> Đang thu âm tốt</span>
              ) : snapshot.mic === 'requesting' ? (
                <span className="pu-device-badge waiting">Đang kiểm tra micro…</span>
              ) : snapshot.mic === 'denied' ? (
                <span className="pu-device-badge bad">Chưa cấp quyền truy cập micro</span>
              ) : (
                <span className="pu-device-badge bad">Chưa kích hoạt</span>
              )}
            </div>
            {snapshot.mic === 'on' && <MicMeter level={snapshot.micLevel} />}
            <button
              type="button"
              className={btn(snapshot.mic === 'on' ? 'outline' : 'primary', true)}
              disabled={!supported || snapshot.mic === 'requesting'}
              onClick={() => void controller.requestMic()}
            >
              {snapshot.mic === 'on' ? 'Kiểm tra lại' : 'Bật micro'}
            </button>
          </div>

          {snapshot.deviceError && <div className="pu-notice warning" role="status">{snapshot.deviceError}</div>}

          {/* 3. Cam kết & Nút bắt đầu (Đã chuyển lưu ý vào popup quy chế) */}
          <div className="pu-action-footer">
            <label className="pu-commit">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => onAgree(e.target.checked)}
              />
              <span>
                Tôi xác nhận đã đọc kỹ{' '}
                <button
                  type="button"
                  className="pu-rules-trigger"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowRulesModal(true);
                  }}
                >
                  quy chế & lưu ý phòng thi
                </button>
                , cam kết tự làm bài độc lập và đồng ý ghi hình giám sát trong suốt phiên đánh giá.
              </span>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              <div className="pu-row" style={{ alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  className="tt-btn-primary"
                  style={{
                    padding: '12px 28px',
                    fontSize: 15,
                    opacity: ready ? 1 : 0.45,
                    cursor: ready ? 'pointer' : 'not-allowed',
                  }}
                  disabled={!ready || snapshot.phase === 'starting'}
                  onClick={onStart}
                >
                  {snapshot.phase === 'starting' ? (
                    'Đang mở phòng thi…'
                  ) : (
                    <>
                      Bắt đầu làm bài đánh giá <ArrowRight size={16} aria-hidden />
                    </>
                  )}
                </button>
                {!ready && (
                  <span style={{ fontSize: 13, color: '#64748b' }}>
                    Cần bật đủ 3 thiết bị và tích chọn cam kết để bắt đầu.
                  </span>
                )}
              </div>
            </div>
          </div>

          {error && <div className="pu-notice warning" role="alert">{error}</div>}
        </div>

        {/* 4. Cột tóm tắt cấu trúc đề bên phải (thiết kế tinh gọn, cân đối) */}
        <aside className="pu-exam-summary" aria-label="Thông tin bài đánh giá">
          <div className="pu-summary-top">
            <span className="pu-path-badge-pill" style={{ margin: 0, padding: '3px 10px', fontSize: 11 }}>
              <FileText size={12} className="text-blue-700" />
              <span>Cấu trúc đề đánh giá</span>
            </span>
            <h3 style={{ margin: '8px 0 2px', fontSize: 15.5, fontWeight: 700, color: '#0f172a' }}>
              6 Lĩnh vực năng lực số
            </h3>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748b' }}>
              100% trắc nghiệm chuẩn hóa chức danh
            </p>
          </div>

          <dl>
            <div>
              <dt>Số câu hỏi</dt>
              <dd>Trắc nghiệm</dd>
            </div>
            <div>
              <dt>Phân bổ 3 cấp</dt>
              <dd>18 Cơ bản · 18 Trung cấp · 18 Nâng cao</dd>
            </div>
            <div>
              <dt>Đánh giá</dt>
              <dd style={{ color: '#2563eb', fontWeight: 600 }}>Tự động chấm điểm</dd>
            </div>
            <div>
              <dt>Giám sát</dt>
              <dd>Màn hình, camera, micro</dd>
            </div>
          </dl>

          <div className="pu-summary-alert">
            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" style={{ marginTop: 1 }} />
            <span>Tự động ghi nhận nếu chuyển tab hoặc dừng chia sẻ màn hình.</span>
          </div>
        </aside>
      </div>

      {/* 5. Modal Popup Quy chế & Lưu ý phòng thi */}
      {showRulesModal && (
        <div className="pu-modal-portal" role="dialog" aria-modal="true" aria-labelledby="pu-rules-title">
          <div className="pu-modal-backdrop" onClick={() => setShowRulesModal(false)} />
          <div className="pu-modal-card">
            <header className="pu-modal-head">
              <div className="pu-modal-icon-wrap">
                <ShieldAlert size={22} className="text-blue-700" />
              </div>
              <div className="pu-modal-title-wrap">
                <h3 id="pu-rules-title" className="pu-modal-title">
                  Quy chế & Lưu ý phòng thi có giám sát
                </h3>
                <p className="pu-modal-desc">
                  Vui lòng tuân thủ các quy định dưới đây để kết quả khảo thí được ghi nhận hợp lệ.
                </p>
              </div>
              <button
                type="button"
                className="pu-modal-close"
                onClick={() => setShowRulesModal(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </header>

            <div className="pu-modal-body">
              <div className="pu-modal-rule-item">
                <div className="pu-modal-rule-num">1</div>
                <div className="pu-modal-rule-text">
                  <strong>Chia sẻ toàn bộ màn hình (Entire Screen)</strong>
                  <p>Không chuyển tab, không mở tài liệu hay ứng dụng khác trong suốt bài thi. Mọi lần chuyển đổi màn hình đều được ghi nhận vào báo cáo thẩm định.</p>
                </div>
              </div>

              <div className="pu-modal-rule-item">
                <div className="pu-modal-rule-num">2</div>
                <div className="pu-modal-rule-text">
                  <strong>Camera nhận diện khuôn mặt liên tục</strong>
                  <p>Khuôn mặt thí sinh phải luôn xuất hiện trọn vẹn trong khung hình với ánh sáng rõ ràng. Tránh quay mặt đi nơi khác hoặc để người khác vào khung hình.</p>
                </div>
              </div>

              <div className="pu-modal-rule-item">
                <div className="pu-modal-rule-num">3</div>
                <div className="pu-modal-rule-text">
                  <strong>Micro thu âm môi trường phòng thi</strong>
                  <p>Đảm bảo không gian làm bài yên tĩnh, không trao đổi hoặc để âm thanh bên ngoài ảnh hưởng đến tính trung thực của phiên đánh giá.</p>
                </div>
              </div>

              <div className="pu-modal-rule-item">
                <div className="pu-modal-rule-num">4</div>
                <div className="pu-modal-rule-text">
                  <strong>Tự động lưu câu trả lời trắc nghiệm</strong>
                  <p>Đề gồm câu hỏi trắc nghiệm chia theo 6 lĩnh vực. Đáp án được tự động lưu ngay khi bạn chọn, không lo mất dữ liệu nếu gặp sự cố mạng tạm thời.</p>
                </div>
              </div>
            </div>

            <footer className="pu-modal-foot">
              <button
                type="button"
                className="tt-btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '11px 20px', fontSize: 14 }}
                onClick={() => setShowRulesModal(false)}
              >
                Đã hiểu và đồng ý quy chế
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
