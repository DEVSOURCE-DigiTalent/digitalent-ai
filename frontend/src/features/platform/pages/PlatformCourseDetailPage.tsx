import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Clock, Layers, Award, FileText, CheckCircle2,
  Video, BookMarked, HelpCircle, Edit3, History,
} from 'lucide-react';
import { PageHeader, StatusBadge } from '@/components/shared';
import { usePlatformCourse } from '@/hooks/use-platform';
import { levelLabel } from '@/lib/competency-levels';
import { CATEGORIES } from '@/services/mock/server/catalog';

type TabKey = 'overview' | 'competencies' | 'modules' | 'assessment' | 'version';

export function PlatformCourseDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const { data: course, isLoading, isError, refetch } = usePlatformCourse(id);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải thông tin khóa học chuẩn…</div>;
  }

  if (isError || !course) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/platform/curriculum')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Quay lại danh mục khóa học
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">Không tìm thấy thông tin khóa học chuẩn.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const domain = CATEGORIES.find((cat) => cat.id === course.categoryId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/platform/curriculum')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Danh mục chương trình chuẩn
        </button>

        <button
          type="button"
          onClick={() => navigate(`/platform/courses/${course.id}/edit`)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 shadow-sm"
        >
          <Edit3 className="size-3.5" />
          Biên tập nội dung khóa học
        </button>
      </div>

      <PageHeader
        title={course.title}
        subtitle={`Mã khóa: ${course.code} · Miền: ${domain?.name || course.categoryId} · Trình độ: ${levelLabel(course.level)} (Bậc ${course.level === 1 ? '1–2' : course.level === 2 ? '3–4' : '5–8'})`}
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="size-4" />
          Tổng quan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('competencies')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'competencies'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="size-4" />
          Năng lực đáp ứng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'modules'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="size-4" />
          Cấu trúc bài học ({course.modulesList?.length || course.modules})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assessment')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'assessment'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="size-4" />
          Bài đánh giá chuẩn
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('version')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'version'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="size-4" />
          Phiên bản & Lịch sử
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Mô tả chương trình học</h2>
              <p className="text-sm text-slate-700 leading-relaxed">{course.description}</p>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Đối tượng học viên phù hợp</h3>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {course.targetAudience}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Kết quả đầu ra kỳ vọng (Outcomes)</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  {course.learningOutcomes?.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 text-sm">
              <h2 className="text-base font-semibold text-slate-900 pb-2 border-b border-slate-100">
                Thông số khóa học
              </h2>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã khóa:</span>
                <span className="font-mono font-bold text-slate-800">{course.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trình độ chuẩn:</span>
                <span className="font-semibold text-primary-700">{levelLabel(course.level)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bậc năng lực:</span>
                <span className="font-semibold text-slate-700">
                  Bậc {course.level === 1 ? '1–2' : course.level === 2 ? '3–4' : '5–8'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số học phần:</span>
                <span className="font-bold text-slate-800">{course.modules} chương</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời lượng học:</span>
                <span className="font-bold text-slate-800">{course.estimatedDurationMinutes} phút</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tiên quyết:</span>
                <span className="font-mono text-slate-600">
                  {course.prerequisiteCourseId ? course.prerequisiteCourseId.replace('crs-', 'CRS-') : 'Không'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-slate-500">Trạng thái:</span>
                <StatusBadge
                  label={course.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                  variant={course.status === 'PUBLISHED' ? 'success' : 'default'}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Competencies */}
      {activeTab === 'competencies' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900">
              Năng lực số mục tiêu theo Khung chuẩn năng lực số
            </h2>
            <div className="p-4 rounded-lg bg-primary-50/50 border border-primary-100 text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary-700 bg-primary-100 px-2 py-0.5 rounded">
                  {domain?.code}
                </span>
                <span className="font-bold text-slate-900">{domain?.name}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Khóa học này trang bị kiến thức và kỹ năng giải quyết các khoảng trống năng lực thuộc miền {domain?.name} ở cấp độ {levelLabel(course.level)}. Sau khi học xong, học viên đủ điều kiện thực hiện bài đánh giá hoặc nhiệm vụ thực tế tương ứng.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Modules */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          {course.modulesList?.map((mod, index) => (
            <div key={mod.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                    Phần {index + 1}
                  </span>
                  <h3 className="font-semibold text-slate-900 text-sm">{mod.title}</h3>
                </div>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="size-3.5" /> ~{mod.estimatedMinutes} phút
                </span>
              </div>

              <div className="space-y-2">
                {mod.lessons.map((les) => (
                  <div
                    key={les.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {les.type === 'video' && <Video className="size-3.5 text-blue-600" />}
                      {les.type === 'reading' && <BookMarked className="size-3.5 text-emerald-600" />}
                      {les.type === 'quiz' && <HelpCircle className="size-3.5 text-purple-600" />}
                      <span className="font-medium text-slate-800">{les.title}</span>
                    </div>
                    <span className="text-slate-500">{les.durationMinutes} phút</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Assessment */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900">
              Cấu hình đánh giá chuẩn cuối khóa
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Hình thức đánh giá</span>
                <p className="text-base font-bold text-slate-900 mt-1">Trắc nghiệm & Tình huống</p>
                <p className="text-xs text-slate-400 mt-0.5">Thời gian: 45 phút</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Ngưỡng đạt tiêu chuẩn</span>
                <p className="text-base font-bold text-emerald-700 mt-1">≥ 70% số điểm</p>
                <p className="text-xs text-slate-400 mt-0.5">Số lần làm tối đa: 3 lần</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Nguồn câu hỏi</span>
                <p className="text-base font-bold text-primary-700 mt-1">Ngân hàng đề TT02</p>
                <p className="text-xs text-slate-400 mt-0.5">20 câu hỏi chuẩn hóa</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 italic">
              * Lưu ý: Kết quả hoàn thành bài đánh giá này chứng nhận kiến thức của khóa học, chưa tự động thay thế minh chứng năng lực thực tế tại nơi làm việc (Workplace Confirmed Competency).
            </p>
          </div>
        </div>
      )}

      {/* Tab 5: Version */}
      {activeTab === 'version' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Lịch sử phát hành & Phiên bản chuẩn</h2>
            <div className="space-y-3 text-sm">
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Phiên bản 1.0 (Canonical)</span>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                    Hiện hành
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Xuất bản ngày 01/10/2026 bởi Ban Chuyên môn Đào tạo DigiTalent AI.
                </p>
                <p className="text-xs text-slate-700 mt-2">
                  Đồng bộ chuẩn 24 năng lực số theo Khung chuẩn năng lực số.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
