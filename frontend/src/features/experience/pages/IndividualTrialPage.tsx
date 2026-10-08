import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCheck, Copy, Lock, Play, RotateCcw } from 'lucide-react';
import { Wordmark } from '@/components/brand/Wordmark';
import { cn } from '@/lib/utils';
import {
  Card,
  LevelPips,
  PT_BUTTON_SECONDARY,
  PT_EYEBROW,
  Tag,
} from '@/features/learner/components/ui';
import { ThemeToggle } from '@/features/learner/components/ThemeToggle';
import { PERSONAL_PUBLIC_BACKGROUND, usePersonalTheme } from '@/features/learner/theme/use-personal-theme';
import { usePageBackground } from '@/features/public/landing/hooks/use-page-background';
import { DomainPips, PIP_GOLD } from '@/features/public/components/DomainPips';
import { GOLD_BUTTON, GOLD_KICKER, GOLD_TEXT } from '../individual-trial/trial-style';
import { summarizeRequirements } from '@/lib/reference-positions';
import {
  TRIAL_POSITIONS,
  TRIAL_QUESTIONS,
  TRIAL_SLICE_BY_POSITION,
  trialPathFor,
  type TrialTakeaway,
} from '../individual-trial/individual-trial-data';
import { TrialPreviewShell, type PreviewTab } from '../individual-trial/TrialPreviewShell';
import { trackTrialEvent } from '../individual-trial/individual-trial-tracker';
import { buildTryHandoff, writeTryHandoff } from '../individual-trial/try-handoff';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';
import '@/features/learner/theme/personal-theme.css';

export type TrialStep = 'target' | 'diagnostic' | 'path' | 'lesson' | 'complete';

export interface SavedTrial {
  version: 2;
  step: TrialStep;
  positionCode: string | null;
  answers: Record<string, number>;
  diagnosticMode: 'completed' | 'skipped' | null;
  lessonCompleted: boolean;
  scenarioCompleted: boolean;
  contentVersion: string;
}

const STORAGE_KEY = 'dt-individual-trial-v2';
const LEGACY_STORAGE_KEY = 'dt-individual-trial-v1';
/** Dedicated lightweight preview clip; do not replace with a complete paid lesson. */
const TRIAL_VIDEO_SRC = '/videos/individual-study.mp4';
const CONTENT_VERSION = '2026.10';

const STEPS: { key: TrialStep; label: string }[] = [
  { key: 'target', label: 'Mục tiêu' },
  { key: 'diagnostic', label: 'Khảo sát' },
  { key: 'path', label: 'Lộ trình' },
  { key: 'lesson', label: 'Học thử' },
  { key: 'complete', label: 'Kết quả' },
];

const DEFAULT_SAVED_TRIAL: SavedTrial = {
  version: 2,
  step: 'target',
  positionCode: null,
  answers: {},
  diagnosticMode: null,
  lessonCompleted: false,
  scenarioCompleted: false,
  contentVersion: CONTENT_VERSION,
};

function readSavedTrial(): SavedTrial {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as Partial<SavedTrial>;
      const validPosition = TRIAL_POSITIONS.some((position) => position.code === parsed.positionCode);
      const validStep = STEPS.some((step) => step.key === parsed.step);
      if (parsed.version === 2 && validStep && (parsed.step === 'target' || validPosition)) {
        return {
          version: 2,
          step: parsed.step!,
          positionCode: validPosition ? parsed.positionCode! : null,
          answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
          diagnosticMode: parsed.diagnosticMode === 'completed' || parsed.diagnosticMode === 'skipped' ? parsed.diagnosticMode : null,
          lessonCompleted: Boolean(parsed.lessonCompleted),
          scenarioCompleted: Boolean(parsed.scenarioCompleted),
          contentVersion: typeof parsed.contentVersion === 'string' ? parsed.contentVersion : CONTENT_VERSION,
        };
      }
    }

    // Fallback: check legacy v1 and safely upgrade
    const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawV1) {
      const parsedV1 = JSON.parse(rawV1);
      const validPosition = TRIAL_POSITIONS.some((p) => p.code === parsedV1.positionCode);
      const validStep = STEPS.some((s) => s.key === parsedV1.step);
      if (parsedV1.version === 1 && validStep && (parsedV1.step === 'target' || validPosition)) {
        return {
          version: 2,
          step: parsedV1.step,
          positionCode: validPosition ? parsedV1.positionCode : null,
          answers: parsedV1.answers && typeof parsedV1.answers === 'object' ? parsedV1.answers : {},
          diagnosticMode: 'completed',
          lessonCompleted: parsedV1.step === 'complete',
          scenarioCompleted: parsedV1.step === 'complete',
          contentVersion: CONTENT_VERSION,
        };
      }
    }

    return DEFAULT_SAVED_TRIAL;
  } catch {
    return DEFAULT_SAVED_TRIAL;
  }
}

