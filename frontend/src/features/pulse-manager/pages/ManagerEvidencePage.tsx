import { PageLoading } from '@/components/shared/LoadingState';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { usePracticalTasks } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';
import { Empty, LoadError, Mini, Notice, Pill, PuLink } from '@/features/pulse-employee/components/ui';
import { levelName } from '@/features/pulse-employee/lib/labels';
import { ManagerPage, ManagerPageHeader, NoDepartment } from '../components/ManagerUi';
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
    return <ManagerPage><PageLoading label="Đang tải minh chứng" /></ManagerPage>;
  }
  if (deptError || tasks.isError) {
    return (
      <ManagerPage>
        <LoadError message="Không tải được nhiệm vụ thực tế của phòng ban." onRetry={() => (deptError ? refetchDept() : tasks.refetch())} />
      </ManagerPage>
    );
  }
  if (!department) {
    return <ManagerPage><ManagerPageHeader title="Minh chứng thực tế" /><NoDepartment /></ManagerPage>;
  }

  const all = tasks.data?.items ?? [];
  const pending = all.filter((task) => (task.pendingReviewCount ?? 0) > 0);
  const visible = view === 'PENDING' ? pending : all;

  return (
    <ManagerPage testId="manager-evidence">
      <ManagerPageHeader
        scope={department.name}
        title="Minh chứng thực tế"
        subtitle="Theo dõi và xử lý minh chứng từ nhiệm vụ thực tế của phòng ban."
        actions={
          <>
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
                  {card.targetLevel && <Mini>{translateUi(`Mức mục tiêu ${levelName(card.targetLevel)}`)}</Mini>}
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
                <details className="pm-rubric-box">
                  <summary>{translateUi('Tiêu chí đánh giá')} · {card.rubricCriteria?.length}</summary>
                  <ul>
                    {card.rubricCriteria?.map((criterion) => (
                      <li key={criterion.id}><b>{translateUi(criterion.label)}</b>{translateUi(criterion.description)} · tối đa {criterion.maxPoints}{translateUi(" điểm")}</li>
                    ))}
                  </ul>
                </details>
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
