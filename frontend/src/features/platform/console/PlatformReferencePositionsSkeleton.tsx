/**
 * 1:1 Matched skeleton loader for PlatformReferencePositionsPage (/platform/reference-positions).
 * Mirrors the Ink & Paper 4-tier architecture (pa-ov-header, pa-ov-version-bar, pa-ov-kpi-grid, pa-rp-panel)
 * and respects @media (prefers-reduced-motion: reduce) via .pa-ov-sk-block.
 */
export function PlatformReferencePositionsSkeleton() {
  return (
    <div
      className="pa-ov-skeleton-wrap"
      role="status"
      aria-live="polite"
      aria-label="Đang tải mẫu vị trí chuẩn"
    >
      {/* Page Header Skeleton */}
      <header className="pa-ov-header" aria-hidden="true">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div className="pa-ov-sk-block" style={{ width: 340, height: 26 }} />
            <div className="pa-ov-sk-block" style={{ width: 36, height: 22, borderRadius: 6 }} />
          </div>
          <div className="pa-ov-sk-block" style={{ width: 520, height: 14 }} />
        </div>
        <div className="pa-ov-actions">
          <div className="pa-ov-sk-block" style={{ width: 96, height: 34, borderRadius: 6 }} />
        </div>
      </header>

      {/* 4 Core KPI Cards Skeleton (Compact) */}
      <div className="pa-ov-kpi-grid pa-kpi-compact" aria-hidden="true" style={{ marginBottom: 16 }}>
        {[0, 1, 2, 3].map((idx) => (
          <div key={idx} className="pa-ov-kpi-card">
            <div className="pa-ov-kpi-top">
              <div className="pa-ov-sk-block" style={{ width: '56%', height: 12 }} />
              <div className="pa-ov-sk-block pa-ov-sk-circle" style={{ width: 28, height: 28, borderRadius: 7 }} />
            </div>
            <div className="pa-ov-sk-block" style={{ width: '42%', height: 20, marginTop: 8 }} />
            <div className="pa-ov-sk-block" style={{ width: '78%', height: 12, marginTop: 6 }} />
          </div>
        ))}
      </div>

      {/* Tier 3: Matrix Table Panel Skeleton */}
      <div className="pa-rp-panel" aria-hidden="true">
        {/* Panel Head */}
        <div className="pa-rp-panel-head">
          <div>
            <div className="pa-ov-sk-block" style={{ width: 320, height: 20 }} />
            <div className="pa-ov-sk-block" style={{ width: 460, height: 13, marginTop: 6 }} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[80, 80, 80].map((w, i) => (
              <div key={i} className="pa-ov-sk-block" style={{ width: w, height: 18, borderRadius: 6 }} />
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="pa-rp-table-scroll">
          <div style={{ minWidth: 980 }}>
            {/* Table Head */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px repeat(5, 1fr)', background: 'var(--pa-surface-sub)', borderBottom: '1px solid var(--pa-border)', padding: '16px 20px', gap: 12, alignItems: 'center' }}>
              <div className="pa-ov-sk-block" style={{ width: 160, height: 14 }} />
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div className="pa-ov-sk-block" style={{ width: 90, height: 15 }} />
                  <div className="pa-ov-sk-block" style={{ width: 110, height: 11 }} />
                </div>
              ))}
            </div>

            {/* 6 Domain Rows */}
            {[0, 1, 2, 3, 4, 5].map((rowIdx) => (
              <div
                key={rowIdx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '320px repeat(5, 1fr)',
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--pa-border)',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div className="pa-ov-sk-block" style={{ width: 26, height: 20, borderRadius: 5, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div className="pa-ov-sk-block" style={{ width: '80%', height: 16, marginBottom: 4 }} />
                    <div className="pa-ov-sk-block" style={{ width: '92%', height: 12 }} />
                  </div>
                </div>
                {[0, 1, 2, 3, 4].map((colIdx) => (
                  <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div className="pa-ov-sk-block" style={{ width: 104, height: 30, borderRadius: 8 }} />
                    <div className="pa-ov-sk-block" style={{ width: 50, height: 11 }} />
                  </div>
                ))}
              </div>
            ))}

            {/* Footprint Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px repeat(5, 1fr)', background: 'var(--pa-surface-sub)', padding: '16px 20px', gap: 12, alignItems: 'center' }}>
              <div className="pa-ov-sk-block" style={{ width: 180, height: 14 }} />
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div className="pa-ov-sk-block" style={{ width: 64, height: 16 }} />
                  <div className="pa-ov-sk-block" style={{ width: 56, height: 4, borderRadius: 2 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Foot Bar Skeleton */}
        <div className="pa-rp-foot-bar" aria-hidden="true">
          <div className="pa-ov-sk-block" style={{ width: 340, height: 16 }} />
          <div className="pa-ov-sk-block" style={{ width: 130, height: 34, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}
