import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformAdminService, type PageQuery, type PlatformCourseDraft } from '@/services/platform-admin.service';

/** React Query hooks of the Platform Admin console (Pulse). Every mutation refreshes the whole console cache. */
const KEY = ['platform-admin'] as const;

function useInvalidateConsole() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
}

export const usePlatformOverview = () =>
  useQuery({ queryKey: [...KEY, 'overview'], queryFn: platformAdminService.getOverview });

export const usePlatformFramework = () =>
  useQuery({ queryKey: [...KEY, 'framework'], queryFn: platformAdminService.getFramework });

export function useSaveFrameworkDraft() {
  const invalidate = useInvalidateConsole();
  return useMutation({ mutationFn: platformAdminService.saveFrameworkDraft, onSuccess: invalidate });
}

export function usePublishFramework() {
  const invalidate = useInvalidateConsole();
  return useMutation({ mutationFn: (note?: string) => platformAdminService.publishFramework(note), onSuccess: invalidate });
}

export const usePlatformCourses = () =>
  useQuery({ queryKey: [...KEY, 'courses'], queryFn: platformAdminService.getCourses });

export const usePlatformCourse = (code: string | undefined) =>
  useQuery({
    queryKey: [...KEY, 'course', code],
    queryFn: () => platformAdminService.getCourse(code!),
    enabled: Boolean(code),
  });

export function useSaveCourseDraft(code: string) {
  const invalidate = useInvalidateConsole();
  return useMutation({ mutationFn: (draft: PlatformCourseDraft) => platformAdminService.saveCourseDraft(code, draft), onSuccess: invalidate });
}

export function usePublishCourse(code: string) {
  const invalidate = useInvalidateConsole();
  return useMutation({ mutationFn: () => platformAdminService.publishCourse(code), onSuccess: invalidate });
}

export function useAddCourseQuestion(code: string) {
  const invalidate = useInvalidateConsole();
  return useMutation({
    mutationFn: (question: { questionText: string; correctAnswer: string; explanation: string }) =>
      platformAdminService.addCourseQuestion(code, question),
    onSuccess: invalidate,
  });
}

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

export const usePlatformUsers = (query: PageQuery & { role?: string; status?: string; organizationId?: string }) =>
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
