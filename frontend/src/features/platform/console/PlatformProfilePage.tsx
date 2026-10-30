import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePlatformAuditLogs, usePlatformOverview } from '@/hooks/use-platform-admin';
import { Footer, LoadError, Loading, Pill } from '../components/pulse-ui';
import { formatNumber, getAvatarColor, initials } from '../components/pulse-format';
import {
  ShieldCheck,
  Mail,
  KeyRound,
  Activity,
  Globe,
  Clock,
  Layers,
  BookOpen,
  Anchor,
  FileCheck2,
} from 'lucide-react';

/**
 * SHR-01 · Hồ sơ của tôi: Platform Admin Profile & Settings Hub
 * Thiết kế chuẩn Enterprise Linear/Stripe, loại bỏ hoàn toàn banner marketing cam lòe loẹt.
 */
export function PlatformProfilePage() {
  const user = useCurrentUser((s) => s.user);
  const overview = usePlatformOverview();
  const audit = usePlatformAuditLogs({ pageIndex: 1, pageSize: 1, scope: 'platform' });
  const name = user?.fullName || user?.email || 'Quản trị viên Nền tảng';
  const mark = initials(name);
  const avatarStyle = getAvatarColor(name);

  return (
    <>
      {/* Page Header */}
      <div className="pa-page-header">
        <div className="pa-row-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="pa-header-eyebrow">
              <span className="pa-eyebrow-dot" />
              QUẢN TRỊ NỀN TẢNG / HỒ SƠ QUẢN TRỊ VIÊN
            </div>
            <h1 className="pa-header-title">Hồ sơ cá nhân & Thiết lập hệ thống.</h1>
            <p className="pa-header-subtitle">
              Quản lý định danh tài khoản quản trị tối cao, phạm vi phân quyền vận hành DigiTalent Pulse và các tùy chọn cá nhân.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/platform/account/security" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <KeyRound size={15} />
              Đổi mật khẩu & Bảo mật
            </Link>
          </div>
        </div>
      </div>

      {overview.isLoading && <Loading />}
      {overview.error && <LoadError error={overview.error} />}

      {/* Main 2-Column Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Identity & Admin Card */}
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Identity Card */}
          <div className="surface pad" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '12px 0 20px', borderBottom: '1px solid #f1f5f9' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: avatarStyle.bg,
                  color: avatarStyle.text,
                  border: `2px solid ${avatarStyle.border}`,
                  fontSize: 24,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              >
                {mark}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                <Mail size={14} />
                <span>{user?.email ?? 'platform@digitalent.ai'}</span>
              </div>
              <Pill tone="green">Toàn quyền nền tảng (SUPER_ADMIN)</Pill>
            </div>

            <div style={{ padding: '16px 0 0', display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Trạng thái tài khoản:</span>
                <span style={{ fontWeight: 600, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={14} /> Đang hoạt động
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Không gian làm việc:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Vận hành Nền tảng</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Phiên bản phục vụ:</span>
                <span style={{ fontWeight: 600, color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Anchor size={13} /> Catalog v1 (Ổn định)
                </span>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'grid', gap: 8 }}>
              <Link
                to="/platform/account/security"
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}
              >
                <KeyRound size={14} />
                Thiết lập mật khẩu & Bảo mật
              </Link>
              <Link
                to="/platform/audit-log"
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}
              >
                <Activity size={14} />
                Xem nhật ký thao tác
              </Link>
            </div>
          </div>

          {/* Quick Security Pill Card */}
          <div className="surface pad" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} color="#059669" />
              Tiêu chuẩn Bảo mật & Tuân thủ
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Mọi hành vi can thiệp nhạy cảm (cấp suất, tạm ngưng tổ chức, xuất bản catalog) được mã hóa và ghi nhật ký bất biến phục vụ kiểm toán an toàn thông tin.
            </p>
          </div>
        </div>

        {/* Right Column: Platform Metrics & System Preferences */}
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Platform Metrics Bento */}
          {overview.data && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div className="surface pad" style={{ borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center', padding: '18px 12px' }}>
                <Layers size={22} style={{ color: '#2563eb', margin: '0 auto 8px' }} />
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{formatNumber(overview.data.domainCount)}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Lĩnh vực năng lực số</div>
              </div>
              <div className="surface pad" style={{ borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center', padding: '18px 12px' }}>
                <BookOpen size={22} style={{ color: '#059669', margin: '0 auto 8px' }} />
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{formatNumber(overview.data.courseCount)}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Khóa học chuẩn hóa</div>
              </div>
              <div className="surface pad" style={{ borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center', padding: '18px 12px' }}>
                <Activity size={22} style={{ color: '#d97706', margin: '0 auto 8px' }} />
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{audit.data ? formatNumber(audit.data.totalItems) : '—'}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Nhật ký kiểm toán</div>
              </div>
            </div>
          )}

          {/* Scope & Responsibilities */}
          <div className="surface pad" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileCheck2 size={18} color="#d97706" />
              Quyền hạn & Phạm vi Quản trị Nền tảng
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  01
                </div>
                <div>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>Duy trì chuẩn khung năng lực số Thông tư 02/2025/TT-BGDĐT</strong>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                    Cấu trúc 6 lĩnh vực năng lực, tiêu chuẩn đầu ra và các mức tham chiếu (Cơ bản, Trung cấp, Nâng cao).
                  </p>
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  02
                </div>
                <div>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>Biên soạn & Công bố phiên bản Catalog khóa học</strong>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                    Thiết kế bài học trên Studio 2-Pane, kiểm tra rào cản và phát hành phiên bản neo phục vụ toàn hệ thống.
                  </p>
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  03
                </div>
                <div>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>Hỗ trợ nghiệp vụ & Giám sát khách hàng doanh nghiệp</strong>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                    Kiểm tra hồ sơ tổ chức 360°, tiến độ dùng thử 7 ngày, cấp suất đào tạo có phí và hỗ trợ khôi phục tài khoản.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System & Display Preferences */}
          <div className="surface pad" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={18} color="#2563eb" />
              Tùy chọn Môi trường Vận hành
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ngôn ngữ hiển thị</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>Tiếng Việt (Mặc định hệ thống)</div>
              </div>
              <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Múi giờ chuẩn</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} color="#64748b" />
                  (GMT+07:00) Giờ Đông Dương
                </div>
              </div>
              <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Định dạng ngày & giờ</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>DD/MM/YYYY HH:mm</div>
              </div>
              <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cảnh báo an ninh</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#059669', marginTop: 4 }}>Gửi tức thì qua Email & Nhật ký</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
