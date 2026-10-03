
export type ScreenPriority = 'P0' | 'P1' | 'P2';

/** One screen of the UI/UX spec. The router is built from these entries. */
export interface ScreenDef {
  /** Spec ID, e.g. OW-01, MG-01, EM-01, PA-01. */
  id: string;
  /** Spec aliases for shared screens (e.g. OW-35 with alias MG-08). */
  aliases?: string[];
  title: string;
  /** Absolute path, unique per portal. */
  path: string;
  /** Roles allowed in; `['*']` means every signed-in user of the portal. */
  roles: string[];
  /** Permission key the page needs on top of the role (hidden / forbidden without it). */
  permission?: string;
  /** Plan feature the page needs (locked in the menu, "feature unavailable" in the route). */
  entitlement?: string;
  /** Stays reachable while the subscription is expired (billing, account, notifications). */
  allowUnpaid?: boolean;
  priority: ScreenPriority;
  status?: 'ACTIVE' | 'RETIRED';
}
