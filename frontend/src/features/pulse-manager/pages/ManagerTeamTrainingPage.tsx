import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, GraduationCap, Search } from 'lucide-react';
import { PageLoading } from '@/components/shared/LoadingState';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { usePulseFinalReviews } from '@/hooks/use-pulse';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';
import { assignmentService } from '@/services/assignment.service';
import { Bar, Empty, LoadError, Pill, PuLink } from '@/features/pulse-employee/components/ui';
import { Initials, ManagerPage, ManagerPageHeader, NoDepartment } from '../components/ManagerUi';
import { LEARNER_STATE, groupByCourse, type CourseCohort, type TrainingFilter } from '../lib/training';
import { MANAGER_PATHS } from '../lib/paths';
import './manager-team-training.css';

const COURSES_PER_PAGE = 6;
const ASSIGNMENTS_PAGE_SIZE = 100;
const FILTERS: { key: TrainingFilter; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'SUPPORT', label: 'Cần hỗ trợ' },
  { key: 'LEARNING', label: 'Đang học / chuẩn bị' },
  { key: 'REVIEW', label: 'Chờ đánh giá / nộp lại' },
  { key: 'APPROVED', label: 'Đã hoàn thành' },
];
const normalizeSearch = (value: string) => value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd');

function CourseGroup({ cohort, canOpenMember, expanded, onToggle }: {
  cohort: CourseCohort; canOpenMember: boolean; expanded: boolean; onToggle: () => void;
}) {
  const distribution = FILTERS.filter(({ key }) => key !== 'ALL').map(({ key, label }) => ({
    key, label, count: cohort.learners.filter(({ state }) => LEARNER_STATE[state].filter === key).length,
  })).filter(({ count }) => count > 0);
  return (
    <details className="manager-training__course" open={expanded}>
      <summary onClick={(event) => { event.preventDefault(); onToggle(); }}>
        <GraduationCap size={19} className="manager-training__course-icon" aria-hidden="true" />
        <div>
          <h3>{cohort.courseTitle}</h3>
          <small>{cohort.courseCode}</small>
        </div>
        <span className="manager-training__distribution">
          <span className="manager-training__segments" aria-hidden="true">
            {distribution.map(({ key, count }) => <i key={key} data-filter={key} style={{ flexGrow: count }} />)}
          </span>
          <span className="manager-training__segment-labels">
            {distribution.map(({ key, label, count }) => <span key={key} data-filter={key}>
              <span className="sr-only">{translateUi(label)} </span>{count}
            </span>)}
          </span>
        </span>
        <span className="manager-training__count">{cohort.learners.length} {translateUi('lượt học')}</span>
        <ChevronDown size={18} className="manager-training__chevron" aria-hidden="true" />
      </summary>
      {expanded && (
        <ul className="manager-training__learners">
          {cohort.learners.map((learner) => {
            const state = LEARNER_STATE[learner.state];
            const independent = learner.source === 'SELF_ENROLLED';
            const path = independent ? MANAGER_PATHS.member(learner.employeeId) : MANAGER_PATHS.trainingDetail(learner.id);
            const progress = Number.isFinite(learner.progressPercent) ? Math.round(learner.progressPercent) : null;
            return (
              <li key={learner.id}>
                <div className="manager-training__person">
                  <Initials name={learner.employeeName} />
                  <div>
                    {(!independent || canOpenMember) ? (
                      <Link to={path}>
                        {learner.employeeName} <ArrowRight size={13} aria-hidden="true" />
                      </Link>
                    ) : <strong>{learner.employeeName}</strong>}
                    <small>{[learner.positionName, independent ? translateUi('Tự học') : null].filter(Boolean).join(' · ')}</small>
                  </div>
                </div>
                <div className="manager-training__progress">
                  <span><strong>{progress == null ? '—' : `${progress}%`}</strong></span>
                  {progress != null && <Bar value={progress} label={`${translateUi('Tiến độ bài học')} · ${learner.employeeName}`} />}
                </div>
                <div className="manager-training__status">
                  <Pill tone={state.tone}>{translateUi(state.label)}</Pill>
                  {learner.dueDate && (
                    <small>{translateUi('Hạn học')} <time dateTime={learner.dueDate}>{formatDate(learner.dueDate)}</time></small>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </details>
  );
}

function TrainingList({ cohorts, reviewUnavailable, canOpenMember }: {
  cohorts: CourseCohort[];
  reviewUnavailable: boolean;
  canOpenMember: boolean;
}) {
  const [filter, setFilter] = useState<TrainingFilter>('ALL');
  const [search, setSearch] = useState('');
  const [openCourse, setOpenCourse] = useState<string>();
  const [page, setPage] = useState(1);
  const query = normalizeSearch(search.trim());
  const counts: Record<TrainingFilter, number> = { ALL: 0, LEARNING: 0, REVIEW: 0, APPROVED: 0, SUPPORT: 0 };
  const matches = cohorts.flatMap((cohort) => {
    const matchCourse = normalizeSearch(`${cohort.courseTitle} ${cohort.courseCode}`).includes(query);
    const learners = cohort.learners.filter((learner) => {
      if (!matchCourse && !normalizeSearch(`${learner.employeeName} ${learner.employeeCode}`).includes(query)) return false;
      const status = LEARNER_STATE[learner.state].filter;
      counts.ALL += 1;
      counts[status] += 1;
      return filter === 'ALL' || filter === status;
    });
    return learners.length ? [{ ...cohort, learners }] : [];
  });
  const lastPage = Math.max(1, Math.ceil(matches.length / COURSES_PER_PAGE));
  const currentPage = Math.min(page, lastPage);
  const start = (currentPage - 1) * COURSES_PER_PAGE;

  return (
    <section className="manager-training" aria-labelledby="manager-training-title">
      <header className="manager-training__header">
        <h2 id="manager-training-title">{translateUi('Tiến độ theo khóa học')}</h2>
        <label className="manager-training__search">
          <Search size={17} aria-hidden="true" />
          <input type="search" value={search}
            aria-label={translateUi('Tìm học viên hoặc khóa học')}
            placeholder={translateUi('Tìm học viên hoặc khóa học')}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </label>
      </header>
      <div className="manager-training__filters" role="group" aria-label={translateUi('Lọc theo trạng thái học')}>
        {FILTERS.map(({ key, label }) => (
          <button key={key} type="button" data-filter={key} aria-pressed={filter === key}
            onClick={() => { setFilter(key); setPage(1); }}>
            {translateUi(label)} <span>{reviewUnavailable && key === 'REVIEW' ? '—' : counts[key]}</span>
          </button>
        ))}
      </div>
      {reviewUnavailable && <p className="manager-training__notice">{translateUi('Các trạng thái dưới đây dựa trên dữ liệu học tập hiện có.')}</p>}
      {matches.length === 0 ? (
        <div className="manager-training__empty" role="status">
          <p>{translateUi(reviewUnavailable && filter === 'REVIEW'
            ? 'Chưa có dữ liệu đánh giá để lọc.'
            : 'Không có lượt học phù hợp với bộ lọc.')}</p>
          <button type="button" onClick={() => { setSearch(''); setFilter('ALL'); setPage(1); }}>{translateUi('Xóa bộ lọc')}</button>
        </div>
      ) : (
        <>
          {matches.slice(start, start + COURSES_PER_PAGE).map((cohort) => (
            <CourseGroup key={cohort.courseId} cohort={cohort} canOpenMember={canOpenMember}
              expanded={openCourse === cohort.courseId} onToggle={() => setOpenCourse(openCourse === cohort.courseId ? undefined : cohort.courseId)} />
          ))}
          <footer className="manager-training__footer">
            <span role="status">{start + 1}–{Math.min(start + COURSES_PER_PAGE, matches.length)} / {matches.length} {translateUi('khóa học')}</span>
            {lastPage > 1 && <nav aria-label={translateUi('Phân trang khóa học')}>
              <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>{translateUi('Trang trước')}</button>
              <span>{currentPage} / {lastPage}</span>
              <button type="button" disabled={currentPage === lastPage} onClick={() => setPage(currentPage + 1)}>{translateUi('Trang sau')}</button>
            </nav>}
          </footer>
        </>
      )}
    </section>
  );
}

export function ManagerTeamTrainingPage() {
  useUiLanguage();
  const { can } = usePermission();
  const canReview = can(PERMISSIONS.DASHBOARD_DEPARTMENT_READ);
  const canReadAssignments = can(PERMISSIONS.COURSE_ASSIGNMENT_READ);
  const { department, isLoading: deptLoading, isError: deptError, refetch: refetchDept } = useManagedDepartment();
  const departmentId = department?.id;
  const assignments = useQuery({
    queryKey: ['assignments', 'team-training', departmentId],
    enabled: canReadAssignments && Boolean(departmentId),
    queryFn: async ({ signal }) => {
      const getPage = async (pageIndex: number) => (await assignmentService.getList({
        departmentId, includeIndependentLearning: true, pageIndex, pageSize: ASSIGNMENTS_PAGE_SIZE,
      })).data.data!;
      const first = await getPage(1);
      const rows = [...first.items];
      for (let index = 2; index <= first.totalPages; index += 1) {
        signal.throwIfAborted();
        rows.push(...(await getPage(index)).items);
      }
      return rows;
    },
  });
  const reviews = usePulseFinalReviews({ enabled: canReview && Boolean(departmentId), departmentId });

  if (deptLoading || assignments.isLoading) {
    return <ManagerPage><PageLoading label="Đang tải tiến độ đào tạo" /></ManagerPage>;
  }
  if (deptError || assignments.isError) {
    return <ManagerPage><LoadError message={translateUi('Không tải được tiến độ đào tạo của phòng ban.')}
      onRetry={deptError ? refetchDept : assignments.refetch} /></ManagerPage>;
  }
  if (!department) {
    return <ManagerPage><ManagerPageHeader title="Đào tạo đội ngũ" /><NoDepartment /></ManagerPage>;
  }

  const cohorts = groupByCourse(assignments.data ?? [], canReview ? reviews.data?.items ?? [] : []);
  return (
    <ManagerPage testId="manager-team-training">
      <ManagerPageHeader scope={department.name} title="Đào tạo đội ngũ"
        actions={canReview && <PuLink to={MANAGER_PATHS.finalReviews} kind="outline">{translateUi('Xem kết quả bài làm')} <ArrowRight size={15} aria-hidden="true" /></PuLink>} />
      {!canReadAssignments ? (
        <p>{translateUi('Tài khoản của bạn chưa có quyền xem phân công khóa học của phòng ban.')}</p>
      ) : cohorts.length === 0 ? (
        <Empty icon={<GraduationCap size={24} />} title="Chưa có lượt học trong phòng ban.">
          {translateUi('Khóa được giao và khóa tự học sẽ xuất hiện tại đây.')}
        </Empty>
      ) : (
        <>
          {canReview && reviews.isError && <LoadError message={translateUi('Chưa tải được kết quả bài cuối khóa. Trạng thái học có thể chưa đầy đủ.')} onRetry={reviews.refetch} />}
          {canReview && reviews.isLoading && <p role="status">{translateUi('Đang tải kết quả bài cuối khóa…')}</p>}
          <TrainingList key={department.id} cohorts={cohorts} reviewUnavailable={!canReview || !reviews.data}
            canOpenMember={can(PERMISSIONS.EMPLOYEE_READ)} />
        </>
      )}
    </ManagerPage>
  );
}
