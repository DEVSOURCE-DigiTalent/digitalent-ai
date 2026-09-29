import { useMutation, useQueryClient } from '@tanstack/react-query';
import { competencyEvidenceService, type CreateManualEvidenceRequest } from '../services/competency-evidence.service';
import { SKILL_GAPS_KEY } from './use-skill-gaps';
import { RECOMMENDATIONS_KEY } from './use-recommendations';

/**
 * HR confirms a competency level. The backend recalculates the skill gap in the same transaction,
 * so skill gap and recommendation caches are refreshed on success.
 */
export function useCreateManualEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateManualEvidenceRequest) =>
      competencyEvidenceService.createManual(data).then((r) => r.data.data!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SKILL_GAPS_KEY });
      qc.invalidateQueries({ queryKey: RECOMMENDATIONS_KEY });
    },
  });
}
