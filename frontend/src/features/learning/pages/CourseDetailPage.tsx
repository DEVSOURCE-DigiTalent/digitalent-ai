import { useCurrentUser } from '@/hooks/use-current-user';
import { primaryRole, ROLES } from '@/lib/roles';
import { CatalogCourseDetailPage } from './CatalogCourseDetailPage';
import { EmployeeCourseDetailPage } from './EmployeeCourseDetailPage';

/** Preserve the BE2 owner/manager course preview and the employee /me enrollment flow. */
export function CourseDetailPage() {
  const role = useCurrentUser((state) => primaryRole(state.user));
  return role === ROLES.EMPLOYEE
    ? <EmployeeCourseDetailPage />
    : <CatalogCourseDetailPage />;
}
