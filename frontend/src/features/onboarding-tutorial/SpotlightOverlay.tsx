import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  Sparkles,
  X,
} from 'lucide-react';
import { useOnboardingStore } from './onboarding-store';
import { TUTORIAL_CONFIGS } from './tutorial-configs';

export function SpotlightOverlay() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isTourActive,
    currentRole,
    currentStepIndex,
    nextStep,
    prevStep,
    goToStep,
    skipTour,
  } = useOnboardingStore();

  const [rect, setRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const cardRef = useRef<HTMLDivElement>(null);

  const config = currentRole ? TUTORIAL_CONFIGS[currentRole] : null;
  const currentStep = config?.steps[currentStepIndex];
  const totalSteps = config?.steps.length ?? 0;

  // Lắng nghe resize màn hình
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lắng nghe bàn phím (Escape để tắt, Mũi tên để di chuyển)
  useEffect(() => {
    if (!isTourActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skipTour();
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, nextStep, prevStep, skipTour]);

  // Cập nhật vị trí của element mục tiêu với scroll listener
  useLayoutEffect(() => {
    if (!isTourActive || !currentStep) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setRect(r);
          return;
        }
      }
      setRect(null);
    };

    // Cuộn phần tử vào tâm nhìn êm ái
    const targetEl = document.querySelector(currentStep.targetSelector);
    if (targetEl) {
      const preferred = currentStep.targetPosition || 'bottom';
      const scrollBlock = preferred === 'bottom' ? 'start' : preferred === 'top' ? 'end' : 'center';
      targetEl.scrollIntoView({ behavior: 'smooth', block: scrollBlock, inline: 'nearest' });
    }

    updateRect();
    const t1 = setTimeout(updateRect, 100);
    const t2 = setTimeout(updateRect, 350);
    const t3 = setTimeout(updateRect, 650);

    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [isTourActive, currentStep, currentStepIndex]);

  if (!isTourActive || !config || !currentStep) return null;

  // Tính toán vị trí Tooltip Card chuẩn xác, luôn vừa màn hình
  const getTooltipStyle = (): React.CSSProperties => {
    const cardWidth = 430;
    const cardHeight = 280;
    const padding = 20;

    if (!rect) {
      // Nếu không tìm thấy target, đặt ở trung tâm
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const preferred = currentStep.targetPosition || 'bottom';

    // 1. Bên phải (Right) - thường dùng cho Sidebar
    if (preferred === 'right' && rect.right + cardWidth + padding < windowSize.width) {
      const top = Math.max(
        padding,
        Math.min(windowSize.height - cardHeight - padding, rect.top + rect.height / 2 - cardHeight / 2)
      );
      return {
        top: `${top}px`,
        left: `${rect.right + padding}px`,
      };
    }

    // 2. Bên dưới (Bottom)
    if (preferred === 'bottom' && rect.bottom + cardHeight + padding < windowSize.height) {
      const left = Math.max(
        padding,
        Math.min(windowSize.width - cardWidth - padding, rect.left + rect.width / 2 - cardWidth / 2)
      );
      return {
        top: `${rect.bottom + padding}px`,
        left: `${left}px`,
      };
    }

    // 3. Bên trên (Top)
    if (rect.top - cardHeight - padding > 0) {
      const left = Math.max(
        padding,
        Math.min(windowSize.width - cardWidth - padding, rect.left + rect.width / 2 - cardWidth / 2)
      );
      return {
        top: `${rect.top - cardHeight - padding}px`,
        left: `${left}px`,
      };
    }

    // 4. Nếu bên dưới vẫn còn chỗ tương đối
    if (rect.bottom + cardHeight + padding < windowSize.height) {
      return {
        top: `${rect.bottom + padding}px`,
        left: `${Math.max(padding, Math.min(windowSize.width - cardWidth - padding, rect.left))}px`,
      };
    }

    // Vị trí mặc định thông minh: đặt ở góc đối diện target
    return {
      top: rect.top > windowSize.height / 2 ? `${padding * 2}px` : `${windowSize.height - cardHeight - padding}px`,
      left: rect.left > windowSize.width / 2 ? `${padding * 2}px` : `${windowSize.width - cardWidth - padding}px`,
    };
  };

  const pad = 10;
  const spotX = rect ? Math.max(0, rect.left - pad) : 0;
  const spotY = rect ? Math.max(0, rect.top - pad) : 0;
  const spotW = rect ? rect.width + pad * 2 : 0;
  const spotH = rect ? rect.height + pad * 2 : 0;

  const handleAction = () => {
    if (currentStep.actionRoute) {
      navigate(currentStep.actionRoute);
    }
    nextStep();
  };

  // Chỉ hiện nút hành động nếu route khác với URL hiện tại
  const isDifferentRoute = currentStep.actionRoute && currentStep.actionRoute !== location.pathname;

  return (
    <>
      {/* ── Lớp phủ SVG Backdrop với lỗ khoét spotlight ── */}
      <div className="ob-spotlight-backdrop">
        <svg
          className="ob-spotlight-svg"
          width={windowSize.width}
          height={windowSize.height}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width={windowSize.width} height={windowSize.height} fill="white" />
              {rect && (
                <rect
                  x={spotX}
                  y={spotY}
                  width={spotW}
                  height={spotH}
                  rx="16"
                  ry="16"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width={windowSize.width}
            height={windowSize.height}
            fill="rgba(15, 23, 42, 0.22)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* ── Viền phát sáng quanh target element ── */}
        {rect && (
          <div
            className="ob-spotlight-ring"
            style={{
              top: `${spotY}px`,
              left: `${spotX}px`,
              width: `${spotW}px`,
              height: `${spotH}px`,
            }}
          />
        )}
      </div>

      {/* ── Tooltip Card hướng dẫn ── */}
      <aside
        ref={cardRef}
        role="dialog"
        aria-label="Hướng dẫn tân thủ"
        className="ob-tooltip-card"
        style={getTooltipStyle()}
      >
        <div className="ob-tooltip-header">
          <div className="ob-tooltip-badge">
            <Sparkles className="size-3.5 text-indigo-600 shrink-0" />
            <span>{currentStep.badge}</span>
            <span className="ob-tooltip-badge-sep">·</span>
            <span className="ob-tooltip-badge-step">
              Bước {currentStepIndex + 1}/{totalSteps}
            </span>
          </div>
          <button
            type="button"
            onClick={skipTour}
            aria-label="Đóng hướng dẫn tân thủ (Esc)"
            title="Đóng hướng dẫn (Esc)"
            className="ob-tooltip-close"
          >
            <X className="size-4" />
          </button>
        </div>

        <h3 className="ob-tooltip-title">{currentStep.title}</h3>
        <p className="ob-tooltip-desc">{currentStep.description}</p>

        {currentStep.tips && (
          <div className="ob-tooltip-tips">
            <div className="ob-tooltip-tips-icon">
              <Lightbulb className="size-4 text-amber-600 shrink-0" />
            </div>
            <div className="ob-tooltip-tips-text">{currentStep.tips}</div>
          </div>
        )}

        <div className="ob-tooltip-footer">
          {/* Progress dots với khả năng chuyển bước nhanh */}
          <div className="ob-tooltip-progress-group">
            <div className="ob-tooltip-dots">
              {config.steps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToStep(i)}
                  className={`ob-dot ${i === currentStepIndex ? 'active' : i < currentStepIndex ? 'passed' : ''}`}
                  aria-label={`Chuyển đến bước ${i + 1}`}
                  title={`Bước ${i + 1}`}
                />
              ))}
            </div>
            <span className="ob-step-counter-text">
              {currentStepIndex + 1} / {totalSteps}
            </span>
          </div>

          {/* Action buttons */}
          <div className="ob-tooltip-actions">
            {currentStepIndex === 0 ? (
              <button
                type="button"
                onClick={skipTour}
                className="ob-btn ob-btn-ghost text-xs"
              >
                Bỏ qua
              </button>
            ) : (
              <button
                type="button"
                onClick={prevStep}
                className="ob-btn ob-btn-ghost text-xs"
              >
                <ArrowLeft className="size-3.5" />
                Quay lại
              </button>
            )}

            {isDifferentRoute && (
              <button
                type="button"
                onClick={handleAction}
                className="ob-btn ob-btn-outline text-xs"
              >
                <span>{currentStep.actionText ?? 'Khám phá'}</span>
                <ExternalLink className="size-3 text-slate-400" />
              </button>
            )}

            <button
              type="button"
              onClick={nextStep}
              className="ob-btn ob-btn-primary text-xs"
            >
              {currentStepIndex < totalSteps - 1 ? (
                <>
                  Tiếp theo <ArrowRight className="size-3.5" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" /> Bắt đầu ngay
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
