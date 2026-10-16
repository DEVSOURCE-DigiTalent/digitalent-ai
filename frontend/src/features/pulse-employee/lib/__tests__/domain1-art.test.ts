import { describe, expect, it } from 'vitest';
import { domain1SlideArt } from '../domain1-art';

describe('Domain I slide art', () => {
  it('maps every slide of the three current course levels to a distinct image', () => {
    const images = ['F', 'I', 'A'].flatMap((tier) =>
      [0, 1, 2].flatMap((module) =>
        Array.from({ length: 11 }, (_, slide) => domain1SlideArt(`A1-${tier}`, module, slide, 11)),
      ),
    );
    expect(images).toHaveLength(99);
    expect(images.every(Boolean)).toBe(true);
    expect(new Set(images).size).toBe(99);
    expect(domain1SlideArt('M1-F', 0, 0, 11)).toBe(images[0]);
  });

  it('keeps the legacy course art for earlier versions and other domains', () => {
    expect(domain1SlideArt('A1-F', 0, 0, 3)).toBeNull();
    expect(domain1SlideArt('A2-F', 0, 0, 11)).toBeNull();
  });
});
