import { useParams } from 'react-router-dom';
import { Check, FileText, HelpCircle, Lock } from 'lucide-react';
import architectureArt from '@/assets/pulse/competency-architecture.webp';
import { usePulseCourse } from '@/hooks/use-pulse';
import type { PulseCourseDetail, PulseCourseModule } from '@/services/pulse.service';
import { Bar, Eyebrow, LoadError, Mini, Notice, PageSkeleton, Pill, PuLink } from '../components/ui';
import { ACCESS_LABELS, BLOCK_MESSAGES, levelName, pad2, pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

/** Trang chi tiết khóa (§9.1): giới thiệu, quyền truy cập, tiến độ, mô đun theo thứ tự và bài cuối khóa. */
export function PulseCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, isLoading, error, refetch } = usePulseCourse(courseId);
  if (isLoading) return <PageSkeleton blocks={[372, 260, 420]} />;
  if (error || !data) return <LoadError message={pulseErrorMessage(error, 'Không tải được khóa học.')} onRetry={() => refetch()} />;
  return <CourseView detail={data} />;
}

function CourseView({ detail }: { detail: PulseCourseDetail }) {
  const { course, modules } = detail;
  const passed = modules.filter((m) => m.passed).length;
  const quizCount = modules.filter((m) => m.hasQuiz).length;
  const firstOpen = modules.find((m) => !m.passed);
  const tier = levelName(course.tier);
  const approved = course.slotStatus === 'COMPLETED';

  const action = (() => {
    switch (detail.nextAction) {
      case 'BASELINE': return { to: PULSE_PATHS.baseline, label: 'Làm bài đầu vào trước →' };
      case 'PREVIEW': return detail.nextModuleId ? { to: PULSE_PATHS.module(course.courseId, detail.nextModuleId), label: 'Xem trang mẫu đầu tiên →' } : null;
      case 'FINAL': return { to: PULSE_PATHS.final(course.courseId), label: 'Mở bài cuối khóa →' };
      case 'DONE': return { to: PULSE_PATHS.final(course.courseId), label: 'Xem kết quả bài cuối →' };
      default:
        return detail.nextModuleId
          ? { to: PULSE_PATHS.module(course.courseId, detail.nextModuleId), label: passed ? 'Tiếp tục mô đun →' : `Bắt đầu mô đun ${pad2(1)} →` }
          : null;
    }
  })();

  const notice = approved
    ? { tone: 'success' as const, text: 'Khóa học đã được quản lý duyệt. Bạn vẫn có thể đọc lại nội dung bất cứ lúc nào.' }
    : course.blockReason
      ? { tone: 'warning' as const, text: BLOCK_MESSAGES[course.blockReason] }
      : course.access === 'FREE_FULL'
        ? { tone: 'success' as const, text: 'Toàn bộ mô đun và câu hỏi ôn tập của khóa Cơ bản được mở miễn phí.' }
        : { tone: 'success' as const, text: 'Suất học của bạn đã kích hoạt, mở toàn bộ mô đun, câu hỏi ôn tập và bài cuối khóa.' };

  return (
    <div className="pu-stack">
      <section className="pu-cover">
        <div>
          <Eyebrow>{course.tier === 1 ? 'Nền tảng miễn phí' : `${tier} · ${course.access === 'PREVIEW' ? 'cần suất học' : 'suất đã kích hoạt'}`}</Eyebrow>
          <h1>{course.title}</h1>
          <p>
            {detail.description?.trim()
              || `Khóa gồm ${modules.length} mô đun; mỗi mô đun có các trang nội dung và câu hỏi ôn tập. Sau khi hoàn thành, bạn nộp bài cuối khóa cho quản lý phòng ban chấm.`}
          </p>
          <div className="pu-cover-meta">
            <span>{pad2(modules.length)} mô đun</span>
            <span>{pad2(quizCount)} bài ôn tập mô đun</span>
            <span>01 bài cuối khóa</span>
          </div>
          {action && <PuLink to={action.to} kind="lime">{action.label}</PuLink>}
        </div>
        <img src={architectureArt} alt="Các khối kính xanh nối với nhau theo một con đường" />
      </section>

      <Notice tone={notice.tone}>{notice.text}</Notice>

      <div className="pu-overview">
        <section className="pu-outcome-card">
          <Mini>Kết quả</Mini>
          <h2>Học, kiểm tra và áp dụng vào công việc.</h2>
          <p>{detail.purpose?.trim() || `Áp dụng ${detail.domain.name.toLowerCase()} ở mức ${tier.toLowerCase()} với kết quả mà quản lý của bạn kiểm tra được.`}</p>
          {detail.learningOutcomes.length > 0 ? (
            <ul className="pu-outcome-list">
              {detail.learningOutcomes.slice(0, 4).map((outcome) => <li key={outcome}>{outcome}</li>)}
            </ul>
          ) : (
            <div className="pu-outcome-points">
              <span><b>01</b> Hiểu bối cảnh thực tế</span>
              <span><b>02</b> Đưa ra quyết định có thể kiểm tra</span>
              <span><b>03</b> Trình bày minh chứng theo vị trí</span>
            </div>
          )}
        </section>
        <section className="pu-access">
          <Mini>Tiến độ của bạn</Mini>
          <strong>{passed}<small>/{modules.length} mô đun</small></strong>
          <Bar value={modules.length ? (passed / modules.length) * 100 : 0} label="Mô đun đã qua" />
          <p>
            {detail.nextAction === 'BASELINE' ? 'Bắt đầu bằng bài kiểm tra đầu vào.'
              : approved ? 'Khóa đã hoàn thành và được ghi vào kết quả đã xác nhận.'
              : detail.nextAction === 'FINAL' ? 'Đã đạt câu hỏi ôn tập của mọi mô đun. Bài cuối khóa đã sẵn sàng.'
              : course.access === 'PREVIEW' ? 'Quyền xem toàn bộ mở khi có suất học phù hợp.'
              : 'Đạt câu hỏi ôn tập từng mô đun để đến bài cuối khóa.'}
          </p>
          <Pill tone={approved ? 'green' : course.access === 'PREVIEW' ? 'gray' : ''}>
            {approved ? 'Đã được duyệt' : ACCESS_LABELS[course.access]}
          </Pill>
        </section>
      </div>

      <section className="pu-modules" aria-labelledby="pu-modules-title">
        <div className="pu-section-head">
          <div>
            <Mini>Nội dung khóa học</Mini>
            <h2 id="pu-modules-title">Học các mô đun theo thứ tự.</h2>
            <p>Đọc các trang nội dung, áp dụng vào công việc và đạt câu hỏi ôn tập của từng mô đun.</p>
          </div>
          <span className="pu-count">{passed}/{modules.length} bài ôn tập đạt</span>
        </div>
        <div className="pu-module-grid">
          {modules.map((module) => (
            <ModuleCard key={module.moduleId} module={module} detail={detail} isNext={module.moduleId === firstOpen?.moduleId} />
          ))}
        </div>
      </section>

      <section className="pu-final-strip">
        <div className="pu-final-symbol" aria-hidden><Check size={30} strokeWidth={3} /></div>
        <div>
          <Mini>Sau các mô đun</Mini>
          <h2>Bài cuối khóa</h2>
          <p>Trình bày nguồn, cách làm có thể kiểm tra và bước tiếp theo. Quản lý phòng ban chấm bài kèm lý do; kết quả được ghi vào hồ sơ năng lực.</p>
          <div className="pu-criteria-chips">
            {detail.finalCriteria.map((criterion) => <span key={criterion.number}>{criterion.title}</span>)}
          </div>
        </div>
        <PuLink to={PULSE_PATHS.final(course.courseId)} kind="outline">
          {detail.nextAction === 'FINAL' ? 'Mở bài cuối khóa →' : 'Xem tiêu chí bài cuối →'}
        </PuLink>
      </section>

      <div className="pu-course-footer">
        <PuLink to={PULSE_PATHS.path} kind="ghost" small>← Quay lại lộ trình của tôi</PuLink>
        <small>Khóa {course.code} · phiên bản v{detail.versionNo} · {detail.domain.name} / {tier}</small>
      </div>
    </div>
  );
}

