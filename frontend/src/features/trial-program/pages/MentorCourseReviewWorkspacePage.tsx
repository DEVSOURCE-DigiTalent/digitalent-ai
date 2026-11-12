import { useParams } from 'react-router-dom';
import { MentorReviewWorkbench } from '@/features/trial-program/components/MentorReviewWorkbench';

export function MentorCourseReviewWorkspacePage() {
  const { organizationId, submissionId } = useParams<{ organizationId?: string; submissionId: string }>();
  return (
    <MentorReviewWorkbench
      key={organizationId ?? 'global'}
      organizationId={organizationId}
      selectedSubmissionId={submissionId}
    />
  );
}
