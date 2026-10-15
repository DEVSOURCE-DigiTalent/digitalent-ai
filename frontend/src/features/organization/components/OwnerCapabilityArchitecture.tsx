import { Link } from 'react-router-dom';

interface OwnerCapabilityArchitectureProps {
  orgName: string;
  departmentCount: number;
  positionCount: number;
  averageCoverage: number;
}

export function OwnerCapabilityArchitecture({
  orgName,
  departmentCount,
  positionCount,
  averageCoverage,
}: OwnerCapabilityArchitectureProps) {
  const levels = [
    { label: 'Digital AI', sublabel: 'Chuẩn nền tảng', percent: 100 },
    {
      label: orgName || 'Tổ chức',
      sublabel: `${departmentCount} phòng ban`,
      percent: Math.min(85, Math.max(20, averageCoverage + 15)),
    },
    {
      label: 'Phòng ban',
      sublabel: `${departmentCount} đơn vị`,
      percent: Math.min(70, Math.max(15, averageCoverage)),
    },
    {
      label: 'Vị trí',
      sublabel: `${positionCount} vị trí`,
      percent: Math.min(55, Math.max(10, averageCoverage - 10)),
    },
  ];

  return (
    <section
      className="rounded-[22px] border p-6"
      style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
    >
      <p
        className="text-[10px] font-black uppercase tracking-[0.12em]"
        style={{ color: 'var(--po-muted)' }}
      >
        Kiến trúc năng lực
        <span
          className="ml-[7px] inline-block size-1.5 rounded-full align-middle"
          style={{ background: 'var(--po-coral)' }}
        />
      </p>
      <h2
        className="mt-[11px] text-xl font-semibold tracking-[-0.045em]"
        style={{ color: 'var(--po-ink)' }}
      >
        Từ khung nền tảng đến vị trí.
      </h2>
      <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--po-muted)' }}>
        Mục tiêu đã công bố xác định yêu cầu cho từng nhân viên.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {levels.map((level) => (
          <div
            key={level.label}
            className="rounded-[13px] border p-[17px]"
            style={{
              borderColor: 'var(--po-line)',
              background: 'linear-gradient(145deg, #fff, #f8faff)',
            }}
          >
            <strong className="text-sm block" style={{ color: 'var(--po-ink)' }}>
              {level.label}
            </strong>
            <small className="text-[11px] block mt-0.5" style={{ color: 'var(--po-muted)' }}>
              {level.sublabel}
            </small>
            <div
              className="mt-3 h-[5px] rounded-full overflow-hidden"
              style={{ background: 'var(--po-line)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${level.percent}%`, background: 'var(--po-accent)' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to="/setup"
          className="rounded-xl border px-3 py-2 text-xs font-extrabold transition-colors hover:opacity-80"
          style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
        >
          Sửa kiến trúc
        </Link>
        <Link
          to="/enterprise/skill-gap"
          className="rounded-xl px-3 py-2 text-xs font-extrabold transition-colors hover:opacity-80"
          style={{ color: 'var(--po-muted)' }}
        >
          Xem khoảng trống
        </Link>
      </div>
    </section>
  );
}
