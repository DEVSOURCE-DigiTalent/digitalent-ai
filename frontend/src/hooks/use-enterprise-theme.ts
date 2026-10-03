import { create } from 'zustand';
import { useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'dt-enterprise-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    //
  }
  return 'dark'; // Default as per specs
}

export const useEnterpriseThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      //
    }
    set({ theme });
  },
  toggle: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      //
    }
    return { theme: nextTheme };
  }),
}));

export function useEnterpriseTheme() {
  const store = useEnterpriseThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('ent-theme');
    root.setAttribute('data-theme', store.theme);
    root.style.colorScheme = store.theme;

    return () => {
      root.classList.remove('ent-theme');
      root.removeAttribute('data-theme');
      root.style.colorScheme = '';
    };
  }, [store.theme]);

  return store;
}
