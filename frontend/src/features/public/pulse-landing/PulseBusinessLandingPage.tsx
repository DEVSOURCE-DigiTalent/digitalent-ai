import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  BookOpenCheck,
  Building2,
  Check,
  ChevronRight,
  ClipboardCheck,
  Compass,
  GraduationCap,
  Layers3,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getDashboardPath } from '@/lib/navigation';
import { rememberPortalChoice } from '@/features/portal/portal-preference';
import journeyArt from '@/assets/pulse/learning-journey-abstract.webp';
import frameworkArt from '@/assets/pulse/competency-architecture.webp';
import { PulsePublicShell } from './PulsePublicShell';
import { cn } from '@/lib/utils';

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

const ESTIMATOR_DATA: Record<string, { gapPct: number; weeks: number; hoursSaved: number; topSkill: string }> = {
  accountant: { gapPct: 62, weeks: 3.5, hoursSaved: 28, topSkill: 'Khai thác dữ liệu số & Báo cáo quản trị' },
  hr: { gapPct: 58, weeks: 3.0, hoursSaved: 24, topSkill: 'Quản trị nhân sự số & Đánh giá năng lực' },
  sales: { gapPct: 68, weeks: 4.0, hoursSaved: 32, topSkill: 'Vận hành CRM & Phân tích cơ hội số' },
  marketing: { gapPct: 54, weeks: 2.5, hoursSaved: 22, topSkill: 'Sáng tạo nội dung AI & Đạo đức dữ liệu' },
};

/**
 * Trang Chủ Doanh Nghiệp DigiTalent Pulse v3.0
 * Ngôn ngữ thiết kế: Light Pearl Glassmorphism, chuẩn Thông tư 02/2025/TT-BGDĐT.
 */
