import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, ChartNoAxesCombined, ClipboardCheck, CreditCard, Home, ListChecks, Target, X } from 'lucide-react';
import { useDialogFocus } from '@/hooks/use-dialog-focus';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

export const PERSONAL_NAV = [
  { to: '/personal/dashboard', label: 'Tổng quan', group: '', icon: Home, routes: ['/personal/dashboard'] },
  { to: '/personal/target', label: 'Mục tiêu nghề nghiệp', group: 'Học tập', icon: Target, routes: ['/personal/target'] },
  { to: '/personal/diagnostic', label: 'Đánh giá năng lực', group: 'Học tập', icon: ClipboardCheck, routes: ['/personal/diagnostic'] },
  { to: '/personal/path', label: 'Lộ trình học', group: 'Học tập', icon: BookOpen, routes: ['/personal/path', '/personal/courses', '/personal/classroom'] },
  { to: '/personal/tasks', label: 'Bài thực hành', group: 'Học tập', icon: ListChecks, routes: ['/personal/tasks'] },
  { to: '/personal/progress', label: 'Hồ sơ năng lực', group: 'Kết quả', icon: ChartNoAxesCombined, routes: ['/personal/progress'] },
  { to: '/personal/certificates', label: 'Chứng nhận', group: 'Kết quả', icon: Award, routes: ['/personal/certificates'] },
  { to: '/personal/subscription', label: 'Gói học & thanh toán', group: 'Tiện ích', icon: CreditCard, routes: ['/personal/subscription', '/personal/billing'] },
];

export function activePersonalItem(pathname: string) {
  return PERSONAL_NAV.find((item) => item.routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) ?? PERSONAL_NAV[0];
}

function Navigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const active = activePersonalItem(pathname);
  return <nav aria-label="Khu học tập cá nhân" className="px-2 py-2">
    <ul className="space-y-1">{PERSONAL_NAV.map((item) => {
      const Icon = item.icon;
      return <li key={item.to}>
        <Link to={item.to} onClick={onNavigate} aria-label={item.label}
          aria-current={active === item ? 'page' : undefined}
          className={cn('flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[13px] leading-snug transition-colors',
            active === item ? 'bg-pt-accent/12 font-semibold text-pt-accent' : 'text-pt-fg-2 hover:bg-pt-fg/5 hover:text-pt-fg')}>
          <Icon className="size-[18px] shrink-0" aria-hidden="true" />
          <span>{item.label}</span>
        </Link>
      </li>;
    })}</ul>
  </nav>;
}

export function PersonalSidebar({ pathname }: { pathname: string }) {
  return <aside data-testid="personal-sidebar" className="pt-workspace-sidebar hidden lg:flex" aria-label="Menu cá nhân">
    <Navigation pathname={pathname} />
  </aside>;
}

export function PersonalMobileMenu({ open, pathname, onClose }: { open: boolean; pathname: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(open, ref, onClose);
  if (!open) return null;
  return <div className="fixed inset-0 z-[80]">
    <div className="absolute inset-0 bg-black/60" aria-hidden="true" onClick={onClose} />
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Điều hướng cá nhân" tabIndex={-1} className="relative flex h-dvh w-[min(288px,90vw)] flex-col overflow-y-auto border-r border-pt-line bg-pt-panel">
      <div className="flex items-center justify-between border-b border-pt-line p-3"><span className="text-sm font-semibold">Không gian cá nhân</span><button type="button" onClick={onClose} aria-label="Đóng menu" className="grid size-11 place-items-center rounded-lg hover:bg-pt-raised"><X className="size-5" /></button></div>
      <Navigation pathname={pathname} onNavigate={onClose} />
      <div className="flex items-center justify-between border-t border-pt-line p-4 text-sm"><span>Giao diện</span><ThemeToggle /></div>
    </div>
  </div>;
}
