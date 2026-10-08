import { useMutation, useQueryClient } from '@tanstack/react-query';
import { competencyEvidenceService, type CreateManualEvidenceRequest } from '../services/competency-evidence.service';
import { invalidateSkillGapViews } from './use-skill-gaps';

/**
 * HR confirms a competency level. The backend recalculates the skill gap in the same transaction,
 * so every view built on skill gap snapshots is refreshed on success.
 */
export function useCreateManualEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateManualEvidenceRequest) =>
      competencyEvidenceService.createManual(data).then((r) => r.data.data!),
    onSuccess: () => invalidateSkillGapViews(qc),
  });
}
