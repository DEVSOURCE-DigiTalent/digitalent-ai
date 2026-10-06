import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { meService, type AttemptHistoryParams, type SubmitTaskPayload } from '../services/me.service';

/** Query keys của trang cá nhân (EM-01..EM-18) — mọi dữ liệu dưới ['me'] để invalidate cùng lúc khi cần. */
export const ME_KEYS = {
  all: ['me'] as const,
  dashboard: ['me', 'dashboard'] as const,
  competencyProfile: ['me', 'competency-profile'] as const,
  skillGap: ['me', 'skill-gap'] as const,
  evidence: ['me', 'evidence'] as const,
  learningPath: ['me', 'learning-path'] as const,
  achievements: ['me', 'achievements'] as const,
  courses: ['me', 'courses'] as const,
  course: (courseId?: string) => ['me', 'courses', courseId] as const,
  lesson: (courseId?: string, lessonId?: string) => ['me', 'courses', courseId, 'lessons', lessonId] as const,
  assessments: ['me', 'assessments'] as const,
  assessment: (assessmentId?: string) => ['me', 'assessments', assessmentId] as const,
  attemptSession: (attemptId?: string) => ['me', 'attempts', attemptId, 'session'] as const,
  attemptResult: (attemptId?: string) => ['me', 'attempts', attemptId, 'result'] as const,
  attemptHistory: (params?: AttemptHistoryParams) => ['me', 'attempts', 'history', params] as const,
  tasks: ['me', 'tasks'] as const,
  task: (assignmentId?: string) => ['me', 'tasks', assignmentId] as const,
};

export function useMyDashboard() {
  return useQuery({ queryKey: ME_KEYS.dashboard, queryFn: () => meService.getDashboard().then((r) => r.data.data!) });
}

export function useMyCompetencyProfile(enabled = true) {
  return useQuery({
    queryKey: ME_KEYS.competencyProfile,
    queryFn: () => meService.getCompetencyProfile().then((r) => r.data.data!),
    enabled,
  });
}

export function useMySkillGapDetail() {
  return useQuery({ queryKey: ME_KEYS.skillGap, queryFn: () => meService.getSkillGap().then((r) => r.data.data!) });
}

export function useMyEvidenceTimeline() {
  return useQuery({ queryKey: ME_KEYS.evidence, queryFn: () => meService.getEvidence().then((r) => r.data.data!) });
}

export function useMyLearningPath() {
  return useQuery({ queryKey: ME_KEYS.learningPath, queryFn: () => meService.getLearningPath().then((r) => r.data.data!) });
}

export function useMyAchievements() {
  return useQuery({ queryKey: ME_KEYS.achievements, queryFn: () => meService.getAchievements().then((r) => r.data.data!) });
}

export function useMyCourses() {
  return useQuery({ queryKey: ME_KEYS.courses, queryFn: () => meService.getCourses().then((r) => r.data.data!) });
}

export function useMyCourse(courseId?: string) {
  return useQuery({
    queryKey: ME_KEYS.course(courseId),
    queryFn: () => meService.getCourse(courseId!).then((r) => r.data.data!),
    enabled: Boolean(courseId),
  });
}

/** Tự ghi danh khóa tự chọn (từ lộ trình / gợi ý). */
export function useEnrollInCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => meService.enroll(courseId).then((r) => r.data.data!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ME_KEYS.all }),
  });
}

export function useMyLesson(courseId?: string, lessonId?: string) {
  return useQuery({
    queryKey: ME_KEYS.lesson(courseId, lessonId),
    queryFn: () => meService.getLesson(courseId!, lessonId!).then((r) => r.data.data!),
    enabled: Boolean(courseId && lessonId),
  });
}

