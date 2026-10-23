import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { pulseService } from '@/services/pulse.service';
import { ProctorController } from '../exam/proctor';
import type { FaceDetector } from '../exam/face-detector';
import type { FaceObservation } from '../exam/face-signals';

// Mô hình MediaPipe thật không chạy trong jsdom: mặc định bộ nhận diện không bao giờ tải xong (không sinh sự kiện khuôn mặt).
vi.mock('../exam/face-detector', () => ({ loadFaceDetector: () => new Promise(() => undefined) }));

const ok = <T,>(data: T) => ({ data: { success: true, message: 'Success', data } }) as never;

// ── Bộ giả lập thiết bị của trình duyệt (jsdom không có getDisplayMedia / MediaRecorder) ──

class FakeTrack extends EventTarget {
  readyState: 'live' | 'ended' = 'live';
  readonly kind: 'video' | 'audio';
  private readonly surface?: string;
  constructor(kind: 'video' | 'audio', surface?: string) {
    super();
    this.kind = kind;
    this.surface = surface;
  }
  getSettings() {
    return this.surface ? { displaySurface: this.surface } : {};
  }
  stop() {
    this.readyState = 'ended';
  }
  /** Người dùng bấm "Dừng chia sẻ" / rút camera: trình duyệt bắn 'ended'. */
  end() {
    this.readyState = 'ended';
    this.dispatchEvent(new Event('ended'));
  }
}

class FakeStream {
  readonly tracks: FakeTrack[];
  constructor(tracks: FakeTrack[] = []) {
    this.tracks = tracks;
  }
  getTracks() {
    return this.tracks;
  }
  getVideoTracks() {
    return this.tracks.filter((t) => t.kind === 'video');
  }
  getAudioTracks() {
    return this.tracks.filter((t) => t.kind === 'audio');
  }
}

class FakeRecorder {
  static instances: FakeRecorder[] = [];
  static isTypeSupported = (type: string) => type === 'video/webm';
  state: 'inactive' | 'recording' = 'inactive';
  readonly mimeType = 'video/webm';
  readonly stream: FakeStream;
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  constructor(stream: FakeStream) {
    this.stream = stream;
    FakeRecorder.instances.push(this);
  }
  start() {
    this.state = 'recording';
  }
  /** Một mẩu theo timeslice. */
  emit(text = 'chunk') {
    this.ondataavailable?.({ data: new Blob([text]) });
  }
  stop() {
    this.state = 'inactive';
    this.emit('last');
    this.onstop?.();
  }
}

let screenTracks: FakeTrack[];
let cameraTracks: FakeTrack[];
let micTracks: FakeTrack[];
let surface = 'monitor';

function installDevices() {
  screenTracks = [];
  cameraTracks = [];
  micTracks = [];
  surface = 'monitor';
  FakeRecorder.instances = [];
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getDisplayMedia: vi.fn(async () => {
        const track = new FakeTrack('video', surface);
        screenTracks.push(track);
        return new FakeStream([track]);
      }),
      getUserMedia: vi.fn(async (constraints: { video?: unknown; audio?: unknown }) => {
        const track = new FakeTrack(constraints.video ? 'video' : 'audio');
        (constraints.video ? cameraTracks : micTracks).push(track);
        return new FakeStream([track]);
      }),
    },
  });
  vi.stubGlobal('MediaRecorder', FakeRecorder);
  vi.stubGlobal('MediaStream', FakeStream);
}

const recorderFor = (track: 'SCREEN' | 'CAMERA', index = 0) =>
  FakeRecorder.instances.filter((r) => (track === 'SCREEN' ? r.stream.getAudioTracks().length === 0 : r.stream.getAudioTracks().length > 0))[index]!;

let segmentNo = 0;

