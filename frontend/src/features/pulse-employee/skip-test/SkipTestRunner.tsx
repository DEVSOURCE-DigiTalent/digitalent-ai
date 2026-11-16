import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlarmClock,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudCheck,
  Flag,
  LayoutGrid,
  Send,
  TimerOff,
} from 'lucide-react';
import type { PulseSkipTest, PulseSkipTestAttempt } from '@/services/pulse.service';
import { pad2 } from '../lib/labels';
import { SkipTestDialog } from './SkipTestDialog';
import { clock, prefersReducedMotion, stagger, useSecondsLeft } from './skip-test-motion';
import { loadAnswers, loadUi, saveAnswers, saveUi } from './skip-test-draft';

const LETTERS = 'ABCDE';
const WARN_SECONDS = 5 * 60;
const DANGER_SECONDS = 60;
const RING_R = 25;
const RING_C = 2 * Math.PI * RING_R;

type Direction = 'next' | 'prev' | 'jump';

/**
 * Làm bài kiểm tra đầu vào: một câu mỗi lần, bảng câu hỏi + đồng hồ dính bên phải (trên cùng khi màn hẹp), đánh dấu câu cần
 * xem lại, phím tắt (A–E / 1–5 chọn, ← → chuyển câu, F đánh dấu), luôn hỏi lại trước khi nộp, hết giờ thì tự nộp.
 */
