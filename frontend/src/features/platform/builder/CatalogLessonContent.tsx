import type { CatalogBlock } from '@/services/platform-catalog.service';
import { LessonSlide } from '@/features/pulse-employee/components/LessonSlide';
import '@/features/pulse-employee/pulse.css';
import '@/features/pulse-employee/pulse-lesson.css';

/** Use the actual stored block in the same reader as Employee; no replacement lesson text or quiz fixtures. */
export function CatalogLessonContent({ block, courseCode, moduleIndex, count, pageBlocks = [block], pageIndex = block.index }: { block: CatalogBlock; courseCode: string; moduleIndex: number; count: number; pageBlocks?: CatalogBlock[]; pageIndex?: number }) {
  const doc = new DOMParser().parseFromString(block.bodyHtml || '', 'text/html');
  const heading = doc.querySelector('h2, h3, h4');
  const title = heading?.textContent || block.caption || `Trang ${block.index + 1}`;
  heading?.remove();
  const media = pageBlocks.flatMap(part => [
    ...(part.asset ? [{ kind: part.asset.kind, url: part.asset.url, alt: part.altText || part.caption || title }] : []),
    ...part.items.map(item => ({ kind: item.asset.kind, url: item.asset.url, alt: item.caption || title })),
  ]);
  return <div className="pu" style={{ minHeight: 0, background: '#fff', borderRadius: 16 }}><LessonSlide courseCode={courseCode} moduleIndex={moduleIndex} index={pageIndex} count={count}
    slide={{ lessonId: block.blockId, title, contentBody: doc.body.innerHTML, lessonType: 'TEXT', media }} /></div>;
}
