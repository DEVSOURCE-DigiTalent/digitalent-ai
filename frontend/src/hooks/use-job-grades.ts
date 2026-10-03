import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobGradeService, type UpdateJobGradeRequest } from '../services/job-grade.service';

const JOB_GRADES_KEY = ['job-grades'];

export function useJobGrades() {
  return useQuery({
    queryKey: JOB_GRADES_KEY,
    queryFn: async () => {
      const response = await jobGradeService.getAll();
      return response.data.data;
    },
  });
}

export function useUpdateJobGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: UpdateJobGradeRequest }) =>
      jobGradeService.update(code, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JOB_GRADES_KEY });
      void queryClient.invalidateQueries({ queryKey: ['organization', 'overview'] });
    },
  });
}
