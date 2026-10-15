import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { meService, type SubmitTaskPayload } from '../services/me.service';

/**
 * Nhiệm vụ thực tế của nhân viên (api/v1/me/tasks) — dùng ở trang Thực hành của cổng Pulse.
 * Mọi dữ liệu dưới ['me'] để invalidate cùng lúc sau khi nộp.
 */
export const ME_KEYS = {
  all: ['me'] as const,
  tasks: ['me', 'tasks'] as const,
};

export function useMyTasks() {
  return useQuery({ queryKey: ME_KEYS.tasks, queryFn: () => meService.getTasks().then((r) => r.data.data!) });
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
