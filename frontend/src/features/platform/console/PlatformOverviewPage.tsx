import { useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  CreditCard,
  FileEdit,
  RefreshCw,
  Users,
} from 'lucide-react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import {
  usePlatformCommerce,
  usePlatformCourses,
  usePlatformOpenTicketCount,
  usePlatformOrganizations,
  usePlatformOverview,
} from '@/hooks/use-platform-admin';
import { usePlatformTrials } from '@/hooks/use-trial-program';
import type { PlatformOverview } from '@/services/platform-admin.service';
import { Footer, LoadError, Pill } from '../components/pulse-ui';
import { CompanyAvatar } from '../components/CompanyAvatar';
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
import { AttentionListCard, TrialFunnelCard } from './components/OverviewInsights';
import { trialNeedsMentor } from '@/features/trial-program/lib/trial-mentor';

type FeedTab = 'orgs' | 'audit';

interface ActionRow {
  key: string;
  severity: 'danger' | 'warn' | 'info';
  text: string;
  to: string;
  action: string;
}

/** Hàng đợi chờ admin ngoài số liệu tổng quan: dùng thử chờ phân công, góp ý và báo lỗi chưa xử lý. */
interface QueueCounts {
  pendingTrials: number;
  openFeedbacks: number;
  openBugs: number;
}

