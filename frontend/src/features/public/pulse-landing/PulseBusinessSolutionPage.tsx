import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileCheck,
  GraduationCap,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users2,
  XCircle,
} from 'lucide-react';
import { PulsePublicShell } from './PulsePublicShell';
import frameworkArt from '@/assets/pulse/competency-architecture.webp';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getDashboardPath } from '@/lib/navigation';
import { formatVnd } from '@/lib/plans';

const painPoints = [
  {
    pain: 'Học đại trà, chung chung',
    painTag: 'Không sát nghiệp vụ',
    solution: 'Chuẩn hóa theo từng vị trí',
    solutionTag: 'Mục tiêu theo vị trí · mở khóa theo doanh nghiệp',
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
 * Trang Giải pháp Nền tảng Doanh nghiệp (Enterprise Solutions Page) v3.0
 * Ngôn ngữ thiết kế: Light Pearl Glassmorphism, chuẩn Thông tư 02/2025/TT-BGDĐT.
 */
export function PulseBusinessSolutionPage() {
  const user = useCurrentUser((state) => state.user);
  const home = user ? getDashboardPath(user) : null;

  // ROI Calculator States
  const [roiHeadcount, setRoiHeadcount] = useState<number>(45);
  const [roiSalary, setRoiSalary] = useState<number>(15000000); // 15 triệu VND/tháng

  // Tính toán hiệu quả:
  // - 1 nhân viên trung bình học 40h nếu học đại trà.
  // - Với DigiTalent Pulse: Nhờ bài kiểm tra đầu vào miễn học phần đã biết, tiết kiệm trung bình 18 giờ/người.
  // - Chi phí giờ làm việc: lương tháng / 160h.
  const hourlyRate = roiSalary / 160;
  const totalHoursSaved = roiHeadcount * 18;
  const totalMoneySaved = Math.round(totalHoursSaved * hourlyRate);

  return (
    <PulsePublicShell>
      <div data-testid="solution-page" className="pulse-solution-page">
        {/* ── Hero Section ── */}
        <section className="pulse-public-wrap pulse-solution-hero" aria-labelledby="solution-hero-title">
          <div className="pulse-solution-hero-content">
            {/* Compliance Trust Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200/80 px-3.5 py-1 text-xs font-semibold text-amber-800 mb-3">
              <ShieldCheck className="size-3.5 text-amber-600" />
              Khung năng lực số Thông tư 02/2025/TT-BGDĐT · 6 Lĩnh vực · 21 Năng lực
            </div>

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
                Xem bảng giá B2B <ChevronRight size={18} aria-hidden="true" />
              </Link>
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
                    <p>Khung tham chiếu chuẩn mực làm nền móng (TT 02/2025/TT-BGDĐT).</p>
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
                    <p>Chuyên sâu theo bộ phận (Kế toán, Nhân sự, Kinh doanh, Marketing...).</p>
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

        {/* ── Section: Interactive ROI Calculator ── */}
        <section className="pulse-public-wrap py-12" aria-labelledby="roi-calculator-title">
          <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-10 shadow-sm">
            <div className="max-w-2xl mb-8">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 text-white px-2.5 py-0.5 text-xs font-bold uppercase mb-2">
                <Calculator className="size-3.5" /> Bảng tính hiệu quả đầu tư
              </div>
              <h2 id="roi-calculator-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Ước tính giá trị kinh tế (ROI) cho tổ chức của bạn
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Xem số giờ làm việc quý báu và ngân sách lãng phí được giải phóng nhờ cơ chế chẩn đoán miễn học phần đã biết.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Sliders Left */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <span>Số lượng nhân sự đào tạo</span>
                    <span className="text-emerald-700 font-extrabold font-mono text-base">{roiHeadcount} nhân sự</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={300}
                    step={5}
                    value={roiHeadcount}
                    onChange={(e) => setRoiHeadcount(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                    <span>10 người</span>
                    <span>150 người</span>
                    <span>300 người</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <span>Mức lương trung bình tháng</span>
                    <span className="text-emerald-700 font-extrabold font-mono text-base">{formatVnd(roiSalary)}</span>
                  </div>
                  <input
                    type="range"
                    min={8000000}
                    max={40000000}
                    step={1000000}
                    value={roiSalary}
                    onChange={(e) => setRoiSalary(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                    <span>8 triệu</span>
                    <span>20 triệu</span>
                    <span>40 triệu</span>
                  </div>
                </div>
              </div>

              {/* Outputs Right */}
              <div className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300 p-6 sm:p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-xl p-4 border border-emerald-200/60 shadow-xs">
                    <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1">
                      <Clock className="size-3.5 text-emerald-600" /> Giờ học tiết kiệm
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
                      {totalHoursSaved}h
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">thời gian làm việc thật</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-emerald-200/60 shadow-xs">
                    <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1">
                      <TrendingUp className="size-3.5 text-emerald-600" /> Giá trị giải phóng
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-emerald-700 font-mono">
                      ≈ {formatVnd(totalMoneySaved)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">chi phí vô hình/năm</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-emerald-200/60 shadow-xs">
                    <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1">
                      <Sparkles className="size-3.5 text-amber-500" /> Tỷ lệ hiệu quả ROI
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-amber-600 font-mono">
                      3.5x – 4.2x
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">so với chi phí bỏ ra</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-emerald-200/60">
                  <p className="text-xs text-slate-600">
                    Bắt đầu với 10 nhân sự hoàn toàn miễn phí trọn đời khóa Cơ bản.
                  </p>
                  <Link
                    to="/business/try"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 whitespace-nowrap transition-all"
                  >
                    Kích hoạt thử nghiệm ngay <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
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
