import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planErrorOf } from '../features/learner/utils/error-message';
import { useRefreshSession } from './use-refresh-session';

/**
 * Turns a plan refusal (spec §6) into what the learner should see: the server's sentence as a toast. A
 * `PLAN_REQUIRED` usually means the trial ended while the page was open, so the session is reloaded to update
 * the plan badge, and the personal data is refetched. Returns true when the error was a plan error.
 */
export function usePlanErrorHandler() {
  const queryClient = useQueryClient();
  const refreshSession = useRefreshSession();

  return useCallback(
    (error: unknown): boolean => {
      const planError = planErrorOf(error);
      if (!planError) return false;
      toast.error(planError.message);
      if (planError.code === 'PLAN_REQUIRED') refreshSession().catch(() => undefined);
      void queryClient.invalidateQueries({ queryKey: ['personal'] });
      return true;
    },
    [queryClient, refreshSession],
  );
}
