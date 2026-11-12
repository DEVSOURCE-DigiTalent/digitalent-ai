import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/use-current-user';
import { authService } from '../../services/auth.service';
import { getLoginPath } from '../../features/auth/auth-redirect';
import { AppLoadingScreen } from '../shared/LoadingState';

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

  // Hỗ trợ chế độ xem trước (preview) các biến thể loading màn hình qua query param
  const previewLoading = location.search.includes('loading=general')
    ? ('default' as const)
    : location.search.includes('loading=employee')
    ? ('employee' as const)
    : location.search.includes('loading=public')
    ? ('public' as const)
    : null;

  if (previewLoading) {
    return <AppLoadingScreen forceVariant={previewLoading} />;
  }

  if (!hasSession) {
    return <Navigate to={getLoginPath(location.pathname, location.search)} replace />;
  }

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  if (!user) {
    return <Navigate to={getLoginPath(location.pathname, location.search)} replace />;
  }

  return <>{children}</>;
}
