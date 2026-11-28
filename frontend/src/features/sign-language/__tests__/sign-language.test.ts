import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import {
  base64ToBytes,
  bytesToBase64,
  BYTES_PER_FRAME,
  decodeMotion,
  encodeMotion,
  motionCoverage,
  type Landmark,
  type MotionFrame,
} from '../motion-format';
import { buildClip, sampleClip, solveFrame } from '../sign-rig';
import { glossFromFileName } from '@/features/platform/sign-dictionary/sign-labels';

const P = (x: number, y: number, z = 0): Landmark => ({ x, y, z });

/** MediaPipe world landmarks of a signer facing the camera (x → image right = signer's left, y down). */
function body(rightElbow: Landmark, rightWrist: Landmark): MotionFrame {
  const world = Array.from({ length: 33 }, () => P(0, 0));
  world[11] = P(0.18, -0.45); world[13] = P(0.21, -0.2); world[15] = P(0.22, 0.03);
  world[12] = P(-0.18, -0.45); world[14] = rightElbow; world[16] = rightWrist;
  world[23] = P(0.1, 0); world[24] = P(-0.1, 0);
  return { pose: world.map((p) => P(0.5 + p.x, 0.6 + p.y)), poseWorld: world, leftHand: null, rightHand: null };
}

/** Direction the rest arm (VRM 0 T-pose: right arm along +X, left along −X) points after a rotation. */
const pointing = (q: { x: number; y: number; z: number; w: number } | undefined, rest: Vector3) =>
  rest.clone().applyQuaternion(q as never);

describe('sign motion format', () => {
  it('round-trips landmarks through int16, keeps missing parts missing and survives base64', () => {
    const frames: MotionFrame[] = [
      { pose: Array.from({ length: 33 }, (_, i) => P(i / 100, 0.5, -0.12345)), poseWorld: Array.from({ length: 33 }, () => P(-0.3, 0.2, 0.05)), leftHand: null, rightHand: Array.from({ length: 21 }, () => P(0.01, -0.02, 0.003)) },
      { pose: null, poseWorld: null, leftHand: Array.from({ length: 21 }, () => P(5, -5, 0)), rightHand: null },
    ];
    const bytes = encodeMotion(frames);
    expect(bytes.length).toBe(2 * BYTES_PER_FRAME);
    expect(BYTES_PER_FRAME).toBe(650);
    const decoded = decodeMotion(base64ToBytes(bytesToBase64(bytes)), 2);
    expect(decoded[0].pose![10].x).toBeCloseTo(0.1, 4);
    expect(decoded[0].pose![0].z).toBeCloseTo(-0.1234, 3); // quantized to 1/10000
    expect(decoded[0].leftHand).toBeNull();
    expect(decoded[0].rightHand![3].z).toBeCloseTo(0.003, 4);
    expect(decoded[1].pose).toBeNull();
    expect(decoded[1].leftHand![0].x).toBeCloseTo(3.2767, 4); // clamped to the int16 range
    expect(motionCoverage(decoded)).toEqual({ pose: 0.5, leftHand: 0.5, rightHand: 0.5 });
    expect(() => decodeMotion(bytes, 3)).toThrow();
  });

  it('names a sign after its video file', () => {
    expect(glossFromFileName('xin_chao.mp4')).toBe('xin chao');
    expect(glossFromFileName('Bảng-tính  Excel.MOV'.normalize('NFD'))).toBe('Bảng tính Excel');
  });
});

describe('sign rig', () => {
  it('points the avatar arm where the signer points it, on the same side (not a mirror)', () => {
    const down = solveFrame(body(P(-0.21, -0.2), P(-0.22, 0.03)), false);
    const rightDown = pointing(down.rightUpperArm, new Vector3(1, 0, 0));
    expect(rightDown.y).toBeLessThan(-0.9);

    // The signer's RIGHT arm straight out to the side: the avatar's right upper arm stays along +X (its T-pose).
    const out = solveFrame(body(P(-0.45, -0.45), P(-0.7, -0.45)), false);
    expect(pointing(out.rightUpperArm, new Vector3(1, 0, 0)).x).toBeGreaterThan(0.99);
    expect(pointing(out.leftUpperArm, new Vector3(-1, 0, 0)).y).toBeLessThan(-0.9); // the left arm stays down

    // Forearm up from a horizontal upper arm: the lower arm, in the upper arm's frame, points up.
    const bent = solveFrame(body(P(-0.45, -0.45), P(-0.45, -0.72)), false);
    expect(pointing(bent.rightLowerArm, new Vector3(1, 0, 0)).y).toBeGreaterThan(0.99);
  });

  it('reads a mirrored source video as the signer\'s own hands', () => {
    // In a mirrored video the raised arm is on the signer's left landmarks; the avatar must raise its right arm.
    const frame = body(P(-0.21, -0.2), P(-0.22, 0.03));
    frame.poseWorld![13] = P(0.45, -0.45);
    frame.poseWorld![15] = P(0.7, -0.45);
    const bones = solveFrame(frame, true);
    expect(pointing(bones.rightUpperArm, new Vector3(1, 0, 0)).x).toBeGreaterThan(0.99);
  });

  it('holds a part the camera missed and interpolates between frames', () => {
    const up = body(P(-0.45, -0.45), P(-0.7, -0.45));
    const lost: MotionFrame = { pose: null, poseWorld: null, leftHand: null, rightHand: null };
    const clip = buildClip([up, lost, up], 10, false, 0);
    expect(clip.durationMs).toBe(300);
    expect(clip.frames[1].rightUpperArm.angleTo(clip.frames[0].rightUpperArm)).toBeLessThan(1e-6);
    const middle = sampleClip(clip, 50);
    expect(Object.keys(middle)).toContain('rightLowerArm');
  });
});
