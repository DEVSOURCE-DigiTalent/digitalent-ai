import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, BookOpenCheck, Building2, Check, ClipboardCheck, Compass, GraduationCap, Layers3, Route, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getDashboardPath } from '@/lib/navigation';
import { rememberPortalChoice } from '@/features/portal/portal-preference';
import { useEffect } from 'react';
import journeyArt from '@/assets/pulse/learning-journey-abstract.webp';
import frameworkArt from '@/assets/pulse/competency-architecture.webp';
import { PulsePublicShell } from './PulsePublicShell';

const journey = [
  { number: '01', title: 'Định nghĩa đích đến', text: 'Doanh nghiệp điều chỉnh trần năng lực theo phòng ban và mục tiêu của từng vị trí.', icon: Layers3 },
  { number: '02', title: 'Đo điểm xuất phát', text: 'Nhân viên làm bài đầu vào để thấy mức hiện tại so với yêu cầu công việc.', icon: Compass },
  { number: '03', title: 'Học đúng lộ trình', text: 'Khóa học được xếp theo khoảng cách năng lực và thứ tự tiên quyết.', icon: Route },
  { number: '04', title: 'Làm bài cuối khóa', text: 'Nhân viên đưa ra minh chứng thực tế. Quản lý chấm và phản hồi theo tiêu chí.', icon: ClipboardCheck },
  { number: '05', title: 'Nhìn lại kết quả', text: 'Tiến bộ được xác nhận và tổng hợp thành báo cáo sau chu kỳ đào tạo.', icon: BookOpenCheck },
];

const roles = [
  { title: 'Doanh nghiệp', label: 'Thiết kế hướng đi', icon: Building2, text: 'Đặt mức năng lực cần đạt, mở khóa học, phân bổ suất và xem kết quả của toàn tổ chức.' },
  { title: 'Quản lý', label: 'Dẫn dắt đội nhóm', icon: UsersRound, text: 'Thấy khoảng cách của team, theo dõi tiến độ và quyết định bài cuối khóa dựa trên minh chứng.' },
  { title: 'Nhân viên', label: 'Học để tiến bộ', icon: GraduationCap, text: 'Biết mình đang ở đâu, học theo vị trí và thấy mức năng lực tăng khi kết quả được xác nhận.' },
];

