import { createContext, useContext, useEffect } from 'react';

export const PersonalFocusContext = createContext<((active: boolean) => void) | null>(null);

/** Temporarily focus the shell without changing the saved navigation preference. */
export function usePersonalFocus(active: boolean) {
  const setFocus = useContext(PersonalFocusContext);
  useEffect(() => {
    setFocus?.(active);
    return () => setFocus?.(false);
  }, [active, setFocus]);
}
