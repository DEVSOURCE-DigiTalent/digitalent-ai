import { Link } from 'react-router-dom';
import journeyArt from '@/assets/pulse/learning-journey-abstract.webp';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { usePulseFinalReviews } from '@/hooks/use-pulse';
import { useWorkforce } from '@/hooks/use-workforce';
import { BLOCKER_LABELS, type WorkforceRow } from '@/services/workforce.service';
import type { PulseReviewStatus } from '@/services/pulse.service';
import { LoadError, Mini, PageHead, PageSkeleton, Pill, PuLink } from '@/features/pulse-employee/components/ui';
import { btn } from '@/features/pulse-employee/lib/button';
import { Initials, KpiRow, ManagerPage, NoDepartment } from '../components/ManagerUi';
import { MANAGER_PATHS } from '../lib/paths';

const QUEUE_PILL: Record<PulseReviewStatus, { label: string; tone: 'gray' | 'coral' | 'green' }> = {
  PENDING: { label: 'Cần quyết định', tone: 'gray' },
  RETRY_WAIT: { label: 'Chờ nộp lại', tone: 'green' },
  RETRY_READY: { label: 'Đang mở lần cuối', tone: 'green' },
  DEADLINE_MISSED: { label: 'Quá hạn nộp lại', tone: 'coral' },
  FLAGGED: { label: 'Cần hỗ trợ', tone: 'coral' },
};

/** Trạng thái đo của một người: chỉ "Đã đo" khi có bản phân tích năng lực, không suy ra khoảng trống khi chưa đo. */
function measureState(row: WorkforceRow): { label: string; tone: 'green' | 'gray' | 'coral'; detail: string } {
  if (row.hasSnapshot) {
    const gaps = row.gapCount ?? 0;
    return {
      label: gaps === 0 ? 'Đạt mục tiêu' : 'Đã đo',
      tone: 'green',
      detail: gaps === 0 ? 'Không còn khoảng trống so với vị trí' : `${gaps} khoảng trống đã xác nhận`,
    };
  }
  return {
    label: 'Đang chờ đo',
    tone: 'gray',
    detail: row.blocker ? BLOCKER_LABELS[row.blocker] ?? 'Chưa có bản đo năng lực' : 'Chưa có bản đo năng lực',
  };
}

/**
 * MG-01 · Tổng quan của quản lý (mock `#/manager`): hero ra quyết định, KPI hàng chờ / cờ hỗ trợ / quy mô phòng ban,
 * ba việc cụ thể, đội ngũ và hàng chờ bài cuối khóa — chỉ trong phòng ban quản lý phụ trách.
 */
