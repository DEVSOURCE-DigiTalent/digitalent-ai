import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { Plus, Trash2, CheckCircle2, Save, AlertCircle } from 'lucide-react';
import type { PositionRequirementItemInput } from '@/services/competency.service';

interface EditableItem extends PositionRequirementItemInput {
  tempId: string;
  competencyCode?: string;
  competencyName?: string;
}

export function PositionRequirementsPage() {
  const { can } = usePermission();
  const canManage =
    can(PERMISSIONS.POSITION_REQUIREMENT_MANAGE) ||
    can('position_requirement.create_update');

  const { data: positionsData, isLoading: positionsLoading } = useJobPositions({ pageSize: 100 });
  const { data: competenciesData } = useCompetencies({ pageSize: 100 });

  const [selectedPositionId, setSelectedPositionId] = useState<string>('');

  // Default to the first available position when loaded
  useEffect(() => {
    if (!selectedPositionId && positionsData?.items?.length) {
      setSelectedPositionId(positionsData.items[0].id);
    }
  }, [positionsData, selectedPositionId]);

  const { data: reqData, isLoading: reqLoading } = usePositionRequirements(selectedPositionId);

  const createDraftMutation = useCreateDraftPositionRequirements();
  const updateDraftMutation = useUpdateDraftPositionRequirements();
  const activateMutation = useActivatePositionRequirements();

  const [items, setItems] = useState<EditableItem[]>([]);

  // Sync server items to local editable items
  useEffect(() => {
    if (reqData?.items) {
      setItems(
        reqData.items.map((it) => ({
          tempId: it.id,
          competencyId: it.competencyId,
          competencyCode: it.competencyCode,
          competencyName: it.competencyName,
          requiredLevel: it.requiredLevel,
          weightPercent: Number(it.weightPercent),
          isMandatory: it.isMandatory,
          requiresPracticalEvidence: it.requiresPracticalEvidence,
          note: it.note || '',
        }))
      );
    } else {
      setItems([]);
    }
  }, [reqData]);

  const totalWeight = items.reduce((sum, item) => sum + (Number(item.weightPercent) || 0), 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  const handleAddItem = () => {
    const availableComp = competenciesData?.items?.find(
      (c) => !items.some((it) => it.competencyId === c.id)
    );
    const compId = availableComp?.id || competenciesData?.items?.[0]?.id || '';
    const comp = competenciesData?.items?.find((c) => c.id === compId);

    setItems((prev) => [
      ...prev,
      {
        tempId: `new-${Date.now()}-${Math.random()}`,
        competencyId: compId,
        competencyCode: comp?.code,
        competencyName: comp?.name,
        requiredLevel: 2,
        weightPercent: 20,
        isMandatory: true,
        requiresPracticalEvidence: true,
        note: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = <K extends keyof EditableItem>(
    index: number,
    field: K,
    value: EditableItem[K]
  ) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };

      if (field === 'competencyId') {
        const comp = competenciesData?.items?.find((c) => c.id === value);
        if (comp) {
          next[index].competencyCode = comp.code;
          next[index].competencyName = comp.name;
        }
      }
      return next;
    });
  };

  const handleSaveDraft = async () => {
    if (!selectedPositionId) {
      toast.error('Please select a job position');
      return;
    }

    if (items.length === 0) {
      toast.error('At least one competency requirement is required');
      return;
    }

    // Check duplicate competencies
    const compIds = items.map((i) => i.competencyId);
    if (new Set(compIds).size !== compIds.length) {
      toast.error('Duplicate competencies are not allowed in the same requirement set');
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
        await updateDraftMutation.mutateAsync({
          id: reqData.id,
          data: { items: payloadItems },
        });
        toast.success('Draft requirements updated successfully');
      } else {
        await createDraftMutation.mutateAsync({
          jobPositionId: selectedPositionId,
          items: payloadItems,
        });
        toast.success('New draft requirement version created successfully');
      }
    } catch {
      toast.error('Failed to save draft requirements');
    }
  };

  const handleActivate = async () => {
    if (!reqData?.id) {
      toast.error('Please save draft first before activating');
      return;
    }

    if (!isWeightValid) {
      toast.error(`Total weight must equal 100% (currently ${totalWeight}%)`);
      return;
    }

    try {
      await activateMutation.mutateAsync(reqData.id);
      toast.success('Position requirement set activated successfully');
    } catch {
      toast.error('Failed to activate position requirements');
    }
  };

  const isSaving =
    createDraftMutation.isPending ||
    updateDraftMutation.isPending ||
    activateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Position Requirements"
        subtitle="Define and manage competency proficiency levels and weight distribution for job positions"
      />

      {/* Position Selector Bar */}
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
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Version:</span>
              <span className="font-semibold text-slate-800">
                v{reqData.versionNo > 0 ? reqData.versionNo : 1}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Status:</span>
              <StatusBadge
                label={reqData.status || 'DRAFT'}
                variant={getStatusVariant(reqData.status || 'DRAFT')}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Total Weight:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  isWeightValid
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {totalWeight}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">Required Competency Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set required levels (1..3) and percentage weights totaling 100%
            </p>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddItem}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Competency
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-md transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" /> Save Draft
              </button>

              <button
                type="button"
                onClick={handleActivate}
                disabled={
                  isSaving ||
                  !reqData?.id ||
                  reqData.status === 'ACTIVE' ||
                  !isWeightValid
                }
                title={
                  !isWeightValid
                    ? 'Weight must total 100% to activate'
                    : reqData?.status === 'ACTIVE'
                    ? 'This version is already active'
                    : 'Activate this requirement version'
                }
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Activate Version
              </button>
            </div>
          )}
        </div>

        {reqLoading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading position requirements...
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-medium text-slate-700">No competency requirements mapped</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Add competencies to define required proficiency levels and weights for this position.
            </p>
            {canManage && (
              <button
                onClick={handleAddItem}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" /> Add First Competency
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Competency</th>
                  <th className="px-4 py-3 w-40">Required Level</th>
                  <th className="px-4 py-3 w-32">Weight (%)</th>
                  <th className="px-4 py-3 w-28 text-center">Mandatory</th>
                  <th className="px-4 py-3 w-32 text-center">Evidence Req.</th>
                  <th className="px-4 py-3">Notes</th>
                  {canManage && <th className="px-4 py-3 w-16 text-right"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={item.tempId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <select
                        aria-label={`Competency row ${idx + 1}`}
                        value={item.competencyId}
                        onChange={(e) => handleItemChange(idx, 'competencyId', e.target.value)}
                        disabled={!canManage || isSaving}
                        className="w-full text-sm px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                      >
                        <option value="">Select Competency</option>
                        {competenciesData?.items?.map((comp) => (
                          <option key={comp.id} value={comp.id}>
                            {comp.code} - {comp.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <select
                        aria-label={`Required level row ${idx + 1}`}
                        value={item.requiredLevel}
                        onChange={(e) =>
                          handleItemChange(idx, 'requiredLevel', Number(e.target.value))
                        }
                        disabled={!canManage || isSaving}
                        className="w-full text-sm px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                      >
                        <option value={1}>Level 1 - Basic</option>
                        <option value={2}>Level 2 - Applied</option>
                        <option value={3}>Level 3 - Advanced</option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          aria-label={`Weight percent row ${idx + 1}`}
                          min={1}
                          max={100}
                          value={item.weightPercent}
                          onChange={(e) =>
                            handleItemChange(idx, 'weightPercent', Number(e.target.value))
                          }
                          disabled={!canManage || isSaving}
                          className="w-20 text-sm px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <span className="text-slate-500 text-xs">%</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Mandatory row ${idx + 1}`}
                        checked={item.isMandatory}
                        onChange={(e) => handleItemChange(idx, 'isMandatory', e.target.checked)}
                        disabled={!canManage || isSaving}
                        className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                      />
                    </td>

                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Evidence required row ${idx + 1}`}
                        checked={item.requiresPracticalEvidence}
                        onChange={(e) =>
                          handleItemChange(idx, 'requiresPracticalEvidence', e.target.checked)
                        }
                        disabled={!canManage || isSaving}
                        className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="text"
                        aria-label={`Note row ${idx + 1}`}
                        value={item.note || ''}
                        onChange={(e) => handleItemChange(idx, 'note', e.target.value)}
                        placeholder="Guidance or context..."
                        disabled={!canManage || isSaving}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </td>

                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={isSaving}
                          className="p-1 text-slate-400 hover:text-danger-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
