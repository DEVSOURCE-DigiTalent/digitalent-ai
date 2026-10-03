import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, CreditCard, Home, LogOut } from 'lucide-react';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { RequireOnboarded } from '../../components/guards/RequireOnboarded';
import { RequireWorkspace } from '../../components/guards/RequireWorkspace';
import { useLogout } from '../../hooks/use-auth';
import { useCurrentUser } from '../../hooks/use-current-user';
import { WORKSPACES } from '../../lib/roles';
import { Wordmark } from '../../components/brand/Wordmark';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../../features/learner/components/ThemeToggle';
import { PERSONAL_THEME_BACKGROUND, usePersonalTheme } from '../../features/learner/theme/use-personal-theme';
import { usePageBackground } from '../../features/public/landing/hooks/use-page-background';
import '../../features/learner/theme/personal-theme.css';

const NAV_ITEMS = [
  { to: '/personal/dashboard', label: 'Tổng quan', match: ['/personal', '/personal/dashboard'] },
  { to: '/personal/target', label: 'Mục tiêu' },
  { to: '/personal/diagnostic', label: 'Đánh giá' },
  { to: '/personal/path', label: 'Lộ trình', match: ['/personal/path', '/personal/courses', '/personal/classroom'] },
  { to: '/personal/tasks', label: 'Thực hành' },
  { to: '/personal/progress', label: 'Hồ sơ năng lực' },
  { to: '/personal/certificates', label: 'Chứng nhận' },
];

function isActive(pathname: string, item: (typeof NAV_ITEMS)[number]): boolean {
  if (!item.match) return pathname.startsWith(item.to);
  return item.match.some((prefix) => (prefix === '/personal' ? pathname === prefix || pathname === `${prefix}/` : pathname.startsWith(prefix)));
}

function initials(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0]?.slice(0, 2) ?? '').toUpperCase();
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
    navigate('/individual/login');
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
            {user?.subscription && (
              <p className="mt-2 text-xs text-pt-fg-2">
                Gói {user.subscription.planName}
                {user.subscription.renewsAt && <span className="text-pt-fg-3"> · gia hạn {user.subscription.renewsAt.split('-').reverse().join('/')}</span>}
              </p>
            )}
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

function PersonalNav({ className }: { className?: string }) {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Khu học tập cá nhân" className={className}>
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.to} className="shrink-0">
              <NavLink
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex rounded-full px-3.5 py-1.5 text-[13px] transition-colors',
                  active ? 'bg-pt-fg text-pt-bg' : 'text-pt-fg-2 hover:bg-pt-fg/8 hover:text-pt-fg',
                )}
              >
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const PersonalShell = () => {
  const theme = usePersonalTheme((state) => state.theme);
  const { pathname } = useLocation();
  usePageBackground(PERSONAL_THEME_BACKGROUND[theme]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, [pathname]);

  return (
    <div
      data-testid="personal-layout"
      data-theme={theme}
      lang="vi"
      className="personal-theme relative flex min-h-screen flex-col bg-pt-bg font-landing text-pt-fg antialiased transition-colors duration-300"
    >
      <div aria-hidden="true" className="pt-grain pointer-events-none fixed inset-0 z-0" />

      <a href="#personal-main" className="fixed -top-16 left-4 z-[100] rounded-full bg-pt-accent px-4 py-2.5 text-sm text-pt-on-accent transition-[top] focus:top-3">
        Bỏ qua đến nội dung
      </a>

      <header className="sticky top-0 z-40 border-b border-pt-line bg-pt-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          <Link to="/personal" aria-label="DigiTalent AI, về tổng quan" className="flex items-center gap-2.5">
            <Wordmark className="text-lg [--wordmark-on:var(--pt-bg)]" />
            <span className="hidden whitespace-nowrap rounded-full border border-pt-line px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-pt-fg-3 sm:inline">Cá nhân</span>
          </Link>
          <PersonalNav className="hidden lg:block" />
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
        <PersonalNav className="pt-scroll-x mx-auto max-w-6xl overflow-x-auto px-4 pb-3 lg:hidden" />
      </header>

      <main id="personal-main" tabIndex={-1} className="relative mx-auto w-full max-w-6xl flex-1 px-5 pb-20 pt-10 outline-none md:px-8 md:pt-14">
        <Outlet />
      </main>

      <footer className="relative border-t border-pt-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-6 text-xs text-pt-fg-3 sm:flex-row sm:justify-between md:px-8">
          <span>© {new Date().getFullYear()} DigiTalent AI</span>
          <span>Khung năng lực số theo Thông tư 02/2025/TT-BGDĐT</span>
        </div>
      </footer>
    </div>
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
