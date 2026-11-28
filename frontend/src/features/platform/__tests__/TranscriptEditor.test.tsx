import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AssetCaptions, PlatformAsset } from '@/services/platform-catalog.service';

const service = vi.hoisted(() => ({
  getCaptions: vi.fn(),
  generateCaptions: vi.fn(),
  saveCaptions: vi.fn(),
}));

vi.mock('@/services/platform-catalog.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/platform-catalog.service')>();
  return { ...actual, platformCatalogService: { ...actual.platformCatalogService, ...service } };
});

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { TranscriptEditor } from '../builder/TranscriptEditor';

const asset: PlatformAsset = { assetId: 'a1', kind: 'VIDEO', fileName: 'bai.mp4', contentType: 'video/mp4', sizeBytes: 10, url: 'platform/assets/a1/content' };

const transcript = (patch: Partial<AssetCaptions> = {}): AssetCaptions => ({
  assetId: 'a1', language: 'vi', status: 'NONE', source: null, model: null, errorCode: null, errorMessage: null,
  draftCues: [], publishedCues: null, publishedAt: null, hasUnpublishedChanges: false, aiConfigured: true, updatedAt: null,
  ...patch,
});

function renderEditor(collapsed = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const videoRef = createRef<HTMLVideoElement>();
  const utils = render(
    <QueryClientProvider client={client}>
      <video ref={videoRef} />
      <TranscriptEditor asset={asset} videoRef={videoRef} collapsed={collapsed} />
    </QueryClientProvider>,
  );
  return { ...utils, videoRef };
}

describe('Lời thoại của video (bước 1 của video ký hiệu)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('runs the AI only when asked and shows that it is working', async () => {
    service.getCaptions.mockResolvedValue(transcript());
    service.generateCaptions.mockResolvedValue(transcript({ status: 'PROCESSING' }));
    renderEditor();

    expect(await screen.findByText('Chưa có lời thoại')).toBeTruthy();
    expect(screen.getByText(/Người học không thấy phần này/)).toBeTruthy();
    expect(service.generateCaptions).not.toHaveBeenCalled();
    service.getCaptions.mockResolvedValue(transcript({ status: 'PROCESSING' })); // what the API answers from now on
    fireEvent.click(screen.getByRole('button', { name: 'Tạo lời thoại bằng AI' }));

    await waitFor(() => expect(service.generateCaptions).toHaveBeenCalledWith('a1'));
    expect(await screen.findByText('AI đang viết lời thoại')).toBeTruthy();
    expect(screen.getByText(/AI đang nghe video/)).toBeTruthy();
  });

  it('cannot start the AI without a key but can be typed by hand and saved; nothing is published to learners', async () => {
    service.getCaptions.mockResolvedValue(transcript({ aiConfigured: false }));
    const saved = transcript({ status: 'READY', source: 'MANUAL', draftCues: [{ startMs: 3000, endMs: 5000, text: 'Xin chào' }] });
    service.saveCaptions.mockResolvedValue(saved);
    const { videoRef } = renderEditor();

    expect((await screen.findByRole('button', { name: 'Tạo lời thoại bằng AI' })).hasAttribute('disabled')).toBe(true);
    expect(screen.getByText(/chưa cấu hình khóa Gemini/)).toBeTruthy();

    videoRef.current!.currentTime = 3;
    fireEvent.click(screen.getByRole('button', { name: 'Tự nhập lời thoại' }));
    expect((screen.getByRole('textbox', { name: 'Câu 1: bắt đầu' }) as HTMLInputElement).value).toBe('0:03.0');
    expect(screen.getByRole('alert').textContent).toContain('Câu 1: chưa có chữ.');
    expect(screen.getByRole('button', { name: 'Lưu lời thoại' }).hasAttribute('disabled')).toBe(true);
    expect(screen.queryByRole('button', { name: /Xuất bản/ })).toBeNull();

    fireEvent.change(screen.getByRole('textbox', { name: 'Câu 1: nội dung' }), { target: { value: '  Xin   chào ' } });
    expect(screen.queryByRole('alert')).toBeNull();
    service.getCaptions.mockResolvedValue(saved);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu lời thoại' }));

    await waitFor(() => expect(service.saveCaptions).toHaveBeenCalledWith('a1', [{ startMs: 3000, endMs: 5000, text: 'Xin chào' }]));
    expect(await screen.findByText('Đã lưu 1 câu')).toBeTruthy();
  });

  it('folds to one line once the sign-language video exists, and opens on demand', async () => {
    service.getCaptions.mockResolvedValue(transcript({ status: 'READY', draftCues: [{ startMs: 0, endMs: 1000, text: 'Chào mừng' }, { startMs: 1000, endMs: 2000, text: 'bạn' }] }));
    renderEditor(true);

    expect(await screen.findByText('Đã lưu 2 câu')).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: 'Câu 1: nội dung' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Xem, sửa 2 câu' }));
    expect((screen.getByRole('textbox', { name: 'Câu 1: nội dung' }) as HTMLTextAreaElement).value).toBe('Chào mừng');
  });

  it('asks before replacing the transcript with a new AI one, and explains a failed run', async () => {
    service.getCaptions.mockResolvedValue(transcript({
      status: 'FAILED', errorCode: 'AI_BUSY', errorMessage: 'Gemini đang quá tải. Thử lại sau ít phút.',
      draftCues: [{ startMs: 0, endMs: 1000, text: 'Cũ' }],
    }));
    service.generateCaptions.mockResolvedValue(transcript({ status: 'PROCESSING', draftCues: [{ startMs: 0, endMs: 1000, text: 'Cũ' }] }));
    renderEditor();

    expect((await screen.findByRole('alert')).textContent).toBe('Gemini đang quá tải. Thử lại sau ít phút. Lời thoại trước đó vẫn được giữ.');
    fireEvent.click(screen.getByRole('button', { name: 'Tạo lại bằng AI' }));
    expect(service.generateCaptions).not.toHaveBeenCalled();
    expect(screen.getByRole('group', { name: 'Xác nhận tạo lại lời thoại' }).textContent).toContain('Lời thoại hiện tại sẽ được thay');
    fireEvent.click(screen.getByRole('button', { name: 'Tạo lại' }));
    await waitFor(() => expect(service.generateCaptions).toHaveBeenCalledTimes(1));
  });
});
