import { useState, useEffect, useMemo } from 'react';
import { ConfirmActionDialog, PageHeader, StatusBadge, getStatusVariant } from '@/components/shared';
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
import { CheckCircle2, Save, AlertCircle, Scale, ListPlus } from 'lucide-react';
import type { PositionRequirementItemInput, PositionRequirementItemDto, CompetencyListItem } from '@/services/competency.service';
import { RequirementDomainSection, type EditableRequirementRow } from '../components/RequirementDomainSection';
import {
  applyLevelToDomain,
  buildDraftRows,
  distributeWeightsByDomain,
  domainLevel,
  groupByDomain,
  missingFrameworkCodes,
  toDomainRow,
  type CompetencySource,
} from '../utils/requirement-domains';

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

const withTempIds = (rows: ReturnType<typeof buildDraftRows>): EditableRequirementRow[] =>
  rows.map((row) => ({ ...row, tempId: `new-${row.competencyId}` }));

/**
 * Position requirement editor — Circular 02/2025 (D-B4): a set always holds all 24 competencies, grouped by the
 * 6 domains; a level can be applied to a whole domain and still be adjusted per line; lines cannot be removed.
 */
export function PositionRequirementsPage() {
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.POSITION_REQUIREMENT_MANAGE) || can('position_requirement.create_update');

  const { data: positionsData, isLoading: positionsLoading } = useJobPositions({ pageSize: 100 });
  const { data: competenciesData } = useCompetencies({ pageSize: 100 });
  const [selectedPositionId, setSelectedPositionId] = useState<string>('');

  useEffect(() => {
    if (!selectedPositionId && positionsData?.items?.length) {
      setSelectedPositionId(positionsData.items[0].id);
    }
  }, [positionsData, selectedPositionId]);

  const { data: reqData, isLoading: reqLoading } = usePositionRequirements(selectedPositionId);
  const createDraftMutation = useCreateDraftPositionRequirements();
  const updateDraftMutation = useUpdateDraftPositionRequirements();
  const activateMutation = useActivatePositionRequirements();

  const [items, setItems] = useState<EditableRequirementRow[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const competencies = useMemo(() => (competenciesData?.items ?? []).map(toSource), [competenciesData]);

  // Server set → editable rows; a position without any set starts from a full 24-line draft.
  useEffect(() => {
    if (reqData?.items?.length) {
      setItems(reqData.items.map(fromServer));
    } else if (reqData && !reqData.id) {
      setItems(withTempIds(buildDraftRows(competencies)));
    } else {
      setItems([]);
    }
  }, [reqData, competencies]);

  const groups = useMemo(() => groupByDomain(items), [items]);
  const missingCodes = useMemo(() => missingFrameworkCodes(items), [items]);
  const totalWeight = Math.round(items.reduce((sum, item) => sum + (Number(item.weightPercent) || 0), 0) * 100) / 100;
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;
  const isSaving = createDraftMutation.isPending || updateDraftMutation.isPending || activateMutation.isPending;
  const canEdit = canManage && !isSaving;
  const isUnsavedDraft = !!reqData && !reqData.id && items.length > 0;
  const selectedPosition = positionsData?.items?.find((p) => p.id === selectedPositionId);

  const handleRowChange = (competencyId: string, field: string, value: number | boolean | string) =>
    setItems((prev) => prev.map((row) => (row.competencyId === competencyId ? { ...row, [field]: value } : row)));

  const handleAddMissing = () => {
    const present = new Set(items.map((i) => i.competencyId));
    const additions = competencies
      .filter((c) => c.frameworkCode && missingCodes.includes(c.frameworkCode) && !present.has(c.id))
      .map((c) => {
        const domainRows = items.filter((i) => i.categoryId === c.categoryId);
        return { ...toDomainRow(c, domainRows.length ? domainLevel(domainRows) : 2), tempId: `new-${c.id}` };
      });
    setItems((prev) => distributeWeightsByDomain([...prev, ...additions]));
  };

  const handleSaveDraft = async () => {
    if (!selectedPositionId || items.length === 0) {
      toast.error('Select a job position with competency requirements first');
      return;
    }
    const payloadItems: PositionRequirementItemInput[] = items.map((i) => ({
      competencyId: i.competencyId,
      requiredLevel: Number(i.requiredLevel),
      weightPercent: Number(i.weightPercent),
      isMandatory: i.isMandatory,
      requiresPracticalEvidence: i.requiresPracticalEvidence,
      note: i.note?.trim() || undefined,
    }));
    try {
      if (reqData?.id && reqData.status === 'DRAFT') {
        await updateDraftMutation.mutateAsync({ id: reqData.id, data: { items: payloadItems } });
        toast.success('Draft requirements updated successfully');
      } else {
        await createDraftMutation.mutateAsync({ jobPositionId: selectedPositionId, items: payloadItems });
        toast.success('New draft requirement version created successfully');
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to save draft requirements'));
    }
  };

  const handleActivate = async () => {
    if (!reqData?.id) return;
    try {
      await activateMutation.mutateAsync(reqData.id);
      toast.success('Position requirement set activated successfully');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to activate position requirements'));
    }
  };

  const activateBlockedReason = !reqData?.id
    ? 'Save the draft before activating'
    : reqData.status === 'ACTIVE'
      ? 'This version is already active'
      : missingCodes.length > 0
        ? `Missing competencies: ${missingCodes.join(', ')}`
        : !isWeightValid
          ? 'Weights must total 100% to activate'
          : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Position Requirements"
        subtitle="Required level and weight of the 24 competencies of the national digital competence framework (Circular 02/2025) for each job position"
      />

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label htmlFor="position-select" className="text-sm font-semibold text-slate-700 whitespace-nowrap">
            Select Job Position:
          </label>
          <select
            id="position-select"
            value={selectedPositionId}
            onChange={(e) => setSelectedPositionId(e.target.value)}
            disabled={positionsLoading || isSaving}
            className="min-w-[260px] px-3 py-2 border border-slate-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {positionsLoading ? (
              <option value="">Loading positions...</option>
            ) : positionsData?.items?.length ? (
              positionsData.items.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.name} ({pos.code})
                </option>
              ))
            ) : (
              <option value="">No job positions available</option>
            )}
          </select>
        </div>

        {selectedPositionId && reqData && (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Version:</span>
              <span className="font-semibold text-slate-800">v{reqData.versionNo > 0 ? reqData.versionNo : 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Status:</span>
              <StatusBadge
                label={isUnsavedDraft ? 'UNSAVED DRAFT' : reqData.status || 'DRAFT'}
                variant={getStatusVariant(reqData.status || 'DRAFT')}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Total Weight:</span>
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

      {missingCodes.length > 0 && items.length > 0 && (
        <div role="alert" className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="flex-1">
            A requirement set must include all 24 competencies of the national digital competence framework (Circular
            02/2025) before it can be activated. Missing: <strong>{missingCodes.join(', ')}</strong>.
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={handleAddMissing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 bg-white border border-amber-300 rounded-md hover:bg-amber-100"
            >
              <ListPlus className="w-3.5 h-3.5" /> Add missing competencies
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">Required Competency Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Grouped by the 6 domains · Basic / Intermediate / Advanced = Circular tiers 1–2 / 3–4 / 5–6 · weights total 100%
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
                <Scale className="w-3.5 h-3.5" /> Distribute weights by domain
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={!canEdit || items.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-md transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={isSaving || activateBlockedReason !== null}
                title={activateBlockedReason ?? 'Activate this requirement version'}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Activate Version
              </button>
            </div>
          )}
        </div>

        {reqLoading ? (
          <div className="py-16 text-center text-sm text-slate-500">Loading position requirements...</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-medium text-slate-700">No competency requirements mapped</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              The competency framework has no Circular 02/2025 competencies yet. Add them in Competency Framework first.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Competency</th>
                  <th className="px-4 py-3 w-56">Required Level</th>
                  <th className="px-4 py-3 w-36">Weight (%)</th>
                  <th className="px-4 py-3 w-24 text-center">Mandatory</th>
                  <th className="px-4 py-3 w-28 text-center">Evidence Req.</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              {groups.map((group) => (
                <RequirementDomainSection
                  key={group.domain.categoryId}
                  group={group}
                  canEdit={canEdit}
                  onRowChange={handleRowChange}
                  onApplyDomainLevel={(categoryId, level) => setItems((prev) => applyLevelToDomain(prev, categoryId, level))}
                />
              ))}
            </table>
          </div>
        )}
      </div>

      <ConfirmActionDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleActivate}
        title="Activate requirement version"
        description={`Activate version v${reqData?.versionNo ?? ''} for ${selectedPosition?.name ?? 'this position'}? The currently active version will be archived and skill gaps of employees in this position will be recalculated.`}
        confirmLabel="Activate"
        confirmVariant="primary"
      />
    </div>
  );
}
