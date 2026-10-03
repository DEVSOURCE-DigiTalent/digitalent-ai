import { Link } from 'react-router-dom';
import { CheckCircle2, BookOpen, Sparkles, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/shared';
import { useMySkillGap } from '@/hooks/use-skill-gaps';
import type { SkillGapItem } from '@/services/intelligence.service';
import { MyCompetencyTabs } from '../components/MyCompetencyTabs';

function getRationale(item: SkillGapItem, positionName?: string): string {
  if (item.competencyCode === '4.1' || item.competencyCode === '4.2') {
    return 'Năng lực an toàn số và bảo mật dữ liệu bắt buộc theo chuẩn quy định và Thông tư 02/2025/TT-BGDĐT.';
  }
  if (item.requiredLevel >= 3) {
    return `Yêu cầu nghiệp vụ nâng cao trọng yếu đối với vị trí ${positionName || 'công việc'} nhằm đảm bảo khả năng tối ưu hóa quy trình số.`;
  }
  if (item.requiredLevel === 2) {
    return `Tiêu chuẩn vận hành độc lập (Trung cấp) được thiết lập cho vị trí ${positionName || 'công việc'} theo khung tham chiếu.`;
  }
  return `Tiêu chuẩn năng lực cơ bản nền tảng theo chuẩn hóa khung Thông tư 02/2025.`;
}

function getSeverityBadge(severity: string | null | undefined) {
  switch (severity) {
    case 'HIGH':
      return <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Mức độ Cao</span>;
    case 'MEDIUM':
      return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Mức độ Trung bình</span>;
    default:
      return <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Mức độ Thấp</span>;
  }
}

/**
 * EM-03: Khoảng trống năng lực của tôi (MySkillGapPage).
 * Giải thích lý do có yêu cầu (rationale), mức độ nghiêm trọng và gợi ý bồi dưỡng.
 */
export function MySkillGapPage() {
  const { data: gapRun, isLoading } = useMySkillGap();

  const lines = gapRun?.items ?? [];
  const gapLines = lines.filter((line) => line.gapSteps > 0);
  const metLines = lines.filter((line) => line.gapSteps === 0);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Khoảng trống năng lực của tôi (Skill Gap)"
          subtitle="So sánh năng lực thực tế với tiêu chuẩn vị trí việc làm theo Thông tư 02/2025 và giải thích cơ sở yêu cầu."
        />
        <Link
          to="/enterprise/me/learning-path"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition shrink-0"
        >
          <BookOpen className="size-4" />
          <span>Xem lộ trình bồi dưỡng</span>
        </Link>
      </div>

      <MyCompetencyTabs />

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : !gapRun ? (
        <EmptyState
          icon={<Info className="size-12 text-slate-300 mx-auto" />}
          title="Chưa có dữ liệu khoảng trống năng lực"
          description="Hệ thống chưa tính toán khoảng trống năng lực cho bạn. Vui lòng liên hệ quản lý hoặc hoàn thành đánh giá ban đầu."
        />
      ) : (
        <>
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Tổng quan khoảng trống năng lực vị trí: {gapRun.jobPositionName}</h3>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Dựa trên bài đánh giá và các minh chứng thực tế đã xác nhận, hệ thống so sánh trực tiếp với bộ tiêu chuẩn vị trí hiện hành.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Năng lực đã đạt chuẩn</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{metLines.length} / {lines.length}</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Khoảng trống cần bổ sung</span>
                <p className="text-2xl font-black text-amber-500 mt-1">{gapLines.length} năng lực</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Khoảng trống mức độ Cao</span>
                <p className="text-2xl font-black text-rose-600 mt-1">
                  {gapLines.filter((g) => g.severity === 'HIGH').length}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Skill Gap Cards with Rationale */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              Các năng lực cần ưu tiên bồi dưỡng và cơ sở yêu cầu
            </h3>

            {gapLines.length === 0 ? (
              <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center p-8 space-y-3">
                <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 text-lg">Đã đáp ứng 100% tiêu chuẩn năng lực!</h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Bạn đã đạt chuẩn toàn bộ các năng lực yêu cầu cho vị trí công việc hiện tại.
                </p>
              </div>
            ) : (
              gapLines.map((line: SkillGapItem) => (
                <div
                  key={line.competencyId}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                          {line.competencyCode}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base">{line.competencyName}</h4>
                        {getSeverityBadge(line.severity)}
                      </div>
                      <p className="text-xs text-slate-500">Miền: {line.categoryName || '—'}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Hiện tại:</span>
                        <span className="font-bold text-slate-700">
                          {line.currentLevel && line.currentLevel > 0 ? `Bậc ${line.currentLevel}` : 'Chưa xác nhận'}
                        </span>
                      </div>
                      <span className="text-slate-300">→</span>
                      <div>
                        <span className="text-slate-400 block">Yêu cầu:</span>
                        <span className="font-bold text-blue-600">Trình độ {line.requiredLevel}</span>
                      </div>
                      <span className="text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded">
                        Thiếu {line.gapSteps} tầng
                      </span>
                    </div>
                  </div>

                  {/* Rationale Section */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-start gap-3">
                    <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-slate-800">Cơ sở yêu cầu (Rationale):</p>
                      <p className="text-slate-600 leading-relaxed">
                        {getRationale(line, gapRun.jobPositionName ?? undefined)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <Link
                      to="/enterprise/me/learning-path"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                      <span>Xem khóa học đề xuất bù đắp</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
