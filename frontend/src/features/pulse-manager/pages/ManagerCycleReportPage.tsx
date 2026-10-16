import { FileBarChart } from 'lucide-react';
import { useAssignments } from '@/hooks/use-assignments';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { usePulseFinalReviews } from '@/hooks/use-pulse';
import { usePracticalTasks } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';
import { Empty, LoadError, Mini, PageHead, PageSkeleton, PuLink } from '@/features/pulse-employee/components/ui';
import { ManagerPage, NoDepartment } from '../components/ManagerUi';
import { groupByCourse, LEARNER_STATE } from '../lib/training';
import { MANAGER_PATHS } from '../lib/paths';

interface TimelineEvent {
  at: string;
  title: string;
  detail: string;
  warm?: boolean;
}

/**
 * MG-14 · Báo cáo chu kỳ của phòng ban (mock `#/report`): các khóa đã hoàn thành, học viên, bài nộp, quyết định và tiến độ,
 * dòng thời gian quyết định và bước tiếp theo. Hoàn thành khóa học không tự đổi mức đầu vào của nhân viên.
 */
export function ManagerCycleReportPage() {
  const { can } = usePermission();
  const canReview = can(PERMISSIONS.TASK_EVALUATE);
  const canReadTasks = can(PERMISSIONS.TASK_READ);
  const canReadAssignments = can(PERMISSIONS.COURSE_ASSIGNMENT_READ);
  const { department, isLoading: deptLoading, isError: deptError, refetch: refetchDept } = useManagedDepartment();
  const ready = Boolean(department);
  const assignments = useAssignments({ departmentId: department?.id, pageIndex: 1, pageSize: 100 }, canReadAssignments && ready);
  const reviews = usePulseFinalReviews(canReview && ready);
  const tasks = usePracticalTasks({ departmentId: department?.id, pageIndex: 1, pageSize: 100 }, canReadTasks && ready);

  if (deptLoading || (department && canReadAssignments && assignments.isLoading)) {
    return <ManagerPage><PageSkeleton blocks={[120, 260, 220]} /></ManagerPage>;
  }
  if (deptError || assignments.isError) {
    return (
      <ManagerPage>
        <LoadError message="Không tải được dữ liệu báo cáo của phòng ban." onRetry={() => (deptError ? refetchDept() : assignments.refetch())} />
      </ManagerPage>
    );
  }
  if (!department) {
    return <ManagerPage><PageHead eyebrow="Phân tích chu kỳ khóa học" title="Xem toàn bộ hành trình, không chỉ một điểm số." /><NoDepartment /></ManagerPage>;
  }

  const rows = (assignments.data?.items ?? []).filter((row) => !row.departmentName || row.departmentName === department.name);
  const queue = (reviews.data?.items ?? []).filter((item) => !item.departmentName || item.departmentName === department.name);
  const cohorts = groupByCourse(rows, queue);
  const learners = cohorts.flatMap((c) => c.learners);
  const completed = learners.filter((l) => l.state === 'APPROVED');
  const active = learners.filter((l) => l.state !== 'APPROVED');
  const people = new Set(learners.map((l) => l.employeeId)).size;
  const avgProgress = active.length ? Math.round(active.reduce((sum, l) => sum + l.progressPercent, 0) / active.length) : null;
  const submissions = queue.reduce((sum, item) => sum + item.attempts.length, 0);
  const approvedEvidence = (tasks.data?.items ?? []).reduce((sum, task) => sum + (task.approvedCount ?? 0), 0);

  const events: TimelineEvent[] = [
    ...completed
      .filter((l) => l.completedAt)
      .map((l) => ({ at: l.completedAt!, title: `${l.employeeName} hoàn thành ${l.courseTitle}`, detail: 'Khóa học đã được công nhận' })),
    ...queue.flatMap((item) =>
      item.attempts
        .filter((a) => a.reviewedAt && a.decision)
        .map((a) => ({
          at: a.reviewedAt!,
          title: `${item.employeeName} · ${item.courseTitle}`,
          detail: `Lần nộp ${a.attemptNo}: ${a.decision === 'PASSED' ? 'đạt' : 'chưa đạt'}${a.reviewerName ? ` — ${a.reviewerName}` : ''}`,
          warm: a.decision !== 'PASSED',
        })),
    ),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);

  return (
    <ManagerPage testId="manager-cycle-report">
      <PageHead
        eyebrow={`Phân tích chu kỳ khóa học · ${department.name}`}
        title="Xem toàn bộ hành trình, không chỉ một điểm số."
        description="Khi quản lý duyệt bài cuối, báo cáo nối mục tiêu doanh nghiệp, bài đầu vào, hoạt động học, đánh giá và bước tiếp theo."
      />

      {learners.length === 0 ? (
        <section className="pm-panel">
          <Empty icon={<FileBarChart size={24} />} title="Báo cáo khóa học đầu tiên đang hình thành." action={
            <div className="pu-row" style={{ justifyContent: 'center' }}>
              <PuLink to={MANAGER_PATHS.capability} kind="outline">Xem năng lực khoảng cách</PuLink>
              <PuLink to={MANAGER_PATHS.training}>Mở đào tạo đội ngũ</PuLink>
            </div>
          }>
            Hoàn thành khóa Cơ bản và được quản lý duyệt bài cuối. Báo cáo sẽ thể hiện toàn bộ quá trình từ đầu vào đến quyết định.
          </Empty>
        </section>
      ) : (
        <>
          <section className="pu-metrics pu-review-kpis" aria-label="Chu kỳ của phòng ban">
            <div><strong>{people}</strong><span>Học viên trong chu kỳ</span></div>
            <div><strong>{reviews.isSuccess ? submissions : '—'}</strong><span>Lượt nộp đang theo dõi</span></div>
            <div><strong>{completed.length}</strong><span>Khóa đã duyệt hoàn thành</span></div>
            <div><strong>{avgProgress != null ? `${avgProgress}%` : '—'}</strong><span>Tiến độ học trung bình</span></div>
          </section>

          <section className="pm-panel" style={{ marginTop: 16 }} aria-labelledby="pm-cycles-title">
            <div className="pm-panel-head">
              <div>
                <Mini>Chu kỳ khóa học</Mini>
                <h2 id="pm-cycles-title">Từng khóa, từng trạng thái.</h2>
              </div>
            </div>
            <div className="pm-rows">
              {cohorts.map((cohort) => {
                const done = cohort.learners.filter((l) => l.state === 'APPROVED').length;
                const review = cohort.learners.filter((l) => LEARNER_STATE[l.state].filter === 'REVIEW').length;
                const support = cohort.learners.filter((l) => LEARNER_STATE[l.state].filter === 'SUPPORT').length;
                return (
                  <div key={cohort.courseId} className="pm-row">
                    <div>
                      <strong>{cohort.courseTitle}</strong>
                      <small>
                        {cohort.learners.length} học viên · {done} đã hoàn thành · {review} chờ chấm/nộp lại
                        {support > 0 ? ` · ${support} cần hỗ trợ` : ''}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      <div className="pm-split" style={{ marginTop: 16 }}>
        <section className="pm-panel" aria-labelledby="pm-timeline-title">
          <Mini>Dòng thời gian quy trình</Mini>
          <h2 id="pm-timeline-title" className="pu-panel-title">Các quyết định trong hành trình.</h2>
          {events.length === 0 ? (
            <p className="pu-panel-desc">Hoạt động của đội ngũ sẽ xuất hiện ở đây.</p>
          ) : (
            <ol className="pm-timeline">
              {events.map((event, index) => (
                <li key={`${event.at}-${index}`} className={event.warm ? 'warm' : undefined}>
                  <strong>{event.title}</strong>
                  <small>{event.detail} · {formatDate(event.at)}</small>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="pm-panel" aria-labelledby="pm-next-title">
          <Mini>Bước tiếp theo</Mini>
          <h2 id="pm-next-title" className="pu-panel-title">Khóa học tiếp theo nối tiếp hành trình này.</h2>
          <p className="pu-panel-desc">
            Mỗi khóa đi qua cùng chu trình học, nộp bài, quản lý duyệt và báo cáo. Hoàn thành khóa học không tự thay đổi mức đầu
            vào; mức đã xác nhận chỉ cập nhật theo quyết định duyệt bài cuối hoặc minh chứng.
          </p>
          <div className="pu-row">
            <PuLink to={MANAGER_PATHS.training}>Theo dõi đào tạo →</PuLink>
            <PuLink to={MANAGER_PATHS.capability} kind="outline">Xem lại năng lực →</PuLink>
          </div>
        </section>
      </div>

      <section className="pm-panel" style={{ marginTop: 16 }} aria-labelledby="pm-evidence-title">
        <Mini>Ngoài chu kỳ khóa học</Mini>
        <h2 id="pm-evidence-title" className="pu-panel-title">Minh chứng thực tế luôn có thể truy vết.</h2>
        <p className="pu-panel-desc">
          {canReadTasks && tasks.isSuccess
            ? `${approvedEvidence} minh chứng thực tế đã được duyệt trong phòng ban. `
            : ''}
          Mỗi minh chứng có thể xác nhận mức áp dụng và nguồn riêng với bài cuối khóa.
          {rows.length > 0 && rows[0].assignedAt ? ` Dữ liệu tính từ ${formatDate(rows.map((r) => r.assignedAt).sort()[0])}.` : ''}
        </p>
        <PuLink to={MANAGER_PATHS.evidence} kind="outline" small>Xem minh chứng</PuLink>
      </section>
    </ManagerPage>
  );
}
