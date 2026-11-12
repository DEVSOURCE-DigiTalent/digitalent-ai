import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Hourglass, Lock } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMyTrialAssessment } from '@/hooks/use-trial-program';
import { ROLES } from '@/lib/roles';
import { BUY_COURSES_PATH } from '@/features/trial-program/lib/buy-courses';
import { formatWhen } from '@/features/trial-program/lib/trial-format';
import type { MyTrialAssessment } from '@/services/trial-program.service';
import type { PulseCourseSummary, PulseOverview } from '@/services/pulse.service';
import { showsProgress } from '../lib/course-state';
import { PULSE_PATHS } from '../lib/paths';
import { trialGateOf, type TrialGateState } from '../lib/trial-gate';
import { CourseAction, StatePill } from './roadmap';
import { Bar, Eyebrow, PuLink } from './ui';
import '../pulse-trial.css';

/**
 * Học thử (doanh nghiệp dùng thử): sáu khóa Cơ bản, mỗi lĩnh vực một khóa, học tới bài cuối khóa. Trước khi mentor công bố
 * kết quả bài đánh giá, các khóa hiện khóa kèm cảnh báo (làm bài đánh giá / chờ chấm). Trung cấp, Nâng cao mở khi doanh nghiệp mua
 * khóa — chủ doanh nghiệp có nút mua ngay dưới danh sách.
 */
export function TrialLearning({ overview }: { overview: PulseOverview }) {
  useUiLanguage();
  const owner = useIsOwner();
  const { data: mine } = useMyTrialAssessment();
  const gate = trialGateOf(mine);
  const courses = overview.courses.filter((c) => c.tier === 1).sort((a, b) => a.domainNumber - b.domainNumber);
  const done = courses.filter((c) => c.approved).length;

  return (
    <div className="pu-tl">
      <TrialLearningHead total={courses.length} done={gate ? null : done} />
      {gate && mine && <TrialNotice state={gate} mine={mine} />}
      {gate ? (
        <LockedCourses courses={courses.map((c) => ({ key: c.courseId, code: c.code, title: c.title, domainName: c.domainName, moduleCount: c.moduleCount }))} />
      ) : (
        <ul className="pu-tl-grid" aria-label="Khóa học thử">
          {courses.map((course) => <TrialCourse key={course.courseId} course={course} />)}
        </ul>
      )}
      <Upgrade owner={owner} finished={!gate && courses.length > 0 && done === courses.length} />
    </div>
  );
}

function useIsOwner() {
  return useCurrentUser((s) => Boolean(s.user?.roles.includes(ROLES.OWNER)));
}

export function TrialLearningHead({ total, done }: { total: number; done: number | null }) {
  useUiLanguage();
  return (
    <header className="pu-tl-head">
      <div>
        <Eyebrow>Học thử</Eyebrow>
        <h1>{total} khóa Cơ bản để trải nghiệm.</h1>
        <p>Mỗi lĩnh vực một khóa: hoàn thành các mô-đun, nộp bài cuối khóa và được mentor đánh giá.</p>
      </div>
      {done != null && (
        <div className="pu-tl-score">
          <strong>{done}<small>/{total}</small></strong>
          <span>{translateUi("khóa hoàn thành")}</span>
          <Bar value={total ? (done / total) * 100 : 0} label="Khóa học thử đã hoàn thành" />
        </div>
      )}
    </header>
  );
}

/** Cảnh báo trước khi học thử: làm bài đánh giá trước / chờ mentor chấm / bài đánh giá đã đóng. */
export function TrialNotice({ state, mine }: { state: TrialGateState; mine: MyTrialAssessment }) {
  useUiLanguage();
  if (state === 'waiting') {
    return (
      <div className="pu-gate-waiting-wrap">
        <NoticeCard
          tone="waiting"
          icon={<Hourglass size={20} />}
          title="Đang chờ mentor thẩm định & công bố kết quả bài làm"
          text="Chương trình đào tạo và các khóa học sẽ tự động mở khóa ngay sau khi mentor công bố kết quả bài đánh giá."
          meta={mine.submittedAt ? `Đã nộp bài lúc ${formatWhen(mine.submittedAt)} · 54 câu trắc nghiệm & 3 bài tự luận` : undefined}
          action={
            <PuLink to={PULSE_PATHS.trialTest} kind="primary" small>
              Vào xem bài làm <ArrowRight size={14} aria-hidden />
            </PuLink>
          }
        />
        <div className="pu-gate-steps-card">
          <div className="pu-gate-steps-title">Tiến độ quy trình thẩm định bài đánh giá của bạn:</div>
          <div className="pu-gate-steps-row">
            <span className="pu-gate-step done">✓ Đã nộp bài thi</span>
            <span className="pu-gate-step done">⚡ AI phân tích sơ bộ</span>
            <span className="pu-gate-step active">🔄 Mentor đang chấm điểm</span>
            <span className="pu-gate-step">⏳ Công bố & mở lộ trình</span>
          </div>
        </div>
      </div>
    );
  }
  if (state === 'closed') {
    return (
      <NoticeCard
        tone="closed"
        icon={<Lock size={20} />}
        title="Bài đánh giá đã đóng"
        text={mine.closedMessage ?? 'Hạn làm bài đã qua.'}
        action={<PuLink to={PULSE_PATHS.trialTest} kind="outline" small>Xem bài đánh giá</PuLink>}
      />
    );
  }
  return (
    <NoticeCard
      icon={<ClipboardList size={20} />}
      title="Làm bài test trước khi học"
      text="Chương trình đào tạo mở sau khi mentor đánh giá bài test của bạn."
      meta={mine.canStart && mine.testDeadline ? `Hạn nộp ${formatWhen(mine.testDeadline)}` : mine.closedMessage ?? undefined}
      action={<PuLink to={PULSE_PATHS.trialTest}>{translateUi("Làm bài đánh giá ")}<ArrowRight size={15} aria-hidden /></PuLink>}
    />
  );
}

