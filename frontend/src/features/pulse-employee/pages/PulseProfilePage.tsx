import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { usePulseOverview, usePulseOutcomes } from '@/hooks/use-pulse';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useChangePassword, useLoginHistory } from '@/hooks/use-platform';
import { formatDateTime, formatDate } from '@/lib/utils';
import { LoadError, PageSkeleton, PuLink } from '../components/ui';
import { initials, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

type ProfileTab = 'competency' | 'security' | 'preferences';

const PREFS_STORAGE_KEY = 'digitalent_user_preferences';

function formatDomainCode(domain: { number: number; code?: string | null }): string {
  if (!domain.code || domain.code.toUpperCase().includes('TT02')) {
    return `Lĩnh vực 0${domain.number}`;
  }
  return domain.code;
}

const DOMAIN_ICONS: Record<number, React.ReactNode> = {
  1: <Database className="w-4 h-4 text-indigo-600" />,
  2: <Users className="w-4 h-4 text-sky-600" />,
  3: <PenTool className="w-4 h-4 text-violet-600" />,
  4: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
  5: <Lightbulb className="w-4 h-4 text-amber-600" />,
  6: <Sparkles className="w-4 h-4 text-pink-600" />,
};

/**
 * Đo độ mạnh mật khẩu doanh nghiệp:
 * - Yếu (<8 ký tự hoặc quá đơn giản)
 * - Trung bình (đủ độ dài, có chữ và số)
 * - Mạnh (chữ hoa, chữ thường, số, ký tự đặc biệt)
 */
function getPasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: '', color: '#e2e8f0' };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (pass.length >= 12) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 2) return { score: 1, label: 'Yếu', color: '#ef4444' };
  if (score <= 4) return { score: 2, label: 'Trung bình', color: '#f59e0b' };
  return { score: 3, label: 'Mạnh (Tối ưu)', color: '#10b981' };
}

/**
 * Trực quan hóa 4 cấp độ năng lực L1 - L4 (Connected Segmented Track):
 * - Đã đạt (done): Xanh ngọc lục bảo (emerald) kèm biểu tượng kiểm tra
 * - Mục tiêu vị trí (target): Viền nét đứt màu cam amber
 * - Chưa đạt (empty): Màu xám nhạt trung tính
 */