beforeEach(() => {
  vi.restoreAllMocks();
  installDevices();
  segmentNo = 0;
  vi.spyOn(pulseService, 'startProctoring').mockResolvedValue(ok({ sessionId: 'ps-1', kind: 'FINAL', startedAt: '2026-10-16T08:00:00Z', maxChunkBytes: 16_777_216 }));
  vi.spyOn(pulseService, 'startRecording').mockImplementation(async (_sessionId, input) =>
    ok({ recordingId: `r-${input.track}-${++segmentNo}`, track: input.track, segmentNo }));
  vi.spyOn(pulseService, 'appendRecordingChunk').mockResolvedValue(ok({ received: 1, sizeBytes: 5, duplicate: false }));
  vi.spyOn(pulseService, 'endRecording').mockResolvedValue(ok({ recordingId: 'r', startOffsetMs: 0, endOffsetMs: 1 }));
  vi.spyOn(pulseService, 'recordProctoringEvents').mockResolvedValue(ok({ recorded: 1, total: 1 }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function readyController() {
  const controller = new ProctorController('course-1', 'FINAL');
  expect(await controller.requestScreen()).toBe(true);
  expect(await controller.requestCamera()).toBe(true);
  expect(await controller.requestMic()).toBe(true);
  return controller;
}

describe('ProctorController', () => {
  it('refuses a shared window or tab: only the entire screen is accepted', async () => {
    surface = 'window';
    const controller = new ProctorController('course-1', 'FINAL');

    expect(await controller.requestScreen()).toBe(false);

    expect(controller.getSnapshot().screen).toBe('wrong-surface');
    expect(screenTracks[0]!.readyState).toBe('ended');
    expect(controller.ready).toBe(false);
    await expect(controller.start()).rejects.toThrow();
    expect(pulseService.startProctoring).not.toHaveBeenCalled();
  });

  it('records screen and camera+mic as separate segments and uploads chunks in order', async () => {
    const controller = await readyController();
    await controller.start();

    expect(pulseService.startProctoring).toHaveBeenCalledWith('course-1', 'FINAL');
    expect(pulseService.startRecording).toHaveBeenCalledWith('ps-1', expect.objectContaining({ track: 'SCREEN', displaySurface: 'monitor' }));
    expect(pulseService.startRecording).toHaveBeenCalledWith('ps-1', expect.objectContaining({ track: 'CAMERA' }));
    expect(controller.getSnapshot().phase).toBe('recording');
    // Bản ghi camera mang cả hình lẫn tiếng micro.
    expect(recorderFor('CAMERA').stream.getTracks().map((t) => t.kind)).toEqual(['video', 'audio']);

    recorderFor('SCREEN').emit('a');
    recorderFor('SCREEN').emit('b');
    await vi.waitFor(() => expect(pulseService.appendRecordingChunk).toHaveBeenCalledTimes(2));
    const calls = vi.mocked(pulseService.appendRecordingChunk).mock.calls;
    expect(calls.map(([session, recording, seq]) => [session, recording, seq])).toEqual([['ps-1', 'r-SCREEN-1', 0], ['ps-1', 'r-SCREEN-1', 1]]);

    const result = await controller.finish(5_000);
    expect(result).toEqual(expect.objectContaining({ sessionId: 'ps-1', complete: true }));
    expect(pulseService.endRecording).toHaveBeenCalledTimes(2);
    controller.markFinished();
    [...screenTracks, ...cameraTracks, ...micTracks].forEach((track) => expect(track.readyState).toBe('ended'));
  });

  it('locks when sharing stops, logs it, and resumes with a new screen segment', async () => {
    const controller = await readyController();
    await controller.start();

    screenTracks[0]!.end();

    expect(controller.getSnapshot().phase).toBe('locked');
    expect(controller.getSnapshot().lockReasons).toEqual(['SCREEN']);
    await vi.waitFor(() => expect(pulseService.endRecording).toHaveBeenCalledWith('ps-1', 'r-SCREEN-1', expect.any(Number)));

    expect(await controller.resume('SCREEN')).toBe(true);
    expect(controller.getSnapshot().phase).toBe('recording');
    expect(pulseService.startRecording).toHaveBeenLastCalledWith('ps-1', expect.objectContaining({ track: 'SCREEN' }));
    expect(controller.getSnapshot().events.map((e) => e.kind)).toEqual(['STARTED', 'SHARE_STOPPED', 'SHARE_RESUMED']);

    await controller.flushEvents();
    const sent = vi.mocked(pulseService.recordProctoringEvents).mock.calls.flatMap(([, events]) => events.map((e) => e.kind));
    expect(sent).toEqual(expect.arrayContaining(['SHARE_STOPPED', 'SHARE_RESUMED']));
    controller.dispose();
  });

  it('waits for both camera and microphone before recording the camera segment again', async () => {
    const controller = await readyController();
    await controller.start();
    const cameraSegments = () => vi.mocked(pulseService.startRecording).mock.calls.filter(([, input]) => input.track === 'CAMERA').length;

    cameraTracks[0]!.end();
    micTracks[0]!.end();
    expect(controller.getSnapshot().lockReasons).toEqual(['CAMERA', 'MIC']);

    await controller.resume('CAMERA');
    expect(controller.getSnapshot().phase).toBe('locked');
    expect(cameraSegments()).toBe(1);

    await controller.resume('MIC');
    expect(controller.getSnapshot().phase).toBe('recording');
    expect(cameraSegments()).toBe(2);
    controller.dispose();
  });

  it('logs leaving the test tab with how long it lasted', async () => {
    const controller = await readyController();
    await controller.start();
    let visibility: DocumentVisibilityState = 'visible';
    const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
    try {
      visibility = 'hidden';
      document.dispatchEvent(new Event('visibilitychange'));
      visibility = 'visible';
      document.dispatchEvent(new Event('visibilitychange'));
    } finally {
      delete (document as { visibilityState?: unknown }).visibilityState;
      if (descriptor) Object.defineProperty(Document.prototype, 'visibilityState', descriptor);
    }

    const tab = controller.getSnapshot().events.find((e) => e.kind === 'TAB_HIDDEN');
    expect(tab).toBeTruthy();
    expect(tab!.durationMs).toBeGreaterThanOrEqual(0);
    controller.dispose();
  });

  it('retries a chunk after a network error or a 409, and stops on a permanent rejection', async () => {
    const network = new AxiosError('Network Error');
    const conflict = new AxiosError('Conflict', '409', undefined, undefined, {
      status: 409, statusText: 'Conflict', data: {}, headers: {}, config: { headers: new AxiosHeaders() },
    });
    vi.mocked(pulseService.appendRecordingChunk)
      .mockRejectedValueOnce(network)
      .mockRejectedValueOnce(conflict)
      .mockResolvedValue(ok({ received: 1, sizeBytes: 5, duplicate: true }));
    const controller = await readyController();
    await controller.start();

    recorderFor('SCREEN').emit('a');
    await vi.waitFor(() => expect(pulseService.appendRecordingChunk).toHaveBeenCalledTimes(3), { timeout: 5_000 });
    const seqs = vi.mocked(pulseService.appendRecordingChunk).mock.calls.map(([, , seq]) => seq);
    expect(seqs).toEqual([0, 0, 0]);
    await vi.waitFor(() => expect(controller.getSnapshot().pendingChunks).toBe(0));
    expect(controller.getSnapshot().uploadError).toBeNull();

    const rejected = new AxiosError('Bad Request', '400', undefined, undefined, {
      status: 400, statusText: 'Bad Request', data: {}, headers: {}, config: { headers: new AxiosHeaders() },
    });
    vi.mocked(pulseService.appendRecordingChunk).mockRejectedValue(rejected);
    recorderFor('CAMERA').emit('b');
    await vi.waitFor(() => expect(controller.getSnapshot().uploadError).toMatch(/Máy chủ từ chối bản ghi/));
    const result = await controller.finish(1_000);
    expect(result.complete).toBe(false);
    controller.dispose();
  }, 10_000);
});

describe('ProctorController · nhận diện khuôn mặt trên máy', () => {
  let observation: FaceObservation;
  const fakeDetector = (): FaceDetector => ({ detect: () => observation, close: vi.fn() });
  const readyStateDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'readyState');

  beforeEach(() => {
    observation = { faces: 1, yaw: 0, pitch: 0 };
    Object.defineProperty(HTMLMediaElement.prototype, 'readyState', { configurable: true, get: () => 4 });
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
    if (readyStateDescriptor) Object.defineProperty(HTMLMediaElement.prototype, 'readyState', readyStateDescriptor);
  });

  async function startedWith(load: () => Promise<FaceDetector>) {
    const controller = new ProctorController('course-1', 'FINAL', { loadFaceDetector: load });
    await controller.requestScreen();
    await controller.requestCamera();
    await controller.requestMic();
    await controller.start();
    await vi.advanceTimersByTimeAsync(0);
    return controller;
  }

  it('logs an absence from the camera with its offset and duration, and warns the employee while it lasts', async () => {
    const controller = await startedWith(async () => fakeDetector());
    expect(controller.getSnapshot().faceCheck).toBe('on');

    observation = { faces: 0 };
    await vi.advanceTimersByTimeAsync(5000);
    expect(controller.getSnapshot().faceAlert).toBe('FACE_MISSING');

    observation = { faces: 1, yaw: 0, pitch: 0 };
    await vi.advanceTimersByTimeAsync(1000);
    expect(controller.getSnapshot().faceAlert).toBeNull();
    const events = controller.getSnapshot().events;
    expect(events.map((e) => e.kind)).toEqual(['STARTED', 'FACE_CHECK_ON', 'FACE_MISSING']);
    expect(events[2]).toEqual(expect.objectContaining({ offsetMs: 500, durationMs: 4500 }));

    observation = { faces: 2 };
    await vi.advanceTimersByTimeAsync(2500);
    // Nộp bài khép khoảng "nhiều người" đang diễn ra và gửi trong lần gửi nhật ký cuối.
    await controller.finish(1_000);
    const sent = vi.mocked(pulseService.recordProctoringEvents).mock.calls.flatMap(([, batch]) => batch);
    expect(sent.map((e) => e.kind)).toEqual(['FACE_CHECK_ON', 'FACE_MISSING', 'MULTIPLE_FACES']);
    expect(sent[2]).toEqual(expect.objectContaining({ detail: '2 khuôn mặt' }));
    controller.dispose();
  });

  it('keeps the exam going when the model cannot load and records that faces were not checked', async () => {
    const controller = await startedWith(() => Promise.reject(new Error('Không tải được mô hình')));

    expect(controller.getSnapshot().faceCheck).toBe('off');
    expect(controller.getSnapshot().phase).toBe('recording');
    expect(controller.getSnapshot().events.at(-1)).toEqual(expect.objectContaining({ kind: 'FACE_CHECK_OFF', detail: 'Không tải được mô hình' }));
    controller.dispose();
  });

  it('pauses face checks while the camera is off, so a lost camera is not also counted as an absence', async () => {
    const controller = await startedWith(async () => fakeDetector());
    observation = { faces: 0 };
    await vi.advanceTimersByTimeAsync(2000);

    cameraTracks[0]!.end();
    await vi.advanceTimersByTimeAsync(10_000);

    expect(controller.getSnapshot().events.map((e) => e.kind)).toEqual(['STARTED', 'FACE_CHECK_ON', 'CAMERA_STOPPED']);
    controller.dispose();
  });
});
