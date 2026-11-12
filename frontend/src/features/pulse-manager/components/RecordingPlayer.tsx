import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { recordingUrl, type PulseRecording, type PulseRecordingSegment } from '@/services/pulse.service';
import { PROCTORING_EVENT_LABELS, RISK_LEVEL_LABELS, clock, formatDuration } from '@/features/pulse-employee/lib/labels';
import { ProctoringRiskPanel, RiskTag } from './ProctoringRiskPanel';

const SPEEDS = [1, 1.5, 2] as const;
/** Lệch quá ngưỡng này (giây) giữa đồng hồ phiên và video thì tua video lại. */
const DRIFT = 0.6;
/** Thời gian tối đa chờ WebM trả về duration trước khi mở đồng bộ phát. */
const PRIME_TIMEOUT_MS = 1200;

interface Span {
  segment: PulseRecordingSegment;
  url: string;
  start: number;
  end: number;
}

/** Các đoạn của một nguồn trên đồng hồ phiên (ms từ lúc bắt đầu). Đoạn chưa đóng kéo tới đoạn sau hoặc hết phiên. */
function spansOf(segments: PulseRecordingSegment[], track: PulseRecordingSegment['track'], total: number): Span[] {
  const list = segments
    .filter((s) => s.track === track && s.sizeBytes > 0)
    .sort((a, b) => a.startOffsetMs - b.startOffsetMs);
  return list.flatMap((segment, index) => {
    const url = recordingUrl(segment);
    if (!url) return [];
    const end = segment.endOffsetMs ?? list[index + 1]?.startOffsetMs ?? total;
    return end > segment.startOffsetMs ? [{ segment, url, start: segment.startOffsetMs, end: Math.min(end, total) }] : [];
  });
}

function gapsOf(spans: Span[], total: number): { start: number; end: number }[] {
  const gaps: { start: number; end: number }[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start - cursor > 500) gaps.push({ start: cursor, end: span.start });
    cursor = Math.max(cursor, span.end);
  }
  if (total - cursor > 500) gaps.push({ start: cursor, end: total });
  return gaps;
}

const activeAt = (spans: Span[], t: number) => spans.find((s) => t >= s.start && t < s.end) ?? null;

function syncVideo(
  video: HTMLVideoElement | null,
  span: Span | null,
  t: number,
  playing: boolean,
  speed: number,
  muted: boolean,
  onAutoMuted?: () => void,
) {
  if (!video || !span || video.dataset.primed !== '1') return;
  video.playbackRate = speed;
  video.muted = muted;
  const want = Math.max(0, (t - span.start) / 1000);
  if (!video.seeking && Math.abs(video.currentTime - want) > DRIFT) {
    try {
      video.currentTime = want;
    } catch {
      // Bỏ qua khi luồng chưa sẵn sàng tua
    }
  }
  if (playing && video.paused && !video.ended) {
    const playPromise = video.play() as Promise<void> | undefined;
    playPromise?.catch?.((err: unknown) => {
      const name = (err as { name?: string } | null)?.name;
      if (!video.muted && (name === 'NotAllowedError' || name === 'AbortError')) {
        video.muted = true;
        onAutoMuted?.();
        const retryPromise = video.play() as Promise<void> | undefined;
        retryPromise?.catch?.(() => undefined);
      }
    });
  }
  if (!playing && !video.paused) {
    video.pause();
  }
}

/**
 * Bản ghi bài làm có giám sát cho người chấm (MG-13): màn hình (toàn bộ) + camera kèm micro trên một đồng hồ phiên.
 * Khoảng nhân viên dừng chia sẻ hiện là khoảng trống; mỗi lần rời tab hoặc dừng chia sẻ là một mốc để tua tới.
 */
