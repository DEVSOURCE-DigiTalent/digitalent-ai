import { translateUi, useUiLanguage } from '@/lib/i18n';
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
  ChevronRight,
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
  useUiLanguage();
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
      <div className="flex items-start justify-between flex-wrap gap-4 pb-2 border-b border-slate-200/80 mb-6">
        <div>
          <span className="text-xs font-bold text-amber-700 tracking-wider uppercase flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
            Quản trị nền tảng / Người dùng
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight m-0">
            Quản lý tài khoản & Học viên dùng thử
          </h1>
          <p className="text-sm text-slate-500 mt-1 mb-0">
            Quản trị tài khoản toàn hệ thống, theo dõi tiến độ dùng thử 7 ngày và hỗ trợ mở hoặc khóa truy cập an toàn.
          </p>
        </div>
      </div>

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 20 }}>
          <div className="pa-bento-card" style={{ padding: 14, minHeight: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tổng tài khoản
              </span>
              <div className="pa-kpi-icon-wrap emerald" style={{ width: 28, height: 28 }}>
                <Users size={15} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
              {data.totalItems}
            </div>
            <small style={{ fontSize: 12, color: '#64748b' }}>Tài khoản cá nhân & doanh nghiệp</small>
          </div>

          <div className="pa-bento-card" style={{ padding: 14, minHeight: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Đang dùng thử
              </span>
              <div className="pa-kpi-icon-wrap amber" style={{ width: 28, height: 28 }}>
                <Clock size={15} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706', margin: '4px 0 2px' }}>
              {data.trials.active}
            </div>
            <small style={{ fontSize: 12, color: '#64748b' }}>Gói Plus 7 ngày cá nhân</small>
          </div>

          <div className="pa-bento-card" style={{ padding: 14, minHeight: 'auto', borderTop: data.trials.endingSoon > 0 ? '3px solid #e11d48' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Hết hạn trong 48h
              </span>
              <div className="pa-kpi-icon-wrap" style={{ width: 28, height: 28, background: data.trials.endingSoon > 0 ? '#fee2e2' : '#f1f5f9', color: data.trials.endingSoon > 0 ? '#b91c1c' : '#64748b' }}>
                <AlertTriangle size={15} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: data.trials.endingSoon > 0 ? '#b91c1c' : '#0f172a', margin: '4px 0 2px' }}>
              {data.trials.endingSoon}
            </div>
            <small style={{ fontSize: 12, color: '#64748b' }}>Cần gửi thông báo chuyển đổi</small>
          </div>

          <div className="pa-bento-card" style={{ padding: 14, minHeight: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Đã hết dùng thử
              </span>
              <div className="pa-kpi-icon-wrap slate" style={{ width: 28, height: 28 }}>
                <UserCheck size={15} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
              {data.trials.ended}
            </div>
            <small style={{ fontSize: 12, color: '#64748b' }}>Đã chuyển về gói Miễn phí</small>
          </div>
        </div>
      )}

      <Box>
        {/* Trial Filter Tabs */}
        <div className="pa-tabs" role="group" aria-label="Lọc theo dùng thử" style={{ marginBottom: 16 }}>
          {TRIAL_TABS.map((t) => (
            <button key={t.key || 'ALL'} type="button" aria-pressed={trial === t.key} onClick={() => chooseTrial(t.key)}>
              {translateUi(t.label)}
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
            <option value="">{translateUi("Tất cả vai trò")}</option>
            {Object.entries(ROLE_LABELS).map(([code, label]) => (
              <option key={code} value={code}>
                {translateUi(label)}
              </option>
            ))}
          </select>

          <select value={status} onChange={(e) => filter(setStatus)(e.target.value)} aria-label={translateUi("Lọc theo trạng thái")} style={{ height: 40 }}>
            <option value="">{translateUi("Tất cả trạng thái")}</option>
            <option value="ACTIVE">{translateUi("Đang hoạt động")}</option>
            <option value="LOCKED">Đã khóa</option>
            <option value="INACTIVE">{translateUi("Vô hiệu hóa")}</option>
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
                    <th>{translateUi("Người dùng")}</th>
                    <th>{translateUi("Vai trò")}</th>
                    <th>Phạm vi / Tổ chức</th>
                    <th>Gói dịch vụ & Dùng thử</th>
                    <th>{translateUi("Trạng thái")}</th>
                    <th style={{ width: 100 }}>{translateUi("Thao tác")}</th>
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
                          {translateUi(ROLE_LABELS[u.role]) ?? u.role}
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
                        <Pill tone={USER_STATUS[u.status]?.tone}>{translateUi(USER_STATUS[u.status]?.label) ?? u.status}</Pill>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerUserId(u.id);
                          }}
                          style={{ padding: '4px 8px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        >
                          Chi tiết
                          <ChevronRight size={12} />
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
        title={translateUi(selectedUser?.displayName ?? 'Chi tiết người dùng')}
        subtitle={translateUi(selectedUser?.email)}
        icon={Users}
        badge={
          selectedUser && (
            <Pill tone={USER_STATUS[selectedUser.status]?.tone}>
              {translateUi(USER_STATUS[selectedUser.status]?.label) ?? selectedUser.status}
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
              <button type="button" className="btn btn-outline btn-small" onClick={() => setDrawerUserId(null)}>{translateUi("Đóng")}</button>
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
  useUiLanguage();
  if (!u.planCode) return <span style={{ color: '#94a3b8', fontSize: 12 }}>{u.organizationName ? translateUi('Theo tổ chức') : translateUi('Tài khoản tiêu chuẩn')}</span>;
  const plan = PERSONAL_PLANS[u.planCode] ?? u.planCode;

  if (u.trialState === 'ACTIVE') {
    const left = daysUntil(u.trialEndsAt);
    return (
      <div className="stack pa-gap-sm">
        <Pill tone={left <= 2 ? 'coral' : 'green'}>Dùng thử · còn {left}{translateUi(" ngày")}</Pill>
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

