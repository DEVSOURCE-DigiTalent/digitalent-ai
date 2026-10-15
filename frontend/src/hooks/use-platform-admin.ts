import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformAdminService, type PageQuery, type TrialFilter } from '@/services/platform-admin.service';

/** React Query hooks of the Platform Admin console (Pulse). Every mutation refreshes the whole console cache. */
export const PLATFORM_ADMIN_KEY = ['platform-admin'] as const;
const KEY = PLATFORM_ADMIN_KEY;

function useInvalidateConsole() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
}

export const usePlatformOverview = () =>
  useQuery({ queryKey: [...KEY, 'overview'], queryFn: platformAdminService.getOverview });

/** Published courses with prices and seat totals (frameworks and versions: use-platform-catalog). */
export const usePlatformCourses = () =>
  useQuery({ queryKey: [...KEY, 'courses'], queryFn: platformAdminService.getCourses });

export const usePlatformOrganizations = (query: PageQuery & { status?: string; stage?: string }) =>
  useQuery({
    queryKey: [...KEY, 'organizations', query],
    queryFn: () => platformAdminService.getOrganizations(query),
    placeholderData: keepPreviousData,
  });

export const usePlatformOrganization = (id: string | undefined) =>
  useQuery({
    queryKey: [...KEY, 'organization', id],
    queryFn: () => platformAdminService.getOrganization(id!),
    enabled: Boolean(id),
  });

export function useOrganizationAction(id: string) {
  const invalidate = useInvalidateConsole();
  return useMutation({
    mutationFn: (action: { kind: 'grant'; courseCode: string; seats: number; reason: string } | { kind: 'suspend' | 'restore'; reason: string }) => {
      if (action.kind === 'grant') return platformAdminService.grantSeats(id, { courseCode: action.courseCode, seats: action.seats, reason: action.reason });
      return action.kind === 'suspend'
        ? platformAdminService.suspendOrganization(id, action.reason)
        : platformAdminService.restoreOrganization(id, action.reason);
    },
    onSuccess: invalidate,
  });
}

export const usePlatformUsers = (query: PageQuery & { role?: string; status?: string; trial?: TrialFilter | ''; organizationId?: string }) =>
  useQuery({
    queryKey: [...KEY, 'users', query],
    queryFn: () => platformAdminService.getUsers(query),
    placeholderData: keepPreviousData,
  });

export const usePlatformUser = (id: string | undefined) =>
  useQuery({ queryKey: [...KEY, 'user', id], queryFn: () => platformAdminService.getUser(id!), enabled: Boolean(id) });

export function useUserLockAction(id: string) {
  const invalidate = useInvalidateConsole();
  return useMutation({
    mutationFn: ({ lock, reason }: { lock: boolean; reason: string }) =>
      lock ? platformAdminService.lockUser(id, reason) : platformAdminService.unlockUser(id, reason),
    onSuccess: invalidate,
  });
}

export const usePlatformCommerce = (query: PageQuery & { kind?: string }) =>
  useQuery({
    queryKey: [...KEY, 'commerce', query],
    queryFn: () => platformAdminService.getCommerce(query),
    placeholderData: keepPreviousData,
  });

export const usePlatformAuditLogs = (query: PageQuery & { scope?: 'platform' | 'all'; action?: string }) =>
  useQuery({
    queryKey: [...KEY, 'audit', query],
    queryFn: () => platformAdminService.getAuditLogs(query),
    placeholderData: keepPreviousData,
  });
