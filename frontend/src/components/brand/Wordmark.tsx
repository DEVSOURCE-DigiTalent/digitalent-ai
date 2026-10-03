import { cn } from '@/lib/utils';

interface WordmarkProps {
  className?: string;
  /** Shows the mark before the name. */
  withMark?: boolean;
  /** Only the mark (collapsed sidebar, tight headers). */
  markOnly?: boolean;
  /** Use the official 3D gold emblem (defaults to true). */
  useBrandLogo?: boolean;
}

/**
 * The DigiTalent AI name, one design everywhere: "DigiTalent" set tight with a raised "AI",
 * optionally led by the official 3D golden brand emblem with subtle amber aura.
 * Size follows the font size of the parent (set it with a text-* class).
 */
export function Wordmark({ className, withMark = true, markOnly = false, useBrandLogo = false }: WordmarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-3 whitespace-nowrap leading-none text-current', className)}>
      {(withMark || markOnly) && (
        useBrandLogo ? (
          <span
            aria-hidden="true"
            className="relative flex h-[2.15em] w-auto shrink-0 items-center justify-center"
          >
            <span className="pointer-events-none absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1.5 w-full rounded-full bg-amber-400/25 blur-[3px]" />
            <img
              src="/logo.png"
              alt=""
              className="relative h-full w-auto object-contain drop-shadow-[0_2px_8px_rgba(245,180,80,0.2)]"
            />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="relative grid size-[1.45em] shrink-0 place-items-center rounded-[0.4em] bg-current"
          >
            <span className="text-[0.8em] font-semibold tracking-[-0.04em] text-[var(--wordmark-on,#111110)]">D</span>
            <span className="absolute right-[0.2em] top-[0.2em] size-[0.24em] rounded-full bg-[#7C9BE6]" />
          </span>
        )
      )}
      {markOnly ? (
        <span className="sr-only">DigiTalent AI</span>
      ) : (
        <span className="text-[1.05em] font-semibold tracking-[-0.03em] text-current">
          DigiTalent<sup className="ml-[0.16em] align-super text-[0.52em] font-medium tracking-normal opacity-70">AI</sup>
        </span>
      )}
    </span>
  );
}
