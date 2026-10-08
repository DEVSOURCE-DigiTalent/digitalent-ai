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
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={getLoginPath(location.pathname, location.search)} replace />;
  }

  return <>{children}</>;
}
