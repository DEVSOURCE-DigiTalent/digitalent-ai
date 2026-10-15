import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { usePracticalTasks, useReviewQueue } from '@/hooks/use-tasks';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { RubricCriterion, ReviewQueueItemDto } from '@/services/task.service';
import { Empty, LoadError, Mini, Notice, PageHead, PageSkeleton, Pill, PuLink } from '@/features/pulse-employee/components/ui';
import { levelName } from '@/features/pulse-employee/lib/labels';
import { ManagerPage, NoDepartment } from '../components/ManagerUi';
import { MANAGER_PATHS } from '../lib/paths';

interface EvidenceCard {
  taskId: string;
  title: string;
  description?: string;
  dueDate?: string;
  targetLevel: number;
  rubric: RubricCriterion[];
  assignedCount?: number;
  submissionsCount?: number;
  approvedCount?: number;
  pending: ReviewQueueItemDto[];
}

type View = 'PENDING' | 'ALL';

/**
 * Minh chứng thực tế của phòng ban (mock `#/evidence`, OW-38 / MG-11 khi người xem là quản lý): nhiệm vụ, tiêu chí,
 * bài nộp, hạn và quyết định. Tách khỏi bài cuối khóa; duyệt / yêu cầu sửa / từ chối ở trang đánh giá (MG-12).
 */
