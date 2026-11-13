import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

const KEY_STEP = 16;

function readStored(key: string): number | null {
  try {
    const raw = window.localStorage.getItem(key);
    const value = raw === null ? NaN : Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function writeStored(key: string, value: number | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, String(Math.round(value)));
  } catch {
    // Không lưu được (chế độ ẩn danh, bị chặn) thì chỉ giữ trong phiên hiện tại
  }
}

/** Chiều rộng (px) do người dùng kéo, nhớ theo trình duyệt. null = dùng bố cục mặc định. */
export function useStoredWidth(storageKey: string) {
  const [width, setWidthState] = useState<number | null>(() => readStored(storageKey));
  const setWidth = useCallback(
    (next: number | null) => {
      setWidthState(next);
      writeStored(storageKey, next);
    },
    [storageKey],
  );
  return [width, setWidth] as const;
}

interface ResizeHandleProps {
  /** Cột được đổi kích thước nằm trước (bên trái) hay sau (bên phải) thanh kéo. */
  target: 'prev' | 'next';
  min: number;
  /** Chiều rộng tối đa; nhận chiều rộng khung chứa để chừa chỗ cho cột còn lại. */
  max: (containerWidth: number) => number;
  onResize: (width: number) => void;
  /** Bấm đúp hoặc phím Home: trả về bố cục mặc định. */
  onReset: () => void;
  label: string;
  disabled?: boolean;
}

/** Thanh kéo dọc giữa hai cột: kéo chuột / chạm, hoặc dùng phím mũi tên. */
export function ResizeHandle({ target, min, max, onResize, onReset, label, disabled }: ResizeHandleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startWidth: number; containerWidth: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const measure = () => {
    const handle = ref.current;
    const column = (target === 'prev' ? handle?.previousElementSibling : handle?.nextElementSibling) as HTMLElement | null;
    const container = handle?.parentElement;
    return {
      width: column?.getBoundingClientRect().width ?? min,
      containerWidth: container?.getBoundingClientRect().width ?? 0,
    };
  };

  const clamp = (value: number, containerWidth: number) =>
    Math.round(Math.min(Math.max(value, min), Math.max(min, max(containerWidth))));

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    const { width, containerWidth } = measure();
    drag.current = { startX: e.clientX, startWidth: width, containerWidth };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state) return;
    const dx = e.clientX - state.startX;
    onResize(clamp(state.startWidth + (target === 'prev' ? dx : -dx), state.containerWidth));
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Home') {
      e.preventDefault();
      onReset();
      return;
    }
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const { width, containerWidth } = measure();
    const grow = (e.key === 'ArrowRight') === (target === 'prev');
    onResize(clamp(width + (grow ? KEY_STEP : -KEY_STEP), containerWidth));
  };

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-disabled={disabled || undefined}
      title={disabled ? undefined : 'Kéo để đổi độ rộng · bấm đúp để về mặc định'}
      tabIndex={disabled ? -1 : 0}
      className={`mw-resize-handle${dragging ? ' is-dragging' : ''}${disabled ? ' is-disabled' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={() => !disabled && onReset()}
      onKeyDown={onKeyDown}
    />
  );
}
