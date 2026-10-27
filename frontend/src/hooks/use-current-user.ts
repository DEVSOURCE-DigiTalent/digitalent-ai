import { create } from 'zustand';
import { ROLES, WORKSPACES, inferWorkspace, normalizeRoles, resolveWorkspace } from '../lib/roles';
import type { SessionUser, SubscriptionStatus } from '../types/session';

export type CurrentUser = SessionUser;

interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  setUser: (user: SessionUser) => void;
  clearUser: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  /**
   * True when the plan includes the feature. Unrestricted while the backend sends no subscription.
   * TODO: fail closed once the backend always sends `subscription`; the API must enforce plans regardless.
   */
  hasEntitlement: (entitlement: string) => boolean;
  /** Subscription state, or `null` when there is none to enforce (platform staff or legacy backend). */
  getSubscriptionStatus: () => SubscriptionStatus | null;
}

/**
 * Lightweight auth store for current user session.
 * Backend is the source of truth; this store reflects the last known state.
 * Used by AuthGuard, layouts, and feature components for RBAC and entitlement decisions.
 */
export const useCurrentUser = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  setUser: (incoming) => {
    const roles = normalizeRoles(incoming.roles);
    // A user with backend roles is never "personal", even if none maps to the new model; and a platform
    // workspace is only honoured for platform staff.
    const claimed = incoming.workspace === 'platform' && !roles.includes(ROLES.PLATFORM_ADMIN) ? undefined : incoming.workspace;
    const workspace = claimed ?? (incoming.roles.length > 0 && roles.length === 0 ? WORKSPACES.ENTERPRISE : inferWorkspace(roles));
    set({ user: { ...incoming, roles, workspace }, isAuthenticated: true });
  },

  clearUser: () => set({ user: null, isAuthenticated: false }),

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;
    return user.permissions.includes(permission);
  },

  hasRole: (role: string) => {
    const { user } = get();
    if (!user) return false;
    return user.roles.includes(role);
  },

  hasEntitlement: (entitlement: string) => {
    const { user } = get();
    if (!user) return false;
    if (resolveWorkspace(user) === WORKSPACES.PLATFORM || !user.subscription) return true;
    return user.subscription.entitlements.includes(entitlement);
  },

  getSubscriptionStatus: () => {
    const { user } = get();
    if (!user || resolveWorkspace(user) === WORKSPACES.PLATFORM || !user.subscription) return null;
    return user.subscription.status;
  },
}));
