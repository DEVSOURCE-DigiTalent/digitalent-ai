import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformUsers } from '@/hooks/use-platform-admin';
import { Box, Footer, LoadError, Loading, PageHead, Pager, Pill } from '../components/pulse-ui';
import { ROLE_LABELS, USER_STATUS } from '../components/pulse-format';

/** PA-07 · Người dùng (mock `#/admin/users`): every account, found in its organization. */
export function PlatformUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const { data, isLoading, error } = usePlatformUsers({ search, role, status, pageIndex, pageSize: 20 });

  const filter = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPageIndex(1);
  };

  return (
    <>
      <PageHead
        eyebrow="Nền tảng / Người dùng"
        title="Tìm tài khoản trong tổ chức."
        description="Danh sách gồm chủ doanh nghiệp, quản lý phòng ban, nhân viên và học viên cá nhân. Thao tác hỗ trợ nhạy cảm cần ghi lý do."
      />
      <Box>
        <div className="pa-filters">
          <input
            type="search"
            placeholder="Tìm theo email, tên hoặc tổ chức"
            value={search}
            onChange={(e) => filter(setSearch)(e.target.value)}
            aria-label="Tìm người dùng"
          />
          <select value={role} onChange={(e) => filter(setRole)(e.target.value)} aria-label="Vai trò">
            <option value="">Mọi vai trò</option>
            {Object.entries(ROLE_LABELS).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => filter(setStatus)(e.target.value)} aria-label="Trạng thái">
            <option value="">Mọi trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="LOCKED">Đã khóa</option>
            <option value="INACTIVE">Vô hiệu hóa</option>
          </select>
        </div>
        {isLoading && <Loading />}
        {error && <LoadError error={error} />}
        {data && data.items.length === 0 && <p className="small">Không có tài khoản nào khớp bộ lọc.</p>}
        {data && data.items.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Vai trò</th>
                    <th>Phạm vi</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <Link to={`/platform/users/${u.id}`}>
                          <strong>{u.displayName}</strong>
                          <br />
                          <span className="dim">{u.email}</span>
                        </Link>
                      </td>
                      <td>{ROLE_LABELS[u.role] ?? u.role}</td>
                      <td>
                        {[u.organizationName ?? (u.role === 'PLATFORM_ADMIN' ? 'DigiTalent' : 'Tài khoản cá nhân'), [u.departmentName, u.positionName].filter(Boolean).join(' / ')]
                          .filter(Boolean)
                          .join(' · ')}
                      </td>
                      <td>
                        <Pill tone={USER_STATUS[u.status]?.tone}>{USER_STATUS[u.status]?.label ?? u.status}</Pill>
                      </td>
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
