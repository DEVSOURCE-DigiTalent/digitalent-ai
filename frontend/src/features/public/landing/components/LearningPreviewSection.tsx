import { cn } from '@/lib/utils';
import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { useLandingContent } from '../landing-content-context';
import { BackgroundStage } from './BackgroundStage';
import { SectionHeader } from './SectionHeader';

type LearningPreviewSection = Extract<LandingSectionConfig, { kind: 'learning-preview' }>;

/** A mock lesson viewer: the course on the left, one module on the right. Content is illustrative. */
export function LearningPreviewSection({ section }: { section: LearningPreviewSection }) {
  const { sample } = section;
  const { lesson } = sample;
  const { media } = useLandingContent();

  return (
    <section id={SECTION_IDS.learning} tabIndex={-1} aria-labelledby="lp-learning-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-learning-title" intro={section.intro} />

      <div className="mx-auto mt-14 grid max-w-[90rem] gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
        <aside className="relative isolate overflow-hidden rounded-[20px] bg-landing-panel p-6 md:p-8">
          <BackgroundStage scene="dusk" seed={17} video={media.learning} />
          {/* Keeps the text readable over the footage. */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/75 via-black/55 to-black/30" aria-hidden="true" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] tracking-[0.04em] text-cream/60">{sample.courseCode}</span>
              <span className="inline-flex whitespace-nowrap rounded-full border border-cream/12 px-2.5 py-1 text-[11px] text-cream/80">Ví dụ minh họa</span>
          </div>
          <p className="mt-3 text-xl leading-[1.25] tracking-[-0.015em] text-cream">{sample.courseTitle}</p>

          <ol aria-label="Các module của khóa" className="mt-8 grid gap-1">
            {sample.modules.map((title, index) => (
              <li
                key={title}
                aria-current={index === sample.currentModule ? 'step' : undefined}
                className={cn(
                  'grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 rounded-xl px-3 py-2.5 text-sm leading-[1.4]',
                  index === sample.currentModule ? 'bg-cream/15 text-cream' : 'text-cream/70',
                )}
              >
                <span className="tabular-nums text-cream/50">{index + 1}</span>
                {title}
              </li>
            ))}
          </ol>
          </div>
        </aside>

        <div className="grid gap-6 rounded-[20px] bg-landing-card p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
            Module {sample.currentModule + 1} · {sample.modules[sample.currentModule]}
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <Block title="Mục tiêu học tập">{lesson.objective}</Block>
            <Block title="Kiến thức và ví dụ">{lesson.example}</Block>
            <Block title="Bài thực hành">{lesson.practice}</Block>
            <Block title="Bài đánh giá">
              <span className="block text-cream/90">{lesson.quiz.question}</span>
              <ul className="mt-3 grid gap-2">
                {lesson.quiz.options.map((option) => (
                  <li key={option} className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-2.5 text-sm leading-[1.4]">
                    <i aria-hidden="true" className="mt-1 block size-3 rounded-full border border-cream/40" />
                    {option}
                  </li>
                ))}
              </ul>
            </Block>
          </div>

          <div className="border-t border-cream/12 pt-5">
            <Block title="Tiến độ">{lesson.progress}</Block>
            <div className="mt-4 flex gap-1" aria-hidden="true">
              {sample.modules.map((title, index) => (
                <i key={title} className={cn('block h-1.5 flex-1 rounded-full', index <= sample.currentModule ? 'bg-cream' : 'bg-cream/12')} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-normal uppercase tracking-[0.12em] text-cream-soft">{title}</h3>
      <div className="mt-2 text-sm leading-[1.6] text-stone-400">{children}</div>
    </div>
  );
}
