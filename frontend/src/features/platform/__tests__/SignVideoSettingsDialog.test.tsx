import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { SignLanguageVideo, SignVideoPrerequisites } from '@/services/sign-language-video.service';
import { SignVideoSettingsDialog } from '../builder/SignVideoSettingsDialog';

const prerequisites = (patch: Partial<SignVideoPrerequisites> = {}): SignVideoPrerequisites => ({
  isLessonVideo: true, hasCaptions: true, hasPublishedCaptions: false, hasDraftCaptions: true, captionsProcessing: false,
  dictionarySigns: 12, usableSigns: 10, usableMotionSigns: 6,
  rendererAvailable: true, rendererMessage: null, avatarRendererAvailable: true, avatarRendererMessage: null,
  ...patch,
});

const data = (patch: Partial<SignVideoPrerequisites> = {}, settings: SignLanguageVideo['settings'] = null) =>
  ({ assetId: 'a1', trackId: null, prerequisites: prerequisites(patch), settings } as unknown as SignLanguageVideo);

describe('Hộp thoại "Tạo video ký hiệu"', () => {
  it('offers the layouts and signers as cards, recommended ones chosen, and analyses with the choices made', () => {
    const onSubmit = vi.fn();
    render(<SignVideoSettingsDialog data={data()} mode="create" busy={false} onClose={vi.fn()} onSubmit={onSubmit} />);

    const dialog = screen.getByRole('dialog', { name: 'Tạo video ký hiệu' });
    expect(document.activeElement).toBe(dialog);
    expect(screen.getByRole('group', { name: 'Cách hiển thị' })).toBeTruthy();
    expect((screen.getByRole('radio', { name: /Góc trái video/ }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole('radio', { name: /Nhân vật 3D/ }) as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText('ký hiệu đã có chuyển động', { exact: false }).textContent).toBe('6 ký hiệu đã có chuyển động');
    expect(screen.getByRole('switch', { name: 'Dựng video ngay khi đủ ký hiệu' })).toBeTruthy();

    fireEvent.click(screen.getByRole('radio', { name: /Toàn khung hình/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Ghép video người thật/ }));
    fireEvent.change(screen.getByLabelText('Ký hiệu theo vùng'), { target: { value: 'VN-NAM' } });
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByRole('button', { name: 'Phân tích lời thoại' }));

    expect(onSubmit).toHaveBeenCalledWith(
      { captionSource: 'DRAFT', renderMode: 'FULLSCREEN', renderer: 'CLIP', region: 'VN-NAM', variant: null },
      false,
    );
  });

  it('says why the 3D avatar cannot be used, and waits for a saved transcript', () => {
    render(
      <SignVideoSettingsDialog
        data={data({ hasDraftCaptions: false, avatarRendererAvailable: false, avatarRendererMessage: 'Trình duyệt này không dựng được nhân vật 3D.' },
          { captionSource: 'DRAFT', renderMode: 'OVERLAY', renderer: 'CLIP', signLanguage: 'VSL', region: 'VN', variant: null })}
        mode="settings" busy={false} onClose={vi.fn()} onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Chỉnh sửa video ký hiệu' })).toBeTruthy();
    expect((screen.getByRole('radio', { name: /Nhân vật 3D/ }) as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByText('Trình duyệt này không dựng được nhân vật 3D.')).toBeTruthy();
    expect((screen.getByRole('radio', { name: /Ghép video người thật/ }) as HTMLInputElement).checked).toBe(true);
    expect(screen.queryByRole('switch')).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('Chưa có lời thoại');
    expect(screen.getByRole('button', { name: 'Phân tích lời thoại' }).hasAttribute('disabled')).toBe(true);
  });

  it('closes with Escape or "Hủy", but not while analysing', () => {
    const onClose = vi.fn();
    const { rerender } = render(<SignVideoSettingsDialog data={data()} mode="create" busy={false} onClose={onClose} onSubmit={vi.fn()} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(onClose).toHaveBeenCalledTimes(2);

    rerender(<SignVideoSettingsDialog data={data()} mode="create" busy onClose={onClose} onSubmit={vi.fn()} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: 'Đang phân tích…' }).hasAttribute('disabled')).toBe(true);
  });
});
