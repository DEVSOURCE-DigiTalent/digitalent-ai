import type { HolisticLandmarker } from '@mediapipe/tasks-vision';
import type { Landmark, MotionFrame } from './motion-format';

/**
 * Takes the motion of a sign from its video, in the browser: MediaPipe Holistic Landmarker (body, both hands) on frames
 * stepped at `fps` between `startMs` and `endMs`. Only the model files are downloaded (WASM + .task, ~14 MB); the
 * video never leaves the computer. The library is loaded on demand, like the proctoring face check.
 */

const MEDIAPIPE_VERSION = '1.1.1';
const WASM_URL = import.meta.env.VITE_FACE_WASM_URL || `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const HOLISTIC_MODEL_URL = import.meta.env.VITE_HOLISTIC_MODEL_URL
  || 'https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/1/holistic_landmarker.task';

const MIN_SHOULDER_VISIBILITY = 0.6;
/** Sizes of the two downloads when the server does not say (or sends them compressed): the progress stays honest. */
const WASM_BYTES = 13_519_922;
const MODEL_BYTES = 13_683_609;

/** Bytes of the model files downloaded so far, of the total (the first use only; then they are in memory). */
export type LoadProgress = (loaded: number, total: number) => void;

let landmarkerPromise: Promise<HolisticLandmarker> | null = null;
let loadState = { loaded: 0, total: WASM_BYTES + MODEL_BYTES };
const loadListeners = new Set<LoadProgress>();

/** Downloads a file and reports its bytes as they arrive. */
async function download(url: string, known: number, onBytes: (loaded: number, total: number) => void): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`Không tải được ${url} (${response.status}).`);
  const declared = response.headers.get('content-encoding') ? 0 : Number(response.headers.get('content-length')) || 0;
  const total = declared || known;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onBytes(loaded, Math.max(total, loaded));
  }
  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  onBytes(loaded, loaded);
  return bytes;
}

/**
 * MediaPipe Holistic, loaded once. The WASM binary and the model are downloaded here (not by MediaPipe) so their
 * progress can be shown; if that fails, MediaPipe loads them itself, without progress.
 */
export function loadHolistic(onLoad?: LoadProgress): Promise<HolisticLandmarker> {
  if (onLoad) {
    loadListeners.add(onLoad);
    onLoad(loadState.loaded, loadState.total);
  }
  landmarkerPromise ??= (async () => {
    const { HolisticLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
    const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
    const options = { runningMode: 'VIDEO' as const, minPoseDetectionConfidence: 0.5, minHandLandmarksConfidence: 0.5 };
    const parts = { wasm: [0, WASM_BYTES], model: [0, MODEL_BYTES] };
    const report = () => {
      loadState = { loaded: parts.wasm[0] + parts.model[0], total: parts.wasm[1] + parts.model[1] };
      loadListeners.forEach((listener) => listener(loadState.loaded, loadState.total));
    };
    try {
      const [wasm, model] = await Promise.all([
        download(fileset.wasmBinaryPath, WASM_BYTES, (loaded, total) => { parts.wasm = [loaded, total]; report(); }),
        download(HOLISTIC_MODEL_URL, MODEL_BYTES, (loaded, total) => { parts.model = [loaded, total]; report(); }),
      ]);
      const local = { ...fileset, wasmBinaryPath: URL.createObjectURL(new Blob([wasm as BlobPart], { type: 'application/wasm' })) };
      const create = (delegate: 'GPU' | 'CPU') => HolisticLandmarker.createFromOptions(local, { ...options, baseOptions: { modelAssetBuffer: model, delegate } });
      return await create('GPU').catch(() => create('CPU'));
    } catch {
      const create = (delegate: 'GPU' | 'CPU') => HolisticLandmarker.createFromOptions(fileset, { ...options, baseOptions: { modelAssetPath: HOLISTIC_MODEL_URL, delegate } });
      const landmarker = await create('GPU').catch(() => create('CPU'));
      loadState = { loaded: loadState.total, total: loadState.total };
      return landmarker;
    }
  })().catch((error) => {
    landmarkerPromise = null;
    loadState = { loaded: 0, total: WASM_BYTES + MODEL_BYTES };
    throw error;
  });
  return onLoad ? landmarkerPromise.finally(() => loadListeners.delete(onLoad)) : landmarkerPromise;
}

export interface ExtractOptions {
  fps: number;
  startMs: number;
  endMs: number;
  onProgress?: (done: number, total: number) => void;
  /** The model download, before the first frame (first use only). */
  onLoad?: LoadProgress;
  signal?: AbortSignal;
}

const copy = (points: { x: number; y: number; z: number }[] | undefined): Landmark[] | null =>
  points && points.length ? points.map((p) => ({ x: p.x, y: p.y, z: p.z })) : null;

function seek(video: HTMLVideoElement, seconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const done = () => { cleanup(); resolve(); };
    const fail = () => { cleanup(); reject(new Error('Không đọc được khung hình của video.')); };
    const cleanup = () => { video.removeEventListener('seeked', done); video.removeEventListener('error', fail); };
    video.addEventListener('seeked', done, { once: true });
    video.addEventListener('error', fail, { once: true });
    video.currentTime = seconds;
  });
}

/** Steps through the video (paused) and returns one frame of landmarks per step. */
export async function extractMotion(video: HTMLVideoElement, options: ExtractOptions): Promise<MotionFrame[]> {
  const landmarker = await loadHolistic(options.onLoad);
  const { fps, startMs, endMs, onProgress, signal } = options;
  const total = Math.max(1, Math.floor(((endMs - startMs) * fps) / 1000));
  const frames: MotionFrame[] = [];
  video.pause();
  // VIDEO mode needs increasing timestamps across calls, also between two extractions.
  let timestamp = performance.now();
  for (let i = 0; i < total; i += 1) {
    if (signal?.aborted) throw new DOMException('Đã dừng.', 'AbortError');
    await seek(video, (startMs + (i * 1000) / fps) / 1000);
    timestamp = Math.max(timestamp + 1, performance.now());
    const result = landmarker.detectForVideo(video, timestamp);
    // A body MediaPipe is not sure of (shoulders barely visible) is a false detection: drop it.
    const seen = result.poseLandmarks[0];
    const sure = seen && Math.min(seen[11]?.visibility ?? 0, seen[12]?.visibility ?? 0) >= MIN_SHOULDER_VISIBILITY;
    const pose = sure ? copy(seen) : null;
    const poseWorld = sure ? copy(result.poseWorldLandmarks[0]) : null;
    frames.push({
      pose: pose && poseWorld ? pose : null,
      poseWorld: pose && poseWorld ? poseWorld : null,
      // Hands in metres (hand world landmarks): orientation and finger angles do not depend on the video's shape.
      leftHand: copy(result.leftHandWorldLandmarks[0]),
      rightHand: copy(result.rightHandWorldLandmarks[0]),
    });
    onProgress?.(i + 1, total);
  }
  return frames;
}
