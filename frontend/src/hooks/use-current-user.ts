import { create } from 'zustand';

interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  employeeId?: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  setUser: (user: CurrentUser) => void;
  clearUser: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

/**
 * Lightweight auth store for current user session.
 * Backend is the source of truth; this store reflects the last known state.
 * Used by AuthGuard, MainLayout, and feature components for RBAC decisions.
 */
export const useCurrentUser = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  clearUser: () => set({ user: null, isAuthenticated: false }),

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;
    if (user.roles.includes('SYSTEM_ADMIN')) return true;
    return user.permissions.includes(permission);
  },

  hasRole: (role: string) => {
    const { user } = get();
    if (!user) return false;
    return user.roles.includes(role);
  },
}));
