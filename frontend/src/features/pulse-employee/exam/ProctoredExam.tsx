import { useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Link, UNSAFE_DataRouterContext, useBlocker, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle2, Lock, Mic, Monitor, MonitorOff, ScanFace, ShieldAlert, ShieldCheck, Upload, Video, Award } from 'lucide-react';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import type { PulseAnswer, PulseCourseSummary, PulseCriterion, PulseExamKind, PulseExamQuestion, PulseReviewer } from '@/services/pulse.service';
import { btn } from '../lib/button';
import { PROCTORING_EVENT_LABELS, clock, formatDuration, levelName, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';
import { ProctorController, proctoringSupported, type LockReason, type ProctorSnapshot } from './proctor';
import type { FaceSignalKind } from './face-signals';

const MIN_EVIDENCE = 30;
const MAX_EVIDENCE = 8000;

export interface ProctoredExamProps {
  kind: PulseExamKind;
  course: PulseCourseSummary;
  domainName: string;
  positionName?: string | null;
  reviewer?: PulseReviewer | null;
  criteria: PulseCriterion[];
  /** Số câu trắc nghiệm của đề (0 = chỉ có tự luận) và số câu đúng tối thiểu. */
  choiceCount: number;
  choicePassMark: number;
  /** "Một lần làm" hoặc "Lần nộp 1/2". */
  attemptLabel: string;
  outcomes: { pass: string; fail: string };
  onSubmit: (evidenceText: string, proctoringSessionId: string, answers: PulseAnswer[]) => Promise<{ durationMs: number }>;
  /** Nội dung hiện trước khi bắt đầu (trạng thái, bài đã nộp…) — chỉ ở bước chuẩn bị. */
  intro?: ReactNode;
  assignmentContent?: ReactNode;
}

function toSentenceCase(str: string): string {
  if (!str) return '';
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const KIND_LABEL: Record<PulseExamKind, string> = {
  PRE_ASSESSMENT: 'Đánh giá trước khi học',
  FINAL: 'Bài cuối khóa',
};

function useProctor(courseId: string, kind: PulseExamKind) {
  const [controller] = useState(() => new ProctorController(courseId, kind));
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  useEffect(() => () => controller.dispose(), [controller]);
  return { controller, snapshot };
}

/**
 * Trang làm bài có giám sát (đánh giá trước khi học / bài cuối khóa): bước chuẩn bị bật chia sẻ toàn bộ màn hình, camera,
 * micro và cam kết; khi làm bài, màn hình + camera + micro được ghi và tải lên dần, rời tab / ngừng chia sẻ được ghi vào
 * nhật ký; mất một nguồn thì bài tạm khóa tới khi bật lại. Đề gồm phần trắc nghiệm (phát khi phiên bắt đầu) và phần tự luận;
 * nộp bài kèm câu trả lời và phiên ghi hình. Kết quả chỉ hiện khi người chấm chấm xong.
 */
export function ProctoredExam(props: ProctoredExamProps) {
  const { kind, course } = props;
  const { controller, snapshot } = useProctor(course.courseId, kind);
  const navigate = useNavigate();
  const [stage, setStage] = useState<'check' | 'work' | 'submitting' | 'done'>(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('stage');
      if (p === 'work' || p === 'done') return p;
    } catch {
      // ignore
    }
    return 'check';
  });
  const [activeSection, setActiveSection] = useState<'choice' | 'essay'>('choice');
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState<PulseExamQuestion[]>(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('stage');
      if (p === 'work' && props.choiceCount > 0) {
        return [
          {
            questionId: 'q-demo-1',
            number: 1,
            content: 'Công cụ nào sau đây phù hợp nhất để thiết kế đồ họa mạng xã hội và infographic nhanh cho bài viết?',
            options: [
              { optionId: 'opt-1-a', content: 'Canva / Adobe Express' },
              { optionId: 'opt-1-b', content: 'Notepad' },
              { optionId: 'opt-1-c', content: 'VLC Media Player' },
              { optionId: 'opt-1-d', content: 'Windows Media Player' },
            ],
          },
          {
            questionId: 'q-demo-2',
            number: 2,
            content: 'Quy tắc bản quyền nào cần tuân thủ khi sử dụng hình ảnh và âm thanh từ Internet cho sản phẩm số?',
            options: [
              { optionId: 'opt-2-a', content: 'Chỉ sử dụng tài nguyên Creative Commons hoặc có giấy phép thương mại bản quyền' },
              { optionId: 'opt-2-b', content: 'Tải bất kỳ ảnh nào trên Google Images mà không cần dẫn nguồn' },
              { optionId: 'opt-2-c', content: 'Sao chép nguyên văn video của đối thủ cạnh tranh' },
              { optionId: 'opt-2-d', content: 'Xóa logo của tác giả gốc trước khi đăng lại' },
            ],
          },
          {
            questionId: 'q-demo-3',
            number: 3,
            content: 'Khi xuất bản video ngắn trên TikTok hoặc YouTube Shorts, tỷ lệ khung hình chuẩn là bao nhiêu?',
            options: [
              { optionId: 'opt-3-a', content: '9:16 (Khung dọc toàn màn hình điện thoại)' },
              { optionId: 'opt-3-b', content: '16:9 (Khung ngang tiêu chuẩn TV)' },
              { optionId: 'opt-3-c', content: '4:3 (Khung vuông cổ điển)' },
              { optionId: 'opt-3-d', content: '21:9 (Khung điện ảnh siêu rộng)' },
            ],
          },
          {
            questionId: 'q-demo-4',
            number: 4,
            content: 'Yếu tố nào quan trọng nhất để giữ chân người xem trong 3 giây đầu tiên của video mạng xã hội?',
            options: [
              { optionId: 'opt-4-a', content: 'Câu mở đầu gây tò mò (Hook) và hình ảnh trực quan bắt mắt' },
              { optionId: 'opt-4-b', content: 'Lời chào hỏi kéo dài 30 giây' },
              { optionId: 'opt-4-c', content: 'Nhạc nền nhỏ không nghe thấy' },
              { optionId: 'opt-4-d', content: 'Màn hình đen chờ tải' },
            ],
          },
          {
            questionId: 'q-demo-5',
            number: 5,
            content: 'Chỉ số đo lường hiệu quả tương tác trực tiếp của một bài viết nội dung số là gì?',
            options: [
              { optionId: 'opt-5-a', content: 'Tỷ lệ tương tác (Engagement Rate) gồm Like, Comment, Share, Lưu' },
              { optionId: 'opt-5-b', content: 'Dung lượng file ảnh lưu trên máy tính' },
              { optionId: 'opt-5-c', content: 'Số lượng chữ viết trong file Word' },
              { optionId: 'opt-5-d', content: 'Tốc độ gõ phím của người tạo nội dung' },
            ],
          },
        ];
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [doneDuration, setDoneDuration] = useState<number | null>(null);
  const now = useNow(snapshot.phase === 'recording' || snapshot.phase === 'locked');
  const elapsed = snapshot.startedAt ? Math.max(0, now - snapshot.startedAt) : 0;
  const recording = snapshot.phase === 'recording' || snapshot.phase === 'locked';
  const busy = recording || stage === 'submitting';
  const dataRouter = useContext(UNSAFE_DataRouterContext);

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
    setStartError(null);
    try {
      const session = await controller.start();
      setQuestions(session.questions ?? []);
      setStage('work');
    } catch (error) {
      setStartError(pulseErrorMessage(error, 'Chưa bắt đầu được bài làm. Hãy kiểm tra thiết bị và thử lại.'));
    }
  };

  const submit = async () => {
    setSubmitError(null);
    setConfirmSubmit(false);
    setStage('submitting');
    try {
      const result = await controller.finish();
      if (!result.complete) {
        setSubmitError('Bản ghi chưa tải hết lên máy chủ. Kiểm tra kết nối mạng rồi bấm Nộp lại.');
        return;
      }
      const chosen = questions.map((q) => ({ questionId: q.questionId, optionId: answers[q.questionId]! }));
      const response = await props.onSubmit(text.trim(), result.sessionId, chosen);
      controller.markFinished();
      setDoneDuration(response.durationMs || result.durationMs);
      setStage('done');
    } catch (error) {
      setSubmitError(pulseErrorMessage(error, 'Chưa nộp được bài. Hãy thử lại.'));
    }
  };

  const cancel = () => {
    controller.dispose();
    navigate(PULSE_PATHS.course(course.courseId));
  };

  const length = text.trim().length;
  const unanswered = questions.filter((q) => !answers[q.questionId]).length;
  const essayShort = length < MIN_EVIDENCE;

  return (
    <div className="pu-exam" data-testid="pulse-exam">
      {dataRouter && <LeaveGuard active={busy} />}
      <ExamBar
        kind={kind}
        course={course}
        snapshot={snapshot}
        elapsed={elapsed}
        stage={stage}
        onCancel={() => setConfirmCancel(true)}
      />

      {confirmCancel && stage === 'work' && (
        <div className="pu-exam-confirm" role="alertdialog" aria-labelledby="pu-cancel-title">
          <strong id="pu-cancel-title">Hủy bài làm này?</strong>
          <span>Bản ghi đến lúc này vẫn được lưu nhưng bài không được nộp. Lần sau bạn bắt đầu lại từ đầu.</span>
          <div className="pu-row">
            <button type="button" className={btn('outline', true)} onClick={() => setConfirmCancel(false)}>Làm tiếp</button>
            <button type="button" className={btn('primary', true)} onClick={cancel}>Hủy bài làm</button>
          </div>
        </div>
      )}

      {stage === 'check' && (
        <DeviceCheck
          {...props}
          controller={controller}
          snapshot={snapshot}
          agree={agree}
          onAgree={setAgree}
          onStart={start}
          startError={startError}
        />
      )}

      {(stage === 'work' || stage === 'submitting') && (
        <main className="pu-exam-body pu-work-grid">
          <div className="pu-work">
            {/* Stepper Bar (Phần 1 Trắc nghiệm / Phần 2 Tự luận) */}
            <div className="pu-exam-stepper-bar">
              <div className="pu-stepper-tabs" role="tablist" aria-label="Các phần của bài thi">
                {questions.length > 0 && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeSection === 'choice'}
                    className={`pu-stepper-tab ${activeSection === 'choice' ? 'is-active' : ''}`}
                    onClick={() => {
                      setActiveSection('choice');
                      document.getElementById('pu-choice-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <span className="pu-tab-badge">01</span>
                    <span className="pu-tab-info">
                      <strong>Phần 1: Trắc nghiệm</strong>
                      <small>{questions.length - unanswered}/{questions.length} đã chọn</small>
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeSection === 'essay'}
                  className={`pu-stepper-tab ${activeSection === 'essay' ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveSection('essay');
                    document.getElementById('pu-essay-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <span className="pu-tab-badge">02</span>
                  <span className="pu-tab-info">
                    <strong>Phần 2: Tự luận</strong>
                    <small>{essayShort ? 'Chưa đủ điều kiện' : `${length}/${MAX_EVIDENCE} ký tự`}</small>
                  </span>
                </button>
              </div>

              <div className="pu-stepper-criteria" aria-label="Điều kiện đạt bài thi">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" aria-hidden />
                <span>Đạt: ≥ {props.choicePassMark}/{questions.length} trắc nghiệm · Đạt 3 tiêu chí tự luận</span>
              </div>
            </div>

            {/* Phần 1: Trắc nghiệm */}
            {questions.length > 0 && (
              <div id="pu-choice-section">
                <ChoicePart
                  questions={questions}
                  answers={answers}
                  passMark={props.choicePassMark}
                  disabled={snapshot.phase === 'locked'}
                  onChoose={(questionId, optionId) => setAnswers((prev) => ({ ...prev, [questionId]: optionId }))}
                />
              </div>
            )}

            {/* Phần 2: Tự luận */}
            <section id="pu-essay-section" className="pu-surface pu-pad pu-answer" aria-labelledby="pu-essay-title">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {questions.length > 0 ? 'Phần 2 · Tự luận' : 'Tự luận'}
                </span>
                <h2 id="pu-essay-title" className="pu-panel-title mt-1.5">Tạo ghi chú công việc có thể kiểm tra.</h2>
                <p className="pu-panel-desc max-w-2xl">
                  Mô tả một nhiệm vụ thực tế của vị trí {props.positionName ?? 'của bạn'} thuộc lĩnh vực {props.domainName.trim().toLowerCase()}: nêu nguồn,
                  hành động hoặc phép tính người khác kiểm tra lại được, kết luận và bước tiếp theo.
                </p>
              </div>
              {props.assignmentContent}
              <ol className="pu-brief-criteria" aria-label="Ba tiêu chí chấm phần tự luận">
                {props.criteria.map((criterion) => (
                  <li key={criterion.number}>
                    <b>{criterion.number}</b>
                    <span><strong>{criterion.title}</strong><small>{criterion.description}</small></span>
                  </li>
                ))}
              </ol>
              <label id="pu-answer-label" htmlFor="pu-evidence" className="pu-answer-label">Ghi chú minh chứng</label>
              <textarea
                id="pu-evidence"
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={MAX_EVIDENCE}
                disabled={snapshot.phase === 'locked'}
                placeholder="Nêu nguồn, trình bày hành động hoặc phép tính của bạn, rồi giải thích kết luận và bước tiếp theo."
                aria-describedby="pu-evidence-hint"
              />
              <div className="pu-answer-foot">
                <small id="pu-evidence-hint" className={length > 0 && essayShort ? 'error' : undefined}>
                  {length > 0 && essayShort
                    ? `Cần ít nhất ${MIN_EVIDENCE} ký tự (hiện có ${length}).`
                    : `Ít nhất ${MIN_EVIDENCE} ký tự · ${length}/${MAX_EVIDENCE} · ${props.attemptLabel}`}
                  {unanswered > 0 && <span className="pu-answer-missing"> · Còn ${unanswered} câu trắc nghiệm chưa chọn</span>}
                </small>
                {stage === 'work' && (
                  <button
                    type="button"
                    className={btn()}
                    disabled={essayShort || unanswered > 0 || snapshot.phase === 'locked'}
                    onClick={() => setConfirmSubmit(true)}
                  >
                    Nộp bài
                  </button>
                )}
              </div>
              {confirmSubmit && stage === 'work' && (
                <div className="pu-exam-confirm inline" role="alertdialog" aria-labelledby="pu-submit-title">
                  <strong id="pu-submit-title">Nộp bài và kết thúc ghi hình?</strong>
                  <span>
                    Bài làm cùng bản ghi {clock(elapsed)} sẽ gửi cho {props.reviewer?.name ?? 'người chấm'}. Sau khi nộp, bạn không sửa được bài.
                  </span>
                  <div className="pu-row">
                    <button type="button" className={btn('primary', true)} onClick={submit}>Nộp bài</button>
                    <button type="button" className={btn('outline', true)} onClick={() => setConfirmSubmit(false)}>Làm tiếp</button>
                  </div>
                </div>
              )}
              {stage === 'submitting' && (
                <div className="pu-exam-confirm inline" role="status">
                  <strong>{submitError ? 'Chưa nộp được bài' : 'Đang tải bản ghi và nộp bài…'}</strong>
                  <span>
                    {submitError ?? (snapshot.pendingChunks
                      ? `Còn ${snapshot.pendingChunks} mẩu ghi hình đang tải lên. Giữ trang này mở.`
                      : 'Đang gửi bài làm cho người chấm.')}
                  </span>
                  {submitError && (
                    <div className="pu-row">
                      <button type="button" className={btn('primary', true)} onClick={submit}>Nộp lại</button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {snapshot.phase === 'locked' && <LockOverlay controller={controller} snapshot={snapshot} elapsed={elapsed} />}
          </div>

          <ProctorPanel
            controller={controller}
            snapshot={snapshot}
            questions={questions}
            answers={answers}
            essayDone={!essayShort}
            onJumpQuestion={(qId) => {
              setActiveSection('choice');
              const el = document.getElementById(`q-${qId}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            onJumpEssay={() => {
              setActiveSection('essay');
              const el = document.getElementById('pu-essay-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        </main>
      )}

      {stage === 'done' && (
        <main className="pu-exam-body pu-exam-narrow">
          <section className="pu-exam-done" aria-labelledby="pu-done-title">
            <span className="pu-exam-done-icon" aria-hidden><Check size={26} strokeWidth={2.6} /></span>
            <h1 id="pu-done-title">Đã nộp {KIND_LABEL[kind].toLowerCase()} {course.code}.</h1>
            <p>
              Bài làm và bản ghi {formatDuration(doneDuration)} đã gửi cho {props.reviewer?.name ?? 'người chấm'}. Kết quả
              {questions.length > 0 ? ' phần trắc nghiệm, phần tự luận' : ''} và nhận xét chỉ hiện khi người chấm chấm xong, ở trang Tổng quan và trong lộ trình.
            </p>
            <div className="pu-exam-upload">
              <span><Upload size={15} aria-hidden /> Bản ghi màn hình, camera và micro <strong>Đã tải lên</strong></span>
              <span>
                Nhật ký gửi kèm: {snapshot.events.filter((e) => e.kind === 'TAB_HIDDEN' || e.kind === 'FOCUS_LOST').length} lần rời bài làm,{' '}
                {snapshot.events.filter((e) => e.kind === 'SHARE_STOPPED').length} lần ngừng chia sẻ màn hình.
              </span>
            </div>
            <div className="pu-exam-outcomes">
              <div className="ok"><b>Nếu đạt</b><span>{props.outcomes.pass}</span></div>
              <div className="no"><b>Nếu chưa đạt</b><span>{props.outcomes.fail}</span></div>
            </div>
            <div className="pu-row">
              <Link to={PULSE_PATHS.today} className={btn()}>Về trang Tổng quan</Link>
              <Link to={PULSE_PATHS.path} className={btn('outline')}>Xem lộ trình</Link>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

/** Hỏi lại trước khi rời trang trong lúc đang ghi hình (chỉ có trong data router). */
function LeaveGuard({ active }: { active: boolean }) {
  const blocker = useBlocker(active);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Bài làm đang được ghi hình. Rời trang sẽ dừng bài làm này. Bạn có chắc?')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  return null;
}

function ExamBar({ kind, course, snapshot, elapsed, stage, onCancel }: {
  kind: PulseExamKind;
  course: PulseCourseSummary;
  snapshot: ProctorSnapshot;
  elapsed: number;
  stage: string;
  onCancel: () => void;
}) {
  const recording = snapshot.phase === 'recording' || snapshot.phase === 'locked' || stage === 'work';
  const leaves = snapshot.events.filter((e) => e.kind === 'TAB_HIDDEN' || e.kind === 'FOCUS_LOST').length;

  return (
    <header className="pu-exam-bar">
      <div className="pu-exam-bar-title">
        <img src={pulseMark} alt="" />
        <span>
          <small>{KIND_LABEL[kind]}</small>
          <strong>{course.code} · {toSentenceCase(course.title)}</strong>
        </span>
      </div>
      {recording && (
        <div className="pu-exam-status" role="status" aria-label="Trạng thái bài thi">
          <span className="pu-rec"><i aria-hidden />Đang ghi hình · <time>{clock(elapsed)}</time></span>
          <span className={`pu-exam-leaves ${leaves > 0 ? 'has-leaves' : ''}`}>
            Rời bài làm: {leaves} lần
          </span>
        </div>
      )}
      <div className="pu-exam-bar-actions">
        {stage === 'work' && (
          <button type="button" className="pu-exam-leave" onClick={onCancel}>
            Hủy bài làm
          </button>
        )}
        {(stage === 'check' || stage === 'done') && (
          <Link to={PULSE_PATHS.course(course.courseId)} className="pu-exam-leave">Thoát</Link>
        )}
      </div>
    </header>
  );
}

function DeviceCheck(props: ProctoredExamProps & {
  controller: ProctorController;
  snapshot: ProctorSnapshot;
  agree: boolean;
  onAgree: (value: boolean) => void;
  onStart: () => void;
  startError: string | null;
}) {
  const { controller, snapshot, course } = props;
  const supported = proctoringSupported();

  const readyDevices = [
    { label: 'Màn hình', ready: snapshot.screen === 'on' },
    { label: 'Camera', ready: snapshot.camera === 'on' },
    { label: 'Micro', ready: snapshot.mic === 'on' },
    { label: 'Cam kết', ready: props.agree },
  ];

  const readyCount = (snapshot.screen === 'on' ? 1 : 0) + (snapshot.camera === 'on' ? 1 : 0) + (snapshot.mic === 'on' ? 1 : 0);
  const allDevicesReady = readyCount === 3;
  const canStart = allDevicesReady && props.agree && supported && snapshot.phase !== 'starting';

  return (
    <main className="pu-exam-body">
      <div className="pu-exam-head">
        <div className="pu-step-badge">
          <ShieldCheck size={14} aria-hidden />
          <span>Bước 1/2: Kiểm tra thiết bị giám sát</span>
        </div>
        <h1>Bật đủ ba thiết bị để bắt đầu.</h1>
        <p>
          Bài làm được ghi lại để {props.reviewer?.name ?? 'người chấm'} xem khi đánh giá: toàn bộ màn hình, hình từ camera và âm thanh từ micro.
          Dữ liệu chỉ hiển thị cho bạn và người chấm.
        </p>
      </div>
      {props.intro}
      {props.assignmentContent}
      {!supported && (
        <div className="pu-notice warning" role="alert">
          Trình duyệt này không hỗ trợ ghi màn hình. Hãy mở trang bằng Chrome hoặc Edge bản mới trên máy tính.
        </div>
      )}
      <div className="pu-check-grid">
        <div className="pu-stack" style={{ gap: 14 }}>
          {/* Device 1: Screen */}
          <div className={`pu-device ${snapshot.screen === 'on' ? 'on' : snapshot.screen === 'idle' ? '' : 'error'}`}>
            <span className="pu-device-icon" aria-hidden><Monitor size={22} /></span>
            <div className="pu-device-text">
              <strong>Chia sẻ toàn bộ màn hình</strong>
              <span>Trong hộp thoại của trình duyệt, chọn Toàn bộ màn hình. Chia sẻ một tab hoặc cửa sổ sẽ bị từ chối.</span>
              {snapshot.screen === 'on' ? (
                <span className="pu-device-badge ok"><Check size={13} aria-hidden /> Đã chọn toàn bộ màn hình</span>
              ) : snapshot.screen === 'requesting' ? (
                <span className="pu-device-badge waiting">Đang chờ trình duyệt…</span>
              ) : snapshot.screen === 'wrong-surface' ? (
                <span className="pu-device-badge bad">Đã chọn tab/cửa sổ — cần toàn bộ màn hình</span>
              ) : snapshot.screen === 'denied' ? (
                <span className="pu-device-badge bad">Chưa được cho phép chia sẻ màn hình</span>
              ) : (
                <span className="pu-device-badge bad">Chưa bật</span>
              )}
            </div>
            {snapshot.screen === 'on' && (
              <StreamPreview stream={controller.screenStream} version={snapshot.streamVersion} label="Xem trước màn hình đang chia sẻ" />
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

          {/* Device 2: Camera */}
          <div className={`pu-device ${snapshot.camera === 'on' ? 'on' : snapshot.camera === 'idle' ? '' : 'error'}`}>
            <span className="pu-device-icon" aria-hidden><Video size={22} /></span>
            <div className="pu-device-text">
              <strong>Bật camera</strong>
              <span>Khuôn mặt của bạn cần nằm rõ trong khung hình suốt thời gian làm bài.</span>
              {snapshot.camera === 'on' ? (
                <span className="pu-device-badge ok">
                  <Check size={13} aria-hidden />
                  {snapshot.faceCheck === 'on' ? 'Đã nhận diện khuôn mặt' : 'Camera đang hoạt động'}
                </span>
              ) : snapshot.camera === 'requesting' ? (
                <span className="pu-device-badge waiting">Đang khởi động camera…</span>
              ) : snapshot.camera === 'denied' ? (
                <span className="pu-device-badge bad">Chưa được cho phép truy cập camera</span>
              ) : (
                <span className="pu-device-badge bad">Chưa bật</span>
              )}
            </div>
            {snapshot.camera === 'on' && (
              <StreamPreview stream={controller.cameraStream} version={snapshot.streamVersion} label="Xem trước camera" mirrored />
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

          {/* Device 3: Mic */}
          <div className={`pu-device ${snapshot.mic === 'on' ? 'on' : snapshot.mic === 'idle' ? '' : 'error'}`}>
            <span className="pu-device-icon" aria-hidden><Mic size={22} /></span>
            <div className="pu-device-text">
              <strong>Bật micro</strong>
              <span>Âm thanh xung quanh được ghi cùng camera trong suốt bài làm.</span>
              {snapshot.mic === 'on' ? (
                <span className="pu-device-badge ok"><Check size={13} aria-hidden /> Đang thu âm tốt</span>
              ) : snapshot.mic === 'requesting' ? (
                <span className="pu-device-badge waiting">Đang kiểm tra micro…</span>
              ) : snapshot.mic === 'denied' ? (
                <span className="pu-device-badge bad">Chưa được cho phép truy cập micro</span>
              ) : (
                <span className="pu-device-badge bad">Chưa bật</span>
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

          {/* Khung Quy chế Giám sát & Cam kết Liêm chính Năng lực Số */}
          <div className="pu-compliance-section" role="region" aria-label="Quy chế phòng thi có giám sát">
            <div className="pu-compliance-header">
              <div className="pu-compliance-title-group">
                <ShieldCheck size={20} className="text-indigo-600" aria-hidden />
                <div>
                  <h3 className="pu-compliance-h3">Thỏa ước Liêm chính & Quy chế Phòng thi Số</h3>
                  <p className="pu-compliance-sub">
                    Bảo đảm giá trị minh bạch của chứng nhận theo Thông tư 02/2025/TT-BGDĐT
                  </p>
                </div>
              </div>
              <span className="pu-compliance-badge">
                <ScanFace size={14} className="text-emerald-600" aria-hidden />
                Edge AI · Xử lý tại chỗ
              </span>
            </div>

            <div className="pu-rules-grid">
              <div className="pu-rule-card">
                <div className="pu-rule-icon indigo">
                  <Monitor size={18} aria-hidden />
                </div>
                <div className="pu-rule-content">
                  <strong>Độc lập làm bài & Giữ nguyên tab</strong>
                  <p>Tự làm bài 100%, không chuyển tab hoặc rời màn hình. Mọi lần rời tab quá 10 giây được ghi tự động vào Nhật ký kiểm toán.</p>
                </div>
              </div>

              <div className="pu-rule-card">
                <div className="pu-rule-icon emerald">
                  <ScanFace size={18} aria-hidden />
                </div>
                <div className="pu-rule-content">
                  <strong>AI nhận diện tại chỗ (Bảo vệ riêng tư)</strong>
                  <p>Mô hình AI phân tích cử chỉ trực tiếp trên máy của bạn (Edge AI). Tuyệt đối không gửi hay lưu trữ hình ảnh đời tư thô về máy chủ.</p>
                </div>
              </div>

              <div className="pu-rule-card">
                <div className="pu-rule-icon amber">
                  <Lock size={18} aria-hidden />
                </div>
                <div className="pu-rule-content">
                  <strong>Tự động lưu & 05 phút dự phòng</strong>
                  <p>Nếu mất mạng hoặc ngắt kết nối thiết bị, bài thi tự động lưu tiến trình. Bạn có 05 phút kết nối lại mà không bị tính vi phạm.</p>
                </div>
              </div>

              <div className="pu-rule-card">
                <div className="pu-rule-icon sky">
                  <Award size={18} aria-hidden />
                </div>
                <div className="pu-rule-content">
                  <strong>Thẩm định 48h & Quyền phúc khảo</strong>
                  <p>Bản ghi được đồng bộ bảo mật cho bạn và {props.reviewer?.name ?? 'người chấm'} thẩm định trong vòng 48h, có quyền phúc khảo trong 05 ngày.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pu-action-footer">
            <label className="pu-commit">
              <input
                type="checkbox"
                checked={props.agree}
                onChange={(event) => props.onAgree(event.target.checked)}
              />
              <span>Tôi xác nhận đã hiểu rõ quy chế và quyền lợi thí sinh; cam kết tự làm bài bằng năng lực thực tế để bảo chứng giá trị chứng nhận năng lực số.</span>
            </label>

            <div className="pu-action-row">
              <div className="pu-checklist-chips" aria-label="Tiến độ kiểm tra thiết bị">
                {readyDevices.map((item) => (
                  <span
                    key={item.label}
                    className={`pu-checklist-chip ${item.ready ? 'is-ready' : ''}`}
                  >
                    <span className="pu-chip-dot" />
                    {item.label}
                  </span>
                ))}
              </div>

              <button
                type="button"
                className={`pu-start-btn ${canStart ? 'is-ready' : 'is-disabled'}`}
                disabled={!canStart}
                onClick={props.onStart}
              >
                {snapshot.phase === 'starting' ? (
                  'Đang bắt đầu…'
                ) : !allDevicesReady ? (
                  `Bắt đầu làm bài (Đã bật ${readyCount}/3 thiết bị)`
                ) : !props.agree ? (
                  'Bắt đầu làm bài (Cần tích cam kết)'
                ) : (
                  <>
                    <span>Bắt đầu làm bài ngay</span>
                    <ArrowRight size={16} aria-hidden />
                  </>
                )}
              </button>
            </div>
          </div>

          {props.startError && <div className="pu-notice warning" role="alert">{props.startError}</div>}
        </div>

        {/* Right Card: Exam Brief */}
        <aside className="pu-exam-summary" aria-label="Thông tin bài thi">
          <h2 className="pu-summary-title">Thông tin bài thi</h2>
          <strong>{course.code} · {toSentenceCase(course.title)}</strong>
          <span className="pu-summary-sub">{props.domainName} · Cấp độ {levelName(course.tier)}</span>
          <dl>
            <div><dt>Loại bài thi</dt><dd>{KIND_LABEL[props.kind]}</dd></div>
            <div><dt>Cấu trúc đề</dt><dd>{props.choiceCount > 0 ? `${props.choiceCount} câu trắc nghiệm + tự luận` : 'Tự luận'}</dd></div>
            <div><dt>Lượt làm</dt><dd>{props.attemptLabel}</dd></div>
            <div><dt>Người đánh giá</dt><dd>{props.reviewer?.name ?? 'Chưa phân công'}</dd></div>
            <div><dt>Giám sát</dt><dd>Màn hình, camera, micro</dd></div>
          </dl>
          <div className="pu-summary-outcomes">
            <div className="pu-outcome-item ok">
              <span className="pu-outcome-pill ok">Đạt</span>
              <p>{props.outcomes.pass}</p>
            </div>
            <div className="pu-outcome-item no">
              <span className="pu-outcome-pill no">Chưa đạt</span>
              <p>{props.outcomes.fail}</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

/** Phần 1 · Trắc nghiệm: mỗi câu một nhóm phương án; không cho biết đúng sai khi đang làm. */
function ChoicePart({ questions, answers, passMark, disabled, onChoose }: {
  questions: PulseExamQuestion[];
  answers: Record<string, string>;
  passMark: number;
  disabled: boolean;
  onChoose: (questionId: string, optionId: string) => void;
}) {
  const answered = questions.filter((q) => answers[q.questionId]).length;
  return (
    <section className="pu-quiz pu-exam-choice" aria-labelledby="pu-choice-title">
      <div className="pu-exam-choice-head">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Phần 1 · Trắc nghiệm</span>
          <h2 id="pu-choice-title" className="mt-1">Chọn một đáp án cho mỗi câu.</h2>
          <p>{questions.length} câu, đúng từ {passMark} câu thì phần này đạt.</p>
        </div>
        <span className="pu-exam-choice-count" aria-live="polite">{answered}/{questions.length} đã chọn</span>
      </div>
      {questions.map((question) => (
        <fieldset id={`q-${question.questionId}`} key={question.questionId} disabled={disabled} tabIndex={-1}>
          <legend><span>{String(question.number).padStart(2, '0')}</span>{question.content}</legend>
          {question.options.map((option) => (
            <label key={option.optionId}>
              <input
                type="radio"
                name={`choice-${question.questionId}`}
                value={option.optionId}
                checked={answers[question.questionId] === option.optionId}
                onChange={() => onChoose(question.questionId, option.optionId)}
              />
              <span>{option.content}</span>
            </label>
          ))}
        </fieldset>
      ))}
    </section>
  );
}

function StreamPreview({ stream, version, label, mirrored }: { stream: MediaStream | null; version: number; label: string; mirrored?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) void video.play().catch(() => undefined);
  }, [stream, version]);
  return <video ref={ref} className={`pu-preview${mirrored ? ' mirrored' : ''}`} muted playsInline autoPlay aria-label={label} />;
}

function MicMeter({ level }: { level: number }) {
  const bars = [0.35, 0.6, 0.85, 0.55, 1, 0.7, 0.45, 0.8, 0.5];
  return (
    <span className="pu-meter" role="meter" aria-label="Mức âm thanh của micro" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)}>
      {bars.map((weight, index) => {
        const scale = Math.max(0.18, Math.min(1, level * weight * 1.6));
        return (
          <i
            key={index}
            style={{
              transform: `scaleY(${scale})`,
              transformOrigin: 'bottom',
              opacity: scale > 0.25 ? 1 : 0.45,
            }}
          />
        );
      })}
    </span>
  );
}

const LOCK_TEXT: Record<LockReason, { title: string; action: string }> = {
  SCREEN: { title: 'Bạn đã ngừng chia sẻ màn hình', action: 'Chia sẻ lại toàn bộ màn hình' },
  CAMERA: { title: 'Camera đã tắt', action: 'Bật lại camera' },
  MIC: { title: 'Micro đã tắt', action: 'Bật lại micro' },
};

function LockOverlay({ controller, snapshot, elapsed }: { controller: ProctorController; snapshot: ProctorSnapshot; elapsed: number }) {
  const [busy, setBusy] = useState(false);
  const reason = snapshot.lockReasons[0];
  if (!reason) return null;
  const stoppedAt = [...snapshot.events].reverse().find((e) => e.kind === (reason === 'SCREEN' ? 'SHARE_STOPPED' : reason === 'CAMERA' ? 'CAMERA_STOPPED' : 'MIC_STOPPED'));
  const resume = async () => {
    setBusy(true);
    try {
      await controller.resume(reason);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="pu-lock">
      <div className="pu-lock-card" role="alert">
        <span className="pu-lock-icon" aria-hidden>{reason === 'SCREEN' ? <MonitorOff size={22} /> : <ShieldAlert size={22} />}</span>
        <strong>Bài làm đang tạm khóa</strong>
        <span>
          {LOCK_TEXT[reason].title} lúc {clock(stoppedAt?.offsetMs ?? elapsed)}. Sự kiện đã được ghi vào nhật ký cho người chấm. Bật lại để làm
          tiếp; đồng hồ vẫn chạy{reason === 'SCREEN' ? ', camera và micro vẫn ghi' : ''}.
        </span>
        {snapshot.deviceError && <span className="pu-lock-error">{snapshot.deviceError}</span>}
        <button type="button" className={btn()} disabled={busy} onClick={resume}>{LOCK_TEXT[reason].action}</button>
      </div>
    </div>
  );
}

const FACE_ALERT_TEXT: Record<FaceSignalKind, string> = {
  FACE_MISSING: 'Không thấy khuôn mặt — hãy ngồi vào khung hình',
  MULTIPLE_FACES: 'Có nhiều người trong khung hình',
  LOOKING_AWAY: 'Hãy nhìn vào màn hình bài làm',
};

/** Trạng thái nhận diện khuôn mặt trên máy, kèm lời nhắc khi đang có bất thường. */
function FaceRow({ snapshot }: { snapshot: ProctorSnapshot }) {
  if (snapshot.faceCheck === 'idle') return null;
  const alert = snapshot.faceAlert;
  const text = snapshot.faceCheck === 'loading' ? 'Đang tải…' : snapshot.faceCheck === 'off' ? 'Không chạy được' : alert ? 'Cần chú ý' : 'Bình thường';
  return (
    <div className={`pu-proctor-row${alert ? ' off' : ''}`} role={alert ? 'alert' : undefined}>
      <ScanFace size={17} aria-hidden />
      <span>{alert ? FACE_ALERT_TEXT[alert] : 'Nhận diện khuôn mặt'}</span>
      <b>{text}</b>
    </div>
  );
}

function getEventBadge(kind: string): 'ok' | 'warn' | 'crit' {
  if (['TAB_HIDDEN', 'FOCUS_LOST', 'SHARE_STOPPED', 'CAMERA_STOPPED', 'MIC_STOPPED'].includes(kind)) return 'crit';
  if (['LOOKING_AWAY', 'MULTIPLE_FACES', 'FACE_MISSING'].includes(kind)) return 'warn';
  return 'ok';
}

function ProctorPanel({
  controller,
  snapshot,
  questions = [],
  answers = {},
  essayDone = false,
  onJumpQuestion,
  onJumpEssay,
}: {
  controller: ProctorController;
  snapshot: ProctorSnapshot;
  questions?: PulseExamQuestion[];
  answers?: Record<string, string>;
  essayDone?: boolean;
  onJumpQuestion?: (qId: string) => void;
  onJumpEssay?: () => void;
}) {
  const screenOff = snapshot.lockReasons.includes('SCREEN');
  const answeredCount = questions.filter((q) => answers[q.questionId]).length;

  return (
    <aside className="pu-proctor" aria-label="Giám sát bài làm">
      <div className="pu-proctor-camera">
        {snapshot.camera === 'on' && !snapshot.lockReasons.includes('CAMERA')
          ? <StreamPreview stream={controller.cameraStream} version={snapshot.streamVersion} label="Camera của bạn" mirrored />
          : <span className="pu-proctor-off">Camera đã tắt</span>}
        <span className="pu-proctor-tag"><i aria-hidden />Camera</span>
      </div>
      <div className={`pu-proctor-row${snapshot.lockReasons.includes('MIC') ? ' off' : ''}`}>
        <Mic size={17} aria-hidden />
        <span>Micro</span>
        <MicMeter level={snapshot.micLevel} />
      </div>
      <div className={`pu-proctor-row${screenOff ? ' off' : ''}`}>
        <Monitor size={17} aria-hidden />
        <span>Toàn bộ màn hình</span>
        <b>{screenOff ? 'Đã ngừng' : 'Đang chia sẻ'}</b>
      </div>
      <FaceRow snapshot={snapshot} />
      {snapshot.uploadError && <div className="pu-proctor-row off">{snapshot.uploadError}</div>}

      {/* Bảng câu hỏi nhanh (Question Navigator) */}
      {questions.length > 0 && (
        <div className="pu-question-nav" aria-label="Bảng câu hỏi nhanh">
          <div className="pu-nav-head">
            <span className="pu-nav-title">Danh sách câu hỏi</span>
            <span className="pu-nav-count">{answeredCount}/{questions.length}</span>
          </div>
          <div className="pu-nav-grid">
            {questions.map((q, idx) => {
              const isDone = Boolean(answers[q.questionId]);
              const num = String(idx + 1).padStart(2, '0');
              return (
                <button
                  key={q.questionId}
                  type="button"
                  onClick={() => onJumpQuestion?.(q.questionId)}
                  className={`pu-q-btn ${isDone ? 'is-done' : ''}`}
                  title={`Câu ${num}: ${isDone ? 'Đã trả lời' : 'Chưa trả lời'}`}
                >
                  {num}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onJumpEssay?.()}
              className={`pu-q-btn pu-q-essay ${essayDone ? 'is-done' : ''}`}
              title={`Tự luận: ${essayDone ? 'Đã viết' : 'Chưa đủ điều kiện'}`}
            >
              TL
            </button>
          </div>
        </div>
      )}

      {/* Nhật ký giám sát */}
      <div className="pu-proctor-log">
        <div className="pu-log-header">
          <span className="pu-log-title">Nhật ký giám sát</span>
          <span className="pu-log-count">{snapshot.events.length} sự kiện</span>
        </div>
        <ol className="pu-log-list">
          {snapshot.events.map((event, index) => {
            const tone = getEventBadge(event.kind);
            return (
              <li key={`${event.kind}-${index}`} className="pu-log-item">
                <span className={`pu-log-dot ${tone}`} aria-hidden />
                <time>{clock(event.offsetMs)}</time>
                <span className="pu-log-text">
                  {PROCTORING_EVENT_LABELS[event.kind]}
                  {event.durationMs ? ` (${formatDuration(event.durationMs)})` : ''}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <small>Người chấm xem nhật ký này cùng bản ghi.</small>
    </aside>
  );
}
