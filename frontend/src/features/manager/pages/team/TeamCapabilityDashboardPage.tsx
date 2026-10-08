import { Link } from 'react-router-dom';
import {
  Users, Brain, ClipboardList, ArrowRight,
  TrendingUp, AlertTriangle, Inbox, Sparkles, Clock,
} from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/shared';
import { useEmployees } from '@/hooks/use-employees';
import { usePracticalTasks, useReviewQueue } from '@/hooks/use-tasks';
import { useCapabilityDashboard } from '@/hooks/use-analytics';
import { useAssignmentSummary } from '@/hooks/use-assignments';

/**
 * MG-01: Team Capability Dashboard
 * Bảng điều khiển năng lực của nhóm dành cho Quản lý (Manager).
 * Thể hiện: headcount, phân bố cấp bậc, gap lớn, đào tạo đang chạy, quá hạn, bài chờ duyệt.
 * Hiển thị empty state hướng dẫn liên hệ Owner nếu Manager chưa phụ trách phòng ban nào.
 */
export function TeamCapabilityDashboardPage() {
  const { data: empData, isLoading: empLoading, isError: empError } = useEmployees();
  const { data: taskData } = usePracticalTasks();
  const { data: reviewData } = useReviewQueue();
  const { data: dashboardData } = useCapabilityDashboard();
  const { data: assignmentSummary } = useAssignmentSummary();

  const employees = empData?.items ?? [];
  const tasks = taskData?.items ?? [];
  const pendingReviews = reviewData?.totalItems ?? 0;

  const activeEmployees = employees.filter((employee) => employee.status === 'ACTIVE').length;

  // Active & overdue training from assignment summary
  const inProgressTraining = assignmentSummary?.inProgress ?? 0;
  const overdueTraining = assignmentSummary?.overdue ?? 0;

  if (empError) {
    return <div className="space-y-6 pb-12"><PageHeader title="Bảng năng lực của nhóm" subtitle="Theo dõi năng lực và đào tạo của nhân sự thuộc phạm vi quản lý." /><p role="alert" className="rounded-xl border border-red-200 p-4 text-red-700">Không tải được danh sách nhân sự từ BE2. Vui lòng thử lại sau.</p></div>;
  }

  if (!empLoading && employees.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Bảng năng lực của nhóm"
          subtitle="Theo dõi tiến độ phát triển năng lực số theo Khung chuẩn và quản lý bài tập thực hành của đội ngũ."
        />
        <div className="py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <EmptyState
            icon={<Users className="size-12 text-slate-400 mx-auto" />}
            title="Bạn chưa được phân công phụ trách phòng ban nào"
            description="Tài khoản quản lý của bạn hiện chưa được gắn làm Quản lý cho phòng ban nào trong tổ chức. Vui lòng liên hệ Quản trị viên (Owner) để được phân công quản lý bộ phận và nhân sự."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Bảng năng lực của nhóm"
          subtitle="Theo dõi tiến độ phát triển năng lực số theo Khung chuẩn và quản lý bài tập thực hành của đội ngũ."
        />
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/enterprise/reviews"
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition"
          >
            <Inbox className="size-4 text-amber-500" />
            <span>Hàng chờ chấm ({pendingReviews})</span>
          </Link>
          <Link
            to="/enterprise/tasks/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition"
          >
            <ClipboardList className="size-4" />
            <span>Giao bài tập mới</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Headcount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng nhân sự nhóm</span>
            <Users className="size-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{dashboardData?.kpis?.employees ?? empData?.totalItems ?? employees.length}</div>
          <p className="text-xs text-slate-500">Nhân sự trong phạm vi quản lý</p>
        </div>

        {/* Coverage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Tỷ lệ đạt chuẩn năng lực</span>
            <TrendingUp className="size-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {dashboardData?.kpis ? `${Math.round(dashboardData.kpis.averageCoverage)}%` : '—'}
          </div>
          <p className="text-xs text-emerald-700 font-medium">Theo phân tích năng lực mới nhất</p>
        </div>

        {/* High Gap */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Nhân sự có Gap lớn</span>
            <AlertTriangle className="size-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {dashboardData?.kpis?.employeesWithHigh ?? '—'}
          </div>
          <p className="text-xs text-slate-500">Cần ưu tiên bồi dưỡng năng lực</p>
        </div>

        {/* Tasks & Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Bài thực hành & Chờ chấm</span>
            <ClipboardList className="size-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{tasks.length}</div>
          <p className="text-xs text-slate-500">{pendingReviews} bài nộp đang chờ chấm</p>
        </div>
      </div>

      {/* Grade distribution & Training monitor row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status is present in GET /employees; grade distribution is not returned by that API. */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Trạng thái nhân sự đang hiển thị
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <span className="text-xs font-semibold text-slate-500 block">Đang hoạt động</span>
              <span className="text-xl font-bold text-slate-900">{activeEmployees}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <span className="text-xs font-semibold text-slate-500 block">Khác</span>
              <span className="text-xl font-bold text-slate-900">{employees.length - activeEmployees}</span>
            </div>
          </div>
        </div>

        {/* Đào tạo đang chạy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Đào tạo đang chạy</span>
            <Brain className="size-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-600">{inProgressTraining}</div>
          <Link
            to="/enterprise/team/training"
            className="text-xs text-indigo-600 font-medium hover:underline inline-flex items-center gap-1"
          >
            <span>Theo dõi tiến độ</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Đào tạo quá hạn */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Đào tạo quá hạn</span>
            <Clock className="size-5 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-600">{overdueTraining}</div>
          <p className="text-xs text-slate-500">
            {overdueTraining > 0 ? 'Cần nhắc nhở nhân sự hoàn thành' : 'Đúng hạn tiến độ'}
          </p>
        </div>
      </div>

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Actions & Team Members Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Thành viên trong nhóm</h3>
                <p className="text-xs text-slate-500">Danh sách nhân sự và mức độ sẵn sàng năng lực.</p>
              </div>
              <Link
                to="/enterprise/team/members"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {employees.slice(0, 5).map((emp: any) => (
                <div key={emp.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                      {emp.fullName ? emp.fullName.charAt(0) : 'N'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{emp.fullName || 'Nhân sự'}</p>
                      <p className="text-xs text-slate-500 font-mono">
                        {emp.employeeCode || ''} {emp.jobGrade ? `· Cấp bậc ${emp.jobGrade}` : ''}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/enterprise/team/members/${emp.id}`}
                    className="text-xs font-medium text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Practical Tasks Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Bài tập thực hành gần đây</h3>
                <p className="text-xs text-slate-500">Các bài tập tình huống thực tế đang được triển khai.</p>
              </div>
              <Link
                to="/enterprise/tasks"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Quản lý nhiệm vụ</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 3).map((task: any) => (
                <div key={task.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Link
                      to={`/enterprise/tasks/${task.id}`}
                      className="font-semibold text-sm text-slate-900 hover:text-blue-600 transition"
                    >
                      {task.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {task.assignedEmployeesCount} nhân sự • {task.pendingReviewCount ?? 0} chờ duyệt
                    </p>
                  </div>
                  <Link
                    to={`/enterprise/tasks/${task.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 shrink-0"
                  >
                    Chi tiết
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick shortcuts and AI assistant suggestion */}
        <div className="space-y-6">
          {(dashboardData?.kpis?.employeesWithHigh ?? 0) > 0 && <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5" />
              <h4 className="font-bold text-sm">Nhân sự cần ưu tiên hỗ trợ</h4>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
              {dashboardData?.kpis?.employeesWithHigh} nhân sự có khoảng trống năng lực mức cao. Xem phân tích để quyết định phương án bồi dưỡng.
            </p>
            <Link
              to="/enterprise/team/skill-gap"
              className="inline-block mt-2 px-3.5 py-1.5 bg-white text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-50 transition shadow-sm"
            >
              Xem khoảng trống năng lực
            </Link>
          </div>}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm">Lối tắt thao tác nhanh</h4>
            <div className="space-y-2">
              <Link
                to="/enterprise/team/competency"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition text-xs font-semibold text-slate-800"
              >
                <span>Ma trận năng lực nhóm</span>
                <ArrowRight className="size-4 text-blue-600" />
              </Link>
              <Link
                to="/enterprise/team/skill-gap"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition text-xs font-semibold text-slate-800"
              >
                <span>Phân tích khoảng trống năng lực nhóm</span>
                <Brain className="size-4 text-blue-600" />
              </Link>
              <Link
                to="/enterprise/reviews"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition text-xs font-semibold text-slate-800"
              >
                <span>Duyệt minh chứng bài tập chờ chấm</span>
                <Inbox className="size-4 text-amber-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
