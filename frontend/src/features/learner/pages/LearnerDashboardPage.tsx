import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Target, CheckCircle2, TrendingUp, Award, PlayCircle, ArrowRight } from 'lucide-react';

export const LearnerDashboardPage: React.FC = () => {
  return (
    <div data-testid="learner-dashboard" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white rounded-2xl p-8 shadow-md">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
            Học tập theo khung năng lực
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Chào mừng trở lại với DigiTalent AI
          </h1>
          <p className="text-blue-100 text-sm md:text-base mb-6">
            Theo dõi lộ trình phát triển kỹ năng cá nhân hóa, hoàn thành bài đánh giá chẩn đoán và bứt phá sự nghiệp công nghệ.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/learn/path"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition"
            >
              Tiếp tục lộ trình
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/learn/diagnostic"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600/40 text-white font-medium text-sm border border-white/30 hover:bg-blue-600/60 transition"
            >
              Đánh giá năng lực
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Khóa học đang học</p>
            <p className="text-2xl font-bold text-slate-800">3</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Mục tiêu vị trí</p>
            <p className="text-lg font-bold text-slate-800 truncate max-w-[150px]">AI Prompt Eng</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tiến độ tổng thể</p>
            <p className="text-2xl font-bold text-emerald-600">68%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Chứng chỉ đạt được</p>
            <p className="text-2xl font-bold text-slate-800">2</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Các phân hệ học tập</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/learn/target"
            className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                <Target className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold text-blue-600">Bước 1</span>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Mục tiêu nghề nghiệp</h3>
            <p className="text-sm text-slate-500">Xác định vị trí mục tiêu và chuẩn khung năng lực mong muốn.</p>
          </Link>

          <Link
            to="/learn/diagnostic"
            className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold text-indigo-600">Bước 2</span>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Đánh giá chẩn đoán</h3>
            <p className="text-sm text-slate-500">Kiểm tra năng lực đầu vào và phân tích khoảng cách kỹ năng kỹ thuật.</p>
          </Link>

          <Link
            to="/learn/path"
            className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
                <TrendingUp className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold text-emerald-600">Bước 3</span>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Lộ trình học tập</h3>
            <p className="text-sm text-slate-500">Kế hoạch học tập tối ưu được AI thiết kế riêng cho mục tiêu của bạn.</p>
          </Link>
        </div>
      </div>

      {/* Current In-progress Course */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Khóa học đang tiếp diễn</h2>
          <Link to="/learn/courses/crs-01" className="text-sm font-medium text-blue-600 hover:underline">
            Xem tất cả khóa học
          </Link>
        </div>
        <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Mã khóa: crs-01</span>
            <h3 className="font-bold text-slate-800 text-base">Kỹ nghệ Câu lệnh AI Nâng cao (Prompt Engineering Masterclass)</h3>
            <p className="text-xs text-slate-500">Bài 4 / 12: Chain-of-Thought và Few-shot Prompting</p>
            <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/learn/classroom/crs-01"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              <PlayCircle className="w-4 h-4" />
              Vào học ngay
            </Link>
            <Link
              to="/learn/courses/crs-01"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            >
              Chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
