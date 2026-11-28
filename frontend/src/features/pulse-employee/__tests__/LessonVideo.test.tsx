import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { LessonVideo } from '../components/LessonVideo';
import { LessonSlide } from '../components/LessonSlide';

describe('Video bài giảng có ngôn ngữ ký hiệu (người khiếm thính)', () => {
  it('is a plain video, with no text captions, when there is no sign-language video', () => {
    const { container } = render(<LessonVideo src="/video.mp4" title="Bài 1" />);
    expect(container.querySelector('video')!.getAttribute('src')).toBe('/video.mp4');
    expect(container.querySelector('track')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('switches to the published sign-language video at the same moment, and back', () => {
    window.localStorage.removeItem('dt-sign-video');
    const signVideo = { url: 'platform/assets/s1/content?exp=1&sig=x', mode: 'OVERLAY' as const, signLanguage: 'VSL', region: 'VN' };
    const { container } = render(<LessonVideo src="/video.mp4" signVideo={signVideo} title="Bài 1" />);

    expect(screen.getByText('Có ngôn ngữ ký hiệu')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Phụ đề|lời thoại/ })).toBeNull();
    const toggle = screen.getByRole('button', { name: /Ngôn ngữ ký hiệu: Tắt/ });
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    const lesson = container.querySelector('video')!;
    lesson.currentTime = 42;

    fireEvent.click(toggle);

    const signed = container.querySelector('video')!;
    expect(signed.getAttribute('src')).toContain('platform/assets/s1/content');
    expect(signed.getAttribute('aria-label')).toBe('Video bài giảng có ngôn ngữ ký hiệu: Bài 1');
    expect(container.querySelector('track')).toBeNull();
    fireEvent.loadedMetadata(signed);
    expect(signed.currentTime).toBe(42);
    expect(screen.getByRole('button', { name: /Ngôn ngữ ký hiệu: Bật/ }).getAttribute('aria-pressed')).toBe('true');
    expect(window.localStorage.getItem('dt-sign-video')).toBe('on');

    fireEvent.click(screen.getByRole('button', { name: /Ngôn ngữ ký hiệu: Bật/ }));
    expect(container.querySelector('video')!.getAttribute('src')).toBe('/video.mp4');
    window.localStorage.removeItem('dt-sign-video');
  });

  it('shows a signer track over the lesson video', () => {
    window.localStorage.setItem('dt-sign-video', 'on');
    const signVideo = { url: 'platform/assets/s2/content', mode: 'TRACK_ONLY' as const, signLanguage: 'VSL', region: 'VN' };
    const { container } = render(<LessonVideo src="/video.mp4" signVideo={signVideo} title="Bài 1" />);

    const videos = container.querySelectorAll('video');
    expect(videos).toHaveLength(2);
    expect(videos[0].getAttribute('src')).toBe('/video.mp4');
    expect(screen.getByLabelText('Người ra dấu ngôn ngữ ký hiệu').getAttribute('src')).toContain('platform/assets/s2/content');
    expect((screen.getByLabelText('Người ra dấu ngôn ngữ ký hiệu') as HTMLVideoElement).muted).toBe(true);
    window.localStorage.removeItem('dt-sign-video');
  });

  it('passes the sign-language video of the lesson page to the player', () => {
    const { container } = render(<LessonSlide index={0} count={1} slide={{
      lessonId: 'video-2', title: 'Giới thiệu', lessonType: 'VIDEO', estimatedMinutes: 3, contentBody: 'Nội dung',
      media: [{ kind: 'VIDEO', url: 'platform/assets/v1/content', alt: 'Video', signLanguage: { url: 'platform/assets/s1/content', mode: 'OVERLAY', signLanguage: 'VSL', region: 'VN' } }],
    }} />);
    expect(container.querySelector('video')).toBeTruthy();
    expect(container.querySelector('track')).toBeNull();
    expect(screen.getByRole('button', { name: /Ngôn ngữ ký hiệu/ })).toBeTruthy();
  });
});
