import { isAxiosError } from 'axios';
import {
  pulseService,
  type PulseExamKind,
  type PulseProctoringEventInput,
  type PulseProctoringSession,
  type PulseProctoringEventKind,
  type PulseRecordingTrack,
} from '@/services/pulse.service';
import { loadFaceDetector, type FaceDetector } from './face-detector';
import { FaceMonitor, type FaceCheckState } from './face-monitor';
import type { FaceEpisode, FaceSignalKind } from './face-signals';

/**
 * Bài làm có giám sát (docs/specs/2026-10-16-pulse-employee-roadmap-proctoring.md): toàn bộ màn hình, camera và micro.
 *   - Màn hình ghi thành nguồn SCREEN (không tiếng); camera + micro ghi chung thành nguồn CAMERA (âm thanh liên tục).
 *   - Mỗi lần một nguồn bắt đầu ghi là một đoạn (một tệp trên máy chủ); MediaRecorder cắt mẩu mỗi vài giây và mẩu được tải
 *     lên lần lượt (thử lại khi lỗi mạng) nên bản ghi không mất khi trình duyệt đóng giữa chừng.
 *   - Rời tab / rời cửa sổ, ngừng chia sẻ, mất camera hay micro được ghi vào nhật ký; mất một nguồn thì bài tạm khóa cho tới
 *     khi bật lại (đoạn ghi mới).
 *   - Nhận diện khuôn mặt chạy ngay trên máy (FaceMonitor): vắng mặt, nhiều người, nhìn ra ngoài được ghi vào nhật ký như các
 *     sự kiện khác; không gửi video đi chỉ để phân tích. Không chạy được thì bài vẫn làm tiếp (ghi FACE_CHECK_OFF).
 */

export type DeviceState = 'idle' | 'requesting' | 'on' | 'denied' | 'wrong-surface' | 'stopped';
export type ProctorPhase = 'setup' | 'starting' | 'recording' | 'locked' | 'finishing' | 'finished';
export type LockReason = 'SCREEN' | 'CAMERA' | 'MIC';

export interface LocalEvent {
  kind: PulseProctoringEventKind;
  offsetMs: number;
  durationMs?: number | null;
  detail?: string | null;
}

export interface ProctorOptions {
  /** Nạp bộ nhận diện khuôn mặt; null = không nhận diện (mặc định: MediaPipe trên trình duyệt). */
  loadFaceDetector?: (() => Promise<FaceDetector>) | null;
}

export interface ProctorSnapshot {
  screen: DeviceState;
  camera: DeviceState;
  mic: DeviceState;
  /** Lỗi chi tiết của thiết bị gần nhất (để hiện lời nhắc). */
  deviceError: string | null;
  phase: ProctorPhase;
  sessionId: string | null;
  /** Mốc 0 (Date.now()) của phiên trên máy người làm bài. */
  startedAt: number | null;
  lockReasons: LockReason[];
  events: LocalEvent[];
  pendingChunks: number;
  uploadError: string | null;
  micLevel: number;
  /** Nhận diện khuôn mặt trên máy: idle (chưa / không dùng) → loading → on | off. */
  faceCheck: FaceCheckState;
  /** Tình trạng khuôn mặt bất thường đang diễn ra (để nhắc người làm bài). */
  faceAlert: FaceSignalKind | null;
  /** Tăng mỗi khi luồng camera / màn hình đổi — để gắn lại vào thẻ <video>. */
  streamVersion: number;
}

/** Trình duyệt có đủ API để làm bài có giám sát không. */
export function proctoringSupported(): boolean {
  return typeof navigator !== 'undefined'
    && Boolean(navigator.mediaDevices?.getDisplayMedia)
    && Boolean(navigator.mediaDevices?.getUserMedia)
    && typeof window !== 'undefined'
    && typeof window.MediaRecorder !== 'undefined';
}

const SCREEN_TYPES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
const CAMERA_TYPES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
const CHUNK_MS = 5000;
const EVENT_FLUSH_MS = 4000;

