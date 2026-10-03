import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, StatusBadge, getStatusVariant } from '@/components/shared';
import { useJobPositions } from '@/hooks/use-job-positions';
import {
  useCompetencies,
  usePositionRequirements,
  useCreateDraftPositionRequirements,
  useUpdateDraftPositionRequirements,
  useActivatePositionRequirements,
} from '@/hooks/use-competencies';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { apiErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle2, Save, AlertCircle, Scale } from 'lucide-react';
import type { PositionRequirementItemInput, PositionRequirementItemDto, CompetencyListItem } from '@/services/competency.service';
import { RequirementDomainSection, type EditableRequirementRow } from '../components/RequirementDomainSection';
import {
  MIN_REQUIREMENT_COUNT,
  TT02_COMPETENCY_CODES,
  activationIssues,
  applyLevelToDomain,
  buildDraftRows,
  distributeWeightsByDomain,
  groupByDomain,
  mergeWithFramework,
  requiredRows,
  setRowLevel,
  type CompetencySource,
  type DomainRow,
} from '../utils/requirement-domains';

const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Đang áp dụng', DRAFT: 'Bản nháp', RETIRED: 'Đã thay thế' };

const toSource = (c: CompetencyListItem): CompetencySource => ({ ...c, categorySortOrder: c.categorySortOrder ?? 0 });

function fromServer(item: PositionRequirementItemDto): EditableRequirementRow {
  return {
    tempId: item.id,
    competencyId: item.competencyId,
    competencyCode: item.competencyCode,
    competencyName: item.competencyName,
    frameworkCode: item.frameworkCode ?? null,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    categorySortOrder: item.categorySortOrder ?? 0,
    requiredLevel: item.requiredLevel,
    weightPercent: Number(item.weightPercent),
    isMandatory: item.isMandatory,
    requiresPracticalEvidence: item.requiresPracticalEvidence,
    note: item.note || '',
  };
}

const withTempIds = (rows: DomainRow[]): EditableRequirementRow[] =>
  rows.map((row) => ({ ...row, tempId: (row as Partial<EditableRequirementRow>).tempId ?? `new-${row.competencyId}` }));

/**
 * Position requirement editor — Circular 02/2025 (D-B7): the whole framework is always listed, grouped by the 6
 * domains; each competency is set to a level or "Not required" for the job (9–24 required, core 4.1 and 4.2 always);
 * a level can be applied to a whole domain and still be adjusted per line.
 */
