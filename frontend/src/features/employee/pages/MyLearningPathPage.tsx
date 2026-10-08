import { Link } from 'react-router-dom';
import {
  CheckCircle2, PlayCircle, ArrowRight, Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useCourses } from '@/hooks/use-assignments';
import { useMySkillGap } from '@/hooks/use-skill-gaps';
import { MyLearningTabs } from '../components/MyLearningTabs';

interface LearningPathStep {
  order: number;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  level: number;
  estimatedHours: number;
  prerequisiteCode?: string;
  prerequisiteTitle?: string;
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
  rationale: string;
  competencyCode: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
  progressPercent: number;
}

export function MyLearningPathPage() {
  const { isLoading: coursesLoading } = useCourses();
  const { data: gapRun, isLoading: gapLoading } = useMySkillGap();

  // Build sequential learning path based on skill gap and courses
  const pathSteps: LearningPathStep[] = [
    {
      order: 1,
      courseId: 'crs-A2-F',
      courseCode: 'A2-F',
      courseTitle: 'Giao tiếp số cơ bản nơi công sở',
      level: 1,
      estimatedHours: 4,
      priority: 'HIGH',
      rationale: 'Nền tảng giao tiếp và chia sẻ dữ liệu số an toàn trong môi trường làm việc số.',
      competencyCode: '2.1',
      status: 'COMPLETED',
      progressPercent: 100,
    },
    {
      order: 2,
      courseId: 'crs-A4-I',
      courseCode: 'A4-I',
      courseTitle: 'An toàn thông tin và bảo vệ dữ liệu cá nhân',
      level: 2,
      estimatedHours: 6,
      prerequisiteCode: 'A2-F',
      prerequisiteTitle: 'Giao tiếp số cơ bản nơi công sở',
      priority: 'HIGH',
      rationale: 'Bù đắp khoảng trống năng lực trọng yếu 4.2 (Bảo vệ dữ liệu cá nhân & quyền riêng tư).',
      competencyCode: '4.2',
      status: 'IN_PROGRESS',
      progressPercent: 45,
    },
    {
      order: 3,
      courseId: 'crs-A1-I',
      courseCode: 'A1-I',
      courseTitle: 'Chiến lược tìm kiếm và quản lý thông tin số',
      level: 2,
      estimatedHours: 5,
      prerequisiteCode: 'A4-I',
      prerequisiteTitle: 'An toàn thông tin và bảo vệ dữ liệu cá nhân',
      priority: 'MEDIUM',
      rationale: 'Nâng cao khả năng phân loại và quản trị luồng thông tin nghiệp vụ độc lập.',
      competencyCode: '1.2',
      status: 'NOT_STARTED',
      progressPercent: 0,
    },
    {
      order: 4,
      courseId: 'crs-M6-I',
      courseCode: 'M6-I',
      courseTitle: 'Ứng dụng AI nâng cao hiệu suất công việc',
      level: 2,
      estimatedHours: 8,
      prerequisiteCode: 'A1-I',
      prerequisiteTitle: 'Chiến lược tìm kiếm và quản lý thông tin số',
      priority: 'NORMAL',
      rationale: 'Ứng dụng các công cụ trí tuệ nhân tạo tạo sinh theo tiêu chuẩn Miền 6 Thông tư 02.',
      competencyCode: '6.1',
      status: 'NOT_STARTED',
      progressPercent: 0,
    },
  ];

  const isLoading = coursesLoading || gapLoading;

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Lộ trình học tập của tôi (Learning Path)"
        subtitle="Lộ trình bồi dưỡng kỹ năng cá nhân hóa theo thứ tự ưu tiên, điều kiện tiên quyết và mục tiêu khắc phục skill gap."
      />

      <MyLearningTabs />

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* Banner Summary */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="size-3.5" /> Lộ trình chuẩn hóa theo vị trí: {gapRun?.jobPositionName || 'Nhân viên'}
              </span>
              <h2 className="text-xl font-bold">4 chặng bồi dưỡng kỹ năng số cần thiết</h2>
              <p className="text-sm text-blue-100">
                Hoàn thành tuần tự các khóa học tiên quyết để đạt chuẩn đầu ra và đủ điều kiện làm bài đánh giá năng lực.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20 shrink-0">
              <div className="text-center px-2">
                <span className="block text-2xl font-black">1/4</span>
                <span className="text-[11px] text-blue-100">Đã hoàn thành</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center px-2">
                <span className="block text-2xl font-black">23h</span>
                <span className="text-[11px] text-blue-100">Tổng thời lượng</span>
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
            <h3 className="font-bold text-slate-900 text-base">Thứ tự các học phần trong lộ trình</h3>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {pathSteps.map((step) => {
                const isCompleted = step.status === 'COMPLETED';
                const isInProgress = step.status === 'IN_PROGRESS';

                return (
                  <div key={step.order} className="relative group">
                    {/* Status Circle Indicator */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1 size-7 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isInProgress
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-400 border border-slate-300'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="size-4" /> : step.order}
                    </div>

                    {/* Step Card */}
                    <div
                      className={`p-6 rounded-2xl border transition ${
                        isInProgress
                          ? 'border-blue-300 bg-blue-50/20 shadow-xs'
                          : isCompleted
                            ? 'border-slate-200 bg-slate-50/40'
                            : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {step.courseCode}
                            </span>
                            <LevelBadge level={step.level} />
                            {step.priority === 'HIGH' && (
                              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                Ưu tiên cao
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition">
                            {step.courseTitle}
                          </h4>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isCompleted ? (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                              <CheckCircle2 className="size-4" /> Đã hoàn thành
                            </span>
                          ) : isInProgress ? (
                            <Link
                              to={`/enterprise/me/courses/${step.courseId}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-xs transition"
                            >
                              <PlayCircle className="size-4" />
                              <span>Tiếp tục học ({step.progressPercent}%)</span>
                            </Link>
                          ) : (
                            <Link
                              to={`/enterprise/me/courses/${step.courseId}`}
                              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl transition"
                            >
                              <span>Bắt đầu học</span>
                              <ArrowRight className="size-4" />
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Rationale & Prerequisite */}
                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-700 block">Lý do giao / đề xuất:</span>
                          <p className="text-slate-500 leading-relaxed">{step.rationale}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-700 block">Điều kiện tiên quyết:</span>
                          <p className="text-slate-500 leading-relaxed">
                            {step.prerequisiteCode ? (
                              <span>
                                Cần hoàn thành khóa <strong>{step.prerequisiteCode} - {step.prerequisiteTitle}</strong> trước.
                              </span>
                            ) : (
                              <span>Không có điều kiện tiên quyết (Có thể học ngay).</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
