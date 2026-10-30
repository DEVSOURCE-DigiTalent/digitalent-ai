interface DomainRow {
  name: string;
  averageCurrent: number;
  averageRequired: number;
}

interface ReportDomainBreakdownProps {
  domains: DomainRow[];
  isLoading: boolean;
}

export function ReportDomainBreakdown({
  domains,
  isLoading,
}: ReportDomainBreakdownProps) {
  const maxLevel = 3;

  return (
    <section
      className="rounded-[22px] border p-6"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
        boxShadow: '0 10px 35px rgba(29,48,102,.025)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-1">
        <div>
          <span
            className="text-[10px] font-black uppercase tracking-[0.12em]"
            style={{ color: 'var(--po-accent)' }}
          >
            Phân tích 6 miền TT02
          </span>
          <h2
            className="mt-2 text-xl font-semibold"
            style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
          >
            Mức hiện tại bên cạnh mục tiêu yêu cầu.
          </h2>
        </div>
        <p className="text-xs" style={{ color: 'var(--po-muted)' }}>
          Hoàn thành khóa học không ghi đè kết quả đánh giá năng lực cơ sở.
        </p>
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
          <div
            className="mt-4 mb-3 flex gap-4 text-[10px] font-bold"
            style={{ color: '#66748c' }}
          >
            <span className="inline-flex items-center gap-1.5">
              <i
                className="inline-block size-[9px] rounded-full"
                style={{ background: '#137b84' }}
              />
              Mức hiện tại TB
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i
                className="inline-block size-[9px] rounded-full"
                style={{ background: '#eeb093' }}
              />
              Mức yêu cầu TB
            </span>
          </div>

          <div className="grid gap-2">
            {domains.map((d, i) => {
              const currentPct = Math.min(
                100,
                (d.averageCurrent / maxLevel) * 100,
              );
              const requiredPct = Math.min(
                100,
                (d.averageRequired / maxLevel) * 100,
              );
              const coverage =
                d.averageRequired > 0
                  ? Math.round(
                      (d.averageCurrent / d.averageRequired) * 100,
                    )
                  : 100;

              return (
                <div
                  key={d.name}
                  className="rounded-xl border px-4 py-3"
                  style={{
                    borderColor: 'var(--po-line)',
                    background: 'var(--po-surface)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold"
                        style={{
                          background: '#ecfdf5',
                          color: '#15803d',
                          borderColor: '#bbf7d0',
                        }}
                      >
                        D{i + 1}
                      </span>
                      <strong
                        className="text-[13px]"
                        style={{ color: 'var(--po-ink)' }}
                      >
                        {d.name}
                      </strong>
                    </div>
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{
                        color:
                          coverage >= 100
                            ? '#16a34a'
                            : coverage >= 70
                              ? '#ca8a04'
                              : '#dc2626',
                      }}
                    >
                      {coverage}%
                    </span>
                  </div>

                  <div className="flex gap-2 items-center">
                    <div
                      className="flex items-center gap-1 text-[10px] shrink-0"
                      style={{ color: 'var(--po-muted)', minWidth: 55 }}
                    >
                      <b style={{ color: '#137b84' }}>
                        L{d.averageCurrent.toFixed(1)}
                      </b>{' '}
                      hiện
                    </div>
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'var(--po-raised)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${currentPct}%`,
                          background: '#137b84',
                          transition: 'width .3s ease',
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 items-center mt-1">
                    <div
                      className="flex items-center gap-1 text-[10px] shrink-0"
                      style={{ color: 'var(--po-muted)', minWidth: 55 }}
                    >
                      <b style={{ color: '#eeb093' }}>
                        L{d.averageRequired.toFixed(1)}
                      </b>{' '}
                      cần
                    </div>
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'var(--po-raised)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${requiredPct}%`,
                          background: '#eeb093',
                          transition: 'width .3s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
