import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
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
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Save,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
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
  isMandatoryFor,
  mergeWithFramework,
  requiredRows,
  setRowLevel,
  type CompetencySource,
  type DomainRow,
} from '../utils/requirement-domains';
import { REFERENCE_POSITIONS } from '@/lib/reference-positions';
import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';
import './position-requirements.css';
import '@/features/organization/components/owner-filter-controls.css';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Đang áp dụng',
  DRAFT: 'Bản nháp',
  RETIRED: 'Đã thay thế',
};

const toSource = (c: CompetencyListItem): CompetencySource => ({
  ...c,
  categorySortOrder: c.categorySortOrder ?? 0,
});

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
  rows.map((row) => ({
    ...row,
    tempId: (row as Partial<EditableRequirementRow>).tempId ?? `new-${row.competencyId}`,
  }));

const snapshotRows = (rows: EditableRequirementRow[]) => JSON.stringify(rows.map((row) => ({
  competencyId: row.competencyId,
  requiredLevel: row.requiredLevel,
  weightPercent: Number(row.weightPercent),
  isMandatory: row.isMandatory,
  requiresPracticalEvidence: row.requiresPracticalEvidence,
  note: row.note?.trim() ?? '',
})));

export function PositionRequirementsPage() {
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.POSITION_REQUIREMENT_MANAGE) || can('position_requirement.create_update');

  const { data: positionsData, isLoading: positionsLoading } = useJobPositions({ pageSize: 100 });
  const { data: competenciesData } = useCompetencies({ pageSize: 100 });

  const [query, setQuery] = useSearchParams();
  const [selectedPositionId, setSelectedPositionId] = useState<string>(query.get('positionId') ?? '');
  const [selectedVersionNo, setSelectedVersionNo] = useState<number | undefined>(
    Number(query.get('version')) || undefined
  );

  const [search, setSearch] = useState('');
  const [selectedDomainTab, setSelectedDomainTab] = useState<string>('all');

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
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const competencies = useMemo(() => (competenciesData?.items ?? []).map(toSource), [competenciesData]);

  useEffect(() => {
    let nextItems: EditableRequirementRow[];
    if (reqData?.items?.length) {
      nextItems = withTempIds(mergeWithFramework(reqData.items.map(fromServer), competencies));
    } else if (reqData && !reqData.id) {
      nextItems = withTempIds(buildDraftRows(competencies));
    } else {
      nextItems = [];
    }
    setItems(nextItems);
    setSavedSnapshot(snapshotRows(nextItems));
  }, [reqData, competencies]);

  const groups = useMemo(() => groupByDomain(items), [items]);
  const issues = useMemo(() => activationIssues(items), [items]);
  const selected = useMemo(() => requiredRows(items), [items]);
  const totalWeight = Math.round(selected.reduce((sum, item) => sum + (Number(item.weightPercent) || 0), 0) * 100) / 100;
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;
  const isSaving = createDraftMutation.isPending || updateDraftMutation.isPending || activateMutation.isPending;
  const hasUnsavedChanges = items.length > 0 && snapshotRows(items) !== savedSnapshot;
  const canEdit = canManage && !isSaving;
  const isUnsavedDraft = !!reqData && !reqData.id && items.length > 0;
  const versions = reqData?.versions ?? [];
  const selectedPosition = positionsData?.items?.find((p) => p.id === selectedPositionId);

  // Match position with DigiTalent reference roles (CEO, HR, Marketing, Sales, Accountant)
  const matchedReference = useMemo(() => {
    if (!selectedPosition) return null;
    const name = selectedPosition.name.toLowerCase();
    const code = selectedPosition.code.toUpperCase();
    if (name.includes('kế toán') || code.includes('ACC')) return REFERENCE_POSITIONS.find((p) => p.code === 'ACCOUNTANT');
    if (name.includes('nhân sự') || name.includes('hr') || code.includes('HR')) return REFERENCE_POSITIONS.find((p) => p.code === 'HR');
    if (name.includes('marketing') || code.includes('MKT')) return REFERENCE_POSITIONS.find((p) => p.code === 'MARKETING');
    if (name.includes('kinh doanh') || name.includes('sales') || code.includes('SALE')) return REFERENCE_POSITIONS.find((p) => p.code === 'SALES_CRM');
    if (name.includes('giám đốc') || name.includes('ceo') || code.includes('CEO')) return REFERENCE_POSITIONS.find((p) => p.code === 'CEO');
    return null;
  }, [selectedPosition]);

  // Handlers for smart presets
  const applyReferencePreset = (refCode: string) => {
    const ref = REFERENCE_POSITIONS.find((p) => p.code === refCode);
    if (!ref) return;
    setItems((prev) => {
      const updated = prev.map((row) => {
        const idx = TT02_COMPETENCY_CODES.indexOf(row.frameworkCode as any);
        if (idx !== -1 && idx < ref.levels.length) {
          const level = ref.levels[idx];
          return {
            ...row,
            requiredLevel: level,
            isMandatory: isMandatoryFor(level, row.frameworkCode),
            weightPercent: level === 0 ? 0 : row.weightPercent,
          };
        }
        return row;
      });
      return distributeWeightsByDomain(updated);
    });
    toast.success(`Đã nạp chuẩn mẫu ${ref.name} và tự động cân bằng 100% trọng số.`);
  };

  const applyUniformLevel = (level: number) => {
    setItems((prev) => {
      const updated = prev.map((row) => ({
        ...row,
        requiredLevel: level,
        isMandatory: isMandatoryFor(level, row.frameworkCode),
        weightPercent: level === 0 ? 0 : row.weightPercent,
      }));
      return distributeWeightsByDomain(updated);
    });
    toast.success(`Đã áp dụng mức ${level === 1 ? 'Cơ bản' : 'Trung cấp'} cho toàn bộ năng lực.`);
  };

  const handleBalanceWeights = () => {
    setItems((prev) => distributeWeightsByDomain(prev));
    toast.success('Đã tự động cân bằng đều 100% trọng số theo 6 miền chuẩn.');
  };

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
        toast.success('Đã lưu bản nháp chuẩn năng lực');
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
      setSavedSnapshot(snapshotRows(items));
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
      toast.success('Đã kích hoạt phiên bản yêu cầu thành công');
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
        ? `Cần chọn từ ${MIN_REQUIREMENT_COUNT} đến ${TT02_COMPETENCY_CODES.length} năng lực (hiện có ${issues.requiredCount})`
        : issues.missingCore.length > 0
          ? `Còn thiếu năng lực an toàn cốt lõi: ${issues.missingCore.join(', ')}`
          : !isWeightValid
          ? 'Tổng trọng số phải bằng đúng 100% mới kích hoạt được'
          : null;

  // Filter groups if domain tab is active
  const displayedGroups = useMemo(() => {
    if (selectedDomainTab === 'all') return groups;
    return groups.filter((g) => g.domain.categoryId === selectedDomainTab);
  }, [groups, selectedDomainTab]);

  return (
    <div className="pr-builder -m-4 md:-m-6 min-h-screen space-y-5 px-5 py-7 pb-28 sm:px-6 xl:px-10">
      {/* ── Breadcrumb & Top Action Header ── */}
      <div className="pr-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div>
          <Link
            to="/enterprise/setup?tab=positions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-1.5 block w-fit"
          >
            <ArrowLeft className="size-3.5" />
            <span>Quay lại Khung năng lực số</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-[-0.04em] heading-gradient">
            Thiết lập chuẩn năng lực theo vị trí
          </h1>
          <p className="mt-1 text-sm text-slate-600">Đặt mức yêu cầu và trọng số cho 24 năng lực theo từng vị trí công việc.</p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleBalanceWeights}
              disabled={!canEdit || items.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              title="Chia đều 100% trọng số cho các năng lực đã chọn"
            >
              <Scale className="size-3.5 text-slate-500" />
              <span>Cân bằng 100%</span>
            </button>

            <button
              type="button"
              onClick={executeSaveDraft}
              disabled={!canEdit || items.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="size-3.5 text-slate-600" />
              <span>{isSaving ? 'Đang lưu…' : 'Lưu bản nháp'}</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={isSaving || activateBlockedReason !== null}
              title={activateBlockedReason ?? 'Kích hoạt phiên bản này'}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Kích hoạt phiên bản</span>
            </button>
          </div>
        )}
      </div>

      {/* ── CARD 1: Trung tâm Vị trí, Phiên bản & Chỉ số Sức khỏe (Health Hub) ── */}
      <div className="pr-position-card rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Bộ chọn vị trí công việc */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label htmlFor="position-select" className="text-xs font-bold text-slate-600 whitespace-nowrap uppercase tracking-wider">
              Vị trí công việc:
            </label>
            <div className="relative">
              <select
                id="position-select"
                value={selectedPositionId}
                onChange={(e) => {
                  setSelectedPositionId(e.target.value);
                  setSelectedVersionNo(undefined);
                  setQuery((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('positionId', e.target.value);
                    next.delete('version');
                    return next;
                  });
                }}
                disabled={positionsLoading || isSaving}
                className="w-full sm:min-w-[280px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-2xs focus:bg-white focus:border-emerald-600 focus:outline-hidden cursor-pointer"
              >
                {positionsLoading ? (
                  <option value="">Đang tải danh sách vị trí…</option>
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

            {/* Chọn phiên bản nếu vị trí có nhiều hơn 1 phiên bản */}
            {versions.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Phiên bản:</span>
                <select
                  value={reqData?.versionNo}
                  onChange={(e) => setSelectedVersionNo(Number(e.target.value))}
                  disabled={isSaving}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-hidden"
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.versionNo}>
                      v{v.versionNo} · {STATUS_LABELS[v.status] ?? v.status}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 4 Thẻ chỉ số sức khỏe trực quan, cập nhật thời gian thực */}
          <div className="pr-builder-metrics flex flex-wrap items-center gap-2.5">
            {/* Trạng thái */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border ${
                reqData?.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span className={`size-1.5 rounded-full ${reqData?.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
              <span>{isUnsavedDraft ? 'Bản nháp chưa lưu' : STATUS_LABELS[reqData?.status || 'DRAFT'] ?? 'Bản nháp'}</span>
            </span>

            {/* Số năng lực yêu cầu */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border ${
                issues.isCountValid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span>Năng lực:</span>
              <b>{issues.requiredCount}/{TT02_COMPETENCY_CODES.length}</b>
              {issues.isCountValid ? <Check className="size-3 text-emerald-600" /> : <AlertCircle className="size-3 text-rose-600" />}
            </span>

            {/* Cốt lõi an toàn số 4.1 & 4.2 */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border ${
                issues.missingCore.length === 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <ShieldCheck className="size-3.5" />
              <span>Cốt lõi 4.1 & 4.2:</span>
              <b>{issues.missingCore.length === 0 ? 'Đạt' : 'Thiếu'}</b>
            </span>

            {/* Tổng trọng số */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border ${
                isWeightValid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span>Tổng trọng số:</span>
              <b>{totalWeight}%</b>
              {!isWeightValid && (
                <button
                  type="button"
                  onClick={handleBalanceWeights}
                  className="rounded bg-amber-600 px-1.5 py-0.2 text-[10px] font-bold text-white hover:bg-amber-700 transition-colors"
                >
                  Cân bằng
                </button>
              )}
            </span>
          </div>
        </div>

        {/* ── Banner Gợi ý Thông minh nếu vị trí khớp với 5 vị trí tham chiếu ── */}
        {matchedReference && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white p-4 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs shrink-0">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  Mẫu tham chiếu <b>{matchedReference.name}</b> phù hợp với vị trí {selectedPosition?.name}.
                </p>
                <p className="text-xs text-emerald-700">
                  Áp dụng mức năng lực và phân bổ trọng số từ mẫu.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => applyReferencePreset(matchedReference.code)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition-colors shrink-0 cursor-pointer"
            >
              <span>Áp dụng mẫu {matchedReference.name} →</span>
            </button>
          </div>
        )}
      </div>

      {/* ── CARD 2: Thanh công cụ Lọc nhanh, Tìm kiếm & Mẫu thiết lập sẵn ── */}
      <div className="pr-toolbar owner-filter-toolbar flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        {/* Tìm kiếm nhanh */}
        <label className="owner-filter-search min-w-[240px] flex-1 max-w-2xl">
          <Search className="size-4" aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm năng lực theo vị trí"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã hoặc tên năng lực (ví dụ: 1.1, an toàn)..."
            className="w-full text-sm"
          />
        </label>

        {/* Nạp nhanh mẫu chuẩn khác */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Nạp nhanh:</span>
          <OwnerFilterSelect
            label="Chọn mẫu tham chiếu"
            value=""
            onChange={(selected) => {
              if (selected === 'ALL_1') applyUniformLevel(1);
              else if (selected === 'ALL_2') applyUniformLevel(2);
              else if (selected) applyReferencePreset(selected);
            }}
            options={[{ value: '', label: 'Chọn mẫu tham chiếu có sẵn…' }, { value: 'ACCOUNTANT', label: 'Mẫu Kế toán' }, { value: 'HR', label: 'Mẫu Nhân sự' }, { value: 'MARKETING', label: 'Mẫu Marketing' }, { value: 'SALES_CRM', label: 'Mẫu Kinh doanh' }, { value: 'CEO', label: 'Mẫu Giám đốc' }, { value: 'ALL_1', label: 'Mẫu Cơ bản toàn bộ' }, { value: 'ALL_2', label: 'Mẫu Trung cấp toàn bộ' }]}
          />
        </div>
      </div>

      {/* ── BỘ LỌC TABS 6 MIỀN NĂNG LỰC: Dễ dàng điều hướng không cần cuộn trang dài ── */}
      <div className="pr-domain-tabs flex items-center gap-2 overflow-x-auto pb-1 select-none">
        <button
          type="button"
          onClick={() => setSelectedDomainTab('all')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            selectedDomainTab === 'all'
              ? 'bg-slate-900 text-white font-bold shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tất cả 6 miền (24)
        </button>
        {groups.map((group) => {
          const isActive = selectedDomainTab === group.domain.categoryId;
          return (
            <button
              key={group.domain.categoryId}
              type="button"
              onClick={() => setSelectedDomainTab(group.domain.categoryId)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Miền {group.domain.sortOrder}: {group.domain.name.split(' ')[0]} ({group.rows.length})
            </button>
          );
        })}
      </div>

      {/* ── CẢNH BÁO NẾU CÒN ĐIỀU KIỆN CHƯA THỎA MÃN ĐỂ KÍCH HOẠT ── */}
      {items.length > 0 && activateBlockedReason && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 shadow-2xs">
          <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold">Lưu ý trước khi kích hoạt: </span>
              <span>{activateBlockedReason}</span>
            </div>
            {!isWeightValid && (
              <button
                type="button"
                onClick={handleBalanceWeights}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-700 px-3 py-1 text-xs font-bold text-white hover:bg-amber-800 transition-colors shrink-0 cursor-pointer"
              >
                <Scale className="size-3" />
                <span>Cân bằng 100% ngay</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── KHỐI DANH SÁCH 6 MIỀN NĂNG LỰC (CARD COMPONENT HIỆN ĐẠI, THÔNG MINH) ── */}
      {reqLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-2xs">
          Đang tải cấu hình chuẩn năng lực…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
          <AlertCircle className="size-10 text-slate-300 mx-auto mb-2.5" />
          <p className="text-sm font-semibold text-slate-700">Chưa có năng lực nào trong hệ thống</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedGroups.map((group) => (
            <RequirementDomainSection
              key={group.domain.categoryId}
              group={group}
              canEdit={canEdit}
              searchQuery={search}
              onRowChange={handleRowChange}
              onRowLevelChange={(competencyId, level) => setItems((prev) => setRowLevel(prev, competencyId, level))}
              onApplyDomainLevel={(categoryId, level) => setItems((prev) => applyLevelToDomain(prev, categoryId, level))}
            />
          ))}
        </div>
      )}

      {canManage && hasUnsavedChanges && createPortal(
        <div className="pr-save-bar" role="status" aria-live="polite">
          <div className="pr-save-dot" aria-hidden="true" />
          <div className="pr-save-copy">
            <strong>Thay đổi chuẩn năng lực chưa được lưu</strong>
            <span>{selectedPosition?.name ?? 'Vị trí công việc'} · {issues.requiredCount}/24 năng lực · Trọng số {totalWeight}%</span>
          </div>
          <div className="pr-save-actions">
            {!isWeightValid && <button type="button" onClick={handleBalanceWeights} disabled={!canEdit}>Cân bằng 100%</button>}
            <button type="button" className="pr-save-primary" onClick={executeSaveDraft} disabled={!canEdit}>
              <Save className="size-4" /> {isSaving ? 'Đang lưu…' : 'Lưu bản nháp'}
            </button>
          </div>
        </div>,
        document.body,
      )}

      {/* ── MODAL XÁC NHẬN KÍCH HOẠT PHIÊN BẢN ── */}
      {confirmOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  Kích hoạt chuẩn năng lực
                </h3>
                <span className="text-xs text-slate-500">
                  {selectedPosition?.name} · Phiên bản v{reqData?.versionNo ?? 1}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Khi kích hoạt, phiên bản này sẽ trở thành chuẩn đánh giá chính thức cho vị trí <b>{selectedPosition?.name}</b>.
              Khoảng trống năng lực của nhân sự ở vị trí này sẽ được tính lại theo chuẩn mới.
            </p>

            <div>
              <label htmlFor="activate-reason" className="block text-xs font-semibold text-slate-700 mb-1">
                Lý do kích hoạt / Ban hành phiên bản (Tùy chọn)
              </label>
              <textarea
                id="activate-reason"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Ví dụ: Ban hành chuẩn năng lực mới theo Thông tư 02 cho vị trí Kế toán..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  setChangeReason('');
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={executeActivate}
                disabled={isSaving}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Đang kích hoạt…' : 'Xác nhận kích hoạt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
