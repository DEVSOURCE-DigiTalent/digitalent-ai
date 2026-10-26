import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  X,
} from 'lucide-react';
import { useOnboardingStore } from './onboarding-store';
import { TUTORIAL_CONFIGS } from './tutorial-configs';

export function SpotlightOverlay() {
  const navigate = useNavigate();
  const {
    isTourActive,
    currentRole,
    currentStepIndex,
    nextStep,
    prevStep,
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

  // Cập nhật vị trí của element mục tiêu
  useLayoutEffect(() => {
    if (!isTourActive || !currentStep) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        const r = el.getBoundingClientRect();
        // Chỉ lưu rect nếu phần tử có kích thước hiển thị
        if (r.width > 0 && r.height > 0) {
          setRect(r);
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          return;
        }
      }
      setRect(null);
    };

    updateRect();
    const timeout = setTimeout(updateRect, 300);
    return () => clearTimeout(timeout);
  }, [isTourActive, currentStep, currentStepIndex]);

  if (!isTourActive || !config || !currentStep) return null;

  // Tính toán vị trí Tooltip Card
  const getTooltipStyle = (): React.CSSProperties => {
    const cardWidth = 380;
    const cardHeight = 260;
    const padding = 16;

    if (!rect) {
      // Nếu không tìm thấy target, đặt ở trung tâm
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const preferred = currentStep.targetPosition || 'right';

    // Ưu tiên vị trí bên phải (Right) - thường dùng cho Sidebar
    if (preferred === 'right' && rect.right + cardWidth + padding < windowSize.width) {
      const top = Math.max(
        padding,
        Math.min(windowSize.height - cardHeight - padding, rect.top + rect.height / 2 - cardHeight / 3)
      );
      return {
        top: `${top}px`,
        left: `${rect.right + padding}px`,
      };
    }

    // Ưu tiên vị trí bên dưới (Bottom)
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

    // Ưu tiên vị trí bên trên (Top)
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

    // Vị trí mặc định thông minh: đặt ở góc đối diện target
    return {
      top: rect.top > windowSize.height / 2 ? `${padding * 2}px` : `${windowSize.height - cardHeight - padding}px`,
      left: rect.left > windowSize.width / 2 ? `${padding * 2}px` : `${windowSize.width - cardWidth - padding}px`,
    };
  };

  const pad = 6;
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
                  rx="10"
                  ry="10"
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
            fill="rgba(11, 17, 32, 0.76)"
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
        <div className="flex items-center justify-between">
          <span className="ob-tooltip-badge">
            <Sparkles className="size-3" />
            {currentStep.badge} · Bước {currentStepIndex + 1}/{totalSteps}
          </span>
          <button
            type="button"
            onClick={skipTour}
            aria-label="Bỏ qua hướng dẫn"
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <h3 className="ob-tooltip-title">{currentStep.title}</h3>
        <p className="ob-tooltip-desc">{currentStep.description}</p>

        {currentStep.tips && (
          <div className="ob-tooltip-tips">
            <Lightbulb className="size-4 shrink-0 text-amber-500 mt-0.5" />
            <span>{currentStep.tips}</span>
          </div>
        )}

        <div className="ob-tooltip-footer">
          {/* Progress dots */}
          <div className="ob-tooltip-dots">
            {config.steps.map((_, i) => (
              <span
                key={i}
                className={`ob-dot ${i === currentStepIndex ? 'active' : ''}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="ob-tooltip-actions">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="ob-btn ob-btn-ghost text-xs"
              >
                <ArrowLeft className="size-3.5" />
                Trước
              </button>
            )}

            {currentStep.actionRoute && (
              <button
                type="button"
                onClick={handleAction}
                className="ob-btn ob-btn-outline text-xs"
              >
                {currentStep.actionText ?? 'Khám phá'}
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
                  <CheckCircle2 className="size-3.5" /> Hoàn tất
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
