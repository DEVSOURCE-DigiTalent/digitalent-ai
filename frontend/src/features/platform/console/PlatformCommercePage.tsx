import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlatformCommerce } from '@/hooks/use-platform-admin';
import { useCatalogVersions, useCreateDraft, useUpdatePrices } from '@/hooks/use-platform-catalog';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import type { PlatformCourse, SalesStatus } from '@/services/platform-admin.service';
import { Footer, LoadError, Loading, Pager, Pill } from '../components/pulse-ui';
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
} from 'lucide-react';

type Edit = { price: number; sales: SalesStatus };

/**
 * PA-09 · Đơn giá: per-seat price of every published course.
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
      <div className="pa-page-header">
        <div className="pa-row-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="pa-header-eyebrow">
              <span className="pa-eyebrow-dot" />
              QUẢN TRỊ NỀN TẢNG / ĐƠN GIÁ & DOANH THU B2B
            </div>
            <h1 className="pa-header-title">Giá mỗi suất theo khóa học.</h1>
            <p className="pa-header-subtitle">
              Khóa Cơ bản luôn miễn phí theo Thông tư 02. Đổi giá trong bản nháp phiên bản; giá mới áp dụng khi bản nháp được công bố.
            </p>
          </div>
        </div>
      </div>

      {(isLoading || versions.isLoading) && <Loading />}
      {error && <LoadError error={error} />}
      {data && versions.data && (
        <>
          {/* Bento KPI Grid */}
          <div className="pa-bento-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
            <div className="pa-bento-card">
              <div className="pa-bento-top">
                <span className="pa-bento-label">DOANH THU SUẤT KHÓA</span>
                <ReceiptText size={16} style={{ color: '#059669' }} />
              </div>
              <div className="pa-bento-value" style={{ color: '#059669' }}>{formatMoney(data.revenue)}</div>
              <div className="pa-bento-sub">Tổng thu từ bán suất khóa trả phí</div>
            </div>

            <div className="pa-bento-card">
              <div className="pa-bento-top">
                <span className="pa-bento-label">SUẤT DOANH NGHIỆP ĐÃ MUA</span>
                <Building2 size={16} style={{ color: '#2563eb' }} />
              </div>
              <div className="pa-bento-value">{formatNumber(data.seatsPurchased)}</div>
              <div className="pa-bento-sub">Số suất nhân viên được mở quyền học</div>
            </div>

            <div className="pa-bento-card">
              <div className="pa-bento-top">
                <span className="pa-bento-label">SUẤT QUẢN TRỊ CẤP HỖ TRỢ</span>
                <ShieldCheck size={16} style={{ color: '#d97706' }} />
              </div>
              <div className="pa-bento-value">{formatNumber(data.seatsGranted)}</div>
              <div className="pa-bento-sub">Suất cấp qua nghiệp vụ hỗ trợ</div>
            </div>
          </div>

          <PriceTable key={`${draftNo}-${data.courses.map((c) => `${c.draftPricePerSeat}${c.draftSalesStatus}`).join()}`} courses={data.courses} currentNo={currentNo} draftNo={draftNo} />

          {/* Orders Section */}
          <section className="surface pad" style={{ marginTop: 24, borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }} aria-labelledby="orders-title">
            <div className="pa-row-between" style={{ marginBottom: 16, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <History size={18} style={{ color: '#0f172a' }} />
                <div>
                  <h2 id="orders-title" className="panel-title" style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Lịch sử đơn hàng & Cấp phát suất học
                  </h2>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Giao dịch mua suất từ doanh nghiệp và các lượt cấp bù từ quản trị</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Phân loại:</span>
                <select
                  value={kind}
                  onChange={(e) => {
                    setKind(e.target.value);
                    setPageIndex(1);
                  }}
                  aria-label="Loại đơn"
                  style={{ height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                >
                  <option value="">Tất cả loại đơn</option>
                  <option value="PURCHASE">Doanh nghiệp mua</option>
                  <option value="ADMIN_GRANT">Quản trị viên cấp</option>
                </select>
              </div>
            </div>

            {data.orders.items.length === 0 ? (
              <p style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: 13, background: '#f8fafc', borderRadius: 10 }}>
                Chưa có đơn hàng hoặc suất cấp hỗ trợ nào được ghi nhận.
              </p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 160 }}>Thời gian</th>
                      <th>Khóa học & Doanh nghiệp</th>
                      <th style={{ width: 160 }}>Loại đơn</th>
                      <th className="num" style={{ width: 100, textAlign: 'right' }}>Số suất</th>
                      <th className="num" style={{ width: 140, textAlign: 'right' }}>Tổng tiền</th>
                      <th>Người thực hiện / Lý do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.items.map((o) => {
                      const isPurchase = o.kind === 'PURCHASE';
                      return (
                        <tr key={o.id}>
                          <td>
                            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>
                              {formatDateTime(o.createdAt)}
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>{o.courseTitle}</strong>
                              <Link to={`/platform/organizations/${o.organizationId}`} style={{ fontSize: 12, color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <Building2 size={12} /> {o.organizationName}
                              </Link>
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 999,
                                background: isPurchase ? '#ecfdf5' : '#eff6ff',
                                color: isPurchase ? '#059669' : '#2563eb',
                                border: `1px solid ${isPurchase ? '#a7f3d0' : '#bfdbfe'}`,
                              }}
                            >
                              {isPurchase ? 'Doanh nghiệp mua' : 'Quản trị cấp'}
                            </span>
                          </td>
                          <td className="num" style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{o.seats}</span>
                            <span style={{ fontSize: 11, color: '#64748b', marginLeft: 3 }}>suất</span>
                          </td>
                          <td className="num" style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: 13, color: isPurchase ? '#059669' : '#64748b' }}>
                              {o.totalAmount > 0 ? formatMoney(o.totalAmount) : 'Miễn phí'}
                            </strong>
                          </td>
                          <td>
                            <div style={{ fontSize: 12, color: '#475569' }}>
                              {o.createdByEmail && <span>{o.createdByEmail}</span>}
                              {o.reason && <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', marginTop: 2 }}>“{o.reason}”</div>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ marginTop: 14 }}>
                  <Pager pageIndex={data.orders.pageIndex} totalPages={data.orders.totalPages} totalItems={data.orders.totalItems} onChange={setPageIndex} />
                </div>
              </div>
            )}
          </section>
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
  const groups = useMemo(() => {
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
    <section className="surface pad" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }} aria-labelledby="pricing-title">
      <div className="pa-card-head" style={{ marginBottom: 16 }}>
        <div>
          <h2 id="pricing-title" className="panel-title" style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
            Bảng đơn giá khóa học
          </h2>
          <p className="panel-desc" style={{ fontSize: 13, color: '#64748b' }}>
            {draftNo !== null
              ? `Giá đang áp dụng thuộc phiên bản neo ⚓ v${currentNo}. Mọi thay đổi giá trong bản nháp v${draftNo} sẽ có hiệu lực ngay khi công bố.`
              : `Giá đang dùng thuộc ⚓ v${currentNo ?? '—'}. Tạo bản nháp mới để điều chỉnh đơn giá.`}
          </p>
        </div>
        {canManage && draftNo === null && (
          <button type="button" className="btn btn-primary" onClick={onCreateDraft} disabled={createDraft.isPending} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={15} />
            {createDraft.isPending ? 'Đang tạo…' : 'Tạo bản nháp để đổi giá'}
          </button>
        )}
        {draftNo !== null && (
          <Link className="btn btn-outline btn-small" to={`/platform/versions/${draftNo}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Edit3 size={14} />
            Mở bản nháp v{draftNo} →
          </Link>
        )}
      </div>

      <div className="table-scroll" style={{ borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table pa-price-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>KHÓA HỌC & LĨNH VỰC</th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#475569' }}>CẤP ĐỘ</th>
              <th className="num" style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#475569' }}>
                GIÁ ĐANG DÙNG (v{currentNo ?? '—'})
              </th>
              {draftNo !== null && (
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#d97706' }}>
                  GIÁ BẢN NHÁP v{draftNo}
                </th>
              )}
              <th style={{ padding: '12px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#475569' }}>TRẠNG THÁI BÁN</th>
              <th className="num" style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#475569' }}>SUẤT ĐÃ CẤP</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <PriceGroup key={group.name} name={group.name} count={group.courses.length} colSpan={draftNo !== null ? 6 : 5}>
                {group.courses.map((c) => {
                  const edit = edits[c.id]!;
                  const isChanged = changed.includes(c);
                  const draftDiffers = c.draftPricePerSeat !== null && (c.draftPricePerSeat !== c.pricePerSeat || c.draftSalesStatus !== c.salesStatus);
                  const levelStyle =
                    c.level === 1
                      ? { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }
                      : c.level === 2
                        ? { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' }
                        : { bg: '#fffbeb', color: '#d97706', border: '#fde68a' };

                  return (
                    <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9', background: isChanged ? '#fffbeb' : '#fff' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <code style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                            {c.code}
                          </code>
                          <div>
                            <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>{c.title}</strong>
                            <small style={{ fontSize: 12, color: '#64748b' }}>{c.domainName}</small>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            background: levelStyle.bg,
                            color: levelStyle.color,
                            border: `1px solid ${levelStyle.border}`,
                          }}
                        >
                          {LEVEL_NAMES[c.level] ?? c.levelName}
                        </span>
                      </td>
                      <td className="num" style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>
                        {c.isFree ? <span style={{ color: '#16a34a' }}>Miễn phí</span> : formatMoney(c.pricePerSeat)}
                      </td>
                      {draftNo !== null && (
                        <td style={{ padding: '10px 16px' }}>
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
                                aria-label={`Giá bản nháp của ${c.code}`}
                                style={{ width: 120, height: 32, padding: '0 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, fontWeight: 600 }}
                              />
                              <span style={{ fontSize: 13, color: '#64748b' }}>₫</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{formatMoney(c.draftPricePerSeat ?? c.pricePerSeat)}</span>
                          )}
                          {draftDiffers && !isChanged && <small style={{ display: 'block', fontSize: 11, color: '#d97706' }}>Khác giá đang dùng</small>}
                        </td>
                      )}
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {editable ? (
                          <select
                            value={edit.sales}
                            onChange={(e) => set(c.id, { sales: e.target.value as SalesStatus })}
                            aria-label={`Trạng thái bán của ${c.code}`}
                            style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 600 }}
                          >
                            <option value="OPEN">Đang mở bán</option>
                            <option value="PAUSED">Tạm ngưng bán</option>
                          </select>
                        ) : (
                          <Pill tone={SALES_STATUS[c.salesStatus]?.tone}>{SALES_STATUS[c.salesStatus]?.label}</Pill>
                        )}
                      </td>
                      <td className="num" style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, color: '#64748b' }}>
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
              {changed.length ? <strong>{changed.length} khóa có giá mới chưa lưu.</strong> : 'Chưa có thay đổi đơn giá nào.'} Tạm ngưng bán chỉ chặn lượt mua mới; suất cũ vẫn học bình thường.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => setEdits(initial)}
              disabled={!changed.length || save.isPending}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={14} />
              Hủy thay đổi
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSave}
              disabled={!changed.length || invalid || save.isPending}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={15} />
              {save.isPending ? 'Đang lưu…' : `Lưu giá vào bản nháp v${draftNo}`}
            </button>
          </div>
        </div>
      )}
      {draftNo !== null && !canManage && <p className="pa-hint" style={{ marginTop: 12 }}>Bạn chỉ có quyền xem bảng giá.</p>}
    </section>
  );
}

function PriceGroup({ name, colSpan, count, children }: { name: string; colSpan: number; count: number; children: ReactNode }) {
  return (
    <>
      <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <td colSpan={colSpan} style={{ padding: '9px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
              <strong style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{name}</strong>
            </div>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#e2e8f0', color: '#475569', fontWeight: 600 }}>
              {count} khóa học
            </span>
          </div>
        </td>
      </tr>
      {children}
    </>
  );
}