export function ManagerEvidencePage() {
  const { can } = usePermission();
  const canEvaluate = can(PERMISSIONS.TASK_EVALUATE);
  const canCreate = can(PERMISSIONS.TASK_CREATE);
  const { department, isLoading: deptLoading, isError: deptError, refetch: refetchDept } = useManagedDepartment();
  const ready = Boolean(department);
  const tasks = usePracticalTasks({ departmentId: department?.id, status: 'ACTIVE', pageIndex: 1, pageSize: 100 }, ready);
  const queue = useReviewQueue({ pageIndex: 1, pageSize: 100 }, canEvaluate && ready);
  const [view, setView] = useState<View>('PENDING');

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
    return <ManagerPage><PageHead eyebrow="Minh chứng thực tế" title="Đánh giá riêng minh chứng công việc." /><NoDepartment /></ManagerPage>;
  }

  // Chỉ bài nộp của nhân viên phòng ban này (API hàng chờ hiện trả về cả tổ chức).
  const pending = (queue.data?.items ?? []).filter((item) => item.departmentName === department.name);
  const cards = new Map<string, EvidenceCard>();
  for (const task of tasks.data?.items ?? []) {
    if (task.departmentId && task.departmentId !== department.id) continue;
    cards.set(task.id, {
      taskId: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      targetLevel: task.targetLevel,
      rubric: task.rubricCriteria ?? [],
      assignedCount: task.assignedEmployeesCount,
      submissionsCount: task.submissionsCount,
      approvedCount: task.approvedCount,
      pending: [],
    });
  }
  for (const item of pending) {
    const card = cards.get(item.taskId) ?? {
      taskId: item.taskId,
      title: item.taskTitle,
      dueDate: item.taskDueDate,
      targetLevel: item.targetLevel,
      rubric: [],
      pending: [],
    };
    card.pending.push(item);
    cards.set(item.taskId, card);
  }
  const all = [...cards.values()].sort((a, b) => b.pending.length - a.pending.length || (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
  const visible = view === 'PENDING' ? all.filter((card) => card.pending.length > 0) : all;

  return (
    <ManagerPage testId="manager-evidence">
      <PageHead
        eyebrow={`Quản lý / ${department.name}`}
        title="Đánh giá riêng minh chứng công việc."
        description="Bài cuối khóa có hàng chờ riêng. Tại đây, hãy duyệt, yêu cầu sửa hoặc từ chối nhiệm vụ thực tế theo tiêu chí của chủ doanh nghiệp."
        actions={
          <>
            <PuLink to={MANAGER_PATHS.finalReviews} kind="outline">Bài cuối khóa</PuLink>
            {canCreate && <PuLink to={MANAGER_PATHS.newTask}>Giao nhiệm vụ</PuLink>}
          </>
        }
      />

      {!canEvaluate && (
        <div style={{ marginBottom: 14 }}>
          <Notice>Tài khoản của bạn xem được nhiệm vụ nhưng chưa có quyền đánh giá minh chứng.</Notice>
        </div>
      )}
      {canEvaluate && queue.isError && (
        <div style={{ marginBottom: 14 }}>
          <Notice tone="warning">Chưa tải được bài nộp đang chờ đánh giá. Danh sách nhiệm vụ vẫn hiển thị bên dưới.</Notice>
        </div>
      )}

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
            <button type="button" aria-pressed={view === 'PENDING'} onClick={() => setView('PENDING')}>
              Chờ đánh giá<span>{pending.length}</span>
            </button>
            <button type="button" aria-pressed={view === 'ALL'} onClick={() => setView('ALL')}>
              Tất cả nhiệm vụ<span>{all.length}</span>
            </button>
          </div>
          {visible.length === 0 && <Notice>Không có minh chứng nào đang chờ đánh giá trong phòng ban.</Notice>}
          {visible.map((card) => (
            <article key={card.taskId} className="pm-evidence" aria-label={card.title}>
              <header>
                <div>
                  <Mini>
                    {department.name}
                    {card.targetLevel ? ` · mức mục tiêu ${levelName(card.targetLevel)}` : ''}
                  </Mini>
                  <h2>{card.title}</h2>
                  <p className="pm-evidence-meta">
                    {card.dueDate ? `Hạn ${formatDate(card.dueDate)}` : 'Không đặt hạn'}
                    {card.description ? ` · ${card.description}` : ''}
                  </p>
                </div>
                <Pill tone={card.pending.length > 0 ? 'coral' : card.approvedCount ? 'green' : 'gray'}>
                  {card.pending.length > 0 ? `${card.pending.length} chờ đánh giá` : card.approvedCount ? `${card.approvedCount} đã duyệt` : 'Mở'}
                </Pill>
              </header>

              {card.rubric.length > 0 && (
                <div className="pm-rubric-box">
                  <Mini>Tiêu chí của chủ doanh nghiệp</Mini>
                  <ul>
                    {card.rubric.map((criterion) => (
                      <li key={criterion.id}><b>{criterion.label}</b>{criterion.description} · tối đa {criterion.maxPoints} điểm</li>
                    ))}
                  </ul>
                </div>
              )}

              {card.pending.length > 0 ? (
                card.pending.map((item) => (
                  <div key={item.id} className="pm-submission">
                    <header>
                      <strong>{item.employeeName} · nộp {formatDateTime(item.submittedAt)}</strong>
                      <PuLink to={MANAGER_PATHS.evidenceDetail(item.id)} small>Đánh giá minh chứng →</PuLink>
                    </header>
                    <p>{item.content.length > 280 ? `${item.content.slice(0, 280)}…` : item.content}</p>
                  </div>
                ))
              ) : (
                <div className="pm-submission">
                  {card.submissionsCount
                    ? `${card.submissionsCount} bài đã nộp · ${card.approvedCount ?? 0} đã duyệt. Không có bài nào đang chờ quyết định.`
                    : 'Nhân viên chưa nộp minh chứng.'}
                </div>
              )}
            </article>
          ))}
        </>
      )}

      <section className="pu-surface pu-pad" style={{ marginTop: 18 }}>
        <Mini>Không phải bài cuối khóa</Mini>
        <h2 className="pu-panel-title">Minh chứng được đánh giá trong lúc học.</h2>
        <p className="pu-panel-desc">
          Quy tắc hai lần nộp chỉ áp dụng cho bài cuối mỗi khóa. Minh chứng thực tế có tiêu chí và quyết định riêng: duyệt, yêu cầu
          sửa hoặc từ chối.
        </p>
        <PuLink to={MANAGER_PATHS.tasks} kind="outline" small>Danh sách nhiệm vụ đã giao</PuLink>
      </section>
    </ManagerPage>
  );
}
