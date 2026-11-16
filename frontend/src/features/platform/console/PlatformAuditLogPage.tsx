import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState, useMemo } from 'react';
import { usePlatformAuditLogs } from '@/hooks/use-platform-admin';
import type { PlatformAuditLog } from '@/services/platform-admin.service';
import { Footer, LoadError, Loading, Pager } from '../components/pulse-ui';
import {
  AUDIT_ACTIONS,
  auditActionLabel,
  auditReason,
  formatDateTime,
  formatRelativeTime,
} from '../components/pulse-format';
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
  Building,
  FileJson,
  Download,
  RotateCw,
  X,
  Check,
  Copy,
  Table as TableIcon,
  Award,
} from 'lucide-react';

function getActionStyle(action: string) {
  const upper = action.toUpperCase();
  if (upper.includes('SUSPEND') || upper.includes('LOCK') || upper.includes('DISCARD') || upper.includes('ARCHIVE')) {
    return { icon: ShieldAlert, color: '#dc2626', bg: '#fef2f2', border: '#fecaca', tone: 'danger' };
  }
  if (upper.includes('GRANT') || upper.includes('PURCHASE') || upper.includes('SEATS')) {
    return { icon: CreditCard, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', tone: 'success' };
  }
  if (upper.includes('RESTORE') || upper.includes('UNLOCK') || upper.includes('DECIDED') || upper.includes('APPROVED')) {
    return { icon: ShieldCheck, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', tone: 'primary' };
  }
  if (upper.includes('PUBLISH') || upper.includes('FRAMEWORK') || upper.includes('CATALOG') || upper.includes('COURSE')) {
    return { icon: Sparkles, color: 'var(--pa-accent, #b85c24)', bg: 'var(--pa-accent-soft, #fef3e7)', border: 'var(--pa-accent-border, #efc69b)', tone: 'accent' };
  }
  if (upper.includes('POSITION') || upper.includes('DEPARTMENT') || upper.includes('MEMBER')) {
    return { icon: FileText, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', tone: 'purple' };
  }
  return { icon: Activity, color: '#475569', bg: '#f8fafc', border: '#e2e8f0', tone: 'neutral' };
}

function formatJsonPayload(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw;
  }
}

interface DiffRow {
  key: string;
  label: string;
  oldVal: string;
  newVal: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
}

const FIELD_LABELS: Record<string, string> = {
  versionNo: 'Số phiên bản',
  status: 'Trạng thái',
  reason: 'Lý do',
  price: 'Đơn giá',
  pricePerSeat: 'Đơn giá mỗi suất',
  seatLimit: 'Hạn mức suất học',
  seatsGranted: 'Số suất cấp',
  lockReason: 'Lý do khóa',
  deactivatedReason: 'Lý do vô hiệu hóa',
  suspensionReason: 'Lý do tạm ngưng',
  name: 'Tên đối tượng',
  title: 'Tiêu đề',
  code: 'Mã định danh',
  email: 'Địa chỉ email',
  role: 'Vai trò tài khoản',
  decision: 'Quyết định đánh giá',
  score: 'Điểm số',
  passed: 'Kết quả đạt',
  feedback: 'Nhận xét đánh giá',
  notes: 'Ghi chú',
  mentorId: 'Mã chuyên gia',
  mentorName: 'Tên chuyên gia',
};

function computeFieldDiff(oldRaw: string | null, newRaw: string | null): DiffRow[] {
  let oldObj: Record<string, unknown> = {};
  let newObj: Record<string, unknown> = {};

  try {
    if (oldRaw) oldObj = typeof oldRaw === 'string' ? JSON.parse(oldRaw) : oldRaw;
  } catch {
    oldObj = { raw: oldRaw };
  }

  try {
    if (newRaw) newObj = typeof newRaw === 'string' ? JSON.parse(newRaw) : newRaw;
  } catch {
    newObj = { raw: newRaw };
  }

  const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));
  if (allKeys.length === 0) return [];

  return allKeys.map((k) => {
    const hasOld = k in oldObj;
    const hasNew = k in newObj;
    const oldVal = hasOld
      ? typeof oldObj[k] === 'object' && oldObj[k] !== null
        ? JSON.stringify(oldObj[k])
        : String(oldObj[k] ?? '')
      : '';
    const newVal = hasNew
      ? typeof newObj[k] === 'object' && newObj[k] !== null
        ? JSON.stringify(newObj[k])
        : String(newObj[k] ?? '')
      : '';

    let type: DiffRow['type'] = 'modified';
    if (!hasOld && hasNew) type = 'added';
    else if (hasOld && !hasNew) type = 'removed';
    else if (oldVal === newVal) type = 'unchanged';

    return {
      key: k,
      label: FIELD_LABELS[k] ?? k,
      oldVal: oldVal || '(Trống)',
      newVal: newVal || '(Trống)',
      type,
    };
  });
}

