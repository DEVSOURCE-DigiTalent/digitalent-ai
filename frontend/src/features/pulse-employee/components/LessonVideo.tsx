import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { HandMetal } from 'lucide-react';
import { lessonMediaUrl, type LessonSignVideo } from '@/types/learning-content';

/** The learner's choice of sign language, kept for the next videos. */
const SIGN_PREFERENCE_KEY = 'dt-sign-video';
/** A signer track this far from the lesson video is put back in step. */
const MAX_DRIFT_SECONDS = 0.25;

function readSignPreference() {
  try {
    return window.localStorage.getItem(SIGN_PREFERENCE_KEY) === 'on';
  } catch {
    return false;
  }
}

function saveSignPreference(on: boolean) {
  try {
    window.localStorage.setItem(SIGN_PREFERENCE_KEY, on ? 'on' : 'off');
  } catch {
    // Private mode: the choice lasts for this page only.
  }
}

/**
 * A lesson video and, when published, its sign-language video for learners who are deaf
 * (docs/specs/2026-11-24-sign-language-video.md): "Ngôn ngữ ký hiệu" switches to the lesson video with the signer
 * (same time, same play state), or shows the signer track over the video in step with it. Without a sign-language
 * video it is a plain video. No text captions: the transcript only serves to make the sign-language video.
 */
export function LessonVideo({ src, signVideo, title, className }: {
  src: string;
  signVideo?: LessonSignVideo | null;
  title: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const signRef = useRef<HTMLVideoElement>(null);
  const resume = useRef<{ time: number; paused: boolean; rate: number } | null>(null);
  const [signOn, setSignOn] = useState(() => Boolean(signVideo) && readSignPreference());

  const signing = Boolean(signVideo) && signOn;
  const signSrc = signVideo ? lessonMediaUrl(signVideo.url) : null;
  const swapsSource = signing && signVideo!.mode !== 'TRACK_ONLY';
  const playingSrc = swapsSource && signSrc ? signSrc : src;

  // Signer track (TRACK_ONLY): follows the lesson video — play, pause, seek, speed — and is put back in step.
  useEffect(() => {
    const main = videoRef.current;
    const sign = signRef.current;
    if (!signing || swapsSource || !main || !sign) return;
    const sync = () => {
      if (Math.abs(sign.currentTime - main.currentTime) > MAX_DRIFT_SECONDS) sign.currentTime = main.currentTime;
      if (sign.playbackRate !== main.playbackRate) sign.playbackRate = main.playbackRate;
    };
    const play = () => {
      sync();
      void sign.play?.()?.catch(() => undefined);
    };
    const pause = () => sign.pause?.();
    sync();
    if (!main.paused) play();
    main.addEventListener('play', play);
    main.addEventListener('pause', pause);
    main.addEventListener('seeked', sync);
    main.addEventListener('ratechange', sync);
    main.addEventListener('timeupdate', sync);
    return () => {
      main.removeEventListener('play', play);
      main.removeEventListener('pause', pause);
      main.removeEventListener('seeked', sync);
      main.removeEventListener('ratechange', sync);
      main.removeEventListener('timeupdate', sync);
    };
  }, [signing, swapsSource, signSrc]);

  const toggleSign = () => {
    const video = videoRef.current;
    if (video && signVideo && signVideo.mode !== 'TRACK_ONLY') {
      // The source changes: carry on from the same moment, in the same state.
      resume.current = { time: video.currentTime, paused: video.paused, rate: video.playbackRate };
    }
    setSignOn((on) => {
      saveSignPreference(!on);
      return !on;
    });
  };

  const onLoaded = (event: SyntheticEvent<HTMLVideoElement>) => {
    const state = resume.current;
    if (!state) return;
    resume.current = null;
    const video = event.currentTarget;
    video.currentTime = state.time;
    video.playbackRate = state.rate;
    if (!state.paused) void video.play?.()?.catch(() => undefined);
  };

  return (
    <div className={className ? `pu-cv ${className}` : 'pu-cv'}>
      <div className="pu-video-player-container pu-cv-stage">
        <video
          ref={videoRef}
          key={playingSrc}
          controls
          preload="metadata"
          playsInline
          src={playingSrc}
          className="pu-active-video-element"
          aria-label={swapsSource ? `Video bài giảng có ngôn ngữ ký hiệu: ${title}` : `Video bài giảng: ${title}`}
          onLoadedMetadata={onLoaded}
        />
        {signing && !swapsSource && signSrc && (
          <video
            ref={signRef}
            className="pu-cv-sign"
            src={signSrc}
            muted
            playsInline
            preload="auto"
            aria-label="Người ra dấu ngôn ngữ ký hiệu"
          />
        )}
      </div>
      {signVideo && (
        <div className="pu-cv-bar">
          <span className="pu-cv-badges">
            <span className="pu-cv-badge">
              <HandMetal size={15} aria-hidden="true" />
              Có ngôn ngữ ký hiệu
            </span>
          </span>
          <span className="pu-cv-actions">
            <button type="button" className="pu-cv-toggle" aria-pressed={signOn} onClick={toggleSign}>
              <HandMetal size={15} aria-hidden="true" />
              Ngôn ngữ ký hiệu: {signOn ? 'Bật' : 'Tắt'}
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
