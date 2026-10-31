import { useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Link, UNSAFE_DataRouterContext } from 'react-router-dom';
import { ArrowRight, Check, Mic, Monitor, Video } from 'lucide-react';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import { useSubmitTrialExam } from '@/hooks/use-trial-program';
import { trialProgramService, type TrialEssayPrompt, type TrialExamQuestion, type TrialExamSession } from '@/services/trial-program.service';
import type { PulseProctoringSession } from '@/services/pulse.service';
import { btn } from '@/features/pulse-employee/lib/button';
import { clock, pulseErrorMessage } from '@/features/pulse-employee/lib/labels';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';
import { ProctorController, proctoringSupported, type DeviceState, type ProctorSnapshot } from '@/features/pulse-employee/exam/proctor';
import { LeaveGuard, LockOverlay, MicMeter, ProctorPanel, StreamPreview } from '@/features/pulse-employee/exam/ProctoredExam';
import { deviceText, useNow } from '@/features/pulse-employee/exam/exam-helpers';
import { TIER_LABELS, formatWhen } from '../lib/trial-format';

const MIN_ESSAY = 30;
const MAX_ESSAY = 6000;
const TIERS = [1, 2, 3] as const;

function useTrialProctor() {
  const [controller] = useState(
    () => new ProctorController('', 'FINAL', { startSession: async () => (await trialProgramService.startExam()).data.data! as unknown as PulseProctoringSession }),
  );
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  useEffect(() => () => controller.dispose(), [controller]);
  return { controller, snapshot };
}

/**
 * Phòng thi của bài đánh giá tổng hợp dùng thử: chia sẻ toàn bộ màn hình + camera + micro như bài làm Pulse; đề gồm ba phần
 * (Cơ bản, Trung cấp, Nâng cao), mỗi phần có trắc nghiệm và một bài tự luận. Nộp một lần cho mentor chấm.
 */
