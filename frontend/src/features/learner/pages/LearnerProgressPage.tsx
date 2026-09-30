import React from 'react';
import {
  TrendingUp,
  Award,
  BarChart3,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface BadgeItem {
  id: string;
  name: string;
  category: string;
  earnedDate: string;
  description: string;
  iconBg: string;
}

const mockBadges: BadgeItem[] = [
  {
    id: 'bdg-01',
    name: 'Khởi Đầu Xuất Sắc',
    category: 'Onboarding',
    earnedDate: '15/07/2026',
    description: 'Hoàn thành bài kiểm tra chẩn đoán đầu vào với điểm số trên 80%.',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'bdg-02',
    name: 'Bậc Thầy Prompting',
    category: 'AI Skill',
    earnedDate: '05/08/2026',
    description: 'Nộp bài thực hành thiết kế System Prompt với JSON Schema đạt 92/100đ.',
    iconBg: 'bg-indigo-100 text-indigo-700',
  },
  {
    id: 'bdg-03',
    name: 'Đạt Chuẩn DigComp AI',
    category: 'Framework',
    earnedDate: '20/08/2026',
    description: 'Đạt mức Trung bình (bậc 3–4) ở cả 5 lĩnh vực kỹ năng số chuẩn hóa.',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'bdg-04',
    name: 'Chiến Binh Thực Nghiệm',
    category: 'Practical',
    earnedDate: '02/09/2026',
    description: 'Tích lũy hơn 25 giờ học thực hành trực tuyến và làm việc trong Sandbox.',
    iconBg: 'bg-amber-100 text-amber-700',
  },
];

export const LearnerProgressPage: React.FC = () => {
  return (
    <div data-testid="learner-progress-page" className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
        >
          <Award className="w-4 h-4" />
          <span>Xem chứng chỉ đã cấp</span>
        </Link>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Giờ học tích lũy</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-blue-600">28.5 giờ</p>
          <p className="text-xs text-slate-400">Đạt 95% mục tiêu tháng này</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bài tập thực hành đã nộp</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-indigo-600">12 / 14</p>
          <p className="text-xs text-slate-400">Điểm trung bình thực hành: 88/100</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tiến độ mục tiêu AI Prompt Engineer</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">72%</p>
          <p className="text-xs text-slate-400">Dự kiến hoàn thành trong 3 tuần</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Huy hiệu thành tích</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-amber-500">4 / 8</p>
          <p className="text-xs text-slate-400">Đã mở khóa 50% bộ sưu tập</p>
        </div>
      </div>

      {/* Competency Gap breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Tiến trình đạt chuẩn các tiêu chí năng lực</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Thang 3 mức: Cơ bản / Trung bình / Nâng cao (Thông tư 02/2025)</span>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-800">1. Thiết kế và Tối ưu Câu lệnh (Prompt Design & Optimization)</span>
              <span className="text-blue-600 font-bold">85% · Trung bình</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: '85%' }} />
            </div>
            <p className="text-[11px] text-slate-500">Thành thạo cấu trúc System prompt và Chain-of-Thought trong các bài toán thực tế.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-800">2. Kiến trúc Quy trình LLM & RAG (Workflow & RAG)</span>
              <span className="text-indigo-600 font-bold">60% · Trung bình</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: '60%' }} />
            </div>
            <p className="text-[11px] text-slate-500">Đang học phần tích hợp Vector DB và đánh giá tương đồng ngữ nghĩa.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-800">3. An toàn, Đạo đức & Guardrails trong AI</span>
              <span className="text-amber-600 font-bold">45% · Cơ bản</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '45%' }} />
            </div>
            <p className="text-[11px] text-slate-500">Cần bổ sung kiến thức về phòng chống Prompt Injection và tuân thủ Nghị định 13.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-800">4. Dữ liệu & Đánh giá Chất lượng Phản hồi (RAGAS Evaluation)</span>
              <span className="text-emerald-600 font-bold">75% · Trung bình</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: '75%' }} />
            </div>
            <p className="text-[11px] text-slate-500">Đo lường độ chính xác ngữ cảnh và tính trung thực của phản hồi.</p>
          </div>
        </div>
      </div>

      {/* Earned Badges Showcase */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Huy hiệu thành tích đã đạt được</span>
          </h2>
          <span className="text-xs text-slate-500">Chứng nhận năng lực vi mô (Micro-credentials)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockBadges.map((badge) => (
            <div
              key={badge.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-amber-300 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${badge.iconBg}`}>
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{badge.earnedDate}</span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{badge.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{badge.description}</p>
              </div>

              <div className="pt-2 border-t text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {badge.category}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Activity Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Nhật ký học tập gần đây</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Hoàn thành bài: 2. Zero-shot, Few-shot và System Prompts chuẩn xác</p>
              <span className="text-[11px] text-slate-400">Khóa crs-01 • Hôm nay, 19:45</span>
            </div>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">+40 phút</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Được chấm điểm bài tập: Xây dựng Few-shot Prompt phân loại cảm xúc</p>
              <span className="text-[11px] text-slate-400">Giảng viên phản hồi • 18/09/2026, 14:32</span>
            </div>
            <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">92/100 điểm</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Hoàn thành bài kiểm tra chẩn đoán năng lực khởi điểm</p>
              <span className="text-[11px] text-slate-400">Hệ thống AI Evaluator • 15/07/2026, 10:15</span>
            </div>
            <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">85/100 điểm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
