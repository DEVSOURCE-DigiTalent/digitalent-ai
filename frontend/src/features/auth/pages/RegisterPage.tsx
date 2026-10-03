import { Navigate } from 'react-router-dom';

/**
 * P4: Legacy /register redirects to /portal.
 * Business and individual registrations are handled by BusinessRegisterPage and IndividualRegisterPage.
 */
export function RegisterPage() {
  return <Navigate to="/portal" replace />;
}
