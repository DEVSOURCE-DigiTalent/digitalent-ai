import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Users,
  Settings,
  AlertCircle,
  Clock,
  Calendar,
  Edit3,
  UserPlus,
} from 'lucide-react';
import { StatusBadge, DataTable, ScoreCard } from '@/components/shared';
import { useInternalCourse } from '@/hooks/use-learning';
import { useAssignments } from '@/hooks/use-assignments';
import { formatDate } from '@/lib/utils';
import { AssignCourseModal } from '@/features/assignments/components/AssignCourseModal';
import { AssignmentStatusBadge } from '@/features/assignments/assignment-labels';
import type { AssignmentRow } from '@/services/assignment.service';

type DetailTab = 'curriculum' | 'learners' | 'settings';

export function InternalCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>('curriculum');
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const { data: course, isLoading, isError } = useInternalCourse(id);
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useAssignments({
    courseId: course?.id,
    pageSize: 50,
  });

  const learners = assignmentsData?.items ?? [];
  const completedLearners = learners.filter((l) => l.status === 'COMPLETED').length;
  const inProgressLearners = learners.filter((l) => l.status === 'IN_PROGRESS').length;
  const completionRate = learners.length > 0 ? Math.round((completedLearners / learners.length) * 100) : 0;

  // Mock modules structure based on course properties
  const modules = useMemo(() => {
    if (!course) return [];
    const count = course.modulesCount || 3;
    const avgDuration = Math.round(course.durationMinutes / count) || 20;
    return Array.from({ length: count }, (_, i) => ({
      id: `mod-${i + 1}`,
      title: i === 0 ? 'Giới thiệu & Tổng quan văn hóa doanh nghiệp' : i === count - 1 ? 'Bài kiểm tra trắc nghiệm đánh giá hiểu biết' : `Quy trình thực hiện & Yêu cầu tuân thủ phần ${i}`,
      type: i === count - 1 ? 'QUIZ' : i % 2 === 0 ? 'TEXT' : 'DOCUMENT',
      durationMinutes: avgDuration,
      description: i === count - 1 ? 'Bài kiểm tra 10 câu trắc nghiệm nhanh để xác nhận hoàn thành nội dung bài học.' : 'Tài liệu hướng dẫn quy chuẩn nội bộ áp dụng cho toàn thể nhân sự.',
    }));
  }, [course]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-slate-100 animate-pulse rounded" />
        <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-96 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="size-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-semibold text-slate-800">Không tìm thấy khóa học nội bộ</h2>
        <p className="text-sm text-slate-500">Khóa học không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
        <Link
          to="/enterprise/internal-courses"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại danh sách</span>
        </Link>
      </div>
    );
  }

  const learnerColumns = [
    {
      key: 'employee',
      header: 'Nhân viên',
      cell: (row: AssignmentRow) => (
        <div>
          <Link to={`/enterprise/members/${row.employeeId}`} className="font-semibold text-sm text-slate-900 hover:text-blue-600 transition">
            {row.employeeName}
          </Link>
          <p className="text-xs text-slate-500">{row.departmentName ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Tiến độ',
      cell: (row: AssignmentRow) => (
        <div className="flex items-center gap-2">
          <div role="progressbar" aria-label={`Tiến độ của ${row.employeeName}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={row.progressPercent} className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${row.progressPercent}%` }} />
          </div>
          <span className="text-xs tabular-nums text-slate-600 font-medium">{row.progressPercent}%</span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Hạn hoàn thành',
      cell: (row: AssignmentRow) => (
        <span className="text-xs text-slate-600">
          {formatDate(row.dueDate)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row: AssignmentRow) => <AssignmentStatusBadge assignment={row} />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header điều hướng */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to="/enterprise/internal-courses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại danh mục khóa nội bộ</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/enterprise/internal-courses/${course.id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl shadow-sm transition"
          >
            <Edit3 className="size-4" />
            <span>Chỉnh sửa nội dung</span>
          </Link>
          <button
            type="button"
            onClick={() => setAssignModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <UserPlus className="size-4" />
            <span>Giao khóa học này</span>
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
            {course.code}
          </span>
          <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium">
            {course.category}
          </span>
          <StatusBadge
            variant={course.status === 'PUBLISHED' ? 'success' : 'default'}
            label={course.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
            {course.description || 'Chương trình đào tạo nội bộ do doanh nghiệp tự xây dựng.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <BookOpen className="size-4 text-slate-400" />
            <span>{course.modulesCount} học phần</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-4 text-slate-400" />
            <span>{course.durationMinutes} phút học</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-4 text-slate-400" />
            <span>Cập nhật: {formatDate(course.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Banner nghiệp vụ TT02 */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <span className="font-semibold">Lưu ý nghiệp vụ:</span> Đây là khóa học nội bộ phục vụ quy trình và văn hóa của doanh nghiệp.{' '}
          <strong>Hoàn thành khóa học nội bộ không tự động tăng bậc năng lực</strong> trong Khung năng lực số chuẩn Thông tư 02/2025/TT-BGDĐT.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard label="Tổng học viên đã giao" value={learners.length} subtitle="Nhân sự tham gia" />
        <ScoreCard label="Đã hoàn thành" value={completedLearners} variant="success" subtitle="Hoàn thành tốt" />
        <ScoreCard label="Đang học" value={inProgressLearners} variant="default" subtitle="Đang tiến hành" />
        <ScoreCard
          label="Tỷ lệ hoàn thành"
          value={`${completionRate}%`}
          variant={completionRate >= 70 ? 'success' : 'default'}
          subtitle="Tiến độ học tập chung"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('curriculum')}
          className={`pb-3 font-semibold text-sm border-b-2 flex items-center gap-2 transition ${
            activeTab === 'curriculum'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="size-4" />
          <span>Cấu trúc giáo trình ({modules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('learners')}
          className={`pb-3 font-semibold text-sm border-b-2 flex items-center gap-2 transition ${
            activeTab === 'learners'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="size-4" />
          <span>Danh sách học viên ({learners.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pb-3 font-semibold text-sm border-b-2 flex items-center gap-2 transition ${
            activeTab === 'settings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="size-4" />
          <span>Cài đặt & Xuất bản</span>
        </button>
      </div>

      {/* Tab 1: Cấu trúc giáo trình */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Các học phần trong khóa học</h2>
            <Link
              to={`/enterprise/internal-courses/${course.id}/edit`}
              className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <Edit3 className="size-3.5" />
              <span>Chỉnh sửa học phần</span>
            </Link>
          </div>

          <div className="space-y-3">
            {modules.map((m, idx) => (
              <div
                key={m.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition flex items-start gap-4"
              >
                <div className="size-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm">{m.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                      {m.type === 'QUIZ' ? 'Trắc nghiệm kiểm tra' : m.type === 'VIDEO' ? 'Video hướng dẫn' : m.type === 'DOCUMENT' ? 'Tài liệu SOP' : 'Bài đọc văn bản'}
                    </span>
                    <span className="text-xs text-slate-400">· {m.durationMinutes} phút</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Danh sách học viên */}
      {activeTab === 'learners' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Nhân sự đang theo học khóa này</h2>
            <button
              type="button"
              onClick={() => setAssignModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition"
            >
              <UserPlus className="size-3.5" />
              <span>Giao thêm học viên</span>
            </button>
          </div>

          <DataTable
            data={learners}
            columns={learnerColumns}
            keyExtractor={(row) => row.id}
            isLoading={isLoadingAssignments}
            emptyTitle="Chưa có học viên nào được giao khóa học này"
            emptyDescription="Nhấn nút 'Giao khóa học này' để phân công cho nhân viên hoặc phòng ban."
          />
        </div>
      )}

      {/* Tab 3: Cài đặt & Xuất bản */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Thông số kỹ thuật & Vận hành
          </h2>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mã khóa học</dt>
              <dd className="mt-1 font-mono font-bold text-slate-900">{course.code}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trạng thái xuất bản</dt>
              <dd className="mt-1">
                <StatusBadge
                  variant={course.status === 'PUBLISHED' ? 'success' : 'default'}
                  label={course.status === 'PUBLISHED' ? 'Đã xuất bản (học viên có thể học)' : 'Bản nháp (ẩn khỏi học viên)'}
                />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Chuyên mục đào tạo</dt>
              <dd className="mt-1 text-slate-900 font-medium">{course.category}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thời lượng học tập</dt>
              <dd className="mt-1 text-slate-900 font-medium">{course.durationMinutes} phút ({course.modulesCount} học phần)</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngày tạo</dt>
              <dd className="mt-1 text-slate-900">{formatDate(course.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lần cập nhật cuối</dt>
              <dd className="mt-1 text-slate-900">{formatDate(course.updatedAt)}</dd>
            </div>
          </dl>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-slate-900">Chỉnh sửa thông tin hoặc giáo trình</p>
              <p className="text-xs text-slate-500 mt-0.5">Cập nhật tiêu đề, mô tả hoặc cơ cấu học phần của khóa học này.</p>
            </div>
            <Link
              to={`/enterprise/internal-courses/${course.id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            >
              <Edit3 className="size-3.5" />
              <span>Chỉnh sửa ngay</span>
            </Link>
          </div>
        </div>
      )}

      {/* Modal giao khóa học */}
      <AssignCourseModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        courseId={course.id}
      />
    </div>
  );
}