/** Public enterprise landing based on the approved light Pulse product preview. */
export function PulseBusinessLandingPage() {
  const user = useCurrentUser((state) => state.user);
  const home = user ? getDashboardPath(user) : null;

  useEffect(() => rememberPortalChoice('enterprise'), []);

  return (
    <PulsePublicShell>
      <div data-testid="landing-page" data-variant="enterprise">
        <section className="pulse-public-hero pulse-public-wrap" aria-labelledby="pulse-hero-title">
          <div className="pulse-public-hero-copy">
            <p className="pulse-public-eyebrow"><span className="pulse-public-eyebrow-dot" /> Nền tảng phát triển năng lực số cho doanh nghiệp</p>
            <h1 id="pulse-hero-title">Đào tạo có đích đến. <em>Tiến bộ nhìn thấy được.</em></h1>
            <p className="pulse-public-hero-lead">Từ yêu cầu của từng vị trí đến bài đánh giá đầu vào, lộ trình học và kết quả được quản lý xác nhận — tất cả nối thành một hành trình rõ ràng.</p>
            <div className="pulse-public-hero-actions">
              <Link className="pulse-public-button" to={home ?? '/business/try'}>{home ? 'Vào hệ thống' : 'Bắt đầu dùng thử'} <ArrowRight size={18} aria-hidden="true" /></Link>
              <a className="pulse-public-text-link" href="#hanh-trinh">Xem cách hoạt động <ArrowDownRight size={19} aria-hidden="true" /></a>
            </div>
            <div className="pulse-public-trial-note"><span className="pulse-public-trial-symbol"><Check size={16} aria-hidden="true" /></span><span>Dùng thử miễn phí · học trọn khóa Cơ bản · điều kiện hiển thị khi kích hoạt</span></div>
          </div>
          <div className="pulse-public-hero-visual">
            <img src={journeyArt} alt="Các tầng học tập bằng kính được nối với nhau bằng một lộ trình xanh điện, đi qua điểm nhấn san hô." />
            <div className="pulse-public-visual-note" aria-label="Minh họa lộ trình học">
              <span>HÀNH TRÌNH HỌC TẬP</span>
              <strong>Đo đúng khoảng cách.<br />Học đúng bước tiếp theo.</strong>
              <i aria-hidden="true"><b /><b /><b /></i>
            </div>
          </div>
        </section>

        <div className="pulse-public-wrap pulse-public-rail" aria-label="Ba kết quả chính">
          <div><span>01 / HIỂU RÕ</span><strong>Năng lực cần có</strong></div>
          <div><span>02 / PHÁT TRIỂN</span><strong>Lộ trình phù hợp</strong></div>
          <div><span>03 / CÔNG NHẬN</span><strong>Kết quả có minh chứng</strong></div>
        </div>

        <section className="pulse-public-section pulse-public-wrap" id="hanh-trinh" aria-labelledby="pulse-journey-title">
          <div className="pulse-public-section-head">
            <div><p className="pulse-public-kicker">MỘT LUỒNG XUYÊN SUỐT</p><h2 id="pulse-journey-title">Từ mục tiêu của doanh nghiệp<br />đến sự tiến bộ của từng người.</h2></div>
            <p>Mỗi bước trả lời một câu hỏi cụ thể. Doanh nghiệp biết cần gì, nhân viên biết học gì, quản lý biết dựa vào đâu để đánh giá.</p>
          </div>
          <div className="pulse-public-journey-grid">
            {journey.map((step, index) => {
              const Icon = step.icon;
              return <article className={'pulse-public-journey-card' + (index === 2 ? ' pulse-public-journey-card-featured' : '')} key={step.number}>
                <div className="pulse-public-journey-top"><span>{step.number}</span><Icon size={23} strokeWidth={1.8} aria-hidden="true" /></div>
                <h3>{step.title}</h3><p>{step.text}</p>
              </article>;
            })}
          </div>
        </section>

        <section className="pulse-public-framework" id="khung-nang-luc" aria-labelledby="pulse-framework-title">
          <div className="pulse-public-wrap pulse-public-framework-inner">
            <div className="pulse-public-framework-image"><img src={frameworkArt} loading="lazy" alt="Các cấu trúc kính trong suốt nối với nhau, minh họa những tầng của khung năng lực số." /><span className="pulse-public-image-caption">Một khung chung · Nhiều lộ trình theo vị trí</span></div>
            <div className="pulse-public-framework-copy">
              <p className="pulse-public-kicker">THIẾT KẾ TỪ KHUNG NĂNG LỰC</p>
              <h2 id="pulse-framework-title">Một chuẩn chung.<br /><em>Đích đến riêng cho mỗi vị trí.</em></h2>
              <p>Doanh nghiệp bắt đầu từ khung năng lực số của hệ thống, rồi đặt mục tiêu phù hợp với tổ chức, phòng ban và vị trí. Bài đầu vào cho thấy mức hiện tại so với đích đến trước khi gợi ý khóa học.</p>
              <div className="pulse-public-level-chain" aria-label="Trật tự các mức trần năng lực"><span>Vị trí</span><b>≤</b><span>Phòng ban</span><b>≤</b><span>Doanh nghiệp</span><b>≤</b><span>Digital AI</span></div>
              <Link className="pulse-public-text-link" to="/business/solution">Khám phá giải pháp doanh nghiệp <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section className="pulse-public-section pulse-public-wrap" id="vai-tro" aria-labelledby="pulse-roles-title">
          <div className="pulse-public-section-head"><div><p className="pulse-public-kicker">ĐÚNG GÓC NHÌN CHO MỖI NGƯỜI</p><h2 id="pulse-roles-title">Cùng một mục tiêu.<br />Ba trải nghiệm khác nhau.</h2></div><p>Mỗi vai trò thấy công việc và quyết định thuộc trách nhiệm của mình, trong một hệ thống liền mạch.</p></div>
          <div className="pulse-public-roles-grid">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return <article className={'pulse-public-role-card pulse-public-role-' + index} key={role.title}><div className="pulse-public-role-icon"><Icon size={25} strokeWidth={1.8} aria-hidden="true" /></div><p>{role.label}</p><h3>{role.title}</h3><span>{role.text}</span><div className="pulse-public-role-line" /></article>;
            })}
          </div>
        </section>

        <section className="pulse-public-access pulse-public-wrap" id="khoa-hoc" aria-labelledby="pulse-access-title">
          <div className="pulse-public-access-intro"><p className="pulse-public-kicker">HỌC THEO NHU CẦU THẬT</p><h2 id="pulse-access-title">Bắt đầu miễn phí.<br /><em>Mở rộng khi cần.</em></h2><p>Học liệu Cơ bản luôn mở đầy đủ trong giai đoạn dùng thử. Với khóa Trung cấp và Nâng cao, doanh nghiệp có thể xem đề cương và nội dung mẫu trước khi mua, rồi phân bổ suất cho người học phù hợp.</p></div>
          <div className="pulse-public-access-cards"><article><span className="pulse-public-access-badge">CƠ BẢN</span><h3>Học trọn vẹn</h3><p>Đọc, xem, làm quiz và hoàn thành bài cuối khóa mà không cần mua suất.</p><ShieldCheck size={27} aria-hidden="true" /></article><article><span className="pulse-public-access-badge">TRUNG CẤP · NÂNG CAO</span><h3>Xem trước, rồi quyết định</h3><p>Doanh nghiệp mua theo khóa và phân bổ suất. Nhân viên đủ điều kiện sẽ mở đầy đủ nội dung.</p><Sparkles size={27} aria-hidden="true" /></article></div>
        </section>

        <section className="pulse-public-cta pulse-public-wrap" aria-labelledby="pulse-cta-title"><div><p className="pulse-public-kicker">BƯỚC ĐẦU TIÊN</p><h2 id="pulse-cta-title">Cho đội ngũ một hướng đi<br />mà ai cũng nhìn thấy.</h2><p>Bắt đầu với khung năng lực và các khóa Cơ bản; xem điều kiện dùng thử trước khi kích hoạt.</p></div><Link className="pulse-public-button pulse-public-button-light" to={home ?? '/business/try'}>{home ? 'Vào hệ thống' : 'Dùng thử miễn phí'} <ArrowRight size={18} aria-hidden="true" /></Link></section>
      </div>
    </PulsePublicShell>
  );
}
