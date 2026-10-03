import { describe, it, expect } from 'vitest';
import { revealOpacity, revealProgress, splitRevealText } from '../landing/reveal-text';

describe('splitRevealText', () => {
  it('keeps each Vietnamese letter whole even when the source is decomposed', () => {
    const words = splitRevealText('Thông tư'.normalize('NFD'));

    expect(words).toEqual([['T', 'h', 'ô', 'n', 'g'], ['t', 'ư']]);
  });

  it('collapses runs of whitespace and ignores surrounding spaces', () => {
    expect(splitRevealText('  6 miền \n  24   năng lực ')).toEqual([['6'], ['m', 'i', 'ề', 'n'], ['2', '4'], ['n', 'ă', 'n', 'g'], ['l', 'ự', 'c']]);
  });

  it('returns no words for blank text', () => {
    expect(splitRevealText('   ')).toEqual([]);
  });
});

describe('revealProgress', () => {
  it('starts when the block top reaches 80% of the viewport', () => {
    expect(revealProgress(800, 400, 1000)).toBe(0);
  });

  it('ends when the block bottom reaches 20% of the viewport', () => {
    expect(revealProgress(200 - 400, 400, 1000)).toBe(1);
  });

  it('stays within 0 and 1 outside that range', () => {
    expect(revealProgress(2000, 400, 1000)).toBe(0);
    expect(revealProgress(-5000, 400, 1000)).toBe(1);
  });
});

describe('revealOpacity', () => {
  it('dims characters the scroll has not reached', () => {
    expect(revealOpacity(0, 10, 20)).toBeCloseTo(0.2);
  });

  it('shows the first character as soon as the reveal starts moving', () => {
    expect(revealOpacity(0.05, 0, 100)).toBe(1);
  });

  it('fully reveals the last character before the block leaves the viewport', () => {
    expect(revealOpacity(0.95, 99, 100)).toBe(1);
  });

  it('shows everything when there is nothing to stagger', () => {
    expect(revealOpacity(0, 0, 0)).toBe(1);
  });
});
