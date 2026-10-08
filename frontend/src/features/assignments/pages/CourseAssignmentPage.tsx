import { useState } from 'react';
import { toast } from 'sonner';
import { GraduationCap } from 'lucide-react';
import { ConfirmActionDialog, PageHeader } from '@/components/shared';
import { useAssignments, useCancelAssignment } from '@/hooks/use-assignments';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDepartments } from '@/hooks/use-departments';
import { PERMISSIONS } from '@/hooks/use-permission';
import { apiErrorMessage } from '@/lib/utils';
import type { AssignmentRow, AssignmentStatus } from '@/services/assignment.service';
import { INPUT_CLASS, PRIMARY_BUTTON } from '@/features/onboarding/components/styles';
import { ASSIGNMENT_STATUS_LABELS } from '../assignment-labels';
import { AssignCourseModal } from '../components/AssignCourseModal';
import { AssignmentsTable } from '../components/AssignmentsTable';

const PAGE_SIZE = 15;
const STATUSES: AssignmentStatus[] = import.meta.env.VITE_USE_MOCK === 'true'
  ? ['NOT_STARTED', 'IN_PROGRESS', 'READY_FOR_ASSESSMENT', 'COMPLETED', 'CANCELLED']
  : ['ACTIVE', 'CANCELLED'];

/** LCA-12: give standard courses to employees, teams or positions, and cancel an assignment. */
export function CourseAssignmentPage() {
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
  const cancel = useCancelAssignment();
  const { data, isLoading } = useAssignments({
    pageIndex: page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    departmentId: departmentId || undefined,
  });

  return (
    <div>
      <PageHeader title="Giao khóa học" subtitle="Giao khóa học chuẩn theo nhân viên, phòng ban hoặc vị trí và theo dõi từng lượt giao">
        {canAssign && (
          <button type="button" onClick={() => setAssigning(true)} className={PRIMARY_BUTTON}>
            <GraduationCap className="size-4" aria-hidden="true" />
            Giao khóa học
          </button>
        )}
      </PageHeader>

      <AssignmentsTable
        rows={data?.items ?? []}
        isLoading={isLoading}
        onCancel={canCancel ? setCancelling : undefined}
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        filters={
          <>
            <select aria-label="Lọc theo trạng thái" value={status} onChange={(e) => { setStatus(e.target.value as AssignmentStatus | ''); setPage(1); }} className={INPUT_CLASS}>
              <option value="">Tất cả trạng thái</option>
              {STATUSES.map((s) => <option key={s} value={s}>{ASSIGNMENT_STATUS_LABELS[s]}</option>)}
            </select>
            <select aria-label="Lọc theo phòng ban" value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }} className={INPUT_CLASS}>
              <option value="">Mọi phòng ban</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </>
        }
        pageInfo={{ page, pageSize: PAGE_SIZE, total: data?.totalItems ?? 0, onPageChange: setPage }}
      />

      {assigning && <AssignCourseModal open onClose={() => setAssigning(false)} />}

      <ConfirmActionDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        title="Hủy lượt giao khóa học?"
        description={cancelling ? `${cancelling.courseCode} · ${cancelling.courseTitle} của ${cancelling.employeeName}. Tiến độ đã học được giữ lại nếu giao lại sau này.` : ''}
        confirmLabel="Hủy giao"
        requireReason
        reasonPlaceholder="Ví dụ: không còn phù hợp với vị trí"
        onConfirm={async (reason) => {
          if (!cancelling) return;
          try {
            await cancel.mutateAsync({ id: cancelling.id, reason });
            toast.success('Đã hủy lượt giao khóa học.');
          } catch (error) {
            toast.error(apiErrorMessage(error, 'Không hủy được.'));
          }
        }}
      />
    </div>
  );
}
