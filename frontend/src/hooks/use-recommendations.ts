import { useQuery } from '@tanstack/react-query';
import { recommendationService } from '../services/intelligence.service';

export const RECOMMENDATIONS_KEY = ['recommendations'];

/**
 * Course recommendations for an employee (default: the signed-in employee).
 * Invalidated together with skill gaps because they are computed from the latest snapshot.
 */
export function useCourseRecommendations(employeeId?: string, enabled = true) {
  return useQuery({
    queryKey: [...RECOMMENDATIONS_KEY, employeeId ?? 'me'],
    queryFn: () => recommendationService.get({ employeeId }).then((r) => r.data.data!),
    enabled,
  });
}