export function IndividualTrialPage() {
  const theme = usePersonalTheme((state) => state.theme);
  usePageBackground(PERSONAL_PUBLIC_BACKGROUND[theme]);

  const initial = useMemo(readSavedTrial, []);
  const [step, setStep] = useState<TrialStep>(initial.step);
  const [positionCode, setPositionCode] = useState<string | null>(initial.positionCode);
  const [answers, setAnswers] = useState<Record<string, number>>(initial.answers);
  const [diagnosticMode, setDiagnosticMode] = useState<'completed' | 'skipped' | null>(initial.diagnosticMode);
  const [lessonCompleted, setLessonCompleted] = useState<boolean>(initial.lessonCompleted);
  const [scenarioCompleted, setScenarioCompleted] = useState<boolean>(initial.scenarioCompleted);

  const mainHeading = useRef<HTMLHeadingElement>(null);
  const position = TRIAL_POSITIONS.find((item) => item.code === positionCode) ?? null;

  useEffect(() => {
    trackTrialEvent('trial_started');
  }, []);

  useEffect(() => {
    const saved: SavedTrial = {
      version: 2,
      step,
      positionCode,
      answers,
      diagnosticMode,
      lessonCompleted,
      scenarioCompleted,
      contentVersion: CONTENT_VERSION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [answers, diagnosticMode, lessonCompleted, positionCode, scenarioCompleted, step]);

  useEffect(() => {
    mainHeading.current?.focus();
    document.documentElement.scrollTop = 0;
  }, [step]);

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    setAnswers({});
    setPositionCode(null);
    setDiagnosticMode(null);
    setLessonCompleted(false);
    setScenarioCompleted(false);
    setStep('target');
    trackTrialEvent('trial_started');
  };

  const handleSelectPosition = (code: string) => {
    setPositionCode(code);
    trackTrialEvent('trial_position_selected', { positionCode: code });
  };

  const handleContinueToDiagnostic = () => {
    if (!position) return;
    setStep('diagnostic');
    trackTrialEvent('trial_diagnostic_started', { positionCode: position.code });
  };

  const handleSkipToPath = () => {
    if (!position) return;
    setDiagnosticMode('skipped');
    setStep('path');
    trackTrialEvent('trial_diagnostic_skipped', { positionCode: position.code });
    trackTrialEvent('trial_path_viewed', { positionCode: position.code, diagnosticMode: 'skipped' });
  };

  const handleCompleteDiagnostic = () => {
    if (!position) return;
    setDiagnosticMode('completed');
    setStep('path');
    trackTrialEvent('trial_diagnostic_completed', { positionCode: position.code });
    trackTrialEvent('trial_path_viewed', { positionCode: position.code, diagnosticMode: 'completed' });
  };

  const handleStartLesson = () => {
    if (!position) return;
    setStep('lesson');
    trackTrialEvent('trial_lesson_started', { positionCode: position.code });
  };

  const handleCompleteLesson = () => {
    if (!position) return;
    setLessonCompleted(true);
    setScenarioCompleted(true);
    setStep('complete');
    trackTrialEvent('trial_completed', { positionCode: position.code });
  };

  // Preview Workspace shell for steps 3 (path), 4 (lesson), 5 (complete)
  if (position && (step === 'path' || step === 'lesson' || step === 'complete')) {
    return (
      <TrialPreviewShell
        activeTab={step as PreviewTab}
        onTabChange={(tab) => {
          setStep(tab);
          if (tab === 'path') trackTrialEvent('trial_path_viewed', { positionCode: position.code, diagnosticMode });
          if (tab === 'lesson') trackTrialEvent('trial_lesson_started', { positionCode: position.code });
        }}
        positionCode={position.code}
        positionName={position.name}
        onReset={reset}
      >
        <h1 ref={mainHeading} tabIndex={-1} className="sr-only">
          Bản trải nghiệm · {position.name}
        </h1>

        {step === 'path' && (
          <PathStep
            position={position}
            answers={answers}
            diagnosticMode={diagnosticMode}
            onBack={() => (diagnosticMode === 'completed' ? setStep('diagnostic') : setStep('target'))}
            onLearn={handleStartLesson}
          />
        )}

        {step === 'lesson' && (
          <LessonStep
            positionCode={position.code}
            positionName={position.name}
            onBack={() => setStep('path')}
            onDone={handleCompleteLesson}
          />
        )}

        {step === 'complete' && (
          <CompleteStep
            positionCode={position.code}
            positionName={position.name}
            answers={answers}
            diagnosticMode={diagnosticMode}
            onReviewLesson={() => setStep('lesson')}
            onReset={reset}
          />
        )}
      </TrialPreviewShell>
    );
  }

  // Wizard layout for steps 1 (target) and 2 (diagnostic)
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
      {/* Header band like the other public pages: one step off the page, hairline below, login as a mint outline pill. */}
      <header className="border-b border-pt-line bg-pt-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 md:px-8">
          <div className="flex items-center gap-3">
            <Link to="/individual" aria-label="DigiTalent AI, về trang cá nhân">
              <Wordmark markOnly className="text-lg [--wordmark-on:var(--pt-bg)] min-[420px]:hidden" />
              <Wordmark className="hidden text-lg [--wordmark-on:var(--pt-bg)] min-[420px]:inline-flex" />
            </Link>
            <span className="hidden items-center whitespace-nowrap rounded-full border border-pt-accent/40 bg-pt-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-pt-accent sm:inline-flex">
              Bản trải nghiệm
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link to="/login" className="inline-flex items-center whitespace-nowrap rounded-full border border-pt-accent/50 px-3.5 py-1.5 text-sm font-medium text-pt-accent transition-colors hover:border-pt-accent hover:bg-pt-accent/10">Đăng nhập</Link>
            <Link to="/individual/pricing" className="hidden text-sm text-pt-fg-2 hover:text-pt-fg sm:inline">Xem gói</Link>
          </div>
        </div>
      </header>

      <main id="trial-main" className="mx-auto w-full max-w-6xl px-5 pb-20 pt-6 md:px-8 md:pt-10">
        {/* One row: where you are in the five steps, and a way to start over. */}
        <div className="mb-8 flex items-center justify-between gap-3 sm:mb-10">
          <TrialStepper current={step} />
          {step !== 'target' && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex shrink-0 items-center gap-1.5 text-xs text-pt-fg-3 transition-colors hover:text-pt-fg"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" /> <span className="max-sm:sr-only">Bắt đầu lại</span>
            </button>
          )}
        </div>

        <h1 ref={mainHeading} tabIndex={-1} className="sr-only">Trải nghiệm lộ trình cá nhân</h1>

        {step === 'target' && (
          <TargetStep
            selected={positionCode}
            onSelect={handleSelectPosition}
            onContinue={handleContinueToDiagnostic}
            onSkipToLearn={handleSkipToPath}
          />
        )}

        {step === 'diagnostic' && position && (
          <DiagnosticStep
            answers={answers}
            onAnswersChange={setAnswers}
            onBack={() => setStep('target')}
            onDone={handleCompleteDiagnostic}
            onSkip={handleSkipToPath}
          />
        )}
      </main>
    </div>
  );
}

