import { useState } from 'react';
import {
  Check,
  Eye,
  Award,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Compass,
  ShieldCheck,
  Search,
  Database,
  MessageSquare,
  Palette,
  Shield,
  Cpu,
  Sparkles,
  Building2,
  Briefcase,
  Mail,
  Calendar,
  ChevronDown,
  ChevronUp,
  Users,
} from 'lucide-react';
import { Modal } from '@/components/shared';
import type { TrialParticipantStatus, TrialReport, TrialReportEmployee, TrialStage } from '@/services/trial-program.service';
import { LEVEL_LABELS, STAGE } from '../lib/trial-format';

export const DOMAIN_THEMES = [
  {
    number: 1,
    name: 'Khai thác dữ liệu và thông tin',
    shortName: '1. Dữ liệu & TT',
    tableHeader: '1. Dữ liệu',
    icon: Database,
    color: '#0284c7', // Sky-600
    glowColor: 'rgba(2, 132, 199, 0.45)',
    bgClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
    lightBg: 'bg-sky-50',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-200',
  },
  {
    number: 2,
    name: 'Giao tiếp và hợp tác trong môi trường số',
    shortName: '2. Giao tiếp & HT',
    tableHeader: '2. Giao tiếp',
    icon: MessageSquare,
    color: '#0d9488', // Teal-600
    glowColor: 'rgba(13, 148, 136, 0.45)',
    bgClass: 'bg-teal-50 text-teal-700 border-teal-200/80',
    lightBg: 'bg-teal-50',
    textClass: 'text-teal-700',
    borderClass: 'border-teal-200',
  },
  {
    number: 3,
    name: 'Sáng tạo nội dung số',
    shortName: '3. Sáng tạo số',
    tableHeader: '3. Sáng tạo',
    icon: Palette,
    color: '#7c3aed', // Purple-600
    glowColor: 'rgba(124, 58, 237, 0.45)',
    bgClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
    lightBg: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
  },
  {
    number: 4,
    name: 'An toàn',
    shortName: '4. An toàn số',
    tableHeader: '4. An toàn',
    icon: Shield,
    color: '#059669', // Emerald-600
    glowColor: 'rgba(5, 150, 105, 0.45)',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    lightBg: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
  },
  {
    number: 5,
    name: 'Giải quyết vấn đề',
    shortName: '5. Giải quyết VĐ',
    tableHeader: '5. Giải quyết VĐ',
    icon: Cpu,
    color: '#d97706', // Amber-600
    glowColor: 'rgba(217, 119, 6, 0.45)',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    lightBg: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
  },
  {
    number: 6,
    name: 'Ứng dụng trí tuệ nhân tạo',
    shortName: '6. Trí tuệ AI',
    tableHeader: '6. Trí tuệ AI',
    icon: Sparkles,
    color: '#4f46e5', // Indigo-600
    glowColor: 'rgba(79, 70, 229, 0.45)',
    bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    lightBg: 'bg-indigo-50',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-200',
  },
];

export function LevelBadge({ level, size = 'default' }: { level: number; size?: 'default' | 'sm' }) {
  const value = Math.max(0, Math.min(3, Math.round(level)));
  const styles = [
    'bg-slate-100/90 text-slate-600 border-slate-200/90 font-medium', // 0: Chưa đạt
    'bg-sky-50 text-sky-700 border-sky-200/90 font-bold', // 1: Cơ bản
    'bg-indigo-50 text-indigo-700 border-indigo-200/90 font-bold', // 2: Trung cấp
    'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-bold', // 3: Nâng cao
  ];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] min-w-[64px]' : 'px-2.5 py-1 text-xs min-w-[76px]';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl border shadow-2xs transition-all ${sizeClasses} ${styles[value]}`}
    >
      {LEVEL_LABELS[value]}
    </span>
  );
}

const PARTICIPANT: Record<TrialParticipantStatus, { label: string; tone: string }> = {
  INVITED: { label: 'Đã mời', tone: '' },
  INVITE_EXPIRED: { label: 'Lời mời hết hạn', tone: 'bad' },
  ACTIVE: { label: 'Chưa làm bài', tone: 'warn' },
  SUBMITTED: { label: 'Đã nộp', tone: 'info' },
  REVIEWED: { label: 'Đã chấm', tone: 'ok' },
};

export function ParticipantStatus({ status }: { status: TrialParticipantStatus }) {
  const s = PARTICIPANT[status];
  return <span className={`tp-badge ${s.tone}`}>{s.label}</span>;
}

export function StageBadge({ stage }: { stage: TrialStage }) {
  return <span className={`tp-badge ${STAGE[stage].tone}`}>{STAGE[stage].label}</span>;
}

