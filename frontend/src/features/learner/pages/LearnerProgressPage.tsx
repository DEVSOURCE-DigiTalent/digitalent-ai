import React from 'react';
import { TrendingUp, Award, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LearnerProgressPage: React.FC = () => {
  return (
    <div data-testid="learner-progress-page" className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="border-b pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Hồ sơ năng lực cá nhân</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Tiến độ tích lũy kỹ năng</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi sự gia tăng năng lực theo các chuẩn tiêu chí DigiComp AI qua từng bài học và bài tập thực hành.
          </p>
        </div>
        <Link
          to="/learn/certificates"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
        >
          <Award className="w-4 h-4" />
          Xem chứng chỉ đã cấp
        </Link>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Giờ học tích lũy</span>
          <p className="text-3xl font-extrabold text-blue-600">28.5 giờ</p>
          <p className="text-xs text-slate-400">Đạt 95% mục tiêu tháng này</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Bài tập thực hành đã nộp</span>
          <p className="text-3xl font-extrabold text-indigo-600">12 / 14</p>
          <p className="text-xs text-slate-400">Điểm trung bình thực hành: 88/100</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Tiến độ mục tiêu AI Prompt Engineer</span>
          <p className="text-3xl font-extrabold text-emerald-600">72%</p>
          <p className="text-xs text-slate-400">Dự kiến hoàn thành trong 3 tuần</p>
        </div>
      </div>

      {/* Competency Gap breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Tiến trình đạt chuẩn các tiêu chí năng lực
        </h2>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">1. Thiết kế và Tối ưu Câu lệnh (Prompt Design & Optimization)</span>
              <span className="text-blue-600 font-bold">85% (Level 4/5)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '85%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">2. Kiến trúc Quy trình LLM & RAG (Workflow & RAG)</span>
              <span className="text-indigo-600 font-bold">60% (Level 3/5)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '60%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">3. An toàn, Đạo đức & Guardrails trong AI</span>
              <span className="text-amber-600 font-bold">45% (Level 2/5)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
