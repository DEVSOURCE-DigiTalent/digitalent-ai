import { FeedbackList } from '../components/FeedbackList';

/** SHR-05 / EM-14: the bug reports the user sent. */
export function MyBugReportsPage() {
  return <FeedbackList kind="BUG" />;
}
