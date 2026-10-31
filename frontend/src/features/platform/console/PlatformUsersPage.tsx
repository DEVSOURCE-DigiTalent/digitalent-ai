import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePlatformUsers } from '@/hooks/use-platform-admin';
import type { PlatformUser, TrialFilter } from '@/services/platform-admin.service';
import { Box, Footer, LoadError, Loading, Pager, Pill } from '../components/pulse-ui';
import {
  PERSONAL_PLANS,
  ROLE_LABELS,
  USER_STATUS,
  daysUntil,
  formatDate,
  getAvatarColor,
} from '../components/pulse-format';
import { PlatformDrawer } from '../components/PlatformDrawer';
import { UserDetailContent } from './components/UserDetailContent';
import {
  Users,
  Search,
  Clock,
  AlertTriangle,
  UserCheck,
  ExternalLink,
} from 'lucide-react';

const TRIAL_TABS: { key: TrialFilter | ''; label: string; badge?: string }[] = [
  { key: '', label: 'Tất cả người dùng' },
  { key: 'ACTIVE', label: 'Đang dùng thử' },
  { key: 'ENDING_SOON', label: 'Sắp hết hạn (≤ 48h)' },
  { key: 'ENDED', label: 'Đã hết dùng thử' },
];

const isTrialFilter = (value: string | null): value is TrialFilter => ['ACTIVE', 'ENDING_SOON', 'ENDED', 'ANY'].includes(value ?? '');

