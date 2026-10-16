import { usePulseOverview } from '@/hooks/use-pulse';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Eyebrow, LoadError, Mini, PageSkeleton, PuLink } from '../components/ui';
import { initials, levelShort, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

const RESPONSIBILITIES = [
  ['01', 'Đánh giá trước khi học', 'Mỗi khóa bắt đầu bằng một bài đánh giá có giám sát. Đạt thì khóa được công nhận, không cần học.'],
  ['02', 'Theo dõi lộ trình của bạn', 'Học qua mô đun, trang nội dung và câu hỏi ôn tập khi bài đánh giá chưa đạt. Khóa Cơ bản miễn phí toàn bộ.'],
  ['03', 'Trình bày bài làm', 'Làm bài cuối khóa có giám sát rồi xem quyết định và phản hồi của người chấm.'],
] as const;

/** Hồ sơ của tôi (§3): danh tính, phạm vi, trách nhiệm và mức hiện tại so với mục tiêu vị trí. */
export function PulseProfilePage() {
  const user = useCurrentUser((s) => s.user);
  const { data, isLoading, error, refetch } = usePulseOverview();
  if (isLoading) return <PageSkeleton blocks={[340, 90, 120, 360]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được hồ sơ.')} onRetry={() => refetch()} />;

  const { person, reviewer, stats } = data;
  const name = person.fullName || user?.fullName || 'Nhân viên';
  const scope = [person.departmentName, person.positionName].filter(Boolean).join(' · ');

  return (
    <div className="pu-stack">
      <section className="pu-profile-hero">
        <div>
          <Eyebrow>Hồ sơ của tôi · Nhân viên</Eyebrow>
          <div className="pu-profile-intro">
            <div className="pu-profile-avatar" aria-hidden>{initials(name)}</div>
            <div>
              <h1>{name}</h1>
              <strong>{scope || person.organizationName || 'Không gian học tập'}</strong>
            </div>
          </div>
          <p>Không gian học theo lộ trình doanh nghiệp đặt cho vị trí của bạn. Mỗi khóa bắt đầu bằng bài đánh giá trước khi học; chưa đạt thì học các mô đun rồi làm bài cuối khóa.</p>
          <div className="pu-row">
            <PuLink to={PULSE_PATHS.path} kind="on-dark" small>Lộ trình học của tôi</PuLink>
            <PuLink to={PULSE_PATHS.today} kind="on-dark" small>Hôm nay</PuLink>
            <PuLink to={PULSE_PATHS.practice} kind="on-dark" small>Bài đã nộp</PuLink>
          </div>
        </div>
        <div className="pu-profile-art" aria-hidden><span>{initials(name)}</span></div>
      </section>

      <section className="pu-facts" aria-label="Thông tin tài khoản">
        <div><span>Email công việc</span><strong title={person.workEmail ?? user?.email}>{person.workEmail ?? user?.email ?? '—'}</strong></div>
        <div><span>Phòng ban</span><strong>{person.departmentName ?? 'Chưa gán'}</strong></div>
        <div><span>Vị trí</span><strong>{person.positionName ?? 'Chưa gán'}</strong></div>
        <div><span>Người đánh giá</span><strong>{reviewer?.name ?? 'Chưa có'}</strong></div>
      </section>

      <section className="pu-metrics" aria-label="Tóm tắt">
        <div><strong>{stats.approvedPathCourses}/{stats.pathCourses}</strong><span>Khóa trong lộ trình đã đạt</span></div>
        <div><strong>{stats.learningCourses}</strong><span>Khóa đang học</span></div>
        <div><strong>{stats.inReview}</strong><span>Bài chờ chấm</span></div>
      </section>

      <div className="pu-grid-2" style={{ alignItems: 'start' }}>
        <section className="pu-surface pu-pad">
          <Mini>Vai trò và trách nhiệm</Mini>
          <h2 className="pu-panel-title">Bạn có thể làm gì ở đây.</h2>
          <div className="pu-permissions">
            {RESPONSIBILITIES.map(([number, title, detail]) => (
              <div key={number}><b>{number}</b><span><strong>{title}</strong><p>{detail}</p></span></div>
            ))}
          </div>
        </section>
        <section className="pu-surface pu-pad" style={{ background: 'linear-gradient(145deg,#f7f5ff,#fff)' }}>
          <Mini>Lộ trình năng lực của bạn</Mini>
          <h2 className="pu-panel-title">Mức đã xác nhận bên cạnh đỉnh lộ trình.</h2>
          <p className="pu-panel-desc">Đỉnh lộ trình là mức thấp hơn giữa mục tiêu vị trí và trần doanh nghiệp đặt cho phòng ban. Mức tăng khi một khóa được công nhận.</p>
          <div className="pu-domain-list">
            {data.domains.filter((d) => d.pathTop > 0).map((domain) => (
              <div key={domain.categoryId}>
                <span>{domain.name}</span>
                <strong>{levelShort(domain.verified)} <i>→</i> L{domain.pathTop}</strong>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}><PuLink to={PULSE_PATHS.path} kind="outline" small>Mở toàn bộ lộ trình →</PuLink></div>
        </section>
      </div>
    </div>
  );
}