export function RecordingPlayer({ recording }: { recording: PulseRecording }) {
  const total = useMemo(() => Math.max(
    1000,
    recording.durationMs ?? 0,
    ...recording.segments.map((s) => s.endOffsetMs ?? s.startOffsetMs),
    ...recording.events.map((e) => e.offsetMs + (e.durationMs ?? 0)),
  ), [recording]);

  const screens = useMemo(() => spansOf(recording.segments, 'SCREEN', total), [recording, total]);
  const cameras = useMemo(() => spansOf(recording.segments, 'CAMERA', total), [recording, total]);
  const screenGaps = useMemo(() => gapsOf(screens, total), [screens, total]);
  const events = useMemo(() => [...recording.events].sort((a, b) => a.offsetMs - b.offsetMs), [recording]);
  const risk = recording.risk ?? null;

  // Bỏ qua độ trễ khởi tạo luồng dưới 3 giây khi bắt đầu phiên để khung hình đầu tiên hiện ngay thay vì báo trống.
  const initialStart = useMemo(() => {
    const first = screens[0];
    if (!first || first.start <= 0 || first.start > 3000) return 0;
    const hasStopAtStart = events.some((e) => e.kind === 'SHARE_STOPPED' && e.offsetMs <= first.start);
    return hasStopAtStart ? 0 : first.start;
  }, [screens, events]);

  const [t, setT] = useState(initialStart);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [muted, setMuted] = useState(false);
  const [autoMutedHint, setAutoMutedHint] = useState(false);
  const [primedCount, setPrimedCount] = useState(0);

  const [prevSessionId, setPrevSessionId] = useState(recording.sessionId);
  if (prevSessionId !== recording.sessionId) {
    setPrevSessionId(recording.sessionId);
    setT(initialStart);
    setPlaying(false);
    setAutoMutedHint(false);
  }

  const tRef = useRef(initialStart);
  const screenRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    tRef.current = initialStart;
  }, [recording.sessionId, initialStart]);

  const screen = activeAt(screens, t);
  const camera = activeAt(cameras, t);
  const screenGap = screen ? null : screenGaps.find((g) => t >= g.start && t < g.end) ?? null;

  const isCameraWarmup = useMemo(() => {
    if (camera || cameras.length === 0) return false;
    const firstCam = cameras[0]!;
    if (t >= firstCam.start || firstCam.start > 5000) return false;
    return !events.some((e) => e.kind === 'CAMERA_STOPPED' && e.offsetMs <= firstCam.start);
  }, [camera, cameras, events, t]);

  const seek = useCallback((ms: number) => {
    const next = Math.max(0, Math.min(total, ms));
    tRef.current = next;
    setT(next);
  }, [total]);

  const jumpAndPlay = useCallback((ms: number) => {
    seek(ms);
    setPlaying(true);
  }, [seek]);

  const attachPrimer = useCallback((video: HTMLVideoElement | null, span: Span | null) => {
    if (!video || !span) return undefined;
    if (video.dataset.primed === '1') {
      setPrimedCount((n) => n + 1);
      return undefined;
    }

    let settled = false;
    let fallbackTimer = 0;

    const finish = (seekToCurrent: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(fallbackTimer);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('durationchange', onDuration);
      video.removeEventListener('loadeddata', onData);
      video.removeEventListener('seeked', onSeeked);
      video.dataset.primed = '1';
      if (seekToCurrent) {
        const want = Math.max(0, (tRef.current - span.start) / 1000);
        try {
          if (Math.abs(video.currentTime - want) > 0.25) {
            video.currentTime = want;
          }
        } catch {
          // Bỏ qua nếu video chưa sẵn sàng đặt vị trí
        }
      }
      setPrimedCount((n) => n + 1);
    };

    const probeDuration = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        finish(false);
        return;
      }
      try {
        video.currentTime = 1e101;
      } catch {
        finish(false);
      }
    };

    const onDuration = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        finish(true);
      }
    };

    const onData = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        finish(true);
      }
    };

    const onSeeked = () => {
      if (Number.isFinite(video.duration) && video.duration > 0 && video.currentTime > span.end / 1000 + 10) {
        finish(true);
      }
    };

    const onMeta = () => {
      probeDuration();
    };

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('durationchange', onDuration);
    video.addEventListener('loadeddata', onData);
    video.addEventListener('seeked', onSeeked);

    if (video.readyState >= 1) {
      probeDuration();
    }

    fallbackTimer = window.setTimeout(() => {
      finish(true);
    }, PRIME_TIMEOUT_MS);

    return () => {
      window.clearTimeout(fallbackTimer);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('durationchange', onDuration);
      video.removeEventListener('loadeddata', onData);
      video.removeEventListener('seeked', onSeeked);
    };
  }, []);

  useEffect(() => attachPrimer(screenRef.current, screen), [attachPrimer, screen]);
  useEffect(() => attachPrimer(cameraRef.current, camera), [attachPrimer, camera]);

  // Đồng hồ phiên: video màn hình dẫn khi đang phát được, khoảng trống thì chạy theo đồng hồ thực.
  useEffect(() => {
    if (!playing) return undefined;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - last) * speed;
      last = now;
      let next = tRef.current + elapsed;
      const activeScreen = activeAt(screens, tRef.current);
      const video = screenRef.current;
      if (activeScreen && video && !video.error) {
        if (video.ended) {
          next = activeScreen.end;
        } else if (video.dataset.primed === '1' && !video.seeking && video.readyState >= 2 && !video.paused) {
          next = activeScreen.start + video.currentTime * 1000;
        } else if (video.readyState < 2 || video.seeking) {
          next = tRef.current;
        }
      }
      if (next >= total) {
        next = total;
        setPlaying(false);
      }
      tRef.current = next;
      setT(next);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, screens, total]);

  useEffect(() => {
    syncVideo(screenRef.current, screen, t, playing, speed, true);
    syncVideo(cameraRef.current, camera, t, playing, speed, muted, () => {
      setMuted(true);
      setAutoMutedHint(true);
    });
  }, [t, playing, speed, screen, camera, muted, primedCount]);

  if (screens.length === 0 && cameras.length === 0) {
    return (
      <div className="pu-rplayer-missing">
        Bài này không có bản ghi để xem{recording.status === 'ABANDONED' ? ' (phiên đã bị hủy)' : ''}.
      </div>
    );
  }

  const percent = (ms: number) => `${(ms / total) * 100}%`;
  const flagged = events.filter((e) => e.flagged).length;
  const current = [...events].reverse().find((e) => e.offsetMs <= t);

  const togglePlay = () => {
    if (!playing && tRef.current >= total) {
      seek(initialStart);
    }
    setPlaying((p) => !p);
  };

  return (
    <section className="pu-rplayer" aria-label="Bản ghi bài làm">
      <div className="pu-rplayer-head">
        <h3>Bản ghi màn hình, camera và micro</h3>
        <span>
          {formatDuration(recording.durationMs ?? total)} · {flagged ? `${flagged} sự kiện cần xem` : 'không có sự kiện cần xem'}
          {risk && <> · <RiskTag risk={risk} /></>}
        </span>
      </div>

      <div
        className={`pu-rplayer-stage${screen || camera ? ' is-clickable' : ''}`}
        onClick={screen || camera ? togglePlay : undefined}
        title={playing ? 'Bấm để tạm dừng video' : 'Bấm để phát video'}
      >
        {screen && (
          <video
            key={screen.segment.recordingId}
            ref={screenRef}
            className="screen"
            src={screen.url}
            preload="auto"
            playsInline
            muted
            onCanPlay={() => setPrimedCount((n) => n + 1)}
          />
        )}
        {!screen && (
          <div className="pu-rplayer-gap">
            <div>
              Màn hình không được chia sẻ
              {screenGap && (
                <small>
                  {clock(screenGap.start)} đến {clock(screenGap.end)} · bài làm bị khóa trong khoảng này
                </small>
              )}
            </div>
          </div>
        )}
        {!playing && screen && (
          <div className="pu-rplayer-stage-play" aria-hidden="true">
            <Play size={26} fill="currentColor" />
          </div>
        )}
        <div className="pu-rplayer-camera">
          {camera ? (
            <video
              key={camera.segment.recordingId}
              ref={cameraRef}
              src={camera.url}
              preload="auto"
              playsInline
              muted={muted}
              onCanPlay={() => setPrimedCount((n) => n + 1)}
            />
          ) : (
            <div className="pu-rplayer-gap">{isCameraWarmup ? 'Đang bật camera...' : 'Camera tắt'}</div>
          )}
        </div>
        <span className="pu-rplayer-time">
          {clock(t)} / {clock(total)}
        </span>
      </div>

      {autoMutedHint && (
        <p className="pu-rplayer-hint">
          <span>Trình duyệt tạm tắt âm thanh để phát video. Bấm Bật tiếng nếu cần nghe micro.</span>
        </p>
      )}

      <div className="pu-rplayer-controls">
        <button
          type="button"
          className="pu-rplayer-play"
          onClick={togglePlay}
          aria-label={playing ? 'Tạm dừng' : 'Phát'}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <span>
          {clock(t)} / {clock(total)}
        </span>
        {cameras.length > 0 && (
          <button
            type="button"
            className="pu-rplayer-mute"
            aria-pressed={muted}
            onClick={() => {
              setMuted((m) => !m);
              setAutoMutedHint(false);
            }}
          >
            {muted ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
            <span>{muted ? 'Bật tiếng' : 'Tắt tiếng'}</span>
          </button>
        )}
        <div className="pu-rplayer-speed" role="group" aria-label="Tốc độ phát">
          {SPEEDS.map((s) => (
            <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)}>
              {s}×
            </button>
          ))}
        </div>
      </div>

      <div className="pu-timeline">
        <div className="pu-timeline-track" />
        {screenGaps.map((g) => (
          <i key={g.start} className="pu-timeline-gap" style={{ left: percent(g.start), width: percent(g.end - g.start) }} />
        ))}
        <div className="pu-timeline-fill" style={{ width: percent(t) }} />
        {risk?.moments.map((m) => (
          <button
            key={`risk-${m.startMs}`}
            type="button"
            className={`pu-timeline-risk ${m.severity.toLowerCase()}`}
            style={{ left: percent(m.startMs), width: percent(Math.max(m.endMs - m.startMs, total / 200)) }}
            onClick={() => jumpAndPlay(m.startMs - 2000)}
            aria-label={`Điểm đáng ngờ lúc ${clock(m.startMs)} · ${RISK_LEVEL_LABELS[m.severity]}`}
            title={`${clock(m.startMs)} · ${m.kinds.map((k) => PROCTORING_EVENT_LABELS[k]).join(' · ')}`}
          />
        ))}
        <input
          type="range"
          min={0}
          max={total}
          step={100}
          value={t}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Vị trí trong bản ghi"
          aria-valuetext={`${clock(t)} trên ${clock(total)}`}
        />
        {events
          .filter((e) => e.kind !== 'STARTED' && e.kind !== 'SUBMITTED')
          .map((e, index) => (
            <button
              key={`${e.kind}-${e.offsetMs}-${index}`}
              type="button"
              className={`pu-timeline-mark${e.flagged ? ' flagged' : ''}`}
              style={{ left: percent(e.offsetMs) }}
              onClick={() => jumpAndPlay(e.offsetMs - 2000)}
              aria-label={`${PROCTORING_EVENT_LABELS[e.kind]} lúc ${clock(e.offsetMs)}`}
              title={`${clock(e.offsetMs)} · ${PROCTORING_EVENT_LABELS[e.kind]}`}
            />
          ))}
        <div className="pu-timeline-head" style={{ left: percent(t) }} />
      </div>

      <div className="pu-lanes" aria-hidden>
        <span>Màn hình</span>
        <div className="pu-lane screen">
          {screens.map((s) => (
            <i key={s.segment.recordingId} style={{ left: percent(s.start), width: percent(s.end - s.start) }} />
          ))}
        </div>
        <span>Camera + mic</span>
        <div className="pu-lane camera">
          {cameras.map((s) => (
            <i key={s.segment.recordingId} style={{ left: percent(s.start), width: percent(s.end - s.start) }} />
          ))}
        </div>
      </div>

      {risk && <ProctoringRiskPanel risk={risk} t={t} onSeek={jumpAndPlay} />}

      {events.length > 0 && (
        <ol className="pu-rplayer-events" aria-label="Nhật ký giám sát">
          {events.map((e, index) => (
            <li key={`${e.kind}-${e.offsetMs}-${index}`} className={e.flagged ? 'flagged' : undefined}>
              <button
                type="button"
                onClick={() => jumpAndPlay(e.offsetMs - 2000)}
                aria-current={current === e ? 'true' : undefined}
              >
                <time>{clock(e.offsetMs)}</time>
                <span className="dot" aria-hidden />
                <span className="text">
                  {PROCTORING_EVENT_LABELS[e.kind]}
                  {e.durationMs ? ` · ${formatDuration(e.durationMs)}` : ''}
                  {e.detail && e.kind !== 'FACE_CHECK_OFF' ? ` · ${e.detail}` : ''}
                </span>
                {e.flagged && <span className="tag">Cần xem</span>}
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
