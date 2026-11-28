import { describe, expect, it } from 'vitest';
import { cameraFor, CORNER_FRAMING } from '../avatar-framing';

const FOV = 26;
const HEAD = 1.4;
const HIPS = 0.9;
const TORSO = HEAD - HIPS;
const tan = Math.tan((FOV * Math.PI) / 360);

/** What the camera sees on the avatar's plane (z = 0): left, right, bottom and top edges. */
function view(camera: { x: number; y: number; z: number }, aspect: number) {
  const halfH = camera.z * tan;
  const halfW = halfH * aspect;
  return { left: camera.x - halfW, right: camera.x + halfW, bottom: camera.y - halfH, top: camera.y + halfH };
}

describe('Khung hình nhân vật 3D nền trong suốt ở góc video', () => {
  it('đứng sát góc trái: cắt ngang hông ở mép dưới, thân gần mép trái, chừa chỗ cho tay ở trên và phía giữa', () => {
    const aspect = 480 / 540;
    const seen = view(cameraFor('corner-left', HEAD, HIPS, aspect, FOV), aspect);

    expect(seen.bottom).toBeCloseTo(HIPS - TORSO * CORNER_FRAMING.below);
    expect(seen.left).toBeCloseTo(-TORSO * CORNER_FRAMING.edgeRoom);
    expect(seen.right).toBeGreaterThanOrEqual(TORSO * CORNER_FRAMING.farRoom - 1e-9);
    expect(seen.top).toBeGreaterThanOrEqual(HEAD + TORSO * CORNER_FRAMING.above - 1e-9);
  });

  it('góc phải là ảnh đối xứng của góc trái, khung hẹp vẫn đủ chỗ cho tay', () => {
    const left = cameraFor('corner-left', HEAD, HIPS, 0.6, FOV);
    const right = cameraFor('corner-right', HEAD, HIPS, 0.6, FOV);
    expect(right.x).toBeCloseTo(-left.x);
    expect(right.y).toBeCloseTo(left.y);

    const seen = view(left, 0.6);
    expect(seen.left).toBeCloseTo(-TORSO * CORNER_FRAMING.edgeRoom);
    expect(seen.right).toBeGreaterThanOrEqual(TORSO * CORNER_FRAMING.farRoom - 1e-9);
    expect(seen.bottom).toBeCloseTo(HIPS - TORSO * CORNER_FRAMING.below);
  });

  it('giữ nguyên khung giữa của nền đặc và xem trước', () => {
    expect(cameraFor('signing', HEAD, HIPS, 1, FOV).x).toBe(0);
    expect(cameraFor('preview', HEAD, HIPS, 1, FOV).y).toBeCloseTo((HEAD + HIPS) / 2 + 0.1);
  });
});
