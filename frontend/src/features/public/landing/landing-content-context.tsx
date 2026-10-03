import { createContext, useContext, type ReactNode } from 'react';
import type { LandingContent } from './landing-content';
import { ENTERPRISE_CONTENT } from './landing-variants';

const LandingContentContext = createContext<LandingContent>(ENTERPRISE_CONTENT);

interface LandingContentProviderProps {
  content: LandingContent;
  children: ReactNode;
}

/** Hands the copy of one product (enterprise or individual) to every section of the landing page. */
export function LandingContentProvider({ content, children }: LandingContentProviderProps) {
  return <LandingContentContext.Provider value={content}>{children}</LandingContentContext.Provider>;
}

export function useLandingContent(): LandingContent {
  return useContext(LandingContentContext);
}
