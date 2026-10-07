import { useCurrentUser } from '@/hooks/use-current-user';
import { primaryRole, ROLES } from '@/lib/roles';
import { CatalogLessonViewerPage } from './CatalogLessonViewerPage';
import { EmployeeLessonViewerPage } from './EmployeeLessonViewerPage';

/** Employee lesson progress is handled by /me; owner/manager keep the BE2 viewer. */
export function LessonViewerPage() {
  const role = useCurrentUser((state) => primaryRole(state.user));
  return role === ROLES.EMPLOYEE
    ? <EmployeeLessonViewerPage />
    : <CatalogLessonViewerPage />;
}
