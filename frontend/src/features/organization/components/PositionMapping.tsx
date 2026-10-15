import { Link } from 'react-router-dom';

interface DomainLevel {
  name: string;
  sortOrder: number;
  averageRequired: number;
  averageCurrent: number;
}

interface PositionMappingProps {
  domains: DomainLevel[];
  isLoading: boolean;
}

const LEVEL_LABELS = ['—', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const DIGITAL_AI_LEVEL = 3;

export function PositionMapping({ domains, isLoading }: PositionMappingProps) {
  return (
    <section
      className="rounded-[22px] border p-6"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
        boxShadow: '0 10px 35px rgba(29,48,102,.025)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <span
            className="text-[10px] font-black uppercase tracking-[0.12em]"
            style={{ color: 'var(--po-accent)' }}
          >
            Mức yêu cầu theo miền
          </span>
          <h2
            className="mt-2 text-xl font-semibold"
            style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
          >
            Thiết lập mức theo miền năng lực.
          </h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--po-muted)' }}>
            Trần con không được vượt trần cha. Công bố trước khi mời nhân
            viên.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p
          className="py-6 text-center text-sm"
          style={{ color: 'var(--po-muted)' }}
        >
          Đang tải…
        </p>
      ) : domains.length === 0 ? (
        <p
          className="py-6 text-center text-sm"
          style={{ color: 'var(--po-muted)' }}
        >
          Chưa có dữ liệu miền năng lực.
        </p>
      ) : (
        <>
          {/* Header row */}
          <div
            className="mt-5 grid items-center gap-3 text-[10px] uppercase tracking-wider font-bold pb-2"
            style={{
              gridTemplateColumns: '1fr 90px 90px',
              color: 'var(--po-muted)',
              borderBottom: '1px solid var(--po-line)',
            }}
          >
            <span>Digital AI standard</span>
            <span className="text-center">Mục tiêu TB</span>
            <span className="text-center">Hiện tại TB</span>
          </div>

          {/* Domain rows */}
          <div className="grid gap-0">
            {domains
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((d, i) => (
                <div
                  key={d.name}
                  className="grid items-center gap-3 py-3"
                  style={{
                    gridTemplateColumns: '1fr 90px 90px',
                    borderBottom:
                      i < domains.length - 1
                        ? '1px solid var(--po-line)'
                        : 'none',
                  }}
                >
                  <div>
                    <strong
                      className="block text-[13px]"
                      style={{ color: 'var(--po-ink)' }}
                    >
                      {d.name}
                    </strong>
                    <small
                      className="text-[11px]"
                      style={{ color: 'var(--po-muted)' }}
                    >
                      Digital AI: {LEVEL_LABELS[DIGITAL_AI_LEVEL]}
                    </small>
                  </div>
                  <span
                    className="text-center text-[13px] font-bold tabular-nums"
                    style={{ color: 'var(--po-accent)' }}
                  >
                    L{d.averageRequired.toFixed(1)}
                  </span>
                  <span
                    className="text-center text-[13px] font-bold tabular-nums"
                    style={{
                      color:
                        d.averageCurrent >= d.averageRequired
                          ? '#16a34a'
                          : '#ca8a04',
                    }}
                  >
                    L{d.averageCurrent.toFixed(1)}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Link
          to="/enterprise/requirements/builder"
          className="inline-flex items-center gap-2 rounded-[11px] px-4 py-3 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
          style={{
            background: 'var(--po-accent)',
            color: '#fff',
            boxShadow: '0 9px 18px rgba(52,72,207,.17)',
          }}
        >
          Thiết lập yêu cầu →
        </Link>
        <Link
          to="/enterprise/members"
          className="inline-flex items-center gap-2 rounded-[11px] border px-4 py-3 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
          style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
        >
          Tiếp tục mời nhân viên
        </Link>
      </div>

      <p
        className="mt-4 text-[11px] leading-relaxed"
        style={{ color: '#789' }}
      >
        Khung năng lực số 6 miền do Platform Admin công bố. Tổ chức chỉ chỉnh
        sửa trần và mục tiêu bên dưới khung nền tảng.
      </p>
    </section>
  );
}
