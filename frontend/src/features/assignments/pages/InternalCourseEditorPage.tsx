import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Plus, Trash2, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, StickyActionBar } from '@/components/shared';
import { useInternalCourse, useCreateInternalCourse } from '@/hooks/use-learning';

interface ModuleItem {
  id: string;
  title: string;
  type: 'TEXT' | 'VIDEO' | 'DOCUMENT' | 'QUIZ';
  durationMinutes: number;
}

interface FormValues {
  code: string;
  title: string;
  description: string;
  category: string;
  modulesCount: number;
  durationMinutes: number;
  status: 'DRAFT' | 'PUBLISHED';
}

export function InternalCourseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const { data: existingCourse, isLoading } = useInternalCourse(isNew ? undefined : id);
  const createMutation = useCreateInternalCourse();

  // Local modules state for curriculum builder
  const [modules, setModules] = useState<ModuleItem[]>([
    { id: 'mod-1', title: 'Giới thiệu & Tổng quan chương trình', type: 'TEXT', durationMinutes: 15 },
    { id: 'mod-2', title: 'Quy trình thực hiện & Yêu cầu tuân thủ', type: 'DOCUMENT', durationMinutes: 30 },
    { id: 'mod-3', title: 'Bài trắc nghiệm kiểm tra hiểu biết', type: 'QUIZ', durationMinutes: 15 },
  ]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      code: '',
      title: '',
      description: '',
      category: 'Văn hóa & Hội nhập',
      modulesCount: 3,
      durationMinutes: 60,
      status: 'PUBLISHED',
    },
  });

  useEffect(() => {
    if (existingCourse) {
      reset({
        code: existingCourse.code,
        title: existingCourse.title,
        description: existingCourse.description,
        category: existingCourse.category,
        modulesCount: existingCourse.modulesCount,
        durationMinutes: existingCourse.durationMinutes,
        status: existingCourse.status === 'ARCHIVED' ? 'DRAFT' : existingCourse.status,
      });
      // Generate modules if existing
      const count = existingCourse.modulesCount || 2;
      const defaultMods: ModuleItem[] = Array.from({ length: count }, (_, i) => ({
        id: `mod-${i + 1}`,
        title: `Học phần ${i + 1}: Nội dung chuyên đề ${i + 1}`,
        type: i === count - 1 ? 'QUIZ' : i % 2 === 0 ? 'TEXT' : 'DOCUMENT',
        durationMinutes: Math.round(existingCourse.durationMinutes / count) || 20,
      }));
      setModules(defaultMods);
    }
  }, [existingCourse, reset]);

  const handleAddModule = () => {
    const newMod: ModuleItem = {
      id: `mod-${Date.now()}`,
      title: `Học phần ${modules.length + 1}: Chuyên đề mới`,
      type: 'TEXT',
      durationMinutes: 15,
    };
    const updated = [...modules, newMod];
    setModules(updated);
    setValue('modulesCount', updated.length);
    const totalMins = updated.reduce((sum, m) => sum + m.durationMinutes, 0);
    setValue('durationMinutes', totalMins);
  };

  const handleRemoveModule = (modId: string) => {
    if (modules.length <= 1) {
      toast.error('Khóa học cần có ít nhất 1 học phần');
      return;
    }
    const updated = modules.filter((m) => m.id !== modId);
    setModules(updated);
    setValue('modulesCount', updated.length);
    const totalMins = updated.reduce((sum, m) => sum + m.durationMinutes, 0);
    setValue('durationMinutes', totalMins);
  };

  const handleUpdateModule = (modId: string, field: keyof ModuleItem, value: any) => {
    const updated = modules.map((m) => (m.id === modId ? { ...m, [field]: value } : m));
    setModules(updated);
    if (field === 'durationMinutes') {
      const totalMins = updated.reduce((sum, m) => sum + Number(m.durationMinutes || 0), 0);
      setValue('durationMinutes', totalMins);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const totalMins = modules.reduce((sum, m) => sum + Number(m.durationMinutes || 0), 0) || Number(values.durationMinutes) || 60;
      await createMutation.mutateAsync({
        code: values.code || undefined,
        title: values.title,
        description: values.description,
        category: values.category,
        modulesCount: modules.length,
        durationMinutes: totalMins,
        status: values.status,
      });
      toast.success(isNew ? 'Đã tạo khóa học nội bộ thành công!' : 'Đã lưu thay đổi khóa học!');
      navigate('/enterprise/internal-courses');
    } catch {
      toast.error('Có lỗi xảy ra khi lưu khóa học.');
    }
  };

  if (!isNew && isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <div className="h-8 w-48 bg-slate-100 animate-pulse rounded" />
        <div className="h-96 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Link
        to="/enterprise/internal-courses"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="size-4" />
        <span>Quay lại danh sách khóa nội bộ</span>
      </Link>

      <PageHeader
        title={isNew ? 'Soạn khóa học nội bộ mới' : `Chỉnh sửa: ${existingCourse?.title}`}
        subtitle="Khóa học nội bộ dành cho đào tạo văn hóa, chính sách hoặc quy trình đặc thù của doanh nghiệp."
      />

      {/* Banner thông báo chuẩn nghiệp vụ */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <span className="font-semibold">Lưu ý giáo trình:</span> Khóa học nội bộ là giáo trình riêng của doanh nghiệp (sections, tài liệu SOP, video, trắc nghiệm nhanh),{' '}
          <strong>không can thiệp vào giáo trình 18 khóa học chuẩn năng lực số</strong> và không tự động tăng bậc năng lực số trên Khung chuẩn.
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Phần 1: Thông tin chung */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <BookOpen className="size-4 text-blue-600" />
            <span>1. Thông tin chung về khóa học</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="code" className="block text-sm font-semibold text-slate-800">
                Mã khóa học
              </label>
              <input
                id="code"
                {...register('code')}
                placeholder="VD: NB-03 (để trống sẽ tự sinh)"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="category" className="block text-sm font-semibold text-slate-800">
                Chuyên mục đào tạo
              </label>
              <select
                id="category"
                {...register('category')}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Văn hóa & Hội nhập">Văn hóa & Hội nhập</option>
                <option value="Chính sách & Tuân thủ">Chính sách & Tuân thủ</option>
                <option value="Quy trình vận hành">Quy trình vận hành</option>
                <option value="Kỹ năng chuyên môn">Kỹ năng chuyên môn</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-sm font-semibold text-slate-800">
              Tên khóa học <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              {...register('title', { required: 'Vui lòng nhập tên khóa học' })}
              placeholder="VD: Hướng dẫn an toàn thông tin và văn hóa làm việc số 2026"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-semibold text-slate-800">
              Mô tả mục tiêu và nội dung
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              placeholder="Mô tả mục tiêu, đối tượng áp dụng và kiến thức nhân sự sẽ nắm được sau khi hoàn thành…"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label htmlFor="status" className="block text-sm font-semibold text-slate-800">
                Trạng thái xuất bản
              </label>
              <select
                id="status"
                {...register('status')}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="PUBLISHED">Xuất bản ngay (học viên có thể học)</option>
                <option value="DRAFT">Lưu bản nháp (chưa mở học)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Tổng quy mô tính toán
              </label>
              <div className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium">
                {modules.length} học phần · {modules.reduce((sum, m) => sum + Number(m.durationMinutes || 0), 0)} phút
              </div>
            </div>
          </div>
        </div>

        {/* Phần 2: Soạn thảo cấu trúc giáo trình (Sections / Materials / Quiz) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="size-4 text-blue-600" />
                <span>2. Cấu trúc học phần & Học liệu</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập các học phần, bài đọc, tài liệu đính kèm và bài kiểm tra trắc nghiệm ngắn.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddModule}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
            >
              <Plus className="size-3.5" />
              <span>Thêm học phần</span>
            </button>
          </div>

          <div className="space-y-3">
            {modules.map((mod, idx) => (
              <div
                key={mod.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                  <span className="size-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={mod.title}
                    onChange={(e) => handleUpdateModule(mod.id, 'title', e.target.value)}
                    placeholder="Tiêu đề học phần…"
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                  <select
                    value={mod.type}
                    onChange={(e) => handleUpdateModule(mod.id, 'type', e.target.value as ModuleItem['type'])}
                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
                  >
                    <option value="TEXT">Bài giảng văn bản</option>
                    <option value="VIDEO">Video hướng dẫn</option>
                    <option value="DOCUMENT">Tài liệu SOP / PDF</option>
                    <option value="QUIZ">Trắc nghiệm nhanh</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={5}
                      max={120}
                      step={5}
                      value={mod.durationMinutes}
                      onChange={(e) => handleUpdateModule(mod.id, 'durationMinutes', Number(e.target.value))}
                      className="w-16 px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-center bg-white"
                    />
                    <span className="text-xs text-slate-500">phút</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveModule(mod.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                    title="Xóa học phần này"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nút lưu */}
        <StickyActionBar className="flex items-center justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={() => navigate('/enterprise/internal-courses')}
            className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting || createMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <Save className="size-4" />
            <span>{isSubmitting || createMutation.isPending ? 'Đang lưu…' : 'Lưu khóa học nội bộ'}</span>
          </button>
        </StickyActionBar>
      </form>
    </div>
  );
}

