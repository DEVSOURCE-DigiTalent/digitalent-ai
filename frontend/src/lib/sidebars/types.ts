import type { LucideIcon } from 'lucide-react';

/**
 * Enterprise trial rule of a sidebar entry. Once one entry of a sidebar has a rule, a trial organization's sidebar keeps
 * every other entry visible but locked. 'open' = usable during the trial; 'only' = usable during the trial and hidden
 * once the organization uses the platform for real.
 */
export type SidebarTrialRule = 'open' | 'only';

export interface SidebarItem {
  label: string;
  screenId: string;
  icon?: LucideIcon;
  /** extra screen IDs that keep this item highlighted */
  activeFor?: string[];
  trial?: SidebarTrialRule;
}

export interface SidebarSection {
  label: string;
  icon?: LucideIcon;
  /** set when the section header itself is a link (e.g. "Tổng quan") */
  screenId?: string;
  activeFor?: string[];
  trial?: SidebarTrialRule;
  items?: SidebarItem[];
}

export type SidebarConfig = readonly SidebarSection[];
