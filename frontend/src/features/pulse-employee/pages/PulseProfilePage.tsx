import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  Clock,
  ArrowRight,
  Target,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Settings,
  Check,
  AlertTriangle,
  Laptop,
  Globe,
  BellRing,
  Sparkles,
  Layers,
  ChevronRight,
  Printer,
  Copy,
  Database,
  Users,
  PenTool,
  Lightbulb,
  Eye,
  EyeOff,
  User,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePulseOverview, usePulseOutcomes } from '@/hooks/use-pulse';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useChangePassword, useLoginHistory } from '@/hooks/use-platform';
import { formatDateTime, formatDate } from '@/lib/utils';
import { LoadError, PageSkeleton, PuLink } from '../components/ui';
import { initials, levelName, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

type ProfileTab = 'competency' | 'security' | 'preferences';

const PREFS_STORAGE_KEY = 'digitalent_user_preferences';

interface StoredPreferences {
  reviews: boolean;
  reminders: boolean;
  newCourses: boolean;
  language: 'vi' | 'en';
  focusMode: boolean;
}

const DEFAULT_PREFERENCES: StoredPreferences = {
  reviews: true,
  reminders: true,
  newCourses: true,
  language: 'vi',
  focusMode: true,
};

function readStoredPreferences(): StoredPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<StoredPreferences>;
    return {
      reviews: typeof parsed.reviews === 'boolean' ? parsed.reviews : DEFAULT_PREFERENCES.reviews,
      reminders: typeof parsed.reminders === 'boolean' ? parsed.reminders : DEFAULT_PREFERENCES.reminders,
      newCourses: typeof parsed.newCourses === 'boolean' ? parsed.newCourses : DEFAULT_PREFERENCES.newCourses,
      language: parsed.language === 'vi' || parsed.language === 'en' ? parsed.language : DEFAULT_PREFERENCES.language,
      focusMode: typeof parsed.focusMode === 'boolean' ? parsed.focusMode : DEFAULT_PREFERENCES.focusMode,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function formatDomainCode(domain: { number: number; code?: string | null }): string {
  if (!domain.code || domain.code.toUpperCase().includes('TT02')) {
    return `Lĩnh vực ${String(domain.number).padStart(2, '0')}`;
  }
  return domain.code;
}

const DOMAIN_ICONS: Record<number, React.ReactNode> = {
  1: <Database className="w-4 h-4 text-blue-700" />,
  2: <Users className="w-4 h-4 text-blue-700" />,
  3: <PenTool className="w-4 h-4 text-blue-700" />,
  4: <ShieldCheck className="w-4 h-4 text-blue-700" />,
  5: <Lightbulb className="w-4 h-4 text-blue-700" />,
  6: <Sparkles className="w-4 h-4 text-blue-700" />,
};

/**
 * Đo độ mạnh mật khẩu doanh nghiệp (tối thiểu 12 ký tự):
 * - Yếu (<12 ký tự hoặc quá đơn giản)
 * - Trung bình (đủ 12+ ký tự, có chữ và số)
 * - Mạnh (16+ ký tự, chữ hoa, chữ thường, số, ký tự đặc biệt)
 */
function getPasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: '', color: '#e2e8f0' };
  let score = 0;
  if (pass.length >= 12) score += 1;
  if (pass.length >= 16) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (pass.length < 12 || score <= 2) return { score: 1, label: 'Yếu', color: '#ef4444' };
  if (score <= 4) return { score: 2, label: 'Trung bình', color: '#f59e0b' };
  return { score: 3, label: 'Mạnh', color: '#10b981' };
}

/**
 * Trực quan hóa 3 cấp độ năng lực L1 - L3 (Segmented Track):
 * - L1: Cơ bản, L2: Trung cấp, L3: Nâng cao
 * - Đã đạt (done): Xanh ngọc lục bảo (emerald) kèm biểu tượng kiểm tra
 * - Mục tiêu lộ trình (target): Viền nét đứt màu xanh navy có chấm định vị
 * - Chưa đạt (empty): Màu xám nhạt trung tính
 */
