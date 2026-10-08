import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { RequireWorkspace } from '@/components/guards/RequireWorkspace';
import { ENTERPRISE_PORTAL } from '@/lib/portals';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useEnterpriseTheme } from '@/hooks/use-enterprise-theme';
import { enterpriseTrialService as service } from '@/services/enterprise-trial.service';
import { data, ErrorText } from './trial-ui';

/** This shell is admitted only by authenticated session + trial context from the selected adapter. */
export function TrialLayout() {
  useEnterpriseTheme(); const token = localStorage.getItem('accessToken'); const user = useCurrentUser(state => state.user);
  const session = useQuery({ queryKey: ['enterprise-trial', 'session', token], queryFn: () => data(service.currentUser()), enabled: !!token, retry: false, refetchOnMount: 'always' });
  useEffect(() => { if (session.data) useCurrentUser.getState().setUser(session.data); }, [session.data]);
  const context = useQuery({ queryKey: ['enterprise-trial', session.data?.id, 'context'], queryFn: () => data(service.context()), enabled: !!session.data, retry: false, refetchOnMount: 'always' });
  if (!token) return <div className="p-6"><Link to="/login?returnTo=%2Fenterprise%2Ftrial">Đăng nhập để tiếp tục trial</Link></div>;
  if (session.error || context.error) return <div className="p-6"><ErrorText error={session.error || context.error} /><Link className="underline" to="/business/try">Xem điều kiện dùng thử</Link></div>;
  if (!session.data || !context.data || user?.id !== session.data.id) return <p role="status" className="p-6">Đang xác nhận tài khoản và không gian trial…</p>;
  return <RequireWorkspace workspace="enterprise"><div data-testid="enterprise-trial-layout"><MainLayout portal={ENTERPRISE_PORTAL} sidebarConfig={[]} /></div></RequireWorkspace>;
}
