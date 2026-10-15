import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlatformCommerce } from '@/hooks/use-platform-admin';
import { useCatalogVersions, useCreateDraft, useUpdatePrices } from '@/hooks/use-platform-catalog';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import type { PlatformCourse, SalesStatus } from '@/services/platform-admin.service';
import { Box, Footer, Kpi, ListItem, LoadError, Loading, PageHead, Pager, Pill } from '../components/pulse-ui';
import { LEVEL_NAMES, ORDER_KIND, SALES_STATUS, errorMessage, formatDateTime, formatMoney, formatNumber } from '../components/pulse-format';

type Edit = { price: number; sales: SalesStatus };

/**
 * PA-09 · Đơn giá: per-seat price of every published course — the price in use (catalog version with the anchor) next
 * to the price in the draft, edited here and applied when the draft is published — and the order history.
 */
export function PlatformCommercePage() {
  const [kind, setKind] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const { data, isLoading, error } = usePlatformCommerce({ kind, pageIndex, pageSize: 20 });
  const versions = useCatalogVersions();
  const currentNo = versions.data?.currentVersionNo ?? null;
  const draftNo = versions.data?.draftVersionNo ?? null;

  return (
    <>
      <PageHead
        eyebrow="Nền tảng / Đơn giá"
        title="Giá mỗi suất theo khóa học."
        description="Khóa Cơ bản luôn miễn phí. Một suất dành cho một nhân viên trong một khóa. Đổi giá trong bản nháp phiên bản khóa học; giá mới áp dụng khi bản nháp được công bố."
      />
      {(isLoading || versions.isLoading) && <Loading />}
      {error && <LoadError error={error} />}
      {data && versions.data && (
        <>
          <div className="grid-3 pa-gap-bottom">
            <Kpi label="Doanh thu suất khóa" value={formatMoney(data.revenue)} small />
            <Kpi label="Suất doanh nghiệp đã mua" value={formatNumber(data.seatsPurchased)} />
            <Kpi label="Suất quản trị cấp hỗ trợ" value={formatNumber(data.seatsGranted)} />
          </div>
          <PriceTable key={`${draftNo}-${data.courses.map((c) => `${c.draftPricePerSeat}${c.draftSalesStatus}`).join()}`} courses={data.courses} currentNo={currentNo} draftNo={draftNo} />
          <Box className="pa-gap-top">
            <span className="mini-label">Đơn hàng và cấp suất</span>
            <div className="pa-filters pa-gap-top">
              <select
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value);
                  setPageIndex(1);
                }}
                aria-label="Loại đơn"
              >
                <option value="">Mọi loại</option>
                <option value="PURCHASE">Doanh nghiệp mua</option>
                <option value="ADMIN_GRANT">Quản trị cấp</option>
              </select>
            </div>
            {data.orders.items.length === 0 ? (
              <p className="pa-empty">Khóa đã mua hoặc suất do quản trị viên cấp sẽ hiển thị ở đây.</p>
            ) : (
              <>
                {data.orders.items.map((o) => (
                  <ListItem
                    key={o.id}
                    title={
                      <>
                        {o.courseTitle} · <Link to={`/platform/organizations/${o.organizationId}`}>{o.organizationName}</Link>
                      </>
                    }
                    detail={[ORDER_KIND[o.kind]?.label, formatDateTime(o.createdAt), o.reason, o.totalAmount > 0 ? formatMoney(o.totalAmount) : null, o.createdByEmail]
                      .filter(Boolean)
                      .join(' · ')}
                    aside={<Pill tone={ORDER_KIND[o.kind]?.tone}>{o.seats} suất</Pill>}
                  />
                ))}
                <Pager pageIndex={data.orders.pageIndex} totalPages={data.orders.totalPages} totalItems={data.orders.totalItems} onChange={setPageIndex} />
              </>
            )}
          </Box>
        </>
      )}
      <Footer />
    </>
  );
}

