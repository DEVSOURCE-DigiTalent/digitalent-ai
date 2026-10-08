import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { usePlatformReferencePositions } from '@/hooks/use-platform';

export function PlatformPositionsPage() {
  const navigate = useNavigate();
  const { data: positions, isLoading, isError, refetch } = usePlatformReferencePositions();

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải danh sách vị trí tham chiếu…</div>;
  }

  if (isError || !positions) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p className="font-medium">Không thể tải danh sách vị trí tham chiếu.</p>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vị trí tham chiếu chuẩn nền tảng"
        subtitle="5 vị trí công việc mẫu chuẩn hóa theo Khung chuẩn năng lực số"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {positions.map((pos) => {
          const reqCount = pos.requiredCompetencies.length;
          const advancedCount = pos.requiredCompetencies.filter((r) => r.level === 3).length;
          const intermediateCount = pos.requiredCompetencies.filter((r) => r.level === 2).length;
          const basicCount = pos.requiredCompetencies.filter((r) => r.level === 1).length;

          return (
            <div
              key={pos.code}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                    {pos.code}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {reqCount} / 24 năng lực
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{pos.name}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{pos.description}</p>

                <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Trình độ Nâng cao:</span>
                    <span className="font-bold text-purple-700">{advancedCount} năng lực</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trình độ Trung cấp:</span>
                    <span className="font-bold text-blue-700">{intermediateCount} năng lực</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trình độ Cơ bản:</span>
                    <span className="font-bold text-emerald-700">{basicCount} năng lực</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/platform/positions/${pos.code}/requirements`)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
                >
                  Biên tập ma trận yêu cầu
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
