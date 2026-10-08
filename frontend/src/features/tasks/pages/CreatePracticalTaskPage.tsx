import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeft, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared';
import { useCreatePracticalTask } from '@/hooks/use-tasks';
import { useAllEmployees } from '@/hooks/use-employees';
import { useAllActiveCompetencies } from '@/hooks/use-competencies';
import { apiErrorMessage } from '@/lib/utils';
import { levelWithTier } from '@/lib/competency-levels';

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

export function CreatePracticalTaskPage() {
  const navigate = useNavigate();
  const createMutation = useCreatePracticalTask();

  const { data: employees = [], isLoading: employeesLoading, isError: employeesError } = useAllEmployees({ status: 'ACTIVE' });
  const { data: competencies = [], isLoading: competenciesLoading, isError: competenciesError } = useAllActiveCompetencies();

  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');

  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

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
        { id: 'rc-1', label: 'Tính đầy đủ và chính xác của giải pháp', maxPoints: 40, description: 'Bám sát yêu cầu đề bài và chuẩn hóa' },
        { id: 'rc-2', label: 'Khả năng ứng dụng thực tế vào công việc', maxPoints: 35, description: 'Quy trình khả thi, tài liệu rõ ràng' },
        { id: 'rc-3', label: 'Bảo mật và an toàn dữ liệu số', maxPoints: 25, description: 'Tuân thủ bảo vệ dữ liệu số' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rubricCriteria',
  });

  const selectedDepartmentId = watch('departmentId');
  const selectedEmployeeIds = watch('assignedEmployeeIds') ?? [];
  const rubricCriteria = watch('rubricCriteria');
  const rubricMaxPoints = rubricCriteria.reduce((sum, criterion) => sum + (Number(criterion.maxPoints) || 0), 0);
  const departments = [...new Map(employees.filter((employee) => employee.departmentId)
    .map((employee) => [employee.departmentId, employee.departmentName ?? 'Phòng ban chưa đặt tên'])).entries()];
  const filteredEmployees = employees.filter((employee) =>
    (!selectedDepartmentId || employee.departmentId === selectedDepartmentId)
    && (!employeeSearch || `${employee.fullName} ${employee.employeeCode} ${employee.workEmail ?? ''}`
      .toLocaleLowerCase('vi').includes(employeeSearch.toLocaleLowerCase('vi').trim())),
  );

  const toggleCompetency = (id: string) => {
    setSelectedCompetencies((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const onSubmit = async (values: FormValues) => {
    if (selectedCompetencies.length === 0 || selectedCompetencies.some((id) => !competencies.some((item) => item.id === id))) {
      toast.error('Vui lòng chọn ít nhất một năng lực đang hoạt động từ danh mục');
      return;
    }
    const assignedEmployeeIds = [...new Set(values.assignedEmployeeIds ?? [])];
    if (assignedEmployeeIds.length === 0 || assignedEmployeeIds.some((id) => !employees.some((employee) => employee.id === id))) {
      toast.error('Vui lòng chọn ít nhất một nhân viên đang hoạt động trong danh sách');
      return;
    }
    if (values.rubricCriteria.length === 0 || values.rubricCriteria.some((criterion) => !Number.isFinite(Number(criterion.maxPoints)) || Number(criterion.maxPoints) <= 0) || rubricMaxPoints !== 100) {
      toast.error('Tổng điểm tối đa của các tiêu chí phải bằng 100.');
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
        assignedEmployeeIds,
        rubricCriteria: values.rubricCriteria.map((r, idx) => ({
          ...r,
          id: r.id || `rc-${idx + 1}`,
          maxPoints: Number(r.maxPoints),
        })),
      });

      toast.success('Đã tạo và giao nhiệm vụ thực hành thành công!');
      navigate('/enterprise/tasks');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không thể tạo nhiệm vụ. Vui lòng thử lại.'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <Link
        to="/enterprise/tasks"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="size-4" />
        <span>Quay lại danh sách bài thực hành</span>
      </Link>

      <PageHeader
        title="Giao bài tập thực hành & Dự án năng lực"
        subtitle="Thiết lập nhiệm vụ thực tế gắn với Khung chuẩn năng lực số và tiêu chí chấm điểm minh chứng (Rubric)."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Card 1: Thông tin cơ bản */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>1. Thông tin nhiệm vụ thực hành</span>
          </h2>

          <div className="space-y-1.5">
            <label htmlFor="task-title" className="block text-sm font-semibold text-slate-800">
              Tiêu đề bài thực hành <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title"
              {...register('title', { required: true })}
              placeholder="VD: Xây dựng quy trình sao lưu và phân quyền dữ liệu khách hàng CRM"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-description" className="block text-sm font-semibold text-slate-800">
              Mô tả bối cảnh & Yêu cầu thực hiện <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="task-description"
              rows={4}
              {...register('description', { required: true })}
              placeholder="Mô tả cụ thể tình huống doanh nghiệp, vấn đề cần giải quyết, các bước thực hiện..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-output" className="block text-sm font-semibold text-slate-800">
              Sản phẩm đầu ra yêu cầu (Minh chứng) <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-output"
              {...register('expectedOutput', { required: true })}
              placeholder="VD: Bản tài liệu hướng dẫn SOP (PDF) + Ảnh chụp màn hình cấu hình + Link repo GitHub"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="task-level" className="block text-sm font-semibold text-slate-800">
                Cấp độ năng lực hướng tới
              </label>
              <select
                id="task-level"
                {...register('targetLevel', { valueAsNumber: true })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {[1, 2, 3].map((level) => <option key={level} value={level}>{levelWithTier(level)}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="task-due-date" className="block text-sm font-semibold text-slate-800">
                Hạn hoàn thành <span className="text-rose-500">*</span>
              </label>
              <input
                id="task-due-date"
                type="date"
                {...register('dueDate', { required: true })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Khung năng lực gắn kèm */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">2. Năng lực liên kết</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn năng lực liên quan đến nhiệm vụ. Kết quả chấm bài chưa tự xác nhận cấp độ năng lực.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {competencies.map((c) => {
              const active = selectedCompetencies.includes(c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleCompetency(c.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                    active
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div
                    className={`size-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                      active ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {active && <CheckCircle2 className="size-3.5" />}
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-700">{c.frameworkCode ? `TT02-${c.frameworkCode}` : c.code}</span>
                    <p className="text-xs font-medium mt-0.5">{c.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {competenciesLoading && <p className="text-sm text-slate-500">Đang tải danh mục năng lực…</p>}
          {competenciesError && <p role="alert" className="text-sm text-rose-600">Không tải được danh mục năng lực. Vui lòng thử lại sau.</p>}
          {!competenciesLoading && !competenciesError && competencies.length === 0 && <p className="text-sm text-amber-700">Chưa có năng lực ACTIVE để giao nhiệm vụ.</p>}
        </div>

        {/* Card 3: Phân công nhân viên */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">3. Phân công người thực hiện</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn phòng ban để lọc danh sách hoặc chọn trực tiếp các nhân viên cần hoàn thành nhiệm vụ.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-department" className="block text-sm font-semibold text-slate-800">
              Lọc theo phòng ban
            </label>
            <select
              id="task-department"
              {...register('departmentId')}
              className="w-full sm:w-72 px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="">Tất cả phòng ban</option>
              {departments.map(([departmentId, departmentName]) => (
                <option key={departmentId} value={departmentId}>
                  {departmentName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-sm font-semibold text-slate-800">
              Chọn nhân viên được giao ({filteredEmployees.length} phù hợp · {selectedEmployeeIds.length} đã chọn)
            </label>
            <input
              type="search"
              aria-label="Tìm nhân viên được giao"
              value={employeeSearch}
              onChange={(event) => setEmployeeSearch(event.target.value)}
              placeholder="Tìm tên, mã hoặc email nhân viên"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
              {filteredEmployees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    value={emp.id}
                    {...register('assignedEmployeeIds')}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-slate-900 truncate">{emp.fullName}</p>
                    <p className="text-slate-500 text-[11px] font-mono">{emp.employeeCode}</p>
                  </div>
                </label>
              ))}
            </div>
            {employeesLoading && <p className="text-sm text-slate-500">Đang tải nhân viên…</p>}
            {employeesError && <p role="alert" className="text-sm text-rose-600">Không tải được danh sách nhân viên. Vui lòng thử lại sau.</p>}
            {!employeesLoading && !employeesError && filteredEmployees.length === 0 && <p className="text-sm text-slate-500">Không có nhân viên phù hợp.</p>}
          </div>
        </div>

        {/* Card 4: Tiêu chí chấm điểm (Rubric) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">4. Bảng tiêu chí chấm điểm (Rubric)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập các tiêu chí để người duyệt đánh giá minh chứng của nhân viên.
              </p>
              <p className={`text-xs mt-1 ${rubricMaxPoints === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                Tổng điểm tối đa: {rubricMaxPoints}/100
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                append({
                  id: `rc-${fields.length + 1}`,
                  label: '',
                  maxPoints: 20,
                  description: '',
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <Plus className="size-3.5" />
              <span>Thêm tiêu chí</span>
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 relative group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <input
                      {...register(`rubricCriteria.${index}.label` as const, { required: true })}
                      placeholder={`Tiêu chí ${index + 1}: VD. Tính ứng dụng thực tế`}
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500 font-medium">Điểm tối đa:</span>
                    <input
                      type="number"
                      {...register(`rubricCriteria.${index}.maxPoints` as const, {
                        valueAsNumber: true,
                        required: true,
                        min: 1,
                        max: 100,
                      })}
                      className="w-16 px-2 py-1.5 text-sm text-center border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-bold"
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  {...register(`rubricCriteria.${index}.description` as const)}
                  placeholder="Mô tả hướng dẫn cho người duyệt khi chấm tiêu chí này..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/enterprise/tasks"
            className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || createMutation.isPending || competenciesLoading || employeesLoading || competenciesError || employeesError}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <Save className="size-4" />
            <span>{isSubmitting ? 'Đang tạo nhiệm vụ…' : 'Giao nhiệm vụ thực hành'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
