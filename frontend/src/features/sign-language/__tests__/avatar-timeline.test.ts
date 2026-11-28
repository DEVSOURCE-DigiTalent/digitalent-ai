import { describe, expect, it } from 'vitest';
import { Quaternion } from 'three';
import type { Landmark, MotionFrame } from '../motion-format';
import { restPose, type MotionClip } from '../sign-rig';
import {
  AVATAR_TIMING,
  activeRange,
  blinkAt,
  createPoseSampler,
  ease,
  planAvatarTimeline,
  spokenWeight,
  withIdle,
  type TimelineSegment,
} from '../avatar-timeline';
import { ivfFrameHeader, ivfHeader, parseFrameRate } from '../avatar-track-render';

/** A body standing, the wrists at `raise` torso lengths above the hips (y down, hips at 0, shoulders at -0.5). */
function body(raise: number): MotionFrame {
  const world: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0 }));
  world[11] = { x: 0.2, y: -0.5, z: 0 };
  world[12] = { x: -0.2, y: -0.5, z: 0 };
  world[23] = { x: 0.1, y: 0, z: 0 };
  world[24] = { x: -0.1, y: 0, z: 0 };
  world[15] = { x: 0.2, y: -0.5 * raise, z: 0 };
  world[16] = { x: -0.2, y: 0.05, z: 0 };
  return { pose: world, poseWorld: world, leftHand: null, rightHand: null };
}

describe('Phần đang ra dấu của một chuyển động', () => {
  it('leaves out the idle start and end of a dictionary video', () => {
    const frames = [...Array(10).fill(0), ...Array(20).fill(0.8), ...Array(10).fill(0.05)].map(body);
    expect(activeRange(frames, 20)).toEqual({ start: 8, end: 32 });
  });

  it('keeps only the first performance when the dictionary video shows the sign twice, short dips included', () => {
    const twice = [...Array(10).fill(0), ...Array(20).fill(0.8), ...Array(20).fill(0.05), ...Array(20).fill(0.8), ...Array(5).fill(0)].map(body);
    expect(activeRange(twice, 20)).toEqual({ start: 8, end: 32 });
    const dip = [...Array(5).fill(0), ...Array(10).fill(0.8), ...Array(6).fill(0.1), ...Array(10).fill(0.8), ...Array(5).fill(0)].map(body);
    expect(activeRange(dip, 20)).toEqual({ start: 3, end: 33 });
  });

  it('keeps the whole motion when nothing is clearly raised or the signing part is too short', () => {
    expect(activeRange(Array(30).fill(0).map(body), 20)).toEqual({ start: 0, end: 30 });
    expect(activeRange([...Array(20).fill(0), 0.9, ...Array(20).fill(0)].map(body), 20)).toEqual({ start: 0, end: 41 });
  });
});

describe('Xếp ký hiệu theo lời nói', () => {
  const segment = (index: number, startMs: number, endMs: number, words: [string, string | null][]): TimelineSegment => ({
    index, startMs, endMs, items: words.map(([sourceText, glossId], itemIndex) => ({ itemIndex, sourceText, glossId, durationMs: null })),
  });

  it('starts each sign when its word is spoken, after the previous one, never overlapping', () => {
    const { placements, warnings } = planAvatarTimeline(
      [segment(0, 1000, 5000, [['Chào', 'a'], ['mừng', null], ['các', null], ['bạn', 'b']])],
      () => 800,
      { durationMs: 10_000, maxSpeedup: 1.5 },
    );
    expect(warnings).toEqual([]);
    expect(placements.map((p) => [p.glossId, p.startMs, p.endMs, p.speed])).toEqual([
      // The first word opens the sentence: its sign starts a little before, the hands in place as it is heard.
      ['a', 1000 - AVATAR_TIMING.leadMs, 1800 - AVATAR_TIMING.leadMs, 1],
      // "bạn" is the 4th of 4 syllables: spoken at 1000 + 3/4 × 4000 = 4000, signed a little before.
      ['b', 4000 - AVATAR_TIMING.leadMs, 4000 - AVATAR_TIMING.leadMs + 800, 1],
    ]);
  });

  it('plays the signs faster to fit before the next sentence, and runs on rather than cutting a sign', () => {
    const fit = planAvatarTimeline(
      [segment(0, 0, 2000, [['một', 'a'], ['hai', 'b']]), segment(1, 3000, 4000, [['ba', 'c']])],
      () => 1800,
      { durationMs: 10_000, maxSpeedup: 1.5 },
    );
    const [a, b, c] = fit.placements;
    expect(b.endMs).toBeLessThanOrEqual(3000);
    expect(b.startMs).toBeGreaterThanOrEqual(a.endMs + AVATAR_TIMING.gapMs);
    expect(a.speed).toBeGreaterThan(1);
    expect(c.startMs).toBeGreaterThanOrEqual(3000 - AVATAR_TIMING.leadMs);

    const tooLong = planAvatarTimeline(
      [segment(0, 0, 500, [['một', 'a'], ['hai', 'b'], ['ba', 'c']]), segment(1, 1000, 2000, [['bốn', 'd']])],
      () => 1500,
      { durationMs: 20_000, maxSpeedup: 1.5 },
    );
    expect(tooLong.placements.every((p) => p.speed <= 1.5)).toBe(true);
    // Every sign played whole (1500 / speed), none dropped.
    expect(tooLong.placements.map((p) => Math.round((p.endMs - p.startMs) * p.speed / 10))).toEqual([150, 150, 150, 150]);
    expect(tooLong.warnings[0]).toContain('Câu 1');
    tooLong.placements.slice(1).forEach((p, i) => expect(p.startMs).toBeGreaterThan(tooLong.placements[i].endMs));
  });

  it('leaves out a sign the end of the video would cut in half', () => {
    const { placements, warnings } = planAvatarTimeline(
      [segment(0, 0, 900, [['một', 'a'], ['hai', 'b']])],
      () => 1500,
      // "hai" would start at 1180 ms and need 1000 ms: only 420 ms are left.
      { durationMs: 1600, maxSpeedup: 1.5 },
    );
    expect(placements.map((p) => p.glossId)).toEqual(['a']);
    expect(warnings.some((w) => w.includes('“hai”'))).toBe(true);
  });

  it('counts the syllables of foreign words', () => {
    expect(spokenWeight('khóa học')).toBe(2);
    expect(spokenWeight('marketing')).toBe(3);
    expect(spokenWeight('AI')).toBe(1);
  });
});

