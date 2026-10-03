import { create } from 'zustand';

export type PersonalTheme = 'dark' | 'light';

const STORAGE_KEY = 'dt-personal-theme';

/** Background behind the page (overscroll), per theme; matches --pt-bg. */
export const PERSONAL_THEME_BACKGROUND: Record<PersonalTheme, string> = { dark: '#000', light: '#f2efe4' };

function readTheme(): PersonalTheme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

interface PersonalThemeState {
  theme: PersonalTheme;
  setTheme: (theme: PersonalTheme) => void;
  toggle: () => void;
}

/** Theme of the personal workspace: dark by default, light on request; remembered on this device. */
export const usePersonalTheme = create<PersonalThemeState>((set, get) => ({
  theme: readTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Blocked storage: the choice lasts for this visit only.
    }
    set({ theme });
  },
  toggle: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}));
