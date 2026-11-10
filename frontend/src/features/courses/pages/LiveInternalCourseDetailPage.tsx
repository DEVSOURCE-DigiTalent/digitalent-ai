import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link, useParams } from 'react-router-dom';
import { useInternalCourse } from '@/hooks/use-learning';
import { formatDate } from '@/lib/utils';

/** Displays only fields returned by GET /internal-courses/{id}. */
export function LiveInternalCourseDetailPage() {
  useUiLanguage();
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, isError } = useInternalCourse(id);

  if (isLoading) return <p className="p-6 text-sm text-slate-500">{translateUi("Đang tải khóa học…")}</p>;
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
          <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{course.status === 'PUBLISHED' ? 'Đã xuất bản' : course.status === 'ARCHIVED' ? 'Đã lưu trữ' : translateUi('Bản nháp')}</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">{translateUi(course.title)}</h1>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{translateUi(course.description) || 'Chưa có mô tả.'}</p>
        <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-slate-500">Chuyên mục</dt><dd className="font-semibold text-slate-900">{course.category || 'Chưa có'}</dd></div>
          <div><dt className="text-slate-500">Học phần đã lưu</dt><dd className="font-semibold text-slate-900">{course.modulesCount}</dd></div>
          <div><dt className="text-slate-500">Thời lượng dự kiến</dt><dd className="font-semibold text-slate-900">{course.durationMinutes}{translateUi(" phút")}</dd></div>
          <div><dt className="text-slate-500">Cập nhật</dt><dd className="font-semibold text-slate-900">{formatDate(course.updatedAt)}</dd></div>
        </dl>
        {isInternalCode && <Link to={`/enterprise/internal-courses/${course.id}/edit`} className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{translateUi("Chỉnh sửa thông tin")}</Link>}
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {isInternalCode
          ? 'Hiện chưa thể xem nội dung học phần và danh sách học viên của khóa này.'
          : 'Khóa học chuẩn được quản lý trong danh mục khóa học.'}
      </div>
    </div>
  );
}
