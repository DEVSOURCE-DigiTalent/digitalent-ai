import pulseMark from '@/assets/pulse/pulse-mark.svg';
import './pulse-public-loading.css';

/**
 * Trang Loading tối giản chuyên biệt cho các trang công khai (Landing, Giải pháp, Bảng giá...)
 * - Dùng đúng Logo chính thức của hệ thống (pulse-mark.svg).
 * - Tinh giản tối đa: Chỉ hiển thị Logo hệ thống, Tên thương hiệu và hiệu ứng loading nhẹ nhàng.
 * - Loại bỏ hoàn toàn khung thẻ và các khối mô tả rườm rà.
 */
export function PulsePublicLoadingScreen() {
  const isPreview = typeof window !== 'undefined' && window.location.search.includes('loading=');

  return (
    <div className="pu-public-splash" role="status" aria-live="polite" aria-busy="true">
      {/* Vầng sáng nền tinh tế */}
      <div className="pu-public-splash__ambient" aria-hidden="true" />

      <div className="pu-public-splash__content">
        {/* Logo hệ thống với hiệu ứng vầng sáng xoay mềm mại */}
        <div className="pu-public-splash__mark-wrap">
          <div className="pu-public-splash__halo" aria-hidden="true" />
          <img
            src={pulseMark}
            alt="DigiTalent AI"
            className="pu-public-splash__logo"
            width="68"
            height="68"
          />
        </div>

        {/* Tên thương hiệu chuẩn */}
        <div className="pu-public-splash__brand">
          DigiTalent <strong>AI</strong>
        </div>

        {/* 1 hiệu ứng loading tối giản */}
        <div className="pu-public-splash__indicator" aria-hidden="true">
          <span className="pu-public-splash__indicator-bar" />
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
            className="loading-preview-pill__btn"
            onClick={() => {
              window.location.search = '?loading=employee';
            }}
          >
            Loading Nhân Viên (Light)
          </button>
          <button
            type="button"
            className="loading-preview-pill__btn is-active"
            disabled
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
