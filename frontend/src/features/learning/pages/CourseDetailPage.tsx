import { useCurrentUser } from '@/hooks/use-current-user';
import { primaryRole, ROLES } from '@/lib/roles';
import { CatalogCourseDetailPage } from './CatalogCourseDetailPage';
import { EmployeeCourseDetailPage } from './EmployeeCourseDetailPage';

/** Personal course routes use /me for employee and manager; the owner keeps the catalog preview. */
export function CourseDetailPage() {
  const role = useCurrentUser((state) => primaryRole(state.user));
  return role === ROLES.EMPLOYEE || role === ROLES.MANAGER
    ? <EmployeeCourseDetailPage />
    : <CatalogCourseDetailPage />;
}
