export const PLATFORM_KEY = 'digcomp_platform_v1';
export const PLATFORM_SESSION = 'digcomp_platform_session_v1';
export const uid = () => crypto.randomUUID();
export const timestamp = () => new Date().toISOString();
export const daysFromNow = days => new Date(Date.now() + days * 86400000).toISOString();
export function readPlatform() {
  const empty = { accounts: [], mail: [], invitations: [], memberships: [], orders: [], entitlements: [], audit: [] };
  try { return { ...empty, ...JSON.parse(localStorage.getItem(PLATFORM_KEY) || '{}') }; } catch { return empty; }
}
export function savePlatform(state) {
  localStorage.setItem(PLATFORM_KEY, JSON.stringify(state));
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('digcomp-platform'));
}
export function platformAudit(state, actorId, action, detail) {
  state.audit.unshift({ id: uid(), actorId, action, detail, createdAt: timestamp() });
}
export const normalizeEmail = value => String(value || '').trim().toLowerCase();
export const activeAt = value => !!value && Date.parse(value) > Date.now();
