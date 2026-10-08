import { BookOpenText, CheckCircle2, ClipboardList, Play, Video } from 'lucide-react';
import type { CourseLessonDto } from '@/services/assignment.service';
import { resolveCourseMedia } from '@/features/courses/components/course-media';

type LessonContent = Pick<CourseLessonDto, 'title' | 'lessonType' | 'contentBody' | 'estimatedMinutes' | 'videoUrl'>;

type ContentBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'deliverable'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'question'; number: string; question: string; options: { letter: string; text: string }[]; answer: string };

function parseQuestion(line: string): ContentBlock | null {
  const number = line.match(/^(\d+)[.)]\s+/)?.[1];
  const answerAt = line.search(/Đáp án\s*:/i);
  if (!number || answerAt < 0) return null;

  const prompt = line.slice(0, answerAt).replace(/^\d+[.)]\s+/, '');
  const options = [...prompt.matchAll(/(?:^|\s)([A-D])\.\s+/g)];
  if (options.length < 2) return null;

  return {
    kind: 'question',
    number,
    question: prompt.slice(0, options[0].index).trim(),
    options: options.map((option, index) => ({
      letter: option[1],
      text: prompt.slice(option.index! + option[0].length, options[index + 1]?.index ?? prompt.length).trim(),
    })),
    answer: line.slice(answerAt).trim(),
  };
}

/** The BE2 seed contains plain text with a few Markdown headings and lists, not HTML. */
export function parseLessonContent(content: string, lessonType?: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const paragraph: string[] = [];
  const bullets: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
    paragraph.length = 0;
  };
  const flushBullets = () => {
    if (bullets.length) blocks.push({ kind: 'bullets', items: [...bullets] });
    bullets.length = 0;
  };

  for (const rawLine of content.replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.trim();
    if (!line) { flushParagraph(); flushBullets(); continue; }

    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) { flushParagraph(); flushBullets(); blocks.push({ kind: 'heading', text: heading[1] }); continue; }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) { flushParagraph(); bullets.push(bullet[1]); continue; }

    flushBullets();
    if (/^Sản phẩm nộp\s*:/i.test(line)) {
      flushParagraph(); blocks.push({ kind: 'deliverable', text: line }); continue;
    }
    const question = lessonType === 'QUIZ' ? parseQuestion(line) : null;
    if (question) { flushParagraph(); blocks.push(question); continue; }
    paragraph.push(line);
  }
  flushParagraph();
  flushBullets();
  return blocks;
}

export function LessonMedia({ lesson }: { lesson: LessonContent }) {
  const source = lesson.videoUrl ?? (lesson.lessonType === 'VIDEO' ? lesson.contentBody : null);
  const media = resolveCourseMedia(source);

  return <section aria-label="Video bài học" className="space-y-3">
    <div className="flex items-center justify-between gap-3 text-sm">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900"><Video className="size-4 text-blue-600" />Video bài giảng</h3>
      <span className="text-xs text-slate-500">{media ? 'Video bài học' : 'Khung video mô phỏng'}</span>
    </div>
    {media?.kind === 'embed' ? <div className="aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-sm"><iframe title={`Video bài học: ${lesson.title}`} src={media.url} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full border-0" /></div>
      : media?.kind === 'file' ? <video key={media.url} src={media.url} controls preload="metadata" className="aspect-video w-full rounded-2xl bg-slate-950 shadow-sm">Trình duyệt không hỗ trợ phát video này.</video>
        : <div className="relative flex aspect-video min-h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d2939] via-[#465569] to-[#121d2b] p-6 text-center text-white shadow-sm">
          <div className="pointer-events-none absolute -left-16 -top-20 size-64 rounded-full bg-blue-300/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-12 size-72 rounded-full bg-violet-300/10 blur-2xl" />
          <div className="relative max-w-md">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-200 text-slate-900 shadow-lg"><Play className="ml-1 size-7 fill-current" /></span>
            <p className="mt-4 text-lg font-semibold">Video bài học đang được cập nhật</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">Bạn có thể học nội dung bên dưới ngay bây giờ. Khi bài học có liên kết video, trình phát sẽ xuất hiện tại đây.</p>
          </div>
          {lesson.estimatedMinutes != null && <span className="absolute bottom-4 right-4 rounded-md bg-black/30 px-2 py-1 text-xs">{lesson.estimatedMinutes} phút</span>}
        </div>}
  </section>;
}

export function LessonText({ lesson }: { lesson: LessonContent }) {
  const source = lesson.videoUrl ?? (lesson.lessonType === 'VIDEO' ? lesson.contentBody : null);
  const isVideoOnly = lesson.lessonType === 'VIDEO' && Boolean(resolveCourseMedia(source)) && source === lesson.contentBody;
  const blocks = isVideoOnly ? [] : parseLessonContent(lesson.contentBody ?? '', lesson.lessonType);

  return <section aria-label="Nội dung bài học" className="space-y-5 border-t border-slate-200 pt-6">
    <div className="flex items-center gap-2"><BookOpenText className="size-5 text-blue-600" /><h3 className="text-base font-bold text-slate-900">Nội dung bài học</h3></div>
    {blocks.length === 0 ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Bài học này chưa có nội dung văn bản.</p>
      : <div className="space-y-5 text-[15px] leading-7 text-slate-700">
        {blocks.map((block, index) => {
          if (block.kind === 'heading') return <h4 key={index} className="border-l-4 border-blue-500 pl-3 text-base font-bold text-slate-900">{block.text}</h4>;
          if (block.kind === 'paragraph') return <p key={index} className="max-w-[75ch]">{block.text}</p>;
          if (block.kind === 'deliverable') return <div key={index} className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950"><ClipboardList className="mt-1 size-5 shrink-0 text-amber-600" /><p>{block.text}</p></div>;
          if (block.kind === 'bullets') return <ul key={index} className="grid gap-2">{block.items.map((item, itemIndex) => <li key={itemIndex} className="flex gap-3 rounded-lg bg-slate-50 px-4 py-3"><CheckCircle2 className="mt-1 size-4 shrink-0 text-blue-600" /><span>{item}</span></li>)}</ul>;
          return <article key={index} className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <p className="font-semibold text-slate-900">Câu {block.number}. {block.question}</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">{block.options.map((option) => <li key={option.letter} className="rounded-lg bg-slate-50 px-3 py-2 text-sm"><span className="mr-2 font-bold text-blue-700">{option.letter}.</span>{option.text}</li>)}</ul>
            <details className="mt-4 border-t border-slate-100 pt-3 text-sm"><summary className="cursor-pointer font-semibold text-blue-700">Xem đáp án và giải thích</summary><p className="mt-2 text-slate-700">{block.answer}</p></details>
          </article>;
        })}
      </div>}
  </section>;
}
