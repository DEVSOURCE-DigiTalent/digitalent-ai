import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, CreditCard, Home, LogOut, Menu } from 'lucide-react';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { RequireOnboarded } from '../../components/guards/RequireOnboarded';
import { RequireWorkspace } from '../../components/guards/RequireWorkspace';
import { useLogout } from '../../hooks/use-auth';
import { useCurrentUser } from '../../hooks/use-current-user';
import { usePersonalAccess } from '../../hooks/use-personal-learning';
import { formatDmy } from '../../lib/personal-access';
import { WORKSPACES } from '../../lib/roles';
import { cn } from '../../lib/utils';
import { PlanBadge } from '../../features/learner/components/PlanBadge';
import { UpgradeLink } from '../../features/learner/components/UpgradeLink';
import { ThemeToggle } from '../../features/learner/components/ThemeToggle';
import { PERSONAL_THEME_BACKGROUND, usePersonalTheme } from '../../features/learner/theme/use-personal-theme';
import { usePageBackground } from '../../features/public/landing/hooks/use-page-background';
import '../../features/learner/theme/personal-theme.css';
import { PersonalSidebar, PersonalMobileMenu, activePersonalItem } from '../../features/learner/components/PersonalSidebar';
import { PersonalFocusContext } from '../../features/learner/components/PersonalFocusContext';
import { Wordmark } from '../../components/brand/Wordmark';

function initials(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0]?.slice(0, 2) ?? '').toUpperCase();
}

/** Plan line of the account menu: trial and Free say so; a paying plan keeps its renewal date. */
function PlanLine() {
  const user = useCurrentUser((state) => state.user);
  const { data: access } = usePersonalAccess();
  if (!user?.subscription) return null;
  const { subscription } = user;

  // The top bar has room for the upgrade link only from tablet width up; on a phone it is here.
  const upgrade = <UpgradeLink placement="topbar" variant="text" className="mt-1 inline-block sm:hidden">Nâng cấp</UpgradeLink>;

  if (access?.mode === 'trial') {
    return (
      <>
        <p className="mt-2 text-xs text-pt-fg-2">
          Gói Plus (dùng thử)
          {access.trialEndsAt && <span className="text-pt-fg-3"> · hết hạn {formatDmy(access.trialEndsAt).slice(0, 5)}</span>}
        </p>
        {upgrade}
      </>
    );
  }
  if (access?.mode === 'free') {
    return <><p className="mt-2 text-xs text-pt-fg-2">Gói Miễn phí</p>{upgrade}</>;
  }
  return (
    <p className="mt-2 text-xs text-pt-fg-2">
      Gói {subscription.planName}
      {subscription.renewsAt && <span className="text-pt-fg-3"> · gia hạn {subscription.renewsAt.split('-').reverse().join('/')}</span>}
    </p>
  );
}

