import { Link } from 'react-router-dom';
import {
  Award, ClipboardList, Target, TrendingUp, ArrowRight, Sparkles, Clock, PlayCircle, AlertCircle, CalendarClock, FileCheck,
} from 'lucide-react';
import { EmptyState, StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMyDashboard } from '@/hooks/use-me';
import { skillGapReasonMessage } from '@/lib/competency-levels';
import { formatDate } from '@/lib/utils';
import { taskStatus } from '@/lib/me-labels';

/** EM-01 — Bảng phát triển của tôi: năng lực, khóa đang học, nhiệm vụ, bài đánh giá và hạn sắp tới. */
export function MyDevelopmentDashboardPage() {
  const user = useCurrentUser((s) => s.user);
  const { data, isLoading, isError, refetch } = useMyDashboard();

  const initialAssessmentKey = user ? `dt_initial_assessment_${user.id}` : 'dt_initial_assessment';
  const savedAssessment = typeof window !== 'undefined' ? localStorage.getItem(initialAssessmentKey) : null;
  const assessmentData = savedAssessment ? JSON.parse(savedAssessment) : null;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-16" aria-label="Đang tải bảng phát triển">
        <div className="h-36 bg-slate-100 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-12 text-slate-300 mx-auto" />}
        title="Không tải được bảng phát triển"
        description="Có lỗi khi tải dữ liệu cá nhân của bạn. Vui lòng thử lại."
        action={
          <button type="button" onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Thử lại
          </button>
        }
      />
    );
  }

  const { employee, competency, continueLearning, tasks, activeTasks, assessments, nextAssessment, upcomingDeadlines } = data;
  const summary = competency.summary;
  const currentLevel = competency.averageCurrentLevel ?? null;

  return (
    <div className="space-y-6 pb-16">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="size-3.5" /> Lộ trình phát triển năng lực số
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Bảng phát triển của tôi</h1>
          <p className="text-sm text-blue-100 leading-relaxed">
            Xin chào, {employee.fullName || user?.fullName || 'bạn'}!
            {employee.jobPositionName ? ` Vị trí ${employee.jobPositionName}` : ''}
            {employee.departmentName ? ` · ${employee.departmentName}` : ''}.
            {' '}Theo dõi năng lực theo chuẩn vị trí, việc học và nhiệm vụ thực tế của bạn tại đây.
          </p>
        </div>
      </div>

      {/* Initial Assessment Banner (bài test đầu vào — luồng onboarding) */}
      {!assessmentData ? (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 uppercase tracking-wide">Chưa đánh giá</span>
              <h2 className="text-lg font-bold text-amber-950">Bài test đánh giá năng lực hiện tại</h2>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">
              Dành ~5 phút làm bài test đầu vào để hệ thống hiểu rõ năng lực hiện tại và gợi ý lộ trình phù hợp hơn.
            </p>
          </div>
          <Link
            to="/enterprise/initial-assessment"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-all shadow-md shrink-0"
          >
            <span>Làm bài test ngay</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900 text-sm">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-emerald-600 shrink-0" />
            <span>
              Đã hoàn thành đánh giá năng lực đầu vào ({assessmentData.score}/{assessmentData.total} câu đạt - {assessmentData.percentage}%).
            </span>
          </div>
          <Link to="/enterprise/initial-assessment" className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 shrink-0">
            Xem lại kết quả & Làm lại
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Năng lực đạt chuẩn</span>
            <Target className="size-5 text-blue-600" />
          </div>
          {summary ? (
            <>
              <div className="text-3xl font-black text-slate-900">
                {summary.totalMet}<span className="text-lg text-slate-400 font-bold"> / {summary.totalRequired}</span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                Mức hiện tại TB: <LevelBadge level={currentLevel ? Math.round(currentLevel) : 0} /> · yêu cầu TB {competency.averageRequiredLevel ?? '—'}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">{competency.skipReason ? skillGapReasonMessage(competency.skipReason) : 'Chưa có dữ liệu.'}</p>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Mức đáp ứng chuẩn vị trí</span>
            <TrendingUp className="size-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-600">{summary ? `${summary.coveragePercent}%` : '—'}</div>
          <Link to="/enterprise/me/skill-gap" className="text-xs font-semibold text-blue-600 hover:underline inline-block">
            Xem khoảng trống ({summary?.totalGap ?? 0}) &rarr;
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Nhiệm vụ cần làm</span>
            <ClipboardList className="size-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{tasks.toDo}</div>
          <p className="text-xs text-slate-500">
            {tasks.pendingReview} đang chờ chấm{tasks.overdue > 0 ? ` · ${tasks.overdue} quá hạn` : ''}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Chứng nhận còn hiệu lực</span>
            <Award className="size-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{data.validCertificates}</div>
          <Link to="/enterprise/me/achievements" className="text-xs font-semibold text-blue-600 hover:underline inline-block">
            Xem thành tựu &rarr;
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Continue learning */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Khóa đào tạo của tôi</h3>
                <p className="text-xs text-slate-500">
                  {data.courses.inProgress} đang học · {data.courses.notStarted} chưa bắt đầu · {data.courses.completed} đã hoàn thành
                </p>
              </div>
              <Link to="/enterprise/me/courses" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <span>Vào học tập</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {continueLearning ? (
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <PlayCircle className="size-8 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {continueLearning.courseCode} · {continueLearning.courseTitle}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Tiến độ {continueLearning.progressPercent}% · {continueLearning.completedLessons}/{continueLearning.totalLessons} bài
                      {continueLearning.nextLessonTitle ? ` · Tiếp theo: ${continueLearning.nextLessonTitle}` : ''}
                    </p>
                    {continueLearning.dueDate && (
                      <p className={`text-xs mt-0.5 ${continueLearning.isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                        Hạn hoàn thành: {formatDate(continueLearning.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  to={continueLearning.nextLessonId
                    ? `/enterprise/me/courses/${continueLearning.courseId}/lessons/${continueLearning.nextLessonId}`
                    : `/enterprise/me/courses/${continueLearning.courseId}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shrink-0 shadow-sm transition text-center"
                >
                  {continueLearning.status === 'NOT_STARTED' ? 'Bắt đầu học' : 'Tiếp tục học'}
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">
                Bạn chưa có khóa học nào đang học.{' '}
                <Link to="/enterprise/me/learning-path" className="text-blue-600 font-semibold hover:underline">Xem lộ trình gợi ý</Link>
              </p>
            )}
          </section>

          {/* Active Practical Tasks */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Nhiệm vụ thực tế cần làm</h3>
                <p className="text-xs text-slate-500">Áp dụng kiến thức số vào công việc và nộp minh chứng.</p>
              </div>
              <Link to="/enterprise/me/tasks" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <span>Xem tất cả</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {activeTasks.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">Bạn không có nhiệm vụ nào cần nộp.</p>
            ) : (
              <div className="space-y-3">
                {activeTasks.map((t) => {
                  const status = taskStatus(t.status);
                  return (
                    <div key={t.assignmentId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm text-slate-900">{t.title}</h4>
                          <StatusBadge variant={status.variant} label={status.label} />
                        </div>
                        <p className={`text-xs ${t.isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                          Hạn nộp: {formatDate(t.dueAt)}{t.isOverdue ? ' (quá hạn)' : ''}
                        </p>
                      </div>
                      <Link
                        to={`/enterprise/me/tasks/${t.assignmentId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 shadow-sm transition"
                      >
                        <span>{t.status === 'NEEDS_REVISION' ? 'Nộp lại' : 'Nộp bài'}</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {competency.topGaps.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm">Năng lực cần ưu tiên</h4>
              <ul className="space-y-2">
                {competency.topGaps.map((gap) => (
                  <li key={gap.competencyId} className="p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="font-semibold text-slate-800">
                      <span className="font-mono text-blue-700">{gap.competencyCode}</span> {gap.competencyName}
                    </p>
                    <p className="text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <LevelBadge level={gap.currentLevel} /> → <LevelBadge level={gap.requiredLevel} />
                    </p>
                  </li>
                ))}
              </ul>
              <Link to="/enterprise/me/skill-gap" className="text-xs font-semibold text-blue-600 hover:underline inline-block">
                Xem toàn bộ khoảng trống &rarr;
              </Link>
            </section>
          )}

          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CalendarClock className="size-4 text-amber-500" /> Hạn sắp tới
            </h4>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-500">Không có hạn nào trong 30 ngày tới.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingDeadlines.map((d) => (
                  <li key={`${d.kind}-${d.targetId}`}>
                    <Link
                      to={d.kind === 'TASK' ? `/enterprise/me/tasks/${d.targetId}` : `/enterprise/me/courses/${d.targetId}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition text-xs"
                    >
                      <span className="font-medium text-slate-800 line-clamp-1">
                        {d.kind === 'TASK' ? 'Nhiệm vụ' : 'Khóa học'}: {d.title}
                      </span>
                      <span className={`shrink-0 font-semibold ${d.isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>{formatDate(d.dueAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm">Lối tắt phát triển</h4>
            <div className="space-y-2">
              {nextAssessment && (
                <Link
                  to={`/enterprise/me/assessments/${nextAssessment.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-blue-200 bg-blue-50/40 hover:border-blue-400 transition text-xs font-semibold text-slate-800"
                >
                  <span>{nextAssessment.status === 'IN_PROGRESS' ? 'Tiếp tục bài đánh giá' : 'Bài đánh giá nên làm'}: {nextAssessment.title}</span>
                  <FileCheck className="size-4 text-blue-600 shrink-0" />
                </Link>
              )}
              <Link to="/enterprise/me/competency" className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition text-xs font-semibold text-slate-800">
                <span>Hồ sơ năng lực của tôi</span>
                <Target className="size-4 text-blue-600" />
              </Link>
              <Link to="/enterprise/me/assessments" className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition text-xs font-semibold text-slate-800">
                <span>Bài đánh giá ({assessments.available + assessments.retake + assessments.inProgress} có thể làm)</span>
                <Clock className="size-4 text-emerald-600" />
              </Link>
              <Link to="/enterprise/me/achievements" className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition text-xs font-semibold text-slate-800">
                <span>Thành tựu & chứng nhận</span>
                <Award className="size-4 text-amber-500" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
