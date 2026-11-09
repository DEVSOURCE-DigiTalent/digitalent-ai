import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Building2, Check, ChevronDown, Info, Layers3, LockKeyhole, MousePointer2, Users, X } from 'lucide-react';
import { useDialogFocus } from '@/hooks/use-dialog-focus';
import './capability-ceiling-guide.css';

export function CapabilityCeilingGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  useUiLanguage();
  const [present, setPresent] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      setPresent(true);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      timer = setTimeout(() => setPresent(false), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240);
    }
    return () => { cancelAnimationFrame(frame); if (timer) clearTimeout(timer); };
  }, [open]);
  useDialogFocus(present, ref, onClose);
  if (!present) return null;

  return createPortal(<div className={`ceiling-guide${visible ? ' is-visible' : ''}`}>
    <div className="ceiling-guide__backdrop" aria-hidden="true" onClick={onClose} />
    <div ref={ref} className="ceiling-guide__dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
      <header className="ceiling-guide__header">
        <div className="ceiling-guide__heading"><span className="ceiling-guide__icon"><Layers3 size={23} /></span><div><span className="ceiling-guide__eyebrow">{translateUi("KHUNG NĂNG LỰC SỐ")}</span><h2 id={titleId}>{translateUi("Quy tắc & hướng dẫn")}</h2></div></div>
        <button type="button" className="ceiling-guide__close" onClick={onClose} aria-label={translateUi("Đóng hướng dẫn")}><X size={19} /></button>
      </header>
      <div className="ceiling-guide__body">
        <section className="ceiling-guide__section">
          <h3><span>01</span>{translateUi(" Phạm vi áp dụng")}</h3>
          <div className="ceiling-guide__hierarchy"><span><Users size={16} />{translateUi("Phòng ban")}</span><b>≤</b><span><Building2 size={16} />{translateUi("Doanh nghiệp")}</span><b>≤</b><span><Layers3 size={16} />{translateUi("Danh mục 3 cấp")}</span></div>
          <p>{translateUi("Cấp độ áp dụng của phòng ban không vượt mức doanh nghiệp đã thiết lập. Khi thu hẹp phạm vi chung, các phòng ban vượt mức sẽ được điều chỉnh tương ứng.")}</p>
        </section>
        <section className="ceiling-guide__section">
          <h3><span>02</span>{translateUi(" Khóa học & suất học")}</h3>
          <div className="ceiling-guide__levels">
            <div><span>{translateUi("CẤP 1 · F")}</span><strong>{translateUi("Cơ bản")}</strong><small><Check size={13} />{translateUi("Miễn phí")}</small></div>
            <div><span>{translateUi("CẤP 2 · I")}</span><strong>{translateUi("Trung cấp")}</strong><small><LockKeyhole size={13} />{translateUi("Cần mua suất học")}</small></div>
            <div><span>{translateUi("CẤP 3 · A")}</span><strong>{translateUi("Nâng cao")}</strong><small><LockKeyhole size={13} />{translateUi("Cần mua suất học")}</small></div>
          </div>
          <p>{translateUi("Mỗi ô ứng với một khóa học. Mua suất để mở quyền chọn cấp độ, sau đó chọn mức và lưu thay đổi.")}</p>
          <div className="ceiling-guide__note"><Info size={16} /><span>{translateUi("Mỗi suất dành cho một nhân viên trong một khóa. Hết suất vẫn giữ quyền khóa học; mua thêm khi cần phân công người mới. Chuẩn vị trí có thể thiết lập trước khi mua.")}</span></div>
        </section>
        <section className="ceiling-guide__section">
          <h3><span>03</span>{translateUi(" Thao tác nhanh")}</h3>
          <div className="ceiling-guide__steps">
            <div><MousePointer2 size={16} /><strong>{translateUi("Ô đã mở")}</strong><span>{translateUi("Chọn cấp độ ")}<ArrowRight size={12} />{translateUi(" Lưu thay đổi")}</span></div>
            <div><LockKeyhole size={16} /><strong>{translateUi("Ô chưa mua")}</strong><span>{translateUi("Chọn nhiều khóa vào giỏ")}</span></div>
            <div><Info size={16} /><strong>{translateUi("Nút thông tin")}</strong><span>{translateUi("Xem khóa học & suất còn lại")}</span></div>
            <div><ChevronDown size={16} /><strong>{translateUi("Tên lĩnh vực")}</strong><span>{translateUi("Mở cài đặt chuẩn vị trí")}</span></div>
          </div>
        </section>
      </div>
      <footer className="ceiling-guide__footer"><button type="button" onClick={onClose}>{translateUi("Đã hiểu ")}<Check size={16} /></button></footer>
    </div>
  </div>, document.body);
}
