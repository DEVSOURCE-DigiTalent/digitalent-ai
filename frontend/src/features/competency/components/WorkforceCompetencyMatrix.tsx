import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { useCompetencyMatrix } from '@/hooks/use-workforce';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { INPUT_CLASS } from '@/features/onboarding/components/styles';
import { JOB_GRADES } from '@/lib/terms';

export interface WorkforceCompetencyMatrixProps {
  /** Optional department ID to lock down scope (used by Agent 2 for Manager MG-04). */
  departmentId?: string;
  hideDepartmentFilter?: boolean;
  title?: string;
  subtitle?: string;
  readOnly?: boolean;
}

/**
 * OW-19 / MG-04: Workforce Competency Matrix
 * Ma trận năng lực 2 chiều: Nhân viên x Năng lực TT02 (hiện tại / yêu cầu / khoảng trống / trạng thái minh chứng).
 * Tái sử dụng cho cả Owner (toàn tổ chức) và Manager (theo phòng ban nhóm).
 */
export function WorkforceCompetencyMatrix({
  departmentId: fixedDeptId,
  hideDepartmentFilter = false,
  title = 'Ma trận năng lực nhân sự',
  subtitle = 'So sánh trực quan trình độ hiện tại, yêu cầu vị trí và khoảng trống năng lực theo chuẩn Thông tư 02/2025',
  readOnly: _readOnly = false,
}: WorkforceCompetencyMatrixProps) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState(fixedDeptId || '');
  const [selectedPos, setSelectedPos] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const effectiveDeptId = fixedDeptId || selectedDept;

  const { data: matrixData, isLoading } = useCompetencyMatrix({
    departmentId: effectiveDeptId || undefined,
    jobPositionId: selectedPos || undefined,
    jobGrade: selectedGrade || undefined,
    search: search.trim() || undefined,
  });

  const { data: departmentsData } = useDepartments({ pageSize: 100 });
  const { data: positionsData } = useJobPositions({ pageSize: 100 });

  const departments = departmentsData?.items ?? [];
  const positions = positionsData?.items ?? [];

  const categories = matrixData?.categories ?? [];
  const allCompetencies = matrixData?.competencies ?? [];
  const employees = matrixData?.employees ?? [];

  // Filter competencies by selected category
  const filteredCompetencies = useMemo(() => {
    if (!selectedCategory) return allCompetencies;
    return allCompetencies.filter((c) => c.categoryId === selectedCategory);
  }, [allCompetencies, selectedCategory]);

  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} />

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc mã nhân viên..."
              className={`${INPUT_CLASS} pl-9`}
            />
          </div>
        </div>

        {!hideDepartmentFilter && !fixedDeptId && (
          <div className="w-48">
            <select
              aria-label="Lọc theo phòng ban"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Tất cả phòng ban</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="w-48">
          <select
            aria-label="Lọc theo vị trí"
            value={selectedPos}
            onChange={(e) => setSelectedPos(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Tất cả vị trí</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-36">
          <select
            aria-label="Lọc theo Cấp bậc G1-G3"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Mọi cấp bậc</option>
            {JOB_GRADES.map((g: string) => (
              <option key={g} value={g}>
                Cấp bậc {g}
              </option>
            ))}
          </select>
        </div>

        <div className="w-52">
          <select
            aria-label="Lọc theo miền năng lực"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Tất cả 6 miền năng lực</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-sm text-slate-500">Đang tải ma trận năng lực...</div>
        ) : employees.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Không tìm thấy nhân viên nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 z-20 bg-slate-50 text-slate-700 shadow-sm border-b border-slate-200">
                <tr>
                  <th className="sticky left-0 z-30 bg-slate-50 px-4 py-3 min-w-[240px] font-semibold border-r border-slate-200">
                    Nhân viên & Vị trí
                  </th>
                  <th className="px-3 py-3 w-24 text-center font-semibold border-r border-slate-200">
                    % Đáp ứng
                  </th>
                  {filteredCompetencies.map((comp) => (
                    <th
                      key={comp.id}
                      className="px-2.5 py-3 min-w-[100px] text-center font-semibold border-r border-slate-200"
                      title={`${comp.frameworkCode}: ${comp.name}`}
                    >
                      <div className="font-mono text-[11px] font-bold text-primary-700">
                        {comp.frameworkCode || comp.code}
                      </div>
                      <div className="line-clamp-1 text-[10px] text-slate-500 font-normal">
                        {comp.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {employees.map((emp) => (
                  <tr key={emp.employeeId} className="hover:bg-slate-50/80 transition-colors">
                    {/* Fixed employee header column */}
                    <td className="sticky left-0 z-10 bg-white px-4 py-2.5 border-r border-slate-200 hover:bg-slate-50/80">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            to={`/enterprise/competency-profiles/${emp.employeeId}`}
                            className="font-semibold text-slate-900 hover:text-primary-700 hover:underline"
                          >
                            {emp.fullName}
                          </Link>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span>{emp.departmentName}</span>
                            <span>·</span>
                            <span>{emp.jobPositionName}</span>
                            {emp.jobGrade && (
                              <span className="rounded bg-slate-100 px-1 py-0.2 font-semibold text-slate-700 text-[10px]">
                                {emp.jobGrade}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          to={`/enterprise/competency-profiles/${emp.employeeId}`}
                          className="text-slate-400 hover:text-primary-700"
                          title="Xem hồ sơ năng lực chi tiết"
                        >
                          <ChevronRight className="size-4" />
                        </Link>
                      </div>
                    </td>

                    {/* Coverage & Gap count */}
                    <td className="px-3 py-2.5 text-center border-r border-slate-200 font-medium">
                      {emp.coveragePercent !== null ? (
                        <div>
                          <span
                            className={`inline-block font-bold ${
                              emp.coveragePercent >= 100
                                ? 'text-emerald-700'
                                : emp.coveragePercent >= 70
                                  ? 'text-amber-700'
                                  : 'text-rose-700'
                            }`}
                          >
                            {emp.coveragePercent.toFixed(0)}%
                          </span>
                          {emp.totalGaps > 0 && (
                            <div className="text-[10px] text-rose-600 font-semibold">
                              {emp.totalGaps} gap
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Matrix Cells */}
                    {filteredCompetencies.map((comp) => {
                      const cell = emp.cells[comp.id] || { currentLevel: 0, requiredLevel: 0, gap: 0 };
                      const isNotReq = cell.requiredLevel === 0;
                      const hasGap = cell.gap > 0;

                      return (
                        <td
                          key={comp.id}
                          className={`px-2 py-2 text-center border-r border-slate-100 ${
                            isNotReq
                              ? 'bg-slate-50/30'
                              : hasGap
                                ? 'bg-rose-50/40'
                                : 'bg-emerald-50/30'
                          }`}
                          title={`Hiện tại: Mức ${cell.currentLevel} | Yêu cầu: Mức ${cell.requiredLevel}${
                            hasGap ? ` (Thiếu ${cell.gap} mức)` : ''
                          }${cell.evidenceStatus === 'CONFIRMED' ? ' · Đã có minh chứng xác nhận' : ''}`}
                        >
                          {isNotReq ? (
                            <span className="text-slate-300 font-mono">—</span>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              <span
                                className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold ${
                                  hasGap
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {cell.currentLevel}/{cell.requiredLevel}
                              </span>
                              {hasGap && (
                                <span className="text-[10px] font-medium text-rose-600 mt-0.5">
                                  -{cell.gap}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-block size-3 rounded bg-emerald-100 border border-emerald-300" />
            <span>Đạt yêu cầu vị trí (Hiện tại &ge; Yêu cầu)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-3 rounded bg-rose-100 border border-rose-300" />
            <span>Có khoảng trống năng lực (Hiện tại &lt; Yêu cầu)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono font-bold">—</span>
            <span>Không yêu cầu cho vị trí này</span>
          </div>
        </div>
      </div>
    </div>
  );
}
