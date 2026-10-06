import { describe, expect, it } from 'vitest';
import { resolveCourseMedia } from '../course-media';

describe('resolveCourseMedia', () => {
  it('turns supported video links into safe player sources', () => {
    expect(resolveCourseMedia('https://youtu.be/dQw4w9WgXcQ')).toEqual({
      kind: 'embed', url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    });
    expect(resolveCourseMedia('https://cdn.example.com/lesson.mp4?token=demo')).toEqual({
      kind: 'file', url: 'https://cdn.example.com/lesson.mp4?token=demo',
    });
  });

  it('keeps text and unsupported links out of the video frame', () => {
    expect(resolveCourseMedia('Nội dung bài học là văn bản')).toBeNull();
    expect(resolveCourseMedia('javascript:alert(1)')).toBeNull();
    expect(resolveCourseMedia('https://example.com/lesson')).toBeNull();
  });
});
