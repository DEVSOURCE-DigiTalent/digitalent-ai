import { create } from 'zustand';
import { useEffect } from 'react';

type Theme = 'light';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'dt-enterprise-theme';

export const useEnterpriseThemeStore = create<ThemeStore>((set) => ({
  theme: 'light',
  setTheme: () => set({ theme: 'light' }),
  toggle: () => set({ theme: 'light' }),
}));

export function useEnterpriseTheme() {
  const store = useEnterpriseThemeStore();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'light');
    } catch {
      //
    }
    const root = document.documentElement;
    root.classList.add('ent-theme');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';

    return () => {
      root.classList.remove('ent-theme');
      root.removeAttribute('data-theme');
      root.style.colorScheme = '';
    };
  }, []);

  return store;
}

