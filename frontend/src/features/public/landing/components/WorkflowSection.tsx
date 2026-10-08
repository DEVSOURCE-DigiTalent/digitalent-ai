import { cn } from '@/lib/utils';
import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { useActiveStep } from '../hooks/use-active-step';
import { SectionHeader } from './SectionHeader';
import { WorkflowPreviewView } from './WorkflowPreviews';
import { LP_KICKER } from '../landing-type';

type WorkflowSection = Extract<LandingSectionConfig, { kind: 'workflow' }>;

/**
 * The competency loop as a scroll-driven timeline. On wide screens the steps scroll past on the left while one
 * sticky preview on the right follows the step in the middle of the viewport; on phones each step carries its own
 * preview. Every step stays in the DOM and in reading order.
 */
export function WorkflowSection({ section }: { section: WorkflowSection }) {
  const { active, register, scrollToStep } = useActiveStep(section.steps.length);
  const current = section.steps[active] ?? section.steps[0];

  return (
    <section id={SECTION_IDS.process} tabIndex={-1} aria-labelledby="lp-workflow-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-workflow-title" intro={section.intro} />

      <div className="mx-auto mt-10 grid max-w-[90rem] grid-cols-1 gap-x-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ol aria-label="Vòng phát triển năng lực" className="relative grid">
          <span aria-hidden="true" className="absolute bottom-0 left-[7px] top-0 w-px bg-amber-400/15" />
          {section.steps.map((step, index) => (
            <li
              key={step.title}
              ref={register(index)}
              data-active={index === active || undefined}
              onClick={() => scrollToStep(index)}
              className={cn(
                'relative grid gap-5 py-8 pl-9 transition-colors lg:min-h-[42svh] lg:cursor-pointer lg:content-center',
                index === active ? '' : 'lg:hover:opacity-80'
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-0 top-[2.45rem] block size-[15px] rounded-full border transition-colors duration-500 lg:top-1/2 lg:-translate-y-1/2',
                  index <= active ? 'border-[#F5CA65] bg-[#F5CA65] shadow-[0_0_12px_rgba(245,202,101,0.45)]' : 'border-amber-400/30 bg-black',
                )}
              />
              <div className={cn('transition-opacity duration-500', index === active ? 'opacity-100' : 'lg:opacity-40')}>
                <p className={LP_KICKER}>
                  <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span> · {step.label}
                </p>
                <h3 className="mt-3 text-balance text-[clamp(24px,2.6vw,36px)] font-normal leading-[1.15] tracking-[-0.02em] text-cream">{step.title}</h3>
                <p className="mt-3 max-w-[42ch] text-base leading-[1.6] text-stone-400">{step.text}</p>
              </div>
              <div className="rounded-[20px] bg-landing-card p-5 lg:hidden">
                <WorkflowPreviewView kind={step.preview} />
              </div>
            </li>
          ))}
        </ol>

        <div className="hidden lg:block">
          <div className="sticky top-24 min-h-[30rem] rounded-[20px] bg-landing-card p-10">
            <p className={cn('mb-6', LP_KICKER)}>Ví dụ minh họa · {current.label}</p>
            <div key={current.preview} className="lp-preview-in">
              <WorkflowPreviewView kind={current.preview} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
