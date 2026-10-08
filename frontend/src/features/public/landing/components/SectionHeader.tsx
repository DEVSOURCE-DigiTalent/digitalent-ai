import type { SectionIntro } from '../landing-content';
import { WordsPullUp } from './WordsPullUp';
import { LP_LABEL, LP_LEAD, LP_TITLE } from '../landing-type';

interface SectionHeaderProps {
  id: string;
  intro: SectionIntro;
}

/** Label, big title and optional lead of a landing section; the id names the section for screen readers. */
export function SectionHeader({ id, intro }: SectionHeaderProps) {
  return (
    <div className="mx-auto flex max-w-[50rem] flex-col items-center gap-5 text-center">
      <p className={LP_LABEL}>{intro.label}</p>
      <h2 id={id} className={LP_TITLE}>
        <WordsPullUp segments={intro.title} />
      </h2>
      {intro.lead && <p className={LP_LEAD}>{intro.lead}</p>}
    </div>
  );
}