export function TrialExam({ organizationName, deadline }: { organizationName: string; deadline?: string | null }) {
  const { controller, snapshot } = useTrialProctor();
  const submitExam = useSubmitTrialExam();
  const [stage, setStage] = useState<'check' | 'work' | 'submitting' | 'done'>('check');
  const [questions, setQuestions] = useState<TrialExamQuestion[]>([]);
  const [essays, setEssays] = useState<TrialEssayPrompt[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [texts, setTexts] = useState<Record<number, string>>({ 1: '', 2: '', 3: '' });
  const [tier, setTier] = useState<number>(1);
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
      setEssays(session.essays);
      setStage('work');
    } catch (err) {
      setError(pulseErrorMessage(err, 'Chưa vào được phòng thi. Kiểm tra thiết bị và thử lại.'));
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
        essayBasic: texts[1]!.trim(),
        essayIntermediate: texts[2]!.trim(),
        essayAdvanced: texts[3]!.trim(),
      });
      controller.markFinished();
      setStage('done');
    } catch (err) {
      setError(pulseErrorMessage(err, 'Chưa nộp được bài. Hãy thử lại.'));
    }
  };

  const unanswered = questions.filter((q) => !answers[q.questionId]).length;
  const shortEssays = TIERS.filter((t) => texts[t]!.trim().length < MIN_ESSAY);
  const tierDone = (t: number) =>
    questions.filter((q) => q.tier === t).every((q) => answers[q.questionId]) && texts[t]!.trim().length >= MIN_ESSAY;

  return (
    <div className="pu-exam tp-vars" data-testid="trial-exam">
      {dataRouter && <LeaveGuard active={busy} />}
      <header className="pu-exam-bar">
        <div className="pu-exam-bar-title">
          <img src={pulseMark} alt="" />
          <span>
            <small>Bài đánh giá năng lực</small>
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
            <div className="tp-tabs" role="group" aria-label="Phần của đề">
              {TIERS.map((t) => (
                <button key={t} type="button" aria-pressed={tier === t} onClick={() => setTier(t)}>
                  {tierDone(t) && <Check size={12} strokeWidth={3} aria-hidden />} Phần {t} · {TIER_LABELS[t]}
                </button>
              ))}
            </div>

            {TIERS.filter((t) => t === tier).map((t) => {
              const items = questions.filter((q) => q.tier === t);
              const essay = essays.find((e) => e.tier === t);
              const text = texts[t]!;
              return (
                <section key={t} className="tp-exam-part pu-surface pu-pad" aria-label={`Phần ${t}`}>
                  <header>
                    <div className="space-y-1">
                      <h2>Phần {t} · Cấp độ {TIER_LABELS[t]}</h2>
                      <p className="text-xs text-slate-500">Đánh giá 6 lĩnh vực năng lực số chuẩn Khung TT02 ở mức độ {TIER_LABELS[t]}.</p>
                    </div>
                    <span className="tp-muted font-bold text-xs">{items.filter((q) => answers[q.questionId]).length}/{items.length} câu đã trả lời</span>
                  </header>
                  {items.map((q) => (
                    <fieldset key={q.questionId} className="tp-q" disabled={snapshot.phase !== 'recording'}>
                      <legend>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="inline-flex items-center rounded-md bg-blue-100 text-blue-800 px-2 py-0.5 text-[11px] font-bold">
                            Lĩnh vực {q.domainNumber}: {q.domainName}
                          </span>
                          <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-medium">
                            Mức {t}: {TIER_LABELS[t]}
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
                  {essay && (
                    <label className="tp-field" style={{ color: 'var(--tp-fg)' }}>
                      <strong>Tự luận · {essay.title}</strong>
                      <span className="tp-muted">{essay.prompt}</span>
                      <textarea
                        value={text}
                        maxLength={MAX_ESSAY}
                        disabled={snapshot.phase !== 'recording'}
                        onChange={(e) => setTexts((prev) => ({ ...prev, [t]: e.target.value }))}
                      />
                      <small className="tp-muted">{text.trim().length < MIN_ESSAY ? `Ít nhất ${MIN_ESSAY} ký tự` : 'Đủ độ dài'} · {text.trim().length}/{MAX_ESSAY}</small>
                    </label>
                  )}
                  <div className="tp-row" style={{ justifyContent: 'space-between' }}>
                    <button type="button" className={btn('outline', true)} disabled={t === 1} onClick={() => setTier(t - 1)}>Phần trước</button>
                    {t < 3 && <button type="button" className={btn('primary', true)} onClick={() => setTier(t + 1)}>Phần tiếp</button>}
                  </div>
                </section>
              );
            })}

            <section className="pu-surface pu-pad tp-row" style={{ justifyContent: 'space-between' }}>
              <span className="tp-muted">
                {unanswered > 0 || shortEssays.length > 0
                  ? `Còn ${unanswered} câu trắc nghiệm${shortEssays.length ? `, ${shortEssays.length} bài tự luận` : ''}`
                  : 'Đã làm đủ ba phần'}
              </span>
              {stage === 'work' && (
                <button type="button" className={btn()} disabled={unanswered > 0 || shortEssays.length > 0 || snapshot.phase !== 'recording'} onClick={() => setConfirm(true)}>
                  Nộp bài
                </button>
              )}
              {confirm && stage === 'work' && (
                <div className="pu-exam-confirm inline" role="alertdialog" aria-label="Xác nhận nộp bài" style={{ width: '100%' }}>
                  <strong>Nộp bài và dừng ghi hình?</strong>
                  <span>Sau khi nộp không sửa được.</span>
                  <div className="pu-row">
                    <button type="button" className={btn('primary', true)} onClick={submit}>Nộp bài</button>
                    <button type="button" className={btn('outline', true)} onClick={() => setConfirm(false)}>Làm tiếp</button>
                  </div>
                </div>
              )}
              {stage === 'submitting' && (
                <div className="pu-exam-confirm inline" role="status" style={{ width: '100%' }}>
                  <strong>{error ? 'Chưa nộp được bài' : 'Đang tải bản ghi và nộp bài…'}</strong>
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
            <h1 id="tp-done-title">Đã nộp bài.</h1>
            <p>Mentor của DigiTalent sẽ chấm. Kết quả hiện khi doanh nghiệp nhận bảng năng lực.</p>
            <div className="pu-row">
              <Link to={PULSE_PATHS.trialTest} className={btn()}>Xong</Link>
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
        <span className="pu-eyebrow">Chuẩn bị</span>
        <h1>Bật màn hình, camera và micro.</h1>
        <p>Bài làm được ghi lại cho mentor chấm.{deadline ? ` Hạn: ${formatWhen(deadline)}.` : ''}</p>
      </div>
      {!supported && <div className="pu-notice warning" role="alert">Hãy dùng Chrome hoặc Edge bản mới trên máy tính.</div>}
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
            <span>Tôi tự làm bài và đồng ý ghi hình trong lúc làm.</span>
          </label>
          <div className="pu-row">
            <button type="button" className={btn()} disabled={!ready || snapshot.phase === 'starting'} onClick={onStart}>
              {snapshot.phase === 'starting' ? 'Đang mở…' : <>Bắt đầu <ArrowRight size={15} aria-hidden /></>}
            </button>
          </div>
          {error && <div className="pu-notice warning" role="alert">{error}</div>}
        </div>
        <aside className="pu-exam-summary" aria-label="Đề bài">
          <span className="pu-mini">Đề bài</span>
          <strong>3 phần · Cơ bản → Nâng cao</strong>
          <dl>
            <div><dt>Mỗi phần</dt><dd>Trắc nghiệm + 1 tự luận</dd></div>
            <div><dt>Số lần</dt><dd>Một lần</dd></div>
            <div><dt>Người chấm</dt><dd>Mentor DigiTalent</dd></div>
            <div><dt>Ghi hình</dt><dd>Màn hình, camera, micro</dd></div>
          </dl>
          <small className="tp-muted">Rời tab, tắt camera hay ngừng chia sẻ đều được ghi vào nhật ký.</small>
        </aside>
      </div>
    </main>
  );
}
