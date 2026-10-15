import type { GapStats } from '@/services/analytics.service';

interface CapabilityGapSummaryProps {
  totals: GapStats;
}

export function CapabilityGapSummary({ totals }: CapabilityGapSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px]">
      <div
        className="grid gap-2 rounded-[17px] border p-5"
        style={{ borderColor: '#dfe5f5', background: 'var(--po-surface)' }}
      >
        <span
          className="text-[10px] font-black tracking-[0.1em]"
          style={{ color: '#5565bc' }}
        >
          NHÂN SỰ PHÂN TÍCH
        </span>
        <strong
          className="text-[31px] font-light leading-none tracking-[-0.05em]"
          style={{ color: '#202f62' }}
        >
          {totals.employees}
          <small
            className="ml-[5px] text-[11px] font-medium tracking-normal"
            style={{ color: '#73809b' }}
          >
            nhân viên có snapshot
          </small>
        </strong>
      </div>

      <div
        className="grid gap-2 rounded-[17px] border p-5"
        style={{ borderColor: '#f3ddd1', background: '#fff7f1' }}
      >
        <span
          className="text-[10px] font-black tracking-[0.1em]"
          style={{ color: '#5565bc' }}
        >
          KHOẢNG TRỐNG XÁC NHẬN
        </span>
        <strong
          className="text-[31px] font-light leading-none tracking-[-0.05em]"
          style={{ color: '#202f62' }}
        >
          {totals.totalGaps}
          {totals.highCount > 0 && (
            <small
              className="ml-[5px] text-[11px] font-medium tracking-normal"
              style={{ color: '#73809b' }}
            >
              {totals.highCount} mức cao
            </small>
          )}
        </strong>
      </div>

      <div
        className="grid gap-2 rounded-[17px] border p-5"
        style={{ borderColor: '#dfe5f5', background: 'var(--po-surface)' }}
      >
        <span
          className="text-[10px] font-black tracking-[0.1em]"
          style={{ color: '#5565bc' }}
        >
          TỶ LỆ ĐÁP ỨNG
        </span>
        <strong
          className="text-[31px] font-light leading-none tracking-[-0.05em]"
          style={{ color: '#202f62' }}
        >
          {totals.averageCoverage.toFixed(1)}
          <small
            className="ml-[5px] text-[11px] font-medium tracking-normal"
            style={{ color: '#73809b' }}
          >
            % trung bình toàn tổ chức
          </small>
        </strong>
      </div>
    </div>
  );
}
