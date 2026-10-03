import type { SectionIntro } from '../landing-content';
import { WordsPullUp } from './WordsPullUp';

interface SectionHeaderProps {
  id: string;
  intro: SectionIntro;
}

/** Label, big title and optional lead of a landing section; the id names the section for screen readers. */
export function SectionHeader({ id, intro }: SectionHeaderProps) {
  return (
    <div className="mx-auto flex max-w-[50rem] flex-col items-center gap-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.16em] text-cream-soft sm:text-xs">{intro.label}</p>
      <h2 id={id} className="text-balance text-[clamp(30px,5vw,64px)] font-normal leading-[1.02] tracking-[-0.03em] text-cream">
        <WordsPullUp segments={intro.title} />
      </h2>
      {intro.lead && <p className="max-w-[44rem] text-pretty text-base leading-[1.65] text-stone-400 sm:text-lg">{intro.lead}</p>}
    </div>
  );
}
