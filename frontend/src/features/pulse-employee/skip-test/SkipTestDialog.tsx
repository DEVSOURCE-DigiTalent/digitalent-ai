import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { prefersReducedMotion } from './skip-test-motion';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
const LEAVE_MS = 170;

/**
 * Hộp thoại xác nhận của bài kiểm tra đầu vào (role="alertdialog"): giữ tiêu điểm bên trong, Esc / bấm nền để đóng khi có
 * `onDismiss` (không có thì bắt buộc chọn), khóa cuộn trang, trả tiêu điểm về chỗ cũ khi đóng. Khi `open` chuyển sang false
 * hộp thoại còn ở lại {LEAVE_MS} ms để chạy hiệu ứng ra.
 */
export function SkipTestDialog({ open, tone = 'info', icon, title, children, actions, onDismiss, initialFocusRef }: {
  open: boolean;
  tone?: 'info' | 'warn' | 'bad';
  icon: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  actions: ReactNode;
  onDismiss?: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
}) {
  const titleId = useId();
  const bodyId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(open);
  const [leaving, setLeaving] = useState(false);

  // Điều chỉnh trạng thái theo prop ngay khi vẽ (mẫu "adjust state on prop change" của React).
  if (open && (!present || leaving)) {
    setPresent(true);
    setLeaving(false);
  } else if (!open && present && !leaving) {
    setLeaving(true);
  }

  useEffect(() => {
    if (!leaving) return;
    const id = window.setTimeout(() => {
      setPresent(false);
      setLeaving(false);
    }, prefersReducedMotion() ? 0 : LEAVE_MS);
    return () => window.clearTimeout(id);
  }, [leaving]);

  useEffect(() => {
    if (!present) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const card = cardRef.current;
    const target = initialFocusRef?.current ?? card?.querySelector<HTMLElement>(FOCUSABLE) ?? card;
    target?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      // Chỉ trả tiêu điểm khi nó mất theo hộp thoại; nơi gọi đã chủ động chuyển tiêu điểm (vd. tới một câu) thì giữ nguyên.
      const active = document.activeElement;
      if (previous?.isConnected && (!active || active === document.body)) previous.focus({ preventScroll: true });
    };
    // Chỉ chạy khi hộp thoại xuất hiện / biến mất.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present]);

  if (!present) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (onDismiss && !leaving) onDismiss();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = Array.from(cardRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0]!;
    const last = items[items.length - 1]!;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === cardRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || active === cardRef.current)) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className={`pu-sk-overlay${leaving ? ' is-leaving' : ''}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && onDismiss && !leaving) onDismiss();
      }}
    >
      <div
        ref={cardRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={children ? bodyId : undefined}
        tabIndex={-1}
        className={`pu-sk-dialog tone-${tone}`}
        onKeyDown={onKeyDown}
      >
        <span className="pu-sk-dialog-icon" aria-hidden="true">{icon}</span>
        <h2 id={titleId} className="pu-sk-dialog-title">{title}</h2>
        {children && <div id={bodyId} className="pu-sk-dialog-body">{children}</div>}
        <div className="pu-sk-dialog-actions">{actions}</div>
      </div>
    </div>
  );
}
