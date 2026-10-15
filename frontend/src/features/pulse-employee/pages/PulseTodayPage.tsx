import { ArrowUpRight, Compass, Target, UserX } from 'lucide-react';
import journeyArt from '@/assets/pulse/learning-journey-abstract.webp';
import { usePulseOverview } from '@/hooks/use-pulse';
import type { PulseOverview } from '@/services/pulse.service';
import { RoadmapTile } from '../components/blocks';
import { Bar, Empty, Eyebrow, LoadError, Mini, PageSkeleton, Pill, PuLink } from '../components/ui';
import { levelName, levelShort, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

/** Hôm nay — một bước có ý nghĩa: khóa nên học tiếp, thực hành và mục tiêu vị trí (§3, pulse-reuse.js employeeHome). */
export function PulseTodayPage() {
  const { data, isLoading, error, refetch } = usePulseOverview();
  if (isLoading) return <PageSkeleton blocks={[420, 260, 380]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được không gian học của bạn.')} onRetry={() => refetch()} />;
  if (!data.hasPosition || !data.hasTargets) return <NoPath overview={data} />;

  const { person, assessed, nextCourse: next, stats } = data;
  const position = person.positionName ?? 'vị trí của bạn';
  const nextDomain = next ? data.domains.find((d) => d.categoryId === next.categoryId) : undefined;
  const nextProgress = next && next.moduleCount ? (next.modulesPassed / next.moduleCount) * 100 : 0;
  const targetDomains = data.domains.filter((d) => d.target > 0);

  const heroAction = !assessed
    ? { to: PULSE_PATHS.baseline, label: 'Làm bài đầu vào →' }
    : next
      ? { to: PULSE_PATHS.course(next.courseId), label: next.enrollmentId ? 'Tiếp tục khóa học →' : 'Xem khóa tiếp theo →' }
      : { to: PULSE_PATHS.path, label: 'Xem lộ trình →' };

  return (
    <div className="pu-today">
      <section className="pu-hero">
        <div>
          <Eyebrow>Không gian học của {person.fullName}</Eyebrow>
          <h1>Tạo một bước tiến có ý nghĩa <em>hôm nay.</em></h1>
          <p>
            {!assessed
              ? `Bắt đầu với bài kiểm tra đầu vào. Kết quả được so với mục tiêu của vị trí ${position} trước khi lộ trình khóa học mở.`
              : next && nextDomain
                ? `Tiếp tục bài học để đưa năng lực ${nextDomain.name.toLowerCase()} của bạn gần hơn với mục tiêu vị trí ${position}.`
                : `Bạn đã đi hết các khóa hiện có trong lộ trình ${position}. Xem lại kết quả và áp dụng vào công việc.`}
          </p>
          <div className="pu-row">
            <PuLink to={heroAction.to}>{heroAction.label}</PuLink>
            <PuLink to={PULSE_PATHS.path} kind="outline">Khám phá lộ trình của tôi</PuLink>
          </div>
        </div>
        <div className="pu-art">
          <img src={journeyArt} alt="Các bệ kính nối với nhau bằng một lộ trình học màu xanh" />
          <div className="pu-art-note">
            <strong>{assessed ? (next ? 'Bước tiếp theo đã sẵn sàng' : 'Lộ trình đã hoàn thành') : 'Bắt đầu bằng mức khởi điểm'}</strong>
            <small>{assessed && next ? `${next.domainName} · ${levelName(next.tier)}` : 'Mức hiện tại → mục tiêu vị trí'}</small>
          </div>
        </div>
      </section>

      {data.latestOutcome && <LatestOutcome overview={data} />}

      <div className="pu-intro">
        <div>
          <Eyebrow>Một hành động rõ ràng</Eyebrow>
          <h2>Việc gì quan trọng hôm nay?</h2>
        </div>
        <Pill>Vị trí {position}</Pill>
      </div>

      <div className="pu-cards">
        <article className="pu-continue">
          <Mini>{!assessed ? 'Bắt đầu hành trình học' : next?.enrollmentId ? 'Tiếp tục từ bước bạn dừng' : 'Bước tiếp theo trên lộ trình'}</Mini>
          <h3>{!assessed ? 'Tìm mức khởi điểm của bạn' : next ? next.title : 'Lộ trình hiện tại đã xong'}</h3>
          <p>
            {!assessed
              ? 'Hoàn thành bài kiểm tra đầu vào trước khi lộ trình khóa học của vị trí mở.'
              : next
                ? `${next.enrollmentId ? `Đã qua ${next.modulesPassed}/${next.moduleCount} mô đun. ` : ''}${next.tier === 1 ? 'Khóa Cơ bản mở miễn phí toàn bộ.' : next.access === 'PREVIEW' ? 'Cấp độ này cần suất học do chủ doanh nghiệp phân bổ.' : 'Suất học của bạn đã sẵn sàng.'}`
                : 'Mọi khóa trong mục tiêu vị trí đã được duyệt hoặc đang chờ chấm.'}
          </p>
          <Bar value={nextProgress} label="Tiến độ khóa học" />
          <PuLink to={!assessed ? PULSE_PATHS.baseline : next ? PULSE_PATHS.course(next.courseId) : PULSE_PATHS.outcomes} kind="light" small>
            {!assessed ? 'Làm bài đầu vào →' : next ? (next.enrollmentId ? 'Mở khóa học →' : 'Xem khóa học →') : 'Xem kết quả đã xác nhận →'}
          </PuLink>
        </article>

        <article className="pu-practice-card">
          <span className="pu-card-symbol" aria-hidden><ArrowUpRight size={18} /></span>
          <Mini>Thực hành</Mini>
          <h3>Trình bày cách tạo ra kết quả.</h3>
          <p>
            {stats.inReview
              ? `${stats.inReview} bài cuối khóa đang chờ quản lý chấm. Quyết định và lý do sẽ hiện ở mục Thực hành.`
              : 'Nộp minh chứng theo ba tiêu chí hiển thị sẵn. Quản lý phòng ban đưa ra quyết định cuối cùng.'}
          </p>
          <PuLink to={PULSE_PATHS.practice} kind="outline" small>Xem bài cuối khóa ↗</PuLink>
        </article>

        <article className="pu-target-card">
          <span className="pu-card-symbol" aria-hidden><Target size={18} /></span>
          <Mini>Mục tiêu vị trí của bạn</Mini>
          <h3>{assessed ? (stats.gapCount ? `Còn ${stats.gapCount} khoảng cách năng lực cần cải thiện.` : 'Không còn khoảng cách đã đo.') : 'Mục tiêu của bạn đã sẵn sàng.'}</h3>
          <p>{person.departmentName ? `Phòng ${person.departmentName} giới hạn mục tiêu vị trí. ` : ''}Những mức chưa kiểm tra vẫn ở trạng thái chờ, không bị tính là khoảng cách.</p>
          <PuLink to={PULSE_PATHS.path} kind="outline" small>So sánh hiện tại → mục tiêu ↗</PuLink>
        </article>
      </div>

      <section className="pu-roadmap" aria-labelledby="pu-roadmap-title">
        <div className="pu-section-head">
          <div>
            <Mini>Lộ trình học của bạn</Mini>
            <h2 id="pu-roadmap-title">Biết mức hiện tại và mục tiêu.</h2>
            <p>{position}{person.departmentName ? ` · ${person.departmentName}` : ''}. Mỗi chỉ dấu so mức đã xác nhận với mục tiêu vị trí; mức đầu vào vẫn được lưu.</p>
          </div>
          <PuLink to={PULSE_PATHS.path} kind="outline">Xem toàn bộ lộ trình →</PuLink>
        </div>
        <div className="pu-roadmap-grid">
          {targetDomains.map((domain) => <RoadmapTile key={domain.categoryId} domain={domain} assessed={assessed} />)}
        </div>
        <div className="pu-roadmap-footer">
          <span>
            {assessed
              ? `${stats.gapCount} khoảng cách đã xác nhận · ${stats.pendingCount} lĩnh vực chờ đo · ${stats.metCount} đã đạt`
              : 'Làm bài kiểm tra đầu vào để thấy khoảng cách đã đo.'}
          </span>
          {assessed
            ? <PuLink to={PULSE_PATHS.path} kind="outline" small>Xem khóa học theo thứ tự →</PuLink>
            : <PuLink to={PULSE_PATHS.baseline} small>Làm bài đầu vào →</PuLink>}
        </div>
      </section>

      <nav className="pu-more-links" aria-label="Thêm cho hành trình của bạn">
        <span>Thêm cho hành trình của bạn</span>
        <PuLink to={PULSE_PATHS.activity} kind="outline" small>Hoạt động</PuLink>
        <PuLink to={PULSE_PATHS.outcomes} kind="outline" small>Kết quả đã xác nhận</PuLink>
        <PuLink to={PULSE_PATHS.profile} kind="outline" small>Hồ sơ của tôi</PuLink>
      </nav>
    </div>
  );
}

function LatestOutcome({ overview }: { overview: PulseOverview }) {
  const outcome = overview.latestOutcome!;
  return (
    <section className={`pu-outcome-band${outcome.gained ? ' advanced' : ''}`} aria-label="Kết quả mới nhất được quản lý duyệt">
      <div>
        <Mini>Kết quả mới nhất được quản lý duyệt</Mini>
        <h2>
          {outcome.domainName}
          <strong>{levelShort(outcome.baseline)} → {levelShort(outcome.verified)}</strong>
        </h2>
        <p>
          Bài cuối khóa {levelName(outcome.tier)} đã được duyệt.{' '}
          {outcome.gained
            ? `Mức đã xác nhận của bạn đạt ${levelShort(outcome.verified)}; mục tiêu vị trí là L${outcome.target}.`
            : `Khóa xác nhận mức ${levelShort(outcome.tier)}, vẫn nằm trong mức đã xác nhận của bạn. Mức đầu vào giữ nguyên ${levelShort(outcome.baseline)}.`}
        </p>
      </div>
      <div>
        <Pill tone={outcome.gained ? 'green' : ''}>
          {outcome.gained ? `+${outcome.verified - outcome.baseline} mức kể từ bài đầu vào` : 'Hoàn thành khóa · đã xác nhận mức'}
        </Pill>
        <PuLink to={PULSE_PATHS.path} kind="outline" small>Xem lộ trình năng lực →</PuLink>
      </div>
    </section>
  );
}

function NoPath({ overview }: { overview: PulseOverview }) {
  return (
    <Empty
      icon={overview.hasPosition ? <Compass size={24} /> : <UserX size={24} />}
      title={overview.hasPosition ? 'Vị trí của bạn chưa có mục tiêu năng lực' : 'Bạn chưa được gán vị trí công việc'}
    >
      {overview.hasPosition
        ? `Chủ doanh nghiệp chưa công bố mục tiêu năng lực cho vị trí ${overview.person.positionName ?? ''}. Lộ trình học sẽ mở khi khung năng lực được công bố.`
        : 'Lộ trình học đi theo phòng ban và vị trí của bạn. Hãy liên hệ chủ doanh nghiệp để được xếp vào đúng vị trí.'}
    </Empty>
  );
}
