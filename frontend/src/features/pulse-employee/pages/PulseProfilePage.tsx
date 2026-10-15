import { usePulseOverview } from '@/hooks/use-pulse';
import { useCurrentUser } from '@/hooks/use-current-user';
import { formatDate } from '@/lib/utils';
import { Eyebrow, LoadError, Mini, PageSkeleton, PuLink } from '../components/ui';
import { initials, levelShort, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

const RESPONSIBILITIES = [
  ['01', 'Biết mức khởi điểm của bạn', 'Hoàn thành bài kiểm tra đầu vào để xem mức hiện tại bên cạnh mục tiêu của vị trí.'],
  ['02', 'Theo dõi lộ trình của bạn', 'Học qua mô đun, trang nội dung và câu hỏi ôn tập. Khóa Cơ bản miễn phí toàn bộ.'],
  ['03', 'Trình bày bài làm', 'Nộp bài cuối khóa rồi xem quyết định và phản hồi của quản lý phòng ban.'],
] as const;

/** Hồ sơ của tôi (§3): danh tính, phạm vi, trách nhiệm và mức hiện tại so với mục tiêu vị trí. */
export function PulseProfilePage() {
  const user = useCurrentUser((s) => s.user);
  const { data, isLoading, error, refetch } = usePulseOverview();
  if (isLoading) return <PageSkeleton blocks={[340, 90, 120, 360]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được hồ sơ.')} onRetry={() => refetch()} />;

  const { person, assessed, stats } = data;
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
          <p>Không gian học theo mục tiêu vị trí của bạn. Bắt đầu với bài đầu vào, hoàn thành các mô đun và nộp bài cuối khóa cho quản lý.</p>
          <div className="pu-row">
            <PuLink to={assessed ? PULSE_PATHS.path : PULSE_PATHS.baseline} kind="on-dark" small>{assessed ? 'Lộ trình học của tôi' : 'Làm bài đầu vào'}</PuLink>
            <PuLink to={PULSE_PATHS.today} kind="on-dark" small>Hôm nay</PuLink>
            <PuLink to={PULSE_PATHS.practice} kind="on-dark" small>Thực hành</PuLink>
          </div>
        </div>
        <div className="pu-profile-art" aria-hidden><span>{initials(name)}</span></div>
      </section>

      <section className="pu-facts" aria-label="Thông tin tài khoản">
        <div><span>Email công việc</span><strong title={person.workEmail ?? user?.email}>{person.workEmail ?? user?.email ?? '—'}</strong></div>
        <div><span>Phòng ban</span><strong>{person.departmentName ?? 'Chưa gán'}</strong></div>
        <div><span>Vị trí</span><strong>{person.positionName ?? 'Chưa gán'}</strong></div>
        <div><span>Bài đầu vào</span><strong>{assessed ? `Hoàn thành ${formatDate(data.assessedAt)}` : 'Chưa làm'}</strong></div>
      </section>

      <section className="pu-metrics" aria-label="Tóm tắt">
        <div><strong>{assessed ? `${stats.gapCount} khoảng cách` : 'Chờ đầu vào'}</strong><span>Hiện tại → mục tiêu</span></div>
        <div><strong>{stats.assignedCourses}</strong><span>Khóa học đang có</span></div>
        <div><strong>{stats.approvedCourses}</strong><span>Khóa học đã duyệt</span></div>
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
          <h2 className="pu-panel-title">Mức hiện tại bên cạnh mục tiêu vị trí.</h2>
          <p className="pu-panel-desc">Kết quả chưa có sẽ hiển thị là đang chờ, không bị tính là khoảng cách năng lực.</p>
          <div className="pu-domain-list">
            {data.domains.filter((d) => d.target > 0).map((domain) => (
              <div key={domain.categoryId}>
                <span>{domain.name}</span>
                <strong>{assessed ? levelShort(domain.verified) : 'Đang chờ'} <i>→</i> L{domain.target}</strong>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}><PuLink to={PULSE_PATHS.path} kind="outline" small>Mở toàn bộ lộ trình →</PuLink></div>
        </section>
      </div>
    </div>
  );
}
