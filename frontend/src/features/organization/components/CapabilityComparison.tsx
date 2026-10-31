import { Link } from 'react-router-dom';
import type { GapGroup } from '@/services/analytics.service';

type GroupBy = 'department' | 'position' | 'grade';

interface CapabilityComparisonProps {
  groups: GapGroup[];
  groupBy: GroupBy;
  onGroupByChange: (g: GroupBy) => void;
  isLoading: boolean;
}

const GROUP_LABELS: Record<GroupBy, string> = {
  department: 'Phòng ban',
  position: 'Vị trí công việc',
  grade: 'Cấp bậc (Job Grade)',
};

const TOGGLE_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'department', label: 'Theo phòng ban' },
  { value: 'position', label: 'Theo vị trí' },
  { value: 'grade', label: 'Theo cấp bậc' },
];

export function CapabilityComparison({
  groups,
  groupBy,
  onGroupByChange,
  isLoading,
}: CapabilityComparisonProps) {
  return (
    <section
      className="rounded-[22px] border p-6"
      style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span
            className="text-[10px] font-black uppercase tracking-[0.1em]"
            style={{ color: 'var(--po-accent)' }}
          >
            Tổng quan so sánh
          </span>
          <h2
            className="mt-1 text-lg font-semibold"
            style={{ color: 'var(--po-ink)', letterSpacing: '-0.02em' }}
          >
            Mức đáp ứng năng lực theo nhóm
          </h2>
        </div>

        <div
          className="inline-flex rounded-xl border p-1 text-xs"
          style={{ borderColor: 'var(--po-line)', background: 'var(--po-canvas)' }}
          role="group"
          aria-label="Nhóm theo"
        >
          {TOGGLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={groupBy === opt.value}
              onClick={() => onGroupByChange(opt.value)}
              className="rounded-lg px-3 py-1.5 font-semibold transition-colors"
              style={
                groupBy === opt.value
                  ? { background: 'var(--po-surface)', color: 'var(--po-accent)', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }
                  : { color: 'var(--po-muted)' }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="py-6 text-center text-sm" style={{ color: 'var(--po-muted)' }}>
          Đang tải số liệu tổng quan…
        </p>
      ) : groups.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--po-ink)' }}>
            Chưa có dữ liệu khoảng trống
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--po-muted)' }}>
            Cần có nhân viên đã gán vị trí và vị trí đã có bộ yêu cầu năng lực đang áp dụng.
          </p>
          <div className="mt-4 flex items-center justify-center">
            <Link
              to="/enterprise/positions"
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
              style={{ background: 'var(--po-primary, #0c4a60)' }}
            >
              Thiết lập & kích hoạt yêu cầu vị trí →
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--po-line)' }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ background: 'var(--po-canvas)' }}>
                <th
                  className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--po-muted)', borderBottom: `1px solid var(--po-line)` }}
                >
                  {GROUP_LABELS[groupBy]}
                </th>
                <th
                  className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--po-muted)', borderBottom: `1px solid var(--po-line)` }}
                >
                  Nhân sự
                </th>
                <th
                  className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--po-muted)', borderBottom: `1px solid var(--po-line)` }}
                >
                  Tỷ lệ đáp ứng TB
                </th>
                <th
                  className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--po-muted)', borderBottom: `1px solid var(--po-line)` }}
                >
                  Khoảng trống tổng
                </th>
                <th
                  className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--po-muted)', borderBottom: `1px solid var(--po-line)` }}
                >
                  Mức cao
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr
                  key={group.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--po-line)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--po-canvas)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <th
                    className="px-4 py-3 text-[13px] font-semibold"
                    style={{ color: 'var(--po-ink)' }}
                  >
                    {group.name}
                  </th>
                  <td
                    className="px-4 py-3 text-center tabular-nums"
                    style={{ color: 'var(--po-muted)' }}
                  >
                    {group.employees}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="font-bold tabular-nums"
                      style={{
                        color:
                          group.averageCoverage >= 100
                            ? '#16a34a'
                            : group.averageCoverage >= 70
                              ? '#ca8a04'
                              : '#dc2626',
                      }}
                    >
                      {group.averageCoverage.toFixed(1)}%
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 tabular-nums font-medium"
                    style={{ color: 'var(--po-ink)' }}
                  >
                    {group.totalGaps} gap
                  </td>
                  <td className="px-4 py-3">
                    {group.highCount > 0 ? (
                      <span
                        className="rounded-md px-2 py-0.5 text-[11px] font-bold"
                        style={{
                          background: '#fff1f2',
                          color: '#be123c',
                          border: '1px solid #fecdd3',
                        }}
                      >
                        {group.highCount} khoảng trống cao
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium" style={{ color: '#16a34a' }}>
                        Không có
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
