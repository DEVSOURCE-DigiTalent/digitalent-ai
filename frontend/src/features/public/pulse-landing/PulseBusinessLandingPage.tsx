import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Compass,
  Cpu,
  FileCheck2,
  LineChart,
  Network,
  Radio,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Terminal,
  TrendingUp,
  UsersRound,
  Zap,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getDashboardPath } from '@/lib/navigation';
import { rememberPortalChoice } from '@/features/portal/portal-preference';
import { PulsePublicShell } from './PulsePublicShell';

type DeckTab = 'matrix' | 'gap' | 'verify';
type DeptKey = 'all' | 'tech' | 'biz' | 'ops';
type AgentKey = 'diagnostic' | 'blueprint' | 'verifier' | 'forecaster';

const DEPT_METRICS: Record<
  DeptKey,
  Array<{
    domain: string;
    score: string;
    percent: number;
    status: 'pass' | 'gap';
    statusText: string;
    color: string;
  }>
> = {
  all: [
    { domain: 'Trí tuệ nhân tạo (AI & GenAI)', score: '4.8 / 5.0', percent: 96, status: 'pass', statusText: 'Đạt chuẩn 96%', color: '#38bdf8' },
    { domain: 'Quản trị Dữ liệu & Báo cáo số', score: '4.6 / 5.0', percent: 92, status: 'pass', statusText: 'Đạt chuẩn 92%', color: '#6366f1' },
    { domain: 'An toàn thông tin & An ninh mạng', score: '4.9 / 5.0', percent: 98, status: 'pass', statusText: 'Đạt chuẩn 98%', color: '#10b981' },
    { domain: 'Vận hành số & Tự động hóa', score: '4.4 / 5.0', percent: 88, status: 'pass', statusText: 'Đạt chuẩn 88%', color: '#f59e0b' },
    { domain: 'Hợp tác số & Kết nối đa kênh', score: '4.7 / 5.0', percent: 94, status: 'pass', statusText: 'Đạt chuẩn 94%', color: '#ec4899' },
    { domain: 'Đổi mới sáng tạo & Tư duy số', score: '4.3 / 5.0', percent: 86, status: 'pass', statusText: 'Đạt chuẩn 86%', color: '#8b5cf6' },
  ],
  tech: [
    { domain: 'Trí tuệ nhân tạo (AI & GenAI)', score: '4.9 / 5.0', percent: 98, status: 'pass', statusText: 'Xuất sắc 98%', color: '#38bdf8' },
    { domain: 'Quản trị Dữ liệu & Báo cáo số', score: '4.8 / 5.0', percent: 96, status: 'pass', statusText: 'Đạt chuẩn 96%', color: '#6366f1' },
    { domain: 'An toàn thông tin & An ninh mạng', score: '5.0 / 5.0', percent: 100, status: 'pass', statusText: 'Hoàn hảo 100%', color: '#10b981' },
    { domain: 'Vận hành số & Tự động hóa', score: '4.7 / 5.0', percent: 94, status: 'pass', statusText: 'Đạt chuẩn 94%', color: '#f59e0b' },
    { domain: 'Hợp tác số & Kết nối đa kênh', score: '4.5 / 5.0', percent: 90, status: 'pass', statusText: 'Đạt chuẩn 90%', color: '#ec4899' },
    { domain: 'Đổi mới sáng tạo & Tư duy số', score: '4.6 / 5.0', percent: 92, status: 'pass', statusText: 'Đạt chuẩn 92%', color: '#8b5cf6' },
  ],
  biz: [
    { domain: 'Trí tuệ nhân tạo (AI & GenAI)', score: '4.4 / 5.0', percent: 88, status: 'pass', statusText: 'Đạt chuẩn 88%', color: '#38bdf8' },
    { domain: 'Quản trị Dữ liệu & Báo cáo số', score: '4.7 / 5.0', percent: 94, status: 'pass', statusText: 'Đạt chuẩn 94%', color: '#6366f1' },
    { domain: 'An toàn thông tin & An ninh mạng', score: '4.6 / 5.0', percent: 92, status: 'pass', statusText: 'Đạt chuẩn 92%', color: '#10b981' },
    { domain: 'Vận hành số & Tự động hóa', score: '4.2 / 5.0', percent: 84, status: 'gap', statusText: 'Cần cải thiện 8%', color: '#f59e0b' },
    { domain: 'Hợp tác số & Kết nối đa kênh', score: '4.9 / 5.0', percent: 98, status: 'pass', statusText: 'Xuất sắc 98%', color: '#ec4899' },
    { domain: 'Đổi mới sáng tạo & Tư duy số', score: '4.5 / 5.0', percent: 90, status: 'pass', statusText: 'Đạt chuẩn 90%', color: '#8b5cf6' },
  ],
  ops: [
    { domain: 'Trí tuệ nhân tạo (AI & GenAI)', score: '4.2 / 5.0', percent: 84, status: 'gap', statusText: 'Đang đào tạo M6', color: '#38bdf8' },
    { domain: 'Quản trị Dữ liệu & Báo cáo số', score: '4.5 / 5.0', percent: 90, status: 'pass', statusText: 'Đạt chuẩn 90%', color: '#6366f1' },
    { domain: 'An toàn thông tin & An ninh mạng', score: '4.7 / 5.0', percent: 94, status: 'pass', statusText: 'Đạt chuẩn 94%', color: '#10b981' },
    { domain: 'Vận hành số & Tự động hóa', score: '4.8 / 5.0', percent: 96, status: 'pass', statusText: 'Xuất sắc 96%', color: '#f59e0b' },
    { domain: 'Hợp tác số & Kết nối đa kênh', score: '4.6 / 5.0', percent: 92, status: 'pass', statusText: 'Đạt chuẩn 92%', color: '#ec4899' },
    { domain: 'Đổi mới sáng tạo & Tư duy số', score: '4.3 / 5.0', percent: 86, status: 'pass', statusText: 'Đạt chuẩn 86%', color: '#8b5cf6' },
  ],
};

