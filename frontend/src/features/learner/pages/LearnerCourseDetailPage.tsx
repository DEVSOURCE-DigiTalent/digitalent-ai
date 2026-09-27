import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  PlayCircle,
  CheckCircle,
  ArrowLeft,
  Users,
  FileText,
  Download,
  ExternalLink,
  Star,
  GraduationCap,
} from 'lucide-react';
import { COURSE_LIBRARY, type DetailedCourse } from '../data/learnerData';

export const LearnerCourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id || 'crs-01';

  const course: DetailedCourse =
    COURSE_LIBRARY[courseId] || COURSE_LIBRARY['crs-01'];

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div data-testid="learner-course-detail" className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center gap-2">
        <Link
          to="/learn/path"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại lộ trình</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-700 font-semibold">Khóa học {courseId}</span>
      </div>

      {/* Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold uppercase tracking-wider font-mono">
                Mã: {courseId}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                {course.frameworkRef}
              </span>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{course.rating} / 5.0</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pt-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Thời lượng: {course.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>{totalLessons} bài học</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{course.enrolledLearners.toLocaleString()} người học</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Cấp chứng nhận hoàn thành</span>
              </div>
            </div>
          </div>

          <div className="flex lg:flex-col items-center gap-3 shrink-0 w-full lg:w-auto">
            <Link
              to={`/learn/classroom/${courseId}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Vào học lớp trực tuyến</span>
            </Link>
            <Link
              to="/learn/tasks"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition"
            >
              <FileText className="w-4 h-4" />
              <span>Xem bài tập thực hành</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Syllabus Modules & Sidebar Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Syllabus / Course Outline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Outcomes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>Chuẩn đầu ra khóa học (Learning Outcomes)</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {course.outcomes.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Modules List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Nội dung chương trình đào tạo</span>
              </h2>
              <span className="text-xs text-slate-500">
                {course.modules.length} chuyên đề • {totalLessons} bài
              </span>
            </div>

            <div className="space-y-4">
              {course.modules.map((mod) => (
                <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{mod.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 shrink-0">
                      {mod.lessons.length} bài học
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 bg-white">
                    {mod.lessons.map((les) => (
                      <div
                        key={les.id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          {les.completed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div>
                            <h4 className="text-xs sm:text-sm font-semibold text-slate-800">
                              {les.title}
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              {les.type === 'video' ? 'Video lý thuyết' : les.type === 'lab' ? 'Thực hành Lab' : 'Bài đọc'} • {les.duration}
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/learn/classroom/${courseId}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2.5 py-1 rounded hover:bg-blue-50 transition shrink-0"
                        >
                          Học bài này
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Instructor & Materials */}
        <div className="space-y-6">
          {/* Instructor Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Giảng viên & Cố vấn chuyên môn
            </h3>

            <div className="flex items-center gap-3">
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{course.instructor.name}</h4>
                <p className="text-xs text-blue-700 font-medium">{course.instructor.title}</p>
                <p className="text-[11px] text-slate-400">{course.instructor.company}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed border-t pt-3">
              Chuyên gia hàng đầu với hơn 10 năm kinh nghiệm tư vấn triển khai mô hình AI & LLM cho các tập đoàn tài chính, viễn thông và bán lẻ.
            </p>
          </div>

          {/* Course Materials */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Tài liệu & Học liệu đính kèm</span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {course.materials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <p className="font-bold text-slate-800 truncate">{mat.name}</p>
                    {mat.size && <span className="text-[11px] text-slate-400">{mat.size}</span>}
                  </div>

                  {mat.type === 'repo' ? (
                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition shrink-0"
                      title="Mở GitHub Repo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition shrink-0"
                      title="Tải tài liệu"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
