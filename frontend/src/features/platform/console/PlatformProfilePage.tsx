import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePlatformAuditLogs, usePlatformOverview } from '@/hooks/use-platform-admin';
import { Footer, LoadError, Loading } from '../components/pulse-ui';
import { formatNumber, initials } from '../components/pulse-format';

const ROUTES = [
  { to: '/platform/framework', label: 'Khung năng lực chung' },
  { to: '/platform/curriculum', label: 'Chương trình học' },
  { to: '/platform/audit-log', label: 'Nhật ký kiểm tra' },
];

const RESPONSIBILITIES = [
  ['01', 'Công bố nguồn chuẩn', 'Duy trì chuẩn sáu lĩnh vực làm trần chung cho mọi doanh nghiệp.'],
  ['02', 'Phát hành khóa học', 'Quản lý bản nháp chương trình học, câu hỏi, giá và các phiên bản đã công bố.'],
  ['03', 'Hỗ trợ tài khoản', 'Xem tổ chức và người dùng; ghi lý do khi thực hiện thao tác hỗ trợ nhạy cảm.'],
] as const;

/** PA-11 · Hồ sơ của tôi (mock `#/profile` of the Platform Admin): identity, scope, responsibilities and numbers. */
export function PlatformProfilePage() {
  const user = useCurrentUser((s) => s.user);
  const overview = usePlatformOverview();
  const audit = usePlatformAuditLogs({ pageIndex: 1, pageSize: 1, scope: 'platform' });
  const name = user?.fullName || user?.email || 'Quản trị nền tảng';
  const mark = initials(name);

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero-copy">
          <span className="eyebrow">Hồ sơ của tôi · Quản trị nền tảng</span>
          <div className="profile-intro">
            <div className="profile-avatar" aria-hidden="true">{mark}</div>
            <div>
              <h1>{name}</h1>
              <strong>Nền tảng Digital AI</strong>
            </div>
          </div>
          <p>Duy trì khung Digital AI chung, phát hành chương trình học và ghi lý do cho thao tác hỗ trợ khách hàng.</p>
          <div className="profile-hero-actions">
            {ROUTES.map((route) => (
              <Link key={route.to} className="btn btn-outline btn-small" to={route.to}>{route.label}</Link>
            ))}
          </div>
        </div>
        <div className="profile-art" aria-hidden="true">
          <span className="profile-art-orbit" />
          <span className="profile-art-mark">{mark}</span>
          <span className="profile-art-role">Quản trị nền tảng</span>
        </div>
      </section>

      <section className="profile-facts" aria-label="Thông tin tài khoản">
        <Fact label="Không gian làm việc" value="Vận hành nền tảng" />
        <Fact label="Phạm vi" value="Chuẩn chung và hỗ trợ khách hàng" />
        <Fact label="Email đăng nhập" value={user?.email ?? '—'} />
        <Fact label="Khung chuẩn" value={overview.data ? `Đã công bố v${overview.data.frameworkVersion}.0` : '—'} />
      </section>

      {overview.isLoading && <Loading />}
      {overview.error && <LoadError error={overview.error} />}
      {overview.data && (
        <section className="profile-metrics" aria-label="Không gian của bạn">
          <div><strong>{formatNumber(overview.data.domainCount)}</strong><span>Lĩnh vực năng lực</span></div>
          <div><strong>{formatNumber(overview.data.courseCount)}</strong><span>Khóa học chuẩn</span></div>
          <div><strong>{audit.data ? formatNumber(audit.data.totalItems) : '—'}</strong><span>Mục nhật ký</span></div>
        </section>
      )}

      <div className="profile-main-grid">
        <section className="profile-panel">
          <span className="mini-label">Vai trò và trách nhiệm</span>
          <h2>Bạn có thể làm gì ở đây.</h2>
          <div className="profile-permissions">
            {RESPONSIBILITIES.map(([number, title, detail]) => (
              <article key={number} className="profile-permission">
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="profile-panel profile-detail">
          <span className="mini-label">Phạm vi quyết định của bạn</span>
          <h2>Một nguồn chuẩn, nhiều khung doanh nghiệp.</h2>
          <p>Quản trị nền tảng công bố trần Digital AI và khóa chuẩn. Chủ doanh nghiệp thiết kế mục tiêu các cấp trong giới hạn này.</p>
          <Link className="btn btn-outline btn-small" to="/platform/framework">Mở khung năng lực chung →</Link>
        </section>
      </div>
      <p className="profile-preview-note">Mọi thao tác hỗ trợ nhạy cảm (cấp suất, tạm ngưng tổ chức, khóa tài khoản) đều cần lý do và được ghi vào nhật ký kiểm tra.</p>
      <Footer />
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="profile-fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
