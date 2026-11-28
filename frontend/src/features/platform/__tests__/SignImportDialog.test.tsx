import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const catalog = vi.hoisted(() => ({ uploadAsset: vi.fn() }));
const signs = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock('@/services/platform-catalog.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/platform-catalog.service')>();
  return { ...actual, platformCatalogService: { ...actual.platformCatalogService, ...catalog } };
});
vi.mock('@/services/sign-dictionary.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/sign-dictionary.service')>();
  return { ...actual, signDictionaryService: { ...actual.signDictionaryService, ...signs } };
});

import { SignImportDialog } from '../sign-dictionary/SignImportDialog';

const video = (name: string) => new File([new Uint8Array(10)], name, { type: 'video/mp4' });

describe('Nhập video ký hiệu', () => {
  beforeEach(() => vi.clearAllMocks());

  it('imports only once the source, the licence and the owner\'s permission are given, one sign per file', async () => {
    catalog.uploadAsset.mockImplementation(async (file: File) => ({ assetId: `asset-${file.name}`, kind: 'VIDEO' }));
    signs.create.mockImplementation(async (body: { gloss: string }) => {
      if (body.gloss === 'xin chao') throw new Error('Từ điển đã có ký hiệu này.');
      return { id: body.gloss };
    });
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <SignImportDialog onClose={() => undefined} />
      </QueryClientProvider>,
    );

    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [video('xin_chao.mp4'), video('bang-tinh.mp4')] } });
    expect((screen.getByRole('textbox', { name: /tệp bang-tinh.mp4/ }) as HTMLInputElement).value).toBe('bang tinh');
    fireEvent.change(screen.getByRole('textbox', { name: /tệp bang-tinh.mp4/ }), { target: { value: 'Bảng tính' } });

    const start = screen.getByRole('button', { name: 'Nhập 2 video' });
    expect(start.hasAttribute('disabled')).toBe(true);
    fireEvent.change(screen.getByPlaceholderText('Tên từ điển'), { target: { value: 'Từ điển thử' } });
    fireEvent.change(screen.getByPlaceholderText(/Văn bản cho phép/), { target: { value: 'Văn bản số 12' } });
    expect(start.hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: /bên sở hữu và người ra dấu đã cho phép/ }));
    expect(start.hasAttribute('disabled')).toBe(false);

    fireEvent.click(start);
    await waitFor(() => expect(signs.create).toHaveBeenCalledTimes(2));
    expect(signs.create).toHaveBeenLastCalledWith(expect.objectContaining({
      gloss: 'Bảng tính', kind: 'WORD', videoAssetId: 'asset-bang-tinh.mp4', sourceName: 'Từ điển thử', licenseNote: 'Văn bản số 12',
      consentConfirmed: true, region: 'VN',
    }));
    expect(await screen.findByText(/Từ điển đã có ký hiệu này/)).toBeTruthy();
    expect(await screen.findByText('Đã nhập 1/2 video.')).toBeTruthy();
  });
});
