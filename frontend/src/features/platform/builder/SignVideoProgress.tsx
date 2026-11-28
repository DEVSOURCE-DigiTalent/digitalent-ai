import { useEffect, useState } from 'react';
import { Check, CircleAlert, Loader2 } from 'lucide-react';
import type { SignLanguageVideo, SignRenderStage, SignRendererKind } from '@/services/sign-language-video.service';
import { elapsedLabel, renderStageStates, renderStagesFor, workflowSteps, type StepState } from '@/lib/sign-video';
import { remainingLabel } from '@/lib/progress';
import { usePhaseStart } from '@/features/sign-language/use-phase-start';

function StepMark({ state, n }: { state: StepState; n: number }) {
  if (state === 'done') return <Check size={13} aria-hidden="true" />;
  if (state === 'error') return <CircleAlert size={13} aria-hidden="true" />;
  if (state === 'current') return <span className="pa-sv-step-dot" aria-hidden="true">{n}</span>;
  return <span aria-hidden="true">{n}</span>;
}

const STATE_WORDS: Record<StepState, string> = { done: 'đã xong', current: 'đang ở bước này', todo: 'chưa tới', error: 'bị lỗi' };

/**
 * The whole way to a published sign-language video, in five steps, so the admin always sees where the video is:
 * Phân tích lời thoại → Đủ ký hiệu → Dựng video → Duyệt từng câu → Xuất bản.
 */
export function SignWorkflowSteps({ data, analyzing }: { data: SignLanguageVideo; analyzing: boolean }) {
  const steps = workflowSteps(data, analyzing);
  return (
    <ol className="pa-sv-steps" aria-label="Các bước tạo video ngôn ngữ ký hiệu">
      {steps.map((step, i) => (
        <li key={step.key} className={`is-${step.state}`} aria-current={step.state === 'current' ? 'step' : undefined}>
          <span className="pa-sv-step-mark"><StepMark state={step.state} n={i + 1} /></span>
          <span className="pa-sv-step-text">
            <strong>{step.label}</strong>
            <span className="pa-sv-visually-hidden"> ({STATE_WORDS[step.state]})</span>
            {step.hint && <small>{step.hint}</small>}
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * The render as the server does it, step by step (read every 2 seconds): which step, what exactly ("Chuẩn hóa video
 * ký hiệu 2/5: “bạn”"), how far, for how long. After a failure it shows the step that failed.
 */
export function SignRenderProgress({ stage, detail, progress, startedAt, failed, renderer = 'CLIP' }: {
  renderer?: SignRendererKind;
  stage: SignRenderStage | null;
  detail: string | null;
  progress: number;
  startedAt: string | null;
  failed: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (failed) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [failed]);
  const states = renderStageStates(stage, failed);
  const stages = renderStagesFor(renderer);
  const elapsed = elapsedLabel(startedAt, now);

  return (
    <div className={`pa-sv-progress${failed ? ' is-failed' : ''}`} role="status" aria-live="polite">
      <div className="pa-sv-progress-head">
        {!failed && <Loader2 size={16} className="pa-sv-spin" aria-hidden="true" />}
        <strong>{failed ? 'Dựng video ký hiệu bị dừng' : `Đang dựng video ký hiệu… ${progress}%`}</strong>
        {elapsed && !failed && <span className="pa-hint">đã chạy {elapsed} · {remainingLabel(startedAt, progress, now)}</span>}
      </div>
      <progress max={100} value={progress} aria-label="Tiến độ dựng video ký hiệu" />
      {detail && <p className="pa-sv-progress-detail">{detail}</p>}
      <ol className="pa-sv-stages" aria-label="Các bước dựng video">
        {stages.map((item, i) => (
          <li key={item.key} className={`is-${states[i]}`} aria-current={states[i] === 'current' ? 'step' : undefined}>
            <span className="pa-sv-step-mark"><StepMark state={states[i]} n={i + 1} /></span>
            {item.label}
            <span className="pa-sv-visually-hidden"> ({STATE_WORDS[states[i]]})</span>
          </li>
        ))}
      </ol>
      {!failed && <p className="pa-hint">Video dài có thể mất vài phút. Bạn cứ sửa các khối khác; kết quả tự hiện ở đây.</p>}
    </div>
  );
}

/** The part of a 3D-avatar render that runs in this browser, before the server composes the video. */
export interface AvatarRun {
  step: 'prepare' | 'render' | 'upload';
  /** Percent of the current step. */
  percent: number;
  detail: string;
  startedAt: string;
}

const AVATAR_STEPS: { key: AvatarRun['step'] | 'compose'; label: string }[] = [
  { key: 'prepare', label: 'Kiểm tra bản đồ, đọc chuyển động' },
  { key: 'render', label: 'Dựng nhân vật 3D từng khung hình' },
  { key: 'upload', label: 'Tải track nhân vật lên máy chủ' },
  { key: 'compose', label: 'Máy chủ ghép vào video bài giảng' },
];

/**
 * The avatar being rendered here: which step, how far (frames of the lesson video), for how long. The page must stay
 * open until the upload ends; "Dừng" stops without changing anything.
 */
export function SignAvatarProgress({ run, onStop }: { run: AvatarRun; onStop: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const current = AVATAR_STEPS.findIndex((s) => s.key === run.step);
  // The time left is the current step's, from its own speed: the steps do not go at the same pace (getting the 3D model
  // ready is slow for its share, the frames go evenly), so one speed for the whole run would be far off.
  const stepStart = usePhaseStart(run.step);
  // prepare 0–5 % (motions, the 3D model download), frames 5–85 %, upload 85–100 %.
  const overall = run.step === 'prepare' ? Math.round(run.percent * 0.05) : run.step === 'render' ? 5 + Math.round(run.percent * 0.8) : 85 + Math.round(run.percent * 0.15);
  const elapsed = elapsedLabel(run.startedAt, now);

  return (
    <div className="pa-sv-progress" role="status" aria-live="polite">
      <div className="pa-sv-progress-head">
        <Loader2 size={16} className="pa-sv-spin" aria-hidden="true" />
        <strong>Đang dựng nhân vật 3D trong trình duyệt… {overall}%</strong>
        {elapsed && <span className="pa-hint">đã chạy {elapsed} · bước {current + 1}/{AVATAR_STEPS.length} {remainingLabel(stepStart, run.percent, now)}</span>}
        <button type="button" className="btn btn-outline btn-small pa-sv-stop" onClick={onStop}>Dừng</button>
      </div>
      <progress max={100} value={overall} aria-label="Tiến độ dựng nhân vật 3D" />
      <p className="pa-sv-progress-detail">{run.detail}</p>
      <ol className="pa-sv-stages" aria-label="Các bước dựng nhân vật 3D">
        {AVATAR_STEPS.map((item, i) => {
          const state: StepState = i < current ? 'done' : i === current ? 'current' : 'todo';
          return (
            <li key={item.key} className={`is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="pa-sv-step-mark"><StepMark state={state} n={i + 1} /></span>
              {item.label}
              <span className="pa-sv-visually-hidden"> ({STATE_WORDS[state]})</span>
            </li>
          );
        })}
      </ol>
      <p className="pa-hint">Một nhân vật ra dấu cả video, mỗi ký hiệu đúng lúc từ đó được nói. Giữ trang này mở cho tới khi tải lên xong.</p>
    </div>
  );
}
