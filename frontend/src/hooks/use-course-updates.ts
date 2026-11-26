import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseUpdateService } from '@/services/course-update.service';
import { ASSIGNMENTS_KEY } from './use-assignments';
import { PULSE_KEYS } from './use-pulse';
import { PERMISSIONS, usePermission } from './use-permission';

export const COURSE_UPDATES_KEY = ['course-updates'] as const;

/**
 * The organization's course update: version in use, newest version and what applying it changes.
 * Only asked for users who may decide (`course_update.review`), so the course page banner costs nothing otherwise.
 */
export function useCourseUpdates() {
  const { can } = usePermission();
  return useQuery({
    queryKey: COURSE_UPDATES_KEY,
    queryFn: courseUpdateService.get,
    enabled: can(PERMISSIONS.COURSE_UPDATE_REVIEW),
    staleTime: 60_000,
  });
}

function useRefresh() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: COURSE_UPDATES_KEY }),
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_KEY }),
      queryClient.invalidateQueries({ queryKey: PULSE_KEYS.all }),
    ]);
}

/** Applies the newest version: changed courses get a new revision; learners in progress keep theirs. */
export function useApplyCourseUpdate() {
  const queryClient = useQueryClient();
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (versionNo: number) => courseUpdateService.apply(versionNo),
    onSuccess: (data) => {
      queryClient.setQueryData(COURSE_UPDATES_KEY, data);
      return refresh();
    },
  });
}

/** Keeps the version in use instead of the newest one, with a reason (≥ 10 characters). */
export function useKeepCourseVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ versionNo, reason }: { versionNo: number; reason: string }) => courseUpdateService.keep(versionNo, reason),
    onSuccess: (data) => queryClient.setQueryData(COURSE_UPDATES_KEY, data),
  });
}