const ROI_TIERS = [
  { size: 25, label: '25 Nhân sự', hours: '600 giờ', savings: '120 triệu đ', speed: '3.2x' },
  { size: 100, label: '100 Nhân sự', hours: '2.400 giờ', savings: '450 triệu đ', speed: '3.8x' },
  { size: 300, label: '300 Nhân sự', hours: '7.200 giờ', savings: '1.25 tỷ đ', speed: '4.2x' },
  { size: 1000, label: '1.000+ Nhân sự', hours: '24.000 giờ', savings: '3.8 tỷ đ', speed: '4.8x' },
];

const AGENTS_DATA: Record<
  AgentKey,
  {
    id: string;
    name: string;
    role: string;
    badge: string;
    kpi: string;
    icon: typeof ScanFace;
    colorClass: string;
    logs: Array<{ time: string; text: string; highlight?: boolean }>;
  }
> = {
  diagnostic: {
    id: 'AGENT-01',
    name: 'Phân tích năng lực',
    role: 'Tổng hợp kết quả đánh giá và đối chiếu với chuẩn năng lực số.',
    badge: 'Chẩn đoán TT02',
    kpi: 'Độ chính xác: 99.4%',
    icon: ScanFace,
    colorClass: 'pulse-agent-icon-box--cyan',
    logs: [
      { time: '17:30:02', text: 'Đối chiếu kết quả đánh giá với chuẩn vị trí.' },
      { time: '17:30:05', text: 'Đã tổng hợp năng lực của 18 nhân sự.' },
      { time: '17:30:08', text: '4 nhân sự cần bồi dưỡng năng lực ứng dụng AI.', highlight: true },
      { time: '17:30:10', text: 'Kết quả đã cập nhật vào khung năng lực.' },
    ],
  },
  blueprint: {
    id: 'AGENT-02',
    name: 'Lộ trình đào tạo',
    role: 'Đề xuất nội dung học theo khoảng trống năng lực của từng vị trí.',
    badge: 'Tổng hợp Lộ trình',
    kpi: 'Giảm 45% thời gian',
    icon: Network,
    colorClass: 'pulse-agent-icon-box--indigo',
    logs: [
      { time: '17:31:12', text: 'Nhận yêu cầu tổng hợp lộ trình cho phòng Quản trị Dữ liệu.' },
      { time: '17:31:15', text: 'Bỏ qua 3 học phần đã đạt trong đánh giá đầu vào.' },
      { time: '17:31:18', text: 'Tạo lộ trình thích ứng: 4 tuần tập trung vào SQL nâng cao & PowerBI.', highlight: true },
      { time: '17:31:21', text: 'Tối ưu hóa: Tiết kiệm 45% thời gian học so với chương trình đại trà.' },
    ],
  },
  verifier: {
    id: 'AGENT-03',
    name: 'Đánh giá minh chứng',
    role: 'Đối chiếu bài thực hành với tiêu chí đánh giá và hỗ trợ quản lý phê duyệt.',
    badge: 'Thẩm định Minh chứng',
    kpi: 'Tiêu chí: 10/10 điểm',
    icon: ShieldCheck,
    colorClass: 'pulse-agent-icon-box--emerald',
    logs: [
      { time: '17:32:01', text: 'Nhận bài nộp minh chứng: Nguyễn Văn An - Tự động hóa báo cáo tuần.' },
      { time: '17:32:03', text: 'Đã kiểm tra tệp đính kèm và nội dung bài nộp.' },
      { time: '17:32:05', text: 'Điểm đề xuất: Ứng dụng 9.8/10; Nhân rộng 9.0/10.', highlight: true },
      { time: '17:32:07', text: 'Đã sẵn sàng chuyển Quản lý kỹ thuật phê duyệt chính thức.' },
    ],
  },
  forecaster: {
    id: 'AGENT-04',
    name: 'Dự báo đào tạo',
    role: 'Theo dõi tiến độ, nguồn lực và chi phí đào tạo.',
    badge: 'Dự báo ROI',
    kpi: 'Vận tốc: +3.8x',
    icon: LineChart,
    colorClass: 'pulse-agent-icon-box--purple',
    logs: [
      { time: '17:33:14', text: 'Phân tích dữ liệu hoàn thành khóa học và đánh giá sau đào tạo.' },
      { time: '17:33:17', text: 'Dự báo tốc độ đạt chuẩn vị trí tăng 3.8 lần so với đào tạo truyền thống.' },
      { time: '17:33:20', text: 'Ước tính ngân sách đào tạo tối ưu hóa: 450 triệu đồng cho quy mô 100 nhân sự.', highlight: true },
      { time: '17:33:22', text: 'Xuất báo cáo trực quan cho Ban Giám đốc (C-Level Dashboard).' },
    ],
  },
};

