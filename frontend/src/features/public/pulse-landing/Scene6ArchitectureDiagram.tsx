import { memo } from 'react';

interface Scene6ArchitectureDiagramProps {
  suiteId: string;
  isCenter?: boolean;
  className?: string;
}

export const Scene6ArchitectureDiagram = memo(function Scene6ArchitectureDiagram({
  suiteId,
  isCenter = false,
  className = '',
}: Scene6ArchitectureDiagramProps) {
  return (
    <div className={`scene6-diagram-root ${isCenter ? 'is-center-diagram' : 'is-flank-diagram'} ${className}`}>
      <svg
        viewBox="0 0 800 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="scene6-diagram-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle Technical Blueprint Grid */}
          <pattern id={`diag-grid-${suiteId}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.2" fill="rgba(148, 163, 184, 0.25)" />
          </pattern>

          {/* Gradients */}
          <linearGradient id="primary-glow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.04" />
          </linearGradient>

          <linearGradient id="active-card-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          <linearGradient id="badge-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="soft-shadow" x="-8%" y="-8%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Blueprint background grid */}
        <rect width="800" height="480" fill="#f8fafc" />
        <rect width="800" height="480" fill={`url(#diag-grid-${suiteId})`} />

        {/* Outer subtle frame */}
        <rect
          x="16"
          y="16"
          width="768"
          height="448"
          rx="16"
          fill="none"
          stroke="rgba(203, 213, 225, 0.6)"
          strokeWidth="1.2"
          strokeDasharray="6 4"
        />

        {/* Scaled & Centered Diagram Content Group - Shrink to fit dome slices with generous breathing room */}
        <g
          className="scene6-diagram-content-scale"
          transform="translate(400, 230) scale(0.72) translate(-400, -230)"
        >
          {suiteId === 'isolation' && <IsolationDiagram />}
          {suiteId === 'rbac' && <RbacDiagram />}
          {suiteId === 'ai-boundary' && <AiBoundaryDiagram />}
          {suiteId === 'audit-log' && <AuditLogDiagram />}
          {suiteId === 'infrastructure' && <InfrastructureDiagram />}
        </g>
      </svg>
    </div>
  );
});

// ============================================================================
// 1. KHO DỮ LIỆU ĐỘC LẬP (MULTI-TENANT ISOLATION)
// ============================================================================
function IsolationDiagram() {
  return (
    <g className="diag-group animate-diagram">
      {/* Top Header Strip */}
      <rect x="36" y="32" width="280" height="26" rx="6" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
      <circle cx="50" cy="45" r="4" fill="#2563eb" />
      <text x="62" y="49" fill="#1e40af" fontSize="10" fontWeight="700" fontFamily="monospace">
        KIẾN TRÚC // CÔ LẬP VÙNG DỮ LIỆU TỔ CHỨC
      </text>

      {/* Main Bus Header */}
      <line x1="100" y1="90" x2="700" y2="90" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
      <rect x="290" y="78" width="220" height="24" rx="12" fill="#0f172a" />
      <text x="400" y="94" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="700" fontFamily="monospace">
        CỔNG ĐIỀU PHỐI DỮ LIỆU TẬP TRUNG
      </text>

      {/* Bus Connection Drops */}
      <line x1="200" y1="102" x2="200" y2="135" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="400" y1="102" x2="400" y2="135" stroke="#2563eb" strokeWidth="2.5" />
      <line x1="600" y1="102" x2="600" y2="135" stroke="#94a3b8" strokeWidth="1.5" />

      {/* TENANT A (Faint Pod) */}
      <g opacity="0.6">
        <rect x="110" y="135" width="180" height="235" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="110" y="135" width="180" height="38" rx="14" fill="#f1f5f9" />
        <text x="200" y="159" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">
          Doanh Nghiệp A
        </text>
        <rect x="130" y="195" width="140" height="28" rx="6" fill="#f8fafc" stroke="#e2e8f0" />
        <text x="200" y="213" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontWeight="600">
          Tenant Schema 01
        </text>
        <rect x="130" y="235" width="140" height="28" rx="6" fill="#f8fafc" stroke="#e2e8f0" />
        <text x="200" y="253" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontWeight="600">
          Khóa Riêng Biệt
        </text>
        <circle cx="200" cy="310" r="22" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
        <path d="M 194 310 L 206 310 M 200 304 L 200 316" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* TENANT B: DOANH NGHIỆP CỦA BẠN (PROMINENT CENTER POD) */}
      <g filter="url(#soft-shadow)">
        {/* Isolation Sandbox Protective Glow */}
        <rect
          x="292"
          y="125"
          width="216"
          height="255"
          rx="18"
          fill="none"
          stroke="#0284c7"
          strokeWidth="2"
          strokeDasharray="6 4"
        />

        {/* Main Tenant Container */}
        <rect x="300" y="133" width="200" height="239" rx="14" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />

        {/* Header Bar */}
        <rect x="300" y="133" width="200" height="42" rx="14" fill="url(#badge-glow)" />
        <circle cx="324" cy="154" r="5" fill="#10b981" />
        <text x="340" y="158" fill="#ffffff" fontSize="11" fontWeight="800">
          DOANH NGHIỆP CỦA BẠN
        </text>

        {/* Schema Box 1 */}
        <rect x="320" y="190" width="160" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.2" />
        <text x="400" y="211" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontWeight="700">
          DEDICATED SCHEMA
        </text>

        {/* Schema Box 2: Encryption */}
        <rect x="320" y="234" width="160" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.2" />
        <text x="400" y="255" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontWeight="700">
          MÃ HÓA AES-256 GCM
        </text>

        {/* Storage Volume Box */}
        <rect x="320" y="278" width="160" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.2" />
        <text x="400" y="299" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontWeight="700">
          VÙNG LƯU TRỮ CÔ LẬP
        </text>

        {/* Active Shield Badge at Bottom */}
        <rect x="345" y="324" width="110" height="22" rx="11" fill="#10b981" />
        <text x="400" y="339" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">
          0 TRUY CẬP CHÉO
        </text>
      </g>

      {/* TENANT C (Faint Pod) */}
      <g opacity="0.6">
        <rect x="510" y="135" width="180" height="235" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="510" y="135" width="180" height="38" rx="14" fill="#f1f5f9" />
        <text x="600" y="159" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">
          Doanh Nghiệp C
        </text>
        <rect x="530" y="195" width="140" height="28" rx="6" fill="#f8fafc" stroke="#e2e8f0" />
        <text x="600" y="213" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontWeight="600">
          Tenant Schema 03
        </text>
        <rect x="530" y="235" width="140" height="28" rx="6" fill="#f8fafc" stroke="#e2e8f0" />
        <text x="600" y="253" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontWeight="600">
          Khóa Riêng Biệt
        </text>
        <circle cx="600" cy="310" r="22" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
        <path d="M 594 310 L 606 310 M 600 304 L 600 316" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Bottom Footer Specs */}
      <rect x="160" y="405" width="480" height="34" rx="17" fill="#0f172a" />
      <text x="400" y="426" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="700">
        PHÂN VÙNG LƯU TRỮ CÔ LẬP • NGĂN NGỪA TRUY CẬP CHÉO GIỮA CÁC TỔ CHỨC
      </text>
    </g>
  );
}