export function PositionRequirementsPage() {
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.POSITION_REQUIREMENT_MANAGE) || can('position_requirement.create_update');

  const { data: positionsData, isLoading: positionsLoading } = useJobPositions({ pageSize: 100 });
  const { data: competenciesData } = useCompetencies({ pageSize: 100 });
  // ?positionId= and ?version= come from the position detail and version history pages.
  const [query] = useSearchParams();
  const [selectedPositionId, setSelectedPositionId] = useState<string>(query.get('positionId') ?? '');
  // undefined = the server default (the active version, or the latest one when none is active)
  const [selectedVersionNo, setSelectedVersionNo] = useState<number | undefined>(Number(query.get('version')) || undefined);

  useEffect(() => {
    if (!selectedPositionId && positionsData?.items?.length) {
      setSelectedPositionId(positionsData.items[0].id);
    }
  }, [positionsData, selectedPositionId]);

  const { data: reqData, isLoading: reqLoading } = usePositionRequirements(selectedPositionId, selectedVersionNo);
  const createDraftMutation = useCreateDraftPositionRequirements();
  const updateDraftMutation = useUpdateDraftPositionRequirements();
  const activateMutation = useActivatePositionRequirements();

  const [items, setItems] = useState<EditableRequirementRow[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const competencies = useMemo(() => (competenciesData?.items ?? []).map(toSource), [competenciesData]);

  // Server set → editable rows (+ "Not required" rows for the rest of the framework);
  // a position without any set starts from a full draft that HR trims.
  useEffect(() => {
    if (reqData?.items?.length) {
      setItems(withTempIds(mergeWithFramework(reqData.items.map(fromServer), competencies)));
    } else if (reqData && !reqData.id) {
      setItems(withTempIds(buildDraftRows(competencies)));
    } else {
      setItems([]);
    }
  }, [reqData, competencies]);

  const groups = useMemo(() => groupByDomain(items), [items]);
  const issues = useMemo(() => activationIssues(items), [items]);
  const selected = useMemo(() => requiredRows(items), [items]);
  const totalWeight = Math.round(selected.reduce((sum, item) => sum + (Number(item.weightPercent) || 0), 0) * 100) / 100;
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;
  const isSaving = createDraftMutation.isPending || updateDraftMutation.isPending || activateMutation.isPending;
  const canEdit = canManage && !isSaving;
  const isUnsavedDraft = !!reqData && !reqData.id && items.length > 0;
  const versions = reqData?.versions ?? [];
  const selectedPosition = positionsData?.items?.find((p) => p.id === selectedPositionId);

  const handleRowChange = (competencyId: string, field: string, value: number | boolean | string) =>
    setItems((prev) => prev.map((row) => (row.competencyId === competencyId ? { ...row, [field]: value } : row)));

  const executeSaveDraft = async () => {
    if (!selectedPositionId || selected.length === 0) {
      toast.error('Hãy đặt mức yêu cầu cho ít nhất một năng lực trước');
      return;
    }
    const payloadItems: PositionRequirementItemInput[] = selected.map((i) => ({
      competencyId: i.competencyId,
      requiredLevel: Number(i.requiredLevel),
      weightPercent: Number(i.weightPercent),
      isMandatory: i.isMandatory,
      requiresPracticalEvidence: i.requiresPracticalEvidence,
      note: i.note?.trim() || undefined,
    }));
    try {
      if (reqData?.id && reqData.status === 'DRAFT') {
        await updateDraftMutation.mutateAsync({
          id: reqData.id,
          data: { items: payloadItems, changeReason: changeReason.trim() || undefined },
        });
        toast.success('Đã cập nhật bản nháp yêu cầu');
      } else {
        const response = await createDraftMutation.mutateAsync({
          jobPositionId: selectedPositionId,
          items: payloadItems,
          changeReason: changeReason.trim() || undefined,
        });
        setSelectedVersionNo(response?.data?.data?.versionNo);
        toast.success('Đã tạo bản nháp phiên bản mới');
      }
      setChangeReason('');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không lưu được bản nháp yêu cầu'));
    }
  };

  const executeActivate = async () => {
    if (!reqData?.id) return;
    try {
      await activateMutation.mutateAsync(
        changeReason.trim()
          ? { id: reqData.id, changeReason: changeReason.trim() }
          : reqData.id
      );
      toast.success('Đã kích hoạt phiên bản yêu cầu');
      setConfirmOpen(false);
      setChangeReason('');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không kích hoạt được phiên bản yêu cầu'));
    }
  };

  const activateBlockedReason = !reqData?.id
    ? 'Hãy lưu bản nháp trước khi kích hoạt'
    : reqData.status === 'ACTIVE'
      ? 'Phiên bản này đang được áp dụng'
      : !issues.isCountValid
        ? `Chọn từ ${MIN_REQUIREMENT_COUNT} đến ${TT02_COMPETENCY_CODES.length} năng lực (hiện có ${issues.requiredCount})`
        : issues.missingCore.length > 0
          ? `Còn thiếu năng lực cốt lõi: ${issues.missingCore.join(', ')}`
          : !isWeightValid
          ? 'Tổng trọng số phải bằng 100% mới kích hoạt được'
          : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yêu cầu năng lực theo vị trí"
        subtitle="Chọn các năng lực của khung năng lực số quốc gia (Thông tư 02/2025) mà mỗi vị trí cần, kèm mức yêu cầu và trọng số"
      />

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label htmlFor="position-select" className="text-sm font-semibold text-slate-700 whitespace-nowrap">
            Vị trí công việc:
          </label>
          <select
            id="position-select"
            value={selectedPositionId}
            onChange={(e) => {
              setSelectedPositionId(e.target.value);
              setSelectedVersionNo(undefined);
            }}
            disabled={positionsLoading || isSaving}
            className="min-w-[260px] px-3 py-2 border border-slate-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {positionsLoading ? (
              <option value="">Đang tải vị trí…</option>
            ) : positionsData?.items?.length ? (
              positionsData.items.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.name} ({pos.code})
                </option>
              ))
            ) : (
              <option value="">Chưa có vị trí công việc</option>
            )}
          </select>
        </div>

        {selectedPositionId && reqData && (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              {versions.length > 1 ? (
                <label htmlFor="version-select" className="text-slate-500">
                  Phiên bản
                </label>
              ) : (
                <span className="text-slate-500">Phiên bản</span>
              )}
              {versions.length > 1 ? (
                <select
                  id="version-select"
                  value={reqData.versionNo}
                  onChange={(e) => setSelectedVersionNo(Number(e.target.value))}
                  disabled={isSaving}
                  className="px-2 py-1 border border-slate-300 rounded-md text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.versionNo}>
                      v{v.versionNo} · {STATUS_LABELS[v.status] ?? v.status}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-semibold text-slate-800">
                  v{reqData.versionNo > 0 ? reqData.versionNo : 1}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Trạng thái:</span>
              <StatusBadge
                label={isUnsavedDraft ? 'Bản nháp chưa lưu' : STATUS_LABELS[reqData.status || 'DRAFT'] ?? reqData.status}
                variant={getStatusVariant(reqData.status || 'DRAFT')}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Năng lực:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  issues.isCountValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {issues.requiredCount}/{TT02_COMPETENCY_CODES.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Tổng trọng số:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  isWeightValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {totalWeight}%
              </span>
            </div>
          </div>
        )}
      </div>

      {items.length > 0 && (!issues.isCountValid || issues.missingCore.length > 0) && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="space-y-1">
            {!issues.isCountValid && (
              <p>
                Bộ yêu cầu cần từ {MIN_REQUIREMENT_COUNT} đến {TT02_COMPETENCY_CODES.length} năng lực mới kích hoạt được
                (hiện có <strong>{issues.requiredCount}</strong>).
              </p>
            )}
            {issues.missingCore.length > 0 && (
              <p>
                Các năng lực an toàn cốt lõi là bắt buộc với mọi vị trí. Còn thiếu:{' '}
                <strong>{issues.missingCore.join(', ')}</strong>.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">Ma trận năng lực yêu cầu</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhóm theo 6 miền · chọn "Không yêu cầu" với năng lực vị trí không cần · Cơ bản / Trung cấp /
              Nâng cao = bậc 1–2 / 3–4 / 5–6 của Thông tư · tổng trọng số 100%
            </p>
          </div>
          {canManage && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setItems((prev) => distributeWeightsByDomain(prev))}
                disabled={!canEdit || items.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-md disabled:opacity-50"
              >
                <Scale className="w-3.5 h-3.5" /> Chia đều trọng số theo miền
              </button>
              <button
                type="button"
                onClick={executeSaveDraft}
                disabled={!canEdit || items.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-md transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" /> {isSaving ? 'Đang lưu…' : 'Lưu bản nháp'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={isSaving || activateBlockedReason !== null}
                title={activateBlockedReason ?? 'Kích hoạt phiên bản yêu cầu này'}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Kích hoạt phiên bản
              </button>
            </div>
          )}
        </div>

        {reqLoading ? (
          <div className="py-16 text-center text-sm text-slate-500">Đang tải yêu cầu năng lực…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-medium text-slate-700">Chưa có năng lực nào</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Khung năng lực chưa có năng lực nào của Thông tư 02/2025.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Năng lực</th>
                  <th className="px-4 py-3 w-56">Trình độ năng lực yêu cầu</th>
                  <th className="px-4 py-3 w-36">Trọng số (%)</th>
                  <th className="px-4 py-3 w-24 text-center">Bắt buộc</th>
                  <th className="px-4 py-3 w-28 text-center">Cần minh chứng</th>
                  <th className="px-4 py-3">Lý do yêu cầu (Rationale)</th>
                </tr>
              </thead>
              {groups.map((group) => (
                <RequirementDomainSection
                  key={group.domain.categoryId}
                  group={group}
                  canEdit={canEdit}
                  onRowChange={handleRowChange}
                  onRowLevelChange={(competencyId, level) => setItems((prev) => setRowLevel(prev, competencyId, level))}
                  onApplyDomainLevel={(categoryId, level) => setItems((prev) => applyLevelToDomain(prev, categoryId, level))}
                />
              ))}
            </table>
          </div>
        )}
      </div>

      {/* Dialog kích hoạt phiên bản kèm lý do thay đổi */}
      {confirmOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-slate-900">
              Kích hoạt phiên bản v{reqData?.versionNo ?? ''} cho {selectedPosition?.name ?? 'vị trí này'}
            </h3>
            <p className="text-sm text-slate-500">
              Kích hoạt phiên bản v{reqData?.versionNo ?? ''} cho {selectedPosition?.name ?? 'vị trí này'}.
              Phiên bản đang áp dụng trước đó sẽ chuyển thành đã thay thế và khoảng trống năng lực (skill gap)
              của toàn bộ nhân viên ở vị trí này sẽ được tự động tính toán lại.
            </p>
            <div>
              <label htmlFor="activate-reason" className="block text-xs font-medium text-slate-700 mb-1">
                Lý do kích hoạt / thay đổi phiên bản (Rationale)
              </label>
              <textarea
                id="activate-reason"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Ví dụ: Áp dụng chuẩn Thông tư 02 cho toàn bộ nhân sự mới, ban hành chính thức..."
                rows={3}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  setChangeReason('');
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={executeActivate}
                disabled={isSaving}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSaving ? 'Đang kích hoạt…' : 'Kích hoạt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
