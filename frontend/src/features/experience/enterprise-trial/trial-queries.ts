import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { ApiResponse } from '@/types/api';
import type { SessionUser } from '@/types/session';
import { data } from './trial-ui';

export function trialQueryKey(user: SessionUser | null | undefined, name: string) {
  const organizationId = user?.organization?.id ?? user?.organizationId ?? 'no-organization';
  return ['enterprise-trial', organizationId, user?.id ?? 'anonymous', name] as const;
}

export function useTrialQuery<T>(name: string, request: () => Promise<{ data: ApiResponse<T> }>, enabled = true) {
  const user = useCurrentUser(state => state.user);
  return useQuery({ queryKey: trialQueryKey(user, name), queryFn: () => data(request()), enabled, retry: false, staleTime: 0, refetchOnMount: 'always' });
}
export function useTrialMutation<T, V>(request: (variables: V) => Promise<{ data: ApiResponse<T> }>) {
  const cache = useQueryClient();
  return useMutation({ mutationFn: (variables: V) => data(request(variables)), onSuccess: () => cache.invalidateQueries({ queryKey: ['enterprise-trial'] }) });
}
