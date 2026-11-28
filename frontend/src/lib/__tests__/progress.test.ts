import { describe, expect, it } from 'vitest';
import { percentOf, remainingLabel, weighted } from '../progress';

describe('Tiến độ của một lần chờ', () => {
  it('gives a whole percent, never above 100, 0 when the total is unknown', () => {
    expect(percentOf(512, 2048)).toBe(25);
    expect(percentOf(2049, 2048)).toBe(100);
    expect(percentOf(10, 0)).toBe(0);
    expect(percentOf(Number.NaN, 10)).toBe(0);
    expect(weighted([{ weight: 1, percent: 100 }, { weight: 3, percent: 0 }])).toBe(25);
  });

  it('estimates the time left from the speed so far, and says so while it cannot yet', () => {
    const start = 1_000_000;
    expect(remainingLabel(start, 1, start + 10_000)).toBe('đang ước tính thời gian còn lại');
    expect(remainingLabel(start, 50, start + 1_000)).toBe('đang ước tính thời gian còn lại');
    expect(remainingLabel(null, 50)).toBe('đang ước tính thời gian còn lại');
    expect(remainingLabel(start, 25, start + 10_000)).toBe('còn khoảng 30 giây');
    expect(remainingLabel(start, 10, start + 30_000)).toBe('còn khoảng 4 phút 30 giây');
    expect(remainingLabel(start, 50, start + 120_000)).toBe('còn khoảng 2 phút');
    expect(remainingLabel(new Date(start).toISOString(), 80, start + 8_000)).toBe('còn khoảng 2 giây');
    expect(remainingLabel(start, 100, start + 5_000)).toBe('sắp xong');
  });
});
