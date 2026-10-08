import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { usePlatformReferencePosition, useUpdatePositionRequirements } from '@/hooks/use-platform';
import { COMPETENCIES, CATEGORIES } from '@/services/mock/server/catalog';
import { levelLabel } from '@/lib/competency-levels';

export function PlatformPositionRequirementsPage() {
  const { id = '' } = useParams<{ id: string }>(); // code like 'CEO', 'HR'
  const navigate = useNavigate();

  const { data: position, isLoading, isError } = usePlatformReferencePosition(id);
  const updateReqs = useUpdatePositionRequirements();

  // Map frameworkCode -> level (0..3)
  const [levelMap, setLevelMap] = useState<Record<string, number>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  useEffect(() => {
    if (position) {
      const initial: Record<string, number> = {};
      COMPETENCIES.forEach((c) => {
        const found = position.requiredCompetencies.find((r) => r.frameworkCode === c.frameworkCode);
        initial[c.frameworkCode] = found ? found.level : 0;
      });
      setLevelMap(initial);
    }
  }, [position]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải ma trận yêu cầu năng lực…</div>;
  }

  if (isError || !position) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/platform/positions')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách vị trí
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Không tìm thấy thông tin vị trí tham chiếu này.
        </div>
      </div>
    );
  }

  const handleLevelChange = (frameworkCode: string, newLevel: number) => {
    setLevelMap((prev) => ({ ...prev, [frameworkCode]: newLevel }));
  };

  const handleSave = async () => {
    setSaveError(undefined);
    setSaveSuccess(false);

    const requirements = Object.entries(levelMap).map(([frameworkCode, level]) => ({
      frameworkCode,
      level,
    }));

    try {
      await updateReqs.mutateAsync({ code: position.code, requirements });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Không thể cập nhật ma trận yêu cầu.');
    }
  };

  const totalRequired = Object.values(levelMap).filter((l) => l > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/platform/positions')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Danh sách vị trí tham chiếu
        </button>
        <span className="font-mono text-xs font-bold text-slate-500">
          Mã: {position.code} · Yêu cầu: {totalRequired} / 24 năng lực số
        </span>
      </div>

      <PageHeader
        title={`Yêu cầu năng lực chuẩn: ${position.name}`}
        subtitle={`Thiết lập trình độ năng lực yêu cầu theo Khung chuẩn năng lực số cho vị trí ${position.name}`}
      />

      {saveSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-5 text-emerald-600" />
          Đã lưu thành công ma trận yêu cầu năng lực cho vị trí {position.name}!
        </div>
      )}

      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {saveError}
        </div>
      )}

      {/* Competencies table grouped by categories */}
      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const comps = COMPETENCIES.filter((c) => c.categoryId === cat.id);

          return (
            <div key={cat.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 font-semibold text-sm text-slate-800 flex items-center justify-between">
                <span>{cat.code}: {cat.name}</span>
                <span className="text-xs text-slate-500 font-normal">{comps.length} năng lực</span>
              </div>

              <div className="divide-y divide-slate-100">
                {comps.map((comp) => {
                  const currentLvl = levelMap[comp.frameworkCode] ?? 0;

                  return (
                    <div
                      key={comp.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                            {comp.code}
                          </span>
                          <span className="text-sm font-medium text-slate-900">{comp.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{comp.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-500 font-medium mr-1">Trình độ năng lực yêu cầu:</span>
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                          {[0, 1, 2, 3].map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleLevelChange(comp.frameworkCode, lvl)}
                              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                currentLvl === lvl
                                  ? lvl === 3
                                    ? 'bg-purple-600 text-white font-bold'
                                    : lvl === 2
                                    ? 'bg-blue-600 text-white font-bold'
                                    : lvl === 1
                                    ? 'bg-emerald-600 text-white font-bold'
                                    : 'bg-slate-700 text-white font-bold'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {lvl === 0 ? 'Không yêu cầu' : `${levelLabel(lvl)} (Bậc ${lvl === 1 ? '1–2' : lvl === 2 ? '3–4' : '5–8'})`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating / Bottom Save Bar */}
      <div className="sticky bottom-4 z-10 flex justify-end gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/platform/positions')}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={updateReqs.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="size-4" />
          {updateReqs.isPending ? 'Đang lưu…' : 'Lưu ma trận yêu cầu'}
        </button>
      </div>
    </div>
  );
}
