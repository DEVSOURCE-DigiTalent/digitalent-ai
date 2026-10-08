import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JOB_GRADE_DEFAULT_NAMES, type JobGradeCode } from '../lib/terms';
import { jobGradeService, type UpdateJobGradeRequest } from '../services/job-grade.service';

const JOB_GRADES_KEY = ['job-grades'];

/** Grade names are shown on member and position rows and in the overview. */
const GRADE_DEPENDENT_KEYS = [JOB_GRADES_KEY, ['members'], ['job-positions'], ['organization', 'overview']];

export function useJobGrades() {
  return useQuery({
    queryKey: JOB_GRADES_KEY,
    queryFn: async () => {
      const response = await jobGradeService.getAll();
      return response.data.data;
    },
  });
}

/** Label of a grade code with the organization's name for it, e.g. "G1 · Chuyên viên" (default names until loaded). */
export function useJobGradeLabel() {
  const { data: grades } = useJobGrades();
  return (code: JobGradeCode) =>
    `${code} · ${grades?.find((grade) => grade.code === code)?.name ?? JOB_GRADE_DEFAULT_NAMES[code]}`;
}

export function useUpdateJobGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: UpdateJobGradeRequest }) =>
      jobGradeService.update(code, data),
    onSuccess: () => Promise.all(GRADE_DEPENDENT_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });
}
