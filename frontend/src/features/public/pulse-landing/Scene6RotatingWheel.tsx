import { memo } from 'react';

export interface SecuritySuiteItem {
  id: string;
  name: string;
  title: string;
  suiteTitle: string;
  desc: string;
  tag: string;
  topChip: string;
  score: string;
  specs: string[];
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

export const Scene6RotatingWheel = memo(function Scene6RotatingWheel({
  suites,
  activeSuiteIdx,
  wheelRotationDeg,
  onPrevSuite,
  onNextSuite,
  onOpenModal,
}: Scene6RotatingWheelProps) {
  // A complete physical wheel composed of 6 slices of 60° each (360° total).
  // Slices 0..5 are arranged in circular order around Apex (500, 0).
  // Each slice i has sliceAngle = -i * 60°.
  // When activeSuiteIdx = k, wheelRotationDeg = k * 60°, placing Slice k at exactly 0° (Center).
  // At any moment, exactly 3 slices are visible in the dome:
  // - Left Slice (+60°): Suite (k - 1 + 6) % 6
  // - Center Slice (0°): Suite k
  // - Right Slice (-60°): Suite (k + 1) % 6
  // Wedge path spans from -30° to +30° relative to centerline.
  // At R = 900: sin(30°) = 0.5 -> x = 500 ± 450 = 50 / 950; cos(30°) = 0.866025 -> y = 779.4
  const wedgeArcPath = 'M 500 0 L 50 779.4 A 900 900 0 0 1 950 779.4 Z';

  return (
    <div className="scene6-dome-wheel-container">
      <svg
        viewBox="0 0 1000 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="scene6-dome-wheel-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle Technical Blueprint Grid */}
          <pattern id="scene6-wheel-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(148, 163, 184, 0.20)" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.2" fill="rgba(148, 163, 184, 0.28)" />
          </pattern>

          {/* Slice Background Gradients */}
          <linearGradient id="slice-bg-active" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          <linearGradient id="slice-bg-flank" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#edf2f7" />
          </linearGradient>

          <linearGradient id="active-pillar-glow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          {/* Soft Shadow Filter for Graphic Elements */}
          <filter id="wedge-element-shadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* ==============================================================
            MASTER 6-PIECE PHYSICAL WHEEL TURNTABLE
            Smoothly animated with CSS transition around apex pivot (500px, 0px)
            ============================================================== */}
        <g
          className="scene6-wheel-turntable"
          style={{
            transform: `rotate(${wheelRotationDeg}deg)`,
            transformOrigin: '500px 0px',
            transition: 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {suites.map((suite, idx) => {
            // Slices are ordered counter-clockwise so that next (idx + 1) is to the right (-60°)
            // and prev (idx - 1) is to the left (+60°).
            const sliceAngle = -idx * 60;
            const isActive = idx === activeSuiteIdx;

            return (
              <g
                key={suite.id}
                transform={`rotate(${sliceAngle}, 500, 0)`}
              >
                {/* 60-degree Wedge Solid Background */}
                <path
                  d={wedgeArcPath}
                  fill={isActive ? 'url(#slice-bg-active)' : 'url(#slice-bg-flank)'}
                />
                <path
                  d={wedgeArcPath}
                  fill="url(#scene6-wheel-grid)"
                  opacity={isActive ? 0.6 : 0.30}
                />

                {/* Prominent Double Seam Lines on Both Boundaries */}
                {/* Left Seam Boundary (-30°) */}
                <line
                  x1="500"
                  y1="0"
                  x2="50"
                  y2="779.4"
                  stroke="#ffffff"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <line
                  x1="500"
                  y1="0"
                  x2="50"
                  y2="779.4"
                  stroke="#cbd5e1"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                {/* Right Seam Boundary (+30°) */}
                <line
                  x1="500"
                  y1="0"
                  x2="950"
                  y2="779.4"
                  stroke="#ffffff"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <line
                  x1="500"
                  y1="0"
                  x2="950"
                  y2="779.4"
                  stroke="#cbd5e1"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Graphic Content inside this Slice (Fully visible, starts at y=105 to avoid apex overlap) */}
                <g opacity={isActive ? 1 : 0.85}>
                  {idx === 0 && <SliceGraphicIsolation />}
                  {idx === 1 && <SliceGraphicRbac />}
                  {idx === 2 && <SliceGraphicAiBoundary />}
                  {idx === 3 && <SliceGraphicAuditLog />}
                  {idx === 4 && <SliceGraphicInfrastructure />}
                  {idx === 5 && <SliceGraphicSovereignty />}
                </g>
              </g>
            );
          })}
        </g>

        {/* ==============================================================
            INTERACTIVE CLICKABLE HOTSPOTS (3 Sectors covering Visible Dome)
            ============================================================== */}
        {/* Left Sector Hotspot: Click to rotate wheel backward */}
        <polygon
          points="500,0 0,0 0,480 223,480"
          fill="transparent"
          className="scene6-wedge-click-area"
          onClick={onPrevSuite}
          aria-label="Quay sang phân vùng bảo mật trước"
          style={{ cursor: 'pointer' }}
        />
        {/* Right Sector Hotspot: Click to rotate wheel forward */}
        <polygon
          points="500,0 1000,0 1000,480 777,480"
          fill="transparent"
          className="scene6-wedge-click-area"
          onClick={onNextSuite}
          aria-label="Quay sang phân vùng bảo mật tiếp theo"
          style={{ cursor: 'pointer' }}
        />
        {/* Center Sector Hotspot: Click to open modal detail */}
        <polygon
          points="500,0 223,480 777,480"
          fill="transparent"
          className="scene6-wedge-click-area is-center"
          onClick={onOpenModal}
          aria-label="Xem chi tiết phân vùng bảo mật đang chọn"
          style={{ cursor: 'pointer' }}
        />
      </svg>

      {/* Sleek Minimalist Apex Indicator (Replaces bulky circular badge) */}
      <div
        className="scene6-apex-tag"
        onClick={onOpenModal}
        role="button"
        tabIndex={0}
        aria-label="Xem chi tiết trụ cột bảo mật"
      >
        <span className="apex-tag-dot" aria-hidden="true" />
        <span className="apex-tag-text">CHUẨN AN TOÀN 0{activeSuiteIdx + 1} / 06</span>
      </div>
    </div>
  );
});

