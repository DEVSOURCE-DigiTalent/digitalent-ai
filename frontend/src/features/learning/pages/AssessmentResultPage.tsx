import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { AttemptResultDto } from '@/services/learning.service';
import { useAssessment } from '@/hooks/use-learning';

export function AssessmentResultPage() {
  const { id } = useParams<{ id: string }>();
  const { data: assessment } = useAssessment(id);
  const [result, setResult] = useState<AttemptResultDto | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`dt_last_result_${id}`);
      if (saved) setResult(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, [id]);

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <Award className="size-12 text-slate-400 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Không tìm thấy kết quả gần nhất</h1>
        <p className="text-sm text-slate-500">
          Hãy hoàn thành bài đánh giá hoặc xem lại trong Lịch sử đánh giá của bạn.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/enterprise/me/assessments"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Lịch sử đánh giá
          </Link>
          <Link
            to="/enterprise/me/learning"
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            Học tập của tôi
          </Link>
        </div>
      </div>
    );
  }

  const { passed, score, passPercentage, correctCount, totalQuestions, certificate, questions } = result;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Banner Result */}
      <div
        className={`rounded-3xl border p-8 text-center space-y-4 ${
          passed
            ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200'
            : 'bg-gradient-to-b from-rose-50 to-white border-rose-200'
        }`}
      >
        <div
          className={`size-20 rounded-full flex items-center justify-center mx-auto shadow-md ${
            passed
              ? 'bg-emerald-600 text-white shadow-emerald-500/30'
              : 'bg-rose-600 text-white shadow-rose-500/30'
          }`}
        >
          {passed ? <Award className="size-10" /> : <XCircle className="size-10" />}
        </div>

        <div className="space-y-1">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {passed ? 'Đạt chuẩn năng lực' : 'Chưa đạt yêu cầu'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {passed ? 'Chúc mừng bạn đã hoàn thành bài thi!' : 'Hãy ôn tập và thử lại nhé!'}
          </h1>
          <p className="text-sm text-slate-600">
            {assessment?.courseTitle ?? 'Bài đánh giá năng lực số Thông tư 02'}
          </p>
        </div>

        {/* Score metrics */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-black text-slate-900">{score}%</p>
            <p className="text-xs text-slate-500 font-medium">Điểm số đạt được</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-black text-slate-900">
              {correctCount}/{totalQuestions}
            </p>
            <p className="text-xs text-slate-500 font-medium">Câu trả lời đúng</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-black text-slate-900">{passPercentage}%</p>
            <p className="text-xs text-slate-500 font-medium">Điểm chuẩn qua môn</p>
          </div>
        </div>
      </div>

      {/* Certificate & Profile Update Notice (if passed) */}
      {passed && certificate && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
              <Sparkles className="size-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                Chứng nhận số chính thức
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Mã chứng chỉ: {certificate.certificateCode}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Hồ sơ năng lực của bạn đã được cập nhật tự động lên hệ thống doanh nghiệp.
              </p>
            </div>
          </div>
          <Link
            to="/enterprise/me/certificates"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition"
          >
            <span>Xem chứng nhận</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* Review Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>Chi tiết câu hỏi & giải thích đáp án</span>
          <span className="text-xs font-normal text-slate-500">
            Bấm vào câu hỏi để xem lời giải
          </span>
        </h2>

        <div className="space-y-3">
          {questions.map((q, idx) => {
            const isExpanded = expandedQuestion === q.id;
            return (
              <div
                key={q.id}
                className="border border-slate-200 rounded-xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                  className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100/80 transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {q.isCorrect ? (
                      <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="size-5 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                        Câu {idx + 1}: {q.questionText}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Chuẩn năng lực: TT02-{q.competencyCode}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="size-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white border-t border-slate-100 space-y-3 text-sm">
                    <p className="font-medium text-slate-900">{q.questionText}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isCorrectOpt = optIdx === q.correctOptionIndex;
                        const isChosen = optIdx === q.selectedOptionIndex;
                        let optionClass = 'border-slate-100 bg-slate-50 text-slate-600';
                        if (isCorrectOpt) optionClass = 'border-emerald-200 bg-emerald-50 text-emerald-900 font-medium';
                        else if (isChosen && !isCorrectOpt) optionClass = 'border-rose-200 bg-rose-50 text-rose-900';

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-lg border text-xs sm:text-sm flex items-start gap-2.5 ${optionClass}`}
                          >
                            <span className="size-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-current">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrectOpt && (
                              <span className="text-xs font-bold text-emerald-700 shrink-0">
                                Đáp án đúng
                              </span>
                            )}
                            {isChosen && !isCorrectOpt && (
                              <span className="text-xs font-bold text-rose-700 shrink-0">
                                Bạn đã chọn
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 leading-relaxed">
                      <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <Link
          to="/enterprise/me/learning"
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition"
        >
          Về danh sách khóa học
        </Link>
        <div className="flex gap-3">
          {!passed && (
            <Link
              to={`/enterprise/me/assessments/${id}/attempt`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm transition"
            >
              <RotateCcw className="size-4" />
              <span>Làm lại bài thi</span>
            </Link>
          )}
          <Link
            to="/enterprise/me/profile"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium text-sm rounded-xl transition"
          >
            <span>Hồ sơ năng lực cá nhân</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