function PriceTable({ courses, currentNo, draftNo }: { courses: PlatformCourse[]; currentNo: number | null; draftNo: number | null }) {
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const editable = canManage && draftNo !== null;
  const save = useUpdatePrices(draftNo ?? 0);
  const createDraft = useCreateDraft();

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
  const groups = [...new Set(courses.map((c) => c.frameworkId))].map((id) => ({
    id,
    name: courses.find((c) => c.frameworkId === id)!.frameworkName,
    courses: courses.filter((c) => c.frameworkId === id),
  }));

  const set = (id: string, patch: Partial<Edit>) => setEdits((all) => ({ ...all, [id]: { ...all[id]!, ...patch } }));

  const onSave = () =>
    save.mutate(
      changed.map((c) => ({ courseId: c.id, pricePerSeat: c.isFree ? 0 : edits[c.id]!.price, salesStatus: edits[c.id]!.sales })),
      {
        onSuccess: () => toast.success(`Đã lưu giá ${changed.length} khóa vào bản nháp v${draftNo}.`, { description: 'Doanh nghiệp vẫn thấy giá đang dùng cho tới khi công bố.' }),
        onError: (err) => toast.error(errorMessage(err)),
      },
    );

  const onCreateDraft = () =>
    createDraft.mutate(undefined, {
      onSuccess: (draft) => toast.success(`Đã tạo bản nháp v${draft.version.versionNo}. Giờ có thể đổi giá.`),
      onError: (err) => toast.error(errorMessage(err)),
    });

  return (
    <Box>
      <div className="pa-card-head">
        <div>
          <h2 className="panel-title">Bảng giá</h2>
          <p className="panel-desc">
            {draftNo !== null
              ? `Giá đang dùng thuộc ⚓ v${currentNo}. Giá trong bản nháp v${draftNo} áp dụng khi công bố v${draftNo}. Khóa mới trong bản nháp đặt giá ở trang soạn khóa.`
              : `Giá đang dùng thuộc ⚓ v${currentNo ?? '—'}. Muốn đổi giá, tạo bản nháp phiên bản khóa học.`}
          </p>
        </div>
        {canManage && draftNo === null && (
          <button type="button" className="btn btn-primary" onClick={onCreateDraft} disabled={createDraft.isPending}>
            {createDraft.isPending ? 'Đang tạo…' : 'Tạo bản nháp để đổi giá'}
          </button>
        )}
        {draftNo !== null && (
          <Link className="btn btn-outline btn-small" to={`/platform/versions/${draftNo}`}>
            Mở bản nháp v{draftNo} →
          </Link>
        )}
      </div>
      <div className="table-scroll">
        <table className="data-table pa-price-table">
          <thead>
            <tr>
              <th>Khóa học</th>
              <th>Cấp</th>
              <th className="num">Giá đang dùng (v{currentNo ?? '—'})</th>
              {draftNo !== null && <th>Giá bản nháp v{draftNo}</th>}
              <th>Bán</th>
              <th className="num">Suất</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <PriceGroup key={group.id} name={group.name} colSpan={draftNo !== null ? 6 : 5}>
                {group.courses.map((c) => {
                  const edit = edits[c.id]!;
                  const isChanged = changed.includes(c);
                  const draftDiffers = c.draftPricePerSeat !== null && (c.draftPricePerSeat !== c.pricePerSeat || c.draftSalesStatus !== c.salesStatus);
                  return (
                    <tr key={c.id} className={isChanged ? 'pa-row-changed' : undefined}>
                      <td>
                        <strong className="pa-cell-title">{c.title}</strong>
                        <small className="pa-cell-sub">
                          {c.code} · {c.domainName}
                        </small>
                      </td>
                      <td>
                        <span className={`pa-level pa-level-${c.level}`}>{LEVEL_NAMES[c.level] ?? c.levelName}</span>
                      </td>
                      <td className="num">{c.isFree ? 'Miễn phí' : formatMoney(c.pricePerSeat)}</td>
                      {draftNo !== null && (
                        <td>
                          {c.isFree ? (
                            <span className="pa-hint">Luôn miễn phí</span>
                          ) : editable ? (
                            <div className="pa-price-input">
                              <input
                                type="number"
                                min={0}
                                step={1000}
                                value={Number.isFinite(edit.price) ? edit.price : ''}
                                onChange={(e) => set(c.id, { price: e.target.value === '' ? Number.NaN : Number(e.target.value) })}
                                aria-label={`Giá bản nháp của ${c.code}`}
                              />
                              <span>₫</span>
                            </div>
                          ) : (
                            formatMoney(c.draftPricePerSeat ?? c.pricePerSeat)
                          )}
                          {draftDiffers && !isChanged && <small className="pa-cell-sub">Khác giá đang dùng</small>}
                        </td>
                      )}
                      <td>
                        {editable ? (
                          <select value={edit.sales} onChange={(e) => set(c.id, { sales: e.target.value as SalesStatus })} aria-label={`Trạng thái bán của ${c.code}`}>
                            <option value="OPEN">Đang mở bán</option>
                            <option value="PAUSED">Tạm ngưng bán</option>
                          </select>
                        ) : (
                          <Pill tone={SALES_STATUS[c.salesStatus]?.tone}>{SALES_STATUS[c.salesStatus]?.label}</Pill>
                        )}
                      </td>
                      <td className="num">
                        {c.isFree ? '—' : `${c.seatsPurchased} mua · ${c.seatsGranted} cấp`}
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
        <div className="pa-row-between pa-gap-top">
          <small className="pa-hint" aria-live="polite">
            {changed.length ? `${changed.length} khóa có thay đổi chưa lưu.` : 'Chưa có thay đổi.'} Tạm ngưng bán chỉ chặn lượt mua mới; suất đã cấp vẫn dùng tiếp.
          </small>
          <div className="button-row">
            <button type="button" className="btn btn-ghost" onClick={() => setEdits(initial)} disabled={!changed.length || save.isPending}>
              Hủy thay đổi
            </button>
            <button type="button" className="btn btn-primary" onClick={onSave} disabled={!changed.length || invalid || save.isPending}>
              {save.isPending ? 'Đang lưu…' : `Lưu giá vào bản nháp v${draftNo}`}
            </button>
          </div>
        </div>
      )}
      {draftNo !== null && !canManage && <p className="pa-hint pa-gap-top">Bạn chỉ có quyền xem bảng giá.</p>}
    </Box>
  );
}

function PriceGroup({ name, colSpan, children }: { name: string; colSpan: number; children: ReactNode }) {
  return (
    <>
      <tr className="pa-group-row">
        <td colSpan={colSpan}>{name}</td>
      </tr>
      {children}
    </>
  );
}
