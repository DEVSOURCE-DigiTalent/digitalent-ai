import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCreatePracticalTask } from '@/hooks/use-tasks';
import { useAllEmployees } from '@/hooks/use-employees';
import { useAllActiveCompetencies } from '@/hooks/use-competencies';
import { apiErrorMessage } from '@/lib/utils';
import { PULSE_TOKENS } from '../owner-theme';

const inputStyle: React.CSSProperties = {
  borderColor: 'var(--po-line)',
  color: 'var(--po-ink)',
  background: 'var(--po-canvas)',
};

interface FormValues {
  title: string;
  description: string;
  expectedOutput: string;
  targetLevel: number;
  departmentId: string;
  dueDate: string;
  assignedEmployeeIds: string[];
  rubricCriteria: {
    id: string;
    label: string;
    maxPoints: number;
    description: string;
  }[];
}

export function OwnerNewTaskPage() {
  const navigate = useNavigate();
  const createMutation = useCreatePracticalTask();

  const { data: employees = [], isLoading: employeesLoading } = useAllEmployees({ status: 'ACTIVE' });
  const { data: competencies = [], isLoading: competenciesLoading } = useAllActiveCompetencies();

  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');

  const defaultDueDate = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      expectedOutput: '',
      targetLevel: 2,
      departmentId: '',
      dueDate: defaultDueDate,
      assignedEmployeeIds: [],
      rubricCriteria: [
        { id: 'rc-1', label: 'Tính đầy đủ và chính xác của giải pháp', maxPoints: 40, description: 'Bám sát yêu cầu đề bài' },
        { id: 'rc-2', label: 'Khả năng ứng dụng thực tế', maxPoints: 35, description: 'Quy trình khả thi, tài liệu rõ ràng' },
        { id: 'rc-3', label: 'Bảo mật và an toàn dữ liệu', maxPoints: 25, description: 'Tuân thủ bảo vệ dữ liệu số' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'rubricCriteria' });

  const selectedDepartmentId = watch('departmentId');
  const selectedEmployeeIds = watch('assignedEmployeeIds') ?? [];
  const rubricCriteria = watch('rubricCriteria');
  const rubricMaxPoints = rubricCriteria.reduce((s, r) => s + (Number(r.maxPoints) || 0), 0);

  const departments = [
    ...new Map(
      employees
        .filter((e) => e.departmentId)
        .map((e) => [e.departmentId, e.departmentName ?? 'Phòng ban']),
    ).entries(),
  ];

  const filteredEmployees = employees.filter(
    (e) =>
      (!selectedDepartmentId || e.departmentId === selectedDepartmentId) &&
      (!employeeSearch ||
        `${e.fullName} ${e.employeeCode} ${e.workEmail ?? ''}`
          .toLowerCase()
          .includes(employeeSearch.toLowerCase().trim())),
  );

  const toggleCompetency = (id: string) =>
    setSelectedCompetencies((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );

  const onSubmit = async (values: FormValues) => {
    if (selectedCompetencies.length === 0) {
      toast.error('Chọn ít nhất một năng lực.');
      return;
    }
    const ids = [...new Set(values.assignedEmployeeIds ?? [])];
    if (ids.length === 0) {
      toast.error('Chọn ít nhất một nhân viên.');
      return;
    }
    if (rubricMaxPoints !== 100) {
      toast.error('Tổng điểm tối đa phải bằng 100.');
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: values.title,
        description: values.description,
        expectedOutput: values.expectedOutput,
        targetLevel: Number(values.targetLevel),
        dueDate: values.dueDate,
        competencyIds: selectedCompetencies,
        assignedEmployeeIds: ids,
        rubricCriteria: values.rubricCriteria.map((r, i) => ({
          ...r,
          id: r.id || `rc-${i + 1}`,
          maxPoints: Number(r.maxPoints),
        })),
      });
      toast.success('Đã giao nhiệm vụ thực hành.');
      navigate('/enterprise/tasks');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không thể tạo nhiệm vụ.'));
    }
  };

  return (
    <div
      className="po-owner -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage: 'radial-gradient(ellipse 80% 55% at 50% 0%, var(--po-glow) 0%, transparent 65%)',
      }}
    >
      <div className="px-4 md:px-6 pt-6 pb-8 mx-auto" style={{ maxWidth: 900 }}>
        <Link
          to="/enterprise/tasks"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold mb-4 transition-opacity hover:opacity-70"
          style={{ color: 'var(--po-muted)' }}
        >
          <ArrowLeft className="size-3" /> Nhiệm vụ thực tế
        </Link>

        <h1 className="text-2xl font-bold" style={{ color: 'var(--po-ink)', letterSpacing: '-0.04em' }}>
          Giao bài tập thực hành
        </h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--po-muted)' }}>
          Thiết lập nhiệm vụ gắn năng lực, tiêu chí chấm và phân công nhân viên.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          {/* Card 1: Info */}
          <section
            className="rounded-[22px] border p-6 space-y-4"
            style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)', boxShadow: '0 10px 35px rgba(29,48,102,.025)' }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-muted)' }}>
              1 · Thông tin nhiệm vụ
            </p>
            <label className="block space-y-1">
              <span className="text-[11px] font-bold" style={{ color: 'var(--po-ink)' }}>Tiêu đề *</span>
              <input
                {...register('title', { required: true })}
                placeholder="VD: Xây dựng quy trình bảo vệ dữ liệu CRM"
                className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                style={inputStyle}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-bold" style={{ color: 'var(--po-ink)' }}>Bối cảnh & yêu cầu *</span>
              <textarea
                rows={3}
                {...register('description', { required: true })}
                placeholder="Mô tả tình huống, vấn đề cần giải quyết…"
                className="w-full rounded-lg border px-3 py-2 text-xs outline-none resize-none"
                style={inputStyle}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-bold" style={{ color: 'var(--po-ink)' }}>Sản phẩm đầu ra (minh chứng) *</span>
              <input
                {...register('expectedOutput', { required: true })}
                placeholder="VD: Tài liệu SOP + ảnh chụp màn hình + link repo"
                className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                style={inputStyle}
              />
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-[11px] font-bold" style={{ color: 'var(--po-ink)' }}>Cấp độ</span>
                <select
                  {...register('targetLevel', { valueAsNumber: true })}
                  className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                  style={inputStyle}
                >
                  <option value={1}>01 Cơ bản</option>
                  <option value={2}>02 Trung cấp</option>
                  <option value={3}>03 Nâng cao</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-bold" style={{ color: 'var(--po-ink)' }}>Hạn hoàn thành *</span>
                <input
                  type="date"
                  {...register('dueDate', { required: true })}
                  className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                  style={inputStyle}
                />
              </label>
            </div>
          </section>

          {/* Card 2: Competencies */}
          <section
            className="rounded-[22px] border p-6 space-y-4"
            style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)', boxShadow: '0 10px 35px rgba(29,48,102,.025)' }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-muted)' }}>
                2 · Năng lực liên kết
              </p>
              <span className="text-[11px] font-bold" style={{ color: 'var(--po-accent)' }}>
                {selectedCompetencies.length} đã chọn
              </span>
            </div>
            {competenciesLoading ? (
              <p className="text-xs" style={{ color: 'var(--po-muted)' }}>Đang tải năng lực…</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {competencies.map((c) => {
                  const active = selectedCompetencies.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCompetency(c.id)}
                      className="flex items-start gap-3 rounded-[11px] border p-3 text-left transition-all"
                      style={{
                        borderColor: active ? 'var(--po-accent)' : 'var(--po-line)',
                        background: active ? 'var(--po-soft)' : 'var(--po-surface)',
                      }}
                    >
                      <span
                        className="grid size-5 shrink-0 place-items-center rounded-full mt-0.5"
                        style={{
                          background: active ? 'var(--po-accent)' : 'var(--po-line)',
                          color: active ? '#fff' : 'var(--po-muted)',
                        }}
                      >
                        {active && <Check className="size-3" />}
                      </span>
                      <div className="min-w-0">
                        <span
                          className="text-[10px] font-mono font-bold rounded px-1 py-0.5"
                          style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
                        >
                          {c.frameworkCode ? `TT02-${c.frameworkCode}` : c.code}
                        </span>
                        <p className="text-xs mt-1 truncate" style={{ color: 'var(--po-ink)' }}>
                          {c.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Card 3: Employees */}
          <section
            className="rounded-[22px] border p-6 space-y-4"
            style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)', boxShadow: '0 10px 35px rgba(29,48,102,.025)' }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-muted)' }}>
                3 · Phân công người thực hiện
              </p>
              <span className="text-[11px] font-bold" style={{ color: 'var(--po-accent)' }}>
                {selectedEmployeeIds.length} đã chọn
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                {...register('departmentId')}
                className="rounded-lg border px-3 py-2 text-xs outline-none sm:w-52"
                style={inputStyle}
              >
                <option value="">Tất cả phòng ban</option>
                {departments.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              <input
                type="search"
                placeholder="Tìm nhân viên…"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="flex-1 rounded-lg border px-3 py-2 text-xs outline-none"
                style={inputStyle}
              />
            </div>

            {employeesLoading ? (
              <p className="text-xs" style={{ color: 'var(--po-muted)' }}>Đang tải…</p>
            ) : (
              <div
                className="max-h-56 overflow-y-auto space-y-1 rounded-[11px] border p-2"
                style={{ borderColor: 'var(--po-line)' }}
              >
                {filteredEmployees.map((emp) => (
                  <label
                    key={emp.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-[11px] cursor-pointer hover:bg-[var(--po-soft)]"
                  >
                    <input
                      type="checkbox"
                      value={emp.id}
                      {...register('assignedEmployeeIds')}
                      className="size-4 rounded"
                    />
                    <span className="flex-1 font-medium" style={{ color: 'var(--po-ink)' }}>
                      {emp.fullName}
                    </span>
                    <span className="font-mono" style={{ color: 'var(--po-muted)' }}>
                      {emp.employeeCode}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Card 4: Rubric */}
          <section
            className="rounded-[22px] border p-6 space-y-4"
            style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)', boxShadow: '0 10px 35px rgba(29,48,102,.025)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-muted)' }}>
                  4 · Tiêu chí chấm điểm (Rubric)
                </p>
                <p
                  className="text-[10px] mt-1"
                  style={{ color: rubricMaxPoints === 100 ? '#16a34a' : '#d97706' }}
                >
                  Tổng: {rubricMaxPoints}/100
                </p>
              </div>
              <button
                type="button"
                onClick={() => append({ id: `rc-${fields.length + 1}`, label: '', maxPoints: 20, description: '' })}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold"
                style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
              >
                <Plus className="size-3" /> Thêm
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="rounded-[11px] border p-3 space-y-2"
                  style={{ borderColor: 'var(--po-line)', background: 'var(--po-canvas)' }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      {...register(`rubricCriteria.${idx}.label`, { required: true })}
                      placeholder={`Tiêu chí ${idx + 1}`}
                      className="flex-1 rounded-lg border px-3 py-1.5 text-xs outline-none"
                      style={inputStyle}
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px]" style={{ color: 'var(--po-muted)' }}>Max:</span>
                      <input
                        type="number"
                        {...register(`rubricCriteria.${idx}.maxPoints`, { valueAsNumber: true, min: 1, max: 100 })}
                        className="w-14 rounded-lg border px-2 py-1.5 text-xs text-center font-bold outline-none"
                        style={inputStyle}
                      />
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="p-1 rounded transition-colors hover:bg-[#fee2e2]"
                          style={{ color: 'var(--po-muted)' }}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    {...register(`rubricCriteria.${idx}.description`)}
                    placeholder="Hướng dẫn cho người duyệt…"
                    className="w-full rounded-lg border px-3 py-1.5 text-[10px] outline-none"
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to="/enterprise/tasks"
              className="rounded-[11px] border px-4 py-2.5 text-xs font-bold transition-transform hover:-translate-y-0.5"
              style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-[11px] px-5 py-2.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: 'var(--po-accent)', color: '#fff' }}
            >
              <Plus className="size-3.5" />
              {isSubmitting ? 'Đang tạo…' : 'Giao nhiệm vụ thực hành'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
