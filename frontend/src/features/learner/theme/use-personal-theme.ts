import { create } from 'zustand';

export type PersonalTheme = 'dark' | 'light';

const STORAGE_KEY = 'dt-personal-theme';

/** Background behind the page (overscroll), per theme; matches --ind-bg / --pt-bg. */
export const PERSONAL_THEME_BACKGROUND: Record<PersonalTheme, string> = {
  dark: '#07151b',
  light: '#f3f8f7',
};

/**
 * The same, for the public pages of the individual product (pricing, sign-up, trial, careers): their light theme is
 * the softer misty grey-teal of the login page instead of near-white (see .pt-soft in personal-theme.css).
 */
export const PERSONAL_PUBLIC_BACKGROUND: Record<PersonalTheme, string> = {
  dark: '#07151b',
  light: '#DEE7E4',
};

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

/** Theme of the personal workspace: dark (Digital Dawn) by default, light (Daybreak) on request; remembered on this device. */
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