export function NoticeCard({
  tone = 'todo',
  icon,
  title,
  text,
  meta,
  action,
  children,
}: {
  tone?: 'todo' | 'waiting' | 'closed';
  icon: ReactNode;
  title: string;
  text: string;
  meta?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  useUiLanguage();
  return (
    <section className={`pu-tl-notice ${tone}`} role="status" aria-label={translateUi(title)}>
      <span className="pu-tl-notice-icon" aria-hidden>{icon}</span>
      <div>
        <strong>{translateUi(title)}</strong>
        <span>{text}</span>
        {meta && <small>{meta}</small>}
      </div>
      {action}
      {children}
    </section>
  );
}

export interface LockedCourse {
  key: string;
  code: string;
  title: string;
  domainName?: string | null;
  moduleCount?: number | null;
}

/** Sáu khóa Cơ bản hiện trước, khóa lại tới khi có kết quả bài đánh giá. */
export function LockedCourses({ courses }: { courses: LockedCourse[] }) {
  useUiLanguage();
  return (
    <ul className="pu-tl-grid" aria-label="Khóa học thử (chưa mở)">
      {courses.map((course) => (
        <li key={course.key} className="pu-tl-card locked">
          <div className="pu-tl-card-top">
            <span className="pu-tl-code">{course.code.split('-')[0]}</span>
            <span className="pu-state locked"><Lock size={11} aria-hidden /> Chưa mở</span>
          </div>
          {course.domainName && <small className="pu-tl-domain">{translateUi(course.domainName)}</small>}
          <h3>{translateUi(course.title)}</h3>
          {course.moduleCount != null && <div className="pu-tl-meta"><span>{course.moduleCount} mô-đun</span></div>}
        </li>
      ))}
    </ul>
  );
}

function TrialCourse({ course }: { course: PulseCourseSummary }) {
  useUiLanguage();
  // Chưa bắt đầu (0%) thì chỉ ghi số mô-đun.
  const learning = showsProgress(course) && !course.approved && course.slotStatus !== 'TO_LEARN';
  return (
    <li className={`pu-tl-card${course.approved ? ' done' : ''}`}>
      <div className="pu-tl-card-top">
        <span className="pu-tl-code">{course.code.split('-')[0]}</span>
        <StatePill course={course} />
      </div>
      <small className="pu-tl-domain">{translateUi(course.domainName)}</small>
      <h3><Link to={PULSE_PATHS.course(course.courseId)}>{translateUi(course.title)}</Link></h3>
      <div className="pu-tl-meta">
        {learning ? (
          <>
            <Bar value={course.progressPercent} label={translateUi(`Tiến độ học ${course.code}`)} />
            <span>{course.progressPercent}%</span>
          </>
        ) : (
          <span>{course.moduleCount} mô-đun</span>
        )}
      </div>
      <div className="pu-tl-cta"><CourseAction course={course} /></div>
    </li>
  );
}

/** Nhân viên chỉ thấy Trung cấp, Nâng cao đang khóa; chủ doanh nghiệp thấy nút mua khóa. */
export function Upgrade({ owner, finished }: { owner: boolean; finished: boolean }) {
  useUiLanguage();
  if (!owner) {
    return (
      <p className="pu-tl-locked">
        <Lock size={14} aria-hidden /> Trung cấp, Nâng cao mở khi doanh nghiệp mua khóa.
      </p>
    );
  }
  return (
    <section className="pu-tl-upgrade" aria-labelledby="pu-tl-upgrade-title">
      <span className="pu-tl-upgrade-icon" aria-hidden><Lock size={18} /></span>
      <div>
        <strong id="pu-tl-upgrade-title">{finished ? 'Đã xong Cơ bản. Lên Trung cấp, Nâng cao?' : 'Trung cấp, Nâng cao'}</strong>
        <span>Mở cho cả đội khi doanh nghiệp mua khóa.</span>
      </div>
      <PuLink to={BUY_COURSES_PATH} kind="light">Mua khóa học <ArrowRight size={15} aria-hidden /></PuLink>
    </section>
  );
}