// ============================================================================
// HEROIC GRAPHIC 1: CÔ LẬP VÙNG DỮ LIỆU (DATABASE POD & DEDICATED VAULT)
// ============================================================================
function SliceGraphicIsolation() {
  return (
    <g transform="translate(500, 0)">
      {/* Top Header Tag */}
      <rect x="-80" y="105" width="160" height="22" rx="11" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.2" />
      <text x="0" y="120" textAnchor="middle" fill="#1e40af" fontSize="9" fontWeight="800" letterSpacing="0.04em">
        01 // VÙNG LƯU TRỮ CÔ LẬP
      </text>

      {/* Heroic Central 3D Database Cylinder Pod */}
      <g filter="url(#wedge-element-shadow)">
        {/* Outer Laser Perimeter Ring */}
        <ellipse cx="0" cy="195" rx="95" ry="36" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.85" />

        {/* Cylinder Body */}
        <path
          d="M -60 155 L -60 215 C -60 235 60 235 60 215 L 60 155 Z"
          fill="url(#active-pillar-glow)"
          stroke="#1e3a8a"
          strokeWidth="2"
        />

        {/* Top Disc of Cylinder */}
        <ellipse cx="0" cy="155" rx="60" ry="20" fill="#ffffff" stroke="#2563eb" strokeWidth="2.2" />
        <ellipse cx="0" cy="155" rx="44" ry="14" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1" />

        {/* Intermediate Metallic Rings */}
        <ellipse cx="0" cy="185" rx="58" ry="16" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.5" />
        <ellipse cx="0" cy="215" rx="58" ry="16" fill="none" stroke="rgba(255, 255, 255, 0.65)" strokeWidth="2" />

        {/* Central Glowing Shield & Lock */}
        <circle cx="0" cy="185" r="18" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
        <path
          d="M -5 185 L -5 180 C -5 176 5 176 5 180 L 5 185 M -7 185 L 7 185 L 7 194 L -7 194 Z"
          stroke="#1e3a8a"
          strokeWidth="2"
          fill="#eff6ff"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Value Badges */}
      <rect x="-90" y="260" width="180" height="24" rx="12" fill="#0f172a" />
      <text x="0" y="276" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="800" letterSpacing="0.04em">
        MÃ HÓA AES-256 • 0 RÒ RỈ CHÉO
      </text>

      <text x="0" y="300" textAnchor="middle" fill="#1e293b" fontSize="10.5" fontWeight="800">
        Dedicated Tenant Schema
      </text>
      <text x="0" y="316" textAnchor="middle" fill="#64748b" fontSize="8.5" fontWeight="600">
        Phân tách độc lập không gian lưu trữ
      </text>
    </g>
  );
}

