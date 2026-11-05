import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, CircleAlert, CircleCheck, GraduationCap, UsersRound } from 'lucide-react';
import { useAssignments, useAssignmentSummary, useCourse } from '@/hooks/use-assignments';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDepartments } from '@/hooks/use-departments';
import { PERMISSIONS } from '@/hooks/use-permission';
import type { AssignmentRow, AssignmentStatus } from '@/services/assignment.service';
import { PRIMARY_BUTTON } from '@/features/onboarding/components/styles';
import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';
import { ASSIGNMENT_STATUS_LABELS } from '../assignment-labels';
import { AssignCourseModal } from '../components/AssignCourseModal';
import { CancelAssignmentDialog } from '../components/CancelAssignmentDialog';
import { AssignmentsTable } from '../components/AssignmentsTable';

import './course-assignment.css';

const PAGE_SIZE = 8;
const STATUSES: AssignmentStatus[] = import.meta.env.VITE_USE_MOCK === 'true'
  ? ['NOT_STARTED', 'IN_PROGRESS', 'READY_FOR_ASSESSMENT', 'COMPLETED', 'CANCELLED']
  : ['ACTIVE', 'CANCELLED'];

/** LCA-12: give standard courses to employees, teams or positions, and cancel an assignment. */
export function CourseAssignmentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') || undefined;
  const { data: selectedCourse } = useCourse(courseId);
  const can = useCurrentUser((s) => s.hasPermission);
  const canAssign = can(PERMISSIONS.COURSE_ASSIGNMENT_CREATE);
  const canCancel = can(PERMISSIONS.COURSE_ASSIGNMENT_CANCEL);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AssignmentStatus | ''>('');
  const [departmentId, setDepartmentId] = useState('');
  const [page, setPage] = useState(1);
  const [assigning, setAssigning] = useState(false);
  const [cancelling, setCancelling] = useState<AssignmentRow | null>(null);

  const departments = useDepartments({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const { data: summary } = useAssignmentSummary();
  const { data, isLoading, isError } = useAssignments({
    pageIndex: page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    departmentId: departmentId || undefined,
    courseId,
  });

  return (
    <div className="assignment-page">
      <header className="assignment-hero">
        <div className="assignment-hero-copy">
          <span className="assignment-hero-kicker"><BookOpen size={14} /> ĐÀO TẠO DOANH NGHIỆP</span>
          <h1>Giao khóa học</h1>
        </div>
        {canAssign && (
          <button type="button" onClick={() => setAssigning(true)} className={`assignment-primary-action ${PRIMARY_BUTTON}`}>
            <GraduationCap className="size-5" aria-hidden="true" />
            Giao khóa học
          </button>
        )}
      </header>

      <div className="assignment-stats" aria-label="Tổng quan phân công">
        <div><span className="assignment-stat-icon is-teal"><UsersRound size={20} /></span><span>Lượt giao</span><strong>{summary?.total ?? data?.totalItems ?? 0}</strong></div>
        <div><span className="assignment-stat-icon is-blue"><BookOpen size={20} /></span><span>Đang học</span><strong>{summary?.inProgress ?? 0}</strong></div>
        <div><span className="assignment-stat-icon is-green"><CircleCheck size={20} /></span><span>Hoàn thành</span><strong>{summary?.completed ?? 0}</strong></div>
        <div><span className="assignment-stat-icon is-coral"><CircleAlert size={20} /></span><span>Quá hạn</span><strong>{summary?.overdue ?? 0}</strong></div>
      </div>

      {courseId && <div className="assignment-course-context">
        <div><span>Đang xem khóa học</span><strong>{selectedCourse?.title || 'Khóa học đã chọn'}</strong>{selectedCourse && <small>{selectedCourse.code}</small>}</div>
        <div className="assignment-course-context-actions">
          <Link to={`/enterprise/courses/${courseId}`}>Xem khóa học</Link>
          <button type="button" onClick={() => { const next = new URLSearchParams(searchParams); next.delete('courseId'); setSearchParams(next); setPage(1); }}>Xem tất cả</button>
        </div>
      </div>}

      <div className="assignment-list-heading"><div><strong>Danh sách phân công</strong><span>{data?.totalItems ?? 0} lượt giao{courseId ? ' trong khóa học này' : ''}</span></div></div>

      {isError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Không tải được lượt giao khóa học. Vui lòng thử lại hoặc kiểm tra quyền truy cập.</p>}
      <AssignmentsTable
        className="assignment-table"
        rows={data?.items ?? []}
        isLoading={isLoading}
        onCancel={canCancel ? setCancelling : undefined}
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        filters={
          <>
            <OwnerFilterSelect label="Lọc theo trạng thái" value={status} onChange={(value) => { setStatus(value as AssignmentStatus | ''); setPage(1); }} options={[{ value: '', label: 'Tất cả trạng thái' }, ...STATUSES.map((s) => ({ value: s, label: ASSIGNMENT_STATUS_LABELS[s] }))]} />
            <OwnerFilterSelect label="Lọc theo phòng ban" value={departmentId} onChange={(value) => { setDepartmentId(value); setPage(1); }} options={[{ value: '', label: 'Mọi phòng ban' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
          </>
        }
        pageInfo={{ page, pageSize: PAGE_SIZE, total: data?.totalItems ?? 0, onPageChange: setPage }}
      />

      {assigning && <AssignCourseModal open courseId={courseId} onClose={() => setAssigning(false)} />}

      {cancelling && <CancelAssignmentDialog assignment={cancelling} onClose={() => setCancelling(null)} />}
    </div>
  );
}
