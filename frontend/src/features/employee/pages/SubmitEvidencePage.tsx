import { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Send, AlertCircle, Upload, Paperclip, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useMyTask, useSubmitMyTask, useUploadTaskAttachment } from '@/hooks/use-me';
import type { MyTaskFile } from '@/services/me.service';
import { formatFileSize } from '@/lib/download';
import { apiErrorMessage, formatDate } from '@/lib/utils';

const httpUrl = z
  .string()
  .trim()
  .refine((value) => value === '' || /^https?:\/\/\S+$/i.test(value), 'Đường dẫn phải bắt đầu bằng http:// hoặc https:// và không có khoảng trắng.')
  .refine((value) => !value.includes(';'), 'Đường dẫn không được chứa dấu ";".');

const schema = z.object({
  content: z.string().trim().min(20, 'Mô tả cần tối thiểu 20 ký tự.').max(10000, 'Mô tả tối đa 10.000 ký tự.'),
  linkUrls: z.array(z.object({ url: httpUrl })).max(10, 'Tối đa 10 đường dẫn.'),
});

type FormValues = z.infer<typeof schema>;

/** EM-16: Nộp / nộp lại minh chứng nhiệm vụ — mô tả, đường dẫn và tệp đính kèm. */
export function SubmitEvidencePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const { data: task, isLoading, isError, error } = useMyTask(id);
  const submitTask = useSubmitMyTask();
  const uploadAttachment = useUploadTaskAttachment();
  const [attachments, setAttachments] = useState<MyTaskFile[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { content: '', linkUrls: [{ url: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'linkUrls' });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-6" aria-label="Đang tải nhiệm vụ">
        <div className="h-6 w-32 bg-slate-100 animate-pulse rounded" />
        <div className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="size-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Không tìm thấy nhiệm vụ</h2>
        <p className="text-sm text-slate-500">{apiErrorMessage(error, 'Nhiệm vụ không tồn tại hoặc không được giao cho bạn.')}</p>
        <Link to="/enterprise/me/tasks" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Quay lại danh sách</Link>
      </div>
    );
  }

  if (!task.canSubmit) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="size-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Nhiệm vụ hiện không nhận bài nộp</h2>
        <p className="text-sm text-slate-500">
          {task.status === 'SUBMITTED' ? 'Bài nộp trước đang chờ quản lý đánh giá.' : 'Nhiệm vụ đã có kết quả đánh giá.'}
        </p>
        <Link to={`/enterprise/me/tasks/${task.assignmentId}`} className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Xem chi tiết nhiệm vụ</Link>
      </div>
    );
  }

  const lastFeedback = task.status === 'NEEDS_REVISION' ? task.latestSubmission?.evaluation : null;
  const accept = task.allowedExtensions.join(',');

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    let count = attachments.length;
    for (const file of Array.from(files)) {
      const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
      if (!task.allowedExtensions.includes(extension)) {
        toast.error(`Định dạng ${extension} không được hỗ trợ.`);
        continue;
      }
      if (file.size > task.maxAttachmentBytes) {
        toast.error(`${file.name} vượt quá ${formatFileSize(task.maxAttachmentBytes)}.`);
        continue;
      }
      if (count >= task.maxAttachments) {
        toast.error(`Tối đa ${task.maxAttachments} tệp đính kèm.`);
        break;
      }
      try {
        const uploaded = await uploadAttachment.mutateAsync({ assignmentId: task.assignmentId, file });
        count += 1;
        setAttachments((current) => [...current, uploaded]);
      } catch (err) {
        toast.error(apiErrorMessage(err, `Không tải được ${file.name}.`));
      }
    }
    if (fileInput.current) fileInput.current.value = '';
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await submitTask.mutateAsync({
        assignmentId: task.assignmentId,
        payload: {
          content: values.content.trim(),
          linkUrls: values.linkUrls.map((l) => l.url.trim()).filter(Boolean),
          attachmentIds: attachments.map((a) => a.id),
        },
      });
      toast.success(`Đã nộp minh chứng (lần ${result.versionNo}). Người chấm đã nhận được thông báo.`);
      navigate(`/enterprise/me/tasks/${task.assignmentId}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.'));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <Link to={`/enterprise/me/tasks/${task.assignmentId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
        <ArrowLeft className="size-4" />
        <span>Quay lại nhiệm vụ</span>
      </Link>

      <PageHeader
        title={`${task.status === 'NEEDS_REVISION' ? 'Nộp lại' : 'Nộp'} minh chứng: ${task.title}`}
        subtitle={`Giao bởi ${task.assignedByName ?? '—'} • Hạn nộp: ${formatDate(task.dueAt)}`}
      />

      {lastFeedback && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-1.5 text-sm">
          <p className="font-bold text-amber-900 flex items-center gap-2"><MessageSquare className="size-4" /> Phản hồi lần trước của {lastFeedback.reviewerName ?? 'người đánh giá'}</p>
          <p className="text-amber-950 leading-relaxed whitespace-pre-line">{lastFeedback.feedback || 'Không có nhận xét.'}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Yêu cầu sản phẩm đầu ra</h3>
          <LevelBadge level={task.targetLevel} />
        </div>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{task.description}</p>
        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
          <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Sản phẩm đầu ra cần nộp:</p>
          <p className="text-xs font-semibold text-blue-800 whitespace-pre-line">{task.expectedOutput}</p>
        </div>
        {task.rubric.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiêu chí chấm điểm:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {task.rubric.map((r) => (
                <div key={r.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>{r.label}</span>
                    {r.maxPoints > 0 && <span className="text-blue-600 font-bold">{r.maxPoints}đ</span>}
                  </div>
                  {r.description && <p className="text-[11px] text-slate-500 mt-0.5">{r.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900">Nội dung báo cáo & minh chứng</h3>

          <div className="space-y-1.5">
            <label htmlFor="evidence-content" className="block text-sm font-semibold text-slate-800">
              Mô tả giải pháp, quy trình và kết quả đạt được <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="evidence-content"
              rows={6}
              {...register('content')}
              placeholder="Trình bày cách bạn đã giải quyết nhiệm vụ, công cụ số đã dùng và kết quả đạt được…"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.content && <p className="text-xs text-rose-600">{errors.content.message}</p>}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="block text-sm font-semibold text-slate-800">Đường dẫn tài liệu / sản phẩm</p>
                <p className="text-xs text-slate-500">Link thư mục chia sẻ, báo cáo trực tuyến hoặc kho mã nguồn.</p>
              </div>
              <button
                type="button"
                onClick={() => append({ url: '' })}
                disabled={fields.length >= 10}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition disabled:opacity-50"
              >
                <Plus className="size-3.5" />
                <span>Thêm link</span>
              </button>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      {...register(`linkUrls.${index}.url` as const)}
                      aria-label={`Đường dẫn ${index + 1}`}
                      placeholder="https://…"
                      className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)} aria-label={`Xóa đường dẫn ${index + 1}`} className="p-2 text-slate-400 hover:text-rose-600 transition">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  {errors.linkUrls?.[index]?.url && <p className="text-xs text-rose-600">{errors.linkUrls[index]?.url?.message}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="block text-sm font-semibold text-slate-800">Tệp đính kèm</p>
                <p className="text-xs text-slate-500">
                  Tối đa {task.maxAttachments} tệp, mỗi tệp ≤ {formatFileSize(task.maxAttachmentBytes)} ({task.allowedExtensions.join(', ')}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploadAttachment.isPending || attachments.length >= task.maxAttachments}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition disabled:opacity-50"
              >
                {uploadAttachment.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                <span>{uploadAttachment.isPending ? 'Đang tải lên…' : 'Chọn tệp'}</span>
              </button>
              <input
                ref={fileInput}
                type="file"
                multiple
                accept={accept}
                className="hidden"
                aria-label="Chọn tệp đính kèm"
                onChange={(e) => void handleFiles(e.target.files)}
              />
            </div>
            {attachments.length > 0 && (
              <ul className="space-y-1.5">
                {attachments.map((file) => (
                  <li key={file.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs text-slate-700">
                    <Paperclip className="size-3.5 shrink-0" />
                    <span className="truncate flex-1">{file.fileName}</span>
                    <span className="text-slate-400 shrink-0">{formatFileSize(file.sizeBytes)}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments((current) => current.filter((a) => a.id !== file.id))}
                      aria-label={`Bỏ tệp ${file.fileName}`}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to={`/enterprise/me/tasks/${task.assignmentId}`} className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition">
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || uploadAttachment.isPending}
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