// ============================================================================
// HEROIC GRAPHIC 2: PHÂN CẤP QUẢN TRỊ THEO CƠ CẤU (4-TIER MATRIX)
// ============================================================================
function SliceGraphicRbac() {
  return (
    <g transform="translate(500, 0)">
      {/* Top Header Tag */}
      <rect x="-80" y="105" width="160" height="22" rx="11" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.2" />
      <text x="0" y="120" textAnchor="middle" fill="#1e40af" fontSize="9" fontWeight="800" letterSpacing="0.04em">
        02 // PHÂN CẤP 4 TẦNG QUẢN TRỊ
      </text>

      {/* 3-Tier Enterprise Role Hierarchy */}
      <g filter="url(#wedge-element-shadow)">
        {/* Tier 1: Ban Giám Đốc */}
        <rect x="-65" y="138" width="130" height="28" rx="7" fill="#1e3a8a" stroke="#ffffff" strokeWidth="1.4" />
        <circle cx="-46" cy="152" r="4.5" fill="#38bdf8" />
        <text x="4" y="156" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="800">
          BAN GIÁM ĐỐC
        </text>

        {/* Tree Connectors */}
        <line x1="0" y1="166" x2="0" y2="178" stroke="#2563eb" strokeWidth="1.8" />
        <line x1="-42" y1="178" x2="42" y2="178" stroke="#2563eb" strokeWidth="1.8" />
        <line x1="-42" y1="178" x2="-42" y2="187" stroke="#2563eb" strokeWidth="1.8" />
        <line x1="42" y1="178" x2="42" y2="187" stroke="#2563eb" strokeWidth="1.8" />

        {/* Tier 2: Trưởng Phòng & HR Admin */}
        <rect x="-80" y="187" width="76" height="30" rx="6" fill="#ffffff" stroke="#0284c7" strokeWidth="1.4" />
        <text x="-42" y="200" textAnchor="middle" fill="#0f172a" fontSize="7.5" fontWeight="800">
          TRƯỞNG PHÒNG
        </text>
        <text x="-42" y="211" textAnchor="middle" fill="#0284c7" fontSize="6.5" fontWeight="700">
          Báo cáo bộ phận
        </text>

        <rect x="4" y="187" width="76" height="30" rx="6" fill="#ffffff" stroke="#0284c7" strokeWidth="1.4" />
        <text x="42" y="200" textAnchor="middle" fill="#0f172a" fontSize="7.5" fontWeight="800">
          HR ADMIN
        </text>
        <text x="42" y="211" textAnchor="middle" fill="#0284c7" fontSize="6.5" fontWeight="700">
          Tổ chức kỳ thi
        </text>

        {/* Connector to Staff */}
        <line x1="-42" y1="217" x2="-42" y2="227" stroke="#10b981" strokeWidth="1.8" />

        {/* Tier 3: Nhân Viên / Thí Sinh (Private Score) */}
        <rect x="-80" y="227" width="160" height="28" rx="7" fill="#f0fdf4" stroke="#10b981" strokeWidth="1.6" />
        <circle cx="-62" cy="241" r="4.5" fill="#10b981" />
        <text x="5" y="245" textAnchor="middle" fill="#14532d" fontSize="8" fontWeight="800">
          NHÂN VIÊN // ĐIỂM SỐ CÁ NHÂN
        </text>
      </g>

      {/* Value Badges */}
      <rect x="-90" y="265" width="180" height="24" rx="12" fill="#0f172a" />
      <text x="0" y="281" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="800">
        ĐÚNG THẨM QUYỀN • KHÔNG LỘ ĐIỂM
      </text>

      <text x="0" y="303" textAnchor="middle" fill="#1e293b" fontSize="10.5" fontWeight="800">
        Kiểm Soát Theo Vai Trò Thực Tế
      </text>
      <text x="0" y="318" textAnchor="middle" fill="#64748b" fontSize="8.5" fontWeight="600">
        Ranh giới dữ liệu minh bạch giữa các cấp
      </text>
    </g>
  );
}

