import { useCurrentUser } from '@/hooks/use-current-user';
import { primaryRole, ROLES } from '@/lib/roles';
import { CatalogLessonViewerPage } from './CatalogLessonViewerPage';
import { EmployeeLessonViewerPage } from './EmployeeLessonViewerPage';

/** Personal lesson routes use /me for employee and manager; the owner keeps the catalog viewer. */
export function LessonViewerPage() {
  const role = useCurrentUser((state) => primaryRole(state.user));
  return role === ROLES.EMPLOYEE || role === ROLES.MANAGER
    ? <EmployeeLessonViewerPage />
    : <CatalogLessonViewerPage />;
}
