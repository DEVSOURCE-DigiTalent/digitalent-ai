import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  trainingBatchService,
  type CreateTrainingBatchRequest,
  type TrainingBatchListParams,
  type UpdateTrainingBatchRequest,
} from '../services/training-batch.service';

export const TRAINING_BATCHES_KEY = ['training-batches'] as const;

export function useTrainingBatches(params?: TrainingBatchListParams) {
  return useQuery({
    queryKey: [...TRAINING_BATCHES_KEY, 'list', params],
    queryFn: async () => (await trainingBatchService.getBatches(params)).data.data!,
    placeholderData: (previous) => previous,
  });
}

export function useTrainingBatchSummary() {
  return useQuery({
    queryKey: [...TRAINING_BATCHES_KEY, 'summary'],
    queryFn: async () => (await trainingBatchService.getSummary()).data.data!,
  });
}

export function useTrainingBatch(id: string | undefined) {
  return useQuery({
    queryKey: [...TRAINING_BATCHES_KEY, 'detail', id],
    queryFn: async () => (await trainingBatchService.getBatchById(id!)).data.data!,
    enabled: !!id,
  });
}

export function useCreateTrainingBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTrainingBatchRequest) =>
      (await trainingBatchService.createBatch(data)).data.data!,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRAINING_BATCHES_KEY });
      qc.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}

export function useUpdateTrainingBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTrainingBatchRequest }) =>
      (await trainingBatchService.updateBatch(id, data)).data.data!,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRAINING_BATCHES_KEY });
    },
  });
}

export function useCancelTrainingBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) =>
      (await trainingBatchService.cancelBatch(id, reason)).data.data!,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRAINING_BATCHES_KEY });
    },
  });
}

export function useCompleteTrainingBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await trainingBatchService.completeBatch(id)).data.data!,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRAINING_BATCHES_KEY });
    },
  });
}