// ============================================================================
// HEROIC GRAPHIC 3: RANH GIỚI XỬ LÝ AI KHÉP KÍN (CLOSED-LOOP AI)
// ============================================================================
function SliceGraphicAiBoundary() {
  return (
    <g transform="translate(500, 0)">
      {/* Top Header Tag */}
      <rect x="-80" y="105" width="160" height="22" rx="11" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.2" />
      <text x="0" y="120" textAnchor="middle" fill="#1e40af" fontSize="9" fontWeight="800" letterSpacing="0.04em">
        03 // XỬ LÝ AI NỘI BỘ KHÉP KÍN
      </text>

      {/* AI Closed-Loop Perimeter Shield */}
      <g filter="url(#wedge-element-shadow)">
        {/* Outer Shield Firewall */}
        <rect x="-80" y="138" width="160" height="118" rx="10" fill="#ffffff" stroke="#2563eb" strokeWidth="1.6" />
        <rect x="-80" y="138" width="160" height="22" rx="10" fill="url(#active-pillar-glow)" />
        <circle cx="-64" cy="149" r="3.5" fill="#10b981" />
        <text x="4" y="153" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="800">
          ENTERPRISE AI SANDBOX
        </text>

        {/* Central AI Processor Core */}
        <circle cx="0" cy="189" r="20" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.6" />
        <circle cx="0" cy="189" r="11" fill="#2563eb" />
        <text x="0" y="193" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="900">
          AI
        </text>

        {/* Internal Flow Orbit Nodes */}
        <path d="M -46 189 L -24 189" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
        <polygon points="-22,189 -27,186 -27,192" fill="#2563eb" />
        <text x="-46" y="181" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="700">
          Đề thi
        </text>

        <path d="M 24 189 L 46 189" stroke="#10b981" strokeWidth="1.5" />
        <polygon points="48,189 43,186 43,192" fill="#10b981" />
        <text x="46" y="181" textAnchor="middle" fill="#10b981" fontSize="7" fontWeight="700">
          Điểm số
        </text>

        {/* Blocked Cloud Bar at Sandbox Base */}
        <rect x="-65" y="222" width="130" height="20" rx="4" fill="#fef2f2" stroke="#fca5a5" strokeWidth="1" />
        <text x="0" y="235" textAnchor="middle" fill="#dc2626" fontSize="7" fontWeight="800">
          ✕ CHẶN ĐƯỜNG RA AI MỞ
        </text>
      </g>

      {/* Value Badges */}
      <rect x="-90" y="265" width="180" height="24" rx="12" fill="#0f172a" />
      <text x="0" y="281" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="800">
        ZERO TRAINING LEAK • TLS 1.3
      </text>

      <text x="0" y="303" textAnchor="middle" fill="#1e293b" fontSize="10.5" fontWeight="800">
        Cam Kết Không Chia Sẻ Dữ Liệu
      </text>
      <text x="0" y="318" textAnchor="middle" fill="#64748b" fontSize="8.5" fontWeight="600">
        Tuyệt đối không dùng để huấn luyện AI công cộng
      </text>
    </g>
  );
}

