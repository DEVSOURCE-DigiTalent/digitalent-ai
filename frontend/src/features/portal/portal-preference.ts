/** The product a visitor chose on the portal selector, remembered so the choice is asked once (spec section 2). */
export type PortalChoice = 'enterprise' | 'individual';

const STORAGE_KEY = 'dt-portal';

export const PORTAL_HOME: Record<PortalChoice, string> = {
  enterprise: '/business',
  individual: '/individual',
};

export function getPortalChoice(): PortalChoice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'enterprise' || value === 'individual' ? value : null;
  } catch {
    return null;
  }
}

export function rememberPortalChoice(choice: PortalChoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Private mode or blocked storage: the selector simply shows again next time.
  }
}
