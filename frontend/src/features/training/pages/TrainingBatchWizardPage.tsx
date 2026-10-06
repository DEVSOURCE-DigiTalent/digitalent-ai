import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check,
  CheckCircle2, Search
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateTrainingBatch } from '@/hooks/use-training-batches';
import { useCourses } from '@/hooks/use-assignments';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import { useMembers } from '@/hooks/use-members';
import { PageHeader } from '@/components/shared/PageHeader';
import { JOB_GRADES } from '@/lib/roles';
import { JOB_GRADE_DEFAULT_NAMES } from '@/lib/terms';
import { LevelBadge } from '@/components/shared/LevelBadge';

type WizardStep = 1 | 2 | 3 | 4;

/**
 * OW-26: Create Training Batch (/enterprise/training-batches/new)
 * Wizard tạo đợt đào tạo tập trung:
 * Name, dates, target selector (Department/Position/Grade/Employees), courses, deadline.
 */
export function TrainingBatchWizardPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preselectedCourseId = params.get('courseId');

  const [step, setStep] = useState<WizardStep>(1);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState(`DOT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90) + 10)}`);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  // Course selection
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(
    preselectedCourseId ? [preselectedCourseId] : []
  );
  const [courseSearch, setCourseSearch] = useState('');

  // Target selection
  const [targetType, setTargetType] = useState<'criteria' | 'manual'>('criteria');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Hooks
  const createMutation = useCreateTrainingBatch();
  const { data: coursesPaged } = useCourses({ status: 'PUBLISHED', pageSize: 100 });
  const { data: departmentsData } = useDepartments({ pageSize: 100 });
  const { data: positionsData } = useJobPositions({ pageSize: 100 });
  const { data: membersData } = useMembers({ pageSize: 200, status: 'ACTIVE' });

  const allCourses = coursesPaged?.items || [];
  const departments = departmentsData?.items || [];
  const allPositions = positionsData?.items || [];
  const allEmployees = membersData?.items || [];

  // Filtered courses for selection
  const filteredCourses = useMemo(() => {
    return allCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.code.toLowerCase().includes(courseSearch.toLowerCase())
    );
  }, [allCourses, courseSearch]);

  // Dynamically resolve target employees based on criteria
  const resolvedEmployees = useMemo(() => {
    if (targetType === 'manual') {
      return allEmployees.filter((e) => selectedEmployees.includes(e.id));
    }
    return allEmployees.filter((e) => {
      if (selectedDepartments.length > 0 && (!e.departmentId || !selectedDepartments.includes(e.departmentId))) {
        return false;
      }
      if (selectedPositions.length > 0 && (!e.jobPositionId || !selectedPositions.includes(e.jobPositionId))) {
        return false;
      }
      if (selectedGrades.length > 0 && (!e.jobGrade || !selectedGrades.includes(e.jobGrade))) {
        return false;
      }
      return true;
    });
  }, [allEmployees, targetType, selectedDepartments, selectedPositions, selectedGrades, selectedEmployees]);

  const toggleCourse = (cId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(cId) ? [] : [cId]
    );
  };

  const toggleGrade = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const toggleDepartment = (depId: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(depId) ? prev.filter((id) => id !== depId) : [...prev, depId]
    );
  };

  const togglePosition = (posId: string) => {
    setSelectedPositions((prev) =>
      prev.includes(posId) ? prev.filter((id) => id !== posId) : [...prev, posId]
    );
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0 && startDate && endDate && startDate <= endDate;
    if (step === 2) return selectedCourseIds.length > 0;
    if (step === 3) return resolvedEmployees.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên đợt đào tạo.');
      return;
    }
    if (selectedCourseIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một khóa học cho đợt đào tạo.');
      return;
    }
    if (resolvedEmployees.length === 0) {
      toast.error('Không có học viên nào trong đối tượng được chọn.');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate,
        courseIds: selectedCourseIds,
        targetCriteria: targetType === 'criteria' ? {
          departmentIds: selectedDepartments.length ? selectedDepartments : undefined,
          jobPositionIds: selectedPositions.length ? selectedPositions : undefined,
          jobGrades: selectedGrades.length ? selectedGrades : undefined,
        } : undefined,
        participantEmployeeIds: resolvedEmployees.map((e) => e.id),
      });

      toast.success('Đã tạo bản nháp đợt đào tạo.');
      navigate(`/enterprise/training-batches/${result.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi tạo đợt đào tạo.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link
          to="/enterprise/training-batches"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách đợt đào tạo
        </Link>
        <PageHeader
          title="Tạo đợt đào tạo mới"
          subtitle="Thiết lập chương trình bồi dưỡng năng lực tập trung: Chọn khóa học, nhóm đối tượng (theo Phòng ban / Vị trí / Cấp bậc G1–G3) và lên lịch thực hiện."
        />
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Thông tin chung' },
            { num: 2, label: 'Chọn khóa học' },
            { num: 3, label: 'Đối tượng học viên' },
            { num: 4, label: 'Xác nhận & Phát hành' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === s.num
                      ? 'bg-primary-600 text-white'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:inline ${
                    step === s.num ? 'text-primary-700' : step > s.num ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < 3 && <div className="flex-1 mx-4 h-0.5 bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        {/* BƯỚC 1: THÔNG TIN CHUNG */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
              1. Thông tin chung của đợt đào tạo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Tên đợt đào tạo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đợt 1/2026 - Phổ cập Năng lực số TT02 cho Khối Nghiệp vụ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Mã đợt</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Ngày bắt đầu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Hạn hoàn thành (Ngày kết thúc) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Mô tả & Mục tiêu đào tạo</label>
              <textarea
                rows={3}
                placeholder="Nêu rõ mục tiêu cần đạt, năng lực hướng tới và các mốc đánh giá quan trọng..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}

        {/* BƯỚC 2: CHỌN KHÓA HỌC */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">2. Chọn khóa học cho đợt</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đã chọn <strong className="text-primary-700">{selectedCourseIds.length}</strong> khóa học
                </p>
              </div>
              <div className="w-64">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Tìm khóa học..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredCourses.map((c) => {
                const isSelected = selectedCourseIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleCourse(c.id)}
                    className={`cursor-pointer rounded-lg border p-3.5 transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50/30 ring-1 ring-primary-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[11px] font-bold text-primary-700 bg-primary-100/60 px-1.5 py-0.5 rounded">
                          {c.code}
                        </span>
                        <LevelBadge level={c.level} />
                      </div>
                      <div className="font-semibold text-sm text-slate-900 truncate">{c.title}</div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span>{c.categoryName || 'Thông tư 02'}</span>
                        <span>·</span>
                        <span>{c.estimatedDurationMinutes == null ? 'Chưa cập nhật' : `${c.estimatedDurationMinutes} phút`}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BƯỚC 3: ĐỐI TƯỢNG HỌC VIÊN */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">3. Xác định đối tượng học viên</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lọc đối tượng thông minh theo Phòng ban, Vị trí hoặc Cấp bậc (G1–G3)
                </p>
              </div>
              <div className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-800 border border-primary-200">
                {resolvedEmployees.length} học viên tham gia
              </div>
            </div>

            {/* Target Mode Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTargetType('criteria')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  targetType === 'criteria'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Theo điều kiện (Phòng ban / Vị trí / Cấp bậc)
              </button>
              <button
                type="button"
                onClick={() => setTargetType('manual')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  targetType === 'manual'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Chọn đích danh học viên
              </button>
            </div>

            {targetType === 'criteria' ? (
              <div className="space-y-5">
                {/* Lọc theo Cấp bậc (Job Grade G1–G3) */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Cấp bậc (Job Grade G1–G3)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {JOB_GRADES.map((code) => {
                      const isSelected = selectedGrades.includes(code);
                      const gradeName = JOB_GRADE_DEFAULT_NAMES[code];
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => toggleGrade(code)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {code} · {gradeName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lọc theo Phòng ban */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Phòng ban
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {departments.map((dep) => {
                      const isSelected = selectedDepartments.includes(dep.id);
                      return (
                        <button
                          key={dep.id}
                          type="button"
                          onClick={() => toggleDepartment(dep.id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            isSelected
                              ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {dep.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lọc theo Vị trí công việc */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Vị trí công việc
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                    {allPositions.map((pos) => {
                      const isSelected = selectedPositions.includes(pos.id);
                      return (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => togglePosition(pos.id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            isSelected
                              ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {pos.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg p-2">
                {allEmployees.map((emp) => {
                  const isChecked = selectedEmployees.includes(emp.id);
                  return (
                    <label
                      key={emp.id}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedEmployees((prev) =>
                            isChecked ? prev.filter((id) => id !== emp.id) : [...prev, emp.id]
                          );
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1 font-medium text-slate-900">{emp.fullName}</div>
                      <div className="text-slate-500">{emp.departmentName || '-'}</div>
                      <div className="font-semibold text-slate-700">{emp.jobGrade || '-'}</div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* BƯỚC 4: XÁC NHẬN & PHÁT HÀNH */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
              4. Xác nhận và cấu hình phát hành
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2 text-xs">
                <div className="text-slate-500 font-semibold uppercase tracking-wider">Thông tin đợt đào tạo</div>
                <div className="text-sm font-bold text-slate-900">{name}</div>
                <div className="text-slate-600">Mã đợt: <strong className="font-mono text-slate-800">{code}</strong></div>
                <div className="text-slate-600">Thời gian: {startDate} → {endDate}</div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2 text-xs">
                <div className="text-slate-500 font-semibold uppercase tracking-wider">Quy mô đào tạo</div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">Số khóa học được chọn:</span>
                  <span className="font-bold text-slate-900">{selectedCourseIds.length} khóa</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Tổng số học viên tham gia:</span>
                  <span className="font-bold text-primary-700">{resolvedEmployees.length} nhân sự</span>
                </div>
              </div>
            </div>

            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              Đợt được tạo ở trạng thái bản nháp. API hiện tại chưa có thao tác kích hoạt hoặc tự động phân công khóa học.
            </p>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((prev) => Math.max(1, prev - 1) as WizardStep)}
          disabled={step === 1}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="flex items-center gap-2">
          {step === 4 ? (
            <>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                {createMutation.isPending ? 'Đang khởi tạo…' : 'Tạo bản nháp'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setStep((prev) => Math.min(4, prev + 1) as WizardStep)}
              disabled={!canProceed()}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm disabled:opacity-40 transition-colors"
            >
              Tiếp tục <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
