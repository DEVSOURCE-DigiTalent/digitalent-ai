import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';

/** Thứ tự xuất hiện của một phần tử trong chuỗi hiệu ứng (biến CSS --d, nhân với bước trễ trong pulse-skip-test.css). */
export const stagger = (order: number): CSSProperties => ({ '--d': order }) as CSSProperties;

/** Người dùng bật "giảm chuyển động" trong hệ điều hành (jsdom không có matchMedia → coi như không). */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function canAnimate(): boolean {
  return typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function' && !prefersReducedMotion();
}

/**
 * Số chạy từ 0 lên `target` (easeOutCubic) sau `delay` ms; giảm chuyển động hoặc không có requestAnimationFrame thì hiện ngay.
 */
export function useCountUp(target: number, duration = 900, delay = 0): number {
  const [value, setValue] = useState(() => (canAnimate() ? 0 : target));
  useEffect(() => {
    if (!canAnimate()) {
      setValue(target);
      return;
    }
    let frame = 0;
    let startedAt: number | null = null;
    const step = (now: number) => {
      startedAt ??= now;
      const progress = Math.min(1, (now - startedAt) / duration);
      setValue(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = window.requestAnimationFrame(step);
    };
    const timer = window.setTimeout(() => {
      frame = window.requestAnimationFrame(step);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
    };
  }, [target, duration, delay]);
  return value;
}

/**
 * Số giây còn lại tới hạn nộp, làm tròn lên (bắt đầu ở 30:00, chạm 00:00 đúng lúc hết giờ). Đọc lại 4 lần/giây để không
 * nhảy cóc giây khi tab bị chậm; React bỏ qua lần đặt cùng giá trị nên chỉ vẽ lại mỗi giây.
 */
export function useSecondsLeft(deadlineAt: string): number {
  const deadline = useMemo(() => new Date(deadlineAt).getTime(), [deadlineAt]);
  const read = useCallback(() => Math.max(0, Math.ceil((deadline - Date.now()) / 1000)), [deadline]);
  const [seconds, setSeconds] = useState(read);
  useEffect(() => {
    setSeconds(read());
    const id = window.setInterval(() => setSeconds(read()), 250);
    return () => window.clearInterval(id);
  }, [read]);
  return seconds;
}

/** "mm:ss" từ số giây (≥ 0). */
export function clock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Thời gian làm một lần (mm:ss) từ lúc bắt đầu tới lúc nộp; không tính được thì null. */
export function attemptDuration(result: { startedAt: string; submittedAt: string }): string | null {
  const ms = new Date(result.submittedAt).getTime() - new Date(result.startedAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  return clock(Math.round(ms / 1000));
}
