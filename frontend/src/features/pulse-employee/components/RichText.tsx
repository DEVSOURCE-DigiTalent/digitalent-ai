import { Fragment, type JSX, type ReactNode } from 'react';

/**
 * Nội dung bài học (lessons.content_body) có hai dạng: Markdown đơn giản (seed Development) và HTML (giáo trình thật).
 * Không dùng dangerouslySetInnerHTML: HTML được đọc bằng DOMParser rồi dựng lại bằng React với danh sách thẻ cho phép,
 * bỏ mọi thuộc tính (href, style, on*…) — nội dung soạn tay không thể chèn mã.
 */
const ALLOWED = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'span', 'div', 'small', 'sub', 'sup',
]);
const VOID = new Set(['br', 'hr']);

const looksLikeHtml = (body: string) => /<\s*(p|ul|ol|li|h[1-6]|strong|em|table|div|br)\b[^>]*>/i.test(body);

function renderNode(node: Node, key: number): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const element = node as Element;
  const tag = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes).map(renderNode);
  if (!ALLOWED.has(tag)) {
    // Thẻ lạ (script, img, a, iframe…): bỏ thẻ, giữ phần chữ an toàn bên trong (trừ script/style).
    return tag === 'script' || tag === 'style' ? null : <Fragment key={key}>{children}</Fragment>;
  }
  const Tag = tag as keyof JSX.IntrinsicElements;
  return VOID.has(tag) ? <Tag key={key} /> : <Tag key={key}>{children}</Tag>;
}

function renderHtml(body: string): ReactNode {
  const doc = new DOMParser().parseFromString(body, 'text/html');
  return Array.from(doc.body.childNodes).map(renderNode);
}

/** **đậm** trong một dòng Markdown. */
function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part.split(/(https?:\/\/[^\s]+)/g).map((segment, segmentIndex) => {
      if (!/^https?:\/\//.test(segment)) return segment;
      try {
        const url = new URL(segment);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return segment;
        return <a key={`${index}-${segmentIndex}`} href={url.toString()} target="_blank" rel="noopener noreferrer">{segment}</a>;
      } catch {
        return segment;
      }
    });
  });
}

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'quote'; text: string };

function parseMarkdown(body: string): Block[] {
  const blocks: Block[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (list) blocks.push({ kind: 'list', ...list });
    list = null;
  };
  for (const raw of body.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ kind: 'heading', level: heading[1]!.length, text: heading[2]! });
    } else if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (!list || list.ordered !== ordered) {
        flush();
        list = { ordered, items: [] };
      }
      list.items.push((bullet ?? numbered)![1]!);
    } else if (line.startsWith('> ')) {
      flush();
      blocks.push({ kind: 'quote', text: line.slice(2) });
    } else {
      flush();
      blocks.push({ kind: 'paragraph', text: line });
    }
  }
  flush();
  return blocks;
}

function renderMarkdown(body: string): ReactNode {
  return parseMarkdown(body).map((block, index) => {
    switch (block.kind) {
      case 'heading': {
        const Tag = (`h${Math.min(4, block.level + 1)}`) as 'h2' | 'h3' | 'h4';
        return <Tag key={index}>{inline(block.text)}</Tag>;
      }
      case 'list': {
        const Tag = block.ordered ? 'ol' : 'ul';
        return <Tag key={index}>{block.items.map((item, i) => <li key={i}>{inline(item)}</li>)}</Tag>;
      }
      case 'quote':
        return <blockquote key={index}>{inline(block.text)}</blockquote>;
      default:
        return <p key={index}>{inline(block.text)}</p>;
    }
  });
}

export function RichText({ body }: { body: string | null | undefined }) {
  if (!body?.trim()) {
    return <p className="pu-prose">Trang này chưa có nội dung văn bản.</p>;
  }
  return <div className="pu-prose">{looksLikeHtml(body) ? renderHtml(body) : renderMarkdown(body)}</div>;
}
