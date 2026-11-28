import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signLanguageVideoService, type SignLanguageVideo } from '@/services/sign-language-video.service';
import { PLATFORM_ADMIN_KEY } from './use-platform-admin';
import { PULSE_KEYS } from './use-pulse';
import { ASSIGNMENTS_KEY } from './use-assignments';

/** Sign-language video of a lesson video (schema v3.13). Keys live under the catalog key of the builder. */
export const signVideoKeys = {
  video: (assetId: string | undefined) => [...PLATFORM_ADMIN_KEY, 'catalog', 'sign-video', assetId] as const,
  status: (trackId: string | null | undefined) => [...PLATFORM_ADMIN_KEY, 'catalog', 'sign-video-status', trackId] as const,
};

export const useSignLanguageVideo = (assetId: string | undefined) =>
  useQuery({
    queryKey: signVideoKeys.video(assetId),
    queryFn: () => signLanguageVideoService.get(assetId!),
    enabled: Boolean(assetId),
  });

/**
 * While a render runs, the light status is asked every 3 seconds (progress bar); once it is no longer RENDERING the
 * full view is read again (output, timings, errors).
 */
export function useSignVideoProgress(data: SignLanguageVideo | undefined) {
  const queryClient = useQueryClient();
  const rendering = data?.status === 'RENDERING' && !data.stale;
  const status = useQuery({
    queryKey: signVideoKeys.status(data?.trackId),
    queryFn: () => signLanguageVideoService.status(data!.trackId!),
    enabled: Boolean(rendering && data?.trackId),
    refetchInterval: 2000,
  });
  const finished = rendering && status.data != null && status.data.status !== 'RENDERING';
  useEffect(() => {
    if (finished && data) void queryClient.invalidateQueries({ queryKey: signVideoKeys.video(data.assetId) });
  }, [finished, data, queryClient]);
  return rendering ? status.data ?? null : null;
}

/** Any action on the sign-language video: the answer replaces the cached view; publishing refreshes learner pages. */
export function useSignVideoAction(assetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: () => Promise<SignLanguageVideo>) => action(),
    onSuccess: async (video) => {
      queryClient.setQueryData(signVideoKeys.video(assetId), video);
      if (video.status === 'PUBLISHED') {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: PULSE_KEYS.all }),
          queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_KEY }),
        ]);
      }
    },
  });
}
