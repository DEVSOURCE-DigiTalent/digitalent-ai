/**
 * Motion of a sign (schema v3.12, sign_glosses.motion_data, layout 1; docs/specs/2026-11-24-sign-language-avatar.md):
 * MediaPipe Holistic landmarks per frame as little-endian int16 — [0] flags (bit 0 pose, bit 1 left hand, bit 2 right
 * hand), 33 pose landmarks normalized to the image, 33 pose landmarks in metres, 21 left-hand and 21 right-hand
 * landmarks in metres (hand world landmarks); value = round(float × 10000). Mirrors backend `SignLanguage.MotionLayoutV1`.
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

/** One frame; a part MediaPipe did not see is null. "Left" / "right" are the signer's own hands. */
export interface MotionFrame {
  pose: Landmark[] | null;
  poseWorld: Landmark[] | null;
  leftHand: Landmark[] | null;
  rightHand: Landmark[] | null;
}

export const MOTION_LAYOUT_V1 = 1;
export const POSE_POINTS = 33;
export const HAND_POINTS = 21;
export const VALUES_PER_FRAME = 1 + (POSE_POINTS * 2 + HAND_POINTS * 2) * 3;
export const BYTES_PER_FRAME = VALUES_PER_FRAME * 2;
const SCALE = 10000;

const FLAG_POSE = 1;
const FLAG_LEFT = 2;
const FLAG_RIGHT = 4;

const quantize = (value: number) => Math.max(-32767, Math.min(32767, Math.round((Number.isFinite(value) ? value : 0) * SCALE)));

export function encodeMotion(frames: MotionFrame[]): Uint8Array {
  const bytes = new Uint8Array(frames.length * BYTES_PER_FRAME);
  const view = new DataView(bytes.buffer);
  frames.forEach((frame, f) => {
    let offset = f * BYTES_PER_FRAME;
    const hasPose = Boolean(frame.pose && frame.poseWorld);
    const flags = (hasPose ? FLAG_POSE : 0) | (frame.leftHand ? FLAG_LEFT : 0) | (frame.rightHand ? FLAG_RIGHT : 0);
    view.setInt16(offset, flags, true);
    offset += 2;
    const write = (points: Landmark[] | null, count: number) => {
      for (let i = 0; i < count; i += 1) {
        const p = points?.[i];
        view.setInt16(offset, p ? quantize(p.x) : 0, true);
        view.setInt16(offset + 2, p ? quantize(p.y) : 0, true);
        view.setInt16(offset + 4, p ? quantize(p.z) : 0, true);
        offset += 6;
      }
    };
    write(hasPose ? frame.pose : null, POSE_POINTS);
    write(hasPose ? frame.poseWorld : null, POSE_POINTS);
    write(frame.leftHand, HAND_POINTS);
    write(frame.rightHand, HAND_POINTS);
  });
  return bytes;
}

export function decodeMotion(bytes: Uint8Array, frameCount: number): MotionFrame[] {
  if (bytes.length !== frameCount * BYTES_PER_FRAME) throw new Error('Dữ liệu chuyển động không khớp số khung hình.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const frames: MotionFrame[] = [];
  for (let f = 0; f < frameCount; f += 1) {
    let offset = f * BYTES_PER_FRAME;
    const flags = view.getInt16(offset, true);
    offset += 2;
    const read = (count: number, present: boolean): Landmark[] | null => {
      const start = offset;
      offset += count * 6;
      if (!present) return null;
      const points: Landmark[] = [];
      for (let i = 0; i < count; i += 1) {
        const at = start + i * 6;
        points.push({ x: view.getInt16(at, true) / SCALE, y: view.getInt16(at + 2, true) / SCALE, z: view.getInt16(at + 4, true) / SCALE });
      }
      return points;
    };
    const pose = read(POSE_POINTS, (flags & FLAG_POSE) !== 0);
    const poseWorld = read(POSE_POINTS, (flags & FLAG_POSE) !== 0);
    const leftHand = read(HAND_POINTS, (flags & FLAG_LEFT) !== 0);
    const rightHand = read(HAND_POINTS, (flags & FLAG_RIGHT) !== 0);
    frames.push({ pose, poseWorld, leftHand, rightHand });
  }
  return frames;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Share of frames where MediaPipe saw the body and each hand — tells the admin whether the video is usable. */
export function motionCoverage(frames: MotionFrame[]): { pose: number; leftHand: number; rightHand: number } {
  const share = (test: (f: MotionFrame) => boolean) => (frames.length ? frames.filter(test).length / frames.length : 0);
  return { pose: share((f) => Boolean(f.pose)), leftHand: share((f) => Boolean(f.leftHand)), rightHand: share((f) => Boolean(f.rightHand)) };
}
