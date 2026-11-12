import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { usePracticalTasks } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';
import { Empty, LoadError, Mini, Notice, PageHead, PageSkeleton, Pill, PuLink } from '@/features/pulse-employee/components/ui';
import { levelName } from '@/features/pulse-employee/lib/labels';
import { ManagerPage, NoDepartment } from '../components/ManagerUi';
import { MANAGER_PATHS } from '../lib/paths';

type View = 'PENDING' | 'ALL';

export function ManagerEvidencePage() {
  useUiLanguage();
  const { can } = usePermission();
  const canCreate = can(PERMISSIONS.TASK_CREATE);
  const { department, isLoading: deptLoading, isError: deptError, refetch: refetchDept } = useManagedDepartment();
  const ready = Boolean(department);
  const tasks = usePracticalTasks({ departmentId: department?.id, pageIndex: 1, pageSize: 100 }, ready);
  const [view, setView] = useState<View>('ALL');

  if (deptLoading || (department && tasks.isLoading)) {
    return <ManagerPage><PageSkeleton blocks={[120, 220, 220]} /></ManagerPage>;
  }
  if (deptError || tasks.isError) {
    return (
      <ManagerPage>
        <LoadError message="Không tải được nhiệm vụ thực tế của phòng ban." onRetry={() => (deptError ? refetchDept() : tasks.refetch())} />
      </ManagerPage>
    );
  }
  if (!department) {
    return <ManagerPage><PageHead eyebrow="Minh chứng thực tế" title="Minh chứng công việc của phòng ban" /><NoDepartment /></ManagerPage>;
  }

  const all = tasks.data?.items ?? [];
  const pending = all.filter((task) => (task.pendingReviewCount ?? 0) > 0);
  const visible = view === 'PENDING' ? pending : all;

  return (
    <ManagerPage testId="manager-evidence">
      <PageHead
        eyebrow={`Quản lý / ${department.name}`}
        title="Minh chứng công việc của phòng ban"
        description="Bài đánh giá trước khi học và bài cuối khóa có hàng chờ riêng. Tại đây, hãy duyệt, yêu cầu sửa hoặc từ chối nhiệm vụ thực tế theo tiêu chí của chủ doanh nghiệp."
        actions={
          <>
            <PuLink to={MANAGER_PATHS.finalReviews} kind="outline">{translateUi("Kết quả bài làm")}</PuLink>
            {canCreate && <PuLink to={MANAGER_PATHS.newTask}>{translateUi("Giao nhiệm vụ")}</PuLink>}
          </>
        }
      />

      {all.length === 0 ? (
        <Empty
          icon={<ClipboardCheck size={24} />}
          title="Chưa có nhiệm vụ thực tế."
          action={canCreate ? <PuLink to={MANAGER_PATHS.newTask} kind="outline">Giao nhiệm vụ đầu tiên</PuLink> : undefined}
        >
          Nhiệm vụ thực tế giúp nhân viên chứng minh năng lực bằng công việc thật, tách khỏi bài cuối mỗi khóa học.
        </Empty>
      ) : (
        <>
          <div className="pu-tabs" role="group" aria-label="Lọc nhiệm vụ" style={{ marginTop: 0 }}>
            <button type="button" aria-pressed={view === 'PENDING'} onClick={() => setView('PENDING')}>{translateUi("Chờ đánh giá")}<span>{pending.length}</span>
            </button>
            <button type="button" aria-pressed={view === 'ALL'} onClick={() => setView('ALL')}>
              Tất cả nhiệm vụ<span>{all.length}</span>
            </button>
          </div>
          {visible.length === 0 && <Notice>Không có minh chứng nào đang chờ đánh giá trong phòng ban.</Notice>}
          {visible.map((card) => (
            <article key={card.id} className="pm-evidence" aria-label={translateUi(card.title)}>
              <header>
                <div>
                  <Mini>
                    {department.name}
                    {card.targetLevel ? translateUi(` · mức mục tiêu ${levelName(card.targetLevel)}`) : ''}
                  </Mini>
                  <h2>{translateUi(card.title)}</h2>
                  <p className="pm-evidence-meta">
                    {card.dueDate ? translateUi(`Hạn ${formatDate(card.dueDate)}`) : 'Không đặt hạn'}
                    {card.description ? ` · ${card.description}` : ''}
                  </p>
                </div>
                <Pill tone={(card.pendingReviewCount ?? 0) > 0 ? 'coral' : card.approvedCount ? 'green' : 'gray'}>
                  {(card.pendingReviewCount ?? 0) > 0 ? translateUi(`${(card.pendingReviewCount ?? 0)} chờ đánh giá`) : card.approvedCount ? translateUi(`${card.approvedCount} đã duyệt`) : 'Mở'}
                </Pill>
              </header>

              {(card.rubricCriteria?.length ?? 0) > 0 && (
                <div className="pm-rubric-box">
                  <Mini>Tiêu chí của chủ doanh nghiệp</Mini>
                  <ul>
                    {card.rubricCriteria?.map((criterion) => (
                      <li key={criterion.id}><b>{translateUi(criterion.label)}</b>{translateUi(criterion.description)} · tối đa {criterion.maxPoints}{translateUi(" điểm")}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pm-submission">
                <header>
                  <span>{card.submissionsCount ?? 0} bài đã nộp · {card.approvedCount ?? 0} đã duyệt</span>
                  <PuLink to={MANAGER_PATHS.task(card.id)} small>Xem nhiệm vụ và bài nộp</PuLink>
                </header>
              </div>
            </article>
          ))}
        </>
      )}

    </ManagerPage>
  );
}