function TrialStepper({ current }: { current: TrialStep }) {
  const activeIndex = STEPS.findIndex((step) => step.key === current);
  return (
    <nav aria-label="Tiến trình trải nghiệm" className="min-w-0">
      <ol className="flex items-center gap-1.5 sm:gap-2">
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
            {/* Phones keep only the current label, so the five steps fit on one line. */}
            <span
              className={cn(
                'text-xs',
                index === activeIndex ? 'font-medium text-pt-fg' : 'hidden sm:inline',
                index < activeIndex ? 'text-pt-fg-2' : index > activeIndex ? 'text-pt-fg-3' : undefined,
              )}
            >
              {item.label}
            </span>
            {index < STEPS.length - 1 && (
              <span aria-hidden="true" className={cn('h-px w-3 sm:mx-1 sm:w-8', index < activeIndex ? 'bg-pt-accent/60' : 'bg-pt-line')} />
            )}
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

function TargetStep({
  selected,
  onSelect,
  onContinue,
  onSkipToLearn,
}: {
  selected: string | null;
  onSelect: (code: string) => void;
  onContinue: () => void;
  onSkipToLearn: () => void;
}) {
  const selectedPosition = TRIAL_POSITIONS.find((position) => position.code === selected);
  return (
    <section>
      <StepHeader
        eyebrow="Bước 1 · Miễn phí, không cần thẻ thanh toán"
        title="Trải nghiệm lộ trình cá nhân"
        lead="Chọn vị trí tham chiếu bạn muốn hướng tới. Bạn có thể làm khảo sát định hướng hoặc vào thẳng bài học thử để trải nghiệm sản phẩm."
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
                checked
                  ? 'border-pt-accent bg-pt-accent/10 ring-1 ring-pt-accent shadow-[0_10px_30px_-12px_rgba(121,224,194,0.35)]'
                  : 'border-pt-line bg-pt-card hover:border-pt-accent/40',
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
              {/* The position's profile across the 6 domains, in the same colours as the landing page. */}
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
      {/* On phones the actions stick to the bottom of the screen, so the choice and the next step stay together. */}
      <div className="sticky bottom-0 z-10 -mx-5 mt-6 flex items-center justify-end gap-3 border-t border-pt-line bg-pt-bg/90 px-5 py-3 backdrop-blur-md sm:static sm:mx-0 sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        {selectedPosition && (
          <button
            type="button"
            onClick={onSkipToLearn}
            className={cn(PT_BUTTON_SECONDARY, 'max-sm:flex-1 max-sm:px-3')}
          >
            Học thử ngay
          </button>
        )}
        <button
          type="button"
          disabled={!selectedPosition}
          onClick={onContinue}
          className={cn(GOLD_BUTTON, 'max-sm:flex-1 max-sm:px-3')}
        >
          {/* Phones show the short label; the position name stays for screen readers. */}
          {selectedPosition ? (
            <>
              Tiếp tục<span className="max-sm:sr-only"> với {selectedPosition.name}</span>
            </>
          ) : (
            'Chọn một vị trí'
          )}{' '}
          <ArrowRight className="size-4" />
        </button>
      </div>
    </section>
  );
}

