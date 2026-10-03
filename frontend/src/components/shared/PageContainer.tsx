import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ContainerWidth = 'narrow' | 'default' | 'wide' | 'full';

const WIDTH_MAP: Record<ContainerWidth, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-[1200px]',
  wide: 'max-w-[1440px]',
  full: 'max-w-full',
};

interface PageContainerProps {
  width?: ContainerWidth;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps page content with consistent max-width and horizontal padding.
 * Use width="wide" for data-heavy pages (Members, Results),
 * width="narrow" for forms and detail views.
 */
export function PageContainer({ width = 'default', children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 md:px-6 lg:px-8',
        WIDTH_MAP[width],
        className,
      )}
    >
      {children}
    </div>
  );
}
