import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  questionBankService,
  type GetPagedQuestionBanksParams,
  type CreateQuestionBankRequest,
  type CreateQuestionTagRequest,
} from '@/services/question-bank.service';

export const QUESTION_BANKS_QUERY_KEY = 'question-banks';
export const QUESTION_TAGS_QUERY_KEY = 'question-tags';

export function useQuestionBanks(params?: GetPagedQuestionBanksParams) {
  return useQuery({
    queryKey: [QUESTION_BANKS_QUERY_KEY, params],
    queryFn: () => questionBankService.getPagedBanks(params),
  });
}

export function useCreateQuestionBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuestionBankRequest) => questionBankService.createBank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUESTION_BANKS_QUERY_KEY] });
    },
  });
}

export function useDeleteQuestionBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionBankService.deleteBank(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUESTION_BANKS_QUERY_KEY] });
    },
  });
}

export function useQuestionTags() {
  return useQuery({
    queryKey: [QUESTION_TAGS_QUERY_KEY],
    queryFn: () => questionBankService.getTags(),
  });
}

export function useCreateQuestionTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuestionTagRequest) => questionBankService.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUESTION_TAGS_QUERY_KEY] });
    },
  });
}
