import { describe, expect, it } from 'vitest';
import { mergeLog } from '../components/RecordingPlayer';
import type { PulseProctoringEvent } from '@/services/pulse.service';

const events: PulseProctoringEvent[] = [
  { kind: 'STARTED', offsetMs: 0, flagged: false },
  { kind: 'TAB_HIDDEN', offsetMs: 12_000, durationMs: 22_000, flagged: true },
  { kind: 'SUBMITTED', offsetMs: 48_000, flagged: false },
];

describe('mergeLog', () => {
  it('attaches AI notes to the event at the same time and keeps the rest as their own rows', () => {
    const rows = mergeLog(events, {
      level: 'HIGH',
      summary: 'Thời gian làm bài cực ngắn',
      items: [
        { time: '00:12', event: 'TAB_HIDDEN', note: 'Rời tab 22 giây' },
        { time: '00:48', event: 'SUBMITTED', note: 'Tốc độ gõ phím bất thường' },
        { time: '00:26', event: 'FACE_MISSING', note: 'Mất khuôn mặt 17 giây' },
      ],
    });

    expect(rows.map((r) => r.offsetMs)).toEqual([0, 12_000, 26_000, 48_000]);
    expect(rows[1]).toMatchObject({ type: 'event', notes: ['Rời tab 22 giây'] });
    expect(rows[2]).toMatchObject({ type: 'ai', item: { event: 'FACE_MISSING' } });
    expect(rows[3]).toMatchObject({ type: 'event', notes: ['Tốc độ gõ phím bất thường'] });
  });

  it('returns the plain event log without AI data', () => {
    expect(mergeLog(events, null)).toHaveLength(3);
  });
});
