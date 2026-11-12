import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Target,
  Cpu,
  FileCheck2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Hand,
} from 'lucide-react';
import RoundCarousel, { type RoundCarouselItem } from '@/components/originkit/RoundCarousel';

export interface Scene5MetricItem {
  label: string;
  value: string;
}

export interface Scene5ModuleCard {
  id: string;
  num: string;
  phase: string;
  tabLabel: string;
  kpiLabel: string;
  kpiValue: string;
  title: string;
  summary: string;
  metrics: Scene5MetricItem[];
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  footerStatus: string;
  footerStandard: string;
  image?: string;
  roleTag?: string;
}

export const SCENE5_DEFAULT_MODULES: Scene5ModuleCard[] = [
  {
    id: 'assessment',
    num: '01',
    phase: 'Thu thập',
    tabLabel: 'Khảo thí AI',
    kpiLabel: 'Quy mô',
    kpiValue: '54 tình huống',
    title: 'Khảo thí thích ứng AI',
    summary: 'Phân phối đề thi thực tế theo chức danh, giám sát phiên thi qua camera AI và chấm điểm tức thì.',
    metrics: [
      { label: 'Cấu trúc đề', value: 'Theo chức danh thực tế' },
      { label: 'Giám sát phiên', value: 'Camera và đối chiếu AI' },
    ],
    icon: ShieldCheck,
    accentColor: '#38bdf8',
    footerStatus: 'Vận hành chuẩn hóa',
    footerStandard: 'Khảo thí chuẩn',
  },
  {
    id: 'skillgap',
    num: '02',
    phase: 'Bóc tách',
    tabLabel: 'Ma trận Gap',
    kpiLabel: 'Tiêu chuẩn',
    kpiValue: 'Khung 6 miền năng lực',
    title: 'Ma trận khoảng trống kỹ năng',
    summary: 'Đối chiếu năng lực thực tế với khung chuẩn để định vị nhân sự cần bồi dưỡng kịp thời.',
    metrics: [
      { label: 'Chuẩn đối chiếu', value: 'Khung 6 miền năng lực' },
      { label: 'Phân loại', value: '68% Đạt chuẩn · 32% Bồi dưỡng' },
    ],
    icon: Target,
    accentColor: '#10b981',
    footerStatus: 'Bóc tách 6 miền',
    footerStandard: 'Khung 6 miền',
  },
  {
    id: 'adaptive-lms',
    num: '03',
    phase: 'Bồi dưỡng',
    tabLabel: 'Đào tạo LMS',
    kpiLabel: 'Tối ưu',
    kpiValue: '15 - 25 phút / bài',
    title: 'Đào tạo thích ứng vi mô',
    summary: 'Miễn trừ phần kiến thức nhân viên đã nắm vững, chỉ tập trung bài học 15 phút bù đắp kỹ năng thiếu hụt.',
    metrics: [
      { label: 'Cơ chế học', value: 'Miễn trừ phần đã đạt' },
      { label: 'Thời lượng', value: '15 đến 25 phút mỗi bài' },
    ],
    icon: Cpu,
    accentColor: '#a855f7',
    footerStatus: 'Tối ưu lộ trình',
    footerStandard: 'Micro-Learning',
  },
  {
    id: 'governance',
    num: '04',
    phase: 'Kiểm định',
    tabLabel: 'Kiểm định số',
    kpiLabel: 'Bảo mật',
    kpiValue: 'Nghị định 13/2023',
    title: 'Kiểm định và cấp chứng nhận số',
    summary: 'Đánh giá độc lập sau đào tạo, cấp chứng nhận số có mã xác thực và lưu vết đầy đủ nhật ký kiểm toán.',
    metrics: [
      { label: 'Xác thực số', value: 'Mã tra cứu và chữ ký số' },
      { label: 'Bảo mật', value: 'Nghị định 13/2023/NĐ-CP' },
    ],
    icon: FileCheck2,
    accentColor: '#f59e0b',
    footerStatus: 'Lưu vết kiểm toán',
    footerStandard: 'NĐ 13/2023',
  },
  {
    id: 'dashboard',
    num: '05',
    phase: 'Chỉ huy',
    tabLabel: 'Bảng điều khiển',
    kpiLabel: 'Dữ liệu',
    kpiValue: 'Toàn công ty',
    title: 'Bảng điều khiển quản trị tập trung',
    summary: 'Theo dõi tỷ lệ hoàn thành và mức độ sẵn sàng công nghệ theo từng phòng ban trên cùng một giao diện.',
    metrics: [
      { label: 'Mức đạt chuẩn', value: '81.3% nhân sự đạt chuẩn' },
      { label: 'Theo dõi', value: 'Theo từng khối phòng ban' },
    ],
    icon: BarChart3,
    accentColor: '#3b82f6',
    footerStatus: 'Đồng bộ thời gian thực',
    footerStandard: 'Telemetry',
  },
];

