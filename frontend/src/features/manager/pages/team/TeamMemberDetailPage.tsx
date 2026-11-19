import { useEffect, useState } from 'react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEmployee } from '@/hooks/use-employees';
import { useAssignments } from '@/hooks/use-assignments';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { DevelopmentChart } from '@/features/pulse-manager/components/DevelopmentChart';
import { PageLoading } from '@/components/shared/LoadingState';
import { ASSIGNMENT_STATUS_LABELS } from '@/features/assignments/assignment-labels';
import { Initials, ManagerPage } from '@/features/pulse-manager/components/ManagerUi';
import { MANAGER_PATHS } from '@/features/pulse-manager/lib/paths';
import './team-member-detail.css';

export function TeamMemberDetailPage() {
  useUiLanguage();
  const { can } = usePermission();
  const { id } = useParams<{ id: string }>();
  const employee = useEmployee(id || '');

  if (employee.isLoading) return <ManagerPage><PageLoading label="Đang tải thông tin thành viên" variant="detail" /></ManagerPage>;
  if (employee.isError || !employee.data) {
    return <ManagerPage><div role="alert">{translateUi('Không tải được thành viên trong phạm vi quản lý.')} <Link to={MANAGER_PATHS.members}>{translateUi('Quay lại danh sách')}</Link></div></ManagerPage>;
  }

  const person = employee.data;
  const status = person.status === 'ACTIVE' ? 'Đang làm việc'
    : person.status === 'INACTIVE' ? 'Ngừng hoạt động'
    : person.status === 'TRANSFERRED' ? 'Đã chuyển công tác'
    : person.status === 'ARCHIVED' ? 'Đã lưu trữ' : 'Chưa xác định';

  return (
    <ManagerPage>
      <div className="member-insight">
        <header className="member-insight-profile">
          <Link to={MANAGER_PATHS.members} className="member-insight-back"><ArrowLeft size={16} aria-hidden="true" />{translateUi('Danh sách nhân viên')}</Link>
          <div className="member-insight-identity">
            <Initials name={person.fullName} />
            <div>
              {person.departmentName && <p><Building2 size={15} aria-hidden="true" />{person.departmentName}</p>}
              <h1>{person.fullName}</h1>
              <p>{person.jobPositionName || person.positionName}</p>
            </div>
          </div>
          <dl className="member-insight-facts">
            <div><dt>{translateUi('Mã nhân viên')}</dt><dd>{person.employeeCode}</dd></div>
            <div><dt>Email</dt><dd>{person.workEmail || '—'}</dd></div>
            <div><dt>{translateUi('Trạng thái')}</dt><dd>{translateUi(status)}</dd></div>
          </dl>
        </header>

        <DevelopmentChart key={person.id} scope={{ employeeId: person.id }} />
        {can(PERMISSIONS.SKILL_GAP_READ) && <Link
          to={`${MANAGER_PATHS.capability}?employeeId=${encodeURIComponent(person.id)}`} className="manager-heading-back">
          {translateUi('Xem chi tiết từng năng lực')}
        </Link>}
        {can(PERMISSIONS.COURSE_ASSIGNMENT_READ) && (
          <MemberLearning key={person.id} employeeId={person.id} />
        )}
      </div>
    </ManagerPage>
  );
}

const LEARNING_PAGE_SIZE = 5;

function MemberLearning({ employeeId }: { employeeId: string }) {
  const locale = useUiLanguage();
  const percent = new Intl.NumberFormat(locale, { style: 'percent' });
  const number = new Intl.NumberFormat(locale);
  const [page, setPage] = useState(1);
  const assignments = useAssignments({ employeeId, includeIndependentLearning: true, pageIndex: page, pageSize: LEARNING_PAGE_SIZE });
  const courses = assignments.data?.items ?? [];
  const total = assignments.data?.totalItems ?? 0;
  const pageCount = Math.max(1, assignments.data?.totalPages ?? 0);
  const displayedPage = assignments.data?.pageIndex ?? page;
  const changingPage = assignments.isPlaceholderData;
  const outOfRange = assignments.isSuccess && !changingPage && page > pageCount;
  const visiblePages = [...new Set([1, page - 1, page, page + 1, pageCount])]
    .filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b);

  useEffect(() => {
    if (outOfRange) setPage(pageCount);
  }, [outOfRange, pageCount]);

  return (
    <section className="member-insight-panel member-insight-learning" aria-labelledby="member-learning-heading">
      <h2 id="member-learning-heading"><BookOpen size={20} aria-hidden="true" />{translateUi('Tiến độ học tập')}</h2>
      {assignments.isLoading || outOfRange ? <p role="status">{translateUi('Đang tải…')}</p>
        : assignments.isError ? <p role="alert">{translateUi('Không tải được tiến độ học tập.')}</p>
        : courses.length === 0 ? <p>{translateUi('Chưa có lượt học.')}</p>
        : <ul key={displayedPage} role="list" aria-busy={changingPage}>
          {courses.map((item) => (
            <li key={item.id} data-status={item.status}>
              <div className="member-learning-course">
                <span className="member-learning-code">{item.courseCode}</span>
                <strong>{item.courseTitle}</strong>
                {item.status !== 'ACTIVE' && (
                  <span className="member-learning-status">{translateUi(ASSIGNMENT_STATUS_LABELS[item.status] ?? item.status)}</span>
                )}
              </div>
              <div className="member-learning-progress">
                <progress max={100} value={item.progressPercent} aria-label={item.courseTitle} />
                <strong>{percent.format(item.progressPercent / 100)}</strong>
              </div>
            </li>
          ))}
        </ul>}
      {pageCount > 1 && !assignments.isError && (
        <footer className="member-learning-footer">
          <span role="status">{number.format((displayedPage - 1) * LEARNING_PAGE_SIZE + 1)}–{number.format((displayedPage - 1) * LEARNING_PAGE_SIZE + courses.length)} / {number.format(total)}</span>
          <nav aria-label={translateUi('Phân trang khóa học')}>
            <button type="button" aria-label={translateUi('Trang trước')} disabled={changingPage || page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            {visiblePages.map((value, index) => (
              <span key={value}>
                {index > 0 && value - visiblePages[index - 1] > 1 && <span aria-hidden="true">…</span>}
                <button type="button" disabled={changingPage} aria-current={value === page ? 'page' : undefined}
                  aria-label={`${translateUi('Trang')} ${number.format(value)}`} onClick={() => setPage(value)}>
                  {number.format(value)}
                </button>
              </span>
            ))}
            <button type="button" aria-label={translateUi('Trang sau')} disabled={changingPage || page >= pageCount} onClick={() => setPage(page + 1)}>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </nav>
        </footer>
      )}
    </section>
  );
}
