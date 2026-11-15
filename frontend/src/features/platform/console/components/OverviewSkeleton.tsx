/**
 * 1:1 matched skeleton loader for PlatformOverviewPage (/platform/dashboard).
 * Mirrors the 4-tier architecture (Version strip, 4 KPIs, 7/5 Charts, 6/6 Operations)
 * and respects prefers-reduced-motion via .pa-ov-skeleton CSS rules.
 */
const BAR_HEIGHTS = [42, 68, 54, 88, 64, 78];

export function PlatformOverviewSkeleton() {
  return (
    <div className="pa-ov-skeleton-wrap" role="status" aria-live="polite" aria-label="Đang tải dữ liệu tổng quan nền tảng">
      {/* Tier 1 fallback: Version Status Strip Skeleton */}
      <div className="pa-ov-version-bar pa-ov-skeleton-bar" aria-hidden="true">
        <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 220, height: 18 }} />
        <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 280, height: 18 }} />
      </div>

      {/* Tier 2: 4 KPI Cards Skeleton */}
      <div className="pa-ov-kpi-grid" aria-hidden="true">
        {[0, 1, 2, 3].map((idx) => (
          <div key={idx} className="pa-ov-kpi-card">
            <div className="pa-ov-kpi-top">
              <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: '58%', height: 14 }} />
              <div className="pa-ov-sk-block pa-ov-sk-circle" style={{ width: 32, height: 32, borderRadius: 8 }} />
            </div>
            <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: '70%', height: 32, marginTop: 10 }} />
            <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: '82%', height: 14, marginTop: 12 }} />
          </div>
        ))}
      </div>

      {/* Tier 3: Charts Skeleton (7 cols Column Chart + 5 cols Donut Chart) */}
      <div className="pa-ov-charts-grid" aria-hidden="true">
        <div className="pa-ov-panel">
          <div className="pa-ov-panel-head">
            <div>
              <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 190, height: 18 }} />
              <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 250, height: 13, marginTop: 6 }} />
            </div>
            <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 168, height: 34, borderRadius: 8 }} />
          </div>
          <div className="pa-ov-sk-barchart">
            {BAR_HEIGHTS.map((heightPct, idx) => (
              <div key={idx} className="pa-ov-sk-bar-col">
                <div className="pa-ov-sk-block pa-ov-sk-bar" style={{ height: `${heightPct}%` }} />
                <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 32, height: 12, marginTop: 8 }} />
              </div>
            ))}
          </div>
        </div>

        <div className="pa-ov-panel">
          <div className="pa-ov-panel-head">
            <div>
              <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 170, height: 18 }} />
              <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 200, height: 13, marginTop: 6 }} />
            </div>
            <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 140, height: 34, borderRadius: 8 }} />
          </div>
          <div className="pa-ov-sk-donut-wrap">
            <div className="pa-ov-sk-donut-ring" />
            <div className="pa-ov-sk-donut-legend">
              {[0, 1, 2].map((row) => (
                <div key={row} className="pa-ov-sk-legend-row">
                  <div className="pa-ov-sk-block pa-ov-sk-circle" style={{ width: 12, height: 12 }} />
                  <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: '65%', height: 14 }} />
                  <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 32, height: 14, marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tier 4: Operations & Recent Feed Skeleton */}
      <div className="pa-ov-ops-grid" aria-hidden="true">
        {[0, 1].map((panel) => (
          <div key={panel} className="pa-ov-panel">
            <div className="pa-ov-panel-head">
              <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 180, height: 18 }} />
              <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 96, height: 26, borderRadius: 999 }} />
            </div>
            <div className="pa-ov-sk-list">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="pa-ov-sk-list-row">
                  <div className="pa-ov-sk-block pa-ov-sk-circle" style={{ width: 12, height: 12 }} />
                  <div className="pa-ov-sk-list-text">
                    <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: row % 2 === 0 ? '84%' : '70%', height: 15 }} />
                    <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: '48%', height: 12, marginTop: 6 }} />
                  </div>
                  <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 88, height: 32, borderRadius: 8 }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

