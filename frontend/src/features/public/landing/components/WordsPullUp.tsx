import { Fragment, useMemo, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { TextSegment } from '../landing-content';
import { useInView } from '../hooks/use-in-view';

interface WordsPullUpProps {
  segments: TextSegment[];
  className?: string;
  /** Offset of the stagger, to chain several lines. */
  startIndex?: number;
}

/**
 * Words slide up one after another when the text enters the viewport. Screen readers get the
 * sentence once from a visually hidden copy; the animated words are aria-hidden.
 */
export function WordsPullUp({ segments, className, startIndex = 0 }: WordsPullUpProps) {
  const [ref, inView] = useInView<HTMLSpanElement>({ rootMargin: '0px 0px -100px 0px' });

  const words = useMemo(
    () => segments.flatMap((segment) => segment.text.trim().split(/\s+/).map((word) => ({ word, className: segment.className }))),
    [segments]
  );
  const sentence = segments.map((segment) => segment.text.trim()).join(' ');

  return (
    <span ref={ref} className={className} data-in={inView || undefined}>
      <span className="sr-only">{sentence}</span>
      <span aria-hidden="true">
        {words.map(({ word, className: wordClass }, index) => (
          <Fragment key={index}>
            <span className={cn('lp-word', wordClass)} style={{ '--i': startIndex + index } as CSSProperties}>
              {word}
            </span>{' '}
          </Fragment>
        ))}
      </span>
    </span>
  );
}
