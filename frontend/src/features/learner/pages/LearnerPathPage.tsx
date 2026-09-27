import React from 'react';
import { Link } from 'react-router-dom';
import { Route, CheckCircle, Clock, ArrowRight, BookOpen } from 'lucide-react';

interface PathMilestone {
  id: string;
  stage: string;
  title: string;
  description: string;
  courses: {
    id: string;
    name: string;
    duration: string;
    completed: boolean;
  }[];
}

const mockMilestones: PathMilestone[] = [
  {
    id: 'm-01',
    stage: 'Giai đoạn 1',
    title: 'Nền tảng Prompting & Tư duy AI',
    description: 'Xây dựng nền móng vững chắc về cơ chế Transformer, tokenization và prompt structures cơ bản.',
    courses: [
      { id: 'crs-01', name: 'Kỹ nghệ Câu lệnh AI Nâng cao (Prompt Engineering)', duration: '6 giờ', completed: false },
      { id: 'crs-02', name: 'Tư duy Đặt câu hỏi và Phân rã bài toán', duration: '4 giờ', completed: true },
    ],
  },
  {
    id: 'm-02',
    stage: 'Giai đoạn 2',
    title: 'Quy trình LLM & Tích hợp RAG',
    description: 'Ứng dụng các thư viện điều phối LangChain/LlamaIndex và kiến trúc tìm kiếm ngữ nghĩa vector.',
    courses: [
      { id: 'crs-03', name: 'Kiến trúc RAG từ cơ bản đến ứng dụng thực tiễn', duration: '8 giờ', completed: false },
      { id: 'crs-04', name: 'Đánh giá chất lượng và Guardrails cho LLM', duration: '5 giờ', completed: false },
    ],
  },
  {
    id: 'm-03',
    stage: 'Giai đoạn 3',
    title: 'Dự án Capstone & Khảo thí Chứng chỉ',
    description: 'Thực chiến xây dựng ứng dụng AI hoàn chỉnh và thi chứng chỉ chuẩn DigiTalent AI Certified Prompt Specialist.',
    courses: [
      { id: 'crs-05', name: 'Dự án tốt nghiệp: Trợ lý AI Enterprise đa tác vụ', duration: '12 giờ', completed: false },
    ],
  },
];

export const LearnerPathPage: React.FC = () => {
  return (
    <div data-testid="learner-path-page" className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="border-b pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Route className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Lộ trình cá nhân hóa</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Lộ trình học tập mục tiêu</h1>
          <p className="text-sm text-slate-500 mt-1">
            Được xây dựng dựa trên kết quả đánh giá năng lực đầu vào hướng tới chuẩn AI Prompt Engineer.
          </p>
        </div>
        <div className="text-sm text-slate-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
          Tiến độ lộ trình: <strong className="text-emerald-700 font-bold">25% (1/4 khóa học)</strong>
        </div>
      </div>

      {/* Milestones timeline */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200">
        {mockMilestones.map((m) => (
          <div key={m.id} className="relative pl-10">
            <div className="absolute left-2.5 top-2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-blue-600" />
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{m.stage}</span>
              <h2 className="text-lg font-bold text-slate-800 mt-1 mb-1">{m.title}</h2>
              <p className="text-sm text-slate-500 mb-4">{m.description}</p>

              <div className="space-y-3">
                {m.courses.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200/60"
                  >
                    <div className="flex items-center gap-3">
                      {c.completed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <Link
                          to={`/learn/courses/${c.id}`}
                          className="font-semibold text-sm text-slate-800 hover:text-blue-600 transition"
                        >
                          {c.name}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>Mã: {c.id}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {c.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/learn/courses/${c.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Chi tiết
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link
                        to={`/learn/classroom/${c.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition"
                      >
                        Vào học
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