/** Thanh bước: index = bước hiện tại (0-based); các bước trước đã xong. */
export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <nav aria-label="Các bước dùng thử" className="w-full">
      <ol className="flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
        {steps.map((step, index) => {
          const isDone = index < current;
          const isCurrent = index === current;
          return (
            <li
              key={step}
              className={`flex-1 flex items-center justify-center sm:justify-start gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs transition-all ${
                isDone
                  ? 'bg-emerald-50/80 text-emerald-800 font-semibold border border-emerald-200/60'
                  : isCurrent
                  ? 'bg-[#137b84]/10 text-[#0e5968] font-bold border border-[#137b84]/30 shadow-2xs'
                  : 'bg-transparent text-slate-400 font-medium'
              }`}
            >
              <span
                className={`grid size-5 place-items-center rounded-full text-[10px] font-bold shrink-0 transition-colors ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-[#137b84] text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? <Check size={11} strokeWidth={3} /> : index + 1}
              </span>
              <span className="hidden sm:inline truncate">{step}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function LevelLegend() {
  const dots = [
    { bg: 'bg-slate-300' },
    { bg: 'bg-sky-400' },
    { bg: 'bg-blue-600' },
    { bg: 'bg-indigo-700' },
  ];
  return (
    <div
      className="inline-flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs"
      aria-hidden
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-0.5">Cấp độ:</span>
      {LEVEL_LABELS.map((label, level) => (
        <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <span className={`size-2 rounded-full ${dots[level]?.bg ?? 'bg-slate-300'} ring-2 ring-white shadow-2xs`} />
          <span className="text-[11px]">{label}</span>
        </span>
      ))}
    </div>
  );
}

function CapabilityRadarChart({ summary }: { summary: TrialReport['summary'] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const size = 320;
  const center = size / 2;
  const radius = 98;
  const totalAxes = 6;

  const getCoordinates = (index: number, value: number) => {
    const angle = ((Math.PI * 2) / totalAxes) * index - Math.PI / 2;
    // Tối thiểu 0.25/3 để polygon luôn có độ mở phát sáng đẹp mắt, không bao giờ bị co rúm thành 1 chấm biến mất
    const r = (Math.max(0.25, Math.min(3, value)) / 3) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = ((Math.PI * 2) / totalAxes) * index - Math.PI / 2;
    const r = radius + 28;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getGridPolygon = (level: number) => {
    return Array.from({ length: totalAxes })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const getSectorPath = (index: number, outerR: number) => {
    const midAngle = ((Math.PI * 2) / totalAxes) * index - Math.PI / 2;
    const startAngle = midAngle - Math.PI / totalAxes;
    const endAngle = midAngle + Math.PI / totalAxes;

    const x1 = center + outerR * Math.cos(startAngle);
    const y1 = center + outerR * Math.sin(startAngle);
    const x2 = center + outerR * Math.cos(endAngle);
    const y2 = center + outerR * Math.sin(endAngle);

    return `M ${center} ${center} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${outerR} ${outerR} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
  };

  const companyPolygon = summary
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.average);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const activeDomain = hoveredIndex !== null ? summary[hoveredIndex] : null;
  const activeTheme = hoveredIndex !== null ? DOMAIN_THEMES[hoveredIndex] : null;

  return (
    <div className="relative flex flex-col items-center justify-center p-2 w-full select-none">
      {/* Floating Interactive Tooltip HUD */}
      <div className="h-9 flex items-center justify-center mb-1">
        {activeDomain && activeTheme ? (
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white shadow-xl border border-slate-700 text-xs animate-in fade-in zoom-in-95 duration-150">
            <span className="flex items-center gap-1.5 font-bold" style={{ color: activeTheme.color }}>
              <activeTheme.icon size={13} />
              {activeTheme.shortName}
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono font-bold text-emerald-400">
              {activeDomain.average.toFixed(1)} / 3.0
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-white/20 text-white">
              {LEVEL_LABELS[activeDomain.level ?? 0]}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/90 text-slate-500 text-[11px] font-medium border border-slate-200/60">
            <Compass size={12} className="text-teal-600" />
            Rê chuột vào các miền hoặc trục để tương tác
          </div>
        )}
      </div>

      <div className="relative flex items-center justify-center">
        {/* Radiant Ambient Aura behind radar */}
        <div
          className="absolute inset-0 rounded-full blur-2xl pointer-events-none transition-all duration-300"
          style={{
            background: activeTheme
              ? `radial-gradient(circle, ${activeTheme.glowColor} 0%, rgba(56, 189, 248, 0.16) 45%, transparent 75%)`
              : 'radial-gradient(circle, rgba(19, 123, 132, 0.25) 0%, rgba(56, 189, 248, 0.16) 45%, transparent 75%)',
          }}
        />

        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible select-none relative z-10">
          <defs>
            {/* Glowing Gradient for Radar Fill */}
            <linearGradient id="radarFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
            </linearGradient>

            {/* Glowing Drop Shadow Filter */}
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#0284c7" floodOpacity="0.55" />
            </filter>

            <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#0d9488" floodOpacity="0.85" />
            </filter>
          </defs>

          {/* Sector Highlight when hovered */}
          {hoveredIndex !== null && (
            <path
              d={getSectorPath(hoveredIndex, radius + 22)}
              fill={DOMAIN_THEMES[hoveredIndex]?.glowColor || 'rgba(19, 123, 132, 0.15)'}
              className="transition-all duration-200 pointer-events-none"
            />
          )}

          {/* Level rings L1, L2, L3 with radiant tints */}
          <polygon
            points={getGridPolygon(3)}
            fill="rgba(238, 242, 255, 0.45)"
            stroke="#818cf8"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          <polygon
            points={getGridPolygon(2)}
            fill="rgba(240, 249, 255, 0.5)"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="4,4"
            strokeOpacity="0.6"
          />
          <polygon
            points={getGridPolygon(1)}
            fill="rgba(240, 253, 250, 0.55)"
            stroke="#14b8a6"
            strokeWidth="1.2"
            strokeDasharray="3,3"
            strokeOpacity="0.7"
          />

          {/* Level labels on vertical axis */}
          <text x={center + 5} y={center - (1 / 3) * radius + 11} className="text-[9px] font-bold fill-teal-600 select-none">
            L1 (Cơ bản)
          </text>
          <text x={center + 5} y={center - (2 / 3) * radius + 11} className="text-[9px] font-bold fill-sky-600 select-none">
            L2 (Trung cấp)
          </text>
          <text x={center + 5} y={center - radius + 11} className="text-[9px] font-bold fill-indigo-600 select-none">
            L3 (Nâng cao)
          </text>

          {/* Axis spokes */}
          {Array.from({ length: totalAxes }).map((_, i) => {
            const { x, y } = getCoordinates(i, 3);
            const isHovered = hoveredIndex === i;
            const theme = DOMAIN_THEMES[i] || DOMAIN_THEMES[0];
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke={isHovered ? theme.color : '#e2e8f0'}
                strokeWidth={isHovered ? '2.5' : '1.2'}
                strokeDasharray={isHovered ? undefined : '2,2'}
                className="transition-colors duration-200 pointer-events-none"
              />
            );
          })}

          {/* Company Radar Polygon with Glow */}
          <polygon
            points={companyPolygon}
            fill="url(#radarFillGrad)"
            stroke="#0284c7"
            strokeWidth="2.5"
            filter="url(#radarGlow)"
            className="transition-all duration-300 ease-out pointer-events-none"
          />

          {/* Data points on vertices */}
          {summary.map((d, i) => {
            const { x, y } = getCoordinates(i, d.average);
            const isHovered = hoveredIndex === i;
            const theme = DOMAIN_THEMES[i] || DOMAIN_THEMES[0];
            return (
              <g key={i} className="pointer-events-none">
                {/* Pulse Ring when hovered */}
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill="none"
                    stroke={theme.color}
                    strokeWidth="2.5"
                    opacity="0.7"
                    className="animate-ping"
                  />
                )}
                {/* Outer Glow Halo */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 7.5 : 5}
                  fill={isHovered ? theme.color : '#0284c7'}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 2}
                  filter={isHovered ? 'url(#pointGlow)' : undefined}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* Domain name labels surrounding the radar */}
          {summary.map((_, i) => {
            const { x, y } = getLabelCoordinates(i);
            const isHovered = hoveredIndex === i;
            const theme = DOMAIN_THEMES[i] || DOMAIN_THEMES[0];
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Hover Pill Background */}
                {isHovered && (
                  <rect
                    x={x - 46}
                    y={y - 11}
                    width="92"
                    height="22"
                    rx="11"
                    fill={theme.color}
                    filter="url(#radarGlow)"
                    className="transition-all duration-200"
                  />
                )}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`text-[11px] select-none transition-all duration-200 ${
                    isHovered
                      ? 'font-black fill-white'
                      : 'font-bold fill-slate-700 hover:fill-slate-900'
                  }`}
                >
                  {theme.shortName}
                </text>
              </g>
            );
          })}

          {/* Invisible Pie Wedges for Effortless Sector-wide Hover */}
          {Array.from({ length: totalAxes }).map((_, i) => (
            <path
              key={`hit-${i}`}
              d={getSectorPath(i, radius + 35)}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>
      </div>

      {/* Interactive Bottom Domain Chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 max-w-sm">
        {summary.map((d, i) => {
          const theme = DOMAIN_THEMES[i] || DOMAIN_THEMES[0];
          const isHovered = hoveredIndex === i;
          return (
            <button
              key={d.categoryId}
              type="button"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isHovered
                  ? 'text-white shadow-xs scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
              style={isHovered ? { backgroundColor: theme.color } : undefined}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: isHovered ? '#ffffff' : theme.color }}
              />
              M{d.number}: {d.average.toFixed(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Bảng năng lực của doanh nghiệp: phân bố mức theo lĩnh vực và mức của từng nhân viên. */
export function CompetencyReport({ report }: { report: TrialReport }) {
  const [selectedEmployee, setSelectedEmployee] = useState<TrialReportEmployee | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [isEmployeeTableOpen, setIsEmployeeTableOpen] = useState(false);

  // Tính các chỉ số KPI điều hành
  const totalAssessed = Math.max(1, report.assessed);
  const avgOverallScore = (
    report.summary.reduce((acc, d) => acc + d.average, 0) / Math.max(1, report.summary.length)
  ).toFixed(1);

  // Số nhân viên đạt chuẩn Cơ bản (toàn bộ các miền >= 1)
  const basicPassEmployees = report.employees.filter((e) => e.levels.every((l) => l >= 1)).length;
  const basicPassPercent = Math.round((basicPassEmployees / totalAssessed) * 100);

  // Lĩnh vực có điểm trung bình thấp nhất (điểm nghẽn cần ưu tiên)
  const sortedByAvg = [...report.summary].sort((a, b) => a.average - b.average);
  const topFocusDomain = sortedByAvg[0];
  const topStrengthDomain = sortedByAvg[sortedByAvg.length - 1];

  const filteredEmployees = report.employees.filter(
    (e) =>
      !employeeFilter.trim() ||
      e.fullName.toLowerCase().includes(employeeFilter.toLowerCase()) ||
      (e.departmentName && e.departmentName.toLowerCase().includes(employeeFilter.toLowerCase())) ||
      (e.positionName && e.positionName.toLowerCase().includes(employeeFilter.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {/* ── BỨC TRANH TOÀN CẢNH: EXECUTIVE METRICS + RADAR CHART ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Báo cáo Năng lực Đội ngũ
            </h2>
            <p className="text-sm sm:text-[14.5px] text-slate-600 font-medium mt-1">
              Đánh giá chuẩn hóa 6 lĩnh vực từ <strong className="text-slate-900 font-bold tabular-nums">{report.assessed}</strong> nhân sự hoàn thành.
            </p>
          </div>
          <div className="shrink-0 self-start sm:self-auto">
            <LevelLegend />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Cột trái: 4 chỉ số KPI quan trọng */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Điểm trung bình đội ngũ */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 sm:p-5 shadow-2xs hover:border-teal-300 transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500" />
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8.5 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-700 shadow-2xs">
                      <Award size={17} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Điểm trung bình
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs">
                    Thang 3.0
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
                    {avgOverallScore}
                  </span>
                  <span className="text-sm font-bold text-slate-500">/ 3.0</span>
                </div>

                <div
                  className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-3"
                  title={`Tiến độ: ${Math.round((parseFloat(avgOverallScore) / 3) * 100)}%`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(4, (parseFloat(avgOverallScore) / 3) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {parseFloat(avgOverallScore) >= 2 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60">
                    <TrendingUp size={14} className="text-emerald-600" /> Mức Trung cấp
                  </span>
                ) : parseFloat(avgOverallScore) >= 1 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200/60">
                    <CheckCircle2 size={14} className="text-blue-600" /> Đạt chuẩn Cơ bản
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
                    <AlertTriangle size={14} className="text-amber-600" /> Cần bồi dưỡng
                  </span>
                )}
              </div>
            </div>

            {/* 2. Đạt chuẩn cơ bản */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 sm:p-5 shadow-2xs hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8.5 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-700 shadow-2xs">
                      <ShieldCheck size={17} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Đạt chuẩn cơ bản
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                    Cấp 1+
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
                    {basicPassPercent}%
                  </span>
                  <span className="text-sm font-semibold text-slate-600">
                    ({basicPassEmployees}/{report.assessed} nhân sự)
                  </span>
                </div>

                <div
                  className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-3"
                  title={`Tỷ lệ: ${basicPassPercent}%`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(basicPassPercent > 0 ? 4 : 0, basicPassPercent))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs sm:text-[13px] text-slate-700 font-medium flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                  Đạt 6 lĩnh vực từ Cấp 1
                </span>
              </div>
            </div>

            {/* 3. Lĩnh vực cần ưu tiên */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 sm:p-5 shadow-2xs hover:border-amber-300 transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-400" />
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8.5 rounded-xl bg-amber-50 border border-amber-100/80 flex items-center justify-center text-amber-700 shadow-2xs">
                      <AlertTriangle size={17} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Cần ưu tiên
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                    Điểm nghẽn
                  </span>
                </div>

                <div className="mt-2.5 flex items-start gap-2.5">
                  <span className="shrink-0 size-7 rounded-xl bg-amber-100 text-amber-900 text-xs font-black grid place-items-center mt-0.5 shadow-2xs">
                    M{topFocusDomain?.number ?? '!'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4
                      className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-1"
                      title={topFocusDomain?.name}
                    >
                      {topFocusDomain?.name ?? '—'}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-slate-600">
                      <span>Điểm TB:</span>
                      <strong className="text-amber-800 font-black tabular-nums text-sm">
                        {topFocusDomain?.average.toFixed(1) ?? '0.0'} / 3.0
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900 text-xs sm:text-[13px] font-bold">
                  <BookOpen size={13} className="text-amber-700" />
                  Khóa học: M{topFocusDomain?.number}-F
                </span>
              </div>
            </div>

            {/* 4. Lĩnh vực nổi trội nhất */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 sm:p-5 shadow-2xs hover:border-purple-300 transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8.5 rounded-xl bg-purple-50 border border-purple-100/80 flex items-center justify-center text-purple-700 shadow-2xs">
                      <Award size={17} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Nổi trội nhất
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200/80 shadow-2xs">
                    Dẫn đầu
                  </span>
                </div>

                <div className="mt-2.5 flex items-start gap-2.5">
                  <span className="shrink-0 size-7 rounded-xl bg-purple-100 text-purple-900 text-xs font-black grid place-items-center mt-0.5 shadow-2xs">
                    M{topStrengthDomain?.number ?? '★'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4
                      className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-1"
                      title={topStrengthDomain?.name}
                    >
                      {topStrengthDomain?.name ?? '—'}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-slate-600">
                      <span>Điểm TB:</span>
                      <strong className="text-purple-800 font-black tabular-nums text-sm">
                        {topStrengthDomain?.average.toFixed(1) ?? '0.0'} / 3.0
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200/70 text-purple-900 text-xs sm:text-[13px] font-bold">
                  <TrendingUp size={13} className="text-purple-700" />
                  Điểm cao nhất
                </span>
              </div>
            </div>
          </div>

          {/* Cột phải: Bản đồ mạng nhện Radar trực quan */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50/80 to-slate-100/40 border border-slate-200/80 p-5 shadow-2xs">
            <div className="w-full flex items-center justify-between border-b border-slate-200/70 pb-2.5 mb-2 px-1">
              <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <Compass size={14} className="text-teal-600" />
                Bản đồ Radar 6 Miền
              </span>
              <span className="text-[11px] font-medium text-slate-400">So sánh mức TB</span>
            </div>
            <CapabilityRadarChart summary={report.summary} />
          </div>
        </div>
      </section>

      {/* ── BẢNG NĂNG LỰC 6 LĨNH VỰC ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Chi tiết đánh giá theo 6 lĩnh vực
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Tổng nhân sự: <strong className="text-slate-900 font-bold tabular-nums">{report.assessed}</strong> người
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Lĩnh vực</th>
                <th className="py-3 px-3 text-center">Điểm TB</th>
                <th className="py-3 px-3 text-center">Đánh giá chung</th>
                <th className="py-3 px-3 text-center">Trần mục tiêu</th>
                <th className="py-3 px-3 text-center">Khoảng cách (Skill Gap)</th>
                <th className="py-3 px-4 min-w-[200px]">Phân bổ ({report.assessed} người)</th>
                <th className="py-3 px-4 min-w-[180px]">Khóa học đề xuất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {report.summary.map((row) => {
                const theme = DOMAIN_THEMES[row.number - 1] || DOMAIN_THEMES[0];
                const Icon = theme.icon;
                const courseCode = `M${row.number}-${row.level >= 2 ? 'A' : row.level >= 1 ? 'I' : 'F'}`;
                const tierName = row.level >= 2 ? 'Nâng cao' : row.level >= 1 ? 'Trung cấp' : 'Cơ bản';
                return (
                  <tr key={row.categoryId} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-8 rounded-xl ${theme.bgClass} border ${theme.borderClass} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Miền 0{row.number}
                          </span>
                          <strong className="text-slate-900 font-bold text-xs sm:text-sm block leading-snug">
                            {row.name}
                          </strong>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-xl bg-slate-100/90 border border-slate-200/80 shadow-2xs">
                        <span className="font-mono font-black text-slate-900 text-sm tabular-nums">
                          {row.average.toFixed(1)}
                        </span>
                        <span className="text-xs font-bold text-slate-500">/ 3.0</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <LevelBadge level={row.level} />
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Cấp {row.targetLevel ?? 3}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {row.level >= (row.targetLevel ?? 3) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ Đạt trần ({row.targetMetRate ?? 100}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Thiếu {(row.targetLevel ?? 3) - row.level} cấp (Đạt: {row.targetMetRate ?? 0}%)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        <div
                          className="h-2 w-full rounded-full overflow-hidden bg-slate-100 flex border border-slate-200/60 shadow-inner"
                          title={row.counts.map((n, i) => `${LEVEL_LABELS[i]}: ${n}`).join(' · ')}
                        >
                          {row.counts.map((count, levelIdx) =>
                            count > 0 ? (
                              <div
                                key={levelIdx}
                                style={{
                                  width: `${(count / Math.max(1, report.assessed)) * 100}%`,
                                }}
                                className={`h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 ${
                                  levelIdx === 0
                                    ? 'bg-slate-400'
                                    : levelIdx === 1
                                    ? 'bg-sky-500'
                                    : levelIdx === 2
                                    ? 'bg-indigo-600'
                                    : 'bg-emerald-500'
                                }`}
                              />
                            ) : null,
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                          {row.counts.map((count, levelIdx) =>
                            count > 0 ? (
                              <span
                                key={levelIdx}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                                  levelIdx === 0
                                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                    : levelIdx === 1
                                    ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                    : levelIdx === 2
                                    ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                <span
                                  className={`size-1.5 rounded-full ${
                                    levelIdx === 0
                                      ? 'bg-slate-400'
                                      : levelIdx === 1
                                      ? 'bg-sky-500'
                                      : levelIdx === 2
                                      ? 'bg-indigo-500'
                                      : 'bg-emerald-500'
                                  }`}
                                />
                                {LEVEL_LABELS[levelIdx]}: <strong>{count}</strong>
                              </span>
                            ) : null,
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {row.level >= (row.targetLevel ?? 3) ? (
                        <span className="text-slate-400 font-medium text-[11px]">Đã đạt chuẩn mục tiêu</span>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-teal-200/90 bg-teal-50/60 hover:bg-teal-100/80 px-2.5 py-1.5 text-xs text-teal-950 shadow-2xs transition-all group-hover:border-teal-300">
                          <BookOpen size={13} className="text-teal-700 shrink-0" />
                          <span className="font-bold text-teal-900">{courseCode}</span>
                          <span className="text-teal-400">·</span>
                          <span className="text-teal-700 font-medium text-[11px]">{tierName}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── BẢNG THEO TỪNG NHÂN VIÊN (COLLAPSIBLE / XỔ RA ĐÓNG LẠI) ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsEmployeeTableOpen((v) => !v)}
          className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-700 shadow-2xs shrink-0">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Chi tiết từng nhân viên ({filteredEmployees.length})
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs">
                  6 Lĩnh vực
                </span>
              </div>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Đánh giá chuẩn hóa 6 lĩnh vực năng lực số của từng nhân sự
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors">
              {isEmployeeTableOpen ? (
                <>
                  <ChevronUp size={15} /> Thu gọn
                </>
              ) : (
                <>
                  <ChevronDown size={15} /> Xem chi tiết ({filteredEmployees.length} nhân sự)
                </>
              )}
            </span>
          </div>
        </button>

        {isEmployeeTableOpen && (
          <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
              <span className="text-sm font-semibold text-slate-600">
                Tìm kiếm và xem chi tiết phiếu đánh giá năng lực của nhân sự:
              </span>
              <div className="relative w-full sm:w-72">
                <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, phòng ban..."
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-teal-600 transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4 min-w-[200px]">Nhân viên</th>
                    {DOMAIN_THEMES.map((theme) => (
                      <th key={theme.number} className="py-3 px-2 text-center min-w-[95px]" title={theme.name}>
                        {theme.tableHeader}
                      </th>
                    ))}
                    <th className="py-3 px-4 text-center min-w-[110px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={DOMAIN_THEMES.length + 2} className="py-8 text-center text-slate-400">
                        Không tìm thấy nhân viên nào phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((e) => {
                      const initials = e.fullName
                        .trim()
                        .split(/\s+/)
                        .slice(-2)
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase();

                      return (
                        <tr key={e.employeeId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white font-black text-xs shadow-2xs shrink-0">
                                {initials}
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs sm:text-sm font-bold">{e.fullName}</strong>
                                <span className="text-xs text-slate-600 block mt-0.5 font-medium">
                                  {[e.departmentName, e.positionName].filter(Boolean).join(' · ') || 'Nhân viên'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {e.levels.map((level, i) => (
                            <td key={i} className="py-3.5 px-2 text-center">
                              <LevelBadge level={level} size="sm" />
                            </td>
                          ))}

                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedEmployee(e)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 text-xs font-bold text-teal-800 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                            >
                              <Eye size={13} className="text-teal-700" />
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Modal xem chi tiết bài đánh giá của từng nhân viên */}
      {selectedEmployee && (
        <Modal
          open={Boolean(selectedEmployee)}
          onClose={() => setSelectedEmployee(null)}
          size="xl"
          title={`Chi tiết đánh giá năng lực: ${selectedEmployee.fullName}`}
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-xs text-slate-500">
                {selectedEmployee.submittedAt
                  ? `Nộp bài lúc ${new Date(selectedEmployee.submittedAt).toLocaleString('vi-VN')}`
                  : ''}
              </span>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                Đóng
              </button>
            </div>
          }
        >
          <div className="space-y-4 py-1">
            {/* Profile banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-teal-50/30 to-sky-50/40 border border-slate-200/80">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-2xs shrink-0">
                  {selectedEmployee.fullName
                    .trim()
                    .split(/\s+/)
                    .slice(-2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    {selectedEmployee.fullName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {selectedEmployee.departmentName && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                        <Building2 size={13} className="text-slate-500" />
                        {selectedEmployee.departmentName}
                      </span>
                    )}
                    {selectedEmployee.positionName && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200 shadow-2xs">
                        <Briefcase size={13} className="text-sky-600" />
                        {selectedEmployee.positionName}
                      </span>
                    )}
                    {selectedEmployee.email && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                        <Mail size={13} className="text-slate-400" />
                        {selectedEmployee.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedEmployee.submittedAt && (
                <div className="sm:text-right shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Thời gian nộp</span>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-slate-800 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs mt-0.5">
                    <Calendar size={13} className="text-teal-600" />
                    {new Date(selectedEmployee.submittedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
            </div>

            {/* Thẻ tóm tắt điểm số: Trắc nghiệm vs Tự luận Mentor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                      Trắc nghiệm 6 lĩnh vực
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {Math.round(((selectedEmployee.choiceScore ?? 0) / Math.max(1, selectedEmployee.choiceTotal ?? 18)) * 100)}% chính xác
                    </span>
                  </div>
                  <div className="text-2xl font-black text-blue-950 mt-2 tabular-nums">
                    {selectedEmployee.choiceScore ?? 0} / {selectedEmployee.choiceTotal ?? 18}{' '}
                    <span className="text-xs font-semibold text-blue-700 font-sans">câu đúng</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-blue-150 text-[11px] text-blue-800/80 font-medium">
                  Hoàn thành trắc nghiệm lý thuyết chuẩn khung năng lực.
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                      Điểm tự luận (Mentor chấm)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Thang 10 điểm
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-bold text-emerald-950">
                    <span className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                      Cơ bản: <strong className="text-emerald-700 font-mono">{selectedEmployee.essayBasicScore ?? 0}</strong>/10
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                      Trung cấp: <strong className="text-emerald-700 font-mono">{selectedEmployee.essayIntermediateScore ?? 0}</strong>/10
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                      Nâng cao: <strong className="text-emerald-700 font-mono">{selectedEmployee.essayAdvancedScore ?? 0}</strong>/10
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-150 text-[11px] text-emerald-800/80 font-medium">
                  {selectedEmployee.essayBasicScore === 0 && selectedEmployee.essayIntermediateScore === 0 && selectedEmployee.essayAdvancedScore === 0
                    ? 'Chưa có điểm tự luận thực hành từ Mentor (yếu tố quyết định cấp chứng chỉ).'
                    : 'Đã hoàn thành đánh giá thực hành tự luận từ Mentor.'}
                </div>
              </div>
            </div>

            {/* Nhận xét từ Mentor nếu có */}
            {selectedEmployee.reviewNote && (
              <div className="rounded-2xl border border-purple-200/90 bg-purple-50/60 p-3.5 space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <FileText className="size-3.5 text-purple-700" />
                  Nhận xét của Mentor:
                </div>
                <p className="text-xs text-purple-950 italic leading-relaxed">
                  "{selectedEmployee.reviewNote}"
                </p>
              </div>
            )}

            {/* Danh sách 6 lĩnh vực */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={15} className="text-teal-600" />
                  Kết quả chi tiết 6 lĩnh vực năng lực số
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  Mức chứng chỉ cuối cùng
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(selectedEmployee.domainDetails && selectedEmployee.domainDetails.length > 0
                  ? selectedEmployee.domainDetails
                  : report.domains.map((dom, idx) => ({
                      categoryId: dom.categoryId,
                      number: dom.number,
                      name: dom.name,
                      level: selectedEmployee.levels[idx] ?? 0,
                      levelLabel: LEVEL_LABELS[selectedEmployee.levels[idx] ?? 0],
                      statusText:
                        selectedEmployee.levels[idx] === 0
                          ? 'Chưa đạt mức Cơ bản'
                          : `Đạt ${LEVEL_LABELS[selectedEmployee.levels[idx]]}`,
                      gapText:
                        selectedEmployee.levels[idx] === 0
                          ? 'Cần bổ sung kiến thức thực hành và hoàn thành tự luận.'
                          : `Đã đạt chuẩn mức ${LEVEL_LABELS[selectedEmployee.levels[idx]]}.`,
                      basicCorrect: selectedEmployee.levels[idx] >= 1 ? 1 : 0,
                      basicTotal: 1,
                      intermediateCorrect: selectedEmployee.levels[idx] >= 2 ? 1 : 0,
                      intermediateTotal: 1,
                      advancedCorrect: selectedEmployee.levels[idx] >= 3 ? 1 : 0,
                      advancedTotal: 1,
                      suggestedLevel: selectedEmployee.levels[idx] ?? 0,
                      mentorLevel: selectedEmployee.levels[idx] ?? 0,
                      recommendedCourse: `M${dom.number}-${selectedEmployee.levels[idx] >= 2 ? 'A' : selectedEmployee.levels[idx] >= 1 ? 'I' : 'F'}: Khóa học nâng cao năng lực`,
                    }))
                ).map((detail) => {
                  const theme = DOMAIN_THEMES[detail.number - 1] || DOMAIN_THEMES[0];
                  const Icon = theme.icon;

                  return (
                    <div
                      key={detail.categoryId}
                      className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      {/* Top: Icon + Tên lĩnh vực + LevelBadge + Target Ceiling & Gap */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`size-8 rounded-xl ${theme.bgClass} border ${theme.borderClass} flex items-center justify-center shrink-0 shadow-2xs`}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                              Miền 0{detail.number}
                            </span>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate" title={detail.name}>
                              {detail.name}
                            </h5>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {(detail as any).targetLevel != null && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              Trần: Cấp {(detail as any).targetLevel}
                            </span>
                          )}
                          {(detail as any).skillGap != null && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                (detail as any).skillGap === 0
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {(detail as any).skillGap === 0 ? '✓ Đạt' : `Thiếu ${(detail as any).skillGap} cấp`}
                            </span>
                          )}
                          <LevelBadge level={detail.level} />
                        </div>
                      </div>

                      {/* Middle: Thông tin Trắc nghiệm lý thuyết */}
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600">Trắc nghiệm lý thuyết:</span>
                          <span className="font-bold text-slate-800">
                            {(detail.basicCorrect ?? 0) + (detail.intermediateCorrect ?? 0) + (detail.advancedCorrect ?? 0)}/
                            {(detail.basicTotal ?? 1) + (detail.intermediateTotal ?? 1) + (detail.advancedTotal ?? 1)} câu đúng
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                              detail.basicCorrect >= detail.basicTotal && detail.basicTotal > 0
                                ? 'bg-sky-50 text-sky-800 border-sky-200/80'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            Cơ bản: {detail.basicCorrect}/{detail.basicTotal}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                              detail.intermediateCorrect >= detail.intermediateTotal && detail.intermediateTotal > 0
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200/80'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            Trung cấp: {detail.intermediateCorrect}/{detail.intermediateTotal}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                              detail.advancedCorrect >= detail.advancedTotal && detail.advancedTotal > 0
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            Nâng cao: {detail.advancedCorrect}/{detail.advancedTotal}
                          </span>
                        </div>
                      </div>

                      {/* Bottom: Khóa học đề xuất */}
                      {detail.recommendedCourse && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-teal-900 bg-teal-50/70 border border-teal-200/80 px-3 py-2 rounded-xl">
                          <BookOpen size={14} className="text-teal-700 shrink-0" />
                          <span className="truncate" title={detail.recommendedCourse}>
                            {detail.recommendedCourse}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
