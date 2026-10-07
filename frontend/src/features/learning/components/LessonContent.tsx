import { Fragment } from 'react';

type Block = { kind: 'heading' | 'paragraph'; text: string } | { kind: 'list'; items: string[] };

/** Tách nội dung bài học (lessons.content_body): đoạn cách nhau bằng dòng trống, "## " = tiêu đề, "- " = gạch đầu dòng. */
function parseLessonContent(body: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of body.replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
    let list: string[] = [];
    const flush = () => {
      if (list.length > 0) blocks.push({ kind: 'list', items: list });
      list = [];
    };
    for (const line of lines) {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        list.push(line.slice(2).trim());
      } else if (line.startsWith('#')) {
        flush();
        blocks.push({ kind: 'heading', text: line.replace(/^#+\s*/, '') });
      } else {
        flush();
        blocks.push({ kind: 'paragraph', text: line });
      }
    }
    flush();
  }
  return blocks;
}

/** Hiển thị nội dung bài học dạng văn bản thuần (không render HTML — tránh XSS từ nội dung soạn tay). */
export function LessonContent({ body }: { body: string | null | undefined }) {
  if (!body?.trim()) {
    return <p className="text-sm text-slate-500">Bài học chưa có nội dung văn bản.</p>;
  }

  return (
    <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700">
      {parseLessonContent(body).map((block, index) => (
        <Fragment key={index}>
          {block.kind === 'heading' && <h3 className="text-base font-bold text-slate-900 pt-2">{block.text}</h3>}
          {block.kind === 'paragraph' && <p>{block.text}</p>}
          {block.kind === 'list' && (
            <ul className="list-disc pl-5 space-y-1.5">
              {block.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </Fragment>
      ))}
    </div>
  );
}
