import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import pulseMark from '@/assets/pulse/pulse-mark.svg';

/**
 * Khung của trang làm bài khi chưa / không làm bài được (đang tải, chờ chấm, đã có kết quả…): thanh tối như lúc làm bài
 * với nút Thoát về trang khóa học. Trang làm bài không có thanh điều hướng chính (PulseEmployeeLayout).
 */
export function ExamShell({ label, title, backTo, children }: { label: string; title?: string; backTo: string; children: ReactNode }) {
  return (
    <div className="pu-exam">
      <header className="pu-exam-bar">
        <div className="pu-exam-bar-left">
          <div className="pu-exam-brand">
            <img src={pulseMark} alt="DigiTalent AI" className="pu-exam-logo" />
            <span className="pu-exam-wordmark">DigiTalent <em>AI</em></span>
          </div>
          <span className="pu-exam-bar-divider" aria-hidden="true" />
          <div className="pu-exam-bar-info">
            <span className="pu-exam-type-pill">{label}</span>
            {title && <span className="pu-exam-course-title">{title}</span>}
          </div>
        </div>
        <div className="pu-exam-bar-actions">
          <Link to={backTo} className="pu-exam-leave-btn">
            <LogOut size={15} aria-hidden />
            <span>Thoát</span>
          </Link>
        </div>
      </header>
      <main className="pu-exam-body pu-exam-narrow">{children}</main>
    </div>
  );
}
