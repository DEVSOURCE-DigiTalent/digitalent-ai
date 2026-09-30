import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCompetency, useUpdateCompetency, useCompetency } from '@/hooks/use-competencies';
import { levelWithTier } from '@/lib/competency-levels';
import type { CompetencyListItem, CompetencyCriterion } from '@/services/competency.service';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';

const criterionSchema = z.object({
  level: z.number().min(1).max(3),
  indicatorCode: z.string().optional().or(z.literal('')),
  behaviorIndicator: z.string().optional().or(z.literal('')),
  assessmentGuidance: z.string().optional(),
  evidenceGuidance: z.string().optional(),
});

const competencyFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().optional(),
  competencyType: z.enum(['CORE_DIGITAL', 'PROFESSIONAL', 'INTERNAL', 'BEHAVIOURAL']),
  description: z.string().optional(),
  criteria: z.array(criterionSchema).optional(),
});

type FormData = z.infer<typeof competencyFormSchema>;

interface CompetencyFormDialogProps {
  open: boolean;
  onClose: () => void;
  competency?: CompetencyListItem | null;
}

export function CompetencyFormDialog({ open, onClose, competency }: CompetencyFormDialogProps) {
  const isEditing = !!competency;
  const createMutation = useCreateCompetency();
  const updateMutation = useUpdateCompetency();

  // Load detailed criteria if editing
  const { data: detailData } = useCompetency(competency?.id || '');

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(competencyFormSchema),
    defaultValues: {
      code: '',
      name: '',
      categoryId: '',
      competencyType: 'CORE_DIGITAL',
      description: '',
      criteria: [
        { level: 1, indicatorCode: '', behaviorIndicator: '', assessmentGuidance: '', evidenceGuidance: '' },
        { level: 2, indicatorCode: '', behaviorIndicator: '', assessmentGuidance: '', evidenceGuidance: '' },
        { level: 3, indicatorCode: '', behaviorIndicator: '', assessmentGuidance: '', evidenceGuidance: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'criteria',
  });

  useEffect(() => {
    if (open) {
      if (competency) {
        const criteriaToUse = detailData?.criteria?.length
          ? detailData.criteria
          : [
              { level: 1, indicatorCode: `${competency.code}-L1`, behaviorIndicator: '', assessmentGuidance: '', evidenceGuidance: '' },
              { level: 2, indicatorCode: `${competency.code}-L2`, behaviorIndicator: '', assessmentGuidance: '', evidenceGuidance: '' },
              { level: 3, indicatorCode: `${competency.code}-L3`, behaviorIndicator: '', assessmentGuidance: '', evidenceGuidance: '' },
            ];

        reset({
          code: competency.code,
          name: competency.name,
          categoryId: competency.categoryId || '',
          competencyType: (competency.competencyType as any) || 'CORE_DIGITAL',
          description: competency.description || '',
          criteria: criteriaToUse.map((c) => ({
            level: c.level,
            indicatorCode: c.indicatorCode || '',
            behaviorIndicator: c.behaviorIndicator || '',
            assessmentGuidance: c.assessmentGuidance || '',
            evidenceGuidance: c.evidenceGuidance || '',
          })),
        });
      } else {
        reset({
          code: '',
          name: '',
          categoryId: '',
          competencyType: 'CORE_DIGITAL',
          description: '',
          criteria: [
            { level: 1, indicatorCode: '', behaviorIndicator: '', assessmentGuidance: '', evidenceGuidance: '' },
            { level: 2, indicatorCode: '', behaviorIndicator: '', assessmentGuidance: '', evidenceGuidance: '' },
            { level: 3, indicatorCode: '', behaviorIndicator: '', assessmentGuidance: '', evidenceGuidance: '' },
          ],
        });
      }
    }
  }, [open, competency, detailData, reset]);

  if (!open) return null;

  const onSubmit = async (data: FormData) => {
    try {
      const formattedCriteria: CompetencyCriterion[] = (data.criteria || [])
        .filter((c) => c.indicatorCode?.trim() && c.behaviorIndicator?.trim())
        .map((c, idx) => ({
          level: Number(c.level),
          indicatorCode: c.indicatorCode!.trim(),
          behaviorIndicator: c.behaviorIndicator!.trim(),
          assessmentGuidance: c.assessmentGuidance?.trim() || undefined,
          evidenceGuidance: c.evidenceGuidance?.trim() || undefined,
          sortOrder: idx + 1,
        }));

      if (isEditing && competency) {
        await updateMutation.mutateAsync({
          id: competency.id,
          data: {
            name: data.name,
            description: data.description || undefined,
            competencyType: data.competencyType,
            criteria: formattedCriteria.length > 0 ? formattedCriteria : undefined,
          },
        });
        toast.success('Competency updated successfully');
      } else {
        await createMutation.mutateAsync({
          categoryId: data.categoryId || '00000000-0000-0000-0000-000000000001',
          code: data.code,
          name: data.name,
          description: data.description || undefined,
          competencyType: data.competencyType,
          criteria: formattedCriteria.length > 0 ? formattedCriteria : undefined,
        });
        toast.success('Competency created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, isEditing ? 'Failed to update competency' : 'Failed to create competency'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {isEditing ? 'Edit Competency' : 'Create Competency'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="comp-code" className="block text-sm font-medium text-slate-700 mb-1">
                Code *
              </label>
              <input
                id="comp-code"
                {...register('code')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. DIG-01"
                disabled={isSubmitting || isEditing}
              />
              {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>}
            </div>

            <div>
              <label htmlFor="comp-name" className="block text-sm font-medium text-slate-700 mb-1">
                Name *
              </label>
              <input
                id="comp-name"
                {...register('name')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Cloud Architecture"
                disabled={isSubmitting}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="comp-type" className="block text-sm font-medium text-slate-700 mb-1">
                Competency Type *
              </label>
              <select
                id="comp-type"
                {...register('competencyType')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isSubmitting}
              >
                <option value="CORE_DIGITAL">Core Digital</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="INTERNAL">Internal</option>
                <option value="BEHAVIOURAL">Behavioural</option>
              </select>
            </div>

            <div>
              <label htmlFor="comp-desc" className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <input
                id="comp-desc"
                {...register('description')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Brief description of the competency"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Criteria List Section */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Proficiency Levels & Criteria (Basic / Intermediate / Advanced)</h3>
                <p className="text-xs text-slate-500">Define observable behaviors and indicator codes per level</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  append({
                    level: (fields.length % 3) + 1,
                    indicatorCode: '',
                    behaviorIndicator: '',
                    assessmentGuidance: '',
                    evidenceGuidance: '',
                  })
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Level
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div key={field.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-100 text-primary-800">
                        Level {field.level}
                      </span>
                      <select
                        {...register(`criteria.${idx}.level` as const)}
                        className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                      >
                        {[1, 2, 3].map((level) => (
                          <option key={level} value={level}>
                            {levelWithTier(level)}
                          </option>
                        ))}
                      </select>
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="text-slate-400 hover:text-danger-600 transition-colors"
                        title="Remove criterion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-medium text-slate-600 mb-0.5">Indicator Code</label>
                      <input
                        {...register(`criteria.${idx}.indicatorCode` as const)}
                        placeholder="e.g. DIG-01-L1"
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-0.5">Behavior Indicator</label>
                      <input
                        {...register(`criteria.${idx}.behaviorIndicator` as const)}
                        placeholder="Observable behavioral description"
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
