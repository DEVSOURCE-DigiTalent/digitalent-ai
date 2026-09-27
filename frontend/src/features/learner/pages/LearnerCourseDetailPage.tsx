import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Clock, Award, PlayCircle, CheckCircle, ArrowLeft, Users, FileText } from 'lucide-react';

export const LearnerCourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id || 'crs-01';

  return (
    <div data-testid="learner-course-detail" className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center gap-2">
        <Link
          to="/learn/path"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại lộ trình
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-700 font-semibold">Khóa học {courseId}</span>
      </div>

      {/* Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-bold uppercase tracking-wider">
                Mã: {courseId}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                Khung DigiComp AI 2.0
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              Kỹ nghệ Câu lệnh AI Nâng cao (Prompt Engineering Masterclass)
            </h1>

            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Làm chủ nghệ thuật và khoa học điều khiển mô hình ngôn ngữ lớn (LLM). Học cách thiết kế, tối ưu, tự động hóa prompt và xây dựng các chuỗi tương tác thông minh cho các bài toán doanh nghiệp.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pt-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Thời lượng: 6 giờ học</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>1,240 người học</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Cấp chứng nhận hoàn thành</span>
              </div>
            </div>
          </div>

          <div className="flex lg:flex-col items-center gap-3 shrink-0">
            <Link
              to={`/learn/classroom/${courseId}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow transition"
            >
              <PlayCircle className="w-5 h-5" />
              Vào học lớp trực tuyến
            </Link>
            <Link
              to="/learn/tasks"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition"
            >
              <FileText className="w-4 h-4" />
              Xem bài tập thực hành
            </Link>
          </div>
        </div>
      </div>

      {/* Syllabus / Module List */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Nội dung chương trình đào tạo
        </h2>

        <div className="space-y-3">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-sm text-slate-800">Bài 1: Cơ chế hoạt động của Attention & Tokenizer</h3>
                <p className="text-xs text-slate-500">Video lý thuyết • 25 phút</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">Đã xong</span>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PlayCircle className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-sm text-blue-900">Bài 2: Zero-shot, Few-shot và System Prompts chuẩn xác</h3>
                <p className="text-xs text-slate-500">Video & Thực hành trực tiếp • 40 phút</p>
              </div>
            </div>
            <Link
              to={`/learn/classroom/${courseId}`}
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded transition"
            >
              Học tiếp
            </Link>
          </div>

          <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs text-slate-400">3</div>
              <div>
                <h3 className="font-semibold text-sm text-slate-800">Bài 3: Kỹ thuật Chain-of-Thought & Tree-of-Thoughts</h3>
                <p className="text-xs text-slate-500">Thực hành Playground • 45 phút</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-medium">Chưa mở</span>
          </div>
        </div>
      </div>
    </div>
  );
};
