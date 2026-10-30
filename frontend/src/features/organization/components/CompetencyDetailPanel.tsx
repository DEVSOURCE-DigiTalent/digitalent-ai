import { Link } from 'react-router-dom';
import { useCompetencyUsage } from '@/hooks/use-competencies';
import { levelLabel } from '@/lib/competency-levels';
import type { CompetencyDetail } from '@/services/competency.service';

interface CompetencyDetailPanelProps {
  competency: CompetencyDetail;
}

const LEVELS = [1, 2, 3] as const;

export function CompetencyDetailPanel({
  competency: c,
}: CompetencyDetailPanelProps) {
  const usage = useCompetencyUsage(c.id);
  const dist = usage.data?.levelDistribution ?? {};
  const total = Object.values(dist).reduce(
    (s, v) => s + (Number(v) || 0),
    0,
  );
  const employeesWithGap = usage.data?.employeesWithGap ?? [];

  return (
    <div className="space-y-4">
      {/* Description */}
      {c.description && (
        <div
          className="rounded-[17px] border p-5"
          style={{
            borderColor: 'var(--po-line)',
            background: 'var(--po-surface)',
          }}
        >
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--po-ink)', maxWidth: '75ch' }}
          >
            {c.description}
          </p>
        </div>
      )}

      {/* Criteria by level */}
      <section
        className="rounded-[17px] border p-5"
        style={{
          borderColor: 'var(--po-line)',
          background: 'var(--po-surface)',
        }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.12em]"
          style={{ color: 'var(--po-muted)' }}
        >
          Tiêu chí hành vi theo mức
          <span
            className="ml-[7px] inline-block size-1.5 rounded-full align-middle"
            style={{ background: 'var(--po-coral)' }}
          />
        </p>
        {c.criteria.length === 0 ? (
          <p
            className="mt-3 text-xs"
            style={{ color: 'var(--po-muted)' }}
          >
            Năng lực này chưa có tiêu chí hành vi.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {LEVELS.map((level) => {
              const items = c.criteria.filter((cr) => cr.level === level);
              return (
                <div
                  key={level}
                  className="rounded-[13px] border p-4"
                  style={{
                    borderColor: 'var(--po-line)',
                    background:
                      'linear-gradient(145deg, var(--po-surface), var(--po-raised))',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <strong
                      className="text-sm"
                      style={{ color: 'var(--po-ink)' }}
                    >
                      Mức {level}
                    </strong>
                    <span
                      className="rounded-lg px-2 py-1 text-[9px] font-extrabold"
                      style={{
                        background: 'var(--po-soft)',
                        color: 'var(--po-accent)',
                      }}
                    >
                      {levelLabel(level)}
                    </span>
                  </div>
                  {items.length === 0 ? (
                    <p
                      className="text-[11px]"
                      style={{ color: 'var(--po-muted)' }}
                    >
                      Chưa có tiêu chí cho mức{' '}
                      {levelLabel(level).toLowerCase()}.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {items.map((cr) => (
                        <li
                          key={cr.id ?? cr.indicatorCode}
                          className="rounded-lg border p-3 text-[11px] leading-relaxed"
                          style={{
                            borderColor: 'var(--po-line)',
                            background: 'var(--po-surface)',
                            color: 'var(--po-ink)',
                          }}
                        >
                          <span
                            className="mr-1.5 font-mono text-[10px] font-bold"
                            style={{ color: 'var(--po-accent)' }}
                          >
                            {cr.indicatorCode}
                          </span>
                          {cr.behaviorIndicator}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Distribution + positions row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Level distribution */}
        <section
          className="rounded-[17px] border p-5"
          style={{
            borderColor: 'var(--po-line)',
            background: 'var(--po-surface)',
          }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-[0.12em] mb-4"
            style={{ color: 'var(--po-muted)' }}
          >
            Phân bố trình độ nhân sự
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((level) => {
              const count = dist[String(level)] ?? 0;
              const pct =
                total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div
                  key={level}
                  className="rounded-[11px] border p-3 text-center"
                  style={{
                    borderColor: 'var(--po-line)',
                    background:
                      'linear-gradient(145deg, var(--po-surface), var(--po-raised))',
                  }}
                >
                  <span
                    className="block text-2xl font-bold"
                    style={{ color: 'var(--po-ink)' }}
                  >
                    {count}
                  </span>
                  <span
                    className="block text-[10px] font-bold mt-1"
                    style={{ color: 'var(--po-muted)' }}
                  >
                    {level === 0 ? 'Chưa xác nhận' : levelLabel(level)}
                  </span>
                  <span
                    className="block text-[9px] mt-0.5"
                    style={{ color: 'var(--po-muted)' }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Positions requiring this competency */}
        <section
          className="rounded-[17px] border p-5"
          style={{
            borderColor: 'var(--po-line)',
            background: 'var(--po-surface)',
          }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-[0.12em] mb-4"
            style={{ color: 'var(--po-muted)' }}
          >
            Vị trí đang yêu cầu
          </p>
          {usage.isLoading ? (
            <p
              className="text-xs"
              style={{ color: 'var(--po-muted)' }}
            >
              Đang tải…
            </p>
          ) : usage.data?.positions.length === 0 ? (
            <p
              className="text-xs"
              style={{ color: 'var(--po-muted)' }}
            >
              Chưa vị trí nào yêu cầu năng lực này.
            </p>
          ) : (
            <div className="space-y-2">
              {usage.data?.positions.map((pos) => (
                <Link
                  key={pos.positionId}
                  to={`/enterprise/positions/${pos.positionId}`}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-[11px] transition-colors hover:bg-[var(--po-soft)]"
                  style={{ borderColor: 'var(--po-line)' }}
                >
                  <span
                    className="font-semibold"
                    style={{ color: 'var(--po-ink)' }}
                  >
                    {pos.positionName}
                  </span>
                  <span className="flex items-center gap-2">
                    <span style={{ color: 'var(--po-muted)' }}>
                      {pos.employees} nhân viên
                    </span>
                    <span
                      className="rounded-lg px-2 py-0.5 text-[9px] font-extrabold"
                      style={{
                        background: 'var(--po-soft)',
                        color: 'var(--po-accent)',
                      }}
                    >
                      Mức {pos.requiredLevel}
                    </span>
                    {pos.isMandatory && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                        style={{
                          background: '#fef3c7',
                          color: '#d97706',
                        }}
                      >
                        Bắt buộc
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Employees with gap */}
      <section
        className="rounded-[17px] border p-5"
        style={{
          borderColor: 'var(--po-line)',
          background: 'var(--po-surface)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.12em]"
              style={{ color: 'var(--po-muted)' }}
            >
              Nhân viên đang thiếu năng lực này
            </p>
            <p
              className="text-[11px] mt-1"
              style={{ color: 'var(--po-muted)' }}
            >
              Trình độ hiện tại chưa đáp ứng yêu cầu vị trí
            </p>
          </div>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={
              employeesWithGap.length > 0
                ? { background: '#fef3c7', color: '#d97706' }
                : { background: '#ecfdf5', color: '#16a34a' }
            }
          >
            {employeesWithGap.length} cần bổ sung
          </span>
        </div>
        {employeesWithGap.length === 0 ? (
          <div
            className="flex items-center gap-3 rounded-[11px] border p-4"
            style={{
              borderColor: '#bbf7d0',
              background: '#ecfdf5',
              color: '#16a34a',
            }}
          >
            <span className="text-lg">✓</span>
            <span className="text-xs font-semibold">
              Toàn bộ nhân viên đều đáp ứng hoặc vượt mức yêu cầu.
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {employeesWithGap.map((emp) => (
              <Link
                key={emp.employeeId}
                to={`/enterprise/members/${emp.employeeId}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[11px] transition-colors hover:bg-[var(--po-soft)]"
                style={{ borderColor: 'var(--po-line)' }}
              >
                <div>
                  <strong style={{ color: 'var(--po-ink)' }}>
                    {emp.fullName}
                  </strong>
                  <span
                    className="ml-2"
                    style={{ color: 'var(--po-muted)' }}
                  >
                    {emp.departmentName} · {emp.jobPositionName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--po-muted)' }}>
                    Hiện mức {emp.currentLevel} → Yêu cầu mức{' '}
                    {emp.requiredLevel}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: '#fee2e2', color: '#dc2626' }}
                  >
                    Thiếu {emp.gap}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Courses */}
      <section
        className="rounded-[17px] border p-5"
        style={{
          borderColor: 'var(--po-line)',
          background: 'var(--po-surface)',
        }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.12em] mb-4"
          style={{ color: 'var(--po-muted)' }}
        >
          Khóa học bồi dưỡng
        </p>
        {usage.isLoading ? (
          <p
            className="text-xs"
            style={{ color: 'var(--po-muted)' }}
          >
            Đang tải…
          </p>
        ) : usage.data?.courses.length === 0 ? (
          <p
            className="text-xs"
            style={{ color: 'var(--po-muted)' }}
          >
            Chưa có khóa học đã xuất bản cho năng lực này.
          </p>
        ) : (
          <div className="space-y-1.5">
            {usage.data?.courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-[11px]"
                style={{ borderColor: 'var(--po-line)' }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="font-mono text-[10px] font-bold rounded px-1.5 py-0.5"
                    style={{
                      background: 'var(--po-soft)',
                      color: 'var(--po-accent)',
                    }}
                  >
                    {course.code}
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: 'var(--po-ink)' }}
                  >
                    {course.title}
                  </span>
                </span>
                <span style={{ color: 'var(--po-muted)' }}>
                  {course.assigned} lượt giao
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