// ============================================================================
// 2. TRẠM PHÂN QUYỀN ĐÚNG THẨM QUYỀN (RBAC HIERARCHY TREE)
// ============================================================================
function RbacDiagram() {
  return (
    <g className="diag-group animate-diagram">
      {/* Top Header Strip */}
      <rect x="36" y="32" width="280" height="26" rx="6" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
      <circle cx="50" cy="45" r="4" fill="#2563eb" />
      <text x="62" y="49" fill="#1e40af" fontSize="10" fontWeight="700" fontFamily="monospace">
        MÔ HÌNH // PHÂN CẤP QUẢN TRỊ 4 TẦNG THẨM QUYỀN
      </text>

      {/* TIER 1: BAN GIÁM ĐỐC (TOP CENTER) */}
      <g filter="url(#soft-shadow)">
        <rect x="290" y="78" width="220" height="64" rx="12" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
        <rect x="300" y="86" width="200" height="20" rx="6" fill="#1e3a8a" />
        <text x="400" y="100" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">
          CẤP 1: BAN GIÁM ĐỐC
        </text>
        <text x="400" y="126" textAnchor="middle" fill="#1e293b" fontSize="10.5" fontWeight="700">
          Xem Báo Cáo Tổng Hợp Toàn Doanh Nghiệp
        </text>
      </g>

      {/* Connection Lines from Tier 1 to Tier 2 & Admin */}
      <path d="M 400 142 L 400 170" stroke="#2563eb" strokeWidth="2" />
      <path d="M 400 170 L 220 170 L 220 200" stroke="#2563eb" strokeWidth="2" />
      <path d="M 400 170 L 580 170 L 580 200" stroke="#2563eb" strokeWidth="2" />

      {/* TIER 2: QUẢN LÝ PHÒNG BAN (LEFT) */}
      <g filter="url(#soft-shadow)">
        <rect x="110" y="200" width="220" height="74" rx="12" fill="#ffffff" stroke="#0284c7" strokeWidth="1.8" />
        <rect x="120" y="208" width="200" height="20" rx="6" fill="#0284c7" />
        <text x="220" y="222" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">
          CẤP 2: QUẢN LÝ PHÒNG BAN
        </text>
        <text x="220" y="246" textAnchor="middle" fill="#0f172a" fontSize="10.5" fontWeight="700">
          Phạm Vi Đội Ngũ Trực Thuộc
        </text>
        <text x="220" y="262" textAnchor="middle" fill="#64748b" fontSize="9.5" fontWeight="600">
          Bảng xếp hạng &amp; Tiến độ phòng ban
        </text>
      </g>

      {/* TIER 4: QUẢN TRỊ VIÊN HR (RIGHT) */}
      <g filter="url(#soft-shadow)">
        <rect x="470" y="200" width="220" height="74" rx="12" fill="#ffffff" stroke="#0284c7" strokeWidth="1.8" />
        <rect x="480" y="208" width="200" height="20" rx="6" fill="#0284c7" />
        <text x="580" y="222" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">
          CẤP 4: QUẢN TRỊ VIÊN HR
        </text>
        <text x="580" y="246" textAnchor="middle" fill="#0f172a" fontSize="10.5" fontWeight="700">
          Phân Quyền &amp; Thiết Lập Đề Thi
        </text>
        <text x="580" y="262" textAnchor="middle" fill="#64748b" fontSize="9.5" fontWeight="600">
          Không can thiệp bài làm thí sinh
        </text>
      </g>

      {/* Connection Line from Tier 2 to Tier 3 */}
      <path d="M 220 274 L 220 310" stroke="#0284c7" strokeWidth="2" />

      {/* TIER 3: NHÂN VIÊN / THÍ SINH (BOTTOM LEFT-CENTER) */}
      <g filter="url(#soft-shadow)">
        <rect x="110" y="310" width="350" height="68" rx="12" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
        <rect x="120" y="318" width="330" height="20" rx="6" fill="#10b981" />
        <text x="285" y="332" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">
          CẤP 3: NHÂN VIÊN / THÍ SINH (DỮ LIỆU RIÊNG TƯ)
        </text>
        <text x="285" y="358" textAnchor="middle" fill="#0f172a" fontSize="10.5" fontWeight="700">
          Chỉ xem kết quả làm bài, điểm số và lộ trình phát triển của chính mình
        </text>
      </g>

      {/* Security Scope Tag on Right */}
      <rect x="480" y="310" width="210" height="68" rx="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
      <text x="585" y="335" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="700">
        RANH GIỚI THẨM QUYỀN
      </text>
      <text x="585" y="355" textAnchor="middle" fill="#16a34a" fontSize="9.5" fontWeight="700">
        ✓ Đúng thẩm quyền chức vụ
      </text>
      <text x="585" y="369" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">
        ✓ Nhật ký phân quyền tự động
      </text>

      {/* Bottom Footer Specs */}
      <rect x="150" y="405" width="500" height="34" rx="17" fill="#0f172a" />
      <text x="400" y="426" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="700">
        PHÂN QUYỀN CHẶT CHẼ THEO CƠ CẤU • BẢO MẬT KẾT QUẢ VÀ BÁO CÁO NỘI BỘ
      </text>
    </g>
  );
}

