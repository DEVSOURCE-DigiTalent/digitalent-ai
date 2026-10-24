import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Clock, Layers } from 'lucide-react';
import { Wordmark } from '@/components/brand/Wordmark';
import { cn } from '@/lib/utils';
import { levelLabelVi } from '@/lib/competency-levels';
import { REFERENCE_POSITIONS as TRIAL_POSITIONS, summarizeRequirements } from '@/lib/reference-positions';
import { samplePathFor } from '@/lib/standard-courses';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';
import { Card, LevelPips, PT_BUTTON_SECONDARY } from '@/features/learner/components/ui';
import { ThemeToggle } from '@/features/learner/components/ThemeToggle';
import { formatHours } from '@/features/learner/utils/format';
import { PERSONAL_PUBLIC_BACKGROUND, usePersonalTheme } from '@/features/learner/theme/use-personal-theme';
import { usePageBackground } from '@/features/public/landing/hooks/use-page-background';
import { DomainPips } from '@/features/public/components/DomainPips';
import { GOLD_BUTTON, GOLD_KICKER, GOLD_TEXT } from '../individual-trial/trial-style';
import { trackTrialEvent } from '../individual-trial/individual-trial-tracker';
import { buildTryHandoff, writeTryHandoff } from '../individual-trial/try-handoff';
import '@/features/learner/theme/personal-theme.css';

/**
 * The no-account look at the product: pick a reference position, see the path it leads to, start the 7-day trial.
 * No survey and no sample lesson: both happen for real inside the account (entry assessment, first course).
 */

export type TrialStep = 'target' | 'path';

interface SavedTry {
  version: 3;
  step: TrialStep;
  positionCode: string | null;
}

const STORAGE_KEY = 'dt-individual-trial-v3';
/** Keys of the earlier five-step quick try, removed when this page opens. */
const LEGACY_KEYS = ['dt-individual-trial-v2', 'dt-individual-trial-v1'];
const DEFAULT_TRY: SavedTry = { version: 3, step: 'target', positionCode: null };

const STEPS: { key: TrialStep; label: string }[] = [
  { key: 'target', label: 'Chọn vị trí' },
  { key: 'path', label: 'Lộ trình mẫu' },
];

function readSavedTry(): SavedTry {
  try {
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TRY;
    const parsed = JSON.parse(raw) as Partial<SavedTry>;
    const validPosition = TRIAL_POSITIONS.some((position) => position.code === parsed.positionCode);
    if (parsed.version !== 3 || !validPosition) return DEFAULT_TRY;
    return { version: 3, step: parsed.step === 'path' ? 'path' : 'target', positionCode: parsed.positionCode! };
  } catch {
    return DEFAULT_TRY;
  }
}

export function IndividualTrialPage() {
  const theme = usePersonalTheme((state) => state.theme);
  usePageBackground(PERSONAL_PUBLIC_BACKGROUND[theme]);

  const [initial] = useState(readSavedTry);
  const [step, setStep] = useState<TrialStep>(initial.step);
  const [positionCode, setPositionCode] = useState<string | null>(initial.positionCode);
  const mainHeading = useRef<HTMLHeadingElement>(null);
  const position = TRIAL_POSITIONS.find((item) => item.code === positionCode) ?? null;

  useEffect(() => {
    trackTrialEvent('trial_started');
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 3, step, positionCode } satisfies SavedTry));
    } catch {
      // Blocked storage: the page still works, it just does not remember the choice.
    }
  }, [positionCode, step]);

  useEffect(() => {
    mainHeading.current?.focus();
    document.documentElement.scrollTop = 0;
  }, [step]);

  const handleSelect = (code: string) => {
    setPositionCode(code);
    trackTrialEvent('trial_position_selected', { positionCode: code });
  };

  const handleShowPath = () => {
    if (!position) return;
    setStep('path');
    trackTrialEvent('trial_path_viewed', { positionCode: position.code });
  };

  return (
    <div
      data-testid="individual-trial-page"
      data-theme={theme}
      data-individual-theme={theme}
      lang="vi"
      className="personal-theme pt-soft min-h-screen bg-pt-bg font-landing text-pt-fg transition-colors duration-300"
    >
      <a href="#trial-main" className="fixed -top-16 left-4 z-[100] rounded-full bg-pt-accent px-4 py-2.5 text-sm text-pt-on-accent focus:top-3">
        Bỏ qua đến nội dung
      </a>
      <header className="border-b border-pt-line bg-pt-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 md:px-8">
          <Link to="/individual" aria-label="DigiTalent AI, về trang cá nhân">
            <Wordmark markOnly className="text-lg [--wordmark-on:var(--pt-bg)] min-[420px]:hidden" />
            <Wordmark className="hidden text-lg [--wordmark-on:var(--pt-bg)] min-[420px]:inline-flex" />
          </Link>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link to="/login" className="inline-flex items-center whitespace-nowrap rounded-full border border-pt-accent/50 px-3.5 py-1.5 text-sm font-medium text-pt-accent transition-colors hover:border-pt-accent hover:bg-pt-accent/10">Đăng nhập</Link>
            <Link to="/individual/pricing" className="hidden text-sm text-pt-fg-2 hover:text-pt-fg sm:inline">Xem gói</Link>
          </div>
        </div>
      </header>

      <main id="trial-main" className="mx-auto w-full max-w-6xl px-5 pb-20 pt-6 md:px-8 md:pt-10">
        <TrialStepper current={step} />
        <h1 ref={mainHeading} tabIndex={-1} className="sr-only">Xem lộ trình cá nhân</h1>

        {step === 'path' && position ? (
          <SamplePathStep positionCode={position.code} onBack={() => setStep('target')} />
        ) : (
          <TargetStep selected={positionCode} onSelect={handleSelect} onContinue={handleShowPath} />
        )}
      </main>
    </div>
  );
}

