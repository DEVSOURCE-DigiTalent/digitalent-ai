import { create } from 'zustand';
import { useEffect } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  /** Khung đang hiển thị có hỗ trợ giao diện tối (false: cổng nhân viên, platform… chỉ có bản sáng). */
  supportsDark: boolean;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'dt-enterprise-theme';

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Bộ nhớ trình duyệt bị chặn: dùng mặc định.
  }
  return 'light';
}

function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Không lưu được thì vẫn đổi trong phiên hiện tại.
  }
}

export const useEnterpriseThemeStore = create<ThemeStore>((set) => ({
  theme: readStoredTheme(),
  supportsDark: false,
  setTheme: (theme) => {
    saveTheme(theme);
    set({ theme });
  },
  toggle: () =>
    set((state) => {
      const theme: Theme = state.theme === 'dark' ? 'light' : 'dark';
      saveTheme(theme);
      return { theme };
    }),
}));

/**
 * Gắn giao diện lên <html> (`.ent-theme[data-theme]`). Khung chỉ có bản sáng truyền `lightOnly`:
 * vẫn giữ lựa chọn đã lưu của người dùng nhưng hiển thị sáng và ẩn nút chuyển.
 */
export function useEnterpriseTheme({ lightOnly = false }: { lightOnly?: boolean } = {}) {
  const store = useEnterpriseThemeStore();
  const applied: Theme = lightOnly ? 'light' : store.theme;

  useEffect(() => {
    useEnterpriseThemeStore.setState({ supportsDark: !lightOnly });
    return () => useEnterpriseThemeStore.setState({ supportsDark: false });
  }, [lightOnly]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('ent-theme');
    root.setAttribute('data-theme', applied);
    root.style.colorScheme = applied;

    return () => {
      root.classList.remove('ent-theme');
      root.removeAttribute('data-theme');
      root.style.colorScheme = '';
    };
  }, [applied]);

  return store;
}
