import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useMarkSeen, usePersonalAccess, usePersonalOverview, usePersonalPath } from '@/hooks/use-personal-learning';
import { trackTrialEventOnce } from '@/features/experience/individual-trial/individual-trial-tracker';
import type { TrialChecklistKey } from '@/lib/personal-access';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';
import { cn } from '@/lib/utils';
import type { PersonalOverview, TrialChecklistItem } from '@/services/personal-learning.service';
import { Card, PT_BUTTON_GOLD, PT_BUTTON_SECONDARY } from './ui';
import { UpgradeLink } from './UpgradeLink';

interface StepCopy {
  title: string;
  description: string;
  action: string;
  /** Step that has to be done first: this one stays dimmed until then. */
  needs?: TrialChecklistKey;
}

const STEPS: Record<TrialChecklistKey, StepCopy> = {
  diagnostic: {
    title: 'Làm bài đánh giá đầu vào',
    description: '18 câu, khoảng 10 phút, đo mức của bạn ở 6 miền năng lực.',
    action: 'Bắt đầu',
  },
  path: {
    title: 'Xem lộ trình của bạn',
    description: 'Các khóa được xếp theo khoảng thiếu so với vị trí mục tiêu.',
    action: 'Xem lộ trình',
    needs: 'diagnostic',
  },
  'first-course': {
    title: 'Hoàn thành khóa đầu tiên',
    description: 'Học hết bài và qua bài đánh giá 4 câu.',
    action: 'Học tiếp',
    needs: 'diagnostic',
  },
  profile: {
    title: 'Xem mức năng lực tăng',
    description: 'Hồ sơ cập nhật ngay khi bạn qua bài.',
    action: 'Xem hồ sơ',
    needs: 'first-course',
  },
};

/** Where each step's button leads. The third one follows the course the learner is on, or the next one. */
function stepPath(key: TrialChecklistKey, overview: PersonalOverview | undefined): string {
  if (key === 'diagnostic') return '/personal/diagnostic';
  if (key === 'path') return '/personal/path';
  if (key === 'profile') return '/personal/progress';
  const lesson = overview?.continueLesson;
  if (lesson) return `/personal/classroom/${lesson.courseId}?lesson=${lesson.lessonId}`;
  return overview?.nextCourse ? `/personal/courses/${overview.nextCourse.id}` : '/personal/path';
}

type StepState = 'done' | 'next' | 'open' | 'locked';

function stateOf(items: TrialChecklistItem[], item: TrialChecklistItem, nextKey: TrialChecklistKey | undefined): StepState {
  if (item.done) return 'done';
  const needs = STEPS[item.key].needs;
  if (needs && !items.find((candidate) => candidate.key === needs)?.done) return 'locked';
  return item.key === nextKey ? 'next' : 'open';
}

/**
 * The first thing on the dashboard of a trial learner: four steps that end with the first level raised (spec §8.6).
 * It can be folded (the server remembers it) and gives way to the upgrade offer once the four are done.
 * Not a tour: nothing is laid over the page.
 */
