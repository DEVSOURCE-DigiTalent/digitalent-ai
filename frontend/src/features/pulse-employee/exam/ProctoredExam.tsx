import { useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Link, UNSAFE_DataRouterContext, useBlocker, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ExternalLink, Mic, Monitor, MonitorOff, ScanFace, ShieldAlert, Upload, Video } from 'lucide-react';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import type { PulseAnswer, PulseCourseSummary, PulseCriterion, PulseExamKind, PulseExamQuestion, PulseReviewer } from '@/services/pulse.service';
import { btn } from '../lib/button';
import { PROCTORING_EVENT_LABELS, clock, formatDuration, levelName, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';
import { ProctorController, proctoringSupported, type LockReason, type ProctorSnapshot } from './proctor';
import { deviceText, useNow } from './exam-helpers';
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
  const [stage, setStage] = useState<'check' | 'work' | 'submitting' | 'done'>('check');
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState<PulseExamQuestion[]>([]);
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

      {confirmCancel && (
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
            <Brief {...props} choiceCount={questions.length} />
            {questions.length > 0 && (
              <ChoicePart
                questions={questions}
                answers={answers}
                passMark={props.choicePassMark}
                disabled={snapshot.phase !== 'recording'}
                onChoose={(questionId, optionId) => setAnswers((prev) => ({ ...prev, [questionId]: optionId }))}
              />
            )}
            <section className="pu-surface pu-pad pu-answer" aria-labelledby="pu-essay-title">
              <div>
                <span className="pu-mini">{questions.length > 0 ? 'Phần 2 · Tự luận' : 'Tự luận'}</span>
                <h2 id="pu-essay-title" className="pu-panel-title">Tạo ghi chú công việc có thể kiểm tra.</h2>
                <p className="pu-panel-desc">
                  Mô tả một nhiệm vụ thực tế của vị trí {props.positionName ?? 'của bạn'} thuộc lĩnh vực {props.domainName.toLowerCase()}: nêu nguồn,
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
                disabled={snapshot.phase !== 'recording'}
                placeholder="Nêu nguồn, trình bày hành động hoặc phép tính của bạn, rồi giải thích kết luận và bước tiếp theo."
                aria-describedby="pu-evidence-hint"
              />
              <div className="pu-answer-foot">
                <small id="pu-evidence-hint" className={length > 0 && essayShort ? 'error' : undefined}>
                  {length > 0 && essayShort
                    ? `Cần ít nhất ${MIN_EVIDENCE} ký tự (hiện có ${length}).`
                    : `Ít nhất ${MIN_EVIDENCE} ký tự · ${length}/${MAX_EVIDENCE} · ${props.attemptLabel}`}
                  {unanswered > 0 && <span className="pu-answer-missing"> · Còn {unanswered} câu trắc nghiệm chưa chọn</span>}
                </small>
                {stage === 'work' && (
                  <button
                    type="button"
                    className={btn()}
                    disabled={essayShort || unanswered > 0 || snapshot.phase !== 'recording'}
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
          <ProctorPanel controller={controller} snapshot={snapshot} />
        </main>
      )}

      {stage === 'done' && (
        <main className="pu-exam-body pu-exam-narrow">
          <section className="pu-exam-done" aria-labelledby="pu-done-title">
            <span className="pu-exam-done-icon" aria-hidden><Check size={26} strokeWidth={2.6} /></span>
            <h1 id="pu-done-title">Đã nộp {KIND_LABEL[kind].toLowerCase()} {course.code}.</h1>
            <p>
              Bài làm và bản ghi {formatDuration(doneDuration)} đã gửi cho {props.reviewer?.name ?? 'người chấm'}. Kết quả
              {questions.length > 0 ? ' phần trắc nghiệm, phần tự luận' : ''} và nhận xét chỉ hiện khi người chấm chấm xong, ở trang Hôm nay và trong lộ trình.
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
              <Link to={PULSE_PATHS.today} className={btn()}>Về trang Hôm nay</Link>
              <Link to={PULSE_PATHS.path} className={btn('outline')}>Xem lộ trình</Link>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

/** Hỏi lại trước khi rời trang trong lúc đang ghi hình (chỉ có trong data router). */
export function LeaveGuard({ active }: { active: boolean }) {
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
  const recording = snapshot.phase === 'recording' || snapshot.phase === 'locked';
  const leaves = snapshot.events.filter((e) => e.kind === 'TAB_HIDDEN' || e.kind === 'FOCUS_LOST').length;
  const chips: { label: string; on: boolean }[] = [
    { label: 'Màn hình', on: snapshot.screen === 'on' && !snapshot.lockReasons.includes('SCREEN') },
    { label: 'Camera', on: snapshot.camera === 'on' && !snapshot.lockReasons.includes('CAMERA') },
    { label: 'Micro', on: snapshot.mic === 'on' && !snapshot.lockReasons.includes('MIC') },
  ];
  return (
    <header className="pu-exam-bar">
      <div className="pu-exam-bar-title">
        <img src={pulseMark} alt="" />
        <span>
          <small>{KIND_LABEL[kind]}</small>
          <strong>{course.code} · {course.title}</strong>
        </span>
      </div>
      {recording && (
        <div className="pu-exam-status" role="status" aria-label="Trạng thái ghi hình">
          <span className="pu-rec"><i aria-hidden />Đang ghi <time>{clock(elapsed)}</time></span>
          {chips.map((chip) => (
            <span key={chip.label} className={`pu-chip${chip.on ? '' : ' off'}`}>{chip.label} · {chip.on ? 'đang ghi' : 'đã ngừng'}</span>
          ))}
          <span className="pu-exam-leaves">Rời bài làm: {leaves} lần</span>
        </div>
      )}
      {stage === 'check' || stage === 'done' ? (
        <Link to={PULSE_PATHS.course(course.courseId)} className="pu-exam-leave">Thoát</Link>
      ) : stage === 'work' ? (
        <button type="button" className="pu-exam-leave" onClick={onCancel}>Hủy bài làm</button>
      ) : null}
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
  const missing = [
    snapshot.screen !== 'on' && 'chia sẻ màn hình',
    snapshot.camera !== 'on' && 'camera',
    snapshot.mic !== 'on' && 'micro',
    !props.agree && 'lời cam kết',
  ].filter(Boolean) as string[];
  const screen = deviceText(snapshot.screen, 'Đang chia sẻ: toàn bộ màn hình');
  const camera = deviceText(snapshot.camera, 'Camera đang bật');
  const mic = deviceText(snapshot.mic, 'Micro đang bật');

  return (
    <main className="pu-exam-body">
      <div className="pu-exam-head">
        <span className="pu-eyebrow">Chuẩn bị làm bài</span>
        <h1>Bật đủ ba thiết bị để bắt đầu.</h1>
        <p>
          Bài làm được ghi lại để {props.reviewer?.name ?? 'người chấm'} xem khi chấm: toàn bộ màn hình, hình từ camera và âm thanh từ micro.
          Chỉ người chấm bài và bạn xem được bản ghi.
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
        <div className="pu-stack" style={{ gap: 12 }}>
          <div className={`pu-device ${screen.tone === 'ok' ? 'on' : snapshot.screen === 'idle' ? '' : 'error'}`}>
            <span className="pu-device-icon" aria-hidden><Monitor size={21} /></span>
            <div className="pu-device-text">
              <strong>Chia sẻ toàn bộ màn hình</strong>
              <span>Trong hộp thoại của trình duyệt, chọn Toàn bộ màn hình. Chia sẻ một tab hoặc một cửa sổ sẽ bị từ chối.</span>
              <b className={screen.tone}>{screen.text}</b>
            </div>
            {snapshot.screen === 'on' && <StreamPreview stream={controller.screenStream} version={snapshot.streamVersion} label="Xem trước màn hình đang chia sẻ" />}
            <button type="button" className={btn(snapshot.screen === 'on' ? 'outline' : 'primary', true)} disabled={!supported || snapshot.screen === 'requesting'} onClick={() => void controller.requestScreen()}>
              {snapshot.screen === 'on' ? 'Chọn lại' : 'Chọn màn hình'}
            </button>
          </div>
          <div className={`pu-device ${camera.tone === 'ok' ? 'on' : snapshot.camera === 'idle' ? '' : 'error'}`}>
            <span className="pu-device-icon" aria-hidden><Video size={21} /></span>
            <div className="pu-device-text">
              <strong>Bật camera</strong>
              <span>Khuôn mặt của bạn cần nằm trong khung hình suốt thời gian làm bài.</span>
              <b className={camera.tone}>{camera.text}</b>
            </div>
            {snapshot.camera === 'on' && <StreamPreview stream={controller.cameraStream} version={snapshot.streamVersion} label="Xem trước camera" mirrored />}
            <button type="button" className={btn(snapshot.camera === 'on' ? 'outline' : 'primary', true)} disabled={!supported || snapshot.camera === 'requesting'} onClick={() => void controller.requestCamera()}>
              {snapshot.camera === 'on' ? 'Bật lại' : 'Bật camera'}
            </button>
          </div>
          <div className={`pu-device ${mic.tone === 'ok' ? 'on' : snapshot.mic === 'idle' ? '' : 'error'}`}>
            <span className="pu-device-icon" aria-hidden><Mic size={21} /></span>
            <div className="pu-device-text">
              <strong>Bật micro</strong>
              <span>Âm thanh xung quanh được ghi cùng camera trong suốt bài làm.</span>
              <b className={mic.tone}>{mic.text}</b>
            </div>
            {snapshot.mic === 'on' && <MicMeter level={snapshot.micLevel} />}
            <button type="button" className={btn(snapshot.mic === 'on' ? 'outline' : 'primary', true)} disabled={!supported || snapshot.mic === 'requesting'} onClick={() => void controller.requestMic()}>
              {snapshot.mic === 'on' ? 'Bật lại' : 'Bật micro'}
            </button>
          </div>
          {snapshot.deviceError && <div className="pu-notice warning" role="status">{snapshot.deviceError}</div>}

          <ul className="pu-rules">
            <li><ExternalLink size={16} aria-hidden />Không rời khỏi tab bài làm. Mỗi lần rời tab hoặc rời cửa sổ trình duyệt được ghi vào nhật ký giám sát.</li>
            <li><MonitorOff size={16} aria-hidden />Nếu ngừng chia sẻ màn hình, tắt camera hoặc micro, bài tạm khóa cho tới khi bạn bật lại. Sự kiện này cũng được ghi lại.</li>
            <li>
              <ScanFace size={16} aria-hidden />Khuôn mặt được nhận diện ngay trên máy của bạn: vắng mặt, có người khác hoặc nhìn ra ngoài
              màn hình lâu được ghi vào nhật ký. Hình camera không được gửi đi chỉ để phân tích.
            </li>
            <li><Upload size={16} aria-hidden />Bản ghi được tải lên dần trong lúc làm và gửi cùng bài nộp để {props.reviewer?.name ?? 'người chấm'} xem lại.</li>
          </ul>

          <label className="pu-commit">
            <input type="checkbox" checked={props.agree} onChange={(event) => props.onAgree(event.target.checked)} />
            <span>Tôi tự làm bài và đồng ý ghi hình màn hình, camera, micro trong lúc làm.</span>
          </label>
          <div className="pu-row">
            <button type="button" className={btn()} disabled={!supported || missing.length > 0 || snapshot.phase === 'starting'} onClick={props.onStart}>
              {snapshot.phase === 'starting' ? 'Đang bắt đầu…' : <>Bắt đầu làm bài <ArrowRight size={15} aria-hidden /></>}
            </button>
            <small className="pu-check-hint">{missing.length ? `Còn thiếu: ${missing.join(', ')}.` : 'Sẵn sàng. Đồng hồ và bản ghi bắt đầu khi bạn bấm.'}</small>
          </div>
          {props.startError && <div className="pu-notice warning" role="alert">{props.startError}</div>}
        </div>

        <aside className="pu-exam-summary" aria-label="Bài bạn sắp làm">
          <span className="pu-mini">Bài bạn sắp làm</span>
          <strong>{course.code} · {course.title}</strong>
          <span>{props.domainName} · {levelName(course.tier)}</span>
          <dl>
            <div><dt>Loại bài</dt><dd>{KIND_LABEL[props.kind]}</dd></div>
            <div><dt>Đề bài</dt><dd>{props.choiceCount > 0 ? `${props.choiceCount} câu trắc nghiệm + tự luận` : 'Tự luận'}</dd></div>
            <div><dt>Số lần</dt><dd>{props.attemptLabel}</dd></div>
            <div><dt>Người chấm</dt><dd>{props.reviewer?.name ?? '—'}</dd></div>
            <div><dt>Ghi hình</dt><dd>Màn hình, camera, micro</dd></div>
          </dl>
          <div className="pu-exam-outcomes compact">
            <div className="ok"><b>Đạt</b><span>{props.outcomes.pass}</span></div>
            <div className="no"><b>Chưa đạt</b><span>{props.outcomes.fail}</span></div>
          </div>
        </aside>
      </div>
    </main>
  );
}

/** Đầu bài: hai phần của đề và cách chấm. */
function Brief({ kind, course, domainName, reviewer, choiceCount, choicePassMark }: ProctoredExamProps) {
  return (
    <section className="pu-surface pu-pad pu-exam-brief" aria-labelledby="pu-brief-title">
      <span className="pu-mini">{KIND_LABEL[kind]} · {domainName} · {levelName(course.tier)}</span>
      <h1 id="pu-brief-title" className="pu-panel-title">
        {choiceCount > 0 ? `Đề gồm ${choiceCount} câu trắc nghiệm và một bài tự luận.` : 'Đề gồm một bài tự luận.'}
      </h1>
      {choiceCount > 0 && (
        <ol className="pu-brief-criteria" aria-label="Các phần của đề">
          <li>
            <b>1</b>
            <span><strong>Trắc nghiệm</strong><small>{choiceCount} câu từ nội dung khóa, mỗi câu một đáp án. Đúng từ {choicePassMark} câu thì phần này đạt.</small></span>
          </li>
          <li>
            <b>2</b>
            <span><strong>Tự luận</strong><small>Một ghi chú công việc có thể kiểm tra, chấm theo ba tiêu chí.</small></span>
          </li>
        </ol>
      )}
      <p className="pu-panel-desc">
        Bài đạt khi {choiceCount > 0 ? 'cả hai phần đạt' : 'phần tự luận đạt'}. Kết quả chỉ hiện khi {reviewer?.name ?? 'người chấm'} chấm xong.
      </p>
    </section>
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
          <span className="pu-mini">Phần 1 · Trắc nghiệm</span>
          <h2 id="pu-choice-title">Chọn một đáp án cho mỗi câu.</h2>
          <p>{questions.length} câu, đúng từ {passMark} câu thì phần này đạt.</p>
        </div>
        <span className="pu-exam-choice-count" aria-live="polite">{answered}/{questions.length} đã chọn</span>
      </div>
      {questions.map((question) => (
        <fieldset key={question.questionId} disabled={disabled}>
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

export function StreamPreview({ stream, version, label, mirrored }: { stream: MediaStream | null; version: number; label: string; mirrored?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) void video.play().catch(() => undefined);
  }, [stream, version]);
  return <video ref={ref} className={`pu-preview${mirrored ? ' mirrored' : ''}`} muted playsInline autoPlay aria-label={label} />;
}

export function MicMeter({ level }: { level: number }) {
  const bars = [0.35, 0.6, 0.85, 0.55, 1, 0.7, 0.45, 0.8, 0.5];
  return (
    <span className="pu-meter" role="meter" aria-label="Mức âm thanh của micro" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)}>
      {bars.map((weight, index) => (
        <i key={index} style={{ height: `${Math.max(4, Math.round(24 * Math.min(1, level * weight * 1.6)))}px` }} />
      ))}
    </span>
  );
}

const LOCK_TEXT: Record<LockReason, { title: string; action: string }> = {
  SCREEN: { title: 'Bạn đã ngừng chia sẻ màn hình', action: 'Chia sẻ lại toàn bộ màn hình' },
  CAMERA: { title: 'Camera đã tắt', action: 'Bật lại camera' },
  MIC: { title: 'Micro đã tắt', action: 'Bật lại micro' },
};

export function LockOverlay({ controller, snapshot, elapsed }: { controller: ProctorController; snapshot: ProctorSnapshot; elapsed: number }) {
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

const FLAGGED_KINDS: string[] = [
  'TAB_HIDDEN', 'FOCUS_LOST', 'SHARE_STOPPED', 'CAMERA_STOPPED', 'MIC_STOPPED', 'FACE_MISSING', 'MULTIPLE_FACES', 'LOOKING_AWAY',
];

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

export function ProctorPanel({ controller, snapshot }: { controller: ProctorController; snapshot: ProctorSnapshot }) {
  const screenOff = snapshot.lockReasons.includes('SCREEN');
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
      <div className="pu-proctor-log">
        <span className="pu-mini">Nhật ký giám sát</span>
        <ol>
          {snapshot.events.map((event, index) => {
            const flagged = FLAGGED_KINDS.includes(event.kind);
            return (
              <li key={`${event.kind}-${index}`} className={flagged ? 'flagged' : undefined}>
                <time>{clock(event.offsetMs)}</time>
                <span>
                  {PROCTORING_EVENT_LABELS[event.kind]}
                  {event.durationMs ? ` ${formatDuration(event.durationMs)}` : ''}
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
