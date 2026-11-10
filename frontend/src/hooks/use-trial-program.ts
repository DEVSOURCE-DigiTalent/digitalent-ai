import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './use-current-user';
import { memberService } from '../services/member.service';
import { refreshSessionTokens } from '../services/api-client';
import { authService } from '../services/auth.service';
import { trialProgramService, type TrialExamSubmission, type TrialParticipantRow } from '../services/trial-program.service';

/** Query keys của luồng dùng thử doanh nghiệp — mọi dữ liệu dưới ['trial-program']. */
export const TRIAL_PROGRAM_KEYS = {
  all: ['trial-program'] as const,
  owner: ['trial-program', 'owner'] as const,
  roadmap: ['trial-program', 'roadmap'] as const,
  mine: ['trial-program', 'mine'] as const,
  platform: ['trial-program', 'platform'] as const,
  mentors: ['trial-program', 'mentors'] as const,
};

/** Đọc lại trong lúc AI viết gợi ý (báo cáo tạm hiện câu mẫu). */
const INSIGHT_POLL_MS = 5_000;

/** Tài khoản thuộc doanh nghiệp đang dùng thử (chưa chuyển gói). */
export function useIsEnterpriseTrial() {
  const status = useCurrentUser((s) => s.user?.enterpriseTrialStatus);
  return status === 'trial_active' || status === 'trial_read_only';
}

export function useTrialProgram() {
  return useQuery({
    queryKey: TRIAL_PROGRAM_KEYS.owner,
    queryFn: () => trialProgramService.get().then((r) => r.data.data!),
    // Nhanh khi AI đang viết gợi ý; còn lại 15 s để chủ doanh nghiệp thấy bài nộp mới.
    refetchInterval: (query) => (query.state.data?.report?.insights.status === 'PENDING' ? INSIGHT_POLL_MS : 15_000),
    refetchIntervalInBackground: false,
  });
}

/** Đề xuất phạm vi đào tạo từ kết quả test (available = false khi chưa có báo cáo / không dùng thử). */
export function useTrialRoadmap(enabled = true) {
  return useQuery({
    queryKey: TRIAL_PROGRAM_KEYS.roadmap,
    queryFn: () => trialProgramService.roadmap().then((r) => r.data.data!),
    enabled,
    refetchInterval: (query) => (query.state.data?.insightStatus === 'PENDING' ? INSIGHT_POLL_MS : false),
  });
}

export function useInviteTrialParticipants() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: TrialParticipantRow[] | { rows: TrialParticipantRow[]; testDeadline: string }) => trialProgramService.invite(Array.isArray(input) ? input : input.rows, Array.isArray(input) ? undefined : input.testDeadline).then((r) => r.data.data!),
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
      // The local mock authorizes against its live session store, without issuing a new JWT.
      return { refreshed: refreshed || import.meta.env.VITE_USE_MOCK === 'true' };
    },
    onSettled: () => client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.all }),
  });
}

export function useSetTrialDeadline() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (testDeadline: string) => trialProgramService.setDeadline(testDeadline),
    // Hạn làm bài mới cũng mở bài test của chủ doanh nghiệp nếu đã tham gia.
    onSuccess: () => client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.all }),
  });
}

/** "Xem kết quả ngay": đóng bài, tạo báo cáo; nhân viên chưa nộp không vào bài được nữa. */
export function useCloseTrial() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => trialProgramService.close().then((r) => r.data.data!),
    onSuccess: () => client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.all }),
  });
}

export function useMyTrialAssessment(enabled = true) {
  return useQuery({
    queryKey: TRIAL_PROGRAM_KEYS.mine,
    queryFn: () => trialProgramService.getMine().then((r) => r.data.data!),
    enabled,
    retry: false,
    // Bài đóng khi hết hạn / chủ doanh nghiệp đóng sớm: không giữ cache 5 phút như mặc định.
    staleTime: 15_000,
  });
}

export function useSubmitTrialExam() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: TrialExamSubmission) => trialProgramService.submitExam(input).then((r) => r.data.data!),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.mine });
      void client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.owner });
      void client.invalidateQueries({ queryKey: ['learning-needs'] });
      void client.invalidateQueries({ queryKey: ['pulse'] });
    },
  });
}

export function usePlatformTrials() {
  return useQuery({
    queryKey: TRIAL_PROGRAM_KEYS.platform,
    queryFn: () => trialProgramService.platformTrials().then((r) => r.data.data!.items),
    refetchInterval: (query) => (query.state.data?.some((t) => t.insightStatus === 'PENDING') ? INSIGHT_POLL_MS : false),
  });
}

/** Quản trị nền tảng cho AI viết lại gợi ý của một báo cáo. */
export function useRegenerateTrialInsights() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (organizationId: string) => trialProgramService.regenerateInsights(organizationId).then((r) => r.data.data!),
    onSuccess: () => client.invalidateQueries({ queryKey: TRIAL_PROGRAM_KEYS.platform }),
  });
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
