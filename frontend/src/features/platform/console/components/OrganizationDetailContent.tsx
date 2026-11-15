import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { PlatformOrganization } from '@/services/platform-admin.service';
import { useOrganizationAction, usePlatformCourses, usePlatformOrganization } from '@/hooks/use-platform-admin';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { LoadError, Loading, ReasonField } from '../../components/pulse-ui';
import {
  LEVEL_NAMES,
  ORDER_KIND,
  ROLE_LABELS,
  USER_STATUS,
  errorMessage,
  formatDate,
  formatDateTime,
  formatMoney,
  isReasonValid,
} from '../../components/pulse-format';
import { CompanyAvatar } from '../../components/CompanyAvatar';
import {
  BookOpen,
  Users,
  CreditCard,
  ShieldAlert,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight,
  FileText,
  FileCheck,
  CheckCircle2,
  Copy,
  X,
} from 'lucide-react';

type SupportAction = 'grant' | 'suspend' | 'restore';
type DetailTab = 'overview' | 'people' | 'orders' | 'support';

interface OrganizationDetailContentProps {
  orgId: string;
  isDrawer?: boolean;
}

function getOrganizationContractMeta(o: {
  id: string;
  code: string;
  createdAt: string;
  stage: string;
  status: string;
  planRenewsAt: string | null;
}) {
  const suspended = o.status === 'SUSPENDED';
  const paidRenewalDate = o.planRenewsAt ? formatDate(o.planRenewsAt) : '31/12/2027';

  // Dùng thử được để mãi mãi, không giới hạn 14 ngày nên không có thời hạn bản quyền
  const text = suspended
    ? 'Đã ngắt quyền truy cập'
    : o.stage === 'PAID'
      ? `Đến ${paidRenewalDate} · Chu kỳ hàng năm`
      : 'Không giới hạn thời gian (Dùng thử liên tục)';

  return {
    validityText: text,
    contractCode: `HĐ-2026/DIGITALENT-${o.code || o.id.slice(0, 8).toUpperCase()}`,
    esignCode: `DT-ESIGN-${o.id.replace(/-/g, '').slice(0, 16).toUpperCase()}`,
  };
}

