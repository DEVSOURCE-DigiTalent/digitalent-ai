import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformCommerce } from '@/hooks/use-platform-admin';
import { Box, Footer, Kpi, ListItem, LoadError, Loading, PageHead, Pager, Pill } from '../components/pulse-ui';
import { ORDER_KIND, SALES_STATUS, formatDateTime, formatMoney } from '../components/pulse-format';

/** PA-09 · Đơn hàng và giá (mock `#/admin/commerce`): per-seat price of the 18 courses and the order history. */
export function PlatformCommercePage() {
  const [kind, setKind] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const { data, isLoading, error } = usePlatformCommerce({ kind, pageIndex, pageSize: 20 });

  return (
    <>
      <PageHead
        eyebrow="Nền tảng / Đơn hàng và giá"
        title="Quyền truy cập khóa học được mua theo suất."
        description="Khóa Cơ bản miễn phí ở cả sáu lĩnh vực. Mức cao hơn có giá theo từng khóa; một suất dành cho một nhân viên trong một khóa."
      />
      {isLoading && <Loading />}
      {error && <LoadError error={error} />}
      {data && (
        <>
          <div className="grid-3">
            <Kpi label="Doanh thu suất khóa" value={formatMoney(data.revenue)} small />
            <Kpi label="Suất doanh nghiệp đã mua" value={data.seatsPurchased} />
            <Kpi label="Suất quản trị cấp hỗ trợ" value={data.seatsGranted} />
          </div>
          <Box>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Khóa học</th>
                    <th>Mức</th>
                    <th>Giá / suất</th>
                    <th>Suất</th>
                    <th>Bán</th>
                    <th>Phát hành</th>
                  </tr>
                </thead>
                <tbody>
                  {data.courses.map((c) => (
                    <tr key={c.code}>
                      <td>{c.domainName}</td>
                      <td>{c.levelName}</td>
                      <td>{c.isFree ? 'Miễn phí' : formatMoney(c.pricePerSeat)}</td>
                      <td>{c.isFree ? 'Không giới hạn (Cơ bản)' : `${c.seatsPurchased} mua · ${c.seatsGranted} cấp`}</td>
                      <td>
                        <Pill tone={SALES_STATUS[c.salesStatus]?.tone}>{SALES_STATUS[c.salesStatus]?.label}</Pill>
                      </td>
                      <td>
                        <Link to={`/platform/curriculum/${c.code}`}>v{c.versionNo}.0 ↗</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Box>
          <Box>
            <span className="mini-label">Đơn hàng và cấp suất</span>
            <div className="pa-filters" style={{ marginTop: 12 }}>
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
              <p className="small">Khóa đã mua hoặc suất do quản trị viên cấp sẽ hiển thị ở đây.</p>
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
