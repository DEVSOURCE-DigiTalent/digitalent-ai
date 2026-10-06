import { useParams, Link } from 'react-router-dom';
import {
  FileCheck, Clock, Award, ShieldAlert, CheckCircle2, ArrowLeft, ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { useAssessment } from '@/hooks/use-learning';

export function AssessmentIntroPage() {
  const { id } = useParams<{ id: string }>();
  const { data: assessment, isLoading, isError } = useAssessment(id);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="h-8 w-48 bg-slate-100 animate-pulse rounded" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !assessment) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 max-w-xl mx-auto my-12">
        <p className="text-red-600 font-medium">Không tìm thấy bài đánh giá.</p>
        <Link
          to="/enterprise/me/courses"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách học tập
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <Link
        to={`/enterprise/me/courses/${assessment.courseId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="size-4" />
        <span>Quay lại khóa học {assessment.courseCode}</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-start gap-4">
          <div className="size-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileCheck className="size-8" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
              Bài kiểm tra đánh giá năng lực
            </span>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              {assessment.courseTitle}
            </h1>
            <p className="text-sm text-slate-600">Mã bài thi: {assessment.id}</p>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-slate-100 py-6">
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Thời gian làm bài</p>
              <p className="text-base font-bold text-slate-900">{assessment.timeLimitMinutes} phút</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HelpCircle className="size-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Số lượng câu hỏi</p>
              <p className="text-base font-bold text-slate-900">{assessment.questions.length} câu trắc nghiệm</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="size-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Điểm đạt yêu cầu</p>
              <p className="text-base font-bold text-slate-900">≥ {assessment.passPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Rules & Benefits */}
        <div className="space-y-4 text-sm text-slate-700">
          <h2 className="font-bold text-slate-900">Quy chế thi và quyền lợi:</h2>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Tự động lưu câu trả lời:</strong> Hệ thống lưu liên tục tiến trình của bạn, phòng trường hợp gián đoạn kết nối.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Cập nhật hồ sơ năng lực:</strong> Khi đạt điểm chuẩn, bậc năng lực của bạn theo Thông tư 02 sẽ được hệ thống cập nhật chính thức.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Cấp chứng nhận nội bộ:</strong> Bạn sẽ nhận được chứng chỉ số có mã xác thực lưu vào Sổ chứng nhận.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldAlert className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Đếm ngược thời gian:</strong> Đồng hồ sẽ tự động nộp bài khi hết giờ làm bài.
              </span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to={`/enterprise/me/courses/${assessment.courseId}`}
            className="w-full sm:w-auto px-5 py-2.5 text-center text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Ôn tập lại bài giảng
          </Link>
          <Link
            to={`/enterprise/me/assessments/${id}/attempt`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition"
          >
            <span>Bắt đầu làm bài ngay</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
