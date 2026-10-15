import { Link } from 'react-router-dom';
import journeyArt from '@/assets/pulse/learning-journey-abstract.webp';
import { usePulseOverview } from '@/hooks/use-pulse';
import type { PulseCourseSummary, PulseDomain, PulseOverview } from '@/services/pulse.service';
import { CapabilityRows, Levels } from '../components/blocks';
import { Eyebrow, LevelTrack, LoadError, Mini, PageHead, PageSkeleton, PuLink } from '../components/ui';
import { SLOT_LABELS, domainBadge, domainTone, levelName, pad2, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';
import { PulseTodayPage } from './PulseTodayPage';

/** Lộ trình vị trí của tôi: sáu lĩnh vực, thang khóa theo cấp và chi tiết mức năng lực (§7.2, §8). */
export function PulsePathPage() {
  const { data, isLoading, error, refetch } = usePulseOverview();
  if (isLoading) return <PageSkeleton blocks={[120, 320, 90, 520]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được lộ trình của bạn.')} onRetry={() => refetch()} />;
  if (!data.hasPosition || !data.hasTargets) return <PulseTodayPage />;

  const { person, assessed, stats, nextCourse: next } = data;
  const position = person.positionName ?? 'vị trí của bạn';
  const targetDomains = data.domains.filter((d) => d.target > 0);
  const held = data.courses.filter((c) => c.slotStatus === 'SEAT_HELD');
  const learning = data.courses.some((c) => c.enrollmentId && c.slotStatus !== 'SEAT_HELD');

  return (
    <div className="pu-journey">
      <PageHead
        eyebrow="Lộ trình vị trí của tôi"
        title={`Lộ trình học dành cho ${position}.`}
        description="Mức đầu vào, mục tiêu vị trí và thứ tự khóa học luôn hiển thị cùng nhau."
      />

      <section className="pu-journey-hero">
        <div>
          <Eyebrow>{person.departmentName ? `${person.departmentName} / ` : ''}{position}</Eyebrow>
          <h2>Biết bước tiếp theo của bạn. <em>Làm chủ tiến độ của bạn.</em></h2>
          <p>
            {assessed
              ? stats.gapCount
                ? `Có ${stats.gapCount} khoảng cách năng lực giữa mức đã xác nhận và mục tiêu vị trí của bạn.`
                : 'Mức đã xác nhận đã chạm mục tiêu ở mọi lĩnh vực đo được. Tiếp tục các khóa còn lại trên lộ trình.'
              : 'Mục tiêu vị trí của bạn đã sẵn sàng. Làm bài kiểm tra đầu vào để thấy khoảng cách đã xác nhận và thứ tự khóa học.'}
          </p>
          <div className="pu-row">
            {assessed
              ? next && <PuLink to={PULSE_PATHS.course(next.courseId)} kind="light">Xem khóa tiếp theo →</PuLink>
              : <PuLink to={PULSE_PATHS.baseline} kind="light">Làm bài đầu vào →</PuLink>}
            <PuLink to={PULSE_PATHS.today} kind="on-dark">Quay lại Hôm nay</PuLink>
          </div>
        </div>
        <img src={journeyArt} alt="" />
      </section>

      <div className="pu-stages" aria-label="Trình tự học của bạn">
        <div className={assessed ? 'done' : 'current'}>
          <b>01</b>
          <strong>Xác định mức đầu vào</strong>
          <small>{assessed ? 'Đã ghi nhận mức khởi điểm' : 'Bắt đầu ở đây để đo năng lực'}</small>
        </div>
        <div className={learning ? 'current' : ''}>
          <b>02</b>
          <strong>Học theo lĩnh vực</strong>
          <small>{learning ? 'Đang học khóa trong lộ trình' : 'Khóa học đi theo mục tiêu vị trí'}</small>
        </div>
        <div className={stats.approvedCourses ? 'done' : ''}>
          <b>03</b>
          <strong>Trình bày bài làm</strong>
          <small>{stats.approvedCourses ? `${stats.approvedCourses} khóa đã được duyệt` : 'Quản lý chấm bài cuối khóa'}</small>
        </div>
      </div>

      {held.length > 0 && (
        <section className="pu-surface pu-pad">
          <Mini>Suất đã giữ trên lộ trình</Mini>
          <h2 className="pu-panel-title">Khóa tiếp theo đã có suất cho bạn.</h2>
          <p className="pu-panel-desc" style={{ margin: 0 }}>
            {held.map((c) => `${c.domainName} · ${levelName(c.tier)}`).join(' · ')}.{' '}
            {assessed
              ? 'Khi khóa cấp trước cùng lĩnh vực được quản lý duyệt, toàn bộ nội dung sẽ tự mở — chủ doanh nghiệp không cần cấp lại.'
              : 'Hoàn thành bài kiểm tra đầu vào và được duyệt khóa cấp trước để hệ thống tự mở toàn bộ nội dung.'}
          </p>
        </section>
      )}

      <section className="pu-roadmap" aria-labelledby="pu-route-title">
        <div className="pu-section-head">
          <div>
            <Mini>Bản đồ lĩnh vực của bạn</Mini>
            <h2 id="pu-route-title">Hiện tại → mục tiêu vị trí</h2>
            <p>Chỉ những lĩnh vực thuộc mục tiêu vị trí của bạn được hiển thị. Kết quả chưa có vẫn ở trạng thái chờ.</p>
          </div>
          <span className="pu-count">{targetDomains.length} lĩnh vực trong lộ trình</span>
        </div>
        <div className="pu-route-grid">
          {targetDomains.map((domain) => (
            <DomainRoute key={domain.categoryId} domain={domain} overview={data} />
          ))}
        </div>
      </section>

      <section className="pu-surface pu-pad" aria-labelledby="pu-detail-title">
        <div className="pu-section-head" style={{ marginBottom: 14 }}>
          <div>
            <Mini>Chi tiết năng lực</Mini>
            <h2 id="pu-detail-title">Mức đã xác nhận bên cạnh mục tiêu.</h2>
            <p>Mức đầu vào giữ nguyên. Bài cuối khóa hoặc nhiệm vụ thực tế được quản lý duyệt có thể nâng mức đã xác nhận.</p>
          </div>
        </div>
        <CapabilityRows domains={data.domains} assessed={assessed} />
      </section>
    </div>
  );
}

function DomainRoute({ domain, overview }: { domain: PulseDomain; overview: PulseOverview }) {
  const tiers = Array.from({ length: domain.target }, (_, i) => i + 1)
    .map((tier) => overview.courses.find((c) => c.categoryId === domain.categoryId && c.tier === tier))
    .filter((course): course is PulseCourseSummary => Boolean(course));
  const firstOpen = tiers.find((c) => c.slotStatus !== 'COMPLETED');
  const current = overview.assessed ? domain.verified : 0;

  return (
    <article className={`pu-route ${domainTone(domain)}`}>
      <div className="pu-tile-top">
        <span>{pad2(domain.number)} / {domain.name}</span>
        <b>{domainBadge(domain, overview.assessed)}</b>
      </div>
      <Levels current={current} target={domain.target} currentLabel="Mức đã xác nhận" />
      <LevelTrack current={current} target={domain.target} label={`${domain.name}: mức ${current || 'chưa xác nhận'}, mục tiêu mức ${domain.target}`} />
      <div className="pu-tiers">
        {tiers.map((course) => {
          const tone = course.slotStatus === 'COMPLETED' ? 'done'
            : course.slotStatus === 'SEAT_HELD' ? 'held'
            : ['IN_PROGRESS', 'IN_REVIEW', 'NEEDS_SUPPORT'].includes(course.slotStatus) ? 'active'
            : '';
          return (
            <Link key={course.courseId} to={PULSE_PATHS.course(course.courseId)} className={tone} title={course.title}>
              <b>{pad2(course.tier)} · {levelName(course.tier)}</b>
              <small>{SLOT_LABELS[course.slotStatus]}</small>
            </Link>
          );
        })}
      </div>
      {overview.assessed
        ? firstOpen
          ? <PuLink to={PULSE_PATHS.course(firstOpen.courseId)} kind="outline" small>Xem khóa tiếp theo →</PuLink>
          : <PuLink to={PULSE_PATHS.outcomes} kind="outline" small>Xem kết quả đã xác nhận →</PuLink>
        : <PuLink to={PULSE_PATHS.baseline} kind="outline" small>Làm bài đầu vào →</PuLink>}
    </article>
  );
}