// ============================================================================
// 3. VÀNH ĐAI BẢO MẬT AI (CLOSED-LOOP AI PERIMETER)
// ============================================================================
function AiBoundaryDiagram() {
  return (
    <g className="diag-group animate-diagram">
      {/* Top Header Strip */}
      <rect x="36" y="32" width="290" height="26" rx="6" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
      <circle cx="50" cy="45" r="4" fill="#2563eb" />
      <text x="62" y="49" fill="#1e40af" fontSize="9.5" fontWeight="700" fontFamily="monospace">
        RANH GIỚI // KHOANH VÙNG XỬ LÝ AI KHÉP KÍN
      </text>

      {/* BLOCKED EXTERNAL CLOUD (OUTSIDE PERIMETER - TOP RIGHT) */}
      <g opacity="0.85">
        <rect x="520" y="70" width="230" height="74" rx="12" fill="#fef2f2" stroke="#fca5a5" strokeWidth="1.5" />
        <rect x="530" y="78" width="210" height="20" rx="6" fill="#ef4444" />
        <text x="635" y="92" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="800">
          PUBLIC AI CLOUD (MÔ HÌNH MỞ)
        </text>
        <text x="635" y="118" textAnchor="middle" fill="#b91c1c" fontSize="10" fontWeight="700">
          ✕ CHẶN CHIA SẺ DỮ LIỆU
        </text>
        <text x="635" y="134" textAnchor="middle" fill="#7f1d1d" fontSize="9" fontWeight="600">
          Không chia sẻ dữ liệu ra mô hình mở
        </text>
      </g>

      {/* Outbound Blocked Arrow */}
      <path d="M 440 180 L 520 135" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 5" />
      <circle cx="480" cy="157" r="12" fill="#ef4444" />
      <text x="480" y="161" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="800">
        ✕
      </text>

      {/* CLOSED-LOOP ENTERPRISE SANDBOX (INSIDE PERIMETER) */}
      <g filter="url(#soft-shadow)">
        {/* Perimeter Wall */}
        <rect
          x="50"
          y="70"
          width="440"
          height="315"
          rx="18"
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth="2.5"
        />

        {/* Perimeter Banner */}
        <rect x="50" y="70" width="440" height="38" rx="18" fill="url(#badge-glow)" />
        <circle cx="76" cy="89" r="5" fill="#10b981" />
        <text x="92" y="93" fill="#ffffff" fontSize="11" fontWeight="800">
          MÔI TRƯỜNG XỬ LÝ AI KHÉP KÍN (ENTERPRISE SANDBOX)
        </text>

        {/* Step 1: Input Data */}
        <rect x="80" y="125" width="380" height="52" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
        <circle cx="106" cy="151" r="14" fill="#eff6ff" />
        <text x="106" y="155" textAnchor="middle" fill="#2563eb" fontSize="11" fontWeight="800">
          01
        </text>
        <text x="135" y="146" fill="#0f172a" fontSize="11" fontWeight="700">
          Đề Thi &amp; Bài Làm Của Thí Sinh
        </text>
        <text x="135" y="163" fill="#64748b" fontSize="9.5" fontWeight="600">
          Dữ liệu mã hóa TLS 1.3 trong quá trình truyền tải
        </text>

        {/* Connector Arrow 1 */}
        <path d="M 270 177 L 270 200" stroke="#2563eb" strokeWidth="2" />
        <polygon points="266,198 274,198 270,204" fill="#2563eb" />

        {/* Step 2: Local AI Inference */}
        <rect x="80" y="202" width="380" height="58" rx="10" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.8" />
        <circle cx="106" cy="231" r="14" fill="#2563eb" />
        <text x="106" y="235" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">
          02
        </text>
        <text x="135" y="224" fill="#1e3a8a" fontSize="11" fontWeight="800">
          Mô-đun AI Suy Luận Nội Bộ (Private Inference)
        </text>
        <text x="135" y="243" fill="#2563eb" fontSize="9.5" fontWeight="700">
          Chấm điểm tự động • Phân tích năng lực theo tiêu chí đã duyệt
        </text>

        {/* Connector Arrow 2 */}
        <path d="M 270 260 L 270 283" stroke="#2563eb" strokeWidth="2" />
        <polygon points="266,281 274,281 270,287" fill="#2563eb" />

        {/* Step 3: Verified Results Output */}
        <rect x="80" y="285" width="380" height="52" rx="10" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.2" />
        <circle cx="106" cy="311" r="14" fill="#10b981" />
        <text x="106" y="315" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">
          03
        </text>
        <text x="135" y="306" fill="#14532d" fontSize="11" fontWeight="700">
          Bảng Điểm &amp; Báo Cáo Nội Bộ
        </text>
        <text x="135" y="323" fill="#16a34a" fontSize="9.5" fontWeight="600">
          Lưu trữ trực tiếp vào kho dữ liệu riêng của doanh nghiệp
        </text>

        {/* Commitment Badge */}
        <rect x="120" y="347" width="300" height="24" rx="12" fill="#0f172a" />
        <text x="270" y="363" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="800">
          ZERO EXTERNAL TRAINING // KHÔNG HUẤN LUYỆN MÔ HÌNH MỞ
        </text>
      </g>

      {/* Right Tech Spec Card */}
      <g filter="url(#soft-shadow)">
        <rect x="520" y="170" width="230" height="215" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
        <rect x="530" y="180" width="210" height="26" rx="6" fill="#f8fafc" />
        <text x="635" y="197" textAnchor="middle" fill="#0f172a" fontSize="10.5" fontWeight="800">
          THÔNG SỐ BẢO VỆ AI
        </text>

        <rect x="535" y="218" width="200" height="34" rx="6" fill="#eff6ff" />
        <text x="635" y="234" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontWeight="700">
          Mã Hóa Đường Truyền TLS 1.3
        </text>
        <text x="635" y="246" textAnchor="middle" fill="#64748b" fontSize="8.5">
          End-to-End Encryption
        </text>

        <rect x="535" y="260" width="200" height="34" rx="6" fill="#eff6ff" />
        <text x="635" y="276" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontWeight="700">
          Vùng Chạy Cô Lập (Sandbox)
        </text>
        <text x="635" y="288" textAnchor="middle" fill="#64748b" fontSize="8.5">
          Isolated Runtime Container
        </text>

        <rect x="535" y="302" width="200" height="34" rx="6" fill="#f0fdf4" />
        <text x="635" y="318" textAnchor="middle" fill="#15803d" fontSize="9.5" fontWeight="700">
          Quyền Sở Hữu Dữ Liệu
        </text>
        <text x="635" y="330" textAnchor="middle" fill="#16a34a" fontSize="8.5">
          Thuộc 100% về Doanh Nghiệp
        </text>
      </g>

      {/* Bottom Footer Specs */}
      <rect x="140" y="405" width="520" height="34" rx="17" fill="#0f172a" />
      <text x="400" y="426" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="700">
        XỬ LÝ DỮ LIỆU KHÉP KÍN • CAM KẾT KHÔNG DÙNG DỮ LIỆU ĐỂ HUẤN LUYỆN AI MỞ
      </text>
    </g>
  );
}

