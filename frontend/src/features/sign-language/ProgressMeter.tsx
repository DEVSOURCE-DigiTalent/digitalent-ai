import { useEffect, useState } from 'react';
import { remainingLabel } from '@/lib/progress';
import './sign-language.css';

/**
 * One long wait of the sign-language tools: what is happening, how far (percent and bar), what exactly (detail) and how
 * long is left (estimated from the speed so far, refreshed every second). "Dừng" when the work can be stopped.
 */
export function ProgressMeter({ label, percent, detail, startedAt, onStop, className }: {
  label: string;
  percent: number;
  detail?: string | null;
  /** When the wait started (ms or ISO): the time left is estimated from it. */
  startedAt: number | string | null;
  onStop?: () => void;
  className?: string;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const value = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div className={className ? `sl-progress ${className}` : 'sl-progress'}>
      <div className="sl-progress-head">
        <span className="sl-progress-label">{label}</span>
        <strong className="sl-progress-pct">{value}%</strong>
        {onStop && <button type="button" className="btn btn-ghost btn-small sl-progress-stop" onClick={onStop}>Dừng</button>}
      </div>
      <div className="sl-progress-bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-valuetext={`${value}%`}>
        <span style={{ width: `${value}%` }} />
      </div>
      <p className="sl-progress-foot">
        {detail && <span className="sl-progress-detail">{detail}</span>}
        <span className="sl-progress-eta">{remainingLabel(startedAt, value, now)}</span>
      </p>
    </div>
  );
}
