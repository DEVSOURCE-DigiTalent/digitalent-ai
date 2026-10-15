import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePlatformOrganizations } from '@/hooks/use-platform-admin';
import { Box, Footer, LoadError, Loading, PageHead, Pager, Pill } from '../components/pulse-ui';
import { ORG_STATUS, STAGE_LABELS, formatDate, formatMoney } from '../components/pulse-format';

/** PA-05 · Tổ chức: every business on the platform (the mock shows one; real data lists them all, same table style as Người dùng). */
export function PlatformOrganizationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [stage, setStage] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const { data, isLoading, error } = usePlatformOrganizations({ search, status, stage, pageIndex, pageSize: 20 });

  const filter = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPageIndex(1);
  };

  return (
    <>
      <PageHead
        eyebrow="Nền tảng / Tổ chức"
        title="Tìm doanh nghiệp và hỗ trợ với lý do rõ ràng."
        description="Doanh nghiệp dùng thử không giới hạn thời gian, tối đa 10 nhân viên; mua suất khóa Trung cấp hoặc Nâng cao là chuyển sang trả phí. Mở một tổ chức để cấp suất hoặc tạm ngưng truy cập."
      />
      <Box>
        <div className="pa-filters">
          <input
            type="search"
            placeholder="Tìm theo tên, mã hoặc email chủ doanh nghiệp"
            value={search}
            onChange={(e) => filter(setSearch)(e.target.value)}
            aria-label="Tìm tổ chức"
          />
          <select value={stage} onChange={(e) => filter(setStage)(e.target.value)} aria-label="Giai đoạn">
            <option value="">Mọi giai đoạn</option>
            <option value="TRIAL">Đang dùng thử</option>
            <option value="PAID">Đã mua khóa</option>
          </select>
          <select value={status} onChange={(e) => filter(setStatus)(e.target.value)} aria-label="Trạng thái">
            <option value="">Mọi trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="SUSPENDED">Tạm ngưng</option>
          </select>
        </div>
        {isLoading && <Loading />}
        {error && <LoadError error={error} />}
        {data && data.items.length === 0 && <p className="small">Không có tổ chức nào khớp bộ lọc.</p>}
        {data && data.items.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tổ chức</th>
                    <th>Giai đoạn</th>
                    <th className="num">Phòng ban</th>
                    <th className="num">Nhân sự</th>
                    <th className="num">Suất có phí</th>
                    <th className="num">Doanh thu</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((o) => (
                    <tr key={o.id} className="pa-row-link" onClick={() => navigate(`/platform/organizations/${o.id}`)}>
                      <td>
                        <Link to={`/platform/organizations/${o.id}`} onClick={(e) => e.stopPropagation()}>
                          <strong>{o.name}</strong>
                          <br />
                          <span className="dim">{o.ownerEmail ?? 'Chưa có chủ doanh nghiệp'}</span>
                        </Link>
                      </td>
                      <td>
                        <Pill tone={STAGE_LABELS[o.stage]?.tone}>{STAGE_LABELS[o.stage]?.label}</Pill>
                      </td>
                      <td className="num">{o.departmentCount}</td>
                      <td className="num">{o.employeeCount}</td>
                      <td className="num">{o.seatsPurchased + o.seatsGranted}</td>
                      <td className="num">{formatMoney(o.revenue)}</td>
                      <td>
                        <Pill tone={ORG_STATUS[o.status]?.tone}>{ORG_STATUS[o.status]?.label ?? o.status}</Pill>
                      </td>
                      <td>{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager pageIndex={data.pageIndex} totalPages={data.totalPages} totalItems={data.totalItems} onChange={setPageIndex} />
          </>
        )}
      </Box>
      <Footer />
    </>
  );
}