/** Ghi nhận mở bài (để "học tiếp" đúng chỗ) — không chặn giao diện nếu lỗi. */
export function useStartLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      meService.startLesson(courseId, lessonId).then((r) => r.data.data!),
    onSuccess: (_data, { courseId }) => {
      qc.invalidateQueries({ queryKey: ME_KEYS.course(courseId) });
      qc.invalidateQueries({ queryKey: ME_KEYS.courses });
      qc.invalidateQueries({ queryKey: ME_KEYS.dashboard });
    },
  });
}

export function useCompleteMyLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      meService.completeLesson(courseId, lessonId).then((r) => r.data.data!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ME_KEYS.all }),
  });
}

export function useMyAssessments() {
  return useQuery({ queryKey: ME_KEYS.assessments, queryFn: () => meService.getAssessments().then((r) => r.data.data!) });
}

export function useMyAssessment(assessmentId?: string) {
  return useQuery({
    queryKey: ME_KEYS.assessment(assessmentId),
    queryFn: () => meService.getAssessment(assessmentId!).then((r) => r.data.data!),
    enabled: Boolean(assessmentId),
  });
}

/** Bắt đầu / tiếp tục lần làm bài (server trả lần đang làm nếu có). */
export function useStartAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => meService.startAttempt(assessmentId).then((r) => r.data.data!),
    onSuccess: (session) => {
      qc.setQueryData(ME_KEYS.attemptSession(session.attemptId), session);
      qc.invalidateQueries({ queryKey: ME_KEYS.assessments });
    },
  });
}

export function useAttemptSession(attemptId?: string) {
  return useQuery({
    queryKey: ME_KEYS.attemptSession(attemptId),
    queryFn: () => meService.getAttemptSession(attemptId!).then((r) => r.data.data!),
    enabled: Boolean(attemptId),
    // Đáp án đang làm nằm ở state của trang — không tự tải lại làm mất lựa chọn chưa lưu
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useSaveAttemptAnswers() {
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string; answers: Record<string, string | null> }) =>
      meService.saveAnswers(attemptId, answers).then((r) => r.data.data!),
  });
}

export function useSubmitAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string; answers: Record<string, string | null> }) =>
      meService.submitAttempt(attemptId, answers).then((r) => r.data.data!),
    onSuccess: (result) => {
      qc.setQueryData(ME_KEYS.attemptResult(result.attemptId), result);
      qc.removeQueries({ queryKey: ME_KEYS.attemptSession(result.attemptId) });
      qc.invalidateQueries({ queryKey: ME_KEYS.all });
    },
  });
}

export function useAttemptResult(attemptId?: string) {
  return useQuery({
    queryKey: ME_KEYS.attemptResult(attemptId),
    queryFn: () => meService.getAttemptResult(attemptId!).then((r) => r.data.data!),
    enabled: Boolean(attemptId),
  });
}

export function useAttemptHistory(params: AttemptHistoryParams) {
  return useQuery({
    queryKey: ME_KEYS.attemptHistory(params),
    queryFn: () => meService.getAttemptHistory(params).then((r) => r.data.data!),
    placeholderData: keepPreviousData,
  });
}

export function useMyTasks() {
  return useQuery({ queryKey: ME_KEYS.tasks, queryFn: () => meService.getTasks().then((r) => r.data.data!) });
}

export function useMyTask(assignmentId?: string) {
  return useQuery({
    queryKey: ME_KEYS.task(assignmentId),
    queryFn: () => meService.getTask(assignmentId!).then((r) => r.data.data!),
    enabled: Boolean(assignmentId),
  });
}

export function useUploadTaskAttachment() {
  return useMutation({
    mutationFn: ({ assignmentId, file }: { assignmentId: string; file: File }) =>
      meService.uploadAttachment(assignmentId, file).then((r) => r.data.data!),
  });
}

export function useSubmitMyTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, payload }: { assignmentId: string; payload: SubmitTaskPayload }) =>
      meService.submitTask(assignmentId, payload).then((r) => r.data.data!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ME_KEYS.all }),
  });
}
