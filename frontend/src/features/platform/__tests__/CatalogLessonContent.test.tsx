import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CatalogLessonContent } from '../builder/CatalogLessonContent';
import { BlockCard, BlockPreview } from '../builder/BlockCard';
import { catalogPages } from '../builder/catalog-pages';
import { fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import type { CatalogBlock } from '@/services/platform-catalog.service';

const block: CatalogBlock = {
  blockId: 'from-db', index: 0, type: 'TEXT', asset: null, items: [], caption: null, altText: null,
  bodyHtml: '<article><h3>Biết mình cần tìm gì</h3><p>Nội dung Admin đã sửa trong database.</p><h4>Tự kiểm tra</h4><p>Tự nêu phạm vi thông tin.</p></article>',
};

describe('Cùng học liệu giữa các role', () => {
  it('uses actual Admin text without inventing an image when no asset was stored', () => {
    render(<CatalogLessonContent block={block} courseCode="A1-F" moduleIndex={0} count={11} />);
    expect(screen.getAllByRole('heading', { name: 'Biết mình cần tìm gì' })).toHaveLength(1);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Nội dung Admin đã sửa trong database.')).toBeTruthy();
    expect(screen.getByText('Tự nêu phạm vi thông tin.')).toBeTruthy();
  });

  it('keeps the authoring view as plain text, and media in independent ordered blocks', () => {
    const { container } = render(<BlockPreview block={block} courseCode="A1-F" moduleIndex={0} count={11} />);
    expect(container.querySelector('.pa-rich')).toBeInTheDocument();
    expect(container.querySelector('.pu-lesson-slide')).toBeNull();
    expect(screen.queryByText('Góc nhìn trực quan')).not.toBeInTheDocument();
  });

  it('composes uploaded images with adjacent text only in the learner preview', () => {
    const image: CatalogBlock = { ...block, blockId: 'image', index: 1, type: 'IMAGE', bodyHtml: null,
      asset: { assetId: 'actual-image', kind: 'IMAGE', fileName: 'real.png', contentType: 'image/png', sizeBytes: 40, url: 'platform/assets/actual-image/content?exp=123&sig=abc' } };
    const pages = catalogPages([block, image, { ...block, blockId: 'second', index: 2 }]);
    expect(pages.map(page => page.map(part => part.blockId))).toEqual([['from-db', 'image'], ['second']]);
    const leading = catalogPages([{ ...image, index: 0 }, { ...block, index: 1 }]);
    expect(leading[0]!.map(part => part.blockId)).toEqual(['image', 'from-db']);
    render(<CatalogLessonContent block={block} pageBlocks={pages[0]} courseCode="A1-F" moduleIndex={2} count={2} />);
    expect(screen.getByRole('img').getAttribute('src')).toContain('actual-image');
  });

  it('lets Admin play a video without inadvertently opening the edit form', () => {
    const onToggle = vi.fn();
    const video: CatalogBlock = { ...block, type: 'VIDEO', bodyHtml: null,
      asset: { assetId: 'v1', kind: 'VIDEO', fileName: 'demo.mp4', contentType: 'video/mp4', sizeBytes: 50, url: 'video-content' } };
    const { container } = render(<BlockCard block={video} count={1} linkedQuestions={0} editable editing={false} onToggle={onToggle} edit={vi.fn()} />);
    const player = container.querySelector('video')!;
    expect(player.controls).toBe(true);
    fireEvent.click(player);
    expect(onToggle).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Sửa' }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('gives the uploaded API asset priority over the seed image', () => {
    render(<CatalogLessonContent block={{ ...block, asset: { assetId: 'asset-1', kind: 'IMAGE', fileName: 'new.png', contentType: 'image/png', sizeBytes: 30, url: 'platform/assets/asset-1/content?exp=123&sig=abc' } }} courseCode="A1-F" moduleIndex={0} count={11} />);
    expect(screen.getByRole('img').getAttribute('src')).toContain('/api/v1/platform/assets/asset-1/content?exp=123&sig=abc');
  });
});
