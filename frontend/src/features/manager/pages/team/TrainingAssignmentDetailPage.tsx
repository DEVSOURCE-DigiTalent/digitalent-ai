import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3 } from 'lucide-react';
import { assignmentService } from '@/services/assignment.service';
import { EmptyState } from '@/components/shared';
import { PageLoading } from '@/components/shared/LoadingState';
import { Bar, Pill } from '@/features/pulse-employee/components/ui';
import { Initials, ManagerPage, ManagerPageHeader } from '@/features/pulse-manager/components/ManagerUi';
import { MANAGER_PATHS } from '@/features/pulse-manager/lib/paths';
import { formatDate } from '@/lib/utils';
import { ASSIGNMENT_STATUS_LABELS } from '@/features/assignments/assignment-labels';
import '@/features/pulse-manager/pages/manager-team-training.css';

export function TrainingAssignmentDetailPage() {
  useUiLanguage();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { data: assignment, isLoading, isError } = useQuery({
    queryKey: ['course-assignments', assignmentId],
    queryFn: () => assignmentService.getById(assignmentId!),
    enabled: Boolean(assignmentId),
  });
  const back = <Link to={MANAGER_PATHS.training} className="manager-heading-back">
    <ArrowLeft size={16} aria-hidden="true" />{translateUi('Đào tạo đội ngũ')}
  </Link>;

  if (isLoading) return <ManagerPage><PageLoading label="Đang tải tiến độ đào tạo" variant="detail" /></ManagerPage>;
  if (isError || !assignment) {
    return (
      <ManagerPage>
        <ManagerPageHeader title="Chi tiết lượt học" actions={back} />
        <EmptyState title="Không tìm thấy phân công đào tạo"
          description="Bản ghi này không tồn tại hoặc không thuộc phòng ban bạn quản lý." />
      </ManagerPage>
    );
  }

  const completed = assignment.status === 'COMPLETED' || Boolean(assignment.completedAt);
  const overdue = !completed && assignment.overdue;
  const status = completed ? 'Đã hoàn thành' : overdue ? 'Quá hạn học' : ASSIGNMENT_STATUS_LABELS[assignment.status] ?? assignment.status;
  const progress = Number.isFinite(assignment.progressPercent) ? Math.round(assignment.progressPercent) : null;
  const timeline = [
    { label: 'Ngày giao', date: assignment.assignedAt, Icon: CalendarDays },
    { label: 'Hạn học', date: assignment.dueDate, Icon: Clock3 },
    ...(assignment.completedAt ? [{ label: 'Hoàn thành', date: assignment.completedAt, Icon: CheckCircle2 }] : []),
  ];

  return (
    <ManagerPage>
      <ManagerPageHeader title={assignment.courseTitle} scope={assignment.departmentName ?? undefined}
        subtitle={assignment.courseCode} actions={back} />
      <div className="training-detail">
        <section className="training-detail__panel training-detail__progress" data-completed={completed} aria-labelledby="training-detail-progress">
          <header><h2 id="training-detail-progress">{translateUi('Tiến độ bài học')}</h2>
            <Pill tone={completed ? 'green' : overdue ? 'coral' : ''}>{translateUi(status)}</Pill>
          </header>
          <strong>{progress == null ? '—' : `${progress}%`}</strong>
          {progress != null && <Bar value={progress} label={translateUi('Tiến độ bài học')} />}
          <dl className="training-detail__timeline">
            {timeline.map(({ label, date, Icon }) => (
              <div key={label}>
                <dt><Icon size={16} aria-hidden="true" />{translateUi(label)}</dt>
                <dd>{date ? <time dateTime={date}>{formatDate(date)}</time> : '—'}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="training-detail__panel" aria-labelledby="training-detail-learner">
          <h2 id="training-detail-learner">{translateUi('Học viên')}</h2>
          <div className="training-detail__identity">
            <Initials name={assignment.employeeName} />
            <div><strong>{assignment.employeeName}</strong>
              <small>{[assignment.employeeCode, assignment.positionName].filter(Boolean).join(' · ')}</small>
            </div>
          </div>
          {assignment.assignedByName && <dl className="training-detail__assigner">
            <dt>{translateUi('Người giao')}</dt><dd>{assignment.assignedByName}</dd>
          </dl>}
        </section>
      </div>
    </ManagerPage>
  );
}
