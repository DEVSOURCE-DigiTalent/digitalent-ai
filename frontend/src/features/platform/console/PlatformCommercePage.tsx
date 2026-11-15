import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlatformCommerce } from '@/hooks/use-platform-admin';
import { useCatalogVersions, useCreateDraft, useUpdatePrices } from '@/hooks/use-platform-catalog';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import type { PlatformCourse, SalesStatus } from '@/services/platform-admin.service';
import { Box, Footer, LoadError, Loading, Pager, Pill } from '../components/pulse-ui';
import { LEVEL_NAMES, SALES_STATUS, errorMessage, formatDateTime, formatMoney, formatNumber } from '../components/pulse-format';
import {
  ReceiptText,
  Building2,
  ShieldCheck,
  Sparkles,
  Save,
  RotateCcw,
  Edit3,
  History,
  FileSpreadsheet,
  TrendingUp,
  Search,
  Tag,
  Info,
  X,
  Layers,
} from 'lucide-react';

type Edit = { price: number; sales: SalesStatus };
type CommerceTab = 'PRICING' | 'ORDERS' | 'ALL';

/**
 * PA-09 · Đơn giá & Doanh thu suất học B2B
 * Quản trị biểu giá niêm yết theo phiên bản và sổ cái giao dịch mua/cấp bù suất học.
 */
