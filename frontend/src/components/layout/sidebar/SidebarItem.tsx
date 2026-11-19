import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export type SidebarVariant = 'default' | 'pulse-manager';

interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  isActive?: boolean;
  isLocked?: boolean;
  /** plan = the plan lacks the feature (still a link, to the upgrade page); trial = closed during the enterprise trial. */
  lockReason?: 'plan' | 'trial';
  isRail?: boolean;
  href?: string;
  onClick?: () => void;
  variant?: SidebarVariant;
  dataTour?: string;
}

export function SidebarItem({ icon, label, isActive, isLocked, lockReason = 'plan', isRail, href, onClick, variant = 'default', dataTour }: SidebarItemProps) {
  useUiLanguage();
  if (isLocked && lockReason === 'trial') {
    return <TrialLockedItem icon={icon} label={label} isRail={isRail} variant={variant} dataTour={dataTour} />;
  }
  const lockTooltip = isLocked ? `${label} (Cần nâng cấp gói để mở)` : undefined;

  const innerContent = <ItemContent icon={icon} label={label} isActive={isActive} isLocked={isLocked} isRail={isRail} variant={variant} />;

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

function ItemContent({ icon, label, isActive, isLocked, isRail, variant, muted }: {
  icon?: ReactNode;
  label: string;
  isActive?: boolean;
  isLocked?: boolean;
  isRail?: boolean;
  variant: SidebarVariant;
  muted?: boolean;
}) {
  useUiLanguage();
  return (
    <div
      className={
        variant === 'pulse-manager'
          ? cn('pm-side-link', isActive && 'active', isRail && 'rail', muted && 'opacity-55')
          : cn(
              'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
              muted
                ? 'text-ent-sidebar-muted opacity-55'
                : isActive
                  ? 'bg-[var(--ent-sidebar-active)] border-l-2 border-[var(--ent-sidebar-active-border,var(--ent-accent))] text-ent-sidebar-fg font-medium'
                  : 'text-ent-sidebar-muted hover:bg-[var(--ent-sidebar-hover)] hover:text-ent-sidebar-fg',
              isRail && 'justify-center',
            )
      }
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!isRail && <span className={cn('flex-1 min-w-0 whitespace-normal leading-snug', variant === 'default' && 'text-sm')}>{translateUi(label)}</span>}
      {!isRail && isLocked && (
        <Lock aria-label={translateUi(muted ? 'Chưa mở trong bản dùng thử' : 'Chưa có trong gói')} className="w-3.5 h-3.5 ml-auto shrink-0 text-ent-sidebar-muted" />
      )}
    </div>
  );
}

const TIP_WIDTH = 252;

/**
 * An item closed during the enterprise trial: still listed so the owner sees what the platform has, but not a link.
 * Hover, focus or tap shows why (fixed tooltip in a portal, so the scrolling sidebar does not clip it).
 */
function TrialLockedItem({ icon, label, isRail, variant, dataTour }: {
  icon?: ReactNode;
  label: string;
  isRail?: boolean;
  variant: SidebarVariant;
  dataTour?: string;
}) {
  useUiLanguage();
  const anchor = useRef<HTMLDivElement>(null);
  const tipId = useId();
  const [tip, setTip] = useState<{ top: number; left: number; below: boolean } | null>(null);
  const show = () => {
    const rect = anchor.current?.getBoundingClientRect();
    if (!rect) return;
    // Beside the item when there is room (desktop sidebar), under it otherwise (mobile drawer).
    const below = rect.right + 12 + TIP_WIDTH > window.innerWidth;
    setTip(below
      ? { top: rect.bottom + 6, left: Math.max(8, Math.min(rect.left + 8, window.innerWidth - TIP_WIDTH - 8)), below }
      : { top: rect.top + rect.height / 2, left: rect.right + 10, below });
  };
  const hide = () => setTip(null);

  return (
    <>
      <div
        ref={anchor}
        role="link"
        aria-disabled="true"
        tabIndex={0}
        aria-label={`${translateUi(label)} (${translateUi('chưa mở trong bản dùng thử')})`}
        aria-describedby={tip ? tipId : undefined}
        data-tour={dataTour}
        data-locked="trial"
        className="block cursor-not-allowed rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--ent-accent)]"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(event) => { event.preventDefault(); if (tip) hide(); else show(); }}
        onKeyDown={(event) => { if (event.key === 'Escape') hide(); }}
      >
        <ItemContent icon={icon} label={label} isLocked isRail={isRail} variant={variant} muted />
      </div>
      {tip && createPortal(
        <div
          id={tipId}
          role="tooltip"
          className="pointer-events-none fixed z-[1000] grid gap-1 rounded-xl border border-ent-line bg-ent-raised p-3 text-[12.5px] leading-snug text-ent-fg shadow-xl"
          style={{ top: tip.top, left: tip.left, width: TIP_WIDTH, transform: tip.below ? undefined : 'translateY(-50%)' }}
        >
          <strong className="inline-flex items-center gap-1.5 text-[13px] font-bold">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />{translateUi('Chưa mở trong bản dùng thử')}
          </strong>
          <span className="opacity-80">
            {translateUi('Bản dùng thử có Khảo sát năng lực số, Khung năng lực số và Khóa học.')}{' '}
            {translateUi(`${label} mở khi doanh nghiệp mua khóa học đầu tiên.`)}
          </span>
        </div>,
        document.body,
      )}
    </>
  );
}
