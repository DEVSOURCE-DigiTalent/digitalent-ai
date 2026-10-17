import type { CatalogBlock } from '@/services/platform-catalog.service';

/** Mirrors PlatformLessonPages: retain the ordered blocks in Admin, compose illustrations with text in preview. */
export function catalogPages(blocks: CatalogBlock[]): CatalogBlock[][] {
  const pages: CatalogBlock[][] = [];
  let leadingImages: CatalogBlock[] = [];
  for (const block of [...blocks].sort((a, b) => a.index - b.index)) {
    if (block.type === 'IMAGE') {
      const last = pages.at(-1);
      if (last?.some(part => part.type === 'TEXT')) last.push(block);
      else leadingImages.push(block);
    } else if (block.type === 'TEXT') {
      pages.push([...leadingImages, block]);
      leadingImages = [];
    } else {
      pages.push(...leadingImages.map(image => [image]), [block]);
      leadingImages = [];
    }
  }
  pages.push(...leadingImages.map(image => [image]));
  return pages;
}
