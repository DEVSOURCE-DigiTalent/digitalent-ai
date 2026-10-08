import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './use-current-user';
import { enterpriseTrialService } from '@/services/enterprise-trial.service';

const BASE_KEY = ['enterprise-trial'] as const;

function useTrialScope(): string {
  const user = useCurrentUser(state => state.user);
  return user?.organization?.id ?? user?.organizationId ?? user?.id ?? 'anonymous';
}

function payload<T>(response: { data: { success: boolean; data: T | null; message?: string } }): T | null {
  if (!response.data.success) throw new Error(response.data.message || 'Không thể tải dữ liệu trial.');
  return response.data.data;
}

function useKeys() {
  const scope = useTrialScope();
  const all = [...BASE_KEY, scope] as const;
  return {
    all,
    catalog: [...all, 'catalog'] as const,
    context: [...all, 'context'] as const,
    invitations: [...all, 'invitations'] as const,
    diagnostic: [...all, 'diagnostic'] as const,
    result: [...all, 'result'] as const,
    path: [...all, 'path'] as const,
    results: [...all, 'results'] as const,
  };
}

export function useTrialCatalog() {
  const keys = useKeys();
  return useQuery({ queryKey: keys.catalog, queryFn: async () => payload(await enterpriseTrialService.catalog()) ?? [] });
}

export function useTrialContext() {
  const keys = useKeys();
  return useQuery({ queryKey: keys.context, queryFn: async () => payload(await enterpriseTrialService.context()), retry: false });
}

export function useTrialInvitations() {
  const keys = useKeys();
  return useQuery({ queryKey: keys.invitations, queryFn: async () => payload(await enterpriseTrialService.invitations()) ?? [], retry: false });
}

export function useTrialDiagnostic() {
  const keys = useKeys();
  return useQuery({ queryKey: keys.diagnostic, queryFn: async () => payload(await enterpriseTrialService.diagnostic()), retry: false });
}

export function useTrialResult() {
  const keys = useKeys();
  return useQuery({ queryKey: keys.result, queryFn: async () => payload(await enterpriseTrialService.result()), retry: false });
}

export function useTrialPath() {
  const keys = useKeys();
  return useQuery({ queryKey: keys.path, queryFn: async () => payload(await enterpriseTrialService.path()), retry: false });
}

export function useTrialResults() {
  const keys = useKeys();
  return useQuery({ queryKey: keys.results, queryFn: async () => payload(await enterpriseTrialService.results()) ?? [], retry: false });
}

export function useSelectTrialPosition() {
  const client = useQueryClient(); const keys = useKeys();
  return useMutation({ mutationFn: ({ catalogKey, departmentName }: { catalogKey: string; departmentName: string }) => enterpriseTrialService.selectPosition(catalogKey, departmentName), onSuccess: () => client.invalidateQueries({ queryKey: keys.all }) });
}

export function useInviteTrialMember() {
  const client = useQueryClient(); const keys = useKeys();
  return useMutation({ mutationFn: ({ name, email, role }: { name: string; email: string; role: 'Employee' | 'Manager' }) => enterpriseTrialService.invite(name, email, role), onSuccess: () => client.invalidateQueries({ queryKey: keys.all }) });
}

export function useStartTrialDiagnostic() {
  const client = useQueryClient(); const keys = useKeys();
  return useMutation({ mutationFn: () => enterpriseTrialService.startDiagnostic(), onSuccess: () => client.invalidateQueries({ queryKey: keys.diagnostic }) });
}

export function useSaveTrialAnswers() {
  const client = useQueryClient(); const keys = useKeys();
  return useMutation({ mutationFn: ({ attemptId, revision, answers }: { attemptId: string; revision: number; answers: { questionId: string; optionId: string }[] }) => enterpriseTrialService.saveAnswers(attemptId, revision, answers), onSuccess: () => client.invalidateQueries({ queryKey: keys.diagnostic }) });
}

export function useSubmitTrialDiagnostic() {
  const client = useQueryClient(); const keys = useKeys();
  return useMutation({ mutationFn: (attemptId: string) => enterpriseTrialService.submitDiagnostic(attemptId), onSuccess: () => client.invalidateQueries({ queryKey: keys.all }) });
}

export function useStartTrialPathItem() {
  const client = useQueryClient(); const keys = useKeys();
  return useMutation({ mutationFn: (id: string) => enterpriseTrialService.startPathItem(id), onSuccess: () => client.invalidateQueries({ queryKey: keys.path }) });
}

export function useProgressTrialPathItem() {
  const client = useQueryClient(); const keys = useKeys();
  return useMutation({ mutationFn: ({ id, percent }: { id: string; percent: number }) => enterpriseTrialService.progressPathItem(id, percent), onSuccess: () => client.invalidateQueries({ queryKey: keys.path }) });
}
