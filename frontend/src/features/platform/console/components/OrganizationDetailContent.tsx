import { canonicalCourseCode } from '@/features/courses/course-code';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { PlatformOrganization } from '@/services/platform-admin.service';
import { useOrganizationAction, usePlatformOrganization } from '@/hooks/use-platform-admin';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { LoadError, Loading, ReasonField } from '../../components/pulse-ui';
import {
  LEVEL_NAMES,

  ROLE_LABELS,
  USER_STATUS,
  errorMessage,
  formatDate,
  formatDateTime,
  formatMoney,
  isReasonValid,
} from '../../components/pulse-format';
import { CompanyAvatar } from '../../components/CompanyAvatar';
import { extractContracts } from './contracts';
import {
  BookOpen,
  Users,
  CreditCard,
  ShieldAlert,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight,
  FileCheck,
} from 'lucide-react';

type SupportAction = 'suspend' | 'restore';
type DetailTab = 'overview' | 'people' | 'orders' | 'support';

interface OrganizationDetailContentProps {
  orgId: string;
  isDrawer?: boolean;
}

/** Mã nội bộ dạng TRIAL-<32 ký tự> không có ích khi đọc: chỉ hiện mã ngắn như DIGITALENT. */
function readableOrgCode(code: string | null | undefined): string | null {
  return code && code.length <= 20 ? code : null;
}

