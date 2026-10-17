import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { resolveNextStep } from '@/lib/navigation';

/**
 * Legacy redirect: Thay thế hoàn toàn giao diện cũ bằng chuyển hướng trực tiếp
 * sang trang xác minh OTP hiện đại `/business/verify-email`.
 */
export function VerifyEmailRequiredPage() {
  const user = useCurrentUser((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;

  if (user.emailVerified !== false) {
    return <Navigate to={resolveNextStep(user)} replace />;
  }

  return <Navigate to={`/business/verify-email?email=${encodeURIComponent(user.email)}`} replace />;
}
