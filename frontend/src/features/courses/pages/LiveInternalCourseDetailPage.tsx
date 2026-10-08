import { Link, useParams } from 'react-router-dom';
import { useInternalCourse } from '@/hooks/use-learning';
import { formatDate } from '@/lib/utils';

/** Displays only fields returned by GET /internal-courses/{id}. */
export function LiveInternalCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, isError } = useInternalCourse(id);

  if (isLoading) return <p className="p-6 text-sm text-slate-500">Đang tải khóa học…</p>;
  if (isError || !course) return (
    <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
      Không tải được khóa học. <Link to="/enterprise/internal-courses" className="underline">Về danh sách</Link>
    </div>
  );

  const isInternalCode = course.code.startsWith('INT-');
  return (
    <div className="space-y-6 pb-12">
      <Link to="/enterprise/internal-courses" className="text-sm font-medium text-blue-700 hover:underline">← Quay lại danh sách khóa học</Link>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-700">{course.code}</span>
          <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{course.status === 'PUBLISHED' ? 'Đã xuất bản' : course.status === 'ARCHIVED' ? 'Đã lưu trữ' : 'Bản nháp'}</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">{course.title}</h1>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{course.description || 'Chưa có mô tả.'}</p>
        <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-slate-500">Chuyên mục</dt><dd className="font-semibold text-slate-900">{course.category || 'Chưa có'}</dd></div>
          <div><dt className="text-slate-500">Học phần đã lưu</dt><dd className="font-semibold text-slate-900">{course.modulesCount}</dd></div>
          <div><dt className="text-slate-500">Thời lượng dự kiến</dt><dd className="font-semibold text-slate-900">{course.durationMinutes} phút</dd></div>
          <div><dt className="text-slate-500">Cập nhật</dt><dd className="font-semibold text-slate-900">{formatDate(course.updatedAt)}</dd></div>
        </dl>
        {isInternalCode && <Link to={`/enterprise/internal-courses/${course.id}/edit`} className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Chỉnh sửa thông tin</Link>}
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {isInternalCode
          ? 'BE2 hiện chỉ trả về số học phần, chưa trả danh sách nội dung từng học phần cho khóa nội bộ. Danh sách học viên riêng của khóa cũng chưa có API.'
          : 'API khóa nội bộ hiện trả cả khóa chuẩn của tổ chức. Khóa này không có mã INT- nên chức năng chỉnh sửa nội bộ được ẩn để tránh thay đổi khóa chuẩn.'}
      </div>
    </div>
  );
}
