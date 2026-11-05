import { useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Link, UNSAFE_DataRouterContext } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Mic, Monitor, Video } from 'lucide-react';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import { useSubmitTrialExam } from '@/hooks/use-trial-program';
import { trialProgramService, type TrialExamQuestion, type TrialExamSession } from '@/services/trial-program.service';
import type { PulseProctoringSession } from '@/services/pulse.service';
import { btn } from '@/features/pulse-employee/lib/button';
import { clock, pulseErrorMessage } from '@/features/pulse-employee/lib/labels';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';
import { ProctorController, proctoringSupported, type DeviceState, type ProctorSnapshot } from '@/features/pulse-employee/exam/proctor';
import { LeaveGuard, LockOverlay, MicMeter, ProctorPanel, StreamPreview } from '@/features/pulse-employee/exam/ProctoredExam';
import { deviceText, useNow } from '@/features/pulse-employee/exam/exam-helpers';
import { TIER_LABELS, formatWhen } from '../lib/trial-format';

const DOMAIN_NUMBERS = [1, 2, 3, 4, 5, 6] as const;

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
 * Đề gồm 18 câu trắc nghiệm phủ 6 lĩnh vực khung TT02 (mỗi lĩnh vực 3 câu: Cơ bản, Trung cấp, Nâng cao).
 * Không có tự luận. Nộp bài xong hệ thống chấm tự động và ghi nhận kết quả.
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

  return (
    <div className="pu-exam tp-vars" data-testid="trial-exam">
      {dataRouter && <LeaveGuard active={busy} />}
      <header className="pu-exam-bar">
        <div className="pu-exam-bar-title">
          <img src={pulseMark} alt="" />
          <span>
            <small>Bài đánh giá năng lực đầu vào</small>
            <strong>{organizationName}</strong>
          </span>
        </div>
        {recording && (
          <div className="pu-exam-status" role="status" aria-label="Trạng thái ghi hình">
            <span className="pu-rec"><i aria-hidden />Đang ghi <time>{clock(elapsed)}</time></span>
            {(['screen', 'camera', 'mic'] as const).map((key) => (
              <span key={key} className={`pu-chip${snapshot[key] === 'on' ? '' : ' off'}`}>
                {key === 'screen' ? 'Màn hình' : key === 'camera' ? 'Camera' : 'Micro'}
              </span>
            ))}
          </div>
        )}
        {stage !== 'work' && stage !== 'submitting' && <Link to={PULSE_PATHS.trialTest} className="pu-exam-leave">Thoát</Link>}
      </header>

      {stage === 'check' && (
        <DeviceCheck controller={controller} snapshot={snapshot} agree={agree} onAgree={setAgree} onStart={start} error={error} deadline={deadline} />
      )}

      {(stage === 'work' || stage === 'submitting') && (
        <main className="pu-exam-body pu-work-grid">
          <div className="pu-work tp" style={{ gap: 14 }}>
            {/* Thanh chọn 6 lĩnh vực */}
            <div className="tp-tabs" role="group" aria-label="Danh sách lĩnh vực">
              {DOMAIN_NUMBERS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={domainNumber === d}
                  onClick={() => setDomainNumber(d)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  {domainDone(d) && <Check size={12} strokeWidth={3} aria-hidden />}
                  <span>LV {d}: {DOMAIN_NAMES[d]?.split(' ')[0] ?? `Lĩnh vực ${d}`}</span>
                </button>
              ))}
            </div>

            {/* Khung hiển thị câu hỏi của Lĩnh vực hiện tại */}
            <section className="tp-exam-part pu-surface pu-pad" aria-label={`Lĩnh vực ${domainNumber}`}>
              <header style={{ alignItems: 'flex-start' }}>
                <div className="space-y-1">
                  <h2>Lĩnh vực {domainNumber}: {currentDomainName}</h2>
                  <p className="text-xs text-slate-500">
                    3 câu hỏi trắc nghiệm đánh giá theo 3 cấp độ (Cơ bản · Trung cấp · Nâng cao) chuẩn Khung TT02.
                  </p>
                </div>
                <span className="tp-muted font-bold text-xs">
                  {answeredInDomain}/{currentQuestions.length} câu đã trả lời
                </span>
              </header>

              {currentQuestions.map((q) => (
                <fieldset key={q.questionId} className="tp-q" disabled={snapshot.phase !== 'recording'}>
                  <legend>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center rounded-md bg-blue-100 text-blue-800 px-2 py-0.5 text-[11px] font-bold">
                        Lĩnh vực {q.domainNumber}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-medium">
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

              <div className="tp-row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
                <button
                  type="button"
                  className={btn('outline', true)}
                  disabled={domainNumber === 1}
                  onClick={() => setDomainNumber((prev) => Math.max(1, prev - 1))}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <ChevronLeft size={16} /> Lĩnh vực trước
                </button>
                {domainNumber < 6 && (
                  <button
                    type="button"
                    className={btn('primary', true)}
                    onClick={() => setDomainNumber((prev) => Math.min(6, prev + 1))}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    Lĩnh vực tiếp theo <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </section>

            {/* Thanh trạng thái nộp bài */}
            <section className="pu-surface pu-pad tp-row" style={{ justifyContent: 'space-between' }}>
              <span className="tp-muted font-medium">
                {unanswered > 0
                  ? `Còn ${unanswered}/18 câu trắc nghiệm chưa trả lời`
                  : 'Đã hoàn thành đầy đủ 18/18 câu trắc nghiệm'}
              </span>
              {stage === 'work' && (
                <button
                  type="button"
                  className={btn()}
                  disabled={unanswered > 0 || snapshot.phase !== 'recording'}
                  onClick={() => setConfirm(true)}
                >
                  Nộp bài
                </button>
              )}
              {confirm && stage === 'work' && (
                <div className="pu-exam-confirm inline" role="alertdialog" aria-label="Xác nhận nộp bài" style={{ width: '100%' }}>
                  <strong>Nộp bài và kết thúc phiên đánh giá?</strong>
                  <span>Hệ thống sẽ tự động đánh giá kết quả bài làm trắc nghiệm của bạn. Sau khi nộp, bạn không thể sửa đổi câu trả lời.</span>
                  <div className="pu-row">
                    <button type="button" className={btn('primary', true)} onClick={submit}>Xác nhận nộp bài</button>
                    <button type="button" className={btn('outline', true)} onClick={() => setConfirm(false)}>Kiểm tra lại</button>
                  </div>
                </div>
              )}
              {stage === 'submitting' && (
                <div className="pu-exam-confirm inline" role="status" style={{ width: '100%' }}>
                  <strong>{error ? 'Chưa nộp được bài' : 'Đang xử lý kết quả và nộp bài…'}</strong>
                  <span>{error ?? (snapshot.pendingChunks ? `Còn ${snapshot.pendingChunks} mẩu ghi hình. Giữ trang mở.` : 'Đang gửi bài.')}</span>
                  {error && <div className="pu-row"><button type="button" className={btn('primary', true)} onClick={submit}>Nộp lại</button></div>}
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
          <section className="pu-exam-done" aria-labelledby="tp-done-title">
            <span className="pu-exam-done-icon" aria-hidden><Check size={26} strokeWidth={2.6} /></span>
            <h1 id="tp-done-title">Đã nộp bài thành công</h1>
            <p>Hệ thống đã tự động ghi nhận và đánh giá 18 câu trắc nghiệm. Kết quả phân tích khoảng cách năng lực và lộ trình học tập sẽ được hiển thị khi Doanh nghiệp phê duyệt và công bố.</p>
            <div className="pu-row">
              <Link to={PULSE_PATHS.trialTest} className={btn()}>Về trang đánh giá</Link>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

function DeviceRow({ icon, title, state, onText, onClick, label, children }: {
  icon: ReactNode;
  title: string;
  state: DeviceState;
  onText: string;
  onClick: () => void;
  label: string;
  children?: ReactNode;
}) {
  const info = deviceText(state, onText);
  return (
    <div className={`pu-device ${info.tone === 'ok' ? 'on' : state === 'idle' ? '' : 'error'}`}>
      <span className="pu-device-icon" aria-hidden>{icon}</span>
      <div className="pu-device-text">
        <strong>{title}</strong>
        <b className={info.tone}>{info.text}</b>
      </div>
      {children}
      <button type="button" className={btn(state === 'on' ? 'outline' : 'primary', true)} disabled={!proctoringSupported() || state === 'requesting'} onClick={onClick}>
        {state === 'on' ? 'Bật lại' : label}
      </button>
    </div>
  );
}

function DeviceCheck({ controller, snapshot, agree, onAgree, onStart, error, deadline }: {
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
  return (
    <main className="pu-exam-body">
      <div className="pu-exam-head">
        <span className="pu-eyebrow">Chuẩn bị phiên đánh giá</span>
        <h1>Kích hoạt màn hình, camera và micro</h1>
        <p>Phiên đánh giá được giám sát toàn trình nhằm bảo đảm tính minh bạch và trung thực.{deadline ? ` Hạn làm bài: ${formatWhen(deadline)}.` : ''}</p>
      </div>
      {!supported && <div className="pu-notice warning" role="alert">Hãy dùng trình duyệt Chrome hoặc Edge bản mới trên máy tính.</div>}
      <div className="pu-check-grid">
        <div className="pu-stack" style={{ gap: 12 }}>
          <DeviceRow icon={<Monitor size={21} />} title="Chia sẻ toàn bộ màn hình" state={snapshot.screen} onText="Đang chia sẻ" label="Chọn màn hình" onClick={() => void controller.requestScreen()}>
            {snapshot.screen === 'on' && <StreamPreview stream={controller.screenStream} version={snapshot.streamVersion} label="Màn hình đang chia sẻ" />}
          </DeviceRow>
          <DeviceRow icon={<Video size={21} />} title="Camera" state={snapshot.camera} onText="Đang bật" label="Bật camera" onClick={() => void controller.requestCamera()}>
            {snapshot.camera === 'on' && <StreamPreview stream={controller.cameraStream} version={snapshot.streamVersion} label="Camera" mirrored />}
          </DeviceRow>
          <DeviceRow icon={<Mic size={21} />} title="Micro" state={snapshot.mic} onText="Đang bật" label="Bật micro" onClick={() => void controller.requestMic()}>
            {snapshot.mic === 'on' && <MicMeter level={snapshot.micLevel} />}
          </DeviceRow>
          {snapshot.deviceError && <div className="pu-notice warning" role="status">{snapshot.deviceError}</div>}
          <label className="pu-commit">
            <input type="checkbox" checked={agree} onChange={(e) => onAgree(e.target.checked)} />
            <span>Tôi cam kết tự làm bài và đồng ý giám sát ghi hình trong suốt quá trình làm bài.</span>
          </label>
          <div className="pu-row">
            <button type="button" className={btn()} disabled={!ready || snapshot.phase === 'starting'} onClick={onStart}>
              {snapshot.phase === 'starting' ? 'Đang mở phiên đánh giá…' : <>Bắt đầu làm bài <ArrowRight size={15} aria-hidden /></>}
            </button>
          </div>
          {error && <div className="pu-notice warning" role="alert">{error}</div>}
        </div>
        <aside className="pu-exam-summary" aria-label="Thông tin bài đánh giá">
          <span className="pu-mini">Cấu trúc đề</span>
          <strong>6 lĩnh vực · 18 câu trắc nghiệm</strong>
          <dl>
            <div><dt>Phân bổ</dt><dd>3 câu / lĩnh vực (Cơ bản → Nâng cao)</dd></div>
            <div><dt>Tự luận</dt><dd>Không có</dd></div>
            <div><dt>Đánh giá</dt><dd>Hệ thống tự động đánh giá</dd></div>
            <div><dt>Giám sát</dt><dd>Toàn màn hình, camera, micro</dd></div>
          </dl>
          <small className="tp-muted">Mọi hành vi chuyển tab, tắt camera hay dừng chia sẻ màn hình đều được ghi nhận vào biên bản giám sát.</small>
        </aside>
      </div>
    </main>
  );
}
