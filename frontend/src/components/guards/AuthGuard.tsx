import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/use-current-user';
import { authService } from '../../services/auth.service';
import { getLoginPath } from '../../features/auth/auth-redirect';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const token = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const hasSession = Boolean(token || refreshToken);
  const user = useCurrentUser((s) => s.user);
  const setUser = useCurrentUser((s) => s.setUser);
  const clearUser = useCurrentUser((s) => s.clearUser);
  const [isLoading, setIsLoading] = useState(!user);

  useEffect(() => {
    if (!hasSession) return;
    if (user) {
      setIsLoading(false);
      return;
    }
    authService
      .getMe()
      .then((res) => {
        setUser(res.data.data!);
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        clearUser();
      })
      .finally(() => setIsLoading(false));
  }, [hasSession, user, setUser, clearUser]);

  if (!hasSession) {
    return <Navigate to={getLoginPath(location.pathname, location.search)} replace />;
  }

  if (isLoading) {
    return (
      // Every portal opens on a dark canvas, so the wait before it is dark too (no white flash), with the brand gold.
      <div role="status" className="flex min-h-screen items-center justify-center bg-[#0b1215]">
        <div className="text-center">
          <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-[#E5A93C] border-t-transparent" aria-hidden="true" />
          <p className="text-sm text-[#c2d3d1]">Đang tải…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={getLoginPath(location.pathname, location.search)} replace />;
  }

  return <>{children}</>;
}
