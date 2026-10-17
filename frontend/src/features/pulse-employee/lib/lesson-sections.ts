export interface LessonSection { title: string; body: string }

/** Preserve API content while giving Markdown/HTML headings a readable section layout. */
export function lessonSections(body: string | null | undefined): LessonSection[] {
  if (!body?.trim()) return [];
  const sections: LessonSection[] = [];
  if (/<\s*(p|div|h[1-6]|article)\b/i.test(body)) {
    const doc = new DOMParser().parseFromString(body, 'text/html');
    // Seeded Platform blocks wrap a slide in article; unwrap only the outer container.
    const nodes = Array.from((doc.body.children.length === 1 && doc.body.firstElementChild?.tagName === 'ARTICLE'
      ? doc.body.firstElementChild : doc.body).childNodes);
    let current: LessonSection = { title: '', body: '' };
    for (const node of nodes) {
      if (node instanceof Element && /^H[1-4]$/.test(node.tagName)) {
        if (current.title || current.body.trim()) sections.push(current);
        current = { title: node.textContent || '', body: '' };
      } else {
        current.body += node instanceof Element ? node.outerHTML : node.textContent || '';
      }
    }
    if (current.title || current.body.trim()) sections.push(current);
    return sections;
  }
  let current: LessonSection = { title: '', body: '' };
  for (const line of body.replace(/\r\n/g, '\n').split('\n')) {
    const heading = /^#{1,4}\s+(.+)$/.exec(line.trim());
    if (heading) {
      if (current.title || current.body.trim()) sections.push(current);
      current = { title: heading[1]!, body: '' };
    } else current.body += `${line}\n`;
  }
  if (current.title || current.body.trim()) sections.push(current);
  return sections;
}
