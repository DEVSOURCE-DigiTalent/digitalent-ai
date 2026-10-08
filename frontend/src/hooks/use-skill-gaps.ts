import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  skillGapService,
  type CalculateSkillGapBatchRequest,
  type CalculateSkillGapRequest,
  type SkillGapRunListParams,
} from '../services/intelligence.service';
import { ANALYTICS_KEY } from './use-analytics';
import { MEMBERS_KEY } from './use-members';
import { RECOMMENDATIONS_KEY } from './use-recommendations';
import { WORKFORCE_KEY } from './use-workforce';

export const SKILL_GAPS_KEY = ['skill-gaps'];

/**
 * Views computed from skill gap snapshots: runs, recommendations, gap analytics, workforce rows and matrix, member
 * coverage and the organization overview. Refreshed whenever a snapshot is recalculated.
 */
const SKILL_GAP_DEPENDENT_KEYS = [SKILL_GAPS_KEY, RECOMMENDATIONS_KEY, ANALYTICS_KEY, WORKFORCE_KEY, MEMBERS_KEY, ['organization']];

export const invalidateSkillGapViews = (qc: QueryClient) =>
  Promise.all(SKILL_GAP_DEPENDENT_KEYS.map((queryKey) => qc.invalidateQueries({ queryKey })));

/** Latest (or full history) skill gap snapshots visible to the caller. */
export function useSkillGapRuns(params?: SkillGapRunListParams, enabled = true) {
  return useQuery({
    queryKey: [...SKILL_GAPS_KEY, 'list', params],
    queryFn: () => skillGapService.getList(params).then((r) => r.data.data!),
    enabled,
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
export function useMySkillGap(enabled = true) {
  return useQuery({
    queryKey: [...SKILL_GAPS_KEY, 'me'],
    queryFn: () => skillGapService.getMyLatest().then((r) => r.data.data ?? null),
    enabled,
  });
}

/** Returns a function resolving the id of an employee's latest snapshot (e.g. after an automatic recalculation). */
export function useLatestRunLookup() {
  const qc = useQueryClient();
  return (employeeId: string) => {
    const params = { employeeId, pageSize: 1 };
    return qc
      .fetchQuery({
        queryKey: [...SKILL_GAPS_KEY, 'list', params],
        queryFn: () => skillGapService.getList(params).then((r) => r.data.data!),
      })
      .then((page) => page.items[0]?.runId);
  };
}

/** Recalculate one employee (HR / department manager). */
export function useCalculateSkillGap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CalculateSkillGapRequest) => skillGapService.calculate(data).then((r) => r.data.data!),
    onSuccess: () => invalidateSkillGapViews(qc),
  });
}

/** Recalculate every active employee in scope (optionally filtered). */
export function useCalculateSkillGapBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CalculateSkillGapBatchRequest) =>
      skillGapService.calculateBatch(data).then((r) => r.data.data!),
    onSuccess: () => invalidateSkillGapViews(qc),
  });
}
