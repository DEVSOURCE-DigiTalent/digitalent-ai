import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LandingAudioControl } from '../landing/components/LandingAudioControl';
import { LANDING_AUDIO } from '../landing/landing-audio';
import { LandingPage } from '../pages/LandingPage';
import { useCurrentUser } from '@/hooks/use-current-user';

describe('LandingAudioControl', () => {
  let play: any;
  let pause: any;

  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts silent and does not preload the track', () => {
    const { container } = render(<LandingAudioControl />);

    expect(screen.getByRole('button', { name: 'Nhạc nền' })).toHaveAttribute('aria-pressed', 'false');
    const audio = container.querySelector('audio');
    expect(audio).not.toHaveAttribute('src');
    expect(audio).toHaveAttribute('preload', 'none');
    expect(audio).toHaveAttribute('loop');
    expect(play).not.toHaveBeenCalled();
  });

  it('plays at a quiet volume after an explicit click and can be stopped again', async () => {
    const { container } = render(<LandingAudioControl />);

    fireEvent.click(screen.getByRole('button', { name: 'Nhạc nền' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Nhạc nền' })).toHaveAttribute('aria-pressed', 'true'));
    expect(play).toHaveBeenCalledTimes(1);
    expect((container.querySelector('audio') as HTMLAudioElement).volume).toBe(LANDING_AUDIO.volume);
    expect(container.querySelector('audio')).toHaveAttribute('src', LANDING_AUDIO.src);

    fireEvent.click(screen.getByRole('button', { name: 'Nhạc nền' }));

    expect(pause).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Nhạc nền' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('stays stopped and announces when the browser rejects playback', async () => {
    play.mockRejectedValueOnce(new DOMException('Playback blocked', 'NotAllowedError'));
    render(<LandingAudioControl />);

    fireEvent.click(screen.getByRole('button', { name: 'Nhạc nền' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Trình duyệt chưa thể phát nhạc. Hãy thử lại.');
    expect(screen.getByRole('button', { name: 'Nhạc nền' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('stops and announces a media loading error without affecting the page', () => {
    const { container } = render(<LandingAudioControl />);
    const audio = container.querySelector('audio') as HTMLAudioElement;

    fireEvent.error(audio);

    expect(screen.getByRole('status')).toHaveTextContent('Không tải được nhạc nền. Trang vẫn hoạt động bình thường.');
    expect(screen.getByRole('button', { name: 'Nhạc nền' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('pauses when the page becomes hidden and does not resume by itself', async () => {
    const originalHidden = Object.getOwnPropertyDescriptor(document, 'hidden');
    const { container } = render(<LandingAudioControl />);
    fireEvent.click(screen.getByRole('button', { name: 'Nhạc nền' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Nhạc nền' })).toHaveAttribute('aria-pressed', 'true'));

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(pause).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Nhạc nền' })).toHaveAttribute('aria-pressed', 'false');
    expect((container.querySelector('audio') as HTMLAudioElement).paused).toBe(true);

    if (originalHidden) Object.defineProperty(document, 'hidden', originalHidden);
    else delete (document as { hidden?: boolean }).hidden;
  });
});

describe('LandingPage audio integration', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('exposes one independent music control across the full landing page', () => {
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    const music = container.querySelector('audio') as HTMLAudioElement;
    const playMusic = vi.spyOn(music, 'play').mockResolvedValue(undefined);

    expect(screen.getAllByRole('button', { name: 'Nhạc nền' })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: /chuyển động nền/ }));
    expect(playMusic).not.toHaveBeenCalled();
  });
});
