import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronDown, ClipboardList, GraduationCap, History, Search, TrendingUp } from 'lucide-react';
import { PageLoading } from '@/components/shared/LoadingState';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { usePulseFinalReviews } from '@/hooks/use-pulse';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';
import { assignmentService } from '@/services/assignment.service';
import type { PagedList } from '@/types/api';
import { Bar, LoadError, PuLink } from '@/features/pulse-employee/components/ui';
import { KpiRow, ManagerPage, ManagerPageHeader, NoDepartment } from '../components/ManagerUi';
import { groupByCourse, LEARNER_STATE, type CourseCohort } from '../lib/training';
import { MANAGER_PATHS } from '../lib/paths';
import './manager-cycle-report.css';

const API_PAGE_SIZE = 100;
const COURSES_PER_PAGE = 6;
const TIMELINE_PREVIEW = 3;

const courseName = (title: string, locale: string) => title === title.toLocaleUpperCase(locale)
  ? title.replace(/\p{L}[\p{L}\p{M}]*/gu, (word, index) => word.length <= 2 ? word : index === 0 ? word[0] + word.slice(1).toLocaleLowerCase(locale) : word.toLocaleLowerCase(locale))
  : title;

async function collectPages<T>(fetchPage: (pageIndex: number) => Promise<PagedList<T>>, signal: AbortSignal) {
  const first = await fetchPage(1);
  const items = [...first.items];
  for (let index = 2; index <= first.totalPages; index += 1) {
    signal.throwIfAborted();
    items.push(...(await fetchPage(index)).items);
  }
  return items;
}