// ============================================================================
// 4. TRUNG TÂM ĐỐI SOÁT & CHỨNG NHẬN (AUDIT LEDGER & VERIFICATION)
// ============================================================================
function AuditLogDiagram() {
  return (
    <g className="diag-group animate-diagram">
      {/* Top Header Strip */}
      <rect x="36" y="32" width="290" height="26" rx="6" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
      <circle cx="50" cy="45" r="4" fill="#2563eb" />
      <text x="62" y="49" fill="#1e40af" fontSize="9.5" fontWeight="700" fontFamily="monospace">
        NHẬT KÝ // LƯU VẾT THAO TÁC &amp; CHỨNG NHẬN SỐ
      </text>

      {/* Timeline Steps (3 Horizontal Blocks) */}
      <g filter="url(#soft-shadow)">
        {/* Step 1 */}
        <rect x="60" y="85" width="200" height="110" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
        <rect x="70" y="95" width="180" height="20" rx="6" fill="#f1f5f9" />
        <text x="80" y="109" fill="#64748b" fontSize="9.5" fontWeight="700" fontFamily="monospace">
          10:14:02 // NỘP BÀI
        </text>
        <text x="80" y="135" fill="#0f172a" fontSize="10.5" fontWeight="700">
          Ghi nhận thao tác
        </text>
        <text x="80" y="153" fill="#64748b" fontSize="9.5" fontWeight="500">
          Xác thực danh tính thí sinh
        </text>
        <text x="80" y="175" fill="#2563eb" fontSize="9" fontWeight="700" fontFamily="monospace">
          IP: 113.161.xx.xx
        </text>

        {/* Step Arrow 1 */}
        <path d="M 265 140 L 295 140" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 4" />
        <polygon points="293,136 301,140 293,144" fill="#2563eb" />

        {/* Step 2 */}
        <rect x="300" y="85" width="200" height="110" rx="12" fill="#ffffff" stroke="#2563eb" strokeWidth="1.8" />
        <rect x="310" y="95" width="180" height="20" rx="6" fill="#eff6ff" />
        <text x="320" y="109" fill="#1e40af" fontSize="9.5" fontWeight="700" fontFamily="monospace">
          10:14:03 // CHẤM ĐIỂM
        </text>
        <text x="320" y="135" fill="#0f172a" fontSize="10.5" fontWeight="700">
          AI phân tích bài thi
        </text>
        <text x="320" y="153" fill="#64748b" fontSize="9.5" fontWeight="500">
          Tính điểm theo rubric chuẩn
        </text>
        <text x="320" y="175" fill="#10b981" fontSize="9" fontWeight="700" fontFamily="monospace">
          ĐIỂM: 92/100 • HOÀN THÀNH
        </text>

        {/* Step Arrow 2 */}
        <path d="M 505 140 L 535 140" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 4" />
        <polygon points="533,136 541,140 533,144" fill="#2563eb" />

        {/* Step 3 */}
        <rect x="540" y="85" width="200" height="110" rx="12" fill="#ffffff" stroke="#10b981" strokeWidth="1.8" />
        <rect x="550" y="95" width="180" height="20" rx="6" fill="#f0fdf4" />
        <text x="560" y="109" fill="#15803d" fontSize="9.5" fontWeight="700" fontFamily="monospace">
          10:14:05 // CẤP CHỨNG NHẬN
        </text>
        <text x="560" y="135" fill="#0f172a" fontSize="10.5" fontWeight="700">
          Khởi tạo mã chứng chỉ
        </text>
        <text x="560" y="153" fill="#64748b" fontSize="9.5" fontWeight="500">
          Tạo mã tra cứu công khai
        </text>
        <text x="560" y="175" fill="#059669" fontSize="9" fontWeight="700" fontFamily="monospace">
          MÃ SỐ: #PLS-9824-A8
        </text>
      </g>

      {/* Main Digital Certificate Verification Card */}
      <g filter="url(#soft-shadow)">
        <rect x="150" y="215" width="500" height="165" rx="16" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />

        {/* Certificate Card Header */}
        <rect x="150" y="215" width="500" height="38" rx="16" fill="url(#badge-glow)" />
        <text x="400" y="239" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="800">
          BẢNG ĐỐI SOÁT &amp; CHỨNG NHẬN SỐ ĐỊNH DANH
        </text>

        {/* Hash ID Box */}
        <rect x="180" y="270" width="290" height="42" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
        <text x="195" y="288" fill="#64748b" fontSize="9" fontWeight="600">
          MÃ HASH XÁC THỰC (VERIFICATION HASH):
        </text>
        <text x="195" y="304" fill="#0f172a" fontSize="10.5" fontWeight="800" fontFamily="monospace">
          0x7F8C4B...D9E2A84F [HỢP LỆ]
        </text>

        {/* Official Stamp Badge */}
        <rect x="490" y="265" width="130" height="52" rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
        <circle cx="514" cy="291" r="12" fill="#10b981" />
        <text x="514" y="296" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="800">
          ✓
        </text>
        <text x="536" y="286" fill="#14532d" fontSize="9.5" fontWeight="800">
          XÁC THỰC
        </text>
        <text x="536" y="302" fill="#16a34a" fontSize="8.5" fontWeight="700">
          Chống sửa đổi
        </text>

        {/* Export Support Line */}
        <text x="400" y="348" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="600">
          Hỗ trợ xuất báo cáo kiểm toán định dạng PDF &amp; Excel • Tra cứu hồ sơ 24/7
        </text>
      </g>

      {/* Bottom Footer Specs */}
      <rect x="140" y="405" width="520" height="34" rx="17" fill="#0f172a" />
      <text x="400" y="426" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="700">
        LƯU VẾT THỜI GIAN THỰC • MÃ HASH ĐỊNH DANH MINH BẠCH KHI ĐỐI SOÁT
      </text>
    </g>
  );
}