export function SkipTestRunner({ courseId, test, attempt, submitting, submitError, onSubmit }: {
  courseId: string;
  test: PulseSkipTest;
  attempt: PulseSkipTestAttempt;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (answers: { questionId: string; optionId: string }[]) => void;
}) {
  const questions = attempt.questions;
  const total = questions.length;
  const single = test.maxAttempts === 1;
  const baseId = useId();

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const draft = loadAnswers(courseId, attempt.attemptNo);
    // Chỉ giữ lựa chọn thuộc đề hiện tại.
    return Object.fromEntries(
      Object.entries(draft).filter(([q, o]) => questions.some((x) => x.questionId === q && x.options.some((opt) => opt.optionId === o))),
    );
  });
  const [index, setIndex] = useState(() => Math.min(Math.max(0, loadUi(courseId, attempt.attemptNo).index), Math.max(0, total - 1)));
  const [flags, setFlags] = useState<string[]>(() =>
    loadUi(courseId, attempt.attemptNo).flags.filter((id) => questions.some((q) => q.questionId === id)),
  );
  const [direction, setDirection] = useState<Direction>('jump');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const secondsLeft = useSecondsLeft(attempt.deadlineAt);
  const timeUp = secondsLeft === 0;
  const dialogOpen = confirmOpen || timeUp;

  const stageRef = useRef<HTMLElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLFieldSetElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const autoSubmitted = useRef(false);
  const announced = useRef({ warn: secondsLeft <= WARN_SECONDS, danger: secondsLeft <= DANGER_SECONDS });

  const current = questions[index];
  const answeredCount = questions.filter((q) => answers[q.questionId]).length;
  const unanswered = questions.map((q, i) => ({ q, i })).filter(({ q }) => !answers[q.questionId]);
  const flagged = questions.map((q, i) => ({ q, i })).filter(({ q }) => flags.includes(q.questionId));
  const currentAnswered = current ? Boolean(answers[current.questionId]) : false;
  const currentFlagged = current ? flags.includes(current.questionId) : false;

  const totalSeconds = useMemo(() => {
    const span = (new Date(attempt.deadlineAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000;
    return Number.isFinite(span) && span > 0 ? span : test.timeLimitMinutes * 60;
  }, [attempt.deadlineAt, attempt.startedAt, test.timeLimitMinutes]);
  const timeTone = secondsLeft <= DANGER_SECONDS ? 'bad' : secondsLeft <= WARN_SECONDS ? 'warn' : 'ok';
  const timeRatio = Math.min(1, Math.max(0, secondsLeft / totalSeconds));
  const deadlineLabel = useMemo(() => {
    const d = new Date(attempt.deadlineAt);
    return Number.isNaN(d.getTime()) ? null : `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }, [attempt.deadlineAt]);

  // ── Lưu nháp ──────────────────────────────────────────────────────────
  useEffect(() => {
    saveAnswers(courseId, attempt.attemptNo, answers);
  }, [courseId, attempt.attemptNo, answers]);
  useEffect(() => {
    saveUi(courseId, attempt.attemptNo, { index, flags });
  }, [courseId, attempt.attemptNo, index, flags]);

  // ── Thao tác ─────────────────────────────────────────────────────────
  const choose = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => (prev[questionId] === optionId ? prev : { ...prev, [questionId]: optionId }));
  }, []);

  const toggleFlag = useCallback((questionId: string) => {
    setFlags((prev) => (prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]));
  }, []);

  const go = useCallback((target: number, dir: Direction) => {
    if (target < 0 || target >= total) return;
    setDirection(dir);
    setIndex(target);
    setGridOpen(false);
  }, [total]);

  const goToNextUnanswered = () => {
    for (let step = 1; step <= total; step += 1) {
      const i = (index + step) % total;
      if (!answers[questions[i]!.questionId]) {
        go(i, 'jump');
        return;
      }
    }
  };

  const send = useCallback(() => {
    onSubmit(Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })));
  }, [answers, onSubmit]);

  // Đổi câu: đưa tiêu điểm vào câu mới (trừ khi đang ở nút Câu trước/Câu sau) và cuộn lên nếu đầu câu bị che.
  useEffect(() => {
    const active = document.activeElement;
    const keepFocus = active && active !== document.body && footRef.current?.contains(active);
    if (!keepFocus) questionRef.current?.focus({ preventScroll: true });
    const stage = stageRef.current;
    if (!stage) return;
    const margin = parseFloat(getComputedStyle(stage).scrollMarginTop) || 0;
    if (stage.getBoundingClientRect().top < margin) {
      stage.scrollIntoView?.({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  }, [index]);

  // Phím tắt.
  useEffect(() => {
    if (dialogOpen || submitting || !current) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT') return;
      if (target instanceof HTMLInputElement && target.type !== 'radio') return;
      const { key } = event;
      if (key === 'ArrowRight' || key === 'ArrowLeft') {
        event.preventDefault();
        if (key === 'ArrowRight') go(index + 1, 'next');
        else go(index - 1, 'prev');
        return;
      }
      if (key === 'f' || key === 'F') {
        event.preventDefault();
        toggleFlag(current.questionId);
        return;
      }
      const letter = key.length === 1 ? LETTERS.indexOf(key.toUpperCase()) : -1;
      const optionIndex = /^[1-9]$/.test(key) ? Number(key) - 1 : letter;
      const option = optionIndex >= 0 ? current.options[optionIndex] : undefined;
      if (option) {
        event.preventDefault();
        choose(current.questionId, option.optionId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialogOpen, submitting, current, index, go, toggleFlag, choose]);

  // Hết giờ: tự nộp một lần.
  useEffect(() => {
    if (timeUp && !autoSubmitted.current && !submitting) {
      autoSubmitted.current = true;
      send();
    }
  }, [timeUp, submitting, send]);

  // Báo cho trình đọc màn hình ở mốc 5 phút và 1 phút.
  useEffect(() => {
    if (secondsLeft === 0) return;
    if (!announced.current.danger && secondsLeft <= DANGER_SECONDS) {
      announced.current = { warn: true, danger: true };
      setAnnouncement('Còn 1 phút làm bài. Hết giờ bài sẽ tự nộp.');
    } else if (!announced.current.warn && secondsLeft <= WARN_SECONDS) {
      announced.current.warn = true;
      setAnnouncement('Còn 5 phút làm bài.');
    }
  }, [secondsLeft]);

  // Đóng tab khi đã chọn câu: lựa chọn chỉ giữ trong tab này nên hỏi lại.
  useEffect(() => {
    if (answeredCount === 0 || submitting) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Trình duyệt cũ chỉ hỏi lại khi returnValue được đặt.
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [answeredCount, submitting]);

  if (!current) return null;

  const lastIndex = total - 1;
  const optionCount = current.options.length;

  return (
    <div className="pu-sk-view pu-sk-runner">
      <section ref={stageRef} className="pu-sk-stage" aria-label="Câu hỏi">
        <div className="pu-sk-stage-head">
          <div className="pu-sk-qpos">
            <span className="pu-sk-kicker">{single ? 'Lần làm duy nhất' : `Lần làm ${attempt.attemptNo}/${test.maxAttempts}`}</span>
            <p>
              Câu <b key={index} className="pu-sk-qnum">{pad2(current.number)}</b>
              <span>/ {pad2(total)}</span>
            </p>
          </div>
          <button
            type="button"
            className={`pu-sk-flag${currentFlagged ? ' is-on' : ''}`}
            aria-pressed={currentFlagged}
            onClick={() => toggleFlag(current.questionId)}
            disabled={submitting || timeUp}
          >
            <Flag size={15} aria-hidden="true" />
            <span>{currentFlagged ? 'Đã đánh dấu xem lại' : 'Đánh dấu xem lại'}</span>
          </button>
        </div>

        {timeTone !== 'ok' && !timeUp && unanswered.length > 0 && (
          <div className={`pu-sk-hurry tone-${timeTone}`} role="status">
            <AlarmClock size={16} aria-hidden="true" />
            <span>
              Còn dưới {timeTone === 'bad' ? '1 phút' : '5 phút'} · <b>{unanswered.length} câu</b> chưa chọn
            </span>
            <button type="button" onClick={goToNextUnanswered}>Tới câu chưa chọn</button>
          </div>
        )}

        <fieldset
          key={current.questionId}
          ref={questionRef}
          tabIndex={-1}
          className={`pu-sk-question dir-${direction}`}
          disabled={submitting || timeUp}
        >
          <legend className="pu-sk-question-text">
            <span className="pu-sk-sr">Câu {pad2(current.number)}: </span>
            {current.content}
          </legend>
          <div className="pu-sk-options">
            {current.options.map((option, i) => {
              const checked = answers[current.questionId] === option.optionId;
              const textId = `${baseId}-opt-${i}`;
              return (
                <label key={option.optionId} className={`pu-sk-option${checked ? ' is-checked' : ''}`} style={stagger(i)}>
                  <input
                    type="radio"
                    className="pu-sk-radio"
                    name={`sk-${current.questionId}`}
                    value={option.optionId}
                    checked={checked}
                    onChange={() => choose(current.questionId, option.optionId)}
                    aria-labelledby={textId}
                  />
                  <span className="pu-sk-option-key" aria-hidden="true">{LETTERS[i] ?? i + 1}</span>
                  <span id={textId} className="pu-sk-option-text">{option.content}</span>
                  <span className="pu-sk-option-tick" aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div ref={footRef} className="pu-sk-stage-foot">
          <button type="button" className="pu-sk-btn ghost" onClick={() => go(index - 1, 'prev')} disabled={index === 0}>
            <ChevronLeft size={16} aria-hidden="true" />
            <span>Câu trước</span>
          </button>
          <p className="pu-sk-keys" aria-hidden="true">
            <kbd>A</kbd>–<kbd>{LETTERS[Math.min(optionCount, LETTERS.length) - 1] ?? 'A'}</kbd> chọn
            <i />
            <kbd>←</kbd><kbd>→</kbd> chuyển câu
            <i />
            <kbd>F</kbd> đánh dấu
          </p>
          {index < lastIndex ? (
            <button
              type="button"
              className={`pu-sk-btn ${currentAnswered ? 'primary' : 'soft'}`}
              onClick={() => go(index + 1, 'next')}
            >
              <span>Câu sau</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button type="button" className="pu-sk-btn primary" onClick={() => setConfirmOpen(true)} disabled={submitting || timeUp}>
              <Send size={15} aria-hidden="true" />
              <span>Xem lại & nộp bài</span>
            </button>
          )}
        </div>
      </section>

      <aside className="pu-sk-panel" aria-label="Thời gian và tiến độ làm bài">
        <div className={`pu-sk-clock tone-${timeTone}`}>
          <svg className="pu-sk-clock-ring" viewBox="0 0 60 60" aria-hidden="true">
            <circle className="track" cx="30" cy="30" r={RING_R} />
            <circle
              className="arc"
              cx="30"
              cy="30"
              r={RING_R}
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - timeRatio)}
            />
          </svg>
          <span className="pu-sk-clock-icon" aria-hidden="true"><AlarmClock size={18} /></span>
          <div className="pu-sk-clock-read">
            <b role="timer" aria-label={`Thời gian còn lại ${clock(secondsLeft)}`}>{clock(secondsLeft)}</b>
            <small>Còn lại{deadlineLabel ? ` · hạn ${deadlineLabel}` : ''}</small>
          </div>
        </div>

        <div className="pu-sk-meter">
          <div className="pu-sk-meter-head">
            <span>Đã chọn</span>
            <b>{answeredCount}<small>/{total}</small></b>
          </div>
          <div
            className="pu-sk-meter-bar"
            role="progressbar"
            aria-label="Số câu đã chọn"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={answeredCount}
          >
            <i style={{ width: `${(answeredCount / Math.max(1, total)) * 100}%` }} />
          </div>
        </div>

        <button
          type="button"
          className={`pu-sk-gridtoggle${gridOpen ? ' is-open' : ''}`}
          aria-expanded={gridOpen}
          aria-controls={`${baseId}-grid`}
          onClick={() => setGridOpen((open) => !open)}
        >
          <LayoutGrid size={16} aria-hidden="true" />
          <span className="pu-sk-sr">Bảng câu hỏi</span>
        </button>

        <div id={`${baseId}-grid`} className={`pu-sk-gridwrap${gridOpen ? ' is-open' : ''}`}>
          <div className="pu-sk-gridinner">
            <nav className="pu-sk-grid" aria-label="Bảng câu hỏi">
              {questions.map((q, i) => {
                const done = Boolean(answers[q.questionId]);
                const isFlagged = flags.includes(q.questionId);
                const isCurrent = i === index;
                return (
                  <button
                    key={q.questionId}
                    type="button"
                    className={`pu-sk-cell${done ? ' is-done' : ''}${isCurrent ? ' is-current' : ''}${isFlagged ? ' is-flagged' : ''}`}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Câu ${pad2(q.number)}, ${done ? 'đã chọn' : 'chưa chọn'}${isFlagged ? ', đánh dấu xem lại' : ''}`}
                    onClick={() => go(i, i > index ? 'next' : i < index ? 'prev' : 'jump')}
                  >
                    {pad2(q.number)}
                    {isFlagged && <i className="pu-sk-cell-flag" aria-hidden="true" />}
                  </button>
                );
              })}
            </nav>
            <ul className="pu-sk-legend" aria-hidden="true">
              <li><i className="done" />Đã chọn</li>
              <li><i />Chưa chọn</li>
              <li><i className="flag" />Xem lại</li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          className="pu-sk-btn primary pu-sk-submit"
          onClick={() => setConfirmOpen(true)}
          disabled={submitting || timeUp}
        >
          <Send size={15} aria-hidden="true" />
          <span>Nộp bài</span>
        </button>
        <p className="pu-sk-saved">
          <CloudCheck size={14} aria-hidden="true" />
          Lựa chọn tự lưu trên trình duyệt này
        </p>
      </aside>

      <div className="pu-sk-sr" aria-live="assertive">{announcement}</div>

      <SkipTestDialog
        open={confirmOpen && !timeUp}
        tone={unanswered.length > 0 ? 'warn' : 'info'}
        icon={<Send size={22} />}
        title={unanswered.length > 0 ? 'Nộp bài khi còn câu chưa chọn?' : 'Nộp bài kiểm tra?'}
        onDismiss={submitting ? undefined : () => setConfirmOpen(false)}
        initialFocusRef={continueRef}
        actions={
          <>
            <button ref={continueRef} type="button" className="pu-sk-btn ghost" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              Làm tiếp
            </button>
            <button type="button" className="pu-sk-btn primary" onClick={send} disabled={submitting} aria-busy={submitting}>
              {submitting && <span className="pu-sk-spinner" aria-hidden="true" />}
              <span>{submitting ? 'Đang chấm bài…' : 'Xác nhận nộp bài'}</span>
            </button>
          </>
        }
      >
        <dl className="pu-sk-summary">
          <div>
            <dt>Đã chọn</dt>
            <dd>{answeredCount}<small>/{total}</small></dd>
          </div>
          <div className={unanswered.length > 0 ? 'tone-warn' : undefined}>
            <dt>Chưa chọn</dt>
            <dd>{unanswered.length}</dd>
          </div>
          <div>
            <dt>Còn lại</dt>
            <dd>{clock(secondsLeft)}</dd>
          </div>
        </dl>
        <p>
          {unanswered.length > 0
            ? `Còn ${unanswered.length} câu chưa chọn — các câu này sẽ tính là sai.`
            : `Bạn đã chọn đủ ${total} câu.`}
        </p>
        {unanswered.length > 0 && (
          <QuickJump
            label="Câu chưa chọn"
            items={unanswered}
            disabled={submitting}
            onPick={(i) => {
              setConfirmOpen(false);
              go(i, 'jump');
            }}
          />
        )}
        {flagged.length > 0 && (
          <QuickJump
            label="Đã đánh dấu xem lại"
            items={flagged}
            tone="flag"
            disabled={submitting}
            onPick={(i) => {
              setConfirmOpen(false);
              go(i, 'jump');
            }}
          />
        )}
        <p className="pu-sk-dialog-muted">
          {single
            ? 'Đây là lần làm duy nhất: sau khi nộp không sửa được đáp án và không làm lại.'
            : 'Sau khi nộp không sửa được đáp án.'}
        </p>
        {submitError && <p className="pu-sk-dialog-error" role="alert">{submitError}</p>}
      </SkipTestDialog>

      <SkipTestDialog
        open={timeUp}
        tone="bad"
        icon={<TimerOff size={22} />}
        title="Hết giờ làm bài"
        actions={
          submitError && !submitting ? (
            <button type="button" className="pu-sk-btn primary" onClick={send}>
              <Send size={15} aria-hidden="true" />
              <span>Nộp lại</span>
            </button>
          ) : (
            <span className="pu-sk-dialog-wait" role="status">
              <span className="pu-sk-spinner dark" aria-hidden="true" />
              Đang nộp và chấm bài…
            </span>
          )
        }
      >
        <p>Bài được nộp tự động với {answeredCount}/{total} câu đã chọn.</p>
        {submitError && <p className="pu-sk-dialog-error" role="alert">{submitError}</p>}
      </SkipTestDialog>
    </div>
  );
}

function QuickJump({ label, items, tone, disabled, onPick }: {
  label: string;
  items: { q: { questionId: string; number: number }; i: number }[];
  tone?: 'flag';
  disabled?: boolean;
  onPick: (index: number) => void;
}) {
  return (
    <div className={`pu-sk-jump${tone ? ` tone-${tone}` : ''}`}>
      <span>{label}</span>
      <div>
        {items.map(({ q, i }) => (
          <button key={q.questionId} type="button" onClick={() => onPick(i)} disabled={disabled} aria-label={`Tới câu ${pad2(q.number)}`}>
            {pad2(q.number)}
          </button>
        ))}
      </div>
    </div>
  );
}