function AuditActorCell({ email }: { email: string | null }) {
  // Chỉ là "Hệ thống tự động" khi nhật ký không có người thực hiện. Có email thì là người thật:
  // tài khoản quản trị nền tảng (platform@, admin@) hoặc mentor. Nhật ký chưa lưu vai trò nên phân loại theo email.
  const isSystem = !email;
  const isMentor = !isSystem && email.includes('mentor');
  const isAdmin = !isSystem && !isMentor && (email.includes('admin') || email.includes('platform'));

  if (isSystem) {
    return (
      <div className="pa-org-cell-main" style={{ gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            color: '#475569',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
          title={translateUi('Hệ thống tự động')}
          aria-hidden="true"
        >
          <Activity size={15} />
        </div>
        <div style={{ minWidth: 0, display: 'grid', gap: 1 }}>
          <div className="pa-org-name" style={{ fontSize: 13, fontWeight: 600 }}>
            {translateUi('Hệ thống tự động')}
          </div>
          <div className="pa-org-email" style={{ fontSize: 12, color: '#64748b' }}>
            {email ?? 'platform@digitalent.ai'}
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="pa-org-cell-main" style={{ gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'var(--pa-accent-soft, #fef3e7)',
            border: '1px solid var(--pa-accent-border, #fed7aa)',
            color: 'var(--pa-accent-solid, #c2410c)',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            fontSize: 12,
            flexShrink: 0,
          }}
          title={translateUi('Quản trị viên')}
          aria-hidden="true"
        >
          <ShieldCheck size={16} />
        </div>
        <div style={{ minWidth: 0, display: 'grid', gap: 1 }}>
          <div className="pa-org-name" style={{ fontSize: 13, fontWeight: 600 }}>
            {translateUi('Quản trị viên')}
          </div>
          <div className="pa-org-email" style={{ fontSize: 12, color: '#64748b' }}>
            {email}
          </div>
        </div>
      </div>
    );
  }

  if (isMentor) {
    return (
      <div className="pa-org-cell-main" style={{ gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#f5f3ff',
            border: '1px solid #ede9fe',
            color: '#7c3aed',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            fontSize: 12,
            flexShrink: 0,
          }}
          title={translateUi('Chuyên gia thẩm định')}
          aria-hidden="true"
        >
          <Award size={16} />
        </div>
        <div style={{ minWidth: 0, display: 'grid', gap: 1 }}>
          <div className="pa-org-name" style={{ fontSize: 13, fontWeight: 600 }}>
            {translateUi('Mentor')}
          </div>
          <div className="pa-org-email" style={{ fontSize: 12, color: '#64748b' }}>
            {email}
          </div>
        </div>
      </div>
    );
  }

  const prefix = (email || '').split('@')[0] || 'User';
  const initials = prefix.slice(0, 2).toUpperCase();
  return (
    <div className="pa-org-cell-main" style={{ gap: 10 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1d4ed8',
          display: 'grid',
          placeItems: 'center',
          fontWeight: 700,
          fontSize: 12,
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {initials}
      </div>
      <div style={{ minWidth: 0, display: 'grid', gap: 1 }}>
        <div className="pa-org-name" style={{ fontSize: 13, fontWeight: 600 }}>
          {prefix}
        </div>
        <div className="pa-org-email" style={{ fontSize: 12, color: '#64748b' }}>
          {email}
        </div>
      </div>
    </div>
  );
}

type QuickFilterCategory = 'all' | 'security' | 'catalog' | 'seats' | 'members';

/**
 * PA-10 · Nhật ký kiểm tra: High-density Security Audit Log & Visual Diff
 * Thiết kế chuẩn Enterprise B2B SaaS: Bảng dữ liệu mật độ cao,
 * phân loại tác nhân, đối chiếu trường dữ liệu trực quan qua Slide-in Drawer.
 */
export function PlatformAuditLogPage() {
  useUiLanguage();
  const [scope, setScope] = useState<'platform' | 'all'>('platform');
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [category, setCategory] = useState<QuickFilterCategory>('all');
  const [selectedLog, setSelectedLog] = useState<PlatformAuditLog | null>(null);
  const [drawerTab, setDrawerTab] = useState<'diff' | 'raw'>('diff');
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = usePlatformAuditLogs({
    scope,
    action,
    search,
    pageIndex,
    pageSize: 25,
  });

  const filter = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    setPageIndex(1);
  };

  const rawItems = useMemo(() => data?.items ?? [], [data?.items]);
  const totalItems = data?.totalItems ?? rawItems.length;

  // Lọc theo Quick Filter Chips nếu có
  const filteredItems = useMemo(() => {
    if (category === 'all') return rawItems;
    return rawItems.filter((log) => {
      const a = log.action.toUpperCase();
      if (category === 'security') {
        return a.includes('SUSPEND') || a.includes('LOCK') || a.includes('DISCARD') || a.includes('ARCHIVE');
      }
      if (category === 'catalog') {
        return a.includes('CATALOG') || a.includes('COURSE') || a.includes('FRAMEWORK');
      }
      if (category === 'seats') {
        return a.includes('SEAT') || a.includes('GRANT') || a.includes('PRICE') || a.includes('PURCHASE') || a.includes('PLAN');
      }
      if (category === 'members') {
        return a.includes('ORGANIZATION') || a.includes('MEMBER') || a.includes('MENTOR') || a.includes('USER') || a.includes('DEPARTMENT') || a.includes('POSITION') || a.includes('PULSE');
      }
      return true;
    });
  }, [rawItems, category]);

  // Thống kê nhanh KPI từ dữ liệu hiện tại
  const kpiStats = useMemo(() => {
    const security = rawItems.filter((log) => {
      const a = log.action.toUpperCase();
      return a.includes('SUSPEND') || a.includes('LOCK') || a.includes('DISCARD') || a.includes('ARCHIVE');
    }).length;
    const catalog = rawItems.filter((log) => {
      const a = log.action.toUpperCase();
      return a.includes('CATALOG') || a.includes('COURSE') || a.includes('FRAMEWORK');
    }).length;
    const seats = rawItems.filter((log) => {
      const a = log.action.toUpperCase();
      return a.includes('SEAT') || a.includes('GRANT') || a.includes('PURCHASE') || a.includes('PRICE');
    }).length;

    return { total: totalItems, security, catalog, seats };
  }, [rawItems, totalItems]);

  const handleExportCsv = () => {
    if (filteredItems.length === 0) return;
    const headers = ['Thời gian', 'Mã hành động', 'Tên hành động', 'Đối tượng', 'Tổ chức', 'Lý do', 'Người thực hiện'];
    const rows = filteredItems.map((log) => [
      `"${formatDateTime(log.createdAt)}"`,
      `"${log.action}"`,
      `"${auditActionLabel(log.action)}"`,
      `"${(log.entityLabel ?? '').replace(/"/g, '""')}"`,
      `"${(log.organizationName ?? '').replace(/"/g, '""')}"`,
      `"${(auditReason(log.newValues) ?? '').replace(/"/g, '""')}"`,
      `"${log.actorEmail ?? 'Hệ thống'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nhat-ky-kiem-toan-digitalent-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyJson = (payload: string | null) => {
    if (!payload) return;
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const actionStyle = selectedLog ? getActionStyle(selectedLog.action) : null;
  const ActionIcon = actionStyle?.icon ?? Activity;
  const diffRows = selectedLog ? computeFieldDiff(selectedLog.oldValues, selectedLog.newValues) : [];

  return (
    <>
      {/* ✦ 1. HEADER TRANG & NÚT HÀNH ĐỘNG (Chuẩn pa-org-header đồng bộ) */}
      <header className="pa-org-header">
        <div>
          <h1 className="pa-org-title">
            {translateUi('Nhật ký hoạt động')}
          </h1>
          <p className="pa-org-subtitle">
            {translateUi(
              'Mọi thao tác quản trị: ai làm, lúc nào, thay đổi gì và lý do.',
            )}
          </p>
        </div>

        <div className="pa-org-actions">
          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={() => refetch()}
            disabled={isFetching}
            title={translateUi('Tải lại dữ liệu mới nhất')}
          >
            <RotateCw size={14} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />
            <span>{translateUi('Làm mới')}</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={handleExportCsv}
            disabled={filteredItems.length === 0}
            title={translateUi('Xuất danh sách sang file CSV')}
          >
            <Download size={14} aria-hidden="true" />
            <span>{translateUi('Xuất CSV')}</span>
          </button>
        </div>
      </header>

      {/* ✦ 2. DẢI CHỈ SỐ AN NINH (SECURITY KPI STRIP) */}
      <div className="pa-audit-kpi-grid">
        <div className="pa-audit-kpi-card">
          <div className="pa-audit-kpi-icon" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Activity size={18} />
          </div>
          <div>
            <div className="pa-audit-kpi-value">{kpiStats.total}</div>
            <div className="pa-audit-kpi-label">{translateUi('Tổng thao tác')}</div>
          </div>
        </div>

        <div className="pa-audit-kpi-card">
          <div className="pa-audit-kpi-icon" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <div className="pa-audit-kpi-value">{kpiStats.security}</div>
            <div className="pa-audit-kpi-label">{translateUi('Tài khoản')}</div>
          </div>
        </div>

        <div className="pa-audit-kpi-card">
          <div className="pa-audit-kpi-icon" style={{ background: 'var(--pa-accent-soft, #fef3e7)', color: 'var(--pa-accent-solid, #7c2d12)', border: '1px solid var(--pa-accent-border, #efc69b)' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div className="pa-audit-kpi-value">{kpiStats.catalog}</div>
            <div className="pa-audit-kpi-label">{translateUi('Nội dung')}</div>
          </div>
        </div>

        <div className="pa-audit-kpi-card">
          <div className="pa-audit-kpi-icon" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
            <CreditCard size={18} />
          </div>
          <div>
            <div className="pa-audit-kpi-value">{kpiStats.seats}</div>
            <div className="pa-audit-kpi-label">{translateUi('Suất học và giá')}</div>
          </div>
        </div>
      </div>

      {/* ✦ 3. KHU VỰC BẢNG DỮ LIỆU & BỘ LỌC ĐA TẦNG */}
      <section className="surface pad" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
        {/* Hàng nút lọc nhanh 1 chạm (Quick Filter Chips) */}
        <div className="pa-audit-chip-bar">
          <button
            type="button"
            className={`pa-audit-chip ${category === 'all' ? 'is-active' : ''}`}
            onClick={() => setCategory('all')}
          >
            <Activity size={13} />
            <span>{translateUi('Tất cả')}</span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>({rawItems.length})</span>
          </button>

          <button
            type="button"
            className={`pa-audit-chip ${category === 'security' ? 'is-active' : ''}`}
            onClick={() => setCategory('security')}
          >
            <ShieldAlert size={13} />
            <span>{translateUi('Tài khoản')}</span>
          </button>

          <button
            type="button"
            className={`pa-audit-chip ${category === 'catalog' ? 'is-active' : ''}`}
            onClick={() => setCategory('catalog')}
          >
            <Sparkles size={13} />
            <span>{translateUi('Nội dung')}</span>
          </button>

          <button
            type="button"
            className={`pa-audit-chip ${category === 'seats' ? 'is-active' : ''}`}
            onClick={() => setCategory('seats')}
          >
            <CreditCard size={13} />
            <span>{translateUi('Suất học và giá')}</span>
          </button>

          <button
            type="button"
            className={`pa-audit-chip ${category === 'members' ? 'is-active' : ''}`}
            onClick={() => setCategory('members')}
          >
            <Building size={13} />
            <span>{translateUi('Tổ chức và mentor')}</span>
          </button>
        </div>

        {/* Thanh tìm kiếm & Dropdown chi tiết */}
        <div className="pa-row-between" style={{ marginBottom: 18, alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: 320, flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b', pointerEvents: 'none' }} />
            <input
              type="search"
              placeholder={translateUi('Tìm theo đối tượng, lý do hoặc email người thực hiện...')}
              value={search}
              onChange={(e) => filter(setSearch)(e.target.value)}
              aria-label={translateUi('Tìm trong nhật ký')}
              style={{
                paddingLeft: 34,
                paddingRight: search ? 34 : 12,
                height: 38,
                width: '100%',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => filter(setSearch)('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 10,
                  border: 'none',
                  background: 'transparent',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 2,
                }}
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={action}
              onChange={(e) => filter(setAction)(e.target.value)}
              aria-label={translateUi('Loại thao tác')}
              style={{ height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
            >
              <option value="">{translateUi('Mọi thao tác')}</option>
              {Object.entries(AUDIT_ACTIONS).map(([code, label]) => (
                <option key={code} value={code}>
                  {translateUi(label)}
                </option>
              ))}
            </select>

            <select
              value={scope}
              onChange={(e) => filter(setScope)(e.target.value as 'platform' | 'all')}
              aria-label={translateUi('Phạm vi')}
              style={{ height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
            >
              <option value="platform">{translateUi('Quản trị nền tảng')}</option>
              <option value="all">{translateUi('Tất cả tổ chức')}</option>
            </select>

            {(search || action || category !== 'all') && (
              <button
                type="button"
                className="btn btn-ghost btn-small inline-flex items-center gap-1"
                onClick={() => {
                  setSearch('');
                  setAction('');
                  setCategory('all');
                  setPageIndex(1);
                }}
                style={{ color: '#64748b', fontSize: 12.5 }}
              >
                <X size={13} />
                <span>{translateUi('Xóa bộ lọc')}</span>
              </button>
            )}
          </div>
        </div>

        {isLoading && <Loading />}
        {error && <LoadError error={error} />}

        {filteredItems.length === 0 && !isLoading && (
          <div style={{ padding: '48px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
            <Activity size={36} style={{ color: '#64748b', margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0f172a' }}>
              {translateUi('Chưa có thao tác nào phù hợp')}
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              {translateUi('Thử tìm kiếm với từ khóa khác hoặc bấm nút xóa bộ lọc để hiển thị toàn bộ.')}
            </p>
          </div>
        )}

        {/* ✦ 4. BẢNG DỮ LIỆU KIỂM TOÁN MẬT ĐỘ CAO (HIGH-DENSITY AUDIT TABLE) */}
        {filteredItems.length > 0 && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 180 }}>{translateUi('Thời gian')}</th>
                  <th style={{ width: 250 }}>{translateUi('Thao tác')}</th>
                  <th>{translateUi('Đối tượng')}</th>
                  <th>{translateUi('Lý do')}</th>
                  <th style={{ width: 210 }}>{translateUi('Người thực hiện')}</th>
                  <th style={{ width: 100, textAlign: 'right' }}>{translateUi('Chi tiết')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((log: PlatformAuditLog) => {
                  const style = getActionStyle(log.action);
                  const Icon = style.icon;
                  const reason = auditReason(log.newValues);

                  return (
                    <tr
                      key={log.id}
                      className="pa-audit-row"
                      onClick={() => setSelectedLog(log)}
                      title={translateUi('Bấm để mở ngăn kéo đối chiếu dữ liệu chi tiết')}
                    >
                      {/* Cột 1: Thời gian 2 tầng */}
                      <td>
                        <div style={{ display: 'grid', gap: 2 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>
                            {formatRelativeTime(log.createdAt)}
                          </span>
                          <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                            {formatDateTime(log.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Cột 2: Hành động an ninh đã chuẩn hóa */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 7,
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
                            {translateUi(auditActionLabel(log.action))}
                          </span>
                        </div>
                      </td>

                      {/* Cột 3: Đối tượng & Tổ chức */}
                      <td>
                        <div style={{ display: 'grid', gap: 3 }}>
                          {log.entityLabel ? (
                            <strong style={{ fontSize: 13, color: '#1e293b' }}>
                              {translateUi(log.entityLabel)}
                            </strong>
                          ) : (
                            <span style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic' }}>
                              {translateUi('Mục hệ thống chung')}
                            </span>
                          )}

                          {log.organizationName && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#0369a1' }}>
                              <Building size={11} />
                              <span>{log.organizationName}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cột 4: Lý do thao tác (Không dùng em-dash —) */}
                      <td>
                        {reason ? (
                          <div
                            style={{
                              fontSize: 12.5,
                              color: '#334155',
                              maxWidth: 320,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={reason}
                          >
                            “{reason}”
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                            {translateUi('Không ghi lý do')}
                          </span>
                        )}
                      </td>

                      {/* Cột 5: Tác nhân thực hiện (Avatar chuẩn + Typography phân cấp) */}
                      <td>
                        <AuditActorCell email={log.actorEmail} />
                      </td>

                      {/* Cột 6: Nút Đối chiếu chi tiết */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          style={{
                            padding: '4px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            borderRadius: 6,
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#334155',
                          }}
                          title={translateUi('Xem chi tiết dữ liệu')}
                        >
                          <FileJson size={13} style={{ color: 'var(--pa-accent, #b85c24)' }} />
                          <span>{translateUi('Xem')}</span>
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
            <Pager
              pageIndex={data.pageIndex}
              totalPages={data.totalPages}
              totalItems={filteredItems.length}
              onChange={setPageIndex}
            />
          </div>
        )}
      </section>

      {/* ✦ 5. NGĂN KÉO ĐỐI CHIẾU DỮ LIỆU KIỂM TOÁN (IN-CONTEXT AUDIT DIFF DRAWER) */}
      <PlatformDrawer
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title={selectedLog ? translateUi(auditActionLabel(selectedLog.action)) : ''}
        subtitle={
          selectedLog ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', marginTop: 2 }}>
              <Clock size={12} />
              <span>{formatDateTime(selectedLog.createdAt)}</span>
              <span>•</span>
              <span>{selectedLog.actorEmail ?? translateUi('Hệ thống tự động')}</span>
            </div>
          ) : undefined
        }
        icon={ActionIcon}
        badge={
          selectedLog?.organizationName ? (
            <span
              style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#eff6ff',
                color: '#1d4ed8',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Building size={11} />
              {selectedLog.organizationName}
            </span>
          ) : undefined
        }
        width={660}
      >
        {selectedLog && (
          <div style={{ display: 'grid', gap: 18 }}>
            {/* Thẻ tóm tắt thông tin ngữ cảnh */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'grid',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{translateUi('Mã hành động')}:</span>
                <code
                  style={{
                    background: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#0f172a',
                  }}
                >
                  {selectedLog.action}
                </code>
              </div>

              {selectedLog.entityLabel && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>{translateUi('Đối tượng tác động')}:</span>
                  <strong style={{ color: '#0f172a' }}>{translateUi(selectedLog.entityLabel)}</strong>
                </div>
              )}

              {selectedLog.organizationName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>{translateUi('Tổ chức liên quan')}:</span>
                  <span style={{ color: '#0369a1', fontWeight: 600 }}>{selectedLog.organizationName}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{translateUi('Người thực hiện')}:</span>
                <span style={{ color: '#334155', fontFamily: 'monospace' }}>
                  {selectedLog.actorEmail ?? translateUi('Hệ thống tự động')}
                </span>
              </div>

              {auditReason(selectedLog.newValues) && (
                <div style={{ paddingTop: 10, borderTop: '1px solid #e2e8f0', marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>
                    {translateUi('Lý do')}:
                  </span>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#1e293b',
                      background: '#ffffff',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      borderLeft: '3px solid var(--pa-accent, #b85c24)',
                    }}
                  >
                    “{auditReason(selectedLog.newValues)}”
                  </div>
                </div>
              )}
            </div>

            {/* Bộ chuyển tab chế độ xem Diff */}
            <div>
              <div className="pa-diff-nav">
                <button
                  type="button"
                  className={`pa-diff-tab-btn ${drawerTab === 'diff' ? 'is-active' : ''}`}
                  onClick={() => setDrawerTab('diff')}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <TableIcon size={14} />
                    <span>{translateUi('Thay đổi')}</span>
                  </span>
                </button>

                <button
                  type="button"
                  className={`pa-diff-tab-btn ${drawerTab === 'raw' ? 'is-active' : ''}`}
                  onClick={() => setDrawerTab('raw')}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <FileJson size={14} />
                    <span>{translateUi('JSON')}</span>
                  </span>
                </button>
              </div>

              {/* Chế độ 1: Bảng đối chiếu từng trường (Field-by-Field Diff) */}
              {drawerTab === 'diff' && (
                <div>
                  {diffRows.length > 0 ? (
                    <table className="pa-diff-table">
                      <thead>
                        <tr>
                          <th style={{ width: 160 }}>{translateUi('Trường dữ liệu')}</th>
                          <th>{translateUi('Trước thay đổi')}</th>
                          <th>{translateUi('Sau thay đổi')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diffRows.map((row) => (
                          <tr key={row.key}>
                            <td>
                              <strong style={{ color: '#0f172a' }}>{row.label}</strong>
                              <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{row.key}</div>
                            </td>
                            <td>
                              <span
                                style={{
                                  fontSize: 12,
                                  color: row.type === 'removed' ? '#dc2626' : '#64748b',
                                  textDecoration: row.type === 'removed' ? 'line-through' : 'none',
                                }}
                              >
                                {row.oldVal}
                              </span>
                            </td>
                            <td>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: row.type !== 'unchanged' ? 600 : 400,
                                  color: row.type === 'added' ? '#16a34a' : '#0f172a',
                                  background: row.type === 'added' ? '#f0fdf4' : 'transparent',
                                  padding: row.type === 'added' ? '2px 6px' : 0,
                                  borderRadius: 4,
                                }}
                              >
                                {row.newVal}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '24px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                      <p style={{ margin: 0, fontSize: 12.5, color: '#64748b' }}>
                        {translateUi('Sự kiện này không có payload đối chiếu chi tiết.')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Chế độ 2: Mã JSON gốc (Raw Payload) */}
              {drawerTab === 'raw' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      {translateUi('JSON Snapshot lưu trữ bất biến')}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline btn-small inline-flex items-center gap-1.5"
                      onClick={() => handleCopyJson(selectedLog.newValues || selectedLog.oldValues)}
                      style={{ fontSize: 12, padding: '3px 10px', height: 28 }}
                    >
                      {copied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                      <span>{copied ? translateUi('Đã sao chép') : translateUi('Sao chép JSON')}</span>
                    </button>
                  </div>

                  <div
                    style={{
                      padding: 16,
                      borderRadius: 10,
                      background: '#0f172a',
                      color: '#f8fafc',
                      fontSize: 12,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      overflowX: 'auto',
                    }}
                  >
                    {selectedLog.oldValues && (
                      <div style={{ marginBottom: 14 }}>
                        <span style={{ color: '#f87171', fontWeight: 700 }}>
                          - {translateUi('Giá trị cũ (oldValues)')}:
                        </span>
                        <pre style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap', color: '#fca5a5', lineHeight: 1.5 }}>
                          {formatJsonPayload(selectedLog.oldValues)}
                        </pre>
                      </div>
                    )}

                    {selectedLog.newValues ? (
                      <div>
                        <span style={{ color: '#4ade80', fontWeight: 700 }}>
                          + {translateUi('Giá trị mới (newValues)')}:
                        </span>
                        <pre style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap', color: '#86efac', lineHeight: 1.5 }}>
                          {formatJsonPayload(selectedLog.newValues)}
                        </pre>
                      </div>
                    ) : (
                      <div style={{ color: '#64748b' }}>
                        {translateUi('Không có dữ liệu chi tiết cho sự kiện này.')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </PlatformDrawer>

      <Footer />
    </>
  );
}