function pickType(track: PulseRecordingTrack): string {
  const types = track === 'SCREEN' ? SCREEN_TYPES : CAMERA_TYPES;
  return types.find((type) => window.MediaRecorder.isTypeSupported?.(type)) ?? '';
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Lỗi không nên thử lại (phiên đã đóng, đoạn không tồn tại, mẩu sai thứ tự…). 409 thì thử lại: lần gửi lại một mẩu chạy song
 * song với lần gửi đầu chưa trả lời có thể đụng khóa đồng thời; lần thử sau máy chủ nhận ra mẩu trùng và trả thành công.
 */
function isFatal(error: unknown): boolean {
  if (!isAxiosError(error) || !error.response) return false;
  const status = error.response.status;
  return status >= 400 && status < 500 && status !== 408 && status !== 409 && status !== 429;
}

/** Hàng đợi tải mẩu ghi hình của một đoạn: lần lượt, giữ thứ tự, thử lại với độ trễ tăng dần. */
class ChunkQueue {
  private readonly items: { seq: number; blob: Blob }[] = [];
  private nextSeq = 0;
  private running = false;
  fatal: unknown = null;
  lastError: unknown = null;

  private readonly send: (seq: number, blob: Blob) => Promise<unknown>;
  private readonly onChange: () => void;

  constructor(send: (seq: number, blob: Blob) => Promise<unknown>, onChange: () => void) {
    this.send = send;
    this.onChange = onChange;
  }

  get pending() {
    return this.items.length;
  }

  push(blob: Blob) {
    if (blob.size === 0 || this.fatal) return;
    this.items.push({ seq: this.nextSeq++, blob });
    this.onChange();
    void this.pump();
  }

  private async pump() {
    if (this.running) return;
    this.running = true;
    let delay = 1000;
    while (this.items.length && !this.fatal) {
      const item = this.items[0]!;
      try {
        await this.send(item.seq, item.blob);
        this.items.shift();
        this.lastError = null;
        delay = 1000;
      } catch (error) {
        this.lastError = error;
        if (isFatal(error)) this.fatal = error;
        else {
          this.onChange();
          await sleep(delay);
          delay = Math.min(delay * 2, 10_000);
        }
      }
      this.onChange();
    }
    this.running = false;
  }

  /** Chờ tải hết (hoặc tới khi hết giờ / gặp lỗi không thử lại được). */
  async drain(timeoutMs: number): Promise<boolean> {
    const until = Date.now() + timeoutMs;
    while (this.items.length && !this.fatal && Date.now() < until) {
      void this.pump();
      await sleep(250);
    }
    return this.items.length === 0 && !this.fatal;
  }
}

interface ActiveSegment {
  track: PulseRecordingTrack;
  recordingId: string;
  recorder: MediaRecorder;
  queue: ChunkQueue;
  stopped: Promise<void>;
}

export class ProctorController {
  private snapshot: ProctorSnapshot = {
    screen: 'idle',
    camera: 'idle',
    mic: 'idle',
    deviceError: null,
    phase: 'setup',
    sessionId: null,
    startedAt: null,
    lockReasons: [],
    events: [],
    pendingChunks: 0,
    uploadError: null,
    micLevel: 0,
    faceCheck: 'idle',
    faceAlert: null,
    streamVersion: 0,
  };

  private readonly listeners = new Set<() => void>();
  screenStream: MediaStream | null = null;
  cameraStream: MediaStream | null = null;
  micStream: MediaStream | null = null;
  private readonly segments = new Map<PulseRecordingTrack, ActiveSegment>();
  private readonly finishedQueues: ChunkQueue[] = [];
  private pendingEvents: PulseProctoringEventInput[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private meterTimer: ReturnType<typeof setInterval> | null = null;
  private audioContext: AudioContext | null = null;
  private hiddenAt: number | null = null;
  private blurAt: number | null = null;

  private face: FaceMonitor | null = null;

  private readonly courseId: string;
  private readonly kind: PulseExamKind;
  private readonly loadFaceDetector: (() => Promise<FaceDetector>) | null;

  constructor(courseId: string, kind: PulseExamKind, options: ProctorOptions = {}) {
    this.courseId = courseId;
    this.kind = kind;
    this.loadFaceDetector = options.loadFaceDetector === undefined ? loadFaceDetector : options.loadFaceDetector;
  }

  // ── Đăng ký cho React (useSyncExternalStore) ──
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  private set(patch: Partial<ProctorSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  private refreshUploads = () => {
    const queues = [...this.finishedQueues, ...[...this.segments.values()].map((s) => s.queue)];
    const pending = queues.reduce((sum, queue) => sum + queue.pending, 0);
    const failing = queues.find((queue) => queue.fatal || queue.lastError);
    this.set({
      pendingChunks: pending,
      uploadError: failing ? (failing.fatal ? 'Máy chủ từ chối bản ghi. Hãy bắt đầu lại bài làm.' : 'Mạng chập chờn — bản ghi sẽ tự tải tiếp.') : null,
    });
  };

  private offset() {
    return this.snapshot.startedAt == null ? 0 : Math.max(0, Date.now() - this.snapshot.startedAt);
  }

  // ── Chuẩn bị thiết bị ──

  /** Chia sẻ toàn bộ màn hình (từ chối cửa sổ / tab). */
  async requestScreen(): Promise<boolean> {
    this.set({ screen: 'requesting', deviceError: null });
    try {
      const options = {
        video: { displaySurface: 'monitor', frameRate: { ideal: 5, max: 10 } },
        audio: false,
        monitorTypeSurfaces: 'include',
        selfBrowserSurface: 'exclude',
        surfaceSwitching: 'exclude',
      } as DisplayMediaStreamOptions;
      const stream = await navigator.mediaDevices.getDisplayMedia(options);
      const track = stream.getVideoTracks()[0];
      const surface = track ? (track.getSettings() as MediaTrackSettings & { displaySurface?: string }).displaySurface : undefined;
      if (!track || (surface && surface !== 'monitor')) {
        stream.getTracks().forEach((t) => t.stop());
        this.set({ screen: 'wrong-surface', deviceError: 'Bạn đã chọn một cửa sổ hoặc một tab. Hãy chọn Toàn bộ màn hình.' });
        return false;
      }
      this.screenStream?.getTracks().forEach((t) => t.stop());
      this.screenStream = stream;
      track.addEventListener('ended', this.onScreenEnded);
      this.set({ screen: 'on', streamVersion: this.snapshot.streamVersion + 1 });
      return true;
    } catch {
      this.set({ screen: 'denied', deviceError: 'Chưa chia sẻ màn hình. Hãy bấm Chọn màn hình và chọn Toàn bộ màn hình.' });
      return false;
    }
  }

  async requestCamera(): Promise<boolean> {
    this.set({ camera: 'requesting', deviceError: null });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15, max: 24 } },
        audio: false,
      });
      this.cameraStream?.getTracks().forEach((t) => t.stop());
      this.cameraStream = stream;
      stream.getVideoTracks()[0]?.addEventListener('ended', this.onCameraEnded);
      this.face?.setStream(stream);
      this.set({ camera: 'on', streamVersion: this.snapshot.streamVersion + 1 });
      return true;
    } catch {
      this.set({ camera: 'denied', deviceError: 'Trình duyệt chưa được phép dùng camera. Hãy cho phép camera rồi thử lại.' });
      return false;
    }
  }

  async requestMic(): Promise<boolean> {
    this.set({ mic: 'requesting', deviceError: null });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
      this.micStream?.getTracks().forEach((t) => t.stop());
      this.micStream = stream;
      stream.getAudioTracks()[0]?.addEventListener('ended', this.onMicEnded);
      this.startMeter(stream);
      this.set({ mic: 'on' });
      return true;
    } catch {
      this.set({ mic: 'denied', deviceError: 'Trình duyệt chưa được phép dùng micro. Hãy cho phép micro rồi thử lại.' });
      return false;
    }
  }

  private startMeter(stream: MediaStream) {
    this.stopMeter();
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const context = new AudioCtx();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    this.audioContext = context;
    this.meterTimer = setInterval(() => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) {
        const value = (sample - 128) / 128;
        sum += value * value;
      }
      const level = Math.min(1, Math.sqrt(sum / samples.length) * 4);
      if (Math.abs(level - this.snapshot.micLevel) > 0.02) this.set({ micLevel: level });
    }, 120);
  }

  private stopMeter() {
    if (this.meterTimer) clearInterval(this.meterTimer);
    this.meterTimer = null;
    void this.audioContext?.close().catch(() => undefined);
    this.audioContext = null;
  }

  get ready() {
    const s = this.snapshot;
    return s.screen === 'on' && s.camera === 'on' && s.mic === 'on';
  }

  // ── Phiên ghi hình ──

  /** Bắt đầu phiên trên máy chủ, mở hai đoạn ghi và bắt đầu theo dõi tab / cửa sổ. */
  /** Bắt đầu phiên và hai đoạn ghi; trả về phiên kèm phần trắc nghiệm của đề. */
  async start(): Promise<PulseProctoringSession> {
    if (!this.ready) throw new Error('Thiết bị chưa sẵn sàng.');
    this.set({ phase: 'starting' });
    try {
      const session = (await pulseService.startProctoring(this.courseId, this.kind)).data.data!;
      this.set({ sessionId: session.sessionId, startedAt: Date.now(), events: [{ kind: 'STARTED', offsetMs: 0 }] });
      await this.startSegment('SCREEN');
      await this.startSegment('CAMERA');
      this.set({ phase: 'recording' });
      document.addEventListener('visibilitychange', this.onVisibility);
      window.addEventListener('blur', this.onBlur);
      window.addEventListener('focus', this.onFocus);
      this.flushTimer = setInterval(() => void this.flushEvents(), EVENT_FLUSH_MS);
      this.startFaceCheck();
      return session;
    } catch (error) {
      this.set({ phase: 'setup', sessionId: null, startedAt: null });
      throw error;
    }
  }

  private cameraRecordingStream(): MediaStream | null {
    const video = this.cameraStream?.getVideoTracks().find((t) => t.readyState === 'live');
    const audio = this.micStream?.getAudioTracks().find((t) => t.readyState === 'live');
    return video && audio ? new MediaStream([video, audio]) : null;
  }

  private async startSegment(track: PulseRecordingTrack) {
    const sessionId = this.snapshot.sessionId!;
    const stream = track === 'SCREEN' ? this.screenStream : this.cameraRecordingStream();
    if (!stream) throw new Error('Thiếu nguồn ghi.');
    const type = pickType(track);
    const recorder = new MediaRecorder(stream, {
      ...(type ? { mimeType: type } : {}),
      videoBitsPerSecond: track === 'SCREEN' ? 600_000 : 300_000,
      ...(track === 'CAMERA' ? { audioBitsPerSecond: 48_000 } : {}),
    });
    const surface = track === 'SCREEN'
      ? (this.screenStream?.getVideoTracks()[0]?.getSettings() as (MediaTrackSettings & { displaySurface?: string }) | undefined)?.displaySurface ?? null
      : null;
    const contentType = (recorder.mimeType || type || 'video/webm').slice(0, 100);
    const { recordingId } = (await pulseService.startRecording(sessionId, { track, startOffsetMs: this.offset(), contentType, displaySurface: surface })).data.data!;
    const queue = new ChunkQueue(
      (seq, blob) => pulseService.appendRecordingChunk(sessionId, recordingId, seq, blob),
      this.refreshUploads,
    );
    let resolveStopped: () => void = () => undefined;
    const stopped = new Promise<void>((resolve) => { resolveStopped = resolve; });
    recorder.ondataavailable = (event) => queue.push(event.data);
    recorder.onstop = () => resolveStopped();
    recorder.start(CHUNK_MS);
    this.segments.set(track, { track, recordingId, recorder, queue, stopped });
  }

  /** Dừng đoạn ghi của một nguồn: đợi mẩu cuối, khép đoạn trên máy chủ (nếu được). */
  private async stopSegment(track: PulseRecordingTrack, endOffsetMs: number) {
    const segment = this.segments.get(track);
    if (!segment) return;
    this.segments.delete(track);
    this.finishedQueues.push(segment.queue);
    if (segment.recorder.state !== 'inactive') {
      segment.recorder.stop();
      await Promise.race([segment.stopped, sleep(3000)]);
    }
    const sessionId = this.snapshot.sessionId;
    if (sessionId) {
      await pulseService.endRecording(sessionId, segment.recordingId, endOffsetMs).catch(() => undefined);
    }
  }

  // ── Nhận diện khuôn mặt trên máy ──

  private startFaceCheck() {
    if (!this.loadFaceDetector) return;
    this.face = new FaceMonitor(this.loadFaceDetector, {
      onEpisode: this.onFaceEpisode,
      onState: (state, reason) => {
        this.set({ faceCheck: state });
        if (state === 'on') this.log('FACE_CHECK_ON', this.offset());
        if (state === 'off') this.log('FACE_CHECK_OFF', this.offset(), undefined, reason);
      },
      onLive: (signal) => this.set({ faceAlert: signal }),
    });
    void this.face.start(this.cameraStream);
  }

  private onFaceEpisode = (episode: FaceEpisode) => {
    const startedAt = this.snapshot.startedAt ?? episode.start;
    this.log(episode.kind, Math.max(0, episode.start - startedAt), episode.durationMs, episode.detail);
  };

  // ── Sự kiện giám sát ──

  private log(kind: PulseProctoringEventInput['kind'], offsetMs: number, durationMs?: number, detail?: string | null) {
    const event = { kind, offsetMs, durationMs: durationMs ?? null, ...(detail ? { detail } : {}) };
    this.pendingEvents.push(event);
    this.set({ events: [...this.snapshot.events, event] });
  }

  async flushEvents(): Promise<void> {
    const sessionId = this.snapshot.sessionId;
    if (!sessionId || this.pendingEvents.length === 0) return;
    const batch = this.pendingEvents.splice(0, 200);
    try {
      await pulseService.recordProctoringEvents(sessionId, batch);
    } catch (error) {
      if (!isFatal(error)) this.pendingEvents.unshift(...batch);
    }
  }

  private onVisibility = () => {
    if (this.snapshot.phase !== 'recording' && this.snapshot.phase !== 'locked') return;
    if (document.visibilityState === 'hidden') {
      this.hiddenAt = Date.now();
      this.blurAt = null;
    } else if (this.hiddenAt != null) {
      const start = this.hiddenAt;
      this.hiddenAt = null;
      this.log('TAB_HIDDEN', Math.max(0, start - (this.snapshot.startedAt ?? start)), Date.now() - start);
      void this.flushEvents();
    }
  };

  private onBlur = () => {
    if (this.snapshot.phase !== 'recording' || document.visibilityState === 'hidden') return;
    this.blurAt = Date.now();
  };

  private onFocus = () => {
    if (this.blurAt == null || this.snapshot.phase !== 'recording') {
      this.blurAt = null;
      return;
    }
    const start = this.blurAt;
    this.blurAt = null;
    const duration = Date.now() - start;
    if (duration >= 1000) this.log('FOCUS_LOST', Math.max(0, start - (this.snapshot.startedAt ?? start)), duration);
  };

  private lock(reason: LockReason, kind: 'SHARE_STOPPED' | 'CAMERA_STOPPED' | 'MIC_STOPPED') {
    const at = this.offset();
    this.log(kind, at);
    void this.flushEvents();
    const reasons = this.snapshot.lockReasons.includes(reason) ? this.snapshot.lockReasons : [...this.snapshot.lockReasons, reason];
    this.set({ phase: 'locked', lockReasons: reasons });
    void this.stopSegment(reason === 'SCREEN' ? 'SCREEN' : 'CAMERA', at);
  }

  private onScreenEnded = () => {
    this.set({ screen: 'stopped' });
    if (this.snapshot.phase === 'recording' || this.snapshot.phase === 'locked') this.lock('SCREEN', 'SHARE_STOPPED');
  };

  private onCameraEnded = () => {
    this.face?.setStream(null);
    this.set({ camera: 'stopped' });
    if (this.snapshot.phase === 'recording' || this.snapshot.phase === 'locked') this.lock('CAMERA', 'CAMERA_STOPPED');
  };

  private onMicEnded = () => {
    this.set({ mic: 'stopped' });
    if (this.snapshot.phase === 'recording' || this.snapshot.phase === 'locked') this.lock('MIC', 'MIC_STOPPED');
  };

  /** Bật lại nguồn đã mất khi bài đang tạm khóa; đủ nguồn thì ghi tiếp bằng đoạn mới. */
  async resume(reason: LockReason): Promise<boolean> {
    const ok = reason === 'SCREEN' ? await this.requestScreen() : reason === 'CAMERA' ? await this.requestCamera() : await this.requestMic();
    if (!ok) return false;
    const at = this.offset();
    this.log(reason === 'SCREEN' ? 'SHARE_RESUMED' : reason === 'CAMERA' ? 'CAMERA_RESUMED' : 'MIC_RESUMED', at);
    const remaining = this.snapshot.lockReasons.filter((r) => r !== reason);
    this.set({ lockReasons: remaining });
    const track: PulseRecordingTrack = reason === 'SCREEN' ? 'SCREEN' : 'CAMERA';
    const otherCameraSource = track === 'CAMERA' && remaining.some((r) => r === 'CAMERA' || r === 'MIC');
    if (!this.segments.has(track) && !otherCameraSource) {
      await this.startSegment(track);
    }
    if (remaining.length === 0) this.set({ phase: 'recording' });
    void this.flushEvents();
    return true;
  }

  /** Kết thúc ghi hình để nộp bài: dừng mọi đoạn, tải hết mẩu và nhật ký. Trả về độ dài phiên (ms). */
  async finish(timeoutMs = 120_000): Promise<{ sessionId: string; durationMs: number; complete: boolean }> {
    const sessionId = this.snapshot.sessionId;
    if (!sessionId) throw new Error('Chưa bắt đầu phiên làm bài.');
    const durationMs = this.offset();
    this.set({ phase: 'finishing' });
    // Khép các khoảng khuôn mặt đang theo dõi để chúng vào nhật ký trước lần gửi cuối.
    this.face?.stop();
    await Promise.all([...this.segments.keys()].map((track) => this.stopSegment(track, durationMs)));
    const results = await Promise.all(this.finishedQueues.map((queue) => queue.drain(timeoutMs)));
    await this.flushEvents();
    this.refreshUploads();
    return { sessionId, durationMs, complete: results.every(Boolean) };
  }

  /** Nộp bài thành công: tắt thiết bị. */
  markFinished() {
    this.set({ phase: 'finished' });
    this.release();
  }

  private release() {
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('focus', this.onFocus);
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = null;
    this.face?.stop();
    this.face = null;
    this.stopMeter();
    for (const segment of this.segments.values()) {
      if (segment.recorder.state !== 'inactive') segment.recorder.stop();
    }
    this.segments.clear();
    [this.screenStream, this.cameraStream, this.micStream].forEach((stream) => stream?.getTracks().forEach((t) => {
      t.removeEventListener('ended', this.onScreenEnded);
      t.removeEventListener('ended', this.onCameraEnded);
      t.removeEventListener('ended', this.onMicEnded);
      t.stop();
    }));
    this.screenStream = null;
    this.cameraStream = null;
    this.micStream = null;
  }

  /** Rời trang / hủy bài: tắt mọi thiết bị (gọi nhiều lần vẫn an toàn). Phiên trên máy chủ bị bỏ khi bắt đầu phiên mới. */
  dispose() {
    void this.flushEvents();
    this.release();
  }
}
