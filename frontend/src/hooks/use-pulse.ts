import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pulseReviewService, pulseService, type PulseAnswer, type PulseDecision, type PulseSupportAction } from '../services/pulse.service';

/** Query keys của trang nhân viên Pulse — mọi dữ liệu dưới ['pulse'] để làm mới cùng lúc sau mỗi thao tác. */
export const PULSE_KEYS = {
  all: ['pulse'] as const,
  overview: ['pulse', 'overview'] as const,
  course: (courseId?: string) => ['pulse', 'courses', courseId] as const,
  module: (courseId?: string, moduleId?: string) => ['pulse', 'courses', courseId, 'modules', moduleId] as const,
  preAssessment: (courseId?: string) => ['pulse', 'courses', courseId, 'pre-assessment'] as const,
  final: (courseId?: string) => ['pulse', 'courses', courseId, 'final'] as const,
  practice: ['pulse', 'practice'] as const,
  outcomes: ['pulse', 'outcomes'] as const,
  outcome: (outcomeId?: string) => ['pulse', 'outcomes', outcomeId] as const,
  finalReviews: ['pulse', 'final-reviews'] as const,
};

export function usePulseOverview() {
  return useQuery({ queryKey: PULSE_KEYS.overview, queryFn: () => pulseService.getOverview().then((r) => r.data.data!) });
}

export function usePulseCourse(courseId?: string) {
  return useQuery({
    queryKey: PULSE_KEYS.course(courseId),
    queryFn: () => pulseService.getCourse(courseId!).then((r) => r.data.data!),
    enabled: Boolean(courseId),
  });
}

export function usePulseModule(courseId?: string, moduleId?: string) {
  return useQuery({
    queryKey: PULSE_KEYS.module(courseId, moduleId),
    queryFn: () => pulseService.getModule(courseId!, moduleId!).then((r) => r.data.data!),
    enabled: Boolean(courseId && moduleId),
  });
}

export function useMarkPulseModuleViewed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId }: { courseId: string; moduleId: string }) =>
      pulseService.markModuleViewed(courseId, moduleId).then((r) => r.data.data!),
    onSuccess: () => qc.invalidateQueries({ queryKey: PULSE_KEYS.all }),
  });
}

/** Mở lại một trang của mô đun (xem lại sau lần ôn tập chưa đạt). */
export function useMarkPulsePageViewed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId, lessonId }: { courseId: string; moduleId: string; lessonId: string }) =>
      pulseService.markPageViewed(courseId, moduleId, lessonId).then((r) => r.data.data!),
    onSuccess: (_, { courseId, moduleId }) => qc.invalidateQueries({ queryKey: PULSE_KEYS.module(courseId, moduleId) }),
  });
}

export function useSubmitPulseModuleQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId, answers, attemptNo }: { courseId: string; moduleId: string; answers: PulseAnswer[]; attemptNo?: number }) =>
      pulseService.submitModuleQuiz(courseId, moduleId, answers, attemptNo).then((r) => r.data.data!),
    // Đạt: tiến độ khóa đổi. Chưa đạt hoặc bộ câu đã đổi (QUIZ_CHANGED): tải lại mô đun để thấy trang cần xem lại / câu mới.
    onSettled: (result, _error, { courseId, moduleId }) =>
      qc.invalidateQueries({ queryKey: result?.passed ? PULSE_KEYS.all : PULSE_KEYS.module(courseId, moduleId) }),
  });
}

/** Bài đánh giá trước khi học của một khóa. */
export function usePulsePreAssessment(courseId?: string) {
  return useQuery({
    queryKey: PULSE_KEYS.preAssessment(courseId),
    queryFn: () => pulseService.getPreAssessment(courseId!).then((r) => r.data.data!),
    enabled: Boolean(courseId),
  });
}

export function usePulseFinal(courseId?: string) {
  return useQuery({
    queryKey: PULSE_KEYS.final(courseId),
    queryFn: () => pulseService.getFinal(courseId!).then((r) => r.data.data!),
    enabled: Boolean(courseId),
  });
}

export function usePulsePractice() {
  return useQuery({ queryKey: PULSE_KEYS.practice, queryFn: () => pulseService.getPractice().then((r) => r.data.data!) });
}

export function usePulseOutcomes() {
  return useQuery({ queryKey: PULSE_KEYS.outcomes, queryFn: () => pulseService.getOutcomes().then((r) => r.data.data!.items) });
}

export function usePulseOutcome(outcomeId?: string) {
  return useQuery({
    queryKey: PULSE_KEYS.outcome(outcomeId),
    queryFn: () => pulseService.getOutcome(outcomeId!).then((r) => r.data.data!),
    enabled: Boolean(outcomeId),
  });
}

/** Hàng chờ chấm bài của phòng ban (quản lý): bài đánh giá trước khi học và bài cuối khóa. */
export function usePulseFinalReviews(enabled = true) {
  return useQuery({ queryKey: PULSE_KEYS.finalReviews, queryFn: () => pulseReviewService.getQueue().then((r) => r.data.data!), enabled });
}

export function useDecidePulseFinal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, decision, reason }: { submissionId: string; decision: PulseDecision; reason: string }) =>
      pulseReviewService.decide(submissionId, decision, reason).then((r) => r.data.data!),
    onSuccess: () => qc.invalidateQueries({ queryKey: PULSE_KEYS.all }),
  });
}

export function useDecidePulsePreAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ preAssessmentId, decision, reason }: { preAssessmentId: string; decision: PulseDecision; reason: string }) =>
      pulseReviewService.decidePreAssessment(preAssessmentId, decision, reason).then((r) => r.data.data!),
    onSuccess: () => qc.invalidateQueries({ queryKey: PULSE_KEYS.all }),
  });
}

export function useRecordPulseSupport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, action, note }: { submissionId: string; action: PulseSupportAction; note?: string }) =>
      pulseReviewService.recordSupport(submissionId, action, note).then((r) => r.data.data!),
    onSuccess: () => qc.invalidateQueries({ queryKey: PULSE_KEYS.all }),
  });
}
