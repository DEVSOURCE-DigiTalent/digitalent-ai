import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsService, type AnalyticsFilter, type ReviewListParams } from '../services/analytics.service';

export const ANALYTICS_KEY = ['analytics'] as const;

export function useGapOverview(params: AnalyticsFilter & { groupBy: 'department' | 'position' | 'grade' }) {
  return useQuery({ queryKey: [...ANALYTICS_KEY, 'overview', params], queryFn: async () => (await analyticsService.getOverview(params)).data.data! });
}

export function useCompetencyGaps(params?: AnalyticsFilter) {
  return useQuery({ queryKey: [...ANALYTICS_KEY, 'competencies', params], queryFn: async () => (await analyticsService.getCompetencies(params)).data.data! });
}

export function useRecommendationReviews(params?: ReviewListParams) {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'reviews', params],
    queryFn: async () => (await analyticsService.getReviews(params)).data.data!,
    placeholderData: (previous) => previous,
  });
}

export function useCapabilityDashboard() {
  return useQuery({ queryKey: [...ANALYTICS_KEY, 'dashboard'], queryFn: async () => (await analyticsService.getDashboard()).data.data! });
}

export function useReportsOverview(params?: AnalyticsFilter) {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'reports-overview', params],
    queryFn: async () => (await analyticsService.getReportsOverview(params)).data.data!,
  });
}

function useReviewMutation<TInput>(call: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: call,
    onSuccess: () =>
      Promise.all([ANALYTICS_KEY, ['assignments'], ['workforce'], ['recommendations']].map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });
}

export const useAcceptReview = () => useReviewMutation(analyticsService.acceptReview);
export const useDismissReview = () => useReviewMutation(analyticsService.dismissReview);
export const useReopenReview = () => useReviewMutation(analyticsService.reopenReview);
