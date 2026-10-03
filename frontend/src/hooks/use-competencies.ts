import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  competencyService,
  type CompetencyListParams,
  type CreateDraftPositionRequirementSetRequest,
  type UpdateDraftPositionRequirementSetRequest,
} from '../services/competency.service';

const COMPETENCIES_KEY = ['competencies'];
const COMPETENCY_CATEGORIES_KEY = ['competency-categories'];
const POSITION_REQUIREMENTS_KEY = ['position-requirements'];

/**
 * Fetch 6 domains / categories of TT02 framework.
 */
export function useCompetencyCategories() {
  return useQuery({
    queryKey: COMPETENCY_CATEGORIES_KEY,
    queryFn: () => competencyService.getCategories().then((r) => r.data.data!),
  });
}

/**
 * Fetch paginated list of competencies.
 */
export function useCompetencies(params?: CompetencyListParams) {
  return useQuery({
    queryKey: [...COMPETENCIES_KEY, params],
    queryFn: () => competencyService.getList(params).then((r) => r.data.data!),
  });
}

/**
 * Fetch a single competency with its criteria.
 */
export function useCompetency(id: string) {
  return useQuery({
    queryKey: [...COMPETENCIES_KEY, id],
    queryFn: () => competencyService.getById(id).then((r) => r.data.data!),
    enabled: !!id,
  });
}

/**
 * Positions, courses and levels around one competency.
 */
export function useCompetencyUsage(id: string | undefined) {
  return useQuery({
    queryKey: [...COMPETENCIES_KEY, id, 'usage'],
    queryFn: () => competencyService.getUsage(id!).then((r) => r.data.data!),
    enabled: !!id,
  });
}


/**
 * Fetch all position requirement summaries for OW-16 list page.
 */
export function usePositionRequirementSummaries() {
  return useQuery({
    queryKey: [...POSITION_REQUIREMENTS_KEY, 'summaries'],
    queryFn: () => competencyService.getAllSummaries().then((r) => r.data.data!),
  });
}

/**
 * Fetch position requirements for a job position.
 */
export function usePositionRequirements(positionId?: string, versionNo?: number) {
  return useQuery({
    queryKey: [...POSITION_REQUIREMENTS_KEY, positionId, versionNo],
    queryFn: () => competencyService.getRequirements(positionId!, versionNo).then((r) => r.data.data!),
    enabled: !!positionId,
  });
}

/**
 * Create a draft position requirement set.
 */
export function useCreateDraftPositionRequirements() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDraftPositionRequirementSetRequest) =>
      competencyService.createDraft(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: POSITION_REQUIREMENTS_KEY }),
  });
}

/**
 * Update a draft position requirement set.
 */
export function useUpdateDraftPositionRequirements() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDraftPositionRequirementSetRequest }) =>
      competencyService.updateDraft(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: POSITION_REQUIREMENTS_KEY }),
  });
}

/**
 * Activate a position requirement set.
 */
export function useActivatePositionRequirements() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (param: string | { id: string; changeReason?: string }) => {
      const id = typeof param === 'string' ? param : param.id;
      const changeReason = typeof param === 'string' ? undefined : param.changeReason;
      return competencyService.activate(id, changeReason ? { changeReason } : undefined);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: POSITION_REQUIREMENTS_KEY }),
  });
}
