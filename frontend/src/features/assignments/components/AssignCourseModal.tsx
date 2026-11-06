import { useCallback, useId, useMemo, useState, useEffect } from 'react';
import { BookOpen, BriefcaseBusiness, Building2, CalendarDays, CircleCheck, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/shared';
import { useCourseCatalog, useCreateAssignments } from '@/hooks/use-assignments';
import { useDepartments } from '@/hooks/use-departments';
import { useAllEmployees } from '@/hooks/use-employees';
import { useJobPositions } from '@/hooks/use-job-positions';
import { useSkillGapRuns } from '@/hooks/use-skill-gaps';
import { apiErrorMessage } from '@/lib/utils';
import { JOB_GRADES } from '@/lib/roles';
import { JOB_GRADE_DEFAULT_NAMES } from '@/lib/terms';
import type { CreateAssignmentResult } from '@/services/assignment.service';
import { INPUT_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import { LEVEL_SUFFIX_LABELS, SKIP_REASON_LABELS } from '../assignment-labels';
import './assign-course-modal.css';

type TargetKind = 'employees' | 'department' | 'position' | 'grade' | 'gap';

const TARGET_CHOICES: ReadonlyArray<readonly [TargetKind, string]> = import.meta.env.VITE_USE_MOCK === 'true'
  ? [
      ['employees', 'Từng nhân viên'],
      ['department', 'Cả phòng ban'],
      ['position', 'Mọi người ở một vị trí'],
      ['grade', 'Theo Cấp bậc (G1–G3)'],
      ['gap', 'Theo khoảng trống năng lực'],
    ]
  : [
      ['employees', 'Từng nhân viên'],
      ['department', 'Cả phòng ban'],
      ['position', 'Mọi người ở một vị trí'],
    ];

const TARGET_ICONS = { employees: UsersRound, department: Building2, position: BriefcaseBusiness, grade: UsersRound, gap: CircleCheck };

interface AssignCourseModalProps {
  open: boolean;
  onClose: () => void;
  /** Start from a course (for example the one a recommendation points to). */
  courseId?: string;
  /** Start from chosen people. */
  employeeIds?: string[];
}

/**
 * OW-28: Training Assignment (/enterprise/assignments/create)
 * Giao khóa học chuẩn theo:
 * - Từng nhân viên
 * - Cả phòng ban
 * - Vị trí công việc
 * - Cấp bậc (Job Grade G1–G3)
 * - Tự động từ Khoảng trống năng lực (Skill Gap)
 */
export function AssignCourseModal({ open, onClose, courseId: initialCourse, employeeIds: initialEmployees }: AssignCourseModalProps) {
  const base = useId();
  const create = useCreateAssignments();
  const courses = useCourseCatalog({ status: 'PUBLISHED' }, open).data?.items ?? [];
  const departments = useDepartments({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const positionsData = useJobPositions({ pageSize: 100, status: 'ACTIVE' }).data?.items;
  const positions = useMemo(() => positionsData ?? [], [positionsData]);
  const { data: employeesData, isLoading: employeesLoading } = useAllEmployees({ status: 'ACTIVE' }, open);
  const employees = useMemo(() => employeesData ?? [], [employeesData]);
  const { data: skillGapsData } = useSkillGapRuns({ pageSize: 100 }, open && import.meta.env.VITE_USE_MOCK === 'true');

  const [courseId, setCourseId] = useState(initialCourse ?? '');
  const [kind, setKind] = useState<TargetKind>('employees');
  const [employeeIds, setEmployeeIds] = useState<string[]>(initialEmployees ?? []);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [jobPositionId, setJobPositionId] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('G1');
  const [gapEmployees, setGapEmployees] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<CreateAssignmentResult>();

  // Determine current course category to detect gaps
  const selectedCourse = courses.find((c) => c.id === courseId);

  // Compute employees who have a skill gap relevant to this course
  const gapCandidateEmployees = useMemo(() => {
    if (!selectedCourse) return [];
    const runs = skillGapsData?.items || [];
    // An employee has gap if their latest run has gapItems matching course category
    const empIdsWithGap = new Set<string>();
    for (const run of runs) {
      if (run.gapCount > 0) {
        empIdsWithGap.add(run.employeeId);
      }
    }
    return employees.filter((e) => empIdsWithGap.has(e.id));
  }, [selectedCourse, skillGapsData, employees]);

  // When kind changes to 'gap', auto-select candidate employees
  useEffect(() => {
    if (kind === 'gap') {
      setGapEmployees(gapCandidateEmployees.map((e) => e.id));
    }
  }, [kind, gapCandidateEmployees]);

  const posGradeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const pos of positions) {
      if (pos.jobGrade) map.set(pos.id, pos.jobGrade);
    }
    return map;
  }, [positions]);

  const getEmployeeGrade = useCallback((e: { jobPositionId?: string; positionId?: string }) => {
    const posId = e.jobPositionId || e.positionId;
    return posId ? posGradeMap.get(posId) : undefined;
  }, [posGradeMap]);

  const visibleEmployees = useMemo(
    () => employees.filter((e) => !search || e.fullName.toLowerCase().includes(search.toLowerCase()) || e.employeeCode.toLowerCase().includes(search.toLowerCase())),
    [employees, search],
  );

  const gradeEmployees = useMemo(
    () => employees.filter((e) => getEmployeeGrade(e) === selectedGrade),
    [employees, selectedGrade, getEmployeeGrade]
  );

  const selectedDeptEmployees = useMemo(
    () => employees.filter((e) => e.departmentId && selectedDepartmentIds.includes(e.departmentId)),
    [employees, selectedDepartmentIds]
  );

  const targets = useMemo(() => {
    if (kind === 'employees') return { employeeIds };
    if (kind === 'department') {
      if (selectedDepartmentIds.length === 1) return { departmentId: selectedDepartmentIds[0] };
      return { employeeIds: selectedDeptEmployees.map((e) => e.id) };
    }
    if (kind === 'position') return { jobPositionId };
    if (kind === 'grade') return { employeeIds: gradeEmployees.map((e) => e.id), jobGrade: selectedGrade };
    if (kind === 'gap') return { employeeIds: gapEmployees };
    return { employeeIds };
  }, [kind, employeeIds, selectedDepartmentIds, selectedDeptEmployees, jobPositionId, selectedGrade, gradeEmployees, gapEmployees]);

  const hasTarget = useMemo(() => {
    if (kind === 'employees') return employeeIds.length > 0;
    if (kind === 'department') return selectedDepartmentIds.length > 0 && selectedDeptEmployees.length > 0;
    if (kind === 'position') return Boolean(jobPositionId);
    if (kind === 'grade') return gradeEmployees.length > 0;
    if (kind === 'gap') return gapEmployees.length > 0;
    return false;
  }, [kind, employeeIds, selectedDepartmentIds, selectedDeptEmployees, jobPositionId, gradeEmployees, gapEmployees]);
  const targetCount = kind === 'employees' ? employeeIds.length : kind === 'department' ? selectedDeptEmployees.length : kind === 'position' ? employees.filter((employee) => employee.jobPositionId === jobPositionId || employee.positionId === jobPositionId).length : kind === 'grade' ? gradeEmployees.length : gapEmployees.length;

  const today = new Date().toISOString().slice(0, 10);

  const submit = async () => {
    setError(undefined);
    try {
      const outcome = await create.mutateAsync({ courseId, dueDate: dueDate || undefined, targets });
      setResult(outcome);
      if (outcome.created.length > 0) toast.success(`Đã giao khóa học cho ${outcome.created.length} nhân viên.`);
    } catch (failure) {
      setError(apiErrorMessage(failure, 'Không giao được khóa học.'));
    }
  };

  const toggle = (id: string) => setEmployeeIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  const toggleGap = (id: string) => setGapEmployees((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      className="assign-course-dialog"
      title="Giao khóa học"
      description="Chọn khóa học, đối tượng nhận và hạn hoàn thành."
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>{result ? 'Đóng' : 'Hủy'}</button>
          {!result && (
            <button type="button" onClick={submit} disabled={!courseId || !hasTarget || create.isPending} className={PRIMARY_BUTTON}>
              {create.isPending ? 'Đang giao…' : 'Giao khóa học'}
            </button>
          )}
        </>
      }
    >
      {result ? (
        <div className="grid gap-4" role="status">
          <p className="text-sm font-medium text-slate-900">Đã giao cho {result.created.length} nhân viên.</p>
          {result.skipped.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-medium">{result.skipped.length} người chưa được giao:</p>
              <ul className="mt-2 grid gap-1">
                {result.skipped.map((s) => <li key={s.employeeId}>{s.employeeName}: {SKIP_REASON_LABELS[s.reason]}</li>)}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="assign-course-form">
          <section className="assign-course-step assign-course-step--course">
            <div className="assign-course-step-heading"><span>01</span><div><h3>Chọn khóa học</h3><p>Khóa học đã xuất bản trong danh mục</p></div></div>
            <label htmlFor={`${base}-course`} className="sr-only">Khóa học</label>
            <select id={`${base}-course`} value={courseId} onChange={(e) => setCourseId(e.target.value)} className={INPUT_CLASS}>
              <option value="">Chọn khóa học…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} · {c.title} ({LEVEL_SUFFIX_LABELS[c.level]})</option>
              ))}
            </select>
            {selectedCourse && <div className="assign-course-selected"><BookOpen size={18} /><div><strong>{selectedCourse.title}</strong><span>{selectedCourse.code} · {LEVEL_SUFFIX_LABELS[selectedCourse.level]}</span></div><CircleCheck size={18} /></div>}
          </section>

          <fieldset className="assign-course-step assign-course-step--audience">
            <legend className="sr-only">Giao cho</legend>
            <div className="assign-course-step-heading"><span>02</span><div><h3>Giao cho</h3><p>Chọn nhân viên, phòng ban hoặc vị trí</p></div></div>
            <div className="assign-course-target-choices">
              {TARGET_CHOICES.map(([value, label]) => {
                const Icon = TARGET_ICONS[value];
                return <label key={value} className="assign-course-target-choice">
                  <input type="radio" name={`${base}-kind`} checked={kind === value} onChange={() => setKind(value)} />
                  <Icon size={19} /><span>{label}</span>
                </label>;
              })}
            </div>
          </fieldset>

          <div className="assign-course-target-panel">
          {kind === 'employees' && (
            <div className="grid gap-2">
              <div className="assign-course-panel-heading"><strong>Nhân viên</strong><span>{employeeIds.length} đã chọn</span></div>
              <label htmlFor={`${base}-search`} className="sr-only">Tìm nhân viên</label>
              <input id={`${base}-search`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã" className={INPUT_CLASS} />
              <ul aria-label="Nhân viên" className="assign-course-person-list divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                {visibleEmployees.map((e) => (
                  <li key={e.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50">
                      <input type="checkbox" checked={employeeIds.includes(e.id)} onChange={() => toggle(e.id)} className="size-4 accent-primary-600" />
                      <span className="font-medium text-slate-900">{e.fullName}</span>
                      <span className="text-xs text-slate-500">{e.employeeCode} · {e.positionName ?? 'Chưa có vị trí'} {getEmployeeGrade(e) && `(${getEmployeeGrade(e)})`}</span>
                    </label>
                  </li>
                ))}
                {visibleEmployees.length === 0 && <li className="px-3 py-4 text-sm text-slate-500">Không có nhân viên phù hợp.</li>}
              </ul>
              {employeesLoading && <p className="text-xs text-slate-500">Đang tải danh sách nhân viên…</p>}
            </div>
          )}

          {kind === 'department' && (
            <div className="grid gap-2">
              <div className="assign-course-panel-heading"><strong>Phòng ban</strong><span>{selectedDepartmentIds.length} đã chọn</span></div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium text-slate-700">Chọn một hoặc nhiều phòng ban:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDepartmentIds(departments.map((d) => d.id))}
                    className="text-primary-600 hover:underline font-medium"
                  >
                    Chọn tất cả
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDepartmentIds([])}
                    className="text-slate-500 hover:underline"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              <div className="max-h-52 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                {departments.map((d) => {
                  const empCount = employees.filter((e) => e.departmentId === d.id).length;
                  const isChecked = selectedDepartmentIds.includes(d.id);
                  return (
                    <label key={d.id} className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setSelectedDepartmentIds((prev) =>
                              prev.includes(d.id) ? prev.filter((id) => id !== d.id) : [...prev, d.id]
                            )
                          }
                          className="size-4 accent-primary-600"
                        />
                        <span className="font-medium text-slate-900">{d.name}</span>
                      </div>
                      <span className="text-xs text-slate-500">{empCount} nhân sự</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">
                Đã chọn <strong className="text-slate-800">{selectedDepartmentIds.length}</strong> phòng ban ({selectedDeptEmployees.length} nhân sự sẽ được giao).
              </p>
            </div>
          )}

          {kind === 'position' && (
            <div className="grid gap-1.5">
              <label htmlFor={`${base}-position`} className="text-sm font-medium text-slate-700">Vị trí công việc</label>
              <select id={`${base}-position`} value={jobPositionId} onChange={(e) => setJobPositionId(e.target.value)} className={INPUT_CLASS}>
                <option value="">Chọn vị trí…</option>
                {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {kind === 'grade' && (
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Chọn Cấp bậc (G1–G3)</label>
              <div className="flex gap-2">
                {JOB_GRADES.map((code) => {
                  const name = JOB_GRADE_DEFAULT_NAMES[code];
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setSelectedGrade(code)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        selectedGrade === code
                          ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>{code}</div>
                      <div className="font-normal text-[11px] text-slate-500">{name}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Có <strong className="text-slate-800">{gradeEmployees.length}</strong> nhân sự thuộc cấp bậc {selectedGrade}.
              </p>
            </div>
          )}

          {kind === 'gap' && (
            <div className="grid gap-2">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                <span className="font-semibold block mb-0.5">Tự động phát hiện khoảng trống năng lực:</span>
                Hệ thống tìm thấy {gapCandidateEmployees.length} nhân sự đang thiếu năng lực và được đề xuất học khóa này để lấp khoảng trống.
              </div>

              {gapCandidateEmployees.length > 0 ? (
                <ul aria-label="Nhân viên có khoảng trống" className="max-h-52 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                  {gapCandidateEmployees.map((e) => (
                    <li key={e.id}>
                      <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50">
                        <input type="checkbox" checked={gapEmployees.includes(e.id)} onChange={() => toggleGap(e.id)} className="size-4 accent-primary-600" />
                        <span className="font-medium text-slate-900">{e.fullName}</span>
                        <span className="text-xs text-slate-500">{e.employeeCode} · {e.departmentName ?? '-'} ({getEmployeeGrade(e) ?? 'G1'})</span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 py-2">Hiện không có nhân viên nào có khoảng trống ở năng lực này.</p>
              )}
              <p className="text-xs text-slate-500">Đã chọn {gapEmployees.length} người.</p>
            </div>
          )}
          </div>

          <aside className="assign-course-side-panel">
            <div className="assign-course-step-heading"><span>03</span><div><h3>Hạn hoàn thành</h3><p>Có thể để trống để dùng hạn mặc định</p></div></div>
            <label htmlFor={`${base}-due`} className="sr-only">Hạn hoàn thành</label>
            <input id={`${base}-due`} type="date" min={today} value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-describedby={`${base}-due-hint`} className={INPUT_CLASS} />
            <p id={`${base}-due-hint`} className="text-xs text-slate-500">Hạn mặc định được thiết lập trong Cài đặt tổ chức.</p>
            <div className="assign-course-review"><strong>Thông tin phân công</strong><span><BookOpen size={15} /> {selectedCourse?.title || 'Chưa chọn khóa học'}</span><span><UsersRound size={15} /> {hasTarget ? `${targetCount} nhân viên` : 'Chưa chọn người nhận'}</span><span><CalendarDays size={15} /> {dueDate ? new Date(`${dueDate}T00:00:00`).toLocaleDateString('vi-VN') : 'Hạn mặc định'}</span></div>
          </aside>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
