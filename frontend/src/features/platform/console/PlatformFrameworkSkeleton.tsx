/**
 * 1:1 Matched skeleton loader for PlatformFrameworkPage (/platform/frameworks).
 * Mirrors the Ink & Paper 4-tier architecture (Version strip, 4 KPI cards, Domains list & manifest, Releases history)
 * and respects @media (prefers-reduced-motion: reduce) via .pa-ov-sk-block.
 */
export function PlatformFrameworkSkeleton() {
  return (
    <div
      className="pa-ov-skeleton-wrap"
      role="status"
      aria-live="polite"
      aria-label="Đang tải khung chuẩn năng lực số"
    >
      {/* Tier 1: Version Status Strip Skeleton */}
      <div className="pa-ov-version-bar" aria-hidden="true">
        <div className="pa-ov-sk-block" style={{ width: 240, height: 18 }} />
        <div className="pa-ov-sk-block" style={{ width: 280, height: 18 }} />
      </div>

      {/* Tier 2: 4 Core KPI Cards Skeleton (Compact) */}
      <div className="pa-ov-kpi-grid pa-kpi-compact" aria-hidden="true">
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

      {/* Tier 3: Main Framework Domains Section Skeleton */}
      <div className="pa-ov-panel" aria-hidden="true">
        <div className="pa-ov-panel-head">
          <div>
            <div className="pa-ov-sk-block" style={{ width: 280, height: 20 }} />
            <div className="pa-ov-sk-block" style={{ width: 440, height: 14, marginTop: 6 }} />
          </div>
        </div>

        {/* Toolbar Skeleton */}
        <div className="pa-fw-toolbar" style={{ margin: '14px 0 18px' }}>
          <div className="pa-ov-sk-block" style={{ width: 320, height: 38, borderRadius: 8 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {[72, 84, 92, 84].map((width, i) => (
              <div key={i} className="pa-ov-sk-block" style={{ width, height: 32, borderRadius: 20 }} />
            ))}
          </div>
        </div>

        {/* Domain Cards Skeleton */}
        <div style={{ display: 'grid', gap: 16 }}>
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="pa-fw-domain-card">
              <div className="pa-fw-domain-left">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="pa-ov-sk-block" style={{ width: 44, height: 44, borderRadius: 10 }} />
                  <div style={{ flex: 1 }}>
                    <div className="pa-ov-sk-block" style={{ width: 88, height: 12, marginBottom: 6 }} />
                    <div className="pa-ov-sk-block" style={{ width: '68%', height: 18 }} />
                  </div>
                </div>
                <div className="pa-ov-sk-block" style={{ width: '100%', height: 14, marginTop: 8 }} />
                <div className="pa-ov-sk-block" style={{ width: '84%', height: 14 }} />
              </div>

              <div className="pa-fw-domain-right">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div className="pa-ov-sk-block" style={{ width: 140, height: 14 }} />
                  <div className="pa-ov-sk-block" style={{ width: 110, height: 14 }} />
                </div>
                {[0, 1, 2].map((c) => (
                  <div key={c} className="pa-ov-sk-block" style={{ width: '100%', height: 42, borderRadius: 9 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier 4: Releases History Skeleton */}
      <div className="pa-ov-panel" aria-hidden="true" style={{ marginTop: 20 }}>
        <div className="pa-ov-panel-head">
          <div className="pa-ov-sk-block" style={{ width: 220, height: 18 }} />
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {[0, 1].map((r) => (
            <div key={r} className="pa-ov-sk-block" style={{ width: '100%', height: 48, borderRadius: 10 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