// ============================================================================
// HEROIC GRAPHIC 4: NHẬT KÝ THAO TÁC & CHỨNG NHẬN (AUDIT TIMELINE)
// ============================================================================
function SliceGraphicAuditLog() {
  return (
    <g transform="translate(500, 0)">
      {/* Top Header Tag */}
      <rect x="-80" y="105" width="160" height="22" rx="11" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.2" />
      <text x="0" y="120" textAnchor="middle" fill="#1e40af" fontSize="9" fontWeight="800" letterSpacing="0.04em">
        04 // NHẬT KÝ &amp; CHỨNG NHẬN SỐ
      </text>

      {/* Stepped Timeline Ledger */}
      <g filter="url(#wedge-element-shadow)">
        {/* Step 1: Nộp Bài */}
        <rect x="-76" y="138" width="152" height="28" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
        <circle cx="-60" cy="152" r="4.5" fill="#64748b" />
        <text x="-2" y="148" fill="#0f172a" fontSize="7.5" fontWeight="700">
          10:14 // Ghi nhận bài nộp
        </text>
        <text x="-2" y="159" fill="#64748b" fontSize="6.5" fontWeight="600">
          IP và thời gian thực xác thực
        </text>

        {/* Step 2: Chấm Điểm */}
        <line x1="-60" y1="166" x2="-60" y2="176" stroke="#2563eb" strokeWidth="1.5" />
        <rect x="-76" y="176" width="152" height="28" rx="6" fill="#ffffff" stroke="#2563eb" strokeWidth="1.4" />
        <circle cx="-60" cy="190" r="4.5" fill="#2563eb" />
        <text x="-2" y="186" fill="#1e3a8a" fontSize="7.5" fontWeight="800">
          10:14 // AI chấm tự động
        </text>
        <text x="-2" y="197" fill="#2563eb" fontSize="6.5" fontWeight="700">
          Khớp khung chuẩn năng lực
        </text>

        {/* Step 3: Cấp Chứng Nhận Số */}
        <line x1="-60" y1="204" x2="-60" y2="214" stroke="#10b981" strokeWidth="1.5" />
        <rect x="-76" y="214" width="152" height="32" rx="7" fill="#f0fdf4" stroke="#10b981" strokeWidth="1.6" />
        <circle cx="-58" cy="230" r="7" fill="#10b981" />
        <text x="-58" y="234" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900">
          ✓
        </text>
        <text x="5" y="226" fill="#14532d" fontSize="7.5" fontWeight="800">
          CẤP CHỨNG NHẬN SỐ
        </text>
        <text x="5" y="238" fill="#047857" fontSize="7" fontWeight="800" fontFamily="monospace">
          MÃ TRA CỨU: #PLS-9824
        </text>
      </g>

      {/* Value Badges */}
      <rect x="-90" y="265" width="180" height="24" rx="12" fill="#0f172a" />
      <text x="0" y="281" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="800">
        LƯU VẾT 24/7 • XUẤT PDF &amp; EXCEL
      </text>

      <text x="0" y="303" textAnchor="middle" fill="#1e293b" fontSize="10.5" fontWeight="800">
        Minh Bạch Lịch Sử Đối Soát
      </text>
      <text x="0" y="318" textAnchor="middle" fill="#64748b" fontSize="8.5" fontWeight="600">
        Đầy đủ bằng chứng khi kiểm toán nội bộ
      </text>
    </g>
  );
}

