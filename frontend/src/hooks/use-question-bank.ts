import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  questionBankService,
  type CreateQuestionBankRequest,
  type CreateQuestionTagRequest,
  type SaveQuestionRequest,
} from '../services/question-bank.service';
import type { PaginationRequest } from '../types/api';

/** Fetch all question banks (small list, no pagination UI needed yet). */
export function useQuestionBanks() {
  return useQuery({
    queryKey: ['question-banks'],
    queryFn: () =>
      questionBankService.listBanks({ pageIndex: 1, pageSize: 100 }).then((r) => r.data.data!),
  });
}

export function useCreateQuestionBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuestionBankRequest) => questionBankService.createBank(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['question-banks'] }),
  });
}

export function useDeleteQuestionBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bankId: string) => questionBankService.deleteBank(bankId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['question-banks'] }),
  });
}

/** All taxonomy tags, org-wide (used for filter dropdown + tag picker in the editor). */
export function useQuestionTags() {
  return useQuery({
    queryKey: ['question-tags'],
    queryFn: () => questionBankService.listTags().then((r) => r.data.data!),
  });
}

export function useCreateQuestionTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuestionTagRequest) => questionBankService.createTag(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['question-tags'] }),
  });
}

/** Paginated questions within a bank, optionally filtered by tag. */
export function useQuestions(bankId: string, params: PaginationRequest, tagId?: string) {
  return useQuery({
    queryKey: ['questions', bankId, params, tagId],
    queryFn: () => questionBankService.listQuestions(bankId, params, tagId).then((r) => r.data.data!),
    enabled: !!bankId,
  });
}

export function useCreateQuestion(bankId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveQuestionRequest) => questionBankService.createQuestion(bankId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions', bankId] });
      qc.invalidateQueries({ queryKey: ['question-banks'] });
    },
  });
}

export function useUpdateQuestion(bankId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SaveQuestionRequest> }) =>
      questionBankService.updateQuestion(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions', bankId] }),
  });
}

export function useDeleteQuestion(bankId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => questionBankService.deleteQuestion(questionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions', bankId] });
      qc.invalidateQueries({ queryKey: ['question-banks'] });
    },
  });
}

export function useApproveQuestion(bankId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => questionBankService.approveQuestion(questionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions', bankId] }),
  });
}
