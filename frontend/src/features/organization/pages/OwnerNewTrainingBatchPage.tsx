import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateTrainingBatch } from '@/hooks/use-training-batches';
import { useCourses } from '@/hooks/use-assignments';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { useMembers } from '@/hooks/use-members';
import { JOB_GRADES } from '@/lib/roles';
import { JOB_GRADE_DEFAULT_NAMES } from '@/lib/terms';
import { PULSE_TOKENS } from '../owner-theme';

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { num: 1, label: 'Thông tin' },
  { num: 2, label: 'Khóa học' },
  { num: 3, label: 'Đối tượng' },
  { num: 4, label: 'Xác nhận' },
] as const;

const inputStyle: React.CSSProperties = {
  borderColor: 'var(--po-line)',
  color: 'var(--po-ink)',
  background: 'var(--po-canvas)',
};

export function OwnerNewTrainingBatchPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preselectedCourseId = params.get('courseId');

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [code, setCode] = useState(
    `DOT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90) + 10)}`,
  );
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
  );
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(
    preselectedCourseId ? [preselectedCourseId] : [],
  );
  const [courseSearch, setCourseSearch] = useState('');
  const [targetType, setTargetType] = useState<'criteria' | 'manual'>(
    'criteria',
  );
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const createMutation = useCreateTrainingBatch();
  const { data: coursesPaged } = useCourses({
    status: 'PUBLISHED',
    pageSize: 100,
  });
  const { data: departmentsData } = useDepartments({ pageSize: 100 });
  const { data: positionsData } = useJobPositions({ pageSize: 100 });
  const { data: membersData } = useMembers({
    pageSize: 100,
    status: 'ACTIVE',
  });

  const allCourses = coursesPaged?.items ?? [];
  const departments = departmentsData?.items ?? [];
  const allPositions = positionsData?.items ?? [];
  const allEmployees = membersData?.items ?? [];

  const filteredCourses = useMemo(
    () =>
      allCourses.filter(
        (c) =>
          c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
          c.code.toLowerCase().includes(courseSearch.toLowerCase()),
      ),
    [allCourses, courseSearch],
  );

  const resolvedEmployees = useMemo(() => {
    if (targetType === 'manual')
      return allEmployees.filter((e) => selectedEmployees.includes(e.id));
    return allEmployees.filter((e) => {
      if (
        selectedDepartments.length > 0 &&
        (!e.departmentId || !selectedDepartments.includes(e.departmentId))
      )
        return false;
      if (
        selectedPositions.length > 0 &&
        (!e.jobPositionId || !selectedPositions.includes(e.jobPositionId))
      )
        return false;
      if (
        selectedGrades.length > 0 &&
        (!e.jobGrade || !selectedGrades.includes(e.jobGrade))
      )
        return false;
      return true;
    });
  }, [
    allEmployees,
    targetType,
    selectedDepartments,
    selectedPositions,
    selectedGrades,
    selectedEmployees,
  ]);

  const canProceed = () => {
    if (step === 1)
      return name.trim().length > 0 && startDate && endDate && startDate <= endDate;
    if (step === 2) return selectedCourseIds.length > 0;
    if (step === 3) return resolvedEmployees.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    try {
      const result = await createMutation.mutateAsync({
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate,
        courseIds: selectedCourseIds,
        targetCriteria:
          targetType === 'criteria'
            ? {
                departmentIds: selectedDepartments.length
                  ? selectedDepartments
                  : undefined,
                jobPositionIds: selectedPositions.length
                  ? selectedPositions
                  : undefined,
                jobGrades: selectedGrades.length
                  ? selectedGrades
                  : undefined,
              }
            : undefined,
        participantEmployeeIds: resolvedEmployees.map((e) => e.id),
      });
      toast.success('Đã tạo đợt đào tạo.');
      navigate(`/enterprise/training-batches/${result.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra.');
    }
  };

  const toggle = <T,>(arr: T[], v: T) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <div
      className="po-owner -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, var(--po-glow) 0%, transparent 65%)',
      }}
    >
      <div
        className="px-4 md:px-6 pt-6 pb-8 mx-auto"
        style={{ maxWidth: 900 }}
      >
        <Link
          to="/enterprise/training-batches"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold mb-4 transition-opacity hover:opacity-70"
          style={{ color: 'var(--po-muted)' }}
        >
          <ArrowLeft className="size-3" /> Đợt đào tạo
        </Link>

        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--po-ink)', letterSpacing: '-0.04em' }}
        >
          Tạo đợt đào tạo mới
        </h1>
        <p
          className="mt-1 text-xs"
          style={{ color: 'var(--po-muted)' }}
        >
          Thiết lập chương trình bồi dưỡng năng lực: chọn khóa học, nhóm đối
          tượng và lên lịch thực hiện.
        </p>

        {/* ── Stepper ── */}
        <div
          className="mt-5 flex items-center rounded-[13px] border p-3"
          style={{
            borderColor: 'var(--po-line)',
            background: 'var(--po-surface)',
          }}
        >
          {STEPS.map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  className="grid size-7 place-items-center rounded-full text-xs font-bold"
                  style={
                    step === s.num
                      ? { background: 'var(--po-accent)', color: '#fff' }
                      : step > s.num
                        ? { background: '#16a34a', color: '#fff' }
                        : { background: 'var(--po-line)', color: 'var(--po-muted)' }
                  }
                >
                  {step > s.num ? <Check className="size-3.5" /> : s.num}
                </span>
                <span
                  className="hidden sm:inline text-[11px] font-bold"
                  style={{
                    color:
                      step === s.num
                        ? 'var(--po-accent)'
                        : step > s.num
                          ? 'var(--po-ink)'
                          : 'var(--po-muted)',
                  }}
                >
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className="flex-1 mx-3 h-0.5 rounded"
                  style={{ background: 'var(--po-line)' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Step content ── */}
        <section
          className="mt-4 rounded-[22px] border p-6"
          style={{
            borderColor: 'var(--po-line)',
            background: 'var(--po-surface)',
            boxShadow: '0 10px 35px rgba(29,48,102,.025)',
          }}
        >
          {step === 1 && (
            <div className="space-y-4">
              <p
                className="text-[10px] font-black uppercase tracking-[0.12em]"
                style={{ color: 'var(--po-muted)' }}
              >
                Bước 1 · Thông tin chung
              </p>
              <div className="grid sm:grid-cols-[2fr_1fr] gap-3">
                <label className="block space-y-1">
                  <span className="text-[11px] font-bold" style={{ color: 'var(--po-ink)' }}>
                    Tên đợt đào tạo *
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Đợt 1/2026 — Năng lực số Khối Nghiệp vụ"
                    className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                    style={inputStyle}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-bold" style={{ color: 'var(--po-ink)' }}>
                    Mã đợt
                  </span>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-xs font-mono outline-none"
                    style={inputStyle}
                  />
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-[11px] font-bold" style={{ color: 'var(--po-ink)' }}>
                    Ngày bắt đầu *
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                    style={inputStyle}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-bold" style={{ color: 'var(--po-ink)' }}>
                    Hạn hoàn thành *
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                    style={inputStyle}
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-[11px] font-bold" style={{ color: 'var(--po-ink)' }}>
                  Mô tả & mục tiêu
                </span>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nêu rõ mục tiêu cần đạt và các mốc đánh giá…"
                  className="w-full rounded-lg border px-3 py-2 text-xs outline-none resize-none"
                  style={inputStyle}
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.12em]"
                  style={{ color: 'var(--po-muted)' }}
                >
                  Bước 2 · Chọn khóa học
                </p>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: 'var(--po-accent)' }}
                >
                  {selectedCourseIds.length} đã chọn
                </span>
              </div>
              <input
                type="search"
                placeholder="Tìm khóa học…"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                style={inputStyle}
              />
              <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredCourses.map((c) => {
                  const selected = selectedCourseIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCourseIds(selected ? [] : [c.id])}
                      className="flex items-start gap-3 rounded-[11px] border p-3 text-left transition-all"
                      style={{
                        borderColor: selected
                          ? 'var(--po-accent)'
                          : 'var(--po-line)',
                        background: selected
                          ? 'var(--po-soft)'
                          : 'var(--po-surface)',
                      }}
                    >
                      <span
                        className="grid size-5 shrink-0 place-items-center rounded-full mt-0.5"
                        style={{
                          background: selected
                            ? 'var(--po-accent)'
                            : 'var(--po-line)',
                          color: selected ? '#fff' : 'var(--po-muted)',
                        }}
                      >
                        {selected && <Check className="size-3" />}
                      </span>
                      <div className="min-w-0">
                        <span
                          className="text-[10px] font-mono font-bold rounded px-1 py-0.5"
                          style={{
                            background: 'var(--po-soft)',
                            color: 'var(--po-accent)',
                          }}
                        >
                          {c.code}
                        </span>
                        <strong
                          className="block text-xs mt-1 truncate"
                          style={{ color: 'var(--po-ink)' }}
                        >
                          {c.title}
                        </strong>
                        <small style={{ color: 'var(--po-muted)' }} className="text-[10px]">
                          {c.categoryName || 'Năng lực số'}
                        </small>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.12em]"
                  style={{ color: 'var(--po-muted)' }}
                >
                  Bước 3 · Đối tượng học viên
                </p>
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{
                    background: 'var(--po-soft)',
                    color: 'var(--po-accent)',
                  }}
                >
                  {resolvedEmployees.length} học viên
                </span>
              </div>

              <div className="flex gap-2">
                {(['criteria', 'manual'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTargetType(t)}
                    className="rounded-lg px-3 py-2 text-[11px] font-bold transition-colors"
                    style={
                      targetType === t
                        ? {
                            background: 'var(--po-accent)',
                            color: '#fff',
                          }
                        : {
                            background: 'var(--po-line)',
                            color: 'var(--po-muted)',
                          }
                    }
                  >
                    {t === 'criteria'
                      ? 'Theo điều kiện'
                      : 'Chọn đích danh'}
                  </button>
                ))}
              </div>

              {targetType === 'criteria' ? (
                <div className="space-y-4">
                  <div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider block mb-2"
                      style={{ color: 'var(--po-muted)' }}
                    >
                      Cấp bậc
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {JOB_GRADES.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() =>
                            setSelectedGrades(toggle(selectedGrades, g))
                          }
                          className="rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all"
                          style={
                            selectedGrades.includes(g)
                              ? {
                                  borderColor: 'var(--po-accent)',
                                  background: 'var(--po-soft)',
                                  color: 'var(--po-accent)',
                                }
                              : {
                                  borderColor: 'var(--po-line)',
                                  color: 'var(--po-muted)',
                                }
                          }
                        >
                          {g} · {JOB_GRADE_DEFAULT_NAMES[g]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider block mb-2"
                      style={{ color: 'var(--po-muted)' }}
                    >
                      Phòng ban
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {departments.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() =>
                            setSelectedDepartments(
                              toggle(selectedDepartments, d.id),
                            )
                          }
                          className="rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all"
                          style={
                            selectedDepartments.includes(d.id)
                              ? {
                                  borderColor: 'var(--po-accent)',
                                  background: 'var(--po-soft)',
                                  color: 'var(--po-accent)',
                                }
                              : {
                                  borderColor: 'var(--po-line)',
                                  color: 'var(--po-muted)',
                                }
                          }
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider block mb-2"
                      style={{ color: 'var(--po-muted)' }}
                    >
                      Vị trí
                    </span>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {allPositions.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setSelectedPositions(
                              toggle(selectedPositions, p.id),
                            )
                          }
                          className="rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all"
                          style={
                            selectedPositions.includes(p.id)
                              ? {
                                  borderColor: 'var(--po-accent)',
                                  background: 'var(--po-soft)',
                                  color: 'var(--po-accent)',
                                }
                              : {
                                  borderColor: 'var(--po-line)',
                                  color: 'var(--po-muted)',
                                }
                          }
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="max-h-72 overflow-y-auto space-y-1 rounded-[11px] border p-2"
                  style={{ borderColor: 'var(--po-line)' }}
                >
                  {allEmployees.map((emp) => {
                    const checked = selectedEmployees.includes(emp.id);
                    return (
                      <label
                        key={emp.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-[11px] cursor-pointer hover:bg-[var(--po-soft)]"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedEmployees(
                              toggle(selectedEmployees, emp.id),
                            )
                          }
                          className="size-4 rounded"
                        />
                        <span
                          className="flex-1 font-medium"
                          style={{ color: 'var(--po-ink)' }}
                        >
                          {emp.fullName}
                        </span>
                        <span style={{ color: 'var(--po-muted)' }}>
                          {emp.departmentName || '–'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p
                className="text-[10px] font-black uppercase tracking-[0.12em]"
                style={{ color: 'var(--po-muted)' }}
              >
                Bước 4 · Xác nhận
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div
                  className="rounded-[13px] border p-4 space-y-2 text-[11px]"
                  style={{
                    borderColor: 'var(--po-line)',
                    background: 'linear-gradient(145deg, var(--po-surface), var(--po-raised))',
                  }}
                >
                  <span
                    className="text-[10px] font-bold uppercase"
                    style={{ color: 'var(--po-muted)' }}
                  >
                    Thông tin đợt
                  </span>
                  <strong
                    className="block text-sm"
                    style={{ color: 'var(--po-ink)' }}
                  >
                    {name}
                  </strong>
                  <span style={{ color: 'var(--po-muted)' }}>
                    Mã: <strong className="font-mono">{code}</strong>
                  </span>
                  <br />
                  <span style={{ color: 'var(--po-muted)' }}>
                    {startDate} → {endDate}
                  </span>
                </div>
                <div
                  className="rounded-[13px] border p-4 space-y-2 text-[11px]"
                  style={{
                    borderColor: 'var(--po-line)',
                    background: 'linear-gradient(145deg, var(--po-surface), var(--po-raised))',
                  }}
                >
                  <span
                    className="text-[10px] font-bold uppercase"
                    style={{ color: 'var(--po-muted)' }}
                  >
                    Quy mô
                  </span>
                  <div
                    className="flex justify-between py-1 border-b"
                    style={{ borderColor: 'var(--po-line)' }}
                  >
                    <span style={{ color: 'var(--po-muted)' }}>Khóa học:</span>
                    <strong style={{ color: 'var(--po-ink)' }}>
                      {selectedCourseIds.length}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span style={{ color: 'var(--po-muted)' }}>Học viên:</span>
                    <strong style={{ color: 'var(--po-accent)' }}>
                      {resolvedEmployees.length}
                    </strong>
                  </div>
                </div>
              </div>
              <div
                className="rounded-[11px] border p-4 text-xs"
                style={{
                  borderColor: '#fdddb6',
                  background: '#fff7ed',
                  color: '#c2410c',
                }}
              >
                Đợt được tạo ở trạng thái bản nháp. Mở chi tiết đợt để bắt đầu;
                học viên cần được giao khóa học riêng ở mục Giao khóa học.
              </div>
            </div>
          )}
        </section>

        {/* ── Footer nav ── */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
            className="inline-flex items-center gap-1.5 rounded-[11px] border px-4 py-2.5 text-xs font-bold disabled:opacity-40 transition-transform hover:-translate-y-0.5"
            style={{
              borderColor: 'var(--po-line)',
              color: 'var(--po-ink)',
            }}
          >
            <ArrowLeft className="size-3.5" /> Quay lại
          </button>
          {step === 4 ? (
            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 rounded-[11px] px-5 py-2.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: 'var(--po-accent)', color: '#fff' }}
            >
              <Plus className="size-3.5" />
              {createMutation.isPending ? 'Đang tạo…' : 'Tạo bản nháp'}
            </button>
          ) : (
            <button
              type="button"
              disabled={!canProceed()}
              onClick={() => setStep((s) => Math.min(4, s + 1) as Step)}
              className="inline-flex items-center gap-1.5 rounded-[11px] px-5 py-2.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5 disabled:opacity-40"
              style={{ background: 'var(--po-accent)', color: '#fff' }}
            >
              Tiếp tục <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