// ============================================================================
// 5. HẠ TẦNG ĐIỆN TOÁN & SAO LƯU KÉP (HIGH-AVAILABILITY & BACKUP)
// ============================================================================
function InfrastructureDiagram() {
  return (
    <g className="diag-group animate-diagram">
      {/* Top Header Strip */}
      <rect x="36" y="32" width="290" height="26" rx="6" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
      <circle cx="50" cy="45" r="4" fill="#2563eb" />
      <text x="62" y="49" fill="#1e40af" fontSize="9.5" fontWeight="700" fontFamily="monospace">
        HẠ TẦNG // CỤM MÁY CHỦ NỘI ĐỊA DỰ PHÒNG KÉP
      </text>

      {/* PRIMARY NODE (LEFT) */}
      <g filter="url(#soft-shadow)">
        <rect x="70" y="80" width="260" height="295" rx="16" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
        <rect x="70" y="80" width="260" height="42" rx="16" fill="url(#badge-glow)" />
        <circle cx="95" cy="101" r="5" fill="#10b981" />
        <text x="110" y="105" fill="#ffffff" fontSize="11" fontWeight="800">
          MÁY CHỦ CHÍNH (PRIMARY NODE)
        </text>

        <rect x="90" y="135" width="220" height="32" rx="6" fill="#f8fafc" stroke="#e2e8f0" />
        <text x="105" y="155" fill="#0f172a" fontSize="10" fontWeight="700">
          Trung Tâm Dữ Liệu: Hà Nội
        </text>

        {/* Server Rack Simulation */}
        <rect x="90" y="180" width="220" height="34" rx="6" fill="#0f172a" />
        <circle cx="110" cy="197" r="4" fill="#10b981" />
        <circle cx="124" cy="197" r="4" fill="#38bdf8" />
        <text x="140" y="201" fill="#f8fafc" fontSize="9.5" fontWeight="700" fontFamily="monospace">
          APP CLUSTER 01 // ACTIVE
        </text>

        <rect x="90" y="224" width="220" height="34" rx="6" fill="#0f172a" />
        <circle cx="110" cy="241" r="4" fill="#10b981" />
        <circle cx="124" cy="241" r="4" fill="#38bdf8" />
        <text x="140" y="245" fill="#f8fafc" fontSize="9.5" fontWeight="700" fontFamily="monospace">
          DATABASE REPLICA // ACTIVE
        </text>

        <rect x="90" y="268" width="220" height="34" rx="6" fill="#0f172a" />
        <circle cx="110" cy="285" r="4" fill="#10b981" />
        <circle cx="124" cy="285" r="4" fill="#38bdf8" />
        <text x="140" y="289" fill="#f8fafc" fontSize="9.5" fontWeight="700" fontFamily="monospace">
          LOAD BALANCER // ONLINE
        </text>

        {/* Status Badge */}
        <rect x="120" y="324" width="160" height="24" rx="12" fill="#f0fdf4" stroke="#86efac" />
        <text x="200" y="340" textAnchor="middle" fill="#15803d" fontSize="9.5" fontWeight="800">
          Uptime Sẵn Sàng 99.9%
        </text>
      </g>

      {/* SYNC PIPELINE (CENTER BRIDGE) */}
      <g>
        <line x1="335" y1="195" x2="465" y2="195" stroke="#2563eb" strokeWidth="3" strokeDasharray="6 4" />
        <line x1="465" y1="250" x2="335" y2="250" stroke="#0284c7" strokeWidth="3" strokeDasharray="6 4" />

        <rect x="345" y="205" width="110" height="34" rx="8" fill="#0f172a" />
        <text x="400" y="222" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="800">
          ĐỒNG BỘ LIÊN TỤC
        </text>
        <text x="400" y="233" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="600">
          Real-time Mirroring
        </text>
      </g>

      {/* BACKUP NODE (RIGHT) */}
      <g filter="url(#soft-shadow)">
        <rect x="470" y="80" width="260" height="295" rx="16" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
        <rect x="470" y="80" width="260" height="42" rx="16" fill="#0284c7" />
        <circle cx="495" cy="101" r="5" fill="#38bdf8" />
        <text x="510" y="105" fill="#ffffff" fontSize="11" fontWeight="800">
          MÁY CHỦ DỰ PHÒNG (BACKUP NODE)
        </text>

        <rect x="490" y="135" width="220" height="32" rx="6" fill="#f8fafc" stroke="#e2e8f0" />
        <text x="505" y="155" fill="#0f172a" fontSize="10" fontWeight="700">
          Trung Tâm Dữ Liệu: TP. Hồ Chí Minh
        </text>

        {/* Backup Node Features */}
        <rect x="490" y="180" width="220" height="42" rx="8" fill="#eff6ff" stroke="#bfdbfe" />
        <text x="505" y="200" fill="#1e40af" fontSize="10" fontWeight="700">
          Sao Lưu Tự Động Định Kỳ
        </text>
        <text x="505" y="214" fill="#2563eb" fontSize="9" fontWeight="600">
          Thời gian snapshot: 02:00 AM hằng ngày
        </text>

        <rect x="490" y="235" width="220" height="42" rx="8" fill="#eff6ff" stroke="#bfdbfe" />
        <text x="505" y="255" fill="#1e40af" fontSize="10" fontWeight="700">
          Dự Phòng Thảm Họa (DR)
        </text>
        <text x="505" y="269" fill="#2563eb" fontSize="9" fontWeight="600">
          Tự động kích hoạt khi có sự cố
        </text>

        {/* Status Badge */}
        <rect x="520" y="324" width="160" height="24" rx="12" fill="#eff6ff" stroke="#93c5fd" />
        <text x="600" y="340" textAnchor="middle" fill="#1d4ed8" fontSize="9.5" fontWeight="800">
          Hot Standby Ready
        </text>
      </g>

      {/* Bottom Footer Specs */}
      <rect x="140" y="405" width="520" height="34" rx="17" fill="#0f172a" />
      <text x="400" y="426" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="700">
        TRUNG TÂM DỮ LIỆU TẠI VIỆT NAM • SAO LƯU TỰ ĐỘNG HẰNG NGÀY &amp; SẴN SÀNG CHỊU TẢI
      </text>
    </g>
  );
}
