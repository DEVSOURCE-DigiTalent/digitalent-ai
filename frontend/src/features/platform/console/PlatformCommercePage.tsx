import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlatformCommerce } from '@/hooks/use-platform-admin';
import {
  useCatalogVersion,
  useCatalogVersions,
  useCreateCatalogCourse,
  useCreateDraft,
  useDiscardDraft,
  useFramework,
  useFrameworks,
  useRemoveCatalogCourse,
  useUpdatePrices,
} from '@/hooks/use-platform-catalog';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { platformAdminService, type PlatformCourse, type SalesStatus } from '@/services/platform-admin.service';
import { CSV_EXPORT_LIMIT, csvFileName, downloadCsv } from '../components/csv';
import { Box, Footer, LoadError, Loading, Pager, Pill } from '../components/pulse-ui';
import { LEVEL_NAMES, SALES_STATUS, errorMessage, formatDateTime, formatMoney, formatNumber } from '../components/pulse-format';
import {
  ReceiptText,
  Building2,
  Sparkles,
  Save,
  RotateCcw,
  Edit3,
  History,
  FileSpreadsheet,
  Search,
  Tag,
  X,
  Layers,
  Plus,
  Trash2,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react';

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{1,29}$/;

type Edit = { price: number; sales: SalesStatus };
type CommerceTab = 'PRICING' | 'ORDERS';

type AugmentedPlatformCourse = PlatformCourse & { isNewInDraft?: boolean };

/**
 * PA-09 · Giá và đơn hàng B2B
 * Quản trị giá khóa học theo phiên bản (mỗi khóa mua một lần cho cả doanh nghiệp) và sổ cái mua / mở khóa miễn phí.
 */
export function PlatformCommercePage() {
  useUiLanguage();
  const [params, setParams] = useSearchParams();
  const rawTab = params.get('tab');
  const activeTab: CommerceTab = rawTab === 'ORDERS' ? 'ORDERS' : 'PRICING';

  const [pageIndex, setPageIndex] = useState(1);
  const [orderSearch, setOrderSearch] = useState('');
  const [discardModalOpen, setDiscardModalOpen] = useState(false);

  const { data, isLoading, error } = usePlatformCommerce({ pageIndex, pageSize: 20 });
  const versions = useCatalogVersions();
  const currentNo = versions.data?.currentVersionNo ?? null;
  const draftNo = versions.data?.draftVersionNo ?? null;

  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const createDraft = useCreateDraft();
  const discardDraft = useDiscardDraft();

  // Retrieve draft version details when a draft is open
  const draftVersionQuery = useCatalogVersion(draftNo ?? undefined);
  const draftCourses = draftVersionQuery.data?.courses ?? [];

  // Combine published courses with any new courses added in draft
  const combinedCourses = useMemo<AugmentedPlatformCourse[]>(() => {
    const publishedList = data?.courses ?? [];
    if (!draftNo || !draftCourses.length) return publishedList;

    const existingIds = new Set(publishedList.map((c) => c.id));
    const newInDraft: AugmentedPlatformCourse[] = draftCourses
      .filter((dc) => !existingIds.has(dc.courseId) || dc.changeKind === 'NEW')
      .map((dc) => ({
        id: dc.courseId,
        code: dc.code,
        frameworkId: dc.frameworkId,
        frameworkName: dc.frameworkName,
        domainCode: '',
        domainName: dc.domainName,
        level: dc.level,
        levelName: dc.levelName,
        versionNo: draftNo,
        title: dc.title,
        outcome: '',
        price: dc.level === 1 ? 0 : dc.price,
        salesStatus: dc.salesStatus,
        isFree: dc.level === 1,
        draftPrice: dc.price,
        draftSalesStatus: dc.salesStatus,
        publishedAt: null,
        moduleCount: dc.moduleCount,
        questionCount: dc.questionCount,
        purchaseCount: 0,
        revenue: 0,
        isNewInDraft: true,
      }));

    return [...publishedList, ...newInDraft];
  }, [data?.courses, draftNo, draftCourses]);

  const onCreateDraft = () =>
    createDraft.mutate(undefined, {
      onSuccess: (draft) => toast.success(`Đã tạo bản nháp v${draft.version.versionNo}. Quản trị viên hiện có thể điều chỉnh đơn giá.`),
      onError: (err) => toast.error(errorMessage(err)),
    });

  const onConfirmDiscard = () => {
    if (draftNo === null) return;
    discardDraft.mutate(draftNo, {
      onSuccess: () => {
        toast.success(`Đã hủy bản nháp v${draftNo}. Hệ thống đã quay lại phiên bản v${currentNo}.`);
        setDiscardModalOpen(false);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  const chooseTab = (tab: CommerceTab) => {
    setParams(tab !== 'PRICING' ? { tab } : {}, { replace: true });
  };

  // Metrics calculations
  const totalRevenue = data?.revenue ?? 0;
  const purchaseCount = data?.purchaseCount ?? 0;
  // API còn trả khóa của phiên bản cũ (vẫn có lượt mua). Thẻ "Khóa đang bán" chỉ đếm phiên bản đang dùng.
  const currentCourses = useMemo(
    () => (currentNo ? combinedCourses.filter((c) => c.versionNo === currentNo) : combinedCourses),
    [combinedCourses, currentNo],
  );
  const paidCourses = currentCourses.filter((c) => !c.isFree).length;
  const freeCourses = currentCourses.filter((c) => c.isFree).length;
  const [isExporting, setIsExporting] = useState(false);

  /** Xuất bảng giá (tab Bảng giá) hoặc 100 đơn hàng gần nhất (tab Đơn hàng). */
  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (activeTab === 'ORDERS') {
        const page = await platformAdminService.getCommerce({ pageIndex: 1, pageSize: CSV_EXPORT_LIMIT });
        downloadCsv(
          csvFileName('don-hang'),
          ['Thời gian', 'Tổ chức', 'Mã khóa', 'Khóa học', 'Thành tiền (VND)', 'Người mua', 'Ghi chú'],
          page.orders.items.map((o) => [
            formatDateTime(o.createdAt), o.organizationName, o.courseCode, o.courseTitle,
            o.amount, o.createdByEmail, o.reason,
          ]),
        );
      } else {
        downloadCsv(
          csvFileName('bang-gia'),
          ['Mã khóa', 'Khóa học', 'Lĩnh vực', 'Cấp độ', 'Phiên bản', 'Giá khóa (VND)', 'Mở bán', 'Tổ chức đã mua', 'Doanh thu (VND)'],
          combinedCourses.map((c) => [
            c.code, c.title, c.domainName, c.levelName, `v${c.versionNo}`, c.price,
            SALES_STATUS[c.salesStatus]?.label ?? c.salesStatus, c.purchaseCount, c.revenue,
          ]),
        );
      }
    } catch {
      toast.error('Không xuất được dữ liệu. Thử lại sau.');
    } finally {
      setIsExporting(false);
    }
  };

  // Filtered orders for client-side search
  const filteredOrders = useMemo(() => {
    if (!data?.orders?.items) return [];
    if (!orderSearch.trim()) return data.orders.items;
    const q = orderSearch.trim().toLowerCase();
    return data.orders.items.filter(
      (o) =>
        o.organizationName.toLowerCase().includes(q) ||
        o.courseTitle.toLowerCase().includes(q) ||
        (o.createdByEmail && o.createdByEmail.toLowerCase().includes(q)) ||
        (o.reason && o.reason.toLowerCase().includes(q)),
    );
  }, [data?.orders?.items, orderSearch]);

  return (
    <>
      {/* Modern, clean executive header (zero kicker badge, clear typography) */}
      <header className="pa-org-header">
        <div>
          <h1 className="pa-org-title" aria-label="Giá và đơn hàng">
            Giá và đơn hàng
          </h1>
          <p className="pa-org-subtitle">
            Giá của từng khóa (mỗi khóa mua một lần cho cả doanh nghiệp) và lịch sử mua khóa của các tổ chức.
          </p>
        </div>

        <div className="pa-org-actions">
          {canManage && draftNo === null && (
            <button
              type="button"
              className="btn btn-primary btn-small inline-flex items-center gap-1.5"
              onClick={onCreateDraft}
              disabled={createDraft.isPending}
              title="Tạo phiên bản nháp mới để điều chỉnh đơn giá niêm yết"
            >
              <Sparkles size={14} aria-hidden="true" />
              <span>{createDraft.isPending ? 'Đang tạo…' : 'Tạo bản nháp đổi giá'}</span>
            </button>
          )}

          {draftNo !== null && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Link
                className="btn btn-primary btn-small inline-flex items-center gap-1.5"
                to={`/platform/versions/${draftNo}`}
                title={`Mở bản nháp v${draftNo} để chỉnh sửa và công bố`}
              >
                <Edit3 size={14} aria-hidden="true" />
                <span>Mở bản nháp v{draftNo}</span>
              </Link>
            </div>
          )}

          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            title={activeTab === 'ORDERS' ? 'Tải lịch sử đơn hàng dạng CSV' : 'Tải bảng giá dạng CSV'}
            disabled={isExporting}
            onClick={() => void handleExport()}
          >
            <FileSpreadsheet size={14} aria-hidden="true" />
            <span>{isExporting ? 'Đang xuất…' : 'Xuất CSV'}</span>
          </button>
        </div>
      </header>

      {(isLoading || versions.isLoading) && <Loading />}
      {error && <LoadError error={error} />}

      {data && versions.data && (
        <>
          {/* Executive 4 Financial KPI Cards */}
          <div className="pa-org-kpi-grid" role="region" aria-label="Thống kê doanh thu bán khóa học">
            {/* Card 1: Doanh thu */}
            <div className="pa-org-stat-card">
              <div className="pa-org-kpi-head">
                <span className="pa-org-kpi-label">Doanh thu</span>
                <div className="pa-kpi-icon-wrap emerald" aria-hidden="true">
                  <ReceiptText size={14} />
                </div>
              </div>
              <div className="pa-org-kpi-val-row">
                <span className="pa-org-kpi-val" style={{ color: '#15803d', whiteSpace: 'nowrap', fontSize: 20 }}>
                  {formatMoney(totalRevenue)}
                </span>
                <span className="pa-org-kpi-sub">từ trước đến nay</span>
              </div>
            </div>

            {/* Card 2: Khóa đã bán */}
            <div className="pa-org-stat-card">
              <div className="pa-org-kpi-head">
                <span className="pa-org-kpi-label">Khóa đã bán</span>
                <div className="pa-kpi-icon-wrap sky" aria-hidden="true">
                  <Building2 size={14} />
                </div>
              </div>
              <div className="pa-org-kpi-val-row">
                <span className="pa-org-kpi-val" style={{ color: '#0369a1' }}>
                  {formatNumber(purchaseCount)}
                </span>
                <span className="pa-org-kpi-sub">lượt mua khóa có phí, mọi tổ chức</span>
              </div>
            </div>

            {/* Card 3: Doanh nghiệp đã mua */}
            <div className="pa-org-stat-card">
              <div className="pa-org-kpi-head">
                <span className="pa-org-kpi-label">Doanh nghiệp đã mua</span>
                <div className="pa-kpi-icon-wrap sky" style={{ background: '#ede9fe', color: '#7c3aed' }} aria-hidden="true">
                  <ShoppingBag size={14} />
                </div>
              </div>
              <div className="pa-org-kpi-val-row">
                <span className="pa-org-kpi-val" style={{ color: '#7c3aed' }}>
                  {formatNumber(data.buyerCount)}
                </span>
                <span className="pa-org-kpi-sub">có ít nhất một khóa có phí</span>
              </div>
            </div>

            {/* Card 4: Danh mục khóa học */}
            <div className="pa-org-stat-card">
              <div className="pa-org-kpi-head">
                <span className="pa-org-kpi-label">Khóa đang bán</span>
                <div className="pa-kpi-icon-wrap amber" aria-hidden="true">
                  <Layers size={14} />
                </div>
              </div>
              <div className="pa-org-kpi-val-row">
                <span className="pa-org-kpi-val" style={{ color: '#b45309' }}>
                  {currentCourses.length} khóa
                </span>
                <span className="pa-org-kpi-sub">
                  {paidCourses} có phí · {freeCourses} miễn phí{currentNo ? ` · v${currentNo}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Workstream Tabs Switcher: Exactly 2 clean tabs */}
          <div className="pa-commerce-workstream-bar">
            <div className="pa-org-tabs" role="tablist" aria-label="Phân khu làm việc thương mại">
              <button
                type="button"
                role="tab"
                className="pa-org-tab-btn"
                aria-selected={activeTab === 'PRICING'}
                aria-pressed={activeTab === 'PRICING'}
                onClick={() => chooseTab('PRICING')}
              >
                <Tag size={14} aria-hidden="true" />
                <span>Bảng giá</span>
                <span className="pa-org-tab-count">{combinedCourses.length}</span>
              </button>

              <button
                type="button"
                role="tab"
                className="pa-org-tab-btn"
                aria-selected={activeTab === 'ORDERS'}
                aria-pressed={activeTab === 'ORDERS'}
                onClick={() => chooseTab('ORDERS')}
              >
                <History size={14} aria-hidden="true" />
                <span>Đơn hàng</span>
                <span className="pa-org-tab-count">{data.orders.totalItems}</span>
              </button>
            </div>
          </div>

          {/* Workstream Section 1: Biểu giá khóa học */}
          {activeTab === 'PRICING' && (
            <PriceTable
              key={`${draftNo}-${combinedCourses.map((c) => `${c.draftPrice}${c.draftSalesStatus}`).join()}`}
              courses={combinedCourses}
              currentNo={currentNo}
              draftNo={draftNo}
              onDiscardDraft={() => setDiscardModalOpen(true)}
              onCreateDraft={onCreateDraft}
              isCreatingDraft={createDraft.isPending}
            />
          )}

          {/* Workstream Section 2: Lịch sử đơn hàng & Cấp phát */}
          {activeTab === 'ORDERS' && (
            <Box>
              <div className="pa-commerce-section-head">
                <div>
                  <h2 className="pa-commerce-section-title">
                    <History size={17} style={{ color: '#0f172a' }} aria-hidden="true" />
                    <span>Đơn hàng</span>
                  </h2>
                  <p className="pa-commerce-section-desc">
                    Mỗi đơn là một doanh nghiệp mua một khóa học, mua một lần cho mọi nhân viên.
                  </p>
                </div>
              </div>

              {/* Order filters toolbar */}
              <div className="pa-users-search-row" style={{ marginBottom: 16 }}>
                <div className="pa-tr-search-wrap">
                  <Search size={15} className="pa-tr-search-icon" aria-hidden="true" />
                  <input
                    type="search"
                    className="pa-tr-search-input"
                    placeholder="Tìm theo tên doanh nghiệp, khóa học, người thực hiện..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    aria-label="Tìm kiếm đơn hàng"
                  />
                  {orderSearch && (
                    <button
                      type="button"
                      className="pa-tr-search-clear"
                      onClick={() => setOrderSearch('')}
                      aria-label="Xóa từ khóa tìm kiếm"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {orderSearch && (
                  <button
                    type="button"
                    className="pa-btn-reset-filters"
                    onClick={() => {
                      setOrderSearch('');
                      setPageIndex(1);
                    }}
                    title="Khôi phục bộ lọc đơn hàng về mặc định"
                  >
                    <RotateCcw size={13} aria-hidden="true" />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>

              {filteredOrders.length === 0 ? (
                <div className="pa-org-empty-box">
                  <ReceiptText size={36} style={{ color: '#64748b', margin: '0 auto 8px' }} />
                  <div className="pa-org-empty-title">Không tìm thấy đơn hàng hoặc lượt cấp phát nào</div>
                  <p className="pa-org-empty-sub">Thử đổi từ khóa tìm kiếm hoặc chọn loại đơn khác.</p>
                </div>
              ) : (
                <>
                  <div className="table-scroll">
                    <table className="data-table pa-org-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th style={{ width: 150 }}>Thời gian</th>
                          <th style={{ minWidth: 260 }}>Khóa học và tổ chức</th>

                          <th style={{ width: 140, textAlign: 'right' }}>Thành tiền</th>
                          <th style={{ minWidth: 260 }}>Người mua và ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((o) => {
                          return (
                            <tr key={o.id}>
                              <td>
                                <span style={{ fontSize: 12, color: '#475569', fontVariantNumeric: 'tabular-nums' }}>
                                  {formatDateTime(o.createdAt)}
                                </span>
                              </td>
                              <td>
                                <div>
                                  <strong style={{ fontSize: 13, color: '#0f172a', display: 'block', lineHeight: 1.35 }}>
                                    {o.courseTitle}
                                  </strong>
                                  <Link
                                    to={`/platform/organizations/${o.organizationId}`}
                                    style={{
                                      fontSize: 12,
                                      color: '#0369a1',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      marginTop: 3,
                                      fontWeight: 500,
                                      textDecoration: 'none',
                                    }}
                                    title="Xem chi tiết tổ chức doanh nghiệp"
                                  >
                                    <Building2 size={12} />
                                    <span>{o.organizationName}</span>
                                  </Link>
                                </div>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <strong
                                  style={{
                                    fontSize: 13,
                                    color: '#15803d',
                                    fontVariantNumeric: 'tabular-nums',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {formatMoney(o.amount)}
                                </strong>
                              </td>
                              <td>
                                <div style={{ fontSize: 12, color: '#334155' }}>
                                  {o.createdByEmail && <div style={{ fontWeight: 500 }}>{o.createdByEmail}</div>}
                                  {o.reason && (
                                    <div
                                      style={{
                                        fontSize: 12,
                                        color: '#64748b',
                                        marginTop: 2,
                                        lineHeight: 1.35,
                                        wordBreak: 'break-word',
                                      }}
                                    >
                                      {o.reason}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <Pager
                      pageIndex={data.orders.pageIndex}
                      totalPages={data.orders.totalPages}
                      totalItems={data.orders.totalItems}
                      onChange={setPageIndex}
                    />
                  </div>
                </>
              )}
            </Box>
          )}

          {/* Discard Draft Confirmation Modal */}
          {discardModalOpen &&
            draftNo !== null &&
            typeof document !== 'undefined' &&
            createPortal(
              <div className="pulse-ui pa-modal-overlay" onClick={() => setDiscardModalOpen(false)}>
                <div
                  className="pa-modal-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="discard-draft-title"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="pa-modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: '#fef2f2',
                          color: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AlertTriangle size={18} />
                      </div>
                      <h2 id="discard-draft-title" className="pa-modal-title">
                        Hủy bản nháp v{draftNo}
                      </h2>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => setDiscardModalOpen(false)}
                      aria-label="Đóng"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="pa-modal-body">
                    <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5, margin: 0 }}>
                      Bạn có chắc chắn muốn hủy bản nháp <strong>v{draftNo}</strong>?
                    </p>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginTop: 8, marginBottom: 0 }}>
                      Mọi điều chỉnh đơn giá và các khóa học mới thêm trong phiên bản nháp này sẽ bị xóa bỏ. Hệ thống sẽ quay về phiên bản chính thức <strong>v{currentNo}</strong> đang áp dụng.
                    </p>
                  </div>

                  <div className="pa-modal-footer">
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => setDiscardModalOpen(false)}
                      disabled={discardDraft.isPending}
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      className="pa-btn-danger-solid"
                      onClick={onConfirmDiscard}
                      disabled={discardDraft.isPending}
                    >
                      <Trash2 size={14} />
                      <span>{discardDraft.isPending ? 'Đang hủy…' : 'Xác nhận hủy bản nháp'}</span>
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </>
      )}
      <Footer />
    </>
  );
}

function PriceTable({
  courses,
  currentNo,
  draftNo,
  onDiscardDraft,
  onCreateDraft,
  isCreatingDraft,
}: {
  courses: AugmentedPlatformCourse[];
  currentNo: number | null;
  draftNo: number | null;
  onDiscardDraft: () => void;
  onCreateDraft: () => void;
  isCreatingDraft: boolean;
}) {
  useUiLanguage();
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const editable = canManage && draftNo !== null;

  const save = useUpdatePrices(draftNo ?? 0);
  const removeCourse = useRemoveCatalogCourse(draftNo ?? 0);

  // Filter toolbar state
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [salesFilter, setSalesFilter] = useState('ALL');

  // Add course modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPromptDraftOpen, setIsPromptDraftOpen] = useState(false);

  // Inline delete confirm state (courseId)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const initial = useMemo(
    () =>
      Object.fromEntries(
        courses.map((c) => [c.id, { price: c.draftPrice ?? c.price, sales: c.draftSalesStatus ?? c.salesStatus } satisfies Edit]),
      ),
    [courses],
  );
  const [edits, setEdits] = useState<Record<string, Edit>>(initial);
  const changed = courses.filter((c) => edits[c.id] && (edits[c.id]!.price !== initial[c.id]?.price || edits[c.id]!.sales !== initial[c.id]?.sales));
  const invalid = changed.some((c) => !Number.isFinite(edits[c.id]!.price) || edits[c.id]!.price < 0);

  // Unique domains list for dropdown filter
  const domainsList = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of courses) {
      map.set(c.domainName, (map.get(c.domainName) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [courses]);

  // Filter courses based on toolbar filters
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle) return false;
      }
      if (domainFilter !== 'ALL' && c.domainName !== domainFilter) {
        return false;
      }
      if (levelFilter !== 'ALL' && String(c.level) !== levelFilter) {
        return false;
      }
      if (salesFilter !== 'ALL') {
        const currentSales = edits[c.id]?.sales ?? c.draftSalesStatus ?? c.salesStatus;
        if (currentSales !== salesFilter) return false;
      }
      return true;
    });
  }, [courses, searchQuery, domainFilter, levelFilter, salesFilter, edits]);

  // Group filtered courses by domain
  const displayedGroups = useMemo(() => {
    const map = new Map<string, AugmentedPlatformCourse[]>();
    for (const c of filteredCourses) {
      const list = map.get(c.domainName) ?? [];
      list.push(c);
      map.set(c.domainName, list);
    }
    return Array.from(map.entries()).map(([name, list]) => ({
      name,
      courses: list,
    }));
  }, [filteredCourses]);

  const isFiltered = searchQuery.trim() !== '' || domainFilter !== 'ALL' || levelFilter !== 'ALL' || salesFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setDomainFilter('ALL');
    setLevelFilter('ALL');
    setSalesFilter('ALL');
  };

  const set = (id: string, patch: Partial<Edit>) => setEdits((all) => ({ ...all, [id]: { ...(all[id] ?? { price: 0, sales: 'OPEN' }), ...patch } }));

  const onSave = () =>
    save.mutate(
      changed.map((c) => ({ courseId: c.id, price: c.isFree ? 0 : edits[c.id]!.price, salesStatus: edits[c.id]!.sales })),
      {
        onSuccess: () => toast.success(`Đã lưu giá ${changed.length} khóa vào bản nháp v${draftNo}.`, { description: 'Doanh nghiệp vẫn thấy giá đang dùng cho tới khi công bố.' }),
        onError: (err) => toast.error(errorMessage(err)),
      },
    );

  const onOpenAddCourse = () => {
    if (draftNo === null) {
      setIsPromptDraftOpen(true);
    } else {
      setIsAddModalOpen(true);
    }
  };

  // Only a course added in this draft can be removed; a published course is paused from its "Mở bán" select.
  const onDeleteCourse = (course: AugmentedPlatformCourse) => {
    if (draftNo === null || !course.isNewInDraft) return;
    removeCourse.mutate(course.id, {
      onSuccess: () => {
        toast.success(`Đã xóa khóa học ${course.code} khỏi bản nháp v${draftNo}.`);
        setConfirmDeleteId(null);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  const totalColSpan = draftNo !== null && editable ? 7 : draftNo !== null ? 6 : 5;

  return (
    <Box>
      {/* Section Header */}
      <div className="pa-commerce-section-head">
        <div>
          <h2 className="pa-commerce-section-title">
            <Tag size={17} style={{ color: '#0f172a' }} aria-hidden="true" />
            <span>Bảng giá theo phiên bản</span>
          </h2>
          <p className="pa-commerce-section-desc">
            {draftNo !== null
              ? `Giá đang dùng thuộc v${currentNo}. Giá sửa ở đây lưu vào bản nháp v${draftNo} và áp dụng khi công bố.`
              : `Giá đang dùng thuộc phiên bản v${currentNo ?? 6}. Tạo bản nháp mới để điều chỉnh đơn giá niêm yết.`}
          </p>
        </div>

        {draftNo !== null && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Link
              className="btn btn-outline btn-small inline-flex items-center gap-1.5"
              to={`/platform/versions/${draftNo}`}
              title={`Xem chi tiết bản nháp v${draftNo}`}
            >
              <Edit3 size={13} aria-hidden="true" />
              <span>Mở bản nháp v{draftNo}</span>
            </Link>

            {canManage && (
              <button
                type="button"
                className="btn btn-outline btn-small inline-flex items-center gap-1.5"
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={onDiscardDraft}
                title={`Hủy bản nháp v${draftNo}`}
              >
                <Trash2 size={13} aria-hidden="true" />
                <span>Hủy bản nháp</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Redesigned Compact Filter & Action Toolbar */}
      <div className="pa-users-search-row" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Search input */}
        <div className="pa-tr-search-wrap" style={{ minWidth: 240, flex: '1 1 240px' }}>
          <Search size={15} className="pa-tr-search-icon" aria-hidden="true" />
          <input
            type="search"
            className="pa-tr-search-input"
            placeholder="Tìm theo mã hoặc tên khóa học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Tìm kiếm khóa học"
          />
          {searchQuery && (
            <button
              type="button"
              className="pa-tr-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Domain dropdown */}
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="pa-select-filter"
          aria-label="Lọc theo lĩnh vực"
        >
          <option value="ALL">Tất cả lĩnh vực ({courses.length})</option>
          {domainsList.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name} ({d.count})
            </option>
          ))}
        </select>

        {/* Level dropdown */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="pa-select-filter"
          aria-label="Lọc theo cấp độ"
        >
          <option value="ALL">Tất cả cấp độ</option>
          <option value="1">Cơ bản (Cấp 1 - Miễn phí)</option>
          <option value="2">Trung cấp (Cấp 2)</option>
          <option value="3">Nâng cao (Cấp 3)</option>
        </select>

        {/* Sales status dropdown */}
        <select
          value={salesFilter}
          onChange={(e) => setSalesFilter(e.target.value)}
          className="pa-select-filter"
          aria-label="Lọc theo trạng thái bán"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="OPEN">Đang mở bán</option>
          <option value="PAUSED">Tạm ngưng bán</option>
        </select>

        {/* Reset button if any filter active */}
        {isFiltered && (
          <button
            type="button"
            className="pa-btn-reset-filters"
            onClick={resetFilters}
            title="Khôi phục bộ lọc về mặc định"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>Đặt lại</span>
          </button>
        )}

        {/* Add Course button on the right */}
        {canManage && (
          <div style={{ marginLeft: 'auto' }}>
            <button
              type="button"
              className="btn btn-primary btn-small inline-flex items-center gap-1.5"
              onClick={onOpenAddCourse}
              title="Thêm khóa học mới vào danh mục đào tạo"
            >
              <Plus size={14} aria-hidden="true" />
              <span>Thêm khóa học</span>
            </button>
          </div>
        )}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="pa-org-empty-box">
          <Layers size={36} style={{ color: '#64748b', margin: '0 auto 8px' }} />
          <div className="pa-org-empty-title">Không tìm thấy khóa học nào phù hợp với bộ lọc</div>
          <p className="pa-org-empty-sub">Thử đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc để xem toàn bộ danh mục.</p>
          <button type="button" className="btn btn-outline btn-small" onClick={resetFilters} style={{ marginTop: 8 }}>
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="data-table pa-org-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ minWidth: 260 }}>Khóa học</th>
                <th style={{ width: 130, textAlign: 'center' }}>Cấp độ</th>
                <th style={{ width: 170, textAlign: 'right' }}>Giá v{currentNo ?? 6}</th>
                {draftNo !== null && (
                  <th style={{ width: 180, textAlign: 'left', color: '#c2410c' }}>
                    Giá v{draftNo} (nháp)
                  </th>
                )}
                <th style={{ width: 140, textAlign: 'center' }}>Mở bán</th>
                <th style={{ width: 140, textAlign: 'right' }}>Tổ chức đã mua</th>
                {draftNo !== null && editable && (
                  <th style={{ width: 90, textAlign: 'center' }}>Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayedGroups.map((group) => (
                <PriceGroup key={group.name} name={group.name} count={group.courses.length} colSpan={totalColSpan}>
                  {group.courses.map((c) => {
                    const edit = edits[c.id] ?? { price: c.price, sales: c.salesStatus };
                    const isChanged = changed.includes(c);
                    const draftDiffers = c.draftPrice !== null && (c.draftPrice !== c.price || c.draftSalesStatus !== c.salesStatus);
                    const levelStyle =
                      c.level === 1
                        ? { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' }
                        : c.level === 2
                          ? { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' }
                          : { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };

                    const isConfirmingDelete = confirmDeleteId === c.id;

                    return (
                      <tr key={c.id} style={{ background: isChanged ? '#fffbeb' : undefined }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <code
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: '#0f172a',
                                  background: '#f1f5f9',
                                  padding: '2px 7px',
                                  borderRadius: 6,
                                  border: '1px solid #e2e8f0',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {c.code}
                              </code>
                              {c.isNewInDraft && (
                                <span className="pa-badge-new">Mới</span>
                              )}
                              {currentNo !== null && c.versionNo !== currentNo && !c.isNewInDraft && (
                                <span
                                  className="pa-cell-sub"
                                  style={{ fontSize: 12, whiteSpace: 'nowrap' }}
                                  title="Khóa của phiên bản cũ: không còn bán mới, doanh nghiệp đã mua vẫn học bình thường"
                                >
                                  Bản v{c.versionNo}
                                </span>
                              )}
                            </div>
                            <div>
                              <strong style={{ fontSize: 13, color: '#0f172a', display: 'block', lineHeight: 1.35 }}>
                                {translateUi(c.title)}
                              </strong>
                              <span style={{ fontSize: 12, color: '#64748b' }}>{translateUi(c.domainName)}</span>
                            </div>
                          </div>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <span
                            className="pa-org-level-pill"
                            style={{
                              background: levelStyle.bg,
                              color: levelStyle.color,
                              borderColor: levelStyle.border,
                              fontWeight: 700,
                            }}
                          >
                            {translateUi(LEVEL_NAMES[c.level]) ?? c.levelName}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {c.isFree ? (
                            <span style={{ color: '#166534', fontWeight: 600, fontSize: 13 }}>Miễn phí</span>
                          ) : (
                            <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                              {formatMoney(c.price)}
                            </span>
                          )}
                        </td>

                        {draftNo !== null && (
                          <td>
                            {c.isFree ? (
                              <span style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>Luôn miễn phí</span>
                            ) : editable ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <input
                                  type="number"
                                  min={0}
                                  step={1000}
                                  value={Number.isFinite(edit.price) ? edit.price : ''}
                                  onChange={(e) => set(c.id, { price: e.target.value === '' ? Number.NaN : Number(e.target.value) })}
                                  aria-label={translateUi(`Giá bản nháp của ${c.code}`)}
                                  style={{
                                    width: 120,
                                    height: 32,
                                    padding: '0 8px',
                                    borderRadius: 6,
                                    border: '1px solid #cbd5e1',
                                    fontSize: 13,
                                    fontWeight: 600,
                                  }}
                                />
                                <span style={{ fontSize: 13, color: '#64748b' }}>₫</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{formatMoney(c.draftPrice ?? c.price)}</span>
                            )}
                            {draftDiffers && !isChanged && (
                              <small style={{ display: 'block', fontSize: 12, color: '#c2410c', marginTop: 2 }}>
                                Khác giá đang áp dụng
                              </small>
                            )}
                          </td>
                        )}

                        <td style={{ textAlign: 'center' }}>
                          {c.isFree ? (
                            // Basic courses are free for every organization: there is nothing to put on or off sale.
                            <span style={{ fontSize: 12, color: '#64748b' }}>Miễn phí cho mọi doanh nghiệp</span>
                          ) : editable ? (
                            <select
                              value={edit.sales}
                              onChange={(e) => set(c.id, { sales: e.target.value as SalesStatus })}
                              aria-label={translateUi(`Trạng thái bán của ${c.code}`)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              <option value="OPEN">Đang mở bán</option>
                              <option value="PAUSED">Tạm ngưng bán</option>
                            </select>
                          ) : (
                            <Pill tone={SALES_STATUS[c.salesStatus]?.tone}>{translateUi(SALES_STATUS[c.salesStatus]?.label)}</Pill>
                          )}
                        </td>

                        <td style={{ textAlign: 'right', fontSize: 12, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                          {c.isFree ? (
                            <span style={{ color: '#64748b' }}>Miễn phí</span>
                          ) : (
                            <span>{c.purchaseCount} tổ chức</span>
                          )}
                        </td>

                        {draftNo !== null && editable && (
                          <td style={{ textAlign: 'center' }}>
                            {!c.isNewInDraft ? null : isConfirmingDelete ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <button
                                  type="button"
                                  className="btn btn-small"
                                  style={{
                                    height: 26,
                                    padding: '0 8px',
                                    fontSize: 12,
                                    background: '#ef4444',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: 4,
                                    fontWeight: 600,
                                  }}
                                  onClick={() => onDeleteCourse(c)}
                                  disabled={removeCourse.isPending}
                                  title="Xác nhận xóa khóa học khỏi bản nháp"
                                >
                                  Xóa
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-small"
                                  style={{ height: 26, padding: '0 6px', fontSize: 12 }}
                                  onClick={() => setConfirmDeleteId(null)}
                                  title="Giữ lại"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-ghost btn-small"
                                style={{
                                  height: 28,
                                  width: 28,
                                  padding: 0,
                                  borderRadius: 6,
                                  color: '#ef4444',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                onClick={() => setConfirmDeleteId(c.id)}
                                title={`Xóa khóa ${c.code} khỏi bản nháp`}
                                aria-label={`Xóa khóa ${c.code} khỏi bản nháp`}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </PriceGroup>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editable && (
        <div
          style={{
            marginTop: 18,
            padding: '14px 18px',
            borderRadius: 12,
            background: changed.length ? '#fffbeb' : '#f8fafc',
            border: changed.length ? '1px solid #fde68a' : '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} style={{ color: changed.length ? '#d97706' : '#64748b' }} />
            <span style={{ fontSize: 13, color: '#334155' }}>
              {changed.length ? (
                <strong>{changed.length} khóa học có giá mới chưa lưu vào bản nháp.</strong>
              ) : (
                'Chưa có thay đổi đơn giá nào.'
              )}{' '}
              Tạm ngưng bán chỉ chặn lượt mua mới, doanh nghiệp đã mua vẫn học bình thường.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-ghost btn-small inline-flex items-center gap-1.5"
              onClick={() => setEdits(initial)}
              disabled={!changed.length || save.isPending}
            >
              <RotateCcw size={14} />
              <span>Bỏ thay đổi</span>
            </button>
            <button
              type="button"
              className="btn btn-primary inline-flex items-center gap-1.5"
              onClick={onSave}
              disabled={!changed.length || invalid || save.isPending}
            >
              <Save size={15} />
              <span>{save.isPending ? 'Đang lưu…' : `Lưu vào bản nháp v${draftNo}`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {isAddModalOpen && draftNo !== null && (
        <AddCourseModal
          versionNo={draftNo}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Prompt Create Draft Modal when adding course without draft */}
      {isPromptDraftOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="pulse-ui pa-modal-overlay" onClick={() => setIsPromptDraftOpen(false)}>
            <div
              className="pa-modal-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="prompt-draft-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pa-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#fef3c7',
                      color: '#b45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={18} />
                  </div>
                  <h2 id="prompt-draft-title" className="pa-modal-title">
                    Tạo bản nháp để thêm khóa học
                  </h2>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={() => setIsPromptDraftOpen(false)}
                  aria-label="Đóng"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="pa-modal-body">
                <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5, margin: 0 }}>
                  Các khóa học mới và điều chỉnh đơn giá được thực hiện trên một phiên bản nháp trước khi công bố chính thức.
                </p>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginTop: 8, marginBottom: 0 }}>
                  Bạn có muốn tạo bản nháp mới ngay bây giờ không?
                </p>
              </div>

              <div className="pa-modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={() => setIsPromptDraftOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-small inline-flex items-center gap-1.5"
                  onClick={() => {
                    setIsPromptDraftOpen(false);
                    onCreateDraft();
                  }}
                  disabled={isCreatingDraft}
                >
                  <Sparkles size={14} />
                  <span>{isCreatingDraft ? 'Đang tạo…' : 'Tạo bản nháp và tiếp tục'}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {draftNo !== null && !canManage && (
        <p style={{ marginTop: 12, fontSize: 12, color: '#64748b', textAlign: 'center' }}>
          Tài khoản hiện tại chỉ có quyền xem biểu giá khóa học.
        </p>
      )}
    </Box>
  );
}

function AddCourseModal({
  versionNo,
  onClose,
}: {
  versionNo: number;
  onClose: () => void;
}) {
  useUiLanguage();
  const frameworks = useFrameworks();
  const create = useCreateCatalogCourse(versionNo);
  const updatePrices = useUpdatePrices(versionNo);

  const [form, setForm] = useState({
    frameworkId: '',
    domainId: '',
    level: 1,
    code: '',
    title: '',
    price: 0,
  });

  const frameworkId = form.frameworkId || frameworks.data?.items[0]?.id || '';
  const framework = useFramework(frameworkId || undefined);

  const codeValid = CODE_PATTERN.test(form.code.trim().toUpperCase());
  const valid = codeValid && form.title.trim().length >= 3 && Boolean(form.domainId);

  const handleLevelChange = (newLevel: number) => {
    setForm((f) => ({
      ...f,
      level: newLevel,
      price: newLevel === 1 ? 0 : f.price > 0 ? f.price : 500000 * newLevel,
    }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;

    create.mutate(
      {
        code: form.code.trim().toUpperCase(),
        title: form.title.trim(),
        domainId: form.domainId,
        level: form.level,
      },
      {
        onSuccess: (course) => {
          if (form.level > 1 && form.price > 0) {
            updatePrices.mutate(
              [{ courseId: course.courseId, price: form.price, salesStatus: 'OPEN' }],
              {
                onSuccess: () => {
                  toast.success(`Đã thêm khóa học ${course.code} vào bản nháp v${versionNo}.`);
                  onClose();
                },
              },
            );
          } else {
            toast.success(`Đã thêm khóa học ${course.code} vào bản nháp v${versionNo}.`);
            onClose();
          }
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="pulse-ui pa-modal-overlay" onClick={onClose}>
      <div
        className="pa-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-course-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 540 }}
      >
        <div className="pa-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={18} />
            </div>
            <h2 id="add-course-title" className="pa-modal-title">
              Thêm khóa học mới vào bản nháp v{versionNo}
            </h2>
          </div>
          <button type="button" className="btn btn-ghost btn-small" onClick={onClose} aria-label="Đóng">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', overflow: 'hidden', minHeight: 0 }}>
          <div className="pa-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                Khung chuẩn
                <select
                  value={frameworkId}
                  onChange={(e) => setForm({ ...form, frameworkId: e.target.value, domainId: '' })}
                  className="pa-select-filter"
                  style={{ width: '100%' }}
                >
                  {(frameworks.data?.items ?? []).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                Lĩnh vực *
                <select
                  value={form.domainId}
                  onChange={(e) => setForm({ ...form, domainId: e.target.value })}
                  className="pa-select-filter"
                  style={{ width: '100%' }}
                  required
                >
                  <option value="" disabled>
                    {framework.isLoading ? 'Đang tải…' : 'Chọn lĩnh vực'}
                  </option>
                  {(framework.data?.domains ?? []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                Cấp độ đào tạo *
                <select
                  value={form.level}
                  onChange={(e) => handleLevelChange(Number(e.target.value))}
                  className="pa-select-filter"
                  style={{ width: '100%' }}
                >
                  {[1, 2, 3].map((l) => (
                    <option key={l} value={l}>
                      {LEVEL_NAMES[l]} {l === 1 ? '(Miễn phí 100%)' : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                Mã khóa học *
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  maxLength={30}
                  placeholder="VD: D7-B"
                  required
                  style={{
                    height: 36,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                />
              </label>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>
              Tên khóa học *
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={250}
                placeholder="VD: Khai phá dữ liệu kinh doanh với Power BI"
                required
                style={{
                  height: 36,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>
              Giá khóa cho cả doanh nghiệp (₫)
              {form.level === 1 ? (
                <div
                  style={{
                    height: 36,
                    padding: '0 12px',
                    borderRadius: 8,
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Miễn phí 100% theo chuẩn quy định
                </div>
              ) : (
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={form.price || ''}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="VD: 1000000"
                  style={{
                    height: 36,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                />
              )}
            </label>
          </div>

          <div className="pa-modal-footer">
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={onClose}
              disabled={create.isPending || updatePrices.isPending}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-small inline-flex items-center gap-1.5"
              disabled={!valid || create.isPending || updatePrices.isPending}
            >
              <Plus size={14} />
              <span>{create.isPending ? 'Đang thêm…' : 'Thêm vào bản nháp'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function PriceGroup({
  name,
  colSpan,
  count,
  children,
}: {
  name: string;
  colSpan: number;
  count: number;
  children: ReactNode;
}) {
  useUiLanguage();
  return (
    <>
      <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <td colSpan={colSpan} style={{ padding: '8px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0284c7' }} />
              <strong style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{name}</strong>
            </div>
            <span
              style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#e2e8f0',
                color: '#475569',
                fontWeight: 600,
              }}
            >
              {count} khóa học
            </span>
          </div>
        </td>
      </tr>
      {children}
    </>
  );
}
