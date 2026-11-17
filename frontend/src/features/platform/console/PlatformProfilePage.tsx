import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Footer, Pill } from '../components/pulse-ui';
import { getAvatarColor, initials } from '../components/pulse-format';
import {
  ShieldCheck,
  Mail,
  KeyRound,
  Activity,
  Globe,
  Clock,
  FileCheck2,
} from 'lucide-react';

/** Việc quản trị nền tảng làm được, mỗi mục dẫn sang trang tương ứng. */
const CAPABILITIES = [
  { to: '/platform/versions', title: 'Khung năng lực và khóa học', text: 'Sửa mô tả lĩnh vực, soạn khóa học trong bản nháp và công bố phiên bản mới.' },
  { to: '/platform/commerce', title: 'Giá và đơn hàng', text: 'Đặt giá cho từng khóa (mua một lần cho cả doanh nghiệp) và xem lịch sử mua khóa của các tổ chức.' },
  { to: '/platform/trials', title: 'Hỗ trợ khách hàng', text: 'Phân công mentor chấm bài dùng thử, tạm ngưng hoặc mở lại tổ chức, khóa hoặc mở khóa tài khoản.' },
] as const;

/**
 * SHR-01 · Hồ sơ của tôi: Platform Admin Profile & Settings Hub
 * Thiết kế chuẩn Enterprise Linear/Stripe, loại bỏ hoàn toàn banner marketing cam lòe loẹt.
 */
export function PlatformProfilePage() {
  const user = useCurrentUser((s) => s.user);
  const language = useUiLanguage();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const name = user?.fullName || user?.email || 'Quản trị viên Nền tảng';
  const mark = initials(name);
  const avatarStyle = getAvatarColor(name);

  return (
    <>
      {/* Page Header */}
      <div className="pa-page-header">
        <div className="pa-row-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <h1 className="pa-header-title">Hồ sơ của tôi</h1>
            <p className="pa-header-subtitle">
              Thông tin tài khoản quản trị của bạn.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/platform/account/security" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <KeyRound size={15} />
              Đổi mật khẩu
            </Link>
          </div>
        </div>
      </div>

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
              <Pill tone="green">Quản trị nền tảng</Pill>
            </div>

            <div style={{ padding: '16px 0 0', display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Trạng thái tài khoản:</span>
                <span style={{ fontWeight: 600, color: '#047857', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={14} />{translateUi(" Đang hoạt động")}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Vai trò:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Quản trị nền tảng</span>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'grid', gap: 8 }}>
              <Link
                to="/platform/account/security"
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}
              >
                <KeyRound size={14} />
                Đổi mật khẩu
              </Link>
              <Link
                to="/platform/audit-log"
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}
              >
                <Activity size={14} />
                Xem thao tác của tôi
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: việc admin làm được và cách hiển thị */}
        <div style={{ display: 'grid', gap: 20 }}>
          <div className="surface pad" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileCheck2 size={18} color="#b45309" aria-hidden="true" />
              Việc bạn làm được
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {CAPABILITIES.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{ padding: '12px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'block', textDecoration: 'none' }}
                >
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>{item.title}</strong>
                  <p style={{ fontSize: 13, color: '#475569', margin: '2px 0 0' }}>{item.text}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="surface pad" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={18} color="#2563eb" aria-hidden="true" />
              Hiển thị
            </h3>
            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 14px' }}>
              Lấy theo trình duyệt của bạn. Chưa đổi được ở đây.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#475569' }}>Ngôn ngữ</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>{language === 'en' ? 'English' : 'Tiếng Việt'}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#475569' }}>Múi giờ</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} color="#475569" aria-hidden="true" />
                  {timeZone}
                </div>
              </div>
              <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#475569' }}>Ngày giờ</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>DD/MM/YYYY HH:mm</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