/** PA-01: Platform Executive Overview with 4-tier hierarchy, Recharts analytics and matched Skeleton loading. */
export function PlatformOverviewPage() {
  useUiLanguage();
  const overview = usePlatformOverview();
  const commerce = usePlatformCommerce({ pageIndex: 1, pageSize: 100 });
  const coursesQuery = usePlatformCourses();
  const trialsQuery = usePlatformTrials();
  const orgsQuery = usePlatformOrganizations({ pageIndex: 1, pageSize: 100 });
  const { data: openFeedbacks = 0 } = usePlatformOpenTicketCount('FEEDBACK');
  const { data: openBugs = 0 } = usePlatformOpenTicketCount('BUG');

  const [feedTab, setFeedTab] = useState<FeedTab>('orgs');

  const data = overview.data;
  const trialItems = trialsQuery.data ?? [];
  const organizations = orgsQuery.data?.items ?? [];
  const queue: QueueCounts = {
    pendingTrials: trialItems.filter(trialNeedsMentor).length,
    openFeedbacks,
    openBugs,
  };
  const orders = commerce.data?.orders?.items ?? [];
  const courseList = coursesQuery.data ?? commerce.data?.courses ?? [];
  // /platform/courses còn trả khóa của phiên bản cũ (vẫn có lượt mua); thẻ "Khóa học" chỉ đếm phiên bản đang dùng.
  const currentCourseCount = data?.currentVersionNo
    ? courseList.filter((c) => c.versionNo === data.currentVersionNo).length || data.courseCount
    : data?.courseCount ?? 0;

  const isRefreshing =
    !overview.isLoading &&
    (overview.isFetching || commerce.isFetching || trialsQuery.isFetching || orgsQuery.isFetching);

  const handleRefresh = () => {
    void overview.refetch();
    void commerce.refetch();
    void coursesQuery.refetch();
    void trialsQuery.refetch();
    void orgsQuery.refetch();
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
          <h1 aria-label={translateUi('Toàn cảnh nền tảng hôm nay.')}>Tổng quan</h1>
          <p className="pa-ov-subtitle">
            Doanh thu, tổ chức, người dùng và khóa học tính đến hôm nay.
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
            <Building2 size={14} aria-hidden="true" />
            <span>{translateUi('Xem tổ chức')}</span>
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
              <span className="pa-ov-version-label">Đang dùng</span>
              <strong className="pa-ov-version-val">
                {data.currentVersionNo ? `v${data.currentVersionNo}` : 'Chưa có'}
              </strong>
              <span className="pa-ov-version-meta">
                {currentCourseCount} khóa học · Công bố {formatDate(data.currentVersionPublishedAt)}
              </span>
            </div>

            <div className="pa-ov-version-divider" aria-hidden="true" />

            <div className="pa-ov-version-item">
              {data.draftVersionNo ? (
                <>
                  <span className="pa-status-dot is-info" aria-hidden="true" />
                  <span className="pa-ov-version-label">Bản nháp</span>
                  <strong className="pa-ov-version-val">v{data.draftVersionNo}</strong>
                  <span className="pa-ov-version-meta">
                    {translateUi(`${data.draftNewCourseCount} khóa mới, ${data.draftEditedCourseCount} khóa đã sửa`)}
                  </span>
                  <Link to={`/platform/versions/${data.draftVersionNo}`} className="pa-ov-version-link">
                    <FileEdit size={13} aria-hidden="true" />
                    <span>Xem bản nháp</span>
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
                <span className="pa-ov-kpi-label">Doanh thu</span>
                <span className="pa-kpi-icon is-orange" aria-hidden="true">
                  <CreditCard size={16} />
                </span>
              </div>
              <div className="pa-ov-kpi-val is-money">{formatMoney(data.revenue)}</div>
              <div className="pa-ov-kpi-sub">
                <strong>{formatNumber(data.purchaseCount)}</strong> lượt mua khóa
              </div>
            </Link>

            <Link to="/platform/organizations" className="pa-ov-kpi-card is-tone-sky">
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Tổ chức</span>
                <span className="pa-kpi-icon is-sky" aria-hidden="true">
                  <Building2 size={16} />
                </span>
              </div>
              <div className="pa-ov-kpi-val-row">
                <span className="pa-ov-kpi-val">{formatNumber(data.organizationCount)}</span>
              </div>
              <div className="pa-ov-kpi-sub">
                <span className="pa-inline-status is-live">{data.paidOrganizationCount} đã mua khóa</span>
                <span>· {data.trialOrganizationCount} dùng thử</span>
                {data.suspendedOrganizationCount > 0 && (
                  <span>· {data.suspendedOrganizationCount} tạm ngưng</span>
                )}
              </div>
            </Link>

            <Link to="/platform/users" className="pa-ov-kpi-card is-tone-green">
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Người dùng</span>
                <span className="pa-kpi-icon is-amber" aria-hidden="true">
                  <Users size={16} />
                </span>
              </div>
              <div className="pa-ov-kpi-val-row">
                <span className="pa-ov-kpi-val">{formatNumber(data.userCount)}</span>
                {(data.recentUsers7d ?? 0) > 0 && (
                  <span className="pa-ov-delta-pill" title="Tài khoản tạo trong 7 ngày qua">
                    <span>+{formatNumber(data.recentUsers7d ?? 0)} trong 7 ngày</span>
                  </span>
                )}
              </div>
              <div className="pa-ov-kpi-sub">
                <span>
                  <strong>{formatNumber(data.employeeCount)}</strong> thuộc tổ chức
                </span>
                {data.lockedUserCount > 0 && <span>· {formatNumber(data.lockedUserCount)} đã khóa</span>}
              </div>
            </Link>

            <Link to="/platform/versions" className="pa-ov-kpi-card is-tone-amber">
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Khóa học</span>
                <span className="pa-kpi-icon is-amber" aria-hidden="true">
                  <BookOpen size={16} />
                </span>
              </div>
              <div className="pa-ov-kpi-val">{formatNumber(currentCourseCount)} khóa</div>
              <div className="pa-ov-kpi-sub">
                Phiên bản v{data.currentVersionNo ?? '?'} · {data.domainCount} lĩnh vực
                {data.pausedCourseCount > 0 && <> · {data.pausedCourseCount} tạm ngưng bán</>}
              </div>
            </Link>
          </div>

          {/* Tier 3: Recharts Column Chart (7fr) + Organization & Trial Donut (5fr) */}
          <div className="pa-ov-charts-grid">
            <RevenueColumnCard
              orders={orders}
              courses={courseList}
              totalRevenue={data.revenue}
              purchaseCount={data.purchaseCount}
              isSubLoading={commerce.isLoading && coursesQuery.isLoading}
            />

            <OrganizationDonutCard data={data} trials={trialItems} />
          </div>

          {/* Tầng 3b: phễu dùng thử + tổ chức cần can thiệp */}
          <div className="pa-insight-grid">
            <TrialFunnelCard trials={trialItems} organizations={organizations} />
            <AttentionListCard trials={trialItems} organizations={organizations} />
          </div>

          {/* Tier 4: Priority Action Queue (6fr) + Tabbed Recent Activity Monitor (6fr) */}
          <div className="pa-ov-ops-grid">
            <section className="pa-ov-panel" aria-label="Việc cần xử lý">
              <div className="pa-ov-panel-head">
                <div>
                  <h2 className="pa-ov-panel-title">Việc cần xử lý</h2>
                </div>
                <ActionCountBadge data={data} queue={queue} />
              </div>

              <PriorityActionList data={data} queue={queue} />
            </section>

            <section className="pa-ov-panel" aria-label="Gần đây">
              <div className="pa-ov-panel-head">
                <div>
                  <h2 className="pa-ov-panel-title">Gần đây</h2>
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
                    {translateUi('Tổ chức mới')}
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
                      <p>Chưa có tổ chức nào đăng ký. Tổ chức mới sẽ hiện ở đây sau khi họ đăng ký dùng thử.</p>
                    </div>
                  ) : (
                    <div className="pa-ov-feed-list">
                      {data.recentOrganizations.slice(0, 5).map((org) => (
                        <div key={org.id} className="pa-recent-org-item">
                          <div className="pa-recent-org-left">
                            <CompanyAvatar name={org.name} size={32} />
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
                      <span>Xem tất cả</span>
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
                                Đối tượng: <strong>{entry.entityLabel}</strong>
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

function buildActionRows(data: PlatformOverview, queue: QueueCounts): ActionRow[] {
  const items: ActionRow[] = [];

  if (queue.pendingTrials > 0) {
    items.push({
      key: 'trials_pending',
      severity: 'warn',
      text: `${queue.pendingTrials} tổ chức đang học chưa có mentor chấm bài.`,
      to: '/platform/mentors',
      action: 'Phân công',
    });
  }

  if (queue.openBugs > 0) {
    items.push({
      key: 'bugs_open',
      severity: 'danger',
      text: `${queue.openBugs} báo lỗi chưa xử lý.`,
      to: '/platform/bug-reports',
      action: 'Xem báo lỗi',
    });
  }

  if (queue.openFeedbacks > 0) {
    items.push({
      key: 'feedbacks_open',
      severity: 'info',
      text: `${queue.openFeedbacks} góp ý chưa trả lời.`,
      to: '/platform/feedbacks',
      action: 'Xem góp ý',
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
      action: 'Mở khung năng lực',
    });
  }

  if (data.pausedCourseCount > 0) {
    items.push({
      key: 'paused',
      severity: 'info',
      text: `${data.pausedCourseCount} khóa đang tạm ngưng bán.`,
      to: '/platform/commerce',
      action: 'Xem bảng giá',
    });
  }

  const order = { danger: 0, warn: 1, info: 2 } as const;
  return items.sort((a, b) => order[a.severity] - order[b.severity]);
}

function ActionCountBadge({ data, queue }: { data: PlatformOverview; queue: QueueCounts }) {
  const count = buildActionRows(data, queue).length;
  return <span className={`pa-count-badge${count === 0 ? ' neutral' : ''}`}>{count}</span>;
}

function PriorityActionList({ data, queue }: { data: PlatformOverview; queue: QueueCounts }) {
  useUiLanguage();
  const items = buildActionRows(data, queue);

  if (items.length === 0) {
    return (
      <div className="pa-action-empty">
        <CheckCircle2 size={24} className="pa-action-empty-icon" aria-hidden="true" />
        <div className="pa-action-empty-title">Không có việc chờ xử lý</div>
        <p className="pa-action-empty-desc">
          Dùng thử đã có mentor, không có góp ý hay báo lỗi chưa xử lý.
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
