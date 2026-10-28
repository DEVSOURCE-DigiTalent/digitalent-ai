import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './use-current-user';
import { memberService } from '../services/member.service';
import { refreshSessionTokens } from '../services/api-client';
import { authService } from '../services/auth.service';
import {
  trialProgramService,
  type TrialExamSubmission,
  type TrialParticipantRow,
  type TrialRequestInput,
  type TrialReviewInput,
} from '../services/trial-program.service';

/** Query keys của luồng dùng thử doanh nghiệp — mọi dữ liệu dưới ['trial-program']. */
export const TRIAL_PROGRAM_KEYS = {
  all: ['trial-program'] as const,
  owner: ['trial-program', 'owner'] as const,
  mine: ['trial-program', 'mine'] as const,
  platform: ['trial-program', 'platform'] as const,
  mentors: ['trial-program', 'mentors'] as const,
  mentorTrials: ['trial-program', 'mentor'] as const,
  mentorTrial: (organizationId?: string) => ['trial-program', 'mentor', organizationId] as const,
};

/** Tài khoản thuộc doanh nghiệp đang dùng thử (chưa chuyển gói). */
export function useIsEnterpriseTrial() {
  const status = useCurrentUser((s) => s.user?.enterpriseTrialStatus);
  return status === 'trial_active' || status === 'trial_read_only';
}

export function useTrialProgram() {
  return useQuery({ queryKey: TRIAL_PROGRAM_KEYS.owner, queryFn: () => trialProgramService.get().then((r) => r.data.data!) });
}

export function useInviteTrialParticipants() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (rows: TrialParticipantRow[]) => trialProgramService.invite(rows).then((r) => r.data.data!),
    onSettled: () => client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.owner }),
  });
}

/** Gửi lại email mời (link kích hoạt mới) cho nhân viên chưa kích hoạt — dùng chung API mời thành viên. */
export function useResendTrialInvitation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => memberService.resendInvitation(invitationId).then((r) => r.data.data ?? {}),
    onSuccess: () => client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.owner }),
  });
}

/**
 * Chủ doanh nghiệp tự tham gia: sau khi máy chủ thêm role Nhân viên, làm mới token và /auth/me để vào được trang làm bài.
 */
export function useJoinTrialAsParticipant() {
  const client = useQueryClient();
  const setUser = useCurrentUser((s) => s.setUser);
  return useMutation({
    mutationFn: async (input: { department: string; position: string }) => {
      await trialProgramService.joinAsParticipant(input);
      // Token mới mang role Nhân viên vừa thêm; phiên không có refresh token thì phải đăng nhập lại mới vào được bài test.
      const refreshed = await refreshSessionTokens().then(() => true, () => false);
      const user = (await authService.getMe()).data.data;
      if (user) setUser(user);
      return { refreshed };
    },
    onSettled: () => client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.all }),
  });
}

export function useSubmitTrialRequest() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: TrialRequestInput) => trialProgramService.submitRequest(input),
    // Hạn làm bài mới cũng mở bài test của chủ doanh nghiệp nếu đã tham gia.
    onSuccess: () => client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.all }),
  });
}

export function useMyTrialAssessment(enabled = true) {
  return useQuery({
    queryKey: TRIAL_PROGRAM_KEYS.mine,
    queryFn: () => trialProgramService.getMine().then((r) => r.data.data!),
    enabled,
    retry: false,
    // Trạng thái chặn học thử (chờ chấm → đã công bố) đổi từ phía mentor: không giữ cache 5 phút như mặc định.
    staleTime: 15_000,
  });
}

export function useSubmitTrialExam() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: TrialExamSubmission) => trialProgramService.submitExam(input).then((r) => r.data.data!),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.mine });
      void client.invalidateQueries({ queryKey: ['pulse'] });
    },
  });
}

export function usePlatformTrials() {
  return useQuery({ queryKey: TRIAL_PROGRAM_KEYS.platform, queryFn: () => trialProgramService.platformTrials().then((r) => r.data.data!.items) });
}

export function useMentors() {
  return useQuery({ queryKey: TRIAL_PROGRAM_KEYS.mentors, queryFn: () => trialProgramService.mentors().then((r) => r.data.data!.items) });
}

export function useAssignMentor() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ organizationId, mentorUserId }: { organizationId: string; mentorUserId: string }) =>
      trialProgramService.assignMentor(organizationId, mentorUserId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.platform });
      void client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.mentors });
    },
  });
}

export function useCreateMentor() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { fullName: string; email: string; password: string }) => trialProgramService.createMentor(input).then((r) => r.data.data!.mentor),
    onSuccess: () => client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.mentors }),
  });
}

export function useMentorTrials() {
  return useQuery({ queryKey: TRIAL_PROGRAM_KEYS.mentorTrials, queryFn: () => trialProgramService.mentorTrials().then((r) => r.data.data!.items) });
}

export function useMentorTrial(organizationId?: string) {
  return useQuery({
    queryKey: TRIAL_PROGRAM_KEYS.mentorTrial(organizationId),
    queryFn: () => trialProgramService.mentorTrial(organizationId!).then((r) => r.data.data!),
    enabled: Boolean(organizationId),
  });
}

export function useReviewTrialAssessment(organizationId?: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ assessmentId, ...input }: TrialReviewInput & { assessmentId: string }) =>
      trialProgramService.review(organizationId!, assessmentId, input),
    onSuccess: () => client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.mentorTrials }),
  });
}

/** AI gợi ý điểm ba bài tự luận của một bài làm; kết quả được lưu nên tải lại trang mentor. */
export function useTrialEssayAiReview(organizationId?: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => trialProgramService.aiReview(organizationId!, assessmentId).then((r) => r.data.data!),
    onSuccess: () => client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.mentorTrial(organizationId) }),
  });
}

export function usePublishTrialReport(organizationId?: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => trialProgramService.publish(organizationId!),
    onSuccess: () => client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.mentorTrials }),
  });
}
