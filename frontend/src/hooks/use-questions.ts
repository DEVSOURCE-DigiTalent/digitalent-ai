import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  questionBankService,
  type GetPagedQuestionsParams,
  type SaveQuestionRequest,
} from '@/services/question-bank.service';
import { QUESTION_BANKS_QUERY_KEY } from './use-question-banks';

export const QUESTIONS_QUERY_KEY = 'questions';

export function useQuestions(bankId: string, params?: GetPagedQuestionsParams) {
  return useQuery({
    queryKey: [QUESTIONS_QUERY_KEY, bankId, params],
    queryFn: () => questionBankService.getPagedQuestions(bankId, params),
    enabled: !!bankId,
  });
}

export function useCreateQuestion(bankId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveQuestionRequest) => questionBankService.createQuestion(bankId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUESTIONS_QUERY_KEY, bankId] });
      queryClient.invalidateQueries({ queryKey: [QUESTION_BANKS_QUERY_KEY] });
    },
  });
}

export function useUpdateQuestion(bankId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SaveQuestionRequest> }) =>
      questionBankService.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUESTIONS_QUERY_KEY, bankId] });
    },
  });
}

export function useDeleteQuestion(bankId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionBankService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUESTIONS_QUERY_KEY, bankId] });
      queryClient.invalidateQueries({ queryKey: [QUESTION_BANKS_QUERY_KEY] });
    },
  });
}

export function useApproveQuestion(bankId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionBankService.approveQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUESTIONS_QUERY_KEY, bankId] });
    },
  });
}
