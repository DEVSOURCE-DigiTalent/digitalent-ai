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
  const [selectedPositionId, setSelectedPositionId] = useState<string>('');
  // undefined = the server default (the active version, or the latest one when none is active)
  const [selectedVersionNo, setSelectedVersionNo] = useState<number | undefined>(undefined);

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

  const handleSaveDraft = async () => {
    if (!selectedPositionId || selected.length === 0) {
      toast.error('Set a required level for at least one competency first');
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
        await updateDraftMutation.mutateAsync({ id: reqData.id, data: { items: payloadItems } });
        toast.success('Draft requirements updated successfully');
      } else {
        const response = await createDraftMutation.mutateAsync({ jobPositionId: selectedPositionId, items: payloadItems });
        // Keep working on the draft: the default view would go back to the active version
        setSelectedVersionNo(response?.data?.data?.versionNo);
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
      : !issues.isCountValid
        ? `Select ${MIN_REQUIREMENT_COUNT}–${TT02_COMPETENCY_CODES.length} competencies (currently ${issues.requiredCount})`
        : issues.missingCore.length > 0
          ? `Core competencies missing: ${issues.missingCore.join(', ')}`
          : !isWeightValid
          ? 'Weights must total 100% to activate'
          : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Position Requirements"
        subtitle="Pick the competencies of the national digital competence framework (Circular 02/2025) each job position needs, with their required level and weight"
      />

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label htmlFor="position-select" className="text-sm font-semibold text-slate-700 whitespace-nowrap">
            Select Job Position:
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
              {versions.length > 1 ? (
                <label htmlFor="version-select" className="text-slate-500">
                  Version
                </label>
              ) : (
                <span className="text-slate-500">Version</span>
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
                      v{v.versionNo} · {v.status}
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
              <span className="text-slate-500">Status:</span>
              <StatusBadge
                label={isUnsavedDraft ? 'UNSAVED DRAFT' : reqData.status || 'DRAFT'}
                variant={getStatusVariant(reqData.status || 'DRAFT')}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Competencies:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  issues.isCountValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {issues.requiredCount} of {TT02_COMPETENCY_CODES.length}
              </span>
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

      {items.length > 0 && (!issues.isCountValid || issues.missingCore.length > 0) && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="space-y-1">
            {!issues.isCountValid && (
              <p>
                A requirement set needs between {MIN_REQUIREMENT_COUNT} and {TT02_COMPETENCY_CODES.length} competencies
                before it can be activated (currently <strong>{issues.requiredCount}</strong>).
              </p>
            )}
            {issues.missingCore.length > 0 && (
              <p>
                The core safety competencies are required for every position. Missing:{' '}
                <strong>{issues.missingCore.join(', ')}</strong>.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">Required Competency Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Grouped by the 6 domains · set "Not required" for competencies the job does not need · Basic / Intermediate /
              Advanced = Circular tiers 1–2 / 3–4 / 5–6 · weights total 100%
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
                  onRowLevelChange={(competencyId, level) => setItems((prev) => setRowLevel(prev, competencyId, level))}
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