export function TrialChecklist() {
  const { data: access } = usePersonalAccess();
  const { data: overview } = usePersonalOverview();
  const markSeen = useMarkSeen();
  const [reopened, setReopened] = useState(false);
  const tracked = useRef(false);

  const items = access?.mode === 'trial' ? access.checklist : [];
  const doneCount = items.filter((item) => item.done).length;
  const allDone = items.length > 0 && doneCount === items.length;
  const daysSinceStart = INDIVIDUAL_TRIAL.days - (access?.daysLeft ?? INDIVIDUAL_TRIAL.days);

  useEffect(() => {
    if (!allDone || tracked.current) return;
    tracked.current = true;
    trackTrialEventOnce('trial_checklist_completed', 'trial_checklist_completed', { daysSinceStart });
  }, [allDone, daysSinceStart]);

  if (!access || items.length === 0) return null;
  if (allDone) return <FinishedCard />;

  const folded = Boolean(access.seen['checklist-hidden']) && !reopened;
  if (folded) {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <p className="text-sm text-pt-fg-2">
          Bắt đầu trong {items.length} bước · <span className="tabular-nums">{doneCount}/{items.length}</span>
        </p>
        <button type="button" onClick={() => setReopened(true)} aria-expanded={false} className="inline-flex items-center gap-1.5 text-sm font-medium text-pt-fg underline underline-offset-4">
          Mở lại <ChevronDown className="size-4" aria-hidden="true" />
        </button>
      </Card>
    );
  }

  const nextKey = items.find((item) => !item.done && stateOf(items, item, undefined) !== 'locked')?.key;

  return (
    <Card as="section" aria-labelledby="trial-checklist-title" className="p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="trial-checklist-title" className="text-lg font-semibold">
          Bắt đầu trong {items.length} bước · <span className="tabular-nums">{doneCount}/{items.length}</span>
        </h2>
        <button
          type="button"
          onClick={() => {
            setReopened(false);
            markSeen.mutate('checklist-hidden');
          }}
          aria-expanded
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-pt-fg-2 transition-colors hover:text-pt-fg"
        >
          Thu gọn <ChevronUp className="size-4" aria-hidden="true" />
        </button>
      </div>
      <ol className="mt-4 grid gap-2.5">
        {items.map((item, index) => (
          <StepRow
            key={item.key}
            number={index + 1}
            item={item}
            state={stateOf(items, item, nextKey)}
            neededNumber={items.findIndex((candidate) => candidate.key === STEPS[item.key].needs) + 1}
            to={stepPath(item.key, overview)}
          />
        ))}
      </ol>
    </Card>
  );
}

interface StepRowProps {
  number: number;
  item: TrialChecklistItem;
  state: StepState;
  neededNumber: number;
  to: string;
}

function StepRow({ number, item, state, neededNumber, to }: StepRowProps) {
  const copy = STEPS[item.key];
  const locked = state === 'locked';

  return (
    <li
      data-state={state}
      className={cn(
        'flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center',
        state === 'next' ? 'border-[#E5A93C]/60 bg-pt-raised/40' : 'border-pt-line',
        locked && 'opacity-60',
      )}
    >
      <span
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-full border text-xs font-medium tabular-nums',
          state === 'done' ? 'border-pt-ok/50 bg-pt-ok/15 text-pt-ok' : 'border-pt-line text-pt-fg-2',
        )}
      >
        {state === 'done' ? <Check className="size-4" aria-hidden="true" /> : number}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-pt-fg">
          {copy.title}
          {state === 'done' && <span className="ml-2 text-xs font-normal text-pt-ok">Đã xong</span>}
        </p>
        <p className="mt-0.5 text-sm text-pt-fg-2">{copy.description}</p>
      </div>
      {state === 'done' ? null : locked ? (
        <button type="button" disabled className={cn(PT_BUTTON_SECONDARY, 'sm:w-auto')}>
          Làm việc {neededNumber} trước
        </button>
      ) : (
        <Link to={to} className={state === 'next' ? PT_BUTTON_GOLD : PT_BUTTON_SECONDARY}>
          {copy.action}
        </Link>
      )}
    </li>
  );
}

/** All four steps done: what is left in the path and the way to open it. */
function FinishedCard() {
  const { data: path } = usePersonalPath();
  const remaining = path ? path.stages.flatMap((stage) => stage.courses).filter((course) => !course.trialSlot).length : null;

  return (
    <Card as="section" aria-labelledby="trial-checklist-title" className="flex flex-col gap-4 border-[#E5A93C]/50 p-5 md:flex-row md:items-center md:justify-between md:p-6">
      <div>
        <h2 id="trial-checklist-title" className="text-lg font-semibold">Bạn đã đi hết vòng thử</h2>
        <p className="mt-1 max-w-[60ch] text-sm text-pt-fg-2">
          {remaining === null
            ? 'Nâng cấp để học tiếp các khóa còn lại trong lộ trình.'
            : `Nâng cấp để học tiếp ${remaining} khóa còn lại trong lộ trình.`}
        </p>
      </div>
      <UpgradeLink placement="checklist">Nâng cấp Plus</UpgradeLink>
    </Card>
  );
}
