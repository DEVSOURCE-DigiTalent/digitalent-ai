import type { SignAvatarJob } from '@/services/sign-language-video.service';
import type { SignGlossMotion } from '@/services/sign-dictionary.service';
import { base64ToBytes, decodeMotion } from './motion-format';
import { buildClip, type MotionClip } from './sign-rig';
import {
  activeRange,
  blinkAt,
  createPoseSampler,
  planAvatarTimeline,
  withIdle,
  type AvatarPlacement,
  type PlacedSign,
} from './avatar-timeline';
import { createAvatarFrameRenderer } from './sign-avatar';
import { formatBytes } from '@/lib/sign-video';

/**
 * Renders the avatar track of a sign-language video in the admin's browser (three.js + WebCodecs), frame by frame on
 * the lesson video's frame grid (one avatar frame per lesson frame), faster than real time and independent of the
 * screen: the server then only composes it with the lesson video. Output: raw H.264 (Annex B) when the browser can
 * encode it, else VP9/VP8 in an IVF file — formats FFmpeg reads with the frame rate given, so no frame drifts.
 * A transparent job (OVERLAY) has no background: neither codec keeps an alpha channel here, so each frame is twice as
 * wide — the colour premultiplied on black on the left, the alpha as grey on the right ({@link createAlphaPacker}).
 */

export type AvatarTrackFormat = 'H264' | 'IVF';

export interface AvatarTrackProgress {
  phase: 'prepare' | 'render';
  done: number;
  total: number;
  detail: string;
}

export interface AvatarTrackResult {
  blob: Blob;
  format: AvatarTrackFormat;
  codec: string;
  frameCount: number;
  /** Colour | alpha frames (sent back with the upload). */
  transparent: boolean;
  placements: AvatarPlacement[];
  warnings: string[];
}

export const AVATAR_UNSUPPORTED_MESSAGE =
  'Trình duyệt này chưa dựng được video nhân vật (cần WebCodecs và WebGL). Dùng Chrome hoặc Edge bản mới trên máy tính.';

/** "30000/1001" → frames per second and the IVF time base. */
export function parseFrameRate(text: string): { num: number; den: number; fps: number } {
  const [a, b] = text.split('/');
  const num = Number(a);
  const den = b === undefined ? 1 : Number(b);
  if (!Number.isFinite(num) || !Number.isFinite(den) || num <= 0 || den <= 0) throw new Error(`Tốc độ khung hình không hợp lệ: ${text}`);
  return { num, den, fps: num / den };
}

/** The 32-byte IVF file header (VP8/VP9 frames): time base den/num, so a frame index is its timestamp. */
export function ivfHeader(fourcc: 'VP80' | 'VP90', width: number, height: number, rate: { num: number; den: number }, frames: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(32);
  const view = new DataView(bytes.buffer);
  bytes.set([0x44, 0x4b, 0x49, 0x46]); // DKIF
  view.setUint16(4, 0, true);
  view.setUint16(6, 32, true);
  bytes.set([...fourcc].map((c) => c.charCodeAt(0)), 8);
  view.setUint16(12, width, true);
  view.setUint16(14, height, true);
  view.setUint32(16, rate.num, true); // time base denominator (rate)
  view.setUint32(20, rate.den, true); // time base numerator (scale)
  view.setUint32(24, frames, true);
  return bytes;
}

/** The 12-byte header of one IVF frame. */
export function ivfFrameHeader(size: number, index: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(12);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, size, true);
  view.setUint32(4, index >>> 0, true);
  view.setUint32(8, Math.floor(index / 2 ** 32), true);
  return bytes;
}

interface EncoderChoice {
  format: AvatarTrackFormat;
  fourcc?: 'VP80' | 'VP90';
  config: VideoEncoderConfig;
}

