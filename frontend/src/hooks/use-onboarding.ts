import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { onboardingService } from '../services/onboarding.service';
import type { InviteRow, OrganizationInput } from '../types/commerce';

export const SETUP_KEY = ['onboarding', 'setup'] as const;

/** Setup wizard state: organization, departments, positions, invitations, seats. */
export function useSetup() {
  return useQuery({
    queryKey: SETUP_KEY,
    queryFn: async () => (await onboardingService.getSetup()).data.data!,
    retry: false,
  });
}

/** Wraps a setup call so the wizard state refreshes after it. */
function useSetupMutation<TInput, TResult>(call: (input: TInput) => Promise<{ data: { data: TResult | null } }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TInput) => (await call(input)).data.data!,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETUP_KEY }),
  });
}

export const useSaveOrganization = () =>
  useSetupMutation((input: OrganizationInput) => onboardingService.saveOrganization(input));

export const useSaveGrades = () =>
  useSetupMutation((grades: { code: string; name: string; description: string }[]) =>
    onboardingService.saveGrades(grades),
  );

export const useSaveDepartments = () =>
  useSetupMutation((names: string[]) => onboardingService.saveDepartments(names));

export const useSavePositions = () =>
  useSetupMutation(
    (selection: {
      codes: string[];
      custom: string[];
      details?: Record<string, { departmentName?: string; jobGrade?: string }>;
    }) => onboardingService.savePositions(selection),
  );

export const useInviteMembers = () =>
  useSetupMutation((rows: InviteRow[]) => onboardingService.inviteMembers(rows));

export const useCompleteSetup = () => useSetupMutation(() => onboardingService.completeSetup());
