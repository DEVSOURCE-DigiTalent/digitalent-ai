import { Radar as RadarIcon, Building, Briefcase, Layers, CheckCircle2, AlertCircle, FileCheck2 } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useMyCompetencyProfile } from '@/hooks/use-me';
import { skillGapReasonMessage } from '@/lib/competency-levels';
import { formatDate } from '@/lib/utils';
import { MyCompetencyTabs } from '../components/MyCompetencyTabs';

/**
 * EM-02: Hồ sơ năng lực của tôi — mức đã xác nhận của từng năng lực so với chuẩn vị trí đang áp dụng.
 */
export function MyCompetencyProfilePage() {
  const { can } = usePermission();
  const canRead = can(PERMISSIONS.EMPLOYEE_COMPETENCY_PROFILE_READ);
  const { data: profile, isLoading, isError, refetch } = useMyCompetencyProfile(canRead);

  if (!canRead) {
    return (
      <div className="space-y-6">
        <PageHeader title="Hồ sơ năng lực của tôi" subtitle="Mức năng lực đã xác nhận của bạn so với chuẩn vị trí" />
        <MyCompetencyTabs />
        <EmptyState
          icon={<RadarIcon className="w-16 h-16 mx-auto" strokeWidth={1} />}
          title="Vai trò của bạn chưa xem được hồ sơ năng lực"
          description="Hãy liên hệ quản trị tổ chức nếu bạn cần quyền này."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Hồ sơ năng lực của tôi"
        subtitle="Hồ sơ năng lực số chuẩn hóa theo Thông tư 02/2025/TT-BGDĐT gắn với vị trí việc làm của bạn."
      />

      <MyCompetencyTabs />

      {isLoading ? (
        <div aria-label="Đang tải hồ sơ năng lực" className="space-y-4">
          <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : isError || !profile ? (
        <EmptyState
          icon={<AlertCircle className="size-12 text-slate-300 mx-auto" />}
          title="Không tải được hồ sơ năng lực"
          description="Có lỗi khi tải dữ liệu. Vui lòng thử lại."
          action={
            <button type="button" onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Thử lại
            </button>
          }
        />
      ) : (
        <>
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Building className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phòng ban</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{profile.employee.departmentName || 'Chưa gán'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Briefcase className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vị trí việc làm</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{profile.employee.jobPositionName || 'Chưa gán'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Layers className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nhóm nghề</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{profile.employee.jobFamilyName || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Độ phủ năng lực</p>
                  <p className="text-base font-bold text-emerald-600 mt-0.5">
                    {profile.summary
                      ? <>{profile.summary.totalMet} / {profile.summary.totalRequired} năng lực ({profile.summary.coveragePercent}%)</>
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {profile.skipReason ? (
            <EmptyState
              icon={<AlertCircle className="size-12 text-slate-300 mx-auto" />}
              title="Chưa đối chiếu được với chuẩn vị trí"
              description={`${skillGapReasonMessage(profile.skipReason)} Vui lòng liên hệ HR hoặc quản lý trực tiếp.`}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base">Danh mục năng lực theo vị trí việc làm</h3>
                {profile.requirementSet && (
                  <span className="text-xs text-slate-500">
                    Bộ yêu cầu phiên bản v{profile.requirementSet.versionNo}
                    {profile.requirementSet.effectiveFrom ? ` · áp dụng từ ${formatDate(profile.requirementSet.effectiveFrom)}` : ''}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table role="table" className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-6">Mã & Năng lực</th>
                      <th className="py-3.5 px-6">Miền năng lực TT02</th>
                      <th className="py-3.5 px-6 text-center">Yêu cầu</th>
                      <th className="py-3.5 px-6 text-center">Hiện tại</th>
                      <th className="py-3.5 px-6 text-center">Minh chứng</th>
                      <th className="py-3.5 px-6 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profile.items.map((item) => {
                      const isMet = item.status === 'MET';
                      return (
                        <tr key={item.competencyId} className="hover:bg-slate-50/50 transition">
                          <td className="py-4 px-6 font-medium text-slate-900">
                            <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded mr-2 font-bold">{item.competencyCode}</span>
                            <span>{item.competencyName}</span>
                            {item.mandatory && (
                              <span className="ml-2 text-[10px] font-bold uppercase text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Bắt buộc</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-600 text-xs">{item.categoryName || '—'}</td>
                          <td className="py-4 px-6 text-center"><LevelBadge level={item.requiredLevel} /></td>
                          <td className="py-4 px-6 text-center">
                            <LevelBadge level={item.currentLevel} />
                            {item.confirmedAt && <p className="text-[11px] text-slate-400 mt-1">{formatDate(item.confirmedAt)}</p>}
                          </td>
                          <td className="py-4 px-6 text-center text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1" title="Minh chứng đã xác nhận / đang chờ">
                              <FileCheck2 className="size-3.5 text-emerald-600" />
                              {item.confirmedEvidenceCount}
                              {item.pendingEvidenceCount > 0 && <span className="text-amber-600">(+{item.pendingEvidenceCount} chờ)</span>}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {isMet ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <CheckCircle2 className="size-3.5" /> Đạt
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                                Thiếu {item.gapSteps} mức
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
          )}

          {profile.otherConfirmed.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-base">Năng lực khác đã được xác nhận</h3>
              <p className="text-xs text-slate-500">Các năng lực vị trí hiện tại không yêu cầu nhưng bạn đã có minh chứng.</p>
              <div className="flex flex-wrap gap-2">
                {profile.otherConfirmed.map((c) => (
                  <span key={c.competencyId} className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="font-mono font-bold text-blue-700">{c.competencyCode}</span>
                    <span className="text-slate-700">{c.competencyName}</span>
                    <LevelBadge level={c.level} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
