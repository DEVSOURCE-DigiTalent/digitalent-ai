import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformAdminService, type PageQuery, type TrialFilter } from '@/services/platform-admin.service';
import { feedbackService } from '@/services/feedback.service';

/** React Query hooks of the Platform Admin console (Pulse). Every mutation refreshes the whole console cache. */
export const PLATFORM_ADMIN_KEY = ['platform-admin'] as const;
const KEY = PLATFORM_ADMIN_KEY;

function useInvalidateConsole() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
}

export const usePlatformOverview = () =>
  useQuery({ queryKey: [...KEY, 'overview'], queryFn: platformAdminService.getOverview });

/**
 * Số góp ý hoặc báo lỗi đang chờ xử lý (status OPEN). Dùng chung cho huy hiệu sidebar và "Việc cần xử lý" ở Tổng quan,
 * nên cả hai đọc cùng một bộ đệm. Lỗi mạng trả 0 để không chặn giao diện.
 */
export const usePlatformOpenTicketCount = (type: 'FEEDBACK' | 'BUG') =>
  useQuery({
    queryKey: ['platform', 'sidebar-badge', type === 'BUG' ? 'bugs' : 'feedbacks'],
    retry: false,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        if (typeof feedbackService.getAll !== 'function') return 0;
        const res = await feedbackService.getAll({ pageIndex: 1, pageSize: 1, type, status: 'OPEN' });
        return res?.data?.totalItems ?? 0;
      } catch {
        return 0;
      }
    },
  });

/** Published courses with prices and purchase counts (frameworks and versions: use-platform-catalog). */
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
    mutationFn: (action: { kind: 'suspend' | 'restore'; reason: string }) => {
      return action.kind === 'suspend'
        ? platformAdminService.suspendOrganization(id, action.reason)
        : platformAdminService.restoreOrganization(id, action.reason);
    },
    onSuccess: invalidate,
  });
}

export const usePlatformUsers = (query: PageQuery & { role?: string; status?: string; trial?: TrialFilter | ''; organizationId?: string; workspace?: string }) =>
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

export const usePlatformCommerce = (query: PageQuery) =>
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