export function PulseBusinessLandingPage() {
  const user = useCurrentUser((state) => state.user);
  const home = user ? getDashboardPath(user) : null;

  const [estDept, setEstDept] = useState<string>('accountant');
  const [estHeadcount, setEstHeadcount] = useState<number>(30);

  useEffect(() => rememberPortalChoice('enterprise'), []);

  const curEstimator = ESTIMATOR_DATA[estDept] || ESTIMATOR_DATA.accountant;

  return (
    <PulsePublicShell>
      <div data-testid="landing-page" data-variant="enterprise">
        {/* ── Hero Section ── */}
        <section className="pulse-public-hero pulse-public-wrap" aria-labelledby="pulse-hero-title">
          <div className="pulse-public-hero-copy">
            {/* Compliance Trust Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200/80 px-3.5 py-1 text-xs font-semibold text-amber-800 mb-2">
              <ShieldCheck className="size-3.5 text-amber-600" />
              Chuẩn Thông tư 02/2025/TT-BGDĐT · 6 Lĩnh vực · 21 Năng lực
            </div>

            <p className="pulse-public-eyebrow">
              <span className="pulse-public-eyebrow-dot" /> Nền tảng phát triển năng lực số cho doanh nghiệp
            </p>
            <h1 id="pulse-hero-title">
              Đào tạo có đích đến. <em>Tiến bộ nhìn thấy được.</em>
            </h1>
            <p className="pulse-public-hero-lead">
              Từ yêu cầu của từng vị trí đến bài đánh giá đầu vào, lộ trình học và kết quả được quản lý xác nhận — tất cả nối thành một hành trình rõ ràng.
            </p>
            <div className="pulse-public-hero-actions">
              <Link className="pulse-public-button" to={home ?? '/business/try'}>
                {home ? 'Vào hệ thống' : 'Bắt đầu dùng thử miễn phí'} <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="pulse-public-button pulse-public-button-light" to="/careers">
                Xem chức danh mẫu <ChevronRight size={18} aria-hidden="true" />
              </Link>
              <a className="pulse-public-text-link" href="#hanh-trinh">
                Xem cách hoạt động <ArrowDownRight size={19} aria-hidden="true" />
              </a>
            </div>
            <div className="pulse-public-trial-note">
              <span className="pulse-public-trial-symbol"><Check size={16} aria-hidden="true" /></span>
              <span>10 ghế nhân sự trọn đời · mở toàn bộ khóa Cơ bản · 100% không cần thẻ tín dụng</span>
            </div>
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

        {/* ── Core Value Strip ── */}
        <div className="pulse-public-wrap pulse-public-rail" aria-label="Ba kết quả chính">
          <div><span>01 / HIỂU RÕ</span><strong>Năng lực cần có</strong></div>
          <div><span>02 / PHÁT TRIỂN</span><strong>Lộ trình phù hợp</strong></div>
          <div><span>03 / CÔNG NHẬN</span><strong>Kết quả có minh chứng</strong></div>
        </div>

        {/* ── Interactive Competency Gap Estimator ── */}
        <section className="pulse-public-wrap py-10" aria-labelledby="estimator-title">
          <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-10 shadow-sm backdrop-blur-sm">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 text-white px-2.5 py-0.5 text-xs font-bold uppercase mb-2">
                <Target className="size-3.5" /> Công cụ ước tính nhanh
              </div>
              <h2 id="estimator-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Ước tính khoảng hụt năng lực cho đội ngũ của bạn
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Chọn phòng ban và quy mô để xem tỷ lệ khoảng cách năng lực số thực tế và thời gian bù đắp theo chuẩn Thông tư 02/2025.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Controls */}
              <div className="lg:col-span-5 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Phòng ban mục tiêu
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'accountant', label: 'Tài chính · Kế toán' },
                      { id: 'hr', label: 'Quản trị nhân sự' },
                      { id: 'sales', label: 'Kinh doanh CRM' },
                      { id: 'marketing', label: 'Marketing số' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setEstDept(tab.id)}
                        className={cn(
                          'rounded-xl px-3.5 py-2.5 text-xs font-bold border transition-all text-left',
                          estDept === tab.id
                            ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <span>Quy mô nhân sự phòng ban</span>
                    <span className="text-amber-600 font-extrabold font-mono text-sm">{estHeadcount} nhân sự</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={150}
                    step={5}
                    value={estHeadcount}
                    onChange={(e) => setEstHeadcount(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                    <span>5 người</span>
                    <span>50 người</span>
                    <span>150 người</span>
                  </div>
                </div>
              </div>

              {/* Right Output Dashboard */}
              <div className="lg:col-span-7 rounded-2xl bg-slate-50 border border-slate-200/80 p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-xs">
                    <p className="text-xs font-bold text-slate-500">Khoảng hụt kỹ năng</p>
                    <p className="mt-1 text-2xl font-extrabold text-amber-600 font-mono">
                      {curEstimator.gapPct}%
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">nhân sự cần bù đắp</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-xs">
                    <p className="text-xs font-bold text-slate-500">Thời gian đạt chuẩn</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
                      {curEstimator.weeks} tuần
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">học theo lộ trình gọn</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-xs">
                    <p className="text-xs font-bold text-slate-500">Thời gian tiết kiệm</p>
                    <p className="mt-1 text-2xl font-extrabold text-emerald-600 font-mono">
                      {curEstimator.hoursSaved * estHeadcount}h
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">nhờ miễn học đã biết</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs text-slate-600 border-t border-slate-200/60">
                  <span>
                    Trọng tâm bù đắp: <strong className="text-slate-900">{curEstimator.topSkill}</strong>
                  </span>
                  <Link
                    to={`/business/try?industry=${encodeURIComponent(estDept)}`}
                    className="inline-flex items-center gap-1.5 font-bold text-amber-600 hover:text-amber-700 underline underline-offset-4"
                  >
                    Bắt đầu với phòng ban này <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Journey Section ── */}
        <section className="pulse-public-section pulse-public-wrap" id="hanh-trinh" aria-labelledby="pulse-journey-title">
          <div className="pulse-public-section-head">
            <div>
              <p className="pulse-public-kicker">MỘT LUỒNG XUYÊN SUỐT</p>
              <h2 id="pulse-journey-title">
                Từ mục tiêu của doanh nghiệp<br />đến sự tiến bộ của từng người.
              </h2>
            </div>
            <p>Mỗi bước trả lời một câu hỏi cụ thể. Doanh nghiệp biết cần gì, nhân viên biết học gì, quản lý biết dựa vào đâu để đánh giá.</p>
          </div>
          <div className="pulse-public-journey-grid">
            {journey.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className={'pulse-public-journey-card' + (index === 2 ? ' pulse-public-journey-card-featured' : '')} key={step.number}>
                  <div className="pulse-public-journey-top">
                    <span>{step.number}</span>
                    <Icon size={23} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Framework Architecture Section ── */}
        <section className="pulse-public-framework" id="khung-nang-luc" aria-labelledby="pulse-framework-title">
          <div className="pulse-public-wrap pulse-public-framework-inner">
            <div className="pulse-public-framework-image">
              <img src={frameworkArt} loading="lazy" alt="Các cấu trúc kính trong suốt nối với nhau, minh họa những tầng của khung năng lực số." />
              <span className="pulse-public-image-caption">Một khung chung · Nhiều lộ trình theo vị trí</span>
            </div>
            <div className="pulse-public-framework-copy">
              <p className="pulse-public-kicker">THIẾT KẾ TỪ KHUNG NĂNG LỰC</p>
              <h2 id="pulse-framework-title">
                Một chuẩn chung.<br /><em>Đích đến riêng cho mỗi vị trí.</em>
              </h2>
              <p>
                Doanh nghiệp bắt đầu từ khung năng lực số của hệ thống, rồi đặt mục tiêu phù hợp với tổ chức, phòng ban và vị trí. Bài đầu vào cho thấy mức hiện tại so với đích đến trước khi gợi ý khóa học.
              </p>
              <div className="pulse-public-level-chain" aria-label="Trật tự các mức trần năng lực">
                <span>Vị trí</span><b>≤</b><span>Phòng ban</span><b>≤</b><span>Doanh nghiệp</span><b>≤</b><span>Digital AI</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link className="pulse-public-text-link" to="/business/solution">
                  Khám phá giải pháp doanh nghiệp <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="pulse-public-text-link" to="/careers">
                  Tra cứu chức danh mẫu <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Role Views Section ── */}
        <section className="pulse-public-section pulse-public-wrap" id="vai-tro" aria-labelledby="pulse-roles-title">
          <div className="pulse-public-section-head">
            <div>
              <p className="pulse-public-kicker">ĐÚNG GÓC NHÌN CHO MỖI NGƯỜI</p>
              <h2 id="pulse-roles-title">
                Cùng một mục tiêu.<br />Ba trải nghiệm khác nhau.
              </h2>
            </div>
            <p>Mỗi vai trò thấy công việc và quyết định thuộc trách nhiệm của mình, trong một hệ thống liền mạch.</p>
          </div>
          <div className="pulse-public-roles-grid">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <article className={'pulse-public-role-card pulse-public-role-' + index} key={role.title}>
                  <div className="pulse-public-role-icon">
                    <Icon size={25} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <p>{role.label}</p>
                  <h3>{role.title}</h3>
                  <span>{role.text}</span>
                  <div className="pulse-public-role-line" />
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Access & Pricing Bridge Section ── */}
        <section className="pulse-public-access pulse-public-wrap" id="khoa-hoc" aria-labelledby="pulse-access-title">
          <div className="pulse-public-access-intro">
            <p className="pulse-public-kicker">HỌC THEO NHU CẦU THẬT</p>
            <h2 id="pulse-access-title">
              Bắt đầu miễn phí.<br /><em>Mở rộng khi cần.</em>
            </h2>
            <p>
              Học liệu Cơ bản luôn mở đầy đủ trong giai đoạn dùng thử. Với khóa Trung cấp và Nâng cao, doanh nghiệp có thể xem đề cương và nội dung mẫu trước khi mua, rồi phân bổ suất cho người học phù hợp.
            </p>
            <div className="pt-2">
              <Link to="/business/pricing" className="pulse-public-text-link">
                Xem toàn bộ bảng giá và quyền lợi <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="pulse-public-access-cards">
            <article>
              <span className="pulse-public-access-badge">CƠ BẢN</span>
              <h3>Học trọn vẹn</h3>
              <p>Đọc, xem, làm quiz và hoàn thành bài cuối khóa mà không cần mua suất.</p>
              <ShieldCheck size={27} aria-hidden="true" />
            </article>
            <article>
              <span className="pulse-public-access-badge">TRUNG CẤP · NÂNG CAO</span>
              <h3>Xem trước, rồi quyết định</h3>
              <p>Doanh nghiệp mua theo khóa và phân bổ suất. Nhân viên đủ điều kiện sẽ mở đầy đủ nội dung.</p>
              <Sparkles size={27} aria-hidden="true" />
            </article>
          </div>
        </section>

        {/* ── End-cap CTA ── */}
        <section className="pulse-public-cta pulse-public-wrap" aria-labelledby="pulse-cta-title">
          <div>
            <p className="pulse-public-kicker">BƯỚC ĐẦU TIÊN</p>
            <h2 id="pulse-cta-title">
              Cho đội ngũ một hướng đi<br />mà ai cũng nhìn thấy.
            </h2>
            <p>Bắt đầu với khung năng lực và các khóa Cơ bản; xem điều kiện dùng thử trước khi kích hoạt.</p>
          </div>
          <Link className="pulse-public-button pulse-public-button-light" to={home ?? '/business/try'}>
            {home ? 'Vào hệ thống' : 'Dùng thử miễn phí'} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </PulsePublicShell>
  );
}
