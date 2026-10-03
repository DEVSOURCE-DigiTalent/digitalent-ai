import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  ArrowLeft, Plus, Trash2, Send, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { usePracticalTask, useSubmitTaskEvidence } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';

interface FormValues {
  content: string;
  linkUrls: { url: string }[];
}

export function SubmitEvidencePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: task, isLoading } = usePracticalTask(id);
  const submitMutation = useSubmitTaskEvidence();

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      content: '',
      linkUrls: [{ url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'linkUrls',
  });

  const onSubmit = async (values: FormValues) => {
    if (!id) return;
    const cleanedLinks = values.linkUrls.map((l) => l.url.trim()).filter(Boolean);

    try {
      await submitMutation.mutateAsync({
        taskId: id,
        payload: {
          content: values.content,
          linkUrls: cleanedLinks,
        },
      });

      toast.success('Đã gửi nộp minh chứng thành công! Quản lý sẽ nhận được thông báo để chấm điểm.');
      navigate('/enterprise/me/tasks');
    } catch {
      toast.error('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-6">
        <div className="h-6 w-32 bg-slate-100 animate-pulse rounded" />
        <div className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="size-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Không tìm thấy bài thực hành</h2>
        <p className="text-sm text-slate-500">Bài tập không tồn tại hoặc đã hết hạn.</p>
        <Link
          to="/enterprise/me/tasks"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <Link
        to="/enterprise/me/tasks"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="size-4" />
        <span>Quay lại bài thực hành của tôi</span>
      </Link>

      <PageHeader
        title={`Nộp minh chứng: ${task.title}`}
        subtitle={`Giao bởi ${task.assignedByName} • Hạn nộp: ${formatDate(task.dueDate)}`}
      />

      {/* Task Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Yêu cầu sản phẩm đầu ra</h3>
          <LevelBadge level={task.targetLevel} />
        </div>

        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {task.description}
        </p>

        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
          <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Sản phẩm đầu ra cần nộp:
          </p>
          <p className="text-xs font-semibold text-blue-800">{task.expectedOutput}</p>
        </div>

        {/* Rubric Criteria overview */}
        <div className="space-y-2 pt-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tiêu chí chấm điểm của Quản lý:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(task.rubricCriteria ?? []).map((r) => (
              <div key={r.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>{r.label}</span>
                  <span className="text-blue-600 font-bold">{r.maxPoints}đ</span>
                </div>
                {r.description && <p className="text-[11px] text-slate-500 mt-0.5">{r.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900">Nội dung báo cáo & Minh chứng</h3>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Mô tả giải pháp, quy trình và kết quả đạt được <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={6}
              {...register('content', { required: true })}
              placeholder="Trình bày chi tiết cách bạn đã giải quyết tình huống, các công cụ số đã sử dụng, quy trình tuân thủ Thông tư 02..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Links / File URLs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-slate-800">
                  Đường dẫn tài liệu / Sản phẩm minh chứng
                </label>
                <p className="text-xs text-slate-500">
                  Dán link Google Drive, Github repository, báo cáo số hóa hoặc hình ảnh đính kèm.
                </p>
              </div>
              <button
                type="button"
                onClick={() => append({ url: '' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <Plus className="size-3.5" />
                <span>Thêm link</span>
              </button>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    {...register(`linkUrls.${index}.url` as const)}
                    placeholder="https://drive.google.com/... hoặc https://github.com/..."
                    className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to="/enterprise/me/tasks"
            className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <Send className="size-4" />
            <span>{isSubmitting ? 'Đang gửi…' : 'Gửi nộp minh chứng'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
