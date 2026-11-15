import { memo, useCallback, useLayoutEffect, useState, useEffect, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Database,
  FileCheck2,
  HelpCircle,
  KeyRound,
  Layers,
  Lock,
  Maximize2,
  Menu,
  ShieldCheck,
  Target,
  UserCheck,
  Users,
  Workflow,
  X,
  Server,
} from 'lucide-react';
import mark from '@/assets/pulse/pulse-mark.svg';
import { REFERENCE_DOMAIN_LEVELS } from '@/lib/reference-positions';
import { PulsePublicShell } from './PulsePublicShell';
import { Scene5RoundCarousel, SCENE5_DEFAULT_MODULES } from './Scene5RoundCarousel';
import { Scene5ArchitectureModal } from './Scene5ArchitectureModal';
import { Scene6ArchitectureDiagram } from './Scene6ArchitectureDiagram';
import { Scene6RotatingWheel } from './Scene6RotatingWheel';
import { Scene7RegistrationCta } from './Scene7RegistrationCta';
import './pulse-bright-landing.css';

// 6 Operational Steps of DigiTalent AI (Scene 3 Frosted Glass Image Slabs)
const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Đăng ký tài khoản doanh nghiệp',
    shortLabel: 'Đăng ký',
    role: 'Chủ doanh nghiệp',
    desc: 'Chủ sở hữu hoặc người đại diện tạo tài khoản quản trị doanh nghiệp, khai báo thông tin tổ chức và kích hoạt không gian làm việc riêng.',
    highlights: [
      'Hoàn tất đăng ký thông tin doanh nghiệp và quy mô nhân sự trong 2 phút.',
      'Xác lập quyền Chủ sở hữu (Owner) để quản trị chuẩn vị trí và dữ liệu nội bộ.',
    ],
    icon: UserCheck,
    image: '/images/landing-scenes/steps/step1-register.png',
  },
  {
    num: '02',
    title: 'Cấu hình chuẩn & mở kỳ đánh giá',
    shortLabel: 'Mở kỳ đánh giá',
    role: 'Quản trị doanh nghiệp',
    desc: 'Áp dụng khung chuẩn năng lực cho từng phòng ban, chọn danh sách nhân sự tham gia và phát hành liên kết làm bài theo thời hạn quy định.',
    highlights: [
      'Nhập danh sách nhân sự hàng loạt và gán chuẩn chức danh tương ứng.',
      'Gửi lời mời tự động kèm lịch nhắc nộp bài đến từng email công việc.',
    ],
    icon: Target,
    image: '/images/landing-scenes/steps/step2-campaign.png',
  },
  {
    num: '03',
    title: 'Làm bài đánh giá trực tuyến',
    shortLabel: 'Làm bài test',
    role: 'Nhân sự tham gia',
    desc: 'Nhân viên thực hiện bài đánh giá 6 miền năng lực qua trình duyệt web với hệ thống xác thực khuôn mặt và giám sát màn hình chuẩn hóa.',
    highlights: [
      '54 câu hỏi tình huống phân tầng theo 3 cấp độ: Cơ bản, Trung cấp, Nâng cao.',
      'Chấm điểm định lượng khách quan ngay sau khi hoàn thành bài thi.',
    ],
    icon: FileCheck2,
    image: '/images/landing-scenes/steps/step3-exam.png',
  },
  {
    num: '04',
    title: 'Phân tích khoảng trống kỹ năng',
    shortLabel: 'Phân tích Gap',
    role: 'Báo cáo năng lực',
    desc: 'Hệ thống lập biểu đồ Radar đối chiếu điểm thực tế của từng phòng ban với chuẩn mục tiêu để khoanh vùng kỹ năng đang thiếu hụt.',
    highlights: [
      'Chỉ rõ điểm nghẽn và mức độ chênh lệch trên cả 6 miền năng lực số.',
      'Xuất số liệu tổng hợp phục vụ lập kế hoạch đào tạo theo ngân sách thực tế.',
    ],
    icon: BarChart3,
    image: '/images/landing-scenes/steps/step4-skillgap.png',
  },
  {
    num: '05',
    title: 'Phân bổ lộ trình bồi dưỡng riêng',
    shortLabel: 'Lộ trình học',
    role: 'Đào tạo theo vị trí',
    desc: 'Mỗi nhân sự nhận kế hoạch học tập riêng biệt nhằm bù đắp phần kỹ năng chưa đạt và được miễn các nội dung đã vượt chuẩn.',
    highlights: [
      'Chia trạm học theo thứ tự ưu tiên từ kỹ năng thiếu hụt nhiều nhất.',
      'Tiết kiệm thời gian nhờ loại bỏ việc đào tạo đại trà những nội dung đã biết.',
    ],
    icon: Layers,
    image: '/images/landing-scenes/steps/step5-roadmap.png',
  },
  {
    num: '06',
    title: 'Theo dõi tiến độ & cấp chứng nhận',
    shortLabel: 'Chứng nhận',
    role: 'Ban Lãnh đạo',
    desc: 'Quản lý theo dõi tỷ lệ hoàn thành sau đào tạo của từng khối, tổ chức đánh giá lại và cấp chứng nhận đạt chuẩn cho nhân sự đủ điều kiện.',
    highlights: [
      'Đối chiếu mức tăng trưởng điểm số giữa đầu kỳ và sau bồi dưỡng.',
      'Lưu trữ hồ sơ năng lực và chứng nhận số phục vụ đánh giá định kỳ.',
    ],
    icon: ShieldCheck,
    image: '/images/landing-scenes/steps/step6-tracking.png',
  },
];

interface Scene3StepApi {
  selectStep: (next: number | ((prev: number) => number)) => void;
  setZoomedStepIdx: (next: number | null) => void;
}

interface Scene3ProcessShowcaseProps {
  stageOpacity: number;
  stageY: number;
  onNextScene: () => void;
  activeStepRef: { current: number };
  zoomedStepRef: { current: number | null };
  stepApiRef: { current: Scene3StepApi | null };
}

const Scene3ProcessShowcase = memo(function Scene3ProcessShowcase({
  stageOpacity,
  stageY,
  onNextScene,
  activeStepRef,
  zoomedStepRef,
  stepApiRef,
}: Scene3ProcessShowcaseProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [zoomedStepIdx, setZoomedStepIdx] = useState<number | null>(null);
  const internalActiveRef = useRef<number>(0);
  const glassRackRef = useRef<HTMLDivElement>(null);

  const selectStep = useCallback(
    (next: number | ((prev: number) => number)) => {
      const prevIdx = internalActiveRef.current;
      const rawNext = typeof next === 'function' ? next(prevIdx) : next;
      const nextIdx = Math.min(5, Math.max(0, rawNext));
      if (nextIdx === prevIdx) return;
      internalActiveRef.current = nextIdx;
      activeStepRef.current = nextIdx;
      setActiveStep(nextIdx);
    },
    [activeStepRef]
  );

  const updateZoomedStep = useCallback(
    (next: number | null) => {
      zoomedStepRef.current = next;
      setZoomedStepIdx(next);
    },
    [zoomedStepRef]
  );

  useEffect(() => {
    internalActiveRef.current = activeStep;
    activeStepRef.current = activeStep;
  }, [activeStep, activeStepRef]);

  useEffect(() => {
    zoomedStepRef.current = zoomedStepIdx;
  }, [zoomedStepIdx, zoomedStepRef]);

  useEffect(() => {
    stepApiRef.current = {
      selectStep,
      setZoomedStepIdx: updateZoomedStep,
    };
    return () => {
      stepApiRef.current = null;
    };
  }, [selectStep, updateZoomedStep, stepApiRef]);

  // Pre-decode all 6 step screenshots cleanly in background so slab glide never stalls on image upload
  useEffect(() => {
    let cancelled = false;
    const predecoded: HTMLImageElement[] = [];

    const preload = () => {
      if (cancelled) return;
      PROCESS_STEPS.forEach((step) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = step.image;
        predecoded.push(img);
        if (typeof img.decode === 'function') {
          void img.decode().catch(() => { });
        }
      });
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const id = idleWindow.requestIdleCallback(preload, { timeout: 600 });
      return () => {
        cancelled = true;
        idleWindow.cancelIdleCallback?.(id);
      };
    }

    const timer = window.setTimeout(preload, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  // Sync fixed inner stage width & screenshot frame size on ResizeObserver (zero container-query or per-frame layout work)
  useEffect(() => {
    const rack = glassRackRef.current;
    if (!rack) return;

    const syncSlabMetrics = () => {
      const rackWidth = rack.clientWidth;
      const rackHeight = rack.clientHeight;
      if (rackWidth <= 0) return;

      const computed = window.getComputedStyle(rack);
      const gap = parseFloat(computed.columnGap || computed.gap || '10') || 10;
      const collapsedWidth = window.innerWidth <= 1120 ? 46 : 52;
      const expandedWidth = Math.max(460, rackWidth - 5 * collapsedWidth - 5 * gap);

      const isTablet = window.innerWidth <= 1120;
      const innerPadX = isTablet ? 28 : 36;
      const innerPadY = isTablet ? 24 : 28;
      const innerGap = isTablet ? 28 : 36;
      const leftRatio = isTablet ? 1.65 / 2.65 : 1.98 / 2.98;
      const leftColWidth = Math.max(240, (expandedWidth - innerPadX - 1 - innerGap) * leftRatio);
      const stageHeight = Math.max(220, (rackHeight > 0 ? rackHeight : 460) - innerPadY);
      const shotWidth = Math.min(leftColWidth, stageHeight * (1040 / 688));

      rack.style.setProperty('--s3-collapsed-width', `${collapsedWidth}px`);
      rack.style.setProperty('--s3-exp-width', `${expandedWidth.toFixed(1)}px`);
      rack.style.setProperty('--s3-shot-width', `${shotWidth.toFixed(1)}px`);
    };

    syncSlabMetrics();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSlabMetrics) : null;
    ro?.observe(rack);
    window.addEventListener('resize', syncSlabMetrics);

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', syncSlabMetrics);
    };
  }, []);

  const activeZoomStep = zoomedStepIdx !== null ? PROCESS_STEPS[zoomedStepIdx] : null;

  return (
    <>
      <div
        ref={glassRackRef}
        className="scene3-glass-carousel"
        style={{
          opacity: stageOpacity,
          ...(Math.abs(stageY) > 0.05 ? { transform: `translateY(${stageY}px)` } : {}),
        }}
      >
        {PROCESS_STEPS.map((s, idx) => {
          const isActive = activeStep === idx;
          const isCompleted = idx < activeStep;
          const sideClass = isActive ? '' : idx < activeStep ? 'is-before' : 'is-after';
          const IconComp = s.icon;

          return (
            <div
              key={s.num}
              role={!isActive ? 'button' : undefined}
              tabIndex={!isActive ? 0 : undefined}
              aria-label={!isActive ? `Xem bước ${s.num}: ${s.title}` : undefined}
              onClick={() => {
                if (!isActive) selectStep(idx);
              }}
              onKeyDown={
                !isActive
                  ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectStep(idx);
                    }
                  }
                  : undefined
              }
              className={`scene3-glass-slab ${isActive ? 'is-active' : 'is-collapsed'} ${sideClass} ${isCompleted ? 'is-completed' : ''}`}
              title={!isActive ? `Bước ${s.num}: ${s.title}` : undefined}
            >
              {/* Isolated Frost Layer so backdrop-filter does not trap expanded PNG inside a resizing RenderSurface */}
              <div className="glass-slab-frost" aria-hidden="true" />
              <div className="glass-slab-active-ring" aria-hidden="true" />
              <div className="glass-slab-specular" aria-hidden="true" />
              <div className="glass-slab-sheen" aria-hidden="true" />

              {/* Collapsed Frosted Glass Pillar (fixed-width centered so flex resize causes zero internal layout) */}
              <div className="glass-collapsed-inner" aria-hidden={isActive}>
                <div className={`glass-slab-node ${isCompleted ? 'is-completed' : ''}`}>
                  {isCompleted ? <Check size={14} aria-hidden="true" /> : s.num}
                </div>
                <div className="glass-slab-icon-wrap">
                  <IconComp size={18} aria-hidden="true" />
                </div>
                <div className="glass-slab-vtitle">
                  {s.num}. {s.shortLabel}
                </div>
                <div className="glass-slab-dot" />
              </div>

              {/* Expanded Frosted Glass Stage (strictly contained & fixed-width to eliminate text reflow) */}
              <div className="glass-expanded-inner" aria-hidden={!isActive}>
                <div className="glass-visual-stage">
                  <button
                    type="button"
                    className="glass-screenshot-frame"
                    tabIndex={isActive ? 0 : -1}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateZoomedStep(idx);
                    }}
                    aria-label={`Phóng to giao diện bước ${s.num}: ${s.title}`}
                  >
                    <img
                      src={s.image}
                      alt={s.title}
                      className="glass-screenshot-img"
                      loading="eager"
                    />
                    <span className="glass-zoom-badge">
                      <Maximize2 size={13} aria-hidden="true" />
                      <span>Phóng to</span>
                    </span>
                  </button>
                </div>

                <div className="glass-seam-partition" aria-hidden="true" />

                <div className="glass-copy-stage">
                  <div className="glass-watermark-num" aria-hidden="true">
                    {s.num}
                  </div>

                  <div className="glass-copy-body">
                    <div className="glass-meta-row">
                      <span className="glass-role-tag">
                        <span className="glass-role-dot" />
                        {s.role}
                      </span>
                      <span className="glass-step-count">
                        <strong>{s.num}</strong> / 06
                      </span>
                    </div>

                    <h3 className="glass-step-title">{s.title}</h3>
                    <p className="glass-step-desc">{s.desc}</p>

                    <div className="glass-highlights-list">
                      {s.highlights.map((h, i) => (
                        <div key={i} className="glass-highlight-item">
                          <span className="glass-check-dot">✓</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-nav-controls">
                    <button
                      type="button"
                      className="glass-nav-btn"
                      tabIndex={isActive ? 0 : -1}
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectStep((prev) => Math.max(0, prev - 1));
                      }}
                    >
                      ‹ Trước
                    </button>
                    <button
                      type="button"
                      className="glass-nav-btn btn-primary"
                      tabIndex={isActive ? 0 : -1}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (idx < 5) {
                          selectStep((prev) => Math.min(5, prev + 1));
                        } else {
                          onNextScene();
                        }
                      }}
                    >
                      {idx < 5 ? 'Tiếp theo ›' : 'Khung 6 Miền ↓'}
                    </button>
                    <span className="glass-scroll-tip">Cuộn để chuyển bước</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeZoomStep &&
        zoomedStepIdx !== null &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="glass-lightbox-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="glass-lightbox-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) updateZoomedStep(null);
            }}
          >
            <div className="glass-lightbox-dialog">
              <div className="glass-lightbox-header">
                <div className="glass-lightbox-heading-group">
                  <span className="glass-lightbox-step">{activeZoomStep.num} / 06</span>
                  <span className="glass-lightbox-role">{activeZoomStep.role}</span>
                  <h3 id="glass-lightbox-title" className="glass-lightbox-title">
                    {activeZoomStep.title}
                  </h3>
                </div>
                <button
                  type="button"
                  className="glass-lightbox-close"
                  onClick={() => updateZoomedStep(null)}
                  aria-label="Đóng xem ảnh phóng to"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="glass-lightbox-body">
                <img
                  src={activeZoomStep.image}
                  alt={activeZoomStep.title}
                  className="glass-lightbox-img"
                />
              </div>

              <div className="glass-lightbox-footer">
                <p className="glass-lightbox-desc">{activeZoomStep.desc}</p>
                <div className="glass-lightbox-nav">
                  <button
                    type="button"
                    className="glass-lightbox-nav-btn"
                    disabled={zoomedStepIdx === 0}
                    onClick={() => {
                      const prevIdx = Math.max(0, zoomedStepIdx - 1);
                      updateZoomedStep(prevIdx);
                      selectStep(prevIdx);
                    }}
                  >
                    ‹ Bước trước
                  </button>
                  <button
                    type="button"
                    className="glass-lightbox-nav-btn is-primary"
                    disabled={zoomedStepIdx === 5}
                    onClick={() => {
                      const nextIdx = Math.min(5, zoomedStepIdx + 1);
                      updateZoomedStep(nextIdx);
                      selectStep(nextIdx);
                    }}
                  >
                    Bước tiếp theo ›
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
});

interface OrbitFramePose {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotY: number;
  opacity: number;
  borderRadiusPx: number;
  chromeOpacity: number;
}

type OrbitPairId = '2-3' | '3-4';

interface OrbitTransitionConfig {
  pair: OrbitPairId;
  dir: 'forward' | 'reverse';
}

interface OrbitPoseResult {
  outgoing: OrbitFramePose;
  incoming: OrbitFramePose;
  haloOpacity: number;
  ringWidth: number;
  ringHeight: number;
  hubY: number;
  ringTiltDeg: number;
  outgoingZIndex: number;
  incomingZIndex: number;
}

const orbitClamp01 = (v: number) => Math.min(1, Math.max(0, v));
const orbitRange01 = (p: number, start: number, end: number) =>
  orbitClamp01((p - start) / (end - start));
const orbitEaseOutQuad = (t: number) => t * (2 - t);
const orbitEaseInOutSine = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));

function computeOrbitalTwinPose(
  pRaw: number,
  dir: 'forward' | 'reverse',
  baseSpinSign: 1 | -1,
  viewportW: number,
  viewportH: number
): OrbitPoseResult {
  const vw = viewportW > 0 ? viewportW : 1440;
  const vh = viewportH > 0 ? viewportH : 900;
  const p = orbitClamp01(pRaw);
  const isMobile = vw <= 900;

  const topSafe = isMobile ? 64 : 84;
  const bottomSafe = 16;
  const usableH = Math.max(460, vh - topSafe - bottomSafe);
  const hubY = (topSafe - bottomSafe) * 0.5;

  const frontSlotScale = Math.min(isMobile ? 0.39 : 0.415, (usableH * 0.435) / vh);
  const backSlotScale = frontSlotScale * 0.855;
  const frontHalfH = frontSlotScale * vh * 0.5;
  const backHalfH = backSlotScale * vh * 0.5;

  const maxRyTop = vh * 0.5 + hubY - (topSafe + 8) - frontHalfH;
  const maxRyBot = vh - bottomSafe - (vh * 0.5 + hubY) - frontHalfH;
  const Ry = Math.max(
    110,
    Math.min(maxRyTop, maxRyBot, 0.5 * (frontHalfH + backHalfH + (isMobile ? 30 : 38)))
  );
  const Rx = isMobile ? vw * 0.225 : Math.min(vw * 0.225, vh * 0.39);

  // Continuous overlapping orbital arc (no intermediate stops between shrink, orbit, and expand)
  const tPull = orbitEaseInOutSine(orbitRange01(p, 0.0, 0.36));
  const tEnter = orbitEaseOutQuad(orbitRange01(p, 0.0, 0.28));
  const tOrbit = orbitEaseInOutSine(p);
  const tExit = orbitEaseInOutSine(orbitRange01(p, 0.64, 0.92));
  const tExpand = orbitEaseInOutSine(orbitRange01(p, 0.64, 1.0));

  const theta = tOrbit * Math.PI;
  const s = Math.sin(theta);
  const c = Math.cos(theta);
  const spinSign = (dir === 'reverse' ? -1 : 1) * baseSpinSign;

  const midScale = (frontSlotScale + backSlotScale) * 0.5;
  const ampScale = (frontSlotScale - backSlotScale) * 0.5;

  // Outgoing frame: Fullscreen curves onto rear arc -> Lower slot fade-out
  const orbitScaleOut = midScale + ampScale * c - 0.025 * s;
  const scaleOut = Math.max(0.2, 1 + (orbitScaleOut - 1) * tPull - tExit * 0.05);
  const visualRadiusOut = (isMobile ? 16 : 22) * tPull;
  const outgoing: OrbitFramePose = {
    x: -spinSign * Rx * s,
    y: (hubY - Ry * c) * tPull + tExit * 24,
    z: (-55 + 75 * c - 125 * s) * tPull - tExit * 70,
    scale: scaleOut,
    rotY: spinSign * 14 * s,
    opacity: orbitClamp01((1 - 0.26 * s) * (1 - tExit)),
    borderRadiusPx: visualRadiusOut > 0.2 ? Math.round(visualRadiusOut / Math.max(0.25, scaleOut)) : 0,
    chromeOpacity: orbitEaseOutQuad(orbitRange01(p, 0.02, 0.14)) * (1 - tExit),
  };

  // Incoming frame: Rises along front arc -> Sweeps smoothly to Top and expands into Fullscreen
  const orbitScaleIn = midScale - ampScale * c + 0.065 * s;
  const enterScaleMul = 0.88 + 0.12 * tEnter;
  const baseInScale = orbitScaleIn * enterScaleMul;
  const scaleIn = Math.max(0.2, baseInScale + (1 - baseInScale) * tExpand);
  const visualRadiusIn = (isMobile ? 16 : 22) * (1 - tExpand);
  const incoming: OrbitFramePose = {
    x: spinSign * Rx * s,
    y: (hubY + Ry * c + 44 * (1 - tEnter)) * (1 - tExpand),
    z: (-55 - 75 * c + 125 * s - 70 * (1 - tEnter)) * (1 - tExpand),
    scale: scaleIn,
    rotY: -spinSign * 14 * s,
    opacity: orbitClamp01(0.86 * tEnter + 0.14 * Math.min(1, tOrbit * 2.4 + tExpand)),
    borderRadiusPx: visualRadiusIn > 0.2 ? Math.round(visualRadiusIn / Math.max(0.25, scaleIn)) : 0,
    chromeOpacity: tEnter * (1 - orbitEaseOutQuad(orbitRange01(p, 0.78, 0.96))),
  };

  const outgoingOnTop = outgoing.z >= incoming.z;

  const haloOpacity =
    orbitEaseOutQuad(orbitRange01(p, 0.02, 0.22)) *
    (1 - orbitEaseInOutSine(orbitRange01(p, 0.66, 0.88)));

  return {
    outgoing,
    incoming,
    haloOpacity,
    ringWidth: Rx * 2,
    ringHeight: Ry * 2,
    hubY,
    ringTiltDeg: -spinSign * 22,
    outgoingZIndex: outgoingOnTop ? 6 : 4,
    incomingZIndex: outgoingOnTop ? 4 : 6,
  };
}

