import type { CompetencyGapRow } from '@/services/analytics.service';

interface CapabilityLearningPathProps {
  competencies: CompetencyGapRow[];
  isLoading: boolean;
}

export function CapabilityLearningPath({ competencies, isLoading }: CapabilityLearningPathProps) {
  return (
    <section
      className="rounded-[22px] border p-6"
      style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
    >
      <div className="mb-4">
        <span
          className="text-[10px] font-black uppercase tracking-[0.1em]"
          style={{ color: 'var(--po-accent)' }}
        >
          Theo năng lực TT02
        </span>
        <h2
          className="mt-1 text-lg font-semibold"
          style={{ color: 'var(--po-ink)', letterSpacing: '-0.02em' }}
        >
          Mức đáp ứng từng năng lực trên toàn tổ chức
        </h2>
        <p className="mt-1 text-xs" style={{ color: 'var(--po-muted)' }}>
          Mỗi dòng so sánh mức yêu cầu trung bình với mức hiện tại trung bình. Pending không phải khoảng trống đã xác nhận.
        </p>
      </div>

      {isLoading ? (
        <p className="py-6 text-center text-sm" style={{ color: 'var(--po-muted)' }}>
          Đang tải dữ liệu năng lực…
        </p>
      ) : competencies.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--po-ink)' }}>
            Không có năng lực nào
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--po-muted)' }}>
            Không có số liệu năng lực theo bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <div className="grid gap-[6px]">
          {/* Legend */}
          <div
            className="mb-2 flex flex-wrap gap-4 text-[10px] font-bold"
            style={{ color: '#66748c' }}
          >
            <span className="inline-flex items-center gap-1.5">
              <i
                className="inline-block size-[9px] rounded-full"
                style={{ background: '#3448cf' }}
              />
              Mức hiện tại TB
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i
                className="inline-block size-[9px] rounded-full"
                style={{ background: '#ff997e' }}
              />
              Mức yêu cầu TB
            </span>
          </div>

          {competencies.map((comp) => {
            const maxLevel = 3;
            const currentPct = Math.min(100, (comp.averageCurrentLevel / maxLevel) * 100);
            const requiredPct = Math.min(100, (comp.averageRequiredLevel / maxLevel) * 100);
            const hasGap = comp.employeesWithGap > 0;

            return (
              <div
                key={comp.competencyId}
                className="grid items-center gap-x-3 gap-y-0.5 rounded-xl border px-4 py-3"
                style={{
                  gridTemplateColumns: 'minmax(130px, 1.6fr) minmax(65px, .55fr) 16px minmax(65px, .55fr) minmax(88px, .7fr)',
                  borderColor: 'var(--po-line)',
                  background: 'var(--po-surface)',
                }}
              >
                {/* Domain name */}
                <div>
                  <span
                    className="mr-2 inline-block rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold"
                    style={{ background: '#ecfdf5', color: '#15803d', borderColor: '#bbf7d0' }}
                  >
                    {comp.frameworkCode}
                  </span>
                  <strong className="text-[13px]" style={{ color: 'var(--po-ink)' }}>
                    {comp.name}
                  </strong>
                  {comp.categoryName && (
                    <small className="ml-1 text-[11px]" style={{ color: 'var(--po-muted)' }}>
                      · {comp.categoryName}
                    </small>
                  )}
                </div>

                {/* Current level */}
                <span className="text-center">
                  <b className="text-[13px]" style={{ color: '#3448cf' }}>
                    L{comp.averageCurrentLevel.toFixed(1)}
                  </b>
                  <small
                    className="block text-[10px]"
                    style={{ color: 'var(--po-muted)' }}
                  >
                    hiện tại
                  </small>
                </span>

                {/* Arrow */}
                <span
                  className="text-center text-sm"
                  style={{ color: '#8998b7' }}
                  aria-hidden="true"
                >
                  →
                </span>

                {/* Required level */}
                <span className="text-center">
                  <b className="text-[13px]" style={{ color: 'var(--po-accent)' }}>
                    L{comp.averageRequiredLevel.toFixed(1)}
                  </b>
                  <small
                    className="block text-[10px]"
                    style={{ color: 'var(--po-muted)' }}
                  >
                    yêu cầu
                  </small>
                </span>

                {/* Gap severity badges */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  {comp.highCount > 0 && (
                    <span
                      className="rounded-md px-1.5 py-0.5 font-semibold"
                      style={{ background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' }}
                    >
                      {comp.highCount} Cao
                    </span>
                  )}
                  {comp.mediumCount > 0 && (
                    <span
                      className="rounded-md px-1.5 py-0.5 font-semibold"
                      style={{ background: '#fefce8', color: '#a16207', border: '1px solid #fde68a' }}
                    >
                      {comp.mediumCount} TB
                    </span>
                  )}
                  {comp.lowCount > 0 && (
                    <span
                      className="rounded-md px-1.5 py-0.5"
                      style={{ background: 'var(--po-canvas)', color: 'var(--po-muted)' }}
                    >
                      {comp.lowCount} Thấp
                    </span>
                  )}
                  {!hasGap && (
                    <span className="font-medium" style={{ color: '#16a34a' }}>
                      Đạt chuẩn
                    </span>
                  )}
                </div>

                {/* Level bars — full width */}
                <div
                  className="col-span-full mt-1 flex gap-1.5"
                  style={{ gridColumn: '1 / -1' }}
                >
                  <div
                    className="h-1.5 flex-1 rounded-full overflow-hidden"
                    style={{ background: '#e8edf6' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${currentPct}%`,
                        background: '#3448cf',
                        transition: 'width .3s ease',
                      }}
                    />
                  </div>
                  <div
                    className="h-1.5 flex-1 rounded-full overflow-hidden"
                    style={{ background: '#e8edf6' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${requiredPct}%`,
                        background: '#ff997e',
                        transition: 'width .3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