function AccountMenu() {
  const user = useCurrentUser((state) => state.user);
  const navigate = useNavigate();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate('/login');
  };

  const itemClass = 'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-pt-fg-2 transition-colors hover:bg-pt-fg/8 hover:text-pt-fg';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-full border border-pt-line py-1 pl-1 pr-2.5 transition-colors hover:border-pt-fg/40"
      >
        <span className="grid size-7 place-items-center rounded-full bg-pt-fg/12 text-[11px] font-medium text-pt-fg">
          {initials(user?.fullName ?? 'Bạn')}
        </span>
        <span className="sr-only">Tài khoản của {user?.fullName}</span>
        <ChevronDown className={cn('size-3.5 text-pt-fg-3 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <div role="menu" className="pt-rise absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-[18px] border border-pt-line bg-pt-panel p-2 shadow-2xl shadow-black/30">
          <div className="px-3 pb-3 pt-2">
            <p className="truncate text-sm font-medium text-pt-fg">{user?.fullName}</p>
            <p className="truncate text-xs text-pt-fg-3">{user?.email}</p>
            <PlanLine />
          </div>
          <div className="border-t border-pt-line pt-2">
            <Link role="menuitem" to="/personal/subscription" className={itemClass} onClick={() => setOpen(false)}>
              <CreditCard className="size-4" aria-hidden="true" /> Gói cá nhân
            </Link>
            <Link role="menuitem" to="/individual" className={itemClass} onClick={() => setOpen(false)}>
              <Home className="size-4" aria-hidden="true" /> Trang giới thiệu
            </Link>
            <button role="menuitem" type="button" onClick={handleLogout} className={itemClass} disabled={logout.isPending}>
              <LogOut className="size-4" aria-hidden="true" /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const PersonalShell = () => {
  const theme = usePersonalTheme((state) => state.theme);
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [pageFocus, setPageFocus] = useState(false);
  const focus = pageFocus || pathname.startsWith('/personal/classroom/');
  const item = activePersonalItem(pathname);
  const detail = pathname.startsWith('/personal/classroom/') ? 'Lớp học' : pathname.startsWith('/personal/courses/') ? 'Chi tiết khóa học' : pathname === '/personal/billing' ? 'Lịch sử thanh toán' : null;
  usePageBackground(PERSONAL_THEME_BACKGROUND[theme]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    setDrawer(false);
  }, [pathname]);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const desktop = matchMedia('(min-width: 1024px)');
    const close = () => { if (desktop.matches) setDrawer(false); };
    desktop.addEventListener('change', close);
    return () => desktop.removeEventListener('change', close);
  }, []);
  return (
    <PersonalFocusContext.Provider value={setPageFocus}>
      <div data-testid="personal-layout" data-theme={theme} data-individual-theme={theme} data-focus={focus} lang="vi"
        className="personal-theme pt-workspace min-h-screen bg-pt-bg font-landing text-pt-fg antialiased">
        <div inert={drawer}>
          <a href="#personal-main" className="fixed -top-16 left-4 z-[100] rounded-lg bg-pt-accent px-4 py-2.5 text-sm text-pt-on-accent focus:top-3">Bỏ qua đến nội dung</a>
          <div className="pt-workspace-body flex min-h-screen min-w-0 flex-col">
            <header className="sticky top-0 z-40 border-b border-pt-line bg-pt-bg">
              <div className="mx-auto flex min-h-[60px] w-full max-w-[1440px] items-center justify-between gap-2 px-4 md:px-6 lg:px-8">
                <button type="button" onClick={() => setDrawer(true)} aria-label="Mở menu" aria-expanded={drawer} aria-haspopup="dialog" className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-pt-raised lg:hidden"><Menu className="size-5" /></button>
                <Link to="/personal" aria-label="DigiTalent AI, về tổng quan" className="hidden w-[232px] shrink-0 items-center lg:flex">
                  <Wordmark className="text-base [--wordmark-on:var(--pt-bg)]" />
                </Link>
                <nav aria-label="Đường dẫn" className="min-w-0 flex-1 text-sm text-pt-fg-2">
                  <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {item.group && <li className="hidden sm:block">{item.group}<span className="ml-2" aria-hidden="true">/</span></li>}
                    <li>{detail ? <Link to={item.to} className="hover:text-pt-accent">{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>
                    {detail && <li className="hidden sm:block"><span className="mr-2" aria-hidden="true">/</span><span aria-current="page">{detail}</span></li>}
                  </ol>
                </nav>
                <div className="flex shrink-0 items-center gap-2"><PlanBadge /><div className="hidden sm:block"><ThemeToggle /></div><AccountMenu /></div>
              </div>
            </header>
            <div className="pt-workspace-content mx-auto flex w-full min-w-0 max-w-[1440px] flex-1 gap-6 px-4 py-6 md:px-6 lg:px-8">
              <PersonalSidebar pathname={pathname} />
              <main id="personal-main" tabIndex={-1} className="min-w-0 flex-1 outline-none"><Outlet /></main>
            </div>
            {!focus && <footer className="border-t border-pt-line px-4 py-4 text-xs text-pt-fg-3 md:px-8">© {new Date().getFullYear()} DigiTalent AI</footer>}
          </div>
        </div>
        <PersonalMobileMenu open={drawer} pathname={pathname} onClose={() => setDrawer(false)} />
      </div>
    </PersonalFocusContext.Provider>
  );
};
/** Personal workspace shell: signed-in individual users only. */
export const PersonalLayout = () => (
  <AuthGuard>
    <RequireWorkspace workspace={WORKSPACES.PERSONAL}>
      <RequireOnboarded>
        <PersonalShell />
      </RequireOnboarded>
    </RequireWorkspace>
  </AuthGuard>
);