export function ManagerOverviewPage() {
  const { can } = usePermission();
  const canReview = can(PERMISSIONS.TASK_EVALUATE);
  const { department, isLoading: deptLoading, isError: deptError, refetch: refetchDept } = useManagedDepartment();
  const team = useWorkforce({ departmentId: department?.id, pageIndex: 1, pageSize: 100 }, Boolean(department));
  const reviews = usePulseFinalReviews(canReview && Boolean(department));

  if (deptLoading) {
    return <ManagerPage><PageSkeleton blocks={[110, 320, 110, 260]} /></ManagerPage>;
  }
  if (deptError) {
    return <ManagerPage><LoadError message="Không tải được phòng ban bạn phụ trách." onRetry={() => refetchDept()} /></ManagerPage>;
  }
  if (!department) {
    return (
      <ManagerPage>
        <PageHead eyebrow="Quản lý đội" title="Quyết định việc cần ưu tiên." />
        <NoDepartment />
      </ManagerPage>
    );
  }

  // Lọc theo phòng ban ở cả phía giao diện: hàng chờ chỉ hiển thị bài của phòng ban này.
  const queue = (reviews.data?.items ?? []).filter((item) => !item.departmentName || item.departmentName === department.name);
  const people = (team.data?.items ?? []).filter((row) => !row.departmentId || row.departmentId === department.id);
  const reviewsReady = canReview && reviews.isSuccess;
  const pending = queue.filter((item) => item.status === 'PENDING').length;
  const flagged = queue.filter((item) => item.status === 'FLAGGED' || item.status === 'DEADLINE_MISSED').length;
  // Cùng cách đếm với số nhân sự của phòng ban: chỉ người đang làm việc.
  const headcount = team.isSuccess ? people.filter((row) => row.status === 'ACTIVE').length : department.headcount;

  return (
    <ManagerPage testId="manager-overview">
      <PageHead
        eyebrow={`Quản lý đội / ${department.name}`}
        title="Quyết định việc cần ưu tiên."
        description="Không gian làm việc chỉ hiển thị phòng ban của bạn, từ khoảng cách năng lực đến minh chứng khóa học."
      />

      <section className="pm-hero" aria-label="Việc của quản lý hôm nay">
        <div>
          <span className="pm-hero-eyebrow">Quản lý / {department.name}</span>
          <h2>Đọc minh chứng. <em>Ghi quyết định rõ ràng.</em></h2>
          <p>Chấm bài cuối mỗi khóa, theo dõi lượt nộp thứ hai có giới hạn thời gian và so với mục tiêu vị trí.</p>
          <div className="pu-row">
            {canReview && <Link to={MANAGER_PATHS.finalReviews} className={btn('light')}>Mở hàng chờ bài cuối khóa</Link>}
            <Link to={MANAGER_PATHS.capability} className={btn('on-dark')}>Xem năng lực đội ngũ</Link>
          </div>
        </div>
        <img src={journeyArt} alt="" />
      </section>

      <KpiRow
        label="Tình hình phòng ban"
        items={[
          { value: reviewsReady ? pending : '—', label: 'Bài chờ quyết định', muted: !reviewsReady },
          { value: reviewsReady ? flagged : '—', label: 'Cờ hỗ trợ sau hai lần chưa đạt', muted: !reviewsReady },
          { value: headcount ?? '—', label: `Nhân viên đang làm việc · ${department.name}`, muted: headcount == null },
        ]}
      />

      <Mini>Đánh giá đầu tiên</Mini>
      <h2 className="pm-section-title">Việc cụ thể, bước tiếp theo cụ thể.</h2>
      <div className="pm-cards">
        <Link className="pm-card" to={canReview ? MANAGER_PATHS.finalReviews : MANAGER_PATHS.training}>
          <b>01 / Chấm bài</b>
          <h3>Xem bài nộp của khóa tiếp theo</h3>
          <small>
            {!reviewsReady
              ? 'Hàng chờ chưa tải được; mở trang chấm bài để xem.'
              : pending > 0
                ? `${pending} bài đang chờ bạn quyết định.`
                : 'Hiện chưa có việc chờ xử lý.'}
          </small>
          <em>Mở tiêu chí ↗</em>
        </Link>
        <Link className="pm-card" to={MANAGER_PATHS.capability}>
          <b>02 / Năng lực</b>
          <h3>Mức hiện tại bên cạnh mục tiêu vị trí.</h3>
          <small>Chỉ nhân viên phòng {department.name} hiển thị ở đây.</small>
          <em>Xem khoảng cách năng lực của đội ↗</em>
        </Link>
        <Link className="pm-card" to={MANAGER_PATHS.training}>
          <b>03 / Hỗ trợ</b>
          <h3>Giải thích lý do cho bước tiếp theo.</h3>
          <small>Theo dõi tiến độ học và người cần hỗ trợ trước hạn.</small>
          <em>Theo dõi việc học ↗</em>
        </Link>
      </div>

      <div className="pm-split" style={{ marginTop: 16 }}>
        <section className="pm-panel" aria-labelledby="pm-team-title">
          <div className="pm-panel-head">
            <div>
              <Mini>Đội ngũ của bạn</Mini>
              <h2 id="pm-team-title">Năng lực và học tập trong một góc nhìn.</h2>
            </div>
            <PuLink to={MANAGER_PATHS.capability} kind="outline" small>Xem khoảng cách năng lực</PuLink>
          </div>
          {team.isLoading ? (
            <PageSkeleton blocks={[56, 56, 56]} />
          ) : team.isError ? (
            <LoadError message="Không tải được danh sách nhân viên trong phòng ban." onRetry={() => team.refetch()} />
          ) : people.length === 0 ? (
            <p className="pu-panel-desc">Phòng ban chưa có nhân viên.</p>
          ) : (
            <div className="pm-rows">
              {people.slice(0, 6).map((row) => {
                const state = measureState(row);
                return (
                  <Link key={row.id} className="pm-row" to={MANAGER_PATHS.member(row.id)}>
                    <Initials name={row.fullName} />
                    <div>
                      <strong>{row.fullName}{row.jobPositionName ? ` · ${row.jobPositionName}` : ''}</strong>
                      <small>
                        {state.detail}
                        {row.activeCourses > 0 ? ` · ${row.activeCourses} khóa đang học` : ''}
                      </small>
                    </div>
                    <Pill tone={state.tone}>{state.label}</Pill>
                  </Link>
                );
              })}
            </div>
          )}
          {people.length > 6 && (
            <p className="pu-footer-note">Và {people.length - 6} nhân viên khác — xem đầy đủ ở Năng lực đội ngũ.</p>
          )}
        </section>

        <section className="pm-panel" aria-labelledby="pm-queue-title">
          <div className="pm-panel-head">
            <div>
              <Mini>Hàng chờ chấm bài</Mini>
              <h2 id="pm-queue-title">Bài nộp cần bạn đọc.</h2>
              <p>Bài đánh giá trước khi học và bài cuối khóa tách riêng khỏi minh chứng thực tế trong lúc học.</p>
            </div>
          </div>
          {!canReview ? (
            <p className="pu-panel-desc">Tài khoản của bạn chưa có quyền chấm bài.</p>
          ) : reviews.isLoading ? (
            <PageSkeleton blocks={[56, 56]} />
          ) : reviews.isError ? (
            <LoadError message="Không tải được hàng chờ bài cuối khóa." onRetry={() => reviews.refetch()} />
          ) : queue.length === 0 ? (
            <p className="pu-panel-desc">Không có bài cuối khóa nào đang chờ trong phòng ban.</p>
          ) : (
            <div className="pm-rows">
              {queue.slice(0, 5).map((item) => (
                <Link key={item.submissionId} className="pm-row" to={MANAGER_PATHS.finalReviews}>
                  <Initials name={item.employeeName} />
                  <div>
                    <strong>{item.employeeName}</strong>
                    <small>{item.courseTitle} · lần nộp {item.attemptNo}/{item.maxAttempts}</small>
                  </div>
                  <Pill tone={QUEUE_PILL[item.status].tone}>{QUEUE_PILL[item.status].label}</Pill>
                </Link>
              ))}
            </div>
          )}
          {canReview && (
            <div style={{ marginTop: 14 }}>
              <PuLink to={MANAGER_PATHS.finalReviews} kind="outline" small>Mở hàng chờ</PuLink>
            </div>
          )}
        </section>
      </div>

      <div className="pm-strip" style={{ marginTop: 16 }}>
        <p><span className="pu-mini">Luồng đánh giá riêng</span>Minh chứng thực tế có tiêu chí và quyết định riêng.</p>
        <div className="pu-row">
          <PuLink to={MANAGER_PATHS.evidence} kind="outline" small>Mở minh chứng thực tế</PuLink>
          <PuLink to={MANAGER_PATHS.training} kind="outline" small>Đào tạo đội ngũ</PuLink>
        </div>
      </div>
    </ManagerPage>
  );
}