async function chooseEncoder(width: number, height: number, fps: number): Promise<EncoderChoice> {
  const base = { width, height, framerate: fps, bitrate: 2_500_000, latencyMode: 'quality' as const };
  const candidates: EncoderChoice[] = [
    // Baseline / Main / High 3.1: no B-frames, decoded by FFmpeg as a plain stream.
    { format: 'H264', config: { ...base, codec: 'avc1.42E01F', avc: { format: 'annexb' } } },
    { format: 'H264', config: { ...base, codec: 'avc1.4D401F', avc: { format: 'annexb' } } },
    { format: 'H264', config: { ...base, codec: 'avc1.64001F', avc: { format: 'annexb' } } },
    { format: 'IVF', fourcc: 'VP90', config: { ...base, codec: 'vp09.00.31.08' } },
    { format: 'IVF', fourcc: 'VP80', config: { ...base, codec: 'vp8' } },
  ];
  for (const candidate of candidates) {
    try {
      const support = await VideoEncoder.isConfigSupported(candidate.config);
      if (support.supported) return candidate;
    } catch {
      // Try the next one.
    }
  }
  throw new Error(AVATAR_UNSUPPORTED_MESSAGE);
}

/**
 * Share of the transparent tile, at its top and at its side toward the middle of the video, over which the avatar fades
 * out: a hand reaching past the tile fades away instead of being cut by a straight line in mid-air. The bottom and the
 * outer side are the video's own edges, where the body is simply cut by the frame.
 */
export const EDGE_FADE = 0.06;

/**
 * A transparent avatar frame as an opaque one twice as wide, for codecs without alpha: on the left the colour
 * premultiplied on black (what WebGL drew over nothing), on the right the alpha as grey (white = avatar). The server
 * splits them again (FFmpeg: alpha from the right half, colour divided by it, then overlay). `side` = the corner the
 * avatar stands in: the inner edges (top, and the side toward the middle) fade out ({@link EDGE_FADE}).
 */
export function createAlphaPacker(source: CanvasImageSource, width: number, height: number, side: 'LEFT' | 'RIGHT' = 'LEFT') {
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const faded = document.createElement('canvas');
  faded.width = width;
  faded.height = height;
  const fade = faded.getContext('2d');
  if (!context || !fade) throw new Error(AVATAR_UNSUPPORTED_MESSAGE);

  const fadeX = Math.max(1, Math.round(width * EDGE_FADE));
  const fadeY = Math.max(1, Math.round(height * EDGE_FADE));
  const across = side === 'LEFT' ? fade.createLinearGradient(width - fadeX, 0, width, 0) : fade.createLinearGradient(fadeX, 0, 0, 0);
  const down = fade.createLinearGradient(0, fadeY, 0, 0);
  for (const gradient of [across, down]) {
    gradient.addColorStop(0, '#000');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }

  return {
    canvas,
    pack() {
      // The avatar with its inner edges faded (colour and alpha together, so it stays premultiplied).
      fade.globalCompositeOperation = 'copy';
      fade.drawImage(source, 0, 0, width, height);
      fade.globalCompositeOperation = 'destination-in';
      fade.fillStyle = across;
      fade.fillRect(0, 0, width, height);
      fade.fillStyle = down;
      fade.fillRect(0, 0, width, height);

      context.globalCompositeOperation = 'source-over';
      context.clearRect(0, 0, width * 2, height);
      // Right: the avatar's shape in white (alpha kept), then black behind it → grey = alpha.
      context.drawImage(faded, width, 0);
      context.globalCompositeOperation = 'source-in';
      context.fillStyle = '#fff';
      context.fillRect(width, 0, width, height);
      context.globalCompositeOperation = 'destination-over';
      context.fillStyle = '#000';
      context.fillRect(0, 0, width * 2, height);
      // Left: the avatar over black = its colour × alpha.
      context.globalCompositeOperation = 'source-over';
      context.drawImage(faded, 0, 0);
    },
  };
}

/** Lets the page breathe between frames without the throttling of timers in a background tab. */
function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => resolve();
    channel.port2.postMessage(null);
  });
}

const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** The signing part of each motion as a clip of the avatar's bones. */
export function motionClips(motions: SignGlossMotion[]): Map<string, MotionClip> {
  const clips = new Map<string, MotionClip>();
  for (const motion of motions) {
    const frames = decodeMotion(base64ToBytes(motion.data), motion.frames);
    const { start, end } = activeRange(frames, motion.fps);
    clips.set(motion.id, buildClip(frames.slice(start, end), motion.fps, motion.mirrored));
  }
  return clips;
}

