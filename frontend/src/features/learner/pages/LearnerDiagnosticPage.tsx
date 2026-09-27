import React, { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Question {
  id: number;
  text: string;
  competency: string;
  options: string[];
}

const mockQuestions: Question[] = [
  {
    id: 1,
    text: 'Kỹ thuật Prompting nào hiệu quả nhất để giảm thiểu hiện tượng ảo giác (hallucination) trong các bài toán reasoning phức tạp?',
    competency: 'Prompt Design & Optimization',
    options: [
      'Zero-shot prompting không kèm context',
      'Chain-of-Thought (CoT) prompting kết hợp few-shot examples',
      'Tăng giá trị temperature lên 1.0',
      'Rút ngắn prompt tối đa có thể',
    ],
  },
  {
    id: 2,
    text: 'Thành phần nào giữ vai trò truy xuất văn bản liên quan trong kiến trúc RAG chuẩn?',
    competency: 'LLM Workflow Architecture',
    options: [
      'Vector Database & Embedding Model',
      'Tokenizer độc lập',
      'UI Controller component',
      'CSS Layout Engine',
    ],
  },
];

export const LearnerDiagnosticPage: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelect = (qId: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  return (
    <div data-testid="learner-diagnostic-page" className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="border-b pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Đánh giá kỹ năng đầu vào</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Bài kiểm tra chẩn đoán năng lực</h1>
          <p className="text-sm text-slate-500 mt-1">
            Đánh giá mức độ thành thạo hiện tại theo chuẩn vị trí AI Prompt Engineer để xây dựng lộ trình học tập cá nhân.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Trạng thái:</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            submitted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {submitted ? 'Đã hoàn thành' : 'Đang thực hiện'}
          </span>
        </div>
      </div>

      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-emerald-900 flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-base">Kết quả phân tích chẩn đoán: Đạt 85/100</h3>
            <p className="text-sm text-emerald-800">
              Bạn có nền tảng vững chắc về Prompt Engineering. Khuyến nghị tập trung hoàn thành các học phần nâng cao về RAG và Guardrails.
            </p>
            <div className="pt-2">
              <Link
                to="/learn/path"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline"
              >
                Xem lộ trình được điều chỉnh riêng cho bạn
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-6">
        {mockQuestions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                Câu {idx + 1}
              </span>
              <span className="text-xs text-indigo-600 font-medium">{q.competency}</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-4">{q.text}</h3>

            <div className="space-y-2.5">
              {q.options.map((opt, optIdx) => {
                const isChecked = selectedAnswers[q.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelect(q.id, optIdx)}
                    className={`w-full text-left p-3.5 rounded-lg border text-sm transition flex items-center gap-3 ${
                      isChecked
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                      isChecked ? 'border-indigo-600 bg-indigo-600 text-white font-bold' : 'border-slate-300'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted && (
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition shadow-sm"
          >
            Nộp bài & Xem kết quả phân tích
          </button>
        </div>
      )}
    </div>
  );
};