interface Scene5RoundCarouselProps {
  modules?: Scene5ModuleCard[];
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  speed?: number;
}

export function Scene5RoundCarousel({
  modules = SCENE5_DEFAULT_MODULES,
  activeIndex,
  onActiveIndexChange,
  speed = 2.0,
}: Scene5RoundCarouselProps) {
  const items = modules.length > 0 ? modules : SCENE5_DEFAULT_MODULES;
  const count = items.length;
  const [internalActiveIdx, setInternalActiveIdx] = useState(0);

  // Responsive sizing for the Originkit 3D cylinder (Adapting dynamically to BOTH width and height)
  const [carouselConfig, setCarouselConfig] = useState({
    imageWidth: 265,
    imageHeight: 320,
    spacing: 6.0,
    tilt: -5.5,
    perspective: 2450,
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Adapt based on both width AND height for perfect laptop, desktop, and wide-screen scaling
      if (h < 560 || w < 480) {
        setCarouselConfig({
          imageWidth: 232,
          imageHeight: 272,
          spacing: 5.2,
          tilt: -4.5,
          perspective: 2050,
        });
      } else if (h < 720 || w < 768) {
        setCarouselConfig({
          imageWidth: 245,
          imageHeight: 294,
          spacing: 5.6,
          tilt: -5.0,
          perspective: 2250,
        });
      } else if (h < 860 || w < 1200) {
        setCarouselConfig({
          imageWidth: 265,
          imageHeight: 320,
          spacing: 6.0,
          tilt: -5.5,
          perspective: 2450,
        });
      } else {
        setCarouselConfig({
          imageWidth: 282,
          imageHeight: 345,
          spacing: 6.4,
          tilt: -5.5,
          perspective: 2650,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Proposal 2 Micro-UI Slices (Pure CSS/SVG, zero human photos, translucent glass theme)
  const renderSlice = (modId: string) => {
    switch (modId) {
      case 'assessment':
        return (
          <div className="s5-slice s5-slice-proctoring">
            <div className="s5-reticle-box">
              <div className="s5-corner s5-c-tl" />
              <div className="s5-corner s5-c-tr" />
              <div className="s5-corner s5-c-bl" />
              <div className="s5-corner s5-c-br" />
              <div className="s5-reticle-scan-beam" />
              <div className="s5-reticle-crosshair" />
              <div className="s5-reticle-status">
                <span className="s5-pulse-dot" />
                <span>AI PROCTORING · 99.4% KHỚP</span>
              </div>
            </div>
            <div className="s5-telemetry-grid">
              <div className="s5-tele-item">
                <span className="s5-tele-label">Giám sát camera</span>
                <span className="s5-tele-val text-sky">Chuẩn hóa 1:1</span>
              </div>
              <div className="s5-tele-item">
                <span className="s5-tele-label">Bộ tình huống</span>
                <span className="s5-tele-val text-emerald">54 / 54 câu</span>
              </div>
            </div>
          </div>
        );

      case 'skillgap':
        return (
          <div className="s5-slice s5-slice-radar">
            <div className="s5-radar-chart-wrap">
              <svg viewBox="0 0 100 100" className="s5-radar-svg" aria-label="Biểu đồ radar 6 miền năng lực">
                {/* Concentric reference hexagons */}
                <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
                <polygon points="50,26 71,38 71,62 50,74 29,62 29,38" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
                <polygon points="50,37 62,44 62,56 50,63 38,56 38,44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
                {/* Axis lines */}
                <line x1="50" y1="50" x2="50" y2="15" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                <line x1="50" y1="50" x2="80" y2="32" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                <line x1="50" y1="50" x2="80" y2="68" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                <line x1="50" y1="50" x2="50" y2="85" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                <line x1="50" y1="50" x2="20" y2="68" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                <line x1="50" y1="50" x2="20" y2="32" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                {/* Benchmark standard line (dashed cyan) */}
                <polygon points="50,22 74,35 72,64 50,76 26,64 28,36" fill="none" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1" strokeDasharray="2,2" />
                {/* Team actual capability polygon (emerald) */}
                <polygon points="50,19 77,33 67,61 50,72 31,60 24,34" fill="rgba(16, 185, 129, 0.22)" stroke="#10b981" strokeWidth="1.6" />
                {/* Domain labels */}
                <text x="50" y="11" textAnchor="middle" fill="#94a3b8" fontSize="5.5" fontWeight="600">Dữ liệu</text>
                <text x="86" y="33" textAnchor="start" fill="#94a3b8" fontSize="5.5" fontWeight="600">An toàn</text>
                <text x="86" y="70" textAnchor="start" fill="#94a3b8" fontSize="5.5" fontWeight="600">Hợp tác</text>
                <text x="50" y="93" textAnchor="middle" fill="#94a3b8" fontSize="5.5" fontWeight="600">Đổi mới</text>
                <text x="14" y="70" textAnchor="end" fill="#94a3b8" fontSize="5.5" fontWeight="600">Quản trị</text>
                <text x="14" y="33" textAnchor="end" fill="#94a3b8" fontSize="5.5" fontWeight="600">Công nghệ</text>
              </svg>
            </div>
            <div className="s5-radar-chips">
              <div className="s5-chip-pill s5-chip-pass">
                <span className="s5-chip-bullet bg-emerald" />
                <span>Đạt chuẩn: <strong>68%</strong></span>
              </div>
              <div className="s5-chip-pill s5-chip-gap">
                <span className="s5-chip-bullet bg-amber" />
                <span>Bồi dưỡng: <strong>32%</strong></span>
              </div>
            </div>
          </div>
        );

      case 'adaptive-lms':
        return (
          <div className="s5-slice s5-slice-pathway">
            <div className="s5-pathway-track">
              <div className="s5-path-step s5-step-done">
                <div className="s5-step-marker">✓</div>
                <div className="s5-step-info">
                  <span className="s5-step-title">Kiến thức đã vững</span>
                  <span className="s5-step-tag">Miễn trừ 4 module</span>
                </div>
              </div>
              <div className="s5-path-connector active" />
              <div className="s5-path-step s5-step-active">
                <div className="s5-step-marker pulse">2</div>
                <div className="s5-step-info">
                  <span className="s5-step-title">Kỹ năng thiếu hụt</span>
                  <span className="s5-step-tag active">15 phút vi mô</span>
                </div>
              </div>
              <div className="s5-path-connector" />
              <div className="s5-path-step s5-step-next">
                <div className="s5-step-marker">3</div>
                <div className="s5-step-info">
                  <span className="s5-step-title">Đánh giá chuẩn hóa</span>
                  <span className="s5-step-tag">Đạt chuẩn đầu ra</span>
                </div>
              </div>
            </div>
            <div className="s5-path-banner">
              <span>Tối ưu 65% thời gian đào tạo</span>
            </div>
          </div>
        );

      case 'governance':
        return (
          <div className="s5-slice s5-slice-cert">
            <div className="s5-cert-card-inner">
              <div className="s5-cert-shield">
                <FileCheck2 size={24} className="s5-cert-icon" />
              </div>
              <div className="s5-cert-meta">
                <span className="s5-cert-badge-tag">CHỨNG NHẬN SỐ DOANH NGHIỆP</span>
                <span className="s5-cert-code">CERT-2025-VN-0891</span>
                <span className="s5-cert-hash">SHA-256: 4f8b9e...2a1c</span>
              </div>
            </div>
            <div className="s5-cert-features">
              <div className="s5-cert-chip">Tra cứu mã QR 1:1</div>
              <div className="s5-cert-chip">Bảo mật Nghị định 13</div>
            </div>
          </div>
        );

      case 'dashboard':
      default:
        return (
          <div className="s5-slice s5-slice-telemetry">
            <div className="s5-tele-header">
              <span className="s5-tele-title">Mức sẵn sàng toàn doanh nghiệp</span>
              <span className="s5-tele-score">81.3%</span>
            </div>
            <div className="s5-bars-list">
              <div className="s5-bar-row">
                <div className="s5-bar-labels">
                  <span>Khối Kinh doanh</span>
                  <span>88%</span>
                </div>
                <div className="s5-bar-track">
                  <div className="s5-bar-fill" style={{ width: '88%', backgroundColor: '#38bdf8' }} />
                </div>
              </div>
              <div className="s5-bar-row">
                <div className="s5-bar-labels">
                  <span>Khối Kỹ thuật & IT</span>
                  <span>94%</span>
                </div>
                <div className="s5-bar-track">
                  <div className="s5-bar-fill" style={{ width: '94%', backgroundColor: '#10b981' }} />
                </div>
              </div>
              <div className="s5-bar-row">
                <div className="s5-bar-labels">
                  <span>Khối Vận hành</span>
                  <span>76%</span>
                </div>
                <div className="s5-bar-track">
                  <div className="s5-bar-fill" style={{ width: '76%', backgroundColor: '#f59e0b' }} />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Map modules into RoundCarouselItem format
  const carouselItems: RoundCarouselItem[] = items.map((mod) => ({
    id: mod.id,
    num: mod.num,
    phase: mod.phase,
    title: mod.title,
    desc: mod.summary,
    metric: mod.kpiValue,
    accentColor: mod.accentColor,
    uiSlice: renderSlice(mod.id),
    footerStatus: mod.footerStatus,
    footerStandard: mod.footerStandard,
  }));

  const handleActiveChange = (idx: number) => {
    setInternalActiveIdx(idx);
    onActiveIndexChange?.(idx);
  };

  const handleTabClick = (idx: number) => {
    setInternalActiveIdx(idx);
    onActiveIndexChange?.(idx);
  };

  const handleStep = (direction: 'prev' | 'next') => {
    const nextIdx =
      direction === 'next'
        ? (internalActiveIdx + 1) % count
        : (internalActiveIdx - 1 + count) % count;
    setInternalActiveIdx(nextIdx);
    onActiveIndexChange?.(nextIdx);
  };

  return (
    <div className="scene5-carousel-wrapper">
      {/* 1. Holographic Showroom Pedestal Light Projection & Uplight Aura (Anchored to pedestal surface) */}
      <div className="s5-pedestal-light-aura" aria-hidden="true">
        <div className="s5-pedestal-beam-cone" />
        <div className="s5-pedestal-disc-pool" />
        <div className="s5-pedestal-ring-halo" />
        <div className="s5-pedestal-vertical-glow" />
      </div>

      {/* 2. Originkit 3D Round Carousel Viewport with Middle Navigation Arrows */}
      <div className="scene5-originkit-stage">
        {/* Previous Arrow Button (Vertically Centered in Stage) */}
        <button
          type="button"
          className="scene5-stage-nav-arrow nav-prev"
          aria-label="Phân hệ trước"
          onClick={() => handleStep('prev')}
        >
          <ChevronLeft size={26} aria-hidden="true" />
        </button>

        <RoundCarousel
          items={carouselItems}
          imageWidth={carouselConfig.imageWidth}
          imageHeight={carouselConfig.imageHeight}
          spacing={carouselConfig.spacing}
          speed={speed}
          direction="left"
          drag={true}
          sensitivity={4.5}
          tilt={carouselConfig.tilt}
          perspective={carouselConfig.perspective}
          cornerRadius={20}
          innerDim={10}
          background="transparent"
          activeIndex={activeIndex ?? internalActiveIdx}
          onActiveIndexChange={handleActiveChange}
        />

        {/* Next Arrow Button (Vertically Centered in Stage) */}
        <button
          type="button"
          className="scene5-stage-nav-arrow nav-next"
          aria-label="Phân hệ tiếp theo"
          onClick={() => handleStep('next')}
        >
          <ChevronRight size={26} aria-hidden="true" />
        </button>
      </div>

      {/* 3. Bottom 5-Card Indicator Strip */}
      <div className="scene5-bottom-bar-strip">
        <div className="scene5-selector-pills" role="tablist" aria-label="Chọn phân hệ công nghệ">
          {items.map((mod, idx) => {
            const isCenter = (activeIndex ?? internalActiveIdx) === idx;
            const IconComp = mod.icon;
            return (
              <button
                key={mod.id}
                type="button"
                role="tab"
                aria-selected={isCenter}
                className={`scene5-pill-btn ${isCenter ? 'is-active' : ''}`}
                onClick={() => handleTabClick(idx)}
              >
                <span className="scene5-pill-num">{mod.num}</span>
                <IconComp size={13} className="scene5-pill-icon" aria-hidden="true" />
                <span className="scene5-pill-label">{mod.tabLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Subtle Drag/Swipe Guidance Hint */}
      <div className="scene5-drag-hint">
        <Hand size={13} className="scene5-hint-icon" aria-hidden="true" />
        <span>Kéo chuột hoặc vuốt để xoay 3D</span>
      </div>
    </div>
  );
}
