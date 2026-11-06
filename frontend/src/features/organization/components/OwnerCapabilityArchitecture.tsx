import { Link } from 'react-router-dom';
import { Sliders } from 'lucide-react';

interface OwnerCapabilityArchitectureProps {
  orgName: string;
  departmentCount: number;
  positionCount: number;
  averageCoverage: number;
}

export function OwnerCapabilityArchitecture({
  departmentCount,
  positionCount,
  averageCoverage,
}: OwnerCapabilityArchitectureProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-5 shadow-xs hover:shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-[#17243f] pb-3 border-b border-slate-100">
          Cấu trúc & Khung Năng lực
        </h3>

        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-sky-500" />
              <span className="text-[#64748b] font-semibold">Phòng ban</span>
            </div>
            <strong className="text-sm font-black text-[#17243f] tabular-nums">{departmentCount}</strong>
          </div>

          <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-indigo-500" />
              <span className="text-[#64748b] font-semibold">Vị trí chức danh</span>
            </div>
            <strong className="text-sm font-black text-[#17243f] tabular-nums">{positionCount}</strong>
          </div>

          <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-teal-50/50 border border-teal-200/60 hover:bg-teal-50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#137b84]" />
              <span className="text-[#0e5968] font-semibold">Độ phủ chuẩn mục tiêu</span>
            </div>
            <strong className="text-sm font-black text-[#137b84] tabular-nums">{averageCoverage}%</strong>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100">
        <Link
          to="/enterprise/setup"
          className="text-xs font-bold text-[#137b84] hover:text-[#0e5968] inline-flex items-center gap-1.5 transition-colors"
        >
          <Sliders className="size-3.5" />
          Cấu hình trần năng lực
        </Link>
      </div>
    </div>
  );
}
