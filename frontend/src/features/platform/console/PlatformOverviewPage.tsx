import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformOverview } from '@/hooks/use-platform-admin';
import type { PlatformOverview } from '@/services/platform-admin.service';
import { Footer, LoadError, Loading, Pill } from '../components/pulse-ui';
import {
  ORG_STATUS,
  STAGE_LABELS,
  auditActionLabel,
  auditReason,
  formatDate,
  formatDateTime,
  formatMoney,
  formatNumber,
} from '../components/pulse-format';
import {
  Anchor,
  FileEdit,
  Building2,
  Users,
  CreditCard,
  ArrowRight,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Plus,
  Clock,
  Sparkles,
  Gem,
} from 'lucide-react';

/** PA-01 · Bento Executive Dashboard: the catalog anchor, draft, customers, trials, action center & quick actions. */
export function PlatformOverviewPage() {
  const { data, isLoading, error, refetch } = usePlatformOverview();

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} />
            Quản trị nền tảng / Tổng quan
          </span>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '6px 0 4px' }}>
            Toàn cảnh nền tảng hôm nay.
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Phiên bản khóa học đang dùng, khách hàng B2B, người dùng thử và các tác vụ khẩn cấp.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={() => refetch()}
            title="Làm mới dữ liệu từ máy chủ"
          >
            Làm mới
          </button>
          <Link to="/platform/organizations" className="btn btn-primary btn-small">
            <Plus size={14} style={{ marginRight: 4 }} />
            Thêm tổ chức mới
          </Link>
        </div>
      </div>

      {isLoading && <Loading />}
      {error && <LoadError error={error} />}

      {data && (
        <>
          {/* Row 1: Bento 5 KPI Bar */}
          <div className="pa-bento-kpi-grid">
            {/* Card 1: Anchor Version */}
            <div className="pa-bento-card anchor-card">
              <div>
                <div className="pa-bento-kpi-head">
                  <div className="pa-kpi-icon-wrap amber">
                    <Anchor size={17} />
                  </div>
                  <span className="pa-brand-badge" style={{ margin: 0 }}>Đang phục vụ</span>
                </div>
                <div className="pa-bento-kpi-title">Phiên bản đang dùng</div>
                <div className="pa-bento-kpi-val">{data.currentVersionNo ? `v${data.currentVersionNo}` : '—'}</div>
              </div>
              <div className="pa-bento-kpi-sub">
                {data.courseCount} khóa · Ban hành {formatDate(data.currentVersionPublishedAt)}
              </div>
            </div>

            {/* Card 2: Draft Version */}
            <div className="pa-bento-card draft-card">
              <div>
                <div className="pa-bento-kpi-head">
                  <div className="pa-kpi-icon-wrap sky">
                    <FileEdit size={17} />
                  </div>
                  {data.draftVersionNo ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 7px', borderRadius: 9999 }}>
                      Đang soạn
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Chưa tạo</span>
                  )}
                </div>
                <div className="pa-bento-kpi-title">Bản nháp đang soạn</div>
                <div className="pa-bento-kpi-val">{data.draftVersionNo ? `v${data.draftVersionNo}` : '—'}</div>
              </div>
              <div className="pa-bento-kpi-sub">
                {data.draftVersionNo
                  ? `+${data.draftNewCourseCount} khóa mới · ${data.draftEditedCourseCount} đã sửa`
                  : 'Chưa có bản nháp mới'}
              </div>
            </div>

            {/* Card 3: Organizations */}
            <div className="pa-bento-card">
              <div>
                <div className="pa-bento-kpi-head">
                  <div className="pa-kpi-icon-wrap emerald">
                    <Building2 size={17} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#15803d' }}>
                    {data.paidOrganizationCount} trả phí
                  </span>
                </div>
                <div className="pa-bento-kpi-title">Tổ chức khách hàng</div>
                <div className="pa-bento-kpi-val">{formatNumber(data.organizationCount)}</div>
              </div>
              <div className="pa-bento-kpi-sub">
                {data.trialOrganizationCount} dùng thử · {data.suspendedOrganizationCount} tạm ngưng
              </div>
            </div>

            {/* Card 4: Trial Users */}
            <div className="pa-bento-card">
              <div>
                <div className="pa-bento-kpi-head">
                  <div className="pa-kpi-icon-wrap indigo">
                    <Users size={17} />
                  </div>
                  {data.trialEndingSoonCount > 0 ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', background: '#fee2e2', padding: '2px 6px', borderRadius: 9999 }}>
                      {data.trialEndingSoonCount} sắp hết
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: '#64748b' }}>Bình thường</span>
                  )}
                </div>
                <div className="pa-bento-kpi-title">Học viên dùng thử</div>
                <div className="pa-bento-kpi-val">{formatNumber(data.trialUserCount)}</div>
              </div>
              <div className="pa-bento-kpi-sub">
                {data.trialEndingSoonCount > 0
                  ? `${data.trialEndingSoonCount} người hết hạn trong 48 giờ`
                  : 'Không có người dùng sắp hết hạn'}
              </div>
            </div>

            {/* Card 5: B2B Revenue */}
            <div className="pa-bento-card">
              <div>
                <div className="pa-bento-kpi-head">
                  <div className="pa-kpi-icon-wrap slate">
                    <CreditCard size={17} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Doanh thu</span>
                </div>
                <div className="pa-bento-kpi-title">Doanh thu suất khóa</div>
                <div className="pa-bento-kpi-val" style={{ fontSize: 20 }}>{formatMoney(data.revenue)}</div>
              </div>
              <div className="pa-bento-kpi-sub">
                {formatNumber(data.seatsPurchased)} suất bán · {formatNumber(data.seatsGranted)} suất cấp
              </div>
            </div>
          </div>

          {/* Row 2: Action Center (7) + Quick Actions & Conversion Health (5) */}
          <div className="pa-bento-row">
            {/* Action Center */}
            <div className="pa-bento-box">
              <div className="pa-box-header">
                <div className="pa-box-title-group">
                  <AlertTriangle size={17} style={{ color: '#d97706' }} />
                  <h2 className="pa-box-title">Việc cần xử lý khẩn cấp</h2>
                </div>
                <ActionCenterBadge data={data} />
              </div>
              <ActionCenterItems data={data} />
            </div>

            {/* Quick Actions Card & Conversion Health */}
            <div className="pa-bento-box">
              <div className="pa-box-header">
                <div className="pa-box-title-group">
                  <Sparkles size={17} style={{ color: '#d97706' }} />
                  <h2 className="pa-box-title">Thao tác nhanh</h2>
                </div>
                <span style={{ fontSize: 12, color: '#64748b' }}>Phím tắt vận hành</span>
              </div>

              <div className="pa-quick-action-grid">
                <Link to="/platform/organizations" className="pa-quick-action-btn">
                  <div className="pa-quick-action-top">
                    <Building2 size={16} style={{ color: '#d97706' }} />
                    <span className="pa-quick-action-title">Thêm tổ chức</span>
                  </div>
                  <span className="pa-quick-action-desc">Kích hoạt doanh nghiệp B2B mới</span>
                </Link>

                <Link to="/platform/reference-positions" className="pa-quick-action-btn">
                  <div className="pa-quick-action-top">
                    <Briefcase size={16} style={{ color: '#0284c7' }} />
                    <span className="pa-quick-action-title">Mẫu vị trí</span>
                  </div>
                  <span className="pa-quick-action-desc">Thư viện chức danh chuẩn TT02</span>
                </Link>

                <Link to="/platform/versions" className="pa-quick-action-btn">
                  <div className="pa-quick-action-top">
                    <FileEdit size={16} style={{ color: '#15803d' }} />
                    <span className="pa-quick-action-title">Soạn bản nháp</span>
                  </div>
                  <span className="pa-quick-action-desc">Cập nhật catalog chương trình</span>
                </Link>

                <Link to="/platform/commerce" className="pa-quick-action-btn">
                  <div className="pa-quick-action-top">
                    <CreditCard size={16} style={{ color: '#6366f1' }} />
                    <span className="pa-quick-action-title">Đơn giá khóa</span>
                  </div>
                  <span className="pa-quick-action-desc">Điều chỉnh giá bán B2B</span>
                </Link>
              </div>

              {/* Conversion Health Bar */}
              <div className="pa-health-widget">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Tỷ lệ chuyển đổi khách hàng</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>
                    {data.conversionRate}% trả phí
                  </span>
                </div>

                <div className="pa-progress-segmented">
                  <div
                    className="pa-progress-seg-paid"
                    style={{
                      width: `${data.organizationCount > 0 ? (data.paidOrganizationCount / data.organizationCount) * 100 : 50}%`,
                    }}
                    title={`Trả phí: ${data.paidOrganizationCount}`}
                  />
                  <div
                    className="pa-progress-seg-trial"
                    style={{
                      width: `${data.organizationCount > 0 ? (data.trialOrganizationCount / data.organizationCount) * 100 : 50}%`,
                    }}
                    title={`Dùng thử: ${data.trialOrganizationCount}`}
                  />
                  <div
                    className="pa-progress-seg-suspended"
                    style={{
                      width: `${data.organizationCount > 0 ? (data.suspendedOrganizationCount / data.organizationCount) * 100 : 0}%`,
                    }}
                    title={`Tạm ngưng: ${data.suspendedOrganizationCount}`}
                  />
                </div>

                <div className="pa-health-legend">
                  <div className="pa-legend-item">
                    <span className="pa-legend-dot" style={{ background: '#10b981' }} />
                    <span>Trả phí ({data.paidOrganizationCount})</span>
                  </div>
                  <div className="pa-legend-item">
                    <span className="pa-legend-dot" style={{ background: '#f59e0b' }} />
                    <span>Dùng thử ({data.trialOrganizationCount})</span>
                  </div>
                  <div className="pa-legend-item">
                    <span className="pa-legend-dot" style={{ background: '#f43f5e' }} />
                    <span>Tạm ngưng ({data.suspendedOrganizationCount})</span>
                  </div>
                </div>

                <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
                  Quy mô nhân sự toàn nền tảng: <strong style={{ color: '#0f172a' }}>{formatNumber(data.employeeCount)} nhân viên</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Live Audit Timeline (7) + Recent Organizations (5) */}
          <div className="pa-bento-row">
            {/* Live Audit Timeline */}
            <div className="pa-bento-box">
              <div className="pa-box-header">
                <div className="pa-box-title-group">
                  <Activity size={17} style={{ color: '#d97706' }} />
                  <h2 className="pa-box-title">Thao tác nền tảng gần đây</h2>
                </div>
                <Link to="/platform/audit-log" className="btn btn-ghost btn-small">
                  Nhật ký đầy đủ →
                </Link>
              </div>

              {data.recentActivity.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                  Chưa có thao tác nền tảng nào được ghi nhận.
                </p>
              ) : (
                <div className="pa-timeline-feed">
                  {data.recentActivity.slice(0, 5).map((a) => (
                    <div key={a.id} className="pa-timeline-entry">
                      <div className="pa-timeline-dot" />
                      <div className="pa-timeline-main">{auditActionLabel(a.action)}</div>
                      <div className="pa-timeline-meta">
                        {a.entityLabel && <span>Thực thể: <strong>{a.entityLabel}</strong></span>}
                        {auditReason(a.newValues) && <span>Lý do: <em>{auditReason(a.newValues)}</em></span>}
                        <span>· {formatDateTime(a.createdAt)}</span>
                        <span>· {a.actorEmail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Organizations */}
            <div className="pa-bento-box">
              <div className="pa-box-header">
                <div className="pa-box-title-group">
                  <Building2 size={17} style={{ color: '#d97706' }} />
                  <h2 className="pa-box-title">Doanh nghiệp mới đăng ký</h2>
                </div>
                <Link to="/platform/organizations" className="btn btn-ghost btn-small">
                  Tất cả tổ chức →
                </Link>
              </div>

              {data.recentOrganizations.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                  Chưa có doanh nghiệp nào đăng ký.
                </p>
              ) : (
                <div>
                  {data.recentOrganizations.slice(0, 5).map((o) => (
                    <div key={o.id} className="pa-recent-org-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="pa-org-avatar">
                          {o.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/platform/organizations/${o.id}`}
                            style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', textDecoration: 'none' }}
                          >
                            {o.name}
                          </Link>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {o.ownerEmail ?? 'Chưa gán chủ doanh nghiệp'} · {o.employeeCount} nhân viên · {formatDate(o.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div>
                        {o.status === 'SUSPENDED' ? (
                          <Pill tone={ORG_STATUS.SUSPENDED.tone}>{ORG_STATUS.SUSPENDED.label}</Pill>
                        ) : (
                          <Pill tone={STAGE_LABELS[o.stage]?.tone}>{STAGE_LABELS[o.stage]?.label ?? 'Đang hoạt động'}</Pill>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ecosystem Standard Content Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            <Link
              to="/platform/frameworks"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                textDecoration: 'none',
                color: '#0f172a',
                boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Gem size={18} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Khung chuẩn TT 02/2025</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {data.frameworkCount} khung · {data.domainCount} lĩnh vực
                  {data.draftFrameworkCount ? ` · ${data.draftFrameworkCount} bản nháp` : ''}
                </div>
              </div>
            </Link>

            <Link
              to="/platform/versions"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                textDecoration: 'none',
                color: '#0f172a',
                boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Anchor size={18} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Catalog khóa học chuẩn</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {data.courseCount} khóa · {formatNumber(data.questionCount)} câu hỏi ôn tập
                </div>
              </div>
            </Link>

            <Link
              to="/platform/users"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                textDecoration: 'none',
                color: '#0f172a',
                boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={18} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Tài khoản toàn hệ thống</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {formatNumber(data.userCount)} tài khoản · {formatNumber(data.employeeCount)} nhân sự
                </div>
              </div>
            </Link>
          </div>
        </>
      )}


      <Footer />
    </>
  );
}

function ActionCenterBadge({ data }: { data: PlatformOverview }) {
  let count = 0;
  if (data.draftVersionNo && (data.draftNewCourseCount + data.draftEditedCourseCount > 0)) count++;
  if (data.trialEndingSoonCount > 0) count++;
  if (data.suspendedOrganizationCount > 0) count++;
  if (data.lockedUserCount > 0) count++;
  if (data.draftFrameworkCount > 0) count++;
  if (data.pausedCourseCount > 0) count++;

  if (count === 0) {
    return <span className="pa-count-badge neutral">0 việc</span>;
  }
  return <span className="pa-count-badge">{count} việc cần xử lý</span>;
}

function ActionCenterItems({ data }: { data: PlatformOverview }) {
  const items: { key: string; tone: string; text: string; to: string; action: string; icon: ReactNode }[] = [];

  if (data.draftVersionNo) {
    const changed = data.draftNewCourseCount + data.draftEditedCourseCount;
    if (changed > 0) {
      items.push({
        key: 'draft',
        tone: 'amber',
        text: `Bản nháp v${data.draftVersionNo} có ${changed} khóa học thay đổi chưa công bố ra thị trường.`,
        to: `/platform/versions/${data.draftVersionNo}`,
        action: 'Mở bản nháp',
        icon: <FileEdit size={16} style={{ color: '#d97706' }} />,
      });
    }
  }

  if (data.trialEndingSoonCount > 0) {
    items.push({
      key: 'trial',
      tone: 'coral',
      text: `${data.trialEndingSoonCount} người dùng thử nghiệm sẽ hết hạn trong vòng 48 giờ tới.`,
      to: '/platform/users?trial=ENDING_SOON',
      action: 'Xem danh sách',
      icon: <Clock size={16} style={{ color: '#b91c1c' }} />,
    });
  }

  if (data.suspendedOrganizationCount > 0) {
    items.push({
      key: 'suspended',
      tone: 'coral',
      text: `${data.suspendedOrganizationCount} tổ chức khách hàng đang trong trạng thái tạm ngưng.`,
      to: '/platform/organizations?status=SUSPENDED',
      action: 'Xem tổ chức',
      icon: <AlertTriangle size={16} style={{ color: '#b91c1c' }} />,
    });
  }

  if (data.lockedUserCount > 0) {
    items.push({
      key: 'locked',
      tone: 'coral',
      text: `${data.lockedUserCount} tài khoản cá nhân đang bị khóa bởi quản trị viên.`,
      to: '/platform/users?status=LOCKED',
      action: 'Xem tài khoản',
      icon: <AlertTriangle size={16} style={{ color: '#b91c1c' }} />,
    });
  }

  if (data.draftFrameworkCount > 0) {
    items.push({
      key: 'framework',
      tone: 'amber',
      text: `${data.draftFrameworkCount} khung năng lực số còn thay đổi ở trạng thái bản nháp.`,
      to: '/platform/frameworks',
      action: 'Xem khung chuẩn',
      icon: <Briefcase size={16} style={{ color: '#d97706' }} />,
    });
  }

  if (data.pausedCourseCount > 0) {
    items.push({
      key: 'paused',
      tone: 'gray',
      text: `${data.pausedCourseCount} khóa học nâng cao đang tạm ngưng mở bán.`,
      to: '/platform/commerce',
      action: 'Xem đơn giá',
      icon: <CreditCard size={16} style={{ color: '#64748b' }} />,
    });
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', background: '#f8fafc', borderRadius: 10, border: '1px dashed #e2e8f0' }}>
        <CheckCircle2 size={32} style={{ color: '#10b981', margin: '0 auto 8px' }} />
        <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>Hệ sinh thái đang vận hành ổn định</div>
        <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
          Không có cảnh báo khẩn cấp hoặc việc tồn đọng cần xử lý.
        </p>
      </div>
    );
  }

  return (
    <div>
      {items.map((item) => (
        <div key={item.key} className="pa-action-item">
          <div className="pa-action-left">
            {item.icon}
            <span className="pa-action-text">{item.text}</span>
          </div>
          <Link to={item.to} className="btn btn-outline btn-small" style={{ whiteSpace: 'nowrap', marginLeft: 12 }}>
            {item.action}
            <ArrowRight size={13} style={{ marginLeft: 4 }} />
          </Link>
        </div>
      ))}
    </div>
  );
}