// ============================================================================
// HEROIC GRAPHIC 5: HẠ TẦNG MÁY CHỦ & DỰ PHÒNG KÉP (HIGH-AVAILABILITY)
// ============================================================================
function SliceGraphicInfrastructure() {
  return (
    <g transform="translate(500, 0)">
      {/* Top Header Tag */}
      <rect x="-80" y="105" width="160" height="22" rx="11" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.2" />
      <text x="0" y="120" textAnchor="middle" fill="#1e40af" fontSize="9" fontWeight="800" letterSpacing="0.04em">
        05 // HẠ TẦNG DỰ PHÒNG KÉP
      </text>

      {/* Dual Server Cluster */}
      <g filter="url(#wedge-element-shadow)">
        {/* Node A (Hà Nội) */}
        <rect x="-78" y="138" width="70" height="86" rx="6" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
        <rect x="-78" y="138" width="70" height="16" rx="6" fill="url(#active-pillar-glow)" />
        <text x="-43" y="150" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="800">
          NODE HÀ NỘI
        </text>
        <rect x="-72" y="160" width="58" height="10" rx="2" fill="#0f172a" />
        <circle cx="-65" cy="165" r="2" fill="#10b981" />
        <rect x="-72" y="174" width="58" height="10" rx="2" fill="#0f172a" />
        <circle cx="-65" cy="179" r="2" fill="#38bdf8" />
        <rect x="-72" y="188" width="58" height="10" rx="2" fill="#0f172a" />
        <circle cx="-65" cy="193" r="2" fill="#10b981" />
        <text x="-43" y="213" textAnchor="middle" fill="#15803d" fontSize="6.5" fontWeight="800">
          Active Primary
        </text>

        {/* Sync Stream Bridge */}
        <line x1="-7" y1="172" x2="7" y2="172" stroke="#2563eb" strokeWidth="1.6" strokeDasharray="2 2" />
        <line x1="7" y1="184" x2="-7" y2="184" stroke="#0284c7" strokeWidth="1.6" strokeDasharray="2 2" />
        <circle cx="0" cy="178" r="6" fill="#0f172a" />
        <text x="0" y="181" textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontWeight="800">
          ⇄
        </text>

        {/* Node B (TP.HCM) */}
        <rect x="8" y="138" width="70" height="86" rx="6" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
        <rect x="8" y="138" width="70" height="16" rx="6" fill="#0284c7" />
        <text x="43" y="150" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="800">
          NODE TP.HCM
        </text>
        <rect x="14" y="160" width="58" height="10" rx="2" fill="#0f172a" />
        <circle cx="21" cy="165" r="2" fill="#38bdf8" />
        <rect x="14" y="174" width="58" height="10" rx="2" fill="#0f172a" />
        <circle cx="21" cy="179" r="2" fill="#10b981" />
        <rect x="14" y="188" width="58" height="10" rx="2" fill="#0f172a" />
        <circle cx="21" cy="193" r="2" fill="#38bdf8" />
        <text x="43" y="213" textAnchor="middle" fill="#0284c7" fontSize="6.5" fontWeight="800">
          Hot Standby
        </text>

        {/* Scheduler Bar */}
        <rect x="-70" y="232" width="140" height="20" rx="4.5" fill="#eff6ff" stroke="#bfdbfe" />
        <text x="0" y="245" textAnchor="middle" fill="#1e40af" fontSize="7" fontWeight="800">
          SAO LƯU TỰ ĐỘNG: 02:00 AM HẰNG NGÀY
        </text>
      </g>

      {/* Value Badges */}
      <rect x="-90" y="265" width="180" height="24" rx="12" fill="#0f172a" />
      <text x="0" y="281" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="800">
        MÁY CHỦ NỘI ĐỊA VN • SẴN SÀNG 99.9%
      </text>

      <text x="0" y="303" textAnchor="middle" fill="#1e293b" fontSize="10.5" fontWeight="800">
        Khả Năng Chịu Tải Cao Cho Kỳ Thi Lớn
      </text>
      <text x="0" y="318" textAnchor="middle" fill="#64748b" fontSize="8.5" fontWeight="600">
        Đảm bảo kỳ đánh giá lớn diễn ra thông suốt
      </text>
    </g>
  );
}

