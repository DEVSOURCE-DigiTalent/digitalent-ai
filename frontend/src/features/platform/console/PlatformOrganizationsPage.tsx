import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlatformOrganizations, usePlatformOverview } from '@/hooks/use-platform-admin';
import { platformAdminService, type PlatformOrganization } from '@/services/platform-admin.service';
import { CSV_EXPORT_LIMIT, csvFileName, downloadCsv } from '../components/csv';
import { Box, Footer, LoadError, Pager } from '../components/pulse-ui';
import {
  ORG_STATUS,
  STAGE_LABELS,
  formatDate,
  formatMoney,
  formatNumber,
} from '../components/pulse-format';
import { PlatformDrawer } from '../components/PlatformDrawer';
import { CompanyAvatar } from '../components/CompanyAvatar';
import { OrganizationDetailContent } from './components/OrganizationDetailContent';
import { organizationHeaderLine } from './components/organization-header';
import { PlatformOrganizationsSkeleton } from './components/OrganizationsSkeleton';
import {
  Building2,
  Search,
  Plus,
  FileSpreadsheet,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  X,
} from 'lucide-react';
import { DEFAULT_PAGE_SIZE } from '../components/paging';

const TABS = [
  { key: 'ALL', label: 'Tất cả', filter: {} },
  { key: 'TRIAL', label: 'Đang dùng thử', filter: { stage: 'TRIAL', status: 'ACTIVE' } },
  { key: 'PAID', label: 'Đã mua khóa', filter: { stage: 'PAID', status: 'ACTIVE' } },
  { key: 'SUSPENDED', label: 'Tạm ngưng', filter: { status: 'SUSPENDED' } },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/** PA-05 · Quản trị Tổ chức: list of customer tenants with In-Context Slide-in Drawer (PA-06). */
export function PlatformOrganizationsPage() {
  useUiLanguage();
  const [params, setParams] = useSearchParams();
  const initialTab = (TABS.find((t) => t.key === params.get('status') || t.key === params.get('stage'))?.key ?? 'ALL') as TabKey;
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [drawerOrgId, setDrawerOrgId] = useState<string | null>(null);

  const overviewQuery = usePlatformOverview();
  const filter = TABS.find((t) => t.key === tab)!.filter;
  const { data, isLoading, error } = usePlatformOrganizations({ search, ...filter, pageIndex, pageSize });

  const chooseTab = (key: TabKey) => {
    setTab(key);
    setPageIndex(1);
    setParams(key === 'ALL' ? {} : key === 'SUSPENDED' ? { status: key } : { stage: key }, { replace: true });
  };

  const selectedOrg = data?.items.find((o) => o.id === drawerOrgId);
  const [isExporting, setIsExporting] = useState(false);

  /** Xuất danh sách đang lọc (tối đa 100 tổ chức) ra CSV. */
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const page = await platformAdminService.getOrganizations({ search, ...filter, pageIndex: 1, pageSize: CSV_EXPORT_LIMIT });
      const header = ['Tổ chức', 'Mã', 'Chủ doanh nghiệp', 'Email chủ doanh nghiệp', 'Trạng thái', 'Khóa đã mua',
        'Doanh thu (VND)', 'Nhân viên', 'Nhân viên đang học', 'Khóa Cơ bản', 'Khóa Trung cấp', 'Khóa Nâng cao', 'Ngày đăng ký'];
      const rows = page.items.map((o) => [
        o.name, o.code, o.ownerName, o.ownerEmail,
        o.status === 'SUSPENDED' ? ORG_STATUS.SUSPENDED.label : STAGE_LABELS[o.stage]?.label ?? o.stage,
        o.coursesPurchased, o.revenue, o.employeeCount, o.participantCount,
        o.coursesInUseByLevel?.[0] ?? 0, o.coursesInUseByLevel?.[1] ?? 0, o.coursesInUseByLevel?.[2] ?? 0,
        formatDate(o.createdAt),
      ]);
      downloadCsv(csvFileName('to-chuc'), header, rows);
      if (page.totalItems > page.items.length) {
        toast.info(`Đã xuất ${page.items.length}/${page.totalItems} tổ chức. Lọc hẹp hơn để xuất phần còn lại.`);
      }
    } catch {
      toast.error('Không xuất được danh sách. Thử lại sau.');
    } finally {
      setIsExporting(false);
    }
  };

  // Global counts for metrics and tab badges
  const overview = overviewQuery.data;
  const totalCount = overview?.organizationCount ?? data?.totalItems ?? 0;
  const trialCount = overview?.trialOrganizationCount ?? (data ? data.items.filter((o) => o.stage === 'TRIAL').length : 0);
  const paidCount = overview?.paidOrganizationCount ?? (data ? data.items.filter((o) => o.stage === 'PAID').length : 0);
  const suspendedCount = overview?.suspendedOrganizationCount ?? (data ? data.items.filter((o) => o.status === 'SUSPENDED').length : 0);

  const purchaseCount = overview?.purchaseCount ?? 0;
  const conversionRate = overview?.conversionRate ?? (totalCount ? Math.round((paidCount / totalCount) * 100) : 0);
  const revenue = overview?.revenue ?? 0;

  const getTabCount = (key: TabKey) => {
    if (key === 'ALL') return totalCount;
    if (key === 'TRIAL') return trialCount;
    if (key === 'PAID') return paidCount;
    if (key === 'SUSPENDED') return suspendedCount;
    return 0;
  };

  return (
    <>
      {/* Modern, clean header (zero kicker badge, clear typography) */}
      <header className="pa-org-header">
        <div>
          <h1 className="pa-org-title" aria-label="Doanh nghiệp đang dùng nền tảng.">
            Tổ chức
          </h1>
          <p className="pa-org-subtitle">
            Trạng thái, khóa học đã mua và số nhân viên đang học của từng tổ chức.
          </p>
        </div>

        <div className="pa-org-actions">
          <Link
            to="/business/try"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-small inline-flex items-center gap-1.5"
            title="Mở form đăng ký dùng thử cho tổ chức mới"
          >
            <Plus size={14} aria-hidden="true" />
            <span>Đăng ký tổ chức mới</span>
          </Link>
          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            title="Tải danh sách tổ chức đang lọc dạng CSV"
            disabled={isExporting}
            onClick={() => void handleExport()}
          >
            <FileSpreadsheet size={14} aria-hidden="true" />
            <span>{isExporting ? 'Đang xuất…' : 'Xuất CSV'}</span>
          </button>
        </div>
      </header>

      {/* Executive B2B Metrics (Hiệu quả khách hàng & Kinh doanh B2B) */}
      <div className="pa-org-kpi-grid" role="region" aria-label="Thống kê quy mô và hiệu quả kinh doanh B2B">
        <div className="pa-org-stat-card">
          <div className="pa-org-kpi-head">
            <span className="pa-org-kpi-label">Tổ chức</span>
            <div className="pa-kpi-icon-wrap emerald" aria-hidden="true">
              <Building2 size={14} />
            </div>
          </div>
          <div className="pa-org-kpi-val-row">
            <span className="pa-org-kpi-val">{formatNumber(totalCount)}</span>
            <span className="pa-org-kpi-sub">doanh nghiệp</span>
          </div>
        </div>

        <div className="pa-org-stat-card">
          <div className="pa-org-kpi-head">
            <span className="pa-org-kpi-label">Lượt mua khóa</span>
            <div className="pa-kpi-icon-wrap sky" aria-hidden="true">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="pa-org-kpi-val-row">
            <span className="pa-org-kpi-val" style={{ color: '#0369a1' }}>{overviewQuery.isLoading ? '…' : formatNumber(purchaseCount)}</span>
            <span className="pa-org-kpi-sub">khóa có phí, mọi tổ chức</span>
          </div>
        </div>

        <div className="pa-org-stat-card">
          <div className="pa-org-kpi-head">
            <span className="pa-org-kpi-label">Đã mua khóa</span>
            <div className="pa-kpi-icon-wrap amber" aria-hidden="true">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="pa-org-kpi-val-row">
            <span className="pa-org-kpi-val" style={{ color: '#b45309' }}>{overviewQuery.isLoading ? '…' : `${conversionRate}%`}</span>
            <span className="pa-org-kpi-sub">Trên tổng số tổ chức</span>
          </div>
        </div>

        <div className="pa-org-stat-card">
          <div className="pa-org-kpi-head">
            <span className="pa-org-kpi-label">Doanh thu</span>
            <div className="pa-kpi-icon-wrap purple" aria-hidden="true">
              <CreditCard size={14} />
            </div>
          </div>
          <div className="pa-org-kpi-val-row">
            <span className="pa-org-kpi-val" style={{ color: '#7c3aed' }}>{overviewQuery.isLoading ? '…' : formatMoney(revenue)}</span>
            <span className="pa-org-kpi-sub">Từ trước đến nay</span>
          </div>
        </div>
      </div>

      <Box>
        {/* Modern Filter Toolbar */}
        <div className="pa-org-toolbar">
          <div className="pa-org-tabs" role="group" aria-label="Lọc tổ chức">
            {TABS.map((t) => {
              const isActive = tab === t.key;
              const count = getTabCount(t.key);
              return (
                <button
                  key={t.key}
                  type="button"
                  className="pa-org-tab-btn"
                  aria-pressed={isActive}
                  onClick={() => chooseTab(t.key)}
                >
                  <span>{translateUi(t.label)}</span>
                  <span className="pa-org-tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search with Clear button */}
          <div className="pa-tr-search-wrap" style={{ minWidth: 260, maxWidth: 380 }}>
            <Search size={15} className="pa-tr-search-icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Tìm theo tên, mã hoặc email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(1);
              }}
              className="pa-tr-search-input"
              aria-label="Tìm tổ chức"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPageIndex(1);
                }}
                className="pa-tr-search-clear"
                aria-label="Xóa từ khóa tìm kiếm"
                title="Xóa từ khóa"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {isLoading && <PlatformOrganizationsSkeleton />}
        {error && <LoadError error={error} />}

        {!isLoading && data && data.items.length === 0 && (
          <div className="pa-org-empty-box">
            <Building2 size={36} style={{ color: '#64748b', margin: '0 auto 8px' }} />
            <div className="pa-org-empty-title">Không tìm thấy tổ chức nào</div>
            <p className="pa-org-empty-sub">
              Không có doanh nghiệp khớp với bộ lọc hiện tại. Thử đổi từ khóa tìm kiếm hoặc chọn thẻ danh mục khác.
            </p>
          </div>
        )}

        {!isLoading && data && data.items.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="data-table pa-org-table">
                <thead>
                  <tr>
                    <th>Tổ chức</th>
                    <th>Trạng thái</th>
                    <th title="Khóa Trung cấp và Nâng cao (khóa Cơ bản miễn phí)">Khóa đã mua</th>
                    <th>{translateUi('Ngày đăng ký')}</th>
                    <th style={{ width: 56 }}><span className="sr-only">{translateUi('Thao tác')}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((o) => {

                    return (
                      <tr
                        key={o.id}
                        className="pa-row-link"
                        onClick={() => setDrawerOrgId(o.id)}
                        title="Bấm để mở ngăn kéo xem hồ sơ 360"
                      >
                        <td>
                          <div className="pa-org-cell-main">
                            <CompanyAvatar name={o.name} size={36} />
                            <div>
                              <div className="pa-org-name">{o.name}</div>
                              <div className="pa-org-email">{o.ownerEmail ?? 'Chưa có chủ doanh nghiệp'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <PlanCell organization={o} />
                        </td>
                        <td>
                          {o.coursesPurchased > 0 ? (
                            <strong style={{ fontSize: 13 }}>{formatNumber(o.coursesPurchased)} khóa trả phí</strong>
                          ) : (
                            <span className="pa-cell-sub">Chưa mua</span>
                          )}
                        </td>
                        <td>{formatDate(o.createdAt)}</td>
                        <td>
                          <button
                            type="button"
                            className="pa-org-btn-view"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawerOrgId(o.id);
                            }}
                            title="Xem chi tiết tổ chức"
                            aria-label={`Xem chi tiết ${o.name}`}
                          >
                            <ChevronRight size={16} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pager
              pageIndex={data.pageIndex}
              totalPages={data.totalPages}
              totalItems={data.totalItems}
              onChange={setPageIndex}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPageIndex(1);
              }}
            />
          </>
        )}
      </Box>

      {/* Slide-in Drawer PA-06 */}
      <PlatformDrawer
        isOpen={Boolean(drawerOrgId)}
        onClose={() => setDrawerOrgId(null)}
        title={selectedOrg?.name ?? translateUi('Chi tiết tổ chức')}
        subtitle={
          selectedOrg
            ? translateUi(organizationHeaderLine(selectedOrg))
            : translateUi('Chi tiết doanh nghiệp')
        }
        avatar={selectedOrg ? <CompanyAvatar name={selectedOrg.name} size={40} /> : undefined}
        badge={
          selectedOrg &&
          (selectedOrg.status === 'SUSPENDED' ? (
            <span className="pa-tr-pill is-neutral">
              <span className="pa-tr-pill-dot" aria-hidden="true" />
              <span>{translateUi(ORG_STATUS.SUSPENDED.label)}</span>
            </span>
          ) : selectedOrg.stage === 'PAID' ? (
            <span className="pa-tr-pill is-ok">
              <span className="pa-tr-pill-dot" aria-hidden="true" />
              <span>{translateUi(STAGE_LABELS.PAID.label)}</span>
            </span>
          ) : (
            <span className="pa-tr-pill is-warn">
              <span className="pa-tr-pill-dot" aria-hidden="true" />
              <span>{translateUi(STAGE_LABELS.TRIAL.label)}</span>
            </span>
          ))
        }
        width={640}
        footer={
          drawerOrgId ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Link
                to={`/platform/organizations/${drawerOrgId}`}
                className="btn btn-ghost btn-small inline-flex items-center gap-1"
                target="_blank"
                rel="noreferrer"
              >
                <span>Mở toàn màn hình</span>
                <ExternalLink size={13} aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="btn btn-outline btn-small"
                onClick={() => setDrawerOrgId(null)}
              >
                {translateUi('Đóng')}
              </button>
            </div>
          ) : undefined
        }
      >
        {drawerOrgId && <OrganizationDetailContent orgId={drawerOrgId} />}
      </PlatformDrawer>

      <Footer />
    </>
  );
}

function PlanCell({ organization: o }: { organization: PlatformOrganization }) {
  useUiLanguage();
  const isSuspended = o.status === 'SUSPENDED';
  const isPaid = o.stage === 'PAID';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div>
        {isSuspended ? (
          <span className="pa-tr-pill is-neutral">
            <span className="pa-tr-pill-dot" aria-hidden="true" />
            <span>Tạm ngưng</span>
          </span>
        ) : isPaid ? (
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

    </div>
  );
}
