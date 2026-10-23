import type { FaceDetector } from './face-detector';
import { FaceSignalTracker, type FaceEpisode, type FaceSignalKind } from './face-signals';

/**
 * Vòng nhận diện khuôn mặt của bài làm có giám sát: đọc luồng camera vào một thẻ <video> ẩn, mỗi SAMPLE_MS nhận diện một khung
 * hình trên máy và chuyển kết quả cho FaceSignalTracker. Mô hình không tải / chạy được thì báo 'off' — bài làm vẫn tiếp tục,
 * người chấm thấy phiên không có lớp nhận diện.
 */

export type FaceCheckState = 'idle' | 'loading' | 'on' | 'off';

export interface FaceMonitorHandlers {
  /** Khoảng đáng ngờ vừa khép (start theo Date.now()). */
  onEpisode(episode: FaceEpisode): void;
  onState(state: FaceCheckState, reason?: string): void;
  /** Tình trạng hiện tại để nhắc người làm bài (null = bình thường). */
  onLive(signal: FaceSignalKind | null): void;
}

const SAMPLE_MS = 500;
/** Lỗi nhận diện liên tiếp tối đa trước khi tắt lớp nhận diện. */
const MAX_ERRORS = 10;

export class FaceMonitor {
  private readonly load: () => Promise<FaceDetector>;
  private readonly handlers: FaceMonitorHandlers;
  private readonly tracker = new FaceSignalTracker();
  private detector: FaceDetector | null = null;
  private video: HTMLVideoElement | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private errors = 0;
  private live: FaceSignalKind | null = null;
  private lastTimestamp = 0;
  private stopped = false;
  state: FaceCheckState = 'idle';

  constructor(load: () => Promise<FaceDetector>, handlers: FaceMonitorHandlers) {
    this.load = load;
    this.handlers = handlers;
  }

  /** Tải mô hình và bắt đầu theo dõi luồng camera. */
  async start(stream: MediaStream | null): Promise<void> {
    if (this.state !== 'idle') return;
    this.setState('loading');
    try {
      const detector = await this.load();
      if (this.stopped) {
        detector.close();
        return;
      }
      this.detector = detector;
    } catch (error) {
      if (!this.stopped) this.setState('off', reasonOf(error));
      return;
    }
    this.setState('on');
    this.setStream(stream);
    this.timer = setInterval(this.sample, SAMPLE_MS);
  }

  /** Luồng camera đổi (bật lại camera) hoặc mất (null). */
  setStream(stream: MediaStream | null) {
    if (!this.video) {
      if (!stream) return;
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      this.video = video;
    }
    if (this.video.srcObject === stream) return;
    this.video.srcObject = stream;
    const video = this.video;
    if (stream) void Promise.resolve().then(() => video.play()).catch(() => undefined);
    else this.emit(this.tracker.pause());
  }

  private sample = () => {
    const video = this.video;
    const detector = this.detector;
    if (!detector || !video) return;
    const live = (video.srcObject as MediaStream | null)?.getVideoTracks().some((t) => t.readyState === 'live');
    if (!live || video.readyState < 2) {
      this.emit(this.tracker.pause());
      this.setLive(null);
      return;
    }
    const now = Date.now();
    try {
      // MediaPipe yêu cầu mốc thời gian tăng dần.
      this.lastTimestamp = Math.max(this.lastTimestamp + 1, performance.now());
      const observation = detector.detect(video, this.lastTimestamp);
      this.errors = 0;
      this.emit(this.tracker.observe(observation, now));
      this.setLive(this.tracker.active(now));
    } catch (error) {
      if (++this.errors >= MAX_ERRORS) {
        this.emit(this.tracker.pause());
        this.halt();
        this.setState('off', reasonOf(error));
      }
    }
  };

  /** Kết thúc (nộp bài / rời trang): khép các khoảng đang theo dõi và giải phóng mô hình. */
  stop() {
    if (this.stopped) return;
    this.stopped = true;
    this.emit(this.tracker.pause());
    this.halt();
  }

  private halt() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.video) this.video.srcObject = null;
    this.video = null;
    this.detector?.close();
    this.detector = null;
    this.setLive(null);
  }

  private emit(episodes: FaceEpisode[]) {
    episodes.forEach((episode) => this.handlers.onEpisode(episode));
  }

  private setState(state: FaceCheckState, reason?: string) {
    this.state = state;
    this.handlers.onState(state, reason);
  }

  private setLive(signal: FaceSignalKind | null) {
    if (signal === this.live) return;
    this.live = signal;
    this.handlers.onLive(signal);
  }
}

function reasonOf(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  return (text || 'Không rõ lỗi').slice(0, 200);
}
