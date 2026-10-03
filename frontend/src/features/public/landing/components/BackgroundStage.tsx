import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { createBokehScene, type BokehScene, type BokehSceneName } from '../bokeh-scene';
import type { BackgroundVideo } from '../landing-content';
import { useLandingMotion } from '../landing-motion';
import { useInView } from '../hooks/use-in-view';

interface BackgroundStageProps {
  scene: BokehSceneName;
  seed: number;
  video?: BackgroundVideo;
}

/**
 * Fills its (relative, overflow-hidden) parent with a background video over a canvas scene.
 * The video loads only near the viewport and while motion is allowed; the canvas stops once it plays.
 */
export function BackgroundStage({ scene, seed, video }: BackgroundStageProps) {
  const { paused } = useLandingMotion();
  const [stageRef, isNearViewport] = useInView<HTMLDivElement>({ rootMargin: '200px 0px', once: false });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BokehScene | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoRequested, setIsVideoRequested] = useState(false);
  // Playing drives the canvas; a shown frame keeps a paused video visible instead of swapping back to the canvas.
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [hasVideoFrame, setHasVideoFrame] = useState(false);

  const videoSrc = video?.src;
  const shouldPlay = isNearViewport && !paused;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bokeh = createBokehScene(canvas, scene, seed);
    if (!bokeh) return;
    sceneRef.current = bokeh;
    bokeh.resize();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => bokeh.resize());
    observer?.observe(canvas);
    return () => {
      observer?.disconnect();
      bokeh.dispose();
      sceneRef.current = null;
    };
  }, [scene, seed]);

  useEffect(() => {
    sceneRef.current?.setRunning(shouldPlay && !isVideoPlaying);
  }, [shouldPlay, isVideoPlaying]);

  useEffect(() => {
    if (videoSrc && shouldPlay) setIsVideoRequested(true);
  }, [videoSrc, shouldPlay]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !isVideoRequested) return;
    if (shouldPlay) {
      // Autoplay can be refused (e.g. power saving): hide the video so the animated canvas shows instead.
      // Promise.resolve: play() returns undefined in older engines.
      Promise.resolve(element.play()).catch(() => setHasVideoFrame(false));
    } else {
      element.pause();
    }
  }, [shouldPlay, isVideoRequested]);

  return (
    <div ref={stageRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      {videoSrc && (
        <video
          ref={videoRef}
          src={isVideoRequested ? videoSrc : undefined}
          poster={video.poster}
          muted
          loop
          playsInline
          preload="none"
          data-zoom={video.zoom}
          style={video.zoom ? { transform: `scale(${video.zoom})`, transformOrigin: video.origin ?? 'center' } : undefined}
          onPlaying={() => {
            setIsVideoPlaying(true);
            setHasVideoFrame(true);
          }}
          onPause={() => setIsVideoPlaying(false)}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-1000',
            hasVideoFrame || video.poster ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
}
