import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePersonalOverview } from '@/hooks/use-personal-learning';
import { useTrialNotices } from '@/hooks/use-trial-notices';
import { levelLabelVi } from '@/lib/competency-levels';
import type { PersonalOverview } from '@/services/personal-learning.service';
import { ActivityList } from '../components/ActivityList';
import { TrialChecklist } from '../components/TrialChecklist';
import { TrialEndedPanel } from '../components/TrialEndedPanel';
import { Card, ErrorBlock, LoadingBlock, PT_BUTTON, PT_BUTTON_SECONDARY, PersonalPageHeader, ProgressBar, SectionTitle, Stat } from '../components/ui';
import { errorMessage } from '../utils/error-message';
import { formatHours, formatMinutes } from '../utils/format';

export function LearnerDashboardPage() {
  const user = useCurrentUser((state) => state.user);
  const { data, isLoading, isError, error, refetch } = usePersonalOverview();
  useTrialNotices();
  const firstName = (data?.fullName ?? user?.fullName ?? '').trim().split(/\s+/).pop() ?? '';
  return (
    <div data-testid="learner-dashboard" className="grid gap-6">
      <PersonalPageHeader title="Tổng quan học tập" label={firstName ? `Chào ${firstName}` : 'Không gian cá nhân'}
        lead={data?.target ? `Mục tiêu: ${data.target.name}` : 'Thiết lập mục tiêu học tập để nhận lộ trình phù hợp.'} />
      <TrialEndedPanel />
      <TrialChecklist />
      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && <>
        <NextAction data={data} />
        {data.target && <Overview data={data} />}
      </>}
    </div>
  );
}

function NextAction({ data }: { data: PersonalOverview }) {
  if (!data.target) return <Card className="p-6">
    <h2 className="text-xl font-semibold">Thiết lập mục tiêu học tập</h2>
    <p className="mt-2 text-sm text-pt-fg-2">Xem yêu cầu của năm vị trí tham chiếu và chọn vị trí phù hợp với công việc.</p>
    <Link to="/personal/target" className={`${PT_BUTTON} mt-5`}>Chọn vị trí <ArrowRight className="size-4" aria-hidden="true" /></Link>
  </Card>;
  if (!data.assessed) return <Card className="p-6">
    <h2 className="text-xl font-semibold">Đánh giá năng lực đầu vào</h2>
    <p className="mt-2 text-sm text-pt-fg-2">Chưa có kết quả đánh giá đầu vào; lộ trình tạm đề xuất từ nội dung nền tảng.</p>
    <Link to="/personal/diagnostic" className={`${PT_BUTTON} mt-5`}>Làm đánh giá</Link>
  </Card>;
  return <ContinueCard data={data} />;
}

