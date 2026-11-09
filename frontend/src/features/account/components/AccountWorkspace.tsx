import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { ReactNode } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, UserRound, ShieldCheck, Building2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import '../account-workspace.css';

export function AccountWorkspace({ title, section, children }: { title:string; section:'profile'|'security'|'organization'; children:ReactNode }) {
  useUiLanguage();
  const location=useLocation();
  const owner=useCurrentUser(s=>s.user?.roles.includes('OWNER'));
  const enterprise=location.pathname.startsWith('/enterprise');
  const base=enterprise?'/enterprise/account':'/platform/account';
  const Icon=section==='profile'?UserRound:section==='security'?ShieldCheck:Building2;
  return <div className={`account-workspace account-workspace--${section}`}>
    <header className="aw-heading"><div><span className="aw-heading__icon"><Icon size={23}/></span><h1>{translateUi(title)}</h1></div>{enterprise && owner && <Link className="aw-back" to="/enterprise/dashboard"><ArrowLeft size={15}/>{translateUi(" Tổng quan")}</Link>}</header>
    <nav className="aw-nav" aria-label={translateUi("Cài đặt tài khoản")}>
      <NavLink to={base} end><UserRound size={16}/>{translateUi("Hồ sơ của tôi")}</NavLink>
      <NavLink to={`${base}/security`}><ShieldCheck size={16}/>{translateUi("Bảo mật tài khoản")}</NavLink>
      {enterprise && owner && <NavLink to="/enterprise/settings"><Building2 size={16}/>{translateUi("Cài đặt tổ chức")}</NavLink>}
    </nav>
    {children}
  </div>;
}