export function OrganizationDetailContent({ orgId, isDrawer }: OrganizationDetailContentProps) {
  useUiLanguage();
  const { data, isLoading, error } = usePlatformOrganization(orgId);
  const action = useOrganizationAction(orgId);
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_ORGANIZATION_MANAGE);

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [kind, setKind] = useState<SupportAction | null>(null);
  const [reason, setReason] = useState('');

  if (isLoading) return <Loading />;
  if (error || !data) return <LoadError error={error} />;

  const raw = data as unknown as {
    organization?: PlatformOrganization;
    departments?: unknown[];
    people?: typeof data.people;
    purchasedCourses?: typeof data.purchasedCourses;
    orders?: typeof data.orders;
    coursesInUse?: typeof data.coursesInUse;
  };
  const o: PlatformOrganization = raw.organization ?? (data as unknown as PlatformOrganization);
  if (!o) return <LoadError error={new Error('Không tìm thấy dữ liệu tổ chức')} />;

  const suspended = o.status === 'SUSPENDED';
  const peopleList = raw.people ?? [];
  const ordersList = raw.orders ?? [];
  const purchasedList = raw.purchasedCourses ?? [];
  // Chỉ một thao tác hợp lệ theo trạng thái: đang hoạt động thì tạm ngưng, đang tạm ngưng thì mở lại.
  const supportKind: SupportAction = kind ?? (suspended ? 'restore' : 'suspend');
  const actionAllowed = supportKind === 'suspend' ? !suspended : suspended;
  const coursesInUseList = raw.coursesInUse ?? [];

  const participantCount = o.participantCount ?? (o as unknown as { membersCount?: number }).membersCount ?? peopleList.length;
  const employeeCount = o.employeeCount ?? (o as unknown as { seatLimit?: number }).seatLimit ?? 10;
  const departmentCount = o.departmentCount ?? (o as unknown as { departmentsCount?: number }).departmentsCount ?? (raw.departments?.length ?? 1);
  const pctActivated = Math.min(100, Math.round((participantCount / Math.max(employeeCount, 1)) * 100));

  // Hợp đồng điện tử thật: đọc từ ghi chú các đơn mua, không sinh mã
  const contracts = extractContracts(ordersList);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    action.mutate({ kind: supportKind, reason: reason.trim() }, {
      onSuccess: () => {
        setReason('');
        setKind(null);
        toast.success(supportKind === 'suspend' ? `Đã tạm ngưng ${o.name}` : `Đã khôi phục ${o.name}`);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  return (
    <div className="pa-org-detail-wrap">
      {/* Hero Organization Banner (Shown on standalone page, omitted in drawer to avoid duplicate header) */}
      {!isDrawer && (
        <div className="pa-org-detail-banner">
          <div className="pa-org-detail-head-left">
            <CompanyAvatar name={o.name} size={44} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="pa-org-detail-name">{o.name}</span>
                {suspended ? (
                  <span className="pa-tr-pill is-neutral">
                    <span className="pa-tr-pill-dot" aria-hidden="true" />
                    <span>Tạm ngưng</span>
                  </span>
                ) : o.stage === 'PAID' ? (
                  <span className="pa-tr-pill is-ok">
                    <span className="pa-tr-pill-dot" aria-hidden="true" />
                    <span>Đã mua khóa</span>
                  </span>
                ) : (
                  <span className="pa-tr-pill is-warn">
                    <span className="pa-tr-pill-dot" aria-hidden="true" />
                    <span>Đang dùng thử</span>
                  </span>
                )}
              </div>
              <div className="pa-org-detail-sub">
                {o.ownerEmail ? `Chủ doanh nghiệp: ${o.ownerEmail}` : 'Chưa có chủ doanh nghiệp'}
                {readableOrgCode(o.code) ? ` · Mã: ${readableOrgCode(o.code)}` : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3 Quick Executive Stat Chips */}
      <div className="pa-org-detail-strip">
        <div className="pa-org-detail-chip is-hero">
          <span className="pa-org-detail-chip-label">Khóa đã mua</span>
          <span className="pa-org-detail-chip-val">
            {purchasedList.length} khóa
          </span>
          <span className="pa-org-detail-chip-sub">
            {purchasedList.length > 0 ? 'Mọi nhân viên đều học được' : 'Chưa mua khóa nào'}
          </span>
        </div>

        <div className="pa-org-detail-chip">
          <span className="pa-org-detail-chip-label">Nhân viên đang học</span>
          <span className="pa-org-detail-chip-val">
            {participantCount} / {employeeCount}
          </span>
          <span className="pa-org-detail-chip-sub">
            {pctActivated}% đang học · {departmentCount} phòng ban
          </span>
        </div>

        <div className="pa-org-detail-chip">
          <span className="pa-org-detail-chip-label">Khóa đang học</span>
          <span className="pa-org-detail-chip-val">
            {coursesInUseList.length} khóa
          </span>
          <span className="pa-org-detail-chip-sub">
            {(o.coursesInUseByLevel ?? []).filter(Boolean).length} cấp độ
          </span>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="pa-org-detail-tabs" role="tablist" aria-label="Các mục của hồ sơ tổ chức">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'overview'}
          className="pa-org-detail-tab-btn"
          onClick={() => setActiveTab('overview')}
        >
          <BookOpen size={14} aria-hidden="true" />
          <span>Tổng quan</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'people'}
          className="pa-org-detail-tab-btn"
          onClick={() => setActiveTab('people')}
        >
          <Users size={14} aria-hidden="true" />
          <span>Nhân viên</span>
          <span className="pa-org-detail-tab-badge">{peopleList.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'orders'}
          className="pa-org-detail-tab-btn"
          onClick={() => setActiveTab('orders')}
        >
          <CreditCard size={14} aria-hidden="true" />
          <span>Khóa đã mua</span>
          <span className="pa-org-detail-tab-badge">{ordersList.length}</span>
        </button>

        {canManage && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'support'}
            className="pa-org-detail-tab-btn"
            onClick={() => setActiveTab('support')}
          >
            <ShieldAlert size={14} aria-hidden="true" />
            <span>Hỗ trợ</span>
          </button>
        )}
      </div>

      {/* TAB 1: TỔNG QUAN & HỢP ĐỒNG */}
      {activeTab === 'overview' && (
        <div className="pa-org-detail-panel">
          {/* Service Configuration & License Validity Info */}
          <div className="pa-org-detail-card">
            <div className="pa-org-detail-card-head">
              <span className="pa-org-detail-card-title">
                <span className="pa-org-detail-icon-box" aria-hidden="true">
                  <Calendar size={14} />
                </span>
                Trạng thái tổ chức
              </span>
              <span style={{ fontSize: 12, color: 'var(--pa-ink-3)' }}>Đăng ký: {formatDate(o.createdAt)}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              <div style={{ padding: '9px 12px', background: 'var(--pa-surface-sub)', borderRadius: 8, border: '1px solid var(--pa-border)' }}>
                <span style={{ fontSize: 12, color: 'var(--pa-ink-3)', display: 'block', marginBottom: 2 }}>Trạng thái</span>
                <strong style={{ color: suspended ? 'var(--pa-danger)' : 'var(--pa-ink)', display: 'block' }}>
                  {suspended ? 'Đang tạm ngưng' : o.stage === 'PAID' ? 'Đã mua khóa' : 'Đang dùng thử'}
                </strong>
                <span style={{ fontSize: 12, color: 'var(--pa-ink-3)' }}>
                  {suspended ? 'Nhân viên không đăng nhập được' : (readableOrgCode(o.code) ? `Mã tổ chức: ${readableOrgCode(o.code)}` : '')}
                </span>
              </div>

              <div style={{ padding: '9px 12px', background: 'var(--pa-surface-sub)', borderRadius: 8, border: '1px solid var(--pa-border)' }}>
                <span style={{ fontSize: 12, color: 'var(--pa-ink-3)', display: 'block', marginBottom: 2 }}>Chủ doanh nghiệp</span>
                <strong style={{ color: 'var(--pa-ink)', display: 'block' }}>{o.ownerName || 'Chưa có chủ doanh nghiệp'}</strong>
                <span style={{ fontSize: 12, color: 'var(--pa-ink-3)' }}>{o.ownerEmail ?? 'Chưa gán tài khoản chủ'}</span>
              </div>
            </div>
          </div>

          <div className="pa-org-detail-card">
            <div className="pa-org-detail-card-head">
              <span className="pa-org-detail-card-title">
                <span className="pa-org-detail-icon-box" aria-hidden="true">
                  <FileCheck size={14} />
                </span>
                Hợp đồng điện tử
              </span>
              <span style={{ fontSize: 12, color: 'var(--pa-ink-3)' }}>{contracts.length} hợp đồng</span>
            </div>

            {contracts.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--pa-ink-3)', margin: 0 }}>
                {o.stage === 'PAID'
                  ? 'Các đơn mua của tổ chức này chưa gắn với hợp đồng điện tử.'
                  : 'Chưa có hợp đồng. Tổ chức đang dùng thử, chưa mua khóa nào.'}
              </p>
            ) : (
              <ul className="pa-contract-list">
                {contracts.map((c) => (
                  <li key={c.code} className="pa-contract-item">
                    <div>
                      <code className="pa-contract-code">{c.code}</code>
                      <div className="pa-contract-sub">
                        Ký ngày {formatDate(c.signedAt)}
                        {c.signer ? ` · Đại diện: ${c.signer}` : ''}
                      </div>
                    </div>
                    <div className="pa-contract-amount">
                      <strong>{formatMoney(c.totalAmount)}</strong>
                      <span>{c.orderCount} khóa</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Courses in use */}
          <div className="pa-org-detail-card">
            <div className="pa-org-detail-card-head">
              <span className="pa-org-detail-card-title">
                <span className="pa-org-detail-icon-box" aria-hidden="true">
                  <GraduationCap size={14} />
                </span>
                Khóa đang học
              </span>
              <div className="pa-org-level-wrap">
                {(o.coursesInUseByLevel ?? [0, 0, 0]).map((n: number, i: number) => (
                  <span
                    key={i}
                    className={`pa-org-level-pill ${
                      n > 0
                        ? i === 0
                          ? 'is-basic'
                          : i === 1
                            ? 'is-inter'
                            : 'is-adv'
                        : 'is-empty'
                    }`}
                  >
                    {translateUi(LEVEL_NAMES[i + 1])} · {n}
                  </span>
                ))}
              </div>
            </div>

            {coursesInUseList.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '16px 0', margin: 0 }}>
                Chưa nhân viên nào ghi danh khóa học.
              </p>
            ) : (
              <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Khóa học</th>
                    <th>Cấp độ</th>
                    <th className="num">Đang học</th>
                    <th className="num">Hoàn thành</th>
                  </tr>
                </thead>
                <tbody>
                  {coursesInUseList.map((c) => (
                    <tr key={c.courseCode}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{c.courseTitle}</strong>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Mã: {c.courseCode}</div>
                      </td>
                      <td>
                        <span
                          className={`pa-org-level-pill ${
                            c.level === 1 ? 'is-basic' : c.level === 2 ? 'is-inter' : 'is-adv'
                          }`}
                        >
                          {c.levelName}
                        </span>
                      </td>
                      <td className="num" style={{ fontWeight: 600 }}>{c.participants}</td>
                      <td className="num" style={{ color: c.completed > 0 ? '#15803d' : '#64748b', fontWeight: 600 }}>
                        {c.completed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ĐỘI NGŨ NHÂN SỰ */}
      {activeTab === 'people' && (
        <div className="pa-org-detail-panel">
          <div className="pa-org-detail-card">
            <div className="pa-org-detail-card-head">
              <span className="pa-org-detail-card-title">
                <span className="pa-org-detail-icon-box" aria-hidden="true">
                  <Users size={14} />
                </span>
                Nhân viên ({peopleList.length})
              </span>
            </div>

            {peopleList.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '16px 0', margin: 0 }}>
                Chưa có nhân viên nào được mời vào tổ chức này.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
                {peopleList.map((p, i) => (
                  <div
                    key={p.userId ?? `${p.fullName}-${i}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      borderRadius: 9,
                      border: '1px solid #e2e8f0',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 7,
                          background: 'var(--pa-accent-soft)',
                          border: '1px solid var(--pa-accent-border)',
                          color: 'var(--pa-accent-solid)',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 700,
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        {p.fullName ? p.fullName.slice(0, 2).toUpperCase() : 'NV'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                          {p.userId ? (
                            <Link to={`/platform/users/${p.userId}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                              {p.fullName} ↗
                            </Link>
                          ) : (
                            p.fullName
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {p.email ?? 'Chưa có email'} · {[p.departmentName, p.positionName].filter(Boolean).join(' / ') || ROLE_LABELS[p.role]}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span
                        className="pa-org-level-pill"
                        style={{
                          fontSize: 12,
                          background: p.role === 'OWNER' ? 'var(--pa-accent-soft)' : '#f1f5f9',
                          color: p.role === 'OWNER' ? 'var(--pa-accent-solid)' : '#475569',
                          border: p.role === 'OWNER' ? '1px solid var(--pa-accent-border)' : '1px solid #cbd5e1',
                        }}
                      >
                        {ROLE_LABELS[p.role] ?? p.role}
                      </span>
                      {p.status !== 'ACTIVE' && (
                        <span className="pa-tr-pill is-neutral" style={{ fontSize: 12 }}>
                          {USER_STATUS[p.status]?.label ?? p.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: KHÓA ĐÃ MUA & ĐƠN HÀNG */}
      {activeTab === 'orders' && (
        <div className="pa-org-detail-panel">
          {/* Paid courses the organization has: every employee may learn them */}
          <div className="pa-org-detail-card">
            <div className="pa-org-detail-card-head">
              <span className="pa-org-detail-card-title">
                <span className="pa-org-detail-icon-box" aria-hidden="true">
                  <Layers size={14} />
                </span>
                Khóa đã mua
              </span>
              <span style={{ fontSize: 12, color: 'var(--pa-ink-3)' }}>Mọi nhân viên đều học được</span>
            </div>

            {purchasedList.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '12px 0', margin: 0 }}>
                Tổ chức chưa mua khóa học có phí nào.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {purchasedList.map((s) => (
                  <div
                    key={s.courseCode}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{s.courseTitle}</strong>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {s.courseCode} · {s.levelName}
                      </div>
                    </div>
                    <span className="pa-org-tab-count" style={{ fontSize: 12, padding: '2px 8px', minWidth: 28, height: 22 }}>
                      Mua ngày {formatDate(s.purchasedAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders History */}
          <div className="pa-org-detail-card">
            <div className="pa-org-detail-card-head">
              <span className="pa-org-detail-card-title">
                <span className="pa-org-detail-icon-box" aria-hidden="true">
                  <CreditCard size={14} />
                </span>
                Đơn hàng ({ordersList.length})
              </span>
            </div>

            {ordersList.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '12px 0', margin: 0 }}>
                Chưa có đơn mua khóa học nào.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                {ordersList.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      padding: '10px 12px',
                      background: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{order.courseTitle}</strong>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {formatDateTime(order.createdAt)}
                        {order.reason && ` · Lý do: ${order.reason}`}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: order.amount > 0 ? '#15803d' : '#64748b' }}>
                        {order.amount > 0 ? formatMoney(order.amount) : 'Miễn phí'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{canonicalCourseCode(order.courseCode)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: THAO TÁC QUẢN TRỊ */}
      {activeTab === 'support' && canManage && (
        <div className="pa-org-detail-panel">
          <div className="pa-org-detail-action-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span
                className="pa-org-detail-icon-box"
                style={{ background: '#fef3c7', borderColor: '#fcd34d', color: '#b45309' }}
                aria-hidden="true"
              >
                <ShieldAlert size={14} />
              </span>
              <div>
                <strong style={{ fontSize: 13.5, color: '#0f172a' }}>
                  Thao tác hỗ trợ
                </strong>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                  Mọi thao tác ở đây được ghi vào Nhật ký hoạt động.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600, color: '#334155' }}>
                  Chọn thao tác
                  <select
                    value={supportKind}
                    onChange={(e) => setKind(e.target.value as SupportAction)}
                    className="pa-tr-select"
                    style={{ width: '100%' }}
                  >
                    <option value="suspend">Tạm ngưng tổ chức</option>
                    <option value="restore">Mở lại tổ chức</option>
                  </select>
                </label>
              </div>

              <div style={{ marginBottom: 12 }}>
                <ReasonField value={reason} onChange={setReason} />
              </div>

              {supportKind === 'suspend' && !suspended && (
                <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 10px', fontWeight: 500 }}>
                  Khi tạm ngưng, mọi nhân viên của tổ chức không đăng nhập được và phiên đang mở bị ngắt ngay.
                </p>
              )}

              {!actionAllowed && (
                <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 10px', fontWeight: 500 }}>
                  {suspended ? 'Tổ chức đang tạm ngưng.' : 'Tổ chức đang hoạt động, không cần mở lại.'}
                </p>
              )}

              <button
                type="submit"
                disabled={!actionAllowed || !isReasonValid(reason) || action.isPending}
                className="btn btn-primary btn-small inline-flex items-center gap-1.5"
                style={{
                  marginTop: 4,
                  background: 'var(--pa-accent-solid)',
                  borderColor: 'var(--pa-accent-solid)',
                }}
              >
                <span>{action.isPending ? 'Đang ghi nhận…' : supportKind === 'suspend' ? 'Tạm ngưng tổ chức' : 'Mở lại tổ chức'}</span>
                <ArrowRight size={13} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
