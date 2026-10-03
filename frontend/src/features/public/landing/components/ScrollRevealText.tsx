import { Fragment, useEffect, useMemo, useRef } from 'react';
import { useLandingMotion } from '../landing-motion';
import { revealOpacity, revealProgress, splitRevealText } from '../reveal-text';

interface ScrollRevealTextProps {
  text: string;
  className?: string;
}

/** A paragraph whose characters brighten as it scrolls through the viewport. */
export function ScrollRevealText({ text, className }: ScrollRevealTextProps) {
  const { reduced } = useLandingMotion();
  const containerRef = useRef<HTMLParagraphElement>(null);
  const words = useMemo(() => splitRevealText(text), [text]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reduced) return;

    // Opacity is written straight to the spans: a React state update per scroll frame would re-render every character.
    const chars = Array.from(container.querySelectorAll<HTMLSpanElement>('[data-char]'));
    let frame = 0;
    let lastProgress = -1;

    const update = () => {
      frame = 0;
      const rect = container.getBoundingClientRect();
      const progress = revealProgress(rect.top, rect.height, window.innerHeight);
      if (Math.abs(progress - lastProgress) < 0.002) return;
      lastProgress = progress;
      chars.forEach((char, index) => {
        char.style.opacity = revealOpacity(progress, index, chars.length).toFixed(3);
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
      chars.forEach((char) => char.style.removeProperty('opacity'));
    };
  }, [reduced, words]);

  return (
    <p ref={containerRef} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((chars, wordIndex) => (
          <Fragment key={wordIndex}>
            <span className="whitespace-nowrap">
              {chars.map((char, charIndex) => (
                <span key={charIndex} data-char="">
                  {char}
                </span>
              ))}
            </span>
            {wordIndex < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </p>
  );
}