function DiagnosticStep({
  answers,
  onAnswersChange,
  onBack,
  onDone,
  onSkip,
}: {
  answers: Record<string, number>;
  onAnswersChange: (answers: Record<string, number>) => void;
  onBack: () => void;
  onDone: () => void;
  onSkip: () => void;
}) {
  const firstIncomplete = Math.max(0, TRIAL_QUESTIONS.findIndex((question) => answers[question.id] === undefined));
  const [index, setIndex] = useState(firstIncomplete === -1 ? 0 : firstIncomplete);
  const question = TRIAL_QUESTIONS[index];
  const selected = answers[question.id];
  const isLast = index === TRIAL_QUESTIONS.length - 1;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <StepHeader
          eyebrow="Bước 2 · 6 miền năng lực"
          title="Khảo sát định hướng"
          lead="Sáu câu hỏi giúp tạo lộ trình xem trước. Kết quả này không thay thế bài đánh giá đầu vào đầy đủ trong gói trả phí và không xác nhận mức năng lực."
        />
        <button
          type="button"
          onClick={onSkip}
          className="inline-flex items-center text-xs text-pt-fg-3 hover:text-pt-accent transition-colors underline underline-offset-4"
        >
          Bỏ qua, vào bài học thử
        </button>
      </div>

      <Card className="mx-auto max-w-3xl p-6 md:p-9">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={cn(PT_EYEBROW, 'shrink-0')}>Câu {index + 1} / {TRIAL_QUESTIONS.length} · Miền {question.domainNumber}</p>
          <Tag className="gap-1.5 whitespace-normal">
            <i aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: PIP_GOLD }} />
            {question.domainName}
          </Tag>
        </div>
        {/* One segment per question, in the colour of its domain: answered ones full, the current one marked. */}
        <div
          role="progressbar"
          aria-label="Tiến độ khảo sát"
          aria-valuemin={0}
          aria-valuemax={TRIAL_QUESTIONS.length}
          aria-valuenow={index + 1}
          className="mt-4 grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${TRIAL_QUESTIONS.length}, minmax(0, 1fr))` }}
        >
          {TRIAL_QUESTIONS.map((item, itemIndex) => (
            <i
              key={item.id}
              className={cn('block h-1.5 rounded-full transition-opacity duration-300', itemIndex === index && 'ring-2 ring-[#E5A93C]/30')}
              style={{
                backgroundColor: PIP_GOLD,
                opacity: answers[item.id] !== undefined ? 0.9 : itemIndex === index ? 0.55 : 0.18,
              }}
            />
          ))}
        </div>
        <fieldset className="mt-8" aria-label={`Câu ${index + 1}: ${question.text}`}>
          <legend className="text-[21px] leading-snug">{question.text}</legend>
          <div className="mt-6 grid gap-2.5">
            {question.options.map((option, optionIndex) => (
              <label
                key={option}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm transition-all',
                  selected === optionIndex
                    ? 'border-pt-accent bg-pt-accent/10 ring-1 ring-pt-accent text-pt-fg'
                    : 'border-pt-line text-pt-fg-2 hover:border-pt-line-strong',
                )}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={selected === optionIndex}
                  onChange={() => onAnswersChange({ ...answers, [question.id]: optionIndex })}
                  className="mt-0.5 accent-[var(--ind-accent)]"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-pt-line pt-6">
          <button
            type="button"
            onClick={index === 0 ? onBack : () => setIndex(index - 1)}
            className={PT_BUTTON_SECONDARY}
          >
            <ArrowLeft className="size-4" /> {index === 0 ? 'Đổi mục tiêu' : 'Câu trước'}
          </button>
          <button
            type="button"
            disabled={selected === undefined}
            onClick={isLast ? onDone : () => setIndex(index + 1)}
            className={GOLD_BUTTON}
          >
            {isLast ? 'Xem lộ trình mẫu' : 'Câu tiếp'} <ArrowRight className="size-4" />
          </button>
        </div>
      </Card>
    </section>
  );
}

