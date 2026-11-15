/**
 * Matched skeleton loader for PlatformTrialsPage (/platform/trials).
 * Uses .pa-ov-sk-block shimmer with @media (prefers-reduced-motion: reduce) support.
 */
export function PlatformTrialsSkeleton() {
  return (
    <div
      className="pa-ov-skeleton-wrap"
      role="status"
      aria-live="polite"
      aria-label="Đang tải danh sách đánh giá dùng thử"
    >
      {/* 4 Compact KPI Filter Cards Skeleton */}
      <div className="pa-ov-kpi-grid pa-tr-kpi-compact" aria-hidden="true">
        {[0, 1, 2, 3].map((idx) => (
          <div key={idx} className="pa-ov-kpi-card" style={{ minHeight: 82, padding: '12px 14px' }}>
            <div className="pa-ov-kpi-top">
              <div className="pa-ov-sk-block" style={{ width: '58%', height: 14 }} />
              <div className="pa-ov-sk-block" style={{ width: 28, height: 28, borderRadius: 8 }} />
            </div>
            <div className="pa-ov-sk-block" style={{ width: '40%', height: 26, marginTop: 6 }} />
          </div>
        ))}
      </div>

      {/* Main Worklist Table Skeleton */}
      <div className="pa-ov-panel" aria-hidden="true">
        <div className="pa-tr-toolbar-sk">
          <div className="pa-ov-sk-block" style={{ width: 420, height: 38, borderRadius: 8 }} />
          <div className="pa-tr-toolbar-sk-right">
            <div className="pa-ov-sk-block" style={{ width: 200, height: 40, borderRadius: 8 }} />
            <div className="pa-ov-sk-block" style={{ width: 170, height: 40, borderRadius: 8 }} />
            <div className="pa-ov-sk-block" style={{ width: 150, height: 40, borderRadius: 8 }} />
          </div>
        </div>
        <div className="pa-ov-sk-list" style={{ marginTop: 18 }}>
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="pa-ov-sk-list-row" style={{ gap: 16, padding: '8px 0' }}>
              <div className="pa-ov-sk-block" style={{ width: 36, height: 36, borderRadius: 10 }} />
              <div className="pa-ov-sk-list-text">
                <div className="pa-ov-sk-block" style={{ width: row % 2 === 0 ? '48%' : '38%', height: 16 }} />
                <div className="pa-ov-sk-block" style={{ width: '32%', height: 13, marginTop: 6 }} />
              </div>
              <div className="pa-ov-sk-block" style={{ width: 130, height: 22 }} />
              <div className="pa-ov-sk-block" style={{ width: 120, height: 28, borderRadius: 999 }} />
              <div className="pa-ov-sk-block" style={{ width: 130, height: 32, borderRadius: 8 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Mentor Team Scorecard Table Skeleton */}
      <div className="pa-ov-panel" aria-hidden="true">
        <div className="pa-ov-panel-head">
          <div>
            <div className="pa-ov-sk-block" style={{ width: 240, height: 18 }} />
            <div className="pa-ov-sk-block" style={{ width: 300, height: 14, marginTop: 6 }} />
          </div>
        </div>
        <div className="pa-ov-sk-list" style={{ marginTop: 12 }}>
          {[0, 1, 2].map((card) => (
            <div key={card} className="pa-ov-sk-list-row" style={{ gap: 16, padding: '10px 0' }}>
              <div className="pa-ov-sk-block pa-ov-sk-circle" style={{ width: 36, height: 36 }} />
              <div className="pa-ov-sk-list-text" style={{ width: '28%' }}>
                <div className="pa-ov-sk-block" style={{ width: '70%', height: 15 }} />
                <div className="pa-ov-sk-block" style={{ width: '85%', height: 13, marginTop: 6 }} />
              </div>
              <div className="pa-ov-sk-block" style={{ width: '22%', height: 18 }} />
              <div className="pa-ov-sk-block" style={{ width: '28%', height: 26, borderRadius: 6 }} />
              <div className="pa-ov-sk-block" style={{ width: 90, height: 30, borderRadius: 8 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

