import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { recordingUrl, type PulseRecording, type PulseRecordingSegment } from '@/services/pulse.service';
import { PROCTORING_EVENT_LABELS, clock, formatDuration } from '@/features/pulse-employee/lib/labels';

const SPEEDS = [1, 1.5, 2] as const;
/** Lệch quá ngưỡng này (giây) giữa đồng hồ phiên và video thì tua video lại. */
const DRIFT = 0.6;

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

/**
 * WebM của MediaRecorder không ghi thời lượng nên trình duyệt không tua được. Tua tới cuối một lần để trình duyệt đọc ra
 * thời lượng, rồi mới cho đồng bộ (data-primed).
 */
function prime(video: HTMLVideoElement, onReady: () => void) {
  if (Number.isFinite(video.duration)) {
    video.dataset.primed = '1';
    onReady();
    return;
  }
  const done = () => {
    if (!Number.isFinite(video.duration)) return;
    video.removeEventListener('durationchange', done);
    video.dataset.primed = '1';
    video.currentTime = 0;
    onReady();
  };
  video.addEventListener('durationchange', done);
  video.currentTime = 1e101;
}

function sync(video: HTMLVideoElement | null, span: Span | null, t: number, playing: boolean, speed: number) {
  if (!video || !span || video.dataset.primed !== '1') return;
  video.playbackRate = speed;
  const want = Math.max(0, (t - span.start) / 1000);
  if (!video.seeking && Math.abs(video.currentTime - want) > DRIFT) video.currentTime = want;
  if (playing && video.paused && !video.ended) video.play().catch(() => undefined);
  if (!playing && !video.paused) video.pause();
}

/**
 * Bản ghi bài làm có giám sát cho người chấm (MG-13): màn hình (toàn bộ) + camera kèm micro trên một đồng hồ phiên.
 * Khoảng nhân viên dừng chia sẻ hiện là khoảng trống; mỗi lần rời tab / dừng chia sẻ là một mốc để tua tới.
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

  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [primedCount, setPrimedCount] = useState(0);
  const tRef = useRef(0);
  const screenRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);

  const screen = activeAt(screens, t);
  const camera = activeAt(cameras, t);
  const screenGap = screen ? null : screenGaps.find((g) => t >= g.start && t < g.end) ?? null;

  const seek = (ms: number) => {
    const next = Math.max(0, Math.min(total, ms));
    tRef.current = next;
    setT(next);
  };

  // Đồng hồ phiên: video màn hình dẫn khi đang phát được, khoảng trống thì chạy theo đồng hồ thường.
  useEffect(() => {
    if (!playing) return undefined;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - last) * speed;
      last = now;
      let next = tRef.current + elapsed;
      const span = activeAt(screens, tRef.current);
      const video = screenRef.current;
      if (span && video && !video.error) {
        if (video.ended) next = span.end;
        else if (video.dataset.primed !== '1' || video.seeking || video.readyState < 2) next = tRef.current;
        else next = span.start + video.currentTime * 1000;
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
    sync(screenRef.current, screen, t, playing, speed);
    sync(cameraRef.current, camera, t, playing, speed);
  }, [t, playing, speed, screen, camera, primedCount]);

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
    if (!playing && tRef.current >= total) seek(0);
    setPlaying((p) => !p);
  };

  return (
    <section className="pu-rplayer" aria-label="Bản ghi bài làm">
      <div className="pu-rplayer-head">
        <h3>Bản ghi màn hình, camera và micro</h3>
        <span>
          {formatDuration(recording.durationMs ?? total)} · {flagged ? `${flagged} sự kiện cần xem` : 'không có sự kiện cần xem'}
        </span>
      </div>

      <div className="pu-rplayer-stage">
        {screen && (
          <video
            key={screen.segment.recordingId}
            ref={screenRef}
            className="screen"
            src={screen.url}
            preload="auto"
            playsInline
            muted
            onLoadedMetadata={(e) => prime(e.currentTarget, () => setPrimedCount((n) => n + 1))}
          />
        )}
        {!screen && (
          <div className="pu-rplayer-gap">
            <div>
              Màn hình không được chia sẻ
              {screenGap && <small>{clock(screenGap.start)} – {clock(screenGap.end)} · bài làm bị khóa trong khoảng này</small>}
            </div>
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
              onLoadedMetadata={(e) => prime(e.currentTarget, () => setPrimedCount((n) => n + 1))}
            />
          ) : (
            <div className="pu-rplayer-gap">Camera tắt</div>
          )}
        </div>
        <span className="pu-rplayer-time">{clock(t)} / {clock(total)}</span>
      </div>

      <div className="pu-rplayer-controls">
        <button type="button" className="pu-rplayer-play" onClick={togglePlay} aria-label={playing ? 'Tạm dừng' : 'Phát'}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <span>{clock(t)} / {clock(total)}</span>
        <div className="pu-rplayer-speed" role="group" aria-label="Tốc độ phát">
          {SPEEDS.map((s) => (
            <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)}>{s}×</button>
          ))}
        </div>
      </div>

      <div className="pu-timeline">
        <div className="pu-timeline-track" />
        {screenGaps.map((g) => (
          <i key={g.start} className="pu-timeline-gap" style={{ left: percent(g.start), width: percent(g.end - g.start) }} />
        ))}
        <div className="pu-timeline-fill" style={{ width: percent(t) }} />
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
        {events.filter((e) => e.kind !== 'STARTED' && e.kind !== 'SUBMITTED').map((e, index) => (
          <button
            key={`${e.kind}-${e.offsetMs}-${index}`}
            type="button"
            className={`pu-timeline-mark${e.flagged ? ' flagged' : ''}`}
            style={{ left: percent(e.offsetMs) }}
            onClick={() => seek(e.offsetMs - 2000)}
            aria-label={`${PROCTORING_EVENT_LABELS[e.kind]} lúc ${clock(e.offsetMs)}`}
            title={`${clock(e.offsetMs)} · ${PROCTORING_EVENT_LABELS[e.kind]}`}
          />
        ))}
        <div className="pu-timeline-head" style={{ left: percent(t) }} />
      </div>

      <div className="pu-lanes" aria-hidden>
        <span>Màn hình</span>
        <div className="pu-lane screen">
          {screens.map((s) => <i key={s.segment.recordingId} style={{ left: percent(s.start), width: percent(s.end - s.start) }} />)}
        </div>
        <span>Camera + mic</span>
        <div className="pu-lane camera">
          {cameras.map((s) => <i key={s.segment.recordingId} style={{ left: percent(s.start), width: percent(s.end - s.start) }} />)}
        </div>
      </div>

      {events.length > 0 && (
        <ol className="pu-rplayer-events" aria-label="Nhật ký giám sát">
          {events.map((e, index) => (
            <li key={`${e.kind}-${e.offsetMs}-${index}`} className={e.flagged ? 'flagged' : undefined}>
              <button type="button" onClick={() => seek(e.offsetMs - 2000)} aria-current={current === e ? 'true' : undefined}>
                <time>{clock(e.offsetMs)}</time>
                <span className="dot" aria-hidden />
                <span className="text">
                  {PROCTORING_EVENT_LABELS[e.kind]}
                  {e.durationMs ? ` · ${formatDuration(e.durationMs)}` : ''}
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
