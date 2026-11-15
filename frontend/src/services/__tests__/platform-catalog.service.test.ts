import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import apiClient from '../api-client';
import { platformCatalogService } from '../platform-catalog.service';

vi.mock('axios', () => ({
  default: {
    put: vi.fn(),
  },
}));

vi.mock('../api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('platformCatalogService.uploadAsset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads directly to Object Storage PUT URL and completes when presign returns DIRECT', async () => {
    const file = new File([new Uint8Array([1, 2, 3, 4])], 'demo.mp4', { type: 'video/mp4' });
    const expectedAsset = {
      assetId: 'asset-1',
      kind: 'VIDEO',
      fileName: 'demo.mp4',
      contentType: 'video/mp4',
      sizeBytes: 4,
      url: 'platform/assets/asset-1/content?exp=123&sig=abc',
    };

    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            mode: 'DIRECT',
            uploadUrl: 'https://digitalent-ai.duckdns.org/storage/digitalent-ai/platform-assets/demo.mp4?X-Amz-Signature=1',
            uploadToken: 'signed-ticket-1',
            method: 'PUT',
          },
        },
      })
      .mockResolvedValueOnce({
        data: { success: true, data: expectedAsset },
      });

    vi.mocked(axios.put).mockImplementationOnce(async (_url, _data, config) => {
      config?.onUploadProgress?.({ loaded: 2, total: 4 } as never);
      config?.onUploadProgress?.({ loaded: 4, total: 4 } as never);
      return { status: 200 } as never;
    });

    const progressValues: number[] = [];
    const result = await platformCatalogService.uploadAsset(file, (p) => progressValues.push(p));

    expect(result).toEqual(expectedAsset);
    expect(apiClient.post).toHaveBeenNthCalledWith(1, '/platform/assets/presign', {
      fileName: 'demo.mp4',
      contentType: 'video/mp4',
      sizeBytes: 4,
    });
    expect(axios.put).toHaveBeenCalledWith(
      'https://digitalent-ai.duckdns.org/storage/digitalent-ai/platform-assets/demo.mp4?X-Amz-Signature=1',
      file,
      expect.objectContaining({
        headers: { 'Content-Type': 'video/mp4' },
        timeout: 0,
      }),
    );
    expect(apiClient.post).toHaveBeenNthCalledWith(2, '/platform/assets/complete', {
      uploadToken: 'signed-ticket-1',
    });
    expect(progressValues).toEqual([50, 100]);
  });

  it('falls back to multipart proxy upload when presign returns PROXY', async () => {
    const file = new File([new Uint8Array([9, 8])], 'slide.pdf', { type: 'application/pdf' });
    const expectedAsset = {
      assetId: 'asset-2',
      kind: 'PDF',
      fileName: 'slide.pdf',
      contentType: 'application/pdf',
      sizeBytes: 2,
      url: 'platform/assets/asset-2/content?exp=123&sig=def',
    };

    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({
        data: { success: true, data: { mode: 'PROXY' } },
      })
      .mockResolvedValueOnce({
        data: { success: true, data: expectedAsset },
      });

    const result = await platformCatalogService.uploadAsset(file);

    expect(result).toEqual(expectedAsset);
    expect(axios.put).not.toHaveBeenCalled();
    expect(apiClient.post).toHaveBeenCalledTimes(2);
    expect(apiClient.post).toHaveBeenNthCalledWith(
      2,
      '/platform/assets',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0,
      }),
    );
  });
});
