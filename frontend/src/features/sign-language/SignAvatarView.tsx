import { useEffect, useRef, useState } from 'react';
import { createSignAvatar, type SignAvatar } from './sign-avatar';
import { sampleClip, type MotionClip } from './sign-rig';
import { percentOf } from '@/lib/progress';
import './sign-language.css';

/** Pause between two loops of a sign, with the arms at rest, so the start of the sign reads clearly. */
const LOOP_PAUSE_MS = 700;

/**
 * The 3D avatar playing one motion clip in a loop (admin preview of a sign). Imports three.js, so pages load it with
 * React.lazy. Shows a plain message when WebGL is not available.
 */
export function SignAvatarView({ clip, playing, label, className }: {
  clip: MotionClip | null;
  playing: boolean;
  label: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatarRef = useRef<SignAvatar | null>(null);
  const timeRef = useRef(0);
  const clipRef = useRef(clip);
  const playingRef = useRef(playing);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [load, setLoad] = useState<{ loaded: number; total: number }>({ loaded: 0, total: 0 });

  clipRef.current = clip;
  playingRef.current = playing;

  useEffect(() => {
    timeRef.current = 0;
  }, [clip]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;
    let disposed = false;
    let observer: ResizeObserver | null = null;
    createSignAvatar(canvas, undefined, (loaded, total) => { if (!disposed) setLoad({ loaded, total }); })
      .then((avatar) => {
        if (disposed) {
          avatar.dispose();
          return;
        }
        avatarRef.current = avatar;
        const fit = () => avatar.resize(wrap.clientWidth, wrap.clientHeight);
        fit();
        observer = new ResizeObserver(fit);
        observer.observe(wrap);
        avatar.onFrame((deltaMs) => {
          const current = clipRef.current;
          if (!current || current.frames.length === 0) {
            avatar.setPose({});
            return;
          }
          if (playingRef.current) timeRef.current += deltaMs;
          const cycle = current.durationMs + LOOP_PAUSE_MS;
          const t = timeRef.current % cycle;
          avatar.setPose(t <= current.durationMs ? sampleClip(current, t) : {});
        });
        setState('ready');
      })
      .catch(() => {
        if (!disposed) setState('error');
      });
    return () => {
      disposed = true;
      observer?.disconnect();
      avatarRef.current?.dispose();
      avatarRef.current = null;
    };
  }, []);

  return (
    <div ref={wrapRef} className={className ? `sl-avatar ${className}` : 'sl-avatar'}>
      <canvas ref={canvasRef} role="img" aria-label={label} />
      {state === 'loading' && (
        <p className="sl-avatar-note" role="status">
          {load.total > 0 ? `Đang tải nhân vật 3D… ${percentOf(load.loaded, load.total)}%` : 'Đang tải nhân vật 3D…'}
          {load.total > 0 && (
            <span className="sl-avatar-bar" role="progressbar" aria-label="Tải nhân vật 3D" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentOf(load.loaded, load.total)}>
              <span style={{ width: `${percentOf(load.loaded, load.total)}%` }} />
            </span>
          )}
        </p>
      )}
      {state === 'error' && <p className="sl-avatar-note">Trình duyệt này không hiển thị được nhân vật 3D (cần WebGL).</p>}
    </div>
  );
}

export default SignAvatarView;