describe('Tư thế nhân vật theo thời gian', () => {
  const clip = (angle: number): MotionClip => ({
    fps: 10, durationMs: 1000,
    frames: Array.from({ length: 10 }, () => ({ rightUpperArm: new Quaternion().setFromAxisAngle({ x: 0, y: 0, z: -1 } as never, angle) })),
  });
  const angleOf = (q: Quaternion | undefined) => (q ? 2 * Math.acos(Math.min(1, Math.abs(q.w))) : 0);
  const sign = (startMs: number, angle: number) => ({
    segmentIndex: 0, itemIndex: 0, glossId: 'g', startMs, endMs: startMs + 1000, speed: 1, sourceMs: 1000, clip: clip(angle),
  });

  it('moves smoothly from one sign to the next, and rests with the arms down in a long pause', () => {
    const poseAt = createPoseSampler([sign(1000, 0.4), sign(2400, 1.2), sign(6000, 0.4)]);
    const rest = angleOf(restPose().rightUpperArm);
    expect(angleOf(poseAt(0).rightUpperArm)).toBeCloseTo(rest, 3);
    expect(angleOf(poseAt(1500).rightUpperArm)).toBeCloseTo(0.4, 3);
    // Halfway between two close signs: halfway between their poses.
    expect(angleOf(poseAt(2200).rightUpperArm)).toBeCloseTo(0.8, 2);
    expect(angleOf(poseAt(4500).rightUpperArm)).toBeCloseTo(rest, 3);
    // Never a jump (a cut would move the arm 0.8 rad at once): consecutive frames at 30 fps stay close.
    let previous = angleOf(poseAt(0).rightUpperArm);
    for (let t = 0; t < 7500; t += 1000 / 30) {
      const now = angleOf(poseAt(t).rightUpperArm);
      expect(Math.abs(now - previous)).toBeLessThan(0.2);
      previous = now;
    }
  });

  it('breathes and blinks, so a resting avatar never looks frozen', () => {
    expect(withIdle({}, 1000).chest).toBeDefined();
    expect(angleOf(withIdle({}, 1000).chest)).not.toBeCloseTo(angleOf(withIdle({}, 2000).chest), 4);
    const blinks = Array.from({ length: 2000 }, (_, i) => blinkAt(i * 10)).filter((v) => v > 0.5).length;
    expect(blinks).toBeGreaterThan(20);
    expect(blinks).toBeLessThan(200);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
  });
});

describe('Tệp track nhân vật', () => {
  it('reads the frame rate of the lesson video and writes IVF headers FFmpeg reads', () => {
    expect(parseFrameRate('30000/1001').fps).toBeCloseTo(29.97, 2);
    expect(parseFrameRate('25')).toEqual({ num: 25, den: 1, fps: 25 });
    expect(() => parseFrameRate('0/0')).toThrow();

    const header = ivfHeader('VP90', 480, 540, { num: 25, den: 1 }, 150);
    expect(String.fromCharCode(...header.slice(0, 4))).toBe('DKIF');
    expect(String.fromCharCode(...header.slice(8, 12))).toBe('VP90');
    const view = new DataView(header.buffer);
    expect([view.getUint16(6, true), view.getUint16(12, true), view.getUint16(14, true), view.getUint32(16, true), view.getUint32(20, true)])
      .toEqual([32, 480, 540, 25, 1]);
    const frame = new DataView(ivfFrameHeader(1234, 7).buffer);
    expect([frame.getUint32(0, true), frame.getUint32(4, true)]).toEqual([1234, 7]);
  });
});
