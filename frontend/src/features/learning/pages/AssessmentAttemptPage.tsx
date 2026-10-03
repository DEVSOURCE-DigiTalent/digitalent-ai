import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, Flag, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/shared/Modal';
import { useAssessment, useSubmitAttempt } from '@/hooks/use-learning';

export function AssessmentAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: assessment, isLoading, isError } = useAssessment(id);
  const submitMutation = useSubmitAttempt();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(20 * 60); // 20 mins default
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const startTimeRef = useRef<string>(new Date().toISOString());

  const storageKey = `dt_assessment_attempt_${id}`;

  // Restore state from sessionStorage if available
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.flagged) setFlagged(parsed.flagged);
        if (parsed.timeLeft) setTimeLeft(parsed.timeLeft);
        if (parsed.startTime) startTimeRef.current = parsed.startTime;
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Persist state to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          answers,
          flagged,
          timeLeft,
          startTime: startTimeRef.current,
        })
      );
    } catch {
      // ignore
    }
  }, [answers, flagged, timeLeft, storageKey]);

  // Timer countdown
  useEffect(() => {
    if (!assessment) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [assessment]);

  const handleAutoSubmit = () => {
    toast.warning('Đã hết giờ làm bài! Hệ thống đang tự động nộp bài thi của bạn.');
    executeSubmit();
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const toggleFlag = (questionId: string) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const executeSubmit = async () => {
    if (!id || !assessment) return;
    setShowConfirmModal(false);
    try {
      const elapsed = (assessment.timeLimitMinutes * 60) - timeLeft;
      const result = await submitMutation.mutateAsync({
        id,
        input: {
          startedAt: startTimeRef.current,
          durationSeconds: Math.max(1, elapsed),
          answers,
        },
      });
      sessionStorage.removeItem(storageKey);
      sessionStorage.setItem(`dt_last_result_${id}`, JSON.stringify(result));
      toast.success('Đã nộp bài đánh giá thành công!');
      navigate(`/enterprise/me/assessments/${id}/result`);
    } catch {
      toast.error('Lỗi khi nộp bài. Vui lòng kiểm tra lại kết nối.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <div className="h-10 bg-slate-100 animate-pulse rounded" />
        <div className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !assessment) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 max-w-xl mx-auto my-12">
        <p className="text-red-600 font-medium">Không thể nạp bài đánh giá.</p>
        <button
          type="button"
          onClick={() => navigate('/enterprise/me/learning')}
          className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const questions = assessment.questions;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimeCritical = timeLeft < 300; // < 5 mins

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Banner with Countdown & Progress */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 shadow-sm rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            {assessment.courseCode}
          </span>
          <h2 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
            {assessment.courseTitle}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${
              isTimeCritical
                ? 'bg-red-50 text-red-700 animate-pulse border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            <Clock className="size-4" />
            <span>{formattedTime}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={submitMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Send className="size-3.5" />
            <span>Nộp bài</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Question Area + Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Current Question Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-sm font-bold text-blue-600">
                Câu hỏi {currentIndex + 1} / {totalQuestions}
              </span>
              <button
                type="button"
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition ${
                  flagged[currentQuestion.id]
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Flag className="size-3.5 fill-current" />
                <span>{flagged[currentQuestion.id] ? 'Đã đánh dấu xem lại' : 'Đánh dấu câu này'}</span>
              </button>
            </div>

            {/* Question Text */}
            <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
              {currentQuestion.questionText}
            </p>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = answers[currentQuestion.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-medium ring-1 ring-blue-500 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span
                      className={`size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-200 bg-white rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ArrowLeft className="size-4" /> Câu trước
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((idx) => Math.min(totalQuestions - 1, idx + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <span>Câu tiếp</span> <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center gap-1.5 px-6 py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
              >
                <span>Hoàn thành bài thi</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Question Matrix Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 h-fit">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Danh sách câu hỏi</h3>
            <p className="text-xs text-slate-500">
              Đã làm: <span className="font-bold text-blue-600">{answeredCount}</span> / {totalQuestions} câu
            </p>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = answers[q.id] !== undefined;
              const isFlagged = flagged[q.id];

              let bgClass = 'border-slate-200 text-slate-600 hover:bg-slate-50';
              if (isAnswered) bgClass = 'bg-blue-600 border-blue-600 text-white font-bold';
              if (isCurrent) bgClass += ' ring-2 ring-blue-400 ring-offset-2';

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative size-10 rounded-xl border text-xs flex items-center justify-center transition ${bgClass}`}
                >
                  <span>{idx + 1}</span>
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="size-3.5 rounded bg-blue-600" />
              <span>Đã trả lời</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3.5 rounded border border-slate-300" />
              <span>Chưa trả lời</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3.5 rounded border border-slate-300 relative">
                <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-amber-500" />
              </div>
              <span>Đánh dấu xem lại</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Xác nhận nộp bài đánh giá"
      >
        <div className="space-y-4">
          {unansweredCount > 0 ? (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
              <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Bạn còn {unansweredCount} câu chưa trả lời!</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Các câu chưa trả lời sẽ được tính là 0 điểm. Bạn có chắc chắn muốn nộp bài ngay bây giờ?
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <p className="font-medium">
                Bạn đã trả lời đầy đủ {totalQuestions}/{totalQuestions} câu hỏi. Sẵn sàng nộp bài!
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
            >
              Xem lại bài
            </button>
            <button
              type="button"
              onClick={executeSubmit}
              disabled={submitMutation.isPending}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitMutation.isPending ? 'Đang chấm điểm…' : 'Xác nhận nộp bài'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
