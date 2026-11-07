import './loading-state.css';

type PageLoadingProps = {
  label?: string;
  variant?: 'dashboard' | 'detail' | 'list';
};

/** A full-screen handoff while the application or session is being prepared. */
export function AppLoadingScreen() {
  return (
    <div className="app-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="app-loading__ambient" aria-hidden="true" />
      <div className="app-loading__content">
        <div className="app-loading__mark" aria-hidden="true"><span>D</span><i /></div>
        <strong className="app-loading__brand">DigiTalent <span>Pulse</span></strong>
        <div className="app-loading__progress" aria-hidden="true"><i /></div>
        <p>Đang chuẩn bị không gian làm việc</p>
      </div>
    </div>
  );
}

/** Page-shaped placeholders prevent a blank canvas while data or a route loads. */
export function PageLoading({ label = 'Đang tải nội dung', variant = 'dashboard' }: PageLoadingProps) {
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
