import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionService, type PlanChangeRequest } from '../services/subscription.service';
import { useRefreshSession } from './use-refresh-session';

export const SUBSCRIPTION_KEY = ['subscription'] as const;

export function useSubscription() {
  return useQuery({ queryKey: [...SUBSCRIPTION_KEY, 'current'], queryFn: async () => (await subscriptionService.get()).data.data!, retry: false });
}

export function useUsage() {
  return useQuery({ queryKey: [...SUBSCRIPTION_KEY, 'usage'], queryFn: async () => (await subscriptionService.getUsage()).data.data!, retry: false });
}

export function usePlanOptions(enabled = true) {
  return useQuery({ queryKey: [...SUBSCRIPTION_KEY, 'plans'], queryFn: async () => (await subscriptionService.getPlans()).data.data!, enabled });
}

export function usePlanChangePreview(request: PlanChangeRequest | undefined) {
  return useQuery({
    queryKey: [...SUBSCRIPTION_KEY, 'preview', request],
    queryFn: async () => (await subscriptionService.previewChange(request!)).data.data!,
    enabled: Boolean(request),
    retry: false,
  });
}

/** Wraps a subscription call so the page data and the session (plan, seats, features) refresh afterwards. */
function useSubscriptionMutation<TInput, TResult>(call: (input: TInput) => Promise<{ data: { data: TResult | null } }>) {
  const queryClient = useQueryClient();
  const refreshSession = useRefreshSession();
  return useMutation({
    mutationFn: async (input: TInput) => (await call(input)).data.data as TResult,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
      await queryClient.invalidateQueries({ queryKey: ['organization'] });
      await refreshSession().catch(() => undefined);
    },
  });
}

export const useChangePlan = () => useSubscriptionMutation((data: PlanChangeRequest) => subscriptionService.change(data));
export const useCancelSubscription = () => useSubscriptionMutation(() => subscriptionService.cancel());
export const useResumeSubscription = () => useSubscriptionMutation(() => subscriptionService.resume());
