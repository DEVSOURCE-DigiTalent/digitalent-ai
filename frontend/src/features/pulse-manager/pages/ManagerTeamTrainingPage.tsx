import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAssignments } from '@/hooks/use-assignments';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { usePulseFinalReviews } from '@/hooks/use-pulse';
import { formatDate } from '@/lib/utils';
import { Bar, Empty, LoadError, Mini, Notice, PageHead, PageSkeleton, Pill, PuLink } from '@/features/pulse-employee/components/ui';
import { ManagerPage, NoDepartment } from '../components/ManagerUi';
import { LEARNER_STATE, groupByCourse, type TrainingFilter } from '../lib/training';
import { MANAGER_PATHS } from '../lib/paths';

const FILTERS: { key: TrainingFilter; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'LEARNING', label: 'Đang học' },
  { key: 'REVIEW', label: 'Chờ chấm' },
  { key: 'APPROVED', label: 'Đã hoàn thành' },
  { key: 'SUPPORT', label: 'Cần hỗ trợ' },
];

/**
 * MG-06 · Đào tạo đội ngũ (mock `#/team-training`): các khóa đang giao trong phòng ban như những nhóm học, tiến độ bài học
 * của từng người và trạng thái học / chờ chấm / đã hoàn thành / cần hỗ trợ. Chủ doanh nghiệp tạo nhóm; quản lý theo dõi.
 */
export function ManagerTeamTrainingPage() {
  const { can } = usePermission();
  const canReview = can(PERMISSIONS.TASK_EVALUATE);
  const canReadAssignments = can(PERMISSIONS.COURSE_ASSIGNMENT_READ);
  const { department, isLoading: deptLoading, isError: deptError, refetch: refetchDept } = useManagedDepartment();
  const assignments = useAssignments({ departmentId: department?.id, pageIndex: 1, pageSize: 100 }, canReadAssignments && Boolean(department));
  const reviews = usePulseFinalReviews(canReview && Boolean(department));
  const [filter, setFilter] = useState<TrainingFilter>('ALL');

  if (deptLoading || (department && canReadAssignments && assignments.isLoading)) {
    return <ManagerPage><PageSkeleton blocks={[120, 110, 320]} /></ManagerPage>;
  }
  if (deptError || assignments.isError) {
    return (
      <ManagerPage>
        <LoadError message="Không tải được tiến độ đào tạo của phòng ban." onRetry={() => (deptError ? refetchDept() : assignments.refetch())} />
      </ManagerPage>
    );
  }
  if (!department) {
    return <ManagerPage><PageHead eyebrow="Đào tạo đội ngũ" title="Xem ai cần hỗ trợ trước hạn." /><NoDepartment /></ManagerPage>;
  }
  if (!canReadAssignments) {
    return (
      <ManagerPage>
        <PageHead eyebrow={`Quản lý / ${department.name}`} title="Xem ai cần hỗ trợ trước hạn." />
        <Notice>Tài khoản của bạn chưa có quyền xem phân công khóa học của phòng ban.</Notice>
      </ManagerPage>
    );
  }

  const rows = (assignments.data?.items ?? []).filter((row) => !row.departmentName || row.departmentName === department.name);
  const cohorts = groupByCourse(rows, reviews.data?.items ?? []);
  const learners = cohorts.flatMap((cohort) => cohort.learners);
  const count = (key: TrainingFilter) => (key === 'ALL' ? learners.length : learners.filter((l) => LEARNER_STATE[l.state].filter === key).length);
  const visible = cohorts
    .map((cohort) => ({ ...cohort, learners: cohort.learners.filter((l) => filter === 'ALL' || LEARNER_STATE[l.state].filter === filter) }))
    .filter((cohort) => cohort.learners.length > 0);

  return (
    <ManagerPage testId="manager-team-training">
      <PageHead
        eyebrow={`Quản lý / ${department.name}`}
        title="Xem ai cần hỗ trợ trước hạn."
        description="Chủ doanh nghiệp tạo nhóm đào tạo. Quản lý theo dõi tiến độ trong phòng ban và chấm bài cuối khóa."
        actions={canReview ? <PuLink to={MANAGER_PATHS.finalReviews} kind="outline">Mở bài cuối khóa</PuLink> : undefined}
      />

      {learners.length === 0 ? (
        <Empty icon={<GraduationCap size={24} />} title="Chưa có nhóm học.">
          Chủ doanh nghiệp có thể nhóm nhân viên theo vị trí và giao khóa miễn phí hoặc đã mua. Tiến độ sẽ hiển thị ở đây.
        </Empty>
      ) : (
        <>
          <section className="pu-metrics pu-review-kpis" aria-label="Tình trạng đào tạo">
            <div><strong>{count('LEARNING')}</strong><span>Đang học</span></div>
            <div><strong>{count('REVIEW')}</strong><span>Chờ chấm / nộp lại</span></div>
            <div><strong>{count('APPROVED')}</strong><span>Đã hoàn thành</span></div>
            <div className="warn"><strong>{count('SUPPORT')}</strong><span>Cần hỗ trợ</span></div>
          </section>
          {canReview && reviews.isError && (
            <div style={{ marginTop: 14 }}>
              <Notice tone="warning">Chưa tải được hàng chờ bài cuối khóa, nên trạng thái chờ chấm có thể chưa đầy đủ.</Notice>
            </div>
          )}

          <div className="pu-tabs" role="group" aria-label="Lọc theo trạng thái học">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}<span>{count(f.key)}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 && <Notice>Không có học viên nào ở trạng thái này.</Notice>}
          {visible.map((cohort) => (
            <section key={cohort.courseId} className="pm-course" aria-label={cohort.courseTitle}>
              <div className="pm-panel-head" style={{ marginBottom: 6 }}>
                <div>
                  <Mini>{cohort.courseCode} · {cohort.learners.length} học viên</Mini>
                  <h2>{cohort.courseTitle}</h2>
                </div>
              </div>
              {cohort.learners.map((learner) => {
                const state = LEARNER_STATE[learner.state];
                return (
                  <div key={learner.id} className="pm-learner">
                    <div>
                      <Link to={MANAGER_PATHS.trainingDetail(learner.id)}><strong>{learner.employeeName}</strong></Link>
                      <small>
                        {learner.positionName ?? 'Chưa gán vị trí'}
                        {learner.dueDate ? ` · hạn ${formatDate(learner.dueDate)}` : ''}
                      </small>
                    </div>
                    <div className="pm-learner-progress">
                      <Bar value={learner.progressPercent} label={`Tiến độ bài học ${Math.round(learner.progressPercent)}%`} />
                      <span>Tiến độ bài học {Math.round(learner.progressPercent)}%</span>
                    </div>
                    <Pill tone={state.tone}>{state.label}</Pill>
                  </div>
                );
              })}
            </section>
          ))}
        </>
      )}
    </ManagerPage>
  );
}
