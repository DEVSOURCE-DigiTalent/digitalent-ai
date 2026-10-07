import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateInternalCourse, useInternalCourse, useUpdateInternalCourse } from '@/hooks/use-learning';
import { apiErrorMessage } from '@/lib/utils';

/** BE2 stores course metadata here; it has no endpoint to persist an internal curriculum. */
export function LiveInternalCourseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const courseQuery = useInternalCourse(isNew ? undefined : id);
  const create = useCreateInternalCourse();
  const update = useUpdateInternalCourse();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  useEffect(() => {
    if (!courseQuery.data) return;
    setTitle(courseQuery.data.title);
    setDescription(courseQuery.data.description);
    setCategory(courseQuery.data.category);
    setDurationMinutes(courseQuery.data.durationMinutes);
    setStatus(courseQuery.data.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
  }, [courseQuery.data]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    try {
      const input = {
        title: title.trim(), description: description.trim(), category: category.trim(),
        durationMinutes: Number(durationMinutes), status,
      };
      const result = isNew
        ? await create.mutateAsync({ ...input, modulesCount: 0 })
        : await update.mutateAsync({ id: id!, input });
      toast.success(isNew ? 'Đã tạo bản nháp khóa học.' : 'Đã lưu thông tin khóa học.');
      navigate(`/enterprise/internal-courses/${result.id}`);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không lưu được khóa học.'));
    }
  };

  if (!isNew && courseQuery.isLoading) return <p className="p-6 text-sm text-slate-500">Đang tải khóa học…</p>;
  if (!isNew && (courseQuery.isError || !courseQuery.data)) return (
    <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
      Không tải được khóa học. <Link to="/enterprise/internal-courses" className="underline">Về danh sách</Link>
    </div>
  );

  const existing = courseQuery.data;
  if (existing && (!existing.code.startsWith('INT-') || existing.status === 'ARCHIVED')) return (
    <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      {existing.status === 'ARCHIVED' ? 'Khóa đã lưu trữ.' : 'API này cũng trả về khóa chuẩn; chỉ khóa có mã INT- được chỉnh sửa tại đây.'}
      {' '}<Link to={`/enterprise/internal-courses/${existing.id}`} className="underline">Về chi tiết khóa học</Link>
    </div>
  );
  const canPublish = !isNew && (existing?.modulesCount ?? 0) > 0;
  const pending = create.isPending || update.isPending;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <Link to="/enterprise/internal-courses" className="text-sm font-medium text-blue-700 hover:underline">← Quay lại danh sách khóa học</Link>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{isNew ? 'Tạo khóa học nội bộ' : 'Chỉnh sửa thông tin khóa học'}</h1>
        <p className="mt-1 text-sm text-slate-600">Lưu tên, mô tả, chuyên mục và thời lượng bằng API BE2.</p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        BE2 chưa có API lưu nội dung từng học phần. Khóa mới được tạo ở trạng thái bản nháp với 0 học phần.
      </div>
      <form onSubmit={save} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {existing && <div><span className="text-sm text-slate-500">Mã khóa: </span><strong className="font-mono text-slate-900">{existing.code}</strong></div>}
        <label className="block text-sm font-medium text-slate-800">Tên khóa học
          <input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-slate-800">Mô tả
          <textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-slate-800">Chuyên mục
          <input value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-slate-800">Thời lượng dự kiến (phút)
          <input type="number" min="0" step="1" value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        {canPublish && <label className="block text-sm font-medium text-slate-800">Trạng thái
          <select value={status} onChange={(event) => setStatus(event.target.value as 'DRAFT' | 'PUBLISHED')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
          </select>
        </label>}
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Link to={isNew ? '/enterprise/internal-courses' : `/enterprise/internal-courses/${id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Hủy</Link>
          <button type="submit" disabled={pending} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Đang lưu…' : isNew ? 'Tạo bản nháp' : 'Lưu thay đổi'}</button>
        </div>
      </form>
    </div>
  );
}
