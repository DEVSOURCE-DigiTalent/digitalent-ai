import { useCallback, useEffect, useRef, useState } from 'react';
import { LoaderCircle, Volume2, VolumeX } from 'lucide-react';
import { LANDING_AUDIO } from '../landing-audio';

type PlaybackState = 'stopped' | 'starting' | 'playing';

const PLAYBACK_BLOCKED_MESSAGE = 'Trình duyệt chưa thể phát nhạc. Hãy thử lại.';
const LOAD_ERROR_MESSAGE = 'Không tải được nhạc nền. Trang vẫn hoạt động bình thường.';

/** Opt-in soundtrack control. Audible media never starts before a deliberate visitor action. */
export function LandingAudioControl() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playback, setPlayback] = useState<PlaybackState>('stopped');
  const [message, setMessage] = useState<string | null>(null);
  const [hasRequestedPlayback, setHasRequestedPlayback] = useState(false);
  const isPlaying = playback === 'playing';

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setPlayback('stopped');
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const pauseWhenHidden = () => {
      if (document.hidden) stop();
    };

    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      document.removeEventListener('visibilitychange', pauseWhenHidden);
      audio?.pause();
    };
  }, [stop]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || playback === 'starting') return;

    if (isPlaying) {
      stop();
      return;
    }

    setMessage(null);
    setPlayback('starting');
    setHasRequestedPlayback(true);
    audio.src = LANDING_AUDIO.src;
    audio.volume = LANDING_AUDIO.volume;

    try {
      await audio.play();
      setPlayback('playing');
    } catch {
      setPlayback('stopped');
      setMessage(PLAYBACK_BLOCKED_MESSAGE);
    }
  };

  const label = isPlaying ? 'Tắt nhạc nền' : 'Phát nhạc nền';
  const Icon = playback === 'starting' ? LoaderCircle : isPlaying ? Volume2 : VolumeX;

  return (
    <>
      <audio
        ref={audioRef}
        src={hasRequestedPlayback ? LANDING_AUDIO.src : undefined}
        preload="none"
        loop
        onPlaying={() => setPlayback('playing')}
        onPause={() => setPlayback('stopped')}
        onError={() => {
          stop();
          setMessage(LOAD_ERROR_MESSAGE);
        }}
      />
      <button
        type="button"
        onClick={() => void toggle()}
        aria-label="Nhạc nền"
        aria-pressed={isPlaying}
        aria-busy={playback === 'starting'}
        title={`${label} · ${LANDING_AUDIO.title} — ${LANDING_AUDIO.artist}`}
        className="lp-glass fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] right-4 z-50 flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full px-3.5 text-xs font-medium text-cream transition-colors hover:text-cream-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream md:right-6 [[data-theme=light]_&]:text-pt-fg [[data-theme=light]_&]:hover:text-pt-accent"
      >
        <Icon
          className={playback === 'starting' ? 'size-4 motion-safe:animate-spin' : 'size-4'}
          aria-hidden="true"
        />
        <span className="hidden sm:inline">Nhạc nền</span>
      </button>
      {message && (
        <p role="status" className="sr-only">
          {message}
        </p>
      )}
    </>
  );
}

