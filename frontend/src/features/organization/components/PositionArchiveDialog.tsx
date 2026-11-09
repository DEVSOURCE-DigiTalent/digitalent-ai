import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Archive, X } from 'lucide-react';
import { useDialogFocus } from '@/hooks/use-dialog-focus';
import './position-archive.css';

interface PositionArchiveDialogProps {
  name: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PositionArchiveDialog({ name, busy, onClose, onConfirm }: PositionArchiveDialogProps) {
  useUiLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(true, dialogRef, onClose);

  return createPortal(
    <div className="position-archive-layer fixed inset-0 z-[100] grid place-items-center p-4">
      <div className="position-archive-backdrop absolute inset-0" aria-hidden="true" onClick={busy ? undefined : onClose} />
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="position-archive-title" aria-describedby="position-archive-description" className="position-archive-dialog relative w-full max-w-md overflow-hidden rounded-[22px] bg-white">
        <div className="position-archive-content">
          <button type="button" className="position-archive-close" aria-label={translateUi("Đóng")} disabled={busy} onClick={onClose}><X size={18} /></button>
          <div className="position-archive-icon"><Archive size={24} /></div>
          <span className="position-archive-eyebrow">{translateUi("QUẢN LÝ VỊ TRÍ")}</span>
          <h2 id="position-archive-title">{translateUi("Lưu trữ vị trí công việc")}</h2>
          <p id="position-archive-description">{translateUi("Vị trí ")}<strong>{name}</strong>{translateUi(" sẽ ẩn khỏi danh sách đang dùng. Dữ liệu lịch sử vẫn được giữ lại.")}</p>
        </div>
        <div className="position-archive-actions">
          <button type="button" onClick={onClose} disabled={busy} className="position-archive-cancel">{translateUi("Hủy")}</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="position-archive-confirm"><Archive size={16} />{busy ? 'Đang lưu trữ…' : translateUi('Lưu trữ vị trí')}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