function LevelBar4({ verified, target }: { verified: number; target: number }) {
  return (
    <div className="pu-benchmark-level-track" title={`Hiện tại: L${verified} / Chuẩn vị trí: L${target}`}>
      {[1, 2, 3, 4].map((lvl) => {
        const isDone = lvl <= verified;
        const isTarget = lvl === target && verified < target;
        const cls = isDone ? 'done' : isTarget ? 'target' : 'empty';
        return (
          <div key={lvl} className={`pu-benchmark-seg ${cls}`}>
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

  const user = useCurrentUser((s) => s.user);
  const { data, isLoading, error, refetch } = usePulseOverview();
  const { data: outcomes } = usePulseOutcomes();

  // Tab 2: Security States
  const changePassword = useChangePassword();
  const { data: loginHistory } = useLoginHistory();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurPass, setShowCurPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Tab 3: Preferences States
  const [prefEmailReviews, setPrefEmailReviews] = useState(true);
  const [prefEmailReminders, setPrefEmailReminders] = useState(true);
  const [prefEmailNewCourses, setPrefEmailNewCourses] = useState(true);
  const [prefLanguage, setPrefLanguage] = useState<'vi' | 'en'>('vi');
  const [prefFocusMode, setPrefFocusMode] = useState(true);

  // Tải tùy chọn người dùng đã lưu từ LocalStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.reviews === 'boolean') setPrefEmailReviews(p.reviews);
        if (typeof p.reminders === 'boolean') setPrefEmailReminders(p.reminders);
        if (typeof p.newCourses === 'boolean') setPrefEmailNewCourses(p.newCourses);
        if (p.language === 'vi' || p.language === 'en') setPrefLanguage(p.language);
        if (typeof p.focusMode === 'boolean') setPrefFocusMode(p.focusMode);
      }
    } catch {
      // Bỏ qua lỗi cú pháp JSON
    }
  }, []);

  if (isLoading) return <PageSkeleton blocks={[140, 90, 320]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được hồ sơ.')} onRetry={() => refetch()} />;

  const { person, stats } = data;
  const name = (person.fullName && person.fullName !== 'Employee')
    ? person.fullName
    : (user?.fullName && user.fullName !== 'Employee')
      ? user.fullName
      : 'Hoàng Anh Thư';

  const empCode = person.employeeId ? `EMP-${person.employeeId.slice(0, 8).toUpperCase()}` : 'EMP-CBB187BB';
  const reviewerName = data.reviewer?.name || 'Lê Thị Thu Trang';
  const departmentName = person.departmentName || 'Phòng Tài chính - Kế toán';
  const positionName = person.positionName || 'Chuyên viên Kế toán tài chính';
  const organizationName = user?.organization?.name || person.organizationName || 'Công ty Cổ phần Công nghệ DigiTalent Việt Nam';

  // Đồng bộ số liệu giữa KPI và Ma trận:
  // Lĩnh vực đạt chuẩn vị trí: verified >= target và target > 0
  // Lĩnh vực có khoảng cách: target > verified
  const metDomainCount = data.domains.filter((d) => d.target > 0 && d.verified >= d.target).length;
  const gapDomainCount = data.domains.filter((d) => d.target > 0 && d.verified < d.target).length;

  const readinessPercent = stats.pathCourses > 0
    ? Math.round((stats.approvedPathCourses / stats.pathCourses) * 100)
    : 0;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(empCode);
    setCopiedCode(true);
    toast.success(`Đã sao chép mã định danh: ${empCode}`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Mật khẩu mới cần tối thiểu 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }
    setIsChangingPass(true);
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      toast.success('Đã đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify({
          reviews: prefEmailReviews,
          reminders: prefEmailReminders,
          newCourses: prefEmailNewCourses,
          language: prefLanguage,
          focusMode: prefFocusMode,
        })
      );
    } catch {
      // LocalStorage đầy hoặc bị vô hiệu hóa
    }
    toast.success('Đã lưu tùy chọn cá nhân thành công.');
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
          <PuLink to={PULSE_PATHS.path} kind="primary" small>
            <ArrowRight className="w-4 h-4" />
            <span>Xem lộ trình bồi dưỡng</span>
          </PuLink>
        </div>
      </header>

      {/* ── Sub-tab Navigation Bar (Segmented Capsule) ────────────────── */}
      <nav className="pu-profile-tab-bar pu-no-print" aria-label="Phân mục hồ sơ" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'competency'}
          className={`pu-profile-tab-btn${activeTab === 'competency' ? ' active' : ''}`}
          onClick={() => setActiveTab('competency')}
        >
          <Award className="w-4 h-4" />
          <span>Hồ sơ năng lực số (Passport)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'security'}
          className={`pu-profile-tab-btn${activeTab === 'security' ? ' active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <KeyRound className="w-4 h-4" />
          <span>Bảo mật & đổi mật khẩu</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'preferences'}
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
        <div key="competency" className="pu-tab-pane pu-stack">
          {/* ── Tối giản Hero Card (Clean Executive Light) ────────────────── */}
          <section className="pu-minimal-hero" aria-label="Thông tin cá nhân">
            <div className="pu-minimal-hero-left">
              <div className="pu-minimal-avatar" aria-hidden="true">
                {initials(name)}
              </div>

              <div className="pu-minimal-info">
                <div className="pu-minimal-name-row">
                  <h2 className="pu-minimal-name">{name}</h2>
                  <span className="pu-minimal-status-pill">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nhân viên chính thức</span>
                  </span>
                </div>

                <div className="pu-minimal-role">
                  {positionName} · {departmentName} · {organizationName}
                </div>

                <div className="pu-minimal-meta">
                  <span>Mã định danh: <code>{empCode}</code></span>
                  <span>·</span>
                  <span>Email: <code>{person.workEmail || user?.email || 'employee@digitalent.ai'}</code></span>
                  <span>·</span>
                  <span>Quản lý trực tiếp: <strong style={{ color: '#0f172a' }}>{reviewerName}</strong></span>
                </div>
              </div>
            </div>

            {/* Các tác vụ thực tế của Hồ sơ Năng lực (Không lặp lại Sidebar) */}
            <div className="pu-minimal-hero-actions pu-no-print">
              <button
                type="button"
                className="pu-hero-action-primary"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4" />
                <span>Xuất hồ sơ năng lực (PDF)</span>
              </button>

              <button
                type="button"
                className="pu-hero-action-secondary"
                onClick={handleCopyCode}
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Đã sao chép mã' : 'Sao chép mã định danh'}</span>
              </button>
            </div>
          </section>

          {/* ── 4 Thẻ KPI Đồng bộ hoàn toàn với Ma trận ─────────────────── */}
          <section className="pu-talent-kpi-grid" aria-label="Chỉ số năng lực trọng yếu">
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
                <span style={{ color: '#047857' }}>Đã đạt chuẩn vị trí</span>
              </div>
            </div>

            <div className="pu-tkpi-card">
              <div className="pu-tkpi-header">
                <span className="pu-tkpi-title">Hồ sơ chờ duyệt</span>
                <Clock className="w-4 h-4 text-sky-600" />
              </div>
              <div className="pu-tkpi-value">{stats.inReview} bài làm</div>
              <div className="pu-tkpi-footer">
                <span style={{ color: '#0284c7' }}>Quản lý đang chấm</span>
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
                  Khung 6 lĩnh vực năng lực số trọng yếu của tổ chức, đối sánh mức năng lực hiện tại với chuẩn vị trí chức danh và trần đào tạo phòng ban.
                </p>
              </div>

              <PuLink to={PULSE_PATHS.path} kind="outline" small className="pu-no-print">
                Xem ma trận lộ trình toàn diện →
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
                    <th>Tiến độ (L1 - L4)</th>
                    <th>Chênh lệch</th>
                    <th style={{ textAlign: 'right' }} className="pu-no-print">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {data.domains.map((domain) => {
                    const isMet = domain.verified >= domain.target && domain.target > 0;
                    const diff = domain.target - domain.verified;
                    const domainOutcome = outcomes?.find((o) => o.subtitle?.includes(domain.name) || o.title.includes(domain.name));
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
                          {domain.verified > 0 ? (
                            <span className="pu-benchmark-pill-verified">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              L{domain.verified} · {domain.verified >= 2 ? 'Trung cấp' : 'Cơ bản'}
                            </span>
                          ) : (
                            <span className="pu-benchmark-pill-unassessed">
                              Chưa đánh giá (L0)
                            </span>
                          )}
                        </td>

                        <td>
                          <span className="pu-benchmark-pill-target">
                            L{domain.target} · {domain.target >= 2 ? 'Trung cấp' : 'Cơ bản'}
                          </span>
                        </td>

                        <td>
                          <span className="pu-benchmark-ceiling-tag">
                            Trần L{domain.ceiling}
                          </span>
                        </td>

                        {/* Thanh 4 Vạch Trực Quan (Level Bar L1 - L4) */}
                        <td>
                          <LevelBar4 verified={domain.verified} target={domain.target} />
                        </td>

                        {/* Cột Chênh lệch ngắn gọn, không lặp lại cụm dài gây chật bảng */}
                        <td>
                          {isMet ? (
                            <span className="pu-benchmark-gap-met">
                              <Check className="w-3.5 h-3.5" />
                              Đạt chuẩn
                            </span>
                          ) : diff > 0 ? (
                            <span className={diff > 1 ? 'pu-benchmark-gap-danger' : 'pu-benchmark-gap-warning'}>
                              {diff > 1 ? <AlertCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                              Thiếu {diff} cấp
                            </span>
                          ) : (
                            <span className="pu-benchmark-gap-met">
                              Ngoài lộ trình
                            </span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }} className="pu-no-print">
                          {isMet && domainOutcome ? (
                            <Link to={PULSE_PATHS.outcome(domainOutcome.id)} className="pu-benchmark-action-cert">
                              <Sparkles className="w-3.5 h-3.5" />
                              Xem chứng chỉ
                            </Link>
                          ) : (
                            <Link to={PULSE_PATHS.path} className="pu-benchmark-action-study">
                              Bồi dưỡng ngay
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Thanh Chú giải Ký hiệu Cấp độ Trực quan */}
            <div className="pu-benchmark-legend pu-no-print">
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Chú giải cấp độ:</span>
              <div className="pu-legend-item">
                <span className="pu-legend-dot" style={{ background: '#059669' }} />
                <span>Đã đạt chuẩn (L1 - L4)</span>
              </div>
              <div className="pu-legend-item">
                <span className="pu-legend-dot" style={{ background: '#fffbeb', border: '1.5px dashed #f59e0b' }} />
                <span>Mục tiêu chuẩn chức danh</span>
              </div>
              <div className="pu-legend-item">
                <span className="pu-legend-dot" style={{ background: '#e2e8f0' }} />
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
        <div key="security" className="pu-tab-pane pu-stack">
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
                    title={showCurPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-label={showCurPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showCurPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pu-input-group">
                <label className="pu-input-label" htmlFor="new-pass">
                  Mật khẩu mới * (Tối thiểu 8 ký tự)
                </label>
                <div className="pu-input-password-wrap">
                  <input
                    id="new-pass"
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pu-input-field"
                  />
                  <button
                    type="button"
                    className="pu-password-toggle-btn"
                    onClick={() => setShowNewPass(!showNewPass)}
                    title={showNewPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-label={showNewPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="pu-pass-strength-wrap">
                    <div className="pu-pass-strength-bar">
                      <div className={`pu-pass-strength-seg ${getPasswordStrength(newPassword).score >= 1 ? (getPasswordStrength(newPassword).score === 1 ? 'active-weak' : getPasswordStrength(newPassword).score === 2 ? 'active-med' : 'active-strong') : ''}`} />
                      <div className={`pu-pass-strength-seg ${getPasswordStrength(newPassword).score >= 2 ? (getPasswordStrength(newPassword).score === 2 ? 'active-med' : 'active-strong') : ''}`} />
                      <div className={`pu-pass-strength-seg ${getPasswordStrength(newPassword).score >= 3 ? 'active-strong' : ''}`} />
                    </div>
                    <span className="pu-pass-strength-label" style={{ color: getPasswordStrength(newPassword).color }}>
                      Độ mạnh: {getPasswordStrength(newPassword).label}
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
                    title={showConfirmPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-label={showConfirmPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                Mật khẩu nên chứa cả chữ hoa, chữ thường, chữ số và ký tự đặc biệt để đảm bảo an toàn tối đa.
              </div>

              <button type="submit" disabled={isChangingPass} className="pu-sec-submit-btn">
                <KeyRound className="w-4 h-4" />
                <span>{isChangingPass ? 'Đang cập nhật mật khẩu…' : 'Lưu mật khẩu mới'}</span>
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
                    {loginHistory && loginHistory.length > 0 ? (
                      loginHistory.slice(0, 5).map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontFamily: 'ui-monospace, monospace' }}>
                            {formatDateTime(item.timestamp)}
                          </td>
                          <td style={{ fontFamily: 'ui-monospace, monospace', color: '#64748b' }}>
                            {item.ip}
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{item.browser}</span> ({item.os})
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

        {/* Khối Thỏa ước Tuân thủ Năng lực Số Doanh nghiệp Toàn diện */}
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
                Tuyệt đối không nhập thông tin định danh khách hàng, số liệu tài chính mật hoặc bí mật kinh doanh chưa công bố vào các hệ sinh thái AI bên ngoài. Toàn bộ bài thực hành phải dùng tập dữ liệu giả định (Dummy Data) của DigiTalent.
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
        <div key="preferences" className="pu-tab-pane pu-pref-grid">
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
                  <div className="pu-pref-item-title">Kết quả chấm điểm bài thi & bài tập</div>
                  <div className="pu-pref-item-desc">Nhận thông báo ngay khi người thẩm định hoàn tất nhận xét hoặc duyệt bài làm.</div>
                </div>
                <label className="pu-switch-control" htmlFor="pref-reviews" title="Bật/tắt thông báo kết quả chấm điểm">
                  <input
                    id="pref-reviews"
                    type="checkbox"
                    checked={prefEmailReviews}
                    onChange={(e) => setPrefEmailReviews(e.target.checked)}
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
                    checked={prefEmailReminders}
                    onChange={(e) => setPrefEmailReminders(e.target.checked)}
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
                    checked={prefEmailNewCourses}
                    onChange={(e) => setPrefEmailNewCourses(e.target.checked)}
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
                <p className="pu-sec-sub">Cấu hình ngôn ngữ hiển thị và chế độ tương tác bài giảng.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="pu-pref-item">
                <div>
                  <div className="pu-pref-item-title">Ngôn ngữ hiển thị</div>
                  <div className="pu-pref-item-desc">Ngôn ngữ mặc định cho giao diện và giáo trình bài giảng.</div>
                </div>
                <select
                  value={prefLanguage}
                  onChange={(e) => setPrefLanguage(e.target.value as 'vi' | 'en')}
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
                  <div className="pu-pref-item-desc">Tự động ẩn thanh bên khi đọc nội dung bài học để tối ưu không gian thị giác.</div>
                </div>
                <label className="pu-switch-control" htmlFor="pref-focus" title="Bật/tắt chế độ học tập tập trung">
                  <input
                    id="pref-focus"
                    type="checkbox"
                    checked={prefFocusMode}
                    onChange={(e) => setPrefFocusMode(e.target.checked)}
                    className="pu-switch-checkbox"
                  />
                  <span className="pu-switch-track" />
                </label>
              </div>

              <div className="pu-pref-item">
                <div>
                  <div className="pu-pref-item-title">Tự động đồng bộ tiến độ học</div>
                  <div className="pu-pref-item-desc">Lưu tiến độ đọc slide và bài tập trắc nghiệm theo thời gian thực về máy chủ.</div>
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