/** PA-07 · Quản trị Người dùng: all accounts & trial management with In-Context Slide-in Drawer (PA-08). */
export function PlatformUsersPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [trial, setTrial] = useState<TrialFilter | ''>(isTrialFilter(params.get('trial')) ? (params.get('trial') as TrialFilter) : '');
  const [pageIndex, setPageIndex] = useState(1);
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);

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

  const selectedUser = data?.items.find((u) => u.id === drawerUserId);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} />
            Quản trị nền tảng / Người dùng
          </span>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '6px 0 4px' }}>
            Theo dõi tài khoản & Học viên dùng thử.
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Quản trị tài khoản toàn hệ thống, theo dõi tiến độ dùng thử 7 ngày và hỗ trợ mở/khóa truy cập an toàn.
          </p>
        </div>
      </div>

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 20 }}>
          <div className="pa-bento-card" style={{ padding: 16, minHeight: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Đang dùng thử</span>
              <div className="pa-kpi-icon-wrap amber" style={{ width: 28, height: 28 }}>
                <Clock size={15} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>{data.trials.active}</div>
            <small style={{ fontSize: 12, color: '#64748b' }}>Gói Plus 7 ngày, học viên cá nhân</small>
          </div>

          <div className="pa-bento-card" style={{ padding: 16, minHeight: 'auto', borderTop: data.trials.endingSoon > 0 ? '3px solid #e11d48' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Hết hạn trong 48h</span>
              <div className="pa-kpi-icon-wrap" style={{ width: 28, height: 28, background: data.trials.endingSoon > 0 ? '#fee2e2' : '#f1f5f9', color: data.trials.endingSoon > 0 ? '#b91c1c' : '#64748b' }}>
                <AlertTriangle size={15} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: data.trials.endingSoon > 0 ? '#b91c1c' : '#0f172a', margin: '4px 0' }}>
              {data.trials.endingSoon}
            </div>
            <small style={{ fontSize: 12, color: '#64748b' }}>Cần gửi thông báo chuyển sang trả phí</small>
          </div>

          <div className="pa-bento-card" style={{ padding: 16, minHeight: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Đã hết dùng thử</span>
              <div className="pa-kpi-icon-wrap slate" style={{ width: 28, height: 28 }}>
                <UserCheck size={15} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>{data.trials.ended}</div>
            <small style={{ fontSize: 12, color: '#64748b' }}>Đã tự động chuyển về gói Miễn phí</small>
          </div>
        </div>
      )}

      <Box>
        {/* Trial Filter Tabs */}
        <div className="pa-tabs" role="group" aria-label="Lọc theo dùng thử" style={{ marginBottom: 16 }}>
          {TRIAL_TABS.map((t) => (
            <button key={t.key || 'ALL'} type="button" aria-pressed={trial === t.key} onClick={() => chooseTrial(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="pa-filters" style={{ marginBottom: 18 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="search"
              placeholder="Tìm theo email, tên hoặc tổ chức..."
              value={search}
              onChange={(e) => filter(setSearch)(e.target.value)}
              style={{ paddingLeft: 34, height: 40, width: '100%' }}
              aria-label="Tìm người dùng"
            />
          </div>

          <select value={role} onChange={(e) => filter(setRole)(e.target.value)} aria-label="Lọc theo vai trò" style={{ height: 40 }}>
            <option value="">Tất cả vai trò</option>
            {Object.entries(ROLE_LABELS).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>

          <select value={status} onChange={(e) => filter(setStatus)(e.target.value)} aria-label="Lọc theo trạng thái" style={{ height: 40 }}>
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="LOCKED">Đã khóa</option>
            <option value="INACTIVE">Vô hiệu hóa</option>
          </select>
        </div>

        {isLoading && <Loading />}
        {error && <LoadError error={error} />}
        {data && data.items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0' }}>
            <Users size={36} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>Không tìm thấy tài khoản nào khớp bộ lọc</div>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>Thử xóa các điều kiện lọc hoặc thay đổi từ khóa tìm kiếm.</p>
          </div>
        )}

        {data && data.items.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Vai trò</th>
                    <th>Phạm vi / Tổ chức</th>
                    <th>Gói dịch vụ & Dùng thử</th>
                    <th>Trạng thái</th>
                    <th style={{ width: 100 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((u) => (
                    <tr
                      key={u.id}
                      className="pa-row-link"
                      onClick={() => setDrawerUserId(u.id)}
                      title="Bấm để mở ngăn kéo xem chi tiết tài khoản"
                    >
                      <td>
                        {(() => {
                          const av = getAvatarColor(u.displayName);
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  background: av.bg,
                                  color: av.text,
                                  border: `1px solid ${av.border}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              >
                                {u.displayName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <strong className="pa-cell-title" style={{ fontSize: 13 }}>{u.displayName}</strong>
                                <small className="pa-cell-sub">{u.email}</small>
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: '#475569' }}>
                          {[u.organizationName ?? (u.role === 'PLATFORM_ADMIN' ? 'DigiTalent Platform' : 'Tài khoản cá nhân'), [u.departmentName, u.positionName].filter(Boolean).join(' / ')]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </td>
                      <td>
                        <TrialCell user={u} />
                      </td>
                      <td>
                        <Pill tone={USER_STATUS[u.status]?.tone}>{USER_STATUS[u.status]?.label ?? u.status}</Pill>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerUserId(u.id);
                          }}
                          style={{ padding: '4px 8px', fontSize: 11 }}
                        >
                          Chi tiết →
                        </button>
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

      {/* Slide-in Drawer PA-08 */}
      <PlatformDrawer
        isOpen={Boolean(drawerUserId)}
        onClose={() => setDrawerUserId(null)}
        title={selectedUser?.displayName ?? 'Chi tiết người dùng'}
        subtitle={selectedUser?.email}
        icon={Users}
        badge={
          selectedUser && (
            <Pill tone={USER_STATUS[selectedUser.status]?.tone}>
              {USER_STATUS[selectedUser.status]?.label ?? selectedUser.status}
            </Pill>
          )
        }
        footer={
          drawerUserId ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Link
                to={`/platform/users/${drawerUserId}`}
                className="btn btn-ghost btn-small"
                target="_blank"
                rel="noreferrer"
              >
                Mở toàn màn hình <ExternalLink size={13} style={{ marginLeft: 4 }} />
              </Link>
              <button type="button" className="btn btn-outline btn-small" onClick={() => setDrawerUserId(null)}>
                Đóng
              </button>
            </div>
          ) : undefined
        }
      >
        {drawerUserId && <UserDetailContent userId={drawerUserId} isDrawer />}
      </PlatformDrawer>

      <Footer />
    </>
  );
}

function TrialCell({ user: u }: { user: PlatformUser }) {
  if (!u.planCode) return <span style={{ color: '#94a3b8', fontSize: 12 }}>{u.organizationName ? 'Theo tổ chức' : '—'}</span>;
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

