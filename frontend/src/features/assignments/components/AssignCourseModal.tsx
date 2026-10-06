import { useId, useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/shared';
import { useCreateAssignments, useCourses } from '@/hooks/use-assignments';
import { useDepartments } from '@/hooks/use-departments';
import { useEmployees } from '@/hooks/use-employees';
import { useJobPositions } from '@/hooks/use-job-positions';
import { useSkillGapRuns } from '@/hooks/use-skill-gaps';
import { apiErrorMessage } from '@/lib/utils';
import { JOB_GRADES } from '@/lib/roles';
import { JOB_GRADE_DEFAULT_NAMES } from '@/lib/terms';
import type { CreateAssignmentResult } from '@/services/assignment.service';
import { INPUT_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import { LEVEL_SUFFIX_LABELS, SKIP_REASON_LABELS } from '../assignment-labels';

type TargetKind = 'employees' | 'department' | 'position' | 'grade' | 'gap';

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
  const courses = (useCourses({ status: 'PUBLISHED', pageSize: 100 }).data?.items ?? []);
  const departments = useDepartments({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const positions = useJobPositions({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const employees = useEmployees({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const { data: skillGapsData } = useSkillGapRuns({ pageSize: 100 });

  const [courseId, setCourseId] = useState(initialCourse ?? '');
  const [kind, setKind] = useState<TargetKind>('employees');
  const [employeeIds, setEmployeeIds] = useState<string[]>(initialEmployees ?? []);
  const [departmentId, setDepartmentId] = useState('');
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

  const getEmployeeGrade = (e: { jobPositionId?: string; positionId?: string }) => {
    const posId = e.jobPositionId || e.positionId;
    return posId ? posGradeMap.get(posId) : undefined;
  };

  const visibleEmployees = useMemo(
    () => employees.filter((e) => !search || e.fullName.toLowerCase().includes(search.toLowerCase()) || e.employeeCode.toLowerCase().includes(search.toLowerCase())),
    [employees, search],
  );

  const gradeEmployees = useMemo(
    () => employees.filter((e) => getEmployeeGrade(e) === selectedGrade),
    [employees, selectedGrade, posGradeMap]
  );

  const targets = useMemo(() => {
    if (kind === 'employees') return { employeeIds };
    if (kind === 'department') return { departmentId };
    if (kind === 'position') return { jobPositionId };
    if (kind === 'grade') return { employeeIds: gradeEmployees.map((e) => e.id), jobGrade: selectedGrade };
    if (kind === 'gap') return { employeeIds: gapEmployees };
    return { employeeIds };
  }, [kind, employeeIds, departmentId, jobPositionId, selectedGrade, gradeEmployees, gapEmployees]);

  const hasTarget = useMemo(() => {
    if (kind === 'employees') return employeeIds.length > 0;
    if (kind === 'department') return Boolean(departmentId);
    if (kind === 'position') return Boolean(jobPositionId);
    if (kind === 'grade') return gradeEmployees.length > 0;
    if (kind === 'gap') return gapEmployees.length > 0;
    return false;
  }, [kind, employeeIds, departmentId, jobPositionId, gradeEmployees, gapEmployees]);

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
      size="lg"
      title="Giao khóa học"
      description="Giao khóa học chuẩn theo nhân viên, phòng ban, vị trí, cấp bậc (G1–G3) hoặc tự động từ khoảng trống năng lực."
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
        <div className="grid gap-5">
          <div className="grid gap-1.5">
            <label htmlFor={`${base}-course`} className="text-sm font-medium text-slate-700">Khóa học</label>
            <select id={`${base}-course`} value={courseId} onChange={(e) => setCourseId(e.target.value)} className={INPUT_CLASS}>
              <option value="">Chọn khóa học…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} · {c.title} ({LEVEL_SUFFIX_LABELS[c.level]})</option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">Giao cho</legend>
            <div className="flex flex-wrap gap-4 text-sm">
              {([
                ['employees', 'Từng nhân viên'],
                ['department', 'Cả phòng ban'],
                ['position', 'Mọi người ở một vị trí'],
                ['grade', 'Theo Cấp bậc (G1–G3)'],
                ['gap', 'Từ khoảng trống năng lực (Skill Gap)'],
              ] as const).map(([value, label]) => (
                <label key={value} className="inline-flex items-center gap-2">
                  <input type="radio" name={`${base}-kind`} checked={kind === value} onChange={() => setKind(value)} className="size-4 accent-primary-600" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {kind === 'employees' && (
            <div className="grid gap-2">
              <label htmlFor={`${base}-search`} className="sr-only">Tìm nhân viên</label>
              <input id={`${base}-search`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã" className={INPUT_CLASS} />
              <ul aria-label="Nhân viên" className="max-h-52 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
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
              <p className="text-xs text-slate-500">Đã chọn {employeeIds.length} người.</p>
            </div>
          )}

          {kind === 'department' && (
            <div className="grid gap-1.5">
              <label htmlFor={`${base}-department`} className="text-sm font-medium text-slate-700">Phòng ban</label>
              <select id={`${base}-department`} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={INPUT_CLASS}>
                <option value="">Chọn phòng ban…</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
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

          <div className="grid gap-1.5">
            <label htmlFor={`${base}-due`} className="text-sm font-medium text-slate-700">Hạn hoàn thành</label>
            <input id={`${base}-due`} type="date" min={today} value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-describedby={`${base}-due-hint`} className={INPUT_CLASS} />
            <p id={`${base}-due-hint`} className="text-xs text-slate-500">Để trống để dùng thời hạn mặc định trong Cài đặt tổ chức.</p>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
