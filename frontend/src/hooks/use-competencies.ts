import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  competencyService,
  type CompetencyListParams,
  type CreateCompetencyRequest,
  type UpdateCompetencyRequest,
  type CreateDraftPositionRequirementSetRequest,
  type UpdateDraftPositionRequirementSetRequest,
} from '../services/competency.service';

const COMPETENCIES_KEY = ['competencies'];
const POSITION_REQUIREMENTS_KEY = ['position-requirements'];

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
 * Create a competency with criteria.
 */
export function useCreateCompetency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCompetencyRequest) => competencyService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMPETENCIES_KEY }),
  });
}

/**
 * Update a competency.
 */
export function useUpdateCompetency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompetencyRequest }) =>
      competencyService.update(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: COMPETENCIES_KEY });
      qc.invalidateQueries({ queryKey: [...COMPETENCIES_KEY, variables.id] });
    },
  });
}

/**
 * Archive a competency.
 */
export function useArchiveCompetency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => competencyService.archive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMPETENCIES_KEY }),
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
    mutationFn: (id: string) => competencyService.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: POSITION_REQUIREMENTS_KEY }),
  });
}
