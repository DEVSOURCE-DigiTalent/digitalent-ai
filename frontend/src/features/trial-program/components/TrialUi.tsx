import { useState } from 'react';
import { Check, Eye, Award, BookOpen, FileText } from 'lucide-react';
import { Modal } from '@/components/shared';
import type { TrialParticipantStatus, TrialReport, TrialReportEmployee, TrialStage } from '@/services/trial-program.service';
import { LEVEL_LABELS, STAGE } from '../lib/trial-format';

export function LevelBadge({ level }: { level: number }) {
  const value = Math.max(0, Math.min(3, Math.round(level)));
  return <span className="tp-level" data-level={value}>{LEVEL_LABELS[value]}</span>;
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
    <ol className="tp-steps" aria-label="Các bước dùng thử">
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'todo';
        return (
          <li key={step} data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
            <b>{state === 'done' ? <Check size={13} strokeWidth={3} aria-hidden /> : index + 1}</b>
            <span>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function LevelLegend() {
  return (
    <div className="tp-legend" aria-hidden>
      {LEVEL_LABELS.map((label, level) => (
        <span key={label}>
          <i className="tp-level" data-level={level} style={{ minWidth: 0, padding: 0 }} />
          {label}
        </span>
      ))}
    </div>
  );
}

function CapabilityRadarChart({ summary }: { summary: TrialReport['summary'] }) {
  const size = 280;
  const center = size / 2;
  const radius = 95;
  const totalAxes = 6;

  const shortLabels = [
    '1. Dữ liệu & TT',
    '2. Giao tiếp & HT',
    '3. Sáng tạo số',
    '4. An toàn số',
    '5. Giải quyết VĐ',
    '6. Trí tuệ AI',
  ];

  const getCoordinates = (index: number, value: number) => {
    const angle = ((Math.PI * 2) / totalAxes) * index - Math.PI / 2;
    const r = (Math.max(0.08, Math.min(3, value)) / 3) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = ((Math.PI * 2) / totalAxes) * index - Math.PI / 2;
    const r = radius + 26;
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

  const companyPolygon = summary
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.average);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg width={size} height={size} className="overflow-visible select-none">
        <defs>
          <linearGradient id="radarFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Concentric grids: L1, L2, L3 */}
        {[1, 2, 3].map((lvl) => (
          <polygon
            key={lvl}
            points={getGridPolygon(lvl)}
            fill={lvl === 1 ? 'rgba(241, 245, 249, 0.4)' : 'none'}
            stroke="#cbd5e1"
            strokeWidth={lvl === 3 ? '1.5' : '1'}
            strokeDasharray={lvl < 3 ? '3,3' : 'none'}
          />
        ))}

        {/* Level ring labels */}
        {[1, 2, 3].map((lvl) => (
          <text
            key={lvl}
            x={center + 4}
            y={center - (lvl / 3) * radius + 11}
            className="text-[9px] font-bold fill-slate-400 select-none"
          >
            L{lvl}
          </text>
        ))}

        {/* Axis spokes */}
        {Array.from({ length: totalAxes }).map((_, i) => {
          const { x, y } = getCoordinates(i, 3);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1.2"
            />
          );
        })}

        {/* Polygon representing enterprise team score */}
        <polygon
          points={companyPolygon}
          fill="url(#radarFillGrad)"
          stroke="#2563eb"
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Data points */}
        {summary.map((d, i) => {
          const { x, y } = getCoordinates(i, d.average);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
            </g>
          );
        })}

        {/* Domain name labels */}
        {summary.map((d, i) => {
          const { x, y } = getLabelCoordinates(i);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[10.5px] font-bold fill-slate-700"
            >
              {shortLabels[i] || d.name}
            </text>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 mt-3 text-[11px] font-medium text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-blue-600 inline-block" /> Hiện tại của đội ngũ
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-slate-400 border-dashed inline-block" /> L1 Cơ bản · L2 Trung cấp · L3 Nâng cao
        </span>
      </div>
    </div>
  );
}


/** Bảng năng lực của doanh nghiệp: phân bố mức theo lĩnh vực và mức của từng nhân viên. */
export function CompetencyReport({ report }: { report: TrialReport }) {
  const [selectedEmployee, setSelectedEmployee] = useState<TrialReportEmployee | null>(null);

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

  return (
    <div className="space-y-6">
      {/* ── BỨC TRANH TOÀN CẢNH: EXECUTIVE METRICS + RADAR CHART ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4 mb-6">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
              Bức tranh năng lực tổng thể
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Độ sẵn sàng &amp; Khung năng lực số của đội ngũ
            </h2>
          </div>
          <LevelLegend />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Cột trái: 4 chỉ số KPI quan trọng */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-4">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide block">
                Điểm trung bình đội ngũ
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-blue-950 tracking-tight tabular-nums">
                  {avgOverallScore}
                </span>
                <span className="text-xs font-semibold text-blue-600">/ 3.0</span>
              </div>
              <span className="mt-2 inline-flex items-center text-[11px] font-medium text-blue-800">
                {parseFloat(avgOverallScore) >= 2
                  ? '🌟 Mức Trung cấp vững vàng'
                  : parseFloat(avgOverallScore) >= 1
                  ? '✓ Đạt chuẩn mức Cơ bản'
                  : '⚠️ Cần bồi dưỡng nền tảng'}
              </span>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-4">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide block">
                Đạt chuẩn cơ bản
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-emerald-950 tracking-tight tabular-nums">
                  {basicPassPercent}%
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  ({basicPassEmployees}/{report.assessed})
                </span>
              </div>
              <span className="mt-2 text-[11px] text-emerald-700 font-medium block">
                Đạt tất cả 6 lĩnh vực từ Cấp 1
              </span>
            </div>

            <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/60 to-orange-50/30 p-4">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide block">
                Lĩnh vực cần ưu tiên
              </span>
              <div className="mt-2">
                <span className="text-sm font-bold text-amber-950 block truncate" title={topFocusDomain?.name}>
                  {topFocusDomain ? `${topFocusDomain.number}. ${topFocusDomain.name}` : '—'}
                </span>
                <span className="text-xs font-semibold text-amber-700 mt-0.5 block tabular-nums">
                  TB: {topFocusDomain?.average.toFixed(1) ?? '0.0'} / 3.0
                </span>
              </div>
              <span className="mt-2 inline-block rounded-md bg-amber-100/90 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
                Cần học: M{topFocusDomain?.number}-F
              </span>
            </div>

            <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50/60 to-fuchsia-50/30 p-4">
              <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide block">
                Lĩnh vực nổi trội nhất
              </span>
              <div className="mt-2">
                <span className="text-sm font-bold text-purple-950 block truncate" title={topStrengthDomain?.name}>
                  {topStrengthDomain ? `${topStrengthDomain.number}. ${topStrengthDomain.name}` : '—'}
                </span>
                <span className="text-xs font-semibold text-purple-700 mt-0.5 block tabular-nums">
                  TB: {topStrengthDomain?.average.toFixed(1) ?? '0.0'} / 3.0
                </span>
              </div>
              <span className="mt-2 inline-block rounded-md bg-purple-100/90 text-purple-900 px-2 py-0.5 text-[10px] font-bold">
                Điểm cao nhất
              </span>
            </div>
          </div>

          {/* Cột phải: Bản đồ mạng nhện Radar trực quan */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-xl bg-slate-50/80 border border-slate-100 py-3 px-4">
            <span className="text-xs font-bold text-slate-700 mb-1">
              Bản đồ Radar 6 Miền Năng Lực (So sánh mức trung bình)
            </span>
            <CapabilityRadarChart summary={report.summary} />
          </div>
        </div>
      </section>

      {/* ── BẢNG NĂNG LỰC 6 LĨNH VỰC (GỌN GÀNG, TRỰC QUAN, KHÔNG RƯỜM RÀ CHỮ) ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Chi tiết phân bổ 6 Lĩnh vực chuẩn</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tỷ lệ đội ngũ ở từng cấp độ và khóa học trọng tâm được đề xuất.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Tổng nhân sự đánh giá: <strong className="text-slate-800">{report.assessed}</strong> người
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3.5">Lĩnh vực</th>
                <th className="py-3 px-3 text-center">Điểm TB</th>
                <th className="py-3 px-3 text-center">Đánh giá chung</th>
                <th className="py-3 px-3 min-w-[200px]">Phân bổ nhân sự ({report.assessed} người)</th>
                <th className="py-3 px-3.5">Khóa học đề xuất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {report.summary.map((row) => {
                const courseCode = `M${row.number}-${row.level >= 2 ? 'A' : row.level >= 1 ? 'I' : 'F'}`;
                const tierName = row.level >= 2 ? 'Nâng cao' : row.level >= 1 ? 'Trung cấp' : 'Cơ bản';

                return (
                  <tr key={row.categoryId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-6 place-items-center rounded-md bg-blue-50 text-[11px] font-bold text-blue-700 shrink-0">
                          {row.number}
                        </span>
                        <strong className="text-slate-900 font-semibold">{row.name}</strong>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-slate-800 text-[13px] tabular-nums">
                        {row.average.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-400">/3</span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <LevelBadge level={row.level} />
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <div
                          className="h-2.5 w-full rounded-full overflow-hidden bg-slate-100 flex"
                          title={row.counts.map((n, i) => `${LEVEL_LABELS[i]}: ${n}`).join(' · ')}
                        >
                          {row.counts.map((count, levelIdx) =>
                            count > 0 ? (
                              <div
                                key={levelIdx}
                                style={{
                                  width: `${(count / Math.max(1, report.assessed)) * 100}%`,
                                  backgroundColor:
                                    levelIdx === 0
                                      ? '#cbd5e1'
                                      : levelIdx === 1
                                      ? '#60a5fa'
                                      : levelIdx === 2
                                      ? '#2563eb'
                                      : '#4338ca',
                                }}
                                className="h-full first:rounded-l-full last:rounded-r-full"
                              />
                            ) : null,
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                          <span>Chưa đạt: {row.counts[0]}</span>
                          <span>Cơ bản: {row.counts[1]}</span>
                          <span>Trung cấp: {row.counts[2]}</span>
                          <span>Nâng cao: {row.counts[3]}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 shadow-2xs">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span className="font-bold text-slate-800 text-[11px]">{courseCode}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600 text-[11px]">{tierName}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── BẢNG THEO TỪNG NHÂN VIÊN: DẠNG THẺ THẨM MỸ CAO ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Chi tiết năng lực từng nhân viên</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Bấm [Xem chi tiết] để xem bài làm, điểm trắc nghiệm, bài tự luận và nhận xét của Mentor.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3.5">Nhân viên</th>
                {report.domains.map((d) => (
                  <th key={d.categoryId} className="py-3 px-2 text-center" title={d.name}>
                    LV{d.number}
                  </th>
                ))}
                <th className="py-3 px-3.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {report.employees.map((e) => {
                const initials = e.fullName
                  .trim()
                  .split(/\s+/)
                  .slice(-2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase();

                return (
                  <tr key={e.employeeId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs shadow-2xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <strong className="text-slate-900 block text-xs font-semibold">{e.fullName}</strong>
                          <span className="text-[11px] text-slate-500 block">
                            {[e.departmentName, e.positionName].filter(Boolean).join(' · ') || 'Nhân viên'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {e.levels.map((level, i) => (
                      <td key={i} className="py-3 px-2 text-center">
                        <LevelBadge level={level} />
                      </td>
                    ))}

                    <td className="py-3 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedEmployee(e)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors shadow-2xs"
                      >
                        <Eye size={13} />
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          {report.domains.map((d) => (
            <span key={d.categoryId}>
              <strong className="text-slate-600">LV{d.number}:</strong> {d.name}
            </span>
          ))}
        </div>
      </section>

      {/* Modal xem chi tiết bài đánh giá của từng nhân viên */}
      {selectedEmployee && (
        <Modal
          open={Boolean(selectedEmployee)}
          onClose={() => setSelectedEmployee(null)}
          size="xl"
          title={`Chi tiết đánh giá năng lực: ${selectedEmployee.fullName}`}
          description={`Phòng ban: ${selectedEmployee.departmentName || 'Chưa gán'} · Vị trí: ${selectedEmployee.positionName || 'Chưa gán'}${selectedEmployee.email ? ` · Email: ${selectedEmployee.email}` : ''}`}
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-xs text-slate-500">
                {selectedEmployee.submittedAt ? `Nộp bài lúc ${new Date(selectedEmployee.submittedAt).toLocaleString('vi-VN')}` : ''}
              </span>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          }
        >
          <div className="space-y-5 py-1">
            {/* Thẻ tóm tắt điểm số */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">Điểm trắc nghiệm (6 lĩnh vực)</span>
                <div className="text-xl font-bold text-blue-900">
                  {selectedEmployee.choiceScore ?? 0} / {selectedEmployee.choiceTotal ?? 18} <span className="text-xs font-medium text-blue-700">câu đúng</span>
                </div>
                <p className="text-[11px] text-blue-700">Đề chuẩn gồm 6 lĩnh vực × 3 cấp (Cơ bản, Trung cấp, Nâng cao).</p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Điểm tự luận 3 cấp (Mentor chấm)</span>
                <div className="flex items-center gap-3 mt-1 text-sm font-bold text-emerald-950">
                  <span>Cơ bản: <strong className="text-emerald-700 font-extrabold">{selectedEmployee.essayBasicScore ?? '-'}</strong>/10</span>
                  <span>·</span>
                  <span>Trung cấp: <strong className="text-emerald-700 font-extrabold">{selectedEmployee.essayIntermediateScore ?? '-'}</strong>/10</span>
                  <span>·</span>
                  <span>Nâng cao: <strong className="text-emerald-700 font-extrabold">{selectedEmployee.essayAdvancedScore ?? '-'}</strong>/10</span>
                </div>
                <p className="text-[11px] text-emerald-700">Điểm đạt từ 5/10 cho từng cấp độ tình huống.</p>
              </div>
            </div>

            {/* Nhận xét từ Mentor */}
            {selectedEmployee.reviewNote && (
              <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <FileText className="size-3.5 text-purple-700" />
                  Nhận xét chuyên môn từ Mentor:
                </div>
                <p className="text-xs text-purple-950 leading-relaxed italic">
                  "{selectedEmployee.reviewNote}"
                </p>
              </div>
            )}

            {/* Danh sách chi tiết 6 lĩnh vực */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="size-4 text-blue-600" />
                Đánh giá chi tiết &amp; Khoảng cách năng lực theo từng lĩnh vực
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(selectedEmployee.domainDetails && selectedEmployee.domainDetails.length > 0
                  ? selectedEmployee.domainDetails
                  : report.domains.map((dom, idx) => ({
                      categoryId: dom.categoryId,
                      number: dom.number,
                      name: dom.name,
                      level: selectedEmployee.levels[idx] ?? 0,
                      levelLabel: LEVEL_LABELS[selectedEmployee.levels[idx] ?? 0],
                      statusText: selectedEmployee.levels[idx] === 0 ? 'Chưa đạt mức Cơ bản' : `Đạt ${LEVEL_LABELS[selectedEmployee.levels[idx]]}`,
                      gapText: selectedEmployee.levels[idx] === 0 ? 'Cần bổ sung kiến thức nền tảng và thao tác công cụ số ban đầu.' : `Đạt mức ${LEVEL_LABELS[selectedEmployee.levels[idx]]}.`,
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
                ).map((detail) => (
                  <div key={detail.categoryId} className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400">LĨNH VỰC {detail.number}</span>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">{detail.name}</h4>
                      </div>
                      <LevelBadge level={detail.level} />
                    </div>

                    <div className="rounded-lg bg-slate-50 border border-slate-100 p-2 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-800">
                        {detail.statusText}
                      </div>
                      <div className="text-[11px] text-slate-600 leading-relaxed">
                        {detail.gapText}
                      </div>
                    </div>

                    {/* Kết quả trắc nghiệm 3 cấp */}
                    <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-2 text-slate-600">
                      <span>Cơ bản: <strong>{detail.basicCorrect}/{detail.basicTotal}</strong> {detail.basicCorrect >= detail.basicTotal && detail.basicTotal > 0 ? '✓' : ''}</span>
                      <span>Trung cấp: <strong>{detail.intermediateCorrect}/{detail.intermediateTotal}</strong> {detail.intermediateCorrect >= detail.intermediateTotal && detail.intermediateTotal > 0 ? '✓' : ''}</span>
                      <span>Nâng cao: <strong>{detail.advancedCorrect}/{detail.advancedTotal}</strong> {detail.advancedCorrect >= detail.advancedTotal && detail.advancedTotal > 0 ? '✓' : ''}</span>
                    </div>

                    {/* Khóa học đề xuất */}
                    {detail.recommendedCourse && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1 rounded-md">
                        <BookOpen className="size-3 text-emerald-700 shrink-0" />
                        <span className="truncate">{detail.recommendedCourse}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
