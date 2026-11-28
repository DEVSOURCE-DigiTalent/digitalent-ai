/**
 * "Back" links that return to the page that opened the current one. A page reachable from several places (Vị trí công
 * việc from Nhân sự or Khung năng lực số, a department from Nhân sự or the department list) used to lead to one fixed
 * page. The opening link passes `state={backState(path, label)}`; the opened page reads it with `backTarget`.
 */
export interface BackTarget {
  path: string;
  label: string;
}

/** Router state for a link, so the page it opens can lead back to `path` (with its filters). */
export const backState = (path: string, label: string) => ({ from: { path, label } });

/** Where "back" leads: the page named in the router state, else `fallback`. Only paths inside the enterprise portal are followed. */
export function backTarget(state: unknown, fallback: BackTarget): BackTarget {
  const from = (state as { from?: Partial<BackTarget> } | null)?.from;
  return from && typeof from.path === 'string' && from.path.startsWith('/enterprise/') && typeof from.label === 'string' && from.label
    ? { path: from.path, label: from.label }
    : fallback;
}
