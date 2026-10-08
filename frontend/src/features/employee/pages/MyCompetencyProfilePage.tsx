import { Radar as RadarIcon, Building, Briefcase, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useMySkillGap } from '@/hooks/use-skill-gaps';
import { MyCompetencyTabs } from '../components/MyCompetencyTabs';

/**
 * EM-02: Hồ sơ năng lực của tôi (MyCompetencyProfilePage).
 * Hiển thị Phòng ban, Vị trí, Cấp bậc; bảng năng lực yêu cầu vs hiện tại.
 */
export function MyCompetencyProfilePage() {
  const { can } = usePermission();
  const canReadSkillGap = can(PERMISSIONS.SKILL_GAP_READ);
  const { data: run, isLoading, isError, refetch } = useMySkillGap(canReadSkillGap);

  if (!canReadSkillGap) {
    return (
      <div className="space-y-6">
        <PageHeader title="Hồ sơ năng lực của tôi" subtitle="Mức năng lực đã xác nhận của bạn so với chuẩn vị trí" />
        <MyCompetencyTabs />
        <EmptyState
          icon={<RadarIcon className="w-16 h-16 mx-auto" strokeWidth={1} />}
          title="Vai trò của bạn không xem được phân tích skill gap"
          description="Vai trò của bạn chưa có quyền xem hồ sơ năng lực. Hãy liên hệ quản trị tổ chức nếu cần."
        />
      </div>
    );
  }

  const items = run?.items ?? [];
  const totalCount = items.length;
  const metCount = items.filter((i) => i.gapSteps === 0).length;

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Hồ sơ năng lực của tôi"
        subtitle="Hồ sơ năng lực số chuẩn hóa gắn với vị trí việc làm của bạn theo Khung chuẩn năng lực số."
      />

      <MyCompetencyTabs />

      {isLoading ? (
        <div aria-label="Đang tải skill gap" className="space-y-4">
          <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={<AlertCircle className="size-12 text-slate-300 mx-auto" />}
          title="Không tải được phân tích skill gap"
          description="Có lỗi khi tải dữ liệu phân tích khoảng trống năng lực. Vui lòng thử lại."
          action={
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Thử lại
            </button>
          }
        />
      ) : !run ? (
        <EmptyState
          icon={<AlertCircle className="size-12 text-slate-300 mx-auto" />}
          title="Chưa có phân tích skill gap"
          description="Bạn chưa được gán vị trí việc làm hoặc chưa có bộ yêu cầu năng lực hoạt động. Vui lòng liên hệ Quản trị viên."
        />
      ) : (
        <>
          {/* Metadata Card: Phòng ban, Vị trí, Cấp bậc */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Building className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phòng ban</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{run.departmentName || 'Chưa gán'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Briefcase className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vị trí việc làm</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{run.jobPositionName || 'Chưa gán'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Award className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cấp bậc</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">G1 (Nhân viên)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Độ phủ năng lực</p>
                  <p className="text-base font-bold text-emerald-600 mt-0.5">
                    {metCount} / {totalCount} năng lực (<span>{run.summary.coveragePercent}%</span>)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Competency Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Danh mục năng lực theo vị trí việc làm</h3>
              <span className="text-xs text-slate-500">
                Phiên bản yêu cầu: v{run.requirementSetVersionNo || 1}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table role="table" className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Mã & Năng lực</th>
                    <th className="py-3.5 px-6">Miền năng lực TT02</th>
                    <th className="py-3.5 px-6 text-center">Trình độ năng lực yêu cầu</th>
                    <th className="py-3.5 px-6 text-center">Trình độ hiện tại</th>
                    <th className="py-3.5 px-6 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const isMet = item.gapSteps === 0;
                    return (
                      <tr key={item.competencyId} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-medium text-slate-900">
                          {item.competencyCode && (
                            <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded mr-2 font-bold">
                              {item.competencyCode}
                            </span>
                          )}
                          <span>{item.competencyName}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 text-xs">
                          {item.categoryName || '—'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <LevelBadge level={item.requiredLevel} />
                        </td>
                        <td className="py-4 px-6 text-center">
                          {item.currentLevel && item.currentLevel > 0 ? (
                            <LevelBadge level={item.currentLevel} />
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Chưa xác nhận</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {isMet ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="size-3.5" /> Đạt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                              {item.severity === 'HIGH' ? 'Cao' : item.severity === 'MEDIUM' ? 'TB' : 'Thấp'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