export function PulseBusinessLandingPage() {
  useUiLanguage();
  const user = useCurrentUser((state) => state.user);
  const home = user ? getDashboardPath(user) : null;
  const [activeTab, setActiveTab] = useState<DeckTab>('matrix');
  const [activeDept, setActiveDept] = useState<DeptKey>('all');
  const [roiIndex, setRoiIndex] = useState(1);
  const [activeTier, setActiveTier] = useState(4);
  const [assignedGap, setAssignedGap] = useState(false);
  const [reviewApproved, setReviewApproved] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentKey>('diagnostic');
  const [simulatingAgent, setSimulatingAgent] = useState(false);

  useEffect(() => rememberPortalChoice('enterprise'), []);

  const currentMetrics = DEPT_METRICS[activeDept];
  const currentRoi = ROI_TIERS[roiIndex];
  const currentAgent = AGENTS_DATA[selectedAgent];

  const handleSimulateAgent = () => {
    setSimulatingAgent(true);
    setTimeout(() => {
      setSimulatingAgent(false);
    }, 1200);
  };

  return (
    <PulsePublicShell>
      <div data-testid="landing-page" className="pulse-landing-2026">
        {/* ══════════════════════════════════════════════════════════════
            HERO: 3D COSMIC PORTAL GATEWAY (DRIBBBLE 26027093)
            ══════════════════════════════════════════════════════════════ */}
        <section className="pulse-hero-center pulse-public-wrap">
          {/* 3D Cosmic Portal Gateway SVG Background */}
          <div className="pulse-portal-backdrop" aria-hidden="true">
            <svg viewBox="0 0 900 560" className="pulse-portal-svg">
              <defs>
                <linearGradient id="portalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="portalGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
                </linearGradient>
                <radialGradient id="portalCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                  <stop offset="45%" stopColor="#6366f1" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Central Volumetric Glow */}
              <ellipse cx="450" cy="280" rx="340" ry="190" fill="url(#portalCoreGlow)" />

              {/* Concentric Rotating 3D Orbital Portal Rings */}
              <ellipse
                cx="450"
                cy="280"
                rx="380"
                ry="210"
                fill="none"
                stroke="url(#portalGrad1)"
                strokeWidth="1.8"
                strokeDasharray="8 6 24 6"
                className="pulse-portal-ring-1"
              />
              <ellipse
                cx="450"
                cy="280"
                rx="310"
                ry="165"
                fill="none"
                stroke="url(#portalGrad2)"
                strokeWidth="2.2"
                strokeDasharray="16 12 4 12"
                className="pulse-portal-ring-2"
              />
              <ellipse
                cx="450"
                cy="280"
                rx="240"
                ry="125"
                fill="none"
                stroke="rgba(56, 189, 248, 0.45)"
                strokeWidth="1.2"
                className="pulse-portal-ring-3"
              />

              {/* Floating Laser Particle Constellations */}
              <circle cx="210" cy="180" r="2.5" fill="#38bdf8" />
              <circle cx="680" cy="220" r="3" fill="#818cf8" />
              <circle cx="320" cy="390" r="2" fill="#34d399" />
              <circle cx="590" cy="360" r="2.5" fill="#f472b6" />
            </svg>
          </div>

          <div className="pulse-hero-badge">
            <span className="pulse-hero-badge-dot" />
            <span>NỀN TẢNG NĂNG LỰC SỐ CHUẨN THÔNG TƯ 02/2022/TT-BTTTT</span>
          </div>

          <h1 className="pulse-hero-headline">
            Định vị năng lực số.<br />
            <span className="pulse-hero-gradient">Bứt phá từ kết quả thật.</span>
          </h1>

          <p className="pulse-hero-subhead">
            Đánh giá năng lực theo vị trí, xác định nội dung cần bồi dưỡng và ghi nhận kết quả qua minh chứng thực tế.
          </p>

          <div className="pulse-hero-cta-group">
            <Link className="pulse-btn-primary" to={home ?? '/business/try'}>
              {home ? 'Vào không gian làm việc' : 'Trải nghiệm miễn phí 14 ngày'} <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="pulse-btn-secondary" to="/business/solution">
              Khám phá giải pháp <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          {/* Trust Ticker Ribbon */}
          <div className="pulse-hero-trust-ticker" aria-label="Các ưu thế cốt lõi">
            <div className="pulse-trust-pill">
              <Check size={14} className="text-[#38bdf8]" />
              <span>24 Khung năng lực TT02</span>
            </div>
            <div className="pulse-trust-pill">
              <Check size={14} className="text-[#38bdf8]" />
              <span>Tiết kiệm 45% thời gian đào tạo</span>
            </div>
            <div className="pulse-trust-pill">
              <Check size={14} className="text-[#38bdf8]" />
              <span>Thẩm định qua sản phẩm thật</span>
            </div>
            <div className="pulse-trust-pill">
              <Check size={14} className="text-[#38bdf8]" />
              <span>Báo cáo ROI thời gian thực</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            CENTERPIECE: 3D HOLOGRAPHIC WORKFORCE MATRIX & TELEMETRY DECK
            (Replaces legacy hexagon polygon with luxury 2026 Swiss-Tech glass)
            ══════════════════════════════════════════════════════════════ */}
        <section className="pulse-public-wrap pulse-deck-wrapper" aria-label="Trung tâm điều hành năng lực số">
          <div className="pulse-deck-container-rel">
            {/* Left Satellite Badge */}
            <div className="pulse-deck-satellite pulse-deck-satellite--left" aria-hidden="true">
              <div className="pulse-satellite-icon pulse-satellite-icon--emerald">
                <ShieldCheck size={19} />
              </div>
              <div className="pulse-satellite-text">
                <span className="pulse-satellite-eyebrow">SAT-01 // TT02_SYNC_NODE</span>
                <strong>100% Khớp 24 Năng Lực · PING: 14ms</strong>
              </div>
            </div>

            {/* Right Satellite Badge */}
            <div className="pulse-deck-satellite pulse-deck-satellite--right" aria-hidden="true">
              <div className="pulse-satellite-icon pulse-satellite-icon--blue">
                <TrendingUp size={19} />
              </div>
              <div className="pulse-satellite-text">
                <span className="pulse-satellite-eyebrow">SAT-02 // WORKFORCE_RADAR</span>
                <strong>Theo dõi năng lực và đào tạo</strong>
              </div>
            </div>

            {/* Telemetry Deck Window */}
            <div className="pulse-telemetry-deck">
              {/* Window Header */}
              <div className="pulse-deck-titlebar">
                <div className="pulse-deck-dots" aria-hidden="true">
                  <span className="pulse-dot-red" />
                  <span className="pulse-dot-yellow" />
                  <span className="pulse-dot-green" />
                </div>

                {/* View Switcher */}
                <div className="pulse-deck-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'matrix'}
                    className={`pulse-deck-tab ${activeTab === 'matrix' ? 'pulse-deck-tab--active' : ''}`}
                    onClick={() => setActiveTab('matrix')}
                  >
                    <Sparkles size={14} />
                    <span>Ma Trận Năng Lực TT02</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'gap'}
                    className={`pulse-deck-tab ${activeTab === 'gap' ? 'pulse-deck-tab--active' : ''}`}
                    onClick={() => setActiveTab('gap')}
                  >
                    <BarChart3 size={14} />
                    <span>{translateUi("Khoảng trống năng lực")}</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'verify'}
                    className={`pulse-deck-tab ${activeTab === 'verify' ? 'pulse-deck-tab--active' : ''}`}
                    onClick={() => setActiveTab('verify')}
                  >
                    <FileCheck2 size={14} />
                    <span>Thẩm Định Minh Chứng Thật</span>
                  </button>
                </div>

                <div className="pulse-deck-badge">
                  <span className="pulse-deck-badge-pulse" />
                  <span>Trực quan hóa thời gian thực</span>
                </div>
              </div>

              {/* KPI Status Strip */}
              <div className="pulse-deck-kpi-bar">
                <div className="pulse-deck-kpi-item">
                  <span className="pulse-deck-kpi-label">Chuẩn hóa toàn tổ chức</span>
                  <strong className="pulse-deck-kpi-val text-[#38bdf8]">88.5%</strong>
                </div>
                <div className="pulse-deck-kpi-sep" />
                <div className="pulse-deck-kpi-item">
                  <span className="pulse-deck-kpi-label">Nhân sự đã đo đầu vào</span>
                  <strong className="pulse-deck-kpi-val text-[#a3e635]">18 / 18</strong>
                </div>
                <div className="pulse-deck-kpi-sep" />
                <div className="pulse-deck-kpi-item">
                  <span className="pulse-deck-kpi-label">Minh chứng đã duyệt</span>
                  <strong className="pulse-deck-kpi-val text-[#cbd5e1]">{reviewApproved ? '15 Bài' : '14 Bài'}</strong>
                </div>
                <div className="pulse-deck-kpi-sep" />
                <div className="pulse-deck-kpi-item">
                  <span className="pulse-deck-kpi-label">Tiến độ cải thiện</span>
                  <strong className="pulse-deck-kpi-val text-[#38bdf8]">3.8x</strong>
                </div>
              </div>

              {/* Stage Content */}
              <div className="pulse-deck-stage">
                {/* TAB 1: WORKFORCE MATRIX (Sleek Glass Cards Grid) */}
                {activeTab === 'matrix' && (
                  <div>
                    {/* Department Switcher */}
                    <div className="pulse-deck-role-selector">
                      <button
                        type="button"
                        className={`pulse-role-chip ${activeDept === 'all' ? 'pulse-role-chip--active' : ''}`}
                        onClick={() => setActiveDept('all')}
                      >
                        <Building2 size={13} />
                        <span>{translateUi("Toàn doanh nghiệp")}</span>
                      </button>
                      <button
                        type="button"
                        className={`pulse-role-chip ${activeDept === 'tech' ? 'pulse-role-chip--active' : ''}`}
                        onClick={() => setActiveDept('tech')}
                      >
                        <Cpu size={13} />
                        <span>Phòng Kỹ thuật & AI</span>
                      </button>
                      <button
                        type="button"
                        className={`pulse-role-chip ${activeDept === 'biz' ? 'pulse-role-chip--active' : ''}`}
                        onClick={() => setActiveDept('biz')}
                      >
                        <LineChart size={13} />
                        <span>Kinh doanh & Marketing</span>
                      </button>
                      <button
                        type="button"
                        className={`pulse-role-chip ${activeDept === 'ops' ? 'pulse-role-chip--active' : ''}`}
                        onClick={() => setActiveDept('ops')}
                      >
                        <UsersRound size={13} />
                        <span>Vận hành & Nhân sự</span>
                      </button>
                    </div>

                    {/* 6 High-Tech Competency Cards Grid */}
                    <div className="pulse-matrix-grid">
                      {currentMetrics.map((item, idx) => (
                        <div key={idx} className="pulse-matrix-cell">
                          <div className="pulse-matrix-cell-head">
                            <span className="pulse-matrix-domain">TRỤ CỘT 0{idx + 1}</span>
                            <span className="pulse-matrix-score" style={{ color: item.color }}>{item.score}</span>
                          </div>
                          <h4 className="pulse-matrix-name">{item.domain}</h4>
                          <div className="pulse-meter-bar-track">
                            <div
                              className="pulse-meter-bar-fill"
                              style={{ width: `${item.percent}%`, background: item.color }}
                            />
                          </div>
                          <span
                            className={`pulse-matrix-status-pill ${
                              item.status === 'pass'
                                ? 'pulse-matrix-status-pill--pass'
                                : 'pulse-matrix-status-pill--gap'
                            }`}
                          >
                            {item.statusText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: SKILL GAP CLOSER */}
                {activeTab === 'gap' && (
                  <div className="pulse-deck-view pulse-deck-view--gap">
                    <div className="pulse-gap-row-list">
                      <div className="pulse-gap-row">
                        <div className="pulse-gap-meta">
                          <strong>M6. Trí tuệ nhân tạo (GenAI & Prompting)</strong>
                          <span>Chênh lệch: {assignedGap ? '0% · Đang học' : '18% · Cần học 1 khóa'}</span>
                        </div>
                        <div className="pulse-gap-progress-track">
                          <div
                            className={`pulse-gap-bar ${assignedGap ? 'pulse-gap-bar--good' : 'pulse-gap-bar--current'}`}
                            style={{ width: assignedGap ? '80%' : '62%' }}
                          >
                            {assignedGap ? '80%' : '62%'}
                          </div>
                          <div className="pulse-gap-target-marker" style={{ left: '80%' }} title="Chuẩn vị trí: 80%" />
                        </div>
                        <button
                          type="button"
                          className={`pulse-gap-action-chip ${assignedGap ? 'pulse-gap-action-chip--done' : ''}`}
                          onClick={() => setAssignedGap((v) => !v)}
                        >
                          {assignedGap ? '✓ Đã giao khóa học' : 'Giao khóa M6'}
                        </button>
                      </div>

                      <div className="pulse-gap-row">
                        <div className="pulse-gap-meta">
                          <strong>M2. Quản trị Dữ liệu & Phân tích số</strong>
                          <span>Khoảng cách: -8% · Gần đạt chuẩn</span>
                        </div>
                        <div className="pulse-gap-progress-track">
                          <div className="pulse-gap-bar pulse-gap-bar--good" style={{ width: '74%' }}>74%</div>
                          <div className="pulse-gap-target-marker" style={{ left: '80%' }} />
                        </div>
                        <span className="pulse-gap-action-chip pulse-gap-action-chip--ok">Đang hoàn thành</span>
                      </div>

                      <div className="pulse-gap-row">
                        <div className="pulse-gap-meta">
                          <strong>M4. An toàn thông tin & Bảo mật số</strong>
                          <span>Khoảng cách: 0% · Đã đạt mức tối đa</span>
                        </div>
                        <div className="pulse-gap-progress-track">
                          <div className="pulse-gap-bar pulse-gap-bar--done" style={{ width: '85%' }}>85%</div>
                          <div className="pulse-gap-target-marker" style={{ left: '80%' }} />
                        </div>
                        <span className="pulse-gap-action-chip pulse-gap-action-chip--done">✓ Đạt chuẩn</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: EVIDENCE VERIFICATION */}
                {activeTab === 'verify' && (
                  <div className="pulse-deck-view pulse-deck-view--review">
                    <div className="pulse-review-card-sample">
                      <div className="pulse-review-header">
                        <div className="pulse-review-avatar">NV</div>
                        <div>
                          <strong>Nguyễn Văn An · Chuyên viên Phân tích Nghiệp vụ</strong>
                          <span>Bài tập cuối khóa: Quy trình phân tích dữ liệu tự động hóa báo cáo tuần</span>
                        </div>
                        {reviewApproved ? (
                          <span className="pulse-review-badge-verified">✓ ĐÃ PHÊ DUYỆT</span>
                        ) : (
                          <span className="pulse-review-badge-pending">⏳ CHỜ THẨM ĐỊNH</span>
                        )}
                      </div>

                      <div className="pulse-review-rubric">
                        <div className="pulse-rubric-item">
                          <span>Minh chứng thực tế từ dự án:</span>
                          <strong>10 / 10 điểm</strong>
                        </div>
                        <div className="pulse-rubric-item">
                          <span>Ứng dụng công cụ số & AI:</span>
                          <strong>9.5 / 10 điểm</strong>
                        </div>
                        <div className="pulse-rubric-item">
                          <span>Khả năng nhân rộng trong team:</span>
                          <strong>9.0 / 10 điểm</strong>
                        </div>
                      </div>

                      <div className="pulse-review-feedback">
                        <em>&ldquo;Sản phẩm hoàn thành xuất sắc, quy trình tự động hóa giúp team tiết kiệm 4 giờ nhập liệu mỗi tuần. Cấp chứng nhận chuẩn năng lực Mức 2.&rdquo;</em>
                        <span>— Trần Hoàng Quân · Trưởng phòng Kỹ thuật</span>
                      </div>

                      <div className="pulse-review-actions-bar">
                        {reviewApproved ? (
                          <button
                            type="button"
                            className="pulse-review-toggle-btn pulse-review-toggle-btn--undo"
                            onClick={() => setReviewApproved(false)}
                          >
                            Hủy phê duyệt (Thử nghiệm)
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="pulse-review-toggle-btn pulse-review-toggle-btn--approve"
                            onClick={() => setReviewApproved(true)}
                          >
                            ✓ Duyệt minh chứng & Cấp chứng chỉ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            AIAF MULTI-AGENT AUTONOMOUS NETWORK (DRIBBBLE 25941150)
            4 Autonomous AI Agents · Interactive Pipeline Console
            ══════════════════════════════════════════════════════════════ */}
        <section className="pulse-public-section pulse-public-wrap pulse-agents-section" id="ai-agents">
          <div className="pulse-section-heading-center">
            <span className="pulse-kicker">MẠNG LƯỚI AI AGENT TỰ TRỊ · KIẾN TRÚC AIAF 2026</span>
            <h2>4 AI Agent Chuyên Trách. <em>Vận hành tự động 24/7.</em></h2>
            <p>
              Không phụ thuộc vào quy trình thủ công. Hệ thống 4 Agent phối hợp liên tục để chẩn đoán khoảng cách,
              tổng hợp lộ trình, kiểm duyệt bài làm thực tế và dự báo ROI cho ban giám đốc.
            </p>
          </div>

          {/* 4 Agent Cards Grid */}
          <div className="pulse-agents-grid">
            {(Object.keys(AGENTS_DATA) as AgentKey[]).map((key) => {
              const ag = AGENTS_DATA[key];
              const IconComp = ag.icon;
              const isActive = selectedAgent === key;
              return (
                <div
                  key={key}
                  role="button"
                  tabIndex={0}
                  className={`pulse-agent-card ${isActive ? 'pulse-agent-card--active' : ''}`}
                  onClick={() => setSelectedAgent(key)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedAgent(key)}
                >
                  <div>
                    <div className="pulse-agent-top">
                      <div className={`pulse-agent-icon-box ${ag.colorClass}`}>
                        <IconComp size={22} />
                      </div>
                      <span className="pulse-agent-id-pill">{ag.id}</span>
                    </div>

                    <h3 className="pulse-agent-name">{ag.name}</h3>
                    <p className="pulse-agent-role">{ag.role}</p>
                  </div>

                  <div className="pulse-agent-footer">
                    <span className="pulse-agent-status">
                      <span className="pulse-agent-dot" />
                      {ag.badge}
                    </span>
                    <span className="pulse-agent-kpi">{ag.kpi}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Agent Execution Console */}
          <div className="pulse-agent-console">
            <div className="pulse-console-header">
              <div className="pulse-console-title">
                <Terminal size={16} className="text-[#38bdf8]" />
                <span>NEURAL DATA STREAM // {currentAgent.id}: {currentAgent.name.toUpperCase()}</span>
                <span className="pulse-console-tag">LIVE EXECUTION</span>
              </div>

              <div className="pulse-console-actions">
                <button
                  type="button"
                  className="pulse-console-sim-btn"
                  onClick={handleSimulateAgent}
                  disabled={simulatingAgent}
                >
                  <Radio size={13} className={simulatingAgent ? 'animate-spin' : ''} />
                  <span>{simulatingAgent ? 'Đang phân tích...' : 'Mô phỏng kích hoạt Agent'}</span>
                </button>
              </div>
            </div>

            <div className="pulse-console-body">
              {currentAgent.logs.map((log, index) => (
                <div key={index} className="pulse-console-log-row">
                  <span className="pulse-console-ts">[{log.time}]</span>
                  <span className="pulse-console-sender">&gt;&gt; {currentAgent.id}:</span>
                  <span className={`pulse-console-msg ${log.highlight ? 'pulse-console-msg--highlight' : ''}`}>
                    {log.text}
                  </span>
                </div>
              ))}
              {simulatingAgent && (
                <div className="pulse-console-log-row">
                  <span className="pulse-console-ts">[17:34:00]</span>
                  <span className="pulse-console-sender">&gt;&gt; {currentAgent.id}:</span>
                  <span className="pulse-console-msg text-[#38bdf8] animate-pulse">
                    Đang kích hoạt chuỗi neural node: Tối ưu dữ liệu đầu vào cho 100% nhân sự...
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            BENTO GRID: 4 CORE PILLARS (GRANGER SWISS-TECH DRIBBBLE 26361206)
            ══════════════════════════════════════════════════════════════ */}
        <section className="pulse-public-section pulse-public-wrap" id="hanh-trinh">
          <div className="pulse-section-heading-center">
            <span className="pulse-kicker">MÔ HÌNH KHÉP KÍN 2026</span>
            <h2>Chuyển hóa đào tạo thành <em>năng lực cạnh tranh thực chất.</em></h2>
            <p>Không học đại trà, không lý thuyết suông. Mọi tiến bộ đều đo lường được trên sản phẩm thật.</p>
          </div>

          <div className="pulse-bento-grid">
            <article className="pulse-bento-card pulse-bento-card--large">
              <div className="pulse-bento-top">
                <div className="pulse-bento-icon pulse-bento-icon--blue"><Compass size={22} /></div>
                <span className="pulse-bento-step">BƯỚC 01</span>
              </div>
              <h3>Đo chuẩn đầu vào thích ứng</h3>
              <p>Đối chiếu năng lực hiện tại với yêu cầu của từng vị trí.</p>
              <div className="pulse-bento-mini-visual">
                <div className="pulse-mini-bar-compare">
                  <div><span>{translateUi("Hiện tại")}</span><strong className="text-amber-500">62%</strong></div>
                  <ArrowRight size={14} className="text-slate-400" />
                  <div><span>{translateUi("Chuẩn vị trí")}</span><strong className="text-emerald-500">85%</strong></div>
                  <span className="pulse-mini-gap-pill">Chênh lệch: 23%</span>
                </div>
              </div>
            </article>

            <article className="pulse-bento-card">
              <div className="pulse-bento-top">
                <div className="pulse-bento-icon pulse-bento-icon--coral"><Zap size={22} /></div>
                <span className="pulse-bento-step">BƯỚC 02</span>
              </div>
              <h3>Học đúng chỗ còn thiếu</h3>
              <p>Tập trung vào nội dung cần cải thiện và ghi nhận phần đã đạt.</p>
              <div className="pulse-bento-stat-chip">Giảm 45% thời gian học</div>
            </article>

            <article className="pulse-bento-card">
              <div className="pulse-bento-top">
                <div className="pulse-bento-icon pulse-bento-icon--lime"><FileCheck2 size={22} /></div>
                <span className="pulse-bento-step">BƯỚC 03</span>
              </div>
              <h3>Minh chứng công việc thật</h3>
              <p>Thay vì trắc nghiệm lý thuyết, nhân viên nộp sản phẩm thực tế từ dự án để quản lý thẩm định trực tiếp.</p>
              <div className="pulse-bento-stat-chip pulse-bento-stat-chip--lime">Đánh giá theo tiêu chí</div>
            </article>

            <article className="pulse-bento-card pulse-bento-card--large">
              <div className="pulse-bento-top">
                <div className="pulse-bento-icon pulse-bento-icon--indigo"><BarChart3 size={22} /></div>
                <span className="pulse-bento-step">BƯỚC 04</span>
              </div>
              <h3>Báo cáo ROI & Sức khỏe kỹ năng</h3>
              <p>Ban giám đốc kiểm soát toàn diện tiến độ chuẩn hóa năng lực của mọi phòng ban và nhân sự trên một dashboard duy nhất.</p>
              <div className="pulse-bento-mini-visual">
                <div className="pulse-mini-departments">
                  <span>Kỹ thuật: 92%</span>
                  <span>Kinh doanh: 84%</span>
                  <span>Vận hành: 88%</span>
                  <span>Nhân sự: 90%</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            INTERACTIVE ROI & TEAM SIZE CALCULATOR
            ══════════════════════════════════════════════════════════════ */}
        <section className="pulse-public-section pulse-public-wrap" id="mo-phong-roi">
          <div className="pulse-roi-deck">
            <div className="pulse-roi-deck-header">
              <span className="pulse-kicker">MÔ PHỎNG LỢI ÍCH ĐÀO TẠO</span>
              <h2>Tính toán hiệu quả cho <em>quy mô của bạn.</em></h2>
              <p>Chọn quy mô nhân sự để xem mức thời gian và ngân sách có thể tối ưu hóa khi ứng dụng DigiTalent Pulse.</p>
            </div>

            {/* Slider Chips */}
            <div className="pulse-roi-slider-chips">
              {ROI_TIERS.map((t, idx) => (
                <button
                  key={t.size}
                  type="button"
                  className={`pulse-roi-slider-btn ${roiIndex === idx ? 'pulse-roi-slider-btn--active' : ''}`}
                  onClick={() => setRoiIndex(idx)}
                >
                  <strong>{translateUi(t.label)}</strong>
                </button>
              ))}
            </div>

            {/* Live Numbers Grid */}
            <div className="pulse-roi-numbers-grid">
              <div className="pulse-roi-metric-box pulse-roi-metric-box--hero">
                <span>Thời gian lãng phí được cắt giảm</span>
                <strong>{currentRoi.hours}</strong>
                <small>Nhờ loại bỏ đào tạo đại tràn lan</small>
              </div>

              <div className="pulse-roi-metric-box">
                <span>Ngân sách đào tạo tối ưu hóa</span>
                <strong className="text-[#38bdf8]">{currentRoi.savings}</strong>
                <small>Tiết kiệm bản quyền & chi phí lặp lại</small>
              </div>

              <div className="pulse-roi-metric-box">
                <span>Tiến độ cải thiện năng lực</span>
                <strong className="text-[#34d399]">{currentRoi.speed}</strong>
                <small>Nhân sự đạt chuẩn vị trí nhanh hơn</small>
              </div>
            </div>

            <div className="pulse-roi-bottom-action">
              <span>Sẵn sàng chuẩn hóa cho quy mô {translateUi(currentRoi.label)}?</span>
              <Link to="/business/try" className="pulse-btn-primary pulse-btn-primary--compact">
                Kích hoạt dùng thử ngay <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            INTERACTIVE 4-TIER COMPETENCY CASCADE
            ══════════════════════════════════════════════════════════════ */}
        <section className="pulse-public-section pulse-public-wrap" id="khung-nang-luc">
          <div className="pulse-section-heading-center">
            <span className="pulse-kicker">KIẾN TRÚC ĐA TẦNG</span>
            <h2>Một chuẩn chung. <em>Đích đến riêng cho mỗi vị trí.</em></h2>
            <p>Doanh nghiệp chọn phạm vi đào tạo theo mục tiêu tổ chức, phòng ban và vị trí công việc.</p>
          </div>

          <div className="pulse-cascade-flow">
            <div
              className={`pulse-cascade-card ${activeTier === 1 ? 'pulse-cascade-card--active' : ''}`}
              onClick={() => setActiveTier(1)}
            >
              <span className="pulse-cascade-tier">{translateUi("CẤP 1")}</span>
              <h4>Chuẩn Quốc Gia TT02</h4>
              <p>24 năng lực số của Bộ TTTT</p>
            </div>
            <div className="pulse-cascade-arrow">➔</div>

            <div
              className={`pulse-cascade-card ${activeTier === 2 ? 'pulse-cascade-card--active' : ''}`}
              onClick={() => setActiveTier(2)}
            >
              <span className="pulse-cascade-tier">{translateUi("CẤP 2")}</span>
              <h4>Phạm vi doanh nghiệp</h4>
              <p>Chiến lược chuyển đổi số của công ty</p>
            </div>
            <div className="pulse-cascade-arrow">➔</div>

            <div
              className={`pulse-cascade-card ${activeTier === 3 ? 'pulse-cascade-card--active' : ''}`}
              onClick={() => setActiveTier(3)}
            >
              <span className="pulse-cascade-tier">{translateUi("CẤP 3")}</span>
              <h4>Mục Tiêu Phòng Ban</h4>
              <p>Kỹ thuật, Kinh doanh, Vận hành</p>
            </div>
            <div className="pulse-cascade-arrow">➔</div>

            <div
              className={`pulse-cascade-card ${activeTier === 4 ? 'pulse-cascade-card--active' : ''}`}
              onClick={() => setActiveTier(4)}
            >
              <span className="pulse-cascade-tier">CẤP 4</span>
              <h4>Chuẩn Vị Trí Việc Làm</h4>
              <p>Căn cứ chẩn đoán đầu vào & tạo lộ trình</p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            FINAL CALL TO ACTION BANNER
            ══════════════════════════════════════════════════════════════ */}
        <section className="pulse-public-wrap pulse-final-cta-section">
          <div className="pulse-final-cta-card">
            <div className="pulse-final-cta-copy">
              <span className="pulse-kicker">BẮT ĐẦU NGAY HÔM NAY</span>
              <h2>Sẵn sàng xây dựng đội ngũ có năng lực số vượt trội?</h2>
              <p>Trải nghiệm đầy đủ giải pháp với các khóa học Cơ bản và khung năng lực chuẩn hóa mẫu.</p>
            </div>
            <Link className="pulse-btn-primary pulse-btn-primary--light" to={home ?? '/business/try'}>
              {home ? 'Vào hệ thống' : 'Bắt đầu dùng thử miễn phí'} <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </PulsePublicShell>
  );
}
