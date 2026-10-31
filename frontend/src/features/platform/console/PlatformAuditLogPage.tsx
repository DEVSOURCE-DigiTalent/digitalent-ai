import { useState } from 'react';
import { usePlatformAuditLogs } from '@/hooks/use-platform-admin';
import type { PlatformAuditLog } from '@/services/platform-admin.service';
import { Footer, LoadError, Loading, Pager } from '../components/pulse-ui';
import { AUDIT_ACTIONS, auditActionLabel, auditReason, formatDateTime } from '../components/pulse-format';
import { PlatformDrawer } from '../components/PlatformDrawer';
import {
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Sparkles,
  FileText,
  Activity,
  Search,
  Clock,
  User,
  Building,
  FileJson,
} from 'lucide-react';

function getActionStyle(action: string) {
  const upper = action.toUpperCase();
  if (upper.includes('GRANT') || upper.includes('PURCHASE')) {
    return { icon: CreditCard, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
  }
  if (upper.includes('SUSPEND') || upper.includes('LOCK')) {
    return { icon: ShieldAlert, color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' };
  }
  if (upper.includes('RESTORE') || upper.includes('UNLOCK')) {
    return { icon: ShieldCheck, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
  }
  if (upper.includes('PUBLISH') || upper.includes('FRAMEWORK')) {
    return { icon: Sparkles, color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  }
  if (upper.includes('POSITION') || upper.includes('CATALOG')) {
    return { icon: FileText, color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' };
  }
  return { icon: Activity, color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0' };
}

function formatJsonPayload(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw;
  }
}

/**
 * PA-10 · Nhật ký kiểm tra: High-density Security Audit Table
 * Thiết kế chuẩn Enterprise B2B SaaS: Bảng dữ liệu mật độ cao,
 * kiểm tra chi tiết JSON Payload Diff qua Slide-in Drawer không phá vỡ layout.
 */
export function PlatformAuditLogPage() {
  const [scope, setScope] = useState<'platform' | 'all'>('platform');
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const { data, isLoading, error } = usePlatformAuditLogs({ scope, action, search, pageIndex, pageSize: 25 });
  const [selectedLog, setSelectedLog] = useState<PlatformAuditLog | null>(null);

  const filter = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    setPageIndex(1);
  };

  const actionStyle = selectedLog ? getActionStyle(selectedLog.action) : null;
  const ActionIcon = actionStyle?.icon ?? Activity;

  return (
    <>
      <div className="pa-page-header">
        <div className="pa-row-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="pa-header-eyebrow">
              <span className="pa-eyebrow-dot" />
              QUẢN TRỊ NỀN TẢNG / NHẬT KÝ KIỂM TRA & TRUY VẾT
            </div>
            <h1 className="pa-header-title">Mỗi thao tác nhạy cảm đều có lý do.</h1>
            <p className="pa-header-subtitle">
              Truy vết an ninh bất biến: Các lần phát hành khung, cấp suất học, tạm ngưng/khôi phục tổ chức, khóa tài khoản được ghi nhận phục vụ kiểm toán.
            </p>
          </div>
        </div>
      </div>

      <section className="surface pad" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
        {/* Multi-Filter Bar */}
        <div className="pa-row-between" style={{ marginBottom: 18, alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: 320, flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="search"
              placeholder="Tìm theo đối tượng, lý do hoặc email người thực hiện..."
              value={search}
              onChange={(e) => filter(setSearch)(e.target.value)}
              aria-label="Tìm trong nhật ký"
              style={{ paddingLeft: 34, height: 38, width: '100%', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select
              value={action}
              onChange={(e) => filter(setAction)(e.target.value)}
              aria-label="Loại thao tác"
              style={{ height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
            >
              <option value="">Tất cả loại thao tác</option>
              {Object.entries(AUDIT_ACTIONS).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={scope}
              onChange={(e) => filter(setScope)(e.target.value as 'platform' | 'all')}
              aria-label="Phạm vi"
              style={{ height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
            >
              <option value="platform">Thao tác của nền tảng</option>
              <option value="all">Mọi tổ chức trên hệ thống</option>
            </select>
          </div>
        </div>

        {isLoading && <Loading />}
        {error && <LoadError error={error} />}

        {data && data.items.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0' }}>
            <Activity size={36} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>Chưa có thao tác nào được ghi nhận</div>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>Thử tìm kiếm với từ khóa khác hoặc chuyển phạm vi lọc.</p>
          </div>
        )}

        {/* High-density Enterprise Security Audit Table */}
        {data && data.items.length > 0 && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 170 }}>Thời gian</th>
                  <th style={{ width: 230 }}>Hành động an ninh</th>
                  <th>Đối tượng & Tổ chức</th>
                  <th>Lý do thao tác</th>
                  <th style={{ width: 190 }}>Người thực hiện</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log: PlatformAuditLog) => {
                  const style = getActionStyle(log.action);
                  const Icon = style.icon;
                  const reason = auditReason(log.newValues);

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      style={{ cursor: 'pointer' }}
                      title="Bấm để mở ngăn kéo xem chi tiết dữ liệu kiểm toán"
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                          <Clock size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          <span style={{ fontFamily: 'monospace' }}>{formatDateTime(log.createdAt)}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 6,
                              background: style.bg,
                              border: `1px solid ${style.border}`,
                              color: style.color,
                              display: 'grid',
                              placeItems: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={14} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                            {auditActionLabel(log.action)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {log.entityLabel && (
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
                              {log.entityLabel}
                            </span>
                          )}
                          {log.organizationName && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#0284c7' }}>
                              <Building size={11} />
                              {log.organizationName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {reason ? (
                          <div style={{ fontSize: 12, color: '#475569', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            “{reason}”
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                          <User size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          <span style={{ maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.actorEmail ?? 'Hệ thống tự động'}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          style={{ padding: '4px 8px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          title="Xem chi tiết snapshot dữ liệu"
                        >
                          <FileJson size={13} />
                          Diff
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && (
          <div style={{ marginTop: 18 }}>
            <Pager pageIndex={data.pageIndex} totalPages={data.totalPages} totalItems={data.totalItems} onChange={setPageIndex} />
          </div>
        )}
      </section>

      {/* Slide-in Drawer for In-Context Audit Detail & JSON Diff */}
      <PlatformDrawer
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title={selectedLog ? auditActionLabel(selectedLog.action) : ''}
        subtitle={
          selectedLog ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <Clock size={12} />
              {formatDateTime(selectedLog.createdAt)} · Thực hiện bởi {selectedLog.actorEmail ?? 'Hệ thống'}
            </div>
          ) : undefined
        }
        icon={ActionIcon}
        badge={
          selectedLog?.organizationName ? (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Building size={11} />
              {selectedLog.organizationName}
            </span>
          ) : undefined
        }
        width={620}
      >
        {selectedLog && (
          <div style={{ display: 'grid', gap: 18 }}>
            {/* Context Info Card */}
            <div style={{ padding: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Loại thao tác:</span>
                <strong style={{ color: '#0f172a' }}>{selectedLog.action}</strong>
              </div>
              {selectedLog.entityLabel && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Đối tượng tác động:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedLog.entityLabel}</strong>
                </div>
              )}
              {selectedLog.organizationName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Tổ chức liên quan:</span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>{selectedLog.organizationName}</span>
                </div>
              )}
              {selectedLog.actorEmail && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Người thực hiện:</span>
                  <span style={{ color: '#334155', fontFamily: 'monospace' }}>{selectedLog.actorEmail}</span>
                </div>
              )}
              {auditReason(selectedLog.newValues) && (
                <div style={{ paddingTop: 8, borderTop: '1px solid #e2e8f0', marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 }}>Lý do can thiệp:</span>
                  <div style={{ fontSize: 13, color: '#1e293b', fontStyle: 'italic', background: '#fff', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    “{auditReason(selectedLog.newValues)}”
                  </div>
                </div>
              )}
            </div>

            {/* JSON Payload Diff View */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileJson size={16} color="#d97706" />
                  Đối chiếu Dữ liệu Kiểm toán (Audit Payload Diff)
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>JSON Snapshot bất biến</span>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: '#0f172a', color: '#f8fafc', fontSize: 11, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', overflowX: 'auto' }}>
                {selectedLog.oldValues && (
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: '#f87171', fontWeight: 700 }}>- Giá trị trước khi thay đổi (oldValues):</span>
                    <pre style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap', color: '#fca5a5', lineHeight: 1.5 }}>
                      {formatJsonPayload(selectedLog.oldValues)}
                    </pre>
                  </div>
                )}
                {selectedLog.newValues ? (
                  <div>
                    <span style={{ color: '#4ade80', fontWeight: 700 }}>+ Giá trị áp dụng mới (newValues):</span>
                    <pre style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap', color: '#86efac', lineHeight: 1.5 }}>
                      {formatJsonPayload(selectedLog.newValues)}
                    </pre>
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8' }}>Không có payload dữ liệu chi tiết cho sự kiện này.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </PlatformDrawer>

      <Footer />
    </>
  );
}
