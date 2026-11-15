export function PlatformOrganizationsSkeleton() {
  return (
    <div className="pa-org-skeleton-wrap" role="status" aria-live="polite" aria-label="Đang tải danh sách tổ chức khách hàng">
      {/* 4 KPI Cards Skeleton */}
      <div className="pa-org-kpi-grid" aria-hidden="true">
        {[0, 1, 2, 3].map((idx) => (
          <div key={idx} className="pa-org-kpi-card is-loading">
            <div className="pa-org-kpi-top">
              <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: '50%', height: 13 }} />
              <div className="pa-ov-sk-block" style={{ width: 30, height: 30, borderRadius: 8 }} />
            </div>
            <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: '40%', height: 26, margin: '6px 0 4px' }} />
            <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: '70%', height: 12 }} />
          </div>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <div className="pa-org-toolbar-sk" aria-hidden="true" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, margin: '20px 0 16px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[90, 120, 110, 95].map((w, idx) => (
            <div key={idx} className="pa-ov-sk-block" style={{ width: w, height: 36, borderRadius: 8 }} />
          ))}
        </div>
        <div className="pa-ov-sk-block" style={{ width: 280, height: 38, borderRadius: 8 }} />
      </div>

      {/* Table Skeleton */}
      <div className="pa-org-table-sk" aria-hidden="true" style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #dbe2ea', padding: 16 }}>
        <div className="pa-ov-sk-block" style={{ width: '100%', height: 38, borderRadius: 6, marginBottom: 12 }} />
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div className="pa-ov-sk-block" style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: '45%', height: 14 }} />
              <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: '30%', height: 12, marginTop: 6 }} />
            </div>
            <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 140, height: 20 }} />
            <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 120, height: 20 }} />
            <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 80, height: 14 }} />
            <div className="pa-ov-sk-block" style={{ width: 70, height: 28, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
