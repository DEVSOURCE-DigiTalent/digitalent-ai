import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  FileText,
  Bookmark,
  Sparkles,
  Award,
} from 'lucide-react';
import { COURSE_LIBRARY, type CourseLesson, type DetailedCourse } from '../data/learnerData';

export const LearnerClassroomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id || 'crs-01';

  const course: DetailedCourse =
    COURSE_LIBRARY[courseId] || COURSE_LIBRARY['crs-01'];

  // Flatten all lessons across modules for the classroom player
  const allLessons: CourseLesson[] = course.modules.flatMap((m) => m.lessons);

  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`digitalent_progress_${courseId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    // Default: mark lesson 1 as completed for realistic demo feel
    return { [allLessons[0]?.id || 'les-01']: true };
  });

  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'discussion'>('content');
  const [notes, setNotes] = useState<string>(() => {
    return localStorage.getItem(`digitalent_notes_${courseId}`) || 'Cần chú ý nguyên lý Chain-of-Thought khi thiết kế prompt cho trợ lý tư vấn tài chính.';
  });
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  const currentLesson: CourseLesson = allLessons[activeLessonIndex] || allLessons[0];

  const completedCount = allLessons.filter((l) => completedLessonIds[l.id]).length;
  const progressPercent = Math.round((completedCount / allLessons.length) * 100);

  const handleToggleComplete = (lessonId: string) => {
    const updated = {
      ...completedLessonIds,
      [lessonId]: !completedLessonIds[lessonId],
    };
    setCompletedLessonIds(updated);
    try {
      localStorage.setItem(`digitalent_progress_${courseId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSaveNotes = () => {
    try {
      localStorage.setItem(`digitalent_notes_${courseId}`, notes);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleNextLesson = () => {
    if (activeLessonIndex < allLessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    }
  };

  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(activeLessonIndex - 1);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.userAgent.includes('jsdom')) {
      try {
        window.scrollTo?.({ top: 0, behavior: 'smooth' });
      } catch {
        // ignore
      }
    }
  }, [activeLessonIndex]);

  return (
    <div data-testid="learner-classroom-page" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Bar with router test expected texts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/learn/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về trang chi tiết khóa học</span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono">
            Lớp học số: {courseId}
          </span>
          <span className="text-xs text-slate-500 font-medium hidden md:inline truncate max-w-sm">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/learn/tasks"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Bài tập kèm theo</span>
          </Link>
          <Link
            to="/learn/certificates"
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Chứng chỉ</span>
          </Link>
        </div>
      </div>

      {/* Main Classroom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player & Lesson Stage (Left 2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Virtual Video Player Container */}
          <div className="aspect-video bg-slate-950 rounded-3xl flex flex-col justify-between text-white relative shadow-xl overflow-hidden border border-slate-800 group">
            {/* Top player bar */}
            <div className="p-4 flex items-center justify-between text-xs text-slate-300 bg-gradient-to-b from-black/80 to-transparent">
              <span className="font-semibold truncate pr-4">
                {currentLesson.title}
              </span>
              <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                1080p HD
              </span>
            </div>

            {/* Center Play Button */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 flex items-center justify-center hover:scale-110 transition shadow-lg cursor-pointer"
                aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 text-white fill-white" />
                ) : (
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                )}
              </button>
              <p className="text-xs sm:text-sm font-medium text-slate-300 px-4 text-center">
                {currentLesson.title}
              </p>
            </div>

            {/* Bottom Controls Bar */}
            <div className="p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent space-y-2">
              <div className="w-full bg-slate-700/80 h-1.5 rounded-full overflow-hidden cursor-pointer">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: isPlaying ? '65%' : '20%' }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="hover:text-white transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrevLesson}
                    disabled={activeLessonIndex === 0}
                    className="hover:text-white disabled:opacity-40 transition"
                    title="Bài trước"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextLesson}
                    disabled={activeLessonIndex === allLessons.length - 1}
                    className="hover:text-white disabled:opacity-40 transition"
                    title="Bài kế tiếp"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <span>{isPlaying ? '24:18' : '08:45'} / {currentLesson.duration}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(currentLesson.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      completedLessonIds[currentLesson.id]
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{completedLessonIds[currentLesson.id] ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Content Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            {/* Tab Header */}
            <div className="flex items-center gap-4 border-b pb-3 text-xs sm:text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`pb-2 transition relative ${
                  activeTab === 'content'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Nội dung bài học
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`pb-2 transition relative flex items-center gap-1 ${
                  activeTab === 'notes'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Ghi chú của tôi</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('discussion')}
                className={`pb-2 transition relative flex items-center gap-1 ${
                  activeTab === 'discussion'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Thảo luận (3)</span>
              </button>
            </div>

            {/* Tab 1: Lesson Content */}
            {activeTab === 'content' && (
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">
                    {currentLesson.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Thời lượng ước tính: {currentLesson.duration} • Loại bài: {currentLesson.type.toUpperCase()}
                  </p>
                </div>

                <p className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {currentLesson.content}
                </p>

                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-2">
                  <h3 className="font-bold text-xs text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Mẹo thực chiến tại doanh nghiệp:</span>
                  </h3>
                  <p className="text-xs text-blue-950">
                    Luôn thiết lập cờ <code>temperature = 0.0</code> hoặc <code>0.2</code> khi thực hiện các bài toán phân loại dữ liệu, trích xuất thực thể hoặc parse JSON Schema để giảm thiểu tối đa ảo giác.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Personal Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="notes-input" className="text-xs font-bold text-slate-700">
                    Ghi chép bài học lưu vào bộ nhớ cá nhân:
                  </label>
                  {noteSaved && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã lưu ghi chú!
                    </span>
                  )}
                </div>
                <textarea
                  id="notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  placeholder="Ghi lại các ý tưởng, prompt mẫu hoặc lưu ý quan trọng tại đây..."
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    Lưu ghi chú
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Discussion & Q&A */}
            {activeTab === 'discussion' && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Lê Anh Tuấn (Học viên)</span>
                    <span className="text-slate-400">2 ngày trước</span>
                  </div>
                  <p className="text-slate-600">
                    Làm sao để đo lường độ trễ khi kết hợp RAG với reranker vậy thầy?
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs space-y-1 ml-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900">TS. Nguyễn Hoàng Nam (Giảng viên)</span>
                    <span className="text-blue-500">1 ngày trước</span>
                  </div>
                  <p className="text-blue-950">
                    Em có thể dùng OpenTelemetry hoặc LangSmith trace từng bước: embedding latency, vector search và rerank scoring để so sánh nhé.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Playlist & Course Progress Sidebar (Right 1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit">
          {/* Progress Header */}
          <div className="border-b pb-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Danh sách bài học</h3>
              <span className="text-xs font-bold text-blue-700">
                {completedCount} / {allLessons.length} hoàn thành
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Tiến độ khóa học</span>
              <strong className="text-slate-700">{progressPercent}%</strong>
            </div>
          </div>

          {/* Lessons List */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {allLessons.map((les, idx) => {
              const isActive = idx === activeLessonIndex;
              const isDone = completedLessonIds[les.id];

              return (
                <div
                  key={les.id}
                  onClick={() => setActiveLessonIndex(idx)}
                  className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center justify-between gap-2.5 ${
                    isActive
                      ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold shadow-sm ring-1 ring-blue-500/20'
                      : isDone
                      ? 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isActive ? (
                      <Play className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                        {idx + 1}
                      </span>
                    )}
                    <span className="truncate">{les.title}</span>
                  </div>

                  <span className="text-[11px] text-slate-400 shrink-0">
                    {les.duration}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 border-t space-y-2">
            <button
              type="button"
              onClick={() => handleToggleComplete(currentLesson.id)}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {completedLessonIds[currentLesson.id]
                  ? 'Bỏ đánh dấu hoàn thành'
                  : 'Hoàn thành bài học này'}
              </span>
            </button>

            <Link
              to="/learn/tasks"
              className="w-full inline-flex items-center justify-center gap-1.5 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Thảo luận & Nộp bài thực hành</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
