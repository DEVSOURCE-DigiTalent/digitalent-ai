import { useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  CreditCard,
  FileEdit,
  Plus,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import {
  usePlatformCommerce,
  usePlatformCourses,
  usePlatformOverview,
} from '@/hooks/use-platform-admin';
import { usePlatformTrials } from '@/hooks/use-trial-program';
import type { PlatformOverview } from '@/services/platform-admin.service';
import { Footer, LoadError, Pill } from '../components/pulse-ui';
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
import { PlatformOverviewSkeleton } from './components/OverviewSkeleton';
import { OrganizationDonutCard, RevenueColumnCard } from './components/OverviewCharts';

type FeedTab = 'orgs' | 'audit';

interface ActionRow {
  key: string;
  severity: 'danger' | 'warn' | 'info';
  text: string;
  to: string;
  action: string;
}

function formatGrowthPct(added: number, total: number): number {
  if (added <= 0) return 0;
  const previous = total - added;
  if (previous <= 0) return 100;
  return Math.round((added / previous) * 100);
}

/** PA-01: Platform Executive Overview with 4-tier hierarchy, Recharts analytics and matched Skeleton loading. */
export function PlatformOverviewPage() {
  useUiLanguage();
  const overview = usePlatformOverview();
  const commerce = usePlatformCommerce({ pageIndex: 1, pageSize: 100 });
  const coursesQuery = usePlatformCourses();
  const trialsQuery = usePlatformTrials();

  const [feedTab, setFeedTab] = useState<FeedTab>('orgs');

  const data = overview.data;
  const trialItems = trialsQuery.data ?? [];
  const pendingTrialsCount = trialItems.filter((item) => item.stage === 'REQUESTED').length;
  const orders = commerce.data?.orders?.items ?? [];
  const courseList = coursesQuery.data ?? commerce.data?.courses ?? [];

  const isRefreshing =
    !overview.isLoading &&
    (overview.isFetching || commerce.isFetching || trialsQuery.isFetching);

  const handleRefresh = () => {
    void overview.refetch();
    void commerce.refetch();
    void coursesQuery.refetch();
    void trialsQuery.refetch();
  };

  const handleFeedKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    event.preventDefault();
    setFeedTab((prev) => (prev === 'orgs' ? 'audit' : 'orgs'));
  };

  return (
    <>
      <header className="pa-ov-header">
        <div>
          <h1 aria-label={translateUi('Toàn cảnh nền tảng hôm nay.')}>Tổng quan hệ thống</h1>
          <p className="pa-ov-subtitle">
            Tổng hợp doanh thu, tổ chức, nhân sự và nội dung đào tạo.
          </p>
        </div>

        <div className="pa-ov-actions">
          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={handleRefresh}
            disabled={overview.isLoading || isRefreshing}
            title="Làm mới dữ liệu từ máy chủ"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} aria-hidden="true" />
            <span>{translateUi('Làm mới')}</span>
          </button>
          <Link to="/platform/organizations" className="btn btn-primary btn-small inline-flex items-center gap-1.5">
            <Plus size={14} aria-hidden="true" />
            <span>{translateUi('Thêm tổ chức mới')}</span>
          </Link>
        </div>
      </header>

      {overview.isLoading && <PlatformOverviewSkeleton />}
      {overview.error && <LoadError error={overview.error} />}

      {data && (
        <div className={`pa-ov-stage${isRefreshing ? ' is-refreshing' : ''}`}>
          {/* Tier 1: Catalog Version Status Strip */}
          <div className="pa-ov-version-bar" role="region" aria-label="Trạng thái phiên bản khóa học">
            <div className="pa-ov-version-item">
              <span className="pa-status-dot is-live" aria-hidden="true" />
              <span className="pa-ov-version-label">Phiên bản đang dùng</span>
              <strong className="pa-ov-version-val">
                {data.currentVersionNo ? `v${data.currentVersionNo}` : 'Chưa có'}
              </strong>
              <span className="pa-ov-version-meta">
                {data.courseCount} khóa học · Công bố {formatDate(data.currentVersionPublishedAt)}
              </span>
            </div>

            <div className="pa-ov-version-divider" aria-hidden="true" />

            <div className="pa-ov-version-item">
              {data.draftVersionNo ? (
                <>
                  <span className="pa-status-dot is-info" aria-hidden="true" />
                  <span className="pa-ov-version-label">Bản nháp đang soạn</span>
                  <strong className="pa-ov-version-val">v{data.draftVersionNo}</strong>
                  <span className="pa-ov-version-meta">
                    {translateUi(`+${data.draftNewCourseCount} khóa mới · ${data.draftEditedCourseCount} đã sửa`)}
                  </span>
                  <Link to={`/platform/versions/${data.draftVersionNo}`} className="pa-ov-version-link">
                    <FileEdit size={13} aria-hidden="true" />
                    <span>Chi tiết nháp</span>
                  </Link>
                </>
              ) : (
                <span className="pa-ov-version-meta">Không có bản nháp khóa học đang mở.</span>
              )}
            </div>
          </div>

          {/* Tier 2: 4 Core Executive KPI Cards */}
          <div className="pa-ov-kpi-grid">
            <Link to="/platform/commerce" className="pa-ov-kpi-card is-tone-orange">
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Doanh thu suất khóa</span>
                <span className="pa-kpi-icon is-orange" aria-hidden="true">
                  <CreditCard size={16} />
                </span>
              </div>
              <div className="pa-ov-kpi-val is-money">{formatMoney(data.revenue)}</div>
              <div className="pa-ov-kpi-sub">
                <strong>{formatNumber(data.seatsPurchased)}</strong> bán ·{' '}
                <strong>{formatNumber(data.seatsGranted)}</strong> cấp
              </div>
            </Link>

            <Link to="/platform/organizations" className="pa-ov-kpi-card is-tone-sky">
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Tổ chức khách hàng</span>
                <span className="pa-kpi-icon is-sky" aria-hidden="true">
                  <Building2 size={16} />
                </span>
              </div>
              <div className="pa-ov-kpi-val-row">
                <span className="pa-ov-kpi-val">{formatNumber(data.organizationCount)}</span>
                {data.conversionRate > 0 && (
                  <span className="pa-ov-delta-pill">
                    <TrendingUp size={12} aria-hidden="true" />
                    <span>{data.conversionRate}% trả phí</span>
                  </span>
                )}
              </div>
              <div className="pa-ov-kpi-sub">
                <span className="pa-inline-status is-live">{data.paidOrganizationCount} trả phí</span>
                <span>· {data.trialOrganizationCount} dùng thử</span>
                {data.suspendedOrganizationCount > 0 && (
                  <span>· {data.suspendedOrganizationCount} tạm ngưng</span>
                )}
              </div>
            </Link>

            <Link to="/platform/users" className="pa-ov-kpi-card is-tone-green">
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Tài khoản &amp; Nhân sự</span>
                <span className="pa-kpi-icon is-amber" aria-hidden="true">
                  <Users size={16} />
                </span>
              </div>
              <div className="pa-ov-kpi-val-row">
                <span className="pa-ov-kpi-val">{formatNumber(data.userCount)}</span>
                {(() => {
                  const userGrowthPct = formatGrowthPct(data.recentUsers7d ?? 0, data.userCount);
                  return userGrowthPct > 0 ? (
                    <span className="pa-ov-delta-pill">
                      <TrendingUp size={12} aria-hidden="true" />
                      <span>+{userGrowthPct}%</span>
                    </span>
                  ) : null;
                })()}
              </div>
              <div className="pa-ov-kpi-sub">
                <span>
                  <strong>{formatNumber(data.employeeCount)}</strong> nhân sự DN
                </span>
                <span>·</span>
                {(() => {
                  const empGrowthPct = formatGrowthPct(data.recentEmployees7d ?? 0, data.employeeCount);
                  return (
                    <span className={`pa-ov-delta-inline ${empGrowthPct > 0 ? 'is-live' : ''}`}>
                      <TrendingUp size={12} aria-hidden="true" />
                      <span>+{empGrowthPct}%</span>
                    </span>
                  );
                })()}
              </div>
            </Link>

            <Link to="/platform/versions" className="pa-ov-kpi-card is-tone-amber">
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Khung chuẩn &amp; Nội dung</span>
                <span className="pa-kpi-icon is-amber" aria-hidden="true">
                  <BookOpen size={16} />
                </span>
              </div>
              <div className="pa-ov-kpi-val">{formatNumber(data.courseCount)} khóa</div>
              <div className="pa-ov-kpi-sub">
                {data.domainCount} lĩnh vực · {formatNumber(data.questionCount)} câu hỏi
              </div>
            </Link>
          </div>

          {/* Tier 3: Recharts Column Chart (7fr) + Organization & Trial Donut (5fr) */}
          <div className="pa-ov-charts-grid">
            <RevenueColumnCard
              orders={orders}
              courses={courseList}
              totalRevenue={data.revenue}
              seatsPurchased={data.seatsPurchased}
              isSubLoading={commerce.isLoading && coursesQuery.isLoading}
            />

            <OrganizationDonutCard data={data} trials={trialItems} />
          </div>

          {/* Tier 4: Priority Action Queue (6fr) + Tabbed Recent Activity Monitor (6fr) */}
          <div className="pa-ov-ops-grid">
            <section className="pa-ov-panel" aria-label="Việc cần xử lý">
              <div className="pa-ov-panel-head">
                <div>
                  <h2 className="pa-ov-panel-title">Việc cần xử lý</h2>
                  <p className="pa-ov-panel-sub">Ưu tiên xử lý ngay</p>
                </div>
                <ActionCountBadge data={data} pendingTrialsCount={pendingTrialsCount} />
              </div>

              <PriorityActionList data={data} pendingTrialsCount={pendingTrialsCount} />
            </section>

            <section className="pa-ov-panel" aria-label="Theo dõi gần đây">
              <div className="pa-ov-panel-head">
                <div>
                  <h2 className="pa-ov-panel-title">Theo dõi gần đây</h2>
                  <p className="pa-ov-panel-sub">
                    {feedTab === 'orgs'
                      ? 'Đăng ký mới gần đây'
                      : 'Thao tác gần đây'}
                  </p>
                </div>

                <div
                  className="pa-ov-tablist"
                  role="tablist"
                  aria-label="Loại hoạt động gần đây"
                  onKeyDown={handleFeedKeyDown}
                >
                  <button
                    type="button"
                    role="tab"
                    id="pa-feed-tab-orgs"
                    aria-selected={feedTab === 'orgs'}
                    tabIndex={feedTab === 'orgs' ? 0 : -1}
                    className="pa-ov-tab"
                    onClick={() => setFeedTab('orgs')}
                  >
                    {translateUi('Doanh nghiệp mới')}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="pa-feed-tab-audit"
                    aria-selected={feedTab === 'audit'}
                    tabIndex={feedTab === 'audit' ? 0 : -1}
                    className="pa-ov-tab"
                    onClick={() => setFeedTab('audit')}
                  >
                    {translateUi('Nhật ký')}
                  </button>
                </div>
              </div>

              {feedTab === 'orgs' ? (
                <div role="tabpanel" aria-labelledby="pa-feed-tab-orgs">
                  {data.recentOrganizations.length === 0 ? (
                    <div className="pa-ov-empty-inline">
                      <p>Chưa có doanh nghiệp nào đăng ký. Bấm &ldquo;Thêm tổ chức mới&rdquo; phía trên để tạo hồ sơ đầu tiên.</p>
                    </div>
                  ) : (
                    <div className="pa-ov-feed-list">
                      {data.recentOrganizations.slice(0, 5).map((org) => (
                        <div key={org.id} className="pa-recent-org-item">
                          <div className="pa-recent-org-left">
                            <div className="pa-org-avatar" aria-hidden="true">
                              {org.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <Link to={`/platform/organizations/${org.id}`} className="pa-recent-org-link">
                                {org.name}
                              </Link>
                              <div className="pa-recent-org-meta">
                                {org.ownerEmail ?? 'Chưa gán chủ doanh nghiệp'} · {formatNumber(org.employeeCount ?? 0)} nhân viên ·{' '}
                                {formatDate(org.createdAt)}
                              </div>
                            </div>
                          </div>

                          <div>
                            {org.status === 'SUSPENDED' ? (
                              <Pill tone={ORG_STATUS.SUSPENDED.tone}>{translateUi(ORG_STATUS.SUSPENDED.label)}</Pill>
                            ) : (
                              <Pill tone={STAGE_LABELS[org.stage]?.tone}>
                                {translateUi(STAGE_LABELS[org.stage]?.label) ?? translateUi('Đang hoạt động')}
                              </Pill>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pa-ov-panel-foot">
                    <Link to="/platform/organizations" className="pa-box-link">
                      <span>Xem tất cả tổ chức</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div role="tabpanel" aria-labelledby="pa-feed-tab-audit">
                  {data.recentActivity.length === 0 ? (
                    <div className="pa-ov-empty-inline">
                      <p>Chưa có thao tác quản trị nào được ghi nhận. Nhật ký sẽ hiển thị khi có thay đổi mới.</p>
                    </div>
                  ) : (
                    <div className="pa-timeline-feed">
                      {data.recentActivity.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="pa-timeline-entry">
                          <div className="pa-timeline-dot" aria-hidden="true" />
                          <div className="pa-timeline-main">{auditActionLabel(entry.action)}</div>
                          <div className="pa-timeline-meta">
                            {entry.entityLabel && (
                              <span>
                                Thực thể: <strong>{entry.entityLabel}</strong>
                              </span>
                            )}
                            {auditReason(entry.newValues) && (
                              <span>
                                Lý do: <em>{auditReason(entry.newValues)}</em>
                              </span>
                            )}
                            <span>· {formatDateTime(entry.createdAt)}</span>
                            {entry.actorEmail && <span>· {entry.actorEmail}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pa-ov-panel-foot">
                    <Link to="/platform/audit-log" className="pa-box-link">
                      <span>Mở nhật ký đầy đủ</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

function buildActionRows(data: PlatformOverview, pendingTrialsCount: number): ActionRow[] {
  const items: ActionRow[] = [];

  if (pendingTrialsCount > 0) {
    items.push({
      key: 'trials_pending',
      severity: 'warn',
      text: `${pendingTrialsCount} hồ sơ dùng thử chờ phân công Mentor.`,
      to: '/platform/trials',
      action: 'Phân công ngay',
    });
  }

  if (data.suspendedOrganizationCount > 0) {
    items.push({
      key: 'suspended',
      severity: 'danger',
      text: `${data.suspendedOrganizationCount} tổ chức đang tạm ngưng.`,
      to: '/platform/organizations?status=SUSPENDED',
      action: 'Xem tổ chức',
    });
  }

  if (data.lockedUserCount > 0) {
    items.push({
      key: 'locked',
      severity: 'danger',
      text: `${data.lockedUserCount} tài khoản đang bị khóa.`,
      to: '/platform/users?status=LOCKED',
      action: 'Xem tài khoản',
    });
  }

  if (data.draftVersionNo) {
    const changed = data.draftNewCourseCount + data.draftEditedCourseCount;
    if (changed > 0) {
      items.push({
        key: 'draft',
        severity: 'warn',
        text: `Bản nháp v${data.draftVersionNo} có ${changed} khóa chưa công bố.`,
        to: `/platform/versions/${data.draftVersionNo}`,
        action: 'Mở bản nháp',
      });
    }
  }

  if (data.draftFrameworkCount > 0) {
    items.push({
      key: 'framework',
      severity: 'warn',
      text: `${data.draftFrameworkCount} khung năng lực đang có bản nháp.`,
      to: '/platform/frameworks',
      action: 'Xem khung chuẩn',
    });
  }

  if (data.pausedCourseCount > 0) {
    items.push({
      key: 'paused',
      severity: 'info',
      text: `${data.pausedCourseCount} khóa nâng cao tạm ngưng bán.`,
      to: '/platform/commerce',
      action: 'Xem đơn giá',
    });
  }

  return items;
}

function ActionCountBadge({ data, pendingTrialsCount }: { data: PlatformOverview; pendingTrialsCount: number }) {
  const count = buildActionRows(data, pendingTrialsCount).length;
  if (count === 0) {
    return <span className="pa-count-badge neutral">0 việc</span>;
  }
  return <span className="pa-count-badge">{count} việc cần xử lý</span>;
}

function PriorityActionList({ data, pendingTrialsCount }: { data: PlatformOverview; pendingTrialsCount: number }) {
  useUiLanguage();
  const items = buildActionRows(data, pendingTrialsCount);

  if (items.length === 0) {
    return (
      <div className="pa-action-empty">
        <CheckCircle2 size={24} className="pa-action-empty-icon" aria-hidden="true" />
        <div className="pa-action-empty-title">Hệ thống đang vận hành ổn định</div>
        <p className="pa-action-empty-desc">
          Không có cảnh báo khẩn cấp hoặc việc tồn đọng. Tiếp tục theo dõi định kỳ tại mục Tổ chức và Nhật ký.
        </p>
      </div>
    );
  }

  return (
    <div className="pa-ov-action-list">
      {items.map((item) => (
        <div key={item.key} className="pa-ov-action-row">
          <div className="pa-ov-action-left">
            <span className={`pa-ov-sev-dot is-${item.severity}`} aria-hidden="true" />
            <span className="pa-ov-action-text">{item.text}</span>
          </div>
          <Link to={item.to} className="btn btn-outline btn-small pa-ov-action-btn">
            <span>{item.action}</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      ))}
    </div>
  );
}
