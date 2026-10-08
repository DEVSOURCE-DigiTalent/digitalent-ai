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

/**
 * Data a member change shows up in: member lists and details, roles, the overview, seats, workforce, and the
 * headcounts of departments, positions and grades (placement and deactivation move people between them).
 */
const MEMBER_DEPENDENT_KEYS = [MEMBERS_KEY, ['organization'], ['subscription'], ['workforce'], ['departments'], ['job-positions'], ['job-grades']];

/** Wraps a member call so everything that shows members refreshes afterwards. */
function useMemberMutation<TInput, TResult>(call: (input: TInput) => Promise<{ data: { data: TResult | null } }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TInput) => (await call(input)).data.data as TResult,
    onSuccess: () => Promise.all(MEMBER_DEPENDENT_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
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
