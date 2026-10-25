import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export type SidebarVariant = 'default' | 'pulse-manager';

interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  isActive?: boolean;
  isLocked?: boolean;
  isRail?: boolean;
  href?: string;
  onClick?: () => void;
  variant?: SidebarVariant;
  dataTour?: string;
}

export function SidebarItem({ icon, label, isActive, isLocked, isRail, href, onClick, variant = 'default', dataTour }: SidebarItemProps) {
  const lockTooltip = isLocked ? `${label} (Cần nâng cấp gói để mở)` : undefined;

  const innerContent = (
    <div
      className={
        variant === 'pulse-manager'
          ? cn('pm-side-link', isActive && 'active', isRail && 'rail')
          : cn(
              'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
              isActive
                ? 'bg-[var(--ent-sidebar-active)] border-l-2 border-[var(--ent-sidebar-active-border,var(--ent-accent))] text-ent-sidebar-fg font-medium'
                : 'text-ent-sidebar-muted hover:bg-[var(--ent-sidebar-hover)] hover:text-ent-sidebar-fg',
              isRail && 'justify-center',
            )
      }
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!isRail && <span className={cn('flex-1 truncate', variant === 'default' && 'text-sm')}>{label}</span>}
      {!isRail && isLocked && (
        <Lock aria-label="Chưa có trong gói" className="w-3.5 h-3.5 ml-auto shrink-0 text-ent-sidebar-muted" />
      )}
    </div>
  );

  const sharedProps = {
    onClick,
    'aria-label': label,
    'aria-current': isActive ? ('page' as const) : undefined,
    title: isRail ? (lockTooltip ?? label) : lockTooltip,
    'data-tour': dataTour,
  };

  if (href) {
    return (
      <Link to={href} className="block outline-none" {...sharedProps}>
        {innerContent}
      </Link>
    );
  }

  return (
    <button type="button" className="w-full text-left outline-none block" {...sharedProps}>
      {innerContent}
    </button>
  );
}
