import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/use-current-user';
import apiClient from '../../services/api-client';
import { getLoginPath } from '../../features/auth/auth-redirect';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const token = localStorage.getItem('accessToken');
  const user = useCurrentUser((s) => s.user);
  const setUser = useCurrentUser((s) => s.setUser);
  const [isLoading, setIsLoading] = useState(!user);

  useEffect(() => {
    if (!token) return;
    if (user) {
      setIsLoading(false);
      return;
    }
    apiClient
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.data);
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
      })
      .finally(() => setIsLoading(false));
  }, [token, user, setUser]);

  if (!token) {
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

  return <>{children}</>;
}
