import { describe, expect, it } from 'vitest';
import { FACE_RULES, FaceSignalTracker, headPose, type FaceEpisode, type FaceObservation } from '../exam/face-signals';

/** Đưa cùng một quan sát mỗi 500 ms trong khoảng [from, to). */
function feed(tracker: FaceSignalTracker, o: FaceObservation, from: number, to: number): FaceEpisode[] {
  const out: FaceEpisode[] = [];
  for (let t = from; t < to; t += 500) out.push(...tracker.observe(o, t));
  return out;
}

const one = { faces: 1, yaw: 5, pitch: 5 };

describe('FaceSignalTracker', () => {
  it('reports an absence once it lasted long enough, with its start and duration', () => {
    const tracker = new FaceSignalTracker();
    feed(tracker, one, 0, 2000);
    expect(feed(tracker, { faces: 0 }, 2000, 7000)).toEqual([]);
    expect(tracker.active(6500)).toBe('FACE_MISSING');

    const closed = feed(tracker, one, 7000, 9000);
    expect(closed).toEqual([{ kind: 'FACE_MISSING', start: 2000, durationMs: 4500, detail: null }]);
    expect(tracker.active(8500)).toBeNull();
  });

  it('ignores short drops and single missed frames', () => {
    const tracker = new FaceSignalTracker();
    // 2 s vắng mặt: dưới ngưỡng 3 s.
    expect([...feed(tracker, { faces: 0 }, 0, 2000), ...feed(tracker, one, 2000, 5000)]).toEqual([]);
    // Một khung hình hụt giữa hai khuôn mặt không khép khoảng "nhiều người".
    const multi = [
      ...feed(tracker, { faces: 2 }, 5000, 6500),
      ...feed(tracker, { faces: 1 }, 6500, 7000),
      ...feed(tracker, { faces: 2 }, 7000, 8000),
      ...feed(tracker, one, 8000, 10_000),
    ];
    expect(multi).toEqual([{ kind: 'MULTIPLE_FACES', start: 5000, durationMs: 2500, detail: '2 khuôn mặt' }]);
  });

  it('flags looking away only for one face turned beyond the threshold', () => {
    const tracker = new FaceSignalTracker();
    const turned = { faces: 1, yaw: FACE_RULES.yawDeg + 10, pitch: 0 };
    feed(tracker, turned, 0, 5000);
    expect(tracker.pause()).toEqual([{ kind: 'LOOKING_AWAY', start: 0, durationMs: 4500, detail: 'Quay đầu sang ngang' }]);

    const down = { faces: 1, yaw: 0, pitch: FACE_RULES.pitchDeg + 5 };
    feed(tracker, down, 10_000, 15_000);
    expect(tracker.pause()[0]).toEqual(expect.objectContaining({ kind: 'LOOKING_AWAY', detail: 'Cúi hoặc ngẩng đầu' }));
  });

  it('pause closes open episodes at the last frame that matched', () => {
    const tracker = new FaceSignalTracker();
    feed(tracker, { faces: 0 }, 0, 4000);
    expect(tracker.pause()).toEqual([{ kind: 'FACE_MISSING', start: 0, durationMs: 3500, detail: null }]);
    expect(tracker.pause()).toEqual([]);
  });

  it('stops reporting after the per-session cap', () => {
    const tracker = new FaceSignalTracker();
    let count = 0;
    for (let i = 0; i < FACE_RULES.maxEpisodes + 5; i++) {
      const at = i * 10_000;
      feed(tracker, { faces: 2 }, at, at + 2500);
      count += tracker.pause().length;
    }
    expect(count).toBe(FACE_RULES.maxEpisodes);
  });
});

describe('headPose', () => {
  const rotY = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    // Ma trận 4×4 theo cột của phép quay quanh trục Y.
    return [Math.cos(r), 0, -Math.sin(r), 0, 0, 1, 0, 0, Math.sin(r), 0, Math.cos(r), 0, 0, 0, -40, 1];
  };
  const rotX = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    return [1, 0, 0, 0, 0, Math.cos(r), Math.sin(r), 0, 0, -Math.sin(r), Math.cos(r), 0, 0, 0, -40, 1];
  };

  it('reads yaw and pitch magnitudes from the face transform', () => {
    expect(headPose(rotY(40))!.yaw).toBeCloseTo(40);
    expect(headPose(rotY(-40))!.yaw).toBeCloseTo(40);
    expect(headPose(rotY(40))!.pitch).toBeCloseTo(0);
    expect(headPose(rotX(-30))!.pitch).toBeCloseTo(30);
    expect(headPose(rotX(-30))!.yaw).toBeCloseTo(0);
  });

  it('rejects a malformed matrix', () => {
    expect(headPose([1, 2, 3])).toBeNull();
  });
});
