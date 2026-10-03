import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationService, type AuditLogParams, type OrganizationSettings } from '../services/organization.service';
import { useRefreshSession } from './use-refresh-session';

export const ORGANIZATION_KEY = ['organization'] as const;

export function useOrganization() {
  return useQuery({ queryKey: [...ORGANIZATION_KEY, 'profile'], queryFn: async () => (await organizationService.get()).data.data! });
}

export function useOrganizationOverview() {
  return useQuery({ queryKey: [...ORGANIZATION_KEY, 'overview'], queryFn: async () => (await organizationService.getOverview()).data.data! });
}

export function useAuditLog(params?: AuditLogParams) {
  return useQuery({
    queryKey: [...ORGANIZATION_KEY, 'audit', params],
    queryFn: async () => (await organizationService.getAuditLog(params)).data.data!,
    placeholderData: (previous) => previous,
  });
}

export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient();
  const refreshSession = useRefreshSession();
  return useMutation({
    mutationFn: async (data: OrganizationSettings) => (await organizationService.updateSettings(data)).data.data!,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ORGANIZATION_KEY });
      // The organization name is part of the session shown in the sidebar.
      await refreshSession().catch(() => undefined);
    },
  });
}
