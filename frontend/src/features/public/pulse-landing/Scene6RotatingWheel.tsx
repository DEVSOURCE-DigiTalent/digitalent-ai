import { memo } from 'react';

export interface SecuritySuiteItem {
  id: string;
  name: string;
  shortTab?: string;
  title: string;
  suiteTitle: string;
  desc: string;
  tag: string;
  topChip: string;
  score: string;
  specs: string[];
  image: string;
  bgColor?: string;
  faqIdx: number;
}

interface Scene6RotatingWheelProps {
  suites: SecuritySuiteItem[];
  activeSuiteIdx: number;
  wheelRotationDeg: number;
  onSelectSuite: (idx: number) => void;
  onPrevSuite: () => void;
  onNextSuite: () => void;
  onOpenModal: () => void;
}

// Dome edge = ellipse rx 50 / ry 100 in this viewBox (dome is 100 x 100 units, centred at its top edge).
const GUARD_RINGS = [
  { rx: 58, ry: 113, opacity: 0.2, dashed: false },
  { rx: 67, ry: 127, opacity: 0.15, dashed: true },
  { rx: 77, ry: 142, opacity: 0.11, dashed: false },
  { rx: 88, ry: 158, opacity: 0.07, dashed: false },
];

export const Scene6RotatingWheel = memo(function Scene6RotatingWheel({
  suites,
  activeSuiteIdx,
  wheelRotationDeg,
  onSelectSuite,
  onPrevSuite,
  onNextSuite,
  onOpenModal,
}: Scene6RotatingWheelProps) {
  // 6 slices of 60deg each around elevated apex (550, -165) so the center slice is the largest hero sector.
  const wedgeArcPath = 'M 550 -165 L -90 943.5 A 1280 1280 0 0 1 1190 943.5 Z';
  const total = suites.length;
  const leftSuite = suites[(activeSuiteIdx - 1 + total) % total];
  const rightSuite = suites[(activeSuiteIdx + 1) % total];

  return (
    <div className="scene6-dome-wheel-root">
      {/* Concentric protection rings echoing the dome curve; pulse once per rotation */}
      <svg
        className="scene6-guard-rings"
        viewBox="0 0 240 320"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {GUARD_RINGS.map((ring, ringIdx) => (
          <ellipse
            key={`${ring.rx}-${activeSuiteIdx}`}
            className="scene6-guard-ring"
            cx="120"
            cy="160"
            rx={ring.rx}
            ry={ring.ry}
            strokeDasharray={ring.dashed ? '2 7' : undefined}
            style={{
              ['--ring-base' as string]: ring.opacity,
              animationDelay: `${ringIdx * 90}ms`,
            }}
          />
        ))}
      </svg>

      <div className="scene6-dome-wheel-container">
        <svg
          viewBox="0 0 1100 440"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="scene6-dome-wheel-svg"
          preserveAspectRatio="xMidYMin slice"
        >
          <defs>
            <clipPath id="scene6-wedge-clip">
              <path d={wedgeArcPath} />
            </clipPath>

            <linearGradient id="slice-active-vignette" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.0" />
              <stop offset="70%" stopColor="#0f172a" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.06" />
            </linearGradient>

            <linearGradient id="slice-flank-tint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.28" />
            </linearGradient>
          </defs>

          {/* Master 6-slice physical turntable rotating around elevated apex (550, -165) */}
          <g
            className="scene6-wheel-turntable"
            style={{
              transform: `rotate(${wheelRotationDeg}deg)`,
              transformOrigin: '550px -165px',
              transition: 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {suites.map((suite, idx) => {
              const sliceAngle = -idx * 60;
              const isActive = idx === activeSuiteIdx;
              const netRotation = sliceAngle + wheelRotationDeg;
              const normAngle = (((netRotation % 360) + 540) % 360) - 180;

              const isLeftFlank = normAngle > 20 && normAngle < 100;
              const isRightFlank = normAngle < -20 && normAngle > -100;

              const imgFocusX = isLeftFlank ? 668 : isRightFlank ? 432 : 550;
              const imgFocusY = isLeftFlank || isRightFlank ? 286 : 172;

              return (
                <g key={suite.id} transform={`rotate(${sliceAngle}, 550, -165)`}>
                  {/* Illustrated Wedge Slice */}
                  <g clipPath="url(#scene6-wedge-clip)">
                    <path d={wedgeArcPath} fill={suite.bgColor || '#f2f4f8'} />
                    <g
                      style={{
                        transform: `translate(${imgFocusX}px, ${imgFocusY}px) rotate(${-netRotation}deg) scale(${isActive ? 1 : 0.84})`,
                        transformOrigin: '0px 0px',
                        opacity: isActive ? 1 : 0.82,
                        transition: 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease',
                      }}
                    >
                      <image
                        href={suite.image}
                        x="-210"
                        y="-148"
                        width="420"
                        height="296"
                        preserveAspectRatio="xMidYMid meet"
                      />
                    </g>

                    {/* Atmospheric depth overlay: vivid on center hero slice, dimmed on flanking slices */}
                    <path
                      d={wedgeArcPath}
                      fill={isActive ? 'url(#slice-active-vignette)' : 'url(#slice-flank-tint)'}
                      style={{ transition: 'fill 0.45s ease' }}
                    />
                  </g>

                  {/* Crisp Architectural White Seam Lines */}
                  <line
                    x1="550"
                    y1="-165"
                    x2="-90"
                    y2="943.5"
                    stroke="#ffffff"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <line
                    x1="550"
                    y1="-165"
                    x2="1190"
                    y2="943.5"
                    stroke="#ffffff"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </g>

          {/* Interactive Click Hotspots for the 3 Visible Sectors (Center Largest) */}
          <polygon
            points="455,0 0,0 0,440 201,440"
            fill="transparent"
            className="scene6-wedge-click-area"
            onClick={onPrevSuite}
            aria-label="Quay sang phân vùng bảo mật trước"
            style={{ cursor: 'pointer' }}
          />
          <polygon
            points="645,0 1100,0 1100,440 899,440"
            fill="transparent"
            className="scene6-wedge-click-area"
            onClick={onNextSuite}
            aria-label="Quay sang phân vùng bảo mật tiếp theo"
            style={{ cursor: 'pointer' }}
          />
          <polygon
            points="455,0 645,0 899,440 201,440"
            fill="transparent"
            className="scene6-wedge-click-area is-center"
            onClick={onOpenModal}
            aria-label="Xem chi tiết phân vùng bảo mật đang chọn"
            style={{ cursor: 'pointer' }}
          />
        </svg>
      </div>

      {/* Top-Center Compact 6-Tab Pill Bar straddling the top horizontal border of the Dome */}
      <div
        className="scene6-rim-switcher"
        role="tablist"
        aria-label="Danh sách phân vùng dữ liệu"
      >
        {suites.map((suite, idx) => {
          const isActive = idx === activeSuiteIdx;
          return (
            <button
              key={suite.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`scene6-rim-pill ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectSuite(idx)}
              aria-label={`Chọn phân vùng: ${suite.name}`}
            >
              <span className="scene6-rim-pill-dot" aria-hidden="true" />
              <span className="scene6-rim-pill-text">{suite.shortTab || suite.tag}</span>
            </button>
          );
        })}
      </div>

      {/* Single Left & Right Circular-Rim Tab Pills matching the visible flanking slices */}
      <div className="scene6-rim-edge-tabs">
        <button
          key={`left-${leftSuite.id}`}
          type="button"
          className="scene6-rim-edge-pill is-left"
          onClick={onPrevSuite}
          aria-label={`Chuyển sang phân vùng bên trái: ${leftSuite.name}`}
        >
          <span>{leftSuite.shortTab || leftSuite.tag}</span>
        </button>

        <button
          key={`right-${rightSuite.id}`}
          type="button"
          className="scene6-rim-edge-pill is-right"
          onClick={onNextSuite}
          aria-label={`Chuyển sang phân vùng bên phải: ${rightSuite.name}`}
        >
          <span>{rightSuite.shortTab || rightSuite.tag}</span>
        </button>
      </div>
    </div>
  );
});
