import { useState, useEffect } from 'react';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import './loading-state.css';
import { PulseEmployeeLoadingScreen } from '@/features/pulse-employee/components/loading/PulseEmployeeLoadingScreen';
import { PulsePublicLoadingScreen } from '@/features/public/components/loading/PulsePublicLoadingScreen';

export { PulsePublicLoadingScreen };

type PageLoadingProps = {
  label?: string;
  variant?: 'dashboard' | 'detail' | 'list' | 'public';
};

const GENERAL_STAGES = [
  'Đang xác thực thông tin và phân quyền tài khoản…',
  'Đang đồng bộ dữ liệu không gian làm việc số…',
  'Không gian làm việc đã sẵn sàng!',
];

/** A full-screen handoff while the application or session is being prepared. */
export function AppLoadingScreen({ forceVariant }: { forceVariant?: 'default' | 'employee' | 'public' } = {}) {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const search = typeof window !== 'undefined' ? window.location.search : '';

  const isEmployee =
    forceVariant === 'employee' ||
    (forceVariant !== 'default' &&
      forceVariant !== 'public' &&
      (path.startsWith('/enterprise/me') || search.includes('loading=employee')));

  if (isEmployee) {
    return <PulseEmployeeLoadingScreen />;
  }

  const isPublic =
    forceVariant === 'public' ||
    search.includes('loading=public') ||
    (!path.startsWith('/enterprise') && !path.startsWith('/personal') && !path.startsWith('/platform') && !path.startsWith('/mentor'));

  if (isPublic && forceVariant !== 'default') {
    return <PulsePublicLoadingScreen />;
  }

  return <GeneralLoadingScreen />;
}

function GeneralLoadingScreen() {
  const [stageIndex, setStageIndex] = useState(0);
  const isPreview = typeof window !== 'undefined' && window.location.search.includes('loading=');

  useEffect(() => {
    const t1 = setTimeout(() => setStageIndex(1), 500);
    const t2 = setTimeout(() => setStageIndex(2), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const progressPercent = Math.min(100, Math.round(((stageIndex + 1) / GENERAL_STAGES.length) * 100));

  return (
    <div className="app-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="app-loading__ambient" aria-hidden="true" />
      <div className="app-loading__content">
        <div className="app-loading__mark-wrap">
          <div className="app-loading__halo" aria-hidden="true" />
          <img
            src={pulseMark}
            alt="DigiTalent AI"
            className="app-loading__logo"
            width="68"
            height="68"
          />
        </div>
        <strong className="app-loading__brand">DigiTalent <span>AI</span></strong>
        <span className="app-loading__sub">Nền Tảng Quản Trị & Phát Triển Năng Lực Số</span>

        <div className="app-loading__progress" aria-hidden="true">
          <div className="app-loading__progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <p className="app-loading__stage">{GENERAL_STAGES[stageIndex]}</p>
        <span className="app-loading__footer-badge">Doanh Nghiệp Số Chuẩn TT 02/2025/TT-BGDĐT</span>
      </div>

      {isPreview && (
        <aside className="loading-preview-pill" aria-label="Xem trước trạng thái loading">
          <span className="loading-preview-pill__label">👁 Xem trước:</span>
          <button
            type="button"
            className="loading-preview-pill__btn is-active"
            disabled
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

/** Page-shaped placeholders prevent a blank canvas while data or a route loads. */
export function PageLoading({ label = 'Đang tải nội dung', variant = 'dashboard' }: PageLoadingProps) {
  if (variant === 'public') {
    return <PulsePublicLoadingScreen />;
  }

  return (
    <main className={`page-loading page-loading--${variant}`} role="status" aria-live="polite" aria-busy="true" aria-label={label}>
      <div className="page-loading__shell">
        <div className="page-loading__head" aria-hidden="true">
          <div className="page-loading__head-copy">
            <span className="page-loading__bone page-loading__eyebrow" />
            <span className="page-loading__bone page-loading__title" />
            <span className="page-loading__bone page-loading__subtitle" />
          </div>
          <span className="page-loading__bone page-loading__head-action" />
        </div>
        {variant !== 'detail' && <div className="page-loading__metrics" aria-hidden="true">
          {[0, 1, 2].map((item) => <div className="page-loading__metric" key={item}>
            <span className="page-loading__bone page-loading__metric-label" />
            <span className="page-loading__bone page-loading__metric-value" />
            <span className="page-loading__bone page-loading__metric-foot" />
          </div>)}
        </div>}
        <div className="page-loading__panel" aria-hidden="true">
          <div className="page-loading__panel-head"><span className="page-loading__bone page-loading__panel-title" /><span className="page-loading__bone page-loading__panel-action" /></div>
          <div className="page-loading__rows">
            {[0, 1, 2, 3].map((item) => <div className="page-loading__row" key={item}>
              <span className="page-loading__bone page-loading__row-icon" />
              <div><span className="page-loading__bone page-loading__row-name" /><span className="page-loading__bone page-loading__row-meta" /></div>
              <span className="page-loading__bone page-loading__row-end" />
            </div>)}
          </div>
        </div>
        <span className="page-loading__sr">{label}…</span>
      </div>
    </main>
  );
}

/** Compact placeholder inside an existing panel. */
export function SectionLoading({ label = 'Đang tải danh sách', count = 3 }: { label?: string; count?: number }) {
  return <div className="section-loading" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
    {Array.from({ length: count }, (_, index) => <div className="section-loading__row" key={index} aria-hidden="true">
      <span className="page-loading__bone section-loading__icon" />
      <div><span className="page-loading__bone section-loading__name" /><span className="page-loading__bone section-loading__meta" /></div>
      <span className="page-loading__bone section-loading__end" />
    </div>)}
    <span className="page-loading__sr">{label}…</span>
  </div>;
}
