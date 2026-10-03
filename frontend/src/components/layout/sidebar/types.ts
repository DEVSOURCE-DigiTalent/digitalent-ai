import type { ReactNode } from 'react';

export interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  isActive?: boolean;
  isLocked?: boolean;
  isRail?: boolean;
  href?: string;
  onClick?: () => void;
}

export interface SidebarGroupProps {
  title?: string;
  items: SidebarItemProps[];
}
