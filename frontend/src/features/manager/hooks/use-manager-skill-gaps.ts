import { useQuery } from '@tanstack/react-query';
import { skillGapService } from '@/services/intelligence.service';

/** BE2 exposes paged snapshots, not the legacy analytics/matrix endpoints. */
export function useManagerSkillGapPage(pageIndex: number, pageSize = 20, search?: string) {
  return useQuery({
    queryKey: ['manager', 'skill-gaps', pageIndex, pageSize, search],
    queryFn: async () => (await skillGapService.getList({ pageIndex, pageSize, latestOnly: true, search })).data.data!,
  });
}

export function useManagerSkillGapMatrix(pageIndex: number, pageSize = 10) {
  return useQuery({
    queryKey: ['manager', 'skill-gap-matrix', pageIndex, pageSize],
    queryFn: async () => {
      const page = (await skillGapService.getList({ pageIndex, pageSize, latestOnly: true })).data.data!;
      const details = await Promise.all(page.items.map(async (item) => (await skillGapService.getById(item.runId)).data.data!));
      return { ...page, details };
    },
  });
}
