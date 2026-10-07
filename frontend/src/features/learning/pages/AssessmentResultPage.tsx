import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, ArrowRight, RotateCcw, Sparkles, ChevronDown, ChevronUp, Clock, EyeOff } from 'lucide-react';
import { useAttemptResult, useMyAssessment } from '@/hooks/use-me';
import { formatDuration } from '@/lib/me-labels';
import { apiErrorMessage, formatDate } from '@/lib/utils';

/**
 * EM-12: Kết quả đánh giá — điểm, đạt/chưa đạt, chứng chỉ (nếu có) và xem lại từng câu.
 * ?attempt=<id> chọn lần làm cụ thể; không có thì lấy lần đã chấm gần nhất của bài.
 */
export function AssessmentResultPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const attemptParam = searchParams.get('attempt') ?? undefined;
  const { data: assessment, isLoading: assessmentLoading } = useMyAssessment(attemptParam ? undefined : id);
  const attemptId = attemptParam ?? assessment?.latestAttemptId ?? undefined;
  const { data: result, isLoading, isError, error } = useAttemptResult(attemptId);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  if (isLoading || (assessmentLoading && !attemptParam)) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-6" aria-label="Đang tải kết quả">
        <div className="h-56 bg-slate-100 animate-pulse rounded-3xl" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!attemptId || isError || !result) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <Award className="size-12 text-slate-400 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Chưa có kết quả để hiển thị</h1>
        <p className="text-sm text-slate-500">
          {isError ? apiErrorMessage(error, 'Không tải được kết quả.') : 'Bạn chưa hoàn thành lần làm bài nào của bài đánh giá này.'}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/enterprise/me/assessments/history" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Lịch sử đánh giá
          </Link>
          <Link to="/enterprise/me/assessments" className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
            Danh sách bài đánh giá
          </Link>
        </div>
      </div>
    );
  }

  const { passed } = result;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className={`rounded-3xl border p-8 text-center space-y-4 ${
        passed ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200' : 'bg-gradient-to-b from-rose-50 to-white border-rose-200'
      }`}>
        <div className={`size-20 rounded-full flex items-center justify-center mx-auto shadow-md ${
          passed ? 'bg-emerald-600 text-white shadow-emerald-500/30' : 'bg-rose-600 text-white shadow-rose-500/30'
        }`}>
          {passed ? <Award className="size-10" /> : <XCircle className="size-10" />}
        </div>

        <div className="space-y-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {passed ? 'Đạt yêu cầu' : 'Chưa đạt yêu cầu'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {passed ? 'Chúc mừng bạn đã đạt bài đánh giá!' : 'Hãy ôn tập và thử lại nhé!'}
          </h1>
          <p className="text-sm text-slate-600">{result.assessmentTitle} · {result.courseCode} · Lần {result.attemptNo}</p>
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <Clock className="size-3.5" /> Nộp {formatDate(result.submittedAt)} · Thời gian làm {formatDuration(result.durationSeconds)}
            {result.autoSubmitted && ' · Hệ thống tự nộp khi hết giờ'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-black text-slate-900">{result.score}%</p>
            <p className="text-xs text-slate-500 font-medium">Điểm số đạt được</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-black text-slate-900">{result.correctCount}/{result.totalQuestions}</p>
            <p className="text-xs text-slate-500 font-medium">Câu trả lời đúng</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-black text-slate-900">{result.passingScore}%</p>
            <p className="text-xs text-slate-500 font-medium">Điểm chuẩn</p>
          </div>
        </div>
      </div>

      {result.certificate && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
              <Sparkles className="size-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Chứng chỉ nội bộ đã được cấp</span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">Mã chứng chỉ: {result.certificate.code}</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Bạn đã hoàn thành khóa {result.courseTitle}.
                {result.certificate.expiresAt ? ` Hiệu lực đến ${formatDate(result.certificate.expiresAt)}.` : ''}
                {' '}Để được xác nhận cấp độ năng lực, hãy hoàn thành nhiệm vụ thực tế được giao.
              </p>
            </div>
          </div>
          <Link to="/enterprise/me/achievements" className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition">
            <span>Xem chứng nhận</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
      {!result.certificate && result.courseCompleted && result.isFinal && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">Khóa học {result.courseTitle} đã hoàn thành.</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between gap-3">
          <span>Chi tiết câu hỏi</span>
          <span className="text-xs font-normal text-slate-500">Bấm vào câu hỏi để xem lại</span>
        </h2>
        {!result.revealAnswers && (
          <p className="text-xs text-slate-600 flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <EyeOff className="size-4 shrink-0 mt-0.5" />
            Đáp án đúng và lời giải sẽ hiển thị khi bạn đạt bài hoặc đã dùng hết số lượt làm.
          </p>
        )}

        <div className="space-y-3">
          {result.questions.map((q, idx) => {
            const isExpanded = expandedQuestion === q.id;
            return (
              <div key={q.id} className="border border-slate-200 rounded-xl overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                  className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100/80 transition flex items-center justify-between gap-4"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {q.isCorrect ? <CheckCircle2 className="size-5 text-emerald-600 shrink-0" aria-label="Đúng" /> : <XCircle className="size-5 text-rose-600 shrink-0" aria-label="Sai" />}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">Câu {idx + 1}: {q.text}</p>
                      {q.competencyCode && <p className="text-xs text-slate-500 mt-0.5">Năng lực: {q.competencyCode} {q.competencyName}</p>}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="size-4 text-slate-500 shrink-0" /> : <ChevronDown className="size-4 text-slate-500 shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white border-t border-slate-100 space-y-3 text-sm">
                    <p className="font-medium text-slate-900 whitespace-pre-line">{q.text}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isCorrectOpt = opt.id === q.correctOptionId;
                        const isChosen = opt.id === q.selectedOptionId;
                        let optionClass = 'border-slate-100 bg-slate-50 text-slate-600';
                        if (isCorrectOpt) optionClass = 'border-emerald-200 bg-emerald-50 text-emerald-900 font-medium';
                        else if (isChosen && !q.isCorrect) optionClass = 'border-rose-200 bg-rose-50 text-rose-900';
                        else if (isChosen) optionClass = 'border-emerald-200 bg-emerald-50 text-emerald-900 font-medium';
                        return (
                          <div key={opt.id} className={`p-3 rounded-lg border text-xs sm:text-sm flex items-start gap-2.5 ${optionClass}`}>
                            <span className="size-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-current">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt.content}</span>
                            {isCorrectOpt && <span className="text-xs font-bold text-emerald-700 shrink-0">Đáp án đúng</span>}
                            {isChosen && !isCorrectOpt && <span className={`text-xs font-bold shrink-0 ${q.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>Bạn đã chọn</span>}
                          </div>
                        );
                      })}
                      {!q.selectedOptionId && <p className="text-xs text-slate-500 italic">Bạn chưa trả lời câu này.</p>}
                    </div>
                    {q.explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 leading-relaxed">
                        <strong>Giải thích:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <Link to={`/enterprise/me/courses/${result.courseId}`} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition">
          Về khóa học
        </Link>
        <div className="flex gap-3 flex-wrap">
          {result.canRetake && (
            <Link
              to={`/enterprise/me/assessments/${result.assessmentId}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm transition"
            >
              <RotateCcw className="size-4" />
              <span>Làm lại bài{result.attemptsRemaining != null ? ` (còn ${result.attemptsRemaining} lượt)` : ''}</span>
            </Link>
          )}
          <Link to="/enterprise/me/competency" className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium text-sm rounded-xl transition">
            <span>Hồ sơ năng lực</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