function ReportCourses({ cohorts, reviewReady }: { cohorts: CourseCohort[]; reviewReady: boolean }) {
  const locale = useUiLanguage();
  const [search, setSearch] = useState('');
  const [onlySupport, setOnlySupport] = useState(false);
  const [page, setPage] = useState(1);
  const query = search.trim().toLocaleLowerCase(locale);
  const matching = cohorts.filter((cohort) =>
    [cohort.courseTitle, cohort.courseCode].some((value) => value.toLocaleLowerCase(locale).includes(query)) &&
    (!reviewReady || !onlySupport || cohort.learners.some((learner) => LEARNER_STATE[learner.state].filter === 'SUPPORT')),
  );
  const totalPages = Math.max(1, Math.ceil(matching.length / COURSES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * COURSES_PER_PAGE;

  return (
    <section className="manager-cycle__panel" aria-labelledby="cycle-courses">
      <header><h2 id="cycle-courses"><BookOpen size={19} aria-hidden="true" />{translateUi('Tiến độ theo khóa học')}</h2></header>
      {cohorts.length === 0 ? (
        <p className="manager-cycle__note">{translateUi('Chưa có dữ liệu học tập của phòng ban.')}</p>
      ) : (
        <>
          <div className="manager-cycle__toolbar">
            <label><Search size={16} aria-hidden="true" /><input type="search" value={search}
              aria-label={translateUi('Tìm theo tên hoặc mã khóa học')}
              placeholder={translateUi('Tìm theo tên hoặc mã khóa học')}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
            {reviewReady && (
              <button type="button" aria-pressed={onlySupport}
                onClick={() => { setOnlySupport(!onlySupport); setPage(1); }}>
                {translateUi('Cần hỗ trợ')}
              </button>
            )}
          </div>
          {matching.length === 0 ? (
            <p className="manager-cycle__note" role="status">{translateUi('Không có khóa học phù hợp với bộ lọc.')}</p>
          ) : (
            <>
              <div className="manager-cycle__table">
                <table role="table" aria-labelledby="cycle-courses">
                  <thead role="rowgroup">
                    <tr role="row">
                      <th scope="col" role="columnheader">{translateUi('Khóa học')}</th>
                      <th scope="col" role="columnheader">{translateUi('Học viên')}</th>
                      <th scope="col" role="columnheader">{translateUi('Hoàn thành')}</th>
                      <th scope="col" role="columnheader">{translateUi('Chờ đánh giá / nộp lại')}</th>
                      <th scope="col" role="columnheader">{translateUi('Cần hỗ trợ')}</th>
                      <th scope="col" role="columnheader">{translateUi('Tiến độ trung bình')}</th>
                    </tr>
                  </thead>
                  <tbody role="rowgroup">
                    {matching.slice(offset, offset + COURSES_PER_PAGE).map(({ courseId, courseCode, courseTitle, learners }) => {
                      const count = (filter: string) => learners.filter((learner) => LEARNER_STATE[learner.state].filter === filter).length;
                      const support = reviewReady ? count('SUPPORT') : null;
                      const progress = Math.round(learners.reduce((sum, learner) => sum + learner.progressPercent, 0) / learners.length);
                      return (
                        <tr key={courseId} role="row">
                          <th scope="row" role="rowheader"><small>{courseCode}</small><span>{courseName(courseTitle, locale)}</span></th>
                          <td role="cell"><small aria-hidden="true">{translateUi('Học viên')}</small>{learners.length}</td>
                          <td role="cell"><small aria-hidden="true">{translateUi('Hoàn thành')}</small>{count('APPROVED')}</td>
                          <td role="cell"><small aria-hidden="true">{translateUi('Chờ đánh giá / nộp lại')}</small>{reviewReady ? count('REVIEW') : '—'}</td>
                          <td role="cell"><small aria-hidden="true">{translateUi('Cần hỗ trợ')}</small><span className={support ? 'manager-cycle__badge warning' : undefined}>{support ?? '—'}</span></td>
                          <td role="cell" className="manager-cycle__progress"><small aria-hidden="true">{translateUi('Tiến độ trung bình')}</small>
                            <strong>{progress}%</strong>
                            <Bar value={progress} label={`${translateUi('Tiến độ trung bình')} · ${courseTitle}`} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <footer className="manager-cycle__pagination">
                <span role="status">{offset + 1}–{Math.min(offset + COURSES_PER_PAGE, matching.length)} / {matching.length} {translateUi('khóa học')}</span>
                {totalPages > 1 && (
                  <nav aria-label={translateUi('Phân trang khóa học')}>
                    <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>{translateUi('Trang trước')}</button>
                    <button type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>{translateUi('Trang sau')}</button>
                  </nav>
                )}
              </footer>
            </>
          )}
        </>
      )}
    </section>
  );
}

export function ManagerCycleReportPage() {
  const locale = useUiLanguage();
  const [expandedTimeline, setExpandedTimeline] = useState<string>();
  const { can } = usePermission();
  const canReview = can(PERMISSIONS.DASHBOARD_DEPARTMENT_READ);
  const canReadAssignments = can(PERMISSIONS.COURSE_ASSIGNMENT_READ);
  const { department, isLoading: deptLoading, isError: deptError, refetch: refetchDept } = useManagedDepartment();
  const departmentId = department?.id;
  const ready = Boolean(departmentId);
  const assignments = useQuery({
    queryKey: ['assignments', 'cycle-report', departmentId],
    enabled: canReadAssignments && ready,
    queryFn: ({ signal }) => collectPages(async (pageIndex) =>
      (await assignmentService.getList({ departmentId, includeIndependentLearning: true, pageIndex, pageSize: API_PAGE_SIZE })).data.data!, signal),
  });
  const reviews = usePulseFinalReviews({ enabled: canReview && ready, departmentId, includeReviewed: true });

  if (deptLoading) return <ManagerPage><PageLoading label="Đang tải báo cáo chu kỳ" /></ManagerPage>;
  if (deptError) return <ManagerPage><LoadError message="Không tải được phòng ban." onRetry={refetchDept} /></ManagerPage>;
  if (!department) return <ManagerPage><ManagerPageHeader title="Báo cáo chu kỳ" /><NoDepartment /></ManagerPage>;

  const rows = canReadAssignments ? assignments.data ?? [] : [];
  const queue = canReview ? reviews.data?.items ?? [] : [];
  const cohorts = groupByCourse(rows, queue);
  const learners = cohorts.flatMap((cohort) => cohort.learners);
  const completed = learners.filter((learner) => learner.state === 'APPROVED');
  const unfinished = learners.filter((learner) => learner.state !== 'APPROVED');
  const assignmentsReady = canReadAssignments && assignments.isSuccess;
  const reviewReady = canReview && reviews.isSuccess;
  const avgProgress = unfinished.length
    ? Math.round(unfinished.reduce((sum, learner) => sum + learner.progressPercent, 0) / unfinished.length)
    : null;
  const firstAssignmentDate = rows.map((row) => row.assignedAt).filter(Boolean).sort()[0];
  const events = [
    ...completed.flatMap((learner) => learner.completedAt ? [{
      at: learner.completedAt, title: learner.courseTitle, employee: learner.employeeName,
      status: 'Đã hoàn thành', tone: 'success', detail: '',
    }] : []),
    ...queue.flatMap((item) => item.attempts.flatMap((attempt) => attempt.reviewedAt && attempt.decision ? [{
      at: attempt.reviewedAt, title: item.courseTitle, employee: item.employeeName,
      status: attempt.decision === 'PASSED' ? 'Đạt' : 'Chưa đạt',
      tone: attempt.decision === 'PASSED' ? 'success' : 'warning',
      detail: [
        translateUi(item.kind === 'FINAL' ? 'Bài cuối khóa' : 'Đánh giá trước khi học'),
        `${translateUi('Lần nộp')} ${attempt.attemptNo}`,
        attempt.reviewerName,
      ].filter(Boolean).join(' · '),
    }] : [])),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 8);

  const timelineOpen = expandedTimeline === department.id;

  return (
    <ManagerPage testId="manager-cycle-report">
      <ManagerPageHeader scope={department.name} title="Báo cáo chu kỳ" actions={
        can(PERMISSIONS.LEARNING_PROGRESS_READ) && <PuLink to={MANAGER_PATHS.training} kind="outline">{translateUi('Theo dõi đào tạo')} →</PuLink>
      } />
      <div className="manager-cycle">
        <KpiRow label="Tổng quan phòng ban" items={[
          { label: 'Học viên', icon: <GraduationCap size={16} />, value: assignmentsReady ? new Set(learners.map((learner) => learner.employeeId)).size : '—' },
          { label: 'Lượt nộp bài', icon: <ClipboardList size={16} />, value: reviewReady ? queue.reduce((sum, item) => sum + item.attempts.length, 0) : '—' },
          { label: 'Lượt hoàn thành', icon: <BookOpen size={16} />, value: assignmentsReady ? completed.length : '—' },
          { label: 'Tiến độ đang học', status: translateUi('Trung bình các lượt chưa hoàn thành'), icon: <TrendingUp size={16} />, value: assignmentsReady && avgProgress != null ? `${avgProgress}%` : '—' },
        ]} />

        <div className="manager-cycle__layout">
          {canReadAssignments && assignments.isLoading ? (
            <section className="manager-cycle__panel" aria-busy="true">
              <header><h2>{translateUi('Tiến độ theo khóa học')}</h2></header>
              <div className="manager-cycle__skeleton" role="status">
                <span className="sr-only">{translateUi('Đang tải tiến độ học tập…')}</span>
                {[1, 2, 3].map((row) => <div key={row} aria-hidden="true"><i /><i /><i /></div>)}
              </div>
            </section>
          ) : canReadAssignments && assignments.isError ? (
            <LoadError message="Không tải được tiến độ học tập." onRetry={assignments.refetch} />
          ) : assignmentsReady ? (
            <ReportCourses key={departmentId} cohorts={cohorts} reviewReady={reviewReady} />
          ) : (
            <p className="manager-cycle__note">{translateUi('Tài khoản chưa có quyền xem tiến độ học tập.')}</p>
          )}

          <section className="manager-cycle__panel" aria-labelledby="cycle-timeline">
            <header><h2 id="cycle-timeline"><History size={19} aria-hidden="true" />{translateUi('Hoạt động gần đây')}</h2>
              {canReview && <PuLink to={MANAGER_PATHS.finalReviews} small kind="outline">{translateUi('Kết quả bài làm')} →</PuLink>}
            </header>
            {canReview && reviews.isError && <LoadError message="Không tải được kết quả bài làm." onRetry={reviews.refetch} />}
            {canReview && reviews.isLoading && <p className="manager-cycle__note" role="status">{translateUi('Đang tải kết quả bài làm…')}</p>}
            {events.length > 0 ? (
              <>
              <ol id="cycle-events" className="manager-cycle__events">
                {events.slice(0, timelineOpen ? events.length : TIMELINE_PREVIEW).map((event, index) => (
                  <li key={`${event.at}-${index}`}>
                    <div><time dateTime={event.at}>{formatDate(event.at)}</time><span className={`manager-cycle__badge ${event.tone}`}>{translateUi(event.status)}</span></div>
                    <strong>{courseName(event.title, locale)}</strong>
                    <small>{event.employee}</small>
                    {event.detail && <details><summary>{translateUi('Chi tiết')}</summary><small>{event.detail}</small></details>}
                  </li>
                ))}
              </ol>
              {events.length > TIMELINE_PREVIEW && (
                <button type="button" className="manager-cycle__more" aria-expanded={timelineOpen} aria-controls="cycle-events"
                  onClick={() => setExpandedTimeline(timelineOpen ? undefined : department.id)}>
                  {translateUi(timelineOpen ? 'Thu gọn' : 'Xem thêm')} <ChevronDown size={15} aria-hidden="true" />
                </button>
              )}
              </>
            ) : (!canReview || reviewReady) && (!canReadAssignments || assignmentsReady) && (
              <p className="manager-cycle__note">{translateUi('Chưa ghi nhận mốc học tập hoặc đánh giá.')}</p>
            )}
          </section>
        </div>

        <section className="manager-cycle__panel manager-cycle__resources" aria-label={translateUi('Năng lực đội ngũ')}>
          <div>
            <details>
              <summary>{translateUi('Khi nào mức năng lực được cập nhật?')}</summary>
              <p>{translateUi('Mức năng lực đã xác nhận cập nhật khi bài cuối khóa được duyệt.')}</p>
            </details>
            {can(PERMISSIONS.SKILL_GAP_READ) && <PuLink to={MANAGER_PATHS.capability} kind="outline" small>{translateUi('Xem năng lực đội ngũ')} →</PuLink>}
            {firstAssignmentDate && <p>{translateUi('Ghi nhận phân công từ')} {formatDate(firstAssignmentDate)}</p>}
          </div>
        </section>
      </div>
    </ManagerPage>
  );
}