// ============================================================================
// HEROIC GRAPHIC 6: CHỦ QUYỀN DỮ LIỆU & QUYỀN RIÊNG TƯ (DATA SOVEREIGNTY VAULT)
// ============================================================================
function SliceGraphicSovereignty() {
  return (
    <g transform="translate(500, 0)">
      {/* Top Header Tag */}
      <rect x="-80" y="105" width="160" height="22" rx="11" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.2" />
      <text x="0" y="120" textAnchor="middle" fill="#1e40af" fontSize="9" fontWeight="800" letterSpacing="0.04em">
        06 // CHỦ QUYỀN &amp; NGHỊ ĐỊNH 13
      </text>

      {/* Heroic Central Data Sovereignty Vault */}
      <g filter="url(#wedge-element-shadow)">
        {/* Main Vault Outer Capsule */}
        <rect x="-76" y="138" width="152" height="118" rx="10" fill="#ffffff" stroke="#2563eb" strokeWidth="1.6" />
        <rect x="-76" y="138" width="152" height="22" rx="10" fill="url(#active-pillar-glow)" />
        <circle cx="-60" cy="149" r="3.5" fill="#38bdf8" />
        <text x="5" y="153" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="800">
          DATA SOVEREIGNTY VAULT
        </text>

        {/* Central Seal: NGHỊ ĐỊNH 13 */}
        <circle cx="0" cy="186" r="21" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.8" />
        <circle cx="0" cy="186" r="16" fill="#1e3a8a" />
        <text x="0" y="183" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="800">
          NGHỊ ĐỊNH
        </text>
        <text x="0" y="193" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="900">
          13
        </text>

        {/* Two Sovereign Admin Operation Action Badges */}
        {/* Left: Export Vault */}
        <rect x="-66" y="216" width="60" height="19" rx="4" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1" />
        <text x="-36" y="228" textAnchor="middle" fill="#0369a1" fontSize="6.5" fontWeight="800">
          ↓ XUẤT XLS/JSON
        </text>

        {/* Right: Purge on Demand */}
        <rect x="6" y="216" width="60" height="19" rx="4" fill="#fef2f2" stroke="#ef4444" strokeWidth="1" />
        <text x="36" y="228" textAnchor="middle" fill="#b91c1c" fontSize="6.5" fontWeight="800">
          ✕ HỦY VĨNH VIỄN
        </text>

        {/* Bottom Lock Commitment */}
        <rect x="-66" y="238" width="132" height="13" rx="3" fill="#f8fafc" />
        <text x="0" y="247" textAnchor="middle" fill="#475569" fontSize="6" fontWeight="700">
          QUYỀN SỞ HỮU THUỘC DOANH NGHIỆP
        </text>
      </g>

      {/* Value Badges */}
      <rect x="-90" y="265" width="180" height="24" rx="12" fill="#0f172a" />
      <text x="0" y="281" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="800">
        CHỦ QUYỀN 100% • NGHỊ ĐỊNH 13
      </text>

      <text x="0" y="303" textAnchor="middle" fill="#1e293b" fontSize="10.5" fontWeight="800">
        Toàn Quyền Kiểm Soát Dữ Liệu
      </text>
      <text x="0" y="318" textAnchor="middle" fill="#64748b" fontSize="8.5" fontWeight="600">
        Trích xuất hoặc yêu cầu xóa vĩnh viễn
      </text>
    </g>
  );
}
