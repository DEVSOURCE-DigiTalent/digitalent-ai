import { useCallback, useEffect, useState, type MouseEvent, type ReactNode } from 'react';

export interface TipState {
  content: ReactNode;
  x: number;
  y: number;
}

/** Tooltip theo chuột cho các phần tử của biểu đồ: `bind(nội dung)` trả về handler gắn vào phần tử. */
export function useHoverTip() {
  const [tip, setTip] = useState<TipState | null>(null);
  const bind = useCallback(
    (content: ReactNode) => ({
      onMouseMove: (event: MouseEvent) => setTip({ content, x: event.clientX, y: event.clientY }),
      onMouseLeave: () => setTip(null),
    }),
    [],
  );
  return { tip, bind };
}

/** Số đếm lên tới <paramref name="target"/> trong lần hiện đầu (bỏ qua khi người dùng chọn giảm chuyển động). */
export function useCountUp(target: number, play: boolean, durationMs = 1100) {
  const animated = play && !prefersReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!animated) return;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, animated, durationMs]);
  return animated ? value : target;
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/** true trong vài giây đầu sau khi báo cáo hiện — gắn lớp .rp-anim cho chuyển động mở trang. */
export function useIntroAnimation(durationMs = 2600) {
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setPlaying(false), durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs]);
  return playing;
}
