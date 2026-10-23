import { Fragment, type ReactNode } from 'react';

/**
 * Minimal Markdown for assistant replies: headings, paragraphs, bullet / numbered lists, tables,
 * **bold**, *italic* / _italic_ and `code`. Builds React elements only (no innerHTML), so model output can never inject markup.
 */
export function AssistantMarkdown({ text }: { text: string }) {
  return <div className="as-md">{renderBlocks(text)}</div>;
}

const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_SEPARATOR = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^(#{1,4})\s+(.*)$/;

function splitRow(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

function renderBlocks(text: string): ReactNode[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push(<p key={i} className="as-md-h">{renderInline(heading[2])}</p>);
      i++;
      continue;
    }

    if (TABLE_ROW.test(line) && i + 1 < lines.length && TABLE_SEPARATOR.test(lines[i + 1])) {
      const header = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && TABLE_ROW.test(lines[i])) rows.push(splitRow(lines[i++]));
      blocks.push(
        <div key={`t${i}`} className="as-md-table">
          <table>
            <thead>
              <tr>{header.map((cell, c) => <th key={c}>{renderInline(cell)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>{header.map((_, c) => <td key={c}>{renderInline(row[c] ?? '')}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const listPattern = BULLET.test(line) ? BULLET : NUMBERED.test(line) ? NUMBERED : null;
    if (listPattern) {
      const items: string[] = [];
      const start = i;
      while (i < lines.length && listPattern.test(lines[i])) items.push(listPattern.exec(lines[i++])![1]);
      const children = items.map((item, n) => <li key={n}>{renderInline(item)}</li>);
      blocks.push(listPattern === BULLET ? <ul key={start}>{children}</ul> : <ol key={start}>{children}</ol>);
      continue;
    }

    const paragraph: string[] = [];
    const start = i;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !HEADING.test(lines[i]) &&
      !BULLET.test(lines[i]) &&
      !NUMBERED.test(lines[i]) &&
      !TABLE_ROW.test(lines[i])
    ) {
      paragraph.push(lines[i++]);
    }
    if (paragraph.length === 0) {
      // A lone table-looking row without a separator: show as text.
      paragraph.push(lines[i++]);
    }
    blocks.push(
      <p key={start}>
        {paragraph.map((part, n) => (
          <Fragment key={n}>
            {n > 0 && <br />}
            {renderInline(part)}
          </Fragment>
        ))}
      </p>,
    );
  }

  return blocks;
}

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).filter(Boolean).map((part, n) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={n}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) return <code key={n}>{part.slice(1, -1)}</code>;
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      if (part.length > 2) return <em key={n}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={n}>{part}</Fragment>;
  });
}
