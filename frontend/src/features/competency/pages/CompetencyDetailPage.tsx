import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { EmptyState, LevelBadge, PageHeader, ScoreCard, StatusBadge, getStatusVariant } from '@/components/shared';
import { useCompetency, useCompetencyUsage } from '@/hooks/use-competencies';
import { levelLabel } from '@/lib/competency-levels';

const LEVELS = [1, 2, 3] as const;
const TYPE_LABELS: Record<string, string> = {
  CORE_DIGITAL: 'Năng lực số cốt lõi',
  PROFESSIONAL: 'Chuyên môn',
  INTERNAL: 'Nội bộ',
  BEHAVIOURAL: 'Hành vi',
};

/**
 * OW-15: Competency Detail (/enterprise/framework/:id)
 * Chi tiết năng lực Thông tư 02/2025: Mô tả, tiêu chí hành vi theo mức,
 * số liệu nhân viên đạt mức, các vị trí yêu cầu, các khóa học đào tạo
 * và danh sách nhân viên đang có khoảng trống thiếu hụt năng lực này.
 */
export function CompetencyDetailPage() {
  const { id = '' } = useParams();
  const competency = useCompetency(id);
  const usage = useCompetencyUsage(id);

  if (competency.isLoading) return <p className="text-sm text-slate-500">Đang tải…</p>;
  if (competency.isError || !competency.data) {
    return (
      <div role="alert" className="grid gap-3">
        <p className="text-sm text-red-600">Không tìm thấy năng lực này.</p>
        <Link to="/enterprise/framework" className="text-sm font-medium text-primary-700 underline">
          Quay lại khung năng lực
        </Link>
      </div>
    );
  }

  const c = competency.data;
  const distribution = usage.data?.levelDistribution ?? {};
  const people = [0, 1, 2, 3].reduce((sum, level) => sum + (distribution[String(level)] ?? 0), 0);
  const employeesWithGap = usage.data?.employeesWithGap ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/enterprise/framework"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Khung năng lực TT 02/2025
        </Link>
        <PageHeader
          title={c.name}
          subtitle={`${c.code} · ${c.categoryName} · ${TYPE_LABELS[c.competencyType] ?? c.competencyType}`}
        >
          <StatusBadge
            label={c.status === 'ACTIVE' ? 'Đang dùng' : c.status === 'DRAFT' ? 'Bản nháp' : 'Đã lưu trữ'}
            variant={getStatusVariant(c.status)}
          />
        </PageHeader>
      </div>

      {c.description && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="max-w-[80ch] text-sm leading-relaxed text-slate-700">{c.description}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tiêu chí theo mức */}
        <section
          aria-labelledby="criteria-title"
          className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2"
        >
          <h2 id="criteria-title" className="mb-3 text-base font-semibold text-slate-900">
            Tiêu chí hành vi theo mức
          </h2>
          {c.criteria.length === 0 ? (
            <p className="text-sm text-slate-500">Năng lực này chưa có tiêu chí hành vi.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {LEVELS.map((level) => {
                const items = c.criteria.filter((criterion) => criterion.level === level);
                return (
                  <div key={level} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                    <h3 className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-800">
                      <span>Mức {level}</span>
                      <LevelBadge level={level} />
                    </h3>
                    {items.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        Chưa có tiêu chí cho mức {levelLabel(level).toLowerCase()}.
                      </p>
                    ) : (
                      <ul className="grid gap-2">
                        {items.map((criterion) => (
                          <li
                            key={criterion.id ?? criterion.indicatorCode}
                            className="rounded-md bg-white p-3 text-sm text-slate-700 shadow-sm border border-slate-100"
                          >
                            <span className="mr-2 font-mono text-xs font-semibold text-slate-500">
                              {criterion.indicatorCode}
                            </span>
                            {criterion.behaviorIndicator}
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

        {/* Nhân viên theo mức đã xác nhận */}
        <section aria-labelledby="level-title" className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 id="level-title" className="mb-3 text-base font-semibold text-slate-900">
            Nhân viên theo mức đã xác nhận
          </h2>
          {usage.isLoading ? (
            <p className="text-sm text-slate-500">Đang tải…</p>
          ) : usage.isError || !usage.data ? (
            <p role="alert" className="text-sm text-red-600">
              Không tải được số liệu sử dụng.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((level) => (
                <ScoreCard
                  key={level}
                  label={level === 0 ? 'Chưa xác nhận' : levelLabel(level)}
                  value={distribution[String(level)] ?? 0}
                  subtitle={
                    people
                      ? `${Math.round(((distribution[String(level)] ?? 0) / people) * 100)}% tổng số`
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Vị trí đang yêu cầu */}
        <section aria-labelledby="positions-title" className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 id="positions-title" className="mb-3 text-base font-semibold text-slate-900">
            Vị trí đang yêu cầu năng lực này
          </h2>
          {usage.data && usage.data.positions.length === 0 ? (
            <EmptyState
              title="Chưa vị trí nào yêu cầu"
              description="Năng lực này chưa nằm trong bộ yêu cầu đang áp dụng của vị trí nào."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {usage.data?.positions.map((position) => (
                <li
                  key={position.positionId}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
                >
                  <Link
                    to={`/enterprise/positions/${position.positionId}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {position.positionName}
                  </Link>
                  <span className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-medium">{position.employees} nhân viên</span>
                    {position.isMandatory && <StatusBadge label="Bắt buộc" variant="warning" />}
                    <LevelBadge level={position.requiredLevel} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Phân bố trình độ nhân sự */}
        <section aria-labelledby="distribution-title" className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 id="distribution-title" className="mb-3 text-base font-semibold text-slate-900">
            Phân bố trình độ nhân sự
          </h2>
          {(() => {
            const dist = usage.data?.levelDistribution ?? {};
            const total = Object.values(dist).reduce((s, v) => s + (Number(v) || 0), 0);
            const levels = [
              { level: 0, label: 'Chưa đạt / Chưa đánh giá' },
              { level: 1, label: 'Mức 1 · Cơ bản' },
              { level: 2, label: 'Mức 2 · Trung cấp' },
              { level: 3, label: 'Mức 3 · Nâng cao' },
            ];
            return (
              <div className="space-y-3">
                {levels.map(({ level, label }) => {
                  const count = dist[String(level)] ?? 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={level} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-700">{label}</span>
                        <span className="text-slate-500">
                          {count} nhân sự (<span>{pct}%</span>)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            level === 0 ? 'bg-slate-300' : level === 1 ? 'bg-sky-500' : level === 2 ? 'bg-indigo-500' : 'bg-violet-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>

        {/* Nhân viên đang thiếu năng lực này (OW-15 mở rộng) */}
        <section
          aria-labelledby="gaps-title"
          className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 id="gaps-title" className="text-base font-semibold text-slate-900">
                Nhân viên đang thiếu năng lực này
              </h2>
              <p className="text-xs text-slate-500">
                Những nhân viên ở vị trí có yêu cầu nhưng trình độ năng lực hiện tại chưa đáp ứng
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                employeesWithGap.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {employeesWithGap.length} nhân viên cần bổ sung
            </span>
          </div>

          {employeesWithGap.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 text-emerald-900">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold">Đạt chuẩn năng lực: </span>
                Toàn bộ nhân viên tại các vị trí yêu cầu năng lực này đều đã đáp ứng hoặc vượt mức yêu cầu!
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Nhân viên</th>
                    <th className="px-4 py-2.5 font-semibold">Phòng ban</th>
                    <th className="px-4 py-2.5 font-semibold">Vị trí & Cấp bậc</th>
                    <th className="px-4 py-2.5 font-semibold">Hiện tại</th>
                    <th className="px-4 py-2.5 font-semibold">Yêu cầu</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Khoảng trống</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {employeesWithGap.map((emp) => (
                    <tr key={emp.employeeId} className="hover:bg-slate-50/80">
                      <td className="px-4 py-2.5">
                        <Link
                          to={`/enterprise/members/${emp.employeeId}`}
                          className="font-medium text-slate-900 hover:text-primary-700 hover:underline"
                        >
                          {emp.fullName}
                        </Link>
                        <div className="text-[11px] text-slate-400">{emp.email}</div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{emp.departmentName}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-slate-800">{emp.jobPositionName}</span>
                        {emp.jobGrade && (
                          <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                            {emp.jobGrade}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <LevelBadge level={emp.currentLevel} />
                      </td>
                      <td className="px-4 py-2.5">
                        <LevelBadge level={emp.requiredLevel} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                          Thiếu {emp.gap} mức
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Khóa học nâng năng lực */}
        <section
          aria-labelledby="courses-title"
          className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2"
        >
          <h2 id="courses-title" className="mb-3 text-base font-semibold text-slate-900">
            Khóa học bồi dưỡng năng lực này
          </h2>
          {usage.data && usage.data.courses.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có khóa học đã xuất bản cho miền năng lực này.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {usage.data?.courses.map((course) => (
                <li
                  key={course.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                      {course.code}
                    </span>
                    <span className="font-medium text-slate-800">{course.title}</span>
                  </span>
                  <span className="text-xs text-slate-600 font-medium">{course.assigned} lượt giao</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