export function PlatformCommercePage() {
  useUiLanguage();
  const [params, setParams] = useSearchParams();
  const activeTab = (params.get('tab') as CommerceTab) || 'PRICING';
  const [kind, setKind] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');

  const { data, isLoading, error } = usePlatformCommerce({ kind, pageIndex, pageSize: 20 });
  const versions = useCatalogVersions();
  const currentNo = versions.data?.currentVersionNo ?? null;
  const draftNo = versions.data?.draftVersionNo ?? null;

  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const createDraft = useCreateDraft();

  const onCreateDraft = () =>
    createDraft.mutate(undefined, {
      onSuccess: (draft) => toast.success(`Đã tạo bản nháp v${draft.version.versionNo}. Quản trị viên hiện có thể điều chỉnh đơn giá.`),
      onError: (err) => toast.error(errorMessage(err)),
    });

  const chooseTab = (tab: CommerceTab) => {
    setParams(tab !== 'PRICING' ? { tab } : {}, { replace: true });
  };

  // Metrics calculations
  const totalRevenue = data?.revenue ?? 0;
  const seatsPurchased = data?.seatsPurchased ?? 0;
  const avgPricePerSeat = seatsPurchased > 0 ? Math.round(totalRevenue / seatsPurchased) : 0;
  const seatsGranted = data?.seatsGranted ?? 0;

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
          <h1 className="pa-org-title" aria-label="Đơn giá và Doanh thu suất học">
            Đơn giá & Doanh thu suất học
          </h1>
          <p className="pa-org-subtitle">
            Quản trị biểu giá niêm yết theo phiên bản khóa học, theo dõi doanh thu và lịch sử cấp phát suất học doanh nghiệp.
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
            <Link
              className="btn btn-primary btn-small inline-flex items-center gap-1.5"
              to={`/platform/versions/${draftNo}`}
              title={`Mở bản nháp v${draftNo} để chỉnh sửa và công bố`}
            >
              <Edit3 size={14} aria-hidden="true" />
              <span>Mở bản nháp v{draftNo}</span>
            </Link>
          )}

          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            title="Xuất bảng tính biểu giá và doanh thu suất học"
            onClick={() => window.print()}
          >
            <FileSpreadsheet size={14} aria-hidden="true" />
            <span>Xuất dữ liệu</span>
          </button>
        </div>
      </header>

      {(isLoading || versions.isLoading) && <Loading />}
      {error && <LoadError error={error} />}

      {data && versions.data && (
        <>
          {/* Executive 4 Financial KPI Cards */}
          <div className="pa-org-kpi-grid" role="region" aria-label="Thống kê doanh thu và quy mô suất học">
            {/* Card 1: Doanh thu suất học */}
            <div className="pa-org-stat-card">
              <div className="pa-org-kpi-head">
                <span className="pa-org-kpi-label">Doanh thu suất học</span>
                <div className="pa-kpi-icon-wrap emerald" aria-hidden="true">
                  <ReceiptText size={14} />
                </div>
              </div>
              <div className="pa-org-kpi-val-row">
                <span className="pa-org-kpi-val" style={{ color: '#15803d', whiteSpace: 'nowrap', fontSize: 20 }}>
                  {formatMoney(totalRevenue)}
                </span>
                <span className="pa-org-kpi-sub">Lũy kế có phí</span>
              </div>
            </div>

            {/* Card 2: Suất doanh nghiệp mua */}
            <div className="pa-org-stat-card">
              <div className="pa-org-kpi-head">
                <span className="pa-org-kpi-label">Suất doanh nghiệp mua</span>
                <div className="pa-kpi-icon-wrap sky" aria-hidden="true">
                  <Building2 size={14} />
                </div>
              </div>
              <div className="pa-org-kpi-val-row">
                <span className="pa-org-kpi-val" style={{ color: '#0284c7' }}>
                  {formatNumber(seatsPurchased)}
                </span>
                <span className="pa-org-kpi-sub">Đã kích hoạt đào tạo</span>
              </div>
            </div>

            {/* Card 3: Đơn giá trung bình / suất */}
            <div className="pa-org-stat-card">
              <div className="pa-org-kpi-head">
                <span className="pa-org-kpi-label">Giá trung bình / suất</span>
                <div className="pa-kpi-icon-wrap emerald" aria-hidden="true">
                  <TrendingUp size={14} />
                </div>
              </div>
              <div className="pa-org-kpi-val-row">
                <span className="pa-org-kpi-val" style={{ color: '#0f172a', whiteSpace: 'nowrap', fontSize: 20 }}>
                  {formatMoney(avgPricePerSeat)}
                </span>
                <span className="pa-org-kpi-sub">Trên {formatNumber(seatsPurchased)} suất</span>
              </div>
            </div>

            {/* Card 4: Suất quản trị cấp hỗ trợ */}
            <div className="pa-org-stat-card">
              <div className="pa-org-kpi-head">
                <span className="pa-org-kpi-label">Suất cấp hỗ trợ</span>
                <div className="pa-kpi-icon-wrap amber" aria-hidden="true">
                  <ShieldCheck size={14} />
                </div>
              </div>
              <div className="pa-org-kpi-val-row">
                <span className="pa-org-kpi-val" style={{ color: '#d97706' }}>
                  {formatNumber(seatsGranted)}
                </span>
                <span className="pa-org-kpi-sub">Cấp bù kỹ thuật</span>
              </div>
            </div>
          </div>

          {/* Workstream Tabs Switcher */}
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
                <span>Biểu giá khóa học</span>
                <span className="pa-org-tab-count">{data.courses.length}</span>
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
                <span>Lịch sử đơn hàng & Cấp phát</span>
                <span className="pa-org-tab-count">{data.orders.totalItems}</span>
              </button>

              <button
                type="button"
                role="tab"
                className="pa-org-tab-btn"
                aria-selected={activeTab === 'ALL'}
                aria-pressed={activeTab === 'ALL'}
                onClick={() => chooseTab('ALL')}
              >
                <Layers size={14} aria-hidden="true" />
                <span>Toàn bộ phân khu</span>
              </button>
            </div>
          </div>

          {/* Workstream Section 1: Biểu giá khóa học */}
          {(activeTab === 'PRICING' || activeTab === 'ALL') && (
            <div style={{ marginBottom: activeTab === 'ALL' ? 24 : 0 }}>
              <PriceTable
                key={`${draftNo}-${data.courses.map((c) => `${c.draftPricePerSeat}${c.draftSalesStatus}`).join()}`}
                courses={data.courses}
                currentNo={currentNo}
                draftNo={draftNo}
                domainFilter={domainFilter}
                onSelectDomain={setDomainFilter}
              />
            </div>
          )}

          {/* Workstream Section 2: Lịch sử đơn hàng & Cấp phát */}
          {(activeTab === 'ORDERS' || activeTab === 'ALL') && (
            <Box>
              <div className="pa-commerce-section-head">
                <div>
                  <h2 className="pa-commerce-section-title">
                    <History size={17} style={{ color: '#0f172a' }} aria-hidden="true" />
                    <span>Lịch sử đơn hàng & Cấp phát suất học</span>
                  </h2>
                  <p className="pa-commerce-section-desc">
                    Nhật ký giao dịch mua suất từ doanh nghiệp và các lượt cấp bù hỗ trợ từ quản trị viên.
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
                    placeholder="Tìm theo tên doanh nghiệp, khóa học, mã hợp đồng..."
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

                <select
                  value={kind}
                  onChange={(e) => {
                    setKind(e.target.value);
                    setPageIndex(1);
                  }}
                  aria-label="Phân loại đơn hàng"
                  style={{
                    height: 36,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#334155',
                    flexShrink: 0,
                  }}
                >
                  <option value="">Tất cả loại đơn</option>
                  <option value="PURCHASE">Doanh nghiệp mua</option>
                  <option value="ADMIN_GRANT">Quản trị viên cấp</option>
                </select>

                {(orderSearch || kind) && (
                  <button
                    type="button"
                    className="pa-btn-reset-filters"
                    onClick={() => {
                      setOrderSearch('');
                      setKind('');
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
                  <ReceiptText size={36} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
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
                          <th style={{ minWidth: 260 }}>Khóa học & Doanh nghiệp</th>
                          <th style={{ width: 160 }}>Loại đơn</th>
                          <th style={{ width: 110, textAlign: 'right' }}>Số suất</th>
                          <th style={{ width: 140, textAlign: 'right' }}>Tổng tiền</th>
                          <th style={{ minWidth: 260 }}>Người thực hiện & Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((o) => {
                          const isPurchase = o.kind === 'PURCHASE';
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
                                      color: '#0284c7',
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
                              <td>
                                <span
                                  className="pa-org-level-pill"
                                  style={{
                                    background: isPurchase ? '#ecfdf5' : '#eff6ff',
                                    color: isPurchase ? '#059669' : '#1d4ed8',
                                    borderColor: isPurchase ? '#a7f3d0' : '#bfdbfe',
                                    fontWeight: 700,
                                  }}
                                >
                                  {isPurchase ? 'Doanh nghiệp mua' : 'Quản trị cấp'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                                  {o.seats}
                                </span>
                                <span style={{ fontSize: 11.5, color: '#64748b', marginLeft: 4 }}>suất</span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <strong
                                  style={{
                                    fontSize: 13,
                                    color: isPurchase ? '#15803d' : '#64748b',
                                    fontVariantNumeric: 'tabular-nums',
                                  }}
                                >
                                  {o.totalAmount > 0 ? formatMoney(o.totalAmount) : 'Miễn phí'}
                                </strong>
                              </td>
                              <td>
                                <div style={{ fontSize: 12, color: '#334155' }}>
                                  {o.createdByEmail && <div style={{ fontWeight: 500 }}>{o.createdByEmail}</div>}
                                  {o.reason && (
                                    <div
                                      style={{
                                        fontSize: 11.5,
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
  domainFilter,
  onSelectDomain,
}: {
  courses: PlatformCourse[];
  currentNo: number | null;
  draftNo: number | null;
  domainFilter: string;
  onSelectDomain: (domain: string) => void;
}) {
  useUiLanguage();
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const editable = canManage && draftNo !== null;
  const save = useUpdatePrices(draftNo ?? 0);

  const initial = useMemo(
    () =>
      Object.fromEntries(
        courses.map((c) => [c.id, { price: c.draftPricePerSeat ?? c.pricePerSeat, sales: c.draftSalesStatus ?? c.salesStatus } satisfies Edit]),
      ),
    [courses],
  );
  const [edits, setEdits] = useState<Record<string, Edit>>(initial);
  const changed = courses.filter((c) => edits[c.id]!.price !== initial[c.id]!.price || edits[c.id]!.sales !== initial[c.id]!.sales);
  const invalid = changed.some((c) => !Number.isFinite(edits[c.id]!.price) || edits[c.id]!.price < 0);

  // Group courses by domain
  const allGroups = useMemo(() => {
    const map = new Map<string, PlatformCourse[]>();
    for (const c of courses) {
      const list = map.get(c.domainName) ?? [];
      list.push(c);
      map.set(c.domainName, list);
    }
    return Array.from(map.entries()).map(([name, list]) => ({
      name,
      courses: list,
    }));
  }, [courses]);

  // Filter groups by selected domain chip
  const displayedGroups = useMemo(() => {
    if (domainFilter === 'ALL') return allGroups;
    return allGroups.filter((g) => g.name === domainFilter);
  }, [allGroups, domainFilter]);

  const set = (id: string, patch: Partial<Edit>) => setEdits((all) => ({ ...all, [id]: { ...all[id]!, ...patch } }));

  const onSave = () =>
    save.mutate(
      changed.map((c) => ({ courseId: c.id, pricePerSeat: c.isFree ? 0 : edits[c.id]!.price, salesStatus: edits[c.id]!.sales })),
      {
        onSuccess: () => toast.success(`Đã lưu giá ${changed.length} khóa vào bản nháp v${draftNo}.`, { description: 'Doanh nghiệp vẫn thấy giá đang dùng cho tới khi công bố.' }),
        onError: (err) => toast.error(errorMessage(err)),
      },
    );

  return (
    <Box>
      {/* Policy Notice Banner */}
      <div className="pa-commerce-policy-banner" role="status">
        <Info size={17} className="pa-commerce-policy-icon" aria-hidden="true" />
        <div>
          <strong>Chính sách chuẩn mực đào tạo:</strong> Khóa học cấp độ Cơ bản luôn miễn phí 100% theo quy định tại Thông tư 02/2025.
          Đơn giá hiện tại đang neo theo phiên bản chính thức <strong>⚓ v{currentNo ?? 6}</strong>. Mọi điều chỉnh chỉ áp dụng cho người dùng khi phiên bản mới được công bố.
        </div>
      </div>

      <div className="pa-commerce-section-head">
        <div>
          <h2 className="pa-commerce-section-title">
            <Tag size={17} style={{ color: '#0f172a' }} aria-hidden="true" />
            <span>Biểu giá khóa học theo phiên bản</span>
          </h2>
          <p className="pa-commerce-section-desc">
            {draftNo !== null
              ? `Đang áp dụng phiên bản neo v${currentNo}. Mọi thay đổi trong bản nháp v${draftNo} sẽ có hiệu lực ngay khi công bố.`
              : `Giá đang dùng thuộc phiên bản v${currentNo ?? 6}. Tạo bản nháp mới để điều chỉnh đơn giá niêm yết.`}
          </p>
        </div>

        {draftNo !== null && (
          <Link
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            to={`/platform/versions/${draftNo}`}
            title={`Xem chi tiết bản nháp v${draftNo}`}
          >
            <Edit3 size={13} aria-hidden="true" />
            <span>Mở bản nháp v{draftNo}</span>
          </Link>
        )}
      </div>

      {/* Domain Quick Filter Chips */}
      <div className="pa-domain-chips-track" role="group" aria-label="Lọc biểu giá theo lĩnh vực">
        <button
          type="button"
          className="pa-domain-chip-btn"
          aria-pressed={domainFilter === 'ALL'}
          onClick={() => onSelectDomain('ALL')}
        >
          <span>Tất cả lĩnh vực</span>
          <span className="pa-domain-chip-count">{courses.length}</span>
        </button>

        {allGroups.map((g) => {
          const isSelected = domainFilter === g.name;
          return (
            <button
              key={g.name}
              type="button"
              className="pa-domain-chip-btn"
              aria-pressed={isSelected}
              onClick={() => onSelectDomain(g.name)}
            >
              <span>{g.name}</span>
              <span className="pa-domain-chip-count">{g.courses.length}</span>
            </button>
          );
        })}
      </div>

      <div className="table-scroll">
        <table className="data-table pa-org-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ minWidth: 260 }}>Khóa học & Lĩnh vực</th>
              <th style={{ width: 130, textAlign: 'center' }}>Cấp độ</th>
              <th style={{ width: 170, textAlign: 'right' }}>Giá đang dùng (v{currentNo ?? 6})</th>
              {draftNo !== null && (
                <th style={{ width: 180, textAlign: 'left', color: '#c2410c' }}>
                  Giá bản nháp v{draftNo}
                </th>
              )}
              <th style={{ width: 140, textAlign: 'center' }}>Trạng thái bán</th>
              <th style={{ width: 150, textAlign: 'right' }}>Suất đã cấp</th>
            </tr>
          </thead>
          <tbody>
            {displayedGroups.map((group) => (
              <PriceGroup key={group.name} name={group.name} count={group.courses.length} colSpan={draftNo !== null ? 6 : 5}>
                {group.courses.map((c) => {
                  const edit = edits[c.id]!;
                  const isChanged = changed.includes(c);
                  const draftDiffers = c.draftPricePerSeat !== null && (c.draftPricePerSeat !== c.pricePerSeat || c.draftSalesStatus !== c.salesStatus);
                  const levelStyle =
                    c.level === 1
                      ? { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' }
                      : c.level === 2
                        ? { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' }
                        : { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };

                  return (
                    <tr key={c.id} style={{ background: isChanged ? '#fffbeb' : undefined }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <code
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#0f172a',
                              background: '#f1f5f9',
                              padding: '2px 7px',
                              borderRadius: 6,
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {c.code}
                          </code>
                          <div>
                            <strong style={{ fontSize: 13, color: '#0f172a', display: 'block', lineHeight: 1.35 }}>
                              {translateUi(c.title)}
                            </strong>
                            <span style={{ fontSize: 11.5, color: '#64748b' }}>{translateUi(c.domainName)}</span>
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
                            {formatMoney(c.pricePerSeat)}
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
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{formatMoney(c.draftPricePerSeat ?? c.pricePerSeat)}</span>
                          )}
                          {draftDiffers && !isChanged && (
                            <small style={{ display: 'block', fontSize: 11, color: '#c2410c', marginTop: 2 }}>
                              Khác giá đang áp dụng
                            </small>
                          )}
                        </td>
                      )}

                      <td style={{ textAlign: 'center' }}>
                        {editable ? (
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
                          <span style={{ color: '#94a3b8' }}>Miễn phí</span>
                        ) : (
                          <span>{c.seatsPurchased} mua · {c.seatsGranted} cấp</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </PriceGroup>
            ))}
          </tbody>
        </table>
      </div>

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
              Tạm ngưng bán chỉ chặn lượt mua mới, suất cũ đã mua vẫn học bình thường.
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
              <span>Hủy thay đổi</span>
            </button>
            <button
              type="button"
              className="btn btn-primary inline-flex items-center gap-1.5"
              onClick={onSave}
              disabled={!changed.length || invalid || save.isPending}
            >
              <Save size={15} />
              <span>{save.isPending ? 'Đang lưu…' : `Lưu giá vào bản nháp v${draftNo}`}</span>
            </button>
          </div>
        </div>
      )}

      {draftNo !== null && !canManage && (
        <p style={{ marginTop: 12, fontSize: 12, color: '#64748b', textAlign: 'center' }}>
          Tài khoản hiện tại chỉ có quyền xem biểu giá khóa học.
        </p>
      )}
    </Box>
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
                fontSize: 11.5,
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