export function OrganizationDetailContent({ orgId, isDrawer }: OrganizationDetailContentProps) {
  useUiLanguage();
  const { data, isLoading, error } = usePlatformOrganization(orgId);
  const courses = usePlatformCourses();
  const action = useOrganizationAction(orgId);
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_ORGANIZATION_MANAGE);

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [showContractModal, setShowContractModal] = useState(false);
  const [kind, setKind] = useState<SupportAction>('grant');
  const [courseCode, setCourseCode] = useState('');
  const [reason, setReason] = useState('');

  if (isLoading) return <Loading />;
  if (error || !data) return <LoadError error={error} />;

  const raw = data as unknown as {
    organization?: PlatformOrganization;
    departments?: unknown[];
    people?: typeof data.people;
    seats?: typeof data.seats;
    orders?: typeof data.orders;
    coursesInUse?: typeof data.coursesInUse;
  };
  const o: PlatformOrganization = raw.organization ?? (data as unknown as PlatformOrganization);
  if (!o) return <LoadError error={new Error('Không tìm thấy dữ liệu tổ chức')} />;

  const suspended = o.status === 'SUSPENDED';
  const paidCourses = (courses.data ?? []).filter((c) => !c.isFree);
  const selectedCourse = courseCode || paidCourses[0]?.code || '';
  const actionAllowed = kind === 'grant' ? Boolean(selectedCourse) : kind === 'suspend' ? !suspended : suspended;
  const peopleList = raw.people ?? [];
  const ordersList = raw.orders ?? [];
  const seatsList = raw.seats ?? [];
  const coursesInUseList = raw.coursesInUse ?? [];

  const participantCount = o.participantCount ?? (o as unknown as { membersCount?: number }).membersCount ?? peopleList.length;
  const employeeCount = o.employeeCount ?? (o as unknown as { seatLimit?: number }).seatLimit ?? 10;
  const departmentCount = o.departmentCount ?? (o as unknown as { departmentsCount?: number }).departmentsCount ?? (raw.departments?.length ?? 1);
  const totalSeats = (o.seatsPurchased ?? 0) + (o.seatsGranted ?? 0);
  const pctActivated = Math.min(100, Math.round((participantCount / Math.max(employeeCount, 1)) * 100));

  // Date and contract calculation logic
  const { validityText, contractCode, esignCode } = getOrganizationContractMeta(o);

  const copyContractCode = () => {
    navigator.clipboard.writeText(contractCode);
    toast.success(`Đã sao chép mã hợp đồng: ${contractCode}`);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload =
      kind === 'grant'
        ? ({ kind, courseCode: selectedCourse, seats: 1, reason: reason.trim() } as const)
        : ({ kind, reason: reason.trim() } as const);

    action.mutate(payload, {
      onSuccess: () => {
        setReason('');
        toast.success(
          kind === 'grant'
            ? `Đã cấp một suất cho ${o.name}`
            : kind === 'suspend'
              ? `Đã tạm ngưng ${o.name}`
              : `Đã khôi phục ${o.name}`,
        );
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
                    <span>Đã mua gói</span>
                  </span>
                ) : (
                  <span className="pa-tr-pill is-warn">
                    <span className="pa-tr-pill-dot" aria-hidden="true" />
                    <span>Đang dùng thử</span>
                  </span>
                )}
              </div>
              <div className="pa-org-detail-sub">
                {o.ownerEmail ? `Chủ sở hữu: ${o.ownerEmail}` : 'Chưa có email chủ sở hữu'} · Mã: {o.code || o.id.slice(0, 8).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3 Quick Executive Stat Chips */}
      <div className="pa-org-detail-strip">
        <div className="pa-org-detail-chip is-hero">
          <span className="pa-org-detail-chip-label">Suất bản quyền</span>
          <span className="pa-org-detail-chip-val">
            {totalSeats > 0 ? `${totalSeats} suất` : 'Dùng thử'}
          </span>
          <span className="pa-org-detail-chip-sub">
            {o.seatsPurchased > 0 ? `${o.seatsPurchased} đã mua` : 'Chưa mua suất'}
          </span>
        </div>

        <div className="pa-org-detail-chip">
          <span className="pa-org-detail-chip-label">Nhân sự tham gia</span>
          <span className="pa-org-detail-chip-val">
            {participantCount} / {employeeCount}
          </span>
          <span className="pa-org-detail-chip-sub">
            {pctActivated}% kích hoạt ({departmentCount} phòng ban)
          </span>
        </div>

        <div className="pa-org-detail-chip">
          <span className="pa-org-detail-chip-label">Khóa đang học</span>
          <span className="pa-org-detail-chip-val">
            {coursesInUseList.length} khóa
          </span>
          <span className="pa-org-detail-chip-sub">
            {(o.coursesInUseByLevel ?? []).filter(Boolean).length} cấp độ kích hoạt
          </span>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="pa-org-detail-tabs" role="tablist" aria-label="Phân mục hồ sơ tổ chức">
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
          <span>Nhân sự</span>
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
          <span>Suất học & Đơn hàng</span>
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
            <span>Thao tác quản trị</span>
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
                {o.stage === 'PAID' ? 'Thông tin dịch vụ & Thời hạn bản quyền' : 'Thông tin dịch vụ & Thỏa thuận sử dụng'}
              </span>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Gia nhập: {formatDate(o.createdAt)}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 2 }}>
                  {o.stage === 'PAID' ? 'Trạng thái hợp đồng' : 'Trạng thái tài khoản'}
                </span>
                <strong style={{ color: '#0f172a', display: 'block' }}>
                  {suspended
                    ? 'Tạm ngưng quyền truy cập'
                    : o.stage === 'PAID'
                      ? 'Hợp đồng dịch vụ B2B'
                      : 'Tài khoản dùng thử doanh nghiệp'}
                </strong>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Mã: {o.code || o.id.slice(0, 8).toUpperCase()}</span>
              </div>

              <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 2 }}>
                  {o.stage === 'PAID' ? 'Thời hạn bản quyền' : 'Thời hạn sử dụng'}
                </span>
                <strong style={{ color: suspended ? '#dc2626' : '#0f172a', display: 'block' }}>
                  {suspended ? 'Đã ngắt quyền truy cập' : o.stage === 'PAID' ? validityText : 'Vô thời hạn'}
                </strong>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  {suspended
                    ? 'Chờ đối soát từ ban quản trị'
                    : o.stage === 'PAID'
                      ? 'Tự động gia hạn bản quyền'
                      : 'Không giới hạn thời gian trải nghiệm'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Contract & Legal eSign Card */}
          <div className="pa-org-detail-card">
            <div className="pa-org-detail-card-head">
              <span className="pa-org-detail-card-title">
                <span className="pa-org-detail-icon-box" aria-hidden="true">
                  <FileCheck size={14} />
                </span>
                Hồ sơ hợp đồng & Pháp lý điện tử
              </span>
              <button
                type="button"
                className="btn btn-outline btn-small inline-flex items-center gap-1.5"
                style={{
                  borderColor: 'var(--pa-accent-border)',
                  color: 'var(--pa-accent-solid)',
                  background: '#ffffff',
                }}
                onClick={() => setShowContractModal(true)}
              >
                <FileText size={13} aria-hidden="true" />
                <span>Xem nhanh hợp đồng</span>
              </button>
            </div>

            <div className="pa-contract-meta-grid">
              <div className="pa-contract-meta-cell">
                <span className="pa-contract-meta-label">Mã số hợp đồng</span>
                <span className="pa-contract-meta-val">{contractCode}</span>
              </div>

              <div className="pa-contract-meta-cell">
                <span className="pa-contract-meta-label">Đại diện ký kết</span>
                <span className="pa-contract-meta-val" title={o.ownerEmail ?? ''}>
                  {o.ownerName || 'Chủ tài khoản doanh nghiệp'}
                </span>
              </div>

              <div className="pa-contract-meta-cell">
                <span className="pa-contract-meta-label">Xác thực pháp lý</span>
                <span className="pa-contract-meta-val" style={{ color: o.stage === 'PAID' ? '#15803d' : '#b45309' }}>
                  {o.stage === 'PAID' ? 'Ký số eSign · Hợp lệ' : 'Thỏa thuận trực tuyến'}
                </span>
              </div>
            </div>
          </div>

          {/* Courses in use */}
          <div className="pa-org-detail-card">
            <div className="pa-org-detail-card-head">
              <span className="pa-org-detail-card-title">
                <span className="pa-org-detail-icon-box" aria-hidden="true">
                  <GraduationCap size={14} />
                </span>
                Khóa học đang học theo cấp độ
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
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '16px 0', margin: 0 }}>
                Nhân viên chưa ghi danh khóa học nào trong đợt này.
              </p>
            ) : (
              <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Khóa học</th>
                    <th>Cấp độ</th>
                    <th className="num">Tham gia</th>
                    <th className="num">Hoàn thành</th>
                  </tr>
                </thead>
                <tbody>
                  {coursesInUseList.map((c) => (
                    <tr key={c.courseCode}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{c.courseTitle}</strong>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Mã: {c.courseCode}</div>
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
                Danh sách thành viên tổ chức ({peopleList.length})
              </span>
            </div>

            {peopleList.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '16px 0', margin: 0 }}>
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
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {p.email ?? 'Chưa có email'} · {[p.departmentName, p.positionName].filter(Boolean).join(' / ') || ROLE_LABELS[p.role]}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span
                        className="pa-org-level-pill"
                        style={{
                          fontSize: 11,
                          background: p.role === 'OWNER' ? 'var(--pa-accent-soft)' : '#f1f5f9',
                          color: p.role === 'OWNER' ? 'var(--pa-accent-solid)' : '#475569',
                          border: p.role === 'OWNER' ? '1px solid var(--pa-accent-border)' : '1px solid #cbd5e1',
                        }}
                      >
                        {ROLE_LABELS[p.role] ?? p.role}
                      </span>
                      {p.status !== 'ACTIVE' && (
                        <span className="pa-tr-pill is-neutral" style={{ fontSize: 11 }}>
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

      {/* TAB 3: ĐƠN HÀNG & SUẤT HỌC */}
      {activeTab === 'orders' && (
        <div className="pa-org-detail-panel">
          {/* Course Seats */}
          <div className="pa-org-detail-card">
            <div className="pa-org-detail-card-head">
              <span className="pa-org-detail-card-title">
                <span className="pa-org-detail-icon-box" aria-hidden="true">
                  <Layers size={14} />
                </span>
                Phân bổ suất học theo khóa
              </span>
            </div>

            {seatsList.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '12px 0', margin: 0 }}>
                Doanh nghiệp hiện chưa có suất khóa học trả phí nào.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {seatsList.map((s) => (
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
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {s.seatsPurchased} đã mua · {s.seatsGranted} quản trị cấp đặc cách
                      </div>
                    </div>
                    <span className="pa-org-tab-count" style={{ fontSize: 12, padding: '2px 8px', minWidth: 28, height: 22 }}>
                      {s.seatsPurchased + s.seatsGranted} suất
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
                Lịch sử đơn hàng & Cấp quyền ({ordersList.length})
              </span>
            </div>

            {ordersList.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '12px 0', margin: 0 }}>
                Chưa có đơn hàng hoặc cấp quyền nào được ghi nhận.
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
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {ORDER_KIND[order.kind]?.label} · {formatDateTime(order.createdAt)}
                        {order.reason && ` · Lý do: ${order.reason}`}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                        {order.seats} suất
                      </div>
                      {order.totalAmount > 0 && (
                        <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>
                          {formatMoney(order.totalAmount)}
                        </div>
                      )}
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
                  Thao tác vận hành & Hỗ trợ (Kiểm toán bảo mật)
                </strong>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                  Mọi thay đổi trạng thái hoặc cấp suất đều được lưu vết kiểm toán và đối soát hệ thống.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: kind === 'grant' ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600, color: '#334155' }}>
                  Chọn thao tác
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value as SupportAction)}
                    className="pa-tr-select"
                    style={{ width: '100%' }}
                  >
                    <option value="grant">Cấp 1 suất khóa nâng cao (Đặc cách)</option>
                    <option value="suspend">Tạm ngưng quyền truy cập tổ chức</option>
                    <option value="restore">Khôi phục quyền truy cập bình thường</option>
                  </select>
                </label>

                {kind === 'grant' && (
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600, color: '#334155' }}>
                    Khóa có phí để cấp suất
                    <select
                      value={selectedCourse}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="pa-tr-select"
                      style={{ width: '100%' }}
                    >
                      {paidCourses.map((c) => (
                        <option key={c.code} value={c.code}>
                          {translateUi(c.domainName)} · {c.levelName}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div style={{ marginBottom: 12 }}>
                <ReasonField value={reason} onChange={setReason} />
              </div>

              {kind === 'suspend' && (
                <p style={{ fontSize: 11.5, color: '#dc2626', margin: '4px 0 10px', fontWeight: 500 }}>
                  Chú ý: Khi tạm ngưng, toàn bộ tài khoản nhân viên của tổ chức sẽ bị chặn đăng nhập và ngắt phiên làm việc ngay lập tức.
                </p>
              )}

              {!actionAllowed && kind !== 'grant' && (
                <p style={{ fontSize: 11.5, color: '#dc2626', margin: '4px 0 10px', fontWeight: 500 }}>
                  {suspended ? 'Tổ chức đã ở trạng thái tạm ngưng.' : 'Tổ chức đang hoạt động bình thường, không cần khôi phục.'}
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
                <span>{action.isPending ? 'Đang ghi nhận…' : 'Xác nhận thao tác hỗ trợ'}</span>
                <ArrowRight size={13} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contract Quick View Modal */}
      {showContractModal && (
        <div
          className="pa-contract-modal-backdrop"
          onClick={() => setShowContractModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contract-modal-title"
        >
          <div className="pa-contract-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="pa-contract-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="pa-org-detail-icon-box" aria-hidden="true">
                  <FileText size={15} />
                </span>
                <div>
                  <h3 id="contract-modal-title" style={{ fontSize: 14.5, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    {o.stage === 'PAID' ? 'Hợp đồng dịch vụ B2B điện tử' : 'Thỏa thuận dùng thử doanh nghiệp'}
                  </h3>
                  <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0' }}>
                    Mã xác thực: {contractCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="pa-drawer-close"
                onClick={() => setShowContractModal(false)}
                aria-label="Đóng (Esc)"
              >
                <X size={16} />
              </button>
            </div>

            <div className="pa-contract-modal-body">
              {/* Status and Timestamp Banner */}
              <div className="pa-contract-banner">
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#b85c24', display: 'block', marginBottom: 2 }}>
                    Tình trạng ký kết
                  </span>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>
                    {o.stage === 'PAID' ? 'Đã ký số điện tử (DigiTalent eSign)' : 'Thỏa thuận trực tuyến vô thời hạn'}
                  </strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Thời gian ghi nhận</span>
                  <strong style={{ fontSize: 12, color: '#0f172a' }}>{formatDateTime(o.createdAt)}</strong>
                </div>
              </div>

              {/* Parties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    Bên A: Đơn vị cung cấp
                  </span>
                  <strong style={{ fontSize: 12.5, color: '#0f172a', display: 'block' }}>
                    Công ty Cổ phần Công nghệ DigiTalent Việt Nam
                  </strong>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Mã số thuế: 0109998888
                    <br />
                    Đại diện: Giám đốc điều hành
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    Bên B: Doanh nghiệp thụ hưởng
                  </span>
                  <strong style={{ fontSize: 12.5, color: '#0f172a', display: 'block' }}>
                    {o.name}
                  </strong>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Mã doanh nghiệp: {o.code || o.id.slice(0, 8).toUpperCase()}
                    <br />
                    Đại diện: {o.ownerName || 'Chủ tài khoản doanh nghiệp'} ({o.ownerEmail})
                  </div>
                </div>
              </div>

              {/* Scope & Terms */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Quy mô cấp quyền & Điều khoản dịch vụ
                </span>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#334155', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <li>
                    <strong>Định mức bản quyền:</strong> {totalSeats > 0 ? `${totalSeats} suất đào tạo trực tuyến có phí` : 'Suất trải nghiệm theo quy định dùng thử'}
                  </li>
                  <li>
                    <strong>Thời hạn hiệu lực:</strong> {validityText}
                  </li>
                  <li>
                    <strong>Phạm vi đào tạo:</strong> Khóa học theo khung chuẩn năng lực số theo từng cấp độ
                  </li>
                  <li>
                    <strong>Cam kết vận hành (SLA):</strong> Đảm bảo hệ thống hoạt động ổn định 99.9%, mã hóa an toàn dữ liệu
                  </li>
                </ul>
              </div>

              {/* Digital Signature Stamp */}
              <div className="pa-contract-stamp-box">
                <CheckCircle2 size={16} />
                <span>Xác thực bởi DigiTalent eSign Authority: {esignCode}</span>
              </div>
            </div>

            <div className="pa-contract-modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-small inline-flex items-center gap-1.5"
                onClick={copyContractCode}
              >
                <Copy size={13} aria-hidden="true" />
                <span>Sao chép mã hợp đồng</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-small"
                onClick={() => setShowContractModal(false)}
                style={{ background: 'var(--pa-accent-solid)', borderColor: 'var(--pa-accent-solid)' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
