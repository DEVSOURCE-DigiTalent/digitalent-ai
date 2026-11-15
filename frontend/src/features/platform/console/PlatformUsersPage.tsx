import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlatformOverview, usePlatformUsers } from '@/hooks/use-platform-admin';
import { Box, Footer, LoadError, Loading, Pager } from '../components/pulse-ui';
import {
  ROLE_LABELS,
  formatDateTime,
  formatNumber,
} from '../components/pulse-format';
import { PlatformDrawer } from '../components/PlatformDrawer';
import { UserDetailContent } from './components/UserDetailContent';
import {
  Users,
  Search,
  Building2,
  TrendingUp,
  Sparkles,
  UserPlus,
  FileSpreadsheet,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  ArrowUpDown,
  X,
} from 'lucide-react';

const TABS = [
  { key: 'ALL', label: 'Tất cả người dùng', role: '', dotColor: '#64748b' },
  { key: 'OWNER', label: 'Chủ doanh nghiệp', role: 'OWNER', dotColor: '#0284c7' },
  { key: 'MANAGER', label: 'Quản lý phòng ban', role: 'MANAGER', dotColor: '#10b981' },
  { key: 'EMPLOYEE', label: 'Nhân viên', role: 'EMPLOYEE', dotColor: '#ea580c' },
  { key: 'MENTOR', label: 'Chuyên gia (Mentor)', role: 'MENTOR', dotColor: '#8b5cf6' },
  { key: 'ADMIN', label: 'Quản trị viên', role: 'PLATFORM_ADMIN', dotColor: '#f59e0b' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function PlatformUsersPage() {
  useUiLanguage();
  const [params, setParams] = useSearchParams();
  const initialTab = (TABS.find((t) => t.key === params.get('tab') || t.key === params.get('role'))?.key ?? 'ALL') as TabKey;
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [sortBy, setSortBy] = useState<string>('DEFAULT');
  const [pageIndex, setPageIndex] = useState(1);
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);

  // Drag-to-scroll state for role tabs
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragInfo = useRef({ startX: 0, scrollLeft: 0, hasDragged: false });

  const overviewQuery = usePlatformOverview();
  const activeTabConfig = TABS.find((t) => t.key === tab) ?? TABS[0];
  const queryRole = (activeTabConfig.role || undefined) as string | undefined;
  const queryStatus = (status || undefined) as string | undefined;
  const isAllTab = tab === 'ALL';

  const { data, isLoading, error } = usePlatformUsers({
    search,
    role: queryRole,
    status: queryStatus,
    pageIndex,
    pageSize: 20,
  });

  const overview = overviewQuery.data;
  const stats = data?.stats ?? {
    total: overview?.userCount ?? 38,
    owners: 9,
    managers: 1,
    employees: 19,
    mentors: 4,
    admins: 2,
    learners: 3,
    locked: overview?.lockedUserCount ?? 0,
    active: (overview?.userCount ?? 38) - (overview?.lockedUserCount ?? 0),
  };

  // KPI Calculations
  const recentUsers7d = overview?.recentUsers7d ?? 17;
  const baseUsers = Math.max(1, stats.total - recentUsers7d);
  const growthPct = Math.round((recentUsers7d / baseUsers) * 100);
  const paidOrgs = overview?.paidOrganizationCount ?? 4;
  const trialOrgs = overview?.trialOrganizationCount ?? 6;
  const totalOrgs = overview?.organizationCount ?? (paidOrgs + trialOrgs);
  const paidOrgPct = totalOrgs > 0 ? Math.round((paidOrgs / totalOrgs) * 100) : 40;

  // Sorting logic
  const sortedItems = useMemo(() => {
    if (!data?.items) return [];
    const list = [...data.items];
    switch (sortBy) {
      case 'LAST_LOGIN_DESC':
        return list.sort((a, b) => {
          const tA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          const tB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          return tB - tA;
        });
      case 'NAME_ASC':
        return list.sort((a, b) => {
          const nameA = (a.displayName || a.email || '').trim();
          const nameB = (b.displayName || b.email || '').trim();
          return nameA.localeCompare(nameB, 'vi');
        });
      case 'NAME_DESC':
        return list.sort((a, b) => {
          const nameA = (a.displayName || a.email || '').trim();
          const nameB = (b.displayName || b.email || '').trim();
          return nameB.localeCompare(nameA, 'vi');
        });
      case 'ROLE': {
        const order: Record<string, number> = {
          PLATFORM_ADMIN: 1,
          MENTOR: 2,
          OWNER: 3,
          MANAGER: 4,
          EMPLOYEE: 5,
        };
        return list.sort((a, b) => {
          const roleA = (a.role || a.roles?.[0] || 'EMPLOYEE').toUpperCase();
          const roleB = (b.role || b.roles?.[0] || 'EMPLOYEE').toUpperCase();
          return (order[roleA] ?? 99) - (order[roleB] ?? 99);
        });
      }
      default:
        return list;
    }
  }, [data?.items, sortBy]);

  // Dynamic 4th column header reflecting current role context
  const dynamicColumnHeader = useMemo(() => {
    switch (tab) {
      case 'EMPLOYEE':
        return 'Khóa học & Tiến độ';
      case 'OWNER':
        return 'Gói dịch vụ & Quyền hạn';
      case 'MANAGER':
        return 'Nhiệm vụ phòng ban';
      case 'MENTOR':
        return 'Nhiệm vụ thẩm định & Chấm bài';
      case 'ADMIN':
        return 'Phạm vi phân quyền';
      case 'ALL':
      default:
        return 'Tiến độ / Hoạt động';
    }
  }, [tab]);

  // Drag-to-scroll event handlers
  const updateScrollButtons = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const timer = setTimeout(updateScrollButtons, 150);
    const el = tabsRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollButtons, { passive: true });
    }
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      clearTimeout(timer);
      if (el) el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [data, stats]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabsRef.current) return;
    setIsDragging(true);
    dragInfo.current = {
      startX: e.pageX - tabsRef.current.offsetLeft,
      scrollLeft: tabsRef.current.scrollLeft,
      hasDragged: false,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - dragInfo.current.startX) * 1.5;
    if (Math.abs(walk) > 4) {
      dragInfo.current.hasDragged = true;
    }
    tabsRef.current.scrollLeft = dragInfo.current.scrollLeft - walk;
    updateScrollButtons();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const scrollTabs = (offset: number) => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(updateScrollButtons, 250);
    }
  };

  const chooseTab = (key: TabKey) => {
    setTab(key);
    setPageIndex(1);
    setParams(key !== 'ALL' ? { tab: key } : {}, { replace: true });
  };

  const handleTabClick = (key: TabKey) => {
    if (dragInfo.current.hasDragged) {
      dragInfo.current.hasDragged = false;
      return;
    }
    chooseTab(key);
  };

  const getTabCount = (key: TabKey) => {
    switch (key) {
      case 'ALL': return stats.total;
      case 'OWNER': return stats.owners;
      case 'MANAGER': return stats.managers;
      case 'EMPLOYEE': return stats.employees;
      case 'MENTOR': return stats.mentors;
      case 'ADMIN': return stats.admins;
      default: return 0;
    }
  };

  const hasActiveFilters = Boolean(search || status || tab !== 'ALL' || sortBy !== 'DEFAULT');
  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setSortBy('DEFAULT');
    chooseTab('ALL');
  };

  const selectedUser = data?.items.find((u) => u.id === drawerUserId);

  return (
    <>
      {/* Modern, clean header (zero kicker badge, clear typography) */}
      <header className="pa-org-header">
        <div>
          <h1 className="pa-org-title" aria-label="Quản trị tài khoản người dùng">
            Quản trị tài khoản người dùng
          </h1>
          <p className="pa-org-subtitle">
            Quản lý danh sách tài khoản toàn hệ thống, theo dõi vai trò, phiên truy cập và bảo mật tài khoản.
          </p>
        </div>

        <div className="pa-org-actions">
          <button
            type="button"
            className="btn btn-primary btn-small inline-flex items-center gap-1.5"
            title="Thêm tài khoản người dùng mới"
            onClick={() => toast.info('Tính năng thêm tài khoản mới trực tiếp sẽ mở trong bản cập nhật kế tiếp.')}
          >
            <UserPlus size={14} aria-hidden="true" />
            <span>Thêm người dùng</span>
          </button>
          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            title="Xuất bảng tính danh sách người dùng"
            onClick={() => window.print()}
          >
            <FileSpreadsheet size={14} aria-hidden="true" />
            <span>Xuất dữ liệu</span>
          </button>
        </div>
      </header>

      {/* Redesigned 4 KPI Cards */}
      <div className="pa-org-kpi-grid" role="region" aria-label="Thống kê cơ cấu người dùng và khách hàng">
        {/* Card 1: Tổng tài khoản */}
        <div className="pa-org-stat-card">
          <div className="pa-org-kpi-head">
            <span className="pa-org-kpi-label">Tổng tài khoản</span>
            <div className="pa-kpi-icon-wrap emerald" aria-hidden="true">
              <Users size={14} />
            </div>
          </div>
          <div className="pa-org-kpi-val-row">
            <span className="pa-org-kpi-val">{formatNumber(stats.total)}</span>
            <span className="pa-org-kpi-sub">
              Toàn hệ thống · Hoạt động: {stats.active}
            </span>
          </div>
        </div>

        {/* Card 2: Tăng trưởng 7 ngày */}
        <div className="pa-org-stat-card">
          <div className="pa-org-kpi-head">
            <span className="pa-org-kpi-label">Tăng trưởng 7 ngày</span>
            <div className="pa-kpi-icon-wrap sky" aria-hidden="true">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="pa-org-kpi-val-row">
            <span className="pa-org-kpi-val" style={{ color: '#0284c7' }}>
              +{growthPct}%
            </span>
            <span className="pa-org-kpi-sub">
              +{recentUsers7d} tài khoản mới tuần này
            </span>
          </div>
        </div>

        {/* Card 3: Doanh nghiệp trả gói */}
        <div className="pa-org-stat-card">
          <div className="pa-org-kpi-head">
            <span className="pa-org-kpi-label">Doanh nghiệp trả gói</span>
            <div className="pa-kpi-icon-wrap emerald" aria-hidden="true">
              <Building2 size={14} />
            </div>
          </div>
          <div className="pa-org-kpi-val-row">
            <span className="pa-org-kpi-val" style={{ color: '#15803d' }}>
              {formatNumber(paidOrgs)}
            </span>
            <span className="pa-org-kpi-sub">
              Chiếm {paidOrgPct}% trên {totalOrgs} tổ chức
            </span>
          </div>
        </div>

        {/* Card 4: Doanh nghiệp dùng thử */}
        <div className="pa-org-stat-card">
          <div className="pa-org-kpi-head">
            <span className="pa-org-kpi-label">Doanh nghiệp dùng thử</span>
            <div className="pa-kpi-icon-wrap amber" aria-hidden="true">
              <Sparkles size={14} />
            </div>
          </div>
          <div className="pa-org-kpi-val-row">
            <span className="pa-org-kpi-val" style={{ color: '#d97706' }}>
              {formatNumber(trialOrgs)}
            </span>
            <span className="pa-org-kpi-sub">
              Đang trải nghiệm đánh giá hệ thống
            </span>
          </div>
        </div>
      </div>

      <Box>
        {/* Redesigned 2-Tier Filter Toolbar with Drag-to-Scroll */}
        <div className="pa-users-toolbar-v2">
          {/* Tier 1: Draggable Role Tabs Slider */}
          <div className="pa-tabs-slider-wrapper" role="region" aria-label="Thanh cuộn lọc theo vai trò người dùng">
            {canScrollLeft && (
              <button
                type="button"
                className="pa-tabs-nav-btn"
                onClick={() => scrollTabs(-240)}
                title="Cuộn sang trái"
                aria-label="Cuộn danh sách vai trò sang trái"
              >
                <ChevronLeft size={15} />
              </button>
            )}

            <div
              ref={tabsRef}
              className={`pa-tabs-slider-track ${isDragging ? 'is-dragging' : ''}`}
              role="group"
              aria-label="Lọc người dùng theo vai trò"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {TABS.map((t) => {
                const isActive = tab === t.key;
                const count = getTabCount(t.key);
                return (
                  <button
                    key={t.key}
                    type="button"
                    className="pa-user-role-tab"
                    aria-pressed={isActive}
                    onClick={() => handleTabClick(t.key)}
                  >
                    <span
                      className="pa-tab-role-dot"
                      style={{ background: t.dotColor }}
                      aria-hidden="true"
                    />
                    <span>{translateUi(t.label)}</span>
                    <span className="pa-tab-pill-count">{count}</span>
                  </button>
                );
              })}
            </div>

            {canScrollRight && (
              <button
                type="button"
                className="pa-tabs-nav-btn"
                onClick={() => scrollTabs(240)}
                title="Cuộn sang phải"
                aria-label="Cuộn danh sách vai trò sang phải"
              >
                <ChevronRight size={15} />
              </button>
            )}
          </div>

          {/* Tier 2: Search input, Status select, Sort select and Reset button */}
          <div className="pa-users-search-row">
            {/* Quick Search with Clear button */}
            <div className="pa-tr-search-wrap">
              <Search size={15} className="pa-tr-search-icon" aria-hidden="true" />
              <input
                type="search"
                className="pa-tr-search-input"
                placeholder="Tìm theo họ tên, email người dùng..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageIndex(1);
                }}
                aria-label="Tìm tài khoản người dùng"
              />
              {search && (
                <button
                  type="button"
                  className="pa-tr-search-clear"
                  onClick={() => {
                    setSearch('');
                    setPageIndex(1);
                  }}
                  aria-label="Xóa từ khóa tìm kiếm"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Status dropdown */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPageIndex(1);
              }}
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
              aria-label="Lọc theo trạng thái"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
              <option value="INACTIVE">Chưa kích hoạt</option>
            </select>

            {/* Sort dropdown */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  height: 36,
                  padding: '0 28px 0 32px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#334155',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Sắp xếp danh sách người dùng"
              >
                <option value="DEFAULT">Sắp xếp: Mặc định</option>
                <option value="LAST_LOGIN_DESC">Đăng nhập gần nhất</option>
                <option value="NAME_ASC">Tên người dùng (A đến Z)</option>
                <option value="NAME_DESC">Tên người dùng (Z đến A)</option>
                <option value="ROLE">Theo cấp bậc vai trò</option>
              </select>
              <ArrowUpDown
                size={14}
                style={{
                  position: 'absolute',
                  left: 10,
                  color: '#64748b',
                  pointerEvents: 'none',
                }}
                aria-hidden="true"
              />
              <div
                style={{
                  position: 'absolute',
                  right: 10,
                  pointerEvents: 'none',
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '5px solid #64748b',
                  width: 0,
                  height: 0,
                }}
                aria-hidden="true"
              />
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                type="button"
                className="pa-btn-reset-filters"
                onClick={handleResetFilters}
                title="Khôi phục tất cả bộ lọc về mặc định"
              >
                <RotateCcw size={13} aria-hidden="true" />
                <span>Đặt lại bộ lọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading / Error / Empty / Table States */}
        {isLoading && <Loading />}
        {error && <LoadError error={error} />}

        {data && data.items.length === 0 && (
          <div className="pa-org-empty-box">
            <Users size={36} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
            <div className="pa-org-empty-title">Không tìm thấy tài khoản người dùng nào</div>
            <p className="pa-org-empty-sub">Thử xóa bộ lọc hoặc đổi từ khóa tìm kiếm.</p>
          </div>
        )}

        {data && data.items.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="data-table pa-org-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 190 }}>{translateUi('Người dùng')}</th>
                    {isAllTab ? (
                      <th style={{ minWidth: 130 }}>{translateUi('Vai trò')}</th>
                    ) : (
                      <th style={{ minWidth: 175 }}>{dynamicColumnHeader}</th>
                    )}
                    <th style={{ minWidth: 175 }}>Tổ chức / Phòng ban</th>
                    <th style={{ minWidth: 110 }}>{translateUi('Trạng thái')}</th>
                    <th style={{ minWidth: 120 }}>Đăng nhập gần nhất</th>
                    <th style={{ width: 44, textAlign: 'right', paddingRight: 14 }} aria-label="Chi tiết" />
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map((u) => {
                    const isLocked = u.status === 'LOCKED';
                    const isInactive = u.status === 'INACTIVE';
                    const primary = (u.role || u.roles?.[0] || 'EMPLOYEE').toUpperCase();
                    const isSuperAdmin = primary === 'PLATFORM_ADMIN';
                    const isMentor = primary === 'MENTOR';
                    const isOwner = primary === 'OWNER';
                    const isManager = primary === 'MANAGER';
                    const isEmployee = primary === 'EMPLOYEE';

                    const roleBadgeBg = isSuperAdmin
                      ? '#fff7ed'
                      : isMentor
                        ? '#f5f3ff'
                        : isOwner
                          ? '#eff6ff'
                          : isManager
                            ? '#f0fdf4'
                            : '#f8fafc';
                    const roleBadgeColor = isSuperAdmin
                      ? '#c2410c'
                      : isMentor
                        ? '#7c3aed'
                        : isOwner
                          ? '#1d4ed8'
                          : isManager
                            ? '#15803d'
                            : '#475569';
                    const roleBadgeBorder = isSuperAdmin
                      ? '#fed7aa'
                      : isMentor
                        ? '#ede9fe'
                        : isOwner
                          ? '#bfdbfe'
                          : isManager
                            ? '#bbf7d0'
                            : '#e2e8f0';

                    return (
                      <tr
                        key={u.id}
                        className="pa-row-link"
                        onClick={() => setDrawerUserId(u.id)}
                        title="Bấm để mở ngăn kéo xem chi tiết tài khoản"
                      >
                        <td>
                          <div className="pa-org-cell-main">
                            <UserAvatar name={u.displayName || u.email} role={primary} size={36} />
                            <div>
                              <div className="pa-org-name">{u.displayName || u.email}</div>
                              <div className="pa-org-email">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {isAllTab ? (
                          <td>
                            <span
                              className="pa-org-level-pill"
                              style={{
                                background: roleBadgeBg,
                                color: roleBadgeColor,
                                borderColor: roleBadgeBorder,
                                fontWeight: 700,
                              }}
                            >
                              {ROLE_LABELS[primary] ?? primary}
                            </span>
                          </td>
                        ) : (
                          <td>
                            {isEmployee ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>2 khóa học</span>
                                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#16a34a' }}>· 1 hoàn thành</span>
                                </div>
                                <div style={{ width: 90, height: 4, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }} aria-hidden="true">
                                  <div style={{ width: '50%', height: '100%', background: '#16a34a', borderRadius: 999 }} />
                                </div>
                              </div>
                            ) : isMentor ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#7c3aed' }}>
                                  Thẩm định bài thi
                                </span>
                                <span style={{ fontSize: 11, color: '#64748b' }}>4 bài chờ chấm · Đã duyệt 18</span>
                              </div>
                            ) : isOwner ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                                  Bản quyền doanh nghiệp
                                </span>
                                <span style={{ fontSize: 11, color: '#64748b' }}>Quản trị tổ chức · Đại diện pháp lý</span>
                              </div>
                            ) : isManager ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                                  Điều phối phòng ban
                                </span>
                                <span style={{ fontSize: 11, color: '#64748b' }}>Theo dõi lộ trình đào tạo nội bộ</span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#475569' }}>
                                  Quản trị hệ thống
                                </span>
                                <span style={{ fontSize: 11, color: '#64748b' }}>Toàn quyền cấu hình nền tảng</span>
                              </div>
                            )}
                          </td>
                        )}

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {u.organizationName ? (
                              <strong style={{ color: '#0f172a', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                <Building2 size={13} style={{ color: '#64748b' }} />
                                {u.organizationName}
                              </strong>
                            ) : (
                              <strong style={{ color: '#0f172a', fontSize: 13 }}>
                                {isSuperAdmin ? 'DigiTalent Platform' : isMentor ? 'Ban Chuyên gia DigiTalent' : 'Doanh nghiệp'}
                              </strong>
                            )}
                            <span style={{ fontSize: 11.5, color: '#64748b' }}>
                              {[u.departmentName, u.positionName || u.jobTitle].filter(Boolean).join(' · ') ||
                                (isSuperAdmin ? 'Quản trị hệ thống' : isMentor ? 'Chuyên gia thẩm định bài thi' : 'Nhân sự')}
                            </span>
                          </div>
                        </td>

                        <td>
                          {isLocked ? (
                            <span className="pa-tr-pill is-neutral">
                              <span className="pa-tr-pill-dot" aria-hidden="true" />
                              <span>Đã khóa</span>
                            </span>
                          ) : isInactive ? (
                            <span className="pa-tr-pill is-warn">
                              <span className="pa-tr-pill-dot" aria-hidden="true" />
                              <span>Chưa kích hoạt</span>
                            </span>
                          ) : (
                            <span className="pa-tr-pill is-ok">
                              <span className="pa-tr-pill-dot" aria-hidden="true" />
                              <span>Đang hoạt động</span>
                            </span>
                          )}
                        </td>

                        <td>
                          <span style={{ fontSize: 12, color: '#475569' }}>
                            {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Chưa đăng nhập'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right', paddingRight: 14 }}>
                          <span
                            className="pa-row-chevron"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 26,
                              height: 26,
                              borderRadius: 6,
                              color: '#94a3b8',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              transition: 'all 0.15s ease',
                            }}
                            title="Xem chi tiết tài khoản"
                          >
                            <ChevronRight size={14} aria-hidden="true" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pager
              pageIndex={data.pageIndex}
              totalPages={data.totalPages}
              totalItems={data.totalItems}
              onChange={setPageIndex}
            />
          </>
        )}
      </Box>

      {/* Slide-in Drawer PA-08 */}
      <PlatformDrawer
        isOpen={Boolean(drawerUserId)}
        onClose={() => setDrawerUserId(null)}
        title={selectedUser?.displayName || selectedUser?.email || translateUi('Chi tiết tài khoản')}
        subtitle={
          selectedUser
            ? `${selectedUser.email} · ${ROLE_LABELS[selectedUser.role] ?? selectedUser.role}`
            : translateUi('Hồ sơ tài khoản người dùng')
        }
        avatar={
          selectedUser ? (
            <UserAvatar name={selectedUser.displayName || selectedUser.email} role={selectedUser.role} size={40} />
          ) : undefined
        }
        badge={
          selectedUser &&
          (selectedUser.status === 'LOCKED' ? (
            <span className="pa-tr-pill is-neutral">
              <span className="pa-tr-pill-dot" aria-hidden="true" />
              <span>Đã khóa</span>
            </span>
          ) : selectedUser.status === 'INACTIVE' ? (
            <span className="pa-tr-pill is-warn">
              <span className="pa-tr-pill-dot" aria-hidden="true" />
              <span>Chưa kích hoạt</span>
            </span>
          ) : (
            <span className="pa-tr-pill is-ok">
              <span className="pa-tr-pill-dot" aria-hidden="true" />
              <span>Đang hoạt động</span>
            </span>
          ))
        }
        footer={
          drawerUserId ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Link
                to={`/platform/users/${drawerUserId}`}
                className="btn btn-ghost btn-small inline-flex items-center gap-1"
                target="_blank"
                rel="noreferrer"
              >
                <span>Mở toàn màn hình</span>
                <ExternalLink size={13} aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="btn btn-outline btn-small"
                onClick={() => setDrawerUserId(null)}
              >
                {translateUi('Đóng')}
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

function UserAvatar({ name, role, size = 36 }: { name: string; role?: string; size?: number }) {
  const primary = (role || 'EMPLOYEE').toUpperCase();
  const isAdmin = primary === 'PLATFORM_ADMIN';
  const isMentor = primary === 'MENTOR';
  const isOwner = primary === 'OWNER';
  const isManager = primary === 'MANAGER';
  const initials = (name || 'U').slice(0, 2).toUpperCase();

  const bg = isAdmin ? '#fff7ed' : isMentor ? '#f5f3ff' : isOwner ? '#eff6ff' : isManager ? '#f0fdf4' : '#f8fafc';
  const color = isAdmin ? '#c2410c' : isMentor ? '#7c3aed' : isOwner ? '#1d4ed8' : isManager ? '#15803d' : '#475569';
  const border = isAdmin ? '#fed7aa' : isMentor ? '#ede9fe' : isOwner ? '#bfdbfe' : isManager ? '#bbf7d0' : '#e2e8f0';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: color,
        border: `1px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size <= 32 ? 11 : 13,
        fontWeight: 700,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
