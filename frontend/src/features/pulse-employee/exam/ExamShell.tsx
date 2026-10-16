import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import pulseMark from '@/assets/pulse/pulse-mark.svg';

/**
 * Khung của trang làm bài khi chưa / không làm bài được (đang tải, chờ chấm, đã có kết quả…): thanh tối như lúc làm bài
 * với nút Thoát về trang khóa học. Trang làm bài không có thanh điều hướng chính (PulseEmployeeLayout).
 */
export function ExamShell({ label, title, backTo, children }: { label: string; title?: string; backTo: string; children: ReactNode }) {
  return (
    <div className="pu-exam">
      <header className="pu-exam-bar">
        <div className="pu-exam-bar-title">
          <img src={pulseMark} alt="" />
          <span>
            <small>{label}</small>
            {title && <strong>{title}</strong>}
          </span>
        </div>
        <Link to={backTo} className="pu-exam-leave">Thoát</Link>
      </header>
      <main className="pu-exam-body pu-exam-narrow">{children}</main>
    </div>
  );
}
