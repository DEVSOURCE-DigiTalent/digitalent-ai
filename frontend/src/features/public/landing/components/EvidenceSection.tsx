import { Check } from 'lucide-react';
import { TIER_LABELS } from '../landing-content';
import { cn } from '@/lib/utils';
import { TT02_COMPETENCY_NAMES, getReferencePosition } from '@/lib/reference-positions';
import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { useLandingContent } from '../landing-content-context';
import { useInView } from '../hooks/use-in-view';
import { useStageSequence } from '../hooks/use-stage-sequence';
import { useLandingMotion } from '../landing-motion';
import { BackgroundStage } from './BackgroundStage';
import { SectionHeader } from './SectionHeader';

type EvidenceSection = Extract<LandingSectionConfig, { kind: 'evidence' }>;

/**
 * The signature section of the business page: footage of real work on one side, an evidence review on the other.
 * The review walks from assigned task to confirmed competency as the section comes into view.
 */
export function EvidenceSection({ section }: { section: EvidenceSection }) {
  const { sample } = section;
  const { media } = useLandingContent();
  const { reduced } = useLandingMotion();
  const [stageRef, inView] = useInView<HTMLDivElement>({ rootMargin: '0px 0px -160px 0px' });
  const stage = useStageSequence(sample.stages.length, inView, reduced);
  const lastStage = sample.stages.length - 1;
  const reviewed = stage >= lastStage - 1;
  const confirmed = stage >= lastStage;
  const { from, to } = sample.levelChange;
  const required = getReferencePosition(sample.positionCode)?.levels[Object.keys(TT02_COMPETENCY_NAMES).indexOf(sample.competencyCode)] ?? 0;
  const gapBefore = Math.max(0, required - from);
  const gapAfter = Math.max(0, required - to);

  return (
    <section id={SECTION_IDS.evidence} tabIndex={-1} aria-labelledby="lp-evidence-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-evidence-title" intro={section.intro} />

      <div ref={stageRef} className="mx-auto mt-14 grid max-w-[90rem] grid-cols-1 gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative isolate min-h-[360px] overflow-hidden rounded-[20px] bg-[#0b0906] lg:min-h-[680px]">
          <BackgroundStage scene="ember" seed={23} video={media.evidence} />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20" aria-hidden="true" />
          <p className="absolute inset-x-0 bottom-0 z-10 p-6 text-base leading-[1.5] text-cream/90">{section.note}</p>
        </div>

        <div className="rounded-[20px] bg-landing-card p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Review minh chứng · Ví dụ minh họa</p>
            <span
              className={cn(
                'rounded-full border px-3 py-1 text-[11px] tracking-[0.06em] transition-colors duration-700',
                confirmed ? 'border-[#A7C4A0]/50 bg-[#A7C4A0]/10 text-[#A7C4A0]' : 'border-cream/15 text-cream/50',
              )}
            >
              {confirmed ? 'ĐÃ XÁC NHẬN' : 'ĐANG XỬ LÝ'}
            </span>
          </div>

          <p className="mt-6 text-sm text-stone-500">
            <span className="mr-2 tabular-nums">{sample.competencyCode}</span>
            {TT02_COMPETENCY_NAMES[sample.competencyCode]}
          </p>
          <p className="mt-2 text-2xl leading-[1.25] tracking-[-0.02em] text-cream">{sample.task}</p>

          <ol aria-label="Các giai đoạn của minh chứng" className="mt-8 grid gap-0 sm:grid-cols-5">
            {sample.stages.map((label, index) => (
              <li key={label} className="relative pb-5 pl-6 sm:pb-0 sm:pl-0 sm:pt-6">
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-0 top-1 block size-3 rounded-full border transition-colors duration-500 sm:top-0',
                    index <= stage ? 'border-cream bg-cream' : 'border-cream/30',
                  )}
                />
                <span className={cn('block text-sm leading-[1.4] transition-colors duration-500 sm:pr-2', index <= stage ? 'text-cream' : 'text-stone-500')}>
                  {label}
                </span>
              </li>
            ))}
          </ol>

          <ul className="mt-8 grid gap-3 border-t border-cream/10 pt-6">
            {sample.criteria.map((criterion, index) => (
              <li key={criterion} className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-3 text-base leading-[1.45] text-cream/85">
                <Check
                  className={cn('mt-0.5 size-4 transition-opacity duration-700', reviewed ? 'text-[#A7C4A0] opacity-100' : 'text-cream opacity-20')}
                  style={{ transitionDelay: `${index * 150}ms` }}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                {criterion}
              </li>
            ))}
          </ul>

          <div className="mt-6 min-h-[10rem]">
            <div className={cn('transition-opacity duration-700', reviewed ? 'opacity-100' : 'opacity-0')}>
              <p className="text-xs uppercase tracking-[0.12em] text-stone-500">Phản hồi</p>
              <p className="mt-2 text-sm leading-[1.55] text-stone-400">{sample.feedback}</p>
              <div className={cn('mt-5 grid gap-2 rounded-xl border border-[#A7C4A0]/30 bg-[#A7C4A0]/5 p-4 transition-opacity duration-700', confirmed ? 'opacity-100' : 'opacity-0')}>
                <p className="text-base text-cream">
                  Trình độ đã xác nhận: {TIER_LABELS[from]} → {TIER_LABELS[to]}
                </p>
                <p className="text-sm text-stone-400">
                  Khoảng trống {sample.competencyCode}: {gapBefore > 0 ? `còn thiếu ${gapBefore} tầng` : 'đã đạt'} → {gapAfter > 0 ? `còn thiếu ${gapAfter} tầng` : 'đã đạt'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
