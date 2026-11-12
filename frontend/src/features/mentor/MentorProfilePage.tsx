import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  KeyRound,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMentorEnterprises, usePulseFinalReviews } from '@/hooks/use-pulse';
import { getAvatarColor, initials } from '@/features/platform/components/pulse-format';
import { Pill } from '@/features/platform/components/pulse-ui';

/**
 * SHR-01 · Hồ sơ cá nhân của Mentor (/mentor/account).
 */
export function MentorProfilePage() {
  const user = useCurrentUser((s) => s.user);
  const { data: queue } = usePulseFinalReviews({ includeReviewed: true });
  const { data: enterprises } = useMentorEnterprises();

  const name = user?.fullName || user?.email || 'Mentor DigiTalent';
  const mark = initials(name);
  const avatarStyle = getAvatarColor(name);

  return (
    <>
      <div className="pa-page-header">
        <div className="pa-row-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="pa-header-eyebrow">
              <span className="pa-eyebrow-dot" />
              KHÔNG GIAN MENTOR / HỒ SƠ CÁ NHÂN
            </div>
            <h1 className="pa-header-title">Hồ sơ Mentor & Phạm vi chấm bài</h1>
            <p className="pa-header-subtitle">
              Theo dõi các doanh nghiệp được phân công và khối lượng bài cuối cấp chờ chấm.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/mentor/enterprises" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={15} />
              Xem doanh nghiệp được giao
            </Link>
            <Link to="/mentor/account/security" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <KeyRound size={15} />
              Đổi mật khẩu
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 20 }}>
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
                }}
              >
                {mark}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                <Mail size={14} />
                <span>{user?.email ?? 'mentor@digitalent.ai'}</span>
              </div>
              <Pill tone="green">Mentor chuyên môn</Pill>
            </div>

            <div style={{ padding: '16px 0 0', display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Trạng thái tài khoản:</span>
                <span style={{ fontWeight: 600, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={14} /> Đang hoạt động
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Doanh nghiệp phụ trách:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{enterprises?.totalEnterprises ?? 0} đơn vị</span>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'grid', gap: 8 }}>
              <Link
                to="/mentor/enterprises"
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}
              >
                <Building2 size={14} />
                Xem doanh nghiệp được giao
              </Link>
              <Link
                to="/mentor/course-reviews"
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}
              >
                <ClipboardCheck size={14} />
                Xem tất cả bài nộp
              </Link>
              <Link
                to="/mentor/account/security"
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}
              >
                <KeyRound size={14} />
                Bảo mật & Đổi mật khẩu
              </Link>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <div className="surface pad" style={{ borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center', padding: '18px 12px' }}>
              <Building2 size={22} style={{ color: '#4f46e5', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{enterprises?.totalEnterprises ?? 0}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Doanh nghiệp được giao</div>
            </div>
            <div className="surface pad" style={{ borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center', padding: '18px 12px' }}>
              <Clock size={22} style={{ color: '#d97706', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{queue?.pendingCount ?? 0}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Bài chờ quyết định</div>
            </div>
            <div className="surface pad" style={{ borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center', padding: '18px 12px' }}>
              <CheckCircle2 size={22} style={{ color: '#059669', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{queue?.reviewedCount ?? 0}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Bài đã chấm</div>
            </div>
          </div>

          <div className="surface pad" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>
              Phạm vi công việc của Mentor
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#eef2ff', color: '#4338ca', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  01
                </div>
                <div>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>Theo dõi doanh nghiệp được phân công</strong>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                    Giám sát tiến độ nộp bài cuối cấp theo từng doanh nghiệp chính thức và doanh nghiệp dùng thử phụ trách.
                  </p>
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  02
                </div>
                <div>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>Chấm bài cuối cấp sau mỗi cấp độ</strong>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                    Đánh giá bài trắc nghiệm, bản ghi giám sát và phần tự luận của nhân viên ở các cấp Cơ bản, Trung cấp và Nâng cao.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