function LevelBar3({ verified, target }: { verified: number; target: number }) {
  const cappedVerified = Math.min(3, Math.max(0, verified));
  const cappedTarget = Math.min(3, Math.max(0, target));
  const verifiedText = cappedVerified > 0 ? `L${cappedVerified} (${levelName(cappedVerified)})` : 'Chưa đánh giá';
  const targetText = cappedTarget > 0 ? `L${cappedTarget} (${levelName(cappedTarget)})` : 'Ngoài lộ trình';

  return (
    <div
      className="pu-benchmark-level-track"
      title={`Hiện tại: ${verifiedText} / Mục tiêu lộ trình: ${targetText}`}
    >
      {[1, 2, 3].map((lvl) => {
        const isDone = lvl <= cappedVerified;
        const isTarget = cappedTarget > 0 && lvl === cappedTarget && cappedVerified < cappedTarget;
        const cls = isDone ? 'done' : isTarget ? 'target' : 'empty';
        return (
          <div
            key={lvl}
            className={`pu-benchmark-seg ${cls}`}
            title={`Cấp ${lvl} · ${levelName(lvl)}${isDone ? ' (Đã đạt)' : isTarget ? ' (Mục tiêu lộ trình)' : ''}`}
          >
            <span className="pu-seg-label">L{lvl}</span>
            {isDone && <Check className="w-2.5 h-2.5" style={{ marginLeft: 1 }} />}
            {isTarget && <span className="pu-target-dot" />}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Hồ sơ Năng lực Nhân sự (§3):
 * - Tab 1: Hồ sơ Năng lực Số (Competency Passport & Benchmark Matrix)
 * - Tab 2: Bảo mật & Đổi Mật khẩu (Security & Credentials)
 * - Tab 3: Tùy chọn Cá nhân & Thông báo (Preferences)
 */
export function PulseProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('competency');
  const [copiedCode, setCopiedCode] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const user = useCurrentUser((s) => s.user);
  const { data, isLoading, error, refetch } = usePulseOverview();
  const { data: outcomes } = usePulseOutcomes();

  // Tab 2: Security States
  const changePassword = useChangePassword();
  const { data: loginHistory, isLoading: isLoginHistoryLoading, isError: isLoginHistoryError } = useLoginHistory();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurPass, setShowCurPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Tab 3: Preferences States (khởi tạo đồng bộ từ localStorage)
  const [prefs, setPrefs] = useState<StoredPreferences>(readStoredPreferences);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  if (isLoading) return <PageSkeleton />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được hồ sơ.')} onRetry={() => refetch()} />;

  const { person, stats } = data;
  const name =
    person.fullName && person.fullName !== 'Employee'
      ? person.fullName
      : user?.fullName && user.fullName !== 'Employee'
        ? user.fullName
        : 'Nhân viên';

  const empCode = person.employeeId ? `EMP-${person.employeeId.slice(0, 8).toUpperCase()}` : null;
  const departmentName = person.departmentName || 'Chưa phân bổ phòng ban';
  const positionName = person.positionName || 'Chưa gán vị trí công việc';
  const organizationName = user?.organization?.name || person.organizationName || 'Doanh nghiệp';
  const contactEmail = person.workEmail || user?.email || 'Chưa cập nhật email';

  // Đồng bộ số liệu giữa KPI và Ma trận theo status/pathTop từ máy chủ:
  // - Đạt chuẩn lộ trình: status === 'MET'
  // - Còn khoảng cách cần bồi dưỡng: status === 'GAP' hoặc 'PENDING' (nằm trong lộ trình và verified < pathTop)
  const metDomainCount = data.domains.filter((d) => d.status === 'MET').length;
  const gapDomainCount = data.domains.filter((d) => d.status === 'GAP' || d.status === 'PENDING').length;

  const readinessPercent =
    stats.pathCourses > 0 ? Math.min(100, Math.round((stats.approvedPathCourses / stats.pathCourses) * 100)) : 0;

  const passwordStrength = getPasswordStrength(newPassword);

  const handleCopyCode = async () => {
    if (!empCode) return;
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(empCode);
      setCopiedCode(true);
      toast.success(`Đã sao chép mã định danh: ${empCode}`);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      toast.error('Không thể sao chép tự động. Vui lòng chọn và sao chép mã thủ công.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 12 || newPassword.length > 128) {
      toast.error('Mật khẩu mới phải từ 12 đến 128 ký tự.');
      return;
    }
    if (newPassword === currentPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      toast.success('Đã đổi mật khẩu thành công.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurPass(false);
      setShowNewPass(false);
      setShowConfirmPass(false);
    } catch (err: unknown) {
      toast.error(pulseErrorMessage(err, 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.'));
    }
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
      toast.success('Đã lưu tùy chọn cá nhân.');
    } catch {
      toast.error('Không thể lưu tùy chọn trên trình duyệt này. Vui lòng kiểm tra quyền lưu trữ.');
    }
  };

  return (
    <div className="pu-stack">
      {/* ── Khối Tiêu đề Chuẩn Đồng bộ Toàn Hệ thống ───────────────── */}
      <header className="pu-workbench-header">
        <div className="pu-path-title-block">
          <div className="pu-path-badge-pill">
            <User size={13} className="text-blue-800" />
            <span>Hồ sơ Cá nhân & Năng lực</span>
          </div>
          <h1 className="pu-path-main-title">Hồ sơ cá nhân</h1>
          <p className="pu-path-sub-title">
            Quản trị thông tin cá nhân, hồ sơ năng lực số đã bảo chứng, thiết lập bảo mật và tùy chọn tài khoản.
          </p>
        </div>
        <div className="pu-workbench-actions pu-no-print">
          <button
            type="button"
            className="pu-hero-action-secondary"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            <span>Xuất hồ sơ (PDF)</span>
          </button>
          <Link
            to={PULSE_PATHS.path}
            className="pu-hero-action-primary"
          >
            <span>Xem lộ trình bồi dưỡng</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ── Sub-tab Navigation Bar (Segmented Capsule) ────────────────── */}
      <nav className="pu-profile-tab-bar pu-no-print" aria-label="Phân mục hồ sơ" role="tablist">
        <button
          id="tab-competency"
          type="button"
          role="tab"
          aria-selected={activeTab === 'competency'}
          aria-controls="panel-competency"
          className={`pu-profile-tab-btn${activeTab === 'competency' ? ' active' : ''}`}
          onClick={() => setActiveTab('competency')}
        >
          <Award className="w-4 h-4" />
          <span>Hồ sơ năng lực số</span>
        </button>

        <button
          id="tab-security"
          type="button"
          role="tab"
          aria-selected={activeTab === 'security'}
          aria-controls="panel-security"
          className={`pu-profile-tab-btn${activeTab === 'security' ? ' active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <KeyRound className="w-4 h-4" />
          <span>Bảo mật & đổi mật khẩu</span>
        </button>

        <button
          id="tab-preferences"
          type="button"
          role="tab"
          aria-selected={activeTab === 'preferences'}
          aria-controls="panel-preferences"
          className={`pu-profile-tab-btn${activeTab === 'preferences' ? ' active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <Settings className="w-4 h-4" />
          <span>Tùy chọn & thông báo</span>
        </button>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: HỒ SƠ NĂNG LỰC SỐ (COMPETENCY PASSPORT & MATRIX)
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'competency' && (
        <div
          id="panel-competency"
          role="tabpanel"
          aria-labelledby="tab-competency"
          key="competency"
          className="pu-tab-pane pu-stack"
        >
          {/* ── Thẻ Thông tin Nhân sự Chuẩn Doanh nghiệp (Executive Competency Passport Card) ── */}
          <section className="pu-executive-card" aria-label="Thông tin nhân sự và Hộ chiếu năng lực">
            <div className="pu-executive-accent-bar" />

            <div className="pu-executive-card-inner">
              <div className="pu-executive-main">
                <div className="pu-executive-avatar-wrap">
                  <div className="pu-executive-avatar" aria-hidden="true">
                    {initials(name)}
                  </div>
                  <div className="pu-executive-avatar-badge" title="Tài khoản đã xác thực">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div className="pu-executive-content">
                  <div className="pu-executive-header-row">
                    <h2 className="pu-executive-name">{name}</h2>
                    <span className="pu-executive-status-pill">
                      <span className="pu-status-live-dot" />
                      <span>Nhân viên chính thức</span>
                    </span>
                  </div>

                  <div className="pu-executive-role-row">
                    <span className="pu-role-position">{positionName}</span>
                    <span className="pu-role-divider" aria-hidden="true">•</span>
                    <span className="pu-role-dept">{departmentName}</span>
                    <span className="pu-role-divider" aria-hidden="true">•</span>
                    <span className="pu-role-org">{organizationName}</span>
                  </div>

                  <div className="pu-executive-chips">
                    <div className="pu-chip-static">
                      <span className="pu-chip-label">Mã định danh:</span>
                      <code className="pu-chip-code">{empCode ?? 'Chưa cập nhật'}</code>
                    </div>

                    <div className="pu-chip-static">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{contactEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Khối Thao tác nhanh Hồ sơ (Bên phải) */}
              {empCode && (
                <div className="pu-executive-actions pu-no-print">
                  <button
                    type="button"
                    className="pu-hero-action-secondary"
                    onClick={handleCopyCode}
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Đã sao chép mã' : 'Sao chép mã định danh'}</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ── 4 Thẻ KPI Đồng bộ hoàn toàn với Ma trận ─────────────────── */}
          <section className="pu-talent-kpi-grid" aria-label="Chỉ số năng lực">
            <div className="pu-tkpi-card">
              <div className="pu-tkpi-header">
                <span className="pu-tkpi-title">Tiến độ lộ trình bắt buộc</span>
                <Award className="w-4 h-4 text-blue-700" />
              </div>
              <div className="pu-tkpi-value">{stats.approvedPathCourses}/{stats.pathCourses} chuyên đề</div>
              <div className="pu-tkpi-progress">
                <div className="pu-tkpi-progress-bar" style={{ width: `${readinessPercent}%` }} />
              </div>
              <div className="pu-tkpi-footer">
                <span style={{ color: '#1e40af', fontWeight: 700 }}>{readinessPercent}%</span> hoàn thành chuẩn vị trí
              </div>
            </div>

            <div className="pu-tkpi-card">
              <div className="pu-tkpi-header">
                <span className="pu-tkpi-title">Khoảng cách kỹ năng</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="pu-tkpi-value" style={{ color: '#b45309' }}>{gapDomainCount} lĩnh vực</div>
              <div className="pu-tkpi-footer">
                <span style={{ color: '#b45309' }}>Cần bồi dưỡng theo vị trí</span>
              </div>
            </div>

            <div className="pu-tkpi-card">
              <div className="pu-tkpi-header">
                <span className="pu-tkpi-title">Năng lực đã bảo chứng</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="pu-tkpi-value" style={{ color: '#047857' }}>{metDomainCount} lĩnh vực</div>
              <div className="pu-tkpi-footer">
                <span style={{ color: '#047857' }}>Đã đạt chuẩn lộ trình</span>
              </div>
            </div>

            <div className="pu-tkpi-card">
              <div className="pu-tkpi-header">
                <span className="pu-tkpi-title">Hồ sơ chờ duyệt</span>
                <Clock className="w-4 h-4 text-sky-600" />
              </div>
              <div className="pu-tkpi-value">{stats.inReview} bài làm</div>
              <div className="pu-tkpi-footer">
                <span style={{ color: '#0284c7' }}>Quản lý đang đánh giá</span>
              </div>
            </div>
          </section>

          {/* ── Bảng Ma trận Đối sánh Năng lực Số Doanh nghiệp ── */}
          <section className="pu-benchmark-card">
            <div className="pu-benchmark-header">
              <div>
                <div className="pu-benchmark-title-wrap">
                  <div className="pu-benchmark-icon">
                    <Target className="w-4 h-4" />
                  </div>
                  <h2 className="pu-benchmark-h2">Ma trận đối sánh năng lực số doanh nghiệp</h2>
                </div>
                <p className="pu-benchmark-desc">
                  Đối sánh mức năng lực hiện tại của bạn theo từng lĩnh vực với chuẩn vị trí chức danh và trần đào tạo phòng ban.
                </p>
              </div>

              <PuLink to={PULSE_PATHS.path} kind="outline" small className="pu-no-print">
                Xem lộ trình chi tiết →
              </PuLink>
            </div>

            <div className="pu-benchmark-table-wrap">
              <table className="pu-benchmark-table">
                <thead>
                  <tr>
                    <th>Lĩnh vực năng lực</th>
                    <th>Hiện tại</th>
                    <th>Chuẩn vị trí</th>
                    <th>Trần PB</th>
                    <th>Tiến độ (L1 đến L3)</th>
                    <th>Chênh lệch</th>
                    <th style={{ textAlign: 'right' }} className="pu-no-print">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {data.domains.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '24px 16px' }}>
                        Chưa có dữ liệu lĩnh vực năng lực cho vị trí hiện tại. Xem{' '}
                        <Link to={PULSE_PATHS.path} style={{ color: '#1e40af', fontWeight: 600 }}>
                          lộ trình đào tạo
                        </Link>{' '}
                        hoặc liên hệ quản lý để được phân bổ.
                      </td>
                    </tr>
                  ) : (
                    data.domains.map((domain) => {
                      const positionTarget = Math.min(3, Math.max(0, domain.target));
                      const cappedCeiling = Math.min(3, Math.max(0, domain.ceiling));
                      const rawPathTop =
                        domain.pathTop ?? (domain.target > 0 ? Math.min(domain.target, domain.ceiling) : 0);
                      const effectiveTarget = Math.min(3, Math.max(0, rawPathTop));
                      const cappedVerified = Math.min(3, Math.max(0, domain.verified));
                      const isOutsidePath =
                        domain.status === 'OUTSIDE_PATH' || positionTarget <= 0 || effectiveTarget <= 0;
                      const isMet =
                        !isOutsidePath && (domain.status === 'MET' || cappedVerified >= effectiveTarget);
                      const diff = isOutsidePath ? 0 : Math.max(0, effectiveTarget - cappedVerified);

                      const domainCourseIds = new Set(
                        data.courses.filter((c) => c.categoryId === domain.categoryId).map((c) => c.courseId)
                      );
                      const matchingOutcomes = (outcomes ?? []).filter((o) => {
                        if (o.courseId && domainCourseIds.has(o.courseId)) return true;
                        const belongsToOtherCourse = Boolean(
                          o.courseId &&
                            data.courses.some((c) => c.courseId === o.courseId && c.categoryId !== domain.categoryId)
                        );
                        if (belongsToOtherCourse) return false;
                        return Boolean(o.subtitle?.includes(domain.name) || o.title.includes(domain.name));
                      });
                      const domainOutcome =
                        matchingOutcomes.length > 0
                          ? matchingOutcomes.reduce((best, cur) =>
                              (cur.level ?? 0) > (best.level ?? 0) ? cur : best
                            )
                          : undefined;
                      const domainIcon = DOMAIN_ICONS[domain.number] || <Layers className="w-4 h-4 text-slate-600" />;

                      return (
                        <tr key={domain.categoryId}>
                          <td>
                            <div className="pu-benchmark-domain-cell">
                              <div className="pu-benchmark-domain-icon">
                                {domainIcon}
                              </div>
                              <div>
                                <div className="pu-benchmark-domain-name">{domain.name}</div>
                                <div className="pu-benchmark-domain-meta">
                                  <span className="pu-benchmark-code-tag">
                                    {formatDomainCode(domain)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            {cappedVerified > 0 ? (
                              <span className="pu-benchmark-pill-verified">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                L{cappedVerified} · {levelName(cappedVerified)}
                              </span>
                            ) : (
                              <span className="pu-benchmark-pill-unassessed">
                                Chưa đánh giá
                              </span>
                            )}
                          </td>

                          <td>
                            {positionTarget > 0 ? (
                              <span className="pu-benchmark-pill-target">
                                L{positionTarget} · {levelName(positionTarget)}
                              </span>
                            ) : (
                              <span className="pu-benchmark-pill-unassessed">
                                Không yêu cầu
                              </span>
                            )}
                          </td>

                          <td>
                            {cappedCeiling > 0 ? (
                              <span
                                className="pu-benchmark-ceiling-tag"
                                title={
                                  positionTarget > 0 && cappedCeiling < positionTarget
                                    ? `Lộ trình hiện dừng ở L${cappedCeiling} theo trần đào tạo phòng ban`
                                    : undefined
                                }
                              >
                                Trần L{cappedCeiling}
                              </span>
                            ) : (
                              <span className="pu-benchmark-pill-unassessed">
                                Chưa mở
                              </span>
                            )}
                          </td>

                          {/* Thanh 3 Vạch Trực Quan (Level Bar L1 - L3) */}
                          <td>
                            <LevelBar3 verified={cappedVerified} target={effectiveTarget} />
                          </td>

                          {/* Cột Chênh lệch ngắn gọn, trực quan */}
                          <td>
                            {isOutsidePath ? (
                              <span className="pu-benchmark-pill-unassessed">
                                Ngoài lộ trình
                              </span>
                            ) : isMet ? (
                              <span className="pu-benchmark-gap-met">
                                <Check className="w-3.5 h-3.5" />
                                Đạt chuẩn
                              </span>
                            ) : (
                              <span className={diff > 1 ? 'pu-benchmark-gap-danger' : 'pu-benchmark-gap-warning'}>
                                {diff > 1 ? <AlertCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                Thiếu {diff} cấp
                              </span>
                            )}
                          </td>

                          <td style={{ textAlign: 'right' }} className="pu-no-print">
                            {(isMet || isOutsidePath) && domainOutcome ? (
                              <Link to={PULSE_PATHS.outcome(domainOutcome.id)} className="pu-benchmark-action-cert">
                                <Sparkles className="w-3.5 h-3.5" />
                                Xem chứng chỉ
                              </Link>
                            ) : isMet ? (
                              <Link to={PULSE_PATHS.path} className="pu-benchmark-action-cert">
                                Xem lộ trình
                              </Link>
                            ) : isOutsidePath ? (
                              <span className="pu-benchmark-pill-unassessed">
                                Không bắt buộc
                              </span>
                            ) : (
                              <Link to={PULSE_PATHS.path} className="pu-benchmark-action-study">
                                Bồi dưỡng ngay
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Thanh Chú giải Ký hiệu Cấp độ Trực quan */}
            <div className="pu-benchmark-legend pu-no-print">
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Chú giải cấp độ:</span>
              <div className="pu-legend-item">
                <span className="pu-legend-dot" style={{ background: '#059669' }} />
                <span>Đã đạt chuẩn</span>
              </div>
              <div className="pu-legend-item">
                <span className="pu-legend-dot" style={{ background: '#eff6ff', border: '1.5px dashed #2563eb' }} />
                <span>Mục tiêu chuẩn chức danh</span>
              </div>
              <div className="pu-legend-item">
                <span className="pu-legend-dot" style={{ background: '#f1f5f9' }} />
                <span>Chưa hoàn thành</span>
              </div>
            </div>
          </section>

          {/* ── Bộ sưu tập Chứng chỉ Số Đã Xác thực (Verified Credentials Showcase) ── */}
          {outcomes && outcomes.length > 0 && (
            <section className="pu-surface pu-pad">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="pu-panel-icon">
                      <Award className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h2 className="pu-panel-h2">Chứng chỉ số & năng lực đã bảo chứng ({outcomes.length})</h2>
                  </div>
                  <p className="pu-panel-desc" style={{ margin: '4px 0 0', maxWidth: 640 }}>
                    Các văn bằng điện tử nội bộ đã được người có thẩm quyền phê duyệt chính thức.
                  </p>
                </div>

                <PuLink to={PULSE_PATHS.outcomes} kind="outline" small className="pu-no-print">
                  Xem tất cả chứng nhận →
                </PuLink>
              </div>

              <div className="pu-cert-grid">
                {outcomes.map((outcome) => (
                  <Link key={outcome.id} to={PULSE_PATHS.outcome(outcome.id)} className="pu-cert-card group">
                    <div className="pu-cert-accent-bar" />
                    <div className="pu-cert-body">
                      <div className="pu-cert-top">
                        <span className="pu-cert-badge">
                          <Award className="w-3.5 h-3.5 text-indigo-600" />
                          Chứng chỉ năng lực số
                        </span>
                        <span className="pu-cert-status">
                          <span className="pu-status-dot" />
                          Đã duyệt
                        </span>
                      </div>

                      {outcome.subtitle && (
                        <div className="pu-cert-domain">{outcome.subtitle}</div>
                      )}

                      <h3 className="pu-cert-title">{outcome.title}</h3>

                      <div className="pu-cert-meta-row">
                        <span className="pu-cert-date">
                          Cấp ngày: {formatDate(outcome.issuedAt)}
                        </span>
                        <span className="pu-cert-ref">
                          Mã: <code>{outcome.reference}</code>
                        </span>
                      </div>
                    </div>

                    <div className="pu-cert-footer">
                      <span className="pu-cert-cta">
                        Mở chi tiết chứng chỉ
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: BẢO MẬT & ĐỔI MẬT KHẨU (SECURITY & CREDENTIALS)
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div
          id="panel-security"
          role="tabpanel"
          aria-labelledby="tab-security"
          key="security"
          className="pu-tab-pane pu-stack"
        >
          <div className="pu-security-grid">
          {/* Cột Trái: Form Đổi mật khẩu an toàn */}
          <div className="pu-sec-card">
            <div className="pu-sec-header">
              <div className="pu-sec-icon-wrap">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="pu-sec-title">Đổi mật khẩu đăng nhập</h2>
                <p className="pu-sec-sub">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản doanh nghiệp của bạn.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="pu-sec-form">
              <div className="pu-input-group">
                <label className="pu-input-label" htmlFor="cur-pass">
                  Mật khẩu hiện tại *
                </label>
                <div className="pu-input-password-wrap">
                  <input
                    id="cur-pass"
                    type={showCurPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="pu-input-field"
                  />
                  <button
                    type="button"
                    className="pu-password-toggle-btn"
                    onClick={() => setShowCurPass(!showCurPass)}
                    title={showCurPass ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'}
                    aria-label={showCurPass ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'}
                  >
                    {showCurPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pu-input-group">
                <label className="pu-input-label" htmlFor="new-pass">
                  Mật khẩu mới * (Từ 12 đến 128 ký tự)
                </label>
                <div className="pu-input-password-wrap">
                  <input
                    id="new-pass"
                    type={showNewPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Nhập mật khẩu mới (tối thiểu 12 ký tự)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pu-input-field"
                  />
                  <button
                    type="button"
                    className="pu-password-toggle-btn"
                    onClick={() => setShowNewPass(!showNewPass)}
                    title={showNewPass ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                    aria-label={showNewPass ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="pu-pass-strength-wrap">
                    <div className="pu-pass-strength-bar">
                      <div className={`pu-pass-strength-seg ${passwordStrength.score >= 1 ? (passwordStrength.score === 1 ? 'active-weak' : passwordStrength.score === 2 ? 'active-med' : 'active-strong') : ''}`} />
                      <div className={`pu-pass-strength-seg ${passwordStrength.score >= 2 ? (passwordStrength.score === 2 ? 'active-med' : 'active-strong') : ''}`} />
                      <div className={`pu-pass-strength-seg ${passwordStrength.score >= 3 ? 'active-strong' : ''}`} />
                    </div>
                    <span className="pu-pass-strength-label" style={{ color: passwordStrength.color }}>
                      Độ mạnh: {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="pu-input-group">
                <label className="pu-input-label" htmlFor="confirm-pass">
                  Xác nhận mật khẩu mới *
                </label>
                <div className="pu-input-password-wrap">
                  <input
                    id="confirm-pass"
                    type={showConfirmPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pu-input-field"
                  />
                  <button
                    type="button"
                    className="pu-password-toggle-btn"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    title={showConfirmPass ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                    aria-label={showConfirmPass ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                Mật khẩu mới cần dài từ 12 đến 128 ký tự, khác email đăng nhập và nên gồm chữ hoa, chữ thường, chữ số cùng ký tự đặc biệt.
              </div>

              <button type="submit" disabled={changePassword.isPending} className="pu-sec-submit-btn">
                <KeyRound className="w-4 h-4" />
                <span>{changePassword.isPending ? 'Đang cập nhật mật khẩu…' : 'Lưu mật khẩu mới'}</span>
              </button>
            </form>
          </div>

          {/* Cột Phải: Lịch sử Phiên đăng nhập & Chính sách An ninh */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="pu-sec-card">
              <div className="pu-sec-header">
                <div className="pu-sec-icon-wrap" style={{ background: '#eff6ff', color: '#1e40af' }}>
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="pu-sec-title">Lịch sử phiên đăng nhập gần đây</h2>
                  <p className="pu-sec-sub">Theo dõi các thiết bị và địa chỉ IP đã truy cập vào tài khoản.</p>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="pu-login-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>IP</th>
                      <th>Trình duyệt & OS</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoginHistoryLoading ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>
                          Đang tải lịch sử đăng nhập…
                        </td>
                      </tr>
                    ) : isLoginHistoryError ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: '#b91c1c', padding: '20px 0' }}>
                          Không tải được lịch sử đăng nhập. Vui lòng thử lại sau.
                        </td>
                      </tr>
                    ) : loginHistory && loginHistory.length > 0 ? (
                      loginHistory.slice(0, 5).map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontFamily: 'ui-monospace, monospace' }}>
                            {formatDateTime(item.timestamp)}
                          </td>
                          <td style={{ fontFamily: 'ui-monospace, monospace', color: '#64748b' }}>
                            {item.ip || 'Không rõ'}
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{item.browser || 'Không rõ'}</span>
                            {item.os ? ` (${item.os})` : ''}
                          </td>
                          <td>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: item.status === 'SUCCESS' ? '#ecfdf5' : '#fef2f2', color: item.status === 'SUCCESS' ? '#065f46' : '#991b1b' }}>
                              {item.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>
                          Chưa có lịch sử đăng nhập được ghi nhận.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Thẻ Chính sách An ninh vắn tắt */}
            <div className="pu-sec-card" style={{ background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                  Bảo vệ tài khoản doanh nghiệp (Enterprise Auth)
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.55 }}>
                Tài khoản của bạn tuân thủ chính sách kiểm soát truy cập và bảo mật dữ liệu của DigiTalent AI.
                Phiên đăng nhập sẽ tự động hết hiệu lực sau 7 ngày không hoạt động. Nếu nghi ngờ tài khoản bị xâm nhập,
                vui lòng đổi mật khẩu ngay lập tức hoặc liên hệ bộ phận IT Quản trị.
              </p>
            </div>
          </div>
        </div>

        {/* Khối Thỏa ước Tuân thủ Năng lực Số Doanh nghiệp */}
        <section className="pu-compliance-accord-card" aria-label="Thỏa ước Tuân thủ Năng lực Số">
          <div className="pu-compliance-accord-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div className="pu-sec-icon-wrap" style={{ background: '#eff6ff', color: '#1e40af' }}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="pu-compliance-accord-title">
                    Thỏa ước Tuân thủ & Chuẩn mực Đào tạo Năng lực Số 2026
                  </h2>
                  <p className="pu-compliance-accord-desc">
                    Quy chế áp dụng cho cán bộ nhân viên tham gia chuẩn hóa theo khung năng lực chức danh và Tiêu chuẩn An toàn Thông tin Doanh nghiệp.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="pu-compliance-status-badge">
                <CheckCircle2 className="w-4 h-4" />
                Đã cam kết tuân thủ · Hiệu lực đến 31/12/2026
              </span>
              <button
                type="button"
                className="pu-hero-action-secondary"
                style={{ padding: '6px 12px', fontSize: 12 }}
                onClick={() => window.print()}
              >
                <Printer className="w-3.5 h-3.5" />
                Xuất Thỏa ước (PDF)
              </button>
            </div>
          </div>

          <div className="pu-compliance-policy-grid">
            <div className="pu-policy-item">
              <div className="pu-policy-item-head">
                <div className="pu-policy-icon" style={{ color: '#1e40af' }}>
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="pu-policy-title">Điều 1: Liêm chính Đánh giá & Giám sát Khách quan</h3>
              </div>
              <p className="pu-policy-body">
                Nhân viên cam kết độc lập làm bài, không sử dụng tài liệu cấm hoặc người thi hộ. Khi ứng dụng công cụ AI tạo sinh hỗ trợ thực hành, bắt buộc dẫn nguồn câu lệnh (prompt) và chịu trách nhiệm giải trình về tính xác thực của nội dung.
              </p>
            </div>

            <div className="pu-policy-item">
              <div className="pu-policy-item-head">
                <div className="pu-policy-icon" style={{ color: '#059669' }}>
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="pu-policy-title">Điều 2: Bảo mật Dữ liệu Khách hàng & Sở hữu Trí tuệ</h3>
              </div>
              <p className="pu-policy-body">
                Tuyệt đối không nhập thông tin định danh khách hàng, số liệu tài chính mật hoặc bí mật kinh doanh chưa công bố vào các công cụ AI bên ngoài. Toàn bộ bài thực hành phải dùng tập dữ liệu giả định (Dummy Data) của DigiTalent.
              </p>
            </div>

            <div className="pu-policy-item">
              <div className="pu-policy-item-head">
                <div className="pu-policy-icon" style={{ color: '#d97706' }}>
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="pu-policy-title">Điều 3: Cam kết Chuẩn hóa Năng lực (SLA 90 ngày)</h3>
              </div>
              <p className="pu-policy-body">
                Cán bộ nhân viên có trách nhiệm hoàn thành lộ trình bồi dưỡng và vượt qua các kỳ đánh giá bắt buộc theo ngạch bậc chức danh trong vòng 90 ngày kể từ ngày phân bổ; duy trì và cập nhật hồ sơ năng lực định kỳ mỗi 12 tháng.
              </p>
            </div>

            <div className="pu-policy-item">
              <div className="pu-policy-item-head">
                <div className="pu-policy-icon" style={{ color: '#0284c7' }}>
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="pu-policy-title">Điều 4: Thẩm định 2 Cấp & Cam kết SLA Phúc khảo</h3>
              </div>
              <p className="pu-policy-body">
                Trưởng bộ phận cam kết phản hồi thẩm định minh chứng trong vòng 48 giờ làm việc. Nhân viên có quyền gửi yêu cầu phúc khảo độc lập trong vòng 05 ngày làm việc nếu phát hiện có sai sót hoặc sự cố kỹ thuật trong quá trình đánh giá.
              </p>
            </div>
          </div>
        </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: TÙY CHỌN & THÔNG BÁO (PREFERENCES)
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'preferences' && (
        <div
          id="panel-preferences"
          role="tabpanel"
          aria-labelledby="tab-preferences"
          key="preferences"
          className="pu-tab-pane pu-pref-grid"
        >
          {/* Cột Trái: Cài đặt Thông báo Email */}
          <div className="pu-sec-card">
            <div className="pu-sec-header">
              <div className="pu-sec-icon-wrap" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h2 className="pu-sec-title">Kênh thông báo qua Email</h2>
                <p className="pu-sec-sub">Tùy chỉnh các sự kiện hệ thống sẽ gửi thông báo đến hộp thư công việc của bạn.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="pu-pref-item">
                <div>
                  <div className="pu-pref-item-title">Kết quả đánh giá bài kiểm tra & thực hành</div>
                  <div className="pu-pref-item-desc">Nhận thông báo ngay khi người thẩm định hoàn tất nhận xét hoặc duyệt bài làm.</div>
                </div>
                <label className="pu-switch-control" htmlFor="pref-reviews" title="Bật/tắt thông báo kết quả đánh giá">
                  <input
                    id="pref-reviews"
                    type="checkbox"
                    checked={prefs.reviews}
                    onChange={(e) => setPrefs((prev) => ({ ...prev, reviews: e.target.checked }))}
                    className="pu-switch-checkbox"
                  />
                  <span className="pu-switch-track" />
                </label>
              </div>

              <div className="pu-pref-item">
                <div>
                  <div className="pu-pref-item-title">Nhắc nhở tiến độ & Hạn chót</div>
                  <div className="pu-pref-item-desc">Nhắc nhở khi sắp đến thời hạn nộp bài thực hành hoặc kỳ đánh giá năng lực năm.</div>
                </div>
                <label className="pu-switch-control" htmlFor="pref-reminders" title="Bật/tắt nhắc nhở tiến độ">
                  <input
                    id="pref-reminders"
                    type="checkbox"
                    checked={prefs.reminders}
                    onChange={(e) => setPrefs((prev) => ({ ...prev, reminders: e.target.checked }))}
                    className="pu-switch-checkbox"
                  />
                  <span className="pu-switch-track" />
                </label>
              </div>

              <div className="pu-pref-item">
                <div>
                  <div className="pu-pref-item-title">Khóa học & Chuyên đề mới được gán</div>
                  <div className="pu-pref-item-desc">Thông báo khi doanh nghiệp phân bổ thêm khóa học mới vào lộ trình vị trí của bạn.</div>
                </div>
                <label className="pu-switch-control" htmlFor="pref-courses" title="Bật/tắt thông báo khóa học mới">
                  <input
                    id="pref-courses"
                    type="checkbox"
                    checked={prefs.newCourses}
                    onChange={(e) => setPrefs((prev) => ({ ...prev, newCourses: e.target.checked }))}
                    className="pu-switch-checkbox"
                  />
                  <span className="pu-switch-track" />
                </label>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button type="button" onClick={handleSavePreferences} className="pu-sec-submit-btn">
                <Check className="w-4 h-4" />
                <span>Lưu tùy chọn thông báo</span>
              </button>
            </div>
          </div>

          {/* Cột Phải: Ngôn ngữ & Không gian học tập */}
          <div className="pu-sec-card">
            <div className="pu-sec-header">
              <div className="pu-sec-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="pu-sec-title">Ngôn ngữ & Trải nghiệm học</h2>
                <p className="pu-sec-sub">Cấu hình ngôn ngữ hiển thị và chế độ tương tác bài học.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="pu-pref-item">
                <div>
                  <label htmlFor="pref-language" className="pu-pref-item-title" style={{ display: 'block' }}>
                    Ngôn ngữ hiển thị
                  </label>
                  <div className="pu-pref-item-desc">Ngôn ngữ mặc định cho giao diện và tài liệu đào tạo.</div>
                </div>
                <select
                  id="pref-language"
                  aria-label="Ngôn ngữ hiển thị"
                  value={prefs.language}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, language: e.target.value as 'vi' | 'en' }))}
                  className="pu-input-field"
                  style={{ width: 'auto', minWidth: 140 }}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="pu-pref-item">
                <div>
                  <div className="pu-pref-item-title">Chế độ học tập tập trung (Focus Mode)</div>
                  <div className="pu-pref-item-desc">Tự động ẩn thanh bên khi đọc bài để dễ tập trung.</div>
                </div>
                <label className="pu-switch-control" htmlFor="pref-focus" title="Bật/tắt chế độ học tập tập trung">
                  <input
                    id="pref-focus"
                    type="checkbox"
                    checked={prefs.focusMode}
                    onChange={(e) => setPrefs((prev) => ({ ...prev, focusMode: e.target.checked }))}
                    className="pu-switch-checkbox"
                  />
                  <span className="pu-switch-track" />
                </label>
              </div>

              <div className="pu-pref-item">
                <div>
                  <div className="pu-pref-item-title">Tự động đồng bộ tiến độ học</div>
                  <div className="pu-pref-item-desc">Lưu tiến độ đọc nội dung và câu hỏi kiểm tra theo thời gian thực về máy chủ.</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: 6 }}>
                  Bật mặc định
                </span>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button type="button" onClick={handleSavePreferences} className="pu-sec-submit-btn">
                <Check className="w-4 h-4" />
                <span>Lưu cấu hình trải nghiệm</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