function TrialStepper({ current }: { current: TrialStep }) {
  const activeIndex = STEPS.findIndex((step) => step.key === current);
  return (
    <nav aria-label="Tiến trình xem lộ trình" className="mb-8 sm:mb-10">
      <ol className="flex items-center gap-2">
        {STEPS.map((item, index) => (
          <li key={item.key} aria-current={item.key === current ? 'step' : undefined} className="flex items-center gap-2">
            <span
              className={cn(
                'grid size-7 shrink-0 place-items-center rounded-full border text-xs font-medium transition-colors',
                index < activeIndex && 'border-pt-accent bg-pt-accent text-pt-on-accent',
                index === activeIndex && cn('border-[#E5A93C] bg-[#E5A93C]/15 ring-4 ring-[#E5A93C]/10', GOLD_TEXT),
                index > activeIndex && 'border-pt-line text-pt-fg-3',
              )}
            >
              {index < activeIndex ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
            </span>
            <span className={cn('text-xs', index === activeIndex ? 'font-medium text-pt-fg' : 'text-pt-fg-3')}>{item.label}</span>
            {index < STEPS.length - 1 && <span aria-hidden="true" className="mx-1 h-px w-8 bg-pt-line" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function StepHeader({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <header className="mb-6 max-w-3xl sm:mb-8">
      <p className={GOLD_KICKER}>{eyebrow}</p>
      <h2 className="mt-3 text-balance text-[clamp(26px,3.6vw,42px)] font-normal leading-[1.1] tracking-[-0.03em]">{title}</h2>
      <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-pt-fg-2 sm:text-[15px]">{lead}</p>
    </header>
  );
}

function TargetStep({ selected, onSelect, onContinue }: {
  selected: string | null;
  onSelect: (code: string) => void;
  onContinue: () => void;
}) {
  const selectedPosition = TRIAL_POSITIONS.find((position) => position.code === selected);
  return (
    <section>
      <StepHeader
        eyebrow="Miễn phí, không cần tài khoản"
        title="Bạn muốn phát triển cho vị trí nào?"
        lead="Chọn một vị trí tham chiếu để xem lộ trình năng lực số mà vị trí đó cần, theo Khung năng lực số của Thông tư 02/2025."
      />
      <div role="radiogroup" aria-label="Chọn vị trí mục tiêu" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {TRIAL_POSITIONS.map((position) => {
          const checked = selected === position.code;
          const { selected: competencyCount, domains } = summarizeRequirements(position);
          return (
            <label
              key={position.code}
              className={cn(
                'group relative flex cursor-pointer flex-col rounded-card border p-5 text-left transition-all focus-within:ring-2 focus-within:ring-pt-accent focus-within:ring-offset-2 focus-within:ring-offset-pt-bg lg:min-h-52',
                checked ? 'border-pt-accent bg-pt-accent/10 ring-1 ring-pt-accent' : 'border-pt-line bg-pt-card hover:border-pt-accent/40',
              )}
            >
              <input
                type="radio"
                name="trial-position"
                value={position.code}
                checked={checked}
                onChange={() => onSelect(position.code)}
                aria-label={`${position.name}: ${position.description}`}
                className="sr-only"
              />
              <DomainPips domains={domains} tone="theme" />
              <span className="mt-4 block text-[19px] font-medium leading-tight">{position.name}</span>
              <span className="mt-2 block text-xs leading-relaxed text-pt-fg-2">{position.description}</span>
              <span className="mt-auto pt-4 text-[11px] text-pt-fg-3 tabular-nums">{competencyCount}/24 năng lực</span>
              <span
                aria-hidden="true"
                className={cn(
                  'absolute right-4 top-4 grid size-6 place-items-center rounded-full border transition-colors',
                  checked ? 'border-pt-accent bg-pt-accent text-pt-on-accent' : 'border-pt-line text-transparent group-hover:border-pt-accent/50',
                )}
              >
                <Check className="size-3.5" />
              </span>
            </label>
          );
        })}
      </div>
      {/* On phones the action sticks to the bottom of the screen, so the choice and the next step stay together. */}
      <div className="sticky bottom-0 z-10 -mx-5 mt-6 flex justify-end border-t border-pt-line bg-pt-bg/90 px-5 py-3 backdrop-blur-md sm:static sm:mx-0 sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <button type="button" disabled={!selectedPosition} onClick={onContinue} className={cn(GOLD_BUTTON, 'max-sm:flex-1')}>
          {selectedPosition ? <>Xem lộ trình<span className="max-sm:sr-only"> cho {selectedPosition.name}</span></> : 'Chọn một vị trí'}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function SamplePathStep({ positionCode, onBack }: { positionCode: string; onBack: () => void }) {
  const position = TRIAL_POSITIONS.find((item) => item.code === positionCode)!;
  const path = samplePathFor(position);
  const registerPath = `/individual/register?trial=1&position=${positionCode}&source=try`;

  return (
    <section>
      <StepHeader
        eyebrow={`Lộ trình mẫu · ${position.name}`}
        title={`Lộ trình năng lực số cho ${position.name}`}
        lead="Đây là lộ trình đầy đủ khi bắt đầu từ con số 0. Sau khi tạo tài khoản, bài đánh giá đầu vào sẽ bỏ qua những khóa bạn đã nắm, nên lộ trình thật thường ngắn hơn."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <ol className="grid gap-3" aria-label="Các miền năng lực của lộ trình">
          {path.domains.map((domain) => (
            <li key={domain.number}>
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-pt-fg-3">Miền {domain.number} · {domain.selected}/{domain.total} năng lực</p>
                    <h3 className="mt-1 text-[17px] font-medium leading-snug">{domain.name}</h3>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs text-pt-fg-2">
                    Cần đạt <span className="font-medium text-pt-fg">{levelLabelVi(domain.requiredLevel)}</span>
                    <LevelPips level={domain.requiredLevel} />
                  </span>
                </div>
                <ul className="mt-4 grid gap-1.5">
                  {domain.courses.map((course) => (
                    <li key={course.code} className="flex items-baseline gap-3 text-sm">
                      <span className="w-12 shrink-0 text-xs tabular-nums text-pt-fg-3">{course.code}</span>
                      <span className="min-w-0 flex-1 text-pt-fg-2">{course.title}</span>
                      <span className="shrink-0 text-xs tabular-nums text-pt-fg-3">{formatHours(course.minutes)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ol>

        <aside className="lg:sticky lg:top-6">
          <Card className="p-6">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-pt-fg-3"><Layers className="size-3.5" aria-hidden="true" />Khóa học tối đa</dt>
                <dd className="mt-1 text-[28px] font-light leading-none tabular-nums">{path.courseCount}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-pt-fg-3"><Clock className="size-3.5" aria-hidden="true" />Thời lượng tối đa</dt>
                <dd className="mt-1 text-[28px] font-light leading-none tabular-nums">{formatHours(path.minutes)}</dd>
              </div>
            </dl>
            <ul className="mt-6 grid gap-2.5 border-t border-pt-line pt-5 text-sm text-pt-fg-2">
              {[
                'Bài đánh giá đầu vào 18 câu để bỏ qua phần đã biết',
                `Học thử ${INDIVIDUAL_TRIAL.courseLimit} khóa đầu trong ${INDIVIDUAL_TRIAL.days} ngày`,
                'Hồ sơ năng lực cập nhật sau mỗi khóa',
              ].map((item) => (
                <li key={item} className="flex gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-pt-ok" aria-hidden="true" />{item}</li>
              ))}
            </ul>
            <Link
              to={registerPath}
              onClick={() => {
                writeTryHandoff(buildTryHandoff(positionCode));
                trackTrialEvent('trial_completed', { positionCode });
              }}
              className={cn(GOLD_BUTTON, 'mt-6 w-full')}
            >
              Bắt đầu {INDIVIDUAL_TRIAL.days} ngày miễn phí <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <p className="mt-3 text-center text-xs text-pt-fg-3">Không cần thẻ · Không tự gia hạn</p>
          </Card>
          <div className="mt-4 flex flex-wrap justify-between gap-3">
            <button type="button" onClick={onBack} className={PT_BUTTON_SECONDARY}>
              <ArrowLeft className="size-4" aria-hidden="true" /> Đổi vị trí
            </button>
            <Link
              to={`/individual/pricing?source=trial&position=${positionCode}`}
              onClick={() => trackTrialEvent('trial_pricing_clicked', { positionCode })}
              className={PT_BUTTON_SECONDARY}
            >
              Xem bảng giá
            </Link>
          </div>
        </aside>
      </div>
      <p className="mt-8 max-w-[72ch] text-xs leading-relaxed text-pt-fg-3">
        Vị trí và mức yêu cầu là tham chiếu do DigiTalent xây dựng dựa trên Khung năng lực số cho người học (Thông tư 02/2025/TT-BGDĐT).
      </p>
    </section>
  );
}