type NavSectionId =
  | 'tong-quan'
  | 'thuc-trang'
  | 'quy-trinh'
  | 'khung-6-mien'
  | 'san-pham'
  | 'bao-mat'
  | 'dang-ky';

type SceneId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const NAV_ITEMS: Array<{
  id: 'thuc-trang' | 'quy-trinh' | 'khung-6-mien' | 'san-pham' | 'bao-mat' | 'dang-ky';
  label: string;
  shortLabel: string;
  scene: SceneId | null;
}> = [
    { id: 'thuc-trang', label: 'Giải pháp', shortLabel: 'Giải pháp', scene: 2 },
    { id: 'quy-trinh', label: 'Quy trình', shortLabel: 'Quy trình', scene: 3 },
    { id: 'khung-6-mien', label: 'Khung 6 Miền', shortLabel: '6 Miền', scene: 4 },
    { id: 'san-pham', label: 'Hệ thống', shortLabel: 'Hệ thống', scene: 5 },
    { id: 'bao-mat', label: 'Bảo mật & FAQ', shortLabel: 'Bảo mật', scene: 6 },
    { id: 'dang-ky', label: 'Đăng ký', shortLabel: 'Đăng ký', scene: 7 },
  ];

export function PulseBusinessLandingPage() {
  const navigate = useNavigate();
  const runwayRef = useRef<HTMLDivElement>(null);

  // Automated One-Scroll Cinematic Animation Controller (Scene 1 -> Scene 2 -> Scene 3 -> Scene 4 -> Scene 5 -> Scene 6 -> Scene 7)
  const [currentScene, setCurrentScene] = useState<SceneId>(1);
  const [animProgress, setAnimProgress] = useState(0); // 0 (Scene 1) .. 6 (Scene 7)
  const [orbitConfig, setOrbitConfig] = useState<OrbitTransitionConfig | null>(null);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [isDirectSwitching, setIsDirectSwitching] = useState(false);

  const isAnimatingRef = useRef(false);
  const currentSceneRef = useRef<SceneId>(1);
  currentSceneRef.current = currentScene;
  const animProgressRef = useRef(0);
  animProgressRef.current = animProgress;
  const rafIdRef = useRef<number | null>(null);
  const orbitRafIdRef = useRef<number | null>(null);
  const scrollAnimRafRef = useRef<number | null>(null);
  const directSwitchTimerRef = useRef<number | null>(null);
  const navDropdownRef = useRef<HTMLDivElement>(null);
  const scene2LayerRef = useRef<HTMLDivElement>(null);
  const scene3LayerRef = useRef<HTMLDivElement>(null);
  const scene4LayerRef = useRef<HTMLDivElement>(null);
  const scene5LayerRef = useRef<HTMLDivElement>(null);
  const scene6LayerRef = useRef<HTMLDivElement>(null);
  const scene7LayerRef = useRef<HTMLDivElement>(null);
  const s2FrameBezelRef = useRef<HTMLDivElement>(null);
  const s3FrameBezelRef = useRef<HTMLDivElement>(null);
  const s4FrameBezelRef = useRef<HTMLDivElement>(null);
  const orbitHaloRef = useRef<HTMLDivElement>(null);
  const wasBelowHeroRef = useRef(false);
  const returnedToTopAtRef = useRef(0);

  // Scene 3 isolated refs (step state lives inside memoized Scene3ProcessShowcase so step glides never re-render parent)
  const scene3ActiveStepRef = useRef<number>(0);
  const scene3ZoomedStepRef = useRef<number | null>(null);
  const scene3StepApiRef = useRef<Scene3StepApi | null>(null);
  const scene1VideoRef = useRef<HTMLVideoElement>(null);
  const scene2VideoRef = useRef<HTMLVideoElement>(null);
  const onPlayScene3ToScene4Ref = useRef<() => void>(() => { });
  const handlePlayScene3ToScene4 = useCallback(() => {
    onPlayScene3ToScene4Ref.current();
  }, []);

  const [activeProductIdx, setActiveProductIdx] = useState<number>(0);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [zoomedProductIdx, setZoomedProductIdx] = useState<number | null>(null);
  const zoomedProductIdxRef = useRef<number | null>(null);
  zoomedProductIdxRef.current = zoomedProductIdx;


  // Direction for 3D Revolve Transition between Scene 2 and Scene 3
  // 'forward': Scene 2 drifts & rotates RIGHT, Scene 3 enters from right
  // 'reverse': Scene 3 drifts & rotates LEFT, Scene 2 enters from left
  const [transitionDir, setTransitionDir] = useState<'forward' | 'reverse'>('forward');
  const transitionDirRef = useRef<'forward' | 'reverse'>('forward');
  transitionDirRef.current = transitionDir;

  // Smooth RAF easing runner
  const animateProgress = (
    target: number,
    durationMs: number,
    onEnd?: () => void,
    easing?: (t: number) => number
  ) => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    isAnimatingRef.current = true;
    const startVal = animProgressRef.current;
    const startTime = performance.now();

    const easeFn =
      easing ??
      ((p: number) =>
        p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progressRatio = Math.min(1, elapsed / durationMs);

      const eased = easeFn(progressRatio);

      const currentVal = startVal + (target - startVal) * eased;
      setAnimProgress(currentVal);
      animProgressRef.current = currentVal;

      if (progressRatio < 1) {
        rafIdRef.current = requestAnimationFrame(frame);
      } else {
        setAnimProgress(target);
        animProgressRef.current = target;
        isAnimatingRef.current = false;
        if (onEnd) onEnd();
      }
    };

    rafIdRef.current = requestAnimationFrame(frame);
  };

  // Play Scene 1 -> Scene 2 (Duration: 9200ms - Tốc độ zoom nhanh nhạy hơn, kết nối mượt mà)
  const playScene1ToScene2 = () => {
    if (isAnimatingRef.current) return;
    setIsNavDropdownOpen(false);
    setTransitionDir('forward');
    transitionDirRef.current = 'forward';
    animateProgress(1, 9200, () => {
      setCurrentScene(2);
    });
  };

  // Play Scene 2 -> Scene 1 (Duration: 6800ms)
  const playScene2ToScene1 = () => {
    if (isAnimatingRef.current) return;
    setIsNavDropdownOpen(false);
    setTransitionDir('forward');
    transitionDirRef.current = 'forward';
    animateProgress(0, 6800, () => {
      setCurrentScene(1);
    });
  };

  const applyOrbitHaloMetrics = useCallback((pose: OrbitPoseResult) => {
    const haloEl = orbitHaloRef.current;
    if (!haloEl) return;
    haloEl.style.setProperty('--orbit-hub-y', `${pose.hubY.toFixed(1)}px`);
    haloEl.style.setProperty('--orbit-ring-w', `${pose.ringWidth.toFixed(1)}px`);
    haloEl.style.setProperty('--orbit-ring-h', `${pose.ringHeight.toFixed(1)}px`);
    haloEl.style.setProperty('--orbit-ring-tilt', `${pose.ringTiltDeg.toFixed(1)}deg`);
  }, []);

  const applyOrbitPoseToDom = useCallback(
    (pair: OrbitPairId, dir: 'forward' | 'reverse', pose: OrbitPoseResult) => {
      const updateFrame = (
        el: HTMLDivElement | null,
        bezel: HTMLDivElement | null,
        frame: OrbitFramePose,
        zIndex: number
      ) => {
        if (el) {
          el.style.opacity = frame.opacity.toFixed(3);
          const nextVis = frame.opacity > 0.002 ? 'visible' : 'hidden';
          if (el.style.visibility !== nextVis) el.style.visibility = nextVis;
          el.style.transform = `translate3d(${frame.x.toFixed(1)}px, ${frame.y.toFixed(1)}px, ${frame.z.toFixed(1)}px) rotateY(${frame.rotY.toFixed(2)}deg) scale(${frame.scale.toFixed(4)})`;
          const nextZ = String(zIndex);
          if (el.style.zIndex !== nextZ) el.style.zIndex = nextZ;
          el.classList.toggle('is-orbit-framed', frame.borderRadiusPx > 2 || frame.chromeOpacity > 0.02);
        }
        if (bezel) {
          bezel.style.opacity = frame.chromeOpacity.toFixed(3);
        }
      };

      const isForward = dir === 'forward';
      const outEl =
        pair === '2-3'
          ? isForward
            ? scene2LayerRef.current
            : scene3LayerRef.current
          : isForward
            ? scene3LayerRef.current
            : scene4LayerRef.current;
      const outBezel =
        pair === '2-3'
          ? isForward
            ? s2FrameBezelRef.current
            : s3FrameBezelRef.current
          : isForward
            ? s3FrameBezelRef.current
            : s4FrameBezelRef.current;

      const inEl =
        pair === '2-3'
          ? isForward
            ? scene3LayerRef.current
            : scene2LayerRef.current
          : isForward
            ? scene4LayerRef.current
            : scene3LayerRef.current;
      const inBezel =
        pair === '2-3'
          ? isForward
            ? s3FrameBezelRef.current
            : s2FrameBezelRef.current
          : isForward
            ? s4FrameBezelRef.current
            : s3FrameBezelRef.current;

      updateFrame(outEl, outBezel, pose.outgoing, pose.outgoingZIndex);
      updateFrame(inEl, inBezel, pose.incoming, pose.incomingZIndex);

      const haloEl = orbitHaloRef.current;
      if (haloEl) {
        haloEl.style.opacity = pose.haloOpacity.toFixed(3);
        const nextVis = pose.haloOpacity > 0.002 ? 'visible' : 'hidden';
        if (haloEl.style.visibility !== nextVis) haloEl.style.visibility = nextVis;
      }
    },
    []
  );

  useLayoutEffect(() => {
    if (!orbitConfig) return;

    const { pair, dir } = orbitConfig;
    const baseSpinSign: 1 | -1 = pair === '2-3' ? 1 : -1;
    const s2Node = scene2LayerRef.current;
    const s2BezelNode = s2FrameBezelRef.current;
    const s3Node = scene3LayerRef.current;
    const s3BezelNode = s3FrameBezelRef.current;
    const s4Node = scene4LayerRef.current;
    const s4BezelNode = s4FrameBezelRef.current;
    const haloNode = orbitHaloRef.current;

    const isReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const durationMs = isReduced ? 650 : dir === 'forward' ? 3100 : 2950;
    let curW = typeof window !== 'undefined' ? window.innerWidth : 1440;
    let curH = typeof window !== 'undefined' ? window.innerHeight : 900;

    if (pair === '2-3') {
      if (s2Node) s2Node.scrollTop = 0;
      if (s3Node) s3Node.scrollTop = 0;
    } else {
      if (s3Node) s3Node.scrollTop = 0;
      if (s4Node) s4Node.scrollTop = 0;
    }

    const initialPose = computeOrbitalTwinPose(0, dir, baseSpinSign, curW, curH);
    applyOrbitHaloMetrics(initialPose);
    applyOrbitPoseToDom(pair, dir, initialPose);

    const handleResize = () => {
      curW = window.innerWidth;
      curH = window.innerHeight;
      applyOrbitHaloMetrics(computeOrbitalTwinPose(0.5, dir, baseSpinSign, curW, curH));
    };
    window.addEventListener('resize', handleResize);

    const startTime = performance.now();

    const stepOrbit = (now: number) => {
      const elapsed = now - startTime;
      const u = Math.min(1, elapsed / durationMs);
      const pose = computeOrbitalTwinPose(u, dir, baseSpinSign, curW, curH);
      applyOrbitPoseToDom(pair, dir, pose);

      if (u < 1) {
        orbitRafIdRef.current = requestAnimationFrame(stepOrbit);
      } else {
        orbitRafIdRef.current = null;
        const targetProgress =
          pair === '2-3' ? (dir === 'forward' ? 2 : 1) : dir === 'forward' ? 3 : 2;
        const targetScene: SceneId =
          pair === '2-3' ? (dir === 'forward' ? 3 : 2) : dir === 'forward' ? 4 : 3;
        animProgressRef.current = targetProgress;
        setAnimProgress(targetProgress);
        setCurrentScene(targetScene);
        setTransitionDir('forward');
        transitionDirRef.current = 'forward';
        setOrbitConfig(null);
        isAnimatingRef.current = false;
      }
    };

    orbitRafIdRef.current = requestAnimationFrame(stepOrbit);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (orbitRafIdRef.current) {
        cancelAnimationFrame(orbitRafIdRef.current);
        orbitRafIdRef.current = null;
      }
      const clearLayerStyles = (el: HTMLDivElement | null, bezel: HTMLDivElement | null) => {
        if (el) {
          el.classList.remove('is-orbit-framed');
          el.style.removeProperty('transform');
          el.style.removeProperty('z-index');
        }
        if (bezel) {
          bezel.style.removeProperty('opacity');
        }
      };
      clearLayerStyles(s2Node, s2BezelNode);
      clearLayerStyles(s3Node, s3BezelNode);
      clearLayerStyles(s4Node, s4BezelNode);
      if (haloNode) {
        haloNode.style.opacity = '0';
        haloNode.style.visibility = 'hidden';
      }
    };
  }, [orbitConfig, applyOrbitHaloMetrics, applyOrbitPoseToDom]);

  // Play Scene 2 -> Scene 3 (Orbital Twin Frames)
  const playScene2ToScene3 = () => {
    if (isAnimatingRef.current) return;
    setIsNavDropdownOpen(false);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    isAnimatingRef.current = true;
    setTransitionDir('forward');
    transitionDirRef.current = 'forward';
    setOrbitConfig({ pair: '2-3', dir: 'forward' });
  };

  // Play Scene 3 -> Scene 2 (Reverse Orbital Twin Frames)
  const playScene3ToScene2 = () => {
    if (isAnimatingRef.current) return;
    setIsNavDropdownOpen(false);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    isAnimatingRef.current = true;
    setTransitionDir('reverse');
    transitionDirRef.current = 'reverse';
    setOrbitConfig({ pair: '2-3', dir: 'reverse' });
  };

  // Play Scene 3 -> Scene 4 (Orbital Twin Frames xoay nguoc chieu voi 2 <-> 3)
  const playScene3ToScene4 = () => {
    if (isAnimatingRef.current) return;
    setIsNavDropdownOpen(false);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    isAnimatingRef.current = true;
    setTransitionDir('forward');
    transitionDirRef.current = 'forward';
    setOrbitConfig({ pair: '3-4', dir: 'forward' });
  };

  // Play Scene 4 -> Scene 3 (Reverse Orbital Twin Frames giua Canh 4 va Canh 3)
  const playScene4ToScene3 = () => {
    if (isAnimatingRef.current) return;
    setIsNavDropdownOpen(false);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    isAnimatingRef.current = true;
    setTransitionDir('reverse');
    transitionDirRef.current = 'reverse';
    setOrbitConfig({ pair: '3-4', dir: 'reverse' });
  };

  // Play Scene 4 -> Scene 5 (Duration: 3600ms - Cảnh 4 trượt lên, Cảnh 5 trườn từ đáy lên)
  const playScene4ToScene5 = () => {
    if (isAnimatingRef.current) return;
    setIsNavDropdownOpen(false);
    setTransitionDir('forward');
    transitionDirRef.current = 'forward';
    animateProgress(
      4,
      3600,
      () => {
        setCurrentScene(5);
      },
      (t) => t
    );
  };

  // Play Scene 5 -> Scene 4 (Duration: 3600ms - Chậm rãi, Cảnh 5 rút xuống đáy về Cảnh 4)
  const playScene5ToScene4 = () => {
    if (isAnimatingRef.current) return;
    setIsNavDropdownOpen(false);
    setTransitionDir('reverse');
    transitionDirRef.current = 'reverse';
    animateProgress(
      3,
      3600,
      () => {
        setCurrentScene(4);
      },
      (t) => t
    );
  };

  // Play Scene 5 -> Scene 6 (Duration: 3600ms - Cảnh 5 trượt lên, Cảnh 6 trườn từ đáy lên)
  const playScene5ToScene6 = () => {
    if (isAnimatingRef.current) return;
    setIsNavDropdownOpen(false);
    setTransitionDir('forward');
    transitionDirRef.current = 'forward';
    animateProgress(
      5,
      3600,
      () => {
        setCurrentScene(6);
      },
      (t) => t
    );
  };

  // Play Scene 6 -> Scene 5 (Duration: 3600ms - Chậm rãi, Cảnh 6 rút xuống đáy về Cảnh 5)
  const playScene6ToScene5 = () => {
    if (isAnimatingRef.current) return;
    setIsNavDropdownOpen(false);
    setTransitionDir('reverse');
    transitionDirRef.current = 'reverse';
    animateProgress(
      4,
      3600,
      () => {
        setCurrentScene(5);
      },
      (t) => t
    );
  };

  // Play Scene 6 -> Scene 7 (Duration: 3600ms - Cảnh 6 trượt lên, Cảnh 7 trườn từ đáy lên)
  const playScene6ToScene7 = () => {
    if (isAnimatingRef.current) return;
    setIsNavDropdownOpen(false);
    setTransitionDir('forward');
    transitionDirRef.current = 'forward';
    animateProgress(
      6,
      3600,
      () => {
        setCurrentScene(7);
      },
      (t) => t
    );
  };

  // Play Scene 7 -> Scene 6 (Duration: 3600ms - Chậm rãi, Cảnh 7 rút xuống đáy về Cảnh 6)
  const playScene7ToScene6 = () => {
    if (isAnimatingRef.current) return;
    setIsNavDropdownOpen(false);
    setTransitionDir('reverse');
    transitionDirRef.current = 'reverse';
    animateProgress(
      5,
      3600,
      () => {
        setCurrentScene(6);
      },
      (t) => t
    );
  };

  const syncScrollState = useCallback(() => {
    const y = window.scrollY;
    if (y > 20) {
      wasBelowHeroRef.current = true;
    } else if (wasBelowHeroRef.current) {
      wasBelowHeroRef.current = false;
      returnedToTopAtRef.current = performance.now();
    }
  }, []);

  // Direct instant jump for Menu tabs, Dropdown pills, Brand reset, Hero CTA and Footer links
  const navigateDirect = useCallback(
    (id: NavSectionId) => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (orbitRafIdRef.current) {
        cancelAnimationFrame(orbitRafIdRef.current);
        orbitRafIdRef.current = null;
      }
      if (scrollAnimRafRef.current) {
        cancelAnimationFrame(scrollAnimRafRef.current);
        scrollAnimRafRef.current = null;
      }
      if (directSwitchTimerRef.current) {
        cancelAnimationFrame(directSwitchTimerRef.current);
        directSwitchTimerRef.current = null;
      }

      isAnimatingRef.current = false;
      setOrbitConfig(null);
      setIsNavDropdownOpen(false);
      setZoomedProductIdx(null);
      scene3StepApiRef.current?.setZoomedStepIdx(null);
      setIsDirectSwitching(true);

      const sceneMap: Partial<Record<NavSectionId, { scene: SceneId; progress: number }>> = {
        'tong-quan': { scene: 1, progress: 0 },
        'thuc-trang': { scene: 2, progress: 1 },
        'quy-trinh': { scene: 3, progress: 2 },
        'khung-6-mien': { scene: 4, progress: 3 },
        'san-pham': { scene: 5, progress: 4 },
        'bao-mat': { scene: 6, progress: 5 },
        'dang-ky': { scene: 7, progress: 6 },
      };

      const mappedScene = sceneMap[id];
      if (mappedScene) {
        setTransitionDir('forward');
        transitionDirRef.current = 'forward';
        animProgressRef.current = mappedScene.progress;
        setAnimProgress(mappedScene.progress);
        currentSceneRef.current = mappedScene.scene;
        setCurrentScene(mappedScene.scene);
        if (scene2LayerRef.current) scene2LayerRef.current.scrollTop = 0;
        if (scene3LayerRef.current) scene3LayerRef.current.scrollTop = 0;
        if (scene4LayerRef.current) scene4LayerRef.current.scrollTop = 0;
        if (scene5LayerRef.current) scene5LayerRef.current.scrollTop = 0;
        if (scene6LayerRef.current) scene6LayerRef.current.scrollTop = 0;
        if (scene7LayerRef.current) scene7LayerRef.current.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        wasBelowHeroRef.current = false;
      }

      directSwitchTimerRef.current = requestAnimationFrame(() => {
        directSwitchTimerRef.current = requestAnimationFrame(() => {
          setIsDirectSwitching(false);
        });
      });
    },
    [syncScrollState]
  );

  const isPastHero = currentScene > 1 || animProgress >= 0.08;

  useEffect(() => {
    if (!isNavDropdownOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (navDropdownRef.current && !navDropdownRef.current.contains(e.target as Node)) {
        setIsNavDropdownOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNavDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isNavDropdownOpen]);

  useEffect(() => {
    let lastWheelTime = 0;
    let touchStartY = 0;
    let touchStartInnerTop = 0;

    const getScrollableSceneLayer = (): HTMLElement | null => {
      if (currentSceneRef.current === 7) {
        return scene7LayerRef.current;
      }
      if (currentSceneRef.current === 6) {
        return scene6LayerRef.current;
      }
      if (currentSceneRef.current === 5) {
        return scene5LayerRef.current;
      }
      if (currentSceneRef.current === 4) {
        return scene4LayerRef.current;
      }
      if (currentSceneRef.current === 3) {
        return scene3LayerRef.current;
      }
      if (currentSceneRef.current === 2) {
        return scene2LayerRef.current;
      }
      return null;
    };

    const handleScrollSync = () => {
      syncScrollState();
    };

    const handleWheel = (e: WheelEvent) => {
      if (scene3ZoomedStepRef.current !== null || zoomedProductIdxRef.current !== null) {
        e.preventDefault();
        return;
      }
      // If the user manually scrolls once below the top runway, cancel any active smoothScrollToY glide
      if (window.scrollY > 20) {
        if (scrollAnimRafRef.current) {
          cancelAnimationFrame(scrollAnimRafRef.current);
          scrollAnimRafRef.current = null;
        }
        return;
      }

      // If animation is in progress, consume wheel events to protect smooth playback
      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      const now = performance.now();
      const cooldown = currentSceneRef.current === 3 ? 1200 : 480;
      if (now - lastWheelTime < cooldown) {
        e.preventDefault();
        return;
      }

      // Guard against residual trackpad upward inertia right after returning to top from #bao-mat
      if (currentSceneRef.current === 5 && e.deltaY < -6 && now - returnedToTopAtRef.current < 480) {
        e.preventDefault();
        return;
      }

      // 1 gentle scroll DOWN in Scene 1 -> auto-runs whole cinematic transition to Scene 2
      if (currentSceneRef.current === 1) {
        if (e.deltaY > 6) {
          e.preventDefault();
          lastWheelTime = now;
          playScene1ToScene2();
        }
        return;
      }

      // In Scene 2:
      if (currentSceneRef.current === 2) {
        const s2El = getScrollableSceneLayer();
        if (s2El && s2El.scrollHeight > s2El.clientHeight + 4) {
          const atTop = s2El.scrollTop <= 6;
          const atBottom = s2El.scrollTop + s2El.clientHeight >= s2El.scrollHeight - 16;
          if (e.deltaY < -6 && !atTop) return;
          if (e.deltaY > 6 && !atBottom) return;
        }
        if (e.deltaY < -6) {
          e.preventDefault();
          lastWheelTime = now;
          playScene2ToScene1();
        } else if (e.deltaY > 6) {
          e.preventDefault();
          lastWheelTime = now;
          playScene2ToScene3();
        }
        return;
      }

      // In Scene 3:
      if (currentSceneRef.current === 3) {
        const s3El = getScrollableSceneLayer();
        if (s3El && s3El.scrollHeight > s3El.clientHeight + 4) {
          const atTop = s3El.scrollTop <= 6;
          const atBottom = s3El.scrollTop + s3El.clientHeight >= s3El.scrollHeight - 16;
          if (e.deltaY < -6 && !atTop) return;
          if (e.deltaY > 6 && !atBottom) return;
        }
        if (e.deltaY < -6) {
          e.preventDefault();
          lastWheelTime = now;
          if (scene3ActiveStepRef.current > 0) {
            scene3StepApiRef.current?.selectStep((prev) => Math.max(0, prev - 1));
          } else {
            playScene3ToScene2();
          }
        } else if (e.deltaY > 6) {
          e.preventDefault();
          lastWheelTime = now;
          if (scene3ActiveStepRef.current < 5) {
            scene3StepApiRef.current?.selectStep((prev) => Math.min(5, prev + 1));
          } else {
            playScene3ToScene4();
          }
        }
        return;
      }

      // In Scene 4: UP returns to Scene 3; DOWN shifts into Scene 5 (#san-pham)
      if (currentSceneRef.current === 4) {
        const s4El = getScrollableSceneLayer();
        if (s4El && s4El.scrollHeight > s4El.clientHeight + 4) {
          const atTop = s4El.scrollTop <= 6;
          const atBottom = s4El.scrollTop + s4El.clientHeight >= s4El.scrollHeight - 16;
          if (e.deltaY < -6 && !atTop) return;
          if (e.deltaY > 6 && !atBottom) return;
        }
        if (e.deltaY < -6) {
          e.preventDefault();
          lastWheelTime = now;
          playScene4ToScene3();
        } else if (e.deltaY > 6) {
          e.preventDefault();
          lastWheelTime = now;
          playScene4ToScene5();
        }
        return;
      }

      // In Scene 5: UP shifts back to Scene 4; DOWN advances to Scene 6 (Bảo mật)
      if (currentSceneRef.current === 5) {
        const s5El = getScrollableSceneLayer();
        if (s5El && s5El.scrollHeight > s5El.clientHeight + 4) {
          const atTop = s5El.scrollTop <= 6;
          const atBottom = s5El.scrollTop + s5El.clientHeight >= s5El.scrollHeight - 16;
          if (e.deltaY < -6 && !atTop) return;
          if (e.deltaY > 6 && !atBottom) return;
        }
        if (e.deltaY < -6) {
          e.preventDefault();
          lastWheelTime = now;
          playScene5ToScene4();
        } else if (e.deltaY > 6) {
          e.preventDefault();
          lastWheelTime = now;
          playScene5ToScene6();
        }
        return;
      }

      // In Scene 6: UP returns to Scene 5; DOWN advances to Scene 7 (Đăng ký)
      if (currentSceneRef.current === 6) {
        const s6El = getScrollableSceneLayer();
        if (s6El && s6El.scrollHeight > s6El.clientHeight + 4) {
          const atTop = s6El.scrollTop <= 6;
          const atBottom = s6El.scrollTop + s6El.clientHeight >= s6El.scrollHeight - 16;
          if (e.deltaY < -6 && !atTop) return;
          if (e.deltaY > 6 && !atBottom) return;
        }
        if (e.deltaY < -6) {
          e.preventDefault();
          lastWheelTime = now;
          playScene6ToScene5();
        } else if (e.deltaY > 6) {
          e.preventDefault();
          lastWheelTime = now;
          playScene6ToScene7();
        }
        return;
      }

      // In Scene 7: UP returns to Scene 6
      if (currentSceneRef.current === 7) {
        const s7El = getScrollableSceneLayer();
        if (s7El && s7El.scrollHeight > s7El.clientHeight + 4) {
          const atTop = s7El.scrollTop <= 6;
          const atBottom = s7El.scrollTop + s7El.clientHeight >= s7El.scrollHeight - 16;
          if (e.deltaY < -6 && !atTop) return;
          if (e.deltaY > 6 && !atBottom) return;
        }
        if (e.deltaY < -6) {
          e.preventDefault();
          lastWheelTime = now;
          playScene7ToScene6();
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      const scroller = getScrollableSceneLayer();
      touchStartInnerTop = scroller ? scroller.scrollTop : 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (scene3ZoomedStepRef.current !== null || zoomedProductIdxRef.current !== null) return;
      if (window.scrollY > 20) return;
      if (isAnimatingRef.current) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (scene3ZoomedStepRef.current !== null || zoomedProductIdxRef.current !== null) return;
      if (window.scrollY > 20 || isAnimatingRef.current) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY; // > 0 is swipe up (scroll down)

      const scroller = getScrollableSceneLayer();
      if (scroller && scroller.scrollHeight > scroller.clientHeight + 4) {
        const startedAtTop = touchStartInnerTop <= 6 && scroller.scrollTop <= 6;
        const startedAtBottom =
          touchStartInnerTop + scroller.clientHeight >= scroller.scrollHeight - 20 &&
          scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 20;
        if (diffY < -35 && !startedAtTop) return;
        if (diffY > 35 && !startedAtBottom) return;
      }

      if (Math.abs(diffY) > 35) {
        if (currentSceneRef.current === 1 && diffY > 0) {
          playScene1ToScene2();
        } else if (currentSceneRef.current === 2) {
          if (diffY < 0) {
            playScene2ToScene1();
          } else {
            playScene2ToScene3();
          }
        } else if (currentSceneRef.current === 3) {
          if (diffY < 0) {
            if (scene3ActiveStepRef.current > 0) {
              scene3StepApiRef.current?.selectStep((prev) => Math.max(0, prev - 1));
            } else {
              playScene3ToScene2();
            }
          } else {
            if (scene3ActiveStepRef.current < 5) {
              scene3StepApiRef.current?.selectStep((prev) => Math.min(5, prev + 1));
            } else {
              playScene3ToScene4();
            }
          }
        } else if (currentSceneRef.current === 4) {
          if (diffY < 0) {
            playScene4ToScene3();
          } else {
            playScene4ToScene5();
          }
        } else if (currentSceneRef.current === 5) {
          if (diffY < 0) {
            playScene5ToScene4();
          } else {
            playScene5ToScene6();
          }
        } else if (currentSceneRef.current === 6) {
          if (diffY < 0) {
            playScene6ToScene5();
          } else {
            playScene6ToScene7();
          }
        } else if (currentSceneRef.current === 7) {
          if (diffY < 0) {
            playScene7ToScene6();
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (scene3ZoomedStepRef.current !== null) {
        if (e.key === 'Escape') {
          e.preventDefault();
          scene3StepApiRef.current?.setZoomedStepIdx(null);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIdx = Math.min(5, scene3ZoomedStepRef.current + 1);
          scene3StepApiRef.current?.setZoomedStepIdx(nextIdx);
          scene3StepApiRef.current?.selectStep(nextIdx);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIdx = Math.max(0, scene3ZoomedStepRef.current - 1);
          scene3StepApiRef.current?.setZoomedStepIdx(prevIdx);
          scene3StepApiRef.current?.selectStep(prevIdx);
        }
        return;
      }
      if (zoomedProductIdxRef.current !== null) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setZoomedProductIdx(null);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIdx = Math.min(PRODUCT_SCREENS.length - 1, zoomedProductIdxRef.current + 1);
          setZoomedProductIdx(nextIdx);
          setActiveProductIdx(nextIdx);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIdx = Math.max(0, zoomedProductIdxRef.current - 1);
          setZoomedProductIdx(prevIdx);
          setActiveProductIdx(prevIdx);
        }
        return;
      }
      if (window.scrollY > 20 || isAnimatingRef.current) return;
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        if (currentSceneRef.current === 1) {
          e.preventDefault();
          playScene1ToScene2();
        } else if (currentSceneRef.current === 2) {
          e.preventDefault();
          playScene2ToScene3();
        } else if (currentSceneRef.current === 3) {
          e.preventDefault();
          if (scene3ActiveStepRef.current < 5) {
            scene3StepApiRef.current?.selectStep((prev) => Math.min(5, prev + 1));
          } else {
            playScene3ToScene4();
          }
        } else if (currentSceneRef.current === 4) {
          e.preventDefault();
          playScene4ToScene5();
        } else if (currentSceneRef.current === 5) {
          e.preventDefault();
          playScene5ToScene6();
        } else if (currentSceneRef.current === 6) {
          e.preventDefault();
          playScene6ToScene7();
        }
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        if (currentSceneRef.current === 2) {
          e.preventDefault();
          playScene2ToScene1();
        } else if (currentSceneRef.current === 3) {
          e.preventDefault();
          if (scene3ActiveStepRef.current > 0) {
            scene3StepApiRef.current?.selectStep((prev) => Math.max(0, prev - 1));
          } else {
            playScene3ToScene2();
          }
        } else if (currentSceneRef.current === 4) {
          e.preventDefault();
          playScene4ToScene3();
        } else if (currentSceneRef.current === 5) {
          e.preventDefault();
          playScene5ToScene4();
        } else if (currentSceneRef.current === 6) {
          e.preventDefault();
          playScene6ToScene5();
        } else if (currentSceneRef.current === 7) {
          e.preventDefault();
          playScene7ToScene6();
        }
      }
    };

    window.addEventListener('scroll', handleScrollSync, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollSync);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (orbitRafIdRef.current) cancelAnimationFrame(orbitRafIdRef.current);
      if (scrollAnimRafRef.current) cancelAnimationFrame(scrollAnimRafRef.current);
      if (directSwitchTimerRef.current) cancelAnimationFrame(directSwitchTimerRef.current);
    };
  }, [syncScrollState]);

  // Clamping and easing helpers
  const clamp = (val: number, min = 0, max = 1) => Math.min(max, Math.max(min, val));
  const rangeProgress = (p: number, start: number, end: number) => clamp((p - start) / (end - start));
  const easeOutQuad = (t: number) => t * (2 - t);
  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeInOutSine = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));

  // ── PHASE 1: CHỮ & CARD CẢNH 1 DẠT SANG 2 BÊN KẾT HỢP ĐỒNG THỜI ZOOM NGAY TỪ ĐẦU ──
  const heroLeftProg = rangeProgress(animProgress, 0.00, 0.12);
  const heroLeftX = -easeOutQuad(heroLeftProg) * 560;
  const heroLeftOpacity = 1 - easeOutQuad(heroLeftProg);

  const heroRightProg = rangeProgress(animProgress, 0.00, 0.13);
  const heroRightX = easeOutQuad(heroRightProg) * 580;

  const pillar1Prog = rangeProgress(animProgress, 0.00, 0.09);
  const pillar2Prog = rangeProgress(animProgress, 0.02, 0.11);
  const pillar3Prog = rangeProgress(animProgress, 0.04, 0.13);

  const scrollCueOpacity = 1 - rangeProgress(animProgress, 0.00, 0.05);

  // ── PHASE 2: PHÓNG TO ZOOM BẮT ĐẦU ĐỒNG THỜI TỪ P: 0.00 ĐẾN P: 0.44 (TỐC ĐỘ NHANH HƠN) ──
  const heroZoomProg = rangeProgress(animProgress, 0.00, 0.44);
  // Curve gia tốc nhạy hơn (t^1.12) giúp camera lướt tới nhanh nhạy và dứt khoát hơn
  const scene1VideoScale = 1.0 + Math.pow(heroZoomProg, 1.12) * 2.85;
  const scene1VignetteOpacity = 1 - heroZoomProg * 0.85;

  // ── HIỆU ỨNG MỜ KẾT NỐI VỚI ĐỘ SÂU ZOOM ──
  let scene1VideoBlur = 0;
  if (heroZoomProg > 0.38) {
    const s1Slight = rangeProgress(heroZoomProg, 0.38, 0.70);
    const s1Deep = rangeProgress(heroZoomProg, 0.70, 1.00);
    scene1VideoBlur = easeOutQuad(s1Slight) * 6 + easeInOutCubic(s1Deep) * 18;
  }

  // ── PHASE 2.5: GIAO THOA TẠI ĐỈNH MỜ (p: 0.42 -> 0.50) ──
  const scene1Opacity = 1 - rangeProgress(animProgress, 0.42, 0.50);
  const scene1PointerEvents: 'auto' | 'none' = scene1Opacity > 0.1 ? 'auto' : 'none';

  // ── PHASE 3: VIDEO CẢNH 2 HIỆN RA Ở ĐỈNH MỜ RỒI GIẢM MỜ (p: 0.42 -> 0.70) ──
  const scene2VideoProg = rangeProgress(animProgress, 0.42, 0.50);
  const scene2VideoOpacity = easeOutQuad(scene2VideoProg);
  const scene2LayerOpacity = rangeProgress(animProgress, 0.40, 0.48);

  const scene2FocusProg = rangeProgress(animProgress, 0.46, 0.70);
  let scene2VideoBlur = 0;
  if (scene2FocusProg < 1.0) {
    const s2DeepProg = 1 - rangeProgress(scene2FocusProg, 0.0, 0.48);
    const s2SlightProg = 1 - rangeProgress(scene2FocusProg, 0.48, 1.0);
    scene2VideoBlur = easeInOutCubic(s2DeepProg) * 18 + easeOutQuad(s2SlightProg) * 6;
  }
  const scene2VideoScale = 1.06 - easeOutQuad(scene2FocusProg) * 0.06;

  // ── PHASE 3.5: VIDEO CẢNH 2 RÕ NÉT HOÀN TOÀN ĐỘC BẢN (p: 0.74 -> 0.82) ──
  // Video văn phòng chạy 100% sắc nét, tự nhiên trong ~1 giây trước khi chữ hiện

  // ── PHASE 4: LỚP PHỦ MỊN XUẤT HIỆN DỊU NHẸ (p: 0.78 -> 0.85) ──
  const scene2OverlayProg = rangeProgress(animProgress, 0.78, 0.85);
  const scene2OverlayOpacity = easeOutQuad(scene2OverlayProg);

  // ── PHASE 5: TIÊU ĐỀ NÉ HEADER XUẤT HIỆN LẦN LƯỢT (p: 0.80 -> 0.88) ──
  const scene2BadgeProg = rangeProgress(animProgress, 0.80, 0.85);
  const scene2BadgeOpacity = easeOutQuad(scene2BadgeProg);
  const scene2BadgeY = (1 - easeOutQuad(scene2BadgeProg)) * 18;

  const scene2TitleProg = rangeProgress(animProgress, 0.82, 0.87);
  const scene2TitleOpacity = easeOutQuad(scene2TitleProg);
  const scene2TitleY = (1 - easeOutQuad(scene2TitleProg)) * 22;

  const scene2DescProg = rangeProgress(animProgress, 0.84, 0.89);
  const scene2DescOpacity = easeOutQuad(scene2DescProg);
  const scene2DescY = (1 - easeOutQuad(scene2DescProg)) * 18;

  // ── PHASE 6: 2 CỘT MÔ TẢ TRỰC TIẾP TRÊN NỀN HIỂN THỊ CHẬM RÃI (p: 0.84 -> 0.98) ──
  // Cột 1 (Phương pháp cũ): Lướt lên từ từ, mờ dần sang rõ nét trong suốt ~1.5 giây
  const scene2Card1Prog = rangeProgress(animProgress, 0.84, 0.95);
  const scene2Card1Opacity = easeInOutCubic(scene2Card1Prog);
  const scene2Card1Y = (1 - easeInOutCubic(scene2Card1Prog)) * 26;
  const scene2Card1X = (1 - easeInOutCubic(scene2Card1Prog)) * -14;

  // Cột 2 (DigiTalent AI): Nối tiếp lướt lên chậm rãi, êm ái
  const scene2Card2Prog = rangeProgress(animProgress, 0.87, 0.98);
  const scene2Card2Opacity = easeInOutCubic(scene2Card2Prog);
  const scene2Card2Y = (1 - easeInOutCubic(scene2Card2Prog)) * 26;
  const scene2Card2X = (1 - easeInOutCubic(scene2Card2Prog)) * 14;

  // Impact pills và nút cuộn tiếp tục góc dưới bên phải
  const scene2PillsProg = rangeProgress(animProgress, 0.92, 1.00);
  const scene2PillsOpacity = easeInOutCubic(scene2PillsProg);
  const scene2PillsScale = 0.94 + easeInOutCubic(scene2PillsProg) * 0.06;

  const scene2CueProg = rangeProgress(animProgress, 0.90, 1.00);
  const scene2CueOpacity = easeInOutCubic(scene2CueProg);

  // ═════════════════════════════════════════════════════════════════
  // TRANSITIONS: SCENE 2 <-> SCENE 3 & SCENE 3 <-> SCENE 4 (Orbital Twin Frames)
  // ═════════════════════════════════════════════════════════════════
  const isOrbitActive = orbitConfig !== null;
  const isOrbit23Active = orbitConfig?.pair === '2-3';
  const isOrbit34Active = orbitConfig?.pair === '3-4';
  const is3DRevolving =
    isOrbitActive ||
    (animProgress > 1.0005 && animProgress < 1.9995) ||
    (animProgress > 2.0005 && animProgress < 2.9995);
  const isScene2Settled = !is3DRevolving && Math.abs(animProgress - 1.0) <= 0.0005;
  const isScene3Settled = !is3DRevolving && Math.abs(animProgress - 2.0) <= 0.0005;
  const isScene4Settled = !is3DRevolving && Math.abs(animProgress - 3.0) <= 0.0005;
  const isScene5Settled = !is3DRevolving && Math.abs(animProgress - 4.0) <= 0.0005;
  const isScene6Settled = !is3DRevolving && Math.abs(animProgress - 5.0) <= 0.0005;
  const isScene7Settled = !is3DRevolving && animProgress >= 5.9995;

  let s2ContentDriftX = 0;
  let s2ContentDriftOpacity = 1;
  let scene2LayerOpacityFinal = scene2LayerOpacity;
  let scene2Transform3D = 'none';
  let scene2BorderRadiusPx = 0;
  let scene2ZIndex = 3;
  let scene2PointerEvents: 'auto' | 'none' =
    !isOrbitActive && animProgress > 0.55 && animProgress <= 1.0 ? 'auto' : 'none';

  let s3ContentDriftX = 0;
  let s3ContentDriftOpacity = 0;
  let s3ContentScale = 1.0;
  let s3ContentY = 0;
  let s3LayerOpacity = 0;
  let s3BgScale = 1.0;
  let s3BgBlur = 0;
  let scene3Transform3D = 'none';
  let scene3BorderRadiusPx = 0;
  let scene3ZIndex = 4;
  let scene3PointerEvents: 'auto' | 'none' = 'none';

  let s3HeaderOpacity = 0;
  let s3HeaderY = 18;
  let s3StageOpacity = 0;
  let s3StageY = 22;
  let s3CueOpacity = 0;

  let orbitHaloOpacity = 0;
  let orbitHaloHubY = 34;
  let orbitHaloRingW = 640;
  let orbitHaloRingH = 380;
  let orbitHaloRingTilt = -22;

  let s4LayerOpacity = 0;
  let s4BgScale = 1.0;
  let s4BgBlur = 0;
  let s4ContentOpacity = 1;
  let s4ContentY = 0;
  let s4ContentScale = 1.0;
  let s4HeaderOpacity = 0;
  let s4HeaderY = 18;
  let s4ToolbarOpacity = 0;
  let s4ToolbarY = 14;
  let s4StageOpacity = 0;
  let s4StageY = 20;
  let s4CueOpacity = 0;
  let scene4Transform3D = 'none';
  let scene4BorderRadiusPx = 0;
  let scene4ZIndex = 5;
  let scene4PointerEvents: 'auto' | 'none' = 'none';

  let s5LayerOpacity = 0;
  let s5BgX = 0;
  let s5BgY = 36;
  let s5BgScale = 1.06;
  let s5BgBlur = 0;
  let s5ContentOpacity = 0;
  let s5ContentX = 0;
  let s5HeaderOpacity = 0;
  let s5HeaderY = 22;
  let s5StageOpacity = 0;
  let s5StageY = 26;
  let s5CueOpacity = 0;
  let scene5Transform3D = 'none';
  let scene5BorderRadiusPx = 0;
  let scene5BoxShadow = 'none';
  let scene5PointerEvents: 'auto' | 'none' = 'none';

  // Scene 6 animation vars (same pattern as Scene 5)
  let s6LayerOpacity = 0;
  let s6ContentOpacity = 0;
  let s6CueOpacity = 0;
  let scene6Transform3D = 'none';
  let scene6BoxShadow = 'none';
  let scene6PointerEvents: 'auto' | 'none' = 'none';

  // Scene 7 animation vars (same pattern as Scene 5)
  let s7LayerOpacity = 0;
  let s7ContentOpacity = 0;
  let scene7Transform3D = 'none';
  let scene7BoxShadow = 'none';
  let scene7PointerEvents: 'auto' | 'none' = 'none';

  if (orbitConfig) {
    // During active orbit, all internal UI of the participating pair stays at 100%
    // visibility while RAF mutates the outer frame layers without React re-renders.
    if (orbitConfig.pair === '2-3') {
      scene2LayerOpacityFinal = orbitConfig.dir === 'forward' ? 0.9999 : 0.0001;
      scene2PointerEvents = 'none';
      s2ContentDriftX = 0;
      s2ContentDriftOpacity = 1;

      s3LayerOpacity = orbitConfig.dir === 'forward' ? 0.0001 : 0.9999;
      scene3PointerEvents = 'none';
      s3ContentDriftX = 0;
      s3ContentDriftOpacity = 1;
      s3BgScale = 1.0;
      s3BgBlur = 0;
      s3HeaderOpacity = 1;
      s3HeaderY = 0;
      s3StageOpacity = 1;
      s3StageY = 0;
      s3CueOpacity = 1;

      s4LayerOpacity = 0;
      scene4PointerEvents = 'none';
    } else {
      scene2LayerOpacityFinal = 0;
      scene2Transform3D = 'none';
      scene2PointerEvents = 'none';

      s3LayerOpacity = orbitConfig.dir === 'forward' ? 0.9999 : 0.0001;
      scene3PointerEvents = 'none';
      s3ContentDriftX = 0;
      s3ContentDriftOpacity = 1;
      s3BgScale = 1.0;
      s3BgBlur = 0;
      s3HeaderOpacity = 1;
      s3HeaderY = 0;
      s3StageOpacity = 1;
      s3StageY = 0;
      s3CueOpacity = 1;

      s4LayerOpacity = orbitConfig.dir === 'forward' ? 0.0001 : 0.9999;
      scene4PointerEvents = 'none';
      s4BgScale = 1.0;
      s4BgBlur = 0;
      s4ContentOpacity = 1;
      s4ContentY = 0;
      s4ContentScale = 1.0;
      s4HeaderOpacity = 1;
      s4HeaderY = 0;
      s4ToolbarOpacity = 1;
      s4ToolbarY = 0;
      s4StageOpacity = 1;
      s4StageY = 0;
      s4CueOpacity = 1;
    }
  } else if (animProgress > 1.0 && animProgress <= 2.0) {
    const dir = transitionDir === 'reverse' ? 'reverse' : 'forward';
    const progress01 =
      dir === 'reverse' ? clamp(2.0 - animProgress, 0, 1) : clamp(animProgress - 1.0, 0, 1);

    if (progress01 < 0.0005 && dir === 'forward') {
      scene2LayerOpacityFinal = 1;
      scene2PointerEvents = 'auto';
      s3LayerOpacity = 0;
    } else if (progress01 >= 0.9995 && dir === 'forward') {
      // Settled Scene 3
      scene2LayerOpacityFinal = 0;
      scene2PointerEvents = 'none';
      s3LayerOpacity = 1;
      s3ContentDriftX = 0;
      s3ContentDriftOpacity = 1;
      scene3PointerEvents = 'auto';
      s3HeaderOpacity = 1;
      s3HeaderY = 0;
      s3StageOpacity = 1;
      s3StageY = 0;
      s3CueOpacity = 1;
    } else if (progress01 < 0.0005 && dir === 'reverse') {
      scene2LayerOpacityFinal = 0;
      s3LayerOpacity = 1;
      s3ContentDriftOpacity = 1;
      scene3PointerEvents = 'auto';
      s3HeaderOpacity = 1;
      s3HeaderY = 0;
      s3StageOpacity = 1;
      s3StageY = 0;
      s3CueOpacity = 1;
    } else if (progress01 >= 0.9995 && dir === 'reverse') {
      // Settled Scene 2
      scene2LayerOpacityFinal = 1;
      scene2PointerEvents = 'auto';
      s3LayerOpacity = 0;
    } else {
      // Multi-scene scrub jump fallback through [1.0 .. 2.0]
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
      const pose = computeOrbitalTwinPose(progress01, dir, 1, vw, vh);
      const s2Pose = dir === 'forward' ? pose.outgoing : pose.incoming;
      const s3Pose = dir === 'forward' ? pose.incoming : pose.outgoing;

      scene2LayerOpacityFinal = s2Pose.opacity;
      scene2Transform3D = `translate3d(${s2Pose.x.toFixed(1)}px, ${s2Pose.y.toFixed(1)}px, ${s2Pose.z.toFixed(1)}px) rotateY(${s2Pose.rotY.toFixed(2)}deg) scale(${s2Pose.scale.toFixed(4)})`;
      scene2BorderRadiusPx = s2Pose.borderRadiusPx;
      scene2ZIndex = dir === 'forward' ? pose.outgoingZIndex : pose.incomingZIndex;
      scene2PointerEvents = 'none';

      s3LayerOpacity = s3Pose.opacity;
      scene3Transform3D = `translate3d(${s3Pose.x.toFixed(1)}px, ${s3Pose.y.toFixed(1)}px, ${s3Pose.z.toFixed(1)}px) rotateY(${s3Pose.rotY.toFixed(2)}deg) scale(${s3Pose.scale.toFixed(4)})`;
      scene3BorderRadiusPx = s3Pose.borderRadiusPx;
      scene3ZIndex = dir === 'forward' ? pose.incomingZIndex : pose.outgoingZIndex;
      scene3PointerEvents = 'none';

      s3ContentDriftOpacity = 1;
      s3HeaderOpacity = 1;
      s3HeaderY = 0;
      s3StageOpacity = 1;
      s3StageY = 0;
      s3CueOpacity = 0;

      orbitHaloOpacity = pose.haloOpacity;
      orbitHaloHubY = pose.hubY;
      orbitHaloRingW = pose.ringWidth;
      orbitHaloRingH = pose.ringHeight;
      orbitHaloRingTilt = pose.ringTiltDeg;
    }
  } else if (animProgress > 2.0 && animProgress <= 3.0) {
    // ═════════════════════════════════════════════════════════════════
    // TRANSITION: SCENE 3 <-> SCENE 4 (Orbital Twin Frames reverse spin, p: 2.00 <-> 3.00)
    // ═════════════════════════════════════════════════════════════════
    scene2LayerOpacityFinal = 0;
    scene2Transform3D = 'none';
    scene2PointerEvents = 'none';

    const dir = transitionDir === 'reverse' ? 'reverse' : 'forward';
    const progress01 =
      dir === 'reverse' ? clamp(3.0 - animProgress, 0, 1) : clamp(animProgress - 2.0, 0, 1);

    if (progress01 < 0.0005 && dir === 'forward') {
      // Scene 3 settled boundary
      s3LayerOpacity = 1;
      s3ContentDriftOpacity = 1;
      scene3PointerEvents = 'auto';
      s3HeaderOpacity = 1;
      s3HeaderY = 0;
      s3StageOpacity = 1;
      s3StageY = 0;
      s3CueOpacity = 1;
      s4LayerOpacity = 0;
    } else if (progress01 >= 0.9995 && dir === 'forward') {
      // Settled Scene 4
      s3LayerOpacity = 0;
      scene3PointerEvents = 'none';
      s4LayerOpacity = 1;
      s4BgScale = 1.0;
      s4BgBlur = 0;
      s4ContentOpacity = 1;
      s4ContentY = 0;
      s4ContentScale = 1.0;
      scene4PointerEvents = 'auto';
      s4HeaderOpacity = 1;
      s4HeaderY = 0;
      s4ToolbarOpacity = 1;
      s4ToolbarY = 0;
      s4StageOpacity = 1;
      s4StageY = 0;
      s4CueOpacity = 1;
    } else if (progress01 < 0.0005 && dir === 'reverse') {
      // Scene 4 settled boundary
      s3LayerOpacity = 0;
      s4LayerOpacity = 1;
      s4BgScale = 1.0;
      s4BgBlur = 0;
      s4ContentOpacity = 1;
      s4ContentY = 0;
      s4ContentScale = 1.0;
      scene4PointerEvents = 'auto';
      s4HeaderOpacity = 1;
      s4HeaderY = 0;
      s4ToolbarOpacity = 1;
      s4ToolbarY = 0;
      s4StageOpacity = 1;
      s4StageY = 0;
      s4CueOpacity = 1;
    } else if (progress01 >= 0.9995 && dir === 'reverse') {
      // Settled Scene 3
      s4LayerOpacity = 0;
      scene4PointerEvents = 'none';
      s3LayerOpacity = 1;
      s3ContentDriftOpacity = 1;
      scene3PointerEvents = 'auto';
      s3HeaderOpacity = 1;
      s3HeaderY = 0;
      s3StageOpacity = 1;
      s3StageY = 0;
      s3CueOpacity = 1;
    } else {
      // Multi-scene scrub jump fallback through [2.0 .. 3.0]
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
      const pose = computeOrbitalTwinPose(progress01, dir, -1, vw, vh);
      const s3Pose = dir === 'forward' ? pose.outgoing : pose.incoming;
      const s4Pose = dir === 'forward' ? pose.incoming : pose.outgoing;

      s3LayerOpacity = s3Pose.opacity;
      scene3Transform3D = `translate3d(${s3Pose.x.toFixed(1)}px, ${s3Pose.y.toFixed(1)}px, ${s3Pose.z.toFixed(1)}px) rotateY(${s3Pose.rotY.toFixed(2)}deg) scale(${s3Pose.scale.toFixed(4)})`;
      scene3BorderRadiusPx = s3Pose.borderRadiusPx;
      scene3ZIndex = dir === 'forward' ? pose.outgoingZIndex : pose.incomingZIndex;
      scene3PointerEvents = 'none';
      s3ContentDriftOpacity = 1;
      s3HeaderOpacity = 1;
      s3HeaderY = 0;
      s3StageOpacity = 1;
      s3StageY = 0;
      s3CueOpacity = 0;

      s4LayerOpacity = s4Pose.opacity;
      scene4Transform3D = `translate3d(${s4Pose.x.toFixed(1)}px, ${s4Pose.y.toFixed(1)}px, ${s4Pose.z.toFixed(1)}px) rotateY(${s4Pose.rotY.toFixed(2)}deg) scale(${s4Pose.scale.toFixed(4)})`;
      scene4BorderRadiusPx = s4Pose.borderRadiusPx;
      scene4ZIndex = dir === 'forward' ? pose.incomingZIndex : pose.outgoingZIndex;
      scene4PointerEvents = 'none';
      s4BgScale = 1.0;
      s4BgBlur = 0;
      s4ContentOpacity = 1;
      s4ContentY = 0;
      s4ContentScale = 1.0;
      s4HeaderOpacity = 1;
      s4HeaderY = 0;
      s4ToolbarOpacity = 1;
      s4ToolbarY = 0;
      s4StageOpacity = 1;
      s4StageY = 0;
      s4CueOpacity = 0;

      orbitHaloOpacity = pose.haloOpacity;
      orbitHaloHubY = pose.hubY;
      orbitHaloRingW = pose.ringWidth;
      orbitHaloRingH = pose.ringHeight;
      orbitHaloRingTilt = pose.ringTiltDeg;
    }
  } else if (animProgress > 3.0 && animProgress <= 4.0) {
    // ═════════════════════════════════════════════════════════════════
    // TRANSITION: SCENE 4 <-> SCENE 5 (Choreographed Bottom Sheet Rise, 3600ms)
    // Giai đoạn 1: Các thành phần Cảnh 4 di chuyển trượt lên phía trên
    // Giai đoạn 2: Đi được 1 xí thì Cảnh 5 trườn từ dưới đáy màn hình (100% -> 0%) lên hẳn
    // ═════════════════════════════════════════════════════════════════
    scene2LayerOpacityFinal = 0;
    scene2Transform3D = 'none';
    scene2PointerEvents = 'none';
    s3LayerOpacity = 0;
    scene3Transform3D = 'none';
    scene3PointerEvents = 'none';

    const p45 = clamp(animProgress - 3.0, 0, 1);

    // 1. Scene 4: Toàn bộ thành phần (tiêu đề, toolbar, bảng ma trận) di chuyển trượt lên trên rồi lướt dần ra ngoài
    const s4ShiftProg = easeInOutSine(rangeProgress(p45, 0.0, 0.65));
    const s4ShiftY = -s4ShiftProg * 220;
    const s4Scale = 1.0 - s4ShiftProg * 0.035;
    scene4Transform3D = isScene4Settled
      ? 'none'
      : `translate3d(0, ${s4ShiftY.toFixed(1)}px, 0) scale(${s4Scale.toFixed(4)})`;

    // Cảnh 4 hiển thị rõ trong nhịp đầu (0% - 20%) khi đang trượt lên, rồi mờ dần từ 20% đến 60%
    s4LayerOpacity = isScene5Settled
      ? 0
      : clamp(1 - rangeProgress(p45, 0.20, 0.60));
    s4BgBlur = isScene4Settled ? 0 : easeInOutSine(rangeProgress(p45, 0.16, 0.58)) * 6;
    scene4PointerEvents = p45 < 0.06 ? 'auto' : 'none';

    // Các thành phần Cảnh 4 đồng loạt di chuyển đi lên rõ rệt:
    s4HeaderOpacity = clamp(1 - rangeProgress(p45, 0.10, 0.48));
    s4HeaderY = -rangeProgress(p45, 0.0, 0.52) * 90; // Tiêu đề lướt lên -90px
    s4ToolbarOpacity = clamp(1 - rangeProgress(p45, 0.12, 0.52));
    s4ToolbarY = -rangeProgress(p45, 0.02, 0.54) * 75; // Thanh tab lướt lên -75px
    s4ContentOpacity = clamp(1 - rangeProgress(p45, 0.16, 0.58));
    s4ContentY = -rangeProgress(p45, 0.04, 0.58) * 110; // Bảng ma trận lướt lên -110px
    s4ContentScale = 1.0;
    s4StageOpacity = clamp(1 - rangeProgress(p45, 0.16, 0.58));
    s4StageY = -rangeProgress(p45, 0.04, 0.58) * 95;
    s4CueOpacity = clamp(1 - rangeProgress(p45, 0.0, 0.18));

    // 2. Scene 5: Xuất hiện từ dưới đáy màn hình (100% viewport) đi lên
    // Cảnh 4 đi được 1 xí (từ mốc 12%): Cảnh 5 bắt đầu tiến từ đáy màn hình (translateY: 100% -> 0%)
    const s5Prog = rangeProgress(p45, 0.12, 0.98);
    const s5Ease = easeInOutSine(s5Prog);
    const s5ShiftYPercent = (1 - s5Ease) * 100; // 100% nghĩa là nằm hoàn toàn dưới đáy màn hình!
    const s5Scale = 0.95 + 0.05 * s5Ease;
    scene5Transform3D = isScene5Settled
      ? 'none'
      : `translate3d(0, ${s5ShiftYPercent.toFixed(2)}%, 0) scale(${s5Scale.toFixed(4)})`;

    // Cảnh 5 khi tiến từ dưới lên là một lớp thực thể rõ nét (hiển thị đầy đủ từ mốc 12% trở đi)
    s5LayerOpacity = isScene4Settled ? 0 : clamp(rangeProgress(p45, 0.10, 0.16));
    scene5BorderRadiusPx = 0;
    // Viền sáng trên và bóng đổ đổ xuống Cảnh 4 bên dưới khi Cảnh 5 trườn từ đáy lên
    scene5BoxShadow = isScene5Settled
      ? 'none'
      : '0 -25px 60px rgba(0, 0, 0, 0.70), 0 -4px 20px rgba(56, 189, 248, 0.45)';
    scene5PointerEvents = p45 > 0.80 ? 'auto' : 'none';

    // 3. Scene 5 Nền & Bục trưng bày: Parallax nhẹ nhàng tạo chiều sâu
    s5BgX = 0;
    s5BgY = isScene5Settled ? 0 : (1 - s5Ease) * 35;
    s5BgScale = isScene5Settled ? 1.0 : 1.03 - s5Ease * 0.03;
    s5BgBlur = 0;

    // 4. Scene 5 Nội dung:
    // Toàn bộ tiêu đề, carousel 5 card và bục sân khấu hiển thị nguyên vẹn trên tấm nền trượt lên từ đáy!
    s5ContentOpacity = 1;
    s5ContentX = 0;
    s5HeaderOpacity = 1;
    s5HeaderY = 0;
    s5StageOpacity = 1;
    s5StageY = 0;
    // Nút cuộn tiếp tục xuất hiện cuối cùng (80% -> 100%)
    s5CueOpacity = isScene5Settled ? 1 : easeInOutSine(rangeProgress(p45, 0.80, 1.00));
  } else if (animProgress > 4.0 && animProgress <= 5.0) {
    // ═════════════════════════════════════════════════════════════════
    // TRANSITION: SCENE 5 <-> SCENE 6 (Choreographed Bottom Sheet Rise, 3600ms)
    // Same choreography as Scene 4 <-> Scene 5
    // ═════════════════════════════════════════════════════════════════
    scene2LayerOpacityFinal = 0;
    scene2Transform3D = 'none';
    scene2PointerEvents = 'none';
    s3LayerOpacity = 0;
    scene3Transform3D = 'none';
    scene3PointerEvents = 'none';
    s4LayerOpacity = 0;
    scene4Transform3D = 'none';
    scene4PointerEvents = 'none';

    const p56 = clamp(animProgress - 4.0, 0, 1);

    // 1. Scene 5: slides up and fades out
    const s5ShiftProg56 = easeInOutSine(rangeProgress(p56, 0.0, 0.65));
    const s5ShiftY56 = -s5ShiftProg56 * 220;
    const s5Scale56 = 1.0 - s5ShiftProg56 * 0.035;
    scene5Transform3D = isScene5Settled
      ? 'none'
      : `translate3d(0, ${s5ShiftY56.toFixed(1)}px, 0) scale(${s5Scale56.toFixed(4)})`;

    s5LayerOpacity = isScene6Settled
      ? 0
      : clamp(1 - rangeProgress(p56, 0.20, 0.60));
    scene5PointerEvents = p56 < 0.06 ? 'auto' : 'none';
    s5ContentOpacity = clamp(1 - rangeProgress(p56, 0.10, 0.48));
    s5HeaderOpacity = clamp(1 - rangeProgress(p56, 0.10, 0.48));
    s5HeaderY = -rangeProgress(p56, 0.0, 0.52) * 90;
    s5StageOpacity = clamp(1 - rangeProgress(p56, 0.16, 0.58));
    s5StageY = -rangeProgress(p56, 0.04, 0.58) * 95;
    s5CueOpacity = clamp(1 - rangeProgress(p56, 0.0, 0.18));
    s5BgX = 0;
    s5BgY = 0;
    s5BgScale = 1.0;
    scene5BorderRadiusPx = 0;
    scene5BoxShadow = 'none';

    // 2. Scene 6: rises from bottom
    const s6Prog56 = rangeProgress(p56, 0.12, 0.98);
    const s6Ease56 = easeInOutSine(s6Prog56);
    const s6ShiftYPercent = (1 - s6Ease56) * 100;
    const s6Scale56 = 0.95 + 0.05 * s6Ease56;
    scene6Transform3D = isScene6Settled
      ? 'none'
      : `translate3d(0, ${s6ShiftYPercent.toFixed(2)}%, 0) scale(${s6Scale56.toFixed(4)})`;

    s6LayerOpacity = isScene5Settled ? 0 : clamp(rangeProgress(p56, 0.10, 0.16));
    scene6BoxShadow = isScene6Settled
      ? 'none'
      : '0 -25px 60px rgba(0, 0, 0, 0.70), 0 -4px 20px rgba(56, 189, 248, 0.45)';
    scene6PointerEvents = p56 > 0.80 ? 'auto' : 'none';
    s6ContentOpacity = 1;
    s6CueOpacity = isScene6Settled ? 1 : easeInOutSine(rangeProgress(p56, 0.80, 1.00));
  } else if (animProgress > 5.0 && animProgress <= 6.0) {
    // ═════════════════════════════════════════════════════════════════
    // TRANSITION: SCENE 6 <-> SCENE 7 (Choreographed Bottom Sheet Rise, 3600ms)
    // Same choreography as Scene 4 <-> Scene 5
    // ═════════════════════════════════════════════════════════════════
    scene2LayerOpacityFinal = 0;
    scene2Transform3D = 'none';
    scene2PointerEvents = 'none';
    s3LayerOpacity = 0;
    scene3Transform3D = 'none';
    scene3PointerEvents = 'none';
    s4LayerOpacity = 0;
    scene4Transform3D = 'none';
    scene4PointerEvents = 'none';
    s5LayerOpacity = 0;
    scene5Transform3D = 'none';
    scene5PointerEvents = 'none';

    const p67 = clamp(animProgress - 5.0, 0, 1);

    // 1. Scene 6: slides up and fades out
    const s6ShiftProg67 = easeInOutSine(rangeProgress(p67, 0.0, 0.65));
    const s6ShiftY67 = -s6ShiftProg67 * 220;
    const s6Scale67 = 1.0 - s6ShiftProg67 * 0.035;
    scene6Transform3D = isScene6Settled
      ? 'none'
      : `translate3d(0, ${s6ShiftY67.toFixed(1)}px, 0) scale(${s6Scale67.toFixed(4)})`;

    s6LayerOpacity = isScene7Settled
      ? 0
      : clamp(1 - rangeProgress(p67, 0.20, 0.60));
    scene6PointerEvents = p67 < 0.06 ? 'auto' : 'none';
    s6ContentOpacity = clamp(1 - rangeProgress(p67, 0.10, 0.48));
    s6CueOpacity = clamp(1 - rangeProgress(p67, 0.0, 0.18));
    scene6BoxShadow = 'none';

    // 2. Scene 7: rises from bottom
    const s7Prog67 = rangeProgress(p67, 0.12, 0.98);
    const s7Ease67 = easeInOutSine(s7Prog67);
    const s7ShiftYPercent = (1 - s7Ease67) * 100;
    const s7Scale67 = 0.95 + 0.05 * s7Ease67;
    scene7Transform3D = isScene7Settled
      ? 'none'
      : `translate3d(0, ${s7ShiftYPercent.toFixed(2)}%, 0) scale(${s7Scale67.toFixed(4)})`;

    s7LayerOpacity = isScene6Settled ? 0 : clamp(rangeProgress(p67, 0.10, 0.16));
    scene7BoxShadow = isScene7Settled
      ? 'none'
      : '0 -25px 60px rgba(0, 0, 0, 0.70), 0 -4px 20px rgba(56, 189, 248, 0.45)';
    scene7PointerEvents = p67 > 0.80 ? 'auto' : 'none';
    s7ContentOpacity = 1;
  } else if (animProgress >= 6.0) {
    // ═════════════════════════════════════════════════════════════════
    // SCENE 7 SETTLED
    // ═════════════════════════════════════════════════════════════════
    scene2LayerOpacityFinal = 0;
    scene2Transform3D = 'none';
    scene2PointerEvents = 'none';
    s3LayerOpacity = 0;
    scene3Transform3D = 'none';
    scene3PointerEvents = 'none';
    s4LayerOpacity = 0;
    scene4Transform3D = 'none';
    scene4PointerEvents = 'none';
    s5LayerOpacity = 0;
    scene5Transform3D = 'none';
    scene5PointerEvents = 'none';
    s6LayerOpacity = 0;
    scene6Transform3D = 'none';
    scene6PointerEvents = 'none';

    s7LayerOpacity = 1;
    s7ContentOpacity = 1;
    scene7Transform3D = 'none';
    scene7BoxShadow = 'none';
    scene7PointerEvents = 'auto';
  }



  // Scene 6: Interactive Circular Carousel (Radial Showcase) State
  const [activeSuiteIdx, setActiveSuiteIdx] = useState<number>(0);
  const [wheelRotationDeg, setWheelRotationDeg] = useState<number>(0);
  const [suiteSlideDir, setSuiteSlideDir] = useState<'next' | 'prev'>('next');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isSuiteAutoPaused, setIsSuiteAutoPaused] = useState<boolean>(false);
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([]);

  // Scene 4 State (Matrix)
  const [selectedRoleId, setSelectedRoleId] = useState<'ceo' | 'hr' | 'marketing' | 'sales' | 'accountant'>('ceo');
  const [activeDomain, setActiveDomain] = useState<number>(0);

  const handleSelectSuite = useCallback((targetIdx: number) => {
    if (targetIdx === activeSuiteIdx) return;
    const diff = (targetIdx - activeSuiteIdx + 6) % 6;
    const shortestStep = diff > 3 ? diff - 6 : diff;
    setSuiteSlideDir(shortestStep < 0 ? 'prev' : 'next');
    setWheelRotationDeg((prev) => prev + shortestStep * 60);
    setActiveSuiteIdx(targetIdx);
  }, [activeSuiteIdx]);

  const handlePrevSuite = useCallback(() => {
    setSuiteSlideDir('prev');
    setWheelRotationDeg((prev) => prev - 60);
    setActiveSuiteIdx((prev) => (prev - 1 + 6) % 6);
  }, []);

  const handleNextSuite = useCallback(() => {
    setSuiteSlideDir('next');
    setWheelRotationDeg((prev) => prev + 60);
    setActiveSuiteIdx((prev) => (prev + 1) % 6);
  }, []);

  // Scene 6: Auto-rotate security dome slowly (advances every 6 seconds, pauses on hover or modal open)
  useEffect(() => {
    if (isSuiteAutoPaused || isDetailModalOpen) return;
    const autoTimer = setInterval(() => {
      setSuiteSlideDir('next');
      setWheelRotationDeg((prev) => prev + 60);
      setActiveSuiteIdx((prev) => (prev + 1) % 6);
    }, 6000);
    return () => clearInterval(autoTimer);
  }, [isSuiteAutoPaused, isDetailModalOpen]);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndices((curr) =>
      curr.includes(idx) ? curr.filter((i) => i !== idx) : [...curr, idx]
    );
  };

  const LEVEL_LABELS: Record<number, { label: string; short: string; badgeClass: string }> = {
    0: { label: 'Chưa yêu cầu', short: 'K/Y', badgeClass: 'is-level-0' },
    1: { label: 'Cơ bản', short: 'Cơ bản', badgeClass: 'is-level-1' },
    2: { label: 'Trung cấp', short: 'Trung cấp', badgeClass: 'is-level-2' },
    3: { label: 'Nâng cao', short: 'Nâng cao', badgeClass: 'is-level-3' },
  };

  const SECURITY_STATS = [
    { label: 'Cách ly theo OrganizationId', icon: Database },
    { label: 'Lưu trữ tệp MinIO riêng biệt', icon: Server },
    { label: 'Kết nối mã hóa HTTPS / TLS', icon: Lock },
    { label: 'Xác thực JWT theo vai trò', icon: ShieldCheck },
  ];

  // 5 Enterprise Position Benchmarks matching backend Tt02Catalog.Positions (TT 02/2025)
  const ROLE_BENCHMARKS: Array<{
    id: 'ceo' | 'hr' | 'marketing' | 'sales' | 'accountant';
    label: string;
    shortLabel: string;
    requiredCount: number;
    focusSummary: string;
    domainLevels: readonly number[];
    levels: number[];
  }> = [
      {
        id: 'ceo',
        label: 'CEO / Giám đốc',
        shortLabel: 'CEO',
        requiredCount: 21,
        focusSummary: 'Thẩm định số liệu điều hành, NĐ 13/2023 và hoạch định AI.',
        domainLevels: REFERENCE_DOMAIN_LEVELS.CEO,
        levels: [2, 3, 3, 3, 3, 2, 3, 3, 3, 2, 0, 2, 0, 3, 3, 2, 2, 0, 3, 3, 3, 3, 3, 3],
      },
      {
        id: 'hr',
        label: 'Nhân sự (HR)',
        shortLabel: 'HR',
        requiredCount: 23,
        focusSummary: 'Bảo vệ dữ liệu nhân sự NĐ 13/2023 và bồi dưỡng đội ngũ.',
        domainLevels: REFERENCE_DOMAIN_LEVELS.HR,
        levels: [2, 2, 2, 3, 2, 2, 3, 3, 2, 2, 1, 1, 0, 2, 3, 3, 1, 1, 2, 2, 3, 2, 2, 1],
      },
      {
        id: 'marketing',
        label: 'Marketing',
        shortLabel: 'Marketing',
        requiredCount: 22,
        focusSummary: 'Mức Nâng cao cho nội dung đa định dạng, bản quyền và GenAI.',
        domainLevels: REFERENCE_DOMAIN_LEVELS.MARKETING,
        levels: [3, 3, 2, 3, 3, 0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1, 0, 1, 2, 3, 2, 3, 3, 3],
      },
      {
        id: 'sales',
        label: 'Sales / CRM',
        shortLabel: 'Sales/CRM',
        requiredCount: 20,
        focusSummary: 'Quản trị dữ liệu CRM, giao tiếp đa kênh và bảo mật trao đổi.',
        domainLevels: REFERENCE_DOMAIN_LEVELS.SALES_CRM,
        levels: [2, 2, 3, 3, 3, 0, 3, 3, 2, 2, 1, 0, 0, 2, 3, 1, 0, 1, 2, 2, 1, 2, 2, 1],
      },
      {
        id: 'accountant',
        label: 'Kế toán',
        shortLabel: 'Kế toán',
        requiredCount: 21,
        focusSummary: 'Kiểm chứng số liệu tài chính, thuế số và tự động bảng tính.',
        domainLevels: REFERENCE_DOMAIN_LEVELS.ACCOUNTANT,
        levels: [2, 3, 3, 2, 2, 3, 2, 1, 2, 1, 0, 0, 2, 2, 3, 1, 0, 1, 2, 2, 1, 1, 2, 2],
      },
    ];

  // 6 Competency Domains (24 competencies + 18 standardized courses)
  const DOMAINS = [
    {
      num: '01',
      code: 'D1',
      coursePrefix: 'M1',
      name: 'Khai thác dữ liệu và thông tin',
      shortName: 'Dữ liệu & Thông tin',
      tagline: 'Khung 6 Miền · Miền 1',
      desc: 'Tìm kiếm có chiến lược, đánh giá độ tin cậy nguồn tin và quản trị vòng đời dữ liệu nghiệp vụ.',
      scopeAssessment: 'Phân tích bảng tính, đọc hiểu báo cáo số liệu và kiểm chứng nguồn tin nghiệp vụ.',
      accentColor: '#2563eb',
      icon: Database,
      courses: [
        { code: 'M1-F', level: 1, title: 'Tìm kiếm & lưu trữ cơ bản' },
        { code: 'M1-I', level: 2, title: 'Chiến lược tìm kiếm & quản lý' },
        { code: 'M1-A', level: 3, title: 'Phân tích & quản trị dữ liệu' },
      ],
      competencies: [
        { code: '1.1', name: 'Duyệt, tìm kiếm và lọc dữ liệu, thông tin số', idx: 0, mandatoryCore: false },
        { code: '1.2', name: 'Đánh giá dữ liệu, thông tin và nguồn tin', idx: 1, mandatoryCore: false },
        { code: '1.3', name: 'Quản lý dữ liệu, thông tin và nội dung số', idx: 2, mandatoryCore: false },
      ],
    },
    {
      num: '02',
      code: 'D2',
      coursePrefix: 'M2',
      name: 'Giao tiếp và hợp tác trong môi trường số',
      shortName: 'Giao tiếp & Hợp tác',
      tagline: 'Khung 6 Miền · Miền 2',
      desc: 'Điều phối công việc nhóm phân tán, chia sẻ thông tin có kiểm soát và giữ chuẩn ứng xử nghề nghiệp.',
      scopeAssessment: 'Tình huống điều phối dự án trực tuyến, chia sẻ phân quyền và ứng xử số.',
      accentColor: '#0284c7',
      icon: Users,
      courses: [
        { code: 'M2-F', level: 1, title: 'Giao tiếp số cơ bản' },
        { code: 'M2-I', level: 2, title: 'Giao tiếp & cộng tác chuyên nghiệp' },
        { code: 'M2-A', level: 3, title: 'Lãnh đạo cộng tác số' },
      ],
      competencies: [
        { code: '2.1', name: 'Tương tác qua công nghệ số', idx: 3, mandatoryCore: false },
        { code: '2.2', name: 'Chia sẻ thông tin có kiểm soát', idx: 4, mandatoryCore: false },
        { code: '2.3', name: 'Thực hiện trách nhiệm công dân & dịch vụ công', idx: 5, mandatoryCore: false },
        { code: '2.4', name: 'Hợp tác và điều phối công việc nhóm', idx: 6, mandatoryCore: false },
        { code: '2.5', name: 'Thực hiện quy tắc ứng xử trên mạng', idx: 7, mandatoryCore: false },
        { code: '2.6', name: 'Quản lý danh tính số tổ chức và cá nhân', idx: 8, mandatoryCore: false },
      ],
    },
    {
      num: '03',
      code: 'D3',
      coursePrefix: 'M3',
      name: 'Sáng tạo nội dung số',
      shortName: 'Nội dung & Tự động',
      tagline: 'Khung 6 Miền · Miền 3',
      desc: 'Sản xuất tài liệu đa định dạng, tuân thủ bản quyền giấy phép và tự động hóa các tác vụ lặp lại.',
      scopeAssessment: 'Chuẩn hóa quy trình tạo lập nội dung, kiểm tra bản quyền và thiết lập luồng tự động.',
      accentColor: '#7c3aed',
      icon: Workflow,
      courses: [
        { code: 'M3-F', level: 1, title: 'Tạo lập nội dung cơ bản' },
        { code: 'M3-I', level: 2, title: 'Tạo lập nội dung chuyên nghiệp' },
        { code: 'M3-A', level: 3, title: 'Chiến lược nội dung & giải pháp số' },
      ],
      competencies: [
        { code: '3.1', name: 'Phát triển nội dung số cho công việc', idx: 9, mandatoryCore: false },
        { code: '3.2', name: 'Tích hợp và tái sử dụng tài sản nội dung', idx: 10, mandatoryCore: false },
        { code: '3.3', name: 'Thực thi bản quyền và giấy phép hợp pháp', idx: 11, mandatoryCore: false },
        { code: '3.4', name: 'Lập trình và tự động hóa quy trình lặp lại', idx: 12, mandatoryCore: false },
      ],
    },
    {
      num: '04',
      code: 'D4',
      coursePrefix: 'M4',
      name: 'An toàn & Bảo mật số',
      shortName: 'An toàn & Bảo mật',
      tagline: 'Khung 6 Miền · Miền 4 (NĐ 13)',
      desc: 'Bảo vệ thiết bị, tài khoản công việc và tuân thủ quy định bảo vệ dữ liệu cá nhân theo NĐ 13/2023.',
      scopeAssessment: 'Tình huống phòng chống lừa đảo số, phân loại dữ liệu mật và tuân thủ NĐ 13/2023.',
      accentColor: '#059669',
      icon: ShieldCheck,
      courses: [
        { code: 'M4-F', level: 1, title: 'An toàn số cơ bản' },
        { code: 'M4-I', level: 2, title: 'An toàn thông tin trong công việc' },
        { code: 'M4-A', level: 3, title: 'Quản trị an toàn & trách nhiệm số' },
      ],
      competencies: [
        { code: '4.1', name: 'Bảo vệ thiết bị và tài khoản doanh nghiệp', idx: 13, mandatoryCore: true },
        { code: '4.2', name: 'Bảo vệ dữ liệu cá nhân và quyền riêng tư', idx: 14, mandatoryCore: true },
        { code: '4.3', name: 'Bảo vệ sức khỏe và an sinh trong môi trường số', idx: 15, mandatoryCore: false },
        { code: '4.4', name: 'Bảo vệ môi trường khi vận hành công nghệ', idx: 16, mandatoryCore: false },
      ],
    },
    {
      num: '05',
      code: 'D5',
      coursePrefix: 'M5',
      name: 'Giải quyết vấn đề',
      shortName: 'Giải quyết vấn đề',
      tagline: 'Khung 6 Miền · Miền 5',
      desc: 'Chẩn đoán sự cố kỹ thuật phổ biến, lựa chọn công cụ phù hợp quy trình và chủ động bù đắp kỹ năng.',
      scopeAssessment: 'Xử lý tình huống gián đoạn công cụ số, đánh giá giải pháp và cải tiến quy trình.',
      accentColor: '#d97706',
      icon: Target,
      courses: [
        { code: 'M5-F', level: 1, title: 'Xử lý sự cố & tự học' },
        { code: 'M5-I', level: 2, title: 'Giải quyết vấn đề công việc số' },
        { code: 'M5-A', level: 3, title: 'Đổi mới & chuyển đổi quy trình' },
      ],
      competencies: [
        { code: '5.1', name: 'Chẩn đoán và xử lý sự cố kỹ thuật', idx: 17, mandatoryCore: false },
        { code: '5.2', name: 'Đánh giá và chọn giải pháp công nghệ phù hợp', idx: 18, mandatoryCore: false },
        { code: '5.3', name: 'Cải tiến quy trình nghiệp vụ bằng công cụ số', idx: 19, mandatoryCore: false },
        { code: '5.4', name: 'Nhận diện và bù đắp khoảng trống năng lực số', idx: 20, mandatoryCore: false },
      ],
    },
    {
      num: '06',
      code: 'D6',
      coursePrefix: 'M6',
      name: 'Ứng dụng trí tuệ nhân tạo',
      shortName: 'Ứng dụng AI',
      tagline: 'Khung 6 Miền · Miền 6',
      desc: 'Khai thác AI tạo sinh đúng chuẩn mực an toàn, thẩm định đầu ra và đánh giá hiệu quả công cụ AI.',
      scopeAssessment: 'Thực hành viết Prompt nghiệp vụ, kiểm chứng kết quả và phòng ngừa rò rỉ dữ liệu AI.',
      accentColor: '#db2777',
      icon: Brain,
      courses: [
        { code: 'M6-F', level: 1, title: 'Ứng dụng AI cơ bản' },
        { code: 'M6-I', level: 2, title: 'Ứng dụng AI trung cấp' },
        { code: 'M6-A', level: 3, title: 'Ứng dụng AI nâng cao' },
      ],
      competencies: [
        { code: '6.1', name: 'Hiểu biết về AI và AI tạo sinh (GenAI)', idx: 21, mandatoryCore: false },
        { code: '6.2', name: 'Sử dụng AI có đạo đức và trách nhiệm dữ liệu', idx: 22, mandatoryCore: false },
        { code: '6.3', name: 'Đánh giá chất lượng và độ phù hợp công cụ AI', idx: 23, mandatoryCore: false },
      ],
    },
  ];

  const selectedRole = ROLE_BENCHMARKS.find((r) => r.id === selectedRoleId) || ROLE_BENCHMARKS[0];
  const selectedDomain = DOMAINS[activeDomain] || DOMAINS[0];
  const selectedDomainRequiredComps = selectedDomain.competencies.filter((c) => (selectedRole.levels[c.idx] || 0) > 0);
  const selectedDomainMaxLevel = selectedDomain.competencies.reduce(
    (max, c) => Math.max(max, selectedRole.levels[c.idx] || 0),
    0
  );
  const selectedDomainTargetLevel = selectedRole.domainLevels[activeDomain] ?? selectedDomainMaxLevel;

  // 5 Core System Engines (Scene 5 3D Round Carousel)
  const PRODUCT_SCREENS = SCENE5_DEFAULT_MODULES;

  // Scene 6: 6 Enterprise Security & Governance FAQs
  const FAQS = [
    {
      q: 'Dữ liệu bài thi và nhân sự được bảo vệ thế nào trước nguy cơ rò rỉ?',
      a: 'Mỗi truy vấn dữ liệu đều gắn chặt với định danh tổ chức (OrganizationId) từ phiên đăng nhập JWT, ngăn chặn truy cập chéo giữa các doanh nghiệp.',
    },
    {
      q: 'Hệ thống phân quyền xem điểm số và báo cáo nhân sự ra sao?',
      a: 'Thiết lập 3 vai trò cốt lõi: Chủ doanh nghiệp quản trị toàn tổ chức, Quản lý theo dõi nhân sự trong phòng ban phụ trách và Nhân viên xem lộ trình cá nhân.',
    },
    {
      q: 'Trợ lý AI và tính năng chấm tự luận xử lý dữ liệu nội bộ như thế nào?',
      a: 'Hệ thống chỉ đọc dữ liệu đúng thẩm quyền của người gọi qua kết nối HTTPS và áp dụng bộ lọc đầu vào, kèm cơ chế chấm dự phòng khi mất kết nối.',
    },
    {
      q: 'Doanh nghiệp có thể tra cứu lịch sử thao tác và xác thực chứng nhận không?',
      a: 'Có. Hệ thống ghi nhận nhật ký hoạt động quản trị theo tổ chức (Audit Log) và cấp mã định danh duy nhất định dạng DT-YYYY cho từng chứng nhận.',
    },
    {
      q: 'Hệ thống hỗ trợ triển khai trên hạ tầng máy chủ nào?',
      a: 'Nền tảng đóng gói đồng bộ bằng Docker với .NET API, PostgreSQL 16 và MinIO, sẵn sàng chạy trên máy chủ nội bộ hoặc hạ tầng đám mây tại Việt Nam.',
    },
    {
      q: 'Doanh nghiệp kiểm soát quyền truy cập của nhân sự khi có thay đổi tổ chức ra sao?',
      a: 'Chủ doanh nghiệp có toàn quyền quản lý danh sách thành viên, điều chỉnh vai trò, phòng ban và thu hồi quyền truy cập tài khoản ngay lập tức.',
    },
  ];

  const s3Transforms: string[] = [];
  if (Math.abs(s3ContentDriftX) > 0.05) s3Transforms.push(`translateX(${s3ContentDriftX.toFixed(1)}px)`);
  if (Math.abs(s3ContentY) > 0.05) s3Transforms.push(`translateY(${s3ContentY.toFixed(1)}px)`);
  if (Math.abs(s3ContentScale - 1) > 0.0005) s3Transforms.push(`scale(${s3ContentScale.toFixed(4)})`);
  const s3ContentTransformValue = !isScene3Settled && s3Transforms.length > 0 ? s3Transforms.join(' ') : undefined;

  // Scene 6: 6 Enterprise Security & Governance Suites (Radial Showcase / Circular Carousel)
  const SECURITY_SUITES = [
    {
      id: 'isolation',
      name: 'Cô Lập Dữ Liệu Theo Tổ Chức',
      shortTab: 'Cô lập dữ liệu',
      title: 'Tách biệt dữ liệu doanh nghiệp',
      suiteTitle: 'Phân tách dữ liệu chặt chẽ theo định danh tổ chức',
      desc: 'Mọi bài thi, hồ sơ nhân sự và báo cáo đều gắn định danh OrganizationId, chặn truy cập chéo.',
      tag: 'PHÂN VÙNG TỔ CHỨC',
      topChip: 'ORGANIZATION SCOPE',
      score: 'ORG-ID',
      specs: ['Khóa định danh OrganizationId', 'Chặn truy vấn chéo'],
      image: '/images/landing-scenes/security/sec1-isolation.png',
      bgColor: '#EFF0F2',
      iconComponent: Database,
      faqIdx: 0,
    },
    {
      id: 'rbac',
      name: 'Phân Quyền 3 Vai Trò & Phòng Ban',
      shortTab: 'Phân quyền',
      title: 'Kiểm soát quyền truy cập',
      suiteTitle: 'Phân quyền theo vai trò và phạm vi phòng ban',
      desc: 'Phân tách rõ quyền hạn giữa Chủ doanh nghiệp, Quản lý theo phòng ban và Nhân viên.',
      tag: 'ĐÚNG THẨM QUYỀN',
      topChip: '3 VAI TRÒ CỐT LÕI',
      score: '3 VAI TRÒ',
      specs: ['Chủ doanh nghiệp · Quản lý · Nhân viên', 'Giới hạn theo phòng ban'],
      image: '/images/landing-scenes/security/sec2-rbac.png',
      bgColor: '#EFECE7',
      iconComponent: ShieldCheck,
      faqIdx: 1,
    },
    {
      id: 'ai-boundary',
      name: 'Kiểm Soát Dữ Liệu Trợ Lý AI',
      shortTab: 'Kiểm soát AI',
      title: 'Giới hạn phạm vi truy cập AI',
      suiteTitle: 'Trợ lý AI đọc dữ liệu đúng thẩm quyền người dùng',
      desc: 'Trợ lý AI và chấm tự luận chỉ đọc dữ liệu đúng quyền truy cập, kèm cơ chế dự phòng nội bộ.',
      tag: 'PHẠM VI DỮ LIỆU AI',
      topChip: 'QUYỀN TRUY CẬP HẸP',
      score: 'HTTPS / TLS',
      specs: ['Đọc dữ liệu theo quyền', 'Truyền tải mã hóa HTTPS'],
      image: '/images/landing-scenes/security/sec3-ai-control.png',
      bgColor: '#F4F0ED',
      iconComponent: Lock,
      faqIdx: 2,
    },
    {
      id: 'audit-log',
      name: 'Nhật Ký Hoạt Động & Mã Chứng Nhận',
      shortTab: 'Nhật ký số',
      title: 'Minh bạch lịch sử quản trị',
      suiteTitle: 'Nhật ký thao tác quản trị và mã chứng nhận duy nhất',
      desc: 'Ghi nhận nhật ký thao tác theo tổ chức và cấp mã định danh duy nhất cho từng chứng nhận.',
      tag: 'LƯU VẾT HỆ THỐNG',
      topChip: 'AUDIT LOG & MÃ DT',
      score: 'DT-CODE',
      specs: ['Nhật ký quản trị AuditLog', 'Mã chứng nhận DT-YYYY'],
      image: '/images/landing-scenes/security/sec4-audit-log.png',
      bgColor: '#F4F5F9',
      iconComponent: FileCheck2,
      faqIdx: 3,
    },
    {
      id: 'infrastructure',
      name: 'Hạ Tầng Container Độc Lập',
      shortTab: 'Hạ tầng',
      title: 'Kiến trúc triển khai linh hoạt',
      suiteTitle: 'Đóng gói đồng bộ .NET API, PostgreSQL 16 và MinIO',
      desc: 'Sẵn sàng triển khai trọn bộ trên máy chủ nội bộ doanh nghiệp hoặc hạ tầng đám mây tại Việt Nam.',
      tag: 'TRIỂN KHAI LINH HOẠT',
      topChip: 'DOCKER STACK',
      score: 'POSTGRES 16',
      specs: ['PostgreSQL 16 & MinIO', 'Triển khai nội bộ hoặc Cloud'],
      image: '/images/landing-scenes/security/sec5-infrastructure.png',
      bgColor: '#F4F3F1',
      iconComponent: Server,
      faqIdx: 4,
    },
    {
      id: 'sovereignty',
      name: 'Quản Trị Quyền Riêng Tư Dữ Liệu',
      shortTab: 'Quyền riêng tư',
      title: 'Kiểm soát hồ sơ nhân sự',
      suiteTitle: 'Chủ động quản lý thành viên và thu hồi quyền truy cập',
      desc: 'Doanh nghiệp chủ động quản lý danh sách nhân sự, phân quyền và thu hồi truy cập bất kỳ lúc nào.',
      tag: 'QUẢN TRỊ HỒ SƠ',
      topChip: 'QUYỀN RIÊNG TƯ',
      score: 'KIỂM SOÁT',
      specs: ['Quản lý & thu hồi truy cập', 'Kiểm soát hồ sơ nhân sự'],
      image: '/images/landing-scenes/security/sec6-privacy.png',
      bgColor: '#F0F1F5',
      iconComponent: KeyRound,
      faqIdx: 5,
    },
  ];

  const isCompactHeader = isPastHero;
  const activeNavId =
    currentScene === 1
      ? 'tong-quan'
      : currentScene === 2
        ? 'thuc-trang'
        : currentScene === 3
          ? 'quy-trinh'
          : currentScene === 4
            ? 'khung-6-mien'
            : currentScene === 5
              ? 'san-pham'
              : currentScene === 6
                ? 'bao-mat'
                : currentScene === 7
                  ? 'dang-ky'
                  : null;
  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeNavId) || null;
  const isLightSceneHeader = animProgress >= 2.95;

  return (
    <PulsePublicShell theme="light" hideHeader={true} hideFooter={true}>
      <div className="b2b-flowing-page">

        {/* ═══════════════════════════════════════════════════════════
            FLOATING TOP BAR (SIGNATURE DYNAMIC ISLAND CAPSULE)
            ═══════════════════════════════════════════════════════════ */}
        <header
          className={`motionsite-topbar ${isCompactHeader ? 'is-compact-nav' : ''} ${isLightSceneHeader ? 'is-light-scene' : ''
            }`}
        >
          {/* Left: Brand Capsule + Contextual Dropdown Pill */}
          <div className="header-left-group">
            <a
              href="#tong-quan"
              className="header-brand-pill"
              aria-label="DigiTalent AI, về phần đầu trang"
              onClick={(e) => {
                e.preventDefault();
                navigateDirect('tong-quan');
              }}
            >
              <img src={mark} alt="DigiTalent AI" />
              <span>
                DigiTalent <strong>AI</strong>
              </span>
            </a>

            <div className="header-nav-dropdown-wrap" ref={navDropdownRef}>
              <button
                type="button"
                className={`header-nav-dropdown-trigger ${isNavDropdownOpen ? 'is-open' : ''}`}
                aria-expanded={isNavDropdownOpen}
                aria-haspopup="menu"
                aria-label="Mở menu điều hướng phân khu"
                onClick={() => setIsNavDropdownOpen((prev) => !prev)}
              >
                <span className="header-dropdown-icon-badge" aria-hidden="true">
                  <Menu size={15} className="header-dropdown-leading-icon" />
                </span>
                <span className="header-dropdown-label-full">
                  {activeNavItem ? activeNavItem.label : 'Điều hướng'}
                </span>
                <span className="header-dropdown-label-short">
                  {activeNavItem ? activeNavItem.shortLabel : 'Menu'}
                </span>
                <span className="header-dropdown-chevron-box" aria-hidden="true">
                  <ChevronDown size={14} className="header-dropdown-chevron" />
                </span>
              </button>

              {isNavDropdownOpen && (
                <div className="header-nav-dropdown-menu" role="menu" aria-label="Điều hướng nhanh các mục">
                  {NAV_ITEMS.map((item) => {
                    const isActive = activeNavId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        className={`header-dropdown-item ${isActive ? 'is-active' : ''}`}
                        onClick={() => navigateDirect(item.id)}
                      >
                        <span className="header-dropdown-item-dot" aria-hidden="true" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Center: Unified Navigation Island (Visible on Hero desktop; collapses when scrolling past Hero) */}
          <nav className="header-nav-island" aria-label="Điều hướng phân khu">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`header-nav-link ${activeNavId === item.id ? 'is-active' : ''}`}
                onClick={() => navigateDirect(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: Actions Capsule */}
          <div className="header-actions-pill">
            <Link to="/login" className="header-login-btn">
              Đăng nhập
            </Link>
            <button
              type="button"
              onClick={() => navigate('/business/try')}
              className="header-cta-btn"
            >
              Dùng thử miễn phí <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════
            CINEMATIC RUNWAY: CHUYỂN CẢNH ĐIỆN ẢNH TỪ CẢNH 1 SANG CẢNH 2
            - Cuộn 1 scroll: Chữ & card Cảnh 1 dạt sang 2 bên trước
            - Phóng to zoom vào tòa nhà trung tâm video skyline
            - Chuyển sang Cảnh 2: Hiển thị video sàn làm việc rõ nét trước
            - Sau đó lớp phủ tối và các card được design lần lượt xuất hiện
            ═══════════════════════════════════════════════════════════ */}
        <div ref={runwayRef} className="cinematic-transition-runway">
          <div
            className={`cinematic-pinned-stage ${isDirectSwitching ? 'is-direct-switching' : ''} ${is3DRevolving ? 'is-3d-revolving' : 'is-flat'
              }`}
          >
            {/* ─── ORBITAL TRACK HALO (BOTTOMMOST LAYER · SCENE 2 <-> 3 & 3 <-> 4) ─── */}
            <div
              ref={orbitHaloRef}
              className="cinematic-orbit-halo"
              aria-hidden="true"
              style={{
                opacity: isOrbitActive ? 0.0001 : orbitHaloOpacity,
                visibility: is3DRevolving ? 'visible' : 'hidden',
                ...(!isOrbitActive && is3DRevolving
                  ? ({
                    '--orbit-hub-y': `${orbitHaloHubY.toFixed(1)}px`,
                    '--orbit-ring-w': `${orbitHaloRingW.toFixed(1)}px`,
                    '--orbit-ring-h': `${orbitHaloRingH.toFixed(1)}px`,
                    '--orbit-ring-tilt': `${orbitHaloRingTilt.toFixed(1)}deg`,
                  } as CSSProperties)
                  : {}),
              }}
            >
              <div className="cinematic-orbit-glow" />
              <div className="cinematic-orbit-ring-wrap">
                <div className="cinematic-orbit-ring" />
                <div className="cinematic-orbit-ring-inner" />
              </div>
            </div>

            {/* ─── SCENE 1 LAYER (HERO SKYLINE) ─── */}
            <div
              id="tong-quan"
              className="cinematic-scene1-layer"
              style={{
                opacity: scene1Opacity,
                visibility: scene1Opacity > 0.001 ? 'visible' : 'hidden',
                pointerEvents: scene1PointerEvents,
              }}
            >
              {/* Skyline Video zooming into center building */}
              <div
                className="motionsite-media-layer"
                style={{
                  transform: `scale(${scene1VideoScale})`,
                  transformOrigin: '49.2% 41.8%',
                  filter: scene1VideoBlur > 0.05 ? `blur(${scene1VideoBlur.toFixed(1)}px)` : 'none',
                }}
                aria-hidden="true"
              >
                <video
                  ref={scene1VideoRef}
                  className="motionsite-video motionsite-video-skyline"
                  src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
                  poster="/images/landing-scenes/scene1_skyline.jpg"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <div
                  className="motionsite-vignette-hero"
                  style={{
                    opacity: scene1VignetteOpacity,
                  }}
                />
              </div>

              {/* Hero Stage Content (Left slides left, Right slides right) */}
              <div className="hero-stage-content">
                {/* Left Column: Core Value Proposition */}
                <div
                  className="hero-main-column"
                  style={{
                    transform: `translateX(${heroLeftX}px)`,
                    opacity: heroLeftOpacity,
                  }}
                >
                  <div className="hero-eyebrow-pill">
                    <span className="eyebrow-dot" />
                    <span className="eyebrow-text">NỀN TẢNG NĂNG LỰC SỐ DOANH NGHIỆP</span>
                  </div>

                  <h1 className="hero-display-headline">
                    <span className="hero-headline-nowrap">Phát triển đội ngũ nhân sự</span>
                    <br />
                    sẵn sàng cho kỷ nguyên <span className="headline-highlight">chuyển đổi số</span>
                  </h1>

                  <p className="hero-lead-desc">
                    Đo lường năng lực số thực tế qua bài kiểm tra theo chức danh. Tự động chỉ ra khoảng trống kỹ năng và gán lộ trình đào tạo bù đắp cho từng nhân viên.
                  </p>

                  <div className="hero-action-buttons">
                    <button
                      type="button"
                      onClick={() => navigate('/business/try')}
                      className="hero-btn-primary"
                    >
                      Dùng thử miễn phí <ArrowRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateDirect('thuc-trang')}
                      className="hero-btn-secondary"
                    >
                      Xem giải pháp
                    </button>
                  </div>
                </div>

                {/* Right Column: 3 Floating Glass Value Pillars (Staggered exit) */}
                <div className="hero-pillars-column">
                  <div
                    className="hero-glass-pillar"
                    style={{
                      transform: `translateX(${heroRightX * (1 + pillar1Prog * 0.15)}px)`,
                      opacity: Math.max(0, 1 - pillar1Prog * 1.3),
                    }}
                  >
                    <div className="pillar-icon-box" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.2)' }}>
                      <Layers size={18} />
                    </div>
                    <div className="pillar-text">
                      <h3 className="pillar-title">Khung 6 Miền Năng Lực Số</h3>
                      <p className="pillar-desc">
                        Chuẩn hóa tiêu chuẩn năng lực số theo từng vị trí và phòng ban.
                      </p>
                    </div>
                  </div>

                  <div
                    className="hero-glass-pillar"
                    style={{
                      transform: `translateX(${heroRightX * (1 + pillar2Prog * 0.15)}px)`,
                      opacity: Math.max(0, 1 - pillar2Prog * 1.3),
                    }}
                  >
                    <div className="pillar-icon-box" style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.2)' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="pillar-text">
                      <h3 className="pillar-title">Đánh Giá Năng Lực & Skill Gap</h3>
                      <p className="pillar-desc">
                        Đo lường năng lực thực tế, tự động xác định khoảng trống kỹ năng.
                      </p>
                    </div>
                  </div>

                  <div
                    className="hero-glass-pillar"
                    style={{
                      transform: `translateX(${heroRightX * (1 + pillar3Prog * 0.15)}px)`,
                      opacity: Math.max(0, 1 - pillar3Prog * 1.3),
                    }}
                  >
                    <div className="pillar-icon-box" style={{ color: '#a78bfa', background: 'rgba(167, 139, 250, 0.2)' }}>
                      <Brain size={18} />
                    </div>
                    <div className="pillar-text">
                      <h3 className="pillar-title">18 Khóa Học Chuẩn Hóa</h3>
                      <p className="pillar-desc">
                        Tự động đề xuất lộ trình đào tạo bù đắp kỹ năng còn thiếu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom-Right "Cuộn để xem tiếp" Scroll Button */}
              <div
                className="motionsite-keepgoing"
                style={{
                  opacity: scrollCueOpacity,
                  pointerEvents: scrollCueOpacity > 0.5 ? 'auto' : 'none',
                }}
              >
                <span className="motionsite-keepgoing-text">cuộn để xem tiếp</span>
                <button
                  type="button"
                  className="motionsite-keepgoing-btn"
                  onClick={() => playScene1ToScene2()}
                  aria-label="Cuộn xuống xem giải pháp"
                >
                  <ArrowDown size={18} />
                </button>
              </div>
            </div>

            {/* ─── SCENE 2 LAYER (WORKSPACE VIDEO & SEQUENTIAL REVEAL) ─── */}
            <div
              ref={scene2LayerRef}
              id="thuc-trang"
              className={`cinematic-scene2-layer ${isScene2Settled ? 'is-settled' : ''} ${scene2BorderRadiusPx > 2 ? 'is-orbit-framed' : ''}`}
              style={{
                opacity: scene2LayerOpacityFinal,
                visibility: isOrbit23Active || scene2LayerOpacityFinal > 0.001 ? 'visible' : 'hidden',
                ...(scene2Transform3D !== 'none' ? { transform: scene2Transform3D } : {}),
                ...(is3DRevolving ? { zIndex: scene2ZIndex } : {}),
                pointerEvents: scene2PointerEvents,
              }}
            >
              <div ref={s2FrameBezelRef} className="orbit-frame-bezel" aria-hidden="true" />
              {/* 1. Ambient Workspace Video Background (reveals FIRST without dark veil) */}
              <div
                className="b2b-challenge-video-bg"
                style={{
                  opacity: scene2VideoOpacity,
                  ...(Math.abs(scene2VideoScale - 1) > 0.0005 ? { transform: `scale(${scene2VideoScale})` } : {}),
                  filter: scene2VideoBlur > 0.05 ? `blur(${scene2VideoBlur.toFixed(1)}px)` : 'none',
                }}
                aria-hidden="true"
              >
                <video
                  ref={scene2VideoRef}
                  className="b2b-challenge-video"
                  src="/videos/gemini_generated_video_bcf26ae0.mp4"
                  poster="/images/landing-scenes/scene2_workspace_bright.jpg"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>

              {/* 2. Frosted Dark Acrylic Overlay (reveals AFTER video is visible) */}
              <div
                className="b2b-challenge-video-overlay"
                style={{
                  opacity: scene2OverlayOpacity,
                }}
                aria-hidden="true"
              />

              {/* 3. Direct-on-Background Comparison Content (Né Header, Không đóng khung card) */}
              <div
                className="b2b-container b2b-relative-content b2b-scene2-container"
                style={{
                  ...(Math.abs(s2ContentDriftX) > 0.05 ? { transform: `translateX(${s2ContentDriftX}px)` } : {}),
                  opacity: s2ContentDriftOpacity,
                }}
              >
                {/* Header: reveals after pure video display */}
                <div className="b2b-section-header b2b-scene2-header light-text">
                  <span
                    className="b2b-section-badge badge-frost"
                    style={{
                      opacity: scene2BadgeOpacity,
                      transform: `translateY(${scene2BadgeY}px)`,
                    }}
                  >
                    THỰC TRẠNG &amp; GIẢI PHÁP
                  </span>
                  <h2
                    className="b2b-section-title b2b-scene2-title"
                    style={{
                      opacity: scene2TitleOpacity,
                      transform: `translateY(${scene2TitleY}px)`,
                    }}
                  >
                    Từ Đánh Giá Cảm Tính Sang Quản Trị Bằng Số Liệu
                  </h2>
                  <p
                    className="b2b-section-desc b2b-scene2-desc"
                    style={{
                      opacity: scene2DescOpacity,
                      transform: `translateY(${scene2DescY}px)`,
                    }}
                  >
                    Chuyển từ phỏng đoán chủ quan sang đo lường định lượng bằng bài kiểm tra chuẩn hóa theo từng vị trí công việc.
                  </p>
                </div>

                {/* 2 Cột hiển thị trực tiếp trên nền video (Không đóng khung card) */}
                <div className="b2b-open-comparison-grid">
                  {/* Cột 1: Rào cản phương pháp cũ */}
                  <div
                    className="b2b-open-col b2b-col-legacy"
                    style={{
                      opacity: scene2Card1Opacity,
                      transform: `translate3d(${scene2Card1X}px, ${scene2Card1Y}px, 0)`,
                    }}
                  >
                    <div className="b2b-open-col-header">
                      <span className="b2b-open-tag tag-legacy">✕ PHƯƠNG PHÁP CŨ</span>
                      <h3 className="b2b-open-col-title">4 Rào Cản Thường Gặp</h3>
                    </div>

                    <div className="b2b-open-list">
                      <div className="b2b-open-item">
                        <div className="b2b-open-item-head">
                          <span className="item-bullet bullet-legacy">✕</span>
                          <h4 className="item-title">1. Đánh giá cảm tính & thiếu chuẩn</h4>
                        </div>
                        <p className="item-desc">
                          Không có thước đo định lượng, kết quả phụ thuộc vào nhận định chủ quan của từng quản lý.
                        </p>
                      </div>

                      <div className="b2b-open-item">
                        <div className="b2b-open-item-head">
                          <span className="item-bullet bullet-legacy">✕</span>
                          <h4 className="item-title">2. Thiếu bản đồ năng lực số</h4>
                        </div>
                        <p className="item-desc">
                          Khó nhìn thấy bức tranh kỹ năng tổng thể và mức độ chênh lệch giữa các phòng ban.
                        </p>
                      </div>

                      <div className="b2b-open-item">
                        <div className="b2b-open-item-head">
                          <span className="item-bullet bullet-legacy">✕</span>
                          <h4 className="item-title">3. Đào tạo đại trà & lãng phí</h4>
                        </div>
                        <p className="item-desc">
                          Toàn bộ nhân sự học chung khóa học chung chung, không giải quyết đúng khoảng trống kỹ năng.
                        </p>
                      </div>

                      <div className="b2b-open-item">
                        <div className="b2b-open-item-head">
                          <span className="item-bullet bullet-legacy">✕</span>
                          <h4 className="item-title">4. Quyết định nhân sự thiếu số liệu</h4>
                        </div>
                        <p className="item-desc">
                          Giao việc, quy hoạch hay bổ nhiệm kế cận chủ yếu dựa trên cảm nhận hoặc thâm niên.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vách ngăn mảnh dọc tinh tế giữa 2 cột */}
                  <div
                    className="b2b-open-divider"
                    style={{
                      opacity: Math.min(scene2Card1Opacity, scene2Card2Opacity),
                    }}
                    aria-hidden="true"
                  />

                  {/* Cột 2: Giải pháp DigiTalent AI */}
                  <div
                    className="b2b-open-col b2b-col-digitalent"
                    style={{
                      opacity: scene2Card2Opacity,
                      transform: `translate3d(${scene2Card2X}px, ${scene2Card2Y}px, 0)`,
                    }}
                  >
                    <div className="b2b-open-col-header">
                      <span className="b2b-open-tag tag-digitalent">✓ MÔ HÌNH CHUẨN HÓA</span>
                      <h3 className="b2b-open-col-title">4 Lợi Thế Của DigiTalent AI</h3>
                    </div>

                    <div className="b2b-open-list">
                      <div className="b2b-open-item">
                        <div className="b2b-open-item-head">
                          <span className="item-bullet bullet-digitalent">✓</span>
                          <h4 className="item-title">1. Đánh giá chuẩn hóa theo vị trí</h4>
                        </div>
                        <p className="item-desc">
                          Đo lường năng lực số qua các bài đánh giá bám sát vai trò và tình huống thực tế.
                        </p>
                      </div>

                      <div className="b2b-open-item">
                        <div className="b2b-open-item-head">
                          <span className="item-bullet bullet-digitalent">✓</span>
                          <h4 className="item-title">2. Bản đồ nhiệt Skill Gap tức thì</h4>
                        </div>
                        <p className="item-desc">
                          Tổng hợp tự động thành hồ sơ năng lực và bản đồ nhiệt phát hiện chính xác lỗ hổng kỹ năng.
                        </p>
                      </div>

                      <div className="b2b-open-item">
                        <div className="b2b-open-item-head">
                          <span className="item-bullet bullet-digitalent">✓</span>
                          <h4 className="item-title">3. Lộ trình đào tạo cá nhân hóa</h4>
                        </div>
                        <p className="item-desc">
                          Tự động gán các bài học bù đắp từ 18 khóa học chuẩn hóa, giảm chi phí đào tạo dư thừa.
                        </p>
                      </div>

                      <div className="b2b-open-item">
                        <div className="b2b-open-item-head">
                          <span className="item-bullet bullet-digitalent">✓</span>
                          <h4 className="item-title">4. Quyết định nhân sự dựa trên dữ liệu</h4>
                        </div>
                        <p className="item-desc">
                          Báo cáo phân tích định lượng đa chiều hỗ trợ Ban Lãnh đạo ra quyết định chuẩn xác.
                        </p>
                      </div>
                    </div>

                    {/* Quick Impact Highlight Strip */}
                    <div
                      className="b2b-open-impact-strip"
                      style={{
                        opacity: scene2PillsOpacity,
                        transform: `scale(${scene2PillsScale})`,
                        transformOrigin: 'left center',
                      }}
                    >
                      <span className="impact-pill">✓ Đo lường định lượng</span>
                      <span className="impact-pill">✓ Bóc tách Skill Gap</span>
                      <span className="impact-pill">✓ Tiết kiệm 60% ngân sách</span>
                    </div>
                  </div>
                </div>
                {/* Mobile-only bottom button to shift cleanly from Scene 2 to Scene 3 (#quy-trinh) */}
                <button
                  type="button"
                  className="scene2-mobile-next-btn"
                  onClick={() => playScene2ToScene3()}
                >
                  <span>Xem quy trình 6 bước</span>
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Bottom-Right "Cuộn để xem tiếp" Scroll Button (Cảnh 2) */}
              <div
                className="motionsite-keepgoing"
                style={{
                  opacity: Math.min(scene2CueOpacity, s2ContentDriftOpacity),
                  transform: `translateX(${s2ContentDriftX}px)`,
                  pointerEvents: scene2CueOpacity > 0.5 && s2ContentDriftOpacity > 0.5 ? 'auto' : 'none',
                }}
                onClick={() => playScene2ToScene3()}
              >
                <span className="motionsite-keepgoing-text">cuộn để xem tiếp</span>
                <button
                  type="button"
                  className="motionsite-keepgoing-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    playScene2ToScene3();
                  }}
                  aria-label="Cuộn xuống xem quy trình 6 bước"
                >
                  <ArrowDown size={18} />
                </button>
              </div>
            </div>

            {/* ─── SCENE 3 LAYER (BOARDROOM IMAGE & 6-STEP AUTOMATED STEPPER) ─── */}
            <div
              ref={scene3LayerRef}
              id="quy-trinh"
              className={`cinematic-scene3-layer ${isScene3Settled ? 'is-settled' : ''} ${scene3BorderRadiusPx > 2 ? 'is-orbit-framed' : ''}`}
              style={{
                opacity: s3LayerOpacity,
                visibility: isOrbitActive || s3LayerOpacity > 0.001 ? 'visible' : 'hidden',
                ...(scene3Transform3D !== 'none' ? { transform: scene3Transform3D } : {}),
                ...(is3DRevolving ? { zIndex: scene3ZIndex } : {}),
                pointerEvents: scene3PointerEvents,
              }}
            >
              <div ref={s3FrameBezelRef} className="orbit-frame-bezel" aria-hidden="true" />
              {/* 1. High-Tech Executive Boardroom Background Image */}
              <div
                className="scene3-media-layer"
                style={{
                  ...(!isScene3Settled && Math.abs(s3BgScale - 1) > 0.0005
                    ? { transform: `scale(${s3BgScale.toFixed(4)})` }
                    : {}),
                  ...(!isScene3Settled && s3BgBlur > 0.05
                    ? { filter: `blur(${s3BgBlur.toFixed(1)}px)` }
                    : {}),
                }}
                aria-hidden="true"
              >
                <img
                  src="/images/landing-scenes/scene3_process_bg.png"
                  alt="Không gian điều hành chiến lược DigiTalent"
                  className="scene3-bg-image"
                />
                <div className="scene3-bg-overlay" />
              </div>

              {/* 2. Structured Process Content Wrap (Clears Floating Island) */}
              <div
                className="scene3-content-wrap"
                style={{
                  ...(s3ContentTransformValue ? { transform: s3ContentTransformValue } : {}),
                  opacity: s3ContentDriftOpacity,
                }}
              >
                {/* Header né Floating Island */}
                <div
                  className="scene3-header"
                  style={{
                    opacity: s3HeaderOpacity,
                    ...(Math.abs(s3HeaderY) > 0.05 ? { transform: `translateY(${s3HeaderY}px)` } : {}),
                  }}
                >
                  <span className="scene3-badge">QUY TRÌNH VẬN HÀNH 6 BƯỚC</span>
                  <h2 className="scene3-title">Quy Trình Đánh Giá &amp; Đào Tạo Trong 6 Bước</h2>
                  <p className="scene3-desc">
                    Từ khởi tạo tài khoản doanh nghiệp, tổ chức bài đánh giá trực tuyến đến phân tích thiếu hụt và cấp chứng nhận đạt chuẩn.
                  </p>
                </div>

                {/* 6 Architectural Frosted Glass Image Slabs */}
                <Scene3ProcessShowcase
                  stageOpacity={s3StageOpacity}
                  stageY={s3StageY}
                  onNextScene={handlePlayScene3ToScene4}
                  activeStepRef={scene3ActiveStepRef}
                  zoomedStepRef={scene3ZoomedStepRef}
                  stepApiRef={scene3StepApiRef}
                />
              </div>

              {/* Bottom-Right "Cuộn để xem tiếp" Scroll Button (Cảnh 3) */}
              <div
                className="motionsite-keepgoing"
                style={{
                  opacity: Math.min(s3CueOpacity, s3ContentDriftOpacity),
                  ...(s3ContentTransformValue ? { transform: s3ContentTransformValue } : {}),
                  pointerEvents: s3CueOpacity > 0.5 && s3ContentDriftOpacity > 0.5 ? 'auto' : 'none',
                }}
                onClick={() => playScene3ToScene4()}
              >
                <span className="motionsite-keepgoing-text">cuộn để xem tiếp</span>
                <button
                  type="button"
                  className="motionsite-keepgoing-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    playScene3ToScene4();
                  }}
                  aria-label="Cuộn xuống xem khung 6 miền năng lực"
                >
                  <ArrowDown size={18} />
                </button>
              </div>
            </div>

            {/* ─── SCENE 4 LAYER (DAYLIGHT BOARDROOM & 6-DOMAIN REFERENCE WHITEBOARD · TT 02/2025) ─── */}
            <div
              ref={scene4LayerRef}
              id="khung-6-mien"
              className={`cinematic-scene4-layer ${isScene4Settled ? 'is-settled' : ''} ${scene4BorderRadiusPx > 2 ? 'is-orbit-framed' : ''}`}
              style={{
                opacity: s4LayerOpacity,
                visibility: isOrbit34Active || s4LayerOpacity > 0.001 ? 'visible' : 'hidden',
                ...(scene4Transform3D !== 'none' ? { transform: scene4Transform3D } : {}),
                ...(is3DRevolving ? { zIndex: scene4ZIndex } : {}),
                pointerEvents: scene4PointerEvents,
              }}
            >
              <div ref={s4FrameBezelRef} className="orbit-frame-bezel" aria-hidden="true" />
              {/* 1. Daylight Executive Council Boardroom Architecture */}
              <div
                className="scene4-media-layer"
                style={{
                  ...(!isScene4Settled && Math.abs(s4BgScale - 1) > 0.0005
                    ? { transform: `scale(${s4BgScale.toFixed(4)})` }
                    : {}),
                  ...(!isScene4Settled && s4BgBlur > 0.05
                    ? { filter: `blur(${s4BgBlur.toFixed(1)}px)` }
                    : {}),
                }}
                aria-hidden="true"
              >
                <img
                  src="/images/landing-scenes/scene4_council_boardroom.jpg"
                  alt="Không gian phòng hội đồng điều hành ánh sáng tự nhiên với màn hình LED trình bày khung 6 miền năng lực số DigiTalent"
                  className="scene4-bg-image"
                />
                <div className="scene4-bg-overlay" />
              </div>

              {/* 2. Scene 4 Foreground Daylight Content */}
              <div
                className="scene4-content-wrap"
                style={{
                  opacity: s4ContentOpacity,
                  ...(!isScene4Settled && (Math.abs(s4ContentY) > 0.05 || Math.abs(s4ContentScale - 1) > 0.0005)
                    ? { transform: `translateY(${s4ContentY.toFixed(1)}px) scale(${s4ContentScale.toFixed(4)})` }
                    : {}),
                }}
              >
                {/* Header */}
                <div
                  className="scene4-header"
                  style={{
                    opacity: s4HeaderOpacity,
                    ...(!isScene4Settled && Math.abs(s4HeaderY) > 0.05
                      ? { transform: `translateY(${s4HeaderY.toFixed(1)}px)` }
                      : {}),
                  }}
                >
                  <span className="scene4-badge">KHUNG NĂNG LỰC SỐ DOANH NGHIỆP · 6 MIỀN</span>
                  <h2 className="scene4-title">Định Chuẩn 6 Miền Năng Lực Theo Chức Danh</h2>
                  <p className="scene4-desc">
                    24 năng lực thành phần thuộc 6 miền kỹ năng, chia 3 ngưỡng Cơ bản, Trung cấp và Nâng cao cho từng vị trí.
                  </p>
                </div>

                {/* Conference Room Interactive Glass Whiteboard */}
                <div
                  className="scene4-whiteboard-frame"
                  style={{
                    opacity: s4StageOpacity,
                    ...(!isScene4Settled && Math.abs(s4StageY) > 0.05
                      ? { transform: `translateY(${s4StageY.toFixed(1)}px)` }
                      : {}),
                  }}
                >
                  {/* Board Top Strip: Selected Position Summary & Level Legend */}
                  <div
                    className="scene4-board-topbar"
                    style={{
                      opacity: s4ToolbarOpacity,
                      ...(!isScene4Settled && Math.abs(s4ToolbarY) > 0.05
                        ? { transform: `translateY(${s4ToolbarY.toFixed(1)}px)` }
                        : {}),
                    }}
                  >
                    <div className="scene4-board-summary">
                      <span className="scene4-board-label">Vị trí đang xem:</span>
                      <span className="scene4-board-role-pill">{selectedRole.label}</span>
                      <span className="scene4-role-count">
                        <strong>{selectedRole.requiredCount}</strong>/24 năng lực áp dụng
                      </span>
                      <span className="scene4-role-focus" title={selectedRole.focusSummary}>
                        {selectedRole.focusSummary}
                      </span>
                    </div>

                    <div className="scene4-board-legend" aria-label="Chú giải mức chuẩn">
                      <span className="scene4-legend-chip is-level-1">Cơ bản</span>
                      <span className="scene4-legend-chip is-level-2">Trung cấp</span>
                      <span className="scene4-legend-chip is-level-3">Nâng cao</span>
                    </div>
                  </div>

                  {/* Whiteboard Split Body: Left 6x5 Matrix + Right Drill-Down */}
                  <div className="scene4-whiteboard-grid">
                    {/* Left Pane: 6 Domains x 5 Roles Matrix */}
                    <div className="scene4-matrix-pane">
                      {/* Desktop Interactive Reference Table */}
                      <div className="scene4-matrix-table-wrap">
                        <table
                          className="scene4-ref-table"
                          aria-label="Bảng tham chiếu mức năng lực 6 miền cho 5 vị trí doanh nghiệp"
                        >
                          <thead>
                            <tr>
                              <th scope="col" className="col-domain">
                                MIỀN NĂNG LỰC
                              </th>
                              {ROLE_BENCHMARKS.map((role) => {
                                const isColActive = role.id === selectedRoleId;
                                return (
                                  <th
                                    key={role.id}
                                    scope="col"
                                    className={`col-role ${isColActive ? 'is-selected' : ''}`}
                                  >
                                    <button
                                      type="button"
                                      className={`scene4-th-role-btn ${isColActive ? 'is-selected' : ''}`}
                                      aria-pressed={isColActive}
                                      onClick={() => setSelectedRoleId(role.id)}
                                    >
                                      {role.shortLabel}
                                    </button>
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {DOMAINS.map((dom, domIdx) => {
                              const isRowActive = activeDomain === domIdx;
                              return (
                                <tr
                                  key={dom.code}
                                  className={`scene4-matrix-row ${isRowActive ? 'is-active' : ''}`}
                                >
                                  <td className="cell-domain">
                                    <button
                                      type="button"
                                      className={`scene4-row-domain-btn ${isRowActive ? 'is-active' : ''}`}
                                      aria-pressed={isRowActive}
                                      onClick={() => setActiveDomain(domIdx)}
                                    >
                                      <span className="scene4-row-num">{dom.num}</span>
                                      <span className="scene4-row-name">{dom.name}</span>
                                    </button>
                                  </td>
                                  {ROLE_BENCHMARKS.map((role) => {
                                    const lvl = role.domainLevels[domIdx] ?? 0;
                                    const lvlMeta = LEVEL_LABELS[lvl] || LEVEL_LABELS[0];
                                    const isColActive = role.id === selectedRoleId;
                                    const isCellFocused = isRowActive && isColActive;
                                    return (
                                      <td
                                        key={role.id}
                                        className={`cell-level ${isColActive ? 'is-col-selected' : ''} ${isCellFocused ? 'is-focused' : ''}`}
                                      >
                                        <button
                                          type="button"
                                          className={`scene4-matrix-cell-btn ${lvlMeta.badgeClass} ${isCellFocused ? 'is-focused' : ''}`}
                                          aria-pressed={isCellFocused}
                                          aria-label={`${dom.name}, ${role.label}: ${lvlMeta.short}`}
                                          onClick={() => {
                                            setSelectedRoleId(role.id);
                                            setActiveDomain(domIdx);
                                          }}
                                        >
                                          {lvlMeta.short}
                                        </button>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Compact Matrix: 5 Role Pills + 6 Domain Rows */}
                      <div className="scene4-mobile-matrix">
                        <div className="scene4-mobile-roles" role="tablist" aria-label="Chọn vị trí chức danh">
                          {ROLE_BENCHMARKS.map((role) => {
                            const isSelected = role.id === selectedRoleId;
                            return (
                              <button
                                key={role.id}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                className={`scene4-role-pill ${isSelected ? 'is-active' : ''}`}
                                onClick={() => setSelectedRoleId(role.id)}
                              >
                                {role.shortLabel}
                              </button>
                            );
                          })}
                        </div>
                        <div className="scene4-mobile-domains" role="tablist" aria-label="Chọn 1 trong 6 miền năng lực">
                          {DOMAINS.map((dom, domIdx) => {
                            const isRowActive = activeDomain === domIdx;
                            const lvl = selectedRole.domainLevels[domIdx] ?? 0;
                            const lvlMeta = LEVEL_LABELS[lvl] || LEVEL_LABELS[0];
                            return (
                              <button
                                key={dom.num}
                                type="button"
                                role="tab"
                                aria-selected={isRowActive}
                                className={`scene4-mobile-domain-row ${isRowActive ? 'is-active' : ''}`}
                                onClick={() => setActiveDomain(domIdx)}
                              >
                                <span className="scene4-row-num">{dom.num}</span>
                                <span className="scene4-row-name">{dom.name}</span>
                                <span className={`scene4-matrix-cell-pill ${lvlMeta.badgeClass}`}>
                                  {lvlMeta.short}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Clean Vertical Partition */}
                    <div className="scene4-partition" aria-hidden="true" />

                    {/* Right Pane: Active Domain Competencies + Standardized Courses */}
                    {(() => {
                      const ActiveIcon = selectedDomain.icon;
                      const maxLevelMeta = LEVEL_LABELS[selectedDomainTargetLevel] || LEVEL_LABELS[0];
                      return (
                        <div
                          key={`${selectedRole.id}-${selectedDomain.code}`}
                          className="scene4-detail-pane"
                          role="tabpanel"
                          aria-label={`${selectedDomain.name} cho ${selectedRole.label}`}
                          style={{ '--dom-accent': selectedDomain.accentColor } as CSSProperties}
                        >
                          {/* Domain Header Row */}
                          <div className="scene4-detail-head">
                            <div className="scene4-detail-title-group">
                              <div className="scene4-detail-tags">
                                <span className="scene4-detail-tag">
                                  <ActiveIcon size={13} aria-hidden="true" />
                                  <span>{selectedDomain.tagline}</span>
                                </span>
                                <span className="scene4-detail-role-tag">
                                  Chuẩn {selectedRole.shortLabel}: {selectedDomainRequiredComps.length}/{selectedDomain.competencies.length} năng lực
                                </span>
                              </div>
                              <h3 className="scene4-detail-title">{selectedDomain.name}</h3>
                              <p className="scene4-detail-desc">{selectedDomain.desc}</p>
                            </div>

                            <div className="scene4-detail-peak">
                              <span className="scene4-peak-label">Ngưỡng miền</span>
                              <span className={`scene4-level-badge ${maxLevelMeta.badgeClass}`}>
                                {maxLevelMeta.short}
                              </span>
                            </div>
                          </div>

                          {/* 2-Column Sub-Competencies Cards */}
                          <div className="scene4-comp-grid">
                            {selectedDomain.competencies.map((comp) => {
                              const lvl = selectedRole.levels[comp.idx] ?? 0;
                              const lvlMeta = LEVEL_LABELS[lvl] || LEVEL_LABELS[0];
                              return (
                                <div
                                  key={comp.code}
                                  className={`scene4-comp-card ${lvl === 0 ? 'is-unrequired' : ''} ${comp.mandatoryCore ? 'is-mandatory' : ''}`}
                                >
                                  <div className="scene4-comp-top">
                                    <span className="scene4-comp-code">{comp.code}</span>
                                    {comp.mandatoryCore && (
                                      <span className="scene4-comp-nd13" title="Tiêu chuẩn an toàn bắt buộc theo NĐ 13/2023">
                                        <Lock size={10} aria-hidden="true" />
                                        <span>NĐ 13</span>
                                      </span>
                                    )}
                                    <span className={`scene4-comp-lvl ${lvlMeta.badgeClass}`}>
                                      {lvlMeta.short}
                                    </span>
                                  </div>
                                  <p className="scene4-comp-name">{comp.name}</p>
                                </div>
                              );
                            })}
                          </div>

                          {/* Assessment Scope & 3 Standardized Courses List */}
                          <div className="scene4-detail-foot">
                            <div className="scene4-assess-line">
                              <span className="scene4-assess-label">Phương thức đánh giá:</span>
                              <span className="scene4-assess-text">{selectedDomain.scopeAssessment}</span>
                            </div>
                            <div className="scene4-courses-row">
                              {selectedDomain.courses.map((course) => {
                                const isTarget = selectedDomainTargetLevel > 0 && course.level === selectedDomainTargetLevel;
                                const isCovered = selectedDomainTargetLevel > 0 && course.level < selectedDomainTargetLevel;
                                return (
                                  <div
                                    key={course.code}
                                    className={`scene4-course-chip ${isTarget ? 'is-target' : isCovered ? 'is-covered' : ''}`}
                                  >
                                    <span className="scene4-course-code">{course.code}</span>
                                    <span className="scene4-course-title">{course.title}</span>
                                    {isTarget && <span className="scene4-course-target-pill">Mục tiêu</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Mobile-only bottom button to shift cleanly from Scene 4 to Scene 5 (#san-pham) */}
                <button
                  type="button"
                  className="scene4-mobile-next-btn"
                  onClick={() => playScene4ToScene5()}
                >
                  <span>Xem giao diện hệ thống thật</span>
                  <span>Khám phá 4 phân hệ cốt lõi</span>
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Bottom-Right "Cuộn để xem tiếp" Scroll Button (Cảnh 4 -> Cảnh 5) */}
              <div
                className="motionsite-keepgoing"
                style={{
                  opacity: Math.min(s4CueOpacity, s4ContentOpacity),
                  ...(!isScene4Settled && Math.abs(s4ContentY) > 0.05
                    ? { transform: `translateY(${s4ContentY.toFixed(1)}px)` }
                    : {}),
                  pointerEvents: s4CueOpacity > 0.5 && s4ContentOpacity > 0.5 && scene4PointerEvents === 'auto' ? 'auto' : 'none',
                }}
                onClick={() => playScene4ToScene5()}
              >
                <span className="motionsite-keepgoing-text">cuộn để xem tiếp</span>
                <button
                  type="button"
                  className="motionsite-keepgoing-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    playScene4ToScene5();
                  }}
                  aria-label="Cuộn xuống xem giao diện sản phẩm"
                >
                  <ArrowDown size={18} />
                </button>
              </div>
            </div>

            {/* ─── SCENE 5 LAYER (SYSTEM ARCHITECTURE: 5 CORE ENGINES) ─── */}
            <div
              ref={scene5LayerRef}
              id="san-pham"
              className={`cinematic-scene5-layer ${isScene5Settled ? 'is-settled' : ''}`}
              style={{
                opacity: s5LayerOpacity,
                visibility: (animProgress > 3.0005 && animProgress < 4.9995) || s5LayerOpacity > 0.001 ? 'visible' : 'hidden',
                display: (animProgress > 3.0005 && animProgress < 4.9995) || s5LayerOpacity > 0.001 ? undefined : 'none',
                pointerEvents: scene5PointerEvents,
                ...(scene5Transform3D !== 'none' ? { transform: scene5Transform3D } : {}),
                ...(scene5BorderRadiusPx > 0
                  ? {
                    borderTopLeftRadius: `${scene5BorderRadiusPx}px`,
                    borderTopRightRadius: `${scene5BorderRadiusPx}px`,
                  }
                  : {}),
                ...(scene5BoxShadow !== 'none' ? { boxShadow: scene5BoxShadow } : {}),
              }}
            >
              {/* 1. Architectural Console Environment Backdrop (Futuristic Minimalist Stage) */}
              <div
                className="scene5-media-layer"
                style={{
                  ...(!isScene5Settled &&
                    (Math.abs(s5BgX) > 0.05 || Math.abs(s5BgY) > 0.05 || Math.abs(s5BgScale - 1) > 0.0005)
                    ? {
                      transform: `translate3d(${s5BgX.toFixed(1)}px, ${s5BgY.toFixed(1)}px, 0) scale(${s5BgScale.toFixed(4)})`,
                    }
                    : {}),
                  ...(!isScene5Settled && s5BgBlur > 0.05 ? { filter: `blur(${s5BgBlur.toFixed(1)}px)` } : {}),
                }}
                aria-hidden="true"
              >
                <img
                  src="/images/landing-scenes/scene5_stage.png"
                  alt="Sân khấu tương lai tối giản sang trọng của DigiTalent AI"
                  className="scene5-bg-image"
                />
                <div className="scene5-bg-overlay" />
              </div>

              {/* 2. 3D Cylindrical Console Foreground */}
              <div
                className="scene5-content-wrap"
                style={{
                  opacity: s5ContentOpacity,
                  ...(!isScene5Settled && Math.abs(s5ContentX) > 0.05
                    ? { transform: `translateX(${s5ContentX.toFixed(1)}px)` }
                    : {}),
                }}
              >
                <div
                  className="scene5-header"
                  style={{
                    opacity: s5HeaderOpacity,
                    ...(!isScene5Settled && Math.abs(s5HeaderY) > 0.05
                      ? { transform: `translateY(${s5HeaderY.toFixed(1)}px)` }
                      : {}),
                  }}
                >
                  <button
                    type="button"
                    className="scene5-badge-tab"
                    onClick={() => setIsArchModalOpen(true)}
                    title="Xem chi tiết sơ đồ kiến trúc nền tảng hệ thống"
                    aria-label="Xem sơ đồ kiến trúc nền tảng hệ thống"
                  >
                    <span className="scene5-badge-tab-dot" aria-hidden="true" />
                    <Layers size={13} className="scene5-badge-tab-icon" aria-hidden="true" />
                    <span className="scene5-badge-tab-text">KIẾN TRÚC NỀN TẢNG HỆ THỐNG</span>
                    <span className="scene5-badge-tab-action">
                      <span>Chi tiết</span>
                      <ArrowUpRight size={11} aria-hidden="true" />
                    </span>
                  </button>
                  <h2 className="scene5-title">5 Phân Hệ Trọng Tâm Của DigiTalent AI</h2>
                  <p className="scene5-desc">
                    Khảo thí thích ứng, bóc tách khoảng trống kỹ năng, đào tạo vi mô và kiểm định cấp chứng nhận số theo{' '}
                    <span className="scene5-desc-nobreak">chuẩn năng lực doanh nghiệp.</span>
                  </p>
                </div>

                {/* 3D Round Carousel Stage */}
                <div
                  className="scene5-carousel-holder"
                  style={{
                    width: '100%',
                    opacity: s5StageOpacity,
                    ...(!isScene5Settled && Math.abs(s5StageY) > 0.05
                      ? { transform: `translateY(${s5StageY.toFixed(1)}px)` }
                      : {}),
                  }}
                >
                  <Scene5RoundCarousel
                    modules={PRODUCT_SCREENS}
                    activeIndex={activeProductIdx}
                    onActiveIndexChange={(idx) => setActiveProductIdx(idx)}
                  />
                </div>

                {/* Mobile-only next button from Scene 5 -> Scene 6 (Bảo mật) */}
                <button
                  type="button"
                  className="scene5-mobile-next-btn"
                  onClick={() => playScene5ToScene6()}
                >
                  <span>Bảo mật dữ liệu &amp; FAQ</span>
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Bottom-Right Keep Going Cue (Scene 5 -> Scene 6) */}
              <div
                className="motionsite-keepgoing"
                style={{
                  opacity: Math.min(s5CueOpacity, s5ContentOpacity),
                  ...(!isScene5Settled && Math.abs(s5ContentX) > 0.05
                    ? { transform: `translateX(${s5ContentX.toFixed(1)}px)` }
                    : {}),
                  pointerEvents: s5CueOpacity > 0.5 && scene5PointerEvents === 'auto' ? 'auto' : 'none',
                }}
                onClick={() => playScene5ToScene6()}
              >
                <span className="motionsite-keepgoing-text">cuộn để xem tiếp</span>
                <button
                  type="button"
                  className="motionsite-keepgoing-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    playScene5ToScene6();
                  }}
                  aria-label="Cuộn xuống xem chính sách bảo mật"
                >
                  <ArrowDown size={18} />
                </button>
              </div>
            </div>

            {/* ─── SCENE 6 LAYER (DATA GOVERNANCE & SECURITY) ─── */}
            <div
              ref={scene6LayerRef}
              id="bao-mat"
              className={`cinematic-scene6-layer ${isScene6Settled ? 'is-settled' : ''}`}
              style={{
                opacity: s6LayerOpacity,
                visibility: (animProgress > 4.0005 && animProgress < 5.9995) || s6LayerOpacity > 0.001 ? 'visible' : 'hidden',
                display: (animProgress > 4.0005 && animProgress < 5.9995) || s6LayerOpacity > 0.001 ? undefined : 'none',
                pointerEvents: scene6PointerEvents,
                ...(scene6Transform3D !== 'none' ? { transform: scene6Transform3D } : {}),
                ...(scene6BoxShadow !== 'none' ? { boxShadow: scene6BoxShadow } : {}),
              }}
            >
              <section className="b2b-section b2b-trust-section">
          {/* Clean White Backdrop */}
          <div className="scene6-media-layer" aria-hidden="true">
            <div className="scene6-bg-overlay" />
          </div>

          <div className="b2b-container scene6-content-wrap" style={{ opacity: s6ContentOpacity }}>
            {/* Header: Micro-Copy súc tích */}
            <div className="b2b-section-header scene6-header">
              <span className="b2b-section-badge">AN TOÀN THÔNG TIN &amp; VẬN HÀNH DỮ LIỆU</span>
              <h2 className="b2b-section-title">Kiến Trúc An Toàn &amp; Kiểm Soát Dữ Liệu</h2>
              <p className="b2b-section-desc">
                Phân tách dữ liệu theo tổ chức, phân quyền 3 vai trò và kiểm soát phạm vi truy cập.
              </p>
            </div>

            {/* Hidden semantic headings for the 6 pillars to ensure full screen-reader and test compliance */}
            <div className="sr-only">
              <h3>Cô lập vùng dữ liệu</h3>
              <h3>Phân cấp quản trị theo cơ cấu</h3>
              <h3>Ranh giới xử lý AI khép kín</h3>
              <h3>Nhật ký thao tác và chứng nhận số</h3>
              <h3>Hạ tầng điện toán và dự phòng kép</h3>
              <h3>Chủ quyền dữ liệu và quyền riêng tư</h3>
            </div>

            {/* ================= 1. KHỐI MÁI VÒM NGƯỢC RỘNG LỚN (INVERTED DOME) ================= */}
            <div
              className="scene6-inverted-arena"
              onMouseEnter={() => setIsSuiteAutoPaused(true)}
              onMouseLeave={() => setIsSuiteAutoPaused(false)}
            >
              {/* Mái vòm xoay phân vùng dữ liệu (Physical Rotating Dome Turntable) */}
              <div className="scene6-inverted-dome" role="region" aria-label="Mái vòm xoay phân vùng dữ liệu">
                <Scene6RotatingWheel
                  suites={SECURITY_SUITES}
                  activeSuiteIdx={activeSuiteIdx}
                  wheelRotationDeg={wheelRotationDeg}
                  onSelectSuite={handleSelectSuite}
                  onPrevSuite={handlePrevSuite}
                  onNextSuite={handleNextSuite}
                  onOpenModal={() => setIsDetailModalOpen(true)}
                />
              </div>

              {/* ================= 2. 3-COLUMN CONSOLE ROW (LEFT FLANK + DOME CAP + RIGHT FLANK) ================= */}
              <div className="scene6-console-row">
                {/* Left Flanking Card: Hạ Tầng Vận Hành */}
                <div className="scene6-flank-card is-left" role="region" aria-label="Thông số hạ tầng vận hành">
                  <div className="scene6-flank-header">
                    <div className="scene6-flank-icon-box" aria-hidden="true">
                      <Server size={18} />
                    </div>
                    <div className="scene6-flank-titles">
                      <h4 className="scene6-flank-title">Hạ tầng vận hành</h4>
                      <p className="scene6-flank-subtitle">Kiến trúc .NET, PostgreSQL &amp; MinIO</p>
                    </div>
                  </div>

                  <div className="scene6-flank-chips-grid" role="list" aria-label="Thông số kỹ thuật vận hành">
                    {SECURITY_STATS.map((stat) => {
                      const IconComponent = stat.icon;
                      return (
                        <div key={stat.label} className="scene6-stat-chip" role="listitem">
                          <span className="scene6-stat-icon" aria-hidden="true">
                            <IconComponent size={13} />
                          </span>
                          <span className="scene6-stat-label">{stat.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="scene6-flank-link-btn"
                    onClick={() => setIsDetailModalOpen(true)}
                  >
                    <span>Xem thông số kỹ thuật</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* Cụm Tiêu Đề Lõm Vào Đáy Vòm (Bottom Center Cap) */}
                <div className="scene6-dome-cap-card">
                  {/* Nút Pill xanh đậm nằm vắt ngang đỉnh khối trắng */}
                  <div
                    key={`pill-${SECURITY_SUITES[activeSuiteIdx].id}`}
                    className={`scene6-cap-pill is-${suiteSlideDir}`}
                  >
                    <span>{SECURITY_SUITES[activeSuiteIdx].tag}</span>
                  </div>

                  <div
                    key={`stage-${SECURITY_SUITES[activeSuiteIdx].id}`}
                    className={`scene6-cap-sync-stage is-${suiteSlideDir}`}
                  >
                    <h3 className="scene6-dome-title">{SECURITY_SUITES[activeSuiteIdx].name}</h3>
                    <p className="scene6-dome-desc">{SECURITY_SUITES[activeSuiteIdx].desc}</p>

                    {/* 2 Tech Spec Chips */}
                    <div className="scene6-dome-specs">
                      {SECURITY_SUITES[activeSuiteIdx].specs.map((spec) => (
                        <span key={spec} className="scene6-spec-chip">
                          <span className="scene6-spec-dot" aria-hidden="true" />
                          <span>{spec}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Controls: Arrows, Dots, and CTA */}
                  <div className="scene6-dome-bottom-bar">
                    <div className="scene6-dome-nav-row">
                      <button
                        type="button"
                        className="scene6-cone-arrow-btn"
                        onClick={handlePrevSuite}
                        aria-label="Xem trụ cột trước"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <div className="scene6-dome-dots" role="tablist" aria-label="Danh sách trụ cột">
                        {SECURITY_SUITES.map((s, idx) => (
                          <button
                            key={s.id}
                            type="button"
                            role="tab"
                            aria-selected={idx === activeSuiteIdx}
                            className={`scene6-dome-dot ${idx === activeSuiteIdx ? 'is-active' : ''}`}
                            onClick={() => handleSelectSuite(idx)}
                            aria-label={`Trụ cột ${idx + 1}: ${s.name}`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        className="scene6-cone-arrow-btn"
                        onClick={handleNextSuite}
                        aria-label="Xem trụ cột tiếp theo"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="scene6-dome-cta-btn"
                      onClick={() => setIsDetailModalOpen(true)}
                    >
                      <span>Chi tiết giải pháp</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Right Flanking Card: FAQ & Kết Nối */}
                <div className="scene6-flank-card is-right" role="region" aria-label="Giải đáp thắc mắc bảo mật">
                  <div className="scene6-flank-header">
                    <div className="scene6-flank-icon-box" aria-hidden="true">
                      <HelpCircle size={18} />
                    </div>
                    <div className="scene6-flank-titles">
                      <h4 className="scene6-flank-title">Giải đáp an toàn</h4>
                      <p className="scene6-flank-subtitle">Hỏi đáp trọng tâm từ nhà quản trị</p>
                    </div>
                  </div>

                  {/* Active Pillar FAQ Trigger & Expandable Answer */}
                  <div className="scene6-flank-faq-active-box">
                    <div className={`scene6-faq-item ${openFaqIndices.includes(activeSuiteIdx % SECURITY_SUITES.length) ? 'is-open' : ''}`}>
                      <button
                        type="button"
                        className="scene6-faq-trigger"
                        onClick={() => toggleFaq(activeSuiteIdx % SECURITY_SUITES.length)}
                        aria-expanded={openFaqIndices.includes(activeSuiteIdx % SECURITY_SUITES.length)}
                      >
                        <span className="scene6-faq-q">{FAQS[activeSuiteIdx % SECURITY_SUITES.length].q}</span>
                        <span className="scene6-faq-toggle-icon" aria-hidden="true">
                          {openFaqIndices.includes(activeSuiteIdx % SECURITY_SUITES.length) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      </button>
                      {openFaqIndices.includes(activeSuiteIdx % SECURITY_SUITES.length) && (
                        <div className="scene6-faq-answer animate-fade">
                          <p>{FAQS[activeSuiteIdx % SECURITY_SUITES.length].a}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Semantic Accessible FAQ triggers for non-active questions */}
                  <div className="sr-only">
                    {FAQS.map((faq, idx) => {
                      if (idx === activeSuiteIdx % SECURITY_SUITES.length) return null;
                      const isOpen = openFaqIndices.includes(idx);
                      return (
                        <div key={faq.q}>
                          <button
                            type="button"
                            onClick={() => toggleFaq(idx)}
                            aria-expanded={isOpen}
                          >
                            {faq.q}
                          </button>
                          {isOpen && <p>{faq.a}</p>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="scene6-flank-actions">
                    <button
                      type="button"
                      className="scene6-flank-btn is-primary"
                      onClick={() => setIsDetailModalOpen(true)}
                    >
                      Xem 6 câu hỏi
                    </button>
                    <button
                      type="button"
                      className="scene6-flank-btn is-outline"
                      onClick={() => playScene6ToScene7()}
                    >
                      Tư vấn trực tiếp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Suite Detail & FAQ Modal Dialog */}
          {isDetailModalOpen &&
            createPortal(
              <div
                className="scene6-faq-modal-backdrop animate-fade"
                onClick={() => setIsDetailModalOpen(false)}
                role="presentation"
              >
                <div
                  className="scene6-faq-modal-card"
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Chi tiết phân vùng bảo mật và câu hỏi thường gặp"
                >
                  <div className="scene6-faq-modal-header">
                    <div>
                      <span className="b2b-section-badge">{SECURITY_SUITES[activeSuiteIdx].tag}</span>
                      <h3 className="scene6-faq-modal-title">{SECURITY_SUITES[activeSuiteIdx].suiteTitle}</h3>
                      <p className="scene6-faq-modal-desc">
                        {SECURITY_SUITES[activeSuiteIdx].desc}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="scene6-faq-modal-close"
                      onClick={() => setIsDetailModalOpen(false)}
                      aria-label="Đóng cửa sổ chi tiết"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="scene6-modal-suite-preview">
                    <div className="scene6-modal-diagram-holder">
                      <Scene6ArchitectureDiagram suiteId={SECURITY_SUITES[activeSuiteIdx].id} isCenter={true} />
                    </div>
                    <div className="scene6-modal-banner-overlay">
                      <span className="scene6-modal-score-badge">TIÊU CHUẨN KỸ THUẬT: {SECURITY_SUITES[activeSuiteIdx].score}</span>
                      <h4 className="scene6-modal-banner-title">{SECURITY_SUITES[activeSuiteIdx].name}</h4>
                    </div>
                  </div>

                  <div className="scene6-modal-specs-row">
                    {SECURITY_SUITES[activeSuiteIdx].specs.map((spec) => (
                      <span key={spec} className="scene6-spec-chip">
                        <span className="scene6-spec-dot" aria-hidden="true" />
                        <span>{spec}</span>
                      </span>
                    ))}
                  </div>

                  <h4 className="scene6-modal-section-subtitle">Giải đáp chuyên sâu về an toàn và vận hành dữ liệu doanh nghiệp:</h4>

                  <div className="scene6-faq-modal-body">
                    {FAQS.map((faq, idx) => {
                      const isOpen = openFaqIndices.includes(idx);
                      return (
                        <div
                          key={faq.q}
                          className={`scene6-faq-modal-item ${isOpen ? 'is-open' : ''}`}
                        >
                          <button
                            type="button"
                            className="scene6-faq-trigger"
                            onClick={() => toggleFaq(idx)}
                            aria-expanded={isOpen}
                          >
                            <span className="scene6-faq-q">{faq.q}</span>
                            <span className="scene6-faq-toggle-icon" aria-hidden="true">
                              {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </span>
                          </button>
                          {isOpen && (
                            <div className="scene6-faq-answer animate-fade">
                              <p>{faq.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="scene6-faq-modal-footer">
                    <button
                      type="button"
                      className="scene6-modal-btn is-outline"
                      onClick={() => setIsDetailModalOpen(false)}
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      className="scene6-modal-btn is-primary"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        playScene6ToScene7();
                      }}
                    >
                      Đặt lịch trao đổi trực tiếp
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
        </section>

        {/* Bottom-Right Keep Going Cue (Scene 6 -> Scene 7) */}
        <div
          className="motionsite-keepgoing"
          style={{
            opacity: s6CueOpacity,
            pointerEvents: s6CueOpacity > 0.5 && scene6PointerEvents === 'auto' ? 'auto' : 'none',
          }}
          onClick={() => playScene6ToScene7()}
        >
          <span className="motionsite-keepgoing-text">cuộn để xem tiếp</span>
          <button
            type="button"
            className="motionsite-keepgoing-btn"
            onClick={(e) => {
              e.stopPropagation();
              playScene6ToScene7();
            }}
            aria-label="Cuộn xuống đăng ký trải nghiệm"
          >
            <ArrowDown size={18} />
          </button>
        </div>
      </div>

      {/* ─── SCENE 7 LAYER (REGISTRATION CTA & FOOTER) ─── */}
      <div
        ref={scene7LayerRef}
        id="dang-ky"
        className={`cinematic-scene7-layer ${isScene7Settled ? 'is-settled' : ''}`}
        style={{
          opacity: s7LayerOpacity,
          visibility: animProgress > 5.0005 || s7LayerOpacity > 0.001 ? 'visible' : 'hidden',
          display: animProgress > 5.0005 || s7LayerOpacity > 0.001 ? undefined : 'none',
          pointerEvents: scene7PointerEvents,
          ...(scene7Transform3D !== 'none' ? { transform: scene7Transform3D } : {}),
          ...(scene7BoxShadow !== 'none' ? { boxShadow: scene7BoxShadow } : {}),
        }}
      >
        <div className="scene7-scroll-wrapper" style={{ opacity: s7ContentOpacity }}>
          <Scene7RegistrationCta id="dang-ky-content" />


        {/* ═══════════════════════════════════════════════════════════
            FOOTER CHUẨN DOANH NGHIỆP
            ═══════════════════════════════════════════════════════════ */}
        <footer className="b2b-footer">
          <div className="b2b-container b2b-footer-inner">
            <div className="b2b-footer-brand">
              <a
                href="#tong-quan"
                className="b2b-logo"
                onClick={(e) => {
                  e.preventDefault();
                  navigateDirect('tong-quan');
                }}
              >
                <img src={mark} alt="DigiTalent Logo" className="b2b-logo-img" />
                <span className="b2b-logo-text">
                  DigiTalent <strong>AI</strong>
                </span>
              </a>
              <p className="b2b-footer-tagline">
                Nền tảng đo lường năng lực số, phân tích khoảng trống kỹ năng và cá nhân hóa lộ trình đào tạo cho doanh nghiệp.
              </p>
            </div>

            <div className="b2b-footer-links">
              <div className="footer-col">
                <h4 className="footer-title">Giải pháp</h4>
                <button type="button" onClick={() => navigateDirect('khung-6-mien')} className="footer-link">Khung 6 Miền</button>
                <button type="button" onClick={() => navigateDirect('quy-trinh')} className="footer-link">Quy trình đánh giá</button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveProductIdx(1);
                    navigateDirect('san-pham');
                  }}
                  className="footer-link"
                >
                  Ma trận Skill Gap
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveProductIdx(3);
                    setActiveProductIdx(2);
                    navigateDirect('san-pham');
                  }}
                  className="footer-link"
                >
                  18 Khóa học chuẩn hóa
                </button>
              </div>

              <div className="footer-col">
                <h4 className="footer-title">Bảo mật & Pháp lý</h4>
                <button type="button" onClick={() => navigateDirect('bao-mat')} className="footer-link">Tuân thủ NĐ 13/2023</button>
                <button type="button" onClick={() => navigateDirect('bao-mat')} className="footer-link">Minh bạch AI</button>
                <Link to="/privacy" className="footer-link">Chính sách bảo mật</Link>
                <Link to="/terms" className="footer-link">Điều khoản dịch vụ</Link>
              </div>

              <div className="footer-col">
                <h4 className="footer-title">Hỗ trợ</h4>
                <button type="button" onClick={() => navigateDirect('bao-mat')} className="footer-link">FAQ Doanh nghiệp</button>
                <button type="button" onClick={() => navigateDirect('dang-ky')} className="footer-link">Liên hệ tư vấn</button>
                <Link to="/login" className="footer-link">Đăng nhập cổng doanh nghiệp</Link>
              </div>
            </div>
          </div>

          <div className="b2b-footer-bottom">
            <div className="b2b-container b2b-footer-bottom-inner">
              <span>© 2026 DigiTalent AI. All rights reserved. B2B Enterprise Edition.</span>
              <span>Phiên bản v1.0 · Định hướng phát triển nguồn nhân lực số.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</div>

        {/* ═══════════════════════════════════════════════════════════
            LIGHTBOX XEM MÀN HÌNH SẢN PHẨM KÍCH THƯỚC 1:1
            ═══════════════════════════════════════════════════════════ */}
        {zoomedProductIdx !== null && PRODUCT_SCREENS[zoomedProductIdx] && (() => {
          const activeZoomProduct = PRODUCT_SCREENS[zoomedProductIdx];
          return (
            <div
              className="glass-lightbox-backdrop"
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-lightbox-title"
              onClick={(e) => {
                if (e.target === e.currentTarget) setZoomedProductIdx(null);
              }}
            >
              <div className="glass-lightbox-dialog">
                <div className="glass-lightbox-header">
                  <div className="glass-lightbox-heading-group">
                    <span className="glass-lightbox-step">{activeZoomProduct.num} / 05</span>
                    <span className="glass-lightbox-role">{activeZoomProduct.roleTag}</span>
                    <h3 id="product-lightbox-title" className="glass-lightbox-title">
                      {activeZoomProduct.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="glass-lightbox-close"
                    onClick={() => setZoomedProductIdx(null)}
                    aria-label="Đóng xem màn hình sản phẩm"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>

                <div className="glass-lightbox-body">
                  <img
                    src={activeZoomProduct.image}
                    alt={activeZoomProduct.title}
                    className="glass-lightbox-img"
                  />
                </div>

                <div className="glass-lightbox-footer">
                  <p className="glass-lightbox-desc">{activeZoomProduct.summary}</p>
                  <div className="glass-lightbox-nav">
                    <button
                      type="button"
                      className="glass-lightbox-nav-btn"
                      disabled={zoomedProductIdx === 0}
                      onClick={() => {
                        const prevIdx = Math.max(0, zoomedProductIdx - 1);
                        setZoomedProductIdx(prevIdx);
                        setActiveProductIdx(prevIdx);
                      }}
                    >
                      ‹ Màn hình trước
                    </button>
                    <button
                      type="button"
                      className="glass-lightbox-nav-btn is-primary"
                      disabled={zoomedProductIdx === PRODUCT_SCREENS.length - 1}
                      onClick={() => {
                        const nextIdx = Math.min(PRODUCT_SCREENS.length - 1, zoomedProductIdx + 1);
                        setZoomedProductIdx(nextIdx);
                        setActiveProductIdx(nextIdx);
                      }}
                    >
                      Màn hình tiếp theo ›
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Scene 5 System Architecture Blueprint Modal */}
        <Scene5ArchitectureModal
          isOpen={isArchModalOpen}
          onClose={() => setIsArchModalOpen(false)}
        />

      </div>
    </PulsePublicShell>
  );
}
