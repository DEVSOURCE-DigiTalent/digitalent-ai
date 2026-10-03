import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { levelWithTier } from '@/lib/competency-levels';
import {
  REFERENCE_POSITIONS,
  getReferencePosition,
  requirementsByDomain,
  summarizeRequirements,
  type ReferencePosition,
} from '@/lib/reference-positions';
import { DomainPips } from '../components/DomainPips';
import { PublicShell } from '../components/PublicShell';

const PRICING_PATH = '/individual/pricing';

const ORIGIN_NOTE =
  'Các vị trí này do DigiTalent AI xây dựng dựa trên Khung năng lực số TT02. Thông tư 02/2025/TT-BGDĐT định nghĩa khung năng lực, không quy định vị trí việc làm.';

/** PUB-06 "/careers" and "/careers/:slug": the reference positions and what each asks of a learner. */
export function CareerCatalogPage() {
  const { slug } = useParams<{ slug: string }>();
  const position = slug ? getReferencePosition(slug.toUpperCase()) : undefined;

  return (
    <PublicShell portal="individual" width="wide">
      {!slug && <PositionList />}
      {slug && position && <PositionDetail position={position} />}
      {slug && !position && <PositionNotFound />}
    </PublicShell>
  );
}

function PositionList() {
  return (
    <>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-cream-soft sm:text-xs">Vị trí nghề nghiệp</p>
        <h1 className="mt-5 text-balance text-[clamp(30px,5vw,56px)] font-normal leading-[1.05] tracking-[-0.03em]">
          Vị trí tham chiếu <span className="font-landing-serif italic">để bạn chọn mục tiêu.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[56ch] text-pretty text-sm leading-[1.7] text-stone-400 sm:text-base">{ORIGIN_NOTE}</p>
      </div>

      <ul className="mt-12 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {REFERENCE_POSITIONS.map((position) => (
          <PositionCard key={position.code} position={position} />
        ))}
      </ul>
    </>
  );
}

function PositionCard({ position }: { position: ReferencePosition }) {
  const { selected, domains } = summarizeRequirements(position);

  return (
    <li className="flex flex-col justify-between gap-8 rounded-[20px] bg-landing-card p-6">
      <DomainPips domains={domains} />
      <div>
        <h2 className="text-[22px] font-normal leading-[1.22] tracking-[-0.015em]">
          <Link to={`/careers/${position.code.toLowerCase()}`} className="underline-offset-4 hover:underline">
            {position.name}
          </Link>
        </h2>
        <p className="mt-2 text-sm leading-[1.5] text-stone-400">{position.description}</p>
        <p className="mt-4 text-xs text-stone-500 tabular-nums">{selected}/24 năng lực được chọn</p>
      </div>
    </li>
  );
}

function PositionDetail({ position }: { position: ReferencePosition }) {
  const { selected, domains } = summarizeRequirements(position);
  const groups = requirementsByDomain(position);

  return (
    <article>
      <Link to="/careers" className="inline-flex items-center gap-1.5 text-sm text-cream/80 transition-colors hover:text-cream">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Tất cả vị trí
      </Link>

      <header className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <h1 className="text-balance text-[clamp(32px,5vw,56px)] font-normal leading-[1.05] tracking-[-0.03em]">{position.name}</h1>
          <p className="mt-4 max-w-[52ch] text-pretty text-sm leading-[1.7] text-stone-400 sm:text-base">{position.description}</p>
          <p className="mt-4 text-sm text-cream/80 tabular-nums">{selected}/24 năng lực được chọn cho vị trí này</p>
        </div>
        <DomainPips domains={domains} />
      </header>

      <div className="mt-12 grid gap-3 md:grid-cols-2">
        {groups.map((group) => (
          <section key={group.number} aria-labelledby={`domain-${group.number}`} className="rounded-[20px] bg-landing-card p-6">
            <h2 id={`domain-${group.number}`} className="text-lg font-normal leading-[1.3] tracking-[-0.01em]">
              <span className="mr-2 text-stone-500 tabular-nums">{group.number}</span>
              {group.name}
            </h2>
            <ul className="mt-4 grid gap-3">
              {group.items.map((item) => (
                <li key={item.code} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 text-sm leading-[1.45]">
                  <span className="text-stone-500 tabular-nums">{item.code}</span>
                  <span>
                    <span className="block text-cream/90">{item.name}</span>
                    <span className="block text-xs text-stone-400">{levelWithTier(item.level, 'vi')}</span>
                  </span>
                </li>
              ))}
            </ul>
            {group.notRequired.length > 0 && (
              <p className="mt-4 text-xs leading-[1.5] text-stone-500">Không thuộc yêu cầu: {group.notRequired.join(' · ')}</p>
            )}
          </section>
        ))}
      </div>

      <aside className="mt-12 flex flex-col items-start gap-5 rounded-[20px] bg-landing-panel p-7 md:flex-row md:items-center md:justify-between">
        <p className="max-w-[48ch] text-pretty text-sm leading-[1.6] text-cream/85">
          Chọn gói, làm bài đánh giá đầu vào và DigiTalent AI chỉ ra bạn còn thiếu năng lực nào so với vị trí này.
        </p>
        <Link
          to={PRICING_PATH}
          className="group inline-flex items-center gap-2 rounded-full bg-cream-soft py-[5px] pl-[22px] pr-[5px] text-sm font-medium text-black"
        >
          Xem gói cá nhân
          <span className="grid size-9 place-items-center rounded-full bg-black text-cream-soft" aria-hidden="true">
            <ArrowRight className="size-[18px]" />
          </span>
        </Link>
      </aside>

      <p className="mt-8 text-xs leading-[1.6] text-stone-500">{ORIGIN_NOTE}</p>
    </article>
  );
}

function PositionNotFound() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-[clamp(28px,4vw,44px)] font-normal leading-[1.1] tracking-[-0.03em]">Không tìm thấy vị trí này.</h1>
      <p className="mt-4 text-sm leading-[1.7] text-stone-400">Vị trí bạn mở không nằm trong danh sách vị trí tham chiếu hiện có.</p>
      <Link to="/careers" className="mt-8 inline-block rounded-full border border-cream/30 px-6 py-3 text-sm text-cream transition-colors hover:border-cream/70">
        Xem tất cả vị trí
      </Link>
    </div>
  );
}
