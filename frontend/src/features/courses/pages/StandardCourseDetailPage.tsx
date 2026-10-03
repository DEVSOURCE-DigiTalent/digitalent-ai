import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, Layers, Users,
  CheckCircle2, AlertCircle, UserCheck, ShieldCheck,
  PlayCircle
} from 'lucide-react';
import { useCourse, useAssignments } from '@/hooks/use-assignments';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LevelBadge } from '@/components/shared/LevelBadge';

type DetailTab = 'overview' | 'curriculum' | 'assessment' | 'learners';

/**
 * OW-24: Course Detail (/enterprise/courses/:id hoặc /enterprise/catalog/:id)
 * Chi tiết khóa học chuẩn nền tảng:
 * Overview / Competencies / Modules / Assessment / assigned employees.
 * Owner xem nội dung nhưng không sửa lesson chuẩn.
 */
export function StandardCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  const { data: course, isLoading: courseLoading } = useCourse(id);
  const { data: assignmentsData } = useAssignments({
    courseId: id,
    pageSize: 100,
  });

  if (courseLoading) {
    return <div className="py-20 text-center text-sm text-slate-500">Đang tải chi tiết khóa học…</div>;
  }

  if (!course) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900">Không tìm thấy khóa học</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Khóa học chuẩn không tồn tại hoặc đã bị thu hồi khỏi hệ thống.
        </p>
        <Link
          to="/enterprise/courses"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh mục khóa học
        </Link>
      </div>
    );
  }

  const assignedEmployees = assignmentsData?.items || [];
  const completedEmployees = assignedEmployees.filter((a) => a.status === 'COMPLETED');
  const modules = course.modules || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/enterprise/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh mục chương trình chuẩn
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded">
                {course.code}
              </span>
              <LevelBadge level={course.level} />
              <StatusBadge
                label={course.status === 'PUBLISHED' ? 'Chuẩn hóa TT02' : 'Bản nháp'}
                variant={course.status === 'PUBLISHED' ? 'success' : 'default'}
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
            <p className="text-sm text-slate-500">
              Thuộc miền năng lực: <strong className="text-slate-700">{course.categoryName || 'Thông tư 02'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/enterprise/training-batches/new?courseId=${course.id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm"
            >
              <Layers className="size-4 text-primary-600" />
              Thêm vào đợt đào tạo
            </button>
            <button
              type="button"
              onClick={() => navigate(`/enterprise/assignments?courseId=${course.id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-colors"
            >
              <UserCheck className="size-4" />
              Giao khóa học này
            </button>
          </div>
        </div>
      </div>

      {/* Quick stat banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Thời lượng</div>
            <div className="text-base font-bold text-slate-900">{course.estimatedDurationMinutes || 180} phút</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Cấu trúc</div>
            <div className="text-base font-bold text-slate-900">{Array.isArray(modules) ? modules.length : (course.modules || 3)} chương học</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Đã giao</div>
            <div className="text-base font-bold text-slate-900">{assignedEmployees.length} nhân viên</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Đã hoàn thành</div>
            <div className="text-base font-bold text-emerald-700">{completedEmployees.length} nhân viên</div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tổng quan & Chuẩn đầu ra TT02
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'curriculum'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cấu trúc giáo trình ({Array.isArray(modules) ? modules.length : 3} module)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assessment')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'assessment'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tiêu chuẩn đánh giá
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('learners')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'learners'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Nhân viên đang học ({assignedEmployees.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Mục tiêu và chuẩn đầu ra</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Khóa học được thiết kế bám sát chuẩn năng lực số quốc gia (Thông tư 02/2025/TT-BGDĐT) nhằm trang bị cho nhân sự kiến thức thực tiễn và kỹ năng số cốt lõi. Sau khi hoàn thành khóa học, nhân viên được chứng nhận trình độ tương ứng và tự động cập nhật vào Hồ sơ năng lực số của doanh nghiệp.
              </p>
              
              <div className="rounded-lg bg-primary-50/60 border border-primary-100 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-primary-900 space-y-1">
                    <span className="font-semibold block">Khóa học chuẩn hóa nền tảng</span>
                    <span>Nội dung đã được chuẩn hóa bởi Hội đồng Chuyên gia số DigiTalent AI. Chủ doanh nghiệp (Owner) có thể duyệt, xem trước, phân công cho nhân sự hoặc đưa vào đợt đào tạo, nhưng không chỉnh sửa cấu trúc bài giảng chuẩn.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Năng lực TT02 được phát triển</h2>
              <div className="rounded-lg border border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Miền năng lực</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{course.categoryName || 'Khai thác dữ liệu và thông tin'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trình độ đầu ra đạt được</div>
                  <div className="mt-0.5">
                    <LevelBadge level={course.level} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Thông tin bổ trợ</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Mã chương trình:</span>
                  <span className="font-mono font-semibold text-slate-800">{course.code}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Trình độ đầu vào yêu cầu:</span>
                  <span className="font-medium text-slate-800">
                    {course.entryLevel === 0 ? 'Không yêu cầu (Nhập môn)' : `Mức ${course.entryLevel}`}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Khóa tiên quyết:</span>
                  <span className="font-medium text-slate-800">
                    {course.prerequisiteTitle || 'Không có'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Trạng thái phát hành:</span>
                  <StatusBadge label={course.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'} variant="success" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'curriculum' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Cấu trúc các chương học</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các bài học được xây dựng theo phương pháp vi học tập (micro-learning) kết hợp câu hỏi tình huống thực tế
              </p>
            </div>
            <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              Giáo trình chỉ đọc
            </span>
          </div>

          <div className="space-y-4">
            {Array.isArray(modules) && modules.length > 0 ? (
              modules.map((m: any, idx: number) => (
                <div key={m.id || idx} className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-sm text-slate-900">{m.title || `Module ${idx + 1}`}</span>
                    </div>
                    <span className="text-xs text-slate-500">{m.lessons?.length || 3} bài học</span>
                  </div>
                  <div className="divide-y divide-slate-100 p-2">
                    {(m.lessons || []).map((lesson: any, lIdx: number) => (
                      <div key={lesson.id || lIdx} className="px-3 py-2.5 flex items-center justify-between hover:bg-slate-50/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <PlayCircle className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-800">{lesson.title}</span>
                        </div>
                        <span className="text-xs text-slate-400">{lesson.durationMinutes || 15} phút</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                Khóa học có 3 module bài giảng với thời lượng ước tính {course.estimatedDurationMinutes || 180} phút.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'assessment' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Bài kiểm tra & Tiêu chuẩn đạt</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Học viên hoàn thành bài đánh giá cuối khóa để được ghi nhận vào hồ sơ năng lực Thông tư 02
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
              <div className="text-xs text-slate-500 font-medium">Số lượng câu hỏi</div>
              <div className="text-xl font-bold text-slate-900 mt-1">15 câu hỏi tình huống</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
              <div className="text-xs text-slate-500 font-medium">Thời gian làm bài</div>
              <div className="text-xl font-bold text-slate-900 mt-1">30 phút</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 bg-emerald-50/40 border-emerald-100">
              <div className="text-xs text-emerald-700 font-medium">Điểm đạt tối thiểu</div>
              <div className="text-xl font-bold text-emerald-800 mt-1">70% (11/15 câu)</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'learners' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Nhân viên đã được phân công ({assignedEmployees.length})</h2>
            <button
              type="button"
              onClick={() => navigate(`/enterprise/assignments?courseId=${course.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200"
            >
              <UserCheck className="size-3.5" /> Giao thêm nhân viên
            </button>
          </div>

          {assignedEmployees.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Chưa có nhân viên nào trong doanh nghiệp được giao khóa học này.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nhân viên</th>
                    <th className="px-4 py-3">Phòng ban / Vị trí</th>
                    <th className="px-4 py-3">Tiến độ</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Hạn hoàn thành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignedEmployees.map((asg) => (
                    <tr key={asg.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {asg.employeeName}
                        <div className="text-xs text-slate-400 font-normal">{asg.employeeCode}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{asg.departmentName || '-'}</div>
                        <div className="text-xs text-slate-400">{asg.positionName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-primary-600 rounded-full" style={{ width: `${asg.progressPercent}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-700">{asg.progressPercent}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={
                            asg.status === 'COMPLETED' ? 'Đã xong' :
                            asg.status === 'IN_PROGRESS' ? 'Đang học' :
                            asg.status === 'READY_FOR_ASSESSMENT' ? 'Chờ thi' : 'Chưa bắt đầu'
                          }
                          variant={asg.status === 'COMPLETED' ? 'success' : asg.status === 'IN_PROGRESS' ? 'info' : 'default'}
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {asg.dueDate ? (
                          <span className={asg.overdue ? 'text-rose-600 font-medium' : ''}>
                            {asg.dueDate} {asg.overdue && '(Quá hạn)'}
                          </span>
                        ) : 'Không giới hạn'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