export async function renderAvatarTrack(
  job: SignAvatarJob,
  motions: SignGlossMotion[],
  options: { onProgress?: (progress: AvatarTrackProgress) => void; signal?: AbortSignal } = {},
): Promise<AvatarTrackResult> {
  const { onProgress, signal } = options;
  if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') throw new Error(AVATAR_UNSUPPORTED_MESSAGE);
  const rate = parseFrameRate(job.frameRate);

  onProgress?.({ phase: 'prepare', done: 0, total: 1, detail: `Đọc chuyển động của ${job.signs.length} ký hiệu` });
  const clips = motionClips(motions);
  const missing = job.signs.filter((sign) => !clips.has(sign.glossId));
  if (missing.length > 0) throw new Error(`Chưa có chuyển động cho ký hiệu “${missing[0].gloss}”. Lấy chuyển động trong Từ điển ký hiệu rồi dựng lại.`);

  const timeline = planAvatarTimeline(job.segments, (id) => clips.get(id)!.durationMs, { durationMs: job.durationMs, maxSpeedup: job.maxSpeedup });
  const placed: PlacedSign[] = timeline.placements.map((p) => ({ ...p, clip: clips.get(p.glossId)! }));
  const poseAt = createPoseSampler(placed);

  onProgress?.({ phase: 'prepare', done: 0, total: 1, detail: 'Tải nhân vật 3D' });
  const canvas = document.createElement('canvas');
  const transparent = job.transparent === true;
  const side = job.side === 'RIGHT' ? 'RIGHT' : 'LEFT';
  const avatar = await createAvatarFrameRenderer(canvas, {
    width: job.width, height: job.height, background: job.background, transparent, side,
    onProgress: (loaded, total) => {
      if (total > 0) onProgress?.({ phase: 'prepare', done: loaded, total, detail: `Tải nhân vật 3D: ${formatBytes(loaded)} / ${formatBytes(total)}` });
    },
  });
  const packer = transparent ? createAlphaPacker(canvas, job.width, job.height, side) : null;
  const frameWidth = packer ? job.width * 2 : job.width;
  const choice = await chooseEncoder(frameWidth, job.height, rate.fps);

  const parts: BlobPart[] = choice.format === 'IVF' ? [ivfHeader(choice.fourcc!, frameWidth, job.height, rate, job.frameCount)] : [];
  let failure: unknown = null;
  const encoder = new VideoEncoder({
    output: (chunk) => {
      const data = new Uint8Array(chunk.byteLength);
      chunk.copyTo(data);
      if (choice.format === 'IVF') parts.push(ivfFrameHeader(data.byteLength, Math.round((chunk.timestamp * rate.fps) / 1e6)));
      parts.push(data);
    },
    error: (error) => { failure = error; },
  });
  encoder.configure(choice.config);

  const keyEvery = Math.max(1, Math.round(rate.fps * 2));
  const step = 1 / rate.fps;
  const frameUs = 1e6 / rate.fps;
  try {
    for (let i = 0; i < job.frameCount; i += 1) {
      if (signal?.aborted) throw new DOMException('Đã dừng dựng nhân vật.', 'AbortError');
      if (failure) throw failure;
      const timeMs = (i * 1000) / rate.fps;
      avatar.render(withIdle(poseAt(timeMs), timeMs), blinkAt(timeMs), step);
      packer?.pack();
      const frame = new VideoFrame(packer?.canvas ?? canvas, { timestamp: Math.round(i * frameUs), duration: Math.round(frameUs) });
      encoder.encode(frame, { keyFrame: i % keyEvery === 0 });
      frame.close();
      while (encoder.encodeQueueSize > 6) await yieldToBrowser();
      if (i % 10 === 0 || i === job.frameCount - 1) {
        onProgress?.({
          phase: 'render', done: i + 1, total: job.frameCount,
          detail: `Khung ${i + 1}/${job.frameCount} · ${clock(timeMs)}/${clock(job.durationMs)} của video`,
        });
        await yieldToBrowser();
      }
    }
    await encoder.flush();
    if (failure) throw failure;
  } finally {
    if (encoder.state !== 'closed') encoder.close();
    avatar.dispose();
  }

  return {
    blob: new Blob(parts, { type: choice.format === 'H264' ? 'video/h264' : 'video/x-ivf' }),
    format: choice.format,
    codec: choice.config.codec,
    frameCount: job.frameCount,
    transparent,
    placements: timeline.placements,
    warnings: timeline.warnings,
  };
}
