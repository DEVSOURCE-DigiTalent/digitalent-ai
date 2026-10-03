import { Link } from 'react-router-dom';
import {
  Award, ClipboardList, Target, TrendingUp,
  ArrowRight, Sparkles, Clock, PlayCircle,
} from 'lucide-react';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useCertificates } from '@/hooks/use-learning';
import { useMyTasks } from '@/hooks/use-tasks';
import { useCurrentUser } from '@/hooks/use-current-user';

export function MyDevelopmentDashboardPage() {
  const user = useCurrentUser((s) => s.user);
  const { data: certData } = useCertificates();
  const { data: taskData } = useMyTasks();

  const certificates = certData?.items ?? [];
  const tasks = taskData?.items ?? [];
  const activeTasks = tasks.filter((t) => !t.submission || t.submission.status === 'REVISION_REQUESTED');

  const initialAssessmentKey = user ? `dt_initial_assessment_${user.id}` : 'dt_initial_assessment';
  const savedAssessment = typeof window !== 'undefined' ? localStorage.getItem(initialAssessmentKey) : null;
  const assessmentData = savedAssessment ? JSON.parse(savedAssessment) : null;

  return (
    <div className="space-y-6 pb-16">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="size-3.5" /> Lộ trình phát triển năng lực số 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bảng phát triển của tôi
          </h1>
          <p className="text-sm text-blue-100 leading-relaxed">
            Xin chào, {user?.fullName || 'Học viên'}! Hệ thống đang đồng bộ tiến độ học tập và bài thực hành thực tế của bạn theo chuẩn khung năng lực số Thông tư 02/2025.
          </p>
        </div>
      </div>

      {/* Initial Assessment Banner */}
      {!assessmentData ? (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 uppercase tracking-wide">
                Chưa đánh giá
              </span>
              <h2 className="text-lg font-bold text-amber-950">Bài test đánh giá năng lực hiện tại</h2>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">
              Bạn chưa thực hiện bài test đánh giá năng lực hiện tại. Hãy dành ~5 phút làm bài để hệ thống phân tích khoảng trống năng lực (Skill Gap) và kích hoạt lộ trình đào tạo cá nhân hóa chính xác nhất!
            </p>
          </div>
          <Link
            to="/enterprise/initial-assessment"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-all shadow-md shrink-0 cursor-pointer"
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
              Đã hoàn thành đánh giá năng lực đầu vào ({assessmentData.score}/{assessmentData.total} câu đạt - {assessmentData.percentage}%). Lộ trình đào tạo đã được thiết lập.
            </span>
          </div>
          <Link
            to="/enterprise/initial-assessment"
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 shrink-0"
          >
            Xem lại kết quả & Làm lại
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Cấp độ hiện tại</span>
            <Target className="size-5 text-blue-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-slate-900">Cấp độ 2</span>
            <LevelBadge level={2} />
          </div>
          <p className="text-xs text-slate-500">Mục tiêu vị trí: Cấp độ 3</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Chứng nhận đã cấp</span>
            <Award className="size-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{certificates.length}</div>
          <Link
            to="/enterprise/me/achievements"
            className="text-xs font-semibold text-blue-600 hover:underline inline-block"
          >
            Xem sổ chứng nhận &rarr;
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Nhiệm vụ cần làm</span>
            <ClipboardList className="size-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{activeTasks.length}</div>
          <Link
            to="/enterprise/me/tasks"
            className="text-xs font-semibold text-blue-600 hover:underline inline-block"
          >
            Nộp minh chứng &rarr;
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Mức độ sẵn sàng</span>
            <TrendingUp className="size-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-600">82%</div>
          <Link
            to="/enterprise/me/skill-gap"
            className="text-xs font-semibold text-blue-600 hover:underline inline-block"
          >
            Xem phân tích Gap &rarr;
          </Link>
        </div>
      </div>

      {/* Main Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active tasks & Next courses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Practical Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Bài thực hành đang thực hiện</h3>
                <p className="text-xs text-slate-500">Áp dụng kiến thức số vào công việc và nộp minh chứng.</p>
              </div>
              <Link
                to="/enterprise/me/tasks"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {tasks.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">Bạn không có bài thực hành nào đang chờ.</p>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 2).map((t) => (
                  <div key={t.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm text-slate-900">{t.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{t.expectedOutput}</p>
                    </div>
                    <Link
                      to={`/enterprise/me/tasks/${t.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 shadow-sm transition"
                    >
                      <span>Nộp bài</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick learning link */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Khóa đào tạo của tôi</h3>
                <p className="text-xs text-slate-500">Tiếp tục hoàn thành bài học và chuẩn bị kiểm tra đánh giá.</p>
              </div>
              <Link
                to="/enterprise/me/learning"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Vào học tập</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <PlayCircle className="size-8 text-blue-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Khóa học An toàn & Bảo mật thông tin số TT02</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Tiến độ: 80% • Còn 1 bài học và bài kiểm tra trắc nghiệm</p>
                </div>
              </div>
              <Link
                to="/enterprise/me/learning"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shrink-0 shadow-sm transition"
              >
                Tiếp tục học
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Quick shortcuts */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm">Lối tắt phát triển</h4>
            <div className="space-y-2">
              <Link
                to="/enterprise/me/profile"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition text-xs font-semibold text-slate-800"
              >
                <span>Hồ sơ năng lực của tôi</span>
                <Target className="size-4 text-blue-600" />
              </Link>
              <Link
                to="/enterprise/me/skill-gap"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition text-xs font-semibold text-slate-800"
              >
                <span>Khoảng trống năng lực cần bù đắp</span>
                <TrendingUp className="size-4 text-purple-600" />
              </Link>
              <Link
                to="/enterprise/me/assessments"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition text-xs font-semibold text-slate-800"
              >
                <span>Lịch sử các bài kiểm tra</span>
                <Clock className="size-4 text-emerald-600" />
              </Link>
              <Link
                to="/enterprise/me/achievements"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition text-xs font-semibold text-slate-800"
              >
                <span>Chứng nhận số đã được cấp</span>
                <Award className="size-4 text-amber-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
