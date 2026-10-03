import { create } from 'zustand';

type SidebarState = 'open' | 'collapsed' | 'drawer';

interface SidebarStore {
  state: SidebarState;
  isMobileOpen: boolean;
  isOpen: boolean;
  isCollapsed: boolean;
  isDrawerOpen: boolean;
  toggleCollapsed: () => void;
  toggleDrawer: () => void;
  setOpen: (isOpen: boolean) => void;
  collapse: () => void;
  expand: () => void;
  setMobileOpen: (isOpen: boolean) => void;
}

const STORAGE_KEY = 'dt-sidebar';

function getStoredDesktopPreference(): SidebarState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as SidebarState | null;
    if (stored && ['open', 'collapsed'].includes(stored)) {
      return stored;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

export function getDefaultState(): SidebarState {
  if (typeof window === 'undefined') return 'open';

  if (window.innerWidth < 768) return 'drawer';

  const stored = getStoredDesktopPreference();
  if (stored) return stored;

  if (window.innerWidth < 1280) return 'collapsed';
  return 'open';
}

function saveState(state: SidebarState) {
  try {
    if (state !== 'drawer') {
      localStorage.setItem(STORAGE_KEY, state);
    }
  } catch {
    // Ignore storage errors
  }
}

export const useSidebarState = create<SidebarStore>((set, get) => {
  const initialState = getDefaultState();

  return {
    state: initialState,
    isMobileOpen: false,

    get isOpen() {
      return get().state === 'open';
    },
    get isCollapsed() {
      return get().state === 'collapsed';
    },
    get isDrawerOpen() {
      return get().state === 'drawer';
    },

    toggleCollapsed: () => {
      set((s) => {
        const nextState = s.state === 'collapsed' ? 'open' : 'collapsed';
        saveState(nextState);
        return { state: nextState };
      });
    },

    toggleDrawer: () => {
      set((s) => ({ isMobileOpen: !s.isMobileOpen }));
    },

    setOpen: (isOpen: boolean) => {
      const nextState = isOpen ? 'open' : 'collapsed';
      saveState(nextState);
      set({ state: nextState });
    },

    collapse: () => {
      saveState('collapsed');
      set({ state: 'collapsed' });
    },

    expand: () => {
      saveState('open');
      set({ state: 'open' });
    },

    setMobileOpen: (isOpen: boolean) => {
      set({ isMobileOpen: isOpen });
    },
  };
});

// Sync sidebar state on viewport resize
if (typeof window !== 'undefined') {
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;

  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const width = window.innerWidth;
      const current = useSidebarState.getState().state;

      if (width < 768) {
        if (current !== 'drawer') {
          useSidebarState.setState({ state: 'drawer' });
        }
      } else {
        if (current === 'drawer') {
          const preferred = getStoredDesktopPreference() ?? (width < 1280 ? 'collapsed' : 'open');
          useSidebarState.setState({ state: preferred, isMobileOpen: false });
        }
      }
    }, 100);
  });
}
