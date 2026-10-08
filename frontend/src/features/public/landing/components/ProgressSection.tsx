import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { ProgressProfile } from './FeatureVisuals';
import { SectionHeader } from './SectionHeader';
import { LP_KICKER } from '../landing-type';

type ProgressSection = Extract<LandingSectionConfig, { kind: 'progress' }>;

/** What a learner sees after studying: the assessed profile and the history behind it. */
export function ProgressSection({ section }: { section: ProgressSection }) {
  return (
    <section id={SECTION_IDS.progress} tabIndex={-1} aria-labelledby="lp-progress-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-progress-title" intro={section.intro} />

      <div className="mx-auto mt-14 grid max-w-[90rem] gap-3 lg:grid-cols-2">
        <div className="rounded-[20px] bg-landing-card p-6 md:p-8">
          <p className="mb-6 text-[11px] text-stone-500">Ví dụ minh họa · {section.profileLabel}</p>
          <ProgressProfile />
        </div>

        <div className="rounded-[20px] bg-landing-panel p-6 md:p-8">
          <p className={LP_KICKER}>Lịch sử đánh giá</p>
          <ol aria-label="Lịch sử đánh giá" className="mt-6 grid">
            {section.timeline.map((event, index) => (
              <li key={`${event.when}-${event.title}`} className="group grid grid-cols-[4.5rem_1rem_minmax(0,1fr)] gap-x-3 pb-6 last:pb-0 transition-transform duration-300 hover:translate-x-1">
                <span className="pt-0.5 text-xs text-stone-500 group-hover:text-stone-400 transition-colors">{event.when}</span>
                <span className="relative flex justify-center" aria-hidden="true">
                  <i className="mt-1.5 block size-2 rounded-full bg-[#F5CA65] shadow-[0_0_8px_rgba(245,202,101,0.6)]" />
                  {index < section.timeline.length - 1 && <i className="absolute bottom-[-1.5rem] top-4 w-px bg-amber-400/20" />}
                </span>
                <div>
                  <p className="text-sm leading-[1.4] text-cream group-hover:text-white transition-colors">{event.title}</p>
                  {event.detail && <p className="mt-1 text-sm leading-[1.5] text-stone-400 group-hover:text-stone-300 transition-colors">{event.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
