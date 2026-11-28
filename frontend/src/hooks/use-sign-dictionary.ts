import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signDictionaryService, type SignGloss, type SignGlossQuery } from '@/services/sign-dictionary.service';
import { PLATFORM_ADMIN_KEY } from './use-platform-admin';

/** React Query hooks of the sign-language dictionary (PA-18). Keys live under the console key. */
const SIGNS = [...PLATFORM_ADMIN_KEY, 'sign-dictionary'] as const;

export const signDictionaryKeys = {
  all: SIGNS,
  list: (query: SignGlossQuery) => [...SIGNS, 'list', query] as const,
  summary: (search: string, kind: string) => [...SIGNS, 'summary', search, kind] as const,
  detail: (id: string | undefined) => [...SIGNS, 'detail', id] as const,
  motions: (ids: string[], publishedOnly: boolean) => [...SIGNS, 'motions', publishedOnly, [...ids].sort().join(',')] as const,
};

export const useSignGlosses = (query: SignGlossQuery) =>
  useQuery({ queryKey: signDictionaryKeys.list(query), queryFn: () => signDictionaryService.list(query), placeholderData: keepPreviousData });

/** Tab counts of the dictionary, with the list's text and kind filters (refreshed with the lists after every edit). */
export const useSignGlossSummary = (search = '', kind = '') =>
  useQuery({
    queryKey: signDictionaryKeys.summary(search, kind),
    queryFn: () => signDictionaryService.summary({ search, kind: kind as SignGlossQuery['kind'] }),
    placeholderData: keepPreviousData,
  });

export const useSignGloss = (id: string | undefined) =>
  useQuery({ queryKey: signDictionaryKeys.detail(id), queryFn: () => signDictionaryService.get(id!), enabled: Boolean(id) });

export const useSignMotions = (ids: string[], publishedOnly: boolean, enabled = true) =>
  useQuery({
    queryKey: signDictionaryKeys.motions(ids, publishedOnly),
    queryFn: () => signDictionaryService.motions(ids, publishedOnly),
    enabled: enabled && ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });

/** Any edit of a sign: the answer replaces the cached sign, lists and motions are refreshed. */
export function useSignGlossAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: () => Promise<SignGloss>) => action(),
    onSuccess: async (gloss) => {
      queryClient.setQueryData(signDictionaryKeys.detail(gloss.id), gloss);
      await queryClient.invalidateQueries({ queryKey: SIGNS, predicate: (q) => q.queryKey[2] !== 'detail' });
    },
  });
}