function PathStep({
  position,
  answers,
  diagnosticMode,
  onBack,
  onLearn,
}: {
  position: (typeof TRIAL_POSITIONS)[number];
  answers: Record<string, number>;
  diagnosticMode: 'completed' | 'skipped' | null;
  onBack: () => void;
  onLearn: () => void;
}) {
  const isSkipped = diagnosticMode === 'skipped';
  const path = trialPathFor(position, answers, diagnosticMode);
  const slice = TRIAL_SLICE_BY_POSITION[position.code];

  const title = isSkipped
    ? `Lộ trình nền tảng cho ${position.name}`
    : `Lộ trình xem trước cho ${position.name}`;

  const lead = isSkipped
    ? `Đây là lộ trình nền tảng chuẩn cho vị trí ${position.name}. Mở bài đánh giá đầy đủ trong gói trả phí để phân tích khoảng trống năng lực riêng của bạn.`
    : `Đây là kết quả định hướng, chưa phải mức năng lực được xác nhận. Bài đánh giá đầy đủ trong gói trả phí sẽ dựng lộ trình chính thức theo 24 năng lực.`;

  return (
    <section>
      <StepHeader
        eyebrow={isSkipped ? 'Lộ trình nền tảng · Bản trải nghiệm' : 'Lộ trình định hướng · 6 miền năng lực'}
        title={title}
        lead={lead}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {path.map((item, index) => (
          <Card
            key={item.domainNumber}
            className={cn(
              'flex flex-col gap-5 p-6',
              index === 0
                ? 'border-[#E5A93C]/55 bg-[#E5A93C]/5 shadow-[0_12px_32px_-14px_rgba(229,169,60,0.35)]'
                : 'border-pt-line bg-pt-card/70',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <Tag tone={index === 0 ? 'solid' : 'neutral'}>Ưu tiên {index + 1}</Tag>
              {index > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] text-pt-fg-3">
                  <Lock className="size-3.5 text-pt-fg-3" aria-label="Cần mở gói" /> Khóa
                </span>
              )}
            </div>
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs text-pt-fg-3">
                <i aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: PIP_GOLD }} />
                Miền {item.domainNumber}
              </p>
              <h3 className={cn('mt-2 text-[19px] font-medium leading-snug', index > 0 && 'text-pt-fg-2')}>{item.domainName}</h3>
            </div>
            <LevelPips level={item.currentLevel} required={item.requiredLevel} showLabel />
            <div className="mt-auto border-t border-pt-line/60 pt-3">
              {index === 0 ? (
                <p className={cn('text-xs font-medium', GOLD_TEXT)}>Bài thử: {slice.title}</p>
              ) : (
                <div className="grid gap-1">
                  <p className="text-xs text-pt-fg-2">{item.unlockBenefit}</p>
                  <p className="text-[11px] text-pt-fg-3">Cần mở gói để học đầy đủ</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <button type="button" onClick={onBack} className={PT_BUTTON_SECONDARY}>
          <ArrowLeft className="size-4" /> {isSkipped ? 'Đổi mục tiêu' : 'Xem lại khảo sát'}
        </button>
        <button type="button" onClick={onLearn} className={GOLD_BUTTON}>
          <Play className="size-4" /> Học bài miễn phí
        </button>
      </div>
    </section>
  );
}

function LessonStep({
  positionCode,
  positionName,
  onBack,
  onDone,
}: {
  positionCode: string;
  positionName: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const slice = TRIAL_SLICE_BY_POSITION[positionCode];
  const [scenarioAnswer, setScenarioAnswer] = useState<number>();
  const [scenarioReviewed, setScenarioReviewed] = useState(false);
  const [selfCheckAnswer, setSelfCheckAnswer] = useState<number>();
  const [selfCheckReviewed, setSelfCheckReviewed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyTakeaway = async (takeaway: TrialTakeaway) => {
    const textToCopy = `${takeaway.title}\n${takeaway.description}\n\n` + takeaway.items.map((it, i) => `${i + 1}. ${it}`).join('\n');
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section>
      <StepHeader
        eyebrow={`Bài học thử · Năng lực ${slice.competencyCode}`}
        title="Bài học thử"
        lead={`${slice.title}. Bạn được trải nghiệm một bài học ngắn hoàn chỉnh gồm kiến thức, tình huống áp dụng và tài liệu mang đi.`}
      />
      <LessonProgress scenarioDone={scenarioReviewed} />
      <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <div className="grid content-start gap-6">
          <Card className="overflow-hidden">
            <video
              src={TRIAL_VIDEO_SRC}
              controls
              preload="metadata"
              playsInline
              aria-label={`Video bài học thử: ${slice.title}`}
              className="aspect-video w-full bg-black object-contain"
            />
            <div className="grid gap-6 p-6 md:p-8">
              <div>
                <p className={PT_EYEBROW}>Mục tiêu học tập</p>
                <p className="mt-2 text-[17px] leading-relaxed font-medium">{slice.objective}</p>
              </div>
              <div className="grid gap-3 text-sm leading-relaxed text-pt-fg-2">
                {slice.lesson.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <details className="rounded-2xl border border-pt-line p-4">
                <summary className="cursor-pointer text-sm font-medium">Bản nội dung thay thế cho video</summary>
                <p className="mt-3 text-sm leading-relaxed text-pt-fg-2">{slice.lesson.join(' ')}</p>
              </details>
            </div>
          </Card>

          {/* Takeaway Artifact (Mục 5.5) */}
          {slice.takeaway && (
            <Card className="p-6 border-pt-line bg-pt-raised/40">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={PT_EYEBROW}>Tài liệu mang đi</p>
                  <h4 className="mt-1 text-[17px] font-medium leading-snug">{slice.takeaway.title}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyTakeaway(slice.takeaway)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-pt-line bg-pt-card px-3 py-1.5 text-xs text-pt-fg transition-colors hover:border-pt-fg/40"
                >
                  {copied ? <CheckCheck className="size-3.5 text-pt-ok" /> : <Copy className="size-3.5" />}
                  {copied ? 'Đã sao chép' : 'Sao chép checklist'}
                </button>
              </div>
              <p className="mt-2 text-xs text-pt-fg-2">{slice.takeaway.description}</p>
              <ul className="mt-4 grid gap-2">
                {slice.takeaway.items.map((item, idx) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs leading-relaxed text-pt-fg-2">
                    <span className="grid size-4 shrink-0 place-items-center rounded-full bg-pt-accent/15 text-[10px] font-medium text-pt-accent">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="grid content-start gap-5">
          <Card className="p-6">
            <h3 className="text-[19px] font-medium">Tình huống cho {positionName}</h3>
            <p className="mt-3 text-sm leading-relaxed text-pt-fg-2">{slice.scenario}</p>
            <fieldset className="mt-5">
              <legend className="sr-only">Chọn cách xử lý tình huống</legend>
              <div className="grid gap-2">
                {slice.scenarioOptions.map((option, index) => (
                  <label
                    key={option}
                    className={cn(
                      'flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition-all',
                      scenarioAnswer === index
                        ? 'border-pt-accent bg-pt-accent/10 ring-1 ring-pt-accent text-pt-fg'
                        : 'border-pt-line hover:border-pt-line-strong text-pt-fg-2',
                    )}
                  >
                    <input
                      type="radio"
                      name="trial-scenario"
                      checked={scenarioAnswer === index}
                      onChange={() => {
                        setScenarioAnswer(index);
                        setScenarioReviewed(false);
                      }}
                      className="mt-0.5 accent-[var(--ind-accent)]"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              type="button"
              disabled={scenarioAnswer === undefined}
              onClick={() => {
                setScenarioReviewed(true);
                trackTrialEvent('trial_scenario_completed', {
                  positionCode,
                  isCorrect: scenarioAnswer === slice.scenarioCorrectIndex,
                });
              }}
              className={cn(GOLD_BUTTON, 'mt-5 w-full')}
            >
              Xem phản hồi
            </button>
            {scenarioReviewed && (
              <p
                role="status"
                className={cn(
                  'mt-4 rounded-xl border p-4 text-sm leading-relaxed',
                  scenarioAnswer === slice.scenarioCorrectIndex
                    ? 'border-pt-ok/40 bg-pt-ok/10 text-pt-ok'
                    : 'border-pt-warn/40 bg-pt-warn/10 text-pt-fg-2',
                )}
              >
                {scenarioAnswer === slice.scenarioCorrectIndex ? 'Phù hợp. ' : 'Chưa phải lựa chọn tốt nhất. '}
                {slice.scenarioFeedback}
              </p>
            )}
          </Card>

          {scenarioReviewed && (
            <Card className="p-6">
              <p className={PT_EYEBROW}>Tự kiểm tra phần vừa học</p>
              <p className="mt-3 text-sm leading-relaxed font-medium">{slice.selfCheck}</p>
              <fieldset className="mt-4">
                <legend className="sr-only">Chọn đáp án tự kiểm tra</legend>
                <div className="grid gap-2">
                  {slice.selfCheckOptions.map((option, index) => (
                    <label
                      key={option}
                      className={cn(
                        'flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition-all',
                        selfCheckAnswer === index
                          ? 'border-pt-accent bg-pt-accent/10 ring-1 ring-pt-accent text-pt-fg'
                          : 'border-pt-line hover:border-pt-line-strong text-pt-fg-2',
                      )}
                    >
                      <input
                        type="radio"
                        name="trial-self-check"
                        checked={selfCheckAnswer === index}
                        onChange={() => {
                          setSelfCheckAnswer(index);
                          setSelfCheckReviewed(false);
                        }}
                        className="mt-0.5 accent-[var(--ind-accent)]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {selfCheckReviewed && (
                <p role="status" className="mt-4 rounded-xl border border-pt-warn/40 bg-pt-warn/10 p-3 text-sm text-pt-fg-2">
                  Chưa đúng. Hãy xem lại nguyên tắc trong bài rồi chọn lại.
                </p>
              )}
              <button
                type="button"
                disabled={selfCheckAnswer === undefined}
                onClick={() => (selfCheckAnswer === slice.selfCheckCorrectIndex ? onDone() : setSelfCheckReviewed(true))}
                className={cn(GOLD_BUTTON, 'mt-5 w-full')}
              >
                Hoàn thành bài thử
              </button>
            </Card>
          )}
        </div>
      </div>
      <button type="button" onClick={onBack} className={cn(PT_BUTTON_SECONDARY, 'mt-6')}>
        <ArrowLeft className="size-4" /> Về lộ trình
      </button>
    </section>
  );
}

/** Where the learner is in the trial lesson: read, try the scenario, check yourself. */
function LessonProgress({ scenarioDone }: { scenarioDone: boolean }) {
  const stages = [
    { label: 'Học nội dung', done: true },
    { label: 'Xử lý tình huống', done: scenarioDone },
    { label: 'Tự kiểm tra', done: false },
  ];
  const current = stages.findIndex((stage) => !stage.done);
  return (
    <ol aria-label="Các phần của bài học" className="mb-6 flex flex-wrap items-center gap-2">
      {stages.map((stage, index) => (
        <li
          key={stage.label}
          aria-current={index === current ? 'step' : undefined}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
            stage.done && 'border-pt-accent/40 bg-pt-accent/10 text-pt-accent',
            index === current && 'border-[#E5A93C] text-pt-fg',
            !stage.done && index !== current && 'border-pt-line text-pt-fg-3',
          )}
        >
          {stage.done ? <Check className="size-3.5" aria-hidden="true" /> : <span className="tabular-nums">{index + 1}</span>}
          {stage.label}
        </li>
      ))}
    </ol>
  );
}

function CompleteStep({
  positionCode,
  positionName,
  answers,
  diagnosticMode,
  onReviewLesson,
  onReset,
}: {
  positionCode: string;
  positionName: string;
  answers: Record<string, number>;
  diagnosticMode: 'completed' | 'skipped' | null;
  onReviewLesson: () => void;
  onReset: () => void;
}) {
  const slice = TRIAL_SLICE_BY_POSITION[positionCode];
  const registerPath = `/individual/register?trial=1&position=${positionCode}&source=try`;

  return (
    <section className="mx-auto max-w-3xl">
      <Card className="p-7 text-center md:p-12 border-pt-line bg-pt-card">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-pt-ok/15 text-pt-ok">
          <Check className="size-7" />
        </span>
        <p className={cn(PT_EYEBROW, 'mt-6')}>Hoàn thành · {positionName}</p>
        <h2 className="mt-4 text-[clamp(28px,4.4vw,46px)] font-normal leading-tight tracking-[-0.03em]">
          Bạn đã hoàn thành phần trải nghiệm
        </h2>

        <div className="mx-auto mt-6 grid max-w-[58ch] gap-4 text-left">
          <ul className="grid gap-2.5 rounded-2xl border border-pt-line bg-pt-raised/30 p-5 text-sm text-pt-fg-2">
            {[
              `Chọn mục tiêu: ${positionName}`,
              'Xem lộ trình định hướng theo 6 miền năng lực',
              `Hoàn thành bài học thử ${slice.competencyCode} · ${slice.title}`,
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-pt-ok/15 text-pt-ok">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-[#E5A93C]/40 bg-[#E5A93C]/5 p-5">
            <p className={GOLD_KICKER}>Bước tiếp theo</p>
            <p className="mt-2 text-sm leading-relaxed text-pt-fg-2">
              Tạo tài khoản để làm bài đánh giá đầu vào 18 câu, xác nhận mức năng lực và học trọn {INDIVIDUAL_TRIAL.courseLimit} khóa đầu
              trong lộ trình chính thức theo 24 năng lực số. Hết {INDIVIDUAL_TRIAL.days} ngày, hồ sơ và kết quả của bạn vẫn được giữ lại.
            </p>
          </div>
          <p className="text-center text-xs text-pt-fg-3">Phần thử không cập nhật hồ sơ năng lực và không cấp chứng nhận.</p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            to={registerPath}
            onClick={() => writeTryHandoff(buildTryHandoff(positionCode, answers, diagnosticMode))}
            className={cn(GOLD_BUTTON, 'w-full sm:w-auto')}
          >
            Lưu kết quả và học tiếp {INDIVIDUAL_TRIAL.days} ngày miễn phí <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <p className="text-xs text-pt-fg-3">Không cần thẻ · Không tự gia hạn · Hết hạn vẫn giữ kết quả</p>
          <div className="mt-2 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to={`/individual/pricing?source=trial&position=${positionCode}`}
              onClick={() => trackTrialEvent('trial_pricing_clicked', { positionCode })}
              className={PT_BUTTON_SECONDARY}
            >
              Xem bảng giá
            </Link>
            <button type="button" onClick={onReviewLesson} className={PT_BUTTON_SECONDARY}>
              Xem lại bài học
            </button>
            <button type="button" onClick={onReset} className={cn(PT_BUTTON_SECONDARY, 'text-pt-fg-3')}>
              Thử vị trí khác
            </button>
          </div>
        </div>
      </Card>
    </section>
  );
}
