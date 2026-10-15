import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePlatformUsers } from '@/hooks/use-platform-admin';
import type { PlatformUser, TrialFilter } from '@/services/platform-admin.service';
import { Box, Footer, Kpi, LoadError, Loading, PageHead, Pager, Pill } from '../components/pulse-ui';
import { PERSONAL_PLANS, ROLE_LABELS, USER_STATUS, daysUntil, formatDate } from '../components/pulse-format';

const TRIAL_TABS: { key: TrialFilter | ''; label: string }[] = [
  { key: '', label: 'Tất cả' },
  { key: 'ACTIVE', label: 'Đang dùng thử' },
  { key: 'ENDING_SOON', label: 'Sắp hết hạn' },
  { key: 'ENDED', label: 'Đã hết dùng thử' },
];

const isTrialFilter = (value: string | null): value is TrialFilter => ['ACTIVE', 'ENDING_SOON', 'ENDED', 'ANY'].includes(value ?? '');

/** PA-07 · Người dùng: every account, and who is trying the platform (7-day trial of personal accounts). */
export function PlatformUsersPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [trial, setTrial] = useState<TrialFilter | ''>(isTrialFilter(params.get('trial')) ? (params.get('trial') as TrialFilter) : '');
  const [pageIndex, setPageIndex] = useState(1);
  const { data, isLoading, error } = usePlatformUsers({ search, role, status, trial, pageIndex, pageSize: 20 });

  const filter = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPageIndex(1);
  };
  const chooseTrial = (value: TrialFilter | '') => {
    setTrial(value);
    setPageIndex(1);
    setParams(value ? { trial: value } : {}, { replace: true });
  };

  return (
    <>
      <PageHead
        eyebrow="Nền tảng / Người dùng"
        title="Theo dõi tài khoản và người dùng thử."
        description="Chủ doanh nghiệp, quản lý phòng ban, nhân viên và học viên cá nhân. Học viên cá nhân được dùng thử gói Plus 7 ngày, hết hạn thì về gói Miễn phí. Thao tác hỗ trợ nhạy cảm cần ghi lý do."
      />
      {data && (
        <div className="grid-3 pa-gap-bottom">
          <Kpi label="Đang dùng thử" value={data.trials.active} hint="Gói Plus 7 ngày, chưa thanh toán" />
          <Kpi label="Hết hạn trong 2 ngày" value={data.trials.endingSoon} hint="Nên nhắc chuyển sang trả phí" />
          <Kpi label="Đã hết dùng thử" value={data.trials.ended} hint="Đang ở gói Miễn phí" />
        </div>
      )}
      <Box>
        <div className="pa-tabs pa-gap-bottom" role="group" aria-label="Lọc theo dùng thử">
          {TRIAL_TABS.map((t) => (
            <button key={t.key || 'ALL'} type="button" aria-pressed={trial === t.key} onClick={() => chooseTrial(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
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
        {data && data.items.length === 0 && <p className="pa-empty">Không có tài khoản nào khớp bộ lọc.</p>}
        {data && data.items.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Vai trò</th>
                    <th>Phạm vi</th>
                    <th>Gói / dùng thử</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <Link to={`/platform/users/${u.id}`}>
                          <strong className="pa-cell-title">{u.displayName}</strong>
                        </Link>
                        <small className="pa-cell-sub">{u.email}</small>
                      </td>
                      <td>{ROLE_LABELS[u.role] ?? u.role}</td>
                      <td>
                        {[u.organizationName ?? (u.role === 'PLATFORM_ADMIN' ? 'DigiTalent' : 'Tài khoản cá nhân'), [u.departmentName, u.positionName].filter(Boolean).join(' / ')]
                          .filter(Boolean)
                          .join(' · ')}
                      </td>
                      <td>
                        <TrialCell user={u} />
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

function TrialCell({ user: u }: { user: PlatformUser }) {
  if (!u.planCode) return <span className="pa-hint">{u.organizationName ? 'Theo gói của tổ chức' : '—'}</span>;
  const plan = PERSONAL_PLANS[u.planCode] ?? u.planCode;
  if (u.trialState === 'ACTIVE') {
    const left = daysUntil(u.trialEndsAt);
    return (
      <div className="stack pa-gap-sm">
        <Pill tone={left <= 2 ? 'coral' : 'green'}>Dùng thử · còn {left} ngày</Pill>
        <small className="pa-cell-sub">
          {plan} · hết hạn {formatDate(u.trialEndsAt)}
        </small>
      </div>
    );
  }
  if (u.trialState === 'ENDED') {
    return (
      <div className="stack pa-gap-sm">
        <Pill tone="gray">Hết dùng thử</Pill>
        <small className="pa-cell-sub">Gói Miễn phí từ {formatDate(u.trialEndsAt)}</small>
      </div>
    );
  }
  return <Pill>{plan}</Pill>;
}
