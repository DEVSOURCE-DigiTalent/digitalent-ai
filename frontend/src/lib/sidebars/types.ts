import type { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  label: string;
  screenId: string;
  icon?: LucideIcon;
  /** extra screen IDs that keep this item highlighted */
  activeFor?: string[];
}

export interface SidebarSection {
  label: string;
  icon?: LucideIcon;
  /** set when the section header itself is a link (e.g. "Tổng quan") */
  screenId?: string;
  activeFor?: string[];
  items?: SidebarItem[];
}

export type SidebarConfig = readonly SidebarSection[];
