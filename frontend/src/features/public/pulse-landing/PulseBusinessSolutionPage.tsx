import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileCheck,
  GraduationCap,
  Layers,
  Target,
  Users2,
  XCircle,
} from 'lucide-react';
import { PulsePublicShell } from './PulsePublicShell';
import frameworkArt from '@/assets/pulse/competency-architecture.webp';
import journeyArt from '@/assets/pulse/learning-journey-abstract.webp';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getDashboardPath } from '@/lib/navigation';

const painPoints = [
  {
    pain: 'Học đại trà, chung chung',
    painTag: 'Không sát nghiệp vụ',
    solution: 'Chuẩn hóa theo từng vị trí',
    solutionTag: 'Vị trí ≤ Phòng ban ≤ Doanh nghiệp',
    icon: Layers,
    color: 'coral',
  },
  {
    pain: 'Mù mờ về khoảng cách kỹ năng',
    painTag: 'Không rõ điểm yếu',
    solution: 'Chẩn đoán đầu vào thông minh',
    solutionTag: 'Chỉ ra chính xác kỹ năng cần bù đắp',
    icon: Compass,
    color: 'blue',
  },
  {
    pain: 'Học xong quên ngay, khó ứng dụng',
    painTag: 'Lý thuyết suông',
    solution: 'Học qua nhiệm vụ & minh chứng thật',
    solutionTag: 'Nộp sản phẩm thực tế, quản lý duyệt',
    icon: FileCheck,
    color: 'lime',
  },
  {
    pain: 'Khó đo lường ROI đào tạo',
    painTag: 'Chi phí vô hình',
    solution: 'Báo cáo năng lực thời gian thực',
    solutionTag: 'Heatmap & Radar năng lực toàn tổ chức',
    icon: BarChart3,
    color: 'indigo',
  },
];

const pillars = [
  {
    step: '01',
    title: 'Định vị',
    desc: 'Thiết lập chuẩn năng lực theo vị trí',
    badge: 'CHUẨN HÓA',
  },
  {
    step: '02',
    title: 'Chẩn đoán',
    desc: 'Đo điểm xuất phát & tìm khoảng cách kỹ năng',
    badge: 'ĐO LƯỜNG',
  },
  {
    step: '03',
    title: 'Đào tạo',
    desc: 'Học đúng phần còn thiếu, không lan man',
    badge: 'ĐÚNG CHỖ',
  },
  {
    step: '04',
    title: 'Thẩm định',
    desc: 'Nộp minh chứng thực tế, quản lý phản hồi',
    badge: 'THỰC CHIẾN',
  },
  {
    step: '05',
    title: 'Ghi nhận',
    desc: 'Cập nhật trần năng lực & cấp chứng nhận',
    badge: 'CÔNG NHẬN',
  },
];

const stats = [
  { value: '-45%', label: 'Thời gian lãng phí', desc: 'Bỏ học đại trà, chỉ học phần còn thiếu' },
  { value: '100%', label: 'Theo chuẩn vị trí', desc: 'Lộ trình riêng biệt cho từng chức danh' },
  { value: '3.2x', label: 'Ứng dụng thực tế', desc: 'Đánh giá bằng sản phẩm công việc thật' },
  { value: '24/7', label: 'Báo cáo thời gian thực', desc: 'Theo dõi tiến độ & sức khỏe kỹ năng' },
];

/**
 * Trang Giải pháp Nền tảng Doanh nghiệp (Enterprise Solutions Page)
 * Thay thế hoàn toàn trang giá cũ, mô tả chi tiết hướng giải quyết bài toán đào tạo thực chất của DigiTalent AI.
 */
