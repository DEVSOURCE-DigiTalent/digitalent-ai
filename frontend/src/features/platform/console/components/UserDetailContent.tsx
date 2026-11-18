import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlatformUser, useUserLockAction } from '@/hooks/use-platform-admin';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { LoadError, Loading, ReasonField } from '../../components/pulse-ui';
import {
  ROLE_LABELS,
  PERSONAL_PLANS,
  errorMessage,
  formatDate,
  formatDateTime,
  isReasonValid,
} from '../../components/pulse-format';
import {
  User,
  Building2,
  GraduationCap,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Send,
  Copy,
  Layers,
  Award,
} from 'lucide-react';

interface UserDetailContentProps {
  userId: string;
  isDrawer?: boolean;
}

type UserDetailTab = 'profile' | 'courses' | 'security';

export function UserDetailContent({ userId, isDrawer: _isDrawer }: UserDetailContentProps) {
  useUiLanguage();
  const { data, isLoading, error } = usePlatformUser(userId);
  const lockAction = useUserLockAction(userId);
  const { can, user: me } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_USER_MANAGE);

  const [activeTab, setActiveTab] = useState<UserDetailTab>('profile');
  const [reason, setReason] = useState('');
  const [resetPending, setResetPending] = useState(false);

  if (isLoading) return <Loading />;
  if (error || !data) return <LoadError error={error} />;

  const rawData = data as unknown as {
    user?: typeof data.user;
    organizationStatus?: string;
    enrolledCourses?: {
      courseCode: string;
      courseTitle: string;
      level: number;
      levelName: string;
      progress: number;
      completedAt: string | null;
      score: number | null;
      status: string;
    }[];
  };
  const u = rawData.user ?? (data as unknown as typeof data.user);
  if (!u) return <LoadError error={new Error('Không tìm thấy thông tin người dùng')} />;

  const locked = u.status === 'LOCKED';
  const lockable = locked || (u.role !== 'PLATFORM_ADMIN' && u.email !== me?.email && u.status !== 'INACTIVE');
  const enrolledCourses = rawData.enrolledCourses ?? [];

  const isSuperAdmin = u.role === 'PLATFORM_ADMIN';
  const isOwner = u.role === 'OWNER';
  const isManager = u.role === 'MANAGER';
  const isMentor = u.role === 'MENTOR';

  const handlePasswordReset = () => {
    setResetPending(true);
    setTimeout(() => {
      setResetPending(false);
      toast.success(`Đã gửi liên kết đặt lại mật khẩu đến email ${u.email}`);
    }, 600);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    lockAction.mutate(
      { lock: !locked, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason('');
          toast.success(locked ? `Đã mở khóa tài khoản ${u.email}` : `Đã khóa tài khoản ${u.email}`);
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  const roleLabel = translateUi(ROLE_LABELS[u.role]) ?? u.role;

  // Accurate contextual permission description without awkward fallback
  const permissionSubLabel = (() => {
    switch (u.role) {
      case 'PLATFORM_ADMIN':
        return 'Toàn quyền quản trị hệ thống';
      case 'MENTOR':
        return 'Chấm bài dùng thử';
      case 'OWNER':
        return 'Quản lý tổ chức';
      case 'MANAGER':
        return 'Quản lý đào tạo phòng ban';
      case 'EMPLOYEE':
      default:
        return u.organizationName
          ? `Nhân viên của ${u.organizationName}`
          : 'Nhân viên của tổ chức';
    }
  })();

  const isPlatformStaff = u.role === 'PLATFORM_ADMIN' || u.role === 'MENTOR';
  const orgOrScope = u.organizationName ?? (isPlatformStaff ? 'Nền tảng DigiTalent' : 'Tài khoản cá nhân');
  const deptOrPosition = [u.departmentName, u.positionName].filter(Boolean).join(' · ') || (isPlatformStaff ? 'Nhân sự nền tảng' : 'Chưa gán phòng ban');

  return (
    <div className="pa-org-detail-wrap">
      {/* 3 Quick Executive Stat Chips */}
      <div className="pa-org-detail-strip">
        <div className="pa-org-detail-chip is-hero">
          <span className="pa-org-detail-chip-label">Vai trò</span>
          <span className="pa-org-detail-chip-val" style={{ fontSize: 15 }}>
            {roleLabel}
          </span>
          <span className="pa-org-detail-chip-sub">
            {permissionSubLabel}
          </span>
        </div>

        <div className="pa-org-detail-chip">
          <span className="pa-org-detail-chip-label">Tổ chức</span>
          <span className="pa-org-detail-chip-val" style={{ fontSize: 14 }}>
            {orgOrScope}
          </span>
          <span className="pa-org-detail-chip-sub">
            {deptOrPosition}
          </span>
        </div>

        <div className="pa-org-detail-chip">
          <span className="pa-org-detail-chip-label">Đăng nhập gần nhất</span>
          <span className="pa-org-detail-chip-val" style={{ fontSize: 13.5 }}>
            {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Chưa đăng nhập'}
          </span>
          <span className="pa-org-detail-chip-sub">
            Tạo ngày: {formatDate(u.createdAt)}
          </span>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="pa-org-detail-tabs" role="tablist" aria-label="Các mục của hồ sơ người dùng">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'profile'}
          className="pa-org-detail-tab-btn"
          onClick={() => setActiveTab('profile')}
        >
          <User size={14} aria-hidden="true" />
          <span>Hồ sơ</span>
        </button>

        {!isSuperAdmin && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'courses'}
            className="pa-org-detail-tab-btn"
            onClick={() => setActiveTab('courses')}
          >
            {isOwner ? (
              <>
                <Building2 size={14} aria-hidden="true" />
                <span>Tổ chức</span>
              </>
            ) : isManager ? (
              <>
                <Layers size={14} aria-hidden="true" />
                <span>Phòng ban</span>
              </>
            ) : isMentor ? (
              <>
                <Award size={14} aria-hidden="true" />
                <span>Mentor</span>
              </>
            ) : (
              <>
                <GraduationCap size={14} aria-hidden="true" />
                <span>Khóa học</span>
                {enrolledCourses.length > 0 && (
                  <span className="pa-org-detail-tab-badge">{enrolledCourses.length}</span>
                )}
              </>
            )}
          </button>
        )}

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'security'}
          className="pa-org-detail-tab-btn"
          onClick={() => setActiveTab('security')}
        >
          <ShieldAlert size={14} aria-hidden="true" />
          <span>Bảo mật</span>
        </button>
      </div>

      {/* TAB 1: HỒ SƠ & ĐƠN VỊ */}
      {activeTab === 'profile' && (
        <div className="pa-org-detail-panel">
          {/* Identity & Contact Card */}
          <div className="pa-org-detail-card">
            <div className="pa-org-detail-card-head">
              <span className="pa-org-detail-card-title">
                <span className="pa-org-detail-icon-box" aria-hidden="true">
                  <User size={14} />
                </span>
                Thông tin tài khoản
              </span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: 12,
                    color: '#475569',
                    background: '#f1f5f9',
                    padding: '2px 8px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    letterSpacing: '0.02em',
                  }}
                  title={`Mã tài khoản đầy đủ: ${u.id}`}
                >
                  ID: {u.id.length > 16 ? `${u.id.slice(0, 8)}...${u.id.slice(-4)}` : u.id}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(u.id);
                    toast.success('Đã sao chép mã tài khoản vào bộ nhớ tạm');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '3px 5px',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                  }}
                  title="Sao chép toàn bộ ID"
                  aria-label="Sao chép toàn bộ mã tài khoản"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 }}>Họ và tên</span>
                <strong style={{ color: '#0f172a', display: 'block' }}>{u.displayName || u.email}</strong>

              </div>

              <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 }}>Email đăng nhập</span>
                <strong style={{ color: '#0f172a', display: 'block' }}>{u.email}</strong>
                <span style={{ fontSize: 12, color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <CheckCircle2 size={11} /> Đã xác thực email
                </span>
              </div>

              <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 }}>Số điện thoại</span>
                <strong style={{ color: '#0f172a', display: 'block' }}>{u.phone || 'Chưa cập nhật'}</strong>

              </div>

              <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 }}>Ngày tạo tài khoản</span>
                <strong style={{ color: '#0f172a', display: 'block' }}>{formatDateTime(u.createdAt)}</strong>

              </div>
            </div>
          </div>

          {/* Organization & Subscription Details */}
          <div className="pa-org-detail-card">
            <div className="pa-org-detail-card-head">
              <span className="pa-org-detail-card-title">
                <span className="pa-org-detail-icon-box" aria-hidden="true">
                  <Building2 size={14} />
                </span>
                Tổ chức
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 }}>Tổ chức</span>
                {u.organizationId ? (
                  <Link
                    to={`/platform/organizations/${u.organizationId}`}
                    style={{ color: 'var(--pa-accent-solid)', fontWeight: 700, textDecoration: 'none' }}
                  >
                    {u.organizationName}
                  </Link>
                ) : (
                  <strong style={{ color: '#0f172a' }}>{orgOrScope}</strong>
                )}
                <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Phòng ban: {deptOrPosition}</span>
              </div>

              <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 }}>Quyền học</span>
                <strong style={{ color: '#0f172a', display: 'block' }}>
                  {u.workspace === 'enterprise' || u.organizationId
                    ? 'Theo tổ chức'
                    : PERSONAL_PLANS[u.planCode ?? ''] ?? 'Tài khoản tiêu chuẩn'}
                </strong>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {u.workspace === 'enterprise' || u.organizationId ? 'Học các khóa tổ chức đã mua' : 'Gói cá nhân'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KHÓA HỌC / GÓI BẢN QUYỀN / NHIỆM VỤ THEO ROLE */}
      {activeTab === 'courses' && !isSuperAdmin && (
        <div className="pa-org-detail-panel">
          {isOwner ? (
            /* OWNER: Gói dịch vụ & Bản quyền tổ chức */
            <div className="pa-org-detail-card">
              <div className="pa-org-detail-card-head">
                <span className="pa-org-detail-card-title">
                  <span className="pa-org-detail-icon-box" aria-hidden="true">
                    <Building2 size={14} />
                  </span>
                  Chủ doanh nghiệp
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, marginBottom: 12 }}>
                <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 }}>Tổ chức</span>
                  <strong style={{ color: '#0f172a', display: 'block' }}>{u.organizationName || 'Chưa gán'}</strong>
                  <span style={{ fontSize: 12, color: '#15803d' }}>Chủ doanh nghiệp</span>
                </div>

                <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 }}>Khóa đã mua và hợp đồng</span>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Xem ở hồ sơ tổ chức</strong>
                  <span style={{ fontSize: 12, color: '#0369a1' }}>Mở trang Tổ chức</span>
                </div>
              </div>

              <div style={{ padding: '12px 14px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 12.5, color: '#166534' }}>
                Chủ doanh nghiệp mua khóa học, quản lý nhân viên và hợp đồng của tổ chức.
              </div>
            </div>
          ) : isManager ? (
            /* MANAGER: Nhiệm vụ điều phối phòng ban */
            <div className="pa-org-detail-card">
              <div className="pa-org-detail-card-head">
                <span className="pa-org-detail-card-title">
                  <span className="pa-org-detail-icon-box" aria-hidden="true">
                    <Layers size={14} />
                  </span>
                  Phòng ban phụ trách
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, marginBottom: 12 }}>
                <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 }}>Phòng ban</span>
                  <strong style={{ color: '#0f172a', display: 'block' }}>{u.departmentName || 'Chưa gán phòng ban'}</strong>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Trực thuộc: {u.organizationName}</span>
                </div>

                <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 }}>Vai trò</span>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Quản lý phòng ban</strong>
                  <span style={{ fontSize: 12, color: '#15803d' }}>Theo dõi tiến độ học của nhân viên</span>
                </div>
              </div>

              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12.5, color: '#334155' }}>
                Quản lý phòng ban theo dõi tiến độ học và chấm bài cuối khóa của nhân viên trong phòng.
              </div>
            </div>
          ) : isMentor ? (
            /* MENTOR: Nhiệm vụ thẩm định & chấm bài */
            <div className="pa-org-detail-card">
              <div className="pa-org-detail-card-head">
                <span className="pa-org-detail-card-title">
                  <span className="pa-org-detail-icon-box" aria-hidden="true">
                    <Award size={14} />
                  </span>
                  Mentor
                </span>
              </div>


              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12.5, color: '#334155' }}>
                Mentor chấm bài tự luận của tổ chức dùng thử. Xem tổ chức đang phụ trách ở trang Đánh giá dùng thử.
              </div>
            </div>
          ) : (
            /* EMPLOYEE: Khóa học đã ghi danh */
            <div className="pa-org-detail-card">
              <div className="pa-org-detail-card-head">
                <span className="pa-org-detail-card-title">
                  <span className="pa-org-detail-icon-box" aria-hidden="true">
                    <GraduationCap size={14} />
                  </span>
                  Khóa học đã ghi danh ({enrolledCourses.length})
                </span>
              </div>

              {enrolledCourses.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '24px 0', margin: 0 }}>
                  Chưa ghi danh khóa học nào.
                </p>
              ) : (
                <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Khóa học</th>
                      <th>Cấp độ</th>
                      <th className="num">Tiến độ</th>
                      <th className="num">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledCourses.map((c) => (
                      <tr key={c.courseCode}>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{c.courseTitle}</strong>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Mã: {c.courseCode}</div>
                        </td>
                        <td>
                          <span
                            className={`pa-org-level-pill ${c.level === 1 ? 'is-basic' : c.level === 2 ? 'is-inter' : 'is-adv'
                              }`}
                          >
                            {c.levelName}
                          </span>
                        </td>
                        <td className="num" style={{ fontWeight: 600 }}>
                          <span style={{ color: c.progress === 100 ? '#15803d' : '#0284c7' }}>
                            {c.progress}%
                          </span>
                        </td>
                        <td className="num">
                          {c.score !== null ? (
                            <strong style={{ color: '#15803d' }}>{c.score} / 10</strong>
                          ) : (
                            <span style={{ color: '#64748b' }}>Chưa thi</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BẢO MẬT & QUẢN TRỊ */}
      {activeTab === 'security' && (
        <div className="pa-org-detail-panel">
          {/* Security Status Card */}
          <div className="pa-org-detail-card">
            <div className="pa-org-detail-card-head">
              <span className="pa-org-detail-card-title">
                <span className="pa-org-detail-icon-box" aria-hidden="true">
                  <ShieldCheck size={14} />
                </span>
                Trạng thái tài khoản
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 }}>Trạng thái tài khoản</span>
                <strong style={{ color: locked ? '#dc2626' : '#15803d', display: 'block' }}>
                  {locked ? 'Tài khoản đang bị khóa' : 'Đang hoạt động'}
                </strong>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {u.isManuallyLocked ? 'Khóa thủ công bởi quản trị viên' : 'Không bị khóa'}
                </span>
              </div>

              <div style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 }}>Mật khẩu</span>
                <button
                  type="button"
                  className="btn btn-outline btn-small inline-flex items-center gap-1.5"
                  onClick={handlePasswordReset}
                  disabled={resetPending}
                  style={{
                    borderColor: 'var(--pa-accent-border)',
                    color: 'var(--pa-accent-solid)',
                    background: '#ffffff',
                    marginTop: 2,
                  }}
                >
                  <Send size={12} aria-hidden="true" />
                  <span>{resetPending ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Form: Lock / Unlock */}
          {canManage && (
            <div className="pa-org-detail-action-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span
                  className="pa-org-detail-icon-box"
                  style={{ background: '#fff7ed', color: '#b85c24', borderColor: '#fed7aa' }}
                >
                  <ShieldAlert size={14} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  Khóa hoặc mở khóa tài khoản
                </span>
              </div>

              {!lockable ? (
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
                  Không thể khóa tài khoản Quản trị viên nền tảng, tài khoản của chính bạn hoặc tài khoản đã vô hiệu hóa.
                </p>
              ) : (
                <form onSubmit={onSubmit} style={{ marginTop: 10 }}>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                      Thao tác:{' '}
                      {locked ? (
                        <span style={{ color: '#15803d' }}>Mở khóa tài khoản</span>
                      ) : (
                        <span style={{ color: '#dc2626' }}>Khóa tài khoản</span>
                      )}
                    </span>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 10px' }}>
                      {locked
                        ? 'Mở khóa sẽ cho phép người dùng đăng nhập lại vào hệ thống ngay lập tức.'
                        : 'Khi bị khóa, người dùng sẽ không thể đăng nhập và mọi phiên làm việc đang mở bị hủy.'}
                    </p>
                  </div>

                  <ReasonField value={reason} onChange={setReason} />

                  <button
                    type="submit"
                    disabled={!isReasonValid(reason) || lockAction.isPending}
                    className="btn btn-primary btn-small inline-flex items-center gap-1.5"
                    style={{
                      marginTop: 10,
                      background: 'var(--pa-accent-solid)',
                      borderColor: 'var(--pa-accent-solid)',
                    }}
                  >
                    <span>
                      {lockAction.isPending
                        ? 'Đang ghi nhận…'
                        : locked
                          ? 'Mở khóa tài khoản'
                          : 'Khóa tài khoản'}
                    </span>
                    <ArrowRight size={13} aria-hidden="true" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
