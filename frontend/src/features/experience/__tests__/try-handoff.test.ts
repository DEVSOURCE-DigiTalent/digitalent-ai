import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildTryHandoff, clearTryHandoff, readTryHandoff, toTryOrientation, writeTryHandoff,
} from '../individual-trial/try-handoff';

const KEY = 'dt-try-handoff';
const NOW = new Date('2026-10-06T08:00:00.000Z');

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('buildTryHandoff', () => {
  it('carries only the position and the time', () => {
    expect(buildTryHandoff('ACCOUNTANT', NOW)).toEqual({ positionCode: 'ACCOUNTANT', completedAt: NOW.toISOString() });
  });
});

describe('write / read / clear', () => {
  it('round-trips through session storage', () => {
    const handoff = buildTryHandoff('MARKETING', NOW);

    writeTryHandoff(handoff);

    expect(readTryHandoff()).toEqual(handoff);
    clearTryHandoff();
    expect(readTryHandoff()).toBeNull();
  });

  it.each([
    ['not JSON', '{oops'],
    ['not an object', '"text"'],
    ['an unknown position', JSON.stringify({ positionCode: 'NOPE', completedAt: NOW.toISOString() })],
    ['without a date', JSON.stringify({ positionCode: 'HR' })],
    ['with an invalid date', JSON.stringify({ positionCode: 'HR', completedAt: 'tomorrow' })],
  ])('ignores stored data that is %s', (_label, raw) => {
    sessionStorage.setItem(KEY, raw);

    expect(readTryHandoff()).toBeNull();
  });

  it('drops score counts that do not add up but keeps the position', () => {
    sessionStorage.setItem(KEY, JSON.stringify({ positionCode: 'HR', completedAt: NOW.toISOString(), correct: 9, total: 6 }));

    expect(readTryHandoff()).toEqual({ positionCode: 'HR', completedAt: NOW.toISOString() });
  });

  it('survives blocked storage without throwing', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => writeTryHandoff({ positionCode: 'HR', completedAt: NOW.toISOString() })).not.toThrow();
    expect(readTryHandoff()).toBeNull();
    expect(() => clearTryHandoff()).not.toThrow();
  });
});

describe('toTryOrientation', () => {
  it('is defined only when the hand-over has a score', () => {
    expect(toTryOrientation(null)).toBeUndefined();
    expect(toTryOrientation({ positionCode: 'HR', completedAt: NOW.toISOString() })).toBeUndefined();
    expect(toTryOrientation({ positionCode: 'HR', completedAt: NOW.toISOString(), correct: 4, total: 6 })).toEqual({
      positionCode: 'HR',
      completedAt: NOW.toISOString(),
      correct: 4,
      total: 6,
    });
  });
});