export function PulseBusinessSolutionPage() {
  const user = useCurrentUser((state) => state.user);
  const home = user ? getDashboardPath(user) : null;

  return (
    <PulsePublicShell>
      <div data-testid="solution-page" className="pulse-solution-page">
        {/* ── Hero Section ── */}
        <section className="pulse-public-wrap pulse-solution-hero" aria-labelledby="solution-hero-title">
          <div className="pulse-solution-hero-content">
            <p className="pulse-public-eyebrow">
              <span className="pulse-public-eyebrow-dot" /> HƯỚNG GIẢI QUYẾT BÀI TOÁN DOANH NGHIỆP
            </p>
            <h1 id="solution-hero-title">
              Chuyển hóa đào tạo thành <em>năng lực cạnh tranh thực chất.</em>
            </h1>
            <p className="pulse-public-hero-lead">
              Doanh nghiệp không thiếu ngân sách đào tạo. Doanh nghiệp thiếu một giải pháp gắn kết mục tiêu chiến lược
              của tổ chức với sự tiến bộ nhìn thấy được của từng vị trí nhân sự.
            </p>
            <div className="pulse-public-hero-actions">
              <Link className="pulse-public-button" to={home ?? '/business/try'}>
                {home ? 'Vào hệ thống' : 'Bắt đầu dùng thử miễn phí'} <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a className="pulse-public-text-link" href="#so-sanh-giai-phap">
                Xem 4 bài toán cốt lõi <ChevronRight size={18} aria-hidden="true" />
              </a>
              <Link className="pulse-public-text-link" to="/business/pricing">
                Xem gói và bảng giá <ChevronRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <div className="pulse-solution-tags">
              <span><CheckCircle2 size={15} /> Chuẩn hóa theo vị trí</span>
              <span><CheckCircle2 size={15} /> Đo đúng Skill Gap</span>
              <span><CheckCircle2 size={15} /> Minh chứng thực chiến</span>
              <span><CheckCircle2 size={15} /> Báo cáo ROI minh bạch</span>
            </div>
          </div>
          <div className="pulse-solution-hero-visual">
            <img src={journeyArt} alt="Mô hình đào tạo năng lực số liên kết đa tầng" />
            <div className="pulse-solution-floating-card">
              <div className="pulse-solution-card-header">
                <Target size={18} className="text-[#3251e8]" />
                <strong>MỤC TIÊU CỐT LÕI</strong>
              </div>
              <p>Mỗi giờ nhân viên học tập là một bước tiến cụ thể hướng đến mục tiêu của tổ chức.</p>
            </div>
          </div>
        </section>

        {/* ── Section: Vấn đề cũ vs Giải pháp DigiTalent AI ── */}
        <section className="pulse-public-section pulse-public-wrap" id="so-sanh-giai-phap">
          <div className="pulse-public-section-head">
            <div>
              <p className="pulse-public-kicker">THÁCH THỨC VÀ HƯỚNG ĐI</p>
              <h2>4 Nỗi đau đào tạo truyền thống<br />và cách DigiTalent AI giải quyết triệt để.</h2>
            </div>
            <p>Chuyển từ học đối phó lấy chứng chỉ sang đo lường và nâng cấp năng lực thực tế.</p>
          </div>

          <div className="pulse-solution-matrix-grid">
            {painPoints.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={index} className={`pulse-solution-card pulse-solution-card--${item.color}`}>
                  <div className="pulse-solution-card-top">
                    <div className="pulse-solution-icon-wrap">
                      <Icon size={24} aria-hidden="true" />
                    </div>
                    <span className="pulse-solution-step-badge">BÀI TOÁN 0{index + 1}</span>
                  </div>

                  <div className="pulse-solution-pain-box">
                    <div className="pulse-solution-box-title text-red-600">
                      <XCircle size={15} /> <strong>Cách làm cũ</strong>
                    </div>
                    <h4>{item.pain}</h4>
                    <span className="pulse-solution-tag-pill pulse-solution-tag-pill--pain">{item.painTag}</span>
                  </div>

                  <div className="pulse-solution-arrow-divider">
                    <ArrowRight size={18} />
                  </div>

                  <div className="pulse-solution-gain-box">
                    <div className="pulse-solution-box-title text-emerald-600">
                      <CheckCircle2 size={15} /> <strong>DigiTalent AI</strong>
                    </div>
                    <h4>{item.solution}</h4>
                    <span className="pulse-solution-tag-pill pulse-solution-tag-pill--gain">{item.solutionTag}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Section: Kiến trúc Đa tầng ── */}
        <section className="pulse-public-framework pulse-solution-framework-section" id="kien-truc">
          <div className="pulse-public-wrap pulse-public-framework-inner">
            <div className="pulse-public-framework-image">
              <img src={frameworkArt} loading="lazy" alt="Kiến trúc khung năng lực đa tầng" />
              <span className="pulse-public-image-caption">Kiến trúc liên thông 4 cấp độ</span>
            </div>
            <div className="pulse-public-framework-copy">
              <p className="pulse-public-kicker">CƠ CẤU TỔ CHỨC THỰC TẾ</p>
              <h2>Khung năng lực đa tầng:<br /><em>Một chuẩn chung, đích đến riêng cho mỗi vị trí.</em></h2>
              <p>Mỗi vị trí có một bộ tiêu chuẩn riêng biệt, không học dàn trải hay chồng chéo.</p>
              <div className="pulse-solution-hierarchy-list">
                <div className="pulse-solution-hierarchy-item">
                  <span className="pulse-solution-tier-badge">CẤP 1</span>
                  <div>
                    <strong>Chuẩn Năng lực Quốc gia & DigiTalent</strong>
                    <p>Khung tham chiếu chuẩn mực làm nền móng.</p>
                  </div>
                </div>
                <div className="pulse-solution-hierarchy-item">
                  <span className="pulse-solution-tier-badge">CẤP 2</span>
                  <div>
                    <strong>Trần Năng lực Doanh nghiệp</strong>
                    <p>Mục tiêu chuyển đổi số theo chiến lược công ty.</p>
                  </div>
                </div>
                <div className="pulse-solution-hierarchy-item">
                  <span className="pulse-solution-tier-badge">CẤP 3</span>
                  <div>
                    <strong>Mục tiêu từng Phòng ban</strong>
                    <p>Chuyên sâu theo bộ phận (Kỹ thuật, Kinh doanh, Nhân sự...).</p>
                  </div>
                </div>
                <div className="pulse-solution-hierarchy-item">
                  <span className="pulse-solution-tier-badge">CẤP 4</span>
                  <div>
                    <strong>Chuẩn Năng lực theo Vị trí Công việc</strong>
                    <p>Căn cứ chẩn đoán đầu vào và thiết lập lộ trình cho nhân sự.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section: Quy trình 5 bước ── */}
        <section className="pulse-public-section pulse-public-wrap" id="quy-trinh">
          <div className="pulse-public-section-head">
            <div>
              <p className="pulse-public-kicker">QUY TRÌNH KHÉP KÍN</p>
              <h2>5 Bước xây dựng đội ngũ có năng lực số vượt trội.</h2>
            </div>
            <p>Hành trình liền mạch giữa Doanh nghiệp, Quản lý và Nhân viên trên một nền tảng.</p>
          </div>

          <div className="pulse-solution-pillars-grid">
            {pillars.map((pillar) => (
              <div key={pillar.step} className="pulse-solution-pillar-card">
                <div className="pulse-solution-pillar-top">
                  <span className="pulse-solution-pillar-step">{pillar.step}</span>
                  <span className="pulse-solution-pillar-badge">{pillar.badge}</span>
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section: Lợi ích Đo lường được (Stats) ── */}
        <section className="pulse-public-wrap pulse-solution-stats-section">
          <div className="pulse-solution-stats-header">
            <p className="pulse-public-kicker">HIỆU QUẢ THỰC TẾ</p>
            <h2>Lợi ích đo lường được cho doanh nghiệp.</h2>
            <p>Đào tạo trở thành động lực tăng trưởng có số liệu minh chứng.</p>
          </div>
          <div className="pulse-solution-stats-grid">
            {stats.map((s, idx) => (
              <div key={idx} className="pulse-solution-stat-card">
                <span className="pulse-solution-stat-value">{s.value}</span>
                <h4>{s.label}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section: 3 Góc nhìn ── */}
        <section className="pulse-public-section pulse-public-wrap">
          <div className="pulse-public-section-head">
            <div>
              <p className="pulse-public-kicker">PHÂN QUYỀN RÕ RÀNG</p>
              <h2>Trải nghiệm chuyên biệt cho từng vai trò trong tổ chức.</h2>
            </div>
            <p>Mỗi đối tượng có đúng công cụ để hoàn thành trách nhiệm của mình.</p>
          </div>

          <div className="pulse-solution-roles-grid">
            <article className="pulse-solution-role-box">
              <div className="pulse-solution-role-icon text-[#ff6854]">
                <Building2 size={26} />
              </div>
              <span className="pulse-solution-role-tag">DOANH NGHIỆP / OWNER</span>
              <h3>Kiến tạo & Định hướng</h3>
              <ul>
                <li>Kiểm soát toàn cảnh sức khỏe kỹ năng của mọi phòng ban.</li>
                <li>Tối ưu ngân sách đào tạo, học đúng người đúng vị trí.</li>
              </ul>
            </article>

            <article className="pulse-solution-role-box">
              <div className="pulse-solution-role-icon text-[#10b981]">
                <Users2 size={26} />
              </div>
              <span className="pulse-solution-role-tag">QUẢN LÝ / MANAGER</span>
              <h3>Đồng hành & Thẩm định</h3>
              <ul>
                <li>Nắm rõ khoảng cách kỹ năng (Skill Gap) của từng thành viên.</li>
                <li>Chấm bài cuối khóa qua minh chứng thực tế & phản hồi trực tiếp.</li>
              </ul>
            </article>

            <article className="pulse-solution-role-box">
              <div className="pulse-solution-role-icon text-[#3251e8]">
                <GraduationCap size={26} />
              </div>
              <span className="pulse-solution-role-tag">NHÂN VIÊN / LEARNER</span>
              <h3>Học tập & Tiến bộ</h3>
              <ul>
                <li>Lộ trình cá nhân hóa, chỉ học phần còn thiếu để thăng tiến.</li>
                <li>Nộp sản phẩm thực tế, nhận chứng chỉ năng lực được công nhận.</li>
              </ul>
            </article>
          </div>
        </section>

        {/* ── Call To Action Banner ── */}
        <section className="pulse-public-cta pulse-public-wrap" aria-labelledby="solution-cta-title">
          <div>
            <p className="pulse-public-kicker">BẮT ĐẦU NGAY HÔM NAY</p>
            <h2 id="solution-cta-title">
              Sẵn sàng xây dựng đội ngũ<br />có năng lực số thực chiến?
            </h2>
            <p>Trải nghiệm đầy đủ giải pháp với các khóa học Cơ bản và khung năng lực mẫu.</p>
          </div>
          <Link className="pulse-public-button pulse-public-button-light" to={home ?? '/business/try'}>
            {home ? 'Vào hệ thống' : 'Bắt đầu dùng thử miễn phí'} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </PulsePublicShell>
  );
}
