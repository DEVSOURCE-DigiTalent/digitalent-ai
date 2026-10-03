import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memberService, type InviteRowInput, type MemberListParams, type UpdateMemberRequest } from '../services/member.service';

export const MEMBERS_KEY = ['members'] as const;

export function useMembers(params?: MemberListParams) {
  return useQuery({
    queryKey: [...MEMBERS_KEY, 'list', params],
    queryFn: async () => (await memberService.getList(params)).data.data!,
    placeholderData: (previous) => previous,
  });
}

export function useMember(id: string | undefined) {
  return useQuery({
    queryKey: [...MEMBERS_KEY, 'detail', id],
    queryFn: async () => (await memberService.getById(id!)).data.data!,
    enabled: Boolean(id),
    retry: false,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: [...MEMBERS_KEY, 'roles'],
    queryFn: async () => (await memberService.getRoles()).data.data!,
  });
}

/** Wraps a member call so lists, details, roles and the overview refresh afterwards. */
function useMemberMutation<TInput, TResult>(call: (input: TInput) => Promise<{ data: { data: TResult | null } }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TInput) => (await call(input)).data.data as TResult,
    onSuccess: () =>
      Promise.all([MEMBERS_KEY, ['organization'], ['subscription'], ['workforce']].map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });
}

export const useInviteMembers = () => useMemberMutation((rows: InviteRowInput[]) => memberService.invite(rows));
export const useResendInvitation = () => useMemberMutation((id: string) => memberService.resendInvitation(id));
export const useRevokeInvitation = () => useMemberMutation((id: string) => memberService.revokeInvitation(id));
export const useUpdateMember = () =>
  useMemberMutation(({ id, data }: { id: string; data: UpdateMemberRequest }) => memberService.update(id, data));
export const useDeactivateMember = () =>
  useMemberMutation(({ id, reason }: { id: string; reason: string }) => memberService.deactivate(id, reason));
export const useReactivateMember = () => useMemberMutation((id: string) => memberService.reactivate(id));
