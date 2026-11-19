import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, X } from 'lucide-react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { PULSE_PATHS } from '../lib/paths';
import type { NavItem } from './PulseSidebar';

export function ManagerLearningNavigation({ items, trialLearning }: { items: NavItem[]; trialLearning: boolean }) {
  useUiLanguage();
  const { pathname } = useLocation();
  const [floating, setFloating] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const focusOnOpen = useRef(false);
  const panelId = useId();

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const observer = new IntersectionObserver(([entry]) => {
      setFloating(!entry.isIntersecting && entry.boundingClientRect.bottom <= 72);
      setOpen(false);
    }, { rootMargin: '-72px 0px 0px 0px' });
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    if (focusOnOpen.current) dockRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    focusOnOpen.current = false;
    const dismiss = (event: PointerEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const links = items.map((item) => {
    const Icon = item.icon;
    const label = trialLearning && item.to === PULSE_PATHS.path ? 'Học thử' : item.label;
    const active = item.match.some((prefix) => item.end ? pathname === prefix : pathname === prefix || pathname.startsWith(`${prefix}/`));
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        data-tour={`side-${item.screenId}`}
        aria-label={translateUi(label)}
        aria-current={active ? 'page' : undefined}
        className={`pu-learning-nav__link${active ? ' is-active' : ''}`}
        onClick={() => setOpen(false)}
      >
        <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
        <span>{translateUi(label)}</span>
      </NavLink>
    );
  });

  return (
    <>
      <div ref={anchorRef} className="pu-learning-nav-anchor">
        <aside className="pu-learning-nav" aria-label={translateUi('Học tập của tôi')} inert={floating} aria-hidden={floating}>
          <span className="pu-learning-nav__identity"><BookOpen size={17} aria-hidden="true" />{translateUi('Học tập của tôi')}</span>
          <nav aria-label={translateUi('Điều hướng học tập')}>{links}</nav>
        </aside>
      </div>
      {floating && createPortal(
        <div
          ref={dockRef}
          className="pu-learning-dock"
          onPointerEnter={(event) => { if (event.pointerType === 'mouse') setOpen(true); }}
          onPointerLeave={(event) => { if (event.pointerType === 'mouse') setOpen(false); }}
        >
          <button
            ref={triggerRef}
            type="button"
            className={`pu-learning-dock__trigger${open ? ' is-open' : ''}`}
            aria-label={translateUi(open ? 'Đóng điều hướng học tập' : 'Mở điều hướng học tập')}
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            title={translateUi('Học tập của tôi')}
            onClick={() => { focusOnOpen.current = true; setOpen((value) => !value); }}
          >
            {open ? <X size={20} /> : <BookOpen size={21} />}
          </button>
          {open && <nav id={panelId} className="pu-learning-dock__panel" aria-label={translateUi('Điều hướng học tập')}>{links}</nav>}
        </div>, document.body,
      )}
    </>
  );
}
