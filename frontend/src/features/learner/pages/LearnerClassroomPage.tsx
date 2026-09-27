import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, SkipForward, ArrowLeft, CheckCircle2, MessageSquare } from 'lucide-react';

export const LearnerClassroomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id || 'crs-01';

  return (
    <div data-testid="learner-classroom-page" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/learn/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang chi tiết khóa học
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
            Lớp học số: {courseId}
          </span>
        </div>

        <Link
          to="/learn/tasks"
          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
        >
          <span>Bài tập kèm theo</span>
        </Link>
      </div>

      {/* Main Classroom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player & Lesson Stage */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white relative shadow-lg overflow-hidden group">
            <div className="w-16 h-16 rounded-full bg-blue-600/90 flex items-center justify-center group-hover:scale-110 transition shadow cursor-pointer">
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
            <p className="text-sm font-medium mt-4 text-slate-300">
              Bài 2: Zero-shot, Few-shot và System Prompts chuẩn xác
            </p>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-400">
              <span>08:45 / 42:10</span>
              <span className="bg-black/50 px-2 py-1 rounded">1080p HD</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              Nội dung chính: Cấu trúc System Prompt và Vai trò định hình phản hồi AI
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Trong bài học này, chúng ta sẽ tìm hiểu cách thiết lập vai trò (Persona), ràng buộc nghiệp vụ (Constraints) và định dạng đầu ra (Output Formatting: JSON/Markdown) để đạt độ chính xác tối ưu.
            </p>
          </div>
        </div>

        {/* Playlist / Lesson Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Danh sách bài học</h3>
            <span className="text-xs text-slate-500 font-medium">1 / 5 hoàn thành</span>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1. Tổng quan cơ chế Attention</span>
              </div>
              <span className="text-slate-400">25m</span>
            </div>

            <div className="p-3 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-blue-600 shrink-0" />
                <span>2. Zero-shot, Few-shot & System Prompt</span>
              </div>
              <span className="text-blue-600">Đang phát</span>
            </div>

            <div className="p-3 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SkipForward className="w-4 h-4 text-slate-400 shrink-0" />
                <span>3. Chain-of-Thought & Reasoning</span>
              </div>
              <span className="text-slate-400">45m</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <Link
              to="/learn/tasks"
              className="w-full inline-flex items-center justify-center gap-1.5 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
            >
              <MessageSquare className="w-4 h-4" />
              Thảo luận & Nộp bài thực hành
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
