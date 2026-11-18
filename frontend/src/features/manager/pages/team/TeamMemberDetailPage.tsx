import { useState } from 'react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
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

function MemberLearning({ employeeId }: { employeeId: string }) {
  const locale = useUiLanguage();
  const percent = new Intl.NumberFormat(locale, { style: 'percent' });
  const [page, setPage] = useState(1);
  const assignments = useAssignments({ employeeId, includeIndependentLearning: true, pageIndex: page, pageSize: 10 });
  const courses = assignments.data?.items ?? [];
  const pageCount = assignments.data?.totalPages ?? 0;

  return (
    <section className="member-insight-panel member-insight-learning" aria-labelledby="member-learning-heading">
      <h2 id="member-learning-heading">{translateUi('Tiến độ học tập')}</h2>
      {assignments.isLoading ? <p role="status">{translateUi('Đang tải…')}</p>
        : assignments.isError ? <p role="alert">{translateUi('Không tải được tiến độ học tập.')}</p>
        : courses.length === 0 ? <p>{translateUi('Chưa có lượt học.')}</p>
        : <ul role="list" aria-busy={assignments.isPlaceholderData}>
          {courses.map((item) => {
            const label = ASSIGNMENT_STATUS_LABELS[item.status] ?? item.status;
            return (
              <li key={item.id}>
                <div>
                  <strong>{item.courseCode} · {item.courseTitle}</strong>
                  <small>{translateUi(label)}{item.source === 'SELF_ENROLLED' && ` · ${translateUi('Tự học')}`}</small>
                </div>
                <div>
                  <strong>{percent.format(item.progressPercent / 100)}</strong>
                  <progress max={100} value={item.progressPercent} aria-label={item.courseTitle} />
                </div>
              </li>
            );
          })}
        </ul>}
      {(pageCount > 1 || page > 1) && <nav aria-label={translateUi('Phân trang khóa học')}>
        <button type="button" className="manager-heading-back" disabled={page === 1} onClick={() => setPage(page - 1)}>{translateUi('Trang trước')}</button>
        <button type="button" className="manager-heading-back" disabled={page >= pageCount || assignments.isPlaceholderData} onClick={() => setPage(page + 1)}>{translateUi('Trang sau')}</button>
      </nav>}
    </section>
  );
}
