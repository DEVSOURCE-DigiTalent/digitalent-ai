import { createContext, useContext } from 'react';

export interface LandingMotion {
  /** The visitor asked for reduced motion: no entrance animations, no smooth scrolling. */
  reduced: boolean;
  /** Background videos and canvas scenes are stopped (starts true with reduced motion). */
  paused: boolean;
  togglePaused: () => void;
}

export const LandingMotionContext = createContext<LandingMotion | null>(null);

export function useLandingMotion(): LandingMotion {
  const motion = useContext(LandingMotionContext);
  if (!motion) throw new Error('useLandingMotion must be used inside LandingMotionProvider');
  return motion;
}
