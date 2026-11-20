import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { useOnboardingStore } from './onboarding-store';
import { TUTORIAL_CONFIGS } from './tutorial-configs';
import { useTrialJourney } from './use-trial-journey';
import type { RoleTutorialConfig } from './types';

/**
 * The checklist beside the assistant button. The enterprise-trial owner sees the journey with its real progress (read
 * from the data, nothing to tick); the other guides keep a list the user ticks. A guide with no checklist shows nothing.
 */
export function OnboardingChecklistWidget() {
  const { currentRole, isTourActive, isDismissed } = useOnboardingStore();
  if (isTourActive || isDismissed || !currentRole) return null;
  const config = TUTORIAL_CONFIGS[currentRole];
  if (!config || config.checklist.length === 0) return null;
  return config.checklist.some((task) => task.progress) ? <JourneyWidget config={config} /> : <TaskWidget config={config} />;
}

/** One bar per step, filled when done (a ring read as a loading spinner). */
function ProgressBars({ done, wide = false }: { done: boolean[]; wide?: boolean }) {
  return (
    <span className="ob-bars" data-wide={wide || undefined} aria-hidden="true">
      {done.map((isDone, index) => <i key={index} data-done={isDone || undefined} />)}
    </span>
  );
}

function JourneyWidget({ config }: { config: RoleTutorialConfig }) {
  useUiLanguage();
  const journey = useTrialJourney();
  const dismissChecklist = useOnboardingStore((s) => s.dismissChecklist);
  const startTour = useOnboardingStore((s) => s.startTour);
  const [open, setOpen] = useState(false);
  const title = translateUi(config.checklistTitle ?? 'Nhiệm vụ tân thủ');
  const tasks = config.checklist;
  const states = tasks.map((task) => journey[task.progress!]);
  const done = states.filter((s) => s.done).length;
  // The next thing to do: the first required step not done (an optional one left open does not hold the journey).
  const current = tasks.findIndex((task, index) => !states[index].done && !task.optional);
  const summary = translateUi(`Xong ${done}/${tasks.length} bước`);

  if (!open) {
    return (
      <div className="ob-widget">
        <button type="button" className="ob-pill" onClick={() => setOpen(true)} aria-expanded="false" aria-label={`${title}: ${summary}`}>
          <ProgressBars done={states.map((s) => s.done)} />
          <span className="ob-pill__label">{title}</span>
          <span className="ob-pill__count">{done}/{tasks.length}</span>
          <ChevronUp size={15} className="ob-pill__chev" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="ob-widget">
      <section className="ob-journey" aria-label={title}>
        <header className="ob-journey__head">
          <span className="ob-journey__heading">
            <strong>{title}</strong>
            <small>{summary}</small>
            <ProgressBars done={states.map((s) => s.done)} wide />
          </span>
          <button type="button" className="ob-close" onClick={() => setOpen(false)} aria-expanded="true" aria-label={translateUi('Thu gọn')}>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          <button type="button" className="ob-close" onClick={dismissChecklist} aria-label={translateUi('Ẩn danh sách này')} title={translateUi('Ẩn danh sách này')}>
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <ol className="ob-journey__list">
          {tasks.map((task, index) => {
            const state = states[index].done ? 'done' : index === current ? 'current' : 'todo';
            return (
              <li key={task.id} data-state={state} data-optional={task.optional || undefined}>
                <Link to={task.route} className="ob-journey__row" onClick={() => setOpen(false)} aria-current={state === 'current' ? 'step' : undefined}>
                  <span className="ob-journey__mark" aria-hidden="true">{state === 'done' ? <Check size={13} strokeWidth={3} /> : index + 1}</span>
                  <span className="ob-journey__text">
                    <strong>{translateUi(task.title)}</strong>
                    <small>{translateUi(states[index].detail ?? task.subtitle)}</small>
                  </span>
                  <span className="sr-only">{translateUi(state === 'done' ? 'Đã xong' : state === 'current' ? 'Việc tiếp theo' : task.optional ? 'Không bắt buộc' : 'Chưa làm')}</span>
                  <ChevronRight size={15} className="ob-journey__go" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
        <footer className="ob-journey__foot">
          <button type="button" className="ob-text-btn" onClick={() => startTour()}>
            <RotateCcw size={13} aria-hidden="true" />{translateUi('Xem lại hướng dẫn')}
          </button>
        </footer>
      </section>
    </div>
  );
}

/** A list the user ticks (manager and employee guides). */
function TaskWidget({ config }: { config: RoleTutorialConfig }) {
  useUiLanguage();
  const navigate = useNavigate();
  const {
    completedTaskIds,
    isMinimized,
    toggleMinimize,
    toggleTask,
    completeTask,
    dismissChecklist,
    startTour,
  } = useOnboardingStore();

  // Starts as the small pill so it never covers a page's main button; the user opens it when wanted.
  const [isOpen, setIsOpen] = useState(false);

  const tasks = config.checklist;
  const completedCount = tasks.filter((t) => completedTaskIds.includes(t.id)).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const handleTaskClick = (task: typeof tasks[0]) => {
    completeTask(task.id);
    navigate(task.route);
  };

  if (isMinimized || !isOpen) {
    return (
      <div className="ob-widget">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            if (isMinimized) toggleMinimize();
          }}
          className="ob-pill"
          aria-label={translateUi('Mở danh sách nhiệm vụ tân thủ')}
        >
          <Sparkles size={15} className="ob-pill__icon" aria-hidden="true" />
          <span className="ob-pill__label">{translateUi(config.checklistTitle ?? 'Nhiệm vụ tân thủ')}</span>
          <span className="ob-pill__count">{completedCount}/{tasks.length}</span>
          <ChevronUp size={15} className="ob-pill__chev" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="ob-widget">
      <div className="ob-checklist-card">
        <div className="ob-checklist-header">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="ob-checklist-header-title">
                <Sparkles className="size-4 text-[#137b84]" />
                <h4>{translateUi('Nhiệm vụ ')}{config.roleName}</h4>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setIsOpen(false)} className="ob-close" aria-label={translateUi('Thu gọn')}>
                  <ChevronDown className="size-4" />
                </button>
                <button type="button" onClick={dismissChecklist} className="ob-close" aria-label={translateUi('Đóng nhiệm vụ')}>
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>{translateUi('Tiến độ khám phá')}</span>
              <strong className="text-[#137b84] font-bold">{progressPercent}%</strong>
            </div>
            <div className="ob-checklist-bar-bg">
              <div className="ob-checklist-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="ob-checklist-items">
          {tasks.map((task) => {
            const isDone = completedTaskIds.includes(task.id);
            return (
              <div key={task.id} className={`ob-task-row ${isDone ? 'completed' : ''}`}>
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="ob-task-check focus:outline-none"
                  aria-label={translateUi(isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành')}
                >
                  {isDone ? (
                    <CheckCircle2 className="size-4 text-emerald-500 fill-emerald-50" />
                  ) : (
                    <Circle className="size-4 text-slate-300 hover:text-slate-400" />
                  )}
                </button>

                <div className="ob-task-info">
                  <div className="flex items-center gap-2">
                    <span className="ob-task-title">{translateUi(task.title)}</span>
                    {task.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-600">
                        {translateUi(task.badge)}
                      </span>
                    )}
                  </div>
                  <p className="ob-task-sub">{translateUi(task.subtitle)}</p>
                  <button type="button" onClick={() => handleTaskClick(task)} className="ob-task-action">
                    <span>{translateUi('Xem tính năng')}</span>
                    <ExternalLink className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="ob-checklist-footer">
          <button type="button" onClick={() => startTour()} className="ob-text-btn">
            <RotateCcw size={13} aria-hidden="true" />{translateUi('Xem lại hướng dẫn')}
          </button>
          <span className="text-[11px] text-slate-400">
            {completedCount}/{tasks.length}{translateUi(' hoàn thành')}
          </span>
        </div>
      </div>
    </div>
  );
}
