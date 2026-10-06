import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { myLearningService } from '@/services/my-learning.service';

export const MY_LEARNING_KEY = ['my-learning'] as const;

export function useMyLearning() {
  return useQuery({
    queryKey: MY_LEARNING_KEY,
    queryFn: async () => (await myLearningService.getList()).data.data!,
  });
}

export function useCompleteMyLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: string) => (await myLearningService.completeLesson(lessonId)).data.data!,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MY_LEARNING_KEY }),
  });
}
