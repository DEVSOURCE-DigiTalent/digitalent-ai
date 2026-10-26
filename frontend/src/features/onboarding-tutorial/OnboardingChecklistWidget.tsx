import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { useOnboardingStore } from './onboarding-store';
import { TUTORIAL_CONFIGS } from './tutorial-configs';

export function OnboardingChecklistWidget() {
  const navigate = useNavigate();
  const {
    currentRole,
    completedTaskIds,
    isTourActive,
    isMinimized,
    isDismissed,
    toggleMinimize,
    toggleTask,
    completeTask,
    dismissChecklist,
    startTour,
  } = useOnboardingStore();

  const [isOpen, setIsOpen] = useState(true);

  if (isTourActive || isDismissed || !currentRole) return null;

  const config = TUTORIAL_CONFIGS[currentRole];
  if (!config) return null;

  const tasks = config.checklist;
  const completedCount = tasks.filter((t) => completedTaskIds.includes(t.id)).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const handleTaskClick = (task: typeof tasks[0]) => {
    completeTask(task.id);
    navigate(task.route);
  };

  // Trạng thái thu gọn thành Pill nhỏ
  if (isMinimized || !isOpen) {
    return (
      <div className="ob-widget-container">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            if (isMinimized) toggleMinimize();
          }}
          className="ob-pill-badge"
          aria-label="Mở danh sách nhiệm vụ tân thủ"
        >
          <Sparkles className="size-4 ob-pill-sparkle" />
          <span className="ob-pill-text">Nhiệm vụ tân thủ</span>
          <span className="ob-pill-progress">
            {completedCount}/{tasks.length}
          </span>
          <ChevronUp className="size-4 text-slate-400 ml-1" />
        </button>
      </div>
    );
  }

  // Trạng thái mở rộng (Full Checklist Card)
  return (
    <div className="ob-widget-container">
      <div className="ob-checklist-card">
        {/* ── Header ── */}
        <div className="ob-checklist-header">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="ob-checklist-header-title">
                <Sparkles className="size-4 text-indigo-600" />
                <h4>Nhiệm vụ {config.roleName}</h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                  aria-label="Thu gọn"
                >
                  <ChevronDown className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={dismissChecklist}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                  aria-label="Đóng nhiệm vụ"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>Tiến độ khám phá</span>
              <strong className="text-indigo-600 font-bold">{progressPercent}%</strong>
            </div>

            {/* Progress bar */}
            <div className="ob-checklist-bar-bg">
              <div
                className="ob-checklist-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Checklist Items ── */}
        <div className="ob-checklist-items">
          {tasks.map((task) => {
            const isDone = completedTaskIds.includes(task.id);
            return (
              <div
                key={task.id}
                className={`ob-task-row ${isDone ? 'completed' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="ob-task-check focus:outline-none"
                  aria-label={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                >
                  {isDone ? (
                    <CheckCircle2 className="size-4 text-emerald-500 fill-emerald-50" />
                  ) : (
                    <Circle className="size-4 text-slate-300 hover:text-slate-400" />
                  )}
                </button>

                <div className="ob-task-info">
                  <div className="flex items-center gap-2">
                    <span className="ob-task-title">{task.title}</span>
                    {task.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-600">
                        {task.badge}
                      </span>
                    )}
                  </div>
                  <p className="ob-task-sub">{task.subtitle}</p>
                  <button
                    type="button"
                    onClick={() => handleTaskClick(task)}
                    className="ob-task-action"
                  >
                    <span>Xem tính năng</span>
                    <ExternalLink className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="ob-checklist-footer">
          <button
            type="button"
            onClick={() => startTour()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <RotateCcw className="size-3.5" />
            Xem lại Tour tương tác
          </button>

          <span className="text-[11px] text-slate-400">
            {completedCount}/{tasks.length} hoàn thành
          </span>
        </div>
      </div>
    </div>
  );
}
