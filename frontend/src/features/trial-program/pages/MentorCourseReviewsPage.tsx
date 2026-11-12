import { useParams } from 'react-router-dom';
import { MentorReviewWorkbench } from '@/features/trial-program/components/MentorReviewWorkbench';

export function MentorCourseReviewsPage() {
  const { organizationId } = useParams<{ organizationId?: string }>();
  return <MentorReviewWorkbench key={organizationId ?? 'global'} organizationId={organizationId} />;
}
