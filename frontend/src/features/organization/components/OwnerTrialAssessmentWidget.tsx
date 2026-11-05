import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTrialProgram } from '@/hooks/use-trial-program';
import { LevelBadge } from '@/features/trial-program/components/TrialUi';
import '@/features/trial-program/trial-program.css';

const LEVEL_COLORS = [
  { level: 0, label: 'Chưa đạt', hex: '#cbd5e1', pillBg: 'bg-slate-100/80 border-slate-200/70 text-slate-700' },
  { level: 1, label: 'Cơ bản', hex: '#38bdf8', pillBg: 'bg-sky-50 border-sky-200/70 text-sky-800' },
  { level: 2, label: 'Trung cấp', hex: '#6366f1', pillBg: 'bg-indigo-50 border-indigo-200/70 text-indigo-800' },
  { level: 3, label: 'Nâng cao', hex: '#10b981', pillBg: 'bg-emerald-50 border-emerald-200/70 text-emerald-800' },
];

export function OwnerTrialAssessmentWidget() {
  const { data: program, isLoading, isError } = useTrialProgram();
  const [showEmployees, setShowEmployees] = useState(false);
  const [chartMode, setChartMode] = useState<'distribution' | 'score'>('distribution');

  if (isLoading || isError || !program) {
    return null;
  }

  // ─────────────────────────────────────────────────────────────
  // GIAI ĐOẠN ĐÃ CÔNG BỐ KẾT QUẢ (REPORTED)
  // ─────────────────────────────────────────────────────────────
  if (program.stage === 'REPORTED' && program.report) {
    const report = program.report;
    const assessed = Math.max(1, report.assessed);

    // Compute overall distribution across all domains & employees
    const overallCounts = [0, 0, 0, 0];
    report.summary.forEach((domain) => {
      (domain.counts || []).forEach((c, lvl) => {
        if (lvl < 4) overallCounts[lvl] += c;
      });
    });

    const totalLevelEntries = overallCounts.reduce((a, b) => a + b, 0) || 1;
    const overallPercents = overallCounts.map((c) => Math.round((c / totalLevelEntries) * 100));

    // Calculate company average score across all domains
    const companyAvgScore =
      report.summary.length > 0
        ? report.summary.reduce((acc, s) => acc + (s.average || 0), 0) / report.summary.length
        : 0;

    // SVG Donut chart math
    const radius = 52;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    const donutSlices = overallCounts.map((cnt, i) => {
      const fraction = cnt / totalLevelEntries;
      const strokeDash = `${fraction * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += fraction;
      return {
        level: i,
        color: LEVEL_COLORS[i].hex,
        pillBg: LEVEL_COLORS[i].pillBg,
        strokeDash,
        strokeDashoffset,
        count: cnt,
        percent: overallPercents[i],
        label: LEVEL_COLORS[i].label,
      };
    });

    return (
      <section className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-6 shadow-xs hover:shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all">
        {/* Header bar: Tối giản, thanh lịch */}
        <div className="pb-4 mb-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full bg-[#137b84]" />
            <h2 className="text-base sm:text-lg font-black tracking-tight text-[#17243f]">
              Phân bố Năng lực 6 Lĩnh vực
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/70 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartMode('distribution')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  chartMode === 'distribution'
                    ? 'bg-white text-[#17243f] shadow-2xs font-bold'
                    : 'text-[#64748b] hover:text-[#17243f]'
                }`}
              >
                Phân bố cấp độ (%)
              </button>
              <button
                type="button"
                onClick={() => setChartMode('score')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  chartMode === 'score'
                    ? 'bg-white text-[#17243f] shadow-2xs font-bold'
                    : 'text-[#64748b] hover:text-[#17243f]'
                }`}
              >
                Điểm TB (0 - 3.0)
              </button>
            </div>

            <Link
              to="/enterprise/skill-gap"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#17243f] transition-all shadow-2xs hover:shadow-xs"
            >
              Ma trận khoảng cách
              <ArrowRight className="size-3 text-[#137b84]" />
            </Link>
          </div>
        </div>

        {/* Main Content: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (70%): 6 Domains Color Distribution Bars */}
          <div className="lg:col-span-8 space-y-4">
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs pb-1">
              {LEVEL_COLORS.map((lvl) => (
                <span key={lvl.level} className="inline-flex items-center gap-1.5 text-[#64748b]">
                  <span className="size-2 rounded-full" style={{ backgroundColor: lvl.hex }} />
                  <span className="font-semibold text-[11px] text-[#17243f]">{lvl.label}</span>
                </span>
              ))}
            </div>

            {/* 6 Domains List */}
            <div className="space-y-3">
              {report.summary.map((domain) => {
                const counts = domain.counts || [0, 0, 0, 0];
                const hasData = counts.some((c) => c > 0);
                const effectiveCounts = hasData ? counts : [assessed, 0, 0, 0];
                const domainTotal = effectiveCounts.reduce((a, b) => a + b, 0) || 1;
                const scorePercent = Math.min(100, Math.max(0, ((domain.average || 0) / 3) * 100));

                return (
                  <div key={domain.categoryId} className="p-2 -mx-2 rounded-xl hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-100 text-[#17243f] text-[11px] font-bold flex items-center justify-center shrink-0 border border-slate-200/60">
                          {domain.number}
                        </span>
                        <span className="font-semibold text-[#17243f]">
                          {domain.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold tabular-nums text-[#17243f]">
                          {domain.average.toFixed(1)} <span className="text-[#94a3b8] font-normal">/ 3.0</span>
                        </span>
                        <LevelBadge level={domain.level} />
                      </div>
                    </div>

                    {/* Bar Visualization: Tươi tắn, Không rối */}
                    {chartMode === 'distribution' ? (
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 border border-slate-200/40">
                        {effectiveCounts.map((cnt, lvl) => {
                          if (cnt <= 0) return null;
                          const pct = (cnt / domainTotal) * 100;
                          return (
                            <div
                              key={lvl}
                              style={{
                                width: `${pct}%`,
                                backgroundColor: LEVEL_COLORS[lvl].hex,
                              }}
                              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
                              title={`${LEVEL_COLORS[lvl].label}: ${cnt} người (${Math.round(pct)}%)`}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/40">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(4, scorePercent)}%`,
                            backgroundColor:
                              domain.level >= 2
                                ? LEVEL_COLORS[2].hex
                                : domain.level === 1
                                ? LEVEL_COLORS[1].hex
                                : '#cbd5e1',
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Drilldown Trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowEmployees((v) => !v)}
                className="text-xs font-bold text-[#137b84] hover:text-[#0e5968] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{showEmployees ? 'Thu gọn' : `Xem chi tiết ${report.employees.length} nhân sự`}</span>
                <ChevronDown className={`size-3.5 transition-transform duration-200 ${showEmployees ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right Column (30%): Donut Breakdown & Link nhanh */}
          <div className="lg:col-span-4 flex flex-col items-center justify-between border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-5 lg:pt-0">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] block mb-2 self-start">
              Tỷ lệ Cấp độ
            </span>

            {/* Donut Chart: Gọn, Hiện đại */}
            <div className="flex items-center justify-center my-2 relative">
              <svg width="136" height="136" viewBox="0 0 136 136" className="rotate-[-90deg]">
                <circle
                  cx="68"
                  cy="68"
                  r={radius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth={strokeWidth}
                />
                {donutSlices.map((slice) =>
                  slice.count > 0 ? (
                    <circle
                      key={slice.level}
                      cx="68"
                      cy="68"
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={slice.strokeDash}
                      strokeDashoffset={slice.strokeDashoffset}
                      strokeLinecap="butt"
                      className="transition-all duration-700 ease-out"
                    />
                  ) : null,
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-3xl font-black text-[#17243f] tabular-nums">
                  {companyAvgScore.toFixed(1)}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#94a3b8]">
                  Điểm TB
                </span>
              </div>
            </div>

            {/* Legend Pills: Màu sắc tinh tế */}
            <div className="w-full mt-3 grid grid-cols-2 gap-2 text-xs">
              {donutSlices.map((slice) => (
                <div
                  key={slice.level}
                  className={`px-3 py-1.5 rounded-xl border flex items-center justify-between ${slice.pillBg}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="font-semibold text-[11px]">{slice.label}</span>
                  </div>
                  <span className="font-black tabular-nums">
                    {slice.percent}%
                  </span>
                </div>
              ))}
            </div>

            {/* Action button duy nhất: Gradient ngọc sang trọng */}
            <div className="w-full mt-5">
              <Link
                to="/enterprise/courses"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#137b84] to-[#0d9488] hover:from-[#0e5968] hover:to-[#0f766e] text-white text-xs font-bold transition-all shadow-[0_4px_12px_rgba(19,123,132,0.2)] hover:shadow-[0_6px_18px_rgba(19,123,132,0.3)] hover:-translate-y-0.5"
              >
                Xem Khóa học Đào tạo
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Expandable Employee Detail Table */}
        {showEmployees && (
          <div className="border-t border-slate-100 mt-5 pt-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="tp-table w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-2.5 px-3 font-semibold text-[#17243f]">Nhân sự</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-[#17243f]">Phòng ban · Vị trí</th>
                    {report.domains.map((d) => (
                      <th key={d.categoryId} className="num py-2.5 px-2 font-semibold text-[#17243f]">
                        {d.number}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.employees.map((e) => (
                    <tr key={e.employeeId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#17243f]">{e.fullName}</td>
                      <td className="py-2.5 px-3 text-[#64748b]">
                        {[e.departmentName, e.positionName].filter(Boolean).join(' · ') || '—'}
                      </td>
                      {e.levels.map((level, i) => (
                        <td key={i} className="num py-2.5 px-2">
                          <LevelBadge level={level} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    );
  }

  // Giai đoạn đang tiến hành
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-black text-[#17243f]">
          Khảo sát Năng lực Đội ngũ
        </h2>
        <Link
          to="/enterprise/trial"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#137b84] to-[#0d9488] text-white text-xs font-bold hover:shadow-xs transition-all"
        >
          Quản lý đợt thi
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4">
        <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-200/70">
          <span className="text-[11px] font-bold text-[#64748b] block">Nhân sự</span>
          <strong className="text-2xl font-black text-[#17243f] block mt-0.5 tabular-nums">
            {program.participants.length}
          </strong>
        </div>
        <div className="rounded-xl bg-sky-50/60 p-3.5 border border-sky-200/70">
          <span className="text-[11px] font-bold text-sky-700 block">Đã kích hoạt</span>
          <strong className="text-2xl font-black text-sky-800 block mt-0.5 tabular-nums">
            {program.participants.filter((p) => ['ACTIVE', 'SUBMITTED', 'REVIEWED'].includes(p.status)).length}
          </strong>
        </div>
        <div className="rounded-xl bg-amber-50/60 p-3.5 border border-amber-200/70">
          <span className="text-[11px] font-bold text-amber-700 block">Đã nộp bài</span>
          <strong className="text-2xl font-black text-amber-800 block mt-0.5 tabular-nums">
            {program.participants.filter((p) => ['SUBMITTED', 'REVIEWED'].includes(p.status)).length}
          </strong>
        </div>
        <div className="rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-200/70">
          <span className="text-[11px] font-bold text-emerald-700 block">Đã chấm điểm</span>
          <strong className="text-2xl font-black text-emerald-800 block mt-0.5 tabular-nums">
            {program.participants.filter((p) => p.status === 'REVIEWED').length}
          </strong>
        </div>
      </div>
    </section>
  );
}
