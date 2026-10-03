import { Pause, Play } from 'lucide-react';
import { useLandingMotion } from '../landing-motion';

/** One control stops every moving background on the page (WCAG 2.2.2 Pause, Stop, Hide). */
export function MotionToggle() {
  const { paused, togglePaused } = useLandingMotion();
  const Icon = paused ? Play : Pause;

  return (
    <button
      type="button"
      onClick={togglePaused}
      aria-label={paused ? 'Phát chuyển động nền' : 'Tạm dừng chuyển động nền'}
      title={paused ? 'Phát chuyển động nền' : 'Tạm dừng chuyển động nền'}
      className="lp-glass grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-cream"
    >
      <Icon className="size-4" fill="currentColor" aria-hidden="true" />
    </button>
  );
}