function ModuleCard({ module, detail, isNext }: { module: PulseCourseModule; detail: PulseCourseDetail; isNext: boolean }) {
  const { course } = detail;
  const preview = course.access === 'PREVIEW';
  const badge = module.passed ? { text: 'Đã đạt câu ôn tập', tone: 'green' as const }
    : !module.viewable ? { text: 'Chưa mở', tone: 'gray' as const }
    : preview ? { text: 'Xem trước', tone: '' as const }
    : !module.unlocked ? { text: 'Theo thứ tự', tone: 'gray' as const }
    : { text: isNext ? 'Tiếp theo' : 'Sẵn sàng', tone: '' as const };

  return (
    <article className={`pu-module-card${module.passed ? ' passed' : ''}`}>
      <div className="pu-module-top">
        <span>Mô đun {pad2(module.index + 1)}</span>
        <Pill tone={badge.tone}>{badge.text}</Pill>
      </div>
      <h3>{module.title}</h3>
      {module.description && <p>{module.description}</p>}
      <div className="pu-module-format">
        <span><FileText size={13} /> {module.slideCount} trang{module.estimatedMinutes ? ` · ${module.estimatedMinutes} phút` : ''}</span>
        {module.hasQuiz && <span><HelpCircle size={13} /> {module.quizQuestionCount} câu ôn tập</span>}
      </div>
      {module.viewable ? (
        <PuLink to={PULSE_PATHS.module(course.courseId, module.moduleId)} kind="outline" small>
          {preview ? 'Xem trang mẫu →' : module.passed ? 'Ôn lại mô đun →' : 'Mở mô đun →'}
        </PuLink>
      ) : (
        <span className="pu-locked"><Lock size={13} /> Xem được đề cương · cần suất học</span>
      )}
    </article>
  );
}
