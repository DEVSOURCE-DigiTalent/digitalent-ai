import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Clock, Flag, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Send, CloudOff, Cloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/shared/Modal';
import { useAttemptSession, useSaveAttemptAnswers, useStartAttempt, useSubmitAttempt } from '@/hooks/use-me';
import { apiErrorMessage } from '@/lib/utils';

const AUTOSAVE_DELAY_MS = 1500;

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * EM-11: Làm bài đánh giá. Deadline lấy từ server (chống tải lại trang / đổi giờ máy), đáp án tự lưu lên server,
 * hết giờ tự nộp với đáp án mới nhất. URL: /enterprise/me/assessments/:id/attempt?attempt=<attemptId>.
 */
export function AssessmentAttemptPage() {
  const { id: assessmentId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const attemptId = searchParams.get('attempt') ?? undefined;
  const navigate = useNavigate();

  // mutateAsync ổn định qua các lần render (đồng hồ render lại mỗi giây — không được làm reset debounce tự lưu)
  const { mutateAsync: startAttempt } = useStartAttempt();
  const { data: session, isLoading, isError, error } = useAttemptSession(attemptId);
  const { mutateAsync: saveAnswers } = useSaveAttemptAnswers();
  const { mutateAsync: submitAttempt, isPending: isSubmitting } = useSubmitAttempt();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const answersRef = useRef<Record<string, string>>({});
  const dirtyRef = useRef<Set<string>>(new Set());
  const clockOffsetRef = useRef(0);
  const submittingRef = useRef(false);
  const startedRef = useRef(false);
  const initializedFor = useRef<string | null>(null);

  // Vào thẳng URL không có ?attempt → bắt đầu / tiếp tục lần làm trên server (1 lần)
  useEffect(() => {
    if (attemptId || !assessmentId || startedRef.current) return;
    startedRef.current = true;
    startAttempt(assessmentId)
      .then((started) => setSearchParams({ attempt: started.attemptId }, { replace: true }))
      .catch((err) => {
        toast.error(apiErrorMessage(err, 'Không bắt đầu được bài đánh giá.'));
        navigate(`/enterprise/me/assessments/${assessmentId}`, { replace: true });
      });
  }, [attemptId, assessmentId, startAttempt, setSearchParams, navigate]);

  // Nạp đáp án đã lưu + đồng bộ đồng hồ với server khi có phiên làm bài
  useEffect(() => {
    if (!session || initializedFor.current === session.attemptId) return;
    if (session.status !== 'STARTED') {
      navigate(`/enterprise/me/assessments/${session.assessmentId}/result?attempt=${session.attemptId}`, { replace: true });
      return;
    }
    initializedFor.current = session.attemptId;
    clockOffsetRef.current = new Date(session.serverNow).getTime() - Date.now();
    const saved = Object.fromEntries(
      Object.entries(session.answers).filter((entry): entry is [string, string] => Boolean(entry[1])),
    );
    answersRef.current = saved;
    setAnswers(saved);
  }, [session, navigate]);

  const submit = useCallback(async (reason: 'manual' | 'timeout') => {
    if (!session || submittingRef.current) return;
    submittingRef.current = true;
    setShowConfirmModal(false);
    if (reason === 'timeout') toast.warning('Đã hết giờ làm bài! Hệ thống đang tự động nộp bài của bạn.');
    try {
      const result = await submitAttempt({ attemptId: session.attemptId, answers: answersRef.current });
      toast.success(result.passed ? 'Chúc mừng! Bạn đã đạt bài đánh giá.' : 'Đã nộp bài đánh giá.');
      navigate(`/enterprise/me/assessments/${session.assessmentId}/result?attempt=${session.attemptId}`, { replace: true });
    } catch (err) {
      submittingRef.current = false;
      toast.error(apiErrorMessage(err, 'Lỗi khi nộp bài. Đáp án vẫn được lưu — vui lòng thử lại.'));
    }
  }, [session, submitAttempt, navigate]);

  // Đếm ngược theo deadline của server
  useEffect(() => {
    if (!session?.deadline || session.status !== 'STARTED') return;
    const deadline = new Date(session.deadline).getTime();
    const tick = () => {
      const remaining = Math.max(0, Math.round((deadline - (Date.now() + clockOffsetRef.current)) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) void submit('timeout');
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [session, submit]);

  // Tự động lưu các câu vừa đổi (debounce)
  useEffect(() => {
    if (!session || dirtyRef.current.size === 0) return;
    const timer = window.setTimeout(async () => {
      const changed = [...dirtyRef.current];
      const payload = Object.fromEntries(changed.map((questionId) => [questionId, answersRef.current[questionId] ?? null]));
      setSaveState('saving');
      try {
        await saveAnswers({ attemptId: session.attemptId, answers: payload });
        changed.forEach((questionId) => {
          if (answersRef.current[questionId] === payload[questionId]) dirtyRef.current.delete(questionId);
        });
        setSaveState('saved');
      } catch (err) {
        setSaveState('error');
        if (isAxiosError(err) && err.response?.status === 409) void submit('timeout');
      }
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [answers, session, saveAnswers, submit]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    answersRef.current = { ...answersRef.current, [questionId]: optionId };
    dirtyRef.current.add(questionId);
    setAnswers(answersRef.current);
  };

  if (!attemptId || isLoading || (session && session.status !== 'STARTED')) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6" aria-label="Đang chuẩn bị bài làm">
        <div className="h-10 bg-slate-100 animate-pulse rounded" />
        <div className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 max-w-xl mx-auto my-12">
        <p className="text-red-600 font-medium">{apiErrorMessage(error, 'Không thể nạp bài đánh giá.')}</p>
        <button
          type="button"
          onClick={() => navigate(assessmentId ? `/enterprise/me/assessments/${assessmentId}` : '/enterprise/me/assessments')}
          className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const questions = session.questions;
  const currentQuestion = questions[Math.min(currentIndex, questions.length - 1)];
  const totalQuestions = questions.length;
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const unansweredCount = totalQuestions - answeredCount;
  const isTimeCritical = timeLeft !== null && timeLeft < 300;
  const formattedTime = timeLeft === null
    ? 'Không giới hạn'
    : `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 shadow-sm rounded-xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            {session.courseCode} · Lần {session.attemptNo}
          </span>
          <h2 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">{session.assessmentTitle}</h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500" aria-live="polite">
            {saveState === 'saving' && <><Loader2 className="size-3.5 animate-spin" /> Đang lưu…</>}
            {saveState === 'saved' && <><Cloud className="size-3.5 text-emerald-600" /> Đã lưu</>}
            {saveState === 'error' && <><CloudOff className="size-3.5 text-rose-600" /> Chưa lưu được</>}
          </span>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${
              isTimeCritical ? 'bg-red-50 text-red-700 animate-pulse border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
            aria-label="Thời gian còn lại"
          >
            <Clock className="size-4" />
            <span>{formattedTime}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Send className="size-3.5" />
            <span>Nộp bài</span>
          </button>
        </div>
      </div>

      {totalQuestions === 0 ? (
        <p className="text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">Bài đánh giá chưa có câu hỏi.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-sm font-bold text-blue-600">Câu hỏi {currentIndex + 1} / {totalQuestions}</span>
                <button
                  type="button"
                  onClick={() => setFlagged((prev) => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition ${
                    flagged[currentQuestion.id] ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Flag className="size-3.5 fill-current" />
                  <span>{flagged[currentQuestion.id] ? 'Đã đánh dấu xem lại' : 'Đánh dấu câu này'}</span>
                </button>
              </div>

              <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed whitespace-pre-line">{currentQuestion.text}</p>

              <div className="space-y-3 pt-2" role="radiogroup" aria-label={`Phương án câu ${currentIndex + 1}`}>
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-medium ring-1 ring-blue-500 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-500'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed">{option.content}</span>
                    </button>
                  );
                })}
              </div>
            </div>

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

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 h-fit">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Danh sách câu hỏi</h3>
              <p className="text-xs text-slate-500">Đã làm: <span className="font-bold text-blue-600">{answeredCount}</span> / {totalQuestions} câu</p>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                let bgClass = 'border-slate-200 text-slate-600 hover:bg-slate-50';
                if (answers[q.id]) bgClass = 'bg-blue-600 border-blue-600 text-white font-bold';
                if (isCurrent) bgClass += ' ring-2 ring-blue-400 ring-offset-2';
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Câu ${idx + 1}${answers[q.id] ? ' (đã trả lời)' : ''}`}
                    className={`relative size-10 rounded-xl border text-xs flex items-center justify-center transition ${bgClass}`}
                  >
                    <span>{idx + 1}</span>
                    {flagged[q.id] && <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-500 ring-2 ring-white" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2"><div className="size-3.5 rounded bg-blue-600" /><span>Đã trả lời</span></div>
              <div className="flex items-center gap-2"><div className="size-3.5 rounded border border-slate-300" /><span>Chưa trả lời</span></div>
              <div className="flex items-center gap-2">
                <div className="size-3.5 rounded border border-slate-300 relative"><span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-amber-500" /></div>
                <span>Đánh dấu xem lại</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Xác nhận nộp bài đánh giá">
        <div className="space-y-4">
          {unansweredCount > 0 ? (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
              <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Bạn còn {unansweredCount} câu chưa trả lời!</p>
                <p className="text-xs text-amber-800 mt-0.5">Các câu chưa trả lời sẽ được tính 0 điểm. Bạn có chắc muốn nộp bài ngay?</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <p className="font-medium">Bạn đã trả lời đầy đủ {totalQuestions}/{totalQuestions} câu hỏi. Sẵn sàng nộp bài!</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
              Xem lại bài
            </button>
            <button
              type="button"
              onClick={() => void submit('manual')}
              disabled={isSubmitting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Đang chấm điểm…' : 'Xác nhận nộp bài'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
