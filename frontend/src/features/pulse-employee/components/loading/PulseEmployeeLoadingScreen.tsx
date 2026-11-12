import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import './pulse-loading.css';

const MOTIVATIONAL_TIPS = [
  'Mỗi ngày dành 15 phút micro-learning giúp bạn tăng 40% khả năng áp dụng kỹ năng số vào công việc.',
  'Chuẩn năng lực số: Nâng hạng từ Cơ bản lên Trung cấp thông qua minh chứng nhiệm vụ thực tế.',
  'Học tập không chỉ là tích lũy lý thuyết, mà là chuyển hóa thành hiệu suất làm việc vượt trội.',
  'Chứng chỉ số DigiTalent được xác thực mật mã học công khai và gắn liền với hồ sơ phát triển nghề nghiệp.',
  'Kiểm tra định kỳ các khoảng trống năng lực giúp bạn tập trung nguồn lực vào những kỹ năng cốt lõi nhất.',
];

const LOADING_STAGES = [
  'Đang chuẩn hóa hồ sơ năng lực học viên…',
  'Đang kết nối lộ trình đào tạo chuẩn hóa…',
  'Đang nạp bài giảng và bài tập thực hành hôm nay…',
  'Không gian học tập sẵn sàng!',
];

interface PulseEmployeeLoadingScreenProps {
  customMessage?: string;
}

/**
 * Trang Loading Tổng (Splash Screen) chuyên biệt cho Nhân viên (Pulse Employee)
 * - Tông màu Warm Cognitive Pulse: Sáng trang nhã, không chói mắt khi chuyển vào layout chính.
 * - Vòng hào quang sinh học xoay nhẹ (Breathing Halo Ring) quanh Logo D.
 * - Lời chào cá nhân hóa theo họ tên học viên.
 * - Tiến trình 3-4 chặng có nghĩa thực tế.
 * - Hộp mẹo học tập (Micro-learning Tips) xoay vòng truyền cảm hứng.
 */
export function PulseEmployeeLoadingScreen({ customMessage }: PulseEmployeeLoadingScreenProps) {
  const user = useCurrentUser((s) => s.user);
  const [tipIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_TIPS.length));
  const [stageIndex, setStageIndex] = useState(0);
  const isPreview = typeof window !== 'undefined' && window.location.search.includes('loading=');

  useEffect(() => {
    const timer1 = setTimeout(() => setStageIndex(1), 500);
    const timer2 = setTimeout(() => setStageIndex(2), 1200);
    const timer3 = setTimeout(() => setStageIndex(3), 1900);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const progressPercent = Math.min(100, Math.round(((stageIndex + 1) / LOADING_STAGES.length) * 100));

  return (
    <div className="pu-splash-screen" role="status" aria-live="polite" aria-busy="true">
      {/* Vầng sáng nền chuyển động nhịp nhàng */}
      <div className="pu-splash-ambient" aria-hidden="true" />

      <div className="pu-splash-card">
        {/* Brand Mark với Halo Ring */}
        <div className="pu-splash-brand-wrap">
          <div className="pu-splash-halo" aria-hidden="true" />
          <img
            src={pulseMark}
            alt="DigiTalent AI"
            className="pu-splash-logo-img"
            width="68"
            height="68"
          />
        </div>

        <h1 className="pu-splash-title">
          DigiTalent <span>AI</span>
        </h1>
        <span className="pu-splash-subtitle">Cổng Phát Triển Năng Lực Số Doanh Nghiệp</span>

        {user?.fullName && (
          <p className="pu-splash-greeting">
            Xin chào, <strong>{user.fullName}</strong>
          </p>
        )}

        {/* Thanh tiến trình đa chặng */}
        <div className="pu-splash-progress-track" aria-hidden="true">
          <div
            className="pu-splash-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="pu-splash-stage-text">
          {customMessage || LOADING_STAGES[stageIndex]}
        </p>

        {/* Hộp mẹo học tập truyền cảm hứng */}
        <div className="pu-splash-tip-box">
          <span className="pu-splash-tip-badge">💡 Mẹo hôm nay</span>
          <p className="pu-splash-tip-text">"{MOTIVATIONAL_TIPS[tipIndex]}"</p>
        </div>

        <div className="pu-splash-footer">
          <span>Chuẩn hóa theo Khung năng lực số doanh nghiệp</span>
        </div>
      </div>

      {isPreview && (
        <aside className="loading-preview-pill loading-preview-pill--light" aria-label="Xem trước trạng thái loading">
          <span className="loading-preview-pill__label">👁 Xem trước:</span>
          <button
            type="button"
            className="loading-preview-pill__btn"
            onClick={() => {
              window.location.search = '?loading=general';
            }}
          >
            Loading Doanh Nghiệp (Dark)
          </button>
          <button
            type="button"
            className="loading-preview-pill__btn is-active"
            disabled
          >
            Loading Nhân Viên (Light)
          </button>
          <button
            type="button"
            className="loading-preview-pill__btn"
            onClick={() => {
              window.location.search = '?loading=public';
            }}
          >
            Loading Trang Công Khai (Public)
          </button>
          <button
            type="button"
            className="loading-preview-pill__btn loading-preview-pill__btn--exit"
            onClick={() => {
              window.location.search = '';
            }}
          >
            ✕ Thoát
          </button>
        </aside>
      )}
    </div>
  );
}
