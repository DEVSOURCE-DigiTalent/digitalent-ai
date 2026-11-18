import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Building2, Check, Info, Layers3, LockKeyhole, MousePointer2, Users, X } from 'lucide-react';
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
          <h3><span>01</span>{translateUi(" Khóa học của doanh nghiệp")}</h3>
          <div className="ceiling-guide__levels">
            <div><span>{translateUi("CẤP 1")}</span><strong>{translateUi("Cơ bản")}</strong><small><Check size={13} />{translateUi("Miễn phí")}</small></div>
            <div><span>{translateUi("CẤP 2")}</span><strong>{translateUi("Trung cấp")}</strong><small><LockKeyhole size={13} />{translateUi("Mua một lần")}</small></div>
            <div><span>{translateUi("CẤP 3")}</span><strong>{translateUi("Nâng cao")}</strong><small><LockKeyhole size={13} />{translateUi("Mua một lần")}</small></div>
          </div>
          <p>{translateUi("Đây là mọi khóa doanh nghiệp đã có. Mỗi khóa mua một lần cho cả doanh nghiệp: mọi nhân viên đều học được, không giới hạn số người. Ở đây không cần cài đặt gì; khóa chưa mua có thể thêm vào giỏ.")}</p>
        </section>
        <section className="ceiling-guide__section">
          <h3><span>02</span>{translateUi(" Năng lực từng phòng ban")}</h3>
          <div className="ceiling-guide__hierarchy"><span><Users size={16} />{translateUi("Đặt mức cho phòng ban")}</span><b>→</b><span><Building2 size={16} />{translateUi("Mua khóa còn thiếu ở phần 1")}</span></div>
          <p>{translateUi("Chọn một phòng ban ở cột bên trái, rồi bấm vào mức cao nhất nhân viên phòng đó cần đạt ở mỗi lĩnh vực. Họ học từ Cơ bản tới mức đó. Đặt được cả cấp chưa mua: nhân viên thấy khóa trên lộ trình và học được khi doanh nghiệp mua ở phần 1.")}</p>
          <div className="ceiling-guide__note"><Info size={16} /><span>{translateUi("Mức có nhãn \"Đề xuất\" là gợi ý theo Thông tư 02 cho các vị trí trong phòng ban; bấm \"Dùng mức đề xuất\" để áp dụng nhanh.")}</span></div>
        </section>
        <section className="ceiling-guide__section">
          <h3><span>03</span>{translateUi(" Thao tác nhanh")}</h3>
          <div className="ceiling-guide__steps">
            <div><MousePointer2 size={16} /><strong>{translateUi("Ô của một cấp")}</strong><span>{translateUi("Chọn mức ")}<ArrowRight size={12} />{translateUi(" Lưu thay đổi")}</span></div>
            <div><LockKeyhole size={16} /><strong>{translateUi("Ô chưa mua (phần 1)")}</strong><span>{translateUi("Thêm vào giỏ, mua nhiều khóa một lần")}</span></div>
            <div><Info size={16} /><strong>{translateUi("Nút thông tin")}</strong><span>{translateUi("Xem nội dung khóa học")}</span></div>
            <div><Users size={16} /><strong>{translateUi("Cột phòng ban")}</strong><span>{translateUi("Tìm và chuyển giữa các phòng ban")}</span></div>
          </div>
        </section>
      </div>
      <footer className="ceiling-guide__footer"><button type="button" onClick={onClose}>{translateUi("Đã hiểu ")}<Check size={16} /></button></footer>
    </div>
  </div>, document.body);
}