function Overview({ data }: { data: PersonalOverview }) {
  return <>
    <Card className="grid gap-6 p-6 sm:grid-cols-3">
      <Stat label="Khóa đã hoàn thành" value={`${data.path.completedCourses}/${data.path.totalCourses}`} hint="trong lộ trình hiện tại" />
      <Stat label="Nội dung còn lại" value={formatHours(data.path.minutesLeft)} hint="thời lượng ước tính" />
      <Stat label="Bài thực hành cần xử lý" value={data.openTaskCount} hint={<Link to="/personal/tasks" className="underline">Xem bài thực hành</Link>} />
    </Card>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <SectionTitle title="Việc cần làm" />
        <ul className="mt-4 divide-y divide-pt-line text-sm">
          {!data.assessed && <li className="py-3"><Link to="/personal/diagnostic" className="underline">Hoàn thành đánh giá đầu vào</Link></li>}
          {data.openTaskCount > 0 && <li className="py-3"><Link to="/personal/tasks" className="underline">Xử lý {data.openTaskCount} bài thực hành</Link></li>}
          <li className="py-3"><Link to="/personal/path" className="underline">Kiểm tra chương trình học và điều kiện khóa tiếp theo</Link></li>
        </ul>
      </Card>
      <Card className="p-6"><SectionTitle title="Hoạt động gần đây" /><div className="mt-4"><ActivityList items={data.activity} /></div></Card>
    </div>
    <Card className="p-6">
      <SectionTitle title="Tóm tắt năng lực" aside={<Link to="/personal/progress" className="underline">Hồ sơ năng lực →</Link>} />
      <p className="mt-3 text-sm text-pt-fg-2">{data.assessed
        ? `Đáp ứng ${data.coveragePercent}% yêu cầu năng lực của vị trí; còn ${data.gapCount} năng lực cần phát triển. Đây là mức đáp ứng yêu cầu, khác với tiến độ học.`
        : 'Chưa đánh giá. Kết quả đánh giá sẽ giúp xác định mức đáp ứng yêu cầu vị trí.'}</p>
      <ul className="mt-4 divide-y divide-pt-line">
        {data.domains.map((domain) => <li key={domain.number} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
          <span>{domain.name}</span><span className="text-pt-fg-2">{domain.required === 0 ? 'Vị trí không yêu cầu' : !data.assessed ? 'Chưa đánh giá' : `${levelLabelVi(domain.current)} · Mục tiêu: ${levelLabelVi(domain.required)}`}</span>
        </li>)}
      </ul>
    </Card>
  </>;
}

function ContinueCard({ data }: { data: PersonalOverview }) {
  const lesson = data.continueLesson;
  const next = data.nextCourse;
  const completed = data.path.totalCourses > 0 && data.path.completedCourses === data.path.totalCourses;
  return <Card className="p-6">
    {lesson ? <>
      <p className="mb-2 text-sm text-pt-fg-2">Khóa đang học</p>
      <h2 className="text-xl font-semibold">{lesson.courseTitle}</h2>
      <p className="mt-2 text-sm text-pt-fg-2">Bài tiếp theo: {lesson.lessonTitle}</p>
      <div className="mt-4 flex max-w-lg items-center gap-4"><ProgressBar value={lesson.progressPercent} label={`Tiến độ khóa ${lesson.courseTitle}`} /><span className="text-sm tabular-nums">{lesson.progressPercent}%</span></div>
      <Link to={`/personal/classroom/${lesson.courseId}?lesson=${lesson.lessonId}`} className={`${PT_BUTTON} mt-5`}><Play className="size-4" aria-hidden="true" /> Học tiếp</Link>
    </> : next ? <>
      <p className="mb-2 text-sm text-pt-fg-2">Khóa tiếp theo</p>
      <h2 className="text-xl font-semibold">{next.title}</h2>
      <p className="mt-2 text-sm text-pt-fg-2">{next.domainName} · {formatMinutes(next.durationMinutes)} · Phát triển {next.closes.length} năng lực</p>
      <div className="mt-5 flex flex-wrap gap-3"><Link to={`/personal/classroom/${next.id}`} className={PT_BUTTON}>Bắt đầu khóa <ArrowRight className="size-4" aria-hidden="true" /></Link><Link to={`/personal/courses/${next.id}`} className={PT_BUTTON_SECONDARY}>Xem khóa học</Link></div>
    </> : <>
      <h2 className="text-xl font-semibold">{completed ? 'Đã hoàn thành lộ trình' : 'Xem chương trình học của bạn'}</h2>
      <p className="mt-2 text-sm text-pt-fg-2">{completed ? 'Xem các chứng nhận từ những khóa học đã hoàn thành.' : 'Kiểm tra các khóa học và điều kiện cần hoàn thành để tiếp tục.'}</p>
      <Link to={completed ? '/personal/certificates' : '/personal/path'} className={`${PT_BUTTON} mt-5`}>{completed ? 'Xem chứng nhận' : 'Xem lộ trình'}</Link>
    </>}
  </Card>;
}
