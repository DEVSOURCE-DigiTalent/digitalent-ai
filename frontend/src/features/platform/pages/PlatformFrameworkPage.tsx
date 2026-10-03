import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, ChevronDown, ChevronRight } from 'lucide-react';
import { PageHeader, Modal } from '@/components/shared';
import { usePlatformFramework, useUpdateCompetencyDescription } from '@/hooks/use-platform';
import { levelLabel } from '@/lib/competency-levels';
import type { CatalogCompetency } from '@/services/mock/server/catalog';

export function PlatformFrameworkPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = usePlatformFramework();
  const updateDesc = useUpdateCompetencyDescription();

  const [selectedDomain, setSelectedDomain] = useState<string>('cat-1');
  const [expandedCompId, setExpandedCompId] = useState<string | null>(null);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentComp, setCurrentComp] = useState<CatalogCompetency | null>(null);
  const [descValue, setDescValue] = useState('');
  const [errorMsg, setErrorMsg] = useState<string>();

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải khung năng lực chuẩn…</div>;
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p className="font-medium">Không thể tải dữ liệu khung năng lực Thông tư 02/2025.</p>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
          Thử lại
        </button>
      </div>
    );
  }

  const { categories, competencies } = data;
  const domainCompetencies = competencies.filter((c) => c.categoryId === selectedDomain);

  const openEdit = (comp: CatalogCompetency, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentComp(comp);
    setDescValue(comp.description);
    setErrorMsg(undefined);
    setEditModalOpen(true);
  };

  const handleSaveDesc = async () => {
    if (!currentComp) return;
    setErrorMsg(undefined);
    try {
      await updateDesc.mutateAsync({ id: currentComp.id, description: descValue.trim() });
      setEditModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể cập nhật mô tả năng lực.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý khung năng lực số Thông tư 02/2025"
        subtitle="Chuẩn hóa 6 miền năng lực, 24 năng lực số và 3 bậc tiêu chuẩn hành vi áp dụng toàn hệ thống"
      />

      {/* Domain Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {categories.map((cat) => {
          const isActive = cat.id === selectedDomain;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedDomain(cat.id);
                setExpandedCompId(null);
              }}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.code}: {cat.name}
            </button>
          );
        })}
      </div>

      {/* Competencies List */}
      <div className="space-y-4">
        {domainCompetencies.map((comp) => {
          const isExpanded = expandedCompId === comp.id;
          return (
            <div
              key={comp.id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all"
            >
              <div
                onClick={() => setExpandedCompId(isExpanded ? null : comp.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="size-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="size-5 text-slate-400 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary-100 px-2 py-0.5 font-mono text-xs font-bold text-primary-800">
                        {comp.code}
                      </span>
                      <h3 className="font-semibold text-slate-900">{comp.name}</h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-1">{comp.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/platform/framework/${comp.id}`);
                    }}
                    className="inline-flex items-center gap-1 rounded border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                  >
                    Chi tiết chuẩn →
                  </button>
                  <button
                    type="button"
                    onClick={(e) => openEdit(comp, e)}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="size-3.5" />
                    Sửa mô tả
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50 p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Mô tả năng lực chuẩn
                    </h4>
                    <p className="text-sm text-slate-800">{comp.description}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                      Tiêu chí & Chỉ số hành vi theo Trình độ và Bậc năng lực TT02
                    </h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      {comp.criteria.map((crit) => (
                        <div key={crit.level} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {levelLabel(crit.level)}
                            </span>
                            <span className="font-mono text-xs text-primary-600 font-semibold">
                              Bậc {crit.level === 1 ? '1–2' : crit.level === 2 ? '3–4' : '5–8'}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500">Chỉ số hành vi chuẩn:</p>
                            <p className="text-xs text-slate-800 mt-0.5">{crit.behaviorIndicator}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500">Minh chứng đánh giá:</p>
                            <p className="text-xs text-slate-700 mt-0.5">{crit.evidenceGuidance}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Description Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Chỉnh sửa mô tả: ${currentComp?.code} - ${currentComp?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="comp-desc" className="block text-sm font-medium text-slate-700 mb-1">
              Mô tả chi tiết năng lực chuẩn
            </label>
            <textarea
              id="comp-desc"
              rows={4}
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveDesc}
              disabled={updateDesc.isPending}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {updateDesc.isPending ? 'Đang lưu…' : 'Lưu mô tả'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
