import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  skillGapService,
  type CalculateSkillGapBatchRequest,
  type CalculateSkillGapRequest,
  type SkillGapRunListParams,
} from '../services/intelligence.service';

export const SKILL_GAPS_KEY = ['skill-gaps'];

/** Latest (or full history) skill gap snapshots visible to the caller. */
export function useSkillGapRuns(params?: SkillGapRunListParams) {
  return useQuery({
    queryKey: [...SKILL_GAPS_KEY, 'list', params],
    queryFn: () => skillGapService.getList(params).then((r) => r.data.data!),
  });
}

/** One snapshot with its competency lines. */
export function useSkillGapRun(runId?: string) {
  return useQuery({
    queryKey: [...SKILL_GAPS_KEY, 'detail', runId],
    queryFn: () => skillGapService.getById(runId!).then((r) => r.data.data!),
    enabled: !!runId,
  });
}

/** Caller's latest snapshot; resolves to null when none exists yet. */
export function useMySkillGap() {
  return useQuery({
    queryKey: [...SKILL_GAPS_KEY, 'me'],
    queryFn: () => skillGapService.getMyLatest().then((r) => r.data.data ?? null),
  });
}

/** Recalculate one employee (HR / department manager). */
export function useCalculateSkillGap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CalculateSkillGapRequest) => skillGapService.calculate(data).then((r) => r.data.data!),
    onSuccess: () => qc.invalidateQueries({ queryKey: SKILL_GAPS_KEY }),
  });
}

/** Recalculate every active employee in scope (optionally filtered). */
export function useCalculateSkillGapBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CalculateSkillGapBatchRequest) =>
      skillGapService.calculateBatch(data).then((r) => r.data.data!),
    onSuccess: () => qc.invalidateQueries({ queryKey: SKILL_GAPS_KEY }),
  });
}
