import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePersonalTheme } from '../theme/use-personal-theme';

/** Switches the personal workspace between the dark (default) and the light theme. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = usePersonalTheme((state) => state.theme);
  const toggle = usePersonalTheme((state) => state.toggle);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!isDark}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
      className={cn(
        'relative inline-flex h-9 w-[68px] shrink-0 items-center rounded-full border border-pt-line bg-pt-raised/60 p-1 transition-colors hover:border-pt-fg/40',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1 size-7 rounded-full bg-pt-accent shadow-sm transition-transform duration-300 ease-cinematic',
          isDark ? 'translate-x-0' : 'translate-x-[32px]',
        )}
      />
      <Moon aria-hidden="true" className={cn('relative z-10 mx-1.5 size-4 transition-colors', isDark ? 'text-pt-on-accent' : 'text-pt-fg-3')} />
      <Sun aria-hidden="true" className={cn('relative z-10 ml-auto mr-1.5 size-4 transition-colors', isDark ? 'text-pt-fg-3' : 'text-pt-on-accent')} />
    </button>
  );
}
